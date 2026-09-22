import type Phaser from 'phaser';

export type SafeAreaInsets = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type GameFrame = {
  /** ゲーム座標 1 に対する CSS px */
  cssPerGame: number;
  insetLeft: number;
  insetRight: number;
  insetTop: number;
  insetBottom: number;
};

const COARSE_QUERY = '(pointer: coarse)';
const HOVER_NONE_QUERY = '(hover: none)';
const PORTRAIT_QUERY = '(orientation: portrait)';

/** 画面幅だけでは判定しない。粗いポインタと、ホバー不可またはタッチ点数を見る。 */
export function isTouchLayout(): boolean {
  const coarse = window.matchMedia(COARSE_QUERY).matches;
  const hoverNone = window.matchMedia(HOVER_NONE_QUERY).matches;
  const canTouch = navigator.maxTouchPoints > 0;
  return coarse && (hoverNone || canTouch);
}

/** タッチ端末の縦向き。PCの縦長ウィンドウでは false。 */
export function isPortraitPhone(): boolean {
  if (!isTouchLayout()) return false;
  const portrait = window.matchMedia(PORTRAIT_QUERY).matches;
  return portrait || window.innerHeight > window.innerWidth + 40;
}

export function readSafeAreaInsets(): SafeAreaInsets {
  const probe = document.createElement('div');
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.paddingLeft = 'env(safe-area-inset-left)';
  probe.style.paddingRight = 'env(safe-area-inset-right)';
  probe.style.paddingTop = 'env(safe-area-inset-top)';
  probe.style.paddingBottom = 'env(safe-area-inset-bottom)';
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = {
    left: parseFloat(style.paddingLeft) || 0,
    right: parseFloat(style.paddingRight) || 0,
    top: parseFloat(style.paddingTop) || 0,
    bottom: parseFloat(style.paddingBottom) || 0
  };
  probe.remove();
  return insets;
}

export function syncPortraitHint(): void {
  const hint = document.getElementById('rotate-hint');
  if (!hint) return;
  hint.classList.toggle('is-visible', isPortraitPhone());
}

export function watchDeviceLayout(onChange: () => void): () => void {
  const queries = [COARSE_QUERY, HOVER_NONE_QUERY, PORTRAIT_QUERY].map((query) => window.matchMedia(query));
  const emit = (): void => {
    syncPortraitHint();
    onChange();
  };
  for (const query of queries) query.addEventListener('change', emit);
  window.addEventListener('resize', emit);
  window.visualViewport?.addEventListener('resize', emit);
  emit();
  return () => {
    for (const query of queries) query.removeEventListener('change', emit);
    window.removeEventListener('resize', emit);
    window.visualViewport?.removeEventListener('resize', emit);
  };
}

/** FIT 表示のキャンバスと Safe Area から、ゲーム座標の余白を求める。 */
export function measureGameFrame(scene: Phaser.Scene): GameFrame {
  const gameW = scene.scale.gameSize.width || 1280;
  const displayW = scene.scale.displaySize.width || gameW;
  const cssPerGame = Math.max(displayW / gameW, 0.01);
  const canvas = scene.game.canvas.getBoundingClientRect();
  const safe = readSafeAreaInsets();
  const toGame = (css: number): number => Math.max(0, css) / cssPerGame;
  return {
    cssPerGame,
    insetLeft: toGame(safe.left - canvas.left),
    insetTop: toGame(safe.top - canvas.top),
    insetRight: toGame(safe.right - (window.innerWidth - canvas.right)),
    insetBottom: toGame(safe.bottom - (window.innerHeight - canvas.bottom))
  };
}
