---
name: deep-research
description: >-
  Answer a broad, open-ended, or multi-part question by iteratively searching
  MFS-indexed sources, following up on gaps, and synthesizing a cited report —
  the same "reason and search over private data" job zilliztech/deep-searcher
  does, but as a skill on top of `mfs-find` instead of a standalone framework.
  Use when the user asks for a report, a comprehensive/synthesized answer, a
  "what do we know about X across everything we have", or a question that
  can't be answered from a single search hit. Trigger phrases include "write
  a report on X", "deep-dive into X using our data", "research X across all
  our sources", "give me a comprehensive answer on X with citations",
  "synthesize what we know about X". Do NOT use for a single fact lookup or a
  targeted question with an obvious one-hit answer — use `mfs-find` directly
  for that; this skill is for genuinely broad, multi-angle asks. Requires
  `mfs-find` for the underlying search/read mechanics.
---
# 基于 MFS 索引来源的深度研究

## 1. 这是什么（以及它取代了什么）

[deep-searcher](https://github.com/zilliztech/deep-searcher) 是一个对私有数据进行推理的开源框架：它将问题分解，迭代式地搜索向量数据库，评估证据是否充分，并合成一份带引用的报告。它诞生于智能体编码工具出现之前，因此不得不亲手打造每一个部件——文档加载器、覆盖多供应商的 LLM/嵌入/向量数据库矩阵，以及一个用 Python 编写的自定义迭代检索编排循环。

这些编排如今都不再需要。MFS 已经能够对多种来源类型进行摄取 + 混合搜索，而智能体一旦拥有搜索工具，其自身的推理循环本来就能原生完成“搜索、判断、跟进、重复”。本技能正是那块缺失的拼图：不是新的检索代码，只是通过 `mfs search` / `mfs cat` 运行 deep-searcher 的 分解 → 搜索 → 评估 → 合成 循环的**策略**。

本技能假定实际的命令机制（搜索模式、定位器、`--peek`/`--skim`、索引状态诊断）由 `mfs-find` 承担。这些细节请阅读该技能——本技能只在其上叠加多轮策略。

## 2. 前置条件：来源必须已被索引

与 `mfs-find` 相同：先运行 `mfs status` / `mfs connector inspect <uri>`。如果尚未索引任何相关内容，**转向 `mfs-ingest`**——不要对着空索引运行研究循环。

## 3. 循环

```
 decompose            search rounds              evaluate           synthesize
┌───────────┐   ┌───────────────────────┐   ┌──────────────────┐   ┌───────────┐
│ 2-4 angles│ → │ mfs search per angle,  │ → │ enough coverage? │ → │  cited    │
│ on the Q  │   │ semantic + keyword     │   │ gaps → new angles│   │  report   │
└───────────┘   └───────────────────────┘   └──────┬───────────┘   └───────────┘
                        ▲                            │ not enough
                        └────────────────────────────┘ (max ~4 rounds)
```

1. **分解。** 在搜索任何内容之前，先把问题拆解为 2-4 个具体角度。“针对我们的限流历史写一份报告”可以拆解为：*当前实现*、*过往事故/缺陷*、*设计讨论/理由*、*配置项*。除了最窄的问题之外，对原始问题做单次搜索都会漏检大量内容。

2. **逐一搜索每个角度**，作用域遵循 `mfs-find` §6-7（默认混合模式，真正跨来源的问题用 `--all`，否则限定为 2-3 个最可能的来源）：
   ```bash
   mfs search "<angle 1>" <scope> --top-k 15
   mfs search "<angle 2>" <scope> --top-k 15
   ...
   ```
   追踪找到的**不同对象**（按 `source` 去重），而不是原始命中数——来自同一个文件的五个分片只算一条引用，而不是五条。

3. **在通读全部内容之前先评估覆盖度。** 对每个角度：是否至少有一个强命中？对整个问题：把找到的对象合起来读，能否真正回答它，还是仅仅证明该主题存在？常见缺口包括：某个角度一无所获（换种说法重新表述，不要默默丢弃）；问题暗示需要更多来源类型时，所有命中却都来自单一类型（例如只有代码、没有设计文档）；或者某个命中引用了尚未找到的内容（“参见迁移文档”）。

4. **跟进，而不是从头再来。** 缺口会转化为 1-3 次新的定向搜索——复用第一轮中实际发现的词汇（真实的错误码、真实的文档标题），而不是继续猜测原始问题的更多同义词。这一步正是 deep-searcher 中由 LLM 驱动的查询改写所自动化的环节；在这里，它只是又一次由返回结果引导的 `mfs search` 调用。

5. **停止条件。** 以最先满足者为准：
   - 某一轮没有新增任何不同对象（饱和），或
   - 每个分解出的角度都有强命中且不存在未解决的引用，或
   - **约 4 轮**（审视投入是否仍有回报；如果再补一次显而易见的查询就能填补一个真实缺口，就不要硬性停在第 4 轮——但也不要为了追逐边际召回而继续空耗）。

6. **先读后写。** 在引用之前，对每个候选的不同对象执行 `mfs cat --skim`（代码用 `--peek`）——搜索分片足以判断相关性，但不足以据此撰写论断。只对论断真正依赖的小节使用完整的 `cat --range`。

## 4. 报告格式

- 按分解出的角度（或按发现本身自然呈现的结构）组织报告，而不是按搜索轮次的顺序。
- 在每条论断后使用 `source` URI **进行行内引用**，例如 `... retries with exponential backoff (server/python/src/mfs_server/engine/pipeline.py)`。绝不在不注明出处的情况下陈述从搜索得到的事实——“报告”中没有引用的论断与凭空猜测无异。
- 结尾附上一个扁平的**来源**列表，列出每一个被引用的不同对象，让用户可以直接跳转到其中任何一个。
- 当某个角度一无所获时直说（“未找到 X 的设计理由——只有实现”），而不是粉饰这个缺口。

## 5. 反模式

- **不要用一次搜索调用来回应“写一份报告”的请求。** 这正是本技能旨在防止的失败模式——即使最靠前的命中看起来相关，单次查询也无法充分覆盖一个多角度的问题。
- **饱和之后不要继续搜索。** 如果连续两轮都没有出现新的不同对象，就停下来，把已有的内容写出来——更多轮次无法制造出未被索引的证据。
- **不要引用你没有读过的分片。** 分片得分是相关性信号，不是经过验证的事实。
- **不要将此技能用于窄小的、一次命中即可解决的问题**（“`MFS_API_TOKEN` 是做什么的”）——那是 `mfs-find` 一次调用就能完成的工作；对其运行完整循环只是白白消耗轮次。
- **不要默默丢弃一无所获的角度**——要说出来，或者在放弃之前换用不同的词汇重新表述一次。
