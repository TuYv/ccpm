---
name: business-operations-skills
description: Use when running, diagnosing, or designing internal business operations — process documentation, vendor SLAs, capacity planning, internal comms, SOP/runbook authoring, procurement spend. Triggers on "BizOps review", "where's the bottleneck", "vendor health", "internal SOP", "all-hands deck", "spend categorization", "capacity for Q3", "process mapping". Forks context to route to one of six BizOps sub-skills (process-mapper, vendor-management, capacity-planner, internal-comms, knowledge-ops, procurement-optimizer) and returns a digest. Distinct from business-growth (external sales motion) and c-level-advisor (strategic, not operational).
context: fork
version: 2.8.0
author: claude-code-skills
license: MIT
tags: [bizops, operations, process, vendor, capacity, sop, procurement, coo, orchestrator]
compatible_tools: [claude-code, codex-cli, cursor, antigravity, opencode, gemini-cli]
---
# 业务运营 — 领域编排器

BizOps 面向的是**内部**事务：公司实际如何运转。此编排器会派生其对话上下文，将你的问题路由到六个子技能之一，然后向父线程返回一份精炼摘要。繁重的信息摄取工作（供应商目录、流程访谈、多文档 SOP 导入）会保留在派生上下文中。

## 何时调用

| 表现 | 要路由到的子技能 |
|---|---|
| “工作在哪个环节花费了最多等待时间？” | `process-mapper` |
| “这个供应商是否按 SLA 交付？” | `vendor-management` |
| “我们是否有足够的人手在第三季度完成交付？” | `capacity-planner` |
| “我需要向全公司通报一次组织重组” | `internal-comms` |
| “为事件响应流程编写一份运行手册” | `knowledge-ops` |
| “为什么我们的软件支出同比增长了 40%？” | `procurement-optimizer` |

## 路由逻辑（确定性）

编排器根据提示词中检测到的**信号**对问题进行分类。检测到两个信号时可进行置信路由；只检测到一个信号时，则提出一个澄清问题。

### 信号表

| 信号类别 | 关键词 | 子技能 |
|---|---|---|
| **流程** | 瓶颈、周期时间、等待、交接、BPMN、流程图、工作流 | `process-mapper` |
| **供应商** | 供应商、供货商、SLA、合同、第三方、MSA、SaaS 订阅、续约 | `vendor-management` |
| **产能** | 员工人数、产能、利用率、规划、招聘顺序、FTE | `capacity-planner` |
| **沟通** | 全员大会、内部通讯、公告、变更管理、FAQ、员工大会 | `internal-comms` |
| **知识** | SOP、运行手册、知识库、Wiki、操作手册、文档、入职文档 | `knowledge-ops` |
| **采购** | 支出、采购、购买、供应商合理化、软件审计、SaaS 泛滥 | `procurement-optimizer` |

如果信号混杂（例如，“供应商 SLA + 支出审计”），先运行**置信度最高的子技能**，然后在后续的派生轮次中串联第二个子技能。

### 回退策略

如果没有任何信号类别的得分 ≥ 2，则提出**一个**澄清问题，并点明最有可能的两个候选项。不要在不说明的情况下进行猜测。

## 工作流（Matt Pocock 的盘问准则）

源自 Matt Pocock 的 `grill-with-docs` 模式：**先探索、后提问；每轮只问一个问题并给出推荐答案；以深度优先方式遍历决策树；跟踪依赖关系；每项质询都以已记录的规范为依据**（`references/`）。

### 第 1 步 — 提问前先探索

提出任何澄清问题之前，先检查：
- 用户的工作目录中是否已经包含可通过 grep 搜索的流程图、供应商目录、SOP 或组织结构图？
- 问题是否已经明确了所属类别（例如，“供应商 SLA 审查”——这属于 `vendor-management`，无需提问）？
- 是否可根据提到的文件名明确判断所属类别（`procurement-Q3.csv` → 采购）？

如果可以通过代码库确定所属类别，**直接路由，不要说明**。不要提问。

### 第 2 步 — 如果仍有歧义，只提出一个强制选择问题，并给出推荐答案

Matt 的规则：绝不把多个问题捆绑在一起。绝不默认询问“你怎么看？”。始终给出你的建议。

模式：
```
Q1/1: [precise question naming the two candidate lanes]
Recommended: [Lane X, because <one-sentence rationale from the signal table>]

(Confirm, or override?)
```

等待用户回复。**然后**再进行路由。在提出问题后，绝不能不经确认便自行猜测。

### 步骤 3 — 分叉式决策树遍历（仅当询问跨越多个路径时）

如果用户的询问确实跨越两条路径（例如，“供应商 SLA + 支出审计” = VENDOR + PROCUREMENT），则以**深度优先**方式遍历决策树：

1. 先处理置信度较高的路径 → 在分叉上下文中运行该子技能 → 返回摘要
2. 询问：“我们现在是否应该运行[第二条路径]？我的建议是：应该，因为[依赖关系原因]。”
3. 仅在用户明确确认后，才运行第二个子技能

不得在不告知用户的情况下串联执行。每个分叉都必须是由用户明确确认的步骤。

### 步骤 4 — 在分叉上下文中调用子技能

调用每个子技能时，都要传入原始提示词以及所有结构化输入（文件路径、JSON 输入）的摘要。分叉机制会将重量级内容摄取（供应商目录、流程记录、SOP 源文档）隔离在父上下文之外。

### 步骤 5 — 返回带有规范引用质询的摘要

子技能完成后，向父线程返回一份**不超过 200 词的摘要**：

- 分析了什么
- 最重要的 3 项发现（每项均基于参考文档引用——例如，“Goldratt 的约束理论：优化瓶颈，而不是非约束环节”）
- 最重要的 3 项后续行动（如可能，注明负责人）
- 所生成产物的路径
- 向用户提出**一项质询挑战**并注明引用：“你的增值比率为 12%。精益管理规范（Womack 与 Jones，1996 年）将低于 15% 的情况归类为浪费严重。阻碍流程重新设计的因素是什么——政治、技术还是预算？”

之后，父代理可以继续提出后续问题（每个问题都会触发新的分叉调用）。

## 强制提问库（基于文档进行质询的模式）

当用户提供的上下文足以进入某条路径时，编排器可以在调用子技能之前，就**该路径内的决策**向用户提出质询。每轮只问一个问题，每个问题都要附带推荐答案和规范引用。例如：

- **PROCESS 路径**：“开始绘制流程图之前：你是否掌握每个阶段的实测周期时间，还是只有估算值？建议：坚持获取耗时最长的 3 个阶段的实测数据。反模式（Goldratt，1984 年）：根据估算绘制流程图，结果优化了错误的约束环节。”
- **VENDOR 路径**：“开始评分之前：你的一级关键性阈值是什么——按支出（每年 $X），还是按运营依赖性（如果供应商失效，是否会导致收入中断）？建议：采用运营依赖性。反模式（Gartner TPRM）：仅按支出划分层级会漏掉支出较低但至关重要的供应商，例如 Target 数据泄露事件中的 HVAC 供应商。”
- **CAPACITY 路径**：“开始建模之前：你是在按利用率还是吞吐量进行规划？建议：按吞吐量规划（Little 定律）。反模式（DORA）：按超过 80% 的利用率进行规划，会因排队效应而破坏吞吐量。”

在路径定义决策确定之前，绝不能运行子技能。

## 假设

1. 用户代表一个拥有 ≥ 10 名员工的组织行事（规模更小的组织不需要此功能界面）。
2. 用户能够访问子技能所需的数据（流程文档、供应商列表、支出导出数据等），或者接受该技能提供的模板化虚拟数据。
3. 用户需要的是**确定性、可重复的分析**，而不是带有 LLM 风格的散文。每个子技能都附带仅依赖标准库的 Python 工具。

## 非目标

- 不能替代 ERP、供应商管理平台（Vendr、Tropic）或产能规划 SaaS（Float、Runn）。
- 不跨会话存储状态——每次调用都是自包含的。
- 不通过 Python 工具调用外部 API（按设计仅使用标准库）。

## 区别于

- **`business-growth/*`**——这是**外部销售流程**（CSM、销售工程、RevOps）。BizOps 面向**内部**。
- **`c-level-advisor/coo-advisor`**——这是 COO 的战略判断（“我们是否应该重组？”）。BizOps 关注战术执行（“这是标有瓶颈的流程图”）。
- **`engineering/slo-architect`**——这是使用 SLO/SLI/错误预算来保障系统可靠性。`process-mapper` 关注的是**业务流程**可靠性，而不是系统可靠性。
- **`engineering/llm-wiki`**——这是一个**个人** PKM（Karpathy 的模式）。`knowledge-ops` 用于**公司范围**的 SOP 编写。

## 输出产物

每个子技能都会生成至少一项产物（Markdown、CSV 或 JSON），并保存到用户的工作目录中。编排器会在摘要中显示文件路径。

## 反模式（请勿这样做）

- ❌ 为了“全面”而运行全部 6 个子技能——根据信号选择一个，返回摘要，然后让用户按需串联调用
- ❌ 自动批准供应商或流程变更——呈现调查结果；由人工做出决定
- ❌ 未经询问就编辑生产流程文档——写入新文件，并提出差异变更建议
- ❌ 跳过摘要步骤——父级上下文需要不超过 200 词的摘要，而不是子技能的完整输出

## 参考资料

- 有关 COO 战略框架，请参阅 `c-level-advisor/coo-advisor`
- Path-B 构建模式：`documentation/implementation/bizops-commercial-expansion-plan.md`