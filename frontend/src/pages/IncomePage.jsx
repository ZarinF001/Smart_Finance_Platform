import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
  TrendingUp,
  Wallet,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Pagination from '../components/common/Pagination.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import IncomeFormModal from '../components/transactions/IncomeFormModal.jsx';
import incomeService from '../services/incomeService.js';
import categoryService from '../services/categoryService.js';
import { formatBDT, formatDate } from '../utils/currency.js';
import notify from '../utils/notify.js';

export const IncomePage = () => {
  // Data state
  const [incomes, setIncomes] = useState([]);
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
    },
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deletingIncome, setDeletingIncome] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Load available INCOME categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catList = await categoryService.getCategories('INCOME');
        if (catList && catList.length > 0) {
          setCategories(catList.map((c) => c.name));
        }
      } catch (err) {
        // Fallback silently
      }
    };
    loadCategories();
  }, []);

  // Fetch incomes from backend
  const fetchIncomes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await incomeService.getIncomes({
        page,
        limit: 10,
        search: debouncedSearch,
        category,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setIncomes(res.items);
      setMeta(res.meta);
    } catch (err) {
      console.error('Error fetching incomes:', err);
      setError(
        err.message || 'Unable to retrieve income records. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, category, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingIncome(null);
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (income) => {
    setEditingIncome(income);
    setIsFormModalOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingIncome) return;
    setIsDeleting(true);

    try {
      await incomeService.deleteIncome(deletingIncome._id);
      notify.success('Income record deleted successfully');
      setDeletingIncome(null);
      // Refresh list
      fetchIncomes();
    } catch (err) {
      notify.error(err.message || 'Failed to delete income record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
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
    search || category || startDate || endDate || sortBy !== 'date' || sortOrder !== 'desc'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Income Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your earnings, salary, investments, and revenue streams.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          iconLeft={Plus}
          className="bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto shadow-sm shadow-emerald-600/20"
        >
          Add Income
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white border-emerald-200/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Total Inflow (Filtered)
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
                {formatBDT(meta.summary?.totalIncome || 0)}
              </h3>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">
                From {meta.pagination?.totalRecords || 0} recorded transaction(s)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Records
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {meta.pagination?.totalRecords || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Page {meta.pagination?.page || 1} of {meta.pagination?.totalPages || 1}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4 sm:p-5">
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                title="Filter records from date"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Sorting & Clear Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
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
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchIncomes}
            className="text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Income Records List / Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-xs">Loading income records...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ArrowDownLeft}
              title={hasActiveFilters ? 'No matching income found' : 'No income records yet'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search terms or filters to find what you are looking for.'
                  : 'Start tracking your cash inflows by adding your first income record.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add First Income'}
              actionIcon={hasActiveFilters ? RotateCcw : Plus}
              onAction={hasActiveFilters ? handleResetFilters : handleOpenAdd}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Source / Category
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(item.date)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {item.description || (
                          <span className="text-slate-300 italic">No memo</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                        {formatBDT(item.amount, { showSign: true })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingIncome(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {incomes.map((item) => (
                <div key={item._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.category}
                      </span>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(item.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {formatBDT(item.amount, { showSign: true })}
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
                      onClick={() => setDeletingIncome(item)}
                      iconLeft={Trash2}
                      className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
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
      <IncomeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingIncome(null);
        }}
        initialData={editingIncome}
        onSuccess={() => {
          fetchIncomes();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingIncome)}
        onClose={() => setDeletingIncome(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Delete Income Record?"
        message={`Are you sure you want to delete this income entry of ${formatBDT(
          deletingIncome?.amount || 0
        )} (${deletingIncome?.category})? This will permanently remove it from your records.`}
        confirmText="Yes, Delete Income"
        variant="danger"
      />
    </div>
  );
};

export default IncomePage;
