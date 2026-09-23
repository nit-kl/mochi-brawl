import type { GameFrame } from './deviceLayout';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const TOUCH_DIAMETER_CSS = 64;
const BUTTON_GAP_CSS = 14;
const EDGE_MARGIN_CSS = 18;
const STICK_DIAMETER_CSS = 108;
const KNOB_DIAMETER_CSS = 46;

export type Vec2 = { x: number; y: number };

export type TouchControlPlacement = {
  touchRadius: number;
  visualRadius: number;
  stickRadius: number;
  knobRadius: number;
  grabRadius: number;
  stick: Vec2;
  jump: Vec2;
  attack: Vec2;
  special: Vec2;
  guard: Vec2;
  fontPx: number;
};

/** 右手は必殺を頂点、ジャンプを左下、攻撃を右下に置く。 */
export function layoutTouchControls(frame: GameFrame, gameWidth = GAME_WIDTH, gameHeight = GAME_HEIGHT): TouchControlPlacement {
  const g = (css: number): number => css / frame.cssPerGame;
  const touchRadius = g(TOUCH_DIAMETER_CSS / 2);
  const dist = g(TOUCH_DIAMETER_CSS + BUTTON_GAP_CSS);
  const margin = g(EDGE_MARGIN_CSS);
  const stickRadius = g(STICK_DIAMETER_CSS / 2);
  const bottom = gameHeight - frame.insetBottom - margin;
  const right = gameWidth - frame.insetRight - margin;
  const left = frame.insetLeft + margin;
  const attack = { x: right - touchRadius, y: bottom - touchRadius };
  const jump = { x: attack.x - dist, y: attack.y };
  const special = {
    x: (attack.x + jump.x) / 2,
    y: attack.y - dist * Math.sin(Math.PI / 3)
  };
  const guard = { x: jump.x - dist, y: jump.y };
  return {
    touchRadius,
    visualRadius: touchRadius * 0.84,
    stickRadius,
    knobRadius: g(KNOB_DIAMETER_CSS / 2),
    grabRadius: stickRadius * 1.28,
    stick: { x: left + stickRadius, y: bottom - stickRadius },
    jump,
    attack,
    special,
    guard,
    fontPx: Math.max(12, g(13))
  };
}

/** 検証用。FIT + 中央寄せと同じ余白で配置を求める。 */
export function layoutForViewport(
  viewportWidth: number,
  viewportHeight: number,
  insets: { left: number; right: number; top: number; bottom: number } = { left: 0, right: 0, top: 0, bottom: 0 }
): TouchControlPlacement {
  const cssPerGame = Math.min(viewportWidth / GAME_WIDTH, viewportHeight / GAME_HEIGHT);
  const displayW = GAME_WIDTH * cssPerGame;
  const displayH = GAME_HEIGHT * cssPerGame;
  const offsetX = (viewportWidth - displayW) / 2;
  const offsetY = (viewportHeight - displayH) / 2;
  const toGame = (css: number): number => Math.max(0, css) / cssPerGame;
  return layoutTouchControls({
    cssPerGame,
    insetLeft: toGame(insets.left - offsetX),
    insetTop: toGame(insets.top - offsetY),
    insetRight: toGame(insets.right - (viewportWidth - (offsetX + displayW))),
    insetBottom: toGame(insets.bottom - (viewportHeight - (offsetY + displayH)))
  });
}
