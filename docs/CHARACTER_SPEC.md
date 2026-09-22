# CHARACTER_SPEC

## もちまる

### 役割

初心者向けバランス型。
復帰性能が高く、クセが少ない。

### 基本性格

- 臆病
- やさしい
- 仲間のためなら頑張る

### アクション

- 通常攻撃: ぺち → ぺち → どんっ
- 横 + 攻撃: 体当たり
- 上 + 攻撃: 上方向への打ち上げ
- 下 + 攻撃: 足元攻撃
- 空中 + 攻撃: 回転攻撃
- 必殺: ぐるぐる突進
- 上 + 必殺: ふうせんジャンプ

### 性能方針

- 移動: 標準
- ジャンプ: 標準〜やや高い
- 重さ: 標準
- 攻撃力: 標準
- 復帰: 高い

### 現在の実装値

`CharacterDefinition`（`src/game/characters/mochimaru.ts`）。

- displayName: もちまる
- moveSpeed: 280
- airMoveAcceleration: 3600
- jumpVelocity: -620
- maxJumps: 2
- gravityScale: 1
- weight: 1.0

ぺち:

- damage: 6
- startup / active / recovery: 70 / 90 / 150 ms
- baseKnockback: 280
- knockbackScaling: 7
- knockbackAngleDegrees: 28
- knockbackLockMs: 360
- canMoveDuringAttack: true

ぐるぐる突進:

- damage: 10
- startup / active / recovery: 120 / 360 / 250 ms
- 突進速度: 700
- baseKnockback: 440
- knockbackScaling: 9
- knockbackAngleDegrees: 18
- canMoveDuringAttack: false

ふうせんジャンプ:

- damage: 4
- startup / active / recovery: 80 / 140 / 200 ms
- 上昇速度: -980
- 横操作: 180
- baseKnockback: 150
- knockbackScaling: 3
- knockbackAngleDegrees: 80
- 空中では着地まで 1 回

3 段コンボ、方向別の通常攻撃、風船の破裂はまだない。上のアクション一覧のうち、実装しているのはぺち、ぐるぐる突進、ふうせんジャンプ。

---

## ぽてち

### 役割

重量パワー型。
移動とジャンプは控えめだが、一撃が強く吹き飛ばされにくい。

### 基本性格

- 元気
- 食いしん坊
- 単純
- 力持ち

### 性能方針

- 移動: 遅め
- ジャンプ: 低め
- 重さ: 高い
- 攻撃力: 高い
- 復帰: やや弱い

### 必殺技

詳細は実装前に確定する。
方向性として、もちまると重複する突進技だけに依存しない。

---

## 2P の仮キャラ

Milestone 06 まで、2P はぽてちに置き換えない。名前表示は「2P」。

- maxJumps: 1
- weight: 1.0
- 通常攻撃は Milestone 04 の仮攻撃のまま（damage 8、baseKnockback 320、knockbackScaling 8、角度 30 度、knockbackLockMs 380）
- 必殺と上必殺はなし

## 吹き飛ばしと重量

```
knockback = (baseKnockback + (被弾前% + damage) × knockbackScaling) / weight
```

weight 1.0 が標準。小さいほど飛びやすく、大きいほど飛びにくい。
`knockbackLockMs` は操作で速度を上書きしない時間で、終わっても横速度は 0 にしない。空中では減衰し、着地すると通常の移動に戻る。
