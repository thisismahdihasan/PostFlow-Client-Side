import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMe } from '../../../hooks/useMe';
import { useAccounts } from '../../../hooks/useAccounts';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import { getTodayDateBd } from '../../../utils/getTodayDateBd';
import SeedAvatar from '../admin/seedAccounts/components/SeedAvatar';

const getImageUrl = (value) => {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const FollowLeads = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [reportingDate] = useState(getTodayDateBd);
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedRange, setAppliedRange] = useState(null);
  const [rangeError, setRangeError] = useState('');
  const limit = 10;
  const { me, isApproved, isLoading: roleLoading, isError: roleError } = useMe();
  const { user } = useAuth();
  const { accounts, isLoading: accountsLoading, isError: accountsError } = useAccounts(isApproved);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const activeAccounts = accounts.filter((account) => account.isActive && account.platform === 'instagram');
  const account = activeAccounts.find((item) => item.slug === selectedAccount);
  const enabled = isApproved && Boolean(account) && !accountsError;

  const hasAppliedRange = Boolean(user?.uid) && appliedRange?.userUid === user?.uid;
  const activity = useQuery({
    queryKey: ['lead-my-activity-range', user?.uid, appliedRange?.from, appliedRange?.to],
    enabled: isApproved && hasAppliedRange && !roleLoading && !roleError,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const res = await axiosSecure.get('/api/leads/my-activity', {
        params: { from: appliedRange.from, to: appliedRange.to }, signal,
      });
      return res.data;
    },
  });

  const showActivity = (event) => {
    event.preventDefault();
    const validDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    };
    if (!validDate(fromDate) || !validDate(toDate) || fromDate > toDate) {
      setRangeError('Select valid dates with From on or before To.');
      return;
    }
    if (!isApproved || !user?.uid) return;
    setRangeError('');
    if (hasAppliedRange && appliedRange.from === fromDate && appliedRange.to === toDate) {
      activity.refetch();
    } else {
      setAppliedRange({ from: fromDate, to: toDate, userUid: user.uid });
    }
  };

  const visible = useQuery({
    queryKey: ['follow-leads', me?.email, selectedAccount, page, limit],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await axiosSecure.get('/api/leads/visible', {
        params: { account: selectedAccount, page, limit }, signal,
      });
      return res.data;
    },
  });
  const quota = useQuery({
    queryKey: ['lead-quota-summary', me?.email, selectedAccount, reportingDate],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await axiosSecure.get('/api/leads/quota-summary', {
        params: { account: selectedAccount, date: reportingDate }, signal,
      });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ assignmentId, account, date, status }) => {
      const res = await axiosSecure.patch(`/api/leads/${assignmentId}/status`, { account, date, status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'followed' ? 'Lead marked followed' : 'Lead skipped');
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 404 || status === 409) {
        toast.error('This lead is no longer available for this action. Refreshing leads.');
      } else if (status !== 401 && status !== 403) {
        toast.error(error?.response?.data?.message || 'Failed to update lead. Please try again.');
      }
    },
    onSettled: (_, error, variables) => {
      if (error && ![404, 409].includes(error?.response?.status)) return;
      return Promise.all([
        ...(!error ? [queryClient.invalidateQueries({
          queryKey: ['lead-my-activity-range', variables.userUid],
        })] : []),
        queryClient.invalidateQueries({
          queryKey: ['follow-leads', variables.userEmail, variables.account],
        }),
        queryClient.invalidateQueries({
          queryKey: ['lead-quota-summary', variables.userEmail, variables.account, variables.reportingDate], exact: true,
        }),
      ]);
    },
  });

  const leads = visible.data?.leads || [];
  const pagination = visible.data?.pagination;
  const pageOutOfRange = visible.isSuccess && page > Math.max(1, pagination.totalPages);
  // Adjust before rendering an empty out-of-range page as a completed queue.
  if (pageOutOfRange) setPage(Math.max(1, pagination.totalPages));
  const processLead = (lead, status) => {
    if (!lead || mutation.isPending) return;
    mutation.mutate({
      assignmentId: lead._id, account: selectedAccount, date: lead.assignedDate,
      status, userEmail: me.email, userUid: user.uid, reportingDate,
    });
  };

  if (roleLoading) return <LoadingState />;
  if (roleError) return <ErrorState message="Failed to load user permissions." />;
  if (!isApproved) return <ErrorState message="Approved access is required to follow leads." />;

  return (
    <div className="space-y-5 py-2">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight">Follow Leads</h1>
          <p className="mt-3 text-sm sm:text-base text-base-content/60">Process available Instagram leads for your selected account.</p>
        </div>
        <div className="relative w-full sm:w-72 xl:shrink-0">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">
            {(account?.displayName || account?.slug || 'A').charAt(0).toUpperCase()}
          </span>
          <select
            aria-label="Select Account"
            className="select select-bordered h-14 w-full rounded-2xl border-base-300 bg-base-100 pl-14 pr-10 font-semibold focus-visible:outline-primary"
            value={selectedAccount}
            onChange={(event) => {
              setSelectedAccount(event.target.value);
              setPage(1);
            }}
            disabled={accountsLoading || accountsError || activeAccounts.length === 0}
          >
            <option value="">{accountsLoading ? 'Loading accounts...' : 'Select Account'}</option>
            {activeAccounts.map((item) => (
              <option key={item.slug} value={item.slug}>{item.displayName || item.slug}</option>
            ))}
          </select>
        </div>
      </div>

      {accountsError ? <ErrorState message="Failed to load accounts." /> : accountsLoading ? (
        <LoadingState message="Loading accounts..." />
      ) : !account ? (
        <div className="bg-base-100 rounded-3xl p-10 text-center border border-base-200 shadow-sm">
          <h2 className="text-xl font-bold">No account selected</h2>
          <p className="text-base-content/60 mt-2">
            {activeAccounts.length ? 'Select an account to view available leads.' : 'No active Instagram accounts are available.'}
          </p>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr] divide-y sm:divide-y-0 sm:divide-x divide-base-300 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
            <div className="flex min-w-0 flex-col justify-center gap-1 px-5 py-3">
              <dt className="text-sm text-base-content/60">Selected account</dt>
              <dd className="break-words text-xl sm:text-2xl font-bold tracking-tight">{account.displayName || account.slug}</dd>
            </div>
            <div className="min-w-0 px-5 py-3">
              <dt className="text-sm text-base-content/60">Available now</dt>
              <dd className="mt-1 break-words text-4xl sm:text-5xl font-bold tabular-nums tracking-tight text-primary">{visible.isPending || visible.isError ? '—' : pagination.totalCount}</dd>
            </div>
            <div className="min-w-0 px-5 py-3">
              <dt className="text-sm text-base-content/60">Today's assigned</dt>
              <dd className="mt-1 break-words text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">{quota.isPending || quota.isError ? '—' : quota.data.totalAssignedCount}</dd>
            </div>
          </dl>
          {quota.isError && <ErrorState message="Failed to load today's assigned count." onRetry={quota.refetch} />}
          {visible.isPending || pageOutOfRange ? <LoadingState message="Loading leads..." /> : visible.isError ? (
            <ErrorState message="Failed to load available leads." onRetry={visible.refetch} />
          ) : pagination.totalCount === 0 ? (
            <div className="bg-base-100 rounded-3xl p-10 text-center border border-base-200 shadow-sm">
              <h2 className="text-xl font-bold">You're all caught up</h2>
              <p className="text-base-content/60 mt-2">No more released leads are available for this account right now.</p>
            </div>
          ) : leads.length === 0 ? (
            <ErrorState message="The queue changed. Refresh to load available leads." onRetry={visible.refetch} />
          ) : (
            <div className="space-y-2.5">
              {leads.map((lead) => {
                const username = typeof lead.candidateUsername === 'string' ? lead.candidateUsername : '';
                const hasProfile = /^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/.test(username);
                const imageUrl = getImageUrl(lead.profilePicUrl);
                return (
                  <div key={lead._id} className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <SeedAvatar key={imageUrl || 'fallback'} src={imageUrl} size="md" className="!rounded-full [&_img]:!rounded-full" alt={hasProfile ? `@${username}` : 'Instagram profile'} />
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight break-all">{hasProfile ? `@${username}` : 'Profile unavailable'}</h2>
                        <p className="mt-1 flex items-center gap-2 text-sm text-base-content/60"><span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />Ready to follow</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
                      {hasProfile ? (
                        <a className="btn btn-outline min-h-11 rounded-xl border-base-content/20 px-4 text-base-content hover:border-base-content/40 hover:bg-base-200" href={`https://instagram.com/${username}/`} target="_blank" rel="noopener noreferrer">
                          Open Instagram <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <div className="space-y-2">
                          <button className="btn btn-outline min-h-11 rounded-xl" disabled>Open Instagram</button>
                          <p className="text-sm text-base-content/60">This lead does not have a usable Instagram username.</p>
                        </div>
                      )}
                      <button className="btn btn-primary min-h-11 rounded-xl px-4 shadow-lg shadow-primary/20 disabled:shadow-none" disabled={mutation.isPending} onClick={() => processLead(lead, 'followed')}>
                        {mutation.isPending && mutation.variables?.assignmentId === lead._id && mutation.variables?.status === 'followed' && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
                        Mark Followed
                      </button>
                      <button className="btn btn-ghost min-h-11 rounded-xl px-3 text-base-content/60 hover:text-base-content" disabled={mutation.isPending} onClick={() => processLead(lead, 'skipped')}>
                        {mutation.isPending && mutation.variables?.assignmentId === lead._id && mutation.variables?.status === 'skipped' && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
                        Skip
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!visible.isPending && !visible.isError && !pageOutOfRange && pagination.totalPages > 1 && (
            <nav aria-label="Lead queue pagination" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 sm:px-5">
              <button className="btn btn-ghost min-h-11 rounded-xl" disabled={page === 1 || visible.isFetching || mutation.isPending} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <span className="text-sm text-base-content/60">Page {page} of {pagination.totalPages}</span>
              <button className="btn btn-ghost min-h-11 rounded-xl" disabled={page >= pagination.totalPages || visible.isFetching || mutation.isPending} onClick={() => setPage((current) => current + 1)}>Next</button>
            </nav>
          )}
        </>
      )}
      <section aria-labelledby="my-activity-title" className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
        <h2 id="my-activity-title" className="text-lg font-bold">My Activity</h2>
        <p className="mt-1 text-sm text-base-content/60">View your Follow/Skip activity across all accounts.</p>
        <form onSubmit={showActivity} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 basis-40 space-y-1">
            <span className="text-sm">From</span>
            <input type="date" required className="input input-bordered min-w-0 w-full rounded-xl" value={fromDate} onChange={(event) => {
              setFromDate(event.target.value);
              setAppliedRange(null);
              setRangeError('');
            }} />
          </label>
          <label className="min-w-0 flex-1 basis-40 space-y-1">
            <span className="text-sm">To</span>
            <input type="date" required className="input input-bordered min-w-0 w-full rounded-xl" value={toDate} onChange={(event) => {
              setToDate(event.target.value);
              setAppliedRange(null);
              setRangeError('');
            }} />
          </label>
          <button type="submit" className="btn btn-primary rounded-xl" disabled={!fromDate || !toDate || activity.isFetching}>Show Activity</button>
        </form>
        {rangeError && <p role="alert" className="mt-2 text-sm text-error">{rangeError}</p>}
        {hasAppliedRange && (
          <div className="mt-3" aria-live="polite">
            {activity.isFetching || activity.isPending ? (
              <p className="flex items-center gap-2 text-sm text-base-content/60"><span aria-hidden="true" className="loading loading-spinner loading-xs" />Loading activity...</p>
            ) : activity.isError ? (
              <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-error">
                <span>Failed to load your activity.</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => activity.refetch()}>Try Again</button>
              </div>
            ) : (
              <>
                <p className="text-xs text-base-content/60">For selected period: {activity.data.from} to {activity.data.to} (inclusive) · {activity.data.timezone}</p>
                <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
                  <div className="flex items-baseline gap-2"><dt className="text-sm text-base-content/60">Followed</dt><dd className="text-xl font-semibold tabular-nums">{activity.data.followed}</dd></div>
                  <div className="flex items-baseline gap-2"><dt className="text-sm text-base-content/60">Skipped</dt><dd className="text-xl font-semibold tabular-nums">{activity.data.skipped}</dd></div>
                </dl>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default FollowLeads;
