---
name: google-ads-copy
description: Generate and A/B test Google Ads copy. Use when asked to write ad copy, headlines, descriptions, create ad variants, test ad messaging, improve CTR, or generate RSA (Responsive Search Ad) components. Trigger on "ad copy", "write ads", "headlines", "descriptions", "RSA", "responsive search ad", "ad text", "ad creative", "improve CTR", "ad A/B test", "ad variants", "write me an ad", "ad variation experiment", or when the user wants to improve click-through rate on existing ads.
argument-hint: "<ad group name, keyword theme, or 'write new ads'>"
---
# 广告文案生成器 + A/B 测试器

编写 Google Ads RSA 文案，并开展结构化测试以找出效果最佳的信息表达。

## 设置

阅读并遵循 `../shared/preamble.md`（MCP 检测、账号选择）和 `../shared/analysis-principles.md`（证据要求、护栏规则）。两者始终适用。

## 参考资料

按需阅读：

- `references/rsa-best-practices.md` — 字符数限制、标题公式、固定机制、A/B 测试机制、常见错误。关于文案撰写的权威依据。
- `references/rsa-testing-lab.md` — 如何选择 RSA 测试指标、诊断广告组意图膨胀、决定是否固定，以及避免为了广告效力而忽视业务成果。
- `../manage/references/industry-benchmarks.md` — 行业 CTR/CVR 基准，用于合理性检查目标。
- `../manage/references/quality-score-framework.md` — 仅当提高 QS 是明确目标时使用。

## 业务背景 — 不可或缺的输入

每个文案决策都必须以业务背景为依据。首先读取 `{data_dir}/business-context.json` 和 `{data_dir}/personas/{accountId}.json`。

- 如果任一文件缺失或为空，请在撰写文案前建议使用 `/google-ads-audit`——忽视市场定位的通用文案只会浪费广告资源。完整的信息收集流程（网站抓取、架构、引导初始化）位于 `../audit/references/business-context.md`。
- 如果用户主动提供新信息（新服务、定位变更、季节性更新），请将其合并进来。

业务背景如何影响文案：服务对应不同的标题类别；地点信息适合生成本地化标题（并有助于提升 QS）；品牌调性决定语气和禁用词；差异化优势就是价值主张标题；竞争对手信息有助于强化定位（但不点名）；季节性因素决定采用紧迫感还是常青型表达；优惠信息用于生成时效性变体；文案必须与落地页内容保持一致（否则转化率会下降）。用户画像决定语言选择：在标题中使用他们自己的搜索词表达，在描述中呈现他们的痛点，并将其决策触发因素作为 CTA 的切入角度。

## 广告效力与实际效果

广告效力针对 Google 的多样性目标进行优化，而非你的转化率。优先级为：**转化率 > CTR > CPA > 广告效力。** 不要为了追求“优秀”而破坏高 CTR 广告的表现。但应将较低的广告效力视为有用的多样性信号——使用八个各不相同的标题，每个类别一个，描述库中不要重复。

## 文案素材来源

文案必须以已经产生转化的内容为依据。一次使用 `ads.gaqlParallel` 的 `runScript` 几乎可以覆盖任何文案任务——并行查询：

- `ad_group_ad` — 当前标题、描述、广告效力，以及每条广告的点击次数/CTR/转化次数（需要超越的基准）
- `keyword_view` — 哪些内容正在产生转化，以及哪些 QS 组成部分较弱
- `search_term_view` — 客户实际输入的短语（最佳的单一语言素材来源）
- `campaign` — 每个变体都必须超过的 CTR/CVR 基准

对于品牌范围的文案重写，应在一次处理中关联所有数据。对于单个广告组，应使用 `WHERE ad_group.id = …` 限定每个查询的范围。结合 `business-context.json` 中的季节性和关键词格局背景信息。

如果用户拥有 CRM 或潜在客户结果数据库，其中包含客户实际使用的语言，就从中挖掘素材——客户语言每次都胜过营销语言。

## 文案输出约定

每份提案都需要附带一份简短的决策记录，而不只是一组标题：

- 一个**概念 ID** 和一句话假设：`persona × motivation × angle`。
- 针对每一项佐证、优惠、评分、保证、价格或最高级表述，提供一份**声明台账**：注明确切来源（账户数据、业务背景、已批准的落地页或用户提供的证据），以及该声明是否获准用于广告。
- 提供完整的 RSA 素材，包括字符数和固定位置；进行测试时，还要提供一个明显不同的挑战者概念。

不要把模糊的请求变成捏造的佐证。如果某项声明很有吸引力但缺乏支持，请将其标记为 `needs_substantiation`，并编写一个不含该声明的替代版本。引用竞争对手、未经验证的评论网站或一般行业知识，并不代表该声明已获准用于广告。

## 竞争性文案规则

- **绝不**在广告文案中点名竞争对手（存在政策风险，而且是在免费帮对方提升品牌知名度）。
- 在没有可验证依据的情况下，**绝不**使用“最佳”/“#1”。Google 要求提供依据；商标团队会执行这一要求。
- **应当**使用竞争对手所不具备的具体功能（“当日服务”胜过“更好的服务”）、信任信号（“Google 评分 4.9★ · 500+ 条评价”）、保证、透明定价和具体地点信息。可验证的具体表述比最高级表述效果更好。

## RSA 机制

Google RSA：最多可包含 **15 个标题（最多 30 个字符）**和 **4 条描述（最多 90 个字符）**。哪怕只超出一个字符也会被拒绝。务必计算字符数。

`references/rsa-best-practices.md` 是标题公式、描述排序和固定位置策略的唯一权威来源。简明经验法则是：将一个“服务+地点”标题固定在位置 1，将一个 CTA 固定在位置 3，位置 2 不固定，以便 Google 测试价值主张/信任/差异化标题，并且固定的内容总数绝不要超过 3 个。

## A/B 测试——使用实验框架

当用户希望进行测试时，应使用 MCP 服务器的实验工具，而不是旧式的“并排部署两个已暂停广告”模式：

- **广告文案 A/B 测试**——`createAdVariationExperiment` 是用于广告层级变体测试的专用工具。它负责流量拆分、提升幅度比较和结果回读。
- **幅度更大的创意变化**（不同角度、不同目标用户画像、不同落地页目标地址）——使用 `createExperiment` + `addExperimentArms` + `scheduleExperiment`。使用 `listActiveExperiments` 和 `listExperimentAsyncErrors` 进行监控。使用 `endExperiment`、`graduateExperiment` 或 `promoteExperiment` 决定最终处理方式。
- **单个广告组、两个变体、不进行流量拆分**——对于低风险的文案迭代，仍然可以在同一广告组中使用先暂停后启用的成对广告，但这种方式背后没有统计引擎支持。当决策较为重要时，优先采用实验路径。

每个变体都必须测试一个**真正不同的角度**，而不是只替换措辞。“信任与专业能力”对比“速度与便利性”对比“价格与价值”才是真正的测试；“今天致电”对比“立即致电”只是噪声。

在撰写变体之前，如果请求中提到测试、固定、广告效力（Ad Strength）、低 CTR/CVR 或混合意图广告组，请阅读 `references/rsa-testing-lab.md`。该文档总结了一个通用规律：许多 RSA 问题实际上是广告组/查询主题问题。

上线前，记录一个主要指标、所有护栏指标（例如 CPA 或合格潜在客户率）、计划的最低曝光量或持续时间，以及决策规则。不要因为早期出现差距就不断查看数据并宣布胜出者：每个变体少于约 100 次点击通常还为时过早，即使 CVR 相差 2×，仍然需要足够的转化量，并检查近期是否发生过变更。实验框架自身提供的显著性信号是最可靠的依据——如有此类信号，应以其为准。

产生胜出者后：暂停落败变体，然后以胜出变体为基准继续迭代。永远不要停止测试。

## 操作原则

1. **业务背景不可或缺。** 没有 `business-context.json` / `personas` → 在撰写前建议使用 `/google-ads-audit`。
2. **部署前须确认。** 展示确切的文案、每项素材的字符数以及固定位置。获得确认后再推送。
3. **每次写入均可在 7 天内撤销**，方法是使用 `undoChange`（前提是此后该实体未被修改）。
4. **力求差异化，不要模仿。** 可以套用到任何竞争对手身上的通用文案，只会浪费广告位。
5. **出价/预算/关键字工作交由 `/google-ads` 处理**——此技能只负责撰写文案和开展创意实验。