import type { CharacterDefinition } from './CharacterDefinition';
import { MOCHIMARU } from './mochimaru';
import { POTECHI } from './potechi';
import { KEROTAN } from './kerotan';
import { BOTERO } from './botero';

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
    blurb: 'バランス型 / 空中戦が得意',
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
  },
  {
    character: KEROTAN,
    blurb: '跳躍スピード型 / 空中から攻める',
    marker: 0x54bc79,
    nameColor: '#25643d',
    bodyColor: 0x75d896
  },
  {
    character: BOTERO,
    blurb: '重量防御型 / 押し合いに強い',
    marker: 0xc78b42,
    nameColor: '#6a3f25',
    bodyColor: 0x987052
  }
];

export function profileById(id: string): CharacterProfile {
  return CHARACTER_ROSTER.find((entry) => entry.character.id === id) ?? CHARACTER_ROSTER[0];
}

/** 保存済みの2Pが無効なときの候補。 */
export function opponentProfile(selectedId: string): CharacterProfile {
  return CHARACTER_ROSTER.find((entry) => entry.character.id !== selectedId) ?? CHARACTER_ROSTER[0];
}
