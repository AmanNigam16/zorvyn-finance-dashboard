import { FilterQuery, Types } from "mongoose";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/logger";
import { FinancialRecord, FinancialRecordType, IFinancialRecord } from "./finance.model";

interface CreateFinancialRecordPayload {
  amount?: number;
  type?: FinancialRecordType;
  category?: string;
  date?: string | Date;
  note?: string;
}

interface UpdateFinancialRecordPayload {
  amount?: number;
  type?: FinancialRecordType;
  category?: string;
  date?: string | Date;
  note?: string;
  createdBy?: unknown;
}

interface FinancialRecordFilters {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

export class FinanceService {
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private ensureValidObjectId(id: string, fieldName: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(`Invalid ${fieldName}.`, 400);
    }
  }

  private parseDate(value: string | Date | undefined, fieldName: string): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError(`Invalid ${fieldName}.`, 400);
    }

    return parsedDate;
  }

  private validateType(type: FinancialRecordType | string | undefined): FinancialRecordType | undefined {
    if (!type) {
      return undefined;
    }

    if (!Object.values(FinancialRecordType).includes(type as FinancialRecordType)) {
      throw new AppError("Invalid financial record type.", 400);
    }

    return type as FinancialRecordType;
  }

  private buildFilters(filters: FinancialRecordFilters): FilterQuery<IFinancialRecord> {
    const query: FilterQuery<IFinancialRecord> = {
      isDeleted: false
    };

    const validatedType = this.validateType(filters.type);
    const category = filters.category?.trim();
    const startDate = this.parseDate(filters.startDate, "startDate");
    const endDate = this.parseDate(filters.endDate, "endDate");

    if (validatedType) {
      query.type = validatedType;
    }

    if (category) {
      query.category = {
        $regex: `^${this.escapeRegex(category)}$`,
        $options: "i"
      };
    }

    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = startDate;
      }

      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    return query;
  }

  public async createRecord(payload: CreateFinancialRecordPayload, createdBy: string) {
    this.ensureValidObjectId(createdBy, "createdBy");

    const amount = payload.amount;
    const type = this.validateType(payload.type);
    const category = payload.category?.trim();
    const date = this.parseDate(payload.date, "date");
    const note = payload.note?.trim();

    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
      throw new AppError("Amount must be a valid non-negative number.", 400);
    }

    if (!type) {
      throw new AppError("Financial record type is required.", 400);
    }

    if (!category) {
      throw new AppError("Category is required.", 400);
    }

    const recordPayload: {
      amount: number;
      type: FinancialRecordType;
      category: string;
      note: string;
      createdBy: Types.ObjectId;
      date?: Date;
    } = {
      amount,
      type,
      category,
      note: note || "",
      createdBy: new Types.ObjectId(createdBy)
    };

    if (date) {
      recordPayload.date = date;
    }

    const record = await FinancialRecord.create(recordPayload);

    logger.info("Financial record created successfully.", {
      recordId: record._id.toString(),
      createdBy
    });

    return {
      message: "Financial record created successfully.",
      record
    };
  }

  public async listRecords(filters: FinancialRecordFilters) {
    const query = this.buildFilters(filters);
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      FinancialRecord.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      FinancialRecord.countDocuments(query)
    ]);

    return {
      message: "Financial records retrieved successfully.",
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  public async getRecordById(id: string) {
    this.ensureValidObjectId(id, "record id");

    const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });

    if (!record) {
      throw new AppError("Financial record not found.", 404);
    }

    return {
      message: "Financial record retrieved successfully.",
      record
    };
  }

  public async updateRecord(id: string, payload: UpdateFinancialRecordPayload) {
    this.ensureValidObjectId(id, "record id");

    if (payload.createdBy !== undefined) {
      throw new AppError("createdBy cannot be updated.", 400);
    }

    const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });

    if (!record) {
      throw new AppError("Financial record not found.", 404);
    }

    const updates: Partial<IFinancialRecord> = {};

    if (payload.amount !== undefined) {
      if (typeof payload.amount !== "number" || Number.isNaN(payload.amount) || payload.amount < 0) {
        throw new AppError("Amount must be a valid non-negative number.", 400);
      }

      updates.amount = payload.amount;
    }

    if (payload.type !== undefined) {
      updates.type = this.validateType(payload.type);
    }

    if (payload.category !== undefined) {
      const category = payload.category.trim();

      if (!category) {
        throw new AppError("Category cannot be empty.", 400);
      }

      updates.category = category;
    }

    if (payload.date !== undefined) {
      updates.date = this.parseDate(payload.date, "date");
    }

    if (payload.note !== undefined) {
      updates.note = payload.note.trim() || "";
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError("No valid fields provided for update.", 400);
    }

    Object.assign(record, updates);
    await record.save();

    logger.info("Financial record updated successfully.", {
      recordId: record._id.toString()
    });

    return {
      message: "Financial record updated successfully.",
      record
    };
  }

  public async deleteRecord(id: string) {
    this.ensureValidObjectId(id, "record id");

    const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });

    if (!record) {
      throw new AppError("Financial record not found.", 404);
    }

    record.isDeleted = true;
    await record.save();

    logger.info("Financial record soft-deleted successfully.", {
      recordId: record._id.toString()
    });

    return {
      message: "Financial record deleted successfully.",
      record
    };
  }
}

export const financeService = new FinanceService();
