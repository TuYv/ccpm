---
name: suede-instagram-growth
description: "Suede-owned Instagram growth operating system for account-specific audits, Reels, carousels, Stories, conversion mapping, calendars, and daily candidate-production loops. Use when the user names Instagram, IG, Reels, Stories, asks to analyze recent posts, grow a handle, run a daily workflow, create or repurpose Instagram content, or distinguish views from follows, leads, and sales. NOT FOR: multi-platform organic strategy (use suede-social), full video rendering or editing (use suede-video), paid Meta campaigns (use suede-ads or suede-ad-creative), analytics instrumentation (use suede-analytics), or any publish, comment, follow, like, or DM action without exact approval."
metadata:
  version: 1.0.0
---
# Suede Instagram 增长

将一个 Instagram 账户转变为一套有证据支持的内容与转化系统。每条建议都必须对应到账户当前的内容、受众、产品或服务、表达风格、制作能力，或明确标注的实验。不要提出泛泛的“坚持发帖”建议，也不要假装公开的观看次数能够反映私密的收藏、分享、留存、潜在客户或销售数据。

## 危险信号——先纠正这些问题

- **“永久锁定这些上下文。”** 为当前工作区或运行维护账户简报，附上来源日期，并刷新会变化的事实。绝不要声称拥有永久记忆。
- **“自动浏览最近 30 条帖子。”** 使用经过身份验证的 Instagram 界面、用户导出数据、经授权的 API，或用户提供的链接。Instagram 的条款禁止未经许可进行自动化收集；绝不要用未经授权的抓取来替代。
- **“这个内容火了，所以它能转化。”** 观看次数代表注意力。转化需要关注、个人主页操作、私信、潜在客户、可归因的结账记录或销售证据。
- **“使用 15 个主题标签和最佳发布时间。”** 主题标签数量、发布时间、格式和发布频率都是账户层面的测试。在提出建议前，先确认当前平台限制和账户的 Insights。
- **“运行每日工作流”意味着发布内容。** 它意味着刷新证据并准备好可供审批的候选内容。发布是一个单独的、经过授权的步骤。

## 运营契约

### 1. 提问前先读取现有上下文

如果存在，请读取 `.agents/product-marketing.md`、`.claude/product-marketing.md` 或旧版 `product-marketing-context.md`。同时读取用户提供的任何账户简报、内容台账、产品或服务清单、品牌指南、已批准的表达风格样例，以及近期表现导出数据。

构建或刷新以下**账户证据包**：

```text
Handle and visible identity:
Account type: personal | creator | business | unknown
Objective: awareness | qualified followers | leads | sales | community
Primary audience:
Offer, price, and conversion path:
Voice samples and source dates:
Faceless preference and available media:
Current cadence and production capacity:
Timezone and follower-active windows:
Recent-post evidence source and coverage:
Attribution source: none | Insights | links/UTMs | CRM | checkout | mixed
Claims or topics requiring review:
Last refreshed:
Unknowns that affect confidence:
```

从可访问的证据开始。只有在缺失的信息会实质性改变工作结果时，才一次性集中提出一组简洁的问题。绝不要询问当前文件、经过身份验证的账户或已提供数据中已经存在的信息。

### 2. 为每个事实标注证据类别

在审计和建议中使用以下标签：

- **公开观察到的：** 可见的帖子、说明文字、日期、格式、观看次数、点赞或评论。
- **自有数据观察到的：** 用户有权访问的、经过身份验证的 Insights、导出数据、私信记录、链接分析、CRM 或结账证据。
- **计算得出的：** 根据观察值计算出的公式；展示公式和分母。
- **推断的：** 有待测试的假设。绝不要将其表述为账户事实。
- **未知：** 所需指标不可用。说明哪些信息可以解决这一问题。

### 3. 对真正的阻塞使用 halt 合约

当授权证据、资产权利、身份或外部操作审批阻塞了所请求的结果时，请使用以下确切格式：

```text
HALT — <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

仅当安全草稿或工作表仍然有用，且不会暗示阻塞已被解决时，才继续提供这些内容。

## 首要操作：审计账号

当用户提供账号标识或要求分析账号时：

1. **验证身份和访问权限。** 确认可见的账号标识，以及证据是仅限公开信息还是经过身份验证的信息。不要连接第三方工具、索要密码，或将安装集成作为捷径。
2. **收集近期样本。** 默认使用最近 30 条 Feed 帖子和 Reels；如果少于 30 条，则使用所有可用帖子。仅通过标记来排除置顶内容、付费推广分发、联名内容或抽奖，不得静默排除。
3. **收集可比字段。** 使用 [references/account-audit.md](references/account-audit.md) 中的架构。为每个指标样本记录 `n`；绝不要把私有指标与仅限公开信息的帖子进行比较，并假设两者都完整。
4. **为内容编码。** 为每条帖子分配一个主题、支柱、钩子类别、格式、结构、CTA、受众问题、优惠接近度和制作负担。
5. **在账号内部进行标准化。** 比较相同格式和相似分发条件的内容。当样本支持时，使用中位数和四分位数；不支持时，展示原始计数。
6. **映射商业价值。** 根据以下规则，将每条帖子归类为 `converts`、`assists`、`attention-only` 或 `unknown`。
7. **输出行动手册。** 指明可重复的模式、无效负重、证据缺口，以及接下来 3–5 个受控测试。每条建议都必须引用其依据的帖子 ID 或样本。

### 转化分类

- **Converts：** 具有可归因的主要行动：高质量关注、DM 开始、潜在客户、结账或销售。记录归因来源。
- **Assists：** 产生可衡量的收藏、分享、主页访问、网站点击或高质量评论，但没有可靠归因的主要行动。
- **Attention-only：** 位于样本触达量/观看量的最高四分位，同时其主要行动率不高于可比格式的中位数。
- **Unknown：** 缺少下游指标，或归因不可靠。

绝不要凭直觉将 `unknown` 提升为 `attention-only` 或 `converts`。

## 选择所请求的模式

| 用户表述 | 执行内容 |
|---|---|
| “分析我的账号” | 30 帖子审计和转化映射 |
| “制作日历” | 排序后的 30 天或 60 天测试日历 |
| “创建一个 Reel” | 钩子集合、计时脚本、镜头计划、标题、CTA、测试卡 |
| “制作一个轮播” | 选定的叙事、每张幻灯片的确切文案、视觉方向、标题 |
| “重新利用这个内容” | 源内容拆解和平台原生的 Instagram 内容包 |
| “分析竞争对手” | 合法的可比账号模式和空白点审计 |
| “运行每日工作流” | 证据刷新和待审批的候选内容包 |

如果请求包含多种模式，请按依赖顺序运行：审计或上下文刷新、策略、资产创建、QA、审批包。

## 策略与规划

### 内容支柱

从以下各项的交集推导出 3–5 个起始支柱：

1. 受众的问题或愿望；
2. 账号的专业能力或可信获取渠道；
3. 已观察到的响应模式；
4. 产品/服务或战略目标；
5. 可重复的生产来源。

对于每个支柱，返回：

```text
Pillar:
Audience job:
Proof the account can own it:
Observed supporting posts:
Primary format hypothesis:
Business bridge:
Stop condition:
```

不要强行平均分配。根据近期证据和下一步学习目标，对支柱的分配进行排序。

### 日历

将日历构建为实验，而不是填充内容。每一行必须包含：

```text
Date/timezone | format | pillar | audience problem | hook | payoff | CTA
Evidence source | one variable being tested | primary metric | asset owner
Production status | approval status | readback field
```

使用能够保留证据、声音、权利和审核质量的最低发布频率。如果用户要求每日内容，可以每日生成候选内容；但除非有账号证据，否则不要声称每日发布是最优方案。

### 竞争对手与趋势研究

仅使用公开或获得授权的证据。根据受众、产品/服务、发展阶段、地理位置和形式选择 3–8 个可比账号；记录每个账号符合条件的原因。只有在另一个有界批次会改变当前主导模式时，才收集更多帖子。除非账号自行披露，否则公开的竞争对手研究无法看到收藏、分享、留存率、每帖带来的关注数、私信或销售数据。

对于趋势，仅当当前来源支持相应标签时，才将每项标记为 `rising`、`active`、`saturated` 或 `unverified`。记录来源、观察日期、权利状态、受众匹配度和生命周期。趋势是可选项；账号匹配度和来源权利优先于新颖性。

## 创意生成与筛选

仅在用户请求时，或日历周期需要相应数量时，生成 30–50 个创意。根据账号的实际模式构建创意：

- 错误和可避免的损失；
- 有证据支持的误区纠正；
- 具体的框架和检查清单；
- 账号能够捍卫的非主流观点；
- 前后对比演示；
- 受众异议和购买触发因素；
- 创始人或运营者的证据；
- 产品证明和客户成果；
- 以合法、原创方式处理的时效性趋势。

按照 0–20 分为每个创意评分：

| 标准 | 0–4 分规则 |
|---|---|
| 受众识别度 | 4 = 目标观看者读一遍就能识别出自己的问题 |
| 具体收益 | 4 = 一个具体且承诺明确的结果，不包含夸大的表述 |
| 证据强度 | 4 = 自有证明或可验证来源支持该创意 |
| 语气匹配度 | 4 = 至少符合两个已提供的语气标记 |
| 商业衔接 | 4 = 自然的下一步与既定目标相连 |

按总分排序，但要展示每个组成部分。不要将创意标记为“病毒式传播”。称其为测试候选项，并说明原因。

## 内容创建契约

阅读 [references/content-production.md](references/content-production.md) 以获取完整的格式模板。

### Reels

返回：

1. 当用户要求 hook factory 时返回 20 个 hook 候选；否则返回 5 个。
2. 一个选定的 hook，以及选择评分和证据。
3. 逐秒脚本：视觉画面、旁白、屏幕文字、剪辑节拍，以及每个节拍承担的留存任务。
4. 默认提供不露脸的镜头计划（如有要求）：屏幕录制、产品证明、获得授权的 B-roll、动态文字、手部/操作过程、图表或自有媒体。
5. 一段 caption、一个主要 CTA、alt-text/无障碍说明，以及关键词和 hashtag 测试——不要设定固定的 hashtag 数量。
6. 权利和声明检查清单。
7. 单变量测试卡片和发布后的回读字段。

根据创意和账号同类内容的留存情况选择时长。如果没有证据，将 15–45 秒标记为起始测试范围，而不是最佳时长。

### Carousels

在写作前先确定叙事类型：`problem-proof`、`mistake-fix`、
`framework`、`before-after`、`myth-evidence` 或 `demo-walkthrough`。根据必要节拍的数量确定幻灯片数量；只有当创意确实包含这么多节拍时，8–10 张才是起始范围。

规范的逐页框架库——包括每页的文案槽位和制作检查清单——由 `suede-social` 的 carousel-frameworks reference 维护。当需要逐页文案槽位时，阅读该 reference，而不是在此处另行设计竞争性的结构。

返回每张幻灯片的确切文字和视觉指导。第 1 张必须明确受众的矛盾点或收益。每张中间幻灯片只完成一个任务。最后一张总结通过前文获得的收益，并给出一个下一步行动。

### Captions and voiceover

- 第一行在截断前必须能够独立成立。
- 根据真实语音样本中的账号句长、词汇、幽默、标点和禁用词列表进行写作。
- 对于 AI voiceover，使用 `pause`、`emphasis`、`beat` 和发音标记；绝不要加入与品牌相矛盾的合成情绪。
- 只使用相关的 hashtags，并检查其当前可用性和含义。没有数据时，不要臆造“big/medium/niche”流量层级。
- 如果 `suede-deslop` 可用，使用它处理最终文案。

## Daily Workflow

阅读 [references/daily-loop.md](references/daily-loop.md)，然后执行：

1. 刷新账号证据、当前 offer、内容队列和昨日的回读。
2. 查看获授权的趋势和受众信号来源。
3. 为候选创意评分，并选出 1–3 个，覆盖不同的受众任务。
4. 完整制作 Reel、carousel、Story 或静态内容包。
5. 检查声明、身份、素材权利、披露信息、无障碍和 CTA。
6. 返回准确的审批包；暂不要发布。
7. 如果具体内容和可见身份均已获批准，只能通过当前获授权的渠道发布。
8. 回读已发布内容的 permalink、渲染后的媒体、文字、标签、CTA 目标地址和账号身份。记录 post ID 和测量检查点。

仅用于草稿的工作，其完成情况由内容包检查清单证明；获授权发布的工作，则由 live permalink 回读证明。准备好的 composer 并不等于已发布的帖子。

## 衡量与迭代

阅读 [references/measurement.md](references/measurement.md)。

使用活动目标选择一个主要指标和 2–4 个诊断指标。  
当存在分母时，明确计算比率：

```text
save rate = saves / accounts reached
share rate = shares / accounts reached
comment rate = comments / accounts reached
follow rate = follows attributed to post / accounts reached
profile-action rate = profile actions / accounts reached
lead rate = attributed leads / accounts reached
sales rate = attributed sales / accounts reached
```

不要将这些指标合并为通用的互动评分。将当前帖子与其特定内容格式的历史中位数以及指定的实验队列进行比较。只要实际可行，每次测试只改变一个有意义的变量。

## Suede 所有账户模式

当目标账户属于 Suede Labs AI、Jason Colapietro 或某个指定的 Suede 产品时：

- 将公开定位锚定在创作者所有权基础设施、可编程 IP、权利、来源证明、注册表支持的媒体、版税路由、许可准备度和代理商商务上。不要将 Suede 简化为通用的 AI 音乐应用。
- 基于实时产品演示、创作者教育、创始人/运营者证据、权利工作流、来源记录和代理商商务，构建以证据为导向的内容路径，而不是无依据的未来主义。
- 除非当前证据证明了确切状态，否则绝不要声称注册证明了法律所有权、防止复制、清除了所有权利、保证版税或完成了交易。
- 只能使用 `docs/assets/suede-ai-logo-transparent.png` 作为 Suede S 标记（SHA-256 `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`）。绝不要重新绘制、描摹、近似、排版生成、重新着色、扭曲或生成替代标记。如果文件缺失或校验和不同，则省略该标记并使用停止协议。
- 在纳入任何歌曲、片段、声音、肖像、截图、推荐语、合作伙伴标志和第三方帖子之前，确认其权利。

## 边界

- 未经对确切内容和可见身份的明确批准，不得发布、排期、评论、关注、点赞、转发、发送消息或修改 Instagram 账户。
- 不得抓取 Instagram、绕过访问控制、规避速率限制或在自动化中使用消费者密码。
- 不得虚构私有 Insights、受众情绪、竞争对手转化、趋势、推荐语、结果、稀缺性、合作关系、权利或产品声明。
- 不得生成骚扰、欺骗性的互动诱导、虚假争议、虚假社会证明、互动群组、购买的关注者或未披露的合成式背书。
- 不得使用受版权保护的音乐、影像、肖像、标志或转载的创作者内容，除非有经过验证的合法依据以及所需的署名或披露。
- 不得将草稿、已排期项目、编辑器预览或 API 容器 ID 视为已发布帖子。必须要求实时回读。

## 路由

- 对于跨平台自然增长策略以及超出 Instagram 范围的内容再利用，使用 `suede-social`。
- 在 Instagram 内容协议获批后，对于渲染、编辑、镜头制作和多剪辑视频流水线，使用 `suede-video`。
- 使用 `suede-image` 制作图像素材，使用 `suede-design` 制定视觉系统。
- 对于更广泛的转化文案，使用 `suede-copy`；对于最终的反废话检查，使用 `suede-deslop`。
- 当某个片段或长篇内容时刻必须衔接到 Article、newsletter 或 guide，而不是在信息流处结束时，使用 `suede-clip-to-guide`。
- 对于 UTM、事件埋点、归因修复和经过验证的报告流水线，使用 `suede-analytics`。
- 对于付费 Meta 活动，使用 `suede-ads` 和 `suede-ad-creative`。
- 从 `suede-social` 路由 Instagram 特定的账户审计、Reels、轮播、Stories 和每日 Instagram 循环到此处。