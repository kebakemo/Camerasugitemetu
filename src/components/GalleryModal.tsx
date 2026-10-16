import React, { useState } from 'react';
import { X, Download, Trash2, Share2, Archive, Check, Calendar } from 'lucide-react';
import JSZip from 'jszip';
import { CapturedPhoto, deletePhoto, clearAllPhotos } from '../services/db';

interface GalleryModalProps {
  photos: CapturedPhoto[];
  onClose: () => void;
  onRefreshPhotos: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  photos,
  onClose,
  onRefreshPhotos,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(
    photos.length > 0 ? photos[0] : null
  );
  const [isZipping, setIsZipping] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Download a single photo
  const handleDownload = (photo: CapturedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    const dateStr = new Date(photo.timestamp)
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    link.download = `photo_${dateStr}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    if (photos.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      photos.forEach((photo, idx) => {
        const dateStr = new Date(photo.timestamp)
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);
        const filename = `frame_${(idx + 1).toString().padStart(3, '0')}_${dateStr}.jpg`;
        zip.file(filename, photo.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `film_roll_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Share photo using Web Share API
  const handleShare = async (photo: CapturedPhoto) => {
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([photo.blob], 'silent_photo.jpg', { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '写真',
          });
          return;
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    try {
      handleDownload(photo);
      setCopiedNotification('保存しました');
      setTimeout(() => setCopiedNotification(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete current photo
  const handleDelete = async (photo: CapturedPhoto) => {
    try {
      await deletePhoto(photo.id);
      onRefreshPhotos();
      const remaining = photos.filter((p) => p.id !== photo.id);
      setSelectedPhoto(remaining.length > 0 ? remaining[0] : null);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete all photos
  const handleClearAll = async () => {
    try {
      await clearAllPhotos();
      onRefreshPhotos();
      setSelectedPhoto(null);
      setConfirmClear(false);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-4xl h-[92vh] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Gallery Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-baseline gap-2 font-mono">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              FILM ROLL
            </h2>
            <span className="text-[11px] text-zinc-500">
              {photos.length} FRAMES
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {photos.length > 0 && (
              <>
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-medium flex items-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                  title="全フレームをZIP形式で保存"
                >
                  <Archive className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{isZipping ? 'EXPORTING...' : 'ZIP EXPORT'}</span>
                </button>

                {confirmClear ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleClearAll}
                      className="px-2.5 py-1.5 rounded bg-red-900 text-white text-xs font-mono cursor-pointer"
                    >
                      DELETE ALL
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                    title="全消去"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {copiedNotification && (
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 px-3 py-1 rounded bg-zinc-100 text-black text-xs font-mono flex items-center gap-1.5 shadow-lg">
            <Check className="w-3.5 h-3.5" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Gallery Body */}
        {photos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
              NO FRAMES CAPTURED
            </p>
            <p className="text-xs text-zinc-400 max-w-xs">
              シャッターを切ると、ここに撮影された写真が記録されます。
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-zinc-100 text-black font-medium text-xs hover:bg-white transition-colors cursor-pointer"
            >
              カメラに戻る
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Main Stage */}
            {selectedPhoto && (
              <div className="flex-1 flex flex-col bg-black relative p-3 sm:p-4 overflow-hidden items-center justify-center">
                <div className="relative max-h-[55vh] md:max-h-[70vh] flex items-center justify-center">
                  <img
                    src={selectedPhoto.dataUrl}
                    alt="プレビュー写真"
                    className="max-h-[52vh] md:max-h-[66vh] max-w-full object-contain shadow-2xl"
                  />
                </div>

                {/* Detail Inspector Deck */}
                <div className="w-full max-w-lg mt-3 flex items-center justify-between bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2">
                  <div className="text-[11px] font-mono text-zinc-400 space-y-0.5">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <span>{selectedPhoto.width}×{selectedPhoto.height}</span>
                      <span className="text-zinc-500">·</span>
                      <span>{selectedPhoto.aspectRatio}</span>
                      {selectedPhoto.filterName !== 'スタンダード' && (
                        <>
                          <span className="text-zinc-500">·</span>
                          <span className="text-zinc-400">{selectedPhoto.filterName}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {formatDate(selectedPhoto.timestamp)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={() => handleShare(selectedPhoto)}
                      className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                      title="共有"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(selectedPhoto)}
                      className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-black font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="保存"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SAVE</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPhoto)}
                      className="p-1.5 rounded bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail Strip */}
            <div className="w-full md:w-60 border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950 p-2.5 overflow-y-auto">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 px-1">
                FRAMES ({photos.length})
              </div>
              <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5">
                {photos.map((p, idx) => {
                  const isCur = selectedPhoto?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhoto(p)}
                      className={`relative aspect-square overflow-hidden border transition-all cursor-pointer ${
                        isCur
                          ? 'border-white ring-1 ring-white/50'
                          : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <img
                        src={p.dataUrl}
                        alt="サムネイル"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 font-mono text-[9px] text-zinc-300">
                        #{(photos.length - idx).toString().padStart(2, '0')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
