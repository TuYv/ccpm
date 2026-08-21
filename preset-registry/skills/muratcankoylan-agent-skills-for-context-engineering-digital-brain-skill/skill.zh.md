---
name: digital-brain
description: "This skill should be used for personal operating-system workflows: content creation, voice consistency, relationship lookup, meeting preparation, weekly review, goal tracking, personal brand management, and network management."
version: 1.0.0
---
# 数字大脑

一个结构化的个人操作系统，借助 AI 管理数字形象、知识、人际关系和目标。专为公开构建产品的创始人、希望扩大受众群体的内容创作者，以及寻求 AI 辅助个人管理的技术型专业人士而设计。

**重要提示**：此 Skill 采用渐进式披露。各模块的具体说明位于相应子目录的 `.md` 文件中。只加载当前任务所需的内容。

## 何时激活

当用户有以下需求时，激活此 Skill：

- 请求创作内容（帖子、长帖、新闻简报）——首先加载 identity/voice.md
- 请求个人品牌或定位方面的帮助
- 需要查找或管理联系人/人际关系
- 希望记录或完善内容创意
- 请求会议准备或会后跟进
- 请求每周复盘或目标跟踪
- 需要保存或检索已收藏的资源
- 希望整理研究或学习资料

**触发短语**：“写一篇帖子”、“我的表达风格”、“内容创意”、“[姓名] 是谁”、“准备会议”、“每周复盘”、“保存这个”、“我的目标”

## 核心概念

### 渐进式披露架构

数字大脑采用三级加载模式：

| 层级 | 加载时机 | 内容 |
|-------|-------------|---------|
| **L1：元数据** | 始终加载 | 此 SKILL.md 概览 |
| **L2：模块说明** | 按需加载 | `[module]/[MODULE].md` 文件 |
| **L3：数据文件** | 需要时加载 | `.jsonl`、`.yaml`、`.md` 数据 |

### 文件格式策略

为实现最佳的 Agent 解析效果而选择的格式：

- **JSONL** (`.jsonl`)：仅追加日志——创意、帖子、联系人、互动
- **YAML** (`.yaml`)：结构化配置——目标、价值观、社交圈
- **Markdown** (`.md`)：叙述性内容——表达风格、品牌、日历、待办事项
- **XML** (`.xml`)：复杂提示词——内容生成模板

### 仅追加数据完整性

JSONL 文件是**仅追加**的。绝不要删除条目：
- 将其标记为 `"status": "archived"`，而不是删除
- 保留历史记录以便进行模式分析
- 支持“哪些方法有效”的回顾分析

## 详细主题

### 模块概览

```
digital-brain/
├── identity/     → Voice, brand, values (READ FIRST for content)
├── content/      → Ideas, drafts, posts, calendar
├── knowledge/    → Bookmarks, research, learning
├── network/      → Contacts, interactions, intros
├── operations/   → Todos, goals, meetings, metrics
└── agents/       → Automation scripts
```

### 身份模块（内容创作的关键）

**生成任何内容之前，始终先阅读 `identity/voice.md`。**

包含：
- `voice.md` - 语气、风格、词汇、表达模式
- `brand.md` - 定位、受众、内容支柱
- `values.yaml` - 核心信念和原则
- `bio-variants.md` - 特定平台的个人简介
- `prompts/` - 可复用的生成模板

### 内容模块

流程：`ideas.jsonl` → `drafts/` → `posts.jsonl`

- 立即将创意记录到 `ideas.jsonl`
- 使用 `templates/` 在 `drafts/` 中完善内容
- 将已发布的内容及其指标记录到 `posts.jsonl`
- 在 `calendar.md` 中进行规划

### 人脉模块

具有关系层级的个人 CRM：
- `inner` - 每周联系
- `active` - 每两周联系
- `network` - 每月联系
- `dormant` - 每季度进行重新激活检查

### 运营模块

具有优先级的生产力系统：
- P0：今天完成，会造成阻塞
- P1：本周完成，重要
- P2：本月完成，有价值
- P3：待办事项，有则更好

## 实践指南

### 内容创作工作流

```
1. Read identity/voice.md (REQUIRED)
2. Check identity/brand.md for topic alignment
3. Reference content/posts.jsonl for successful patterns
4. Use content/templates/ as starting structure
5. Draft matching voice attributes
6. Log to posts.jsonl after publishing
```

### 会前准备

```
1. Look up contact: network/contacts.jsonl
2. Get history: network/interactions.jsonl
3. Check pending: operations/todos.md
4. Generate brief with context
```

### 每周复盘流程

```
1. Run: python agents/scripts/weekly_review.py
2. Review metrics in operations/metrics.jsonl
3. Check stale contacts: agents/scripts/stale_contacts.py
4. Update goals progress in operations/goals.yaml
5. Plan next week in content/calendar.md
```

## 示例

### 示例：撰写 X 帖子

**输入**："帮我写一篇关于 AI 智能体的帖子"

**流程**：
1. 阅读 `identity/voice.md` → 提取表达风格属性
2. 检查 `identity/brand.md` → 确认 "ai_agents" 是内容支柱
3. 参考 `content/posts.jsonl` → 查找类似的成功帖子
4. 起草符合表达风格模式的帖子
5. 如果不立即发布，建议将其添加到 `content/ideas.jsonl`

**输出**：采用用户真实表达风格并符合平台格式的帖子草稿。

### 示例：联系人查询

**输入**："帮我为与 Sarah Chen 的通话做准备"

**流程**：
1. 在 `network/contacts.jsonl` 中搜索 "Sarah Chen"
2. 从 `network/interactions.jsonl` 获取近期条目
3. 检查 `operations/todos.md` 中与 Sarah 相关的待处理事项
4. 汇总简报：职位、背景、上次讨论的内容、后续事项

**输出**：包含关系背景的会前简报。

## 指南

1. **表达风格优先**：生成任何内容之前，始终先阅读 `identity/voice.md`
2. **仅追加**：绝不从 JSONL 文件中删除内容，而是将其归档
3. **更新时间戳**：修改受跟踪的数据时，设置 `updated` 字段
4. **交叉引用**：知识为内容提供信息，人脉为运营提供信息
5. **记录互动**：始终将会议和通话记录到 `interactions.jsonl`
6. **保留历史记录**：`posts.jsonl` 中的过往内容为未来表现提供参考

## 集成

此技能集成了上下文工程原则：

- **context-fundamentals** - 渐进式披露、注意力预算管理
- **memory-systems** - 使用 JSONL 实现持久化记忆和结构化检索
- **tool-design** - `agents/scripts/` 中的脚本遵循工具设计原则
- **context-optimization** - 模块分离可防止上下文膨胀

## 参考资料

内部参考：
- [身份模块](./identity/IDENTITY.md) - 表达风格和品牌详情
- [内容模块](./content/CONTENT.md) - 内容流水线文档
- [人脉模块](./network/NETWORK.md) - CRM 文档
- [运营模块](./operations/OPERATIONS.md) - 生产力系统
- [智能体脚本](./agents/AGENTS.md) - 自动化文档

外部资源：
- [用于上下文工程的智能体技能](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [Anthropic 上下文工程指南](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## 技能元数据

**创建日期**：2024-12-29
**最后更新**：2024-12-29
**作者**：Murat Can Koylan
**版本**：1.0.0