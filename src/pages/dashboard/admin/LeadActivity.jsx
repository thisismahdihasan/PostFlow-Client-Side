import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import { useMe } from '../../../hooks/useMe';
import useAuth from '../../../hooks/useAuth';
import { useAccounts } from '../../../hooks/useAccounts';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const LeadActivity = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [reportDate, setReportDate] = useState(null);
  const { isAdmin, isLoading: roleLoading, isError: roleError } = useMe();
  const { user } = useAuth();
  const authorized = isAdmin && Boolean(user?.uid) && !roleLoading && !roleError;
  const { accounts, isLoading: accountsLoading, isError: accountsError } = useAccounts(authorized);
  const axiosSecure = useAxiosSecure();
  // Reuse the backend's business date; do not assume the browser or Dhaka timezone.
  const businessDate = useQuery({
    queryKey: ['lead-my-activity', user?.uid],
    enabled: authorized,
    queryFn: async ({ signal }) => {
      const res = await axiosSecure.get('/api/leads/my-activity', { signal });
      return res.data;
    },
  });
  const date = reportDate ?? businessDate.data?.today.date ?? '';
  const account = accounts.find((item) => item.slug === selectedAccount);
  const report = useQuery({
    queryKey: ['lead-activity-summary', user?.uid, selectedAccount, date],
    enabled: authorized && Boolean(account) && isValidDate(date) && !accountsError && !accountsLoading,
    queryFn: async ({ signal }) => {
      const res = await axiosSecure.get('/api/leads/activity-summary', {
        params: { account: selectedAccount, date }, signal,
      });
      return res.data;
    },
  });

  if (roleLoading) return <LoadingState />;
  if (roleError) return <ErrorState message="Failed to load user permissions." />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lead Activity</h1>
        <p className="mt-2 text-sm text-base-content/60">Assignment cohorts and processing activity for an account and business date.</p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:grid-cols-2">
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium">Account</span>
          <select className="select select-bordered w-full rounded-xl" value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)} disabled={accountsLoading || accountsError}>
            <option value="">{accountsLoading ? 'Loading accounts...' : 'Select Account'}</option>
            {accounts.map((item) => <option key={item._id} value={item.slug}>{item.displayName || item.slug}{!item.isActive ? ' (Inactive)' : ''}</option>)}
          </select>
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium">Report date</span>
          <input type="date" className="input input-bordered w-full min-w-0 rounded-xl" value={date} onChange={(event) => setReportDate(event.target.value)} />
        </label>
      </div>
      {businessDate.isError && <ErrorState message="Could not load the default business date. Select a date or retry." onRetry={businessDate.refetch} />}
      {accountsError ? <ErrorState message="Failed to load accounts." /> : accountsLoading ? <LoadingState message="Loading accounts..." /> : !account || !isValidDate(date) ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 text-center text-base-content/60">
          {accounts.length === 0 ? 'No accounts are available.' : 'Select an account and a valid report date to view activity.'}
        </div>
      ) : report.isPending ? <LoadingState message="Loading lead activity..." /> : report.isError ? (
        <ErrorState message={report.error?.response?.data?.message || 'Failed to load lead activity.'} onRetry={report.refetch} />
      ) : (
        <>
          <p className="text-sm text-base-content/60">Report date: {report.data.date} · Business timezone: {report.data.timezone}</p>
          <section aria-labelledby="assignment-summary-title" className="space-y-3">
            <h2 id="assignment-summary-title" className="text-lg font-bold">Assignment Summary</h2>
            <p className="text-sm text-base-content/60">Assignments originally assigned on {report.data.date}, grouped by their current statuses. This is not an end-of-day snapshot or a count of available leads.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {[['Normal Assignments', report.data.assignmentCohort.normal], ['Reserve Assignments', report.data.assignmentCohort.reserve]].map(([label, counts]) => (
                <div key={label} className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <h3 className="font-semibold">{label}</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {['assigned', 'pending', 'followed', 'skipped', 'rejected'].map((metric) => (
                      <div key={metric} className="min-w-0">
                        <dt className="text-xs capitalize text-base-content/60">{metric}</dt>
                        <dd className="mt-1 break-words text-xl font-semibold tabular-nums">{counts[metric]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <p className="text-xs text-base-content/60">Reserve assignments are stored but are not actionable worker leads. Automatic promotion is not implemented.</p>
          </section>
          <section aria-labelledby="processing-activity-title" className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <h2 id="processing-activity-title" className="text-lg font-bold">Processing Activity</h2>
            <p className="mt-1 text-sm text-base-content/60">Actions performed on {report.data.date}, regardless of the original assignment date. Completed means followed plus skipped.</p>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              {['followed', 'skipped', 'completed'].map((metric) => (
                <div key={metric} className="min-w-0">
                  <dt className="text-xs capitalize text-base-content/60">{metric}</dt>
                  <dd className="mt-1 break-words text-2xl font-semibold tabular-nums">{report.data.processingActivity[metric]}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}
    </div>
  );
};

export default LeadActivity;
