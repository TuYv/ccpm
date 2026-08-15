---
name: intelligence-collection-disciplines
description: "Run competitive research like an intelligence agency: eight collection disciplines (OSINT to MASINT), signal-to-inference chains, and fusion. Use when one-source research isn't enough."
intent: >-
  Give product managers the intelligence community's collection playbook: eight independent disciplines,
  each with free and paid sources, signal-to-inference chains, and the PM artifact it feeds — then fuse
  them with confidence stacking so three weak signals become one strong conclusion.
type: component
theme: market-intelligence
best_for:
  - "Choosing which collection channels to run for a competitive or market question"
  - "Turning raw public signals (patents, job posts, filings, web diffs) into defensible inferences"
  - "Cross-validating a suspected competitor move across independent evidence channels"
scenarios:
  - "I think a competitor is building a platform play — how do I confirm it before their launch?"
  - "My TAM slide got shredded — where do I find data that survives scrutiny?"
estimated_time: "reference skill; a single-discipline pass takes 30-60 min"
---
# 情报收集门类

## 目的

别再像写学期论文一样做竞争研究。情报界几十年前就解决了这个问题：他们收集的不是“数据”，而是运用**情报收集门类**——彼此独立的渠道，每个渠道都有自己的信息源、专业方法和盲区——然后再将它们*融合*起来。本技能为产品经理提供了这套方法：八个门类，每个门类都会告诉你：(1) 收集什么，(2) 去哪里收集，(3) 应采用哪些信号 → 推断链，以及 (4) 它会为哪种产品经理交付物提供输入（TAM/SAM/SOM、ICP、用户画像、竞争作战卡、路线图押注、赢单/丢单分析、定位、定价）。一个信号只是轶事；来自三个独立门类且相互印证的信号才是情报。

## 输入

**在使用以下六个实例化变量时效果最佳**——只需填写一次，每个门类就都能针对具体任务进行定制。若将它们留空，则本技能仍会作为教学材料使用。

~~~
[TARGET]      = The competitor, partner, or acquirer you're researching
[MARKET]      = The category and its NAICS/SIC/NACE codes (or nearest equivalent)
[GEOGRAPHY]   = Regions in scope, at COUNTRY level, not continent level
[BUYER]       = Who signs the check (drives review sites, job titles, conferences)
[CAPABILITY]  = The strategic move you suspect (platform play, market entry,
                pricing shift, compliance land-grab, etc.)
[DECISION]    = What this research will change (roadmap bet, positioning,
                pricing, market entry, deal defense, ICP refresh)
~~~

**如果 [DECISION] 为空，请停止。没有决策目标的研究只是一种爱好。**

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或追加的 `ARGUMENTS:` 行——都视为已经填写的变量。直接使用，不要再次询问。

**空手而来也没关系。** 可以把这些门类当作一门专业方法课程来学习，也可以让智能体引导你逐一填写实例化变量块中的变量。

**调用示例：** `Use intelligence-collection-disciplines — [TARGET]: Meridian Freight Systems,
[CAPABILITY]: suspected move into warehouse robotics, [DECISION]: whether we accelerate our own
integration roadmap.`

## 核心概念

### 八大门类

| 门类 | 情报界名称 | 通俗解释 | 主要产品经理交付物 |
|---|---|---|---|
| 1. OSINT | 开源情报 | 新闻、社交媒体、期刊、分析师 | 竞争作战卡、定位 |
| 2. FININT | 金融情报 | 监管申报文件、财报电话会议、采购 | 竞争作战卡、SOM 获取率 |
| 3. GEOINT/DEMOINT | 地理空间与人口统计情报 | 人口普查、劳动力、贸易、经济统计数据 | TAM/SAM/SOM、ICP、用户画像 |
| 4. TECHINT | 技术情报 | 专利、技术栈数据、变更日志 | 路线图押注 |
| 5. HUMINT | 人力情报 | 人才流动、员工言论、赢单/丢单分析 | 路线图押注、竞争作战卡 |
| 6. SIGINT | 信号情报 | 网站差异、定价变更、招聘信息 | 竞争作战卡、定价策略 |
| 7. MASINT | 测量与特征情报 | 供应链、运营指标 | 威胁评估 |
| 8. 全源情报融合 | 不适用 | 交叉验证与置信度叠加 | 以上全部 |

- **独立性本身就是设计。** 这些调查领域之所以重要，是因为它们的失真方式各不相同：新闻
  稿可以撒谎，但海关记录、专利申请和三十条招聘信息来自三个彼此独立的
  官僚体系，而它们必须全都朝着同一个方向撒谎才行。
- **信号 → 推断链**是这门工作的专业方法：每个可观察信号都对应一种有边界的
  解读，并按照 `autonomous-investigation` 协议标注（事实 / 推断 / 假设）。
- **这不是什么：**间谍活动。以下每个来源都是已发布、已备案、已张贴或可公开
  观察到的。请参阅“常见陷阱”中的“护栏”。

## 应用

### 1. OSINT — 记者工作台

*一名优秀的专线记者在新闻稿发布前就已掌握的信息。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| [TARGET] 新闻与新闻中心 | 公司新闻中心页面、Google Alerts、PR Newswire 信息流 | Meltwater、Cision |
| 行业期刊 | [MARKET] 的行业出版物、协会简报、垂直领域 Substack | 分析师订阅服务 |
| 分析师报告 | Gartner/Forrester 新闻摘要、免费网络研讨会回放 | Gartner、Forrester、IDC 完整报告 |
| 社交媒体与社区 | LinkedIn 高管帖子、Reddit、Hacker News、X | Brandwatch、Sprout 舆情监听 |
| 评测网站 | 你的 [BUYER] 会阅读的平台：G2、Capterra、TrustRadius、应用商店、Trustpilot | G2 Buyer Intent 数据 |
| 会议足迹 | [MARKET] 活动中的会议主题、赞助级别、展位规模、演讲者名单 | n/a |
| 预测市场 | Polymarket、Kalshi、Metaculus、Manifold（对与 [MARKET] 相关的监管、审批和技术里程碑进行大众定价的概率预测） | n/a |

**信号 → 推断链：**

- [TARGET] 高管突然开始发布有关某个新问题领域的内容 → 即将进行定位转向（高管通常会在发布前 3-6 个月通过社交媒体测试传播信息）
- 在 [MARKET] 会议上的赞助级别跃升 → 进入市场或加大投入
- 评测中的抱怨集中在某项功能上 → 其路线图的压力点 = 你的竞争作战卡素材
- 分析师简报请求（可通过分析师的帖子观察到）→ 试图创建新品类
- 网络研讨会主题发生变化 → 他们正在向市场传授的内容，就是接下来准备销售的内容
- 某条产品线突然沉寂 → 正在逐步退市
- 预测市场对影响 [MARKET] 的某项监管规定或里程碑给出的概率发生变化 → 可用于情景规划的群体定价预期；应将其视为共识的领先指标，而非事实真相，并在相信该数字前检查流动性

**提供给：**竞争作战卡（根据评测挖掘结果处理异议）、定位（他们的措辞与客户措辞之间的差距）、赢单/丢单背景。

### 2. FININT — 法务会计师

*追踪资金流向。公司会在新闻稿中撒谎。但它们在申报文件中较少撒谎，因为在其中撒谎属于重罪。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| 公开申报文件 | SEC EDGAR（美国）、Companies House（英国）、BRIS 和 European e-Justice 公司搜索（欧盟）、[GEOGRAPHY] 的国家证券监管机构 | AlphaSense、Sentieo |
| 财报电话会议 | 公司投资者关系页面、Seeking Alpha 文字稿 | AlphaSense（跨电话会议搜索） |
| 私营公司信号 | Crunchbase 免费层级、公司注册记录、破产登记册、法律允许访问的受益所有权登记册 | PitchBook、CB Insights |
| 政府支出与采购 | USAspending.gov、SAM.gov（美国）、TED 和国家采购门户（欧盟）、国家级平台（中东和北非）、开发银行采购平台（World Bank、EBRD、AfDB、UNGM） | GovWin |
| 竞争与国家援助案件 | European Commission 并购/反垄断/国家援助数据库；国家竞争主管机关 | n/a |
| 国家与主权资本 | 主权财富基金报告、国有企业年度报告、PPP 项目储备 | n/a |

**信号 → 推断链：**

- **年度申报文件中的风险因素章节逐年发生变化** → 他们真正害怕的事情（因为他们必须披露）
- 分部报告重组 → 战略优先级调整；关注哪个分部的地位得到提升
- 财报电话会议问答中的回避（分析师提问，高管闪避）→ 薄弱点；在你的定位中深入攻击这一点
- 在 [GEOGRAPHY] 注册新实体或设立分支机构 → 在任何公告发布之前进入市场
- 递延收入趋势 → 实际销售动能与对外宣称的动能对比
- 并购申报文件 → 直接来自 [TARGET] 自家律师的市场定义和具名竞争对手
- 主权基金或国家援助资金支持 [TARGET] → 他们的资金续航测算已经改变；价格施压策略将不起作用
- 预先信息通知和意向征集 → 提前 3-24 个月释放的招标信号

**流向：** 作战卡（财务压力 = “他们会在季度末陷入绝境”策略）、SOM 获取
率（其收入 ÷ 宣称的客户数量 = 客单价真实性检查，并输入 GEOINT/DEMOINT
规模测算方法）、客户定位（采购授标模式）。

### 3. GEOINT/DEMOINT — 制图师

*关注地形图，而非部队动向。政府统计数据是大多数产品经理从未查看过的免费情报——
也是每一个经得起审视的 ICP、用户画像和 TAM 的基础。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| 美国市场结构 | 美国人口普查局（县级商业模式、经济普查、NAICS 机构数量）、BEA | IBISWorld、Statista、Grand View Research |
| 美国劳动力与买方 | BLS（职业数量、工资、行业就业情况）、FRED（制约预算的宏观环境） | TalentNeuron |
| 欧盟市场结构 | Eurostat、PRODCOM 制造业统计数据、各国统计机构、ECB 数据 | 各国数据经销商 |
| 欧盟贸易流 | Eurostat COMEXT、Access2Markets、TARIC（关税、配额、原产地规则） | Panjiva、S&P Global |
| MENA 区域 | GCC-Stat、Arab Development Portal、ESCWA、Arab Monetary Fund、SESRIC | 不适用 |
| MENA 国家 | GASTAT（沙特阿拉伯）、FCSC（阿联酋）、CAPMAS（埃及）、HCP（摩洛哥）及同类机构 | 不适用 |
| 全球交叉核验 | World Bank Data and Enterprise Surveys、IMF 国家报告、OECD.Stat、UN Comtrade、ITC Trade Map | 不适用 |

**信号 → 推断链：**

- 按行业代码和员工规模区间统计的机构数量 → 自下而上测算 TAM 的分母
- 区域行业集中度 → 你的 SOM 实际位于何处，以及现场销售团队应部署在哪里
- [BUYER] 相关职位的职业增长曲线 → 你的销售对象群体是在增长还是萎缩
- 买方职位的工资趋势 → 支付意愿上限的变化；验证定价区间
- 企业特征分布（规模区间、法律形式、行业）→ 基于数据而非感觉划定 ICP 边界
- [GEOGRAPHY] 各地区买方职位名称的普及程度 → 用户画像本地化；你在波士顿联系的“产品副总裁”，在法兰克福可能叫“数字化负责人”，在利雅得甚至可能不存在
- 特定产品代码的贸易流变化 → 在任何公告发布之前进入市场或转移供应链

**TAM/SAM/SOM 配方（本领域的招牌菜）：**

~~~
TAM: Establishment counts for [MARKET] (Census/NAICS, Eurostat/NACE,
     or national equivalent for [GEOGRAPHY])
     × employment/spend benchmarks (BLS, Eurostat, trade associations)
     (validate against two independent analyst reports; if they disagree by 3x, say so)

SAM: TAM filtered by your actual constraints: [GEOGRAPHY], segment, compliance
     requirements, tech prerequisites (see TECHINT technographics),
     local-content and vendor-registration eligibility where applicable

SOM: SAM × realistic capture rate derived from [TARGET] public filings via FININT
     (their revenue ÷ their claimed customer count = deal size reality check)
~~~

**产出：** TAM/SAM/SOM（核心支柱——参见 `tam-sam-som-calculator`）、ICP 定义、用户画像、信息本地化、市场进入优先级排序、定价区间验证。

### 4. TECHINT——专利审查员

*研发活动会在产品发布前 12-18 个月留下蛛丝马迹。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| 专利 | patents.google.com、USPTO Patent Center、EPO Espacenet、WIPO PatentScope | Clarivate、LexisNexis PatentSight+ |
| 技术特征数据 | BuiltWith 免费查询、Wappalyzer | HG Insights、BuiltWith Pro、6sense |
| 产品遥测数据 | 公开的变更日志、API 文档差异、状态页面、GitHub 组织活动 | 不适用 |
| 标准组织 | 任何管理 [MARKET] 的组织：IETF、W3C、ISO 委员会、CEN/CENELEC/ETSI 工作计划、行业联盟 | 不适用 |
| 受资助研究 | CORDIS 和 Horizon Europe 项目数据库、大学项目存储库 | 不适用 |
| 学术论文与预印本 | arXiv、Google Scholar、Semantic Scholar、SSRN，以及对 [MARKET] 至关重要的会议 | Dimensions、Scopus |
| 商标申请 | USPTO TESS、EUIPO、WIPO Global Brand Database | Corsearch |

**信号 → 推断链：**

- 专利**集群**（12 个月内在同一分类下提交 5 项以上申请）→ 对 [CAPABILITY] 的坚定押注，而非探索
- 发明人姓名在多项申请中反复出现 → 该计划背后真正的产品团队；跟踪他们的会议演讲和 LinkedIn
- 为一个听起来像产品的名称提交商标申请 → 将在 6-12 个月内发布（商标申请成本低；公司通常会在临近发布时提交）
- [TARGET] 反复出现在受资助的联盟中 → 这是其长期押注，提前期为 12-48 个月
- 研究试点地点 → 可能的首发客户，其名称会出现在公开交付成果中
- [TARGET] 主持标准委员会 → 他们意在塑造 [MARKET] 的规则，而不只是遵守规则
- [TARGET] 关联作者发布预印本 → 比专利提前 6-24 个月揭示研发方向；同一专业领域中出现论文集群和招聘激增，是目前最强的融合信号组合之一
- 作者单位在连续发表的论文中从大学变为 [TARGET] → 他们招募了整个实验室，而不只是采纳了创意
- API 文档为尚未发布的能力新增端点 → 测试计划正在进行中
- 潜在客户的技术栈（技术特征数据）→ 用于细化你的 SAM：谁实际上*有能力*购买你的产品

**输入：** 路线图押注（判断应在哪里加速、在哪里退让）、SAM 优化、作战卡（功能差距
倒计时）、自研/购买/合作决策。

### 5. HUMINT — 体育球探

*早在发布新闻稿之前，组织就已通过招聘网站公布其战略。人员动向会暴露真相。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| 招聘信息 | LinkedIn Jobs、[TARGET] 招聘页面、Indeed | JobsPikr、TalentNeuron、Revelio Labs |
| 员工情绪 | Glassdoor、Blind、[MARKET] 的 Reddit 社区 | 不适用 |
| 领导层变动 | LinkedIn 公告、新闻报道 | BoardEx、The Org |
| 赢单/输单 | 自有销售团队复盘、流失客户访谈 | Clozd、DoubleCheck |
| 会议走廊消息 | 一线团队在 [MARKET] 行业展会上的所见所闻 | 不适用 |

**信号 → 推断链：**

- 某一专业领域的招聘激增（一个季度发布 30 个以上职位）→ 正在构建 [CAPABILITY]，而不只是一个功能
- 在一个此前未见其涉足的 [GEOGRAPHY] 出现区域专家职位 → 扩张尚未官宣
- 招聘信息中点名特定技术 → 技术栈选择得到确认 → 可用于研判集成路线图的情报
- 战略发布后 6 个月内，高级产品/技术领导者离职 → 该战略遇到了麻烦
- 你方离职员工加入 [TARGET] → 应假定他们了解你的行动手册
- 员工评价中提到“转型”“重组”“领导层频繁变动”→ 两个季度的内部注意力分散 = 你的机会窗口
- 赢单/输单访谈：唯一能告诉你交易*为何*真正成交的信息源（其他一切都是推断）

**输入：** 路线图押注（对方的构建信号）、作战卡（利用组织不稳定性）、赢单/输单计划
（一切信息的事实依据）。

### 6. SIGINT — 你可以合法拥有的窃听器

*公司不断通过其在公共互联网上做出的变更来广播信息。大多数竞争对手从未倾听。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| 网站差异 | Wayback Machine、Visualping 免费套餐 | Visualping、Klue、Crayon（自动监控） |
| 定价页面 | 手动快照 + Wayback | Klue、Crayon、Kompyte |
| SEO/SEM 动向 | Google "site:" 查询、Semrush 免费查询 | Semrush、Ahrefs、SpyFu |
| 应用商店元数据 | 版本说明、截图变更、关键词变化 | Sensor Tower、data.ai |
| DNS/基础设施 | crt.sh（新 SSL 证书会暴露新子域名）、DNS 记录 | 不适用 |
| 网络研讨会/活动频率 | [TARGET] 活动页面、报名平台 | 不适用 |

**信号 → 推断链：**

- 新的子域名 SSL 证书（例如 `[capability].[target].com`）→ 正在筹备产品发布，通常会提前数周暴露
- 定价页面移除某个套餐层级 → 正在全面调整产品组合，通常意味着转向企业市场
- 突然开始针对*你的*品牌词进行 SEM 竞价 → 他们现在把你视为威胁（恭喜）
- 案例研究页面的模式发生变化（出现新的垂直行业或 [GEOGRAPHY]）→ 正在推进该细分市场
- 通过 Wayback 差异发现消息传达方式的 A/B 测试 → 他们对自身定位缺乏把握；攻击这个痛点

**输入：** 作战卡（最新鲜的一层——正是它让作战卡不会过时）、定价
策略、定位反制行动。

### 7. MASINT — 卫星照片

*衡量实体与运营活动的外溢痕迹。异常的资源配置从不说谎。*

| 来源类型 | 免费 | 付费 |
|---|---|---|
| 供应链 | 通过 ImportYeti（免费层级）获取的进出口记录、Eurostat COMEXT 与海关编码、UN Comtrade | S&P Global Supply Chain Intelligence、Panjiva、ImportGenius |
| 设施与项目 | 商业地产新闻、地方商业期刊、[GEOGRAPHY] 的许可证；工业园区租户公告、环境许可证、EPC 合同授予信息；卫星图像 | CoStar |
| 运营能力 | 支持响应时间抽样、状态页事故频率 | n/a |
| 认证与安全 | [MARKET] 要求的任何准入认证：ISO、SOC 2、FedRAMP、CE 标志；公告机构指定信息与安全召回（欧盟）；行业登记名录 | n/a |

**信号 → 推断链：**

- 关键投入品的数量变化达到 20% 以上 → 发布前准备或需求崩塌（通过 FININT 核实是哪一种）
- 出现新的供应商地域或原产国转移 → 进入市场、关税对冲或韧性布局
- 合规认证被列为“办理中” → 未来 12–36 个月内进入受监管细分市场的路径；任何查阅登记名录的人都能看到
- 产品召回或反复出现的安全警报模式 → 质量承压；可作为附有公开引证的竞争话术卡素材
- 设备采购之前出现土地划拨、电力/用水容量预留或工程设计合同 → 在任何发布公告之前 6–36 个月启动设施扩建
- 支持响应时间延长 + 支持岗位冻结招聘 → 现金受限或增长过快导致不堪重负（通过员工情绪加以区分）
- 办公场所整合 → 成本压缩；预计随后将采取激进定价

**注意：**供应链和设施信号对硬件及工业企业最为有效。软件领域的
对应信号是运营能力，以及招聘信息中与基础设施规模相关的措辞。

**用于：**威胁评估、发布预测与产能估算、竞争话术卡（针对产能承压的质疑：“问问他们最近的支持 SLA 表现如何”）。

### 8. 全源融合 — 战情室

*一个信号只是轶事。来自三个独立情报门类且相互关联的信号才是情报。*

应用 `autonomous-investigation` 协议中的**置信度叠加规则**：1 个门类 =
观察项；2 个 = 工作假设；3 个以上 = 可行动情报；不同门类相互冲突 = 有人在
虚张声势——深入调查。并且，在资金、采购、土地、许可证、招聘或合同提供佐证之前，应将公告视为意图：
**雄心会出现在 OSINT 中；承诺则会体现在 FININT、MASINT 和 HUMINT 中。**

**融合模板——侦测 [TARGET] 的 [CAPABILITY] 布局：**

| 情报门类 | 信号（填入你的发现） |
|---|---|
| MASINT | 资源/投入品异常：____ |
| TECHINT | 专利集群或代码仓库活动：____ |
| HUMINT | 招聘模式：____ |
| SIGINT | 基础设施或 Web 变化：____ |
| FININT | 申报文件措辞、采购授予信息或财报回避：____ |
| GEOINT/DEMOINT | 现实检验：他们将进入的市场，其实际规模是否足以支撑此举所暗示的布局？____ |

**融合结论：** ____ 个情报门类，一个故事 → 置信度 → 建议的应对措施。

**融合节奏：**

- **每周：** SIGINT 扫描（网站差异、定价、招聘信息）。30 分钟。
- **每月：** OSINT + HUMINT 摘要。评论挖掘、员工情绪、会议信息。
- **每季度：** FININT + TECHINT 深度审查。申报文件、专利、采购授标。
- **每年 + 每次 TAM 刷新时：** GEOINT/DEMOINT 审查。统计数据发布存在滞后；市场规模测算会缓慢失效，但确实会失效。
- **事件驱动：** MASINT 警报、重大申报文件、领导层离职。48 小时内响应。

### 将情报门类映射到 PM 产出物

| 产出物 | 主要情报门类 | 刷新节奏 |
|---|---|---|
| TAM/SAM/SOM | GEOINT/DEMOINT + FININT（市场获取率）+ TECHINT（技术构成数据） | 每年，以及事件驱动 |
| ICP 与用户画像 | GEOINT/DEMOINT + HUMINT（赢单/丢单的事实真相） | 每半年 |
| 信息传达与本地化 | GEOINT/DEMOINT + OSINT | 每半年 |
| 竞争作战卡 | SIGINT + OSINT + HUMINT（赢单/丢单） | 每周更新 SIGINT 层，每月重建 |
| 路线图押注 | TECHINT + HUMINT | 每季度 |
| 定位 | OSINT + FININT（财报措辞） | 每半年 |
| 定价策略 | SIGINT + FININT + GEOINT/DEMOINT（工资/WTP 区间） | 事件驱动 |
| 威胁评估 | 全源融合 | 每季度简报 + 事件驱动 |

### 区域说明

不同市场中的情报门类并不会改变；改变的是信息来源，以及证据要求。有两条经验具有普适性：在信息披露充分的体系（欧盟）中，挑战是在碎片化的信息环境中找到正确的记录——没有任何一个门户能够囊括全部信息。在公告密集型市场（中东和北非）中，挑战是区分国家层面的雄心与已获资金、已采购、已许可的承诺——而已宣布预算、已批准预算、已承诺融资、招标金额和已授予合同，是五个顶着同一标题的不同数字。使用当地语言进行搜索；绝不要假设英文门户包含每一则公告。

一份可复制粘贴的**收集计划**——包括实例化变量、情报门类选择表、节奏和融合表——位于 [`template.md`](template.md)。

## 示例

**融合填写示例（所有名称均为虚构）：** 你怀疑 [TARGET] = Meridian Freight Systems 正在构建一个仓储机器人平台。扫描发现：海关记录中的专业组件订单增加了 20%（**MASINT**，事实），某个机器人专利分类下新增 15 项申请（**TECHINT**，事实），一个季度内招聘了 30 多名平台工程师（**HUMINT**，事实），出现了新的 `robotics.meridianfreight.com` SSL 证书（**SIGINT**，事实），CFO 回避分析师提出的资本支出问题（**FININT**，推断），并且机构数量确认可服务细分市场足以支撑这笔投资的计算逻辑（**GEOINT/DEMOINT**，事实）。六个情报门类，一个故事：高置信度的平台威胁。应对措施：加快你自己的平台路线图，并在对方发布产品*之前*，而不是之后，为销售团队配备一份成熟度竞争作战卡。

**单一情报门类的快速收获：** 你的竞争作战卡声称某个竞争对手“财务实力雄厚”。一次 FININT 审查发现，其递延收入连续三个季度下降，而其声称的客户数量却有所增长——**推断：** 交易规模正在缩小。该作战卡因此新增了一个季度末折扣施压策略，并附上申报文件的 URL。

参见 [`examples/sample.md`](examples/sample.md)，其中提供了一份完整的集合计划示例（虚构）——
选用了四种情报学科，并有意识地跳过了三种；融合表逐步升级为可执行结论；还有一个 6 月出现的信号，在其他渠道提供佐证之前，被正确地*保留*为观察项。
[`examples/sample-industrial.md`](examples/sample-industrial.md) 展示了一份以 MASINT 为主角的计划——
海关、登记处、许可证——并将某项缺失作为事实纳入融合表。

## 常见陷阱

- **功能匹配式表演。** 目标绝不是“他们发布了 X，所以我们也发布 X”。信号用于为有关*结果*的
  决策提供信息——“这会改变下次投资时优先解决哪个客户问题。”
- **依赖单一学科形成确信。** 仅凭招聘激增只能列为观察项，不能成为战略简报。
  只有当相互独立的学科提供佐证时，才能提升置信度——这就是叠加规则。
- **夸大公告。** 围绕一份新闻稿重新规划路线图。雄心属于 OSINT；
  应等待资金、许可证或招聘等证据出现。
- **无来源的断言。** 没有来源和日期的作战卡断言，不过是戴着徽章的观点。
  为每项断言记录出处；在收集时归档源文件，因为门户网站会重构，文件也会被替换。
- **越过红线。** 使用托辞、索取受 NDA 保护的信息、专门雇用某人以套取其前雇主的机密、
  违反你已同意的条款进行抓取——这些行为一律禁止。
  本技能涉及的所有内容都已发布、备案、张贴或可公开观察。可用公开场合测试法判断：如果
  你不愿意在 [TARGET] 的用户大会上解释自己的方法，就不要使用它。
- **针对每个问题运行所有学科。** 构件映射表的意义在于，让你只运行能够为 [DECISION] 提供信息的两到
  三种学科，并采用与相关证据实际变化速度相匹配的节奏。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——用于
  标记并叠加这些学科所收集内容的协议
- [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md)（组件）——使用
  GEOINT/DEMOINT 规模估算方法
- [`company-research`](../company-research/SKILL.md) 和 [`company-intel`](../company-intel/SKILL.md)
  ——主要基于 OSINT + FININT + HUMINT 构建的单公司深度调查
- 运行这些学科的调查技能：`market-landscape-scan`、
  `competitive-research-snapshot`、`competitive-intel-watch`、`battle-card-builder`
- SCIP 道德准则——竞争情报行业的参考标准
- 区域来源叠加层（EU/MENA 配套内容；计划未来作为组件技能推出）
- 根据竞争情报和市场情报从业经验改编，并借鉴了
  开源情报实践。