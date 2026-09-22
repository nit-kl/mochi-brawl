# STAGE_RUNTIME

ステージの数値と、試合中の足場変化を分けている。

## 定義

`StageDefinition` が id、表示名、出現位置、復活位置、KO 境界、足場、縮小フェーズを持つ。おひるね草原以外を足すときは、この型の定数を増やす。

縮小しないステージは `shrinkPhases` を Phase 0 だけにする。タイミングが違うステージは `startSec` を変える。動く足場やギミックは、今回の Runtime には入れていない。

## 実行

`StageRuntime` が定義から矩形と Static Body を作る。矩形は非表示で、絵は `StageArtView` が同じ位置に重ねる。`BattleScene` は Fighter の物理体を `bind` する。

毎フレーム `update(elapsedMs)` が、今のフェーズに応じて足場を更新する。

- 浮遊足場: 位置と透明度を動かし、`StaticBody.updateFromGameObject()` で当たりを見た目に合わせる。終わりに `enable = false`
- メイン足場: 中心と高さを固定して幅だけ変え、同じ方法で当たりを更新する

予告テキストも Runtime が出す。試合終了後は隠す。

`?shrink=fast` は定義の秒数をコピーしたうえで、消す時刻と縮める時刻だけを 10 秒と 20 秒に置き換える。定義ファイルの 180 秒と 300 秒は変えない。
