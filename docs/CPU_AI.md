# CPU_AI

CPU は探索も学習もしない。`CpuInput` が、人間の入力と同じ `PlayerInputState` を 2P に渡す。Fighter は相手が CPU かを見ない。

## 判断

`CpuProfile` の `normal` だけを使う。項目は `reactionMs`、`reactionJitterMs`、`attackChance`、`specialChance`、`jumpChance`、`preferredRange`、`edgeSafetyDistance`、`mistakeChance`、`postAttackWaitMs`。

判断の間隔は 150〜250ms。攻撃モーションが終わったあとは、さらに `postAttackWaitMs` 待つ。待っている間は横移動だけを続ける。`mistakeChance` のときはボタンを押さず、今の横移動を続ける。

毎フレームでは判断しない。左右の KO 線に近いときだけ、待ち時間の途中でも中央方向への移動に切り替える。

F3 のときだけ、次を出す。

- `CPU State`: `approach`、`attack`、`retreat`、`jump`、`special`
- `Target distance`
- `Decision cooldown`
- `Edge danger`

通常の HUD には出さない。

## 戦闘

`currentKoBounds()` の左か右から `edgeSafetyDistance`（normal は 130px）以内では、攻撃より中央へ歩くことを優先する。中央は、そのときの左右 KO 線の中点。入りかけたら、約 80px 余分に内側へ戻ってから相手を追う。画面端の 0 や 1280 は見ない。

それ以外は、キャラクター名では分岐しない。`moveSpeed` と `AttackDefinition.motion` を見る。

1. 相手が明らかに上（約 80px 以上）なら、`jumpChance` でジャンプか上必殺
2. `preferredRange` 付近なら、`attackChance` で通常攻撃。移動速度が 280 より遅いキャラは、この距離を少し広げて手前から攻撃する
3. それより遠く、横必殺の距離なら、`specialChance` で必殺。進むと KO 線の内側 130px を越えそうなときは出さない
4. それ以外は相手の方向へ歩く。空中でも同じ

横必殺の距離は `specialAttack.motion` から取る。

- `dash`（ぐるぐる突進）: 近距離の少し外から、突進速度で届く中距離まで。空中でも出せる
- `slam`（どっすーん！）: 近距離の外から、跳びの水平速度で届く距離まで。地上で出す
- `rise` は横必殺には使わない

上必殺は `upSpecial.motion` が `rise` のときだけ使う。落下からの復帰には使わない。

- 上昇速度が -900 より強い（ふうせんジャンプ）: 空中で、相手が上にいるとき、近いとき、ジャンプのあとに出す
- それより弱い（ばねジャンプ）: 1 段ジャンプしたあとの空中で、相手が下にいないときに出す

通常攻撃と必殺とジャンプは、同じ判断フレームでは重ねない。上方向の入力は、その判断フレームだけ `-1` にする。

## 左右の端

下方向の KO は無い。床から落ちたあとの復帰（ジャンプ、2 段ジャンプ、上必殺で戻る）はしない。

ぐるぐる突進とどっすーん！は、入力では途中の向きを変えられない。危険な端へ向かって始まる見込みがあるときは、開始しない。攻撃中に歩ける技は、端に入ったフレームから中央方向の移動へ切り替える。

吹き飛ばされて KO されることはある。

## モード

`cpu` のときだけこの入力を作る。`local_vs` の 2P は矢印キーのまま。CPU は動かない。

スマホの `cpu` では、タッチ UI は 1P の 1 組だけ出す。
