import Phaser from 'phaser';
import type { AnimationVisualDefinition, AttackPoseFallback, CharacterSpriteSet } from '../characters/CharacterSpriteSet';
import type { CharacterAnimationName, CharacterView, CharacterViewState } from './CharacterAnimation';
import { selectCharacterAnimation } from './selectCharacterAnimation';
import { hasCharacterAsset } from '../characters/characterAssets';

/** 本番スプライト。位置と向きだけを物理ボディに合わせ、判定は持たない。 */
export class SpriteCharacterView implements CharacterView {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly anims: ReadonlyMap<CharacterAnimationName, AnimationVisualDefinition>;
  private readonly available: ReadonlySet<CharacterAnimationName>;
  private readonly attackFallback: AttackPoseFallback | undefined;
  private current: CharacterAnimationName | null = null;
  private usingAttackFallback = false;

  constructor(scene: Phaser.Scene, set: CharacterSpriteSet, x: number, feetY: number) {
    this.anims = new Map(set.anims.filter((anim) => scene.textures.exists(anim.textureKey)).map((anim) => [anim.name, anim]));
    this.available = new Set(this.anims.keys());
    this.attackFallback = this.anims.has('attack') ? undefined : set.attackFallback;
    const first = this.anims.get('idle');
    if (!first) throw new Error('スプライト定義が空です');
    this.sprite = scene.add.sprite(x, feetY, first.textureKey, first.frames[0] ?? 0);
    this.sprite.setDepth(1);
    this.show(first);
    this.sprite.setPosition(x, feetY);
  }

  sync(state: CharacterViewState): void {
    const name = selectCharacterAnimation(state, this.available);
    const anim = this.anims.get(name);
    if (!anim) return;
    if (name === 'special_slam') {
      this.holdSlamFrame(anim, state);
      return;
    }
    if (this.current !== name) {
      this.current = name;
      this.sprite.play(anim.textureKey);
    }
    this.usingAttackFallback = this.isNormalAttack(state);
    this.applyMetrics(anim, state);
    if (state.flashing) this.sprite.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    else this.sprite.clearTint();
  }

  setAlpha(alpha: number): void {
    this.sprite.setAlpha(alpha);
  }

  place(x: number, feetY: number): void {
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.current = null;
    this.sprite.setPosition(x, feetY);
    this.sprite.setFlipX(false);
  }

  hide(): void {
    this.sprite.setVisible(false);
  }

  debugText(): string {
    if (!this.sprite.visible) return '';
    if (this.usingAttackFallback) return 'Animation: attack\nFrame: fallback';
    const frame = this.sprite.frame?.name ?? '-';
    return `Animation: ${this.current ?? 'idle'}\nFrame: ${frame}`;
  }

  private show(anim: AnimationVisualDefinition): void {
    this.current = anim.name;
    this.sprite.play(anim.textureKey);
    this.applyMetrics(anim, null);
  }

  private isNormalAttack(state: CharacterViewState): boolean {
    return (
      this.attackFallback !== undefined &&
      !state.hit &&
      state.attackPhase !== 'idle' &&
      (state.attackVisual === 'default' || state.attackVisual === 'down_special')
    );
  }

  /**
   * 着地 Hitbox が出る active を衝撃コマに合わせる。
   * 上昇の前半、後半、落下速度のあとを空中の 3 コマに分ける。
   */
  private holdSlamFrame(anim: AnimationVisualDefinition, state: CharacterViewState): void {
    const index = slamSheetFrame(state);
    if (this.current !== 'special_slam') this.sprite.anims.stop();
    this.current = 'special_slam';
    this.usingAttackFallback = false;
    if (this.sprite.texture.key !== anim.textureKey || Number(this.sprite.frame.name) !== index) {
      this.sprite.setTexture(anim.textureKey, index);
    }
    const padIndex = anim.frames.indexOf(index);
    const footPad = padIndex >= 0 ? anim.footPads?.[padIndex] : undefined;
    this.applyMetrics(anim, state, footPad);
    if (state.flashing) this.sprite.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    else this.sprite.clearTint();
  }

  private applyMetrics(
    anim: AnimationVisualDefinition,
    state: CharacterViewState | null,
    footPad?: number
  ): void {
    const fallback = state && this.usingAttackFallback ? this.attackFallback : undefined;
    const facing = state?.facing ?? 1;
    const scale = anim.visualScale;
    const originY =
      footPad === undefined ? anim.footAnchor.y : (anim.frameHeight - footPad) / anim.frameHeight;
    this.sprite.setDisplaySize(anim.frameWidth * scale, anim.frameHeight * scale);
    this.sprite.setOrigin(anim.footAnchor.x, originY);
    if (fallback && fallback.scaleX !== 1) this.sprite.scaleX *= fallback.scaleX;
    const offsetX = (anim.offsetX ?? 0) + (fallback?.offsetX ?? 0);
    const offsetY = (anim.offsetY ?? 0) + (fallback?.offsetY ?? 0);
    const x = state ? state.x : this.sprite.x;
    const feetY = state ? state.feetY : this.sprite.y;
    this.sprite.setPosition(x + offsetX * facing, feetY + offsetY);
    this.sprite.setAngle((fallback?.angle ?? 0) * facing);
    this.sprite.setFlipX(facing < 0);
  }
}

function slamSheetFrame(state: CharacterViewState): number {
  if (state.attackPhase === 'active') return 4;
  if (state.attackPhase === 'recovery') return 5;
  if (state.slamStep !== 'hop') return 0;
  const diveAfter = state.slamDiveAfterMs;
  if (diveAfter > 0 && state.slamHopAgeMs >= diveAfter) return 3;
  if (state.velocityY > 200) return 3;
  if (diveAfter > 0 && state.slamHopAgeMs >= diveAfter / 2) return 2;
  return 1;
}

export function preloadCharacterSprites(scene: Phaser.Scene, set: CharacterSpriteSet): void {
  for (const anim of set.anims) {
    if (scene.textures.exists(anim.textureKey) || !hasCharacterAsset(anim.url)) continue;
    scene.load.spritesheet(anim.textureKey, anim.url, {
      frameWidth: anim.frameWidth,
      frameHeight: anim.frameHeight
    });
  }
}

export function ensureCharacterAnimations(scene: Phaser.Scene, set: CharacterSpriteSet): void {
  for (const anim of set.anims) {
    if (scene.anims.exists(anim.textureKey) || !scene.textures.exists(anim.textureKey)) continue;
    scene.anims.create({
      key: anim.textureKey,
      frames: scene.anims.generateFrameNumbers(anim.textureKey, { frames: [...anim.frames] }),
      frameRate: anim.frameRate,
      repeat: anim.repeat
    });
  }
}
