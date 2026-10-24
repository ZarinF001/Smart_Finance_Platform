import Category from '../models/category.model.js';
import {
  TRANSACTION_TYPES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  HTTP_STATUS,
} from '../constants/index.js';

class CategoryService {
  /**
   * Slugify helper for category names
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  /**
   * Seed default income and expense categories if they do not exist
   */
  async seedDefaultCategories() {
    try {
      const existingCount = await Category.countDocuments({ isDefault: true });
      if (existingCount > 0) {
        return; // Already seeded
      }

      const categoriesToSeed = [
        ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
          name,
          slug: this.slugify(name),
          type: TRANSACTION_TYPES.INCOME,
          isDefault: true,
          user: null,
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
          name,
          slug: this.slugify(name),
          type: TRANSACTION_TYPES.EXPENSE,
          isDefault: true,
          user: null,
        })),
      ];

      await Category.insertMany(categoriesToSeed, { ordered: false });
      console.log(`✅ [Category] Seeded ${categoriesToSeed.length} default categories`);
    } catch (error) {
      // Ignore duplicate key errors during concurrent startup seeding
      if (error.code !== 11000) {
        console.warn('⚠️ [Category] Notice during category seeding:', error.message);
      }
    }
  }

  /**
   * Get list of categories, optionally filtered by type
   */
  async getCategories({ type } = {}) {
    // Ensure default categories are seeded
    await this.seedDefaultCategories();

    const query = {};
    if (type) {
      query.type = type.toUpperCase();
    }

    return Category.find(query).sort({ type: 1, name: 1 });
  }

  /**
   * Validate that a category exists and matches the transaction type
   * Throws 400 error if category is invalid or belongs to the opposite transaction type
   * @param {string} categoryName
   * @param {'INCOME' | 'EXPENSE'} expectedType
   * @returns {Promise<string>} Normalized category name
   */
  async validateCategory(categoryName, expectedType) {
    if (!categoryName || typeof categoryName !== 'string') {
      const error = new Error('Category is required');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const trimmed = categoryName.trim();
    const slug = this.slugify(trimmed);
    const normalizedType = expectedType.toUpperCase();

    // 1. Search in database
    let dbCategory = await Category.findOne({
      $or: [
        { name: new RegExp(`^${trimmed}$`, 'i') },
        { slug: slug },
      ],
    });

    // 2. Check if category exists but belongs to the wrong type
    if (dbCategory) {
      if (dbCategory.type !== normalizedType) {
        const error = new Error(
          `Category '${dbCategory.name}' is an ${dbCategory.type.toLowerCase()} category and cannot be used for ${normalizedType.toLowerCase()}s.`
        );
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }
      return dbCategory.name;
    }

    // 3. Fallback check against static defaults (in case DB seed is pending)
    const isIncomeDefault = DEFAULT_INCOME_CATEGORIES.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase() || this.slugify(c) === slug
    );
    const isExpenseDefault = DEFAULT_EXPENSE_CATEGORIES.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase() || this.slugify(c) === slug
    );

    if (normalizedType === TRANSACTION_TYPES.EXPENSE && isIncomeDefault) {
      const error = new Error(
        `Category '${trimmed}' is an income category and cannot be used for expenses.`
      );
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    if (normalizedType === TRANSACTION_TYPES.INCOME && isExpenseDefault) {
      const error = new Error(
        `Category '${trimmed}' is an expense category and cannot be used for income.`
      );
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    if (normalizedType === TRANSACTION_TYPES.INCOME && isIncomeDefault) {
      const matched = DEFAULT_INCOME_CATEGORIES.find(
        (c) => c.toLowerCase() === trimmed.toLowerCase() || this.slugify(c) === slug
      );
      return matched || trimmed;
    }

    if (normalizedType === TRANSACTION_TYPES.EXPENSE && isExpenseDefault) {
      const matched = DEFAULT_EXPENSE_CATEGORIES.find(
        (c) => c.toLowerCase() === trimmed.toLowerCase() || this.slugify(c) === slug
      );
      return matched || trimmed;
    }

    // If completely unknown category
    const error = new Error(
      `Category '${trimmed}' is not a valid ${normalizedType.toLowerCase()} category.`
    );
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }
}

export const categoryService = new CategoryService();
export default categoryService;
