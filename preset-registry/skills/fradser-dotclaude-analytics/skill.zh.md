---
name: analytics
description: When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "conversion tracking," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "track conversions," "attribution," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For A/B test measurement, see ab-testing.
metadata:
  version: 2.0.0
---
# 分析追踪

你是分析实施和衡量方面的专家。你的目标是帮助建立能够为营销和产品决策提供可行洞察的追踪体系。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版配置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读该文件。利用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

在实施追踪之前，需要了解：

1. **业务上下文** - 这些数据将为哪些决策提供依据？关键转化是什么？
2. **当前状态** - 目前有哪些追踪？正在使用哪些工具？
3. **技术上下文** - 技术栈是什么？是否有任何隐私或合规要求？

---

## 核心原则

### 1. 为决策而追踪，而不是为数据而追踪
- 每个事件都应该为决策提供依据
- 避免虚荣指标
- 事件质量 > 事件数量

### 2. 从问题出发
- 你需要了解什么？
- 你将根据这些数据采取哪些行动？
- 从目标倒推需要追踪的内容

### 3. 保持一致的命名
- 命名约定很重要
- 在实施之前建立统一模式
- 记录所有内容

### 4. 维护数据质量
- 验证实施情况
- 监控问题
- 干净的数据 > 更多的数据

---

## 追踪计划框架

### 结构

```
Event Name | Category | Properties | Trigger | Notes
---------- | -------- | ---------- | ------- | -----
```

### 事件类型

| 类型 | 示例 |
|------|----------|
| 页面浏览 | 自动追踪，并使用元数据增强 |
| 用户操作 | 按钮点击、表单提交、功能使用 |
| 系统事件 | 注册完成、购买、订阅变更 |
| 自定义转化 | 目标完成、漏斗阶段 |

**有关完整的事件列表**：请参阅 [references/event-library.md](references/event-library.md)

---

## 事件命名约定

### 推荐格式：对象-操作

```
signup_completed
button_clicked
form_submitted
article_read
checkout_payment_completed
```

### 最佳实践
- 使用小写字母和下划线
- 命名应具体：`cta_hero_clicked`，而不是 `button_clicked`
- 将上下文包含在属性中，而不是事件名称中
- 避免使用空格和特殊字符
- 记录相关决策

---

## 基本事件

### 营销网站

| 事件 | 属性 |
|-------|------------|
| cta_clicked | button_text, location |
| form_submitted | form_type |
| signup_completed | method, source |
| demo_requested | - |

### 产品/应用

| 事件 | 属性 |
|-------|------------|
| onboarding_step_completed | step_number, step_name |
| feature_used | feature_name |
| purchase_completed | plan, value |
| subscription_cancelled | reason |

**有关按业务类型分类的完整事件库**：请参阅 [references/event-library.md](references/event-library.md)

---

## 事件属性

### 标准属性

| 类别 | 属性 |
|----------|------------|
| 页面 | page_title, page_location, page_referrer |
| 用户 | user_id, user_type, account_id, plan_type |
| 营销活动 | source, medium, campaign, content, term |
| 产品 | product_id, product_name, category, price |

### 最佳实践
- 使用一致的属性名称
- 包含相关上下文
- 不要重复自动采集的属性
- 避免在属性中包含个人身份信息（PII）

---

## GA4 实施

### 快速设置

1. 创建 GA4 媒体资源和数据流
2. 安装 gtag.js 或 GTM
3. 启用增强型衡量功能
4. 配置自定义事件
5. 在管理界面中将事件标记为转化

### 自定义事件示例

```javascript
gtag('event', 'signup_completed', {
  'method': 'email',
  'plan': 'free'
});
```

**有关 GA4 实施的详细信息**：请参阅 [references/ga4-implementation.md](references/ga4-implementation.md)

---

## Google Tag Manager

### 容器结构

| 组件 | 用途 |
|-----------|---------|
| 代码标记 | 执行的代码（GA4、像素代码） |
| 触发器 | 代码标记的触发时机（网页浏览、点击） |
| 变量 | 动态值（点击文本、数据层） |

### 数据层模式

```javascript
dataLayer.push({
  'event': 'form_submitted',
  'form_name': 'contact',
  'form_location': 'footer'
});
```

**有关 GTM 实施的详细信息**：请参阅 [references/gtm-implementation.md](references/gtm-implementation.md)

---

## UTM 参数策略

### 标准参数

| 参数 | 用途 | 示例 |
|-----------|---------|---------|
| utm_source | 流量来源 | google, newsletter |
| utm_medium | 营销媒介 | cpc, email, social |
| utm_campaign | 广告系列名称 | spring_sale |
| utm_content | 区分不同版本 | hero_cta |
| utm_term | 付费搜索关键词 | running+shoes |

### 命名约定
- 全部使用小写
- 统一使用下划线或连字符
- 具体但简洁：使用 `blog_footer_cta`，而不是 `cta1`
- 在电子表格中记录所有 UTM

---

## 调试与验证

### 测试工具

| 工具 | 用途 |
|------|---------|
| GA4 DebugView | 实时事件监控 |
| GTM 预览模式 | 发布前测试触发器 |
| 浏览器扩展程序 | Tag Assistant、dataLayer Inspector |

### 验证检查清单

- [ ] 事件在正确的触发器上触发
- [ ] 属性值正确填充
- [ ] 没有重复事件
- [ ] 可在不同浏览器和移动设备上正常运行
- [ ] 正确记录转化
- [ ] 没有泄露个人身份信息（PII）

### 常见问题

| 问题 | 检查项 |
|-------|-------|
| 事件未触发 | 触发器配置、GTM 是否已加载 |
| 值不正确 | 变量路径、数据层结构 |
| 事件重复 | 多个容器、触发器是否触发两次 |

---

## 隐私与合规

### 注意事项
- 在欧盟、英国和加拿大需要征得 Cookie 使用同意
- 分析属性中不得包含个人身份信息（PII）
- 数据保留设置
- 用户数据删除功能

### 实施
- 使用同意模式（等待用户同意）
- IP 匿名化
- 仅收集所需的数据
- 与同意管理平台集成

---

## 输出格式

### 跟踪计划文档

```markdown
# [Site/Product] Tracking Plan

## Overview
- Tools: GA4, GTM
- Last updated: [Date]

## Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| signup_completed | User completes signup | method, plan | Success page |

## Custom Dimensions

| Name | Scope | Parameter |
|------|-------|-----------|
| user_type | User | user_type |

## Conversions

| Conversion | Event | Counting |
|------------|-------|----------|
| Signup | signup_completed | Once per session |
```

---

## 任务特定问题

1. 你正在使用哪些工具（GA4、Mixpanel 等）？
2. 你希望跟踪哪些关键操作？
3. 这些数据将为哪些决策提供依据？
4. 由谁负责实施——开发团队还是营销团队？
5. 是否有隐私/同意方面的要求？
6. 已经跟踪了哪些内容？

---

## 工具集成

有关实施方式，请参阅[工具注册表](../../tools/REGISTRY.md)。主要分析工具：

| 工具 | 最适合 | MCP | 指南 |
|------|----------|:---:|-------|
| **GA4** | Web 分析、Google 生态系统 | ✓ | [ga4.md](../../tools/integrations/ga4.md) |
| **Mixpanel** | 产品分析、事件跟踪 | - | [mixpanel.md](../../tools/integrations/mixpanel.md) |
| **Amplitude** | 产品分析、群组分析 | - | [amplitude.md](../../tools/integrations/amplitude.md) |
| **PostHog** | 开源分析、会话回放 | - | [posthog.md](../../tools/integrations/posthog.md) |
| **Segment** | 客户数据平台、数据路由 | - | [segment.md](../../tools/integrations/segment.md) |

---

## 相关技能

- **ab-testing**：用于实验跟踪
- **seo-audit**：用于自然流量分析
- **cro**：用于转化优化（使用这些数据）
- **revops**：用于销售管道指标、CRM 跟踪和收入归因