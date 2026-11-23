import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [canPull, setCanPull] = useState(true);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (!canPull || isRefreshing) return;
    
    const touch = e.touches[0];
    setTouchStart(touch.clientY);
  }, [canPull, isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!canPull || isRefreshing || touchStart === 0) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diff = currentY - touchStart;
    
    // Only allow pull down when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0 && diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5)); // Dampen the pull
    }
  }, [canPull, isRefreshing, touchStart, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    setTouchStart(0);
  }, [canPull, isRefreshing, pullDistance, threshold, onRefresh]);

  // Check if we're at the top of the scrollable area
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setCanPull(containerRef.current.scrollTop === 0);
    }
  }, []);

  // Calculate rotation for the refresh icon
  const rotation = Math.min((pullDistance / threshold) * 360, 360);
  const opacity = Math.min(pullDistance / threshold, 1);
  const scale = 0.8 + Math.min((pullDistance / threshold) * 0.2, 0.2);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none transition-all duration-300 z-20"
        style={{
          transform: `translateY(${pullDistance - 50}px)`,
          opacity: pullDistance > 10 ? opacity : 0
        }}
      >
        <div 
          className={`bg-white rounded-full shadow-lg p-3 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`
          }}
        >
          <RefreshCw 
            size={24} 
            className={`${pullDistance >= threshold ? 'text-purple-600' : 'text-gray-400'} transition-colors`}
          />
        </div>
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: touchStart === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>

      {/* Loading overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-start justify-center pt-20 z-30">
          <div className="bg-white rounded-full shadow-lg p-3 animate-spin">
            <RefreshCw size={24} className="text-purple-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;