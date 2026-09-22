# INPUT_SPEC

## 1. 共通入力モデル

入力デバイスからキャラクターを直接操作しない。
全デバイスを `PlayerInput` に変換する。

```ts
export type PlayerInputState = {
  moveX: number;   // -1.0 .. 1.0
  moveY: number;   // -1.0 .. 1.0
  jump: boolean;
  attack: boolean;
  special: boolean;
  dodge: boolean;
};
```

## 2. スマホ

横持ち前提。

### 左手

- 仮想スティック
  - 左右: 移動
  - 上: 上方向技入力
  - 下: 急降下 / 下方向技入力

### 右手

現在出しているボタン。

- 攻撃（ジャンプの上）
- ジャンプ

必殺ボタンは Milestone 07 で足す。

### 技派生

方向と組み合わせた攻撃、空中攻撃の差別化、必殺はまだ実装しない。
攻撃ボタンは、押したフレームだけ `attack: true` になる。

## 3. PCキーボード

1P と 2P でキーを分けている。同じキーを両方に割り当てない。

### 1P

- A / D: 左右移動
- W / Space: ジャンプ
- S: 下方向入力（`moveY`。移動には使わない）
- J: 通常攻撃

### 2P

PC で 2 人目を試すための割り当て。

- ← / →: 左右移動
- ↑: ジャンプ
- ↓: 下方向入力（`moveY`。移動には使わない）
- Enter: 通常攻撃

ジャンプと攻撃は、押したフレームだけ `true` になる。
必殺（K）と回避（Shift）、ゲームパッドはまだ結線していない。`PlayerInputState` の `special` と `dodge` は、どのデバイスも `false` のまま渡す。

## 4. ゲームパッド

- Left Stick: 移動
- A / Cross: ジャンプ
- X / Square: 攻撃
- Y / Triangle: 必殺
- LB / L1: 回避

## 5. 自動補助

- 近距離では相手方向へ自動振り向き
- 崖つかまり自動
- 復帰技時の方向補正
- 微小段差は自動で乗り越える
