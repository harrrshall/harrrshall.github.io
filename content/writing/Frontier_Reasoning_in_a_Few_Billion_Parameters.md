---
title: "In the future, frontier reasoning will fit in a few billion parameters"
date: "2026-06-07"
excerpt: ""
coverImage: ""
dropcap: false
---

Start with the optimizer, because that is where most of the lift comes from.
**Aurora** is a leverage-aware successor to Muon. Muon orthogonalizes every
weight update, but on tall rectangular matrices it inherits the momentum
buffer's row-norm anisotropy, so a large share of neurons go dead early and
stay dead, a rich-get-richer collapse. Aurora relaxes the row-norm target to a
value compatible with orthogonality, keeping every neuron alive while preserving
the polar step. Drop-in, a few percent overhead.

![HRM + Aurora architecture](/img/writing/arch-hrm-aurora.png)

Now put it under a recurrent reasoner in its native regime. In **response-only
PrefixLM**, the task-completion objective HRM was built for, the result
reverses: **HRM beats a same-budget Transformer by 0.078 validation CE**
(1.327 vs 1.405), and tuned Aurora pushes it further, to **1.305**. The
recurrent core reuses its weights many times per pass, exactly the setting where
Aurora's refusal to let neurons die compounds.

One caution: Aurora's learning rate is decisive. 0.005 is the sweet spot, 0.01
is mediocre, 0.02 diverges outright. The optimizer that gives the most can also
break the run if you mistune it.

We also tried **fold-TST** on top. The gain is small and conditional: it
slightly hurts plain HRM and only helps once Aurora is tuned, taking the full
stack to 1.292. We are not convinced that edge is worth the extra machinery, so
it stays an open question, subject to further experiment.

One honest caveat: this lead is in step efficiency, the recurrent core runs
slower per step. But if the next round of frontier reasoning comes from small
recurrent cores trained well rather than ever-larger dense stacks, HRM + Aurora
is where I would place the first bet.

![PrefixLM final validation CE by arm](/img/writing/hrm-prefixlm-arms.png)

![Aurora learning-rate sensitivity on HRM](/img/writing/hrm-aurora-lr-cliff.png)
