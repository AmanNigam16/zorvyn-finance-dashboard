import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiActivity, FiGrid, FiUsers, FiX } from 'react-icons/fi';
import { useStateContext } from '../contexts/ContextProvider';

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize, authUser } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const navSections = [
    {
      title: 'Workspace',
      links: [
        { name: 'dashboard', label: 'Finance Dashboard', icon: <FiGrid /> },
        ...(!authUser || authUser.role !== 'VIEWER'
          ? [{ name: 'transactions', label: 'Transactions', icon: <FiActivity /> }]
          : []),
        ...(authUser?.role === 'ADMIN'
          ? [{ name: 'users', label: 'Users', icon: <FiUsers /> }]
          : []),
      ],
    },
  ];

  const activeLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2';
  const normalLink = 'flex items-center gap-4 pl-4 pr-3 pt-3 pb-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100 m-2 transition-colors';

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center px-3 pt-5">
            <Link to="/dashboard" onClick={handleCloseSideBar} className="items-center gap-3 flex text-xl font-extrabold tracking-tight text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">Z</span>
              <span>Zorvyn Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={() => setActiveMenu(!activeMenu)}
              style={{ color: currentColor }}
              className="text-xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm block md:hidden"
            >
              <FiX />
            </button>
          </div>
          {authUser && (
            <div className="mx-3 mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Signed in as</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">{authUser.name}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{authUser.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {authUser.role}
              </span>
            </div>
          )}
          <div className="mt-10">
            {navSections.map((item) => (
              <div key={item.title}>
                <p className="m-3 mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {item.title}
                </p>
                {item.links.map((link) => (
                  <NavLink
                    to={`/${link.name}`}
                    key={link.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? currentColor : '',
                      boxShadow: isActive ? '0 14px 35px rgba(40, 110, 250, 0.22)' : '',
                    })}
                    className={({ isActive }) => (isActive ? activeLink : normalLink)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
