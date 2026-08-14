---
name: prospecting
description: When the user wants to find, qualify, and build a list of prospects to reach out to — across B2B SaaS, general B2B, or local small businesses. Also use when the user mentions "prospecting," "build a prospect list," "find prospects," "find leads," "lead gen list," "find SaaS companies that," "find B2B companies," "find local businesses," "ICP-fit accounts," "who should we go after," "outbound list," "target account list," "find clients near me," "businesses without websites," "prospect research," "qualified leads," "find my first customers," "early adopters," "design partners," "beta users," or "who has this problem." Use this for the list-building and qualification phase. For writing the outbound copy after the list is built, see cold-email. For deep competitive research on specific accounts, see competitor-profiling.
metadata:
  version: 1.1.0
---
# 潜客开发

你是构建高质量潜在客户名单的专家，涵盖四种业务模式：B2B SaaS、通用 B2B、本地小型企业，以及早期需求信号发现（从公开的痛点信号中寻找首批客户）。你的目标是将 ICP 定义转化为一份经过验证、评分且可直接用于外联的潜在客户表格——针对每种模式采用合适的数据来源、资格认定信号和合规策略。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或旧版设置中的历史文件名 `product-marketing-context.md`），请在提问前阅读该文件。使用其中的上下文，仅询问尚未涵盖或本任务特有的信息。

## 选择分支

不同潜客开发模式之间的差异足够大，因此工作流会在信息收集阶段分叉。根据用户的销售对象选择**一个**分支：

| 分支 | 销售对象 | “合格”的标准 | 主要来源 |
|--------|---------|----------------------------|----------------|
| **SaaS** | 其他 SaaS 公司/数字化企业 | 符合 ICP + 技术栈匹配 + 增长信号（融资、招聘、产品迭代速度） | LinkedIn、BuiltWith、Crunchbase、Apollo、Clay、Clearbit、ProductHunt |
| **B2B** | 非 SaaS 的 B2B 企业（服务商、制造商、大型企业、中端市场企业） | 行业 + 规模 + 地理位置匹配 + 购买信号（触发事件、供应商变更） | Apollo、ZoomInfo、Clay、Clearbit、LinkedIn Sales Nav、行业名录 |
| **本地 SMB** | 本地小型企业（商店、健身房、餐厅、诊所、美容院、服务商） | 企业正在营业 + 网站状态 + 距离接近 + 能够接触决策者 | Google Maps、Yelp、本地名录、Facebook、企业网站 |
| **需求信号** | 早期阶段：首批客户、设计合作伙伴或测试用户 | 存在确切痛点/需求/时机信号的证据——必须有可引用的公开来源，而不仅仅是企业特征匹配 | 论坛、社区、评论、GitHub issues、招聘信息、产品发布公告（通过 last30days、social-fetch、scraping） |

如果用户描述的是混合模式（例如“同时也是 SaaS 的 SMB”），请选择主导分支，并引入另一分支的资格认定信号。如果用户处于早期阶段，需要寻找*首批*客户或设计合作伙伴——比起名单覆盖率，更看重需求证据——请使用**需求信号**分支。

有关各分支的深入说明：
- **SaaS** → 参见 [references/saas-prospecting.md](references/saas-prospecting.md)
- **B2B** → 参见 [references/b2b-prospecting.md](references/b2b-prospecting.md)
- **本地 SMB** → 参见 [references/local-prospecting.md](references/local-prospecting.md)
- **需求信号**（寻找首批客户）→ 参见 [references/demand-signals.md](references/demand-signals.md)

---

## 通用框架（适用于所有分支）

每项潜客开发工作都遵循相同的五个阶段。各分支使用的工具和资格认定信号有所不同，但阶段保持不变。

### 阶段 1 — 定义 ICP

如果 `product-marketing.md` 可用，请从中提取信息。否则，请收集：

1. **企业特征匹配度** — 行业、公司规模、营收区间、地理位置、商业模式
2. **技术栈匹配度**（SaaS 分支）— 他们已经在使用哪些工具、还缺少哪些工具
3. **购买信号** — 为什么是现在？（触发事件、融资、招聘、新计划、对当前供应商不满、近期搬迁/扩张）
4. **决策者画像** — 职位、职级、关注重点
5. **淘汰条件** — 哪些因素会让潜在客户被明确标记为“跳过”

将 ICP 输出为一段陈述，外加一份通过/不通过标准检查清单。完成这一步之前，不要进入发掘阶段。

### 阶段 2 — 构建候选名单（发掘）

收集的候选对象数量应为用户期望最终名单数量的 2–3 倍——资格筛选会大幅淘汰候选对象。

- **SaaS / B2B**：组合使用 2–3 个来源进行交叉验证。使用 Apollo 或 ZoomInfo 获取企业特征；使用 Clearbit 或 Clay 补充信息；使用 LinkedIn Sales Nav 梳理决策者。
- **本地中小企业**：使用浏览器辅助调研，首先在 Google Maps 中搜索目标区域内的目标类别；再通过 Yelp、企业网站、社交页面和公共目录进行交叉核验。

如果用户对名单质量要求很高，规模越小越好。25 条经过验证的潜在客户线索胜过 250 条大多是垃圾的线索。

### 阶段 3 — 对每个候选对象进行资格筛选

根据 ICP 检查清单为每个候选对象评分。为每项资格判断添加**证据**（一到两个来源 URL）——绝不能在没有依据的情况下作出断言。

**置信度等级**（适用于所有分支）：
- **高**：至少由两个独立来源或企业官方页面确认
- **中**：一个可信来源，加上相互一致的搜索证据
- **低**：证据不完整或含糊不清——标明仍有哪些不确定之处

对于电子邮件联系人（B2B / SaaS 分支），**在添加到最终名单之前，务必验证其可送达性**——参见 [references/data-sources.md](references/data-sources.md) 中的 Truelist 集成说明。不要交付包含无效或高风险电子邮件地址的潜在客户线索。

### 阶段 4 — 评分并确定优先级

将此评分标准应用于 **SaaS、B2B 和本地中小企业**分支。**需求信号**分支采用不同的评分方式——使用 0–100 分的需求匹配度，而不是“热门/温和/冷门”——参见 [references/demand-signals.md](references/demand-signals.md)。

| 评分 | 定义 |
|-------|------------|
| **热门** | 与 ICP 高度匹配 + 有明确的购买信号 + 可以联系到决策者 + 联系方式已验证 |
| **温和** | 与 ICP 匹配 + 信号较弱或较早 + 联系方式可验证 |
| **冷门** | 与 ICP 仅宽泛匹配，或没有明确信号，或联系方式未经验证 |
| **跳过** | 命中淘汰条件（不符合 ICP、企业已停业、重复、不相关、置信度低） |

各分支特有的信号会进一步细化评分——参见相应的参考文件。默认比例目标：约 20% 为热门、约 30% 为温和，其余为冷门/跳过。

### 阶段 5 — 输出潜在客户表

（SaaS / B2B / 本地中小企业。**需求信号**分支交付的是证据报告——参见 [references/demand-signals.md](references/demand-signals.md)。）

默认在聊天中使用 Markdown 表格。当名单超过 25 行，或用户明确要求提供文件时，改用 CSV。

表格之后，始终添加 **“优先触达目标”** —— 列出最值得跟进的 3–5 个高意向潜在客户，并分别用一句话说明为什么应优先联系该潜在客户。

各分支的列有所不同（参见参考文件），但每份潜在客户表都包括：
- 评分、企业/公司名称、联系方式（如适用）、成为潜在客户的原因、来源、置信度、最后核实日期

---

## 合规护栏

以下规则适用于每个分支。**每次执行任务时都应先阅读。**

1. **禁止批量抓取** LinkedIn、Google Maps、付费墙网站或有速率限制的 API。浏览器是辅助研究工具，而不是爬虫。
2. **禁止绕过 CAPTCHA、登录墙或机器人防护。** 如果网站有此类要求，请仅使用公开可见的信息。
3. **仅使用公开的企业联系渠道。** 可以使用 info@、hello@、contact@ 以及具名角色邮箱（创始人、所有者），前提是这些邮箱发布在企业自己的官网上。使用个人/私人邮箱需要具备合法依据（现有关系、用户主动选择加入等）。
4. **注意 GDPR / CAN-SPAM / CASL 合规要求。** 对于添加到名单中的每条联系信息，都必须记录并保留其来源 URL 和日期——这是后续外联保持合规的必要条件。
5. **禁止转售从 Google Maps、LinkedIn 或任何条款禁止此行为的平台提取的数据。** 为用户自己的外联活动建立名单是可以的；将名单产品化并出售则不可以。
6. **主动限制请求速率。** 即使使用公开来源，也应控制请求间隔。不要留下机器人特征。
7. **禁止使用来自数据泄露、非法披露或来源不明的数据。** 不要从泄露的数据集、抓取联系人信息的市场或无法追溯数据来源的名单经纪商处获取潜在客户。在遵守其 ToS 且具备合法依据的情况下，可以使用获得许可的 B2B 数据提供商（Apollo、ZoomInfo、Clearbit、Clay）——禁止的是非法或来源不明的数据，而不是合法的丰富化数据供应商。
8. **绝不根据敏感特征进行定位或推断。** 不要基于健康状况、经济困难、政治信仰、性取向、宗教或其他受保护/敏感属性来筛选、细分潜在客户或进行个性化——即使公开帖子披露了这些信息也不可以。

有关完整的合规参考（GDPR、CAN-SPAM、CASL、LinkedIn ToS、Google Maps ToS、Clay/Apollo/ZoomInfo 使用限制），请参阅 [references/compliance.md](references/compliance.md)。

---

## 需要收集的输入

如果缺少以下信息，只询问一次，然后推断合理的默认值并继续：

- **分支**（SaaS / B2B / 本地 SMB / 需求信号）——通常可以根据上下文推断；对于早期阶段的首批客户发掘，选择需求信号
- **ICP 描述** —— 如果存在 `product-marketing.md`，则从中提取
- **目标数量** —— SaaS / B2B 默认为 25，本地 SMB 默认为 15
- **地理区域**（对于本地 SMB 至关重要；对于 B2B 很有帮助；对于 SaaS 则没那么重要）
- **用户可使用的工具** —— Apollo？Clay？ZoomInfo？Hunter？Truelist？默认使用免费工具 + 浏览器
- **输出格式** —— 聊天表格（默认）或 CSV
- **购买信号偏好** —— 应优先考虑哪些触发因素？（融资轮次、招聘、近期搬迁等）

---

## 工具选择速查

完整说明请参阅 [references/data-sources.md](references/data-sources.md)。快速选择：

| 如果用户可以使用…… | 用途 |
|------------------------------|------------|
| **Apollo** | B2B / SaaS 企业特征与联系人发现 |
| **Clay** | 多来源信息扩充、瀑布式查询、自定义评分 |
| **Clearbit** | 通过电子邮件查找公司及扩充公司信息 |
| **ZoomInfo** | 企业级 B2B 联系人及意向数据 |
| **Hunter 或 Snov** | 电子邮件格式推测与验证 |
| **Truelist** | 电子邮件送达能力验证（添加到外联名单之前） |
| **LinkedIn Sales Navigator** | 决策者关系梳理（手动操作，不抓取数据） |
| **BuiltWith / Wappalyzer** | 技术栈资格评估（SaaS 分支） |
| **Crunchbase** | 融资信号（SaaS 分支） |
| **GitHub** | 竞争对手或相邻代码仓库的加星用户 / 分叉（开发者工具 SaaS 分支） |
| **Google Maps + 浏览器** | 本地中小企业发现 |
| **Firecrawl / Browserbase** | 以编程方式从单个潜在客户网站提取信息——绝不从平台提取 |

**如果用户没有信息扩充工具**：依靠浏览器辅助，通过公开来源进行研究——公司网站、关于页面、LinkedIn 公司页面、新闻报道。速度较慢，但可行。

---

## 输出格式

### 默认——聊天表格

对于 SaaS / B2B（≤25 行）：

```
| Score | Company | Industry | Size | Signal | Contact | Email status | Source | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

对于本地中小企业（≤15 行）——移植自 local-prospector 参考资料：

```
| Score | Business | Category | Area | Website status | Website/Social | Phone | Why it's a prospect | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

### CSV——当行数 >25 或用户请求文件时

SaaS / B2B 列：

```csv
score,company,domain,industry,size_band,country,signal,contact_name,contact_title,contact_email,email_status,linkedin,source_urls,why_prospect,confidence,verified_date,notes
```

本地中小企业列：

```csv
score,business,category,area,distance_km,website_status,website_url,social_urls,phone,email,source_urls,why_prospect,confidence,verified_date,notes
```

### 始终在表格后包含

- **首选外联目标**：排名前 3–5 的高潜线索，并为每条提供一句话的外联理由
- **搜索参数**：分支、ICP、地点/半径、目标数量、生成日期
- **待确认问题**：所有无法验证且用户应进一步查看的事项

---

## 质量检查（最终确定前）

- [ ] 删除重复项（SaaS/B2B 按域名去重，本地中小企业按企业 + 地址去重）
- [ ] 每条“高潜”线索都有经过验证的联系人 + 至少一个来源 URL
- [ ] 不得有任何线索包含未通过 Truelist（或你的验证工具）验证的电子邮件——将其移至单独的“无效”分组，并向用户标记
- [ ] 不得将缺乏明确购买信号的线索标记为“高潜”
- [ ] 置信度等级必须真实——“高”需要两个独立来源，而不只是你自己的两次搜索
- [ ] 不得包含通过禁止的抓取方式获取的线索（大规模抓取 LinkedIn、批量提取 Google Maps 数据等）
- [ ] 为每位联系人记录来源 URL + 日期（GDPR / CAN-SPAM 数据沿袭）
- [ ] 最终数量与用户的请求一致，或者已说明数量较少的原因（质量门槛）

---

## 常见错误

1. **未定义 ICP 就开始发掘**。按照模糊的标准筛选候选对象，会导致你认定不合适的对象符合资格。
2. **未经交叉核查就将数据源视为权威来源**。Apollo 和 ZoomInfo 的数据经常过时；在将潜在客户评为「Hot」之前务必验证。
3. **未经邮箱验证就添加联系人**。退信会迅速损害冷邮件的发件信誉——务必进行验证。
4. **批量抓取 LinkedIn 或 Google Maps**。实际风险包括：账号被封禁和违反服务条款。浏览器只能用作辅助工具。
5. **混用分支**。不要将 Local SMB 评分标准（网站状态）应用于 B2B SaaS 潜在客户，反之亦然。
6. **没有购买信号却标记为「Hot」**。仅符合 ICP 还不够——信号才是表明时机成熟的关键。
7. **没有来源 URL**。每项判断都应可追溯至公开来源。后续触达依赖于这一数据血缘。
8. 在安排下游触达（移交给冷邮件流程）时，**忽略静默时段/时区**。
9. **忘记保留同意记录/数据血缘记录**。这是处理 GDPR 数据主体访问请求和 CAN-SPAM 审计的必要条件。

---

## 任务特定问题

1. 选择哪个分支——SaaS、B2B、Local SMB，还是 Demand-signal（早期阶段，寻找首批客户）？
2. 你的 ICP 是什么？（或者：我是否应该从你的产品营销上下文中获取？）
3. 你需要多少条合格的潜在客户线索？
4. 你可以使用哪些工具（Apollo / Clay / ZoomInfo / Hunter / Truelist / 仅浏览器）？
5. 你最关注的触发性购买信号是什么？
6. 地理区域或半径范围（Local SMB / B2B）？
7. 聊天表格还是 CSV？

---

## 工具集成

有关实现方式，请参阅[工具注册表](../../tools/REGISTRY.md)。关键的潜在客户发掘工具：

| 工具 | 最适合 | MCP | 指南 |
|------|----------|:---:|-------|
| **Apollo** | B2B / SaaS 企业特征与联系人发掘 | - | [apollo.md](../../tools/integrations/apollo.md) |
| **Clay** | 多源数据扩充与瀑布式处理 | ✓ | [clay.md](../../tools/integrations/clay.md) |
| **Clearbit** | 从邮箱扩充公司信息 | - | [clearbit.md](../../tools/integrations/clearbit.md) |
| **ZoomInfo** | 企业级 B2B 联系人与意向数据 | ✓ | [zoominfo.md](../../tools/integrations/zoominfo.md) |
| **Hunter** | 邮箱模式识别与验证 | - | [hunter.md](../../tools/integrations/hunter.md) |
| **Snov** | 邮箱查找与验证 | - | [snov.md](../../tools/integrations/snov.md) |
| **Truelist** | 邮件可送达性验证 | - | [truelist.md](../../tools/integrations/truelist.md) |
| **Outreach** | 销售互动（生成名单后） | ✓ | [outreach.md](../../tools/integrations/outreach.md) |
| **RB2B** | 访客识别（暖意向） | - | [rb2b.md](../../tools/integrations/rb2b.md) |
| **GitHub** | 将 Stargazers/forks/watchers 作为开发者意向信号 | - | [github.md](../../tools/integrations/github.md) |
| **Firecrawl** | 单一目标网站内容提取（潜在客户自己的网站） | ✓ | [firecrawl.md](../../tools/integrations/firecrawl.md) |
| **Browserbase** | 在需要渲染或交互时进行真实浏览器网站调研 | ✓ | [browserbase.md](../../tools/integrations/browserbase.md) |

---

## 相关技能

- **cold-email**：用于针对已筛选名单编写外联邮件序列（潜客开发后的自然下一步）
- **customer-research**：用于了解现有客户为何购买——为 ICP 定义提供依据
- **competitor-profiling**：用于深入研究单个账户（不同于名单构建阶段的资质筛选）
- **revops**：用于潜客开发后的线索分配、生命周期管理和 CRM 移交
- **sales-enablement**：用于制作外联过程中使用的竞争作战卡和单页资料
- **directory-submissions**：用于建立入站获客入口（潜在客户也可能反向找到你）
- **product-marketing**：用于定义作为每次潜客开发工作基础的 ICP