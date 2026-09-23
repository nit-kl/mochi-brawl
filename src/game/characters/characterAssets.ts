/** public に置いた画像をビルド時に列挙する。画像を追加したら開発サーバーを再起動する。 */
const portraits = import.meta.glob('/public/assets/characters/*/portraits/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const newSprites = import.meta.glob('/public/assets/characters/{kerotan,botero}/sprites/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});

export function hasCharacterAsset(path: string): boolean {
  const normalized = `/public/${path.replace(/^\//, '')}`;
  if (/^\/public\/assets\/characters\/(mochimaru|potechi)\/sprites\//.test(normalized)) return true;
  return normalized in portraits || normalized in newSprites;
}

export function portraitKey(id: string, kind: 'select' | 'hud'): string {
  return `${id}-${kind}-portrait`;
}

export function portraitUrl(id: string, kind: 'select' | 'hud'): string {
  return `assets/characters/${id}/portraits/${kind}.png`;
}

export function preloadCharacterPortrait(scene: Phaser.Scene, id: string, kind: 'select' | 'hud'): void {
  const url = portraitUrl(id, kind);
  const key = portraitKey(id, kind);
  if (hasCharacterAsset(url) && !scene.textures.exists(key)) scene.load.image(key, url);
}
