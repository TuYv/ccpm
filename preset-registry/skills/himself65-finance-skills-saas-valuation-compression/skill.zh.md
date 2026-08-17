---
name: saas-valuation-compression
description: >
  Analyze SaaS company valuation compression between funding rounds. Use this skill
  whenever the user asks about: how much a SaaS company's valuation multiple changed
  between rounds, why the ARR multiple compressed or expanded, comparing a company's
  compression to macro benchmarks, or explaining what drove valuation changes for
  any VC-backed software company. Trigger on phrases like "valuation compression",
  "ARR multiple", "round-to-round valuation", "multiple change", or when
  the user asks to compare a company's funding rounds. Always use this skill for
  any multi-round SaaS valuation analysis — do not try to answer from memory alone.
---
# SaaS 估值倍数压缩分析器

## 此 Skill 的功能

针对给定的 SaaS 公司，研究其融资历史，并计算每轮融资时基于 ARR 的估值倍数。然后使用结构化框架解释估值倍数的压缩（或扩张），该框架涵盖宏观利率、增长轨迹、叙事转变和可比公司。

始终将输出呈现为内嵌可视化图表（使用 Visualizer 工具），并附上简洁的文字说明。不要只返回满篇数字。

---

## 分步工作流程

### 1. 通过 Web 搜索收集数据

搜索以下各项。尽可能并行执行搜索。

**对于目标公司：**
- `[company] funding rounds valuation ARR revenue`
- 针对每轮融资搜索 `[company] Series [X] raised valuation`
- 针对每轮融资日期搜索 `[company] annual recurring revenue ARR [year]`
- `[company] investors lead investor [round]`

**对于宏观背景：**
- `SaaS ARR valuation multiples [year] private market`
- 如果搜索结果不足，则使用下方已知的基准表作为备用数据。

**对于叙事背景：**
- `[company] AI customers product announcement [year]` — 是否存在 AI 叙事溢价？
- `[company] growth rate churn NRR [year]` — 基本面是否发生变化？

### 2. 构建数据模型

对于每轮融资，提取或估算：

| 字段 | 获取方式 |
|---|---|
| 融资轮次名称 | 直接从搜索结果中获取 |
| 日期 | 直接从搜索结果中获取 |
| 融资金额 | 直接从搜索结果中获取 |
| 投后估值 | 直接获取，或根据持股比例计算；如果无法获得，请注明为估算值 |
| 融资时的 ARR | 明确搜索；如果未找到，则根据客户数量 x ARPC 估算或进行插值 |
| ARR 倍数 | `valuation / ARR` |
| 领投方 | 直接获取 |

**ARR 估算启发式方法（未公开时）：**
- 种子轮/A 轮：ARR 通常为 $500K–$3M
- B 轮：通常为 $5M–$20M
- C 轮：通常为 $20M–$60M
- 如果可以获得相关数据，则使用客户数量 x 平均合同金额进行交叉验证

### 3. 计算压缩指标

对于每一对连续融资轮次（例如 B → C）：

```
multiple_compression_pct = (later_multiple - earlier_multiple) / earlier_multiple × 100
valuation_growth_pct = (later_val - earlier_val) / earlier_val × 100
arr_growth_pct = (later_arr - earlier_arr) / earlier_arr × 100
```

关键洞察：`valuation_growth = arr_growth + multiple_change`
如果 ARR 的增长速度快于倍数的压缩速度，绝对估值仍会上升。

### 4. 将压缩归因于具体原因

使用以下检查清单。对每项原因进行评级：主要原因 / 次要原因 / 不适用。

**宏观环境/利率环境**
- 较早一轮融资是否发生在 2020–2021 年的零利率政策泡沫期间？（带来约 2–5 倍的人为溢价）
- 较晚一轮融资是否发生在 2022–2023 年的加息期间？（挤出泡沫溢价）
- 较晚一轮融资是否发生在 2026 年 4 月的软件市场崩盘期间或之后？（上市 SaaS 公司较 52 周高点下跌 40–86%；由关税/贸易战驱动的抛售重创整个行业的估值倍数——即使是 Figma -87%、monday.com -80%、HubSpot -70%、ServiceNow -58% 这样的高增长公司也未能幸免）
- 参考：各时期 SaaS 私募市场估值倍数中位数：

| 时期 | 私募市场 ARR 倍数中位数（约值） | 背景 |
|---|---|---|
| 2019 | ~8–12x | 疫情前基准 |
| 2020 | ~12–18x | 零利率政策开启，倍数扩张 |
| 2021 Q1–Q3 峰值 | ~35–45x | 泡沫顶峰 |
| 2022 H2 | ~15–20x | 开始加息，首轮倍数收缩 |
| 2023 低谷 | ~8–12x | 利率见顶企稳，估值重置 |
| 2024 | ~12–18x | AI 叙事推动复苏，选择性重估 |
| 2025 H1 | ~16–22x | AI 驱动的复苏持续 |
| 2025 H2–2026 Q1 | ~10–16x | 关税冲击／贸易战引发的抛售开始 |
| **2026 Q2（4 月崩盘）** | **~6–10x** | **软件行业崩盘——板块普遍暴跌，上市 SaaS 公司较 52 周高点下跌 40–86%** |

*（以上为私募市场的粗略估算。上市 SaaS 公司的倍数低约 30–50%。2026 年 4 月的数据反映了急剧抛售的影响；私募市场估值通常滞后公开市场 1–2 个季度。）*

**增长减速**
- 两轮融资之间，ARR 同比增长率是否显著放缓？（最常见的原因）
- NRR／净收入留存率是否下降？

**叙事转变**
- 公司是否失去了某个重要的产品叙事（例如，PLG 论点失效、错失品类领导地位）？
- 是否出现了新的竞争对手，或现有头部企业迎头赶上？

**AI 溢价（正面或负面）**
- 公司的客户是否包括 AI 原生公司（OpenAI、Anthropic 等）？→ 溢价
- 公司是否以可信的方式转向 AI 叙事？→ 溢价
- 公司是否未能清晰阐述 AI 叙事？→ 相较同业折价
- 注意：在 2026 年 4 月的崩盘中，即使是强有力的 AI 叙事也未能保护估值倍数——尽管受益于 AI 利好，Snowflake（-53%）、Datadog（-46%）和 MongoDB（-48%）仍全部暴跌。在宏观因素驱动的抛售中，AI 溢价可能是必要条件，但并非充分条件。

**竞争／市场**
- 市场饱和信号（例如，Okta 对 WorkOS 形成压力、Auth0 的竞争）
- 客户集中度风险暴露

**投资者供需**
- 后续轮次的融资规模是否更小、筛选是否更严格？→ 价格约束
- 领投方是否变为不同层级的投资者（例如，一级成长基金与种子基金）？→ 可能表明信心更高或更低

### 5. 构建可视化

使用 Visualizer 工具呈现：

1. **指标卡片行**——各轮估值、各轮 ARR、各轮倍数、收缩百分比
2. **折线图**——公司 ARR 倍数随时间的变化，与 SaaS 市场宏观中位数对比
3. **柱状图**——估值增长与 ARR 增长及倍数变化对比（分解）
4. **对比柱状图**——公司倍数收缩幅度与 2–3 家可比公司（Vercel、Netlify、Fastly 或同板块公司）对比
5. **归因表**——以内嵌方式置于正文中（各因素标记为主要／次要／不适用）

请参阅设计指南：正面／增长使用青绿色，收缩／负面使用珊瑚色，宏观基准使用灰色，估值数据使用蓝色。全文遵循 CSS 变量系统。

### 6. 撰写文字摘要

结构如下：
1. **一句话结论**——例如：“倍数收缩了 36%，但 ARR 增长至 5 倍，因此绝对估值增长至 3.8 倍。”
2. **主要原因**——解释倍数收缩的首要因素
3. **叙事溢价／折价**——AI 叙事、品类领导地位或两者的缺失
4. **可比公司背景**——这家公司的倍数收缩与同业相比如何？
5. **未来影响**——需要满足哪些条件，下一轮融资时倍数才可能扩张？

---

## 输出格式

始终输出：
- 内联可视化（Visualizer 工具）——置于首位
- 文字摘要（5–8 句话）——紧随可视化之后
- 可选：如果必须估算 ARR，则标注数据置信度

---

## 已知基准与可比公司（预加载）

当搜索结果较少或需要制作对比图表时，使用以下内容作为背景参考。

| 公司 | 轮次对比 | 较早期倍数 | 较晚期倍数 | 压缩幅度 % | 主要原因 |
|---|---|---|---|---|---|
| Vercel | D → E（2021→2024） | ~140x | ~32x | -77% | ZIRP 退潮 + 增长减速 |
| WorkOS | B → C（2022→2026） | ~105x | ~67x | -36% | ZIRP 部分退潮；AI 叙事提供支撑 |
| Netlify | B → 停滞（2021→?） | ~90x | N/A | N/A | 无新一轮融资；缺乏 AI 叙事 |
| Fastly | 公开市场（2021 年峰值→2024） | ~35x 收入 | ~3x 收入 | -91% | 未转向 AI，增长减速 |
| Stripe | — | — | — | — | 私营公司；估计在 2021→2023 年间持平或受到压缩，并发生降价融资 |
| HashiCorp | 2024 年被 IBM 收购 | — | — | — | 收购时约为 8x ARR，而峰值约为 40x |

### 2026 年 4 月软件行业崩盘——上市 SaaS 公司跌幅

截至 2026 年 4 月 9 日，由关税/贸易战引发的大范围抛售重创了上市软件公司的估值。使用这些数据作为参考，判断私营公司估值倍数将在随后 1–2 个季度内如何滞后压缩。

| 股票代码 | 公司 | 较 52 周高点的变化 | 行业相关性 |
|---|---|---|---|
| FIG | Figma | -86.7% | 设计/开发工具——受创最严重 |
| MNDY | monday.com | -80.2% | 工作管理 SaaS |
| TEAM | Atlassian | -75.7% | 开发工具/协作 |
| HUBS | HubSpot | -69.9% | 营销/CRM SaaS |
| WIX | WIX | -65.1% | 网站构建工具 |
| GTLB | GitLab | -63.6% | DevOps |
| CVLT | Commvault | -61.7% | 数据保护 |
| WDAY | Workday | -59.1% | 人力资源/财务 SaaS |
| NOW | ServiceNow | -57.8% | 企业 IT 工作流 |
| INTU | Intuit | -56.0% | FinTech/中小企业 SaaS |
| SNOW | Snowflake | -52.8% | 数据云 |
| KVYO | Klaviyo | -52.9% | 营销自动化 |
| DOCU | DocuSign | -52.3% | 电子签名 |
| MDB | MongoDB | -47.9% | 数据库 |
| SAP | SAP | -47.6% | 企业 ERP |
| DDOG | Datadog | -45.7% | 可观测性 |
| APP | AppLovin | -47.6% | AdTech/移动端 |
| CRM | Salesforce | -42.5% | CRM 市场领导者 |
| ADBE | Adobe | -34.6% | 创意/文档 SaaS |
| ZM | Zoom | -13.9% | 视频/协作（估值已提前下调） |

*来源：@speculator_io，2026 年 4 月 9 日。所跟踪软件公司名称的平均跌幅：~50–55%。*

---

## 边界情况

- **降价融资**：估值倍数和绝对估值均有所下降。注明其对股权稀释的影响。
- **无公开 ARR**：使用客户数量 x 估算 ARPC，并标注为估算值及其 +/- 范围。
- **仅有单轮融资**：计算其相对于该日期行业中位数的倍数；无法进行压缩分析。对此作出说明。
- **尚未产生收入**：如适用，使用前瞻 ARR 或 GMV 倍数；注明所采用的计算基础不同。
- **人才收购 / 战略收购**：收购价格通常反映战略溢价或困境因素，而非纯粹的 ARR 倍数——对此进行标注。