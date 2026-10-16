import React from 'react';
import { X, RefreshCw } from 'lucide-react';

interface TroubleshootModalProps {
  onClose: () => void;
  onRetry: () => void;
}

export const TroubleshootModal: React.FC<TroubleshootModalProps> = ({ onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-900 bg-zinc-950">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
            CAMERA PERMISSION & SETUP
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-zinc-300">
          {/* iOS Safari */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
            <div className="font-mono text-xs font-semibold text-zinc-200">
              iPhone / iPad (Safari)
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>アドレスバー左側の「ぁあ」または「AA」をタップ</li>
              <li>「Webサイトの設定」を選択</li>
              <li>「カメラ」の項目を「許可」に変更</li>
              <li>ページを再読み込みしてください</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
            <div className="font-mono text-xs font-semibold text-zinc-200">
              Android (Chrome)
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>アドレスバー左側の鍵アイコンをタップ</li>
              <li>「権限」または「サイトの設定」を選択</li>
              <li>カメラを「許可」に変更</li>
              <li>ページを更新してください</li>
            </ol>
          </div>

          {/* Desktop */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-1.5">
            <div className="font-mono text-xs font-semibold text-zinc-200">
              PC (Chrome / Edge / Safari)
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              URLバー左側のアイコンをクリックし、カメラへのアクセスを「許可」にしてリロードしてください。
            </p>
          </div>
        </div>

        <div className="p-3 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-mono text-xs text-zinc-400 hover:text-white cursor-pointer"
          >
            CLOSE
          </button>
          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-black font-mono text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            RETRY
          </button>
        </div>
      </div>
    </div>
  );
};
