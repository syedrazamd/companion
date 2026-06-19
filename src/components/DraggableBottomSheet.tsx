import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DraggableBottomSheetProps {
  children: ReactNode;
  header?: ReactNode;
  snapPoints?: number[]; // percentages from bottom, e.g. [15, 50, 90]
  defaultSnap?: number; // index into snapPoints
  className?: string;
}

export default function DraggableBottomSheet({
  children,
  header,
  snapPoints = [15, 50, 90],
  defaultSnap = 1,
  className,
}: DraggableBottomSheetProps) {
  const [activeSnap, setActiveSnap] = useState(defaultSnap);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const isDraggingRef = useRef(false);

  const currentHeight = snapPoints[activeSnap];

  const getClosestSnap = useCallback(
    (heightPercent: number) => {
      let closest = 0;
      let minDist = Infinity;
      snapPoints.forEach((snap, i) => {
        const dist = Math.abs(snap - heightPercent);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      return closest;
    },
    [snapPoints]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only start drag from the handle area
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;

    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;

    const sheet = sheetRef.current;
    if (sheet) {
      sheet.setPointerCapture(e.pointerId);
      sheet.style.transition = 'none';
    }
  }, [currentHeight]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaY = startYRef.current - e.clientY;
    const viewportHeight = window.innerHeight;
    const deltaPercent = (deltaY / viewportHeight) * 100;
    const newHeight = Math.max(snapPoints[0], Math.min(snapPoints[snapPoints.length - 1], startHeightRef.current + deltaPercent));

    if (sheetRef.current) {
      sheetRef.current.style.height = `${newHeight}%`;
    }
  }, [snapPoints]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    const sheet = sheetRef.current;
    if (!sheet) return;

    sheet.releasePointerCapture(e.pointerId);

    // Find closest snap point
    const currentHeightPercent = parseFloat(sheet.style.height) || currentHeight;
    const closest = getClosestSnap(currentHeightPercent);

    sheet.style.transition = 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
    sheet.style.height = `${snapPoints[closest]}%`;
    setActiveSnap(closest);
  }, [currentHeight, snapPoints, getClosestSnap]);

  const snapTo = useCallback((index: number) => {
    setActiveSnap(index);
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
      sheetRef.current.style.height = `${snapPoints[index]}%`;
    }
  }, [snapPoints]);

  // Toggle between default and max snap
  const toggleSnap = useCallback(() => {
    const next = activeSnap === snapPoints.length - 1 ? defaultSnap : snapPoints.length - 1;
    snapTo(next);
  }, [activeSnap, defaultSnap, snapPoints.length, snapTo]);

  return (
    <div
      ref={sheetRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 bg-canvas-soft rounded-t-3xl border border-hairline-mid border-b-0',
        'shadow-2xl shadow-black/50',
        'flex flex-col overflow-hidden',
        className
      )}
      style={{
        height: `${currentHeight}%`,
        transition: 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Drag Handle */}
      <div
        data-drag-handle
        className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
        onDoubleClick={toggleSnap}
      >
        <div className="w-10 h-1 bg-mute rounded-full mx-auto" data-drag-handle />
      </div>

      {/* Optional Header */}
      {header && (
        <div className="flex-shrink-0 px-5 pb-2">
          {header}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-8">
        {children}
      </div>
    </div>
  );
}