# AI 收益情报

## 前置步骤（Skill 启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：**此 Skill 会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在用户选择加入时启用。绝不会收集代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

AI 驱动的收益情报：销售通话洞察提取、内容到收益归因，以及多数据源客户报告。

## 何时使用

- 用户希望从 Gong 销售通话转录文本中提取洞察
- 用户需要识别通话中的异议、购买信号或竞品提及
- 用户希望通过将内容映射到已成交交易来证明内容投资回报率
- 用户需要基于首次触点和多触点模型进行收益归因
- 用户希望根据 GA4 + HubSpot + Ahrefs + Gong 生成统一的客户报告
- 用户询问买家旅程中的内容缺口
- 用户需要检测营销指标中的异常

## 工具

### Gong 洞察管道（`gong_insight_pipeline.py`）

从销售通话转录文本中提取结构化情报。支持 Gong API 或纯文本转录文件。

```bash
# Analyze a single transcript file
python gong_insight_pipeline.py --file transcript.txt

# Analyze multiple transcript files
python gong_insight_pipeline.py --dir ./transcripts/

# Pull recent calls from Gong API (last 7 days)
python gong_insight_pipeline.py --gong --days 7

# Pull specific call by ID
python gong_insight_pipeline.py --gong --call-id abc123

# Output as JSON file
python gong_insight_pipeline.py --file transcript.txt --output insights.json

# Generate content topics from recurring objections
python gong_insight_pipeline.py --dir ./transcripts/ --content-topics

# Generate follow-up suggestions for outbound sequences
python gong_insight_pipeline.py --file transcript.txt --follow-ups
```

**提取内容：**
- 异议（分类：定价、时机、竞争、权限、需求）
- 购买信号（预算已确认、提及时间表、决策者已参与、已确定内部支持者）
- 竞品提及（提及了谁、上下文：正面/负面/中立）
- 定价讨论（价格锚点、抵触意见、购买意愿指标）
- 根据反复出现的异议模式提出内容主题建议
- 根据通话上下文生成个性化跟进草稿

**输出：**将结构化 JSON 输出到标准输出或文件。每次通话都会生成一个 `insights` 对象，其中包含 `objections`、`buying_signals`、`competitive_mentions`、`pricing_discussions`、`content_topics` 和 `follow_ups` 数组。

### 收益归因映射器（`revenue_attribution.py`）

将内容映射到销售管道和已成交收益。使用首次触点和多触点归因证明内容投资回报率。

```bash
# Run full attribution report (GA4 + HubSpot)
python revenue_attribution.py --report

# First-touch attribution only
python revenue_attribution.py --report --model first-touch

# Multi-touch (linear) attribution
python revenue_attribution.py --report --model linear

# Time-decay attribution
python revenue_attribution.py --report --model time-decay

# Filter by date range
python revenue_attribution.py --report --start 2025-01-01 --end 2025-03-31

# Calculate cost-per-acquisition by content type
python revenue_attribution.py --cpa --costs content_costs.json

# Identify content gaps in the buyer journey
python revenue_attribution.py --gaps

# Output as JSON
python revenue_attribution.py --report --json --output attribution.json
```

**生成内容：**
- 内容到收入的映射（哪些博客文章、视频、播客促成了交易）
- 首次触点、线性和时间衰减归因模型
- 按内容类型划分的获客成本（博客、视频、播客、网络研讨会）
- 包含单篇内容收入的内容 ROI 报告
- 内容缺口分析（没有归因的漏斗阶段）
- 按归因收入排名的高绩效内容

**数据源：** GA4（页面路径、会话、转化）+ HubSpot（交易、触点、成交日期）

### 多数据源客户报告生成器（`client_report_generator.py`）

基于 GA4、HubSpot、Ahrefs 和 Gong 生成统一的客户就绪型 BI 报告。

```bash
# Generate full client report
python client_report_generator.py --client "Acme Corp"

# Specify date range
python client_report_generator.py --client "Acme Corp" --start 2025-03-01 --end 2025-03-31

# Output as markdown
python client_report_generator.py --client "Acme Corp" --format markdown --output report.md

# Output as JSON (for rendering in slides/dashboards)
python client_report_generator.py --client "Acme Corp" --format json --output report.json

# Skip specific data sources
python client_report_generator.py --client "Acme Corp" --skip gong
python client_report_generator.py --client "Acme Corp" --skip ahrefs,gong

# Enable anomaly detection
python client_report_generator.py --client "Acme Corp" --anomalies

# Compare to previous period
python client_report_generator.py --client "Acme Corp" --compare previous-month
```

**生成内容：**
- 包含关键指标和环比变化的执行摘要
- 流量部分：会话数、用户数、热门页面、渠道明细（GA4）
- 销售管道部分：新建、推进和已成交的交易及收入（HubSpot）
- SEO 部分：关键词排名、反向链接、域名评级变化（Ahrefs）
- 通话质量部分：交谈占比、异议频率、赢单率（Gong）
- 异常标记：附带严重程度和背景信息的异常激增或骤降
- 以结构化 Markdown 或 JSON 格式输出

## 配置

所有脚本都从环境变量中读取配置。将 `.env.example` 复制为 `.env`，并填写相应的值。

### 必需的环境变量

| 变量 | 使用方 | 描述 |
|----------|---------|-------------|
| `GONG_API_KEY` | Gong 销售管道、客户报告 | Gong API 访问密钥 |
| `GONG_API_BASE_URL` | Gong 销售管道、客户报告 | Gong API 基础 URL |
| `HUBSPOT_API_KEY` | 归因、客户报告 | HubSpot 私有应用令牌 |
| `GA4_PROPERTY_ID` | 归因、客户报告 | GA4 媒体资源 ID |
| `GA4_CREDENTIALS_JSON` | 归因、客户报告 | GA4 服务账号 JSON 的路径 |

### 可选的环境变量

| 变量 | 使用方 | 描述 |
|----------|---------|-------------|
| `AHREFS_TOKEN` | 客户报告 | Ahrefs API 令牌 |
| `OUTPUT_DIR` | 全部 | 输出文件目录（默认值：`./output`） |

## 数据流

```
Gong Transcripts → Insight Pipeline → Objections, Signals, Competitors → Content Topics + Follow-ups
GA4 + HubSpot   → Attribution Mapper → Content ROI, CPA, Gap Analysis → Revenue Proof
GA4 + HubSpot + Ahrefs + Gong → Client Report → Executive Summary + Anomalies → Client Deliverable
```

## 推荐工作流

1. **每周：** 运行 `gong_insight_pipeline.py --gong --days 7` 以提取通话洞察
2. **每月：** 运行 `revenue_attribution.py --report` 以证明内容投资回报率
3. **每月：** 针对每项客户交付成果运行 `client_report_generator.py`
4. **每季度：** 运行 `revenue_attribution.py --gaps` 以发现内容缺口
5. **持续进行：** 将 Gong 洞察的后续跟进纳入外联序列

## 收益分析反馈闭环

任何会改变外联、销售话术、路由、内容投入或客户报告的建议，都应进行效果回溯。

提出建议前：
- 定义基准窗口和候选窗口。
- 从 HubSpot、Gong、GA4、Ahrefs 以及任何可用的外联平台提取源数据。
- 在查看结果之前确定主要指标，否则分析就会沦为 KPI 大杂烩。

变更后：
1. 提取效果回溯日期之后的分析数据。
2. 比较基准窗口与候选窗口。
3. 区分负责人/参与者效应、名单质量、营销活动变更、季节性因素和归因缺口。
4. 推广、继续测试、回滚或标记为未经证实。

常见主要指标：
- 正向回复率
- 预约会议率
- 合格商机推进情况
- 新增销售管道
- 线索响应速度
- 内容辅助收益
- 转化率
- 异议频率降低幅度

每个获准推广的策略手册补丁都应包括所做的变更、源系统、基准窗口、候选窗口、胜出指标、注意事项和回滚规则。

## 依赖项

```bash
pip install -r requirements.txt
```