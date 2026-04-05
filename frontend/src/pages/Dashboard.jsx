import React, { useEffect, useMemo, useState } from 'react';
import { BsArrowDownRight, BsArrowUpRight, BsCurrencyDollar } from 'react-icons/bs';
import { FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import { HiOutlineScale } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { AccessPanel, LineChart } from '../components';
import {
  getDashboardCategories,
  getDashboardRecentTransactions,
  getDashboardSummary,
  getDashboardTrends,
} from '../services/api/dashboard.api';
import { getAuthToken } from '../services/api/client';
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

const summaryCards = (summary) => [
  {
    key: 'income',
    title: 'Total Income',
    value: formatCurrency(summary.totalIncome),
    tone: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: <BsArrowUpRight />,
  },
  {
    key: 'expense',
    title: 'Total Expense',
    value: formatCurrency(summary.totalExpense),
    tone: 'text-rose-600',
    bg: 'bg-rose-50',
    icon: <BsArrowDownRight />,
  },
  {
    key: 'balance',
    title: 'Net Balance',
    value: formatCurrency(summary.netBalance),
    tone: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <HiOutlineScale />,
  },
];

const Dashboard = () => {
  const { currentColor, authUser, authLoading } = useStateContext();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
    },
    categories: [],
    trends: [],
    transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const loadDashboard = async (nextFilters = filters) => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [summary, categories, trends, recent] = await Promise.all([
        getDashboardSummary(nextFilters),
        getDashboardCategories(nextFilters),
        getDashboardTrends(nextFilters),
        getDashboardRecentTransactions(nextFilters),
      ]);

      setDashboardData({
        summary: summary || {
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
        },
        categories: categories?.categories || [],
        trends: trends?.trends || [],
        transactions: recent?.transactions || [],
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load finance dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading, authUser]);

  const cards = useMemo(() => summaryCards(dashboardData.summary), [dashboardData.summary]);

  if (authLoading) {
    return (
      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        Loading your dashboard...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mt-8">
        <AccessPanel
          title="Open the finance dashboard"
          description="Sign in or create a viewer account to load live totals, category analytics, trends, and recent transactions from the backend."
          currentColor={currentColor}
          onSuccess={loadDashboard}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Overview</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Finance Dashboard</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              A focused view of your income, expenses, category breakdown, backend-driven trends, and latest transactions.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Signed in as {authUser.role}
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard()}
            disabled={isLoading}
            style={{ backgroundColor: currentColor }}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh data'}</span>
          </button>
        </div>

        <form
          className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            loadDashboard(filters);
          }}
        >
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
            Apply date filters
          </button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.key} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
              <div className={`inline-flex rounded-2xl p-3 text-lg ${card.bg} ${card.tone}`}>
                {card.icon}
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{isLoading ? 'Loading...' : card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Main Chart</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Income vs Expense Trends</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
              {dashboardData.trends.length} monthly points
            </div>
          </div>
          <div className="mt-8">
            <LineChart trends={dashboardData.trends} />
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <FiBarChart2 />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Breakdown</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">Category Breakdown</h3>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {dashboardData.categories.map((item) => (
              <div key={`${item.category}-${item.type}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.category}</p>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.2em] ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{formatCurrency(item.total)}</p>
                </div>
              </div>
            ))}
            {!dashboardData.categories.length && !isLoading && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                No category totals available yet.
              </p>
            )}
            {isLoading && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                Loading category data...
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Live Activity</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Recent Transactions</h3>
          </div>
          {authUser.role !== 'VIEWER' ? (
            <Link to="/transactions" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BsCurrencyDollar />
              <span>Open full transactions page</span>
            </Link>
          ) : (
            <div className="text-sm text-slate-500">Viewer access includes dashboard-only insights.</div>
          )}
        </div>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dashboardData.transactions.map((transaction) => (
                  <tr key={transaction._id} className="text-sm text-slate-600">
                    <td className="px-6 py-4">{formatDate(transaction.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{transaction.category}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(transaction.amount)}</td>
                    <td className="px-6 py-4 text-slate-500">{transaction.note || 'No note'}</td>
                  </tr>
                ))}
                {!dashboardData.transactions.length && !isLoading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                      No recent transactions available.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                      Loading recent transactions...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
