---
name: content-brief
description: "Generates a fully structured SEO content brief for a target keyword and optionally pushes it to a Notion database. Use this skill whenever the user says 'create a content brief', 'brief this keyword', 'run a content brief for', 'generate a brief', 'write a brief for [keyword]', 'content brief on [topic]', or any variation where someone needs a keyword researched and turned into a structured writing assignment with H1, H2 outline, FAQ, internal links, word count target, and writer notes. Also triggers when the user provides a keyword and asks for an SEO brief, editorial brief, or writing spec. Outputs a mandatory structured format that the text parser maps directly to Notion properties. Supports single-keyword and batch (CSV) modes."
metadata:
---
# 内容简报 — 从关键词生成 Notion 简报

根据目标关键词生成结构化的 SEO 内容简报。输出遵循强制性的 Direction 提示词格式，以便 `text_parser.py` 脚本无需手动清理即可提取所有字段并写入 Notion。

## 调用触发条件

**明确短语**（任意一个）：
- “为 [keyword] 创建内容简报”
- “为这个关键词制作简报：[keyword]”
- “关于 [topic] 的内容简报”
- “为 [keyword] 生成简报”
- “为 [keyword] 撰写简报”
- “运行内容简报 Skill”

**隐含信号：**
- 用户提供一个关键词，并要求生成 SEO 规范、编辑规范或写作任务
- 用户粘贴关键词列表并要求生成简报

触发后立即运行——除关键词本身外，不要预先收集其他信息。

## 追问式信息收集（一个问题，可选）

当关键词含义明确时，无需提问，直接生成简报。

只有在以下**两个**条件同时成立时，才提出**一个**澄清问题：
1. 无法从上下文推断目标受众或客户
2. 受众会显著影响内容角度（例如，“project management software”可能面向项目经理，也可能面向开发者）

> **快速确认一下——“[keyword]”的主要受众是谁？**
> 1. [推断的角色 A——例如，人力资源总监]
> 2. [推断的角色 B——例如，运营经理]
> 3. 告诉我
>
> *提问原因：受众会影响 H1、内容角度和作者说明。只问一个问题可以避免生成方向错误的简报。*

最多提出一个问题。如果可以推断受众，则跳过提问并继续。

## 数据收集（撰写简报之前）

在生成 Direction 提示词输出之前，执行以下步骤：

### 第 1 步 — 关键词指标
**首选：** Ahrefs MCP（`keywords_explorer_overview`）→ 搜索量、KD、CPC、SERP 数据。

**备用方案（没有 Ahrefs MCP）：** 使用 WebSearch 进行估算：
- 搜索 `[keyword] search volume KD CPC site:ahrefs.com OR site:semrush.com OR site:moz.com`
- 提取可用的搜索量/KD/CPC 估算值
- 如果未找到数据，则将 VOLUME/CPC/DIFFICULTY 设置为 `[not available — add manually]`

### 第 2 步 — 竞争对手 H2/H3 分析
- 使用 WebSearch 搜索 `[keyword]` → 找出排名前 3 的自然搜索结果（跳过广告、地图结果和精选摘要）
- 对每个 URL 使用 WebFetch → 提取所有 H2 和 H3 标题
- 注意：竞争对手的结构用于为 H2_OUTLINE 提供参考。不要照搬——将其用于内容差距分析。

### 第 3 步 — 搜索意图分类
根据关键词和 SERP 类型，严格归类为以下四个选项之一：
- `Informational` — 用户希望了解信息
- `Commercial` — 用户在购买前比较不同选项
- `Transactional` — 用户已准备好采取行动/购买
- `Navigational` — 用户正在寻找特定品牌/网站

### 第 4 步 — 优先级评分
应用 `references/routing-logic.md` 中的路由逻辑：
- HIGH：搜索量 > 200，且 KD < 40，并且意图为 Commercial 或 Transactional
- MEDIUM：不符合 HIGH 标准，但具有可观的搜索量或战略重要性
- LOW：搜索量低、难度高，或属于转化价值有限的信息型意图

## Direction 提示词输出格式（强制）

**此格式不可更改。** `text_parser.py` 脚本按精确标签执行提取。如果任何标签偏离以下格式——大小写错误、多余空格、缺少下划线——对应的 Notion 属性将为空。

完成数据收集后，严格按照以下结构输出内容简报：

```
TARGET_KEYWORD: [keyword]
VOLUME: [number or "not available"]
CPC: [decimal or "not available"]
DIFFICULTY: [0-100 integer or "not available"]
SEARCH_INTENT: [Informational | Commercial | Transactional | Navigational]
AUDIENCE: [persona — job title or role]
RECOMMENDED_H1: [final proposed title]
CONTENT_ANGLE: [one paragraph describing the unique angle, why this beats competitors, what the post must do]
WORD_COUNT: [number]
SCHEMA: [schema type — e.g., FAQ, HowTo, Article, FAQ + HowTo]
PRIORITY: [HIGH | MEDIUM | LOW]
H2_OUTLINE:
- H2: [heading]
  - H3: [subheading]
  - H3: [subheading]
- H2: [heading]
  - H3: [subheading]
FAQ:
- Q: [question the audience actually searches]
- Q: [question]
- Q: [question]
INTERNAL_LINKS:
- [anchor text] → [relative URL or page title if URL unknown]
WRITER_NOTES:
[one paragraph of specific guidance: tone, POV, what to avoid, key differentiators to emphasize, CTAs, any client-specific requirements]
```

**关键规则：**
- 每个字段标签都必须与所示内容完全一致（使用带下划线的全大写形式）
- SEARCH_INTENT 的值必须与四个选项之一完全匹配（首字母大写）
- PRIORITY 的值必须严格为 HIGH、MEDIUM 或 LOW
- H2_OUTLINE、FAQ、INTERNAL_LINKS、WRITER_NOTES 是块字段——内容从下一行开始
- TARGET_KEYWORD 之前或 WRITER_NOTES 块之后不得添加任何文本

## 工作流架构（9 个节点）

| 节点 | 角色 | 工具 |
|---|---|---|
| 1 — 输入 | 接收关键词及可选的客户/受众上下文 | 用户消息 |
| 2 — 关键词指标 | 获取搜索量、KD、CPC、SERP 类型 | Ahrefs MCP 或 WebSearch 备用方案 |
| 3 — SERP 抓取 | 从排名前三的自然搜索结果中提取 H2/H3 | WebFetch |
| 4 — 简报生成 | 通过 Direction 提示词处理数据 → 结构化输出 | Claude（此 skill） |
| 5 — 文本解析器 | 提取带标签的字段 → 结构化变量 | `scripts/text_parser.py` |
| 6 — 条件路由器 | 根据 PRIORITY 值进行路由 | 路由逻辑 |
| 7A — 创建 Notion 页面（HIGH） | 创建页面，Status = "Briefed: Ready for Assignment" | Notion MCP |
| 7B — 创建 Notion 页面（MED/LOW） | 创建页面，Status = "Briefed: Weekly Review Queue" | Notion MCP |
| 8A — Slack 通知（仅 HIGH） | 将简报摘要和 Notion 链接发布到频道 | Slack MCP |
| 9 — 日历同步 | 在 Content Calendar 数据库中创建关联条目 | Notion MCP |

在没有 MCP 连接器的 Claude Code 中：节点 1–5 会自动运行。节点 6–9 会生成可直接粘贴的摘要，并指导用户手动录入 Notion。

## 批处理模式

触发条件：用户提供一个包含 `Target Keyword` 列的 CSV（可选包含 `Priority Override` 列）。

流程：
1. 确认 CSV 可读，并且存在 `Target Keyword` 列
2. 按顺序让每个关键词运行完整流程
3. 依次输出所有简报，并使用 `---` 分隔
4. 输出所有简报后：输出一个汇总表（关键词 | 优先级 | 字数 | schema）

预期吞吐量：20–25 分钟内完成 20 份简报（每份简报 60–75 秒）。

如果任何关键词处理失败（无 SERP 数据、意图不明确）：在汇总表中将其标记为 `[FAILED — reason]`，然后继续处理其余关键词。

## 推送至 Notion（MCP 可用时）

使用 `references/notion-schema.md` 将解析器输出映射到 Notion 属性。

根据 PRIORITY 分为两种路径：

**HIGH：**
- Status → "Briefed: Ready for Assignment"
- Target Publish Date → 今天 + 14 天
- 触发 Slack 通知（节点 8A）

**MEDIUM：**
- Status → "Briefed: Weekly Review Queue"
- Target Publish Date → 今天 + 28 天

**LOW：**
- Status → "Briefed: Weekly Review Queue"
- Target Publish Date → 今天 + 42 天

创建页面后：运行日历同步（节点 9），在 Content Calendar 数据库中创建关联条目。

创建前预检查：查询 Notion 中是否存在具有相同 TARGET_KEYWORD 的页面。如果找到 → 转至 `update_page`，而不是 `create_page`，以防止重复。

## 多客户设置

每个客户都有：
- 单独的 Notion 集成令牌
- 单独的数据库 ID
- 客户专属的 Direction 提示词变体（调整受众、语气和内部链接基础 URL）

新客户接入：配置连接器并端到端测试一份简报大约需要 45–60 分钟。

## Notion MCP 未连接时的输出

如果 Notion MCP 不可用，请在生成 Direction 提示词输出后追加：

```
---
NOTION PUSH: Not connected. To add this brief to Notion manually:

1. Open your Notion database
2. Create a new page
3. Paste the following field values:
   [formatted summary of all extracted fields]

Or run: python scripts/text_parser.py brief.txt --output json
to get a JSON payload ready for the Notion API.
---
```

## 验证关卡

生成输出后，在脑中验证：
- 所有 11 个简单字段均存在且非空
- SEARCH_INTENT 是 4 个有效值之一
- PRIORITY 必须严格为 HIGH、MEDIUM 或 LOW
- H2_OUTLINE 至少包含 4 个 H2，且每个 H2 至少包含 1 个 H3
- FAQ 至少包含 3 个问题
- INTERNAL_LINKS 至少包含 2 个条目
- WRITER_NOTES 是一个内容充实的段落（不是占位符）

对输出文件运行 `scripts/brief_validator.py` 以进行自动验证。

## 错误处理

| 情况 | 处理方式 |
|---|---|
| 没有可用的关键词数据 | 将数值字段设为 "not available"，并在 WRITER_NOTES 中添加备注，指示编辑手动核实 |
| SERP 抓取被阻止（403/付费墙） | 跳过抓取，在 WRITER_NOTES 中注明 "competitor outline not available"，并继续生成简报 |
| 搜索意图不明确 | 默认为 Informational；在 WRITER_NOTES 中标记："Intent ambiguous — verify before briefing writer" |
| Notion 中的 Select 值不匹配 | 严格按照要求设置值的大小写；Notion Select 区分大小写 |
| 检测到重复关键词 | 转至 `update_page`，而不是 `create_page` |
| 解析后的简报中有 >2 个空属性 | 标记为需要人工审核；不要推送至 Notion |
| 批次中的关键词处理失败 | 在汇总表中注明，然后继续处理 |
| CSV 缺少 Target Keyword 列 | 停止并要求用户确认列名 |

有关完整的故障点目录，请参阅 `references/error-handling.md`。

## 工具

| 脚本 | 作用 |
|---|---|
| `scripts/text_parser.py` | 从 Direction 提示词输出中提取带标签的字段 → 结构化字典。`python text_parser.py brief.txt --output json` |
| `scripts/brief_validator.py` | 验证所有必填字段是否存在，以及值是否在允许的集合中。`python brief_validator.py brief.txt` |

## 参考资料

- `references/notion-schema.md` — Notion 数据库属性配置（名称、类型、允许值）
- `references/routing-logic.md` — 优先级评分规则和发布日期计算方法
- `references/error-handling.md` — 已知故障点及修复方法

## 必须拒绝的反模式

- 偏离强制要求的 Direction 提示词标签格式（会导致解析器无法工作）
- 使用小写或大小写混合的字段标签（应使用 TARGET_KEYWORD，而不是 Target_Keyword）
- 为 SEARCH_INTENT 设置四个允许值以外的值
- 未先收集关键词和 SERP 数据就生成内容简报
- 在运行前询问多个信息收集问题
- 编写含糊的 WRITER_NOTES（"write a good post about this topic"）
- 在数据不可用时捏造关键词指标——务必标记为 "not available"
- 在超过 2 个字段为空时推送到 Notion