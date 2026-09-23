# ASSET_GUIDE

## 1. 方針

ChatGPTで作る設定画と、ゲームで直接使用する実装用素材を分けて管理する。

## 2. フォルダ

```text
public/assets/
├─ characters/
│  ├─ mochimaru/
│  │  ├─ concept/
│  │  ├─ sprites/
│  │  └─ portraits/
│  └─ potechi/
│     ├─ concept/
│     ├─ sprites/
│     └─ portraits/
├─ stages/
│  └─ ohirune-meadow/
│     ├─ concept/
│     ├─ background/
│     └─ platforms/
├─ ui/
├─ effects/
└─ audio/
```

## 3. コンセプト画像

`concept/` 配下は仕様確認用。
ゲームに直接使用する前提ではない。

現在同梱済み:

- `mochimaru_character_sheet.png`
- `mochimaru_action_sheet.png`
- `potechi_character_sheet.png`
- `ohirune_meadow_stage_sheet.png`

## 4. 実ゲーム用キャラクター素材

### 推奨仕様

- PNG
- 背景透過
- 1 アニメーションにつき 1 枚の均等グリッド
- フレームの外にはみ出さない
- 接地するコマは足元の余白を揃える
- 右向きだけ。左向きはゲーム側で反転する

### もちまる（Milestone 09-A）

`public/assets/characters/mochimaru/sprites/`

| ファイル | 画像 | グリッド | ゲームでの再生 |
| --- | --- | --- | --- |
| `mochimaru_idle.png` | 1254×1254 RGBA | 627×627 の 2×2 | 上段 2 コマ。下段は足元が 47px 高い |
| `mochimaru_run.png` | 1536×1024 RGBA | 512×512 の 3×2 | 6 コマ |
| `mochimaru_jump.png` | 1254×1254 RGBA | 627×627 の 2×2 | 上段 2 コマ。下段は足元が約 70px 高い |
| `mochimaru_fall.png` | 1254×1254 RGBA | 627×627 の 2×2 | 上段 2 コマ。下段は足元が約 70px 高い |
| `mochimaru_attack.png` | 2172×724 RGBA | 543×724 の横 4 コマ | 4 コマ。星は 3 コマ目と 4 コマ目の境にかかる |
| `mochimaru_special_roll.png` | 1536×1024 RGBA | 512×512 の 3×2 | 6 コマ。下段は上段より足元が約 60px 高い |
| `mochimaru_up_special.png` | 1536×1024 RGBA | 512×512 の 3×2 | 6 コマ。足元余白は 33〜52px |
| `mochimaru_hit.png` | 1254×1254 RGBA | 627×627 の 2×2 | 4 コマ。倒れポーズは立ちポーズより高い |

空のすき間にある半透明画素は alpha 1〜2 で、表示には出てこない。

体の高さがゲーム内で約 80px になるようにシートごとに縮尺する。物理ボディは 56×72 のまま。

### ぽてち（Milestone 09-B）

`public/assets/characters/potechi/sprites/`。8 枚とも 2172×724、RGBA、背景透過。

| ファイル | 中身 | ゲームでの再生 |
| --- | --- | --- |
| `potechi_idle.png` | 543×724 の横 4 コマ。足元余白 162〜164px | 4 コマ |
| `potechi_jump.png` | 横 4 コマ。1 コマ目は境を 4px 超える。3 コマ目は足元が約 120px 高い | 1、2、4 コマ目 |
| `potechi_fall.png` | 横 4 コマ。境は超えない。後ろ 2 コマの足元が 40〜80px 低い | 先頭 2 コマ |
| `potechi_attack.png` | 横 4 コマ。星は 3 コマ目と 4 コマ目の境にかかる | 4 コマ |
| `potechi_up_special.png` | 6 体。間隔は 329〜374px。362px 切りでは後ろ 2 コマが境にかかる | 先頭 3 コマ |
| `potechi_hit.png` | 横 4 コマ。境は超えない | 4 コマ |
| `potechi_run.png` | 2172×724。362×724 の横 6 コマ。足元余白は 208〜214px。4 コマ目の土煙が前のコマへ 13px 入る | 6 コマ |
| `potechi_special_slam.png` | 2172×724。362×724 の横 6 コマ。着地爆発の縁が左右へ約 20px 入る。体は各コマの中 | 6 コマ。段階に合わせて表示 |

体の高さは約 96px。物理ボディは 56×72 のまま。

## 5. ステージ素材

`public/assets/stages/ohirune-meadow/`

| ファイル | 画像 | 使い方 |
| --- | --- | --- |
| `background.png` | 1672×941 RGB。透過なし。画面比はほぼ 16:9 | 1280×720 の背面。判定なし |
| `main_platform_left.png` | 2172×724 RGBA。草の上面は y=218 付近で水平 | メイン足場。左右端を残し、中央を切り詰める |
| `main_platform_center.png` | 1448×1086 RGBA。上面が 217〜355 で傾く。四周に余白 | 未使用。平らな帯と切れ目が合わない |
| `main_platform_right.png` | 1448×1086 RGBA。上面が 248〜366 で傾く | 未使用。同上 |
| `floating_platform_left.png` | 1448×1086 RGBA。中央の草は y=403 | 左の浮遊足場 |
| `floating_platform_right.png` | 1448×1086 RGBA。中央の草は y=409。右端の葉が画像端に触れる | 右の浮遊足場 |

当たり判定はコードの矩形のまま。草の絵は幅 820 のまま中央に置く。台座は足さない。時間でステージは狭くしない。

## 6. UI

スマホ用操作UIはSVGまたは高解像度PNGを推奨。
ゲーム内HUDは9-sliceまたはCSS/Canvas描画でもよい。
