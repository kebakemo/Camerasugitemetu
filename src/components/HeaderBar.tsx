import React, { useState, useRef, useEffect } from 'react';
import { VolumeX, Grid, Timer, HelpCircle, EyeOff, Sliders, ChevronDown, Check, Zap, ZapOff } from 'lucide-react';
import { AspectRatioType, GridType, FlashMode } from '../types/camera';

interface HeaderBarProps {
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
  grid: GridType;
  onGridChange: (grid: GridType) => void;
  flashMode: FlashMode;
  onFlashModeToggle: () => void;
  timerSeconds: number;
  onTimerChange: (seconds: number) => void;
  isAdjustOpen: boolean;
  onToggleAdjust: () => void;
  onOpenGuide: () => void;
}

const RATIO_OPTIONS: { id: AspectRatioType; label: string; desc: string }[] = [
  { id: '4:3', label: '4:3', desc: '標準フォーマット' },
  { id: '16:9', label: '16:9', desc: 'ワイド' },
  { id: '1:1', label: '1:1', desc: 'スクエア' },
  { id: 'full', label: 'FULL', desc: '全画面' },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  aspectRatio,
  onAspectRatioChange,
  grid,
  onGridChange,
  flashMode,
  onFlashModeToggle,
  timerSeconds,
  onTimerChange,
  isAdjustOpen,
  onToggleAdjust,
  onOpenGuide,
}) => {
  const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
  const ratioMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ratioMenuRef.current && !ratioMenuRef.current.contains(e.target as Node)) {
        setIsRatioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextGrid = (): GridType => {
    switch (grid) {
      case 'none':
        return '3x3';
      case '3x3':
        return 'crosshair';
      case 'crosshair':
        return 'golden';
      case 'golden':
        return 'none';
    }
  };

  const nextTimer = (): number => {
    switch (timerSeconds) {
      case 0:
        return 3;
      case 3:
        return 5;
      case 5:
        return 10;
      default:
        return 0;
    }
  };

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-2.5 bg-black border-b border-zinc-900 select-none">
      {/* Precision camera status display */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-zinc-200">
            SILENT 0dB
          </span>
        </div>
      </div>

      {/* Camera top deck controls */}
      <div className="flex items-center gap-1.5">
        {/* Aspect Ratio Selector */}
        <div className="relative" ref={ratioMenuRef}>
          <button
            onClick={() => setIsRatioMenuOpen((prev) => !prev)}
            className={`h-8 px-2.5 rounded-md border text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              isRatioMenuOpen
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200'
            }`}
            title="画面比率"
          >
            <span>{aspectRatio === 'full' ? 'FULL' : aspectRatio}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isRatioMenuOpen && (
            <div className="absolute top-full mt-1.5 right-0 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 z-50">
              {RATIO_OPTIONS.map((opt) => {
                const isSelected = aspectRatio === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onAspectRatioChange(opt.id);
                      setIsRatioMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="font-semibold text-xs">{opt.label}</span>
                      <span className="text-[10px] text-zinc-500 font-sans">{opt.desc}</span>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Timer */}
        <button
          onClick={() => onTimerChange(nextTimer())}
          className={`h-8 px-2 rounded-md border text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            timerSeconds > 0
              ? 'bg-zinc-100 text-black border-white'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
          title="セルフタイマー"
        >
          <Timer className="w-3.5 h-3.5" />
          {timerSeconds > 0 && <span className="text-[11px] font-mono">{timerSeconds}s</span>}
        </button>

        {/* Grid */}
        <button
          onClick={() => onGridChange(nextGrid())}
          className={`h-8 w-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
            grid !== 'none'
              ? 'bg-zinc-100 text-black border-white'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
          title="構図グリッド"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Shutter Screen Flash / Stealth Mode */}
        <button
          onClick={onFlashModeToggle}
          className={`h-8 w-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
            flashMode === 'stealth'
              ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200'
          }`}
          title={flashMode === 'stealth' ? 'ステルスモード (画面光なし)' : 'ソフトシャッターフラッシュ'}
        >
          {flashMode === 'stealth' ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Quick Menu / Exposure Settings */}
        <button
          onClick={onToggleAdjust}
          className={`h-8 px-2 rounded-md border text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
            isAdjustOpen
              ? 'bg-zinc-100 text-black border-white'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
          title="クイック露出・設定"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[11px]">EV</span>
        </button>

        {/* Photography Guide */}
        <button
          onClick={onOpenGuide}
          className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          title="撮影ガイド"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
