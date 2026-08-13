---
name: vertical-hr-recruiting
description: Domain-knowledge primer for the HR & recruiting vertical (ATS, onboarding, workforce scheduling, engagement). Applied by architect/pm during spec authoring so they aren't naive about hiring pipelines, the admitted offer→onboard data-carry gap, EEO/I-9 compliance, and shift-coverage rules. Stops the four products from being specced as generic CRUD when the domain has hard legal and workflow constraints.
when_to_use: |
  Apply when:
  - architect writes ARCH-*.md for ats / onboarding / workforce-scheduling / engagement
  - pm decomposes any of these four products into tasks and needs domain entities
  - a spec touches candidates, requisitions, offers, I-9, shifts, or EEO data
  Do NOT apply for products outside the HR/recruiting vertical.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 垂直领域：人力资源与招聘——不要想当然地设计规格

现有主流产品（Workable、BambooHR、Greenhouse、Lever、Zoho Recruit、Manatal）已经
让买家形成了这样的预期：招聘流程必须真正*有效运转*。通用的 CRUD 应用一旦遇到
EEO 法规、I-9 时限或录用→入职衔接，就会失效。**在设计这四款产品中的任何一款之前，
请先阅读本文——该领域存在硬性约束，而不只是表单。**

## 1. 领域术语

- **ATS**——申请人跟踪系统；招聘活动的记录系统。
- **招聘申请（req）**——已获批准的空缺职位。招聘必须*针对某个 req*进行，而不是在
  真空中进行。Req 具有审批工作流（招聘经理 → 财务/HR）。
- **流程阶段**——`applied → screen → interview → offer → hired`（以及 `rejected` /
  `withdrawn`）。阶段可**按 req 配置**——工程岗位和销售岗位的招聘方式不同。
- **候选人与申请人**——*申请人*申请了某个特定 req；*候选人*则是人才库中的
  某个人，随着时间推移可能会对应多次申请。不要混淆二者。
- **人才寻访**——主动寻找候选人（区别于入站申请）。
- **结构化面试 + 评分卡**——预先定义的问题 + 每位面试官据以评分的量表。
  与自由形式的笔记相比，可减少偏见和法律风险。
- **录用通知书**——正式条款；接受后会触发录用→入职转换。
- **EEO 数据**——自愿提供的种族/性别/退伍军人身份/残障身份自我认定信息，用于
  报告，并且**与招聘决策隔离**（参见第 §2 节）。
- **I-9 + E-Verify**——就业资格验证；具有**严格的 3 天时限**（第 §2 节）。
- **入职清单**——新员工/雇主必须在入职前或入职时完成的任务。
- **招聘用时 / 职位填补用时**——核心招聘指标（招聘 = 候选人接受录用；
  填补 = req 关闭）。二者的分母不同；必须正确报告两项指标。
- **小时工与月薪员工**——决定排班、加班（FLSA）和薪酬规则。
- **换班 / 覆盖**——小时工互换班次；覆盖规则规定，某个时段的人员配置不得
  低于阈值。
- **eNPS**——员工净推荐值；员工敬业度调查的核心指标。

## 2. 不明显的领域规则

- **录用→入职衔接是公认的缺口。** 现有主流产品公开承认入职问题尚未解决：
  数据需要在 ATS 与 HR/入职系统之间*重新录入*。整个入职产品的切入点就是
  **延续使用候选人的数据——无需重新录入。**
- **必须收集 EEO/OFCCP 数据，但应将其排除在招聘决策视图之外。** 将候选人自行
  认定的种族/性别信息混入筛选/面试 UI，会带来反歧视法律责任。应隔离存储；
  仅在汇总的合规报告中展示。
- **结构化评分卡可减少偏见和法律风险。** 它们能够形成可辩护且一致的记录。
  仅使用自由形式的面试笔记会埋下差别影响风险。
- **I-9 有严格的时限**：员工必须在入职第一天之前完成第 1 部分，雇主必须
  **在入职后的 3 个工作日内**完成第 2 部分（审核文件）。与 I-9 相关的入职任务
  具有硬性截止期限，而不是软性提醒。
- **劳动力排班需要覆盖规则 + 劳动法规合规。** 不能仅仅因为时段已安排人员
  就认为排班有效——它还必须符合最低覆盖人数、加班（FLSA）、预测性排班 /
  公平工作周法规（某些司法管辖区要求提前通知），以及休息规则。
- **Req 是招聘的前置门槛。** 未经批准的 req 不得发出录用通知；req 审批是包含
  预算/编制检查的真实工作流，而不是一个复选框。

## 3. 朴素实现会犯哪些错误

- **硬编码流水线阶段。** 固定的 `applied→hired` 枚举，在客户首次想要增加课后作业或小组面试阶段时就会失效。阶段必须能够**按职位配置。**
- **在候选人决策视图中显示 EEO 数据。** 把自我身份识别字段放到招聘经理能看到的候选人卡片上，是一个会带来法律风险的缺陷，而不是一种 UX 选择。必须将其隔离。
- **入职流程要求重新录入候选人数据。** 从头重新填写姓名、电子邮件、职位和薪酬，*正是*现有厂商尚未解决的缺口。如果入职流程从空白表单开始，那么你构建的是现有厂商的弱点，而不是我们的切入点。
- **把 I-9 建模为普通检查清单项。** 如果没有 3 个工作日的截止期限，也没有区分 Section 1 / Section 2，就不符合合规要求。
- **把排班做成日历。** 只有拖放班次，却没有最低覆盖人数、加班标记和换班审批流程，这只是个玩具，而不是劳动力管理工具。

## 4. 必须建模的实体

| 实体 | 必须包含 | 原因 |
|---|---|---|
| **职位申请** | 审批状态、招聘人数、阶段配置 | 招聘按职位申请进行；阶段各不相同 |
| **候选人** | 阶段历史记录、评分卡、EEO（隔离存储） | 审计轨迹 + 偏见抗辩；EEO 绝不能泄露到决策视图中 |
| **Offer → Onboarding** | 将候选人数据向后传递（无需重新录入） | 这就是切入点；交接正是缺口所在 |
| **OnboardingTask** | 截止期限字段（I-9 的 3 天时限） | 合规具有明确时限，不是宽松要求 |
| **Shift** | 覆盖规则、加班标记、换班/审批状态 | 排班不仅要排满，还必须*有效* |

## 5. 各产品说明

| 产品 | 原型 | 切入点 | 唯一关键的领域特性 |
|---|---|---|---|
| **ats** | crud | 市场拥挤——需要鲜明的切入角度，而不是“又一个跟踪器” | 按职位申请配置流水线阶段 + 结构化评分卡；不要交付一个通用 Kanban |
| **onboarding** | crud | **现有厂商承认尚未解决的 Offer→Onboarding 数据传递缺口** | 候选人数据向后传递，完全无需重新录入；具有 3 天截止期限的 I-9 任务 |
| **workforce-scheduling** | booking | 面向小时工团队的班次排班 | 覆盖规则 + 加班 + 换班/补班审批，而不是一个空有其表的日历 |
| **engagement** | crm | 面向 SMB 的员工敬业度调查 | 以 eNPS 作为核心指标；设置匿名性阈值，防止小型团队识别出答复者身份 |

`onboarding` 是差异化押注（解决已被承认的缺口）。`ats` 则身处拥挤赛道
——架构师必须在 ARCH 文档中明确指出鲜明的切入角度，否则它一开始就注定失败。

## 6. 合规（简要）

在 ARCH 文档中标记以下事项；将 AI 筛选交由审查人员处理。

- **EEO / OFCCP**——收集自愿提供的自我身份识别信息；进行汇总报告；**绝不能**进入决策流程。
- **I-9 / E-Verify**——Section 1 必须在第一天前完成，Section 2 必须在 **3 个工作日内**完成；应对该截止期限进行建模。
- **反歧视**——筛选中的差别影响。**如果任何产品使用 AI
  筛选候选人或为候选人排序，必须在 senior-dev 开始之前将其标记给 `hr-ai-reviewer`**（或 AI 安全审查人员）——自动化筛选是高风险领域。
- **Ban-the-box**——许多司法管辖区禁止在发出 Offer 之前询问犯罪记录。
  默认情况下，不要将其放在申请表中。
- **FLSA / 加班**——排班必须计算小时工的加班时间；在适用地区遵守
  公平工作周/预测性排班法律。
- **数据保留**——候选人/申请人记录有最低保留期限（例如 EEOC
  约 1 年），也有删除义务（GDPR/CCPA 删除权）。应声明数据保留政策。

## 输出

应用后，在架构文档中添加一个 **领域约束** 块：

```
## Domain constraints (HR/recruiting)
- pipeline: stages configurable per req (not a fixed enum)
- EEO data: segregated store, excluded from decision view
- offer→onboard: candidate data carried forward, zero re-entry
- I-9: Section 2 deadline = start + 3 business days (modeled)
- scheduling: coverage rule = <min staffed>, overtime flag, swap-approval
- AI screening: <none | flagged to hr-ai-reviewer>
- retention: <policy + jurisdiction>
```

## 交叉引用

- [[vertical-onboarding]] — 以导入为先的入职漏斗；此处 offer→onboard 的数据传递*就是*为入职产品首次运行提供数据的导入。
- [[migration-ready-schema]] — 对 Candidate/Offer/Onboarding 进行建模，使数据能够顺畅地向后传递（无需重复录入这一切入点依赖于此）。
- [[lifecycle-messaging]] — 候选人阶段和入职任务通知（offer 已发送、I-9 即将到期、班次已发布、调查已开放）。