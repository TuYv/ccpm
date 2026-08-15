---
name: stakeholder-mapping
argument-hint: "[stakeholder list or initiative]"
description: Prioritize stakeholders using two complementary grids. Use when setting engagement strategy and surfacing whose voice needs elevating after stakeholder identification.
intent: >-
  Run two complementary 2x2 grids — Power × Interest (sets engagement strategy per
  stakeholder) and Impact × Power (surfaces who bears consequences but lacks voice) —
  then compare outputs to reveal blind spots and plan quadrant migration. The grids
  answer different questions and neither one alone is sufficient: Power × Interest
  tells you how to engage; Impact × Power tells you whose voice to elevate. Feed
  outputs into stakeholder-engagement-advisor for per-stakeholder action planning.
type: component
best_for:
  - "After stakeholder identification, when you need to decide who gets which level of engagement"
  - "Preparing an engagement plan before a roadmap review where executives and impacted user groups have conflicting authority"
  - "Surfacing high-impact, low-power user segments who deserve more voice in product decisions but lack org pull"
  - "Re-baselining stakeholder strategy after a reorg has shifted who holds decision authority"
  - "Planning a compliance or regulatory initiative where power to block sits separately from who bears the consequences"
scenarios:
  - "Who should I prioritize engaging on this initiative?"
  - "How do I handle stakeholders with conflicting priorities?"
  - "Help me figure out whose voice is missing from our roadmap decisions"
  - "I need a stakeholder engagement strategy before our quarterly review"
sources:
  - "MITRE Innovation Toolkit — Stakeholder Map & Matrix: https://itk.mitre.org/toolkit-tools/stakeholder-map-and-matrix/"
  - "MITRE Innovation Toolkit — Stakeholder Power Categories: https://itk.mitre.org/toolkit-tools/stakeholder-power-categories/"
---
# 利益相关者映射

## 目的

确定利益相关者的优先级并制定互动策略。此技能会针对已识别的利益相关者群体运行两个互补的矩阵，并有意比较它们揭示的信息，因为每个矩阵都能展现另一个矩阵无法呈现的内容。

**权力 × 关注度**回答：每位利益相关者对这项计划有多关注，以及他们能对其施加多大影响？它会生成相应的互动策略——哪些人需要深度参与、哪些人需要及时了解信息、哪些人需要持续关注。这是大多数产品经理熟悉的矩阵。

**影响 × 权力**回答：谁将承担此产品结果带来的后果，以及他们实际上拥有多大的组织权力？它能揭示那些最需要被妥善对待、却最可能缺乏代表性的利益相关者——高影响、低权力群体。

只运行第一个矩阵，会偏重于管理与权力较大者的关系。只运行第二个矩阵，则只会产生一份缺少互动计划的公平性分析。洞察来自对两者的比较：如果某位利益相关者在第一个矩阵中被归入“及时告知”，而在第二个矩阵中被归入“高影响、低权力”，这说明你对其互动投入不足，而相关后果却完全由其承担。这是一项产品风险。

请在 stakeholder-identification（用于构建完整列表）之后、stakeholder-engagement-advisor（用于规划针对每位利益相关者的联络方式）之前使用此技能。

## 输入

**最适合提供：** 你已识别的利益相关者列表（最好来自 `stakeholder-identification`）。
**其他有用信息：** 你所了解的每个人的权力、关注度和当前立场，以及该映射必须支持哪些互动决策。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或追加的 `ARGUMENTS:` 行——均视为已经给出的答案。请直接使用这些内容，并跳过其中已经涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 此技能会先询问利益相关者群体——在尚未识别利益相关者时进行映射，只会让你的认知盲区变得形式化。

**调用示例：** `Map these 14 stakeholders for the billing migration on both grids — list attached with role notes.`

## 核心概念

**权力 × 关注度矩阵**——一个 2×2 矩阵，根据利益相关者影响计划的权力（纵轴）和对计划结果的关注度（横轴）对其进行定位。它会生成四个象限，并为每个象限指定互动策略：
- 高权力、高关注度 → **密切管理**（共同设计、频繁沟通）
- 高权力、低关注度 → **使其满意**（高管简报、战略性阐释）
- 低权力、高关注度 → **及时告知**（新闻通讯、演示、保持透明）
- 低权力、低关注度 → **持续关注**（轻量互动，仅定期确认情况）

**影响 × 权力矩阵**——一个 2×2 矩阵，根据利益相关者是否会受到计划的显著影响（纵轴），以及他们对计划施加影响的权力（横轴）对其进行定位。它会生成四个象限：
- 高影响、高权力 → **Q2**——受到影响且拥有权力；密切管理
- 高影响、低权力 → **Q1**——受到影响但处于边缘地位；有意识地提升其话语权
- 低影响、高权力 → **Q4**——把关者；管理关系，降低互动深度
- 低影响、低权力 → **Q3**——持续关注，尽量减少投入

**提升 Q1 群体的声音** — 高影响、低权力的利益相关者（Q1）是最有可能遭遇产品失效模式，却最不可能出现在常规反馈闭环中的人。通过招募研究参与者、可用性测试和需求评审，有意识地提升他们在路线图决策中的参与度，不仅更加公平，还能降低因针对错误问题进行构建而产生的产品风险。

**象限迁移** — 通过有针对性的行动，将利益相关者从当前象限转移到目标象限的刻意策略。对于目前处于“监控”象限、需要转变为支持者的持怀疑态度的高管，所需采取的行动不同于已经处于“密切管理”象限的高管。明确迁移目标，可将利益相关者地图从一张快照转变为一项计划。

**影响与权力** — 两者并非同一维度。一线支持人员受到的影响很大（其日常工作流程会彻底改变），但权力较低（无法参与路线图决策）。财务副总裁拥有很高的权力（预算审批权），但受到的影响较小（产品不会改变其工作方式）。混淆两者是利益相关者映射中最常见的错误。

**配对变量** — 这是需要运行两个网格而非一个网格的原因。不同的配对轴会揭示不同的关系。单个网格只能生成一幅单一且不完整的图景。真正的洞见来自进行多项分析并比较其输出。

**参与策略** — 针对每个象限分别制定的差异化沟通与参与方式。它将有限的产品经理精力分配到最能发挥杠杆作用的地方，并防止陷入平等对待所有利益相关者的误区；这种误区会导致在无关紧要的关系上投入精力，却忽视关键关系。

## 应用

**第 1 步 — 运行权力 × 兴趣网格**

对于在识别练习中确定的每位利益相关者，评估：
- **权力：** 此人或群体能否显著影响、监管、批准或阻止这项计划？（考虑正式权限、预算、否决权和非正式影响力。）
- **兴趣：** 此人或群体是否积极参与结果的形成，或会受到结果影响？他们是否已经对方向表达意见，或很可能持有相关看法？

将每位利益相关者放入适当的象限。在此步骤中，不要对同一象限内的利益相关者进行排序或量化——位置本身就是输出。

为每个象限指定参与策略：
- 密切管理 → 深度参与、共同设计会议、每周或每两周一次的沟通
- 使其满意 → 高管简报、高层次框架说明、里程碑更新
- 使其知情 → 结构化沟通、演示、对产出物的只读访问权限
- 监控 → 轻量沟通、保持可联系但不主动跟进

**第 2 步 — 运行影响 × 权力网格**

分别评估每位利益相关者：
- **影响：** 这项计划是否会在财务、职业、日常工作或服务获取方面显著影响此人或群体？如果是，则其属于高影响利益相关者。
- **权力：** 无论他们是否愿意，他们能否显著影响这项计划？（定义与第 1 步相同，但需独立于兴趣进行评估。）

将每位利益相关者放入 Q1–Q4 象限中。执行此操作时，不要参考你在权力 × 利益网格中的安排——两项评估彼此独立，正是这种比较具有价值的原因。

**步骤 3——比较并找出差距**

将两个网格并排放置，并思考：

- 哪些人在网格 1 中位于“保持知情”，而在网格 2 中位于 Q1（高影响、低权力）？相对于产品对他们的影响程度，你对这些利益相关者的投入不足。
- 哪些人在网格 1 中位于“密切管理”，而在网格 2 中位于 Q3/Q4？这些利益相关者权力很大，但与结果的利害关系很小——注意避免过度投入。
- 哪些人在两个网格中的位置发生了显著变化？这些变化揭示了权力与后果不匹配之处。

**步骤 4——规划象限迁移**

对于你希望推动其发生转变的利益相关者：
- Q1 → Q2：积极邀请他们参与顾问流程、探索性研究和需求评审。赋予他们一个明确的角色，而不只是被动访问权限。
- 监控 → 保持知情：提高透明度，以便在计划与他们产生关联之前建立认知并尽早达成一致。
- 任意象限中的质疑者 → 盟友：确定他们需要相信什么才会转为支持，然后设计一对一互动，直接解决这些顾虑。

记录：谁需要转变、什么行动会触发这一转变，以及由谁负责。

**步骤 5——纳入互动规划**

针对每位处于“密切管理”的利益相关者以及每位 Q1 利益相关者，使用 stakeholder-engagement-advisor 创建互动计划。对于这些关系，战术性规划——具体的信息、媒介、频率和成功标准——能够带来最高回报。

## 示例

**情境：**某平台团队正在迁移内部 API 基础设施。利益相关者名单包括：工程副总裁（发起人）、三位工程负责人（直接用户）、法务部门（合规审查）、客户支持团队（其工具依赖这些 API），以及不会直接看到这项变化、但其正常运行时间依赖这些 API 的企业客户。

**权力 × 利益网格中的位置：**
- 工程副总裁 → 密切管理（高权力、高利益）
- 工程负责人 → 密切管理（高权力、高利益——直接建设者）
- 法务部门 → 保持满意（高权力、日常利益较低）
- 客户支持团队 → 保持知情（低权力、高利益——他们的工具会发生变化）
- 企业客户 → 监控（低权力、明确表达的利益较低）

**影响 × 权力网格中的位置：**
- 工程副总裁 → Q2（高影响、高权力）
- 工程负责人 → Q2（高影响、高权力）
- 法务部门 → Q4（低影响、高权力）
- 客户支持团队 → **Q1**（高影响、低权力——如果迁移失败，他们的工具将无法使用）
- 企业客户 → **Q1**（高影响、低权力——依赖正常运行时间）

**比较所揭示的差距：**客户支持团队和企业客户在网格 1 中处于“监控”或“保持知情”，但在网格 2 中位于 Q1。迁移团队一直将他们视为被动观察者，但实际上，他们是风险最高的利益相关者。解决方案：邀请支持人员参与 UAT，制定包含回滚触发条件的企业客户沟通计划，并将这两个群体都纳入发布就绪标准。

## 常见误区

**只使用一个矩阵。** 仅使用“权力 × 兴趣”而不使用“影响 × 权力”，会导致只顾及与权力方的关系，却系统性地忽视高影响、低权力群体。仅使用“影响 × 权力”而不使用“权力 × 兴趣”，则只会得到一份没有配套参与策略的公平性分析。两个矩阵都不可或缺。

**将组织职级等同于权力。** 一名掌控你的计划审批队列的中层项目经理，可能比一名未参与其中的副总裁拥有更大的实际权力。非正式影响力——流程知识、把关能力、联盟构建能力——也是真实的权力。应对其进行评估，不要想当然地认为组织架构图反映了实际权力。

**将定位视为永久不变。** 组织变动、预算周期和利益相关者轮换都会使人员在不同象限之间移动。应设定重新评估的固定节奏，例如在季度审查周期或重大组织事件发生后重新运行分析。

**完成定位后便止步，不制定参与行动。** 两个布满圆点、却没有明确“接下来由谁做什么”的矩阵，只是一张好看的幻灯片，而不是计划。利益相关者地图只是制定迁移策略和针对每位利益相关者的参与计划的手段。

**在定位时对象限内的利益相关者进行量化或排名。** 该方法明确不建议这样做。在分类阶段追求虚假的精确性，会使讨论偏离方向，陷入相对排名之争，而不是识别哪些应处于相应象限的利益相关者尚未被纳入。

**让 Q1 利益相关者沦为装饰。** 在画布上列出高影响、低权力的利益相关者后，却仍然以原有方式与他们互动，是最常见的失败。提升其地位需要具体行动：为其安排明确的研究名额、组织协同设计会议、让其参与需求评审，或让其出席发布就绪关卡评审。

## 参考资料

- [利益相关者识别](../stakeholder-identification/SKILL.md) — 前置条件：在确定优先级之前，建立完整的利益相关者名单
- [利益相关者参与顾问](../stakeholder-engagement-advisor/SKILL.md) — 后续步骤：为“密切管理”象限和 Q1 的利益相关者制定逐人参与计划
- [探索访谈准备](../discovery-interview-prep/SKILL.md) — 招募 Q1 利益相关者参与研究
- [研讨会引导](../workshop-facilitation/SKILL.md) — 以引导式团队会议的形式开展映射练习
- MITRE 创新工具包 — [利益相关者地图与矩阵](https://itk.mitre.org/toolkit-tools/stakeholder-map-and-matrix/)
- MITRE 创新工具包 — [利益相关者权力类别](https://itk.mitre.org/toolkit-tools/stakeholder-power-categories/)