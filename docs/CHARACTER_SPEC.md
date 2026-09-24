# CHARACTER_SPEC

## 追加2キャラ（4キャラロスター）

各キャラの性能は `src/game/characters/{id}.ts` の `CharacterDefinition` に集約する。Fighter にキャラ固有分岐は置かず、通常攻撃、横必殺、上必殺、下必殺を `AttackDefinition` で動かす。CPU 対戦と `local_vs` の双方で 1P・2P を選択できる。同じキャラ同士の対戦も可能。

| キャラ | 下必殺 | ダメージ | 特徴 |
| --- | --- | ---: | --- |
| もちまる | もちぷれす | 9 | 自分の周囲に衝撃波を出して打ち上げる |
| ぽてち | ぽてち地震 | 12 | 溜めてから周囲に岩を噴き上げる |
| けろたん | ローキック | 6 | 最速で前方の足元を狙う |
| ぼてろ | 岩盤シェル | 12 | ダメージを抑えて耐え、周囲を打ち上げる |

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
- 下 + 必殺: もちぷれす（体を縮めて周囲を打ち上げる）

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

もちぷれす:

- damage: 9
- startup / active / recovery: 160 / 150 / 260 ms
- 判定: 自分を中心に幅 164、高さ 58、中心を下に 24px
- baseKnockback: 365
- knockbackScaling: 8
- knockbackAngleDegrees: 72
- 移動不可。空中でも使用可能
- 溜め、体の縮み、周囲へ広がる衝撃波を専用の描画で表示

3 段コンボ、方向別の通常攻撃、風船の破裂はまだない。上のアクション一覧のうち、実装しているのはぺち、ぐるぐる突進、ふうせんジャンプ、もちぷれす。

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

- damage: 15
- startup: 160 ms。その後、前方 315・上 -510 で跳ぶ
- 155 ms 後に落下速度 1200。着地してから active 155 ms
- 開始から 950 ms 以内に着地しない場合は Hitbox を出さず、通常の空中状態に戻る
- recovery: 340 ms
- 着地 Hitbox: 幅 154、高さ 48、前方 16・下方 22
- baseKnockback: 540
- knockbackScaling: 10
- knockbackAngleDegrees: 42
- 同じ相手へは 1 ヒット
- 溜めの輪、跳躍中の速度線、着地時の岩と衝撃波を表示

ばねジャンプ:

- damage: 7
- startup / active / recovery: 95 / 185 / 220 ms
- 上昇速度: -940
- 横操作: 145
- 判定: 幅 62、高さ 82、中心を上に 12px
- baseKnockback: 250
- knockbackScaling: 5
- knockbackAngleDegrees: 83
- 空中では着地まで 1 回
- 専用スプライトの全 6 コマを使い、上昇線と光輪を重ねる

ぽてち地震:

- damage: 12
- startup / active / recovery: 210 / 155 / 320 ms
- 判定: 自分を中心に幅 190、高さ 58、中心を下に 25px
- baseKnockback: 470
- knockbackScaling: 9
- knockbackAngleDegrees: 68
- 移動不可。空中でも使用可能
- 体を縮めて溜め、岩の突起と広い衝撃波を描画

方向別の通常攻撃と 3 段コンボはまだない。

## ぼてろ

重量防御型。3 種の必殺技は、横の接近、上の対空・復帰、下の迎撃で使い分ける。

ドリルラッシュ（横必殺）:

- damage: 14
- startup / active / recovery: 165 / 355 / 310 ms
- 前方へ速度 590 で突進。判定は前方 44、幅 84、高さ 52
- 前方へ低く吹き飛ばす（23 度）
- ドリルの光輪と土くれを表示

採掘リフト（上必殺）:

- damage: 7
- startup / active / recovery: 95 / 175 / 240 ms
- 上昇速度 -900、横操作 120。判定は幅 62、高さ 78、中心を上に 16px
- ほぼ真上に打ち上げる（84 度）。空中では着地まで 1 回
- 光の柱と舞い上がる岩を表示

岩盤シェル（下必殺）:

- damage: 12
- startup / active / recovery: 225 / 170 / 330 ms
- 判定は自分を中心に幅 134、高さ 72、中心を下に 8px。72 度で打ち上げる
- startup と active のあいだは受けるダメージを半分にし、吹き飛ばされずに技を続ける。recovery には効果がない
- 岩の殻を張ってから周囲へ砕ける演出

## 吹き飛ばしと重量

```
knockback = (baseKnockback + (被弾前% + damage) × knockbackScaling) / weight
```

weight 1.0 が標準。小さいほど飛びやすく、大きいほど飛びにくい。
`knockbackLockMs` は操作で速度を上書きしない時間で、終わっても横速度は 0 にしない。空中では減衰し、着地すると通常の移動に戻る。
