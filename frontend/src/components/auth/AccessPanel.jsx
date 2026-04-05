import React, { useState } from 'react';
import { loginUser, registerUser } from '../../services/api/auth.api';
import { useStateContext } from '../../contexts/ContextProvider';

const AccessPanel = ({ title, description, currentColor, onSuccess }) => {
  const { refreshAuthUser } = useStateContext();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (mode === 'register') {
        await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      await loginUser({
        email: formData.email,
        password: formData.password,
      });

      const user = await refreshAuthUser();

      if (onSuccess) {
        await onSuccess(user);
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to continue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Secure Access</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          required
        />
        {mode === 'register' && (
          <p className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            The first account on a fresh database becomes <span className="font-semibold">ADMIN</span>. All later public registrations start as <span className="font-semibold">VIEWER</span>, and an admin can later promote them.
          </p>
        )}
        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: currentColor }}
          className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign in to continue' : 'Create account and continue'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError('');
          setMode((previous) => (previous === 'login' ? 'register' : 'login'));
        }}
        className="mt-5 text-sm font-semibold text-blue-600"
      >
        {mode === 'login' ? 'Need an account? Create a viewer profile' : 'Already registered? Sign in instead'}
      </button>
    </div>
  );
};

export default AccessPanel;
