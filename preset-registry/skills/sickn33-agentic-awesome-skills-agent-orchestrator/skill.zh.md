---
name: agent-orchestrator
description: Meta-skill que orquestra todos os agentes do ecossistema. Scan automatico de skills, match por capacidades, coordenacao de workflows multi-skill e registry management.
risk: safe
source: community
date_added: '2026-03-06'
author: renat
tags:
- orchestration
- multi-agent
- workflow
- automation
tools:
- claude-code
- antigravity
- cursor
- gemini-cli
- codex-cli
---
# 代理编排器

## 概览

该元技能负责编排生态系统中的全部代理。自动扫描技能、基于能力进行匹配、协同多技能工作流，并进行注册表管理。

## 何时使用该技能

- 当你需要该领域的专项协助时

## 不应使用该技能的情况

- 任务与 agent orchestrator 无关
- 更简单、更具体的工具可以处理该请求
- 用户需要不依赖领域专长的一般性帮助

## 工作原理

该元技能作为整个 skill 生态系统的决策与协调中心层。它会自动扫描、识别相关代理，并为复杂任务编排多个技能。

## 原则：零人工干预

- **始终在处理任何请求前扫描**
- 新增技能在任意子目录创建 SKILL.md 时会被**自动检测并纳入**
- 被移除的技能会被**自动从注册表排除**
- 无需任何手动命令即可注册新技能

---

## 每个请求的必执行流程

在处理任何用户请求前执行以下步骤。
脚本会自动使用相对路径 —— 适用于任何目录。

## 步骤 1：自动发现（扫描）

```bash
python agent-orchestrator/scripts/scan_registry.py
```

通过 MD5 哈希缓存实现超快（<100ms）扫描。仅重处理已更改的文件。
返回包含所有发现技能的 JSON 摘要。

## 步骤 2：技能匹配

```bash
python agent-orchestrator/scripts/match_skills.py "<用户请求>"
```

返回按相关性排序的技能 JSON。结果说明如下：

| 结果              | 操作                                                     |
|:------------------|:---------------------------------------------------------|
| `matched: 0`      | 未匹配到任何相关技能。按常规方式处理，不使用技能。       |
| `matched: 1`      | 匹配到 1 个相关技能。加载其 SKILL.md 并遵循执行。       |
| `matched: 2+`     | 匹配到多个技能。执行步骤 3（编排）。                     |

## 步骤 3：编排（matched >= 2 时）

```bash
python agent-orchestrator/scripts/orchestrate.py --skills skill1,skill2 --query "<请求内容>"
```

返回执行方案，包含模式、步骤顺序，以及技能间的数据流。

## 快速流程（快捷方式）

对于简单查询，步骤 1+2 可按顺序合并执行：
```bash
python agent-orchestrator/scripts/scan_registry.py && python agent-orchestrator/scripts/match_skills.py "<请求内容>"
```

---

## 技能注册表

注册表位于：
```
agent-orchestrator/data/registry.json
```

## 搜索位置

扫描器在以下位置查找 SKILL.md：
1. `.claude/skills/*/`（在 Claude Code 中注册的技能）
2. `*/`（位于顶层的独立技能）
3. `*/*\`（子目录中的技能，深度最多 3 级）

## 每个技能的元数据

每个注册表条目包含：

| 字段          | 说明                                              |
|:--------------|:--------------------------------------------------|
| name          | 名称（YAML frontmatter 中的 name）                |
| description   | 完整描述（包含触发词）                            |
| location      | 目录绝对路径                                     |
| skill_md      | SKILL.md 的绝对路径                              |
| registered    | 是否位于 .claude/skills/（true/false）             |
| capabilities  | 能力标签（自动提取 + 显式声明）                   |
| triggers      | 从 description 提取的激活关键词                   |
| language      | 主要语言（python/nodejs/bash/none）                |
| status        | active / incomplete / missing                      |

## 注册表命令

```bash

## 快速扫描（使用哈希缓存）

python agent-orchestrator/scripts/scan_registry.py

## 详细状态表

python agent-orchestrator/scripts/scan_registry.py --status

## 全量重扫（忽略缓存）

python agent-orchestrator/scripts/scan_registry.py --force
```

---

## 匹配算法

对于每个请求，matcher 按以下方式给技能打分：

| 准则                     | 分值  | 示例                                  |
|:-------------------------|:------|:--------------------------------------|
| 技能名出现在 query 中     | +15   | "use web-scraper" -> web-scraper      |
| 精确触发关键词匹配         | +10   | "scrape" -> web-scraper               |
| 能力类别匹配               | +5    | data-extraction -> web-scraper        |
| 词汇重叠                   | +1    | query 中的词出现在 description 中     |
| 项目加权                   | +20   | 技能分配给当前项目时                 |

最低阈值为 5 分，低于该分值的技能将被忽略。

## 带项目匹配

```bash
python agent-orchestrator/scripts/match_skills.py --project meu-projeto "query aqui"
```

分配到项目的技能会自动获得 +20 的加权分。

---

## 编排模式

当多个技能相关时，orchestrator 会将其归类为以下模式：

## 1. 顺序流水线

技能形成链式结构，每个技能的输出输入到下一个。

**适用：** “生产型”技能（data-extraction、government-data）与“消费型”技能（messaging、social-media）的组合。

**示例：** web-scraper 采集价格 -> whatsapp-cloud-api 发送告警

```
user_query -> web-scraper -> whatsapp-cloud-api -> result
```

## 2. 并行执行

技能在请求的不同方面独立工作。

**适用：** 所有技能角色相同（全部为生产型或全部为消费型）。

**示例：** instagram 发布帖子 + whatsapp-cloud-api 发送通知（两者共享相同内容）

```
user_query -> [instagram, whatsapp-cloud-api] -> aggregated_result
```

## 3. 主技能 + 辅助

一个技能作为主导，其余技能提供辅助数据。

**适用：** 一个技能分数显著高于其他技能（>= 2 倍）。

**示例：** whatsapp-cloud-api 发送消息（主技能）+ web-scraper 提供数据（辅助）

```
user_query -> whatsapp-cloud-api (primary) + web-scraper (support) -> result
```

## 详见 `References/Orchestration-Patterns.Md`

---

## 项目管理

将技能分配给项目可实现持续的相关性加权和上下文联动。

## 项目文件

```
agent-orchestrator/data/projects.json
```

## 操作

**创建项目：**
将条目添加到 projects.json：
```json
{
  "name": "nome-do-projeto",
  "created_at": "2026-02-25T12:00:00",
  "skills": ["web-scraper", "whatsapp-cloud-api"],
  "description": "Descricao do projeto"
}
```

**向项目添加技能：** 更新该项目的 `skills` 数组。

**从项目移除技能：** 从 `skills` 数组中删除。

**查看项目技能：** 读取 projects.json 并列出已分配的技能。

---

## 添加新技能

要向生态系统添加新技能：

1. 在任意 `skills root:` 下创建文件夹
2. 创建一个包含 YAML frontmatter 的 `SKILL.md`：
```yaml
---
name: minha-nova-skill
description: "Descricao com keywords de ativacao..."
---

## Skill Documentation

```
3. **完成！** 下一次请求时 auto-discovery 会自动检测到该技能。

如需 Claude Code 原生发现，可选：
4. 将 SKILL.md 复制到 `.claude/skills/<nome>/SKILL.md`

## 显式能力标签（可选）

将其添加到 frontmatter 可提高匹配精度：
```yaml
capabilities: [data-extraction, web-automation]
```

---

## 查看所有技能状态

```bash
python agent-orchestrator/scripts/scan_registry.py --status
```

## 状态说明

| 状态       | 含义                                                |
|:-----------|:----------------------------------------------------|
| active     | 同时存在 name 与 description 的 SKILL.md            |
| incomplete | SKILL.md 存在但缺少 name 或 description             |
| missing    | 目录存在但缺少 SKILL.md                             |

---

## 当前生态系统技能

| Skill              | 能力                                   | 状态    |
|:-------------------|:---------------------------------------|:--------|
| web-scraper        | data-extraction, web-automation        | active  |
| junta-leiloeiros   | government-data, data-extraction       | active  |
| whatsapp-cloud-api | messaging, api-integration             | active  |
| instagram          | social-media, api-integration          | partial |

*该表格会通过 `scan_registry.py --status` 自动更新。*

## 最佳实践

- 提供关于你的项目和需求清晰、具体的上下文
- 在将建议应用到生产代码之前先审查所有建议
- 与其他互补技能结合使用以获得更全面的分析

## 常见陷阱

- 将此 skill 用于其领域外的任务
- 在未理解你的具体上下文的情况下应用建议
- 未提供足够的项目上下文，导致分析不够准确

## 相关技能

- `multi-advisor` - 增强分析的互补技能
- `task-intelligence` - 增强分析的互补技能

## 局限性
- 仅在任务明确符合上述范围时使用此 skill。
- 不要把输出当作与环境相关的验证、测试或专家审查的替代品。
- 如果缺少必需输入、权限、安全边界或成功标准，请停下来并要求澄清。
