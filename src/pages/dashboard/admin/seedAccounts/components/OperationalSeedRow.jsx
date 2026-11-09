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
 * Compact operational table row for Verified, Paused, and Archived seeds.
 */
const OperationalSeedRow = ({
  seed,
  onUpdateStatus,
  onDelete,
  onOpenDetails,
  isActing = false,
}) => {
  const followersFormatted = formatFollowerCount(seed.followersCount);

  return (
    <tr className="hover:bg-base-200/30 transition-colors">
      {/* Account Info */}
      <td className="py-3.5 px-6">
        <div className="flex items-center gap-3">
          <SeedAvatar
            src={seed.profilePicUrl}
            alt={seed.username}
            size="sm"
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
      </td>

      {/* Status */}
      <td className="py-3.5 px-4 text-center">
        <SeedStatusBadge status={seed.status} size="sm" />
      </td>

      {/* Source */}
      <td className="py-3.5 px-4 text-center">
        <SeedSourceBadge source={seed.source} size="xs" />
      </td>

      {/* Activity / Scanning / Discovery Info */}
      <td className="py-3.5 px-4 text-xs">
        {seed.status === 'candidate' ? (
          <div className="space-y-1 max-w-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {seed.discoveredFromUsername && (
                <span className="badge badge-ghost badge-xs font-semibold text-primary">
                  From @{seed.discoveredFromUsername}
                </span>
              )}
              {typeof seed.pugRelevance === 'number' && (
                <span className="badge badge-warning badge-xs font-semibold text-white">
                  {seed.pugRelevance}% Pug
                </span>
              )}
              {(seed.discoveryCount || 1) > 1 && (
                <span className="badge badge-primary/10 text-primary border-primary/20 badge-xs font-bold">
                  Seen {seed.discoveryCount}x
                </span>
              )}
            </div>
            {seed.biography && (
              <p className="text-base-content/70 italic truncate text-[11px]" title={seed.biography}>
                "{seed.biography}"
              </p>
            )}
          </div>
        ) : seed.verifiedAt ? (
          <div className="space-y-0.5">
            <div className="text-base-content/80 font-medium">
              Verified {formatDate(seed.verifiedAt)}
            </div>
            {seed.lastScannedAt && (
              <div className="text-[10px] text-base-content/40">
                Scanned {formatDate(seed.lastScannedAt)}
              </div>
            )}
          </div>
        ) : seed.discoveredFromUsername ? (
          <div className="text-base-content/60">
            From @{seed.discoveredFromUsername}
          </div>
        ) : (
          <span className="text-base-content/40">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-6 text-right">
        <div className="flex items-center justify-end">
          <SeedActionButtons
            seed={seed}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            onOpenDetails={onOpenDetails}
            isActing={isActing}
            layout="compact"
          />
        </div>
      </td>
    </tr>
  );
};

export default OperationalSeedRow;
