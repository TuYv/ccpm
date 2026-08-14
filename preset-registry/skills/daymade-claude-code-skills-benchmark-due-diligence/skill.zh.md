---
name: benchmark-due-diligence
description: >
  Runs adversarial due-diligence on a benchmark the user envies — a founder, KOL,
  company, or product whose claimed success looks inflated — splitting marketing
  bubble from real signal, then mapping the validated playbook onto the user's own
  resources. Use whenever the user wants to 尽调/对标/拆解 a competitor or role-model,
  抄/偷师 someone's playbook, suspects 水分/泡沫 in their claims (#1 on Product Hunt,
  0-to-1M users, funding, 估值几个亿), asks whether wins are 真本事 vs 运气/时机, or says
  someone is 太成功了/crushing it and wants the real story — even if they never say 尽调.
  Prefer over deep-research for debunking inflated claims and extracting a replicable
  playbook rather than a neutral briefing.
---
# 对标尽调

选取一个用户羡慕的对标对象——创始人、KOL、公司或产品，其成功看起来光鲜得令人怀疑——并产出一份拆解报告，最终落脚于**“这对我意味着什么”**，而不是一份中立报告。交付成果要回答均衡型简报永远不会回答的三个问题：*这种成功有多少是真实的，又有多少是营销泡沫？其中有多少源于可复制的方法，又有多少依赖运气或时机？以及委托方具体可以如何利用这些结论？*

这是 `deep-research` 更具对抗性、更以决策为导向的近亲。`deep-research` 旨在构建一幅可信的世界图景，而本技能则**假定这幅图景存在夸大，直到事实证明并非如此**，并将经得起检验的部分转化为委托方自己的行动。

## 关键要求：以内联方式运行，绝不能使用 `context: fork`

本技能是一个**编排器**——它会生成并行的信息收集与核验代理（通过 `Workflow` 工具或 `Task` 代理），并且可能调用其他技能（`deep-research`、`osint-investigate`、`qcc`）。子代理无法生成子代理，也无法调用技能。设置 `context: fork` 会悄无声息地破坏整个扇出流程。**不要添加 `context` 字段。**（这与 osint-investigate 文档中说明的约束相同——它是一条严格的运行时规则，而非偏好。）

## 保护委托方的唯一规则：两个注入通道

代理看到的所有内容都严格通过两个通道传递。始终将二者分开，是本技能中最重要的纪律：

| 通道 | 内容 | 注入对象 |
|---|---|---|
| **FACTS** | 已核实的、关于对标对象的*公开*事实（关系、谁拥有什么，以及标记为 `⚠️ to-verify` 的核心主张） | **每一个**代理——信息收集、核验、综合分析 |
| **COMMISSIONER_CONTEXT** | 委托方的*私有*现实情况——真实资源、客户名称、战略意图，以及他们实际能够利用的资源 | **仅限最终映射代理（第 4 阶段）** |

**为什么这种分离不容妥协：**信息收集和核验代理会获取输入，并据此执行外部 `WebSearch`。如果委托方的客户名称或战略泄露到这些提示词中，它们就会被拿到开放网络上搜索——这会构成隐私泄露。映射阶段确实需要知道“委托方是谁”；信息收集阶段则绝不能看到这些信息。请在编排逻辑中落实这一点（参见 `references/workflow_orchestration_template.md`），不要指望在运行过程中仅凭记忆维持隔离。

## 第 0 阶段——以证据而非表象夯实基础（在启动任何代理之前完成）

浪费一次 12 代理扇出流程的最快方式，就是把它建立在*根据表象推断*出的基础之上。以下两种失败模式反复出现，并且都曾导致真实任务失败：

1. **根据名称或域名推断实体之间的关系。**“他们的内容托管在 `academy.example.com`，而且他们是创始人，所以那个社群肯定归他们所有”——但实际上，他们可能只是一名受邀嘉宾。共享域名、名称相似或共同出现，都只是**观察结果**，并不代表所有权。在将任何 A↔B 关系视为事实之前，先通过权威来源进行核实。
2. **把委托方的*客户*当作委托方的*资产*。**如果委托方为某个加速器或品牌提供服务，那么该加速器属于*客户的*资产——委托方无法利用它的受众或资本。将对标对象的打法映射到委托方实际上并不控制的资源上，只会造出空中楼阁。

因此，在展开并行工作之前，应通过证据（而非感觉）确定：
- **基准对象的真实实体关系图**——谁拥有谁，谁只是合作方/嘉宾。不要根据名称推断。
- **核心宣传主张的归属**——基准对象的整个叙事通常建立在某项引以为傲的统计数据上（“将产品 X 从 0 做到 100 万用户”）。实现这一成绩的是创始人，还是那位*已经离职的增长负责人*？这是**首要核查目标**；请将其写入 FACTS，并标注 `⚠️`。
- **委托方真正控制的内容**——区分*自有资产*与*客户/合作伙伴资产*。

将结果分别写入 `FACTS`（公开部分）和 `COMMISSIONER_CONTEXT`（私密部分）。基础不牢，会让后续每个智能体都自信地得出错误结论。

## 四阶段编排流程

使用 `Workflow` 工具（首选——可实现确定性的并行展开，参见 `references/workflow_orchestration_template.md` 中可直接填写的模板）或 `Task` 智能体。根据用户期望的详尽程度调整智能体数量（快速解读可使用少量维度；深度审计则使用 6 个以上维度，并进行多票验证）。

**阶段 1 + 2——按维度执行收集 → 验证流水线**（每个维度的收集一完成就立即验证；不设置全局屏障）：

- **收集智能体**——采取*客观*立场。每项发现都必须包含来源 URL 和 `source_kind`（`对象自述/营销`、`第三方独立信源` 或 `混合`）。所有未找到的信息都放入 `gaps`——**绝不**靠猜测填补。
- **验证智能体**——采取*对抗性、默认怀疑*的立场。为每项主张评定 `L1–L4` 等级，并作出 `坐实 / 大体可信 / 存疑 / 证伪-水分` 判定。其职责是主动寻找**能够证伪**的证据，尤其针对核心宣传主张（引以为傲的统计数据、“排名第一”、融资金额、用户数）。`bubble_summary` 指出该维度中水分最大之处。

评级标准、`source_kind`、判定选项以及两种 JSON 模式 → **`references/evidence_grading_rubric.md`**。

典型维度（根据基准对象类型——个人 / 公司 / 产品——进行调整）：
1. 对象背景 **+ 核心宣传主张归属**（首要泡沫排查目标）
2. 公司基本面——实体、创立情况、融资/估值
3. 核心产品/业务的**真实指标**——用户数、收入、排名、奖项，并与第三方信源交叉验证
4. 方法论拆解——平台矩阵、用户画像、内容类型、如何借用他人的受众，以及个人 IP 如何为产品导流
5. 对比样本——结构相似的同行或平行发展路径
6. 行业情况 + 此类方法通常如何取胜，**以及通常如何失败**

**阶段 3——综合分析：尽职调查结论**（由单个智能体完成，输入为所有判定结果）：
1. 真实关系图（纠正阶段 0 中常见的误读）
2. **泡沫击破表**——主张 | 证据等级 | 判定 | 一句话依据，按水分从高到低排序
3. 方法论拆解——具体、可复制的行动
4. **归因拆解（核心）**——成功中有多少比例应归因于产品、市场时机、个人 IP 营销和运营？给出百分比区间及理由，并明确区分*可复制的方法*与*运气 / 时机 / 不可转移的禀赋*。

**第 4 阶段——综合分析：这对委托方意味着什么**（单一代理；接收第 3 阶段的产出 **+ COMMISSIONER_CONTEXT**）：
1. **资源映射表**——将标杆案例的打法要素与委托方的实际资源逐项对照；为每个单元格标记 ✅ 可借鉴 / ⚠️ 不可复制（运气/时机）/ 🔄 已在实践 / 🚫 泡沫成分、不要照搬，每格一行
2. 落地点——委托方具体如何应用这些成果（其面向企业的服务 / 自有 IP / 工具体系）
3. 行动清单 + 待确认问题（仍有哪些内容尚未确认）

归因权重与四标签映射框架 → **`references/attribution_and_resource_mapping.md`**。

## 不要重复构建已有能力

此技能的优势在于*对抗式泡沫识别 + 归因 + 委托方映射*这几层能力。底层基础设施并无新意——直接复用：

- **扇出式采集 / 信源治理**——借用 `deep-research` 的主代理 + 子代理模式。（这里的独特之处是审慎质疑的核验立场和 L1–L4 泡沫分级，而非并行机制。）
- **人物主体身份 / 足迹核查**——调用 `osint-investigate`（ACH 假设矩阵、Bellingcat 式线索跳转），而不是重新推导身份归属。
- **中国大陆企业注册 / 融资信息**——调用 `qcc` 系列技能获取工商数据。
- **社交平台打法数据**——`agent-reach` CLI 覆盖 B站/小红书/抖音/YouTube/X。

## 运行前必读

- **`references/evidence_discipline_traps.md`**——反复出现的陷阱（根据共同露面推断关系、将标题中的主张错误归因、混淆客户与资产、未打好基础便进行扇出、应分级而非二元判断、隐私泄露），并附有真实的拆解复盘案例。首先阅读此文件；实际执行往往正是在这些地方出问题。
- **`references/evidence_grading_rubric.md`**——L1–L4、source_kind、verdicts、采集/核验模式。
- **`references/attribution_and_resource_mapping.md`**——归因权重 + 四标签映射 + 落地点框架。
- **`references/workflow_orchestration_template.md`**——可直接填写的 `Workflow` 脚本，其中已接好 FACTS / COMMISSIONER_CONTEXT 的注入拆分机制。

## 下一步

尽职调查结论完成后，建议自然衔接的后续步骤（由用户主动选择加入，绝不自动运行）：

```
Due-diligence teardown is done.

Options:
A) Render it as a shareable PDF report — pdf-creator (Recommended if this goes to a partner/team)
B) One dimension needs deeper neutral background — deep-research on that sub-topic
C) No thanks — the markdown teardown is enough
```