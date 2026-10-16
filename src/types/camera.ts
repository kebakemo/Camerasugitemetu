export type AspectRatioType = '4:3' | '16:9' | '1:1' | 'full';

export type GridType = 'none' | '3x3' | 'crosshair' | 'golden';

export type FlashMode = 'soft' | 'stealth'; // soft = screen shutter flash, stealth = zero visual emit

export type BurstCount = 1 | 3 | 5 | 10;

export interface FilterPreset {
  id: string;
  name: string;
  code: string;
  css: string;
  description: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'スタンダード',
    code: 'STD',
    css: 'none',
    description: '自然で忠実なトーン'
  },
  {
    id: 'bw',
    name: 'モノクローム',
    code: 'B&W',
    css: 'grayscale(1) contrast(1.2) brightness(1.02)',
    description: '陰影が際立つ階調'
  },
  {
    id: 'vintage',
    name: 'クラシックフィルム',
    code: 'FILM',
    css: 'sepia(0.28) contrast(1.08) brightness(0.97) saturate(1.15)',
    description: '落ち着いた銀塩フィルム調'
  },
  {
    id: 'vivid',
    name: 'ビビッド',
    code: 'VIVID',
    css: 'saturate(1.35) contrast(1.1) brightness(1.02)',
    description: '深みのある高彩度発色'
  },
  {
    id: 'warm',
    name: 'アンバー温調',
    code: 'WARM',
    css: 'sepia(0.18) saturate(1.2) hue-rotate(-8deg) brightness(1.03)',
    description: '温かみのあるポートレート'
  },
  {
    id: 'cool',
    name: 'シアン冷調',
    code: 'COOL',
    css: 'hue-rotate(18deg) saturate(1.08) brightness(1.02) contrast(1.04)',
    description: '透明感のあるクリアな青み'
  },
  {
    id: 'dramatic',
    name: 'シネマ',
    code: 'CINE',
    css: 'contrast(1.28) brightness(0.94) saturate(1.12)',
    description: '重厚な陰影とシネマライクな階調'
  },
  {
    id: 'fade',
    name: 'ソフトフェード',
    code: 'SOFT',
    css: 'contrast(0.92) brightness(1.08) saturate(0.88)',
    description: '柔らかなハイライトと低コントラスト'
  }
];

export interface CameraSettings {
  facingMode: 'user' | 'environment';
  aspectRatio: AspectRatioType;
  filterId: string;
  grid: GridType;
  flashMode: FlashMode;
  timerSeconds: number; // 0, 3, 5, 10
  burstCount: BurstCount;
  zoomLevel: number; // 1 to 5
  brightness: number; // -50 to +50 (default 0)
  contrast: number; // -50 to +50 (default 0)
  autoMirror: boolean; // mirror for selfie
}
