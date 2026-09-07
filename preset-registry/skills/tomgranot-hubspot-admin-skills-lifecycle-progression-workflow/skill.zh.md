---
name: lifecycle-progression-workflow
description: "Build workflows to automate contact progression through the sales funnel: Lead to MQL to SQL to Opportunity to Customer. Each transition is triggered by a specific event (score threshold, meeting booked, deal created, deal won)."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: automation-workflows
---
# 生命周期阶段推进工作流

使用四个推进工作流自动完成联系人在销售漏斗中的旅程，每个工作流由特定的业务事件触发。

## 推进路径

| 起始 | 目标 | 触发条件 |
|------|----|---------|
| Lead | MQL | 线索评分超过阈值 |
| MQL | SQL | 已预约会议 |
| SQL | Opportunity | 已创建并关联交易 |
| Opportunity | Customer | 交易被标记为已成交 |

## 前提条件

- HubSpot Marketing Professional 或 Enterprise 套餐
- 一个具有 `automation` 权限范围的 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`）（用于 API 路径）
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 已配置线索评分模型（先运行 `/build-lead-scoring`）——你需要知道评分属性的内部名称
- 已设置好包含 "Closed Won" 阶段的交易管道
- 已配置会议工具或集成（用于向 SQL 的转换）

## 脚本

| 阶段 | 脚本 | 运行方式 |
|-------|--------|----------|
| 运行前 | [`scripts/before.py`](./scripts/before.py) | `uv run skills/lifecycle-progression-workflow/scripts/before.py` |
| 执行 | [`scripts/execute.py`](./scripts/execute.py) | `uv run skills/lifecycle-progression-workflow/scripts/execute.py` |
| 运行后 | [`scripts/after.py`](./scripts/after.py) | `uv run skills/lifecycle-progression-workflow/scripts/after.py` |

`before.py` 会清点现有工作流并检查名称冲突。`execute.py` 通过 `POST /automation/v4/flows` 创建全部四个推进工作流——**始终处于禁用状态，以便在启用前进行审查**。`after.py` 负责验证并报告启用状态。

## 构建工作流：两种选择

### 方案 A：通过 v4 Automation API 创建（主要方案）

四个推进工作流均为线性结构（基于过滤器的 AND 触发器 → 设置生命周期阶段），v4 API 可以直接表达这种逻辑。脚本编码的内容如下：

| 工作流 | 注册条件（AND） | 操作 |
|----------|------------------|--------|
| Lead → MQL | 评分属性 >= 阈值 + 阶段 = Lead | 设置阶段 = MQL |
| MQL → SQL | `engagements_last_meeting_booked` 已知 + 阶段 = MQL | 设置阶段 = SQL |
| SQL → Opportunity | `num_associated_deals` >= 1 + 阶段 = SQL | 设置阶段 = Opportunity |
| Opportunity → Customer | `hs_current_customer` = true + 阶段 = Opportunity | 设置阶段 = Customer |

最后一个工作流使用 `hs_current_customer`——这是 HubSpot 于 2026 年 6 月引入的只读系统属性，用于标记属于当前客户的联系人——作为比检查关联交易阶段更干净的信号。

**运行之前：** 将 `execute.py` 中的 `LEAD_SCORE_PROPERTY` 设置为你的评分属性的内部名称。使用 HubSpot 2025 年之后推出的线索评分工具时，你创建的每个评分都会生成自己的属性——请在 Settings > Properties 下找到内部名称（它不是已弃用的 `hubspotscore`）。

```bash
uv run skills/lifecycle-progression-workflow/scripts/before.py
uv run skills/lifecycle-progression-workflow/scripts/execute.py
```

**安全模型：** 四个工作流全部以 `isEnabled: false` 创建。在 UI 中审查触发器，添加可选的内部通知操作（市场营销团队、销售负责人、CS/客户入驻——接收者因门户而异），然后逐一启用，并观察首批注册情况。

### 方案 B：手动在 UI 中构建

按照下文第 3 阶段的分步说明进行操作。在 Automation API 不可用的门户上使用此方案，或者当你希望使用门户特有的事件条件（而非脚本所使用的基于属性的等价条件）来配置会议/交易触发器时使用。

**备选方案：** HubSpot Breeze AI 可以根据提示词搭建这些工作流，但它创建的是基于事件（OR）的触发器，而此处需要的是事件与当前阶段之间的 AND 逻辑，且它无法配置重新注册——请对其构建的所有内容进行验证。Claude Chrome 扩展可以直接操控工作流构建器 UI。这两者都是次要选项。

## 分步构建说明

### 阶段 1：规划

1. 定义你的 MQL 评分阈值（在 0-100 分制上通常为 40-60）。观察 30-60 天后再进行调整。
2. 确定你的线索评分属性的内部名称（2025 年之后的评分工具中，每个评分都有各自的属性；参见 `/build-lead-scoring`）。
3. 确认你的交易管道阶段中包含明确的 "Closed Won" 对应阶段。

### 阶段 2：运行前

1. 运行 `uv run skills/lifecycle-progression-workflow/scripts/before.py`，以清点工作流并检查名称冲突。
2. 记录当前的生命周期阶段分布（运行审计或查看属性细分），以便衡量影响。

### 阶段 3：执行

**方案 A：** 运行 `uv run skills/lifecycle-progression-workflow/scripts/execute.py`，然后完成上文列出的 UI 审查步骤。

**方案 B——手动 UI 构建：** 将每个工作流构建为独立的基于联系人的工作流。

#### 工作流 1：Lead 到 MQL

1. **触发器：** 你的线索评分属性大于或等于 [threshold]，且生命周期阶段为 "Lead"
2. **操作：** 将生命周期阶段设置为 "Marketing Qualified Lead"
3. **操作（可选）：** 向市场营销团队发送内部通知
4. **重新注册：** 关闭

#### 工作流 2：MQL 到 SQL

1. **触发器：** 已预约会议（使用 "Meeting activity date" 已知，或 "Number of meetings booked" 大于 0），且生命周期阶段为 "Marketing Qualified Lead"
2. **操作：** 将生命周期阶段设置为 "Sales Qualified Lead"
3. **操作（可选）：** 向销售负责人发送内部通知
4. **重新注册：** 关闭

#### 工作流 3：SQL 到 Opportunity

1. **触发器：** 已创建关联交易（使用 "Number of associated deals" 大于 0），且生命周期阶段为 "Sales Qualified Lead"
2. **操作：** 将生命周期阶段设置为 "Opportunity"
3. **重新注册：** 关闭

#### 工作流 4：Opportunity 到 Customer

1. **触发器：** 关联交易阶段等于 "Closed Won"，且生命周期阶段为 "Opportunity"
2. **操作：** 将生命周期阶段设置为 "Customer"
3. **操作（可选）：** 向 CS/客户入驻团队发送内部通知
4. **重新注册：** 关闭

#### 工作流设置（全部四个）

- 重新注册：关闭（生命周期只应向前推进）
- 抑制列表：无需设置——生命周期阶段条件已防止向后移动
- 时区：不适用

### 阶段 4：运行后

0. 运行 `uv run skills/lifecycle-progression-workflow/scripts/after.py`（API 路径），确认四个工作流全部存在并报告启用状态。
1. 使用测试联系人测试每个工作流：
   - 手动调整评分/创建会议/创建交易/关闭交易，并确认阶段推进。
2. 验证各工作流之间没有冲突——同一联系人不应同时注册到两个推进工作流中。
3. 检查生命周期阶段只向前移动（HubSpot 默认会强制执行这一点，但仍需验证）。
4. 一周后，审查每个工作流的历史记录。检查：
   - 尽管满足条件却停留在某个阶段的联系人
   - 意外的注册数量

## 回滚

1. 关闭任意或全部四个工作流。
2. 已设置的生命周期阶段将保持不变——若不进行手动覆盖或使用专门的重置工作流，HubSpot 不允许向后移动。
3. 如果阶段设置错误，可创建临时工作流或使用 API 重置受影响的联系人。

## 注意事项

- **向后移动：** HubSpot 默认防止生命周期阶段后退。如果交易失败且联系人应退回 MQL，你需要一个单独的“回退”工作流来显式设置该阶段。
- **多笔交易：** 如果一个联系人有多笔交易，那么只要任意一笔关联交易成交，Opportunity 到 Customer 的工作流就会触发。这通常是期望的行为。
- **评分衰减：** HubSpot 2025 年之后的评分工具支持参与度衰减，因此联系人的评分可能在晋级后跌破 MQL 阈值。这没有问题——生命周期阶段已经设置，且不会后退。
