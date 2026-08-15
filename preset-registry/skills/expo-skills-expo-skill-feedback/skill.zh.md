---
name: expo-skill-feedback
description: 'Submit feedback on an Expo skill—or Expo itself—and control bundled anonymous usage telemetry (off by default / opt-in). Submit feedback with: npx --yes submit-expo-feedback@latest "ACTIONABLE_FEEDBACK". Optionally add either or both: --category "CATEGORY" and --subject "SUBJECT". Replace the uppercase placeholders before running. Use when a skill was useful, confusing, broken, missing context, or worth improving; when Expo, Expo CLI, EAS CLI, docs, or MCP worked well or fell short; when an AI agent repeatedly failed, got stuck, or needed the user to take over an Expo task (report it as an eval candidate); or when the user explicitly asks to enable or disable telemetry (tracking), check its status, or understand what it collects.'
---
# Expo Skill 反馈

通过分享哪些方面效果良好或哪些方面未达预期的具体反馈，帮助 Expo 改进。反馈提交与使用情况遥测相互独立，也不需要启用遥测。

## 提交反馈

```bash
npx --yes submit-expo-feedback@latest "<ACTIONABLE_FEEDBACK>"
```

当可提供有用的上下文时，可以独立添加任一可选标志：

```bash
npx --yes submit-expo-feedback@latest --category "<CATEGORY>" --subject "<SUBJECT>" "<ACTIONABLE_FEEDBACK>"
```

`--category` 默认为 `unknown`，当没有具体目标时，可以省略 `--subject`。
添加这些标志时，请选择能够最准确标识反馈所针对内容的值：

| 类别 | 主题 |
| --- | --- |
| `skills` | frontmatter 中的确切 Skill 名称，例如 `expo-router` |
| `docs` | 完整的 Expo 文档 URL |
| `mcp` | 使用的确切 MCP 工具名称 |
| `expo-cli` | 完整的 Expo CLI 命令，例如 `npx expo install` |
| `eas-cli` | 完整的 EAS CLI 命令，例如 `eas build` |
| `evals` | 失败任务所涉及的 Expo 软件包或命令；如果没有，则使用能力描述，例如 `expo-router` 或 `eas build` |
| `unknown` | 简洁的 Expo 产品、软件包、功能或其他主题 |

在最后一个参数中，说明哪些内容有所帮助以及原因，或者提供相关上下文、预期行为和实际发生的情况。不要包含机密信息、源代码、个人数据、过长的提示词或堆栈跟踪。

## Eval 候选：导致模型失败的任务

Expo 会将困难的真实任务转化为智能体 eval：任何智能体可以尝试的 Expo 相关任务——框架、EAS、工具链——都符合条件，无论是否涉及 Skill。值得发送的信号是：尽管经过切实努力，AI 智能体仍无法顺利完成的任务，例如多次尝试失败、构建或页面始终无法正常运行，或者用户不得不介入并手动修复。切勿提交智能体自行纠正的简单失误；每个会话最多提交一个候选；也不要提交已经报告过的任务。

当发生此类失败时——或者用户表示某个模型未能完成 Expo 任务时——向用户展示你打算发送的确切提交内容并获得批准；Task 字段必须描述任务在 Expo 技术层面的形式，绝不能包含用户的产品或业务上下文。如果没有用户可进行批准（无头或 CI 运行），则不要提交。然后，从失败应用的目录中运行命令（CLI 会自动附加 SDK 和软件包版本、智能体运行环境以及平台信息），使用 `--category evals`，并让 `--subject` 指明所涉及的 Expo 软件包或命令（仅当不存在单一适用的软件包时，才使用能力描述），最后一个参数采用以下结构：

```text
Task: <what was asked, self-contained>.
Expected: <observable success criteria>.
Actual: <what the agent did instead>.
Wrong approach: <the specific mistake, such as a wrong API, hallucinated prop, or bad pattern>.
Evidence: <model name, attempts, how it was solved — or never was; omit what you cannot verify>.
```

优质候选应当是可解决的（最终已经完成或明确可行）、可验证的（成功结果可观察）并且具体。仅提及 CLI 无法获知的环境详情，例如其他关键软件包或刚创建的应用。描述代码；不要粘贴代码。如果命令失败，且错误指出 `evals` 是无效类别，请使用 `--category unknown` 重新发送一次，并为相同的主题添加 `eval-candidate: ` 前缀；如果出现任何其他错误，请勿重新发送。

## 使用情况遥测

自动技能使用情况遥测与反馈相互独立，且**默认关闭**。除非用户明确要求，否则切勿启用。
使用以下脚本并传入 `--on`、`--off` 或 `--status`：

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/expo-skill-feedback/scripts/telemetry.cjs" --status
```

对应的环境变量为：使用 `EXPO_SKILLS_TELEMETRY=1` 启用，使用
`EXPO_SKILLS_TELEMETRY=0` 或 `DO_NOT_TRACK=1` 禁用。CI 绝不会发送遥测数据。

## 提交反馈
如果你发现此技能中存在错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-skill-feedback" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 智能体反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。