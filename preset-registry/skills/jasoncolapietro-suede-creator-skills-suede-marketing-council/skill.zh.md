---
name: suede-marketing-council
description: "Suede-affiliated marketing deliberation that applies documented public frameworks through clearly labeled simulated advisors, surfaces disagreements, and synthesizes a decision. Use when the user wants multiple expert lenses on one bounded marketing question. NOT FOR: factual claims about a living person's private views, primary research (use suede-customer-research), or executing the selected tactic (route to the relevant public Suede skill)."
metadata:
  version: 1.0.0
---
# Suede 营销委员会

Suede 召集一个**明确标注为模拟的委员会**，运用有据可查的公开框架，围绕一个界定明确的营销问题展开讨论。它的价值在于有纪律的分歧：相互冲突的视角能够揭示权衡、证据缺口，以及用户在选择方向之前应考虑的测试。

**这是人物模拟，并非真实人物本人。** 每个观点都必须以该顾问实际写过或说过的内容为依据（见 Grounding Rules）。请将输出标注为模拟。

## 开始之前

如果 `.agents/product-marketing.md` 存在，请先阅读；只询问其中未涵盖的内容；路径回退方案见 `suede-product-marketing`。

然后进行澄清（只询问缺失的信息）：
1. **问题** — 委员会正在审议什么决策或工作成果？（一项策略、一个落地页、一次定价变更、一份发布计划、一次品牌重塑、一个广告账户）
2. **利害关系** — 如果进展顺利或糟糕，会发生什么？已经尝试过什么？
3. **会议模式** — 快速观点、委员会会议，还是完整委员会（见下文）。默认为委员会会议。

## 会议模式

| 模式 | 席位 | 适用情况 |
|------|------|------|
| **快速观点** | 1 位顾问 | “Ogilvy 会如何评价这个标题？”——一位指定顾问 |
| **委员会会议**（默认） | 3–5 位顾问 | 适合需要相互冲突视角的真实决策 |
| **完整委员会** | 全部 12 位 | 预计输出较长。仅当决策不可逆、会投入用户所说的重大预算或人力，或用户表示至少一个季度内无法重新审视该决策时，才提供此选项 |

## 顾问阵容

十二位顾问经过挑选，以便让他们的视角相互碰撞。完整档案位于 `references/advisors/` ——仅加载已入席顾问的文件。

| 顾问 | 视角 | 文件 |
|---------|------|------|
| **Seth Godin** | 非凡性、许可营销、最小可行受众 | [seth-godin.md](references/advisors/seth-godin.md) |
| **David Ogilvy** | 以研究为驱动、遵循直复营销纪律的品牌广告 | [david-ogilvy.md](references/advisors/david-ogilvy.md) |
| **Eugene Schwartz** | 借助市场已有的大众欲望；认知阶段与成熟度阶段 | [eugene-schwartz.md](references/advisors/eugene-schwartz.md) |
| **Claude Hopkins** | 科学广告——测试一切，以“理由为何”展开文案 | [claude-hopkins.md](references/advisors/claude-hopkins.md) |
| **Gary Halbert** | 饥渴的人群——先于产品和文案，优先考虑市场与名单 | [gary-halbert.md](references/advisors/gary-halbert.md) |
| **Russell Brunson** | 漏斗、价值阶梯、钩子—故事—报价 | [russell-brunson.md](references/advisors/russell-brunson.md) |
| **Alex Hormozi** | 报价构建与价值方程；规模与杠杆 | [alex-hormozi.md](references/advisors/alex-hormozi.md) |
| **April Dunford** | 以真实的竞争性替代方案为参照进行定位 | [april-dunford.md](references/advisors/april-dunford.md) |
| **Rory Sutherland** | 行为科学与心理逻辑；好想法的反面也可能是好想法 | [rory-sutherland.md](references/advisors/rory-sutherland.md) |
| **Byron Sharp** | 以证据为基础的品牌科学——心理可得性与物理可得性，覆盖优先于忠诚度 | [byron-sharp.md](references/advisors/byron-sharp.md) |
| **Ann Handley** | 内容与写作技巧；更缓慢、更勇敢的营销 | [ann-handley.md](references/advisors/ann-handley.md) |
| **Gary Vaynerchuk** | 注意力套利——以规模化方式融入价格低估的渠道 | [gary-vaynerchuk.md](references/advisors/gary-vaynerchuk.md) |

## 让顾问入席

对于一次委员会会议，安排 3–5 位顾问入席：

1. **安排 2–3 位视角与问题类型直接匹配的顾问**（见下表）。
2. **始终至少安排一位指定的异议者**——其有据可查的立场与问题当前倾向的方向相冲突。一个意见一致的委员会只是镜子，而不是董事会。
3. 尊重明确的请求（“我想让 Hormozi 和 Godin 参与这个问题”）。

| 问题类型 | 高度匹配者 | 自然的异议者 |
|---------------|-------------|-------------------|
| 定位 / 信息传达 | Dunford、Godin、Schwartz | Sharp（差异化怀疑者） |
| 报价 / 定价 | Hormozi、Halbert、Brunson | Sutherland（价格 ≠ 价值逻辑）、Godin（对滑向低价竞争的警告） |
| 品牌建设 / 知名度 | Sharp、Ogilvy、Sutherland | Hopkins、Halbert（拿销售结果给我看） |
| 文案 / 创意评审 | Ogilvy、Schwartz、Halbert、Handley | Sutherland（测试这个不合逻辑之处） |
| 漏斗 / 转化路径 | Brunson、Hormozi、Hopkins | Godin（许可优先于施压）、Handley（你正在消耗信任） |
| 内容策略 | Handley、Godin、Vaynerchuk | Sharp（触达胜过深度）、Hopkins（响应在哪里？） |
| 付费广告 / 媒体 | Hopkins、Sharp、Vaynerchuk | Godin（打断是一种税） |
| 增长 / 规模化 | Hormozi、Vaynerchuk、Sharp | Handley（质量下滑）、Dunford（将模糊的定位规模化） |
| 受众 / 渠道选择 | Vaynerchuk、Sharp、Halbert | Godin（最小可行受众 vs. 大规模触达） |
| 发布策略 | Brunson、Godin、Halbert | Sharp（发布会逐渐消退；可获得性会复利增长） |

## 会议流程

1. 从 `references/advisors/` **加载已入席顾问的档案**。
2. **可选的实时研究环节**——见下文。当问题足够具体、档案中记录的立场可能无法覆盖时，或用户希望获得引用时，提供这一环节。
3. **每位顾问的观点**——每位顾问 2–4 段：
   - 开头让顾问将其*标志性问题*应用于用户的具体情况
   - 将他们的框架应用到具体细节上（其档案中会列出这些框架）——不要只是附上一个名字的泛泛建议
   - 以他们实际会持有的确信程度，明确说明其建议
   - 根据档案中的语气说明，以他们的声音撰写，但不要编造引语
4. **分歧图谱**——这是最有价值的部分。找出各观点之间 2–4 个真实存在的冲突，指出每个冲突所代表的根本权衡（例如：“Sharp 与 Godin 在这里的分歧，实际上是触达与共鸣之争——对*这家*企业而言，究竟是哪项约束起决定作用？”），并说明哪些证据可以解决每个冲突。
5. **综合结论**——由主席作总结：给出最符合*这位*用户所处阶段、品类和约束条件的建议；指出需要保留为触发警报的哪位顾问的警告；并提出包含技能交接的具体后续步骤（见相关技能）。

## 实时研究环节

当主题足够具体（某个细分领域、渠道转变、当前平台变化），或用户希望获得来源时，不要局限于档案：研究每位已入席顾问实际上针对这一类主题说过或写过什么，使用任何可调用的研究渠道——已安装的研究或视频分析技能；如果没有，则使用内置网页搜索，搜索 `[advisor name] + [topic]`。优先使用第一手来源（他们自己的书籍、博客、新闻简报、演讲），而不是汇总类文章。

将研究结果融入各位的观点中，并附上引用（“在 2023 年接受 X 采访时，Dunford 认为……”）。如果研究结果与档案矛盾，应以研究结果为准，并注明修正之处。

## 基础规则（不可协商）

- **在顶部将本次会议标注为模拟**，只需标注一次：例如一行 *“模拟委员会——每位顾问的观点均基于其已发表的框架和立场构建，并非其实际评审。”*
- **不得编造引语。** 只有在档案或研究阶段中能够核实的内容，才可直接引用，并注明来源。否则应进行转述：“Hopkins 在 *Scientific Advertising* 中的立场是……”
- **不得虚构赞同或谴责。** 可以模拟顾问将其框架应用于用户的产品；但绝不能陈述或暗示现实中的此人对用户的具体公司持有某种看法。
- **对仍在世的顾问要格外谨慎。** Godin、Brunson、Hormozi、Dunford、Sutherland、Sharp、Handley 和 Vaynerchuk 仍在世且活跃——他们的立场会不断变化；凡涉及时效性的内容，应优先采用研究阶段的结果，并且绝不要模拟他们对点名的竞争对手或争议发表评论。
- **实质性地表达分歧，不要漫画化。** 每位顾问的观点都必须以其立场应用于本案例时最有力的版本呈现——不要设置稻草人论点供综合意见轻易击破。
- **如果档案与用户的问题没有交集**（例如询问 Hopkins 对 TikTok 的看法），应在观点中说明这一点，并通过明确的类比进行推理：“Hopkins 从未见过社交信息流，但他的抽样原则可以这样映射……”这一路径适用于渠道或时代存在差距、但底层机制仍可迁移的情况。
- **“在我有记录的材料中，没有涉及这一点”是一个正式的一等结论。** 当档案中没有记录关于相关*机制*的立场时——而不只是对某个陌生渠道或时代不熟悉——观点必须将这句话原样作为其 **Bottom line**，而不是进行推断。随后，主席要么为该顾问执行 Live Research Pass，要么重新安排主席席位（与同意委员会反模式中的重新安排动作相同）。绝不能通过推断填补这一空白，也绝不能在 “Seated” 行中遗漏重新安排的事实。

## 输出格式

```
> 模拟委员会——每位顾问的观点均基于其已发表的
> 框架和立场构建，并非其实际评审。

## 委员会需要审议的问题
[用 1-2 句话重述问题 + 说明利害关系]

## Seated: [Advisor A]、[Advisor B]、[Advisor C]（[mode]）
[用一行说明为何选择这组席位，包括谁被安排为持异议者]

---

### [Advisor A] — [their lens, 3-5 words]
[2-4 段观点]
**Bottom line:** [一句话]

### [Advisor B] — …
…

---

## 委员会的分歧所在
1. **[Conflict]** — [A] 认为 X，因为 [framework]；[B] 认为 Y，因为
   [framework]。真正的权衡是：[underlying tension]。能够解决这一问题的是：[evidence/test]。
2. …

## 主席的综合意见
[结合用户当前阶段和限制条件提出建议]
- **Do:** [2-4 个具体的后续步骤]
- **Tripwire:** [需要监测哪位顾问的警告，以及对应信号]
- **Execute with:** [skill handoffs]
```

## 添加自定义顾问

用户可以扩展顾问阵容（“添加我自己的顾问”）。请按照 [references/advisor-template.md](references/advisor-template.md) 中的结构创建一份档案——字段与内置顾问相同（视角、框架、有来源支撑的已记录立场、标志性问题、最适用场景/盲点、语气说明、关键作品）。对于非知名顾问（用户的前老板、内部高管），请用户提供其立场；不要自行编造。将文件保存到用户项目中的 `.agents/advisors/<name>.md`，这样可以持久保存，也不会与仓库更新发生冲突。

## 反模式

- **一味赞同的委员会**——五种意见全都认可用户现有的计划。请重新安排阵容，加入真正的异议者。
- **套用姓名的泛泛建议**——如果只替换姓名，这条建议依然成立，那就不算真正的观点；每条意见都应立足于该顾问具体的框架和有记录的立场。
- **名言拼盘**——把著名的一句话句话拼接起来，而不是运用其背后的方法。
- **让委员会负责执行工作**——委员会负责决定方向，而不是撰写落地页。方向确定后，将工作交接给执行 skill。
- **为一个标题安排十二位顾问**——根据利害程度匹配顾问阵容的规模。

## 边界

- 不得将模拟内容呈现为真实人物的声明、认可、建议或当前观点。
- 不得捏造引语、来源、共识、资历或实时研究。
- 未经明确授权，不得发布内容、联系任何人、花费资金或执行任何建议。
- 不得让模拟委员会替用户决定法律、道德、财务或品牌风险是否可接受。

## 路由

- 使用 `suede-product-marketing` 处理定位，使用 `suede-offers` 或 `suede-pricing` 处理商业方案。
- 使用 `suede-copy`、`suede-ads` 或 `suede-ad-creative` 执行已获批准的方向。
- 使用 `suede-content-strategy`、`suede-social` 或 `suede-marketing-psychology` 处理渠道和行为相关工作。
- 当分歧应转化为可衡量的实验时，使用 `suede-ab-testing`。