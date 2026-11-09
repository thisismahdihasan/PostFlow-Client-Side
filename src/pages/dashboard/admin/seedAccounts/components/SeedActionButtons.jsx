import React from 'react';
import {
  Check,
  X,
  Pause,
  Play,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
} from 'lucide-react';

/**
 * Reusable action buttons for Seed Accounts based on status.
 * Unifies action handling and avoids duplicating mutation triggers.
 */
const SeedActionButtons = ({
  seed,
  onUpdateStatus,
  onDelete,
  onOpenDetails,
  isActing = false,
  layout = 'compact', // 'compact' | 'card' | 'modal'
  showDetailsButton = true,
  className = '',
}) => {
  if (!seed) return null;

  const isCandidate = seed.status === 'candidate';
  const isVerified = seed.status === 'verified';
  const isPaused = seed.status === 'paused';
  const isArchived = seed.status === 'archived';

  const btnBaseClass = layout === 'card' || layout === 'modal' ? 'btn-sm' : 'btn-xs';

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* Candidate Actions: Approve + Reject */}
      {isCandidate && (
        <>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'verified',
                true,
                `Candidate @${seed.username} approved as verified seed!`
              )
            }
            disabled={isActing}
            className={`btn btn-success ${btnBaseClass} text-white rounded-xl gap-1.5 font-semibold shadow-xs transition-transform active:scale-95`}
            title="Approve candidate into verified seed pool"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            Approve
          </button>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'archived',
                false,
                `Candidate @${seed.username} rejected/archived.`
              )
            }
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-error hover:bg-error/10 rounded-xl gap-1 font-semibold transition`}
            title="Reject and archive candidate"
          >
            <X className="w-3.5 h-3.5 shrink-0" />
            Reject
          </button>
        </>
      )}

      {/* Verified Actions: Pause + Archive */}
      {isVerified && (
        <>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'paused',
                false,
                `Seed account @${seed.username} paused.`
              )
            }
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-warning hover:bg-warning/10 rounded-xl gap-1 font-semibold transition`}
            title="Pause seed account"
          >
            <Pause className="w-3.5 h-3.5 shrink-0" />
            Pause
          </button>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'archived',
                false,
                `Seed account @${seed.username} archived.`
              )
            }
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-error hover:bg-error/10 rounded-xl gap-1 font-semibold transition`}
            title="Archive seed account"
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            Archive
          </button>
        </>
      )}

      {/* Paused Actions: Resume + Archive */}
      {isPaused && (
        <>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'verified',
                true,
                `Seed account @${seed.username} resumed to verified.`
              )
            }
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-success hover:bg-success/10 rounded-xl gap-1 font-semibold transition`}
            title="Resume seed account"
          >
            <Play className="w-3.5 h-3.5 shrink-0" />
            Resume
          </button>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'archived',
                false,
                `Seed account @${seed.username} archived.`
              )
            }
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-error hover:bg-error/10 rounded-xl gap-1 font-semibold transition`}
            title="Archive seed account"
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            Archive
          </button>
        </>
      )}

      {/* Archived Actions: Restore + Permanent Delete */}
      {isArchived && (
        <>
          <button
            onClick={() =>
              onUpdateStatus(
                seed._id,
                'verified',
                true,
                `Seed account @${seed.username} restored to verified.`
              )
            }
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-primary hover:bg-primary/10 rounded-xl gap-1 font-semibold transition`}
            title="Restore seed account to verified"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            Restore
          </button>
          <button
            onClick={() => onDelete(seed)}
            disabled={isActing}
            className={`btn btn-ghost ${btnBaseClass} text-error hover:bg-error/10 rounded-xl gap-1 font-semibold transition`}
            title="Permanently delete archived seed"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Delete
          </button>
        </>
      )}

      {/* Details View Trigger Button */}
      {showDetailsButton && onOpenDetails && (
        <button
          onClick={() => onOpenDetails(seed)}
          className={`btn btn-ghost ${btnBaseClass} rounded-xl text-base-content/60 hover:text-base-content hover:bg-base-200 gap-1 font-medium transition`}
          title="View full account & discovery details"
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          {layout === 'card' ? 'Details' : ''}
        </button>
      )}
    </div>
  );
};

export default SeedActionButtons;
