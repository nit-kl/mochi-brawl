# CHARACTER_SPEC

## 追加2キャラ（4キャラロスター）

各キャラの性能は `src/game/characters/{id}.ts` の `CharacterDefinition` に集約する。Fighter にキャラ固有分岐は置かず、通常攻撃、横必殺、上必殺、下必殺を `AttackDefinition` で動かす。CPU 対戦と `local_vs` の双方で 1P・2P を選択できる。同じキャラ同士の対戦も可能。

| キャラ | 下必殺 | ダメージ | 特徴 |
| --- | --- | ---: | --- |
| もちまる | 足払い | 7 | 発生が速い足元攻撃 |
| ぽてち | 地ならし | 12 | 発生は遅いが左右に広い |
| けろたん | ローキック | 6 | 最速で前方の足元を狙う |
| ぼてろ | 地面たたき | 11 | 自分の周囲を打ち上げる |

上必殺も全員ダメージ判定を持つ（もちまる 4、ぽてち 6、けろたん 4、ぼてろ 6）。防御は全員共通で、地上で押している間は攻撃を防ぐ。耐久値を使い切ると一時的に防御できなくなる。

| ID | 名前 | タイプ | 移動速度 | 重量 | 固有の方向性 |
| --- | --- | --- | ---: | ---: | --- |
| `kerotan` | けろたん | 跳躍スピード型 | 300 | 0.9 | 高いジャンプと速い突進 |
| `botero` | ぼてろ | 重量防御型 | 215 | 1.55 | 遅いが強い通常攻撃と突進 |

けろたんは黄緑のカエル、ぼてろは黄色いヘルメットをかぶった茶色のモグラ。提供画像を参照したスプライトと選択・HUD画像を配置済み。画像の配置先と規格は `ASSET_GUIDE.md` を参照。

けろたんの通常攻撃は「構え→殴り→蹴り→戻り」の4コマ。舌を伸ばす演出は横必殺のみで使う。

## もちまる

### 役割

初心者向けバランス型。
空中戦と位置取りがしやすく、クセが少ない。

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
- 上 + 必殺: ふうせんジャンプ（空中移動。落下 KO からの復帰技ではない）
- 下 + 必殺: 足払い

### 性能方針

- 移動: 標準
- ジャンプ: 標準〜やや高い
- 重さ: 標準
- 攻撃力: 標準
- 上必殺: 空中戦・高所移動向け。上昇は強い

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

3 段コンボ、方向別の通常攻撃、風船の破裂はまだない。上のアクション一覧のうち、実装しているのはぺち、ぐるぐる突進、ふうせんジャンプ、足払い。

### 表示

1P は本番スプライト。定義は `mochimaruSprites.ts`。見た目の体の高さは約 80px で、足元を物理ボディの下端に合わせる。左向きは flipX。

再生するのは idle、run、jump、fall、ぺち、ぐるぐる突進、ふうせんジャンプ、被弾。ぺちは 4 コマを 1 回再生する。

2P のぽてちも本番スプライト。詳細は `docs/ANIMATION_SPEC.md`。

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
- 上必殺: 空中戦向け。上昇はふうせんジャンプより低い

### 現在の実装値

`CharacterDefinition`（`src/game/characters/potechi.ts`）。2P はこの定義を使う。

- displayName: ぽてち
- moveSpeed: 240
- airMoveAcceleration: 2800
- jumpVelocity: -540
- maxJumps: 2
- gravityScale: 1.1
- weight: 1.4
- 表示: `potechiSprites.ts`。体の高さは約 96px。物理ボディは 56×72 のまま

どすっ:

- damage: 9
- startup / active / recovery: 110 / 100 / 220 ms
- baseKnockback: 380
- knockbackScaling: 9
- knockbackAngleDegrees: 30
- knockbackLockMs: 420
- canMoveDuringAttack: true

どっすーん！:

- damage: 14
- startup: 180 ms。その後、前方 260・上 -480 で跳ぶ
- 140 ms 後に落下速度 980。着地してから active 120 ms
- 開始から 800 ms 以内に着地しない場合は Hitbox を出さず、通常の空中状態に戻る
- recovery: 320 ms
- 着地 Hitbox: 幅 108、高さ 34、足元
- baseKnockback: 520
- knockbackScaling: 10
- knockbackAngleDegrees: 35
- 同じ相手へは 1 ヒット

ばねジャンプ:

- damage: 6
- startup / active / recovery: 100 / 140 / 240 ms
- 上昇速度: -850
- 横操作: 115
- baseKnockback: 220
- knockbackScaling: 4
- knockbackAngleDegrees: 80
- 空中では着地まで 1 回

方向別の通常攻撃と 3 段コンボはまだない。

## 吹き飛ばしと重量

```
knockback = (baseKnockback + (被弾前% + damage) × knockbackScaling) / weight
```

weight 1.0 が標準。小さいほど飛びやすく、大きいほど飛びにくい。
`knockbackLockMs` は操作で速度を上書きしない時間で、終わっても横速度は 0 にしない。空中では減衰し、着地すると通常の移動に戻る。
