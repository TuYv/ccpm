---
name: bounce-monitoring-workflow
description: "Build a workflow to protect sender reputation through automated bounce monitoring. Auto-suppresses contacts above a configurable bounce threshold, alerts on hard bounces, and flags high-bounce contacts for weekly manual review."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: automation-workflows
---
# 退信监控工作流

通过自动化的退信检测与抑制来保护你的邮件发件人信誉。该工作流会在退信发生的当下将其捕获，而不是等待周期性清理。

## 工作原理

| 条件 | 操作 |
|-----------|--------|
| 检测到硬退信 | 立即向管理员发出警报，抑制该联系人 |
| 达到抑制阈值（通常为 2-3 次退信） | 自动从营销邮件中抑制 |
| 达到审查阈值（通常为 3-5 次退信） | 标记以供每周人工审查（删除还是恢复） |

## 前提条件

- HubSpot Marketing Professional 或 Enterprise 套餐
- 一个具有 `automation` 权限范围的 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`）（用于 API 路径）
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 一个用于审查标记的自定义联系人属性（默认：`email_health_flag`——execute 脚本会在其缺失时创建）
- 用于硬退信警报的管理员邮箱或 Slack 频道

## 脚本

| 阶段 | 脚本 | 运行方式 |
|-------|--------|----------|
| 前置 | [`scripts/before.py`](./scripts/before.py) | `uv run skills/bounce-monitoring-workflow/scripts/before.py` |
| 执行 | [`scripts/execute.py`](./scripts/execute.py) | `uv run skills/bounce-monitoring-workflow/scripts/execute.py` |
| 后置 | [`scripts/after.py`](./scripts/after.py) | `uv run skills/bounce-monitoring-workflow/scripts/after.py` |

`before.py` 会清点现有工作流并检查名称冲突。`execute.py` 会创建 `email_health_flag` 属性（如果缺失），并通过 `POST /automation/v4/flows` 创建三个退信工作流——**始终处于禁用状态，供启用前审查**。`after.py` 会进行验证并报告启用状态。

## 构建工作流：两种方案

### 方案 A：通过 v4 Automation API 创建（主要方式）

脚本并未采用单个包含三个嵌套分支的工作流，而是将这一设计拆解为**三个线性工作流**——覆盖范围相同，可通过 API 干净地表达，并且可以独立调整：

1. **硬退信抑制**：注册条件 = `hs_email_hard_bounce_reason_enum` 已知。操作：设置 `email_health_flag`，将营销联系人状态设为非营销。
2. **在 N+ 次退信时抑制**：注册条件 = `hs_email_bounce` >= 抑制阈值（开启重新注册）。操作：将营销联系人状态设为非营销。
3. **在 M+ 次退信时标记以供审查**：注册条件 = `hs_email_bounce` >= 审查阈值（开启重新注册）。操作：设置 `email_health_flag`（为 `/review-bounced-contacts` 提供数据）。

在 `execute.py` 中配置 `SUPPRESSION_THRESHOLD` 和 `REVIEW_THRESHOLD`，然后：

```bash
uv run skills/bounce-monitoring-workflow/scripts/before.py
uv run skills/bounce-monitoring-workflow/scripts/execute.py
```

**安全模型：**这三个工作流在创建时均带有 `isEnabled: false`。在 UI 审查期间：添加内部通知操作（硬退信警报、审查警报——通知接收人因门户而异）；如果脚本报告其不得不省略“Set marketing contact status”，请手动添加该操作；然后再启用这些工作流。

### 方案 B：手动在 UI 中构建（含嵌套分支的单一工作流）

请按照下文阶段 3 中的分步说明操作——即最初的单一工作流设计，包含三个层级的分支。在 Automation API 不可用的门户上使用此方案。

**备选方案：**HubSpot Breeze AI 可以根据提示词搭建出类似的工作流，但它创建的是基于事件（OR）的触发器，无法配置重新注册，还可能把嵌套的分支拉平——请对它构建的所有内容进行核实。Claude Chrome 扩展可以直接驱动工作流构建器 UI。这两者都是次要方案。

## 分步构建说明

### 阶段 1：规划

1. 选择你的**抑制阈值**（通常为 2-3 次退信）和**审查阈值**（通常为 3-5 次）。
2. 决定由谁接收硬退信警报和审查警报。

### 阶段 2：前置

1. 运行 `uv run skills/bounce-monitoring-workflow/scripts/before.py`，以清点工作流并检查名称冲突。
2. 确定你当前的退信基线——快速搜索 `hs_email_bounce` > 0 的联系人，以了解起始数量。
3. 如果手动构建，请创建你的退信审查属性（复选框或下拉列表）——API 路径会自动创建该属性。

### 阶段 3：执行

**方案 A：**运行 `uv run skills/bounce-monitoring-workflow/scripts/execute.py`，然后完成上文列出的 UI 审查步骤。

**方案 B——手动 UI 构建：**构建一个基于联系人、包含分支逻辑的单一工作流。

1. **触发器：**`hs_email_bounce` 已知（退信计数更新时触发）

2. **分支 1：硬退信检查**
   - 条件：`hs_email_hard_bounce_reason_enum` 已知
   - **是：**
     - 发送内部通知："Hard bounce: {email} — {hs_email_hard_bounce_reason_enum}"
     - 将 `hs_marketable_status` 设置为非营销（工作流操作）
   - **否：**继续进入分支 2

3. **分支 2：退信次数 >= 你的抑制阈值（通常为 2-3）**
   - 条件：`hs_email_bounce` 大于或等于你的抑制阈值
   - **是：**
     - 将 `hs_marketable_status` 设置为非营销（工作流操作）
     - 继续进入分支 3
   - **否：**不执行操作（低于阈值——仅监控）

4. **分支 3：退信次数 >= 你的审查阈值（通常为 3-5）**
   - 条件：`hs_email_bounce` 大于或等于你的审查阈值
   - **是：**
     - 设置你的退信审查属性 = 已标记
     - 发送内部通知："Contact {email} has [review threshold]+ bounces — review for deletion"
   - **否：**不再执行进一步操作

5. **设置：**
   - 重新注册：开启（如果退信次数增加，联系人应重新进入工作流）
   - 目标：无

6. **启用该工作流。**

### 阶段 4：后置

1. 运行 `uv run skills/bounce-monitoring-workflow/scripts/after.py`（API 路径），确认工作流已存在并报告启用状态。
2. 在第一周的邮件发送之后检查工作流历史。
3. 每周审查已标记的联系人列表——为每位联系人做出决定：
   - 如果邮箱明显无效（域名拼写错误、公司已倒闭），则**删除**
   - 如果域名有效（可能是临时性的邮箱问题），则**尝试恢复**
4. 在 HubSpot 邮件健康仪表板中监控整体退信率。

## 回滚

1. 关闭该工作流。
2. 已被抑制的联系人将保持非营销状态。若要撤销：
   - 筛选被此工作流抑制的联系人（查看你的退信审查属性或工作流历史）
   - 在 UI 中手动将其重新设置为营销联系人
3. 如有需要，批量清除你的退信审查属性值。

## 每周审查流程

对于达到你的审查阈值而被标记的联系人：

1. 导出已标记的联系人列表。
2. 对每位联系人检查以下几项：
   - 邮箱域名是否仍然有效？（快速检查 MX 记录）
   - 是否为已知客户或高价值联系人？
   - 退信是最近发生的还是历史遗留的？
3. **删除**域名无效或邮箱明显虚假的联系人。
4. 对域名有效但反复出现软退信的联系人**保持抑制**。
5. 审查完成后清除退信审查属性。
