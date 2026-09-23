# CPU_AI

CPU は探索も学習もしない。`CpuInput` が、人間の入力と同じ `PlayerInputState` を 2P に渡す。

## 判断

`CpuProfile` の `normal` だけを使う。項目は `reactionMs`、`reactionJitterMs`、`attackChance`、`specialChance`、`mistakeChance`、`preferredDistance`、`recoveryThreshold`、`postAttackWaitMs`。

判断の間隔は 100〜250ms。攻撃や必殺のあとは、さらに `postAttackWaitMs` 待つ。待っている間は横移動だけを続ける。`mistakeChance` のときは、近づかずに逆へ歩くか、床の外でのジャンプを見送る。左右の KO 線の近くでは、そのミスより中央へ戻ることを優先する。

F3 のときだけ `CPU State` を出す。値は `approach`、`attack`、`recover`、`jump`、`special`。

## 戦闘

左右の KO 境界から 96px 以内では、中央へ歩く。床の下へ落ちているときだけ、ジャンプと上必殺で戻る。それ以外は次の順で決める。

1. 相手が上の足場にいるなら、相手の方向へジャンプする
2. `preferredDistance` 以内なら、`attackChance` で通常攻撃
3. それより遠く、横必殺の距離なら、`specialChance` で必殺
4. それ以外は相手の方向へ歩く

横必殺の距離は `specialAttack.motion` から取る。

- `dash`（ぐるぐる突進）: 少し離れた距離
- `slam`（どっすーん！）: 通常攻撃より遠く、跳びの距離まで
- `rise` は横必殺には使わない

## 左右の端

常設床の上では、下への落下復帰はしない。`currentKoBounds()` の左か右に近いときだけ、相手より中央方向を優先して歩く。

床の外まで落ちた場合は、`livePlatforms()` の今ある足場へ歩き、落下中はジャンプ、残っていれば 2 段ジャンプする。上必殺は `upSpecial.motion` が `rise` のとき、その落下中だけ使う。上昇速度が -900 より強いふうせんジャンプは、1 回ジャンプしたあと遠ければ早めに使う。ばねジャンプは、ジャンプを使い切ってから使う。判断ミスで使わないフレームがある。

## モード

`cpu` のときだけこの入力を作る。`local_vs` の 2P は矢印キーのまま。
