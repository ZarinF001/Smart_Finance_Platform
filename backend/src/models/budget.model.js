import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    limit: {
      type: Number,
      required: [true, 'Monthly spending limit is required'],
      min: [0.01, 'Spending limit must be greater than zero'],
    },
    month: {
      type: Number,
      required: [true, 'Budget month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      required: [true, 'Budget year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year must be 2100 or earlier'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: Prevents duplicate budgets for same user, category, month, and year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });
budgetSchema.index({ user: 1, month: 1, year: 1 });

export const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
