import React, { useState } from 'react';
import { Instagram } from 'lucide-react';

/**
 * Reusable avatar component with fallback to Lucide Instagram icon.
 * Handles missing URLs and image load errors cleanly.
 */
const SeedAvatar = ({ src, alt, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  // Size dimensions mapping
  const sizeClasses = {
    sm: 'w-8 h-8 min-w-8',
    md: 'w-11 h-11 min-w-11',
    lg: 'w-16 h-16 min-w-16',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  if (src && !hasError) {
    return (
      <div className={`relative ${containerSize} rounded-2xl overflow-hidden border border-base-200/80 shadow-xs shrink-0 ${className}`}>
        <img
          src={src}
          alt={alt || 'Instagram profile'}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback icon container
  return (
    <div
      className={`${containerSize} rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-xs shrink-0 ${className}`}
      title={alt}
    >
      <Instagram className={iconSize} />
    </div>
  );
};

export default SeedAvatar;
