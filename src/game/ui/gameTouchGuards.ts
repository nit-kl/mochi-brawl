/** ゲーム画面のスクロール、選択、ピンチを抑える。ページ全体の意味は変えない。 */
export function installGameTouchGuards(): void {
  const root = document.getElementById('game');
  const hint = document.getElementById('rotate-hint');
  const blockMenu = (event: Event): void => {
    event.preventDefault();
  };
  root?.addEventListener('contextmenu', blockMenu);
  hint?.addEventListener('contextmenu', blockMenu);
  root?.addEventListener('touchmove', blockMenu, { passive: false });
  document.addEventListener('gesturestart', blockMenu);
  document.addEventListener('selectstart', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (root?.contains(target) || hint?.contains(target)) event.preventDefault();
  });
}
