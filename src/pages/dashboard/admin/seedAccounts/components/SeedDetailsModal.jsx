import React from 'react';
import {
  X,
  ExternalLink,
  Users,
  Compass,
  Calendar,
  Sparkles,
  Layers,
  History,
} from 'lucide-react';
import SeedAvatar from './SeedAvatar';
import { SeedStatusBadge, SeedSourceBadge } from './SeedStatusBadge';
import SeedActionButtons from './SeedActionButtons';

/**
 * Format numbers cleanly (e.g., 42,500).
 */
const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return null;
  return num.toLocaleString();
};

/**
 * Format dates safely.
 */
const formatDate = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Centered DaisyUI Modal to inspect full biography, discovery lineage, and evidence.
 */
const SeedDetailsModal = ({
  seed,
  onClose,
  onUpdateStatus,
  onDelete,
  isActing = false,
}) => {
  if (!seed) return null;

  const handleModalAction = (id, status, enabled, msg) => {
    onUpdateStatus(id, status, enabled, msg);
    onClose();
  };

  const handleDeleteAction = (seedItem) => {
    onDelete(seedItem);
    onClose();
  };

  const hasPugRelevance = typeof seed.pugRelevance === 'number';
  const hasFollowers = typeof seed.followersCount === 'number';
  const hasDiscoverySources = Array.isArray(seed.discoverySources) && seed.discoverySources.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="card bg-base-100 border border-base-200 shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-base-200/80 flex items-start justify-between gap-4 bg-base-200/20">
          <div className="flex items-center gap-4 min-w-0">
            <SeedAvatar
              src={seed.profilePicUrl}
              alt={seed.username}
              size="lg"
              className="ring-2 ring-primary/20"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-base-content truncate">
                  @{seed.username}
                </h2>
                <SeedStatusBadge status={seed.status} size="sm" />
                <SeedSourceBadge source={seed.source} size="xs" />
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-base-content/60 flex-wrap">
                {hasFollowers && (
                  <span className="inline-flex items-center gap-1 font-medium text-base-content/80">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {formatNumber(seed.followersCount)} followers
                  </span>
                )}
                <a
                  href={seed.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  View on Instagram <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Biography */}
          {seed.biography ? (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
                Instagram Biography
              </span>
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-200 text-base-content/90 font-sans whitespace-pre-line text-xs leading-relaxed">
                {seed.biography}
              </div>
            </div>
          ) : null}

          {/* Relevance & Discovery Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pug Relevance */}
            {hasPugRelevance && (
              <div className="p-4 rounded-2xl bg-base-200/40 border border-base-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                  <Sparkles className="w-4 h-4 text-warning" />
                  Pug Relevance Score
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-base-content">
                    {seed.pugRelevance}%
                  </span>
                  <span className="text-xs text-base-content/50">
                    {seed.pugRelevance >= 80 ? 'High pug affinity' : seed.pugRelevance >= 50 ? 'Moderate relevance' : 'Low affinity'}
                  </span>
                </div>
              </div>
            )}

            {/* Discovery Lineage */}
            {(seed.discoveredFromUsername || seed.discoveryCount) && (
              <div className="p-4 rounded-2xl bg-base-200/40 border border-base-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                  <Compass className="w-4 h-4 text-info" />
                  Discovery Lineage
                </div>
                <div className="text-xs text-base-content/80 mt-1 space-y-0.5">
                  {seed.discoveredFromUsername && (
                    <div>
                      Found via:{' '}
                      <span className="font-semibold text-primary">
                        @{seed.discoveredFromUsername}
                      </span>
                    </div>
                  )}
                  {seed.discoveryCount && (
                    <div>
                      Occurrences:{' '}
                      <span className="font-semibold">
                        Seen {seed.discoveryCount} time{seed.discoveryCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Discovery Reason & Signals */}
          {(seed.discoveryReason || (seed.discoverySignals && seed.discoverySignals.length > 0)) && (
            <div className="space-y-2 p-4 rounded-2xl bg-base-200/30 border border-base-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                <Layers className="w-4 h-4 text-primary" />
                Discovery Evidence & Reason
              </div>
              {seed.discoverySignals && seed.discoverySignals.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {seed.discoverySignals.map((sig) => (
                    <span
                      key={sig}
                      className="badge badge-neutral badge-sm text-[11px] font-medium"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              )}
              {seed.discoveryReason && (
                <p className="text-xs text-base-content/70 italic pt-1 leading-relaxed">
                  "{seed.discoveryReason}"
                </p>
              )}
            </div>
          )}

          {/* Discovery Sources History */}
          {hasDiscoverySources && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                <History className="w-4 h-4 text-base-content/50" />
                Discovery Sources Log ({seed.discoverySources.length})
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {seed.discoverySources.map((sourceItem, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-base-200/40 border border-base-200/70 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-base-content">
                        {sourceItem.seedUsername ? `@${sourceItem.seedUsername}` : 'Unknown Seed'}
                        <span className="text-base-content/40 font-normal ml-2">
                          ({sourceItem.signal})
                        </span>
                      </div>
                      {sourceItem.discoveryReason && (
                        <div className="text-[11px] text-base-content/50 truncate max-w-sm">
                          {sourceItem.discoveryReason}
                        </div>
                      )}
                    </div>
                    {sourceItem.discoveredAt && (
                      <div className="text-[10px] text-base-content/40 whitespace-nowrap">
                        {formatDate(sourceItem.discoveredAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-base-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-base-content/50">
            {seed.createdAt && (
              <div>
                <span className="block font-medium text-base-content/70">Created</span>
                {formatDate(seed.createdAt)}
              </div>
            )}
            {seed.firstDiscoveredAt && (
              <div>
                <span className="block font-medium text-base-content/70">First Discovered</span>
                {formatDate(seed.firstDiscoveredAt)}
              </div>
            )}
            {seed.lastDiscoveredAt && (
              <div>
                <span className="block font-medium text-base-content/70">Last Discovered</span>
                {formatDate(seed.lastDiscoveredAt)}
              </div>
            )}
            {seed.verifiedAt && (
              <div>
                <span className="block font-medium text-base-content/70">Verified At</span>
                {formatDate(seed.verifiedAt)}
              </div>
            )}
            {seed.lastScannedAt && (
              <div>
                <span className="block font-medium text-base-content/70">Last Scanned</span>
                {formatDate(seed.lastScannedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 px-6 border-t border-base-200 bg-base-200/30 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm rounded-xl font-medium"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <SeedActionButtons
              seed={seed}
              onUpdateStatus={handleModalAction}
              onDelete={handleDeleteAction}
              isActing={isActing}
              layout="modal"
              showDetailsButton={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedDetailsModal;
