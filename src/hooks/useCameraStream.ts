import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCameraStreamProps {
  facingMode: 'user' | 'environment';
}

export function useCameraStream({ facingMode }: UseCameraStreamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Check available camera devices
  const checkDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.warn('Error checking camera devices:', err);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setTorchOn(false);
    setTorchAvailable(false);
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('お使いのブラウザはカメラアクセスに対応していません。');
      return;
    }

    try {
      // Prefer high resolution video stream for sharp photos
      const constraints: MediaStreamConstraints = {
        audio: false, // Ensure zero audio stream
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 2560, max: 3840 },
          height: { ideal: 1440, max: 2160 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as unknown as Record<string, unknown>;
        if (capabilities && 'torch' in capabilities) {
          setTorchAvailable(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;

        await videoRef.current.play().catch((playErr) => {
          console.warn('Video play attempt failed:', playErr);
        });

        setIsStreaming(true);
        setVideoDimensions({
          width: videoRef.current.videoWidth || 1920,
          height: videoRef.current.videoHeight || 1080,
        });
      }

      await checkDevices();
    } catch (err: unknown) {
      console.error('Camera stream error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('カメラへのアクセスが拒否されています。ブラウザの設定でカメラ利用を「許可」してください。');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('利用可能なカメラが見つかりませんでした。');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('カメラが他のアプリで使用されているか、起動できませんでした。');
        } else {
          setError(`カメラ起動エラー: ${err.message}`);
        }
      } else {
        setError('カメラの起動に失敗しました。');
      }
      setIsStreaming(false);
    }
  }, [facingMode, stopStream, checkDevices]);

  // Toggle torch / flashlight if supported
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !torchAvailable) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const nextState = !torchOn;
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Failed to toggle torch:', e);
    }
  }, [torchAvailable, torchOn]);

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

  // Update video dimensions when video is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  return {
    videoRef,
    streamRef,
    isStreaming,
    error,
    hasMultipleCameras,
    videoDimensions,
    torchAvailable,
    torchOn,
    toggleTorch,
    restartStream: startStream,
    handleLoadedMetadata,
  };
}
