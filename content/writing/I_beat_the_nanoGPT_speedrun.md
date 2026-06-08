---
title: "I beat the nanoGPT speedrun"
date: "2026-06-07"
excerpt: ""
coverImage: ""
dropcap: false
---

One 124M-class Transformer, one H200, 87.3 minutes of wall clock. Final
validation loss **3.27681**, under the **3.28** nanoGPT speedrun target and
**0.0146** below my own plain-causal baseline (3.29139). Two seeds agree to
0.0007, so the margin is real, not noise.

## Architecture

![Transformer + Aurora + TST architecture](/img/writing/arch-transformer-aurora-tst.png)

| Knob | Value |
|------|-------|
| Architecture | 12-layer Transformer, dim 768, head_dim 128, vocab 50304 |
| Matrix optimizer | **Aurora**, `matrix_lr = 0.05`, weight_decay 0.025, momentum 0.95, 2 Newton-Schulz iters |
| Aux Adam (embed / head / scalar) | lr 0.3 / 0.003125 / 0.01, betas (0.8, 0.95), eps 1e-10 |
| TST | output-only, n_predict 3, smooth schedule, superposition_frac 0.30, recovery_frac 0.33 |
| Data / batch | FineWeb-10B, 524,288 tok/step, seq_len 1024, 3125 steps, cooldown 0.7 |

The win splits cleanly: the optimizer + LR leg carries about 65% of the gain
(-0.0094), the training objective adds the rest (-0.0051), and that second leg
is what crosses below the target. Both push the same direction.

## Why this is worth your attention

These two methods touch different surfaces (one is the optimizer, one is the
loss), so they stack without interfering, and each one was already validated
in isolation by its authors. Putting them on the same Transformer compounds
the gains for free at fixed compute. That is the property that matters: any
team training a frontier-scale model is optimizer-bound and throughput-bound at
once, and this recipe improves both seams without a single architecture change.
My bet is that recipes assembled this way, drop-in optimizer plus drop-in
objective on an untouched trunk, become the default starting point for the next
round of pretraining runs.

![Validation loss curves, only Aurora + TST dips under 3.28](/img/writing/beat-val-loss-curves.png)

![Final loss per arm: TST is the leg that crosses the line](/img/writing/beat-final-loss-bars.png)

![Attribution waterfall: 65% optimizer, 35% objective](/img/writing/beat-attribution-waterfall.png)

![The TST loss-weight schedule annealing back to next-token training](/img/writing/beat-tst-schedule.png)

![Train loss: TST runs hot while active, then rejoins the others](/img/writing/beat-train-loss-recovery.png)
