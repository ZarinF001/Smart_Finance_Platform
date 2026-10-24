import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import incomeService from '../../services/incomeService.js';
import categoryService from '../../services/categoryService.js';
import { toInputDateFormat } from '../../utils/currency.js';
import notify from '../../utils/notify.js';

const FALLBACK_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investment',
  'Gifts',
  'Other',
];

export const IncomeFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData?._id);

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    date: toInputDateFormat(new Date()),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load available INCOME categories
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const catList = await categoryService.getCategories('INCOME');
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
        category: initialData.category || 'Salary',
        date: toInputDateFormat(initialData.date || new Date()),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        amount: '',
        category: 'Salary',
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
      newErrors.category = 'Please select a source / category';
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
        date: formData.date,
        description: formData.description.trim(),
      };

      let result;
      if (isEditing) {
        result = await incomeService.updateIncome(initialData._id, payload);
        notify.success('Income record updated successfully');
      } else {
        result = await incomeService.createIncome(payload);
        notify.success('Income record added successfully');
      }

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errMsg =
        err.message || 'Failed to save income record. Please check the inputs.';
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
      title={isEditing ? 'Edit Income Record' : 'Record New Income'}
      subtitle={
        isEditing
          ? 'Update the details for this income entry'
          : 'Log a new income stream or earnings into your account'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label
            htmlFor="income-amount"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Amount (BDT / ৳) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 font-bold pointer-events-none">
              ৳
            </span>
            <input
              id="income-amount"
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 50000"
              className={`w-full pl-8 pr-4 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                errors.amount ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>
          )}
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label
              htmlFor="income-category"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Source / Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="income-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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

          {/* Date */}
          <div>
            <label
              htmlFor="income-date"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="income-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="income-description"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Description / Reference (Optional)
          </label>
          <textarea
            id="income-description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Monthly salary from Tech Solutions Ltd"
            maxLength={250}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-0.5">
            <span>Provide context or note invoice numbers</span>
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
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white"
            iconLeft={ArrowDownLeft}
          >
            {isEditing ? 'Save Changes' : 'Record Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IncomeFormModal;
