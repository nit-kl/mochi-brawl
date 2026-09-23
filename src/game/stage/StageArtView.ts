import Phaser from 'phaser';

const VIEW_W = 1280;
const VIEW_H = 720;

const BG_KEY = 'ohirune-background';
const BG_URL = 'assets/stages/ohirune-meadow/background.png';
const BG_W = 1672;
const BG_H = 941;

/** 上面がほぼ水平な帯。center / right の斜め崖とは別物。 */
const MAIN_KEY = 'ohirune-main-strip';
const MAIN_URL = 'assets/stages/ohirune-meadow/main_platform_left.png';
const MAIN_CONTENT_X = 66;
const MAIN_CONTENT_W = 2040;
const MAIN_CAP_W = 240;
const MAIN_CROP_Y = 160;
const MAIN_CROP_H = 340;
const MAIN_GRASS_Y = 218;

const FLOAT_LEFT_KEY = 'ohirune-float-left';
const FLOAT_LEFT_URL = 'assets/stages/ohirune-meadow/floating_platform_left.png';
const FLOAT_RIGHT_KEY = 'ohirune-float-right';
const FLOAT_RIGHT_URL = 'assets/stages/ohirune-meadow/floating_platform_right.png';
const FLOAT_TARGET_W = 200;

type Slice = {
  image: Phaser.GameObjects.Image;
  texX: number;
  texW: number;
};

type FloatArt = {
  image: Phaser.GameObjects.Image;
  grassY: number;
  contentW: number;
};

/** 当たり判定の上に置く背景と足場。Collider の数値は持たない。 */
export class StageArtView {
  private readonly background: Phaser.GameObjects.Image;
  private readonly mainScale: number;
  private readonly leftCap: Slice;
  private readonly center: Slice;
  private readonly rightCap: Slice;
  private readonly floats: Record<string, FloatArt>;

  constructor(scene: Phaser.Scene, mainWidth: number) {
    this.mainScale = mainWidth / MAIN_CONTENT_W;
    this.background = scene.add.image(VIEW_W / 2, VIEW_H / 2, BG_KEY);
    this.background.setScale(Math.max(VIEW_W / BG_W, VIEW_H / BG_H));
    this.background.setDepth(-10);

    this.leftCap = this.slice(scene, MAIN_CONTENT_X, MAIN_CAP_W);
    this.center = this.slice(scene, MAIN_CONTENT_X + MAIN_CAP_W, MAIN_CONTENT_W - MAIN_CAP_W * 2);
    this.rightCap = this.slice(scene, MAIN_CONTENT_X + MAIN_CONTENT_W - MAIN_CAP_W, MAIN_CAP_W);

    this.floats = {
      left: this.floatArt(scene, FLOAT_LEFT_KEY, 403, 1317),
      right: this.floatArt(scene, FLOAT_RIGHT_KEY, 409, 1395)
    };
  }

  syncMain(centerX: number, centerY: number, width: number, height: number): void {
    const scale = this.mainScale;
    const capW = MAIN_CAP_W * scale;
    const centerW = Math.max(0, width - capW * 2);
    const sourceW = this.center.texW;
    const shown = Math.min(sourceW, centerW / scale);
    const inset = (sourceW - shown) / 2;
    const surfaceY = centerY - height / 2;
    const top = surfaceY - (MAIN_GRASS_Y - MAIN_CROP_Y) * scale;
    const left = centerX - width / 2;
    this.place(this.leftCap, this.leftCap.texX, this.leftCap.texW, left, top);
    this.place(this.center, this.center.texX + inset, shown, left + capW, top);
    this.place(this.rightCap, this.rightCap.texX, this.rightCap.texW, left + capW + centerW, top);
  }

  syncSide(id: string, centerX: number, centerY: number, height: number, alpha: number, visible: boolean): void {
    const art = this.floats[id];
    if (!art) return;
    const scale = FLOAT_TARGET_W / art.contentW;
    art.image.setVisible(visible);
    art.image.setAlpha(alpha);
    art.image.setScale(scale);
    art.image.setPosition(centerX, centerY - height / 2);
  }

  private slice(scene: Phaser.Scene, texX: number, texW: number): Slice {
    const image = scene.add.image(0, 0, MAIN_KEY);
    image.setDepth(0);
    image.setOrigin(0, 0);
    return { image, texX, texW };
  }

  private place(slice: Slice, texX: number, texW: number, screenX: number, screenY: number): void {
    const scale = this.mainScale;
    slice.image.setCrop(texX, MAIN_CROP_Y, Math.max(1, texW), MAIN_CROP_H);
    slice.image.setScale(scale);
    slice.image.setPosition(screenX - texX * scale, screenY - MAIN_CROP_Y * scale);
  }

  private floatArt(scene: Phaser.Scene, key: string, grassY: number, contentW: number): FloatArt {
    const image = scene.add.image(0, 0, key);
    image.setDepth(0);
    image.setOrigin(0.5, grassY / 1086);
    return { image, grassY, contentW };
  }
}

export function preloadOhiruneStageArt(scene: Phaser.Scene): void {
  if (!scene.textures.exists(BG_KEY)) scene.load.image(BG_KEY, BG_URL);
  if (!scene.textures.exists(MAIN_KEY)) scene.load.image(MAIN_KEY, MAIN_URL);
  if (!scene.textures.exists(FLOAT_LEFT_KEY)) scene.load.image(FLOAT_LEFT_KEY, FLOAT_LEFT_URL);
  if (!scene.textures.exists(FLOAT_RIGHT_KEY)) scene.load.image(FLOAT_RIGHT_KEY, FLOAT_RIGHT_URL);
}
