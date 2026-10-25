import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import savingsGoalService from '../../services/savingsGoalService.js';
import { formatBDT, toInputDateFormat } from '../../utils/currency.js';
import notify from '../../utils/notify.js';

export const AddContributionModal = ({
  isOpen,
  onClose,
  goal,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: toInputDateFormat(new Date()),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      amount: '',
      date: toInputDateFormat(new Date()),
      description: '',
    });
    setErrors({});
  }, [goal, isOpen]);

  if (!goal) return null;

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
      newErrors.amount = 'Please enter a valid positive deposit amount in BDT';
    }

    if (!formData.date) {
      newErrors.date = 'Contribution date is required';
    }

    if (formData.description && formData.description.length > 250) {
      newErrors.description = 'Memo cannot exceed 250 characters';
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
        date: formData.date,
        description: formData.description.trim(),
      };

      const result = await savingsGoalService.addContribution(goal._id, payload);
      notify.success(
        `Added ${formatBDT(payload.amount)} towards "${goal.name}"`
      );

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errMsg =
        err.message || 'Failed to record contribution. Please try again.';
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
      title="Add Savings Deposit"
      subtitle={`Deposit funds towards "${goal.name}"`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Progress Summary Mini-Card */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Goal Target:</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {formatBDT(goal.targetAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Currently Saved:</span>
            <span className="font-semibold text-emerald-600 tabular-nums">
              {formatBDT(goal.totalSaved || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Remaining Needed:</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatBDT(goal.remainingAmount || 0)}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="contrib-amount"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Deposit Amount (BDT / ৳) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 font-bold pointer-events-none">
              ৳
            </span>
            <input
              id="contrib-amount"
              type="number"
              name="amount"
              step="50"
              min="1"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className={`w-full pl-8 pr-3 py-2 text-xs bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                errors.amount ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="contrib-date"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Deposit Date <span className="text-rose-500">*</span>
          </label>
          <input
            id="contrib-date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-2.5 py-2 text-xs bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
              errors.date ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
          )}
        </div>

        {/* Memo / Description */}
        <div>
          <label
            htmlFor="contrib-description"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Deposit Note / Memo (Optional)
          </label>
          <input
            id="contrib-description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Monthly transfer from main savings"
            maxLength={250}
            className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
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
            iconLeft={CheckCircle2}
          >
            Record Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContributionModal;
