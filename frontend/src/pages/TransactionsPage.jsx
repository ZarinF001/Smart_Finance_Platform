import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Calendar,
  RotateCcw,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Pagination from '../components/common/Pagination.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import IncomeFormModal from '../components/transactions/IncomeFormModal.jsx';
import ExpenseFormModal from '../components/transactions/ExpenseFormModal.jsx';
import transactionService from '../services/transactionService.js';
import incomeService from '../services/incomeService.js';
import expenseService from '../services/expenseService.js';
import categoryService from '../services/categoryService.js';
import { formatBDT, formatDate } from '../utils/currency.js';
import notify from '../utils/notify.js';

export const TransactionsPage = () => {
  // Data state
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({
    pagination: {
      page: 1,
      limit: 10,
      totalRecords: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
    },
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [type, setType] = useState('ALL'); // 'ALL' | 'INCOME' | 'EXPENSE'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modals state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Load categories matching selected type or all categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catType = type === 'ALL' ? undefined : type;
        const list = await categoryService.getCategories(catType);
        if (list) {
          setCategories(list.map((c) => c.name));
        }
      } catch (err) {
        // Fallback silently
      }
    };
    fetchCats();
  }, [type]);

  // Fetch unified transaction history
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await transactionService.getTransactions({
        page,
        limit: 10,
        type,
        search: debouncedSearch,
        category,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setTransactions(res.items);
      setMeta(res.meta);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(
        err.message || 'Unable to load transaction records. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, type, debouncedSearch, category, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle Edit
  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    if (tx.type === 'INCOME') {
      setIsIncomeModalOpen(true);
    } else {
      setIsExpenseModalOpen(true);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);

    try {
      if (deletingTransaction.type === 'INCOME') {
        await incomeService.deleteIncome(deletingTransaction._id);
      } else {
        await expenseService.deleteExpense(deletingTransaction._id);
      }

      notify.success(
        `${deletingTransaction.type === 'INCOME' ? 'Income' : 'Expense'} record deleted successfully`
      );
      setDeletingTransaction(null);
      fetchTransactions();
    } catch (err) {
      notify.error(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setType('ALL');
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    type !== 'ALL' ||
      search ||
      category ||
      startDate ||
      endDate ||
      sortBy !== 'date' ||
      sortOrder !== 'desc'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-200">
              <ArrowUpDown className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Transaction History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete unified ledger of all earnings, expenditures, and cash flow activities.
          </p>
        </div>

        {/* Quick Add Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsIncomeModalOpen(true);
            }}
            iconLeft={ArrowDownLeft}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs"
          >
            Add Income
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsExpenseModalOpen(true);
            }}
            iconLeft={ArrowUpRight}
            className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Inflow
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1 tracking-tight">
                +{formatBDT(meta.summary?.totalIncome || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current filter selection
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Total Expense */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Outflow
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1 tracking-tight">
                -{formatBDT(meta.summary?.totalExpense || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current filter selection
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Net Balance */}
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Net Cash Flow
              </p>
              <h3
                className={`text-2xl font-bold mt-1 tabular-nums tracking-tight ${
                  (meta.summary?.netBalance || 0) >= 0
                    ? 'text-slate-900'
                    : 'text-rose-600'
                }`}
              >
                {formatBDT(meta.summary?.netBalance || 0, { showSign: true })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {(meta.summary?.netBalance || 0) >= 0
                  ? 'Positive cash flow'
                  : 'Outflow exceeds earnings'}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                (meta.summary?.netBalance || 0) >= 0
                  ? 'bg-slate-100 text-slate-700 border-slate-200/70'
                  : 'bg-rose-50 text-rose-600 border-rose-200/70'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-3.5 sm:p-4">
        <div className="space-y-3">
          {/* Top row: Type switcher tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg max-w-fit border border-slate-200/60">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'INCOME', label: 'Incomes Only' },
              { id: 'EXPENSE', label: 'Expenses Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setType(tab.id);
                  setCategory('');
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  type === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Middle row: Search, Category, Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search memo or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Category dropdown */}
            <div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                title="Start Date"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* End Date */}
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                title="End Date"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Bottom row: Sort and Clear filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amount-desc">Amount (Highest First)</option>
                <option value="amount-asc">Amount (Lowest First)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                iconLeft={RotateCcw}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-7 text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTransactions}
            className="text-rose-700 hover:bg-rose-100 h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Unified Transactions Ledger Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-brand-600 mb-2.5" />
            <p className="text-xs">Loading unified ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Receipt}
              title={hasActiveFilters ? 'No matching transactions' : 'No transactions recorded'}
              description={
                hasActiveFilters
                  ? 'Try clearing or relaxing your filters to view more records.'
                  : 'Start recording your incomes and expenses to see them organized in this ledger.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
              actionIcon={hasActiveFilters ? RotateCcw : undefined}
              onAction={hasActiveFilters ? handleResetFilters : undefined}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Description / Memo
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Amount
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    return (
                      <tr
                        key={`${tx.type}-${tx._id}`}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Type Badge */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <ArrowDownLeft className="w-3 h-3" />
                              Income
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                              <ArrowUpRight className="w-3 h-3" />
                              Expense
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(tx.date)}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                            {tx.category}
                          </span>
                          {tx.paymentMethod && (
                            <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                              {tx.paymentMethod.replace('_', ' ')}
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                          {tx.description || (
                            <span className="text-slate-400 italic">No memo</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td
                          className={`px-5 py-3.5 whitespace-nowrap text-right font-semibold tabular-nums ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome
                            ? `+${formatBDT(tx.amount)}`
                            : `-${formatBDT(tx.amount)}`}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <div key={`${tx.type}-${tx._id}`} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <ArrowDownLeft className="w-2.5 h-2.5" />
                              Income
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                              <ArrowUpRight className="w-2.5 h-2.5" />
                              Expense
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-800">
                            {tx.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 tabular-nums">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(tx.date)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold tabular-nums ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome
                            ? `+${formatBDT(tx.amount)}`
                            : `-${formatBDT(tx.amount)}`}
                        </p>
                      </div>
                    </div>

                    {tx.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                        {tx.description}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tx)}
                        iconLeft={Edit2}
                        className="h-7 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingTransaction(tx)}
                        iconLeft={Trash2}
                        className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-4">
              <Pagination
                page={meta.pagination?.page || 1}
                totalPages={meta.pagination?.totalPages || 1}
                totalRecords={meta.pagination?.totalRecords || 0}
                limit={meta.pagination?.limit || 10}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </Card>

      {/* Edit Income Modal */}
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingTransaction(null);
        }}
        initialData={
          editingTransaction?.type === 'INCOME' ? editingTransaction : null
        }
        onSuccess={() => {
          fetchTransactions();
        }}
      />

      {/* Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingTransaction(null);
        }}
        initialData={
          editingTransaction?.type === 'EXPENSE' ? editingTransaction : null
        }
        onSuccess={() => {
          fetchTransactions();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title={`Delete ${
          deletingTransaction?.type === 'INCOME' ? 'Income' : 'Expense'
        } Record?`}
        message={`Are you sure you want to delete this ${
          deletingTransaction?.type === 'INCOME' ? 'income' : 'expense'
        } record of ${formatBDT(deletingTransaction?.amount || 0)} (${
          deletingTransaction?.category
        })? This cannot be undone.`}
        confirmText="Yes, Delete Record"
        variant="danger"
      />
    </div>
  );
};

export default TransactionsPage;
