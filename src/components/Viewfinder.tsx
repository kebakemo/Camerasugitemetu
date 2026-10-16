import React, { useState, useEffect, useRef } from 'react';
import { CameraOff, RefreshCw } from 'lucide-react';
import { AspectRatioType, GridType, FilterPreset } from '../types/camera';

interface ViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  onRestart: () => void;
  aspectRatio: AspectRatioType;
  filter: FilterPreset;
  brightness: number;
  contrast: number;
  zoomLevel: number;
  grid: GridType;
  facingMode: 'user' | 'environment';
  autoMirror: boolean;
  isFlashing: boolean;
  countdown: number | null;
  burstProgress: { current: number; total: number } | null;
  onOpenTroubleshoot: () => void;
  onLoadedMetadata: () => void;
  onPreviewRatioChange?: (ratio: number) => void;
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  videoRef,
  isStreaming,
  error,
  onRestart,
  aspectRatio,
  filter,
  brightness,
  contrast,
  zoomLevel,
  grid,
  facingMode,
  autoMirror,
  isFlashing,
  countdown,
  burstProgress,
  onOpenTroubleshoot,
  onLoadedMetadata,
  onPreviewRatioChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [ratioToast, setRatioToast] = useState<string | null>(null);
  const prevRatioRef = useRef<AspectRatioType>(aspectRatio);

  // Monitor available container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(el);

    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Compute live orientation and aspect ratio target
  const isPortrait = containerSize.width > 0 && containerSize.height > 0
    ? containerSize.height > containerSize.width
    : typeof window !== 'undefined'
    ? window.innerHeight > window.innerWidth
    : true;

  let targetRatio: number;
  let ratioLabel = '';

  if (aspectRatio === '1:1') {
    targetRatio = 1.0;
    ratioLabel = '1:1';
  } else if (aspectRatio === '4:3') {
    targetRatio = isPortrait ? 3 / 4 : 4 / 3;
    ratioLabel = isPortrait ? '3:4' : '4:3';
  } else if (aspectRatio === '16:9') {
    targetRatio = isPortrait ? 9 / 16 : 16 / 9;
    ratioLabel = isPortrait ? '9:16' : '16:9';
  } else {
    targetRatio = containerSize.width > 0 && containerSize.height > 0
      ? containerSize.width / containerSize.height
      : 1;
    ratioLabel = 'FULL';
  }

  // Notify parent of the exact preview aspect ratio for capture
  useEffect(() => {
    if (onPreviewRatioChange && targetRatio > 0) {
      onPreviewRatioChange(targetRatio);
    }
  }, [targetRatio, onPreviewRatioChange]);

  // Toast indicator when aspect ratio changes
  useEffect(() => {
    if (prevRatioRef.current !== aspectRatio) {
      prevRatioRef.current = aspectRatio;
      setRatioToast(ratioLabel);
      const timer = setTimeout(() => setRatioToast(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [aspectRatio, ratioLabel]);

  // Calculate pixel-exact bounding box to fit 100% inside container without any overflow
  let boxWidth = containerSize.width || 360;
  let boxHeight = containerSize.height || 480;

  if (containerSize.width > 0 && containerSize.height > 0) {
    if (aspectRatio === 'full') {
      boxWidth = containerSize.width;
      boxHeight = containerSize.height;
    } else {
      const containerRatio = containerSize.width / containerSize.height;
      if (containerRatio > targetRatio) {
        boxHeight = containerSize.height;
        boxWidth = Math.round(boxHeight * targetRatio);
      } else {
        boxWidth = containerSize.width;
        boxHeight = Math.round(boxWidth / targetRatio);
      }
    }
  }

  // Compute CSS filter string
  const brightnessMultiplier = 1 + brightness / 100;
  const contrastMultiplier = 1 + contrast / 100;
  const filterString = `brightness(${brightnessMultiplier}) contrast(${contrastMultiplier}) ${
    filter.css !== 'none' ? filter.css : ''
  }`.trim();

  // Handle tap on viewfinder for camera focus reticle
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => {
      setFocusPoint(null);
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black select-none p-0"
    >
      {/* Precision Framing Box */}
      <div
        onClick={handleTap}
        style={{
          width: containerSize.width > 0 ? `${boxWidth}px` : '100%',
          height: containerSize.height > 0 ? `${boxHeight}px` : '100%',
          transition: 'width 0.2s ease-out, height 0.2s ease-out',
        }}
        className="relative flex items-center justify-center overflow-hidden bg-black"
      >
        {/* Live Video Stream */}
        <video
          ref={videoRef}
          onLoadedMetadata={onLoadedMetadata}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-cover transition-transform duration-100 ease-out will-change-transform"
          style={{
            filter: filterString,
            transform: `scale(${zoomLevel}) ${facingMode === 'user' && autoMirror ? 'scaleX(-1)' : ''}`,
            transformOrigin: 'center center',
          }}
        />

        {/* Minimal Corner Frame Markers */}
        {aspectRatio !== 'full' && (
          <div className="absolute inset-2.5 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/40" />
          </div>
        )}

        {/* Shutter Visual Flash Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white animate-flash z-30 pointer-events-none" />
        )}

        {/* Autofocus Box Reticle */}
        {focusPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
            style={{ left: focusPoint.x, top: focusPoint.y }}
          >
            <div className="w-14 h-14 border border-amber-300 relative flex items-center justify-center">
              <div className="w-1 h-1 bg-amber-300" />
            </div>
          </div>
        )}

        {/* Grid Lines */}
        {grid === '3x3' && (
          <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>
        )}

        {grid === 'crosshair' && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-[1px] bg-white/15 absolute top-1/2 -translate-y-1/2" />
            <div className="h-full w-[1px] bg-white/15 absolute left-1/2 -translate-x-1/2" />
            <div className="w-8 h-8 border border-white/30 rounded-full" />
          </div>
        )}

        {grid === 'golden' && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-[38.2%] left-0 right-0 h-[1px] bg-white/20" />
            <div className="absolute top-[61.8%] left-0 right-0 h-[1px] bg-white/20" />
            <div className="absolute left-[38.2%] top-0 bottom-0 w-[1px] bg-white/20" />
            <div className="absolute left-[61.8%] top-0 bottom-0 w-[1px] bg-white/20" />
          </div>
        )}

        {/* Quiet Ratio Indicator Banner */}
        {ratioToast && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-25 px-2.5 py-1 rounded bg-black/80 border border-zinc-800 text-white font-mono text-xs tracking-wider">
            {ratioToast}
          </div>
        )}

        {/* Clean Timer Countdown (No cheesy glowing drop-shadows) */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 pointer-events-none">
            <span className="font-mono text-8xl font-light text-white tracking-tighter">
              {countdown}
            </span>
          </div>
        )}

        {/* Minimal Burst Mode Counter */}
        {burstProgress && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1 rounded bg-black/80 border border-zinc-800 flex items-center gap-1.5 font-mono text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>BURST {burstProgress.current}/{burstProgress.total}</span>
          </div>
        )}

        {/* Active Profile Tag (Understated) */}
        {filter.id !== 'normal' && (
          <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-black/70 border border-zinc-800 text-[10px] font-mono text-zinc-300">
            {filter.code} · {filter.name}
          </div>
        )}

        {/* Active Zoom Tag */}
        {zoomLevel > 1 && (
          <div className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 rounded bg-black/70 border border-zinc-800 text-[10px] font-mono text-zinc-300">
            {zoomLevel.toFixed(1)}×
          </div>
        )}

        {/* Offline / Error / Permission Denied State */}
        {(!isStreaming || error) && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black text-center">
            {error ? (
              <div className="max-w-xs space-y-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <CameraOff className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-zinc-200">
                    カメラを使用できません
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {error}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={onRestart}
                    className="px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-black text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    再試行
                  </button>
                  <button
                    onClick={onOpenTroubleshoot}
                    className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition-colors cursor-pointer"
                  >
                    設定案内
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto text-zinc-500 animate-spin flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  INITIALIZING SENSOR...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
