# mochi-brawl

かわいい小動物キャラクターたちが戦う、スマホ/PC両対応の2D Web対戦アクションゲーム。

## コンセプト

- 1vs1を基本とする横スクロール対戦アクション
- ダメージ蓄積式。ダメージが高いほど吹き飛びやすくなる
- 3ストック制、通常は時間制限なし
- 決着は左右または上への吹き飛ばし KO。時間でステージは狭くしない
- スマホは横持ち、左仮想スティック + 右3ボタン
- PCはキーボード/ゲームパッド対応

## 技術方針

- TypeScript
- Phaser 4
- Vite
- Git / GitHub
- IDE: VS Codeを想定

## 初期キャラクター

- もちまる: 初心者向けバランス型
- ぽてち: 重量パワー型

## 初期ステージ

- おひるね草原
  - 中央の草原と、左右の浮遊足場
  - 見えない床があり、下方向の KO はない
  - 時間では足場も KO 範囲も変えない

## 開発開始

```bash
npm install
npm run dev
```

## ドキュメント

- `docs/GAME_DESIGN.md` ゲーム全体仕様
- `docs/DEVELOPMENT_PLAN.md` 開発マイルストーン
- `docs/INPUT_SPEC.md` スマホ/PC入力仕様
- `docs/ASSET_GUIDE.md` アセット作成・配置ルール
- `docs/CHARACTER_SPEC.md` 初期キャラクター仕様
- `docs/STAGE_SPEC.md` 初期ステージ仕様

## アセットについて

`public/assets/**/concept/` 配下の画像は、ChatGPTで作成したコンセプト/設定資料です。
実ゲーム用スプライトは今後、透過PNG・統一キャンバス・統一基準点で別途作成します。
