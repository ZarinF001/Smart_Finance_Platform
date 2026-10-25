import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import BudgetFormModal from '../components/budgets/BudgetFormModal.jsx';
import budgetService from '../services/budgetService.js';
import { formatBDT, MONTH_NAMES, getMonthName } from '../utils/currency.js';
import notify from '../utils/notify.js';

export const BudgetsPage = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Data states
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalBudgets: 0,
    totalBudgetLimit: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallUtilization: 0,
    normalCount: 0,
    warningCount: 0,
    exceededCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch budgets and summary for selected month & year
  const fetchBudgetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [listRes, summaryRes] = await Promise.all([
        budgetService.getBudgets({ month: selectedMonth, year: selectedYear, limit: 50 }),
        budgetService.getBudgetSummary({ month: selectedMonth, year: selectedYear }),
      ]);

      setBudgets(listRes.items || []);
      setSummary(summaryRes);
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError(err.message || 'Unable to retrieve monthly budgets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  // Navigate months (Prev / Next)
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setIsFormModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingBudget) return;
    setIsDeleting(true);

    try {
      await budgetService.deleteBudget(deletingBudget._id);
      notify.success(`Budget for "${deletingBudget.category}" deleted`);
      setDeletingBudget(null);
      fetchBudgetData();
    } catch (err) {
      notify.error(err.message || 'Failed to delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status, utilization) => {
    switch (status) {
      case 'EXCEEDED':
        return {
          label: 'Exceeded',
          icon: AlertCircle,
          className: 'bg-rose-50 text-rose-700 border-rose-200',
          barClass: 'bg-rose-500',
        };
      case 'WARNING':
        return {
          label: 'Near Limit',
          icon: AlertTriangle,
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          barClass: 'bg-amber-500',
        };
      case 'NORMAL':
      default:
        return {
          label: 'On Track',
          icon: CheckCircle2,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          barClass: 'bg-emerald-500',
        };
    }
  };

  const isCurrentSelectionToday =
    selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-md bg-brand-50 text-brand-600 border border-brand-200/80">
              <PieChart className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Monthly Budgets
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Establish category spending limits and monitor utilization in real time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            iconLeft={Plus}
            className="self-start sm:self-auto"
          >
            Set Budget
          </Button>
        </div>
      </div>

      {/* Month & Year Navigation Bar */}
      <Card bodyClassName="p-3 sm:p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200/60">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {!isCurrentSelectionToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCurrentMonth}
                className="text-xs text-brand-600 hover:text-brand-700 h-8 px-2"
              >
                Current Month
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              On Track: <strong className="text-slate-800 tabular-nums">{summary.normalCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Near Limit: <strong className="text-slate-800 tabular-nums">{summary.warningCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Exceeded: <strong className="text-slate-800 tabular-nums">{summary.exceededCount}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Monthly Summary Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Limit */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Budget Limit
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1 tracking-tight">
            {formatBDT(summary.totalBudgetLimit)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Across {summary.totalBudgets} category budget{summary.totalBudgets === 1 ? '' : 's'}
          </p>
        </Card>

        {/* Total Actual Spent */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Actual Spent
          </p>
          <h3 className="text-2xl font-bold text-rose-600 tabular-nums mt-1 tracking-tight">
            -{formatBDT(summary.totalSpent)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            From current month expenditures
          </p>
        </Card>

        {/* Total Remaining */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Remaining Budget
          </p>
          <h3
            className={`text-2xl font-bold tabular-nums mt-1 tracking-tight ${
              summary.totalRemaining >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatBDT(summary.totalRemaining, { showSign: true })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {summary.totalRemaining >= 0 ? 'Available surplus' : 'Overall deficit'}
          </p>
        </Card>

        {/* Overall Utilization */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Overall Utilization
          </p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
              {summary.overallUtilization}%
            </h3>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                summary.overallUtilization > 100
                  ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                  : summary.overallUtilization >= 80
                  ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              }`}
            >
              {summary.overallUtilization > 100
                ? 'Over Budget'
                : summary.overallUtilization >= 80
                ? '80%+ Alert'
                : 'Safe'}
            </span>
          </div>
          {/* Global progress mini-bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                summary.overallUtilization > 100
                  ? 'bg-rose-500'
                  : summary.overallUtilization >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(summary.overallUtilization, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBudgetData}
            className="text-rose-700 hover:bg-rose-100 h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Budget Cards Grid */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-7 h-7 animate-spin text-brand-600 mb-2.5" />
          <p className="text-xs">Loading budgets for {getMonthName(selectedMonth)} {selectedYear}...</p>
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title={`No budgets set for ${getMonthName(selectedMonth)} ${selectedYear}`}
          description="Create spending limits for regular expense categories (e.g. Groceries, Transport, Rent) to monitor cash burn."
          actionLabel="Set First Budget"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const statusConfig = getStatusBadge(b.status, b.utilization);
            const StatusIcon = statusConfig.icon;
            const percentWidth = Math.min(b.utilization, 100);

            return (
              <Card
                key={b._id}
                className="bg-white border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all"
                bodyClassName="p-4 space-y-3.5"
              >
                {/* Header: Category & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {b.category}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {getMonthName(b.month)} {b.year}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusConfig.className}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Spending Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Spent so far:</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {b.utilization}% ({formatBDT(b.spent)})
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${statusConfig.barClass}`}
                      style={{ width: `${percentWidth}%` }}
                    />
                  </div>
                </div>

                {/* Limit & Remaining Details Grid */}
                <div className="p-2.5 bg-slate-50 rounded-lg grid grid-cols-2 gap-2 text-xs border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Limit</p>
                    <p className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                      {formatBDT(b.limit)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {b.remaining >= 0 ? 'Remaining' : 'Overspent'}
                    </p>
                    <p
                      className={`font-semibold mt-0.5 tabular-nums ${
                        b.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {b.remaining >= 0
                        ? formatBDT(b.remaining)
                        : `-${formatBDT(Math.abs(b.remaining))}`}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(b)}
                    iconLeft={Edit2}
                    className="h-7 text-xs px-2.5"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingBudget(b)}
                    iconLeft={Trash2}
                    className="h-7 text-xs px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <BudgetFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingBudget(null);
        }}
        initialData={editingBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onSuccess={() => {
          fetchBudgetData();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingBudget)}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Delete Monthly Budget?"
        message={`Are you sure you want to remove your ${formatBDT(
          deletingBudget?.limit || 0
        )} budget for "${deletingBudget?.category}" in ${getMonthName(
          deletingBudget?.month
        )} ${deletingBudget?.year}?`}
        confirmText="Yes, Delete Budget"
        variant="danger"
      />
    </div>
  );
};

export default BudgetsPage;
