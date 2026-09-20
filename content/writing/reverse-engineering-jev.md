---
title: "I tried reverse-engineering Jev"
date: "2026-09-20"
dropcap: false
excerpt: "what probing jev and training nine open replicas revealed about its behaviour, strengths and limitations."
---

## abstract

jev is typesafe's decision model. openjev investigates how it behaves and how closely an open model can reproduce its answers. we studied its responses, timing and billing information, then trained nine replicas.

the strongest replicas answered 148 to 153 of 192 unseen rule questions correctly. jev answered 154 correctly. these results establish progress in reproducing behaviour; its internal design remains unknown.

## 1. what we investigated

jev accepts a state, meaning the information needed to make a decision, followed by questions. a state could describe a customer request, with a question asking which team should handle it. its question formats support choices, truth assessments and scores. probabilities express how much support it assigns to possible answers.

we wanted to understand how jev processes these decisions. typesafe describes a specialised architecture and a training method called rlcd. the public material inspected for this project leaves the exact network, learned weights and training recipe unspecified.

our investigation recorded 8,012 api calls, meaning requests sent to the service, with an estimated usage cost of 0.14 usd. we changed inputs systematically and compared the outputs. the explanations below use plain language to connect each measurement to what it suggests.

## 2. what the responses revealed

**answers arrive at nearly constant speed.** median response time stayed near 0.41 seconds across tests ranging from 1 to 32 questions and 2 to 64 options. reported output length grew from 31 to 618 tokens, the text units used for billing. this supports parallel answer production. timing alone cannot establish the exact number of internal processing steps.

**repeated answers reveal a pattern.** identical requests sometimes returned slightly different probabilities. we examined 214 groups of repeated requests and compared their variation with simulated mechanisms. simple vote counting, where repeated answers become percentages, failed to explain the observed pattern. small disturbances in internal numerical scores, called logits, fit more closely. a separate 500 call experiment reproduced a similar disturbance size. the source of that variation remains unknown.

![figure 1. variation across identical requests. disturbances in internal scores fit the observed pattern more closely than the tested vote counting mechanism.](/writing/jev/figure-1.svg)

*figure 1. variation across identical requests. disturbances in internal scores fit the observed pattern more closely than the tested vote counting mechanism.*

**questions showed little interaction in the tested setting.** the follow-up experiment asked four ambiguous questions together and separately. their fluctuations showed no detectable shared pattern at the experiment's sensitivity. another test duplicated an answer option: its probability moved by 0.40 within its own question, while the neighbouring question's measured change was 0.00. this supports question isolation under these conditions.

**answer options influence one another.** duplicating an option produced a combined probability of 0.31 where the tested independent scoring calculation predicted 0.84. changing option order moved a probability by as much as 0.21. changing meaningful option identifiers could also change the answer. applications should therefore treat option wording, identifiers and order as consequential inputs.

**billing information exposes request structure.** input counts suggested a fixed preamble of roughly 277 tokens and about 10 additional tokens per option. the state appeared to be billed once per request. we compared 46 public tokenizers, the systems that divide text into tokens. the closest candidates matched 82 to 86 percent of counts exactly. none established jev's tokenizer identity or underlying model.

**confidence reveals additional precision.** across 7,276 choice answers, the confidence field was consistent with a formula based on the highest probability and number of options. because displayed probabilities are rounded, this extra field helped estimate the underlying value more precisely.

## 3. building and testing openjev

we used qwen3-4b-instruct, an open language model with roughly four billion parameters, as the replica's foundation. we added a small scoring network that considers answer features and positions. training encouraged its probabilities to match jev's probabilities. correct answer labels were reserved for evaluation.

we compared three training setups, each repeated with three random seeds, which control training randomness. every model received 288 updates on one l4 gpu. the first setup learned routing tasks while keeping the foundation model unchanged. the second added rule tasks. the third also used lora, a method that trains small additions inside the foundation model.

on 192 unseen rule questions, the results were:

- routing data with an unchanged foundation: 92, 88 and 92 correct.
- added rule data with an unchanged foundation: 109, 112 and 112 correct.
- added rule data and lora: 148, 149 and 153 correct.
- jev's highest probability answers: 154 correct.

![figure 2. accuracy for nine replicas against jev's 154 correct answers out of 192. each training setup was repeated three times.](/writing/jev/figure-2.svg)

*figure 2. accuracy for nine replicas against jev's 154 correct answers out of 192. each training setup was repeated three times.*

adapting the foundation substantially improved both accuracy and probability agreement. all nine saved models and the evaluation program were fixed before collecting jev's test answers, preventing those answers from guiding model selection.

## 4. what the result means

matching jev also reproduced weaknesses. jev solved 129 of 144 questions involving intervals, sets and paths through a network. it answered only 25 of 48 switch sequence questions correctly, close to chance. these questions require tracking repeated changes between two states. on longer unseen sequences, the adapted replicas agreed with jev about 90 to 92 percent of the time while every system remained near chance.

agreement therefore measures imitation; accuracy measures correctness. openjev demonstrates that targeted training can reproduce substantial behaviour on these tasks. estimated compute spending was under 20 usd, based on quotes and provider cost records rather than a reconciled invoice.

## limitations

- jev's exact architecture, weights, size, tokenizer and rlcd training objective remain unidentified.
- timing includes network delay, and billing counts may differ from internal processing lengths.
- several internal mechanisms could explain the observed probability variation.
- evaluation used synthetic tasks with shared templates; broader performance remains uncertain.
- the detailed question isolation replication covered one state and four questions.
- the measurements concern the tested version, jev-1.13.0.
