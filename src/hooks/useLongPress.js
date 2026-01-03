import { useRef, useEffect } from "react";

/**
 * Hook to detect long-press (hold) gestures on touch devices
 * @param {Function} onLongPress - Callback function triggered on long-press
 * @param {number} duration - Duration in milliseconds before triggering (default: 500ms)
 * @returns {Object} Event handlers to attach to element
 */
export const useLongPress = (onLongPress, duration = 500) => {
  const touchStartRef = useRef(null);
  const touchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0];
    touchTimeoutRef.current = setTimeout(() => {
      if (onLongPress) {
        // Convert touch event to a context menu-like event
        const touch = touchStartRef.current;
        onLongPress({
          preventDefault: () => e.preventDefault(),
          clientX: touch.clientX,
          pageX: touch.pageX,
          clientY: touch.clientY,
          pageY: touch.pageY,
        });
      }
    }, duration);
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  };

  const handleTouchMove = () => {
    // Cancel long-press if user moves their finger
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
};
