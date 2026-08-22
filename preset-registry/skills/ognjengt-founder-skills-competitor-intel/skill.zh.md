---
name: competitor-intel
description: Analyzes competitors using web research to provide verified business metrics, actionable leverage strategies, and predicted next moves. Use when user needs competitive intelligence, competitor analysis, market positioning insights, or strategic leverage opportunities.
---
# 竞争对手情报

## 目的
通过研究全网真实信号，提供有数据支撑的竞争情报——不做假设，不编造数字。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"competitor-intel 已加载，请提供竞争对手名称及任何相关背景信息（网站、行业等）"

然后等待用户在下一条消息中提供其需求。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行阶段（跳过“已加载”消息）。

---

## 任务执行

当用户需求可用时（来自初始 $ARGUMENTS 或后续消息）：

### 1. 检查业务背景（可选）
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 阅读该文件，了解你公司的定位、优势和目标——这些信息将为杠杆策略提供依据。
- **如果不存在：** 继续分析，纯粹聚焦于竞争对手的弱点。

### 2. 提取输入
从用户需求中提取：
- 竞争对手名称（必需）
- 竞争对手网站（如有提供）
- 行业/垂直领域（如有提供）
- 特别关注的领域（如有提供）

### 3. 研究阶段——强制进行网络搜索
**此技能要求进行网络搜索。未进行搜索不得继续。**

在以下来源中执行网络搜索：

#### 业务指标研究
仅搜索经过验证的数据。查询模式：
- `"[Competitor]" revenue OR MRR OR ARR site:crunchbase.com`
- `"[Competitor]" funding raised valuation site:crunchbase.com`
- `"[Competitor]" employees headcount site:linkedin.com`
- `"[Competitor]" revenue growth OR metrics`
- `"[Competitor]" pricing customers`
- `"[Competitor]" CEO OR founder interview revenue`
- `"[Competitor]" Series A OR Series B OR funding`

#### 流量与 SEO 研究
搜索网站流量和搜索影响力信号：
- `"[Competitor]" site:similarweb.com`（流量估算、热门页面、流量来源）
- `"[Competitor]" site:ahrefs.com`（反向链接、域名评级、自然搜索关键词）
- `"[Competitor]" site:semrush.com`（流量、关键词排名、广告支出）
- `"[Competitor]" site:trends.google.com`（搜索热度随时间的变化）
- `[Competitor website domain] site:builtwith.com`（技术栈、使用的工具）

#### 技术与产品研究
搜索产品和开发信号：
- `"[Competitor]" site:github.com`（开源活动、技术栈、招聘信号）
- `[Competitor GitHub org]`（提交频率、贡献者、项目活跃度）
- `"[Competitor]" API OR integration OR developer`

#### 广告研究
搜索广告策略和支出信号：
- 在 Meta 广告资料库中搜索 [Competitor]：`https://www.facebook.com/ads/library/`
- `"[Competitor]" ads site:facebook.com/ads/library`
- `"[Competitor]" advertising spend OR ad budget`
- `"[Competitor]" marketing campaign`

#### 弱点与口碑研究
搜索投诉、问题和困境：
- `"[Competitor]" reviews site:g2.com`
- `"[Competitor]" reviews site:capterra.com`
- `"[Competitor]" reviews site:trustpilot.com`
- `"[Competitor]" complaints OR issues OR problems`
- `"[Competitor]" "doesn't work" OR "broken" OR "terrible"`
- `"[Competitor]" layoffs OR firing OR cuts`
- `"[Competitor]" lawsuit OR sued`

#### 信号研究（用于预测）
搜索招聘、产品和战略信号：
- `"[Competitor]" hiring site:linkedin.com`
- `"[Competitor]" job openings`
- `"[Competitor]" new feature OR launch OR release`
- `"[Competitor]" roadmap OR upcoming`
- `"[Competitor]" partnership OR integration`
- `"[Competitor]" site:twitter.com OR site:x.com`（创始人/公司发布的帖子）

### 4. 汇总经验证的指标
从研究结果中仅提取有来源佐证的数字：
- MRR/ARR（如有披露）
- 融资金额（总额及各轮次）
- 估值（如已知）
- 员工人数
- 客户数量
- 客户流失率（如有披露）
- 增长率（如有披露）
- 定价层级

**关键规则：**如果某项指标无法找到相应来源，请将其标记为“暂无公开信息”——不得估算或假设。

### 5. 识别可利用的机会
分析收集到的数据，找出 3 个可采取行动的薄弱点：

寻找以下方面的模式：
- **产品缺口**：用户抱怨的功能、缺失的集成
- **服务失误**：客服投诉、响应时间、缺陷
- **定价阻力**：用户对成本、隐藏费用、性价比低的抱怨
- **信任问题**：安全隐患、数据泄露、未兑现的承诺
- **运营困境**：裁员、领导层变动、融资困难
- **营销弱点**：广告执行不佳、定位薄弱、互动率低

针对每个弱点，制定一项你的公司可以执行的可行策略。

### 6. 预测下一步行动
根据所有信号，预测竞争对手接下来可能采取的行动：

需要解读的信号：
- **招聘模式**：招聘工程人员 = 推进产品，招聘销售人员 = 进入增长模式，招聘客服人员 = 规模扩张遇到问题
- **招聘信息**：揭示技术投入方向、市场扩张和新产品
- **融资状况**：近期完成融资 = 积极扩张，超过 2 年未融资 = 可能陷入困境
- **内容/公关**：他们重点宣传的主题表明其战略重点
- **合作公告**：揭示市场定位和缺口
- **创始人动态**：他们在哪里发言、发布什么内容、与谁会面

### 7. 设置输出格式
按照**输出格式**部分组织研究结果。

---

## 写作规则
硬性约束。不得自行解释。

### 核心规则
- 每项指标都必须包含来源链接，或标记为“暂无公开信息”
- 不得对指标进行估算、假设，也不得给出“可能”的数字
- 策略必须可执行（提供具体步骤，而非模糊建议）
- 预测必须引用支持该预测的信号
- 使用中立、分析性的语气，不得贬低竞争对手
- 为所有研究结果标注日期（数据时效性很重要）

### 来源规则
- 优先使用第一手来源（公司公告、创始人访谈、SEC 文件）
- Crunchbase、LinkedIn、G2、Capterra 是可接受的第二手来源
- 如果新闻报道引用了第一手来源，则可以使用
- 避免使用未经验证的 Twitter/X 言论，除非其来自公司官方账号

### 策略规则
- 每项策略都必须针对一个已经验证的弱点
- 每项策略都必须包含具体的后续步骤
- 策略应能在 30–90 天内实现
- 除非用户具备相应资金，否则应避免采用需要大量资本的策略

---

## 输出格式

```markdown
# Competitor Intel: [Competitor Name]
**Generated:** [Date]
**Sources searched:** [Count] sources across Crunchbase, LinkedIn, G2, Capterra, news, social

---

## 1. Verified Business Metrics

| Metric | Value | Source | Date |
|--------|-------|--------|------|
| Funding Raised | $X | [Source](url) | [Date] |
| Valuation | $X | [Source](url) | [Date] |
| Employee Count | X | [Source](url) | [Date] |
| MRR/ARR | Not publicly available | — | — |
| Customer Count | ~X | [Source](url) | [Date] |
| Churn Rate | Not publicly available | — | — |

**Key Observations:**
- [Insight about their financial health]
- [Insight about their growth trajectory]

---

## 2. Leverage Strategies

### Strategy 1: [Name]
**Weakness exploited:** [What you found]
**Evidence:** [Quote or data point with source]

**Action steps:**
1. [Specific action]
2. [Specific action]
3. [Specific action]

**Expected outcome:** [What this achieves]

---

### Strategy 2: [Name]
**Weakness exploited:** [What you found]
**Evidence:** [Quote or data point with source]

**Action steps:**
1. [Specific action]
2. [Specific action]
3. [Specific action]

**Expected outcome:** [What this achieves]

---

### Strategy 3: [Name]
**Weakness exploited:** [What you found]
**Evidence:** [Quote or data point with source]

**Action steps:**
1. [Specific action]
2. [Specific action]
3. [Specific action]

**Expected outcome:** [What this achieves]

---

## 3. Predicted Next Moves

### Prediction 1: [What they'll likely do]
**Confidence:** High/Medium/Low
**Supporting signals:**
- [Signal 1 with source]
- [Signal 2 with source]

**Implication for you:** [How to prepare/respond]

### Prediction 2: [What they'll likely do]
**Confidence:** High/Medium/Low
**Supporting signals:**
- [Signal 1 with source]
- [Signal 2 with source]

**Implication for you:** [How to prepare/respond]

---

## 4. Information Gaps
Metrics and data that could not be verified:
- [Item 1]
- [Item 2]

**Suggested next steps to fill gaps:**
- [How to find this information]
```

---

## 质量检查清单（自我验证）

在最终确定前，请验证以下所有事项：

### 调研检查
- [ ] 我进行了网络搜索（未仅依赖训练数据）
- [ ] 我搜索了 Crunchbase、LinkedIn、G2/Capterra 和新闻来源
- [ ] 我搜索了流量/SEO 来源（Similarweb、Ahrefs、Semrush、Google Trends）
- [ ] 我查看了 BuiltWith 以了解技术栈，并查看了 GitHub 以获取开发信号
- [ ] 我搜索了 Meta Ads Library 以了解广告活动
- [ ] 我同时搜索了正面和负面信号

### 指标检查
- [ ] 每项指标都有来源 URL，或被标记为 "Not publicly available"
- [ ] 没有估算或假设任何数字
- [ ] 包含日期，以反映数据时效性

### 策略检查
- [ ] 所有 3 项策略都利用了经验证的弱点（而非假设）
- [ ] 每项策略都有具体、可执行的步骤
- [ ] 策略对于初创公司而言切实可行

### 预测检查
- [ ] 每项预测都引用了具体信号
- [ ] 置信度等级如实标注（并非全部为 "High"）
- [ ] 影响应对措施具有可操作性

### 输出检查
- [ ] 输出与输出格式完全一致
- [ ] 语气具有分析性，而非煽动性
- [ ] 已说明信息缺口

**如果任何一项检查未通过 → 修改后再呈现。**

---

## 默认设置与假设

除非另有说明，否则使用以下设置：
- 假设用户是一位正在分析直接竞争对手的初创公司创始人
- 重点关注可付诸行动的情报（而非学术分析）
- 优先采用近期数据（过去 12 个月内）
- 预测的默认置信度：中等（除非存在强烈信号）
- 如果行业未知，则根据竞争对手的网站/市场定位进行推断

在输出中记录所做的任何假设。

---