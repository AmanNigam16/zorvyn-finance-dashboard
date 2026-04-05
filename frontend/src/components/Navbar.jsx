import React, { useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { FiLogOut } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

const Navbar = () => {
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    setScreenSize,
    screenSize,
    authUser,
    signOut,
  } = useStateContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);
  const pageTitleMap = {
    '/dashboard': 'Finance Dashboard',
    '/transactions': 'Transactions',
    '/users': 'Users',
  };
  const pageTitle = pageTitleMap[location.pathname] || 'Finance Dashboard';

  const handleLogout = () => {
    signOut();
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6 relative">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleActiveMenu}
          style={{ color: currentColor }}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-xl shadow-sm transition hover:shadow-md"
        >
          <AiOutlineMenu />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Zorvyn</p>
          <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm md:block">
          Backend-connected workspace
        </div>
        {authUser && (
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm lg:block">
            <span className="font-semibold">{authUser.role}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span>{authUser.name}</span>
          </div>
        )}
        {authUser && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:shadow-md"
          >
            <FiLogOut />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
