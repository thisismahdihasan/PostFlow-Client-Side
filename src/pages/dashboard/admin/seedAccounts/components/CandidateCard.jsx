import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import SeedAvatar from './SeedAvatar';
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
 * Rich candidate review card component.
 * Optimized for rapid admin qualification and decision-making.
 */
const CandidateCard = ({
  seed,
  onUpdateStatus,
  onDelete,
  onOpenDetails,
  isActing = false,
}) => {
  const followersFormatted = formatFollowerCount(seed.followersCount);
  const hasPugRelevance = typeof seed.pugRelevance === 'number';

  // Relevance badge color tier
  const getPugBadgeClass = (score) => {
    if (score >= 80) return 'badge-success text-white font-bold';
    if (score >= 50) return 'badge-warning font-semibold text-white';
    return 'badge-neutral text-base-content/60 font-medium';
  };

  return (
    <div className="card bg-base-100 border border-base-200 border-l-4 border-l-info shadow-xs rounded-2xl p-4 sm:p-5 hover:border-base-300 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Account Identity & Bio */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <SeedAvatar
            src={seed.profilePicUrl}
            alt={seed.username}
            size="md"
            className="mt-0.5"
          />

          <div className="min-w-0 flex-1 space-y-1">
            {/* Username + Followers + Instagram Link */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-base-content truncate">
                @{seed.username}
              </span>

              {followersFormatted && (
                <span className="text-xs text-base-content/60 font-medium whitespace-nowrap">
                  ({followersFormatted} followers)
                </span>
              )}

              {/* Pug Relevance Badge */}
              {hasPugRelevance && (
                <span className={`badge ${getPugBadgeClass(seed.pugRelevance)} badge-xs text-[10px] gap-1 shrink-0`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {seed.pugRelevance}% Pug
                </span>
              )}

              <a
                href={seed.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary transition inline-flex items-center gap-0.5 text-xs ml-auto sm:ml-0"
                title="Open Instagram profile"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Biography Preview */}
            {seed.biography && (
              <p className="text-xs text-base-content/70 italic line-clamp-2 pr-2 leading-relaxed">
                "{seed.biography}"
              </p>
            )}

            {/* Discovery Context & Signals */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
              {seed.discoveredFromUsername && (
                <span className="badge badge-ghost badge-xs font-semibold text-primary">
                  From @{seed.discoveredFromUsername}
                </span>
              )}

              {(seed.discoveryCount || 1) > 1 && (
                <span className="badge badge-primary/10 text-primary border-primary/20 badge-xs font-bold">
                  Seen {seed.discoveryCount}x
                </span>
              )}

              {seed.discoverySignals && seed.discoverySignals.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {seed.discoverySignals.map((sig) => (
                    <span
                      key={sig}
                      className="badge badge-neutral badge-xs text-[10px] font-normal"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              )}

              {seed.discoveryReason && (
                <span
                  className="text-base-content/50 truncate max-w-xs text-[11px] hidden sm:inline"
                  title={seed.discoveryReason}
                >
                  • {seed.discoveryReason}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Decision Action Buttons */}
        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-base-200/50">
          <SeedActionButtons
            seed={seed}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            onOpenDetails={onOpenDetails}
            isActing={isActing}
            layout="card"
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
