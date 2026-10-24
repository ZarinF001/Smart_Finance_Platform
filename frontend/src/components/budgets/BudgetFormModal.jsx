import React, { useState, useEffect } from 'react';
import { PieChart, DollarSign, Calendar, Tag, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import budgetService from '../../services/budgetService.js';
import categoryService from '../../services/categoryService.js';
import { MONTH_NAMES } from '../../utils/currency.js';
import notify from '../../utils/notify.js';

const FALLBACK_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Education',
  'Shopping',
  'Healthcare',
  'Entertainment',
  'Bills & Utilities',
  'Other',
];

export const BudgetFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  currentMonth,
  currentYear,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData?._id);

  const [categories, setCategories] = useState(FALLBACK_EXPENSE_CATEGORIES);
  const [formData, setFormData] = useState({
    category: 'Food & Dining',
    limit: '',
    month: currentMonth || new Date().getMonth() + 1,
    year: currentYear || new Date().getFullYear(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load available EXPENSE categories
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const catList = await categoryService.getCategories('EXPENSE');
        if (isMounted && catList && catList.length > 0) {
          setCategories(catList.map((c) => c.name));
        }
      } catch (err) {
        // Fallback silently
      }
    };

    if (isOpen) {
      fetchCats();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Sync initialData when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || 'Food & Dining',
        limit: initialData.limit || '',
        month: initialData.month || currentMonth || new Date().getMonth() + 1,
        year: initialData.year || currentYear || new Date().getFullYear(),
      });
    } else {
      setFormData({
        category: 'Food & Dining',
        limit: '',
        month: currentMonth || new Date().getMonth() + 1,
        year: currentYear || new Date().getFullYear(),
      });
    }
    setErrors({});
  }, [initialData, currentMonth, currentYear, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const limitNum = parseFloat(formData.limit);
    if (!formData.limit || isNaN(limitNum) || limitNum <= 0) {
      newErrors.limit = 'Please enter a valid positive spending limit in BDT';
    }

    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'Please select an expense category';
    }

    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Valid month (1-12) is required';
    }

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'Valid year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        category: formData.category.trim(),
        limit: parseFloat(formData.limit),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      let result;
      if (isEditing) {
        result = await budgetService.updateBudget(initialData._id, payload);
        notify.success('Monthly budget updated successfully');
      } else {
        result = await budgetService.createBudget(payload);
        notify.success('Monthly budget created successfully');
      }

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errMsg =
        err.message || 'Failed to save budget. Please check your inputs.';
      notify.error(errMsg);

      if (err.errors) {
        setErrors((prev) => ({ ...prev, ...err.errors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Year choices (Current year - 1 to Current year + 3)
  const thisYear = new Date().getFullYear();
  const yearOptions = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
      subtitle={
        isEditing
          ? 'Update your spending ceiling for this category'
          : 'Define a monthly spending limit to prevent overspending'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label
            htmlFor="budget-category"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Expense Category <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="budget-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isEditing} // Category cannot be changed on edit to avoid confusion
              className={`w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                isEditing ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-500">{errors.category}</p>
          )}
        </div>

        {/* Limit */}
        <div>
          <label
            htmlFor="budget-limit"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Monthly Limit (BDT / ৳) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold pointer-events-none">
              ৳
            </span>
            <input
              id="budget-limit"
              type="number"
              name="limit"
              step="100"
              min="1"
              value={formData.limit}
              onChange={handleChange}
              placeholder="e.g. 15000"
              className={`w-full pl-8 pr-4 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                errors.limit ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.limit && (
            <p className="mt-1 text-xs text-rose-500">{errors.limit}</p>
          )}
        </div>

        {/* Month & Year Selection Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Month */}
          <div>
            <label
              htmlFor="budget-month"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Month <span className="text-rose-500">*</span>
            </label>
            <select
              id="budget-month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              disabled={isEditing}
              className={`w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                isEditing ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''
              }`}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="budget-year"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Year <span className="text-rose-500">*</span>
            </label>
            <select
              id="budget-year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              disabled={isEditing}
              className={`w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                isEditing ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''
              }`}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            iconLeft={PieChart}
          >
            {isEditing ? 'Save Budget' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetFormModal;
