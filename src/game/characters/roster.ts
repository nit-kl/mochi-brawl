import type { CharacterDefinition } from './CharacterDefinition';
import { MOCHIMARU } from './mochimaru';
import { POTECHI } from './potechi';

/** 選択画面と HUD 用。攻撃力や重量は CharacterDefinition 側のまま。 */
export type CharacterProfile = {
  character: CharacterDefinition;
  blurb: string;
  marker: number;
  nameColor: string;
  bodyColor: number;
};

export const CHARACTER_ROSTER: readonly CharacterProfile[] = [
  {
    character: MOCHIMARU,
    blurb: 'バランス型 / 復帰が得意',
    marker: 0x4c8dff,
    nameColor: '#1d4e89',
    bodyColor: 0x6aa6ff
  },
  {
    character: POTECHI,
    blurb: '重量パワー型 / 一撃が強い',
    marker: 0xf08a5d,
    nameColor: '#8a3d16',
    bodyColor: 0xf08a5d
  }
];

export function profileById(id: string): CharacterProfile {
  return CHARACTER_ROSTER.find((entry) => entry.character.id === id) ?? CHARACTER_ROSTER[0];
}

/** 1P が選ばなかった側。3人目以降の選択 UI はまだ無い。 */
export function opponentProfile(selectedId: string): CharacterProfile {
  return CHARACTER_ROSTER.find((entry) => entry.character.id !== selectedId) ?? CHARACTER_ROSTER[0];
}
