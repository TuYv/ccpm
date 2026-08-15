---
name: closed-loop-analytics-upgrade
description: Upgrade marketing, content, SEO/AEO/GEO, and revenue skills so changes are judged by platform analytics instead of vibes. Use when applying closed-loop learning to X, YouTube, SEO, AEO/GEO, outbound, paid creative, or revenue workflows.
---
# 闭环分析升级

## 原则

只有检查变更是否有效，并根据证据更新行动手册，工作流才算形成闭环。

对于营销技能，这意味着在变更观察窗口结束后提取分析数据。人工判断很有价值，但平台数据才是最终依据。

## 核心模式

1. **输入**：使用日志、建议、已发布的变更、平台分析数据、负责人反馈，以及成本/运行时数据。
2. **AI 操作**：对比基线方案与候选方案，找出可复现的信号，并提出技能/行动手册补丁。
3. **输出**：针对提示词、技能、连接器、简报模板、评分标准或下一步行动规则的候选补丁。
4. **判断**：成功率、速度、成本、质量、人工修正率，以及实际绩效变化。
5. **自我改进**：仅当候选方案优于基线方案时才予以推广。否则继续测试、回滚，或标记为尚未验证。

## 按渠道划分的分析指标

### X/Twitter
跟踪：
- 展示次数
- 互动率
- 回复数
- 转发数
- 收藏数
- 个人资料点击次数
- 粉丝数变化
- 帖子长度
- 钩子风格
- 佐证数字
- CTA 类型
- 主题分类

用于：
- 标题/钩子公式
- 长文结构
- CTA 模式
- 发帖时机
- 主题评分

### YouTube
跟踪：
- 展示次数
- CTR
- 平均观看时长
- 留存曲线
- 观看时长
- 新增订阅者数
- 评论数
- 流量来源
- 标题/缩略图/钩子元数据
- 视频长度和主题分类

用于：
- 标题公式
- 缩略图规则
- 前 15 秒钩子
- 留存节奏点
- 章节结构
- Shorts 精简版
- 内容再利用指南

### SEO/AEO/GEO
跟踪：
- GSC 点击次数、展示次数、CTR、平均排名、查询/页面组合
- GA4 会话数、互动会话数、转化数、辅助获客数
- Ahrefs 排名、反向链接、流量估算、关键词变动
- ClickFlow 机会
- AI 搜索/答案引擎可见度（如可用）
- CMS/页面变更日志

用于：
- 内容更新模式
- AEO/GEO 机会评分
- 查询/页面优先级排序
- 内部链接和结构化数据建议
- 回滚决策

### 收入/外联
跟踪：
- HubSpot 负责人、潜在客户、交易和销售管道进展
- Gong 通话用语、异议、购买信号和结果
- Instantly/Smartlead 正面回复、已预约会议、退订和垃圾邮件风险
- Metricool/LinkedIn 帖子表现
- GA4/HubSpot 归因

用于：
- 外联序列补丁
- 报价角度评分
- 销售跟进话术
- 从内容到销售管道的投资决策

## 必填回读字段

每项获推广的变更都需要包含：

- 所做的变更
- 负责人
- 基线观察窗口
- 候选方案观察窗口
- 已提取数据的源系统
- 主要指标
- 次要指标
- 指标胜出方
- 注意事项/混杂因素
- 决策：推广 / 继续测试 / 回滚 / 尚未验证
- 下一个补丁
- 下次回读日期

## 推广规则

在以下情况下推广：
- 候选方案在主要指标上优于基线方案，或者
- 候选方案揭示了可复现的受众/客户信号，并且
- 负面指标没有显著恶化。

在以下情况下不要推广：
- 数据量过低
- 归因过于混乱
- 结果可由季节性因素或无关营销活动解释
- 连接器发生故障
- 只有作者本人喜欢它

最后一条很严苛，但在理念上很重要。

## 安全边界

只读式分析数据拉取没有问题。对外部系统的写入仍需获得批准：

- 在 X/LinkedIn/YouTube 上发布内容
- 发布或编辑 CMS 内容
- 更改广告账户、出价、预算、定向或创意素材
- 修改 CRM/外联工具
- 发送电子邮件或私信
- 更改凭据或生产系统

## 输出模板

```markdown
# Readback: <skill/change>

## Verdict
Promote / keep testing / rollback / unproven

## Change tested
<what changed>

## Data pulled
| Source | Window | Status |
|---|---|---|

## Baseline vs candidate
| Metric | Baseline | Candidate | Delta | Interpretation |
|---|---:|---:|---:|---|

## Caveats
<confounders and missing data>

## Patch
<what changes in the skill/playbook>

## Next readback
<date + metric>
```