import React from 'react';
import { RotateCcw, FlipHorizontal, Flashlight } from 'lucide-react';
import { AspectRatioType } from '../types/camera';

interface AdjustmentPanelProps {
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  contrast: number;
  onContrastChange: (val: number) => void;
  zoomLevel: number;
  onZoomChange: (val: number) => void;
  autoMirror: boolean;
  onToggleMirror: () => void;
  facingMode: 'user' | 'environment';
  torchAvailable: boolean;
  torchOn: boolean;
  onToggleTorch: () => void;
  onReset: () => void;
  onClose: () => void;
}

const RATIO_LIST: { id: AspectRatioType; label: string }[] = [
  { id: '4:3', label: '4:3' },
  { id: '16:9', label: '16:9' },
  { id: '1:1', label: '1:1' },
  { id: 'full', label: 'FULL' },
];

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  aspectRatio,
  onAspectRatioChange,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  zoomLevel,
  onZoomChange,
  autoMirror,
  onToggleMirror,
  facingMode,
  torchAvailable,
  torchOn,
  onToggleTorch,
  onReset,
  onClose,
}) => {
  return (
    <div className="bg-zinc-950 border-t border-zinc-900 p-4 text-xs space-y-4 select-none animate-in slide-in-from-bottom duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            EXPOSURE & SENSOR PARAMETERS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
          <button
            onClick={onClose}
            className="text-[11px] font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>

      {/* Aspect Ratio Row */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-zinc-400">FORMAT</span>
        <div className="flex items-center gap-1.5">
          {RATIO_LIST.map((r) => {
            const isSelected = aspectRatio === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onAspectRatioChange(r.id)}
                className={`px-3 py-1 rounded font-mono text-xs transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-100 text-black border-white font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Brightness (EV) */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-zinc-300">
            <span>EXPOSURE (EV)</span>
            <span className="tabular-nums text-zinc-400">
              {brightness > 0 ? `+${(brightness / 25).toFixed(1)}` : (brightness / 25).toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={brightness}
            onChange={(e) => onBrightnessChange(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-1 bg-zinc-800 rounded appearance-none"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-zinc-300">
            <span>CONTRAST</span>
            <span className="tabular-nums text-zinc-400">
              {contrast > 0 ? `+${contrast}` : contrast}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={contrast}
            onChange={(e) => onContrastChange(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-1 bg-zinc-800 rounded appearance-none"
          />
        </div>

        {/* Focal Zoom */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex justify-between font-mono text-zinc-300">
            <span>MAGNIFICATION</span>
            <span className="tabular-nums text-zinc-400">{zoomLevel.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-1 bg-zinc-800 rounded appearance-none"
          />
        </div>

        {/* Action Toggles */}
        <div className="sm:col-span-2 flex items-center gap-2 pt-1">
          {facingMode === 'user' && (
            <button
              onClick={onToggleMirror}
              className={`flex-1 py-1.5 px-3 rounded border font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                autoMirror
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              MIRROR FRONT: {autoMirror ? 'ON' : 'OFF'}
            </button>
          )}

          {torchAvailable && (
            <button
              onClick={onToggleTorch}
              className={`flex-1 py-1.5 px-3 rounded border font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                torchOn
                  ? 'bg-zinc-100 text-black border-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <Flashlight className="w-3.5 h-3.5" />
              ILLUMINATION: {torchOn ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
