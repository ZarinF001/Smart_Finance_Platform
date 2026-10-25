import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
  TrendingDown,
  CreditCard,
  Receipt,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Pagination from '../components/common/Pagination.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import ExpenseFormModal, {
  PAYMENT_METHOD_OPTIONS,
} from '../components/transactions/ExpenseFormModal.jsx';
import expenseService from '../services/expenseService.js';
import categoryService from '../services/categoryService.js';
import { formatBDT, formatDate } from '../utils/currency.js';
import notify from '../utils/notify.js';

export const ExpensePage = () => {
  // Data state
  const [expenses, setExpenses] = useState([]);
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
      totalExpense: 0,
    },
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Load available EXPENSE categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catList = await categoryService.getCategories('EXPENSE');
        if (catList && catList.length > 0) {
          setCategories(catList.map((c) => c.name));
        }
      } catch (err) {
        // Fallback silently
      }
    };
    loadCategories();
  }, []);

  // Fetch expenses from backend
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await expenseService.getExpenses({
        page,
        limit: 10,
        search: debouncedSearch,
        category,
        paymentMethod,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setExpenses(res.items);
      setMeta(res.meta);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(
        err.message || 'Unable to retrieve expense records. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, category, paymentMethod, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormModalOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);

    try {
      await expenseService.deleteExpense(deletingExpense._id);
      notify.success('Expense record deleted successfully');
      setDeletingExpense(null);
      fetchExpenses();
    } catch (err) {
      notify.error(err.message || 'Failed to delete expense record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search ||
      category ||
      paymentMethod ||
      startDate ||
      endDate ||
      sortBy !== 'date' ||
      sortOrder !== 'desc'
  );

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'mobile_payment':
        return { label: 'bKash/Nagad', className: 'bg-slate-100 text-slate-700 border-slate-200/90' };
      case 'credit_card':
        return { label: 'Credit Card', className: 'bg-slate-100 text-slate-700 border-slate-200/90' };
      case 'debit_card':
        return { label: 'Debit Card', className: 'bg-slate-100 text-slate-700 border-slate-200/90' };
      case 'bank_transfer':
        return { label: 'Bank Transfer', className: 'bg-slate-100 text-slate-700 border-slate-200/90' };
      case 'cash':
        return { label: 'Cash', className: 'bg-slate-100 text-slate-700 border-slate-200/90' };
      default:
        return { label: method || 'Other', className: 'bg-slate-100 text-slate-600 border-slate-200/90' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200/80">
              <ArrowUpRight className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Expense Outflows
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor everyday spending, bill settlements, and operational expenses.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          iconLeft={Plus}
          className="self-start sm:self-auto"
        >
          Add Expense
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Outflow (Filtered)
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1 tracking-tight">
                -{formatBDT(meta.summary?.totalExpense || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                From {meta.pagination?.totalRecords || 0} transaction{meta.pagination?.totalRecords === 1 ? '' : 's'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Records
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1 tracking-tight">
                {meta.pagination?.totalRecords || 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Page {meta.pagination?.page || 1} of {meta.pagination?.totalPages || 1}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/70 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-3.5 sm:p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="relative lg:col-span-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
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

            {/* Payment Method Dropdown */}
            <div>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="">All Payment Methods</option>
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                title="Filter records from date"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                title="Filter records to date"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Sorting & Clear Filters Row */}
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

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchExpenses}
            className="text-rose-700 hover:bg-rose-100 h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Expense Records List / Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-brand-600 mb-2.5" />
            <p className="text-xs">Loading expense records...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ArrowUpRight}
              title={hasActiveFilters ? 'No matching expenses found' : 'No expense records yet'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search terms or filters to find what you are looking for.'
                  : 'Start tracking your spending by adding your first expense record.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add First Expense'}
              actionIcon={hasActiveFilters ? RotateCcw : Plus}
              onAction={hasActiveFilters ? handleResetFilters : handleOpenAdd}
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
                      Date
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Payment Method
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Description
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
                  {expenses.map((item) => {
                    const badge = getPaymentMethodBadge(item.paymentMethod);
                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(item.date)}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/80">
                            {item.category}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                          {item.description || (
                            <span className="text-slate-400 italic">No description</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right font-semibold text-rose-600 tabular-nums">
                          -{formatBDT(item.amount)}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingExpense(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete record"
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
              {expenses.map((item) => {
                const badge = getPaymentMethodBadge(item.paymentMethod);
                return (
                  <div key={item._id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/80">
                            {item.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 tabular-nums">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(item.date)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-rose-600 tabular-nums">
                          -{formatBDT(item.amount)}
                        </p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        iconLeft={Edit2}
                        className="h-7 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingExpense(item)}
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

      {/* Add / Edit Form Modal */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
        onSuccess={() => {
          fetchExpenses();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Delete Expense Record?"
        message={`Are you sure you want to delete this expense of ${formatBDT(
          deletingExpense?.amount || 0
        )} (${deletingExpense?.category})? This will permanently remove it from your records.`}
        confirmText="Yes, Delete Expense"
        variant="danger"
      />
    </div>
  );
};

export default ExpensePage;
