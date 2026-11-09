import React from 'react';
import { ExternalLink } from 'lucide-react';
import SeedAvatar from './SeedAvatar';
import { SeedStatusBadge, SeedSourceBadge } from './SeedStatusBadge';
import SeedActionButtons from './SeedActionButtons';

/**
 * Compact follower count formatter (e.g. 42.5K).
 */
const formatFollowerCount = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return null;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
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
  });
};

/**
 * Mobile-friendly stacked card for operational seeds (Verified, Paused, Archived).
 * Prevents forced horizontal table scrolling on small screens.
 */
const OperationalSeedCard = ({
  seed,
  onUpdateStatus,
  onDelete,
  onOpenDetails,
  isActing = false,
}) => {
  const followersFormatted = formatFollowerCount(seed.followersCount);

  return (
    <div className="card bg-base-100 border border-base-200 shadow-xs rounded-2xl p-4 space-y-3">
      {/* Top Row: Avatar + Username + Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <SeedAvatar
            src={seed.profilePicUrl}
            alt={seed.username}
            size="md"
          />
          <div className="min-w-0">
            <div className="font-bold text-sm text-base-content flex items-center gap-1.5 truncate">
              @{seed.username}
              {followersFormatted && (
                <span className="text-[11px] font-normal text-base-content/50 whitespace-nowrap">
                  ({followersFormatted})
                </span>
              )}
            </div>
            <a
              href={seed.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary/70 hover:text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              View profile <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <SeedStatusBadge status={seed.status} size="xs" />
          <SeedSourceBadge source={seed.source} size="xs" />
        </div>
      </div>

      {/* Date / Lineage Information */}
      <div className="text-xs text-base-content/60 flex items-center justify-between gap-2 border-t border-base-200/60 pt-2">
        {seed.verifiedAt ? (
          <span>Verified: {formatDate(seed.verifiedAt)}</span>
        ) : seed.discoveredFromUsername ? (
          <span>From @{seed.discoveredFromUsername}</span>
        ) : (
          <span>—</span>
        )}

        {seed.lastScannedAt && (
          <span className="text-[11px] text-base-content/40">
            Scanned: {formatDate(seed.lastScannedAt)}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-base-200/60 pt-2">
        <SeedActionButtons
          seed={seed}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onOpenDetails={onOpenDetails}
          isActing={isActing}
          layout="compact"
        />
      </div>
    </div>
  );
};

export default OperationalSeedCard;
