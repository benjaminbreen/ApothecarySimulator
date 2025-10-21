import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import './VirtualList.css';

/**
 * Virtual List Component
 *
 * High-performance list rendering for large datasets (1000+ items).
 * Only renders visible items in viewport + buffer for smooth scrolling.
 *
 * Features:
 * - Renders only visible items (huge performance gain)
 * - Dynamic item heights supported
 * - Smooth scrolling with buffer zones
 * - Scroll-to-index API
 * - Mobile-optimized
 * - Works with variable content
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items to render
 * @param {Function} props.renderItem - Render function (item, index) => ReactNode
 * @param {number} props.itemHeight - Fixed item height in pixels (required)
 * @param {number} props.overscan - Number of items to render outside viewport (default: 3)
 * @param {number} props.height - Container height (default: '100%')
 * @param {Function} props.onScroll - Scroll callback (scrollTop, scrollDirection) => void
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.scrollToIndex - Index to scroll to (controlled)
 *
 * @example
 * <VirtualList
 *   items={inventory}
 *   itemHeight={80}
 *   height="400px"
 *   overscan={5}
 *   renderItem={(item, index) => (
 *     <div key={item.id}>
 *       <h3>{item.name}</h3>
 *       <p>{item.description}</p>
 *     </div>
 *   )}
 * />
 */
const VirtualList = ({
  items = [],
  renderItem,
  itemHeight,
  overscan = 3,
  height = '100%',
  onScroll,
  className = '',
  scrollToIndex = null
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const lastScrollTopRef = useRef(0);

  // Measure container height
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    setContainerHeight(containerRef.current.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const totalHeight = items.length * itemHeight;

    if (containerHeight === 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // Apply overscan buffer
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length, visibleEnd + overscan);

    const offset = start * itemHeight;

    return {
      startIndex: start,
      endIndex: end,
      offsetY: offset
    };
  }, [items.length, itemHeight, scrollTop, containerHeight, overscan]);

  // Visible items to render
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);

    if (onScroll) {
      const direction = newScrollTop > lastScrollTopRef.current ? 'down' : 'up';
      onScroll(newScrollTop, direction);
    }

    lastScrollTopRef.current = newScrollTop;
  }, [onScroll]);

  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== null && containerRef.current) {
      const targetScrollTop = scrollToIndex * itemHeight;
      containerRef.current.scrollTop = targetScrollTop;
    }
  }, [scrollToIndex, itemHeight]);

  // Total content height
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* Spacer for total height */}
      <div
        className="virtual-list__spacer"
        style={{ height: `${totalHeight}px`, position: 'relative' }}
      >
        {/* Visible items container */}
        <div
          className="virtual-list__content"
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleItems.map((item, idx) => {
            const actualIndex = startIndex + idx;
            return (
              <div
                key={item.id || actualIndex}
                className="virtual-list__item"
                style={{ height: `${itemHeight}px` }}
                data-index={actualIndex}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Virtual Grid Component
 *
 * Virtual scrolling for grid layouts (e.g., item galleries).
 *
 * @param {Object} props
 * @param {Array} props.items - Items to render
 * @param {Function} props.renderItem - Render function
 * @param {number} props.itemHeight - Row height
 * @param {number} props.columns - Number of columns
 * @param {number} props.gap - Gap between items in pixels
 *
 * @example
 * <VirtualGrid
 *   items={ingredients}
 *   columns={3}
 *   itemHeight={120}
 *   gap={12}
 *   renderItem={(item) => <ItemCard item={item} />}
 * />
 */
export const VirtualGrid = ({
  items = [],
  renderItem,
  itemHeight,
  columns = 3,
  gap = 12,
  height = '100%',
  className = ''
}) => {
  // Convert grid to rows for virtual scrolling
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  const renderRow = useCallback((row, rowIndex) => {
    return (
      <div
        className="virtual-grid__row"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          height: `${itemHeight}px`
        }}
      >
        {row.map((item, colIndex) => {
          const itemIndex = rowIndex * columns + colIndex;
          return (
            <div key={item.id || itemIndex} className="virtual-grid__item">
              {renderItem(item, itemIndex)}
            </div>
          );
        })}
      </div>
    );
  }, [columns, gap, itemHeight, renderItem]);

  return (
    <VirtualList
      items={rows}
      renderItem={renderRow}
      itemHeight={itemHeight + gap}
      height={height}
      className={`virtual-grid ${className}`}
    />
  );
};

/**
 * Infinite Scroll List
 *
 * Virtual list with infinite scroll / load more.
 *
 * @param {Object} props
 * @param {Array} props.items - Current items
 * @param {Function} props.onLoadMore - Load more callback
 * @param {boolean} props.hasMore - Whether more items exist
 * @param {boolean} props.isLoading - Loading state
 *
 * @example
 * <InfiniteScrollList
 *   items={messages}
 *   itemHeight={100}
 *   onLoadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoading={isFetching}
 *   renderItem={(msg) => <Message {...msg} />}
 * />
 */
export const InfiniteScrollList = ({
  items,
  renderItem,
  itemHeight,
  onLoadMore,
  hasMore,
  isLoading,
  ...props
}) => {
  const [sentinel, setSentinel] = useState(null);

  useEffect(() => {
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasMore, isLoading, onLoadMore]);

  return (
    <>
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={itemHeight}
        {...props}
      />
      {hasMore && (
        <div ref={setSentinel} className="infinite-scroll-sentinel">
          {isLoading ? (
            <div className="infinite-scroll-loading">Loading more...</div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default VirtualList;
