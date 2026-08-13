---
name: mode-creator
description: Interactively create, install, activate, and verify custom claude-mem modes, including domain-specific observation types, concept tags, optional Telegram alerts, bot setup, worker restart, and startup-context verification. Use this whenever someone asks to customize what claude-mem remembers, create or change a mode, track domain-specific notes, add observation types or tags, or send Telegram notifications for particular memories—even if they do not use the word "mode."
compatibility: Requires a local claude-mem worker installation, an interactive question tool, filesystem access, and Node.js 20+. Telegram setup requires network access and a Telegram account.
---
# 模式创建器

创建一个有用的笔记系统，而不只是一个合法的 JSON 文件。与用户访谈，提出一个小型分类法，获得批准，持久化安装，配置可选提醒，重启 worker，并证明活动模式出现在启动上下文中。

## 基础规则

- 使用可用的交互式提问工具（`AskUserQuestion`、`request_user_input` 或等效工具）进行访谈。分小批次提问并等待每条回复。
- 将观察类型说明为互斥的笔记种类，并将概念解释为可复用的标签。除非用户先使用该术语，否则避免行话。
- 在发明新模式前先检查现有的内置模式和用户模式。若更符合用户需求，则复用或改编接近的模式。
- 不要编辑插件缓存或内置模式。将自定义文件安装到解析后的 `claude-mem` 数据目录下的 `modes/` 文件夹中。
- 不要在聊天、命令参数、日志或工具输出中暴露 Telegram token。将其视为密码。
- 保留无关设置和现有 Telegram 触发器。辅助工具会做带时间戳的备份并合并请求的触发器。
- 本地 worker 运行时支持自定义模式。如果 `CLAUDE_MEM_RUNTIME` 为 `server`，请说明该流程无法安全地将每用户模式安装到共享服务端，并在任何变更前停止。
- 现有观察项保留其原始类型。新模式适用于未来的观察生成。

## 1. 用目的开始

以这段消息作为第一次交互提问：

> Custom modes let you take notes for whatever you're working on. If you're a law student, you may want to write down every time a case establishes a rule, a professor flags an exam trap, or doctrines conflict. If you're an architect, you may want to capture every design decision, code constraint, client preference, or site discovery. What are you working on?

不要先要求提供模式名称或 JSON 字段。先了解工作内容。

如果回答与代码相关，请说：

> Code mode already works well for software work. A custom variant may work better if it also tracks [2–4 specific kinds of notes inferred from their work] and tags [2–4 useful cross-cutting themes]. Would you like to keep standard code mode or customize it?

Use concrete suggestions. For an ML platform engineer, for example, suggest experiment outcomes, data-contract changes, production incidents, model decisions, cost findings, and reproducibility risks—not generic “custom notes.” If the user chooses standard code mode, do not create a redundant file; continue to the optional notification and verification steps.

If the user chooses standard code mode, do not create a redundant file; continue to the optional notification and verification steps.

## 2. 发现值得记住的内容

使用后续问题获取：

1. 三个他们希望下周可查到的时刻或发现。
2. 应该跳过的常规活动。
3. 之后会查找的人、案件、材料、客户、约束、实验、事故等名词与决策。
4. 任何不应被记录或发送到 Telegram 的敏感内容。
5. 笔记应该是选择性记录还是详细记录。

使用对话中已包含的答案，不要重复提问。若用户给出范围过宽的答案，请给出示例并让其选择或编辑。

## 3. 提出模式方案

起草前请阅读 [references/mode-authoring.md](references/mode-authoring.md)。

提出以下内容：

- 一个清晰的模式名称和小写 ID。
- 通常为 4–8 个观察类型。每个观察项恰好归属一个类型。
- 通常为 4–8 个概念标签。一个条目可包含多个概念。
- 一句用于记录与跳过的策略。
- 两条该模式会记录的示例，以及两条会跳过的示例。

以自然语言提交提案，并使用交互式提问工具获得批准。让用户可以重命名、添加、移除或改写分类。未获批准分类和隐私边界前，不要写入或安装。

优先使用继承式 ID，例如 `code--architecture-practice`，使该模式复用 claude-mem 的稳定输出协议，同时替换领域分类法和行为提示。`code` 父模式是实现基底；覆盖必须移除 code 特有语义。仅在继承确实不合适时才使用独立模式。

## 4. 询问 Telegram 提醒

在分类方案获批后，询问：

> Would you like Telegram notifications when claude-mem records any particular types or tags? Alerts include the observation type, title, subtitle, project, and observation ID, so avoid selecting categories that may expose sensitive material.

If yes:

- 让用户从已批准的模式中选择精确的观察类型和/或概念标签。
- 说明匹配是 OR 关系：任一选中类型或任一选中概念都触发提醒。
- 询问是否已经将 Telegram 机器人连接到 claude-mem。
- 阅读 [references/telegram.md](references/telegram.md)，然后引导新用户完成 BotFather 与安全设置助手的流程。

如果否，则保持所有 Telegram 设置不变。

## 5. 起草、校验并安装

解析该 `SKILL.md` 所在的绝对目录；所有辅助路径均相对于该目录。

将批准的模式写入一个临时 JSON 文件。使用编写参考中的精确继承覆盖形状。然后在不进行任何变更的情况下校验：

```bash
node <skill-directory>/scripts/install-mode.mjs \
  --mode <temporary-mode.json> \
  --mode-id <parent--custom-id> \
  --dry-run
```

在安装前修复所有校验错误。然后安装并激活：

```bash
node <skill-directory>/scripts/install-mode.mjs \
  --mode <temporary-mode.json> \
  --mode-id <parent--custom-id> \
  --telegram-types <comma-separated-approved-types> \
  --telegram-concepts <comma-separated-approved-concepts>
```

若用户拒绝提醒，则省略两个 Telegram 参数。该安装器会：

- 将 override 与其父模式合并并校验完整模式。
- 在 `<data-dir>/modes/` 下安装源 override。
- 在 `settings.json` 中设置 `CLAUDE_MEM_MODE`。
- 合并已批准的提醒触发器，不会删除现有触发器。
- 原子写入并报告任何备份路径。

检查其 JSON 结果。如果 `ok` 不为 `true`，不要声称成功。

## 6. 必要时连接 Telegram

如果请求了提醒且 bot token 与 chat ID 已经存在，先请求许可后复用并发送测试。若凭据缺失，说明 Telegram 参考中的 BotFather 步骤。

仅在明确授权后运行凭据助手：

```bash
node <skill-directory>/scripts/configure-telegram.mjs \
  --types <comma-separated-approved-types> \
  --concepts <comma-separated-approved-concepts>
```

该助手通过隐藏终端输入接收 token，使用 `getMe` 验证，在发现或询问 chat ID 后发送测试消息，并以仅所有者可读权限存储设置。切勿将 token 作为参数传递。

如果 agent 环境无法让用户控制交互式终端，请显示完整的助手命令并暂停，等待用户本地运行。这是唯一可接受的手动边界；不要要求他们将 token 贴到聊天中作为变通。用户确认后，仅检查凭据字段是否存在——绝不输出其值。

## 7. 重启并验证结果

重启前读取已配置的运行时。对于 worker 运行时，请使用已验证的 CLI 重启路径：

```bash
npx claude-mem restart
npx claude-mem status
```

如果 CLI shim 不可用，使用 Bun 运行已安装插件的 `scripts/worker-service.cjs restart`。当有可用的 CLI 路径时，不要使用裸重启 HTTP 请求。

验证以下全部内容：

1. 重启报告了新的健康 worker 且成功退出。
2. 安装文件存在于已解析的数据目录下。
3. `settings.json` 中写明了目标 `CLAUDE_MEM_MODE`，且不显示敏感信息。
4. 在可用时用 `session_start_context` MCP 工具请求完整启动上下文。否则调用配置好的本地 worker 上的 `/api/context/inject?project=mode-creator-verification&full=true`。
5. 启动上下文包含 `Mode: <mode name> (<mode id>)`。
6. 若已配置 Telegram，测试消息已送达。

请先确认：这个片段要使用哪些 **skill / 插件组**？  
（如 `agent-reach`、`baoyu-skills`、`delegate` 等，或你想启用的任意具体组合）  
确认后我会直接给出该段内容的中文对应译文。
