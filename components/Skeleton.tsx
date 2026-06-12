import React from 'react';

const Skeleton: React.FC<{ className?: string; count?: number }> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
          style={{ direction: 'rtl' }}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  </div>
);

export const SkeletonPodcast: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    <Skeleton className="w-full aspect-square" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
  </div>
);

export const SkeletonPost: React.FC = () => (
  <div className="flex items-end gap-2.5 max-w-xl mx-auto mt-4">
    <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
    <div className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
      <Skeleton className="h-3 w-20 rounded mb-3" />
      <Skeleton className="h-4 w-full rounded mb-2" />
      <Skeleton className="h-4 w-3/4 rounded mb-3" />
      <div className="flex gap-4 border-t border-gray-100 pt-2 mt-2">
        <Skeleton className="h-3 w-12 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
    </div>
  </div>
);

export const SkeletonFeed: React.FC = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonPost key={i} />
    ))}
  </div>
);

export default Skeleton;
