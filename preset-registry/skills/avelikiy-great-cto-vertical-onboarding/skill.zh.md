---
name: vertical-onboarding
description: Onboarding-and-switching playbook for SMB Product-Builder products. Defines the first-run experience that turns a prospect leaving an incumbent (ServiceTitan/Toast/Mindbody/Shopify/QuickBooks) into an activated user — import-first onboarding, the activation milestone, sample-data fallback, and the time-to-first-value target. Applied by migration-import-engineer and architect/pm so onboarding is designed as a funnel, not an afterthought. Our whole wedge is "low switching cost"; this skill makes that real on day one.
when_to_use: |
  Apply when:
  - migration-import-engineer designs the import that feeds first-run
  - architect/pm specs the first-run / activation flow for a new product
  - a product's adoption depends on leaving an incumbent (any of the 40 products)
  Do NOT apply for internal tools with no external onboarding.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/data-import/**"
  - "docs/architecture/**"
  - "docs/design/**"
---
# 垂直领域引导——让用户快速切换并尽快获得首次价值

现有产品的护城河是切换成本。我们的切入点是消除这种成本。引导流程决定了这一承诺是兑现还是落空。**将引导设计成一个以导入为先、围绕单一激活里程碑的漏斗。**

## 1. 导入优先，而非从空白开始

默认的首次运行路径应是**“从 {incumbent} 导入你的数据”**，由 `migration-import-engineer` 的导入契约提供支持，而不是让用户面对一个必须手动填充的空白仪表板。新用户应当能在几分钟内看到*自己的*客户、作业、菜单或房源。

- 在第一个界面提供导入选项，并明确写出现有产品的名称（“从 ServiceTitan 导入”）。
- 先以试运行预览的方式执行，让用户确认后再正式导入（即导入契约中的操作员步骤）。
- 为暂时无法导出数据的用户提供**示例数据后备选项**（“使用示例数据探索”）——绝不要让用户面对毫无内容的空状态。

## 2. 单一激活里程碑（按产品定义）

选择一个代表“该用户已经获得价值”的操作——它是引导流程的北极星指标。首次运行中的一切都应推动用户完成这一操作。示例：

| 产品 | 激活里程碑 |
|---|---|
| 报价（上门服务） | 发出第一份已定价的报价单 |
| 在线订餐（餐厅） | 发布菜单并收到第一笔测试订单 |
| 课程预约（健身） | 导入会员并完成第一次课程预约 |
| 库存（零售） | 同步商品目录并设置第一条补货规则 |
| 交易协调（房地产） | 创建第一份交易检查清单 |
| 赞助 CRM（创作者） | 添加第一位赞助商并设置交易阶段 |

衡量**首次价值实现时间（TTFV）**；目标应以分钟而非天为单位。在架构文档中明确写出该目标。

## 3. 引导漏斗（详细说明这些步骤）

```
1. Identify incumbent → 2. Import (dry-run → approve) → 3. Verify own data
→ 4. Complete the one setup the product needs → 5. Activation milestone → 6. Invite team
```

每个步骤都应有一个清晰且唯一的 CTA；在安全的情况下可以跳过；可以中断后继续；并显示进度。将所有不在激活里程碑实现路径上的事项延后处理。

## 4. 将设置工作降至最低

- 尽可能使用导入的数据预填信息（从网站获取品牌信息、从商家信息获取营业时间、根据地址确定税率）。
- 使用合理的默认值，而不是要求用户做出选择；高级配置应放在设置中，而不是引导流程中。
- 激活前最多只要求完成一项集成（例如报价产品集成 Stripe）——其余集成应安排在用户首次获得价值之后。

## 5. 信任与可逆性

- 展示已导入的内容，并允许用户撤销一批导入（与导入契约的回滚机制相对应）——信任源于“你不会破坏任何东西”。
- 除非产品是使用即收费，否则不要在达到激活里程碑之前要求用户提供付款信息。

## 输出

应用本说明后，在架构或设计文档中添加一个**引导**章节：

```
## Onboarding
- incumbent(s): <names> → import via docs/data-import/IMPORT-{slug}.md
- activation milestone: <the one action>
- TTFV target: <minutes>
- funnel: identify → import(dry-run→approve) → verify → setup → activate → invite
- empty-state fallback: sample data
- required-before-activation: <≤1 integration>
```