import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import expenseService from '../../services/expenseService.js';
import categoryService from '../../services/categoryService.js';
import { toInputDateFormat } from '../../utils/currency.js';
import notify from '../../utils/notify.js';

const FALLBACK_CATEGORIES = [
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

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_payment', label: 'Mobile Banking (bKash/Nagad)' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export const ExpenseFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData?._id);

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food & Dining',
    paymentMethod: 'cash',
    date: toInputDateFormat(new Date()),
    description: '',
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
        // Fallback to defaults gracefully
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
        amount: initialData.amount || '',
        category: initialData.category || 'Food & Dining',
        paymentMethod: initialData.paymentMethod || 'cash',
        date: toInputDateFormat(initialData.date || new Date()),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        amount: '',
        category: 'Food & Dining',
        paymentMethod: 'cash',
        date: toInputDateFormat(new Date()),
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const amountNum = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Please enter a valid positive amount in BDT';
    }

    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'Please select an expense category';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please choose a payment method';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.description && formData.description.length > 250) {
      newErrors.description = 'Description cannot exceed 250 characters';
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
        amount: parseFloat(formData.amount),
        category: formData.category.trim(),
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        description: formData.description.trim(),
      };

      let result;
      if (isEditing) {
        result = await expenseService.updateExpense(initialData._id, payload);
        notify.success('Expense record updated successfully');
      } else {
        result = await expenseService.createExpense(payload);
        notify.success('Expense record added successfully');
      }

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errMsg =
        err.message || 'Failed to save expense record. Please check the inputs.';
      notify.error(errMsg);

      if (err.errors) {
        const fieldErrors = {};
        Object.entries(err.errors).forEach(([field, msg]) => {
          fieldErrors[field] = msg;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Expense Record' : 'Record New Expense'}
      subtitle={
        isEditing
          ? 'Update the expenditure details for this entry'
          : 'Log an expenditure, bill payment, or purchase'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label
            htmlFor="expense-amount"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Amount (BDT / ৳) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-rose-600 font-bold pointer-events-none">
              ৳
            </span>
            <input
              id="expense-amount"
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 1250"
              className={`w-full pl-8 pr-3 py-2 text-xs bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                errors.amount ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>
          )}
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Category */}
          <div>
            <label
              htmlFor="expense-category"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Expense Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="expense-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
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

          {/* Payment Method */}
          <div>
            <label
              htmlFor="expense-payment-method"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="expense-payment-method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.paymentMethod && (
              <p className="mt-1 text-xs text-rose-500">{errors.paymentMethod}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="expense-date"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Transaction Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="expense-date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="expense-description"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Description / Memo (Optional)
          </label>
          <textarea
            id="expense-description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Grocery shopping at Shwapno Superstore"
            maxLength={250}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-0.5">
            <span>Add merchant details or items purchased</span>
            <span>{formData.description.length}/250</span>
          </div>
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
          )}
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
            className="bg-brand-600 hover:bg-brand-700 focus:ring-brand-500 text-white shadow-sm"
            iconLeft={ArrowUpRight}
          >
            {isEditing ? 'Save Changes' : 'Record Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
