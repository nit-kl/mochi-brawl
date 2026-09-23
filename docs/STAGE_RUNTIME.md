# STAGE_RUNTIME

ステージの数値と、試合中の足場を分けている。

## 定義

`StageDefinition` が id、表示名、出現位置、復活位置、KO 境界、足場を持つ。おひるね草原以外を足すときは、この型の定数を増やす。

下 KO を使うステージは `koBounds.bottomKoEnabled` を true にする。おひるね草原は false。

`shrinkPhases` は型に残している。おひるね草原は `normal` だけを入れ、試合中の縮小には使わない。

## 実行

`StageRuntime` が定義から矩形と Static Body を作る。矩形は非表示で、絵は `StageArtView` が同じ位置に重ねる。`BattleScene` は Fighter の物理体を `bind` する。

足場は作ったあと動かさない。浮遊足場も消さない。台座の帯は描かない。

`currentKoBounds()` は定義の KO 境界をそのまま返す。BattleScene は毎フレームこの境界をストック判定へ渡す。
