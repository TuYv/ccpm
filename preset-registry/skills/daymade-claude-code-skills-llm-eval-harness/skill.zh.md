---
name: llm-eval-harness
description: >-
  Evaluate any LLM behind an OpenAI- or Anthropic-compatible endpoint across four
  dimensions: speed (TTFT + thinking-aware tokens/sec), concurrency/stability (success
  rate, p50/p90 latency, the level where it breaks), Anthropic protocol compliance
  (thinking-block trigger rate), and quality regression against your own accumulated
  use cases (blind-judge precision). Use whenever someone wants to benchmark, 测评, or
  压测 a model, verify a vendor's tokens-per-second claim, compare two
  models head-to-head, decide whether a newly released model is fast/stable/good enough
  before adopting it, measure TTFT or decode throughput, probe concurrency limits before
  a workshop or batch job, or check whether an "Anthropic-compatible" endpoint really
  implements thinking blocks. Triggers on "benchmark this model", "测一下这个模型的速度/
  质量", "is X tok/s real", "compare model A vs B", "这个模型能不能扛住并发", "接入新模型
  先测一下", even without the word "eval".
---
# LLM 评测工具集

## 概述

为此技能提供一个端点（`base_url` + `model` + 环境变量中的 API 密钥），它就会测量模型是否真的足够快速、稳定、符合协议且质量达标——而不是轻信供应商宣传的数字。它统一了通常散落在各种临时脚本中的四个评测维度：

| 维度 | 脚本 | 回答的问题 |
|---|---|---|
| **速度** | `scripts/speed_probe.py` | TTFT + 持续解码 tok/s，**可感知思考过程** |
| **并发能力/稳定性** | `scripts/concurrency_probe.py` | 成功率、p50/p90 延迟，以及从何处开始失效 |
| **协议合规性** | `scripts/protocol_probe.py` | Anthropic 的 `thinking` 块是否真的会触发（N≥10）？ |
| **质量/用例回归** | `scripts/usecase_runner.py` + 盲评裁判 | 它能否通过*你*积累的用例？ |

**密钥处理（不可妥协）：**每个脚本都通过**环境变量名**接收 API 密钥（`--key-env MY_KEY`），绝不通过命令行接收密钥值——这样密钥就不会出现在 `ps`、shell 历史记录或任何已保存的报告中。绝不要将密钥硬编码到用例文件或包装脚本中。请阅读 [references/evaluation_disciplines.md](references/evaluation_disciplines.md)，了解这一规范及其他规范背后的完整考量。

**你的私有数据应存放在此包之外。**用例库、模型名册和密钥应放在 `~/.llm-eval/`（或你存放机密信息的任何位置），而不是此技能目录中——此技能是通用且公开的；你的测试套件则属于你自己。请参阅下文的“用例库”。

## 快速开始

先检测你具备哪些条件，然后运行适用的评测维度。对于兼容 OpenAI 的模型：

```bash
export MY_KEY=sk-...                       # the key never appears in a command below

# Speed: real-task throughput + sustained decode ceiling
uv run --with openai python scripts/speed_probe.py \
  --base-url https://api.example.com/v1 --model some-model --key-env MY_KEY --mode both

# Concurrency: ramp until it breaks
uv run --with aiohttp python scripts/concurrency_probe.py \
  --url https://api.example.com/v1/chat/completions --model some-model --key-env MY_KEY \
  --format openai --concurrency 10 20 40 60
```

如果端点采用 Anthropic Messages 格式（`/v1/messages`），还应运行协议探测（见下文）。根据用户实际提出的问题选择评测维度——如果他们只问“它快吗？”，就不要把四个维度全都运行一遍。

## 维度 1——速度（可感知思考过程）

```bash
uv run --with openai python scripts/speed_probe.py \
  --base-url <…/v1> --model <model> --key-env <ENV> --mode both --output /tmp/speed.json
```

- `mixed` 运行具有代表性的任务（反映真实使用体验）；`decode` 强制生成一个长输出，以测出**持续吞吐上限**（用于与供应商宣称的数字进行比较）；`both` 则两者都运行。
- **此脚本旨在避免的陷阱：**推理模型会在单独的 `reasoning_content` 字段中流式输出思考过程，但 `completion_tokens` 会将其计入。仅收集 `content`，却用 `completion_tokens` 作为除数，会得到严重虚高的数字——一个真实速度约为 750 tok/s 的模型，曾因此被测成 4700 tok/s。该脚本会同时捕获两者，将任一类型的首个 token 到达时间作为 TTFT，并报告 `completion_tokens / (total − TTFT)`。
- **正确解读输出：**真实任务吞吐量会*低于*解码上限，因为短输出永远无法达到稳态——这是预期行为，并非错误。应同时报告这两个数字，并注明模型何时会输出思考过程（其端到端延迟包含推理时间，而不只是文本输出时间）。

## 维度 2 — 并发性 / 稳定性

```bash
uv run --with aiohttp python scripts/concurrency_probe.py \
  --url <full endpoint URL> --model <model> --key-env <ENV> \
  --format openai|anthropic --concurrency 10 20 40 60 --output /tmp/conc.json
```

- 传入多个 `--concurrency` 级别，逐步增加负载并找出上限——即成功率开始下降或延迟急剧上升的级别。单线程下速度很快的模型，在不高的并发量下仍可能崩溃（真实示例：一家提供商在 50 个并发请求下仍能保持 0.4 秒的响应时间，而另一家在仅 5 个并发请求时就开始丢弃请求）。
- 该脚本会隔离环境中已有的代理（`trust_env=False`），并禁用 keep-alive 连接池（`force_close`）——否则，你测到的是代理的限制或某个固定上游副本的性能，而不是模型本身。它会输出一份“并发证明”（相互重叠的请求对），以便你确认请求确实是并行运行的。
- 根据输出区分不同的故障模式：HTTP 429（正常限流，可重试）、导致请求一直挂起直至超时的 TCP 连接中断（对用户体验的影响严重得多），以及 5xx。它们对应的修复方法截然不同。

## 维度 3 — 协议合规性（Anthropic thinking 块）

```bash
uv run python scripts/protocol_probe.py \
  --url <…/v1/messages> --model <model> --key-env <ENV> --repeat 10 --output /tmp/proto.json
```

- 仅适用于声称兼容 Anthropic `/v1/messages` 的端点。它会检查 `thinking: {type: enabled}` 是否确实会产生 `thinking_delta` / `signature_delta` SSE 事件。
- **合规性通常是概率性的，而非非黑即白。** 某家真实供应商仅在约 13% 的请求中遵循了 thinking 块（相比之下，另外两家竞争对手为 100%）。因此，`--repeat` 的默认值为 10，并且判定结果有三种状态：`fully-implemented`、`intermittent
  (k/N)`、`not-implemented`。绝不要根据单个样本下结论。
- 它会强制每个请求使用 `Connection: close`，以避免负载均衡器将所有样本固定到同一个副本上，从而掩盖真实分布（一次真实探测在同一端点上使用 keep-alive 时得到 0/10，而使用 close 时得到 17/90）。

## 维度 4 — 质量 / 用例回归（盲审评判）

这里有意分为两个阶段：先**收集**，再**独立评判**。

**第 1 步——收集**模型对用例库的回答：

```bash
uv run --with openai python scripts/usecase_runner.py \
  --base-url <…/v1> --model <model> --key-env <ENV> \
  --usecases ~/.llm-eval/usecases.json --output-dir ~/.llm-eval/runs/<model>
```

**第 2 步——使用相互独立的盲审评判器进行评判（以内联方式编排——不要让模型给自己评分）。** 对运行目录中的每个回答，启动 3 个相互独立的 Task 智能体（快速检查时可以更少）。每个评判器只会获得：提示词、回答以及该用例的 `rubric`——并明确告知它是在独立进行评判，不了解其他评判器的分数或任何先前的评估结果（这可以防止锚定效应）。然后汇总结果：

- 只有在评判器多数意见一致时，用例才算**通过**。
- 计算**每个类别的精确率**（使用每个用例的 `tags`）：如果评判器在某个类别上系统性地给出与评分标准不一致的判断，这就表明存在真正的弱点——在一次真实评估中，某个完整类别的精确率仅为 12.5%，暴露出一种系统性误分类，而单一评分器会漏掉这个问题。
- **只统计明确的判断。** 未返回判定结果的评判器不能算作通过——沉默 ≠ 同意。这可以防范自动化偏误。

对于评分标准的打分机制（LLM 作为裁判的阈值、`llm-rubric`），你还可以
与 **promptfoo-evaluation** 技能组合使用——将其 `providers` 指向同一端点。
此测试框架的盲评方法与 promptfoo 的评分标准断言相辅相成：使用
promptfoo 快速对每个用例进行通过/失败门控，使用盲评裁判精准评估你
怀疑存在薄弱之处的类别。完整方法：[references/quality_blind_judge.md](references/quality_blind_judge.md)。

## 用例库

将其保存在此捆绑包之外（例如 `~/.llm-eval/usecases.json`），这样它就能在技能更新后继续保留，
并且绝不会进入公共仓库。它是一个普通的 JSON 列表——在私有仓库中对其进行版本控制，以便
随着时间推移积累回归测试套件：

```json
[
  {"id": "refund-window", "prompt": "A customer asks for a refund 20 days after purchase. Reply as support.",
   "rubric": "1.0 if it correctly cites the 30-day refund window; 0.0 if it refuses or invents a different window.",
   "tags": ["support", "policy"]},
  {"id": "lru-cache", "prompt": "Implement an LRU cache in Python with O(1) get/put.",
   "rubric": "1.0 if get and put are both O(1) via dict + doubly linked list and the self-test passes.",
   "tags": ["code"]}
]
```

`assets/example_usecases.json` 是一个可供复制的起始模板。只有 `id` 和 `prompt` 是必需的；
`rubric`、`expected` 和 `tags` 可以让评判更加精准。

## 运行完整评估

当用户说“评估此模型 / 对此模型进行基准测试”时，典型流程如下：

1. **确定接口形式**——是 OpenAI 兼容接口（`/v1/chat/completions`），还是 Anthropic Messages
   接口（`/v1/messages`）？请求 `GET /v1/models` 或阅读供应商文档；不要想当然。这将决定
   适用哪些探测（协议探测仅适用于 Anthropic）。
2. **运行用户关心的维度**——对于“它是否快速/稳定”，测试速度和并发；
   对于 Anthropic 供应商，添加协议测试；当用户拥有用例套件时，添加质量测试。将每项
   探测的 `--output` JSON 写入运行目录。
3. **如实报告，将实测结果与推断结果分开。** 首先给出用户所问问题的核心结论
   （例如，“持续解码上限超过供应商宣称的 tok/s，而实际任务吞吐量较低”）。
   如果某个数字看起来不可能（例如，吞吐量远高于供应商的声明，或仅凭单个样本得出的
   协议判定），应将其视为需要调查的测量伪差，而不是结果——这种质疑精神正是此测试框架
   的核心意义。
4. **要比较两个模型？** 使用相同的参数对每个模型运行完全相同的探测，并将
   两份 JSON 输出并排放置。保持测试条件完全一致（相同的并发
   级别、相同的用例），否则比较毫无意义。

## 下一步

运行完成后，提供自然衔接的后续选项：

```
Evaluation complete for <model>.

Options:
A) Render an HTML dashboard of the results — compose with a visualization skill (Recommended if sharing)
B) Compare against another model — same probes, side-by-side
C) Add the failing cases to ~/.llm-eval/usecases.json as a permanent regression guard
D) Done — the numbers answer the question
```