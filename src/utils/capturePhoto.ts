import { AspectRatioType, FilterPreset } from '../types/camera';
import { CapturedPhoto } from '../services/db';

interface CaptureOptions {
  video: HTMLVideoElement;
  aspectRatio: AspectRatioType;
  previewRatio?: number; // Exact aspect ratio (width / height) currently rendered in the preview box
  filter: FilterPreset;
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  zoomLevel: number; // 1 to 5
  facingMode: 'user' | 'environment';
  autoMirror: boolean;
}

export async function capturePhotoFromVideo(options: CaptureOptions): Promise<CapturedPhoto> {
  const { video, aspectRatio, previewRatio, filter, brightness, contrast, zoomLevel, facingMode, autoMirror } = options;

  if (!video || video.readyState < 2) {
    throw new Error('カメラ映像の準備ができていません');
  }

  const vWidth = video.videoWidth || 1920;
  const vHeight = video.videoHeight || 1080;

  // Determine target aspect ratio (width / height)
  let targetRatio: number;

  if (previewRatio && previewRatio > 0) {
    // Exact match with the live viewfinder preview box
    targetRatio = previewRatio;
  } else {
    // Fallback calculation based on orientation
    const isPortrait = vHeight > vWidth || (typeof window !== 'undefined' && window.innerHeight > window.innerWidth);
    if (aspectRatio === '1:1') {
      targetRatio = 1.0;
    } else if (aspectRatio === '4:3') {
      targetRatio = isPortrait ? 3 / 4 : 4 / 3;
    } else if (aspectRatio === '16:9') {
      targetRatio = isPortrait ? 9 / 16 : 16 / 9;
    } else {
      targetRatio = vWidth / vHeight;
    }
  }

  // Calculate source crop rectangle so it matches object-cover in the viewfinder
  let cropWidth = vWidth;
  let cropHeight = vHeight;

  if (vWidth / vHeight > targetRatio) {
    // Video stream is wider than target aspect ratio: crop left and right
    cropWidth = vHeight * targetRatio;
    cropHeight = vHeight;
  } else {
    // Video stream is taller than target aspect ratio: crop top and bottom
    cropWidth = vWidth;
    cropHeight = vWidth / targetRatio;
  }

  // Apply digital zoom (crop closer to center)
  const zoomFactor = Math.max(1, Math.min(5, zoomLevel));
  const zoomedWidth = cropWidth / zoomFactor;
  const zoomedHeight = cropHeight / zoomFactor;

  const cropX = (vWidth - zoomedWidth) / 2;
  const cropY = (vHeight - zoomedHeight) / 2;

  // Create high-res destination canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(zoomedWidth);
  canvas.height = Math.round(zoomedHeight);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvasコンテキストの初期化に失敗しました');
  }

  // Compose CSS filter string
  const brightnessMultiplier = (1 + brightness / 100).toFixed(2);
  const contrastMultiplier = (1 + contrast / 100).toFixed(2);
  let filterString = `brightness(${brightnessMultiplier}) contrast(${contrastMultiplier})`;

  if (filter.css && filter.css !== 'none') {
    filterString += ` ${filter.css}`;
  }

  // Apply canvas filter if supported
  if ('filter' in ctx) {
    ctx.filter = filterString.trim();
  }

  ctx.save();

  // If user facing camera and autoMirror is on, mirror horizontally
  if (facingMode === 'user' && autoMirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  // Draw sliced video frame to canvas
  ctx.drawImage(
    video,
    cropX,
    cropY,
    zoomedWidth,
    zoomedHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.restore();

  // Convert to Blob & DataURL
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('画像の書き出しに失敗しました'));
      },
      'image/jpeg',
      0.95
    );
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    blob,
    dataUrl,
    timestamp: Date.now(),
    width: canvas.width,
    height: canvas.height,
    aspectRatio,
    filterName: filter.name,
    facingMode,
  };
}
