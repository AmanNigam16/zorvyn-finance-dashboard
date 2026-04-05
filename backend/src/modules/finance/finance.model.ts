import { Schema, Types, model } from "mongoose";

export enum FinancialRecordType {
  INCOME = "income",
  EXPENSE = "expense"
}

export interface IFinancialRecord {
  amount: number;
  type: FinancialRecordType;
  category: string;
  date: Date;
  note?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const financialRecordSchema = new Schema<IFinancialRecord>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: Object.values(FinancialRecordType),
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      default: ""
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

financialRecordSchema.index({ type: 1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ createdBy: 1 });

export const FinancialRecord = model<IFinancialRecord>("FinancialRecord", financialRecordSchema);
