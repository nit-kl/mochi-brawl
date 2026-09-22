import type { ShrinkPhase, StageDefinition } from './StageDefinition';

/** 確認用。URL に ?shrink=fast を付けると、本番の秒数を置き換える。 */
const FAST_PHASE_SEC = { dropSides: 10, shrinkMain: 20 } as const;

export function resolveShrinkPhases(definition: StageDefinition): ShrinkPhase[] {
  if (!isFastShrink()) return definition.shrinkPhases;
  return definition.shrinkPhases.map((phase) => {
    if (phase.id === 'drop-sides') return { ...phase, startSec: FAST_PHASE_SEC.dropSides };
    if (phase.id === 'shrink-main') return { ...phase, startSec: FAST_PHASE_SEC.shrinkMain };
    return phase;
  });
}

function isFastShrink(): boolean {
  return new URLSearchParams(window.location.search).get('shrink') === 'fast';
}
