import React from 'react';
import { SwitchCamera, Image as ImageIcon } from 'lucide-react';
import { FilterPreset, FILTER_PRESETS, BurstCount } from '../types/camera';
import { CapturedPhoto } from '../services/db';

interface BottomControlsProps {
  currentFilter: FilterPreset;
  onSelectFilter: (filter: FilterPreset) => void;
  burstCount: BurstCount;
  onBurstCountChange: (count: BurstCount) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onFlipCamera: () => void;
  hasMultipleCameras: boolean;
  onCapture: () => void;
  isCapturing: boolean;
  recentPhoto: CapturedPhoto | null;
  photoCount: number;
  onOpenGallery: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  currentFilter,
  onSelectFilter,
  burstCount,
  onBurstCountChange,
  zoomLevel,
  onZoomChange,
  onFlipCamera,
  hasMultipleCameras,
  onCapture,
  isCapturing,
  recentPhoto,
  photoCount,
  onOpenGallery,
}) => {
  const nextBurst = (): BurstCount => {
    switch (burstCount) {
      case 1:
        return 3;
      case 3:
        return 5;
      case 5:
        return 10;
      default:
        return 1;
    }
  };

  return (
    <footer className="relative z-20 flex flex-col items-center bg-black border-t border-zinc-900 pt-3 pb-7 px-4 select-none">
      {/* Focal Magnification Scale */}
      <div className="flex items-center gap-1.5 mb-3 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
        {[1, 2, 3, 5].map((z) => (
          <button
            key={z}
            onClick={() => onZoomChange(z)}
            className={`w-7 h-6 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center ${
              Math.abs(zoomLevel - z) < 0.1
                ? 'bg-zinc-200 text-black font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {z}×
          </button>
        ))}
      </div>

      {/* Film Profile Dial (Camera style) */}
      <div className="w-full max-w-md overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1 px-1 mb-4">
        {FILTER_PRESETS.map((f) => {
          const isSelected = currentFilter.id === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f)}
              className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-zinc-100 text-black border-white font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              <span>{f.code}</span>
              <span className="ml-1 text-[10px] opacity-70 font-sans">{f.name}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Deck: Gallery, Shutter Release, Lens Switch */}
      <div className="w-full max-w-sm flex items-center justify-between px-6">
        {/* Gallery / Recent Frame Thumbnail */}
        <div className="relative">
          <button
            onClick={onOpenGallery}
            className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 overflow-hidden flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-sm group"
            title="撮影フィルム一覧"
          >
            {recentPhoto ? (
              <img
                src={recentPhoto.dataUrl}
                alt="最新の撮影"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-zinc-500" />
            )}
          </button>
          {photoCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded bg-zinc-100 text-black text-[10px] font-mono font-bold">
              {photoCount}
            </span>
          )}
        </div>

        {/* Shutter Button (Machined Camera Release) */}
        <div className="flex flex-col items-center">
          <button
            onClick={onCapture}
            disabled={isCapturing}
            className={`w-18 h-18 rounded-full p-1 border-2 border-zinc-400 bg-zinc-900 hover:border-white transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
              isCapturing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="シャッターを切る"
          >
            <div
              className={`w-full h-full rounded-full transition-colors flex items-center justify-center border border-zinc-800 ${
                burstCount > 1 ? 'bg-zinc-200 text-black' : 'bg-white text-zinc-900'
              }`}
            >
              {burstCount > 1 && (
                <span className="font-mono text-xs font-bold">
                  {burstCount}×
                </span>
              )}
            </div>
          </button>

          {/* Drive Mode Indicator */}
          <button
            onClick={() => onBurstCountChange(nextBurst())}
            className="mt-2 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="ドライブモード切り替え"
          >
            DRIVE: {burstCount === 1 ? 'SINGLE' : `BURST ×${burstCount}`}
          </button>
        </div>

        {/* Lens Flip / Camera Switch */}
        <button
          onClick={onFlipCamera}
          className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          title="レンズ切り替え (イン/アウト)"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};
