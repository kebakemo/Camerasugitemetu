import React from 'react';
import { X, VolumeX, Shield, Info } from 'lucide-react';

interface SilentGuideModalProps {
  onClose: () => void;
}

export const SilentGuideModal: React.FC<SilentGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              SILENT SHUTTER ARCHITECTURE & GUIDE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-zinc-300 text-xs leading-relaxed font-sans">
          {/* Technical Architecture */}
          <div className="space-y-2 border-b border-zinc-900 pb-4">
            <h3 className="font-mono text-xs font-semibold uppercase text-zinc-200 tracking-wider">
              01. 無音撮影の技術的背景
            </h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              日本のスマートフォン標準カメラは、OSおよびファームウェアの仕様によりシャッター音がスピーカーから強制再生されます。
            </p>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              本アプリケーションはWeb標準のHTML5カメラストリーム（MediaStream API）から直接Canvasバッファへ画像フレームを描画・エンコードするため、OSのシャッター音トリガーを介さず完全な無音（0dB）での撮影を実現しています。
            </p>
          </div>

          {/* Practical Applications */}
          <div className="space-y-2 border-b border-zinc-900 pb-4">
            <h3 className="font-mono text-xs font-semibold uppercase text-zinc-200 tracking-wider">
              02. 推奨される活用環境
            </h3>
            <ul className="space-y-1.5 text-zinc-400 text-[11px]">
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-zinc-500">·</span>
                <span><strong className="text-zinc-200">睡眠中のペットや小動物</strong> — 音による威嚇や驚きを与えず、自然な表情を記録できます。</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-zinc-500">·</span>
                <span><strong className="text-zinc-200">乳幼児の睡眠時</strong> — 些細な物音で起きてしまう赤ちゃんの寝顔を静かに残せます。</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-zinc-500">·</span>
                <span><strong className="text-zinc-200">静寂なカフェや飲食店</strong> — 周囲の会話や雰囲気を妨げずに料理を手早く記録できます。</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-zinc-500">·</span>
                <span><strong className="text-zinc-200">講演会・学会・展示会</strong> — 発表中のスライドや配布資料のメモとして活用できます。</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Storage */}
          <div className="space-y-2 border-b border-zinc-900 pb-4">
            <h3 className="font-mono text-xs font-semibold uppercase text-zinc-200 tracking-wider">
              03. プライバシーとローカル完結
            </h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              撮影されたすべての画像データはお使いの端末のブラウザ内部（IndexedDB）にのみ保存されます。外部サーバーへの通信や画像アップロードは一切行われません。
            </p>
          </div>

          {/* Legal / Etiquette */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              ETIQUETTE & COMPLIANCE
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              公共の場における迷惑行為や法令違反（盗撮行為等）は厳禁です。撮影が許可された区域において、周囲への配慮とマナーを守ってご利用ください。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-black font-mono text-xs font-medium transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
