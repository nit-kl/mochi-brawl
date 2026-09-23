# SCENE_FLOW

対戦の前に、タイトル、キャラクター選択、ステージ選択を通る。

## Scene

1. `TitleScene` — スマホは「はじめる」で CPU 対戦。PC は「ひとりで」または「ふたりで」
2. `CharacterSelectScene` — 1P のキャラクター。プレビューは idle
3. `StageSelectScene` — `STAGE_LISTINGS` のステージ。今はおひるね草原
4. `BattleScene` — 選択結果で Fighter とステージを作る

選択画面では、対戦用のスティックと3ボタンは出さない。

## 選択結果

`MatchSetup` を Phaser の registry に保存する。

- `mode`: `cpu` または `local_vs`
- `player1CharacterId`
- `player2CharacterId`
- `stageId`

1P が選んだキャラクターが Player 1。Player 2 は `opponentProfile` の戻り値。もちまるを選ぶと 2P はぽてち、ぽてちを選ぶと 2P はもちまる。CPU 対戦でも同じ関数を使う。

`cpu` の 2P は `CpuInput`。`local_vs` の 2P は矢印キーで、CPU は作らない。1P はどちらもキーボードと、タッチ端末ではタッチ。スマホの CPU 対戦では、タッチ UI は 1 人分だけ出す。

CPU は `currentKoBounds()` の今の左右を見て、近いときは中央へ戻る。下へ落ちたあとの復帰はしない。再戦は同じ `mode` のまま始める。

## 操作

タイトル（PC）:

- ← → で「ひとりで」「ふたりで」
- Enter で決定。ボタンのクリックでも決まる

キャラクター選択とステージ選択:

- PC: ← → または A D で選択。Enter または Space で決定。Esc で1つ戻る
- スマホ: カードをタップして選択。「決定」で進む。「もどる」で戻る

勝敗後:

- PC: R で再戦。Esc でキャラクター選択へ
- スマホ: 「再戦」と「キャラ選択へ」
- 再戦は同じ `MatchSetup` のまま `BattleScene` をやり直す

## ステージを足すとき

`STAGE_LISTINGS` に `StageDefinition` とプレビュー画像を足す。選択画面のカードはその配列の長さで並ぶ。おひるね草原の当たり判定は `StageDefinition` のまま。試合中にステージは狭くしない。
