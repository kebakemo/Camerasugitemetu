/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCameraStream } from './hooks/useCameraStream';
import { HeaderBar } from './components/HeaderBar';
import { Viewfinder } from './components/Viewfinder';
import { BottomControls } from './components/BottomControls';
import { AdjustmentPanel } from './components/AdjustmentPanel';
import { GalleryModal } from './components/GalleryModal';
import { SilentGuideModal } from './components/SilentGuideModal';
import { TroubleshootModal } from './components/TroubleshootModal';
import {
  CameraSettings,
  FILTER_PRESETS,
  FilterPreset,
  AspectRatioType,
  GridType,
  BurstCount,
} from './types/camera';
import { capturePhotoFromVideo } from './utils/capturePhoto';
import { getAllPhotos, savePhoto, CapturedPhoto } from './services/db';

const SETTINGS_STORAGE_KEY = 'silent_camera_settings_v1';

const DEFAULT_SETTINGS: CameraSettings = {
  facingMode: 'environment',
  aspectRatio: '4:3',
  filterId: 'normal',
  grid: 'none',
  flashMode: 'soft',
  timerSeconds: 0,
  burstCount: 1,
  zoomLevel: 1,
  brightness: 0,
  contrast: 0,
  autoMirror: true,
};

export default function App() {
  // Load saved preferences if available
  const [settings, setSettings] = useState<CameraSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings on changes
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Modals & Panels state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTroubleshootOpen, setIsTroubleshootOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  // Capture dynamics
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [burstProgress, setBurstProgress] = useState<{ current: number; total: number } | null>(null);

  // Photo gallery storage state
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);

  // Camera stream hook
  const {
    videoRef,
    isStreaming,
    error,
    hasMultipleCameras,
    torchAvailable,
    torchOn,
    toggleTorch,
    restartStream,
    handleLoadedMetadata,
  } = useCameraStream({
    facingMode: settings.facingMode,
  });

  // Live preview aspect ratio computed by Viewfinder
  const [previewRatio, setPreviewRatio] = useState<number>(1);

  // Load photos from IndexedDB
  const refreshPhotos = useCallback(async () => {
    try {
      const items = await getAllPhotos();
      setPhotos(items);
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  }, []);

  useEffect(() => {
    refreshPhotos();
  }, [refreshPhotos]);

  // Current selected filter preset
  const currentFilter = useMemo<FilterPreset>(() => {
    return FILTER_PRESETS.find((f) => f.id === settings.filterId) || FILTER_PRESETS[0];
  }, [settings.filterId]);

  // Execute the silent capture action
  const executeCapture = useCallback(async () => {
    if (!videoRef.current || !isStreaming || isCapturing) return;

    setIsCapturing(true);

    try {
      const burstTotal = settings.burstCount;

      for (let i = 0; i < burstTotal; i++) {
        if (burstTotal > 1) {
          setBurstProgress({ current: i + 1, total: burstTotal });
        }

        // Trigger subtle visual flash if soft flash is enabled
        if (settings.flashMode === 'soft') {
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 160);
        }

        // Silent haptic feedback (tactile click without any sound)
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(18);
          } catch {
            // ignore
          }
        }

        // Render silent frame from video to canvas with exact preview ratio
        const photo = await capturePhotoFromVideo({
          video: videoRef.current,
          aspectRatio: settings.aspectRatio,
          previewRatio,
          filter: currentFilter,
          brightness: settings.brightness,
          contrast: settings.contrast,
          zoomLevel: settings.zoomLevel,
          facingMode: settings.facingMode,
          autoMirror: settings.autoMirror,
        });

        // Store into IndexedDB
        await savePhoto(photo);

        // Pause slightly between burst shots
        if (burstTotal > 1 && i < burstTotal - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      await refreshPhotos();
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setIsCapturing(false);
      setBurstProgress(null);
    }
  }, [
    videoRef,
    isStreaming,
    isCapturing,
    settings,
    currentFilter,
    refreshPhotos,
  ]);

  // Trigger capture with optional countdown timer
  const triggerCapture = useCallback(() => {
    if (isCapturing || countdown !== null) return;

    if (settings.timerSeconds > 0) {
      let currentSec = settings.timerSeconds;
      setCountdown(currentSec);

      const interval = setInterval(() => {
        currentSec -= 1;
        if (currentSec <= 0) {
          clearInterval(interval);
          setCountdown(null);
          executeCapture();
        } else {
          setCountdown(currentSec);
        }
      }, 1000);
    } else {
      executeCapture();
    }
  }, [isCapturing, countdown, settings.timerSeconds, executeCapture]);

  // Flip front / back camera
  const handleFlipCamera = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
    }));
  }, []);

  // Keyboard shortcut listener for spacebar / enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (isGalleryOpen || isGuideOpen || isTroubleshootOpen) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        triggerCapture();
      } else if (e.key === 'c' || e.key === 'f') {
        handleFlipCamera();
      } else if (e.key === 'g') {
        setIsGalleryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerCapture, handleFlipCamera, isGalleryOpen, isGuideOpen, isTroubleshootOpen]);

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-black text-neutral-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <HeaderBar
        aspectRatio={settings.aspectRatio}
        onAspectRatioChange={(ratio: AspectRatioType) =>
          setSettings((prev) => ({ ...prev, aspectRatio: ratio }))
        }
        grid={settings.grid}
        onGridChange={(grid: GridType) =>
          setSettings((prev) => ({ ...prev, grid }))
        }
        flashMode={settings.flashMode}
        onFlashModeToggle={() =>
          setSettings((prev) => ({
            ...prev,
            flashMode: prev.flashMode === 'soft' ? 'stealth' : 'soft',
          }))
        }
        timerSeconds={settings.timerSeconds}
        onTimerChange={(sec: number) =>
          setSettings((prev) => ({ ...prev, timerSeconds: sec }))
        }
        isAdjustOpen={isAdjustOpen}
        onToggleAdjust={() => setIsAdjustOpen((prev) => !prev)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Viewfinder Canvas / Video */}
      <Viewfinder
        videoRef={videoRef}
        isStreaming={isStreaming}
        error={error}
        onRestart={restartStream}
        aspectRatio={settings.aspectRatio}
        filter={currentFilter}
        brightness={settings.brightness}
        contrast={settings.contrast}
        zoomLevel={settings.zoomLevel}
        grid={settings.grid}
        facingMode={settings.facingMode}
        autoMirror={settings.autoMirror}
        isFlashing={isFlashing}
        countdown={countdown}
        burstProgress={burstProgress}
        onOpenTroubleshoot={() => setIsTroubleshootOpen(true)}
        onLoadedMetadata={handleLoadedMetadata}
        onPreviewRatioChange={setPreviewRatio}
      />

      {/* Adjustments Drawer Panel (if opened) */}
      {isAdjustOpen && (
        <AdjustmentPanel
          aspectRatio={settings.aspectRatio}
          onAspectRatioChange={(ratio: AspectRatioType) =>
            setSettings((prev) => ({ ...prev, aspectRatio: ratio }))
          }
          brightness={settings.brightness}
          onBrightnessChange={(b) => setSettings((prev) => ({ ...prev, brightness: b }))}
          contrast={settings.contrast}
          onContrastChange={(c) => setSettings((prev) => ({ ...prev, contrast: c }))}
          zoomLevel={settings.zoomLevel}
          onZoomChange={(z) => setSettings((prev) => ({ ...prev, zoomLevel: z }))}
          autoMirror={settings.autoMirror}
          onToggleMirror={() => setSettings((prev) => ({ ...prev, autoMirror: !prev.autoMirror }))}
          facingMode={settings.facingMode}
          torchAvailable={torchAvailable}
          torchOn={torchOn}
          onToggleTorch={toggleTorch}
          onReset={() =>
            setSettings((prev) => ({
              ...prev,
              brightness: 0,
              contrast: 0,
              zoomLevel: 1,
            }))
          }
          onClose={() => setIsAdjustOpen(false)}
        />
      )}

      {/* Bottom Controls Bar (Shutter, Filters, Zoom, Gallery button, Flip) */}
      <BottomControls
        currentFilter={currentFilter}
        onSelectFilter={(filter) =>
          setSettings((prev) => ({ ...prev, filterId: filter.id }))
        }
        burstCount={settings.burstCount}
        onBurstCountChange={(count: BurstCount) =>
          setSettings((prev) => ({ ...prev, burstCount: count }))
        }
        zoomLevel={settings.zoomLevel}
        onZoomChange={(zoom) =>
          setSettings((prev) => ({ ...prev, zoomLevel: zoom }))
        }
        onFlipCamera={handleFlipCamera}
        hasMultipleCameras={hasMultipleCameras}
        onCapture={triggerCapture}
        isCapturing={isCapturing}
        recentPhoto={photos[0] || null}
        photoCount={photos.length}
        onOpenGallery={() => setIsGalleryOpen(true)}
      />

      {/* Modals */}
      {isGalleryOpen && (
        <GalleryModal
          photos={photos}
          onClose={() => setIsGalleryOpen(false)}
          onRefreshPhotos={refreshPhotos}
        />
      )}

      {isGuideOpen && (
        <SilentGuideModal onClose={() => setIsGuideOpen(false)} />
      )}

      {isTroubleshootOpen && (
        <TroubleshootModal
          onClose={() => setIsTroubleshootOpen(false)}
          onRetry={restartStream}
        />
      )}
    </div>
  );
}
