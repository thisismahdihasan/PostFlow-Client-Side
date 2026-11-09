import React from 'react';
import {
  CheckCircle2,
  Compass,
  PauseCircle,
  Archive as ArchiveIcon,
} from 'lucide-react';

/**
 * Status and Source badge component with consistent styling and icons.
 */
export const SeedStatusBadge = ({ status, size = 'sm', className = '' }) => {
  const badgeSizeClass = size === 'xs' ? 'badge-xs text-[10px]' : 'badge-sm text-xs';

  if (status === 'verified') {
    return (
      <span className={`badge badge-success ${badgeSizeClass} font-semibold gap-1 text-white shadow-xs ${className}`}>
        <CheckCircle2 className="w-3 h-3 shrink-0" /> Verified
      </span>
    );
  }

  if (status === 'candidate') {
    return (
      <span className={`badge badge-info ${badgeSizeClass} font-semibold gap-1 text-white shadow-xs ${className}`}>
        <Compass className="w-3 h-3 shrink-0" /> Candidate
      </span>
    );
  }

  if (status === 'paused') {
    return (
      <span className={`badge badge-warning ${badgeSizeClass} font-semibold gap-1 text-white shadow-xs ${className}`}>
        <PauseCircle className="w-3 h-3 shrink-0" /> Paused
      </span>
    );
  }

  if (status === 'archived') {
    return (
      <span className={`badge badge-ghost ${badgeSizeClass} font-semibold gap-1 text-base-content/60 ${className}`}>
        <ArchiveIcon className="w-3 h-3 shrink-0" /> Archived
      </span>
    );
  }

  return null;
};

export const SeedSourceBadge = ({ source, size = 'xs', className = '' }) => {
  const isAuto = source === 'auto-discovery';
  const badgeSizeClass = size === 'xs' ? 'badge-xs text-[10px]' : 'badge-sm text-xs';

  return (
    <span
      className={`badge font-mono capitalize ${badgeSizeClass} ${
        isAuto ? 'badge-outline badge-primary font-semibold' : 'badge-ghost text-base-content/60'
      } ${className}`}
    >
      {source || 'manual'}
    </span>
  );
};

export default SeedStatusBadge;
