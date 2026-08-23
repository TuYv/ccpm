---
name: google-ads-copy
description: Generate and A/B test Google Ads copy. Use when asked to write ad copy, headlines, descriptions, create ad variants, test ad messaging, improve CTR, or generate RSA (Responsive Search Ad) components. Trigger on "ad copy", "write ads", "headlines", "descriptions", "RSA", "responsive search ad", "ad text", "ad creative", "improve CTR", "ad A/B test", "ad variants", "write me an ad", "ad variation experiment", or when the user wants to improve click-through rate on existing ads.
argument-hint: "<ad group name, keyword theme, or 'write new ads'>"
---
# 广告文案生成器 + A/B 测试器

撰写 Google Ads RSA 文案，并运行结构化测试以找出表现最佳的信息表达方式。

## 设置

阅读并遵循 `../shared/preamble.md`（MCP 检测、账号选择）和 `../shared/analysis-principles.md`（证据要求、护栏）。两者始终适用。

## 参考资料

按需阅读：

- `references/rsa-best-practices.md` — 字符限制、标题公式、固定机制、A/B 测试机制、常见错误。关于文案撰写的权威依据。
- `references/rsa-testing-lab.md` — 如何选择 RSA 测试指标、诊断广告组意图膨胀、决定是否固定，以及避免为了广告效力而忽视业务成果。
- `../manage/references/industry-benchmarks.md` — 用于合理性检查目标的行业 CTR/CVR 基准。
- `../manage/references/quality-score-framework.md` — 仅在提升 QS 是明确目标时使用。

## 业务背景 — 不可或缺的输入

每项文案决策都必须以业务背景为依据。首先阅读 `{data_dir}/business-context.json` 和 `{data_dir}/personas/{accountId}.json`。

- 如果任一文件缺失或为空，请在撰写文案前建议运行 `/google-ads-audit` — 忽视市场定位的通用文案只会浪费广告资源。完整的信息采集流程（网站抓取、架构、引导初始化）位于 `../audit/references/business-context.md`。
- 如果用户主动提供新信息（新服务、定位变更、季节性更新），请将其合并进去。

业务背景如何影响文案：服务对应标题类别；地理位置值得使用本地化标题（还可能提升 QS）；品牌调性决定语气和禁用词；差异化优势就是价值主张标题；竞争对手有助于强化定位（但不要点名）；季节性决定采用紧迫感还是常青式表达；优惠信息用于生成时效性变体；文案必须与落地页内容相符（否则转化率会下降）。用户画像决定语言选择：在标题中使用他们自己的搜索词表达，在描述中体现他们的痛点，并将其决策触发因素作为 CTA 的切入角度。

## 广告效力与实际效果

广告效力针对 Google 的多样性目标进行优化，而不是针对你的转化率。优先级为：**转化率 > CTR > CPA > 广告效力。** 不要为了追求“极佳”而破坏高 CTR 广告。应将较低的广告效力视为有用的多样性信号 — 使用八个各不相同的标题，每个类别一个，并且描述素材库中不得有重复内容。

## 从哪些数据中提取文案素材

文案必须以已经能够带来转化的内容为依据。一次使用 `ads.gaqlParallel` 的 `runScript` 几乎可以覆盖任何文案任务 — 并行查询：

- `ad_group_ad` — 当前标题、描述、广告效力，以及各广告的点击次数/CTR/转化次数（需要超越的基准）
- `keyword_view` — 哪些内容正在带来转化，以及哪些 QS 组成部分表现较弱
- `search_term_view` — 客户实际输入的短语（最好的单一语言素材来源）
- `campaign` — 每个变体都必须超过的 CTR/CVR 基准

对于全品牌范围的重写，请在一次处理中关联所有数据。对于单个广告组，请使用 `WHERE ad_group.id = …` 限定每个查询的范围。结合 `business-context.json` 中的季节性和关键词格局背景。

如果用户拥有 CRM 或潜在客户结果数据库，其中包含客户实际使用的语言，就从中挖掘素材——客户语言始终胜过营销语言。

## 文案输出约定

每份提案都需要附带一份简短的决策记录，而不能只提供一组标题：

- 一个**概念 ID**和一句话假设：`persona × motivation × angle`。
- 针对每项证明、优惠、评分、保证、价格或最高级表述，提供一份**声明台账**：注明确切来源（账户数据、业务背景、已批准的落地页或用户提供的证据），以及是否获准用于广告。
- 提供完整的 RSA 素材，包括字符数和固定位置；进行测试时，还需提供一个明显不同的挑战者概念。

不要把模糊的请求变成捏造的证明。如果某项声明很有吸引力但缺乏支持，请将其标记为 `needs_substantiation`，并撰写一个不含该声明的替代版本。引用竞争对手、未经验证的评论网站或一般行业知识，并不意味着该声明已获准用于广告。

## 竞争性文案规则

- **绝不**在广告文案中点名竞争对手（既有政策风险，又免费帮对方提升品牌知名度）。
- 在没有可验证依据的情况下，**绝不**使用“最佳”/“第一”。Google 要求提供依据，商标团队也会强制执行。
- **应当**使用竞争对手所不具备的具体功能（“当日服务”优于“更好的服务”）、信任信号（“Google 评分 4.9★ · 500+ 条评价”）、保证、透明定价以及具体地点信息。可验证的具体表述比最高级表述效果更好。

## RSA 机制

Google RSA：最多可包含 **15 个标题（每个最多 30 个字符）**和 **4 条描述（每条最多 90 个字符）**。哪怕只超出一个字符也会被拒绝。务必计数。

`references/rsa-best-practices.md` 是标题公式、描述顺序和固定位置策略的权威依据。简明经验法则是：将一个“服务+地点”标题固定在位置 1，将一个 CTA 固定在位置 3，位置 2 不固定，让 Google 测试价值主张/信任/差异化标题，并且固定的内容总数绝不超过 3 个。

## A/B 测试——使用实验框架

当用户希望进行测试时，应使用 MCP 服务器的实验工具，而不是旧的“并排部署两个已暂停广告”模式：

- **广告文案 A/B 测试**——`createAdVariationExperiment` 是用于广告级变体测试的专用工具。它负责管理流量拆分、提升效果比较和结果回读。
- **更大幅度的创意调整**（不同角度、不同目标角色、不同落地页目标地址）——使用 `createExperiment` + `addExperimentArms` + `scheduleExperiment`。使用 `listActiveExperiments` 和 `listExperimentAsyncErrors` 进行监控。使用 `endExperiment`、`graduateExperiment` 或 `promoteExperiment` 决定最终处理方式。
- **单个广告组、两个变体、不拆分流量**——对于低风险的文案迭代，仍可在同一广告组中创建两个先暂停后启用的广告，但这种方式没有统计引擎支持。当相关决策较为重要时，应优先选择实验路径。

每个变体都必须测试一个**具有实质差异的角度**，而不能只是替换词语。“信任与专业能力”与“速度与便利性”与“价格与价值”才是真正的测试；“今日致电”与“立即致电”只是噪声。

在撰写变体之前，如果请求中提到测试、固定、广告效力低、CTR/CVR 低或广告组意图混杂，请阅读 `references/rsa-testing-lab.md`。其中总结了一个通用规律：许多 RSA 问题实际上是广告组/查询主题问题。

上线前，记录一个主要指标、所有护栏指标（例如 CPA 或合格潜在客户率）、计划的最低曝光量或持续时间，以及决策规则。不要因为早期出现差距就反复查看并宣布胜出者：每个变体少于约 100 次点击通常还为时过早，即使 CVR 存在 2 倍差距，仍需有足够的转化量，并检查近期是否发生了变更。实验框架自身提供的显著性信号是最可靠的依据——如果存在，应以其为准。

确定胜出者后：暂停落败变体，然后以胜出变体为基准继续迭代。永远不要停止测试。

## 操作原则

1. **业务背景不可或缺。** 缺少 `business-context.json` / `personas` → 建议先运行 `/google-ads-audit`，再撰写文案。
2. **部署前必须确认。** 展示确切文案、每项素材的字符数以及固定位置。获得确认后，再推送。
3. **所有写入操作均可在 7 天内撤销**，方法是使用 `undoChange`（前提是相应实体此后未被修改）。
4. **力求差异化，不要模仿。** 任何竞争对手都能使用的通用文案，只会浪费广告位。
5. **将出价 / 预算 / 关键字工作交给 `/google-ads`**——此技能仅用于撰写文案和运行创意实验。