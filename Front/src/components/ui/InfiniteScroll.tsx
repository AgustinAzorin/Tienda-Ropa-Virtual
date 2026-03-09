'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  className?: string;
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading = false,
  className,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || isLoading || !hasMore) return;
        onLoadMore();
      },
      { rootMargin: '180px 0px', threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={sentinelRef} className={className} aria-hidden>
      {isLoading && <div className="skeleton mx-auto h-8 w-40 rounded-[8px]" />}
    </div>
  );
}
