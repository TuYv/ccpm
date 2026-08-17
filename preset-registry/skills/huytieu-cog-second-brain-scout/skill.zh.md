---
name: scout
description: Evaluate URLs and tools — check vault coverage, assess relevance, recommend save or skip
roles: [all]
integrations: [web-fetch, web-search]
---
# COG Scout Skill

## 目的
一种介于“忽略”和 `/url-dump` 之间的轻量级 URL/工具分类评估方式。判断某个 URL 或工具是值得保存还是应该跳过——检查知识库中的现有覆盖情况，评估其与用户个人资料和兴趣的相关性，并明确建议下一步操作。

## 何时调用
- 用户希望在决定完整保存之前评估某个 URL 或工具
- 用户说“侦察一下这个”“评估一下这个”“我应该保存这个吗？”“这个与我相关吗？”
- 用户分享一个或多个 URL，并希望快速评估其相关性
- 用户提到某个工具/服务名称，并想知道它是否值得进一步研究

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果是 `agent_mode: team`——将知识库扫描和网页抓取委派给并行的子 Agent（一个负责知识库搜索，一个负责内容抓取/分析）。汇总结果并给出建议。
- 如果是 `agent_mode: solo`（默认）——直接在对话中处理所有扫描和分析。不进行委派。

## 执行前检查

**执行前，检查是否存在用户个人资料：**

1. 在知识库中查找 `00-inbox/MY-PROFILE.md` 和 `00-inbox/MY-INTERESTS.md`
2. 如果未找到：
   ```
   Welcome to COG! Scout works best with a profile for relevance matching.

   Would you like to run /onboarding first, or should I evaluate with general criteria?
   ```
3. 如果找到：
   - 阅读 `MY-PROFILE.md`，了解当前项目和角色
   - 阅读 `MY-INTERESTS.md`，了解主题领域
   - 阅读 `00-inbox/MY-INTEGRATIONS.md`，了解已启用的集成（检查 `web-fetch` 和 `web-search` 是否可用）

## 与 `/url-dump` 的边界

**Scout 负责评估**（“我应该保存这个吗？”）。**URL-dump 负责保存**（“立即保存这个”）。

- Scout 检查现有覆盖情况、评估相关性并建议操作
- 如果建议为**保存**，Scout 会将任务移交给 `/url-dump`，并预先填好分类
- 已经确定要保存的用户应直接使用 `/url-dump`

## 处理流程

### 1. 接收输入

接受以下一种或多种输入：
- **URL：** 要评估的直接链接
- **工具/服务名称：** 将先搜索该工具
- **混合输入：** URL 和名称的组合

**提示（如果未提供输入）：**
```
What URL(s) or tool(s) would you like me to evaluate?
(You can paste URLs, tool names, or a mix)
```

**批量模式：** 在一次调用中共同处理多个 URL/名称，并在最后提供汇总表。

### 2. 知识库覆盖情况检查

对于每个 URL 或工具名称，搜索**整个知识库**，查看是否已有相关内容。

**搜索策略：**
- 从 URL 中提取域名（例如，`github.com/owner/repo` → 搜索仓库名称）
- 在整个知识库中搜索工具/服务名称（使用 grep 搜索域名、仓库名称和工具名称）
- 与 frontmatter 中的 URL 字符串（`url:` 字段）及行内链接进行匹配

**如果找到：**
```
🔍 Existing coverage found for [name]:
- [file path] — saved [date], category: [category]
- [file path] — mentioned in [context]

Want me to check if an update is needed, or skip this one?
```

### 3. 内容抓取与分析

**如果提供了 URL 且 web-fetch 处于启用状态：**
- 使用 WebFetch 获取 URL 内容
- 提取：标题、描述、内容类型、作者、日期

**如果提供了工具名称（无 URL）：**
- 使用 WebSearch 查找该工具的主要页面
- 获取并分析排名第一的结果

**内容类型检测：**
- **工具/服务：** 软件、SaaS、API、库、框架
- **文章/博客：** 长篇内容、教程、观点文章
- **代码仓库：** GitHub/GitLab 仓库（提取 star 数、最近一次提交、编程语言）
- **研究：** 论文、研究报告、学术内容
- **新闻：** 行业新闻、公告
- **参考资料：** 文档、规范、标准

### 4. 相关性评估

根据用户上下文评估相关性：

**个人资料匹配度（来自 MY-PROFILE.md）：**
- 它是否与某个活跃项目相关？是哪个项目？
- 它是否符合用户的角色？
- 它是否适合用户的技术栈？

**兴趣匹配度（来自 MY-INTERESTS.md）：**
- 它是否匹配任何已声明的兴趣主题？
- 相关程度有多直接？

**质量信号：**
- 对于代码仓库：star 数、近期活跃度、维护者状况
- 对于工具：定价模式、成熟度、采用情况
- 对于文章：作者可信度、发布平台质量、时效性
- 对于所有内容：相较于知识库中已有内容的独特性

### 5. 建议

根据分析结果，建议采取以下两种操作之一：

#### **保存** — 值得添加到知识库
```
✅ SAVE — [Title/Name]
Category: [suggested category for url-dump]
Relevance: [High/Medium] — [why it matters]
Projects: [affected project(s) if any]

Shall I hand off to /url-dump to save it?
```

#### **跳过** — 不相关或不值得投入时间
```
⏭️ SKIP — [Title/Name]
Reason: [clear explanation — wrong stack, low quality, already covered, irrelevant to interests]
```

### 6. 批量摘要（适用于多个项目）

处理多个 URL/工具时，以摘要表格结尾：

```markdown
## Scout Summary

| # | Item | Verdict | Reason |
|---|------|---------|--------|
| 1 | [Name 1] | ✅ Save | [brief reason] |
| 2 | [Name 2] | ⏭️ Skip | [brief reason] |

**Actions:**
- [X] items ready to save via /url-dump
```

### 7. 执行后续操作

根据用户确认：
- **保存项目：** 移交给 `/url-dump`，并预填建议的分类
- **跳过项目：** 无需操作

## 后备行为

| 场景 | 行为 |
|----------|----------|
| web-fetch 不可用 | 仅根据 URL 结构、域名信誉和知识库搜索进行评估。注明未获取内容。 |
| web-search 不可用 | 对于工具名称输入（无 URL），改为请用户提供直接 URL。对于 URL 输入，正常继续处理——不需要 web-search。 |
| 没有用户个人资料 | 使用通用的质量/相关性标准进行评估，跳过个性化相关性评分 |
| URL 受付费墙限制 | 注明限制，并根据可用的预览和元数据进行评估 |
| 通过搜索未找到工具 | 请用户提供更多上下文或直接 URL |

## 不确定性处理

- **高置信度：** 明确相关或明确不相关——直接给出建议
- **中等置信度：** 部分匹配——列出利弊，由用户决定
- **低置信度：** 无法确定相关性——说明不明确之处，并向用户询问上下文

## 与其他 Skill 的集成

### 下游
- **保存** → 移交至 `/url-dump`，并预先填充分类

### 上游
- `/daily-brief` 可能会呈现新的工具/服务 → 用户可以运行 `/scout` 进行评估
- `/auto-research` 可能会在研究过程中发现工具 → scout 可以对它们进行初步筛选

## 成功指标
- 快速初筛（单人模式下处理单个 URL 用时 < 1 分钟）
- 提供清晰、可执行的建议
- 准确检测知识库中是否已有相关内容（避免重复保存）
- 相关性评分符合用户预期
- 保存时顺畅移交至 `/url-dump`

## 理念

Scout 体现了 COG 的“先评估，再积累”原则：
- 并非所有内容都值得加入书签——要有所选择
- 创建重复内容之前，应先展示知识库中已有的相关内容
- 保存/跳过的二元选择可加快决策，避免折中处理
- 清晰的建议可减少决策疲劳