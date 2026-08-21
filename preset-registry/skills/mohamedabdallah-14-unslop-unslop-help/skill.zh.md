---
name: unslop-help
description: >
  Quick-reference card for unslop modes, sub-skills, and slash commands.
  One-shot display, not a persistent mode. Trigger: /unslop-help,
  "unslop help", "what unslop commands", "how do I use unslop".
---
# Unslop 帮助

## 用途

显示一张参考卡片，其中包含 unslop 模式、相关子技能、退出短语和配置。单次执行。不会切换模式。不会写入标志文件。

## 输出

以正常行文呈现下方卡片（不要使用 unslop 风格——这是文档）。

### 模式

| 模式 | 触发方式 | 功能 |
|------|---------|--------------|
| `subtle` | `/unslop subtle` | 轻度处理。删减 AI 痕迹，保留篇幅和结构。 |
| `balanced` | `/unslop`（默认） | 删减冗余内容，调整行文节奏，恢复自然表达。 |
| `full` | `/unslop full` | 大幅改写。重构内容。允许加入观点。 |
| `voice-match` | `/unslop voice-match` | 仿照提供的语气/风格样本。 |
| `anti-detector` | `/unslop anti-detector` | 以对抗性方式改写，增强规避检测器的能力。仅在明确要求时使用。 |

模式会持续生效，直到更改模式或会话结束。

### 子技能

| 技能 | 触发方式 | 功能 |
|-------|---------|--------------|
| `unslop-commit` | `/unslop-commit`、`/commit`、"write a commit" | 以自然的人类口吻编写 Conventional Commits。 |
| `unslop-review` | `/unslop-review`、`/review`、"review this PR" | 编写直接、友善的 PR 审查评论。 |
| `unslop-file` | `/unslop-file <filepath>`、"unslop this file"、"humanize memory file" | 重写 markdown 文件，去除 AI 腔，同时保留代码、URL 和结构。 |
| `unslop-reasoning` | `/unslop-reasoning`、"fix this chain of thought"、"clean up my reasoning" | 从思维链记录中去除 AI 式冗余推理模式（过度保留、过度拆解、无限循环式合理化）。 |
| `unslop-help` | `/unslop-help`、"unslop help" | 本卡片。 |

### 停用

- `"stop unslop"` 或 `"normal mode"`——立即恢复
- 使用 `/unslop`（或任意模式标志）恢复

### 配置

- 默认模式：`balanced`
- 覆盖设置：`UNSLOP_DEFAULT_MODE=full`（环境变量），或 `~/.config/unslop/config.json`：
  ```json
  { "defaultMode": "full" }
  ```
- `"off"` 会完全禁用自动激活
- 解析顺序：环境变量 > 配置文件 > `balanced`

### 更多信息

完整文档和源代码：<https://github.com/MohamedAbdallah-14/unslop>

## 限制

- 单次执行。不要切换模式、写入标志文件或持久化任何状态。
- 不要以 unslop 风格输出——此卡片是参考资料。