---
name: ima-copilot
description: >
  Installs, troubleshoots, and personalizes the official Tencent IMA skill (a wrapper
  layer that orchestrates upstream ima-skill, not a replacement). Use when the user
  mentions IMA, 腾讯 IMA, ima.qq.com, ima-skill, installing or configuring ima-skill,
  IMA API key / credentials, searching across IMA knowledge bases, 知识库搜索, 笔记搜索,
  fan-out search with preferred KBs / priority boosting, or wants to diagnose, repair, or
  personalize an ima-skill install. Also trigger on the missing-YAML-frontmatter bug in
  ima-skill submodule SKILL.md files and errors like "Skipped loading skill(s) due to
  invalid SKILL.md".
---
# IMA Copilot

面向腾讯官方 IMA skill 的一键式安装器、故障排查工具和个性化层。

## 概述

腾讯官方 IMA skill（ima-skill）提供了强大的 OpenAPI，可用于笔记和知识库操作，但其安装流程是为特定的专有智能体设计的，而且近期发布的版本中包含无法通过严格 SKILL.md 加载器校验的子模块文件。IMA Copilot 解决了这两个问题：

1. 通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) 开放式安装器，使用一条命令将 ima-skill 安装到 Claude Code、Codex 和 OpenClaw。
2. 引导用户完成 API key 配置，并通过实时验证调用进行校验。
3. 检测已知的上游问题，并在获得用户明确同意后就地修复，绝不会复刻、内置或镜像上游软件包的任何部分。
4. 提供扇出搜索策略，遵循用户配置的知识库优先级和加权设置，并知晓每个知识库最多返回 100 条结果的截断限制。

## 架构原则（不得违反）

此 skill 是 ima-skill 的**包装层**。以下包装契约不可协商：

- **绝不内置上游文件。** 此 skill 目录不包含 ima-skill 自身内容的任何副本、分支或摘录。当 ima-skill 发布新版本时，用户可直接获得新版本，不受此包装层的任何干扰。
- **修复在运行时进行，而不是在发布时进行。** 如果需要修补上游缺陷，此 skill 携带的是修补*说明*，而不是修补后的文件。修复操作具有幂等性：在上游更新后重新运行时，会重新检测并修复任何再次出现的问题。
- **修改上游文件前始终先征得同意。** 修改 `~/.claude/skills/ima-skill/**`、`~/.agents/skills/ima-skill/**` 或任何其他上游安装目录，都必须通过 AskUserQuestion 获得用户明确同意。不得静默修补。
- **授人以渔，而不是隐藏细节。** 应用修复后，向用户准确展示更改了哪些内容，以及备份保存在哪里。这样用户才能学会自行维护安装。

## 此 skill 的功能

| 能力 | 入口点 | 详情 |
|---|---|---|
| 1. 将上游 ima-skill 安装到 3 个智能体 | `scripts/install_ima_skill.sh` | 参见 `references/installation_flow.md` |
| 2. 配置 API 凭据（XDG 风格） | 下方内联工作流 | 参见 `references/api_key_setup.md` |
| 3. 诊断并修复已知的上游问题 | `scripts/diagnose.sh` + 下方工作流 | 参见 `references/known_issues.md` |
| 4. 使用优先级加权进行扇出搜索 | `scripts/search_fanout.py` | 参见 `references/search_best_practices.md` |

## 路由

触发此 skill 后，对用户意图进行分类，并跳转到相应能力：

| 用户可能会说…… | 转到 |
|---|---|
| "装 ima"、"install ima-skill"、"把 ima 装一下"、"我想用 ima" | **能力 1** |
| "配 ima 的 key"、"configure ima credentials"、"ima API key" | **能力 2** |
| "ima 报错"、"SKILL.md warning"、"frontmatter 错误"、"ima 加载失败" | **能力 3** |
| "搜 X"、"在 ima 里搜 X"、"跨知识库搜索"、"扇出搜 X" | **能力 4** |
| "帮我从头跑一遍 ima" | 按顺序执行 1 → 2 → 3 → 4 |

如有疑问，请从能力 3（诊断）开始——它会准确显示哪些能力受阻，以及阻塞的先后顺序。

## 能力 1：安装上游 ima-skill

安装程序会从 `https://app-dl.ima.qq.com/skills/` 下载最新的官方版本，将其暂存到临时目录中，然后交由 `npx skills add <local-path>` 分发到 Claude Code、Codex 和 OpenClaw。

运行方式：

```bash
bash scripts/install_ima_skill.sh
```

该脚本会自动检测用户机器上安装了上述三个目标智能体中的哪些。对于不存在的智能体，它会直接静默跳过，而不会在用户未主动选择的位置进行安装。对于已存在的智能体，它会使用 vercel skills 默认的符号链接模式进行全局安装（`-g`）：第一个检测到的智能体目录会成为规范副本，其余智能体则通过符号链接指向该目录。这意味着，只需应用一次修复或升级，变更就会自动传播到每个智能体——`diagnose.sh` 会检测这种共享关系并对报告进行去重，避免同一问题重复出现多次。

有关版本覆盖、检测逻辑、故障排除，以及安装程序生成的完整逐文件布局，请阅读 `references/installation_flow.md`。

## 能力 2：配置 API 凭据

凭据采用 XDG 风格存储，与任何智能体的技能目录解耦：

- `~/.config/ima/client_id`（权限模式 `600`）
- `~/.config/ima/api_key`（权限模式 `600`）
- `~/.config/ima/`（权限模式 `700`）

环境变量 `IMA_OPENAPI_CLIENTID` 和 `IMA_OPENAPI_APIKEY` 可作为后备覆盖项——包装程序会先读取环境变量，再读取配置文件。

引导用户逐步完成设置：

1. 打开 `https://ima.qq.com/agent-interface`，创建新的 Client ID 和 API Key。
2. 将这两个值写入 XDG 配置路径（或导出环境变量）。
3. 使用 `{"query": "", "cursor": "", "limit": 1}` 向 `https://ima.qq.com/openapi/wiki/v1/search_knowledge_base` 发起一次存活性调用，以确认凭据已被接受——收到 `code: 0, msg: success` 响应即表示准备就绪。

完整脚本以及确切的请求/响应模式位于 `references/api_key_setup.md`。

## 能力 3：诊断并修复已知问题

这正是此技能存在的原因。上游软件包中确实存在会导致某些智能体无法加载的错误，而修复方法已经非常明确，但应用这些修复需要用户同意。诊断/修复工作流是此技能的**核心约定**。

### 第 1 步——运行只读诊断

```bash
bash scripts/diagnose.sh
```

`diagnose.sh` **绝不会修改任何文件**。它会输出结构化报告，每项检查占一行：

```
✅ upstream ima-skill installed (claude-code)
✅ upstream ima-skill installed (codex)
❌ upstream ima-skill NOT installed (openclaw)
✅ API credentials valid (search_knowledge_base returned 12 KBs)
⚠️ ISSUE-001: notes/SKILL.md missing YAML frontmatter (claude-code)
⚠️ ISSUE-001: knowledge-base/SKILL.md missing YAML frontmatter (claude-code)
⚠️ ISSUE-001: notes/SKILL.md missing YAML frontmatter (codex)
⚠️ ISSUE-001: knowledge-base/SKILL.md missing YAML frontmatter (codex)
```

### 步骤 2 — 解析报告并询问用户

对于每一条包含 `⚠️` 或 `❌` 的行，在 `references/known_issues.md` 中查找对应问题。该文件是以下信息的权威来源：

- 问题是什么（症状、根本原因）
- 存在哪些修复策略（`A`、`B`、`skip`）
- 每种策略对应的确切 shell 命令
- 每种策略会修改哪些文件
- 上游维护者可能尚未修复该问题的原因

### 步骤 3 — 修改上游文件前获取明确同意

对于每个存在多种修复策略的问题，都应使用 **AskUserQuestion**。表述要通俗易懂——用户可能不知道“YAML 前置元数据”是什么意思。先用用户能理解的方式描述该错误对他们造成的影响（“加载器会悄无声息地跳过两个文件，因此 note-search 和 knowledge-base-search 实际上无法工作”），然后根据每种策略带来的结果，而非其实现机制，描述各个策略。

当存在多种策略时，绝不能只提供一个“直接修复”的选项。用户的选择可能会因该 skill 无法观察到的因素而合理地有所不同——例如，如果他们计划手动与上游版本进行比较，可能会更倾向于策略 B（最小差异）。

### 步骤 4 — 执行所选策略

`references/known_issues.md` 中的每条修复命令都具备以下特性：

- **幂等**——在修复已应用后重新运行不会造成任何损害，并会输出清晰的“already fixed”消息。
- **已备份**——修复程序会在修改任何内容之前，将原始文件复制到 `/tmp/ima-copilot-backups/<timestamp>/<relative-path>`，随后告知用户备份位置。
- **可逆**——用户可以使用最后显示的一条 `cp` 命令从备份中恢复。

### 步骤 5 — 重新运行诊断以进行确认

修复后，再次运行 `diagnose.sh`，并向用户展示差异。该问题应从 `⚠️` 变为 `✅`。如果没有发生变化，请停止操作并向用户展示未经处理的修复前后结果，而不是静默重试——此处出现意外失败，通常意味着上游发布了未预见的变更。

### 关于上游更新的重要说明

从 **ima-skill 升级会替换所有内容** 这一意义上说，每次修复都是临时的。这是有意为之：该 skill 不会与上游争夺持久化状态。当用户通过功能 1 升级 ima-skill 后，诊断流程的步骤 4 会再次标记已修复的问题，用户可以重新运行修复。这是特性，而不是错误——如果上游最终修复了该问题，修复操作将不再必要，`diagnose.sh` 会直接报告 ✅，而不会提示用户。

## 功能 4：个性化扇出搜索

IMA 的 OpenAPI 存在三项硬性限制，任何严肃的搜索工作流都必须加以考虑：

1. **没有跨知识库端点。** `search_knowledge` 每次调用都要求提供单个 `knowledge_base_id`。跨知识库搜索需要由客户端执行扇出，而不是 API 本身提供的功能。
2. **结果中没有相关性分数。** `info_list` 中的条目仅包含 `media_id`、`title`、`parent_folder_id` 和 `highlight_content`。任何超出插入顺序的排序都必须在客户端完成。
3. **静默截断至 100 条结果。** `search_knowledge` 对每个知识库最多返回 100 条命中结果，响应中不包含 `is_end` 或 `next_cursor` 字段。高频查询会被静默截断。

`scripts/search_fanout.py` 实现了完整的变通方案：

```bash
python3 scripts/search_fanout.py "<query>"
```

该脚本读取 `~/.config/ima/copilot.json` 中的个性化配置（优先知识库、跳过列表、策略），调用 `search_knowledge_base` 枚举知识库，并行扇出调用 `search_knowledge`，通过结果长度恰好为 100 来检测截断，并按知识库分组呈现结果，同时将优先组置于顶部。

个性化配置文件是**每位用户独有的**，且属于私有文件。此技能仅随附一个模板——参见 `config-template/copilot.json.example`。没有配置文件的用户会使用中性默认设置：扇出搜索所有可访问的知识库，按命中数对分组排序，不进行加权提升。

有关完整算法、截断处理策略、呈现格式，以及基于证据决定允许“跳过子集知识库”的详细说明（例如，某个精选知识库严格包含于一个主知识库时，可以安全地跳过该精选知识库，以减少重复命中），请阅读 `references/search_best_practices.md`。

## 此技能拒绝执行的操作

- **绝不将上游内容复制到本项目中。** 此目录不包含且永远不会包含 `ima-skill/SKILL.md`、`ima-skill/notes/**`、`ima-skill/knowledge-base/**` 或任何其他上游文件的副本。任何向此技能添加此类文件的人都应被拒绝。
- **绝不在 SKILL.md 中固定上游版本。** 安装脚本带有一个用于回退的默认版本，但 SKILL.md 本身与版本无关，因此能够适应上游版本发布，而无须升级此技能。
- **绝不静默修补上游文件。** 每条修改路径都要求显式调用 AskUserQuestion，并由用户主动做出选择。
- **绝不硬编码用户的知识库名称。** `copilot.json` 中的 `priority_kbs` 和 `skip_kbs` 字段完全由用户配置。`config-template/copilot.json.example` 中的示例值仅供说明。
- 执行修复时，**绝不跳过备份步骤**，无论差异多么微小。

## 文件布局

```
ima-copilot/
├── SKILL.md                         # This file — entry and routing
├── scripts/
│   ├── install_ima_skill.sh         # Download → stage → npx skills add to 3 agents
│   ├── diagnose.sh                  # Read-only health report
│   └── search_fanout.py             # Fan-out search with priority grouping
├── references/
│   ├── installation_flow.md         # Capability 1 deep dive
│   ├── api_key_setup.md             # Capability 2 deep dive
│   ├── known_issues.md              # Issue registry — source of truth for repairs
│   └── search_best_practices.md     # Capability 4 deep dive
└── config-template/
    └── copilot.json.example         # Template for ~/.config/ima/copilot.json
```