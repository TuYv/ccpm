---
name: career-ops
description: >-
  AI job search command center -- evaluate offers, generate CVs, scan portals,
  track applications. Use when the user pastes a job URL or JD, asks to scan
  portals, generate a CV/PDF, track applications, prepare for interviews, draft
  outreach/emails, or run any career-ops mode.
arguments: mode
user_invocable: true
user-invocable: true
argument-hint: "[scan | discover | deep | pdf | latex | latex-tex | cover | email | add | expand | eu-swe | oferta | ofertas | apply | batch | tracker | agent-inbox | pipeline | contacto | training | project | interview-prep | interview | interview/plan | interview/practice | interview/debrief | interview-redflag | patterns | offer-prep | titles | upskill | followup | reply-watch | outcome | update]"
license: MIT
---
# career-ops -- 路由

career-ops 是一个多 CLI 求职命令中心。即使调用入口不同，以下路由也在所有受支持的代理 CLI 之间共享。

## 调用说明

- 具备斜杠命令注册的 CLI 可将该路由暴露为 `/career-ops`。
- 在 Cursor 中，该技能位于 `.cursor/skills/career-ops/` 并且会自动发现；按名称请求一个模式，或粘贴 JD/URL 以触发自动流水线。
- 交互式 Codex 会话在仓库根目录使用 `codex`。Codex 中无法保证斜杠命令，因此若 `/career-ops` 不可用，请用同名模式指令让 Codex 执行。
- 无头 Codex worker 使用 `codex exec "prompt"`。
- 下方路由语义在入口是斜杠命令还是自然语言提示时均保持一致。

与同一路由语义对应的 Codex 提示示例：

```text
Evaluate this JD with career-ops auto-pipeline: https://company.com/jobs/123
Run the career-ops scan mode and summarize new matches.
Run the career-ops pipeline mode for data/pipeline.md.
Run the career-ops pdf mode for the latest evaluated role.
Run the career-ops tracker mode and summarize the current statuses.
```

## 模式路由

从 `$mode` 确定模式：

| 输入 | 模式 |
|-------|------|
| （空 / 无参数） | `discovery` -- Show command menu |
| JD 文本或 URL（无子命令） | **`auto-pipeline`** |
| `oferta` | `oferta` |
| `ofertas` | `ofertas` |
| `contacto` | `contacto` |
| `deep` | `deep` |
| `interview-prep` | `interview-prep` |
| `interview` | `interview` |
| `eu-swe` | `regional/eu-swe` |
| `eu-fintech` | `regional/eu-fintech` |
| `interview/plan` | `interview/plan` |
| `interview/practice` | `interview/practice` |
| `interview/debrief` | `interview/debrief` |
| `pdf` | `pdf` |
| `latex` | `latex` |
| `latex-tex` | `latex-tex` |
| `email` | `email` |
| `add` | `add` |
| `expand` | `expand` |
| `training` | `training` |
| `project` | `project` |
| `tracker` | `tracker` |
| `agent-inbox` | `agent-inbox` |
| `inbox` | `agent-inbox` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `scan` | `scan` |
| `discover` | `discover` |
| `batch` | `batch` |
| `patterns` | `patterns` |
| `offer-prep` | `offer-prep` |
| `titles` | `titles` |
| `upskill` | `upskill` |
| `followup` | `followup` |
| `reply-watch` | `reply-watch` |
| `outcome` | `outcome` |
| `interview-redflag` | `interview-redflag` |
| `update` | `update` |
| `cover` | `cover` |

**自动流水线检测：** 如果 `$mode` 不是已知子命令且包含 JD 文本（关键词："responsibilities"、"requirements"、"qualifications"、"about the role"、"we're looking for"、公司名 + 岗位），或是 JD 的 URL，则执行 `auto-pipeline`。

如果 `$mode` 不是子命令且看起来不像 JD，则显示 discovery。

---

## 输出语言指令

在执行任何模式前，读取 `config/profile.yml`（若存在）并解析：

- `language.output` → 面向人类输出的 ISO 语言代码。默认值：`en`。
- `language.modes_dir` → 可选的市场模式目录。它仅控制市场词汇和本地评估规则。

在加载模式说明后、生成任何用户可见内容前，注入以下指令：

> Write all human-facing output in `{language.output}` regardless of the language of these instructions or of the job description. This includes reports, tracker notes, PDFs, cover letters, outreach, interview prep, form answers, and summaries. If `language.modes_dir` supplies market-specific vocabulary, keep the market logic but explain terms in `{language.output}` when needed.

`language.output` 对正文具有最高权限。`modes_dir` 是市场语境；它不得强制正文语言。

---

## Discover 模式（无参数）

如果你的 CLI 支持 `/career-ops`，请显示此菜单。在 Codex 中，使用纯文本展示相同选项，并以同样方式映射请求的模式。

Codex 提示驱动会话的对应写法：

```text
/career-ops {JD}           ↔ "Evaluate this JD with career-ops auto-pipeline: {JD or URL}"
/career-ops scan           ↔ "Run the career-ops scan mode and summarize new matches."
/career-ops pipeline       ↔ "Run the career-ops pipeline mode for data/pipeline.md."
/career-ops pdf            ↔ "Run the career-ops pdf mode for the latest evaluated role."
/career-ops email          ↔ "Run the career-ops email mode for the latest evaluated role."
/career-ops tracker        ↔ "Run the career-ops tracker mode and summarize the current statuses."
```

Show this menu:

```
career-ops -- Command Center

Available commands:
  /career-ops {JD}      → AUTO-PIPELINE: evaluate + report + PDF + tracker (paste text or URL)
  /career-ops pipeline  → Process pending URLs from inbox (data/pipeline.md)
  /career-ops oferta    → Evaluation only A-F (no auto PDF)
  /career-ops ofertas   → Compare and rank multiple offers
  /career-ops contacto  → LinkedIn power move: find contacts + draft message
  /career-ops deep      → Deep research prompt about company
  /career-ops interview-prep → Generate company-specific interview prep doc
  /career-ops interview    → Interactive profile/CV onboarding interview
  /career-ops eu-swe    → Calibrate a European SWE application before CV/apply/interview
  /career-ops eu-fintech → Scan 21 EU fintech portals for Product Manager roles (zero-token)
  /career-ops interview/plan → Time-blocked prep plan for an upcoming interview
  /career-ops interview/practice → Practice interview, one question at a time with feedback
  /career-ops interview/debrief → Post-interview debrief: close gaps, predict next round
  /career-ops pdf       → PDF only, ATS-optimized CV
  /career-ops latex     → Export CV as LaTeX/Overleaf .tex
  /career-ops latex-tex → Tailor your own resume.tex in place (opt-in; cv.md stays default)
  /career-ops cover     → Cover letter: standalone JD paste or /career-ops cover {slug}
  /career-ops email     → Formal application email draft (draft-only; never sends, submits, or clicks)
  /career-ops add       → Add a project/paper/role to your CV (fetch + preview + confirm)
  /career-ops expand    → Auto-discover and add missing competencies from profile links
  /career-ops training  → Evaluate course/cert against North Star
  /career-ops project   → Evaluate portfolio project idea
  /career-ops tracker   → Application status overview
  /career-ops agent-inbox → Queue/drain requests for the next session (data/agent-inbox.md)
  /career-ops apply     → Live application assistant (reads form + generates answers)
  /career-ops scan      → Scan portals and discover new offers
  /career-ops discover  → Resolve a company list to scannable ATS boards + append to portals.yml (zero-token)
  /career-ops batch     → Batch processing with parallel workers
  /career-ops patterns  → Analyze rejection patterns and improve targeting
  /career-ops offer-prep → Read a received offer/contract with the candidate: clause walk + lawyer questions (not legal advice)
  /career-ops titles    → Suggest adjacent job titles from your CV to broaden the search
  /career-ops upskill   → Aggregate skill-gap analysis from your evaluated reports
  /career-ops followup  → Follow-up cadence tracker: flag overdue, generate drafts
  /career-ops outcome   → Record application outcome & archive artifacts
  /career-ops update    → Update career-ops system files with diff preview + compat check

Inbox: add URLs to data/pipeline.md → /career-ops pipeline
Or paste a JD directly to run the full pipeline.
```

---

## 按模式加载上下文

确定模式后，在执行前加载必要文件：

若 `modes/_custom.md` 存在，请在 `modes/_profile.md` 之后、选定模式文件之前读取。它包含用户行为规则和过程偏好。它可能覆盖工作流/风格默认值，但绝不新增与候选人相关的事实性断言。

### 需要 `modes/_shared.md` 与对应模式文件的模式

读取 `modes/_shared.md` + `modes/_profile.md`（若存在） + `modes/_custom.md`（若存在） + `modes/{mode}.md`

适用于：`auto-pipeline`、`oferta`、`ofertas`、`pdf`、`contacto`、`apply`、`pipeline`、`scan`、`batch`

### 具有配置文件和自定义上下文的独立模式

读取 `modes/_profile.md`（若存在） + `modes/_custom.md`（若存在） + `modes/{mode}.md`

适用于：`tracker`、`agent-inbox`、`deep`、`interview-prep`、`interview`、`regional/eu-swe`、`interview/plan`、`interview/practice`、`interview/debrief`、`latex`、`latex-tex`、`training`、`project`、`patterns`、`titles`、`upskill`、`followup`、`reply-watch`、`outcome`、`cover`、`email`、`add`、`offer-prep`、`discover`

### 委派给子代理的模式

对于 `scan`、`apply`（含 Playwright）和 `pipeline`（3+ URLs）：以 worker/subagent 方式启动，并将 `_shared.md` + `_profile.md`（若存在） + `_custom.md`（若存在） + `modes/{mode}.md` 的内容注入到 worker 提示词中。如果你的 CLI 提供 `Agent(...)` 原语，调用如下所示：

```python
Agent(
  subagent_type="general-purpose",
  prompt="[output language directive]\n\n[content of modes/_shared.md]\n\n[content of modes/_profile.md if exists]\n\n[content of modes/_custom.md if exists]\n\n[content of modes/{mode}.md]\n\n[invocation-specific data]",
  description="career-ops {mode}"
)
```

执行已加载模式文件中的说明。
