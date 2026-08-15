---
name: pestel-delta-monitor
argument-hint: "[prior PESTEL analysis, and any suspected events since]"
description: "Quarterly re-scan of a prior PESTEL analysis. Use when checking which macro factors moved, which assumptions broke, and what's new — turning PESTEL from a workshop artifact into a radar."
intent: >-
  Refresh a PESTEL analysis by diffing each factor against the prior run and reporting material
  movement only — regulation passed, thresholds crossed, technology matured, assumptions broken.
  Macro factors move slowly; the value is catching the two that moved, not re-debating the twenty
  that did not.
type: workflow
theme: market-intelligence
best_for:
  - "Keeping a PESTEL analysis alive on a quarterly cadence instead of letting it rot in a deck"
  - "Catching which macro assumptions your strategy quietly depends on — and which just broke"
  - "Feeding regulatory and macro shifts into roadmap and OKR conversations with citations"
scenarios:
  - "Here's the PESTEL we did in Q1 — what's moved since?"
  - "A new regulation just passed in our space; re-run the macro scan against our baseline"
estimated_time: "15-30 min per run"
---
# PESTEL 变化监测

## 目的

通过将每个因素——政治、经济、社会、技术、环境、法律——与上一次运行结果进行差异比较，更新 PESTEL 分析，并且**仅报告实质性变化**：**搜索计划
→ 逐因素差异比较 → 已失效的假设 → 新进入分析框架的因素 → 后续行动选项。** 宏观
因素变化缓慢，而这恰恰是团队停止关注它们的原因；定期分析的价值在于捕捉发生变化的
两个因素，而不是重新讨论没有变化的二十个因素。差异比较还能揭示基线中的哪些条目是有效假设，哪些只是摆设——**已失效的假设才是真正的输出。**

## 输入

**最佳输入：** 上一次的 PESTEL 分析（粘贴或以附件形式提供），以及该分析所涵盖的产品/市场范围——此技能*必须*有基线才能进行差异比较。
**同样有用：** 自上次运行以来，你已经怀疑可能产生影响的任何事件——将优先核查这些事件。

调用时内联提供的输入——技能名称后的文本、粘贴的上下文转储，或追加的 `ARGUMENTS:` 行——均视为已经给出的答案。应将其计入问题额度；
不要重复提问。

**没有提供任何材料？** 这是唯一具有硬性前置条件的调查技能：如果没有
基线，它会建议先运行 [`pestel-analysis`](../pestel-analysis/SKILL.md)，然后停止——因为没有任何内容可供差异比较。（该指引*就是*空手而来时的处理路径：离开时，你会确切知道
第一步该做什么。）

**调用示例：** `PESTEL delta against the attached Q1 analysis — scope is our EU payments
product; I suspect the new AI liability directive matters.`

## 核心概念

- **管理协议：** 遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  契约——问题额度为 2、搜索计划关卡、事实/推断/假设标签、恰到好处模式、稳定模式、包含 4 个选项的最终步骤。采用的专业领域：GEOINT/DEMOINT 统计数据以及 FININT
  监管来源（参见 [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)）；
  这是融合节奏中的年度/季度层。
- **宏观因素的实质性标准：** 法规已经通过*或被可信地提出*、宏观指标
  越过基线中指定的阈值、技术成熟且有采用证据、社会信号有数据支撑。每个因素均为“无实质性变化”是有效且*常见*的结果——
  如实报告一个平静的季度，能维持监测机制的可信度。
- **已失效的假设才是重点。** 如果基线中的某个条目现已被证据否定，那么它比
  十条新观察更重要，因为战略正是建立在它之上的。差异比较的目的就是找出这些假设。
- **假设与摆设。** 那些从未变化且与任何决策都无关的条目只是摆设——
  应标记为在下一次基线更新时移除，而不是永远对其进行重复扫描。
- **范围变化会破坏差异比较。** 新市场、业务转向、根本不同的业务环境 → 重新进行
  完整的 PESTEL 分析；切勿跨范围变化进行差异比较。
- **禁止编造清单：** 法规、统计数据、日期、事件。所有内容都必须附有真实的 URL 和日期——
  编造法规是这一领域最典型的虚构风险。

## 应用

1. **检查前置条件。** 没有先前的 PESTEL → 推荐 [`pestel-analysis`](../pestel-analysis/SKILL.md)
   并停止。范围自基线以来已发生变化 → 推荐重新进行完整分析并停止。
2. **认可行内上下文**，然后仅询问尚未回答的问题（最多 2 个）：
   1. 是否有可粘贴的先前 PESTEL？
   2. 是否有任何此后发生且你已怀疑可能产生影响的事件？
3. **完整阅读先前的分析；逐个因素进行差异比较**——基线文档是差异比较的
   目标，而不是你对宏观环境的一般知识。
4. **展示包含 3 个要点的搜索计划**——本轮将主动搜索哪些因素类别
   （优先搜索疑似事件）、来源类型（政府和监管机构来源、中央银行和
   统计数据、可信新闻、行业机构、标准组织）、事实/推断分离。除非被修改，否则继续。
5. **严格按原样输出以下架构。**

### 输出架构（不要重新排序）

~~~markdown
# PESTEL Delta Report

## 1. Run Header
**Scope (from prior analysis):** | **Prior analysis date:** | **This run date:**

## 2. Factor-by-Factor Delta
For each of P / E / S / T / E / L:
### [Factor]: [moved / no material movement]
- **What moved:** [1-2 bullets, labeled, cited — only if moved]
- **Prior assumption affected:** [which entry from the baseline]
- **Reading:** [Inference — implication for the product scope]

Keep "no material movement" factors to a single line each.

## 3. Broken Assumptions
- [Baseline entries now contradicted by evidence — the run's most important section; cited]

## 4. New to the Frame
- [Factors absent from the baseline that now warrant a slot]

## 5. So What?
- **3** implications for strategy or roadmap
- **2** factors to watch closely next cycle
- **3** assumptions to validate
Each bullet: label, confidence, URL where relevant.
~~~

此架构的可复制/粘贴填充版本（含质量检查）位于 [`template.md`](template.md)。

### 最后一步（恰好提供 4 个选项）

1. 使用这些增量更新基线 PESTEL（形成新基线）
2. 深入分析影响最重大的已变化因素
3. 追踪已失效假设对路线图或 OKR 的影响
4. 设定下一周期的重点监测事项

接受 `1`、`2`、`3`、`4`、`1 and 2`、`Verbose Mode` 或自定义路径。

## 示例

**追溯至其假设的已变化因素（虚构）：**

> ### 法律：已变化
> - **发生了什么变化：** 数据驻留条款已通过委员会审议，合规期限为 18 个月
>   ——**事实**（[立法机构记录、URL、日期]）
> - **受影响的先前假设：** 基线条目 L2 假设“2028 年之前不会实施驻留强制要求”，
>   以此作为推迟区域存储架构建设的依据
> - **解读：** 推迟的逻辑已不再成立——**推断**：架构决策从
>   未来某个时间提前至接下来两个路线图季度，而且在合规成为法律义务之前，
>   它就会成为面向受监管垂直行业的销售优势。

**如实报告一个平静的季度：** 五个因素各以单行显示“无重大变化”；
一个经济因素条目发生了变化（利率路径变化越过了基线中明确规定的预算门槛阈值）。
报告只有半页。这种简洁*正是*雷达有效运作的体现——读者花两分钟就能
知道，战略的宏观基础总体保持不变，只有明确发生变化之处除外。

有关完整的增量运行示例（虚构的交易软件范围），请参阅 [`examples/sample.md`](examples/sample.md)，
其中追溯了两个被打破的假设及其基线条目，并标记了需要淘汰的陈旧内容。
[`examples/sample-industrial.md`](examples/sample-industrial.md) 展示了工业领域的运行示例，
其中热点因素发生了变化——关税、能源、披露规则——并将阈值突破与假设被打破区分开来。

## 常见陷阱

- **重新争论未发生变化的因素。** 每季度重写全部六项因素，会让雷达重新变回它原本要取代的
  研讨过程。每个平静因素只写一行——这种纪律本身就是产品。
- **夸大重要性。** 将思辨文章和毫无进展的提案拔高为“变化”。
  判断标准应是已通过或已被可信地提出的法规、已突破的阈值、采用证据——而不是
  讨论本身。
- **掩埋被打破的假设。** 只列出增量变化，却不将它们与其所反驳的基线条目
  联系起来。“受影响的先前假设”这一行，才是让增量变化具备可操作性的关键。
- **跨转向进行差异比较。** 业务已经进入新市场，监控器却仍在比较
  旧范围内的因素。范围变化 = 新基线，无一例外。
- **杜撰具体信息。** 法规名称、生效日期或统计数据经不起核查。
  在这一领域，伪造引用不仅是错误，还会给读者带来合规风险——
  禁止杜撰清单是不可或缺的支柱。

## 参考资料

- [`pestel-analysis`](../pestel-analysis/SKILL.md)（组件）——构建此监控器用于差异比较的基线；
  二者结合，将 PESTEL 转化为运营雷达
- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——统领全局的协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——GEOINT/DEMOINT 统计来源；监管登记库
- [`derisk-measurement-advisor`](../derisk-measurement-advisor/SKILL.md)（交互式）——将被打破的假设作为风险输入
- [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)（工作流）——此宏观层面监控在竞争对手层面的对应工作流
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `market-intelligence/pestel-delta-monitor-prompt.md`。