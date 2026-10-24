import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Edit2,
  Trash2,
  History,
  ArrowDownLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import SavingsGoalFormModal from '../components/goals/SavingsGoalFormModal.jsx';
import AddContributionModal from '../components/goals/AddContributionModal.jsx';
import ContributionHistoryModal from '../components/goals/ContributionHistoryModal.jsx';
import savingsGoalService from '../services/savingsGoalService.js';
import { formatBDT, formatDate } from '../utils/currency.js';
import notify from '../utils/notify.js';

export const SavingsGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contribution modals
  const [contributingGoal, setContributingGoal] = useState(null);
  const [historyGoal, setHistoryGoal] = useState(null);

  // Fetch savings goals from backend
  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await savingsGoalService.getGoals({ limit: 50 });
      setGoals(res.items || []);
    } catch (err) {
      console.error('Error fetching savings goals:', err);
      setError(err.message || 'Unable to retrieve savings goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Summary Metrics calculations
  const totalTargetSum = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalSavedSum = goals.reduce((acc, g) => acc + (g.totalSaved || 0), 0);
  const completedGoalsCount = goals.filter((g) => g.status === 'COMPLETED').length;
  const overallProgress =
    totalTargetSum > 0 ? Math.min(100, Math.round((totalSavedSum / totalTargetSum) * 100)) : 0;

  // Filtered goals by tab
  const filteredGoals = goals.filter((g) => {
    if (statusFilter === 'ALL') return true;
    return g.status === statusFilter;
  });

  // Open Create Goal modal
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Goal modal
  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setIsFormModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingGoal) return;
    setIsDeleting(true);

    try {
      await savingsGoalService.deleteGoal(deletingGoal._id);
      notify.success(`Savings goal "${deletingGoal.name}" deleted`);
      setDeletingGoal(null);
      fetchGoals();
    } catch (err) {
      notify.error(err.message || 'Failed to delete savings goal');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          barClass: 'bg-emerald-500',
        };
      case 'EXPIRED':
        return {
          label: 'Overdue',
          icon: AlertCircle,
          className: 'bg-rose-50 text-rose-700 border-rose-200',
          barClass: 'bg-rose-500',
        };
      case 'IN_PROGRESS':
      default:
        return {
          label: 'In Progress',
          icon: Clock,
          className: 'bg-brand-50 text-brand-700 border-brand-200',
          barClass: 'bg-brand-600',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Savings Goals
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track targets, log contributions, and calculate monthly savings requirements.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            iconLeft={Plus}
            className="shadow-sm shadow-brand-600/20 text-xs sm:text-sm"
          >
            Create Goal
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Goals */}
        <Card className="bg-white border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Goals
          </p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-xl font-extrabold text-slate-900">
              {goals.length}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {completedGoalsCount} Done
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active financial milestones
          </p>
        </Card>

        {/* Total Target Sum */}
        <Card className="bg-white border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Combined Target
          </p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {formatBDT(totalTargetSum)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Total target accumulation
          </p>
        </Card>

        {/* Total Saved Sum */}
        <Card className="bg-white border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Saved
          </p>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
            {formatBDT(totalSavedSum)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Verified across all deposits
          </p>
        </Card>

        {/* Overall Completion */}
        <Card className="bg-white border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Completion
          </p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-xl font-extrabold text-brand-600">
              {overallProgress}%
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {formatBDT(Math.max(0, totalTargetSum - totalSavedSum))} to go
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
        {[
          { id: 'ALL', label: `All Goals (${goals.length})` },
          {
            id: 'IN_PROGRESS',
            label: `In Progress (${goals.filter((g) => g.status === 'IN_PROGRESS').length})`,
          },
          {
            id: 'COMPLETED',
            label: `Completed (${completedGoalsCount})`,
          },
          {
            id: 'EXPIRED',
            label: `Overdue (${goals.filter((g) => g.status === 'EXPIRED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchGoals}
            className="text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
          <p className="text-xs">Loading savings goals...</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={
            statusFilter === 'ALL'
              ? 'No savings goals created yet'
              : `No goals matching "${statusFilter}"`
          }
          description="Create savings targets (e.g. emergency fund, gadgets, vacation) and track your regular contributions."
          actionLabel={statusFilter === 'ALL' ? 'Create First Goal' : 'View All Goals'}
          actionIcon={statusFilter === 'ALL' ? Plus : undefined}
          onAction={statusFilter === 'ALL' ? handleOpenCreate : () => setStatusFilter('ALL')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const statusConfig = getStatusBadge(goal.status);
            const StatusIcon = statusConfig.icon;
            const isDone = goal.status === 'COMPLETED';
            const isOverdue = goal.status === 'EXPIRED';

            return (
              <Card
                key={goal._id}
                className="hover:border-slate-300 transition-all shadow-subtle hover:shadow-card-hover flex flex-col justify-between"
                bodyClassName="p-5 space-y-4"
              >
                <div>
                  {/* Card Header: Goal Name & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                        {goal.name}
                      </h3>
                      {goal.description ? (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {goal.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          No description
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusConfig.className}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Progress Bar & Percent */}
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Progress</span>
                      <span className="font-extrabold text-slate-800">
                        {goal.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${statusConfig.barClass}`}
                        style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div className="p-3 bg-slate-50/80 rounded-xl space-y-2 mt-4 text-xs border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Target Amount:</span>
                      <span className="font-bold text-slate-800">
                        {formatBDT(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Saved to Date:</span>
                      <span className="font-bold text-emerald-600">
                        {formatBDT(goal.totalSaved || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Remaining:</span>
                      <span className="font-bold text-slate-700">
                        {formatBDT(goal.remainingAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Deadline & Monthly Requirement Info */}
                  <div className="space-y-1.5 pt-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Deadline:
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatDate(goal.deadline)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time Remaining:</span>
                      <span
                        className={`font-semibold ${
                          isDone
                            ? 'text-emerald-600'
                            : isOverdue
                            ? 'text-rose-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {isDone
                          ? 'Goal Completed! 🎉'
                          : isOverdue
                          ? 'Overdue'
                          : `${goal.daysRemaining} days left (${goal.monthsRemaining} mo)`}
                      </span>
                    </div>

                    {!isDone && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500">Monthly Target:</span>
                        <span className="font-bold text-brand-600">
                          {formatBDT(goal.requiredMonthlySavings)} / mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setContributingGoal(goal)}
                      iconLeft={ArrowDownLeft}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Add Deposit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryGoal(goal)}
                      iconLeft={History}
                      className="h-8 text-xs text-slate-700"
                    >
                      History ({goal.contributionCount || 0})
                    </Button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingGoal(goal)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <SavingsGoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal}
        onSuccess={() => {
          fetchGoals();
        }}
      />

      {/* Add Deposit Modal */}
      <AddContributionModal
        isOpen={Boolean(contributingGoal)}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
        onSuccess={() => {
          fetchGoals();
        }}
      />

      {/* Contribution History Modal */}
      <ContributionHistoryModal
        isOpen={Boolean(historyGoal)}
        onClose={() => setHistoryGoal(null)}
        goal={historyGoal}
      />

      {/* Delete Goal Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Delete Savings Goal?"
        message={`Are you sure you want to delete "${deletingGoal?.name}" and all of its recorded contribution deposits? This action cannot be undone.`}
        confirmText="Yes, Delete Goal"
        variant="danger"
      />
    </div>
  );
};

export default SavingsGoalsPage;
