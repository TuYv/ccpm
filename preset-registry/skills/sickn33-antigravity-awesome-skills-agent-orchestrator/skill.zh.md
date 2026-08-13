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
# Agent Orchestrator

## 概览

该元技能协调生态系统中的所有代理。它会自动扫描技能、按能力匹配、协调多技能工作流并管理注册表（registry）。

## 何时使用此技能

- 当你需要该领域的专业协助时

## 不要在以下情况使用此技能

- 任务与 agent orchestrator 无关
- 更简单、更具体的工具即可处理该请求
- 用户需要不具备领域专业性的通用帮助

## 工作方式

该元技能充当整个 skills 生态系统的决策与协调中心层。它会自动扫描、识别相关代理，并对复杂任务中的多个技能进行编排。

## 原则：零人工干预

- **始终在处理任何请求前先进行扫描**
- 新增技能会在任意子目录创建 SKILL.md 时**自动检测并纳入**
- 已移除的技能会**自动从注册表排除**
- 无需任何手动命令即可注册新技能

---

## 强制工作流（所有请求）

在处理任何用户请求前执行以下步骤。
这些脚本自动使用相对路径——可在任何目录运行。

## 第1步：自动发现（扫描）

```bash
python agent-orchestrator/scripts/scan_registry.py
```

通过 MD5 哈希缓存实现超快扫描（<100ms）。仅重新处理已修改的文件。
返回包含所有发现技能摘要的 JSON。

## 第2步：技能匹配

```bash
python agent-orchestrator/scripts/match_skills.py "<solicitacao do usuario>"
```

返回按相关性排序的技能 JSON。结果解读如下：

| 结果                 | 操作                                                     |
|:---------------------|:---------------------------------------------------------|
| `matched: 0`         | 没有找到相关技能。正常在不使用技能的情况下处理。         |
| `matched: 1`         | 找到一个相关技能。加载其 SKILL.md 并遵循其指引。        |
| `matched: 2+`        | 匹配到多个技能。执行第3步（编排）。                     |

## 第3步：编排（若匹配数量 >= 2）

```bash
python agent-orchestrator/scripts/orchestrate.py --skills skill1,skill2 --query "<solicitacao>"
```

返回执行计划，包含模式、step 顺序以及技能之间的数据流。

## 快速步骤（快捷方式）

对于简单查询，可将第 1+2 步串联执行：
```bash
python agent-orchestrator/scripts/scan_registry.py && python agent-orchestrator/scripts/match_skills.py "<solicitacao>"
```

---

## 技能注册表

注册表位于：
```
agent-orchestrator/data/registry.json
```

## 查找位置

扫描器会查找以下位置的 SKILL.md：
1. `.claude/skills/*/`（在 Claude Code 中注册的 skills）
2. `*/`（顶层的独立 skills）
3. `*/*\`（子文件夹中的 skills，深度最多 3）

## 每个技能的元数据

注册表中的每条记录包含：

| 字段           | 说明                                               |
|:---------------|:--------------------------------------------------|
| name           | 技能名称（来自 YAML frontmatter）                   |
| description    | 完整描述（包含触发词）                             |
| location       | 目录绝对路径                                      |
| skill_md       | SKILL.md 的绝对路径                               |
| registered     | 是否位于 `.claude/skills/`（true/false）            |
| capabilities   | 能力标签（自动提取 + 显式定义）                    |
| triggers       | 从 description 提取的触发关键词                      |
| language       | 主要语言（python/nodejs/bash/none）                  |
| status         | active / incomplete / missing                      |

## Registry 命令

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

对于每个请求，matcher 会按以下规则给技能打分：

| 维度                             | 分值 | 示例                                |
|:----------------------------------|:-----|:------------------------------------|
| 技能名出现在查询中                | +15  | "use web-scraper" -> web-scraper    |
| 精确触发词匹配                    | +10  | "scrape" -> web-scraper             |
| 能力分类匹配                      | +5   | data-extraction -> web-scraper       |
| 词汇重叠                          | +1   | 查询中的词出现在 description 中      |
| 项目加权                          | +20  | 技能与当前项目关联                  |

最低阈值为 5 分。低于该分值的技能将被忽略。

## 带项目匹配

```bash
python agent-orchestrator/scripts/match_skills.py --project meu-projeto "query aqui"
```

分配到项目的技能会自动获得 +20 的加权。

---

## 编排模式

当多个技能都相关时，orchestrator 会按模式分类：

## 1. 顺序流水线

技能形成一条链路，上一个技能的输出作为下一个技能的输入。

**适用：** 技能角色混合（“生产型”如 data-extraction、government-data 与“消费型”如 messaging、social-media）。

**示例：** web-scraper 获取价格 -> whatsapp-cloud-api 发送告警

```
user_query -> web-scraper -> whatsapp-cloud-api -> result
```

## 2. 并行执行

技能在请求的不同方面独立工作。

**适用：** 所有技能角色相同（全部为生产型或全部为消费型）。

**示例：** instagram 发布帖子 + whatsapp-cloud-api 发送通知（两者接收相同内容）

```
user_query -> [instagram, whatsapp-cloud-api] -> aggregated_result
```

## 3. 主从式协作

一个技能作为主导，其余技能提供辅助数据。

**适用：** 某个技能得分明显高于其他技能（>= 2x）。

**示例：** whatsapp-cloud-api 发送消息（主技能）+ web-scraper 提供数据（辅助）

```
user_query -> whatsapp-cloud-api (primary) + web-scraper (support) -> result
```

## 详见 `References/Orchestration-Patterns.Md`

---

## 项目管理

将技能分配到项目可带来相关性加权与持久上下文。

## 项目文件

```
agent-orchestrator/data/projects.json
```

## 操作

**创建项目：**
向 projects.json 添加条目：
```json
{
  "name": "nome-do-projeto",
  "created_at": "2026-02-25T12:00:00",
  "skills": ["web-scraper", "whatsapp-cloud-api"],
  "description": "Descricao do projeto"
}
```

**向项目添加技能：** 更新项目的 `skills` 数组。

**从项目移除技能：** 从 `skills` 数组中移除。

**查询项目技能：** 读取 projects.json 并列出已分配的技能。

---

## 添加新技能

要向生态系统添加新技能：

1. 在 `skills root:` 下任意位置创建一个文件夹
2. 创建带 YAML frontmatter 的 `SKILL.md`：
```yaml
---
name: minha-nova-skill
description: "Descricao com keywords de ativacao..."
---

## Documentacao Da Skill

```
3. **完成！** 在下一个请求中 auto-discovery 会自动检测到它。

可选：为了原生 Claude Code 的发现能力，
4. 将 SKILL.md 复制到 `.claude/skills/<nome>/SKILL.md`

## 显式能力标签（可选）

为更精确匹配可添加至 frontmatter：
```yaml
capabilities: [data-extraction, web-automation]
```

---

## 查看所有技能状态

```bash
python agent-orchestrator/scripts/scan_registry.py --status
```

## 状态说明

| 状态        | 含义                                               |
|:------------|:---------------------------------------------------|
| active      | SKILL.md 同时包含 name 与 description              |
| incomplete  | SKILL.md 存在但缺少 name 或 description            |
| missing     | 目录存在但缺少 SKILL.md                            |

---

## 生态系统当前技能

| Skill              | 能力                                   | 状态    |
|:-------------------|:--------------------------------------|:--------|
| web-scraper        | data-extraction, web-automation       | active  |
| junta-leiloeiros   | government-data, data-extraction      | active  |
| whatsapp-cloud-api | messaging, api-integration            | active  |
| instagram          | social-media, api-integration         | partial |

*此表会通过 `scan_registry.py --status` 自动更新。*

## 最佳实践

- 提供关于你的项目和需求清晰、具体的背景信息  
- 在将建议应用到生产代码之前先审查所有建议  
- 与其他互补技能结合以进行全面分析  

## 常见陷阱

- 将此技能用于其领域外的任务  
- 在不理解你具体上下文的情况下直接应用建议  
- 未提供足够的项目背景信息，导致分析不准确  

## 相关技能

- `multi-advisor` - 用于增强分析的互补技能  
- `task-intelligence` - 用于增强分析的互补技能  

## 局限性
- 仅在任务明确符合上述范围描述时使用此技能。  
- 不要将输出视为特定环境验证、测试或专家审核的替代。  
- 如果缺少必要输入、权限、安全边界或成功标准，请停止并请求澄清。
