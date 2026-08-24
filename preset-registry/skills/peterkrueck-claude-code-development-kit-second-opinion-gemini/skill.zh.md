---
name: second-opinion-gemini
description: Get a second opinion from Google's Gemini Pro via the locally installed Gemini CLI (defaults to gemini-3.1-pro-preview; override with the CLAUDE_SECOND_OPINION_MODEL env var). This is the explicit / fallback engine — invoke ONLY when the user explicitly says "ask Gemini", "Gemini's take", "what does Gemini think", or "ask both" (run alongside the default engine and synthesize). Do NOT trigger on a generic "second opinion", "another perspective", or "cross-check this" — those route to the default `second-opinion` skill. Reserve this for when the user specifically wants Gemini, or as a fallback when the default engine is unavailable. Reports unavailability rather than falling back to a weaker model.
user_invocable: false
---
# 第二意见 — Gemini（显式 / 备用引擎）

从 Google 的 Gemini Pro 获取独立的第二意见。该模型与 Claude 采用完全不同的架构并接受了不同的训练，因此在发现盲点、验证边界条件下的推理，或揭示你可能忽略的权衡方面真正有用。

**这不是默认的第二意见引擎。** 一般的第二意见请求会路由到默认的 `second-opinion` skill。仅在以下情况下使用此 Gemini skill：
- 用户明确要求 Gemini（“ask Gemini”、“Gemini's take”、“what does Gemini think”）。
- 用户说“ask both”——同时运行此 skill 和默认的 `second-opinion` skill，然后综合三种观点（你自己的观点 + 默认引擎的观点 + Gemini 的观点）。
- 默认引擎被报告不可用，且用户希望获得另一个独立的意见。

Gemini 可以完整读取项目内容——它能够读取文件、grep 代码并探索代码库。其项目说明（GEMINI.md）会告诉它在回答前先了解关键文档。你需要提供具体问题和任何聚焦的上下文；其余部分由 Gemini 处理。

## 模型选择

默认固定使用 `gemini-3.1-pro-preview` 以获得更高质量（较小的模型会提供更弱的第二意见；它们带来的虚假信心不值得付出代价）。

当 Google 弃用预览版固定模型时——预览模型更新很快——请按会话或全局进行覆盖：

```bash
export CLAUDE_SECOND_OPINION_MODEL=gemini-3.2-pro   # or whatever the current Pro-tier model is
```

下面的每次调用都会使用 bash 模式 `${CLAUDE_SECOND_OPINION_MODEL:-gemini-3.1-pro-preview}`——如果设置了环境变量，则优先使用环境变量，否则使用固定的默认值。

当固定模型失效时，**不要**回退到更小或更旧的模型。报告不可用状态，并继续仅使用 Claude 进行分析。

## 流程

### 步骤 1：准备提示词

Gemini **无法**访问你的对话历史，但**可以**读取项目文件。请按以下结构组织提示词：

1. **范围（可选）**——默认情况下，Gemini 会先了解整个项目。如果问题涉及某个模块或组件，请指出它，以便 Gemini 先读取相关文件（例如，“This is about the auth module”——根据你一直处理的文件路径确定相关模块）。
2. **问题**——你希望 Gemini 权衡的具体内容
3. **你当前的思路（推荐）**——分享你的立场，以便 Gemini 对其提出质疑
4. **具体上下文（如需要）**——如果相关代码分散在多处，或者你希望 Gemini 将注意力集中在特定部分，可以通过 stdin 传入代码片段或差异

对于现有项目代码相关的问题，你可以直接引用文件路径——Gemini 会自行读取这些文件。

### 步骤 2：调用 Gemini

**关键：无需权限的调用模式。** 命令**必须**以 `gemini` 开头（这会匹配 `Bash(gemini:*)` allow 规则），并且**不得**使用 `$()` 命令替换或 `/tmp/` 文件重定向——二者都会触发权限提示。

**标准调用**（Gemini 自行读取项目文件——首选）：

```bash
gemini -m "${CLAUDE_SECOND_OPINION_MODEL:-gemini-3.1-pro-preview}" -p '<your question here>' -o text
```

**通过 stdin 管道传入上下文**（适用于代码片段、差异内容或重点摘录——当上下文分散，或你希望将注意力集中在特定部分时使用）：

```bash
gemini -m "${CLAUDE_SECOND_OPINION_MODEL:-gemini-3.1-pro-preview}" -p '<your question here>' -o text <<'CONTEXT_EOF'
<relevant code, diff, or context here>
CONTEXT_EOF
```

Bash 工具会直接捕获所有输出（stdout + stderr），无需重定向到文件。Gemini 的 stderr 噪声（Loading、Registering、Scheduling 等）会出现在输出中，但很容易识别并忽略。

表示 Gemini 未作答的输出标记：

- **容量耗尽（临时性）：** `MODEL_CAPACITY_EXHAUSTED`、`No capacity available`、`code.*429`。稍后重试，或不使用第二意见继续。
- **模型已弃用（永久性）：** `model not found`、`MODEL_NOT_FOUND`、`unknown model`、`model_id_invalid`，或与模型名称同时出现的 `404`。固定的模型已失效——请参阅下方的不可用部分。

**必需的标志——无一例外：**

| 标志 | 原因 |
|------|------|
| `-m "${CLAUDE_SECOND_OPINION_MODEL:-gemini-3.1-pro-preview}"` | 必须使用 Pro 级模型；环境变量允许用户在固定模型失效时自行恢复 |
| `-p` | 非交互式无头模式。此模式下工具调用会自动获批（不需要 `-y`） |
| `-o text` | 输出干净的文本，不带 JSON 包装噪声 |

**不要使用：**
- `$()` 命令替换（例如 `GEMINI_RESPONSE=$(gemini ...)`）——会触发“Command contains $() command substitution”权限提示
- `/tmp/` 文件重定向（例如 `2>/tmp/gemini-stderr.txt`）——会触发“allow access to tmp/”权限提示
- `$()` 内嵌套 heredoc——会触发同样的问题

为 Bash 工具调用设置 **600 秒超时**（Gemini 可能需要时间读取文件，并对复杂问题进行推理）。

### 步骤 2b：多轮讨论（自主进行）

当主题需要辩论时（架构、设计评审、权衡分析），**自主运行完整的多轮对话**——不要在轮次之间请求用户许可。针对 Gemini 的观点提出反驳，让 Gemini 反过来回应你的观点，持续迭代，直到达成共识或明确指出分歧。通常进行 2-4 轮。

恢复会话，而不是重新开始，以保留对话历史：

```bash
gemini -m "${CLAUDE_SECOND_OPINION_MODEL:-gemini-3.1-pro-preview}" -r latest -p '<your follow-up question>' -o text
```

你也可以通过会话索引（`-r 6`）或会话 ID（`-r <uuid>`）恢复。使用 `gemini --list-sessions` 查看可用会话。

**何时使用多轮讨论：**
- 设计评审或架构讨论——自主运行完整辩论
- Gemini 的回答含糊不清——要求它具体说明重要部分
- 你想质疑 Gemini 的推理——提出反驳，看看它是否站得住脚
- 问题自然分为多个层次——例如“应该采用哪种方案？”接着问“该方案的迁移风险是什么？”

**何时不使用多轮讨论：**
- 第一轮回答清晰且完整——直接呈现即可
- 你在询问无关问题——开始一个新的会话即可

### 步骤 3：呈现结果

**如果是多轮：** 提供一份综合性总结——关键共识、尚存分歧以及你们共同的建议。不要倾倒每一轮的原始输出；用户想要的是结论，而不是对话记录。

**如果是单轮：** 先呈现 Gemini 的回复，然后补充你自己的简短综合：你在哪些方面认同、在哪些方面不认同，以及用户应该如何综合双方的观点。价值在于综合，而不只是原始的第二意见。

**如果是“询问双方”：** 并列呈现默认引擎的观点和 Gemini 的观点，然后综合你自己与两个外部模型的全部三方观点——指出两个外部模型意见一致的地方（高置信度），以及它们存在分歧的地方（真正的决策点）。

**如果 Gemini 不可用——容量耗尽 / 429：**

> Gemini Pro 当前已达到容量上限。不回退到较弱的模型——只有 Pro 级模型足够胜任有意义的第二意见，而其价值在于提供独立的架构视角。继续使用我自己的分析（或者在用户请求时使用默认引擎）。

不要使用其他模型重试。不要静默回退。报告不可用情况并继续进行你自己的推理。

**如果模型已弃用 / 未找到**（固定的 `gemini-3.1-pro-preview` 已被 Google 替换）：

> 固定模型 `gemini-3.1-pro-preview` 已不再可用。请将 `CLAUDE_SECOND_OPINION_MODEL` 设置为当前的 Gemini Pro 级模型后重新运行（使用 `gemini --list-models` 检查当前可用选项）。本轮将在没有 Gemini 第二意见的情况下继续。

明确告知用户——这不是暂时性故障；该 skill 需要更新环境变量，或者需要上游补丁才能继续正常工作。

**如果发生其他错误**，显示经过过滤的 stderr，并继续进行你自己的推理。

## 重要规则

1. **绝不回退到较弱的模型。** Gemini Pro 级模型（默认为 `gemini-3.1-pro-preview`，或 `CLAUDE_SECOND_OPINION_MODEL` 所设置的模型）要么使用，要么不用。较弱模型的意见会制造虚假的信心，其价值不足以抵消这一风险。
2. **这是显式/回退引擎，而不是默认引擎。** 通用的第二意见请求应发送给默认的 `second-opinion` skill。
3. **Shell 引号很重要。** 对于包含单引号的提示词，使用 `'\''` 进行转义。对于非常复杂的提示词，使用 stdin heredoc（参见步骤 2）。
4. **命令必须以 `gemini` 开头**，以匹配 `Bash(gemini:*)` 允许规则。绝不要使用 `$()` 包装，也不要重定向到 `/tmp/`。