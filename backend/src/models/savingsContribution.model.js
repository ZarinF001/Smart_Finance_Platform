import mongoose from 'mongoose';

const savingsContributionSchema = new mongoose.Schema(
  {
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: [true, 'Savings goal reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: [0.01, 'Contribution amount must be greater than zero'],
    },
    date: {
      type: Date,
      required: [true, 'Contribution date is required'],
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, 'Description cannot exceed 250 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

savingsContributionSchema.index({ goal: 1, date: -1 });
savingsContributionSchema.index({ user: 1, goal: 1 });

export const SavingsContribution = mongoose.model(
  'SavingsContribution',
  savingsContributionSchema
);
export default SavingsContribution;
