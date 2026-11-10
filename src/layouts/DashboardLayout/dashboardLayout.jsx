import React from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { IoCreateOutline, IoHomeOutline } from 'react-icons/io5';
import { Users, Hash, Settings2, History, Settings, BrainCircuit, Sprout, UserCheck } from 'lucide-react';
import LoadingState from '../../components/common/LoadingState';
import { useMe } from '../../hooks/useMe';

import ThemeToggle from '../../components/common/ThemeToggle';

const DashboardLayout = () => {
  const { isAdmin, isCreator, isApproved } = useMe();

  const navClass = ({ isActive }) =>
    [
      'rounded-xl flex items-center gap-3 px-3 py-2.5 transition',
      'hover:bg-primary/6',
      isActive
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_8px_18px_rgba(47,107,255,0.14)]'
        : 'text-base-content/80 border border-transparent',
    ].join(' ');

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200/30">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      {/* ================== CONTENT ================== */}
      <div className="drawer-content flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-md border-b border-primary/10">
          <div className="navbar px-3 md:px-6">
            <div className="navbar-start gap-2">
              {/* toggle button (mobile) */}
              <label htmlFor="my-drawer-4" className="btn btn-ghost btn-square rounded-xl lg:hidden hover:bg-primary/8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h10" />
                  <path d="M4 18h16" />
                </svg>
              </label>

              {/* Title */}
              <div className="flex flex-col leading-tight">
                <h1 className="text-base md:text-lg font-extrabold text-base-content">Dashboard</h1>
                <p className="text-xs md:text-sm text-base-content/60">PostFlow workspace</p>
              </div>
            </div>

            <div className="navbar-center hidden md:flex">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/15 text-sm text-base-content/70">
                Internal tool — team access
              </div>
            </div>

            <div className="navbar-end gap-2">
              <ThemeToggle />
              <button className="btn btn-ghost btn-circle rounded-xl hover:bg-primary/8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              <div className="avatar">
                <div className="w-9 rounded-full ring-2 ring-primary/25">
                  <img alt="User" src="https://i.pravatar.cc/80?img=12" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ================== SIDEBAR ================== */}
      <div className="drawer-side z-40">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>

        {/* Mobile */}
        <aside className="w-72 bg-base-100 border-r border-base-200 min-h-full flex flex-col">
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_10px_22px_rgba(47,107,255,0.14)]">
                <span className="text-primary font-black">P</span>
              </div>
              <Link to="/" className="leading-tight">
                <p className="font-extrabold text-base-content">PostFlow</p>
                <p className="text-xs text-base-content/60">Planner dashboard</p>
              </Link>
            </div>

            {/* close (mobile) */}
            <label
              htmlFor="my-drawer-4"
              className="btn btn-ghost btn-square rounded-xl lg:hidden hover:bg-primary/8"
              aria-label="Close sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </label>
          </div>

          {/* Menu */}
          <div className="px-3 py-3">
            <ul className="menu w-full gap-1">
              <li>
                <NavLink to="/dashboard" className={navClass} end>
                  <IoHomeOutline className="text-lg" />
                  <span className="font-semibold">Homepage</span>
                </NavLink>
              </li>

              {isApproved && (
                <li>
                  <NavLink to="/dashboard/follow-leads" className={navClass}>
                    <UserCheck className="w-5 h-5" />
                    <span className="font-semibold">Follow Leads</span>
                  </NavLink>
                </li>
              )}

              {(isAdmin || isCreator) && (
                <li>
                  <NavLink to="/dashboard/create-post" className={navClass}>
                    <IoCreateOutline className="text-lg" />
                    <span className="font-semibold">Create Post</span>
                  </NavLink>
                </li>
              )}

              {/* Role */}
              {isAdmin && (
                <>
                  <li>
                    <NavLink to="/dashboard/AccessReq" className={navClass}>
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Access Requests </span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dashboard/sync-history" className={navClass}>
                      <History className="w-5 h-5" />
                      <span className="font-semibold">Sync History</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dashboard/hashtags-manager" className={navClass}>
                      <Hash className="w-5 h-5" />
                      <span className="font-semibold">Account Hashtags Manager</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dashboard/account-manager" className={navClass}>
                      <Settings2 className="w-5 h-5" />
                      <span className="font-semibold">Account Manager</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dashboard/seed-accounts" className={navClass}>
                      <Sprout className="w-5 h-5" />
                      <span className="font-semibold">Seed Accounts</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dashboard/settings/platform" className={navClass}>
                      <Settings className="w-5 h-5" />
                      <span className="font-semibold">Platform Settings</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dashboard/settings/ai" className={navClass}>
                      <BrainCircuit className="w-5 h-5" />
                      <span className="font-semibold">AI Settings</span>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Footer card */}
          <div className="mt-auto p-3">
            <div className="rounded-2xl border border-primary/12 bg-base-100 lg:bg-base-100/80 p-3 lg:backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-9 rounded-full ring-2 ring-primary/25">
                    <img alt="User" src="https://i.pravatar.cc/80?img=12" />
                  </div>
                </div>

                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-base-content">Team member</p>
                  <p className="text-xs text-base-content/60">Helper / Admin</p>
                </div>

                <button className="btn btn-ghost btn-square rounded-xl hover:bg-primary/8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                    <path d="M9 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;
