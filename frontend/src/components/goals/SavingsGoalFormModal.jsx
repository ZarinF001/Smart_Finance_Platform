import React, { useState, useEffect } from 'react';
import { Target, DollarSign, Calendar, FileText } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import savingsGoalService from '../../services/savingsGoalService.js';
import { toInputDateFormat } from '../../utils/currency.js';
import notify from '../../utils/notify.js';

export const SavingsGoalFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData?._id);

  // Default deadline 6 months in future for new goals
  const defaultDeadline = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return toInputDateFormat(d);
  };

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: defaultDeadline(),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        targetAmount: initialData.targetAmount || '',
        deadline: toInputDateFormat(initialData.deadline || new Date()),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        deadline: defaultDeadline(),
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

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Goal name cannot exceed 100 characters';
    }

    const amountNum = parseFloat(formData.targetAmount);
    if (!formData.targetAmount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.targetAmount = 'Please enter a valid positive target amount in BDT';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Target deadline date is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
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
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        deadline: formData.deadline,
        description: formData.description.trim(),
      };

      let result;
      if (isEditing) {
        result = await savingsGoalService.updateGoal(initialData._id, payload);
        notify.success('Savings goal updated successfully');
      } else {
        result = await savingsGoalService.createGoal(payload);
        notify.success('Savings goal created successfully');
      }

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errMsg =
        err.message || 'Failed to save savings goal. Please check your inputs.';
      notify.error(errMsg);

      if (err.errors) {
        setErrors((prev) => ({ ...prev, ...err.errors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      subtitle={
        isEditing
          ? 'Update target amount or target deadline date'
          : 'Establish a new financial milestone and track your savings progress'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label
            htmlFor="goal-name"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Goal Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="goal-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Emergency Fund, Laptop Upgrade, Vacation"
            maxLength={100}
            className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
          )}
        </div>

        {/* Target Amount & Deadline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Amount */}
          <div>
            <label
              htmlFor="goal-target"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Target Amount (BDT / ৳) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold pointer-events-none">
                ৳
              </span>
              <input
                id="goal-target"
                type="number"
                name="targetAmount"
                step="100"
                min="1"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="e.g. 50000"
                className={`w-full pl-8 pr-3 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${errors.targetAmount ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.targetAmount && (
              <p className="mt-1 text-xs text-rose-500">{errors.targetAmount}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="goal-deadline"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Target Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              id="goal-deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${errors.deadline ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
            />
            {errors.deadline && (
              <p className="mt-1 text-xs text-rose-500">{errors.deadline}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="goal-description"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Description / Motivation (Optional)
          </label>
          <textarea
            id="goal-description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Setting aside 5,000 BDT monthly to replace my work computer."
            maxLength={500}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-0.5">
            <span>Keep your goal descriptive and focused</span>
            <span>{formData.description.length}/500</span>
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
            iconLeft={Target}
          >
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SavingsGoalFormModal;
