import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMe } from '../../../hooks/useMe';
import { useAccounts } from '../../../hooks/useAccounts';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
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
  const limit = 10;
  const { me, isApproved, isLoading: roleLoading, isError: roleError } = useMe();
  const { accounts, isLoading: accountsLoading, isError: accountsError } = useAccounts(isApproved);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const activeAccounts = accounts.filter((account) => account.isActive && account.platform === 'instagram');
  const account = activeAccounts.find((item) => item.slug === selectedAccount);
  const enabled = isApproved && Boolean(account) && !accountsError;

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
      status, userEmail: me.email, reportingDate,
    });
  };

  if (roleLoading) return <LoadingState />;
  if (roleError) return <ErrorState message="Failed to load user permissions." />;
  if (!isApproved) return <ErrorState message="Approved access is required to follow leads." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Follow Leads</h1>
          <p className="mt-1 text-sm text-base-content/60">Process available Instagram leads for your selected account.</p>
        </div>
        <div className="bg-base-100 p-3 rounded-2xl border border-base-200 shadow-sm">
          <select
            aria-label="Select Account"
            className="select select-bordered rounded-xl w-full sm:min-w-[200px] font-semibold"
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
          <div className="bg-base-100 rounded-2xl p-5 border border-base-200 space-y-2">
            <h2 className="font-bold text-lg">{account.displayName || account.slug}</h2>
            <p>Available now: <strong>{visible.isPending || visible.isError ? '—' : pagination.totalCount}</strong></p>
            <p>Today's assigned: <strong>{quota.isPending || quota.isError ? '—' : quota.data.totalAssignedCount}</strong></p>
            {quota.isError && <ErrorState message="Failed to load today's assigned count." onRetry={quota.refetch} />}
          </div>
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
            <div className="space-y-4">
              {leads.map((lead) => {
                const username = typeof lead.candidateUsername === 'string' ? lead.candidateUsername : '';
                const hasProfile = /^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/.test(username);
                const imageUrl = getImageUrl(lead.profilePicUrl);
                return (
                  <div key={lead._id} className="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <SeedAvatar key={imageUrl || 'fallback'} src={imageUrl} alt={hasProfile ? `@${username}` : 'Instagram profile'} />
                      <h2 className="text-xl sm:text-2xl font-bold break-all">{hasProfile ? `@${username}` : 'Profile unavailable'}</h2>
                    </div>
                    {hasProfile ? (
                      <a className="btn btn-outline rounded-xl" href={`https://instagram.com/${username}/`} target="_blank" rel="noopener noreferrer">
                        Open Instagram <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <div className="space-y-2">
                        <button className="btn btn-outline rounded-xl" disabled>Open Instagram</button>
                        <p className="text-sm text-base-content/60">This lead does not have a usable Instagram username.</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button className="btn btn-primary rounded-xl" disabled={mutation.isPending} onClick={() => processLead(lead, 'followed')}>Mark Followed</button>
                      <button className="btn btn-ghost border border-base-200 rounded-xl" disabled={mutation.isPending} onClick={() => processLead(lead, 'skipped')}>Skip</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!visible.isPending && !visible.isError && !pageOutOfRange && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-base-200 bg-base-100 px-4 py-3">
              <div className="join">
                <button className="join-item btn btn-sm" disabled={page === 1 || visible.isFetching || mutation.isPending} onClick={() => setPage((current) => current - 1)}>Previous</button>
                <span className="join-item btn btn-sm cursor-default">Page {page} of {pagination.totalPages}</span>
                <button className="join-item btn btn-sm" disabled={page >= pagination.totalPages || visible.isFetching || mutation.isPending} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowLeads;
