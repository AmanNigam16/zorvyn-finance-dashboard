import React, { useEffect, useState } from 'react';
import { AccessPanel } from '../components';
import { createUser, getUsers, updateUserRole, updateUserStatus } from '../services/api/user.api';
import { useStateContext } from '../contexts/ContextProvider';

const roleOptions = ['VIEWER', 'ANALYST', 'ADMIN'];

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const Users = () => {
  const { currentColor, authUser, authLoading } = useStateContext();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async (nextFilters = filters) => {
    if (!authUser || authUser.role !== 'ADMIN') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await getUsers(nextFilters);
      setUsers(data?.users || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadUsers();
    }
  }, [authLoading, authUser]);

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    await loadUsers(filters);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createUser(formData);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'VIEWER',
        isActive: true,
      });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update user role.');
    }
  };

  const handleStatusToggle = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, !isActive);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update user status.');
    }
  };

  if (authLoading) {
    return (
      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        Loading users workspace...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mt-8">
        <AccessPanel
          title="Manage users"
          description="Sign in with an admin account to create users, assign roles, and change active status."
          currentColor={currentColor}
          onSuccess={loadUsers}
        />
      </div>
    );
  }

  if (authUser.role !== 'ADMIN') {
    return (
      <div className="mt-8 rounded-[32px] border border-amber-200 bg-amber-50 p-8 text-slate-700 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Restricted</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">User management is admin-only</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Analysts and viewers can use the dashboard and records views, but only admins can create users, assign roles, and update account status.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Administration</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">User Management</h2>
            <p className="mt-2 text-sm text-slate-500">Create accounts, assign roles, and keep access status aligned with your finance workflow.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {users.length} users loaded
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-5" onSubmit={handleCreateUser}>
          <input
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(event) => setFormData((previous) => ({ ...previous, password: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            required
          />
          <select
            value={formData.role}
            onChange={(event) => setFormData((previous) => ({ ...previous, role: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: currentColor }}
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create user'}
          </button>
        </form>

        <form className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 md:grid-cols-4" onSubmit={handleFilterSubmit}>
          <input
            type="text"
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />
          <select
            value={filters.role}
            onChange={(event) => setFilters((previous) => ({ ...previous, role: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(event) => setFilters((previous) => ({ ...previous, isActive: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Apply filters
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm text-slate-600">
                    <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Mark as {user.isActive ? 'inactive' : 'active'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && !isLoading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                      No users found for the selected filters.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                      Loading users...
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

export default Users;
