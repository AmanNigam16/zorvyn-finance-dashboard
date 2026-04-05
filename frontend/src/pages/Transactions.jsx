import React, { useEffect, useState } from 'react';
import { AccessPanel } from '../components';
import {
  createFinanceRecord,
  deleteFinanceRecord,
  getFinanceRecords,
  updateFinanceRecord,
} from '../services/api/finance.api';
import { useStateContext } from '../contexts/ContextProvider';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const toDateInputValue = (value) => (value ? new Date(value).toISOString().split('T')[0] : '');

const Transactions = () => {
  const { currentColor, authUser, authLoading } = useStateContext();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState({
    amount: '',
    type: 'income',
    category: '',
    date: '',
    note: '',
  });
  const [editingRecordId, setEditingRecordId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = async (page = 1, nextFilters = filters) => {
    if (!authUser || authUser.role === 'VIEWER') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await getFinanceRecords({ ...nextFilters, page, limit: 10 });
      setRecords(data?.records || []);
      setPagination(data?.pagination || {
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0,
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadTransactions(1);
    }
  }, [authLoading, authUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date || undefined,
        note: formData.note,
      };

      if (editingRecordId) {
        await updateFinanceRecord(editingRecordId, payload);
      } else {
        await createFinanceRecord(payload);
      }

      setFormData({
        amount: '',
        type: 'income',
        category: '',
        date: '',
        note: '',
      });
      setEditingRecordId('');
      await loadTransactions(pagination.page);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save the record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecordId(record._id);
    setFormData({
      amount: String(record.amount),
      type: record.type,
      category: record.category,
      date: toDateInputValue(record.date),
      note: record.note || '',
    });
  };

  const handleDelete = async (recordId) => {
    const confirmed = window.confirm('Soft delete this financial record?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteFinanceRecord(recordId);
      await loadTransactions(pagination.page);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the record.');
    }
  };

  if (authLoading) {
    return (
      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        Loading transactions workspace...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mt-8">
        <AccessPanel
          title="Access your transactions"
          description="Sign in with an analyst or admin account to view finance records from the API."
          currentColor={currentColor}
          onSuccess={() => loadTransactions(1)}
        />
      </div>
    );
  }

  if (authUser.role === 'VIEWER') {
    return (
      <div className="mt-8 rounded-[32px] border border-amber-200 bg-amber-50 p-8 text-slate-700 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Restricted</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Transactions are not available for viewers</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Viewer accounts can access the dashboard summary, trends, and recent activity, but finance records are limited to analysts and admins.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Finance Records</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Transactions</h2>
            <p className="mt-2 text-sm text-slate-500">A clean ledger view connected directly to the backend finance module.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {pagination.total} total records · {authUser.role}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            loadTransactions(1, filters);
          }}
        >
          <select
            value={filters.type}
            onChange={(event) => setFilters((previous) => ({ ...previous, type: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(event) => setFilters((previous) => ({ ...previous, category: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => setFilters((previous) => ({ ...previous, startDate: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => setFilters((previous) => ({ ...previous, endDate: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Apply filters
          </button>
        </form>

        {authUser.role === 'ADMIN' && (
          <form className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 lg:grid-cols-6" onSubmit={handleSubmit}>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(event) => setFormData((previous) => ({ ...previous, amount: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              required
            />
            <select
              value={formData.type}
              onChange={(event) => setFormData((previous) => ({ ...previous, type: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(event) => setFormData((previous) => ({ ...previous, category: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(event) => setFormData((previous) => ({ ...previous, date: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <input
              type="text"
              placeholder="Note"
              value={formData.note}
              onChange={(event) => setFormData((previous) => ({ ...previous, note: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: currentColor }}
                className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingRecordId ? 'Update' : 'Create'}
              </button>
              {editingRecordId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRecordId('');
                    setFormData({
                      amount: '',
                      type: 'income',
                      category: '',
                      date: '',
                      note: '',
                    });
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Note</th>
                  {authUser.role === 'ADMIN' && <th className="px-6 py-4">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map((record) => (
                  <tr key={record._id} className="text-sm text-slate-600">
                    <td className="px-6 py-4">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{record.category}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(record.amount)}</td>
                    <td className="px-6 py-4 text-slate-500">{record.note || 'No note'}</td>
                    {authUser.role === 'ADMIN' && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(record)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(record._id)}
                            className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!records.length && !isLoading && (
                  <tr>
                    <td colSpan={authUser.role === 'ADMIN' ? '6' : '5'} className="px-6 py-12 text-center text-sm text-slate-400">
                      No transactions found.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={authUser.role === 'ADMIN' ? '6' : '5'} className="px-6 py-12 text-center text-sm text-slate-400">
                      Loading transactions...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => loadTransactions(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            type="button"
            onClick={() => loadTransactions(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
            style={{ backgroundColor: currentColor }}
            className="rounded-2xl px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default Transactions;
