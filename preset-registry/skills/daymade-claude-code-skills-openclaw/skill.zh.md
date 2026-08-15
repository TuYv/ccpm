---
name: openclaw
description: >-
  Manage OpenClaw (龙虾) instance configurations. Use whenever the user wants
  to audit, diff, copy, add-model, list, or switch models in an openclaw.json
  file, or when they mention lobsters, 虾, 甲虾, 乙虾, DeepSeek patch,
  default model, model aliases, or OpenClaw config validation.
argument-hint: '[audit|diff|copy|add-model|list|switch] [options]'
---
# openclaw

用于管理 OpenClaw（龙虾）实例配置的统一技能。

## 子命令

```bash
python3 scripts/cli.py [audit|diff|copy|add-model|list|switch] [options]
```

每个子命令也可以直接运行，例如 `python3 scripts/audit.py ...`。

`diff` 是 `compare` 的别名。

## 共享行为

- **默认配置发现**：省略 `--config` / `--to` 时，该技能会按顺序
  搜索以下位置：
  1. `~/workspace/.force/openclaw/openclaw.json`
  2. `~/.kimi_openclaw/openclaw.json`
  3. `~/.openclaw/openclaw.json`
- **龙虾昵称**：`--config`、`--from` 和 `--to` 既可以是文件
  路径，也可以是在 `lobsters.json` 中注册的昵称（见下文）。你也可以使用
  `--from-lobster` 和 `--to-lobster` 显式指定昵称参数。
- **备份**：每次写入操作都会在保存前将配置复制到
  `config-backups/<stem>-<utc-timestamp>.json`。该技能会保留
  最近的 20 个备份。
- **试运行**：写入类子命令（`copy`、`add-model`、`switch`）支持
  使用 `--dry-run` 预览更改。
- **重启**：写入类子命令支持使用 `--restart` 在保存后重启 OpenClaw
  网关。
- **自动审计**：默认情况下，`copy`、`add-model` 和 `switch` 会在更改前后
  运行审计。使用 `--no-audit` 可跳过审计。

## 龙虾昵称注册表

在以下任一位置创建 JSON 文件：

- `~/workspace/.force/openclaw/lobsters.json`
- `~/.kimi_openclaw/lobsters.json`
- `~/.openclaw/lobsters.json`

示例：

```json
{
  "甲虾": "/path/to/甲虾/openclaw.json",
  "乙虾": "/path/to/乙虾/openclaw.json"
}
```

然后使用：

```bash
python3 scripts/cli.py copy gateway-provider --from 甲虾 --to 乙虾 --alias
python3 scripts/cli.py switch gateway-provider/deepseek-v4-pro --config 乙虾 --restart
```

---

## `audit` — 验证配置

```bash
python3 scripts/cli.py audit [--config PATH|NICKNAME] [--json]
```

检查提供商、模型、默认模型、别名和插件的一致性。

适用场景：

- "帮我查一下这只虾的配置"
- "audit 一下 openclaw.json"
- 应用补丁或复制提供商之前

---

## `diff` — 对两份配置进行语义差异比较

```bash
python3 scripts/cli.py diff LEFT.json RIGHT.json [--json] [--include-cost]
```

报告新增、移除或更改的提供商、模型、默认模型、别名和
插件。默认跳过成本字段；使用 `--include-cost` 比较这些字段。

适用场景：

- "为什么甲虾能用 DeepSeek，乙虾不行？"
- "这两份龙虾配置哪里不一样？"

---

## `copy` — 在配置之间复制提供商

```bash
python3 scripts/cli.py copy \
  --from SOURCE|NICKNAME [--to TARGET|NICKNAME] \
  provider-name [--model ID]... [--alias] [--restart] [--dry-run] [--no-audit]
```

将完整的提供商配置从一份配置复制到另一份配置。如果目标中已存在
该提供商，则会合并模型并更新 `baseUrl` / `api`，且不会删除
仅存在于目标中的模型。`--alias` 还会复制指向该提供商的别名。

适用场景：

- "把甲虾的 gateway provider 复制到乙虾"
- "把这个模型配置同步过去"

---

## `add-model` — 向提供商添加模型

```bash
python3 scripts/cli.py add-model provider model-id|model-json \
  [--config PATH|NICKNAME] [--from SOURCE|NICKNAME] [--alias NAME] \
  [--restart] [--dry-run] [--no-audit]
```

向提供商添加模型定义和别名。如果提供商不存在，可以先从 `--from` 复制。

指定模型的方式：

- 传入模型 ID，并通过 `--from SOURCE` 指定同一提供商中包含该模型的来源。
- 传入包含模型定义的 JSON 文件路径。

适用于：

- "给这只虾加上 DeepSeek"
- "把甲虾的 DeepSeek 配置复制到乙虾"

规范的 DeepSeek 模型定义位于
`references/deepseek_model.json`。

### 关键陷阱

- **不要创建单独的 `deepseek` 提供商。** 支持的方式是使用
  gateway 提供商，并将模型 ID 设为 `deepseek-v4-pro`。
- **模型 ID 不得包含 `[1m]`。** 应使用不带后缀的 `deepseek-v4-pro`；
  上游 gateway 会将其映射到 1M 上下文变体。
- **需要冷重启。** 热重载无法可靠地识别新提供商。

---

## `list` — 列出提供商、模型、别名和默认模型

```bash
python3 scripts/cli.py list [--config PATH|NICKNAME] [--json] [--validate]
```

默认输出人类可读格式；使用 `--json` 可将结果通过管道传给 `jq`。添加 `--validate`
可检查默认模型和别名是否能正确解析。

适用于：

- "这只虾有哪些模型？"
- "列出甲虾可用的模型"
- "看看默认模型是什么"

---

## `switch` — 更改默认模型

```bash
python3 scripts/cli.py switch provider/model-id \
  [--config PATH|NICKNAME] [--restart] [--dry-run] [--no-audit]
```

这是唯一会更改 `agents.defaults.model` 的子命令。它会验证
提供商和模型是否存在、备份配置并更新默认模型。
如果目标已是默认模型，则会直接退出，不再创建备份。

适用于：

- "把默认模型切成 DeepSeek"
- "切回原来的模型"

---

## 典型工作流

### 在一只龙虾上启用 DeepSeek

```bash
python3 scripts/cli.py audit --config 乙虾
python3 scripts/cli.py add-model gateway-provider deepseek-v4-pro \
  --config 乙虾 --from 甲虾 --alias "DeepSeek V4 Pro"
python3 scripts/cli.py switch gateway-provider/deepseek-v4-pro --config 乙虾 --restart
```

### 将可用配置克隆到一只新龙虾

```bash
python3 scripts/cli.py copy gateway-provider --from 甲虾 --to 乙虾 --alias --restart
python3 scripts/cli.py audit --config 乙虾
```

### 比较两只龙虾的差异

```bash
python3 scripts/cli.py diff 甲虾 乙虾
```

## 参考资料

- `references/openclaw_architecture.md` — 配置模式和术语
- `references/deepseek_patch_sop.md` — DeepSeek 补丁 SOP（已脱敏）
- `references/deepseek_model.json` — 由 `add-model` 加载的规范 DeepSeek 模型定义
- `references/lobster_registry.example.json` — 龙虾昵称注册表示例