import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import MainLayout from '../layouts/MainLayout/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import PrivateRoute from './PrivateRoute';
import AuthOnlyRoute from './AuthOnlyRoute';
import LoadingState from '../components/common/LoadingState';

// Lazy-loaded route components
const Home = lazy(() => import('../pages/public/home/Home'));
const AccountPage = lazy(() => import('../pages/public/account/AccountPage'));
const Signup = lazy(() => import('../components/auth/Signup'));
const Login = lazy(() => import('../components/auth/Login'));
const CheckEmail = lazy(() => import('../pages/public/checkEmail/CheckEmail'));
const PendingApproval = lazy(() => import('../pages/public/pendingApproval/PendingApproval'));
const ForgotPassword = lazy(() => import('../pages/public/forgotPass/ForgotPassword'));

const DashboardHome = lazy(() => import('../pages/dashboard/dashboardHome/DashboardHome'));
const FollowLeads = lazy(() => import('../pages/dashboard/followLeads/FollowLeads'));
const LeadActivity = lazy(() => import('../pages/dashboard/admin/LeadActivity'));
const CreatePost = lazy(() => import('../pages/dashboard/posts/CreatePost'));
const AccessReq = lazy(() => import('../pages/dashboard/admin/AccessReq'));
const AccountHashtagsManager = lazy(() => import('../pages/dashboard/admin/AccountHashtagsManager'));
const AccountManager = lazy(() => import('../pages/dashboard/admin/accountManager/AccountManager'));
const SyncHistory = lazy(() => import('../pages/dashboard/syncHistory/SyncHistory'));
const SyncRunDetails = lazy(() => import('../pages/dashboard/syncHistory/SyncRunDetails'));
const PlatformSettings = lazy(() => import('../pages/dashboard/admin/platformSettings/PlatformSettings'));
const AiSettings = lazy(() => import('../pages/dashboard/admin/aiSettings/AiSettings'));
const SeedAccounts = lazy(() => import('../pages/dashboard/admin/seedAccounts/SeedAccounts'));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: ':accountSlug',
        element: (
          <PrivateRoute>
            <Suspense fallback={<LoadingState fullScreen={true} />}>
              <AccountPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: 'signup',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: 'check-email',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <CheckEmail />
          </Suspense>
        ),
      },
      {
        path: '/pending-approval',
        element: (
          <AuthOnlyRoute>
            <Suspense fallback={<LoadingState fullScreen={true} />}>
              <PendingApproval />
            </Suspense>
          </AuthOnlyRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: 'dashboard',
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <DashboardHome />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/follow-leads',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <FollowLeads />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/lead-activity',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <LeadActivity />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/create-post',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <CreatePost />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/AccessReq',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <AccessReq />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/hashtags-manager',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <AccountHashtagsManager />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/hastags-manager',
        element: <Navigate to="/dashboard/hashtags-manager" replace />,
      },
      {
        path: '/dashboard/account-manager',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <AccountManager />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/sync-history',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <SyncHistory />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/sync-history/:syncId',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <SyncRunDetails />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/seed-accounts',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <SeedAccounts />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/settings/platform',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <PlatformSettings />
          </Suspense>
        ),
      },
      {
        path: '/dashboard/settings/ai',
        element: (
          <Suspense fallback={<LoadingState fullScreen={true} />}>
            <AiSettings />
          </Suspense>
        ),
      },
    ],
  },
]);
