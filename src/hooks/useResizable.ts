import { useState, useEffect, useCallback } from 'react';

interface UseResizableParams {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (width: number) => void;
}

export const useResizable = ({
  initialWidth,
  minWidth = 200,
  maxWidth = 800,
  onResize
}: UseResizableParams) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

    setWidth(constrainedWidth);
    
    if (onResize) {
      onResize(constrainedWidth);
    }
  }, [isResizing, minWidth, maxWidth, onResize]);

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, onMouseMove, onMouseUp]);

  return {
    width,
    setWidth,
    isResizing,
    startResizing
  };
};