---
name: stakeholder-identification
argument-hint: "[initiative]"
description: Map every stakeholder before engaging anyone. Use when launching an initiative, scoping discovery, or building an engagement plan from scratch.
intent: >-
  Produce a comprehensive, equity-aware stakeholder set before any engagement begins.
  Combines broad brainstorm with structured categorization (Allies / Audiences / Influencers,
  R/P/D marking), an explicit equity and bias check, and a disciplined narrowing to
  the 2-3 stakeholders to understand deeply first. Designed to run as a solo exercise
  or a kickoff workshop. Feed outputs directly into stakeholder-mapping for prioritization.
type: component
best_for:
  - "Launching a new initiative where the stakeholder landscape is unmapped and influence networks are unknown"
  - "Scoping a discovery sprint to define who to research, interview, and recruit"
  - "Preparing a PRD stakeholder section with a validated, comprehensive list before writing requirements"
  - "Onboarding to a new product domain and needing to map allies, gatekeepers, and decision-makers quickly"
  - "Pressure-testing an existing stakeholder list for blind spots, bias, and missing edge-case populations"
scenarios:
  - "Who are all the stakeholders for this initiative?"
  - "Are we missing anyone important in our stakeholder map?"
  - "Help me prepare the stakeholder section of my PRD"
  - "Who should we recruit for discovery research?"
sources:
  - "MITRE Innovation Toolkit — Stakeholder Identification Canvas: https://itk.mitre.org/toolkit-tools/stakeholder-identification-canvas/"
  - "MITRE Innovation Toolkit — Community Map: https://itk.mitre.org/toolkit-tools/community-map/"
---
# 利益相关者识别

## 目的

在与任何人接洽之前，先梳理所有利益相关者。此技能会生成一份全面且具备公平意识的利益相关者集合——不仅包括显而易见的发起人和用户，还包括把关者、受影响的社区，以及你的团队通常会忽略的声音。

大多数产品经理的利益相关者名单都是凭记忆在五分钟内写成的。它们总能涵盖高管、产品团队同事和声音最响亮的用户，却也总会遗漏那些边缘化用户群体：他们承受着产品带来的后果，却没有足够的组织权力来影响产品决策。此技能会推动一次更缓慢、更有条理的头脑风暴，为后续的每一项沟通决策奠定基础。

请在使用 stakeholder-mapping（用于确定优先级）和 stakeholder-engagement-advisor（用于规划针对每位利益相关者的外联）之前使用此技能。识别是第一步——你无法对尚未明确列出的人确定优先级。

## 输入

**最适合提供：** 需要梳理利益相关者的计划、产品或决策。  
**同样有用：** 名单中已有的利益相关者（此技能的任务是找出遗漏者）、组织背景以及受影响的社区。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文内容，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息，并跳过其已涵盖的问题；不要重复询问。

**没有准备任何材料？也没问题。** 此技能会询问计划是什么、会影响哪些人，然后开展具备公平意识的全面排查。

**调用示例：** `Identify stakeholders for migrating all customers to the new billing system by Q4.`

## 核心概念

**盟友、受众、影响者**——这三类角色有助于厘清利益相关者与你的工作的关系。盟友积极支持该计划；受众会受到计划的影响；影响者自身不一定直接受到影响，但会左右舆论或决策。按这种方式对利益相关者进行分类，可以明确需要招募谁、告知谁以及说服谁——这是三种不同的沟通任务。

**R/P/D 标记**——将每位利益相关者标记为资源（Resources，预算、人员编制、访问权限）、许可（Permission，推进审批、监管许可）或决策权（Decision-making authority，最终决定权）的提供者。这样可以快速识别谁能够为计划提供资金、阻止计划或批准计划，以及谁只是对此感兴趣。一位利益相关者可以拥有多个标记。

**公平视角**——有意识地扩展名单，纳入那些经常被排除在外的利益相关者：边缘化用户群体、一线员工、下游社区，以及承受产品后果却缺乏组织权力来影响产品设计的人。如果没有这一步，团队就会围绕声音响亮、资源充足的群体进行优化，并最终打造出无法满足沉默的大多数需求的产品。

**主要、次要、三级影响**——从直接用户开始，向外追踪产品对间接受影响群体产生的连锁效应。某项改变支持人员工作方式的功能（主要影响），会影响客户获得服务的体验（次要影响），进而影响公司的声誉和客户流失率（三级影响）。沿着这一链条追踪，可以发现仅进行单层思考时会遗漏的利益相关者。

**识别偏见与假设** — 团队明确检查：我们下意识地优先列出了谁？名单中缺少谁？我们把谁的视角视为普遍适用？这一步旨在识别盲点，避免其演变为需求缺口。

**识别与优先级排序** — 严格区分“有哪些利益相关者”和“哪些利益相关者最重要”。本技能的目标是生成一份完整的名单，而不是一份按优先级排序的名单。将这两个步骤混为一谈，会导致团队在尚未充分了解某些利益相关者之前就过早地将其排除。优先级排序将在利益相关者映射中进行。

## 应用

**步骤 1 — 不加筛选地进行头脑风暴**

快速、不受限制地列出与此计划相关的潜在利益相关者，包括个人、团队、组织和社群。不要自我筛选。写下任何可能与此事存在利益关系的人——即使他们似乎不太可能参与其中。

如果以小组形式开展，请先静默进行 4-6 分钟，再分享结果。

**步骤 2 — 分类**

将每个利益相关者归入以下一个或多个类别：

- **盟友** — 谁积极支持这项工作，或会从它的成功中受益？
- **受众** — 谁会直接或间接受到结果的影响？
- **影响者** — 谁虽不直接参与，却能影响决策、舆论或采用情况？

注意：一个利益相关者可以出现在多个类别中。这些重叠情况——例如某位盟友同时也是关键影响者——通常代表着最具杠杆效应的关系。

**步骤 3 — 应用 R/P/D 标记**

针对每个利益相关者，标记其是否提供：

- **R** — 资源（预算、人员、数据、访问权限）
- **P** — 许可（批准、法律许可、签署确认）
- **D** — 决策权（对范围、优先级或发布拥有最终决定权）

如果某位拥有 P 或 D 的利益相关者未出现在名单中，这一缺口之后会以阻碍因素的形式暴露出来。

**步骤 4 — 应用公平性视角**

针对你的名单提出以下问题：

- 谁会因该产品而在财务、职业或日常体验方面受到显著影响或面临重大后果？
- 谁承担了产品的成本或风险，却无权影响其设计？
- 谁的视角因我们假设其他人可以代表他们而被遗漏？
- 谁是主要用户？谁是次要用户？谁会受到第三层级的影响？

添加通过公平性视角识别出的所有人。这些利益相关者很可能最终落入利益相关者映射的 Q1 象限（高影响、低权力）——他们的声音最需要被放大。

**步骤 5 — 识别偏见与假设**

以小组形式明确回答：

- 在步骤 1 中，我们下意识地优先列出了谁？
- 谁缺席了？为什么？
- 对于哪些人算作利益相关者，我们做出了哪些假设？

记录答案。这些答案将影响你的研究计划和招募策略。

**步骤 6 — 缩小范围，确定优先目标**

在完整名单清晰可见的情况下，确定在继续推进之前最需要深入了解的 2-3 位利益相关者。他们通常包括：

- 必须获得其支持、权力最高的决策者
- 需求最不为人所知、受影响最大的用户
- 最有可能成为阻碍者或持怀疑态度的人

对于每位优先利益相关者，记录：姓名、类别、R/P/D 标签，以及一句话说明“我们需要从他们那里了解什么”。这些输出将直接提供给 stakeholder-mapping 和 stakeholder-engagement-advisor。

## 示例

**情境：** 某产品团队正在界定一项新受理工作流的范围，该工作流将用自助服务门户取代基于电子邮件的人工请求流程。初始利益相关者名单：运营副总裁、工程负责人、PMO 总监、企业客户。

**不够完善（常见的默认结果）：**
该名单包含了显而易见的发起人，以及对该功能呼声最高的客户群体。遗漏了：目前负责处理每一项人工请求的客户支持人员（当前工作流的主要日常用户）、IT 安全团队（P — 必须批准数据处理方式）、合规官（P — 涉及监管影响），以及缺少技术人员来使用自助服务门户的小型企业客户（高影响、低权力的受众）。

**应用公平性视角并进行 R/P/D 标记后得到的更完善名单：**
- 运营副总裁（D，盟友）— 最终范围决策权
- 工程负责人（R，盟友）— 产能和技术可行性
- PMO 总监（P，影响者）— 必须批准流程变更
- 企业客户（受众）— 新门户的主要用户
- **客户支持人员**（受众，R）— 目前处理每一项受理请求；如果不征求其意见，会存在采用风险
- **IT 安全团队**（P）— 必须批准数据处理方式
- **合规官**（P）— 监管审查
- **小型企业客户**（受众）— 所受影响不同；可能需要一条非自助服务路径

第二份名单会产生不同的 PRD、不同的发布计划，以及不同的成功定义。

## 常见陷阱

**将第一次头脑风暴的结果当作最终名单。** 初步梳理通常只能找出 60% 的利益相关者，并会系统性地遗漏另外 40% 可见度较低的人。分类和公平性步骤正是为了弥补这一缺口——跳过这些步骤就失去了这项练习的意义。

**列出角色或组织单位，而不是具体人员。** “工程部门”不是利益相关者。掌控冲刺产能的工程负责人​​才是。含糊的类别名称会让你无法安排真正需要进行的沟通。

**混淆识别与优先级排序。** 在头脑风暴阶段，还未了解利益相关者的实际影响力或所受影响之前就将其排除，正是高影响、低权力的声音被悄然忽略的原因。先完成名单，再在 stakeholder-mapping 中确定优先级。

**跳过偏见和假设检查。** 跳过这一步的团队会对名单的完整性充满信心。执行这一步的团队则会发现，他们曾假设资源充足的用户代表能够代表所有人。明确指出这一盲点。

**在没有外部验证的情况下独自完成。** 一个人制作的利益相关者地图只会反映这个人的关系网络和假设。如果独自开展工作，请通过偏见检查识别出哪些人未包含在你的认知模型中，然后在继续推进之前与一位跨职能同事进行验证。

**生成了完整名单，却没有记录后续步骤。** 画布以优先目标和行动作为结尾是有原因的。一份全面的利益相关者名单，如果没有附上“谁在何时与谁沟通”，就只是一份文档，而不是一项计划。

## 参考资料

- [stakeholder-mapping](../stakeholder-mapping/SKILL.md) — 下一步：使用权力 × 利益和影响力 × 权力矩阵对已识别的利益相关者进行优先级排序
- [stakeholder-engagement-advisor](../stakeholder-engagement-advisor/SKILL.md) — 确定优先目标后，针对各利益相关者制定参与计划
- [discovery-interview-prep](../discovery-interview-prep/SKILL.md) — 以已识别的利益相关者为基础招募研究参与者
- [proto-persona](../proto-persona/SKILL.md) — 识别出高优先级用户利益相关者后，构建假设驱动的用户画像
- MITRE 创新工具包 — [利益相关者识别画布](https://itk.mitre.org/toolkit-tools/stakeholder-identification-canvas/)
- MITRE 创新工具包 — [社区地图](https://itk.mitre.org/toolkit-tools/community-map/)