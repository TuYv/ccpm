---
name: foundation-build-risk-review
description: Runs a fast pre-build risk review on a product idea, feature request, or scope change, naming the single assumption most likely to make it fail and returning a clear verdict (build small, validate first, pivot first, or don't build yet) with a no-code validation step. Use before committing build effort, when triaging whether to honor a feature request, or when deciding whether to expand scope, ahead of writing a PRD. For a launched product's pivot-or-persevere decision, use iterate-pivot-decision instead.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.1.0"
  updated: 2026-07-04
  category: problem-framing
  frameworks: [triple-diamond, lean-startup]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
<!-- 改编自 bin1874/before-you-build-skill (Apache-2.0)，重新定位为与 PM 无关。 -->
# 构建风险评审

先别构建。首先指出最有可能导致它失败的那个假设。

`foundation-build-risk-review` 是一个快速的、提交前的产品决策关卡。给定一个想法、功能请求或范围变更，它会返回一份**构建风险评审**：最大的单一风险、支撑该判断的证据、结论，以及一个具体的无代码验证步骤；随后将你引导至负责下一项工作的技能。它是一个基础枢纽：职责是分流和调度，而不是重复更深入的技能。

## 硬性关卡

不要编写代码、搭建项目脚手架、推荐技术栈或设计实现方案。首先回答三个问题：是否应该构建、最有可能导致它失败的因素是什么，以及在做出承诺之前必须验证什么。

如果用户说这项工作是为了学习、作品集或内部练习，不要用市场标准来评判它；但仍要指出范围和清晰度方面的风险。

## 何时使用

- 一个产品创意、MVP 或新的下注方向即将转化为构建工作。
- 收到功能请求或范围变更，需要将真实需求与礼貌性的请求、创始人焦虑或竞品照搬区分开来。
- 有人在 PRD、路线图条目或工单出现之前，希望快速得到“我们是否应该构建这个”的结论。

## 何时不要使用

| 如果请求是 | 改用 |
|---|---|
| 已发布产品的转型或坚持决策，需要权衡使用数据或市场数据 | `iterate-pivot-decision` |
| 已经选定了假设，需要设计验证测试 | `define-hypothesis` |
| 为团队或管理层梳理一个已确认的问题 | `define-problem-statement` |
| 需要完整的九模块商业模式，而不是针对单一风险的判断 | `foundation-lean-canvas` |
| 需要在多个功能或计划之间进行排序 | `define-prioritization-framework` |

最重要的边界是：此技能是**面向未来且处于提交前阶段**（数据很少或没有数据）；`iterate-pivot-decision` 则是**回顾性且处于发布后阶段**（需要权衡已经上线的产品所获得的市场反馈）。

## 模式（先分流；在顶部声明模式）

1. **构建前** - 尚未构建的新想法、产品或 MVP。通常的主要风险是需求和分发。
2. **功能变更** - 正在开发的产品收到功能请求、范围扩展、需求变更或竞品照搬。这里的主要工具是需求层级。

如果产品已经上线，而问题是是否要改变方向，则交接给 `iterate-pivot-decision`。如果请求过于宽泛，无法负责任地进行评审，则只提出一个澄清问题（补完整这句话：“这是给[谁]在[什么情境]中解决[什么问题]的”），然后继续。绝不要进行长篇问卷；在进行受约束的评审之前，最多提两个问题。

## 评审（契约）

输出一份包含以下部分的构建风险评审：

1. **最大风险（`R1`）。** 只能有一个主要风险，并根据 `references/risk-taxonomy.md` 进行标记。不要列出一长串清单。最多再添加三到五个辅助风险（`R2`、`R3`……）。
2. **需求级别（功能变更模式）。** 将请求放在以下层级中：L0 创始人焦虑或“竞品有这个功能”；L1 一位用户提出过请求；L2 反复有人提出请求，但没有行为证据；L3 工作流阻塞；L4 收入或留存阻塞。通常只有达到 L3 或 L4 才有理由立即构建。
3. **证据台账。** 列出已经存在的信号，并根据 `references/risk-taxonomy.md` 中的强度阶梯为每条记录评级。点赞、赞美、候补名单和市场规模数字都不是需求。真实文件、已预约的通话、付款、反复进行的手动使用，或从现有替代方案切换而来，才是需求证据。
4. **结论**（只能选一个）：**小范围构建** / **先验证** / **先转向** / **暂时不要构建**。不要使用“终止”。
5. **验证步骤。** 提出一个具体的、无代码或低代码的下一步行动（与十位做 X 的用户交谈；为其中三位手动交付结果；收集预购款、付费通话费用或定金），绝不要给出“构建 MVP”或“开展用户调研”之类的泛泛建议。
6. **分流。** 将用户引导至负责下一项工作的技能（见下文）。

持怀疑态度，但要有帮助。始终区分“可以构建”与“应该构建”。不要吹捧这个想法，也不要默认给予鼓励；除非路径是具体明确的，否则不要说“这有潜力”。

## 结论路由

| 结论 | 路由至 |
|---|---|
| 小规模构建 | `define-problem-statement`，然后是 `deliver-prd` / `deliver-user-stories` |
| 先验证 | `define-hypothesis`，然后是 `measure-experiment-design` |
| 先调整方向 | `foundation-lean-canvas`（重新构建模型） |
| 暂时不要构建 | 停止；或使用 `discover-competitive-analysis` / `discover-market-sizing` 进行证据核查 |
| 存在多个相互竞争的请求 | `define-prioritization-framework` |

完整映射（包括按风险分类的路由）见：`references/routing-map.md`。

**如果被路由的 skill 不可用，不要只给出一个无内容的指向。** 这个库通常是部分安装的，而不是完整安装，因此你所路由到的 skill 可能不存在于用户环境中。当你无法确认它是否可用时，要明确说明这一点，并直接内嵌其输出的最小版本，以便评审仍然可以执行：

| 被路由的 skill 不存在 | 改为内嵌 |
|---|---|
| `define-hypothesis` | 使用 believe / for / will / as-measured-by 形式写出一个可测试的假设 |
| `measure-experiment-design` | 三行实验草案：一个决策指标、所需样本量或持续时间，以及在运行前预先设定的胜负规则 |
| `define-problem-statement` | 两句话的问题框架：谁、在什么情境下、被什么阻碍 |
| `foundation-lean-canvas` | 仅列出风险最高的三个框：问题、客户群体、不公平优势 |
| `define-prioritization-framework` | 一份单一的排序列表，并注明真正起决定作用的那一项标准 |

如果用户无法执行结论的下一步，那么这次评审就还没有完成。指出缺口并提供最低限度的内容，总好过将其路由到一个无法执行的环境中。

## 输出格式

生成一份单一的 Build Risk Review 工件，基于 `references/TEMPLATE.md` 构建。章节顺序如下：决策标题（结论 + 一句话理由）、最大风险（`R1`）、支持性风险、需求水平（功能模式）、证据账本、验证计划、路由、Sources。完整示例见 `references/EXAMPLE.md`。

## 质量检查清单

- [ ] 只命名一个主要风险（`R1`），并从分类体系中标注。
- [ ] 功能变更模式下，将请求置于 L0 至 L4 之一。
- [ ] 每条证据都进行了分级；点赞、等待名单或市场规模数字均不得计为需求。
- [ ] 只返回四个结论中的一个。
- [ ] 下一步具体且低代码或无代码，而不是泛泛的建议。
- [ ] 指定一个路由目标。
- [ ] 不生成代码、技术栈建议或实现设计（硬性门槛已生效）。

## 归属

改编自 `bin1874/before-you-build-skill`（Apache-2.0），重新定位为与 PM 无关的版本。已移除源 skill 中调用外部案例记忆 API 以及将内容翻译成用户语言的行为。