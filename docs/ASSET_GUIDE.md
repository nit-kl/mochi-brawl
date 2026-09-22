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
- 同一キャラクターは同一キャンバスサイズ
- 足元の基準位置を統一
- 左右反転で破綻するデザインを避ける
- 可能なら1フレームごとの個別PNG + spritesheet JSON生成

### 命名規則

```text
mochimaru_idle_01.png
mochimaru_run_01.png
mochimaru_jump_01.png
mochimaru_fall_01.png
mochimaru_attack_01.png
mochimaru_attack_02.png
mochimaru_attack_03.png
mochimaru_special_roll_01.png
mochimaru_special_balloon_01.png
mochimaru_hit_01.png
mochimaru_ko_01.png
mochimaru_win_01.png
```

## 5. ステージ素材

背景とコリジョン用足場を分離する。

- background: 遠景・中景・前景
- platforms: 実際の足場画像
- collision: コード側の矩形/ポリゴンで管理

縮小ステージは画像差し替えだけに依存せず、足場オブジェクトの削除/縮小で実装する。

## 6. UI

スマホ用操作UIはSVGまたは高解像度PNGを推奨。
ゲーム内HUDは9-sliceまたはCSS/Canvas描画でもよい。
