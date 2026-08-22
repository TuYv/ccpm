---
name: google-ads-copy
description: Generate and A/B test Google Ads copy. Use when asked to write ad copy, headlines, descriptions, create ad variants, test ad messaging, improve CTR, or generate RSA (Responsive Search Ad) components. Trigger on "ad copy", "write ads", "headlines", "descriptions", "RSA", "responsive search ad", "ad text", "ad creative", "improve CTR", "ad A/B test", "ad variants", "write me an ad", "ad variation experiment", or when the user wants to improve click-through rate on existing ads.
argument-hint: "<ad group name, keyword theme, or 'write new ads'>"
---
# 广告文案生成器 + A/B 测试工具

撰写 Google Ads RSA 文案并运行结构化测试，以找出效果最佳的信息表达。

## 设置

阅读并遵循 `../shared/preamble.md`（MCP 检测、账号选择）和 `../shared/analysis-principles.md`（证据要求、护栏）。两者在整个过程中均适用。

## 参考资料

按需阅读：

- `references/rsa-best-practices.md` — 字符限制、标题公式、固定机制、A/B 测试机制、常见错误。它是文案撰写规范的唯一权威来源。
- `references/rsa-testing-lab.md` — 如何选择 RSA 测试指标、诊断广告组意图膨胀、决定是否固定，以及避免为了提升广告效力而忽视业务成果。
- `../manage/references/industry-benchmarks.md` — 用于合理性检查目标的行业 CTR/CVR 基准。
- `../manage/references/quality-score-framework.md` — 仅在提升 QS 是明确目标时使用。

## 业务背景 — 不可妥协的输入

每项文案决策都必须以业务背景为基础。首先读取 `{data_dir}/business-context.json` 和 `{data_dir}/personas/{accountId}.json`。

- 如果任一文件缺失或为空，请在撰写文案前建议使用 `/google-ads-audit` — 忽略定位的通用文案只会浪费广告资源。完整的信息采集流程（网站抓取、架构、初始化）位于 `../audit/references/business-context.md`。
- 如果用户主动提供新信息（新服务、定位变更、季节性更新），请将其合并进去。

业务背景对文案的影响：服务对应不同的标题类别；地点信息值得拥有本地化专属标题（同时可能提升 QS）；品牌调性决定语气和禁用词；差异化优势就是价值主张标题；竞品信息有助于强化定位（但不要点名）；季节性决定采用紧迫感表达还是常青式表达；优惠活动用于生成时效性变体；文案必须与落地页内容保持一致（否则转化率会下降）。用户画像决定语言表达：在标题中使用他们自己的搜索词措辞，在描述中体现他们的痛点，并将他们的决策触发因素作为 CTA 的切入角度。

## 广告效力与实际效果

广告效力针对 Google 的多样性目标进行优化，而不是针对你的转化率。优先级为：**转化率 > CTR > CPA > 广告效力。** 不要为了追求“极佳”而破坏一条高 CTR 广告。但应将较低的广告效力视为有用的多样性信号 — 使用八个各不相同的标题，每个类别一个，并且描述库中不要有重复内容。

## 从哪些数据中提取文案素材

文案必须以已经实现转化的内容为依据。一次包含 `ads.gaqlParallel` 的 `runScript` 几乎可以覆盖任何文案任务 — 并行查询：

- `ad_group_ad` — 当前标题、描述、广告效力，以及每条广告的点击次数/CTR/转化次数（需要超越的基准）
- `keyword_view` — 哪些关键词正在带来转化，以及哪些 QS 组成部分较弱
- `search_term_view` — 客户实际输入的短语（最佳的单一语言素材来源）
- `campaign` — 每个变体都必须超过的 CTR/CVR 基准

对于覆盖整个品牌的文案重写，请在一次查询中关联所有数据。对于单个广告组，请使用 `WHERE ad_group.id = …` 限定每个查询的范围。结合 `business-context.json` 中的季节性和关键词格局背景信息。

如果用户拥有 CRM 或潜在客户结果数据库，其中包含客户实际使用的语言，就应挖掘这些数据——客户语言永远胜过营销语言。

## 文案输出契约

每份提案都需要附带一份简短的决策记录，而不能只提供一组标题：

- 一个**概念 ID**和一句话假设：`persona × motivation × angle`。
- 针对每项证明、优惠、评分、保证、价格或最高级表述提供一份**声明台账**：注明确切来源（账户数据、业务背景、已批准的落地页或用户提供的证据），以及是否获准用于广告。
- 提供完整的 RSA 素材，包括字符数和固定位置；进行测试时，还要提供一个明显不同的挑战者概念。

不要把模糊的请求变成捏造的证明。如果某项声明很有吸引力但缺乏支持，请将其标记为 `needs_substantiation`，并撰写一个不含该声明的替代版本。引用竞争对手、未经验证的评论网站或一般行业知识，并不代表该声明获准用于广告。

## 竞争性文案规则

- **绝不**在广告文案中提及竞争对手的名称（存在政策风险，而且你还在免费为其提升品牌知名度）。
- 在没有可验证依据的情况下，**绝不**使用“最佳”/“排名第一”。Google 要求提供依据；商标团队会执行这项规则。
- **应当**使用竞争对手不具备的具体功能（“当日服务”胜过“更好的服务”）、信任信号（“Google 评分 4.9★ · 500+ 条评论”）、保证、透明定价和具体位置信息。可验证的具体表述比最高级表述效果更好。

## RSA 机制

Google RSA：最多可包含 **15 个标题（最多 30 个字符）**和 **4 条描述（最多 90 个字符）**。哪怕只超出一个字符，也会被拒绝。务必计算字符数。

`references/rsa-best-practices.md` 是标题公式、描述排序和固定位置策略的权威依据。简明经验法则是：将一个“服务+地点”标题固定在位置 1，将一个 CTA 固定在位置 3，让位置 2 保持不固定，以便 Google 测试价值主张/信任/差异化标题，并且固定的素材总数绝不能超过 3 个。

## A/B 测试——使用实验框架

当用户希望进行测试时，应使用 MCP 服务器的实验工具，而不是旧的“并排部署两个已暂停广告”模式：

- **广告文案 A/B 测试**——`createAdVariationExperiment` 是专用于广告层级变体测试的工具。它负责管理流量分配、提升效果比较和结果回读。
- **较大幅度的创意调整**（不同角度、不同目标画像、不同落地页目标地址）——使用 `createExperiment` + `addExperimentArms` + `scheduleExperiment`。使用 `listActiveExperiments` 和 `listExperimentAsyncErrors` 进行监控。使用 `endExperiment`、`graduateExperiment` 或 `promoteExperiment` 决定最终处理方式。
- **单个广告组、两个变体、不进行流量分配**——对于低风险的文案迭代，仍可接受在同一广告组中创建两个先暂停后启用的广告，但这种方式背后没有统计引擎支持。当决策很重要时，应优先采用实验路径。

每个变体都必须测试一个**具有实质差异的角度**，而不能只是替换词语。“信任与专业能力”与“速度与便利性”与“价格与价值”之间的对比才是真正的测试；“今天致电”与“立即致电”之间的对比只是噪声。

在撰写变体之前，如果请求提到测试、固定、Ad Strength、CTR/CVR 偏低或混合意图广告组，请阅读 `references/rsa-testing-lab.md`。其中总结了一种通用模式：许多 RSA 问题实际上是广告组/搜索查询主题问题。

发布前，记录一项主要指标、所有护栏指标（例如 CPA 或合格潜在客户率）、计划的最低曝光量或持续时间，以及决策规则。不要反复查看数据并根据早期差距宣布胜出者：每个变体少于约 100 次点击通常还为时过早，即使 CVR 相差 2×，仍然需要足够的转化次数，并检查近期是否发生过变更。实验框架自身提供的显著性信号是最可靠的依据——如有此类信号，应以其为准。

确定胜出者后：暂停落败变体，然后以胜出变体为基准继续迭代。永远不要停止测试。

## 操作原则

1. **业务背景不可或缺。** 没有 `business-context.json` / `personas` → 在撰写前建议使用 `/google-ads-audit`。
2. **部署前进行确认。** 展示确切的文案、每项素材的字符数和固定位置。获得明确同意后再推送。
3. **每次写入操作均可在 7 天内撤销**，方法是使用 `undoChange`（前提是相关实体此后未被修改）。
4. **要形成差异，而不是模仿。** 任何竞争对手都能使用的通用文案，只会浪费广告位。
5. **将出价/预算/关键词相关工作交给 `/google-ads`**——此技能仅负责撰写文案和运行创意实验。