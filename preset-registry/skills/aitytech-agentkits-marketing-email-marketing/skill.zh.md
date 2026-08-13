---
name: email-marketing
version: "1.0.0"
brand: AgentKits Marketing by AityTech
category: core
difficulty: intermediate
description: Email campaign strategy, automation, and optimization. Use when creating email sequences, improving deliverability, designing automation workflows, or optimizing email performance.
triggers:
  - email marketing
  - email campaign
  - newsletter
  - deliverability
  - open rate
  - click rate
  - email automation
  - email list
prerequisites:
  - copywriting
related_skills:
  - email-sequence
  - copywriting
  - analytics-attribution
agents:
  - email-wizard
  - copywriter
mcp_integrations:
  optional:
    - hubspot
success_metrics:
  - open_rate
  - click_rate
  - conversion_rate
  - unsubscribe_rate
---
# 电子邮件营销

用于提升互动与转化的电子邮件营销活动策略、自动化和优化。

## 语言与质量标准

**关键要求**：使用与用户相同的语言回复。如果用户使用越南语，则用越南语回复。如果用户使用西班牙语，则用西班牙语回复。

**标准**：提高 token 效率，可牺牲语法以保持简洁，并在末尾列出尚未解决的问题。

---

## 何时使用此技能

在以下情况中运用电子邮件营销专业知识：
- 创建电子邮件序列和自动化流程
- 提高送达率和收件箱投递率
- 优化打开率和点击率
- 设计生命周期电子邮件工作流
- 对受众进行细分以实现个性化
- 对电子邮件元素进行 A/B 测试

## 核心概念

### 电子邮件类型与发送时机

| 类型 | 目的 | 时机 | 频率 |
|------|---------|--------|-----------|
| 欢迎邮件 | 引导新订阅者完成初始设置 | 立即（<5 分钟） | 一次 |
| 培育邮件 | 随时间推移建立信任 | 滴灌式序列 | 每周 1-2 次 |
| 促销邮件 | 推动销售或注册 | 基于营销活动 | 每月 1-4 次 |
| 事务邮件 | 确认操作 | 触发式 | 按需 |
| 再互动邮件 | 重新吸引不活跃用户 | 不活跃 30-90 天后 | 每个周期一次 |

### 电子邮件绩效基准

| 指标 | 可接受 | 良好 | 优秀 |
|--------|------------|------|-----------|
| 打开率 | 15-20% | 20-25% | 25%+ |
| 点击率 | 1-2% | 2-5% | 5%+ |
| 点击打开比 | 10-15% | 15-20% | 20%+ |
| 退订率 | <1% | <0.5% | <0.2% |
| 退信率 | <5% | <2% | <0.5% |
| 垃圾邮件投诉率 | <0.1% | <0.05% | <0.01% |

### 电子邮件结构

```
From: [Name] from [Brand] <email@domain.com>
Subject: [Hook + Benefit] (50 chars optimal)
Preview: [Extends subject curiosity] (90-100 chars)

[Personalized greeting]
[Hook - address pain/desire in first line]
[Value delivery - main content]
[Social proof - testimonial/stat - optional]
[Single CTA button - clear action]
[P.S. - additional hook or urgency]

[Signature with human touch]
```

### 主题行公式

| 公式 | 示例 | 最适合 |
|---------|---------|----------|
| 问题式 | “还在为[痛点]苦恼吗？” | 互动 |
| 操作指南式 | “如何在[时间]内[达成结果]” | 教育 |
| 好奇式 | “[受众]在[主题]上遗忘的[X]件事” | 提高打开率 |
| 社会认同式 | “[客户]如何获得[结果]” | 转化 |
| 紧迫式 | “仅剩[X]小时：[优惠]” | 促销 |
| 个性化式 | “{{first_name}}，问个小问题” | 获取回复 |

### 序列框架

**欢迎序列（7 天，5 封电子邮件）**：
1. 第 0 天：欢迎 + 交付潜在客户诱饵
2. 第 1 天：快速见效 / 即时价值
3. 第 3 天：品牌故事 / 我们为何存在
4. 第 5 天：社会认同 / 案例研究
5. 第 7 天：互动检查 / 偏好设置

**培育序列（6 周）**：
1. 第 1-2 周：问题认知
2. 第 3-4 周：解决方案教育
3. 第 5-6 周：产品介绍 + 优惠

### 细分策略

| 细分类型 | 标准 | 用途 |
|--------------|----------|---------|
| 互动度 | 打开/点击行为 | 再互动定向 |
| 兴趣 | 浏览过的内容 | 主题个性化 |
| 生命周期 | 潜在客户阶段 | 匹配漏斗阶段的内容 |
| 人口统计 | 职位、公司规模 | 信息定制 |
| 行为 | 网站操作 | 触发式电子邮件 |

## 最佳实践

### 卓越的送达能力
1. **预热新域名**：逐步增加发送量
2. **身份验证**：正确配置 SPF、DKIM、DMARC
3. **名单维护**：定期移除退信地址和不活跃用户
4. **互动信号**：鼓励回复并将发件人添加到联系人

### 卓越的文案
1. **移动端优先**：超过 60% 的邮件在移动端阅读
2. **易于浏览**：使用短段落、项目符号和粗体
3. **一个 CTA**：不要让多个行动号召相互竞争
4. **个性化语气**：面向一个人写作，而不是一份名单

### 卓越的测试
1. **主题行**：始终进行 A/B 测试
2. **发送时间**：为每个细分受众找到最佳时间窗口
3. **内容长度**：测试短内容与长内容
4. **CTA 按钮**：测试文本、颜色和位置

## 智能体集成

| 智能体 | 如何使用此技能 |
|-------|------------------------|
| `email-wizard` | 序列设计、自动化设置 |
| `copywriter` | 创建电子邮件文案 |
| `lead-qualifier` | 细分标准、触发条件 |
| `continuity-specialist` | 再互动策略 |

## 应避免的反模式

| 反模式 | 错误原因 | 应改为 |
|--------------|----------------|-----------------|
| 购买电子邮件名单 | 破坏送达能力 | 自然积累名单 |
| 不进行细分 | 不相关的内容会导致用户退订 | 按行为进行细分 |
| CTA 过多 | 使读者困惑，分散点击 | 设置一个主要 CTA |
| 没有退订选项 | 违法并会引发垃圾邮件投诉 | 提供清晰、便捷的退订方式 |
| 批量群发 | 缺乏个性化 | 发送由行为触发的电子邮件 |

## 工作流集成

- `crm-workflow.md` - 潜在客户生命周期阶段、MQL/SQL 定义
- `sales-workflow.md` - 电子邮件触发器的潜在客户评分阈值

## 相关命令

- `/sequence/welcome` - 7 天欢迎序列
- `/sequence/nurture` - 6 周潜在客户培育序列
- `/sequence/re-engage` - 21 天客户挽回序列
- `/content/email` - 创建电子邮件文案

## 参考资料

- `references/sequence-design.md` - 电子邮件序列蓝图
- `references/deliverability.md` - 如何进入收件箱
- `references/segmentation.md` - 受众细分
- `references/automation.md` - 自动化工作流
- `references/lead-nurturing-workflows.md` - 潜在客户培育序列