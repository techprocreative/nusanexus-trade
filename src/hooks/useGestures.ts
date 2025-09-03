import { useGesture } from '@use-gesture/react';
import { useSpring, config as springConfig } from '@react-spring/web';
import { useState, useCallback, useRef } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  onPinch?: (scale: number) => void;
  enableSwipeNavigation?: boolean;
  enablePullToRefresh?: boolean;
  enablePinchZoom?: boolean;
  swipeThreshold?: number;
  velocityThreshold?: number;
  refreshThreshold?: number;
}

interface GestureState {
  isRefreshing: boolean;
  isPinching: boolean;
  currentScale: number;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
}

export const useGestures = (gestureConfig: GestureConfig = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    onPinch,
    enableSwipeNavigation = true,
    enablePullToRefresh = false,
    enablePinchZoom = false,
    swipeThreshold = 100,
    velocityThreshold = 0.5,
    refreshThreshold = 80
  } = gestureConfig;

  const [gestureState, setGestureState] = useState<GestureState>({
    isRefreshing: false,
    isPinching: false,
    currentScale: 1,
    swipeDirection: null
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);

  // Spring animation for pull-to-refresh
  const [refreshSpring, refreshApi] = useSpring(() => ({
    y: 0,
    opacity: 0,
    scale: 0.8,
    config: springConfig.wobbly
  }));

  // Spring animation for pinch zoom
  const [pinchSpring, pinchApi] = useSpring(() => ({
    scale: 1,
    config: springConfig.wobbly
  }));

  // Haptic feedback helper
  const hapticFeedback = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Handle pull-to-refresh
  const handlePullToRefresh = useCallback(async () => {
    if (!onPullToRefresh || gestureState.isRefreshing) return;

    setGestureState(prev => ({ ...prev, isRefreshing: true }));
    hapticFeedback([50, 50, 50]);

    try {
      await onPullToRefresh();
    } finally {
      // Delay to show refresh animation
      refreshTimeoutRef.current = setTimeout(() => {
        setGestureState(prev => ({ ...prev, isRefreshing: false }));
        refreshApi.start({ y: 0, opacity: 0, scale: 0.8 });
      }, 1000);
    }
  }, [onPullToRefresh, gestureState.isRefreshing, hapticFeedback, refreshApi]);

  // Handle swipe gestures
  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (!enableSwipeNavigation) return;

    setGestureState(prev => ({ ...prev, swipeDirection: direction }));
    hapticFeedback(15);

    // Clear direction after animation
    setTimeout(() => {
      setGestureState(prev => ({ ...prev, swipeDirection: null }));
    }, 300);

    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  }, [enableSwipeNavigation, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, hapticFeedback]);

  // Handle double tap
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    if (timeDiff < 300) {
      // Double tap detected
      hapticFeedback([10, 10, 10]);
      
      // Reset pinch zoom if enabled
      if (enablePinchZoom) {
        setGestureState(prev => ({ ...prev, currentScale: 1 }));
        pinchApi.start({ scale: 1 });
      }
    }
    
    lastTapRef.current = now;
  }, [enablePinchZoom, hapticFeedback, pinchApi]);

  // Main gesture handler
  const bind = useGesture({
    onDrag: ({ movement: [mx, my], direction: [xDir, yDir], velocity: [vx, vy], cancel, first, last }) => {
      // Pull to refresh logic
      if (enablePullToRefresh && my > 0 && Math.abs(mx) < 50) {
        const progress = Math.min(my / refreshThreshold, 1);
        
        if (first) {
          refreshApi.start({ opacity: 0.3, scale: 0.8 });
        }
        
        refreshApi.start({ 
          y: Math.min(my * 0.5, refreshThreshold * 0.5),
          opacity: progress * 0.8,
          scale: 0.8 + (progress * 0.2)
        });
        
        if (last) {
          if (my > refreshThreshold) {
            handlePullToRefresh();
          } else {
            refreshApi.start({ y: 0, opacity: 0, scale: 0.8 });
          }
        }
        return;
      }

      // Swipe navigation logic
      if (enableSwipeNavigation) {
        const absX = Math.abs(mx);
        const absY = Math.abs(my);
        const absVx = Math.abs(vx);
        const absVy = Math.abs(vy);
        
        if ((absX > swipeThreshold || absVx > velocityThreshold) && absX > absY) {
          cancel();
          handleSwipe(mx > 0 ? 'right' : 'left');
        } else if ((absY > swipeThreshold || absVy > velocityThreshold) && absY > absX) {
          cancel();
          handleSwipe(my > 0 ? 'down' : 'up');
        }
      }
    },
    
    onPinch: ({ offset: [scale], first, last }) => {
      if (!enablePinchZoom) return;
      
      if (first) {
        setGestureState(prev => ({ ...prev, isPinching: true }));
        hapticFeedback(10);
      }
      
      const clampedScale = Math.max(0.5, Math.min(3, scale));
      setGestureState(prev => ({ ...prev, currentScale: clampedScale }));
      pinchApi.start({ scale: clampedScale });
      onPinch?.(clampedScale);
      
      if (last) {
        setGestureState(prev => ({ ...prev, isPinching: false }));
        hapticFeedback(10);
      }
    }
  }, {
    drag: {
      filterTaps: true,
      threshold: 10
    },
    pinch: {
      scaleBounds: { min: 0.5, max: 3 },
      rubberband: true
    }
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, []);

  return {
    bind,
    gestureState,
    refreshSpring,
    pinchSpring,
    cleanup,
    // Utility functions
    triggerHaptic: hapticFeedback,
    resetPinch: () => {
      setGestureState(prev => ({ ...prev, currentScale: 1 }));
      pinchApi.start({ scale: 1 });
    },
    forceRefresh: handlePullToRefresh
  };
};

// Specialized hooks for common use cases
export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) => {
  return useGestures({
    onSwipeLeft,
    onSwipeRight,
    enableSwipeNavigation: true,
    swipeThreshold: threshold
  });
};

export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  return useGestures({
    onPullToRefresh: onRefresh,
    enablePullToRefresh: true,
    refreshThreshold: 80
  });
};

export const usePinchZoom = (onPinch?: (scale: number) => void) => {
  return useGestures({
    onPinch,
    enablePinchZoom: true
  });
};

export default useGestures;