---
name: second-opinion
description: Get a second opinion from OpenAI's Codex CLI running locally. Use this skill when in Plan Mode for large or critical tasks, when stuck on a debugging dead end, when facing architecture trade-offs, for subtle edge cases in code review, or any situation where an independent perspective would add value. Also use when the user explicitly asks for a "second opinion", "another perspective", "cross-check this", "ask Codex", or "ask GPT". This is the DEFAULT second-opinion engine — Codex runs a completely different model architecture from Claude, so it catches blind spots Claude shares with itself. For a Gemini second opinion specifically, the user says "ask Gemini" (separate second-opinion-gemini skill); "ask both" runs this skill and that one, then synthesizes.
user_invocable: false
---
# 第二意见 — OpenAI Codex

从 OpenAI 的 Codex CLI 获取独立的第二意见。它使用 Codex 的默认模型——与 Claude 采用完全不同的架构和训练过程，因此对于发现盲点、验证边界情况下的推理，或揭示 Claude 可能忽略的权衡非常有用（Claude 自身的错误往往对 Claude 不可见）。

Codex 对项目拥有完整的读取权限——它可以读取文件、grep 代码并探索代码库。项目说明（仓库根目录中的 `AGENTS.md`）会告诉它在回答前先熟悉关键文档。你提供具体问题和任何需要聚焦的上下文；其余工作由 Codex 完成。

这是**默认**的第二意见引擎。如果专门需要 Gemini 的第二意见，用户应调用独立的 `second-opinion-gemini` skill（“ask Gemini”）。当用户说“ask both”时，运行此 skill 和那个 skill，然后综合三方观点（你自己的、Codex 的和 Gemini 的）。

## 使用时机

- 存在实际权衡的架构决策
- 陷入反复排查、无法推进的调试问题
- 涉及棘手逻辑或细微边界情况的代码审查
- 在用户据此采取行动前验证你的推理
- 用户明确要求第二意见时

不要将其用于常规任务——每次调用都需要 10-60+ 秒，并会消耗 ChatGPT-plan 配额。仅在出错会带来实际后果的决策中使用它。

## 流程

### 第 1 步：准备提示词

Codex 无法访问你的对话历史，但可以读取项目文件。请按以下结构组织提示词：

1. **问题**——你希望 Codex 具体评估什么
2. **你当前的想法**（推荐）——分享你的立场，以便 Codex 对其提出质疑
3. **相关区域**（可选）——如果项目包含不同的模块或组件，说明这是关于哪一部分的，以便 Codex 熟悉正确的文档。默认范围是整个项目；只有在这样做有帮助时才缩小范围。
4. **具体上下文**（如有需要）——当相关代码分散在多处，或你希望 Codex 聚焦于特定部分时，通过 stdin 传入代码片段或 diff

对于现有项目代码相关的问题，你可以直接引用文件路径——Codex 会自行读取这些文件。

### 第 2 步：调用 Codex

在下面的命令中，`<repo-root>` 是仓库根目录——即包含 `AGENTS.md`（以及你的 `.git` 目录）的目录。请使用绝对路径，这样无论当前工作目录是什么，都能发现 `AGENTS.md` 和项目文档。

**关键：无权限请求的调用模式。** 命令**必须以** `codex` 开头（匹配 `Bash(codex:*)` allow 规则），并且**不得**使用 `$()` 命令替换或 `/tmp/` 文件重定向——二者都会触发权限请求。

**标准调用**（由 Codex 自行读取项目文件——首选）：

```bash
codex exec -s read-only -C <repo-root> '<your question here>' < /dev/null
```

**通过 stdin 传入上下文**（用于代码片段、diff 或聚焦的摘录——Codex 会将通过管道传入的 stdin 追加为 `<stdin>` 块）：

```bash
codex exec -s read-only -C <repo-root> '<your question here>' <<'CONTEXT_EOF'
<relevant code, diff, or context here>
CONTEXT_EOF
```

**必需的标志 / 参数 — 无一例外：**

| 标志 | 原因 |
|------|-----|
| `exec` | 非交互式无头模式。在此模式下，工具调用会自动获批。 |
| `-s read-only` | 将顾问限制为只读 — 它可以探索文件，但无法修改任何内容。这与其 `AGENTS.md` 中的“不得修改”指令一致，并提供硬性保证。 |
| `-C <repo-root>` | 工作根目录 = 仓库根目录，因此无论当前工作目录为何，都可以发现 `AGENTS.md` 和项目文档。 |
| `< /dev/null`（标准调用） | 关闭 stdin，这样当没有通过管道传入上下文时，Codex 不会阻塞等待输入。 |

**不要传入 `-m`。** 保持模型未设置，以便 Codex 使用其自身的默认模型。固定 slug 会过时，而 `-codex` 模型系列（例如 `*-codex`）在 ChatGPT 账户登录时会被拒绝 — 只有聊天模型可用，因此保持未设置是正确做法。如果默认模型最终解析为并非真实 GPT 聊天模型的模型，则将此次运行视为不可用，而不是接受降级的第二意见（参见重要规则）。

**输出形式。** Codex 会将运行中的会话记录打印到 stdout：启动横幅、其推理过程、它执行的任何 `exec` / 工具调用（例如 `rg`、文件读取）、`tokens used` 行，以及**作为末尾代码块的最终答案**。Bash 工具会捕获全部内容。噪声很容易识别并忽略 — 最后一条代理消息是 `tokens used` 行之后的最后一个或多个段落。如果输出包含 `429`、`usage limit`、`quota` 或 `rate limit` 错误，则将其视为不可用。

为 Bash 工具调用设置 **600 秒超时**（Codex 可能需要时间读取文件并分析复杂问题）。

**不要使用：**
- `$()` 命令替换（例如 `RESPONSE=$(codex ...)`）— 会触发权限提示
- `/tmp/` 文件重定向（例如 `-o /tmp/out.txt` 或 `2>/tmp/err.txt`）— 会触发“允许访问 tmp/”提示
- `$()` 内嵌套 heredoc — 会触发相同问题

### 第 2b 步：多轮讨论（自主进行）

当主题值得展开辩论时（架构、设计评审、权衡分析），**自主运行完整的多轮对话** — 不要在轮次之间询问用户是否许可。针对 Codex 的观点提出反驳，让 Codex 反驳你的观点，持续迭代，直到达成共识或明确指出分歧。通常进行 2–4 轮。

恢复会话，而不是重新开始，以保留对话历史：

```bash
codex -C <repo-root> -s read-only exec resume --last '<your follow-up question>' < /dev/null
```

恢复时标志的顺序很重要。`resume` 子子命令不接受 `-s/--sandbox` 或 `-C/--cd`（不同于接受这些参数的 `codex exec`）— 将它们放在 `resume` 之后会失败，并显示 `error: unexpected argument '-s' found`。如上所示，将这两个全局标志放在 `exec resume` 链之前（它们是 `codex` 的根级标志，并会向下传递）。

你也可以通过 id 恢复特定会话：`codex -C <repo-root> -s read-only exec resume <SESSION_ID> '<follow-up>' < /dev/null`。会话 id 会打印在首次调用的启动横幅中（`session id: <uuid>`）。

**何时使用多轮对话：**
- 设计评审或架构讨论——让其自主完成完整辩论
- Codex 的回答含糊不清——要求它针对关键部分给出具体说明
- 你想质疑 Codex 的推理——提出反驳，看看它能否站得住脚
- 问题天然分为多个层次——例如先问“哪种方案？”再问“该方案有哪些迁移风险？”

**何时不要使用多轮对话：**
- 第一个回答已经清晰且完整——直接呈现即可
- 你要问的是无关问题——开启新的会话（省略 `resume`）

### 第 3 步：呈现结果

**如果是多轮对话：** 呈现一份整合后的总结——关键共识、尚存分歧以及你们共同的建议。不要倾倒每一轮的原始输出；用户想要的是结论，而不是对话记录。

**如果是单轮对话：** 先呈现 Codex 的回答，然后补充你自己的简短总结：你在哪些方面同意、哪些方面不同意，以及用户应该如何综合双方观点。价值在于综合，而不仅仅是提供第二意见的原始内容。

**如果 Codex 不可用**（配额 / 使用限制 / 429 / 速率限制）：

> Codex 当前不可用（使用限制 / 速率受限）。我不会默默换用能力较弱的模型。你可以说“ask Gemini”，以便从不同的架构获取独立的第二意见；或者我也可以仅基于自己的分析继续。

如果出现**其他错误**，显示经过过滤的输出，并继续基于自己的推理进行处理。

## 重要规则

1. **不要默默接受降级的模型。** 整个机制的价值在于获得来自独立架构的第二意见。不要设置模型，让 Codex 使用其默认聊天模型是正确做法；如果默认模型最终解析为非 GPT 模型或轻量级 / 本地模型，应报告这一点，而不要将其作为有意义的第二意见呈现。
2. **不要过度使用。** 该机制用于真正棘手的决策，而不是用于你自己能够自信回答的常规编码问题。
3. **Shell 引号很重要。** 对于包含单引号的提示词，使用 `'\''` 进行转义。对于非常复杂的提示词，使用 stdin heredoc 形式（见第 2 步）。
4. **命令必须以 `codex` 开头**，以匹配 `Bash(codex:*)` allow 规则。绝不要使用 `$()` 包装命令，也不要重定向到 `/tmp/`。
5. **Codex 在此处是只读的。** 始终传递 `-s read-only`。绝不要为第二意见授予它写入权限或 `danger-full-access` 沙箱模式——它是顾问，而不是构建者。