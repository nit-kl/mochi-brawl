import Phaser from 'phaser';
import { BattleScene } from './game/scenes/BattleScene';
import { CharacterSelectScene } from './game/scenes/CharacterSelectScene';
import { StageSelectScene } from './game/scenes/StageSelectScene';
import { TitleScene } from './game/scenes/TitleScene';
import { installGameTouchGuards } from './game/ui/gameTouchGuards';
import { watchDeviceLayout } from './game/ui/deviceLayout';
import './style.css';

installGameTouchGuards();
watchDeviceLayout(() => undefined);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#cfefff',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1400 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [TitleScene, CharacterSelectScene, StageSelectScene, BattleScene]
});
