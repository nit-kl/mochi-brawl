/** スマホのひとり用と、PCの同じ端末での2人用。 */
export type MatchMode = 'cpu' | 'local_vs';

/** タイトルから対戦へ渡す選択結果。性能の数値は持たない。 */
export type MatchSetup = {
  mode: MatchMode;
  player1CharacterId: string;
  player2CharacterId: string;
  stageId: string;
};

export const DEFAULT_MATCH_SETUP: MatchSetup = {
  mode: 'local_vs',
  player1CharacterId: 'mochimaru',
  player2CharacterId: 'potechi',
  stageId: 'ohirune_meadow'
};

const REGISTRY_KEY = 'match-setup';

export function saveMatchSetup(scene: Phaser.Scene, setup: MatchSetup): void {
  scene.registry.set(REGISTRY_KEY, setup);
}

export function loadMatchSetup(scene: Phaser.Scene): MatchSetup {
  const stored = scene.registry.get(REGISTRY_KEY) as Partial<MatchSetup> | undefined;
  if (!stored?.player1CharacterId || !stored.player2CharacterId || !stored.stageId) {
    return DEFAULT_MATCH_SETUP;
  }
  return {
    mode: stored.mode === 'cpu' || stored.mode === 'local_vs' ? stored.mode : DEFAULT_MATCH_SETUP.mode,
    player1CharacterId: stored.player1CharacterId,
    player2CharacterId: stored.player2CharacterId,
    stageId: stored.stageId
  };
}
