# SCENE_FLOW

対戦の前に、タイトル、キャラクター選択、ステージ選択を通る。

## Scene

1. `TitleScene` — 「もちブロウル」と「はじめる」。Enter、クリック、タップで次へ
2. `CharacterSelectScene` — 1P のキャラクター。プレビューは idle
3. `StageSelectScene` — `STAGE_LISTINGS` のステージ。今はおひるね草原
4. `BattleScene` — 選択結果で Fighter とステージを作る

選択画面では、対戦用のスティックと3ボタンは出さない。

## 選択結果

`MatchSetup` を Phaser の registry に保存する。中身は `player1CharacterId`、`player2CharacterId`、`stageId`。

1P が選んだキャラクターが Player 1。Player 2 はロスターの残り。もちまるを選ぶと 2P はぽてち、ぽてちを選ぶと 2P はもちまる。

`BattleScene` は起動時にこの結果を読み、左を 1P、右を 2P として出す。操作はこれまでどおり、1P がキーボードとタッチ、2P が矢印キー。

## 操作

キャラクター選択とステージ選択:

- PC: ← → または A D で選択。Enter または Space で決定。Esc で1つ戻る
- スマホ: カードをタップして選択。「決定」で進む。「もどる」で戻る

勝敗後:

- PC: R で再戦。Esc でキャラクター選択へ
- スマホ: 「再戦」と「キャラ選択へ」
- 再戦は同じ `MatchSetup` のまま `BattleScene` をやり直す

## ステージを足すとき

`STAGE_LISTINGS` に `StageDefinition` とプレビュー画像を足す。選択画面のカードはその配列の長さで並ぶ。おひるね草原の当たり判定と縮小は `StageDefinition` のまま。
