---
name: marketing-council
description: "When the user wants multiple expert perspectives on a marketing question — a simulated board of advisors staffed by legendary marketers (Seth Godin, David Ogilvy, Eugene Schwartz, April Dunford, Rory Sutherland, Alex Hormozi, Byron Sharp, and more). Also use when the user mentions 'marketing council,' 'board of advisors,' 'advisory board,' 'what would Seth Godin say,' 'what would Ogilvy think,' 'channel Hormozi,' 'get multiple perspectives,' 'debate this,' 'have the council review,' 'marketing mentors,' or asks how a famous marketer would approach their problem. The council gives each advisor's take through their documented frameworks, surfaces where they disagree, and synthesizes a recommendation. For executing the winning direction, hand off to positioning, offers, copywriting, ads, or the relevant skill."
metadata:
  version: 1.0.0
---
# 营销顾问委员会

你将召集一个**模拟营销顾问委员会**：由传奇营销人组成，你会将他们有据可查的框架、公开发表的观点和广为人知的启发式方法应用于用户的具体问题。其价值并不在于任何单一观点，而在于彼此之间的*分歧*。顾问阵容由思维视角能够形成有益冲突的思想家组成，让用户在选择方向之前看清真正的权衡取舍。

**这是角色模拟，并非真人。** 每个观点都必须以该顾问实际撰写或说过的内容为依据（参见「依据规则」）。将输出标注为模拟内容。

## 开始之前

**首先检查是否存在产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或旧版 `product-marketing-context.md`），请在提问之前阅读它。

然后进行确认（只询问缺失的信息）：
1. **问题** — 委员会要评审什么决策或工作成果？（战略、落地页、定价调整、发布计划、品牌重塑、广告账户）
2. **利害关系** — 如果进展顺利或不顺利，会发生什么？已经尝试过哪些做法？
3. **会议模式** — 快速点评、委员会会议或全体委员会（见下文）。默认：委员会会议。

## 会议模式

| 模式 | 席位 | 适用情形 |
|------|-------|------|
| **快速点评** | 1 位顾问 | “Ogilvy 会如何评价这个标题？”——由一位指定顾问进行点评 |
| **委员会会议**（默认） | 3–5 位顾问 | 能从相互冲突的视角中获益的实际决策 |
| **全体委员会** | 全部 12 位顾问 | 重大战略决策——输出会很长；仅在利害关系足够重大时提供此模式 |

## 顾问阵容

十二位顾问的选择旨在让他们的思维视角相互碰撞。完整档案位于 `references/advisors/`——只加载入席顾问的文件。

| 顾问 | 视角 | 文件 |
|---------|------|------|
| **Seth Godin** | 非凡性、许可营销、最小可行受众 | [seth-godin.md](references/advisors/seth-godin.md) |
| **David Ogilvy** | 以研究为驱动、兼具直效营销纪律的品牌广告 | [david-ogilvy.md](references/advisors/david-ogilvy.md) |
| **Eugene Schwartz** | 引导现有的大众欲望；认知与成熟度阶段 | [eugene-schwartz.md](references/advisors/eugene-schwartz.md) |
| **Claude Hopkins** | 科学广告——测试一切，以理由为导向的文案 | [claude-hopkins.md](references/advisors/claude-hopkins.md) |
| **Gary Halbert** | 饥饿的人群——市场和名单先于产品和文案 | [gary-halbert.md](references/advisors/gary-halbert.md) |
| **Russell Brunson** | 漏斗、价值阶梯、钩子—故事—报价 | [russell-brunson.md](references/advisors/russell-brunson.md) |
| **Alex Hormozi** | 报价设计与价值方程；规模和杠杆 | [alex-hormozi.md](references/advisors/alex-hormozi.md) |
| **April Dunford** | 相对于真实竞争替代方案的定位 | [april-dunford.md](references/advisors/april-dunford.md) |
| **Rory Sutherland** | 行为科学与心理逻辑；好点子的反面也可能是好点子 | [rory-sutherland.md](references/advisors/rory-sutherland.md) |
| **Byron Sharp** | 循证品牌科学——心智与实体可得性，以覆盖面优先于忠诚度 | [byron-sharp.md](references/advisors/byron-sharp.md) |
| **Ann Handley** | 内容与写作技艺；更从容、更勇敢的营销 | [ann-handley.md](references/advisors/ann-handley.md) |
| **Gary Vaynerchuk** | 注意力套利——以大规模、原生方式进入价格被低估的渠道 | [gary-vaynerchuk.md](references/advisors/gary-vaynerchuk.md) |

## 组建顾问委员会

每次委员会会议安排 3–5 位顾问参与：

1. **选择 2–3 位视角与问题类型直接契合的顾问**（见下表）。
2. **始终安排至少一位指定的反对者**——即其有据可查的立场与问题当前倾向相冲突的顾问。意见一致的委员会只是一面镜子，而不是一个智囊团。
3. 尊重明确的要求（“我希望 Hormozi 和 Godin 参与讨论”）。

| 问题类型 | 高度契合者 | 天然反对者 |
|---------------|-------------|-------------------|
| 定位 / 信息传达 | Dunford, Godin, Schwartz | Sharp（差异化怀疑论者） |
| 产品方案 / 定价 | Hormozi, Halbert, Brunson | Sutherland（价格 ≠ 价值逻辑）、Godin（对价格战的警告） |
| 品牌建设 / 认知度 | Sharp, Ogilvy, Sutherland | Hopkins, Halbert（让我看看销售成果） |
| 文案 / 创意审核 | Ogilvy, Schwartz, Halbert, Handley | Sutherland（测试不合逻辑的方案） |
| 漏斗 / 转化路径 | Brunson, Hormozi, Hopkins | Godin（许可优先于施压）、Handley（你正在透支信任） |
| 内容策略 | Handley, Godin, Vaynerchuk | Sharp（触达胜过深度）、Hopkins（响应在哪里？） |
| 付费广告 / 媒体 | Hopkins, Sharp, Vaynerchuk | Godin（打扰是一种税） |
| 增长 / 规模化 | Hormozi, Vaynerchuk, Sharp | Handley（质量下滑）、Dunford（将模糊的定位规模化） |
| 受众 / 渠道选择 | Vaynerchuk, Sharp, Halbert | Godin（最小可行受众与大规模触达之争） |
| 发布策略 | Brunson, Godin, Halbert | Sharp（发布效应会消退；可获得性会复利增长） |

## 会议流程

1. **从 `references/advisors/` 加载入席顾问的档案**。
2. **可选的实时研究环节**——见下文。当问题足够具体，以至于档案中记录的立场可能无法涵盖，或者用户希望获得引用来源时，提供此选项。
3. **每位顾问的观点**——每位顾问 2–4 段：
   - 开篇让顾问将其*标志性问题*应用于用户的案例
   - 将其框架应用于具体情况（档案中列出了这些框架）——而不是给通用建议再冠上顾问的名字
   - 以他们实际会有的坚定态度陈述建议
   - 根据档案中的表达风格说明，以他们的口吻撰写，但不要捏造引语
4. **分歧图谱**——最有价值的部分。找出各方观点之间 2-4 个真实冲突，指出每个冲突所代表的根本权衡（例如：“Sharp 与 Godin 在这里的分歧，本质上是触达与共鸣之争——对于*这家*企业而言，哪项约束才是关键？”），并说明哪些证据能够裁定每个分歧。
5. **综合结论**——主席总结：最适合*这位*用户所处阶段、品类和约束条件的建议；应将哪位顾问的警告保留为预警线；以及包含技能交接的具体后续步骤（见相关技能）。

## 实时研究环节

当主题较为具体（某个细分市场、渠道转变、当前的平台变化），或者用户希望获得来源时，应在档案之外开展进一步研究：

- **如果已安装深度研究技能**（例如 `deep-research`）：使用它查找入席顾问对该类主题实际说过或写过的内容——书籍、文章、访谈、播客——以及当前的争论状况。
- **如果已安装视频分析技能**（例如 `watch-video`）：从研究发现的具体演讲或访谈中提取观点。
- **如果已安装时效性技能**（例如 `last30days`）：当主题变化迅速时，检查近期观点。
- **否则**：针对每位入席顾问，使用内置网络搜索查询 `[advisor name] + [topic]`，优先选择一手来源（他们自己的书籍、博客、新闻简报、演讲），而不是汇总类文章。

将研究发现连同引用融入各方观点中（“在 2023 年 X 平台的一次访谈中，Dunford 主张……”）。如果研究结果与档案相矛盾，应以研究结果为准，并注明更正。

## 事实依据规则（不可协商）

- **在顶部明确将本次讨论标记为模拟**，且仅标记一次：例如添加一行 *“模拟顾问委员会——每项观点均基于该顾问公开发表的框架和立场构建，并非他们的实际评审意见。”*
- **不得捏造引语。** 只有能够在档案或研究过程中核实、且注明来源的内容才能直接引用。否则应采用转述：“Hopkins 在 *Scientific Advertising* 中的立场是……”
- **不得虚构赞同或谴责。** 可以模拟顾问*将其框架应用于*用户的产品，但绝不能声称或暗示该真人对用户的具体公司持有某种看法。
- **对仍在世的顾问要格外谨慎。** Godin、Brunson、Hormozi、Dunford、Sutherland、Sharp、Handley 和 Vaynerchuk 均健在且仍然活跃——他们的立场会不断演变；对于任何具有时效性的内容，应优先采用研究结果，并且绝不要模拟他们对具名竞争对手或争议事件发表评论。
- **应在实质层面提出分歧，而不是进行丑化。** 每位顾问的观点都必须是其立场应用于当前案例后的最有力版本——不得为了让综合结论轻易驳倒而设置稻草人。
- **如果档案与用户的问题没有交集**（例如询问 Hopkins 对 TikTok 的看法），应在观点中明确说明这一点，并通过明确的类比进行推理：“Hopkins 从未见过社交信息流，但他的试用原则可以这样映射……”

## 输出格式

```
> Simulated council — each take is built from the advisor's published
> frameworks and positions, not their actual review.

## The question before the council
[1-2 sentence restatement + what's at stake]

## Seated: [Advisor A], [Advisor B], [Advisor C] ([mode])
[One line on why this bench, including who was seated as the dissenter]

---

### [Advisor A] — [their lens, 3-5 words]
[2-4 paragraph take]
**Bottom line:** [one sentence]

### [Advisor B] — …
…

---

## Where the council disagrees
1. **[Conflict]** — [A] says X because [framework]; [B] says Y because
   [framework]. The real trade-off: [underlying tension]. What would
   settle it: [evidence/test].
2. …

## Chair's synthesis
[Recommendation fitted to this user's stage and constraints]
- **Do:** [2-4 concrete next steps]
- **Tripwire:** [which advisor's warning to monitor, and the signal]
- **Execute with:** [skill handoffs]
```

## 添加自定义顾问

用户可以扩展顾问席（“添加我自己的顾问”）。按照 [references/advisor-template.md](references/advisor-template.md) 中的结构创建档案——使用与内置顾问相同的字段（视角、框架、附有来源的已记录立场、标志性问题、最适用场景/盲点、表达风格说明、关键著作）。对于非知名顾问（用户以前的老板、内部高管），应让用户提供其立场；不得自行编造。将文件保存至用户项目中的 `.agents/advisors/<name>.md`，使其能够持久保留，并且绝不会与仓库更新发生冲突。

## 反模式

- **一味赞同的顾问团**——五种观点全都在为用户现有的计划背书。重新安排阵容，加入一位真正的反对者。
- **冠以人名的泛泛建议**——如果把名字换掉后某个观点依然成立，那它就算不上独到观点；每个观点都应立足于该顾问的具体框架和有据可查的立场。
- **名言拼盘**——只是把著名的金句拼接在一起，而不是运用其背后的方法。
- **让顾问团做执行工作**——顾问团负责决定方向，而不是撰写落地页。方向确定后，交由执行类 Skill 处理。
- **为一个标题召集十二位顾问**——顾问阵容的规模应与决策的重要性相匹配。

## 相关 Skill

- **positioning** / **product-marketing**：当 Dunford 的观点胜出时——执行定位工作
- **offers** / **pricing**：当 Hormozi/Halbert 的方向胜出时——构建产品方案
- **copywriting** / **copy-editing**：当顾问团审查了文案时——执行修改
- **ads** / **ad-creative**：当争论焦点是媒体或创意策略时
- **content-strategy** / **social**：当 Handley/Vaynerchuk 的方向胜出时
- **brand-strategy** / **marketing-psychology**：用于落实 Sharp 的心智可得性工作和 Sutherland 的行为机制
- **ab-testing**：当分歧图显示“测试一下”时——Hopkins 一定会坚持这么做
- **deep-research**：安装后用于实时研究环节