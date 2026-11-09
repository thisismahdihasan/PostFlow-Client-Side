import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'check-email', 'pending-approval', 'forgot-password'];

const AccountModal = ({ modalRef, mode, account }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    driveFolderName: '',
    platform: 'instagram',
    isActive: true,
    order: 1,
    dailyPostTarget: '',
    leadFinderEnabled: false,
    leadFinderDailyTarget: 20,
    leadFinderBatchSize: 10,
    leadFinderInterval: 180,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && account) {
      setFormData({
        displayName: account.displayName || '',
        slug: account.slug || '',
        driveFolderName: account.driveFolderName || '',
        platform: account.platform || 'instagram',
        isActive: account.isActive ?? true,
        order: account.order || 1,
        dailyPostTarget: account.dailyPostTarget || '',
        leadFinderEnabled: account.leadFinder?.enabled ?? false,
        leadFinderDailyTarget: account.leadFinder?.dailyLeadTarget ?? 20,
        leadFinderBatchSize: account.leadFinder?.releaseBatchSize ?? 10,
        leadFinderInterval: account.leadFinder?.releaseIntervalMinutes ?? 180,
      });
      setSlugManuallyEdited(true);
    } else if (mode === 'add') {
      setFormData({
        displayName: '',
        slug: '',
        driveFolderName: '',
        platform: 'instagram',
        isActive: true,
        order: 1,
        dailyPostTarget: '',
        leadFinderEnabled: false,
        leadFinderDailyTarget: 20,
        leadFinderBatchSize: 10,
        leadFinderInterval: 180,
      });
      setSlugManuallyEdited(false);
    }
  }, [mode, account, modalRef]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (!slugManuallyEdited && mode === 'add') {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, displayName: newName, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({ ...prev, displayName: newName }));
    }
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalSlug = formData.slug.trim().toLowerCase();
    if (RESERVED_SLUGS.includes(finalSlug)) {
      toast.error('This slug is reserved by PostFlow routing. Choose another slug.');
      return;
    }

    const leadTarget = Number(formData.leadFinderDailyTarget);
    const leadBatch = Number(formData.leadFinderBatchSize);
    const leadInterval = Number(formData.leadFinderInterval);

    if (leadTarget > 0 && leadBatch > leadTarget) {
      toast.error('Lead release batch size cannot exceed daily lead target.');
      return;
    }

    setLoading(true);

    const payload = {
      displayName: formData.displayName,
      slug: finalSlug,
      driveFolderName: formData.driveFolderName,
      platform: formData.platform,
      isActive: formData.isActive,
      order: Number(formData.order),
      dailyPostTarget: formData.dailyPostTarget ? Number(formData.dailyPostTarget) : undefined,
      leadFinder: {
        enabled: Boolean(formData.leadFinderEnabled),
        dailyLeadTarget: leadTarget,
        releaseBatchSize: leadBatch,
        releaseIntervalMinutes: leadInterval,
      },
    };

    try {
      if (mode === 'add') {
        await axiosSecure.post('/api/accounts', payload);
        toast.success('Account created successfully');
      } else {
        await axiosSecure.patch(`/api/accounts/${account._id}`, payload);
        toast.success('Account updated successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      modalRef.current?.close();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${mode} account`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={modalRef}
      className="modal modal-bottom sm:modal-middle"
      onCancel={(e) => {
        if (loading) e.preventDefault();
      }}
    >
      <div className="modal-box p-0 w-full max-w-2xl bg-base-100 shadow-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100/95 backdrop-blur z-10">
          <div>
            <h3 className="text-lg font-bold text-base-content tracking-tight">
              {mode === 'add' ? 'Add New Account' : 'Edit Account'}
            </h3>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => !loading && modalRef?.current?.close()}
            className="btn bg-primary/10 btn-sm btn-circle text-primary hover:bg-primary hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-base-200/20 overflow-y-auto flex-1">
          <form id="accountForm" className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Display Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleNameChange}
                  className="input input-bordered w-full rounded-2xl bg-base-100 focus:border-primary/60"
                  placeholder="e.g. Pug Daily"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Slug</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className="input input-bordered w-full rounded-2xl bg-base-100 focus:border-primary/60 font-mono text-sm"
                  placeholder="e.g. pug-daily"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Drive Folder Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.driveFolderName}
                  onChange={(e) => setFormData({ ...formData, driveFolderName: e.target.value })}
                  className="input input-bordered w-full rounded-2xl bg-base-100 focus:border-primary/60"
                  placeholder="e.g. Pug Daily Folder"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Platform</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.platform}
                  className="input input-bordered w-full rounded-2xl bg-base-200/50 cursor-not-allowed opacity-70"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Order</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="input input-bordered w-full rounded-2xl bg-base-100 focus:border-primary/60"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Daily Post Target</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.dailyPostTarget}
                  onChange={(e) => setFormData({ ...formData, dailyPostTarget: e.target.value })}
                  className="input input-bordered w-full rounded-2xl bg-base-100 focus:border-primary/60"
                  placeholder="e.g. 5"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Number of posts PostFlow should prepare for this account each day.
                  </span>
                </label>
              </div>
            </div>

            {/* Lead Finder Section */}
            <div className="border border-base-200 bg-base-100 p-4 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-sm text-base-content block">Lead Finder</span>
                  <span className="text-xs text-base-content/60 block">Configure Instagram lead scraping limits for this account</span>
                </div>
                <label className="cursor-pointer flex items-center gap-3">
                  <span className="label-text font-semibold">Enable Lead Finder</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={formData.leadFinderEnabled}
                    onChange={(e) => setFormData({ ...formData, leadFinderEnabled: e.target.checked })}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-base-200/60">
                <div className="form-control">
                  <label htmlFor="leadFinderDailyTarget" className="label py-1">
                    <span className="label-text text-xs font-semibold">Daily Lead Target</span>
                  </label>
                  <input
                    type="number"
                    id="leadFinderDailyTarget"
                    required
                    step="1"
                    min="0"
                    max="500"
                    value={formData.leadFinderDailyTarget}
                    onChange={(e) => setFormData({ ...formData, leadFinderDailyTarget: e.target.value })}
                    className="input input-bordered input-sm rounded-xl"
                  />
                  <span className="text-[10px] text-base-content/50 mt-0.5">0 = no daily leads</span>
                </div>

                <div className="form-control">
                  <label htmlFor="leadFinderBatchSize" className="label py-1">
                    <span className="label-text text-xs font-semibold">Release Batch Size</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    id="leadFinderBatchSize"
                    required
                    step="1"
                    value={formData.leadFinderBatchSize}
                    onChange={(e) => setFormData({ ...formData, leadFinderBatchSize: e.target.value })}
                    className="input input-bordered input-sm rounded-xl"
                  />
                  <span className="text-[10px] text-base-content/50 mt-0.5">leads per batch</span>
                </div>

                <div className="form-control">
                  <label htmlFor="leadFinderInterval" className="label py-1">
                    <span className="label-text text-xs font-semibold">Release Interval</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="1440"
                    id="leadFinderInterval"
                    required
                    step="1"
                    value={formData.leadFinderInterval}
                    onChange={(e) => setFormData({ ...formData, leadFinderInterval: e.target.value })}
                    className="input input-bordered input-sm rounded-xl"
                  />
                  <span className="text-[10px] text-base-content/50 mt-0.5">in minutes</span>
                </div>
              </div>
            </div>

            <div className="form-control mt-2">
              <label className="cursor-pointer flex items-center gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="label-text font-semibold">Account is Active</span>
              </label>
              <p className="text-xs text-base-content/50 mt-1 ml-14">
                Inactive accounts are hidden from Create Post and Hashtag Manager, but their historical posts remain safe.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-none flex items-center justify-end gap-3 px-6 py-4 bg-base-100 border-t border-base-200">
          <button
            type="button"
            disabled={loading}
            className="btn btn-ghost rounded-xl border border-base-200 bg-base-100/60 disabled:opacity-50"
            onClick={() => !loading && modalRef?.current?.close()}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="accountForm"
            className="btn btn-primary px-6 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : mode === 'add' ? (
              'Add Account'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="modal-backdrop bg-black/30 backdrop-blur-[1px]"></div>
      ) : (
        <form method="dialog" className="modal-backdrop bg-black/30 backdrop-blur-[1px]">
          <button>close</button>
        </form>
      )}
    </dialog>
  );
};

export default AccountModal;
