---
name: suede-analytics
description: "Suede-owned measurement discipline for tracking plans, event and conversion instrumentation, UTM and campaign-parameter hygiene, and verification of what actually fires. Use when setting up, auditing, or repairing analytics across web, product, paid, and lifecycle surfaces. NOT FOR: experiment design or significance decisions (use suede-ab-testing), campaign optimization (use suede-ads), attribution models, model comparison, or cross-tool reconciliation (use suede-attribution), or revenue-process architecture (use suede-revops)."
metadata:
  version: 2.0.1
---
# Suede 分析追踪

使用此 Suede 衡量手册构建追踪体系，以支持可审计的营销和产品决策。

## 初步评估

检查 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，或旧版 `product-marketing-context.md`）是否存在；如存在则阅读它，其中的关键转化、数据需要支持的决策，以及已部署的工具决定了此处的每一项建议。

然后处理下方“任务特定问题”中的信息收集清单；仅询问上下文文件尚未解答的问题。

---

## 生产环境变更：修改前暂停

编辑线上标签、属性、目标位置或同意设置，是此技能中后果最严重的操作；下方的边界规定，未经明确授权且没有回滚计划时，不得执行此类操作。当任务需要执行这类操作而你不具备上述两项条件时，按以下四部分暂停：

1. 停止。不要发布容器、编辑属性或更改同意配置。
2. 用一行说明阻塞原因（“发布此 GTM 容器版本会改变所有线上流量触发的内容；我尚未确定回滚版本”）。
3. 提供 2-4 个选项（在 Preview 中暂存并交接追踪记录；将变更写成差异供负责人发布；在用户指定回滚版本后发布；将变更范围限定在测试环境）。
4. 等待答复。不要自行选择一个选项后继续。

同样的暂停规则适用于下方“隐私与合规”部分中提交给法务或隐私审查的任何事项：未解决的合法性基础问题会阻止实施，不得自行假设。

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
| 页面浏览 | 自动记录，并通过元数据增强 |
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
- 保持具体：`cta_hero_clicked` 对比 `button_clicked`
- 在属性中包含上下文，而非事件名称中
- 避免空格和特殊字符

---

## 核心事件

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

**按业务类型划分的完整事件库**：请参阅 [references/event-library.md](references/event-library.md)

---

## 事件属性

### 标准属性

| 类别 | 属性 |
|----------|------------|
| 页面 | page_title, page_location, page_referrer |
| 用户 | user_id, user_type, account_id, plan_type |
| 广告系列 | source, medium, campaign, content, term |
| 产品 | product_id, product_name, category, price |

### 最佳实践
- 避免在属性中包含 PII
- 复用上述标准属性名称，而不是为每个事件创建不同的变体

---

## GA4 实施

### 快速设置

1. 创建 GA4 属性和数据流
2. 安装 gtag.js 或 GTM
3. 启用增强型衡量
4. 配置自定义事件
5. 在管理后台标记转化

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
| 代码 | 执行的代码（GA4、像素） |
| 触发器 | 代码何时触发（页面浏览、点击） |
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
- 始终如一地使用下划线或连字符
- 具体但简洁：`blog_footer_cta`，而不是 `cta1`
- 在电子表格中记录所有 UTM

---

## 调试与验证

### 测试工具

| 工具 | 用途 |
|------|---------|
| GA4 DebugView | 实时事件监控 |
| GTM 预览模式 | 在发布前测试触发器 |
| 浏览器扩展 | Tag Assistant、dataLayer Inspector |

### 验证清单

每个复选框均依赖于上述工具生成的证据，并与下方“工具集成”中该工具类别的“所需当前证明”相对应。未勾选的复选框并不表示“可能没问题”——而是表示跟踪被报告为**未验证**，绝不能报告为已完成。检查标签配置并不能作为证明；必须进行回读验证。

- [ ] **事件在正确的触发器上触发** — DebugView/实时事件捕获，显示每个事件在预期操作时触发
- [ ] **属性值正确填充** — 每个事件进行一次属性回读，值与跟踪计划进行比对
- [ ] **没有重复事件** — 检查同一次捕获是否存在重复触发（多个容器、触发器触发两次）
- [ ] **可在各浏览器和移动端正常运行** — 至少在一个非主要浏览器和一个移动端会话中重复进行回读
- [ ] **正确记录转化** — 转化需同时具备来源回执和目标回执，而非仅有来源回执
- [ ] **没有 PII 泄漏** — 逐字段读取真实捕获事件的负载，并检查会话回放的掩码/采样设置

报告已证明的内容，以及尚未证明的内容。“已埋点”和“已验证”是不同的声明；只有后者可以引用此检查清单。

### 常见问题

| 问题 | 检查项 |
|-------|-------|
| 事件未触发 | 触发器配置、GTM 是否已加载 |
| 值不正确 | 变量路径、数据层结构 |
| 重复事件 | 多个容器、触发器重复触发 |

---

## 隐私与合规

隐私、同意、保留、删除和标识符规则会因司法管辖区、受众、数据类型、合同和平台配置而异。不要将此技能视为法律建议，也不要声明存在通用的同意规则。

实施前：

1. 确定实际涉及的市场、受众年龄、数据类别、供应商、用途和数据流。
2. 审查适用于这些司法管辖区和配置的现行官方监管机构及平台要求；当要求不明确或影响重大时，获得具备资质的隐私或法律审查。
3. 记录已批准的合法依据或同意状态、保留和删除行为、访问控制以及禁止使用的属性。
4. 仅收集已批准的数据，除非经审查的设计明确允许，否则避免收集直接个人标识符，并测试允许和拒绝同意这两种路径。

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

## 任务专属问题

1. 您正在使用哪些工具（GA4、Mixpanel 等）？
2. 您希望跟踪哪些关键操作？
3. 这些数据将为哪些决策提供依据？
4. 由谁实施——开发团队还是营销团队？
5. 是否有隐私/同意要求？
6. 已经跟踪了哪些内容？

---

## 工具集成

此包不包含分析连接器。请使用用户已授权的属性 UI、调试器、导出功能、API 或已安装的连接器，并在构建调用前验证当前官方文档。

| 工具类别 | 典型用途 | 所需的当前证明 |
|---------------|-------------|------------------------|
| Web 分析 | 会话、获客、网站转化 | 调试事件加属性回读 |
| 产品分析 | 事件漏斗、群组、留存 | Schema 检查加抽样事件回读 |
| 标签管理器 | 受控的客户端部署 | 预览跟踪加已发布版本 ID |
| 客户数据路由器 | 向目标端发送已批准的事件 | 来源接收凭证加目标端接收凭证 |
| 会话回放 | 诊断交互阻碍 | 同意、脱敏、抽样和回放验证 |

---

## 边界

- 在当前调试或回读证明其正常工作之前，不要声明某个事件、转化、同意状态或归因路径有效。
- 未经明确授权且没有回滚计划，不要修改生产环境标签、属性、目标端或同意设置。
- 不要仅因工具允许，就收集密钥、直接个人标识符或敏感特征。
- 不要根据单个仪表板数字判断业务成功；应说明指标定义、时间窗口、分母和排除项。

## 路由

- 需要实验设计或结果解读 -> 使用 `suede-ab-testing`。
- 需要付费营销活动决策 -> 使用 `suede-ads`。
- 需要归因建模、模型比较或跨工具核对 -> 使用 `suede-attribution`。
- 需要管道和 CRM 归因 -> 使用 `suede-revops`。
- 需要自然流量可见性诊断 -> 使用 `suede-seo-audit`。
- 对于这些技能，将埋点规划和触发验证路由回 `suede-analytics`。