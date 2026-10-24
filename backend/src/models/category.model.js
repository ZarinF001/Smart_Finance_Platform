import mongoose from 'mongoose';
import { TRANSACTION_TYPES } from '../constants/index.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: [TRANSACTION_TYPES.INCOME, TRANSACTION_TYPES.EXPENSE],
        message: '{VALUE} is not a valid transaction category type',
      },
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system-wide default categories
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on slug, type, and user for quick lookups and uniqueness
categorySchema.index({ slug: 1, type: 1, user: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);
export default Category;
