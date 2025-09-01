import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { cn } from '../../lib/utils';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const DefaultEmptyComponent = () => (
  <div className="flex items-center justify-center py-8 text-gray-400">
    <p>No items to display</p>
  </div>
);

function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  loading = false,
  loadingComponent = <DefaultLoadingComponent />,
  emptyComponent = <DefaultEmptyComponent />
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    if (loading || items.length === 0) {
      return {
        visibleItems: [],
        totalHeight: 0,
        offsetY: 0
      };
    }

    const itemCount = items.length;
    const containerItemCount = Math.ceil(containerHeight / itemHeight);
    
    // Calculate visible range with overscan
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      startIndex + containerItemCount + overscan * 2
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i]
      });
    }

    return {
      visibleItems,
      totalHeight: itemCount * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan, loading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  };

  // Scroll to top when items change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height: containerHeight }}>
        {loadingComponent}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800',
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(VirtualScrollList) as <T>(
  props: VirtualScrollListProps<T>
) => React.ReactElement;

// Hook for easier usage with dynamic item heights
export const useVirtualScroll = <T,>({
  items,
  estimatedItemHeight = 50,
  containerHeight,
  getItemHeight
}: {
  items: T[];
  estimatedItemHeight?: number;
  containerHeight: number;
  getItemHeight?: (item: T, index: number) => number;
}) => {
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate cumulative heights for variable item heights
  const cumulativeHeights = useMemo(() => {
    const heights = [0];
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight ? getItemHeight(items[i], i) : estimatedItemHeight;
      heights.push(heights[i] + height);
    }
    return heights;
  }, [items, estimatedItemHeight, getItemHeight]);

  const getVisibleRange = () => {
    const startIndex = cumulativeHeights.findIndex(height => height > scrollTop) - 1;
    const endIndex = cumulativeHeights.findIndex(height => height > scrollTop + containerHeight);
    
    return {
      startIndex: Math.max(0, startIndex),
      endIndex: endIndex === -1 ? items.length - 1 : Math.min(items.length - 1, endIndex)
    };
  };

  return {
    visibleRange: getVisibleRange(),
    totalHeight: cumulativeHeights[cumulativeHeights.length - 1],
    scrollTop,
    setScrollTop,
    cumulativeHeights
  };
};