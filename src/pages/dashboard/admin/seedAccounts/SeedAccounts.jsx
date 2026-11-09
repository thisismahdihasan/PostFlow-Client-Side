import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import {
  Sprout,
  Plus,
  Search,
  CheckCircle2,
  PauseCircle,
  Archive as ArchiveIcon,
  AlertCircle,
  Instagram,
  Sparkles,
  Compass,
} from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useMe } from '../../../../hooks/useMe';
import LoadingState from '../../../../components/common/LoadingState';
import ErrorState from '../../../../components/common/ErrorState';

import CandidateCard from './components/CandidateCard';
import OperationalSeedRow from './components/OperationalSeedRow';
import OperationalSeedCard from './components/OperationalSeedCard';
import SeedDetailsModal from './components/SeedDetailsModal';

const SeedAccounts = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { isAdmin, isLoading: roleLoading, isError: roleError } = useMe();

  const [inputVal, setInputVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [selectedSeedForDetails, setSelectedSeedForDetails] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lead-seeds', statusFilter, searchVal],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchVal.trim()) params.append('search', searchVal.trim());
      const res = await axiosSecure.get(`/api/lead-seeds?${params.toString()}`);
      return res.data;
    },
    enabled: !!isAdmin,
  });

  if (roleLoading) return <LoadingState />;
  if (roleError) return <ErrorState message="Failed to load user permissions." />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const seeds = data?.seeds || [];
  const totalCount = data?.count || 0;

  // Compute stat counts from current dataset
  const verifiedCount = seeds.filter((s) => s.status === 'verified').length;
  const candidateCount = seeds.filter((s) => s.status === 'candidate').length;
  const pausedCount = seeds.filter((s) => s.status === 'paused').length;
  const archivedCount = seeds.filter((s) => s.status === 'archived').length;

  const handleAddSeed = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      toast.error('Please enter an Instagram username or profile URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosSecure.post('/api/lead-seeds', { input: inputVal.trim() });
      toast.success(`Seed account @${res.data.username} added successfully!`);
      setInputVal('');
      queryClient.invalidateQueries({ queryKey: ['lead-seeds'] });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add seed account.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status, enabled, successMsg) => {
    setActionId(id);
    try {
      await axiosSecure.patch(`/api/lead-seeds/${id}`, { status, enabled });
      toast.success(successMsg || `Seed account updated to ${status}.`);
      queryClient.invalidateQueries({ queryKey: ['lead-seeds'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update seed account.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteSeed = async (seed) => {
    Swal.fire({
      title: 'Permanently delete this seed?',
      text: 'This action cannot be undone. Deleting it removes the rejection/archive record, so if Instagram discovery finds this account again later, it may reappear as a new candidate.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#1F2937',
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionId(seed._id);
        try {
          await axiosSecure.delete(`/api/lead-seeds/${seed._id}`);
          Swal.fire({
            title: 'Deleted!',
            text: `Seed account @${seed.username} has been permanently deleted.`,
            icon: 'success',
            confirmButtonColor: '#2F6BFF',
          });
          queryClient.invalidateQueries({ queryKey: ['lead-seeds'] });
        } catch (deleteError) {
          Swal.fire({
            title: 'Cannot Delete',
            text: deleteError?.response?.data?.message || 'Failed to delete seed account.',
            icon: 'error',
            confirmButtonColor: '#2F6BFF',
          });
        } finally {
          setActionId(null);
        }
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
                Seed Accounts & Discovery
                <span className="badge badge-primary badge-sm font-semibold">C1–C4</span>
              </h1>
              <p className="text-sm text-base-content/60">
                Review discovered candidates and manage verified Instagram source seeds for lead generation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Seed Form Card */}
      <div className="card bg-base-100 border border-base-200 shadow-xs rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-base-content">Add Verified Instagram Seed</h2>
        </div>
        <p className="text-xs text-base-content/60 mb-4">
          Enter an Instagram handle (e.g. <code className="text-primary font-mono font-semibold">@puglover</code>) or a full profile link (e.g. <code className="text-primary font-mono font-semibold">https://instagram.com/puglover</code>).
        </p>

        <form onSubmit={handleAddSeed} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
              <Instagram className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="e.g. @pugsofinstagram or https://instagram.com/pugsofinstagram"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="input input-bordered w-full pl-11 rounded-2xl font-medium bg-base-200/40 focus:bg-base-100 transition"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !inputVal.trim()}
            className="btn btn-primary rounded-2xl px-6 gap-2 shadow-sm font-semibold min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Seed
              </>
            )}
          </button>
        </form>
      </div>

      {/* Stats and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="tabs tabs-boxed bg-base-200/60 p-1.5 rounded-2xl gap-1 overflow-x-auto flex-nowrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`tab rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === 'all' ? 'tab-active font-bold shadow-xs' : ''
            }`}
          >
            All Seeds ({statusFilter === 'all' ? totalCount : seeds.length})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`tab rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === 'verified' ? 'tab-active font-bold shadow-xs text-success' : ''
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setStatusFilter('candidate')}
            className={`tab rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === 'candidate' ? 'tab-active font-bold shadow-xs text-info' : ''
            }`}
          >
            <Compass className="w-3.5 h-3.5 mr-1" />
            Candidates ({candidateCount})
          </button>
          <button
            onClick={() => setStatusFilter('paused')}
            className={`tab rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === 'paused' ? 'tab-active font-bold shadow-xs text-warning' : ''
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5 mr-1" />
            Paused ({pausedCount})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`tab rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === 'archived' ? 'tab-active font-bold shadow-xs text-base-content/50' : ''
            }`}
          >
            <ArchiveIcon className="w-3.5 h-3.5 mr-1" />
            Archived ({archivedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search username..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 rounded-xl bg-base-100"
          />
        </div>
      </div>

      {/* Main Seed List / Review Area */}
      {isLoading ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center text-base-content/60 rounded-3xl shadow-xs">
          <span className="loading loading-spinner loading-md text-primary mb-2"></span>
          <div>Loading seed accounts...</div>
        </div>
      ) : isError ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center text-error rounded-3xl shadow-xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <div>Failed to load seed accounts.</div>
        </div>
      ) : seeds.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center text-base-content/60 space-y-2 rounded-3xl shadow-xs">
          <Sprout className="w-10 h-10 mx-auto text-base-content/30" />
          <div className="font-semibold text-base">No seed accounts found</div>
          <p className="text-xs text-base-content/50 max-w-sm mx-auto">
            {searchVal.trim() || statusFilter !== 'all'
              ? 'No seeds match your current filters.'
              : 'Add verified Instagram seed accounts above or run Discovery to find candidates.'}
          </p>
        </div>
      ) : statusFilter === 'candidate' ? (
        /* Mode 1: Dedicated Candidate Review Queue */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-info badge-sm font-semibold text-white">
                Candidate Review Queue ({seeds.length})
              </span>
              <span className="text-xs text-base-content/50">
                Review discovered profiles and qualify them into your verified seed pool.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {seeds.map((seed) => (
              <CandidateCard
                key={seed._id}
                seed={seed}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteSeed}
                onOpenDetails={(s) => setSelectedSeedForDetails(s)}
                isActing={actionId === seed._id}
              />
            ))}
          </div>
        </div>
      ) : statusFilter !== 'all' ? (
        /* Mode 2: Compact Operational List for Verified / Paused / Archived */
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block card bg-base-100 border border-base-200 shadow-xs rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200/50 text-base-content/70 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6">Account</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center">Source</th>
                    <th className="py-4 px-4">Activity Info</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {seeds.map((seed) => (
                    <OperationalSeedRow
                      key={seed._id}
                      seed={seed}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDeleteSeed}
                      onOpenDetails={(s) => setSelectedSeedForDetails(s)}
                      isActing={actionId === seed._id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden space-y-3">
            {seeds.map((seed) => (
              <OperationalSeedCard
                key={seed._id}
                seed={seed}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteSeed}
                onOpenDetails={(s) => setSelectedSeedForDetails(s)}
                isActing={actionId === seed._id}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Mode 3: All Seeds Tab (Mixed view) */
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block card bg-base-100 border border-base-200 shadow-xs rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200/50 text-base-content/70 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6">Account</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center">Source</th>
                    <th className="py-4 px-4">Discovery / Verified Info</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {seeds.map((seed) => (
                    <OperationalSeedRow
                      key={seed._id}
                      seed={seed}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDeleteSeed}
                      onOpenDetails={(s) => setSelectedSeedForDetails(s)}
                      isActing={actionId === seed._id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden space-y-3">
            {seeds.map((seed) =>
              seed.status === 'candidate' ? (
                <CandidateCard
                  key={seed._id}
                  seed={seed}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteSeed}
                  onOpenDetails={(s) => setSelectedSeedForDetails(s)}
                  isActing={actionId === seed._id}
                />
              ) : (
                <OperationalSeedCard
                  key={seed._id}
                  seed={seed}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteSeed}
                  onOpenDetails={(s) => setSelectedSeedForDetails(s)}
                  isActing={actionId === seed._id}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Details Modal for in-depth inspection */}
      {selectedSeedForDetails && (
        <SeedDetailsModal
          seed={selectedSeedForDetails}
          onClose={() => setSelectedSeedForDetails(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteSeed}
          isActing={actionId === selectedSeedForDetails._id}
        />
      )}
    </div>
  );
};

export default SeedAccounts;
