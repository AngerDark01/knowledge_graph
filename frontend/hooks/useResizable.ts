import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  storageKey?: string;
}

export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
  storageKey,
}: UseResizableOptions) => {
  // 从 localStorage 读取保存的宽度
  const getSavedWidth = () => {
    if (!storageKey || typeof window === 'undefined') return initialWidth;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? Number(saved) : initialWidth;
    } catch {
      return initialWidth;
    }
  };

  const [width, setWidth] = useState(getSavedWidth());
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    e.preventDefault();
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.min(Math.max(startWidthRef.current + delta, minWidth), maxWidth);
      setWidth(newWidth);

      // 保存到 localStorage
      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(newWidth));
        } catch (error) {
          console.warn('Failed to save width to localStorage:', error);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, storageKey]);

  return {
    width,
    isResizing,
    handleMouseDown,
  };
};
