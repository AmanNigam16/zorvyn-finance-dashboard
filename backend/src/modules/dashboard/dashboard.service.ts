import { PipelineStage } from "mongoose";
import { AppError } from "../../utils/app-error";
import { FinancialRecord, FinancialRecordType } from "../finance/finance.model";

interface SummaryAggregationResult {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

interface CategoryAggregationResult {
  category: string;
  type: FinancialRecordType;
  total: number;
}

interface TrendAggregationResult {
  month: string;
  income: number;
  expense: number;
}

interface RecentTransactionResult {
  _id: unknown;
  amount: number;
  type: FinancialRecordType;
  category: string;
  date: Date;
  note: string;
  createdBy: unknown;
  createdAt: Date;
}

interface DashboardFilters {
  startDate?: string;
  endDate?: string;
}

export class DashboardService {
  private parseDate(value: string | undefined, fieldName: string): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError(`Invalid ${fieldName}.`, 400);
    }

    return parsedDate;
  }

  private buildMatchStage(filters: DashboardFilters): PipelineStage.Match["$match"] {
    const match: PipelineStage.Match["$match"] = {
      isDeleted: false
    };
    const startDate = this.parseDate(filters.startDate, "startDate");
    const endDate = this.parseDate(filters.endDate, "endDate");

    if (startDate || endDate) {
      match.date = {};

      if (startDate) {
        match.date.$gte = startDate;
      }

      if (endDate) {
        match.date.$lte = endDate;
      }
    }

    return match;
  }

  public async getSummary(filters: DashboardFilters) {
    const match = this.buildMatchStage(filters);
    const [summary] = await FinancialRecord.aggregate<SummaryAggregationResult>([
      {
        $match: match
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", FinancialRecordType.INCOME] }, "$amount", 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", FinancialRecordType.EXPENSE] }, "$amount", 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          netBalance: {
            $subtract: ["$totalIncome", "$totalExpense"]
          }
        }
      }
    ]);

    return {
      message: "Dashboard summary retrieved successfully.",
      summary: summary || {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0
      }
    };
  }

  public async getCategories(filters: DashboardFilters) {
    const match = this.buildMatchStage(filters);
    const categories = await FinancialRecord.aggregate<CategoryAggregationResult>([
      {
        $match: match
      },
      {
        $group: {
          _id: {
            category: "$category",
            type: "$type"
          },
          total: {
            $sum: "$amount"
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type",
          total: 1
        }
      },
      {
        $sort: {
          total: -1,
          category: 1
        }
      }
    ]);

    return {
      message: "Category breakdown retrieved successfully.",
      categories: categories || []
    };
  }

  public async getTrends(filters: DashboardFilters) {
    const match = this.buildMatchStage(filters);
    const trends = await FinancialRecord.aggregate<TrendAggregationResult>([
      {
        $match: match
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", FinancialRecordType.INCOME] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", FinancialRecordType.EXPENSE] }, "$amount", 0]
            }
          }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: 1
                }
              }
            }
          },
          income: 1,
          expense: 1
        }
      }
    ]);

    return {
      message: "Dashboard trends retrieved successfully.",
      trends: trends || []
    };
  }

  public async getRecentTransactions(filters: DashboardFilters) {
    const match = this.buildMatchStage(filters);
    const limit = 5;
    const recentTransactions = await FinancialRecord.aggregate<RecentTransactionResult>([
      {
        $match: match
      },
      {
        $sort: {
          date: -1,
          createdAt: -1
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          amount: 1,
          type: 1,
          category: 1,
          date: 1,
          note: 1,
          createdBy: 1,
          createdAt: 1
        }
      }
    ]);

    return {
      message: "Recent transactions retrieved successfully.",
      recentTransactions: recentTransactions || []
    };
  }
}

export const dashboardService = new DashboardService();
