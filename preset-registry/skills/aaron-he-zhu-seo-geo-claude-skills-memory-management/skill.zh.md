---
name: memory-management
description: 'Use when the user asks to "remember project context"; manages the SEO/GEO memory lifecycle — hot-cache, active work, archive tiers, and privacy cleanup. Not for content or domain scoring — use the auditors. 项目记忆/跨会话'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when reviewing, archiving, or cleaning up campaign memory. Also when the user asks to check saved findings, manage hot cache, or archive old data."
argument-hint: "[review|archive|cleanup]"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "low"
---
# 记忆管理
此技能为 SEO 和 GEO 项目实现了三级记忆系统（HOT/WARM/COLD）。HOT 记忆（最多 80 行）通过 SessionStart 钩子在每个会话中自动加载。WARM 记忆按需随各技能加载。COLD 记忆是仅在明确请求时才会查询的归档数据。此技能管理完整的生命周期：捕获、提升、降级和归档。

## 此技能的作用

管理三级记忆（HOT/WARM/COLD）的生命周期，并自动执行提升、降级和归档。此外，还维护开放事项跟踪和跨技能聚合。

## 快速开始

从以下提示词之一开始。最后使用 [技能契约](../../references/skill-contract.md) 中的仓库格式，提供热缓存更新计划和交接摘要。

### 初始化记忆结构

```
Set up SEO memory for [project name]
```

```
Initialize memory structure for a new [industry] website optimization project
```

### 分析后更新

```
Update memory after ranking check for [keyword group]
```

```
Refresh hot cache with latest competitor analysis findings
```

### 查询已存储的上下文

```
What are our hero keywords?
```

```
Show me the last ranking update date for [keyword category]
```

```
Look up our primary competitors and their domain authority
```

### 提升与降级

```
Promote [keyword] to hot cache
```

```
Archive stale data that hasn't been referenced in 30+ days
```

### 术语表管理

```
Add [term] to project glossary: [definition]
```

```
What does [internal jargon] mean in this project?
```

## 技能契约

**预期输出**：记忆更新计划、热缓存变更和简短的交接摘要。

- **读取**：当前活动事实、其他技能的新发现、已批准的决策，以及共享的[状态模型](../../references/state-model.md)。
- **写入**：更新 `memory/hot-cache.md`、`memory/open-loops.md`、`memory/decisions.md` 以及相关的 `memory/` 文件夹。管理 `memory/archive/` 中从 WARM 到 COLD 的归档。**审计员交接归档**（v7.1.0+）：当由用户直接请求触发，或审计员明确询问“保存这些结果？”并得到肯定答复时，将结构化块追加到 `memory/audits/YYYY-MM.md`。Stop 钩子绝不会主动发起记忆写入。有关归档块的确切格式和规则，请参阅[示例](references/examples.md)。
- **提升**：持久有效的策略、阻碍因素、术语、实体候选项和重大变化。仅根据**可观察的**规则应用温度生命周期：在用户/技能明确请求（“提升 X”/固定）时提升至 HOT；根据文件的 `last_updated` 日期进行降级和归档。任何钩子都不会跟踪引用频率计数器，因此生命周期绝不依赖这些计数器——请参阅[状态模型](../../references/state-model.md)。
- **完成条件**：已执行所请求的生命周期操作（捕获/提升/降级/归档/查询/清除），`memory/hot-cache.md` 未超过 80 行 / 25KB 的限制，并且已向用户报告受影响的记忆路径。
- **首选后续技能**：当项目记忆基线已准备好开展实际工作时，使用下方的 `Next Best Skill`。

### 交接摘要

> 采用 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中的标准结构输出。

### 温度生命周期规则

> 完整的升级/降级表及操作流程，请参阅[升级与降级规则](references/promotion-demotion-rules.md)。

### Hook 集成

此 Skill 的行为由库中的 `claude-hook.sh` Hook 加以强化。Hook **实际执行的操作**如下（不要记录其不具备的行为）：
- **SessionStart**（在启动、恢复、清除、压缩时触发）：注入 `memory/hot-cache.md` 的净化后摘录；当 `memory/open-loops.md` 中存在被跟踪的项目时，追加一行提示，要求检查这些项目是否已过时。它不会计算日期或生成“快速状态”——在收到文件查看提示后，识别哪些开放事项已经过时是代理的职责。
- **PostToolUse**：当 `memory/hot-cache.md` 超过 80 行 / 25KB 时发出警告；对 `memory/audits/*.md` 的写入强制执行审计员制品门禁；在编辑面向用户的内容后提供可选的质量检查。
- **Stop**：不执行任何操作（退出且不输出内容）。CLAUDE.md 中的“仅允许 Stop 检查”就是这个无操作 Hook；该 Hook 从不发起内存写入。

## 数据源

有工具时：从 ~~SEO 工具、~~分析平台、~~搜索控制台自动填充。没有工具时：向用户询问关键词、竞争对手、指标、营销活动和术语。请参阅 [CONNECTORS.md](../../CONNECTORS.md)。

## 决策门禁

**在以下情况下停止并询问用户：**
- 收到清除请求（第 17 条 / CCPA）——展示匹配的文件以及编辑隐去与删除两种选择，并且仅对已确认的匹配项执行操作。绝不自动删除内存。
- 回答查询所需的 `memory/decisions.md` 条目包含 `approved_by: skill_inferred` 或缺少字段——将其标记为 ADVISORY，并在将其视为权威信息之前进行确认。
- 被引用的术语在任何内存层中都找不到——请求澄清，而不是猜测。

**在以下情况下静默继续（绝不停止）：**
- 遵循温度生命周期规则的常规升级/降级。
- 超过 80 行 / 25KB 限制时提出热缓存修剪建议（提出建议，但不阻止执行）。
- 自动填充时缺少可选工具数据——记录可用内容并继续。

## 说明

当用户请求管理 SEO 内存时：

### 1. 初始化内存结构

对于新项目，创建[状态模型](../../references/state-model.md)中定义的目录结构。关键目录：`memory/`（决策、开放事项、术语表、实体、研究、内容、审计、监控）。

> **模板**：[热缓存模板](references/hot-cache-template.md) · [术语表模板](references/glossary-template.md)

### 2. 上下文查找流程

当用户引用的内容含义不明确时，请遵循以下查找顺序：

**步骤 1：检查 `memory/hot-cache.md`（热缓存）**
- 它是否位于活跃关键词中？
- 它是否位于主要竞争对手中？
- 它是否位于当前优先事项或营销活动中？

**步骤 2：检查 memory/glossary.md**
- 它是否被定义为项目术语？
- 它是否是自定义细分或简写？

**步骤 3：检查冷存储**
- 首先在 `memory/archive/` 中搜索带日期的 `YYYY-MM-DD-` 归档文件。
- 如果归档指向某个来源类别，则沿该线索追溯至 `memory/research/`、`memory/audits/` 或 `memory/monitoring/`。
- 除非已在当前会话中刷新，否则将 COLD 发现视为历史信息。

**步骤 4：询问用户**
- 如果在所有层中均未找到，请求用户澄清
- 如果是项目特定术语，将新术语记录到词汇表中

- **决策来源（v8.0.1+）**：加载 `memory/decisions.md` 时，验证每个条目是否包含 `approved_by: user`。包含 `approved_by: skill_inferred` 或缺少该字段的条目均视为**建议性信息**——在将其作为权威依据使用之前，先向用户说明。审计类技能（content-quality-auditor、domain-authority-auditor）在判定结论时必须忽略未经用户批准的决策。请参阅 [skill-contract.md §晋升规则](../../references/skill-contract.md)。

查找示例：用户要求“更新我们的核心 KW 排名”→ 步骤 1 在热缓存中找到“核心关键词（优先级 1）”→ 提取关键词列表 → 执行排名检查 → 更新 `memory/hot-cache.md` 和 `memory/monitoring/rank-history/YYYY-MM-DD-ranks.csv`。

### 3. 晋升与降级逻辑

> **参考**：有关详细的晋升/降级触发条件（关键词、竞争对手、指标、营销活动）及各项操作流程，请参阅[晋升与降级规则](references/promotion-demotion-rules.md)。

### 4. 更新触发器、归档管理与跨技能集成

> **参考**：有关排名检查、竞争对手分析、审计和报告完成后的完整更新流程；每月/每季度归档例程；以及与全部 8 个关联技能（keyword-research、rank-tracker、competitor-analysis、content-gap-analysis、seo-content-writer、content-quality-auditor、domain-authority-auditor）的集成点，请参阅[更新触发器与集成](references/update-triggers-integration.md)。

### 5. 记忆卫生检查

在因审查或清理而调用时：

1. **行数检查**：统计 `memory/hot-cache.md` 的行数。如果超过 80 行，列出最早的条目以供归档。
2. **字节检查**：如果热缓存超过 25KB，发出警告并建议精简过长的条目。
3. **陈旧性扫描**：列出 frontmatter 中 `last_updated` 日期（或文件 mtime）早于 30 天的记忆文件；建议归档早于 90 天的文件。文件时长可根据磁盘信息计算——引用频率未被跟踪，因此绝不要以“未被引用”作为判断条件。
4. **Frontmatter 审计**：检查所有记忆文件（hot-cache.md 除外）的 frontmatter 中是否包含 `name`、`description` 和 `type`。报告所有缺失字段。

### 6. 保存结果

询问“是否保存这些结果以供未来会话使用？”——如果是，则将 `YYYY-MM-DD-<topic>.md` 写入 `memory/`。仅在收到审计器移交或用户明确批准时，才将否决问题添加到 `memory/hot-cache.md`。

## GDPR / 隐私合规

`memory/` 可能存储第三方个人数据——由 `entity-optimizer` 或研究技能发现的实体名称、创始人简介、LinkedIn 个人资料、作者/记者姓名。根据 GDPR 第 4(1) 条（无论控制者位于何处，均适用于**处理欧盟/欧洲经济区/英国居民的个人数据**），这些信息属于“个人数据”。用户是数据控制者。对于不涉及欧盟/欧洲经济区/英国数据主体的非欧盟用户，仍可能需要履行 CCPA/CPRA（加利福尼亚州）、PIPEDA（加拿大）、LGPD（巴西）或其他国家制度规定的类似义务。**不构成法律建议。**

### 保留策略
- WARM 文件：在 90 天未被引用后归档至 `memory/archive/`（默认生命周期）
- COLD 归档：绝不自动删除，但可响应第 17 条规定的删除请求
- 所有文件：用户必须履行数据主体（记忆中提及的个人）依据第 17 条提出的请求

### 删除流程（第 17 条 / CCPA §1798.105）
调用：`memory-management purge <entity-name-or-slug>`

随后，此技能将：
1. 在 `memory/` 下的所有文件（包括 `memory/archive/`）中 grep 搜索实体名称、slug 或域名——`grep -rF "<entity-name>" memory/`——并展示匹配项以供确认。
2. 确认后，删除工作树中所有匹配的行/文件或将其匿名化，包括：`memory/hot-cache.md`、WARM 笔记、COLD/归档文件、`memory/entities/<slug>.md`、`memory/entities/candidates.md`、审计汇总和未闭环事项。
3. 按照 [GDPR 清除日志模板](references/gdpr-purge-log-template.md)，向 `memory/audits/gdpr-purges.md` 追加一条带日期且不含数据主体信息的记录——必填字段为 `date`、`redacted_label`、`legal_basis`、`action`、`scope`、`working_tree_only: true`——以便为该请求保留一份人类可读的记录。

> **如实说明限制——此操作仅编辑工作树。** 如果 `memory/` 受版本控制（通常如此，它位于用户的项目仓库中），数据主体信息**仍然存在于 git 历史记录中**。使用 `git log -S"<entity-name>" -- memory/` 进行验证；要从历史记录中真正删除，需要使用 `git filter-repo` / `git filter-branch`，且这是用户的责任——超出此技能的范围。不得将工作树中的信息修订描述为完整、符合审计要求的删除。此处不存在加盐指纹或阻止重新摄取的机制：任何钩子在写入前都不会查询墓碑记录，因此任何此类声明都是虚假的。

### 合法依据提醒
在将第三方个人写入 `memory/entities/` 之前，用户必须具备 GDPR 第 6 条规定的一项合法依据（在 GDPR 适用的情况下——参见上方的适用范围说明）：`consent`、`legitimate_interest`、`contract` 或同等依据。此项仅为建议——本技能不会强制执行，也不能替代法律审查。

## 参考资料

- [示例](references/examples.md)——完整示例、高级功能、实际限制，以及交付给审计人员的归档块格式与规则
- [升级与降级规则](references/promotion-demotion-rules.md)——完整的升级/降级表和操作流程
- [更新触发器与集成](references/update-triggers-integration.md)——更新流程、归档例程和跨技能集成点
- [CORE-EEAT 内容基准](../../references/core-eeat-benchmark.md)——存储在记忆中的内容质量评分
- [CITE 域名评级](../../references/cite-domain-rating.md)——存储在记忆中的域名权威性评分

## 下一最佳技能

首选：[keyword-research](../../research/keyword-research/SKILL.md)——利用当前的需求信号制定或刷新营销活动策略。