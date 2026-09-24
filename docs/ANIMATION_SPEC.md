# ANIMATION_SPEC

見た目だけを決める。性能、ダメージ、吹き飛ばし、判定のサイズは変えない。

## 1. 分離

- `PlaceholderPlayer` は物理ボディだけを持つ
- `SpriteCharacterView` が `spriteSet` のあるキャラクターを出す
- `PlaceholderCharacterView` は `spriteSet` が無いキャラクター用
- アニメーション選択は `selectCharacterAnimation`

Sprite の `setDisplaySize` は表示用スプライトにだけかける。Arcade Body にはかけない。

## 2. 優先順位

1. hit（ノックバック中。着地するまで）
2. special_roll（ぐるぐる突進）
3. special_slam（どっすーん！）
4. up_special（ふうせんジャンプ、ばねジャンプ）
5. attack（通常攻撃。visual が default のときだけ）
6. jump（空中で上昇）または fall（空中でそれ以外）
7. run（地上で横速度がある）
8. idle

対応フレームが無い状態は、次の候補を出す。`attackFallback` は、attack 用シートが定義に無いときだけ使う。

## 3. 再生

| 状態 | フレーム | fps | 繰り返し |
| --- | --- | --- | --- |
| idle | 上段 2 コマ | 5 | ループ |
| run | 6 コマ | 10 | ループ |
| jump | 上段 2 コマ | 8 | ループ |
| fall | 上段 2 コマ | 7 | ループ |
| attack | 4 コマ | 13 | 1 回。ぺちの 310ms に合わせる |
| special_roll | 6 コマ | 12 | ループ |
| up_special | 6 コマ | 10 | ループ |
| hit | 4 コマ | 9 | 1 回で最後のコマを止める |

右向きが基準。左向きは `flipX = true`。Hitbox の向きは従来の facing のまま。

## 4. 足元

`footAnchor` が origin になる。横は 0.5、縦は実測した足元。毎フレーム、物理ボディの下端（中心から 36px 下）へ置く。任意の `offsetX` / `offsetY` は表示だけずらす。

`visualScale` はシートごとの表示倍率。もちまるの体は約 80px、ぽてちの体は約 96px。

## 5. 判定表示

F3 は Hurtbox、攻撃中の黄色い Hitbox、KO 境界を Sprite とは別に描く。あわせて `Animation` と `Frame` を出す。本番 HUD にも通常画面にも、その黄色は出さない。

## 6. ぽてち

定義は `potechiSprites.ts`。倍率は idle の体の高さ 360px を 96px にする値を全シートで共有する。

| 状態 | フレーム | fps | 繰り返し |
| --- | --- | --- | --- |
| idle | 4 コマ | 5 | ループ |
| jump | 1、2、4 コマ目。3 コマ目は足元が約 120px 高い | 8 | ループ |
| fall | 先頭 2 コマ。後ろ 2 コマは足元が 40〜80px 低い | 7 | ループ |
| attack | 4 コマ | 9 | 1 回。どすっの 430ms に合わせる |
| up_special | 全 6 コマ | 12 | 1 回再生し、最後のコマを維持 |
| run | 6 コマ | 8 | ループ |
| hit | 4 コマ | 9 | 1 回で最後のコマを止める |
| special_slam | 6 コマ。タイマー再生ではなく技の段階に合わせる | — | 段階が変わるまでそのコマ |

どっすーん！のコマ:

1. startup のしゃがみ
2. 跳び始め
3. 落下に入る前の空中
4. 急降下
5. 着地 Hitbox が出ているあいだ
6. recovery

時間切れで空中解除したとき、KO、復活のあとは idle か fall に戻る。
