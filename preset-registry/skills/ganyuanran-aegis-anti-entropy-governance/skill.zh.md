---
name: anti-entropy-governance
description: "Use when touching retiring old logic, collapsing duplicate owners, removing fallbacks, or schema/persistence/source-of-truth boundaries; identify opportunities automatically; destructive execution requires explicit confirmation."
---
# 反熵

## 概述

当任务不只是“修改代码”，而是要“在不增加熵的前提下安全移除旧路径”时，使用此技能。

此技能在以下方案之间进行选择：

- `delete-first`：用于内部代码退役
- `compat-exception`：用于已有证据表明存在外部依赖边界的情况
- `confirmation-first`：用于不可逆状态，或无法观察其分布式消费者的外部契约

它不取代 `brainstorming`、`writing-plans`、`systematic-debugging` 或
`verification-before-completion`。这是一个专注于退役、回退路径收敛、
重复所有者清理和删除安全性的狭窄治理职责。

## 使用时机

满足以下任一条件时使用：

- 应当退役旧逻辑、重复所有者或过时的回退路径
- 候选修复方案是在“删除旧路径”和“增加另一条回退路径”之间进行选择
- 正在用结构化逻辑替换内部的关键词 / 短语 / 触发器逻辑
- 已存在新的规范所有者，而旧所有者可能仍承载真实行为
- 清理、迁移或弃用任务涉及架构、持久化、事实来源或外部兼容性边界
- 任务可能将代码退役与实时数据删除混淆

以下情况不要使用：

- 不涉及退役决策的纯增量功能开发
- 微小的措辞编辑
- 简单的状态查询或只读问答
- 不涉及所有者收敛、回退清理或删除选择的常规 bug 修复

## 自动组合边界

此技能应由其他所有者组合使用。不应将其变成新的全局热路径入口。

优先从以下技能组合：

- `brainstorming`：涉及退役或持久化风险的方案选择
- `writing-plans`：删除旧路径或涉及架构 / 迁移 / 持久化的计划
- `systematic-debugging`：诱人的修复方案是增加回退路径，或需要在删除与保留之间进行选择时
- `verification-before-completion`：清理 / 退役 / 兼容性 / 迁移收尾

当任务涉及所有者收敛、移除回退路径，或架构 / 持久化 / 事实来源边界时，自动加载。自动加载仅用于识别和提供建议；破坏性执行仍需要用户明确且范围受限的确认。

## 核心原则

默认应减少内部熵，而不是保留内部历史。

退役首先应以职责为范围，而不是以承载者为范围。先明确过时或重复的权威来源。如果同一承载者有独立证据证明其仍承担合法职责，则移除无效职责，仅保留该职责范围内的能力；这不属于兼容性例外。当不再存在任何合法职责后，对该承载者应用 `delete-first`。仅仅存在未知消费者，仍不足以证明应保留内部承载者。

使用以下规则：

- 内部代码退役 -> `delete-first`
- 外部兼容性边界 -> 使用带有活跃依赖证据的 `compat-exception`；当已证明存在分布式消费者但无法观察这些消费者时，使用 `confirmation-first`
- 持久化状态或不可逆的事实来源对象 ->
  `confirmation-first`

Unknown 单独既不能证明存在外部依赖，也不会阻止内部的
`delete-first`。一旦证明了分发，无法观测到的消费者同样不能证明删除是安全的：应以只读方式检查，并在披露范围后要求用户确认，再进行编辑。

提及、加载或讨论破坏性操作规则，绝不代表已获授权执行破坏性操作。在没有明确且范围限定的用户确认时：

- 不执行不可逆删除
- 不调用破坏性工具
- 不将可运行的破坏性命令作为下一步操作输出
- 不将笼统的同意重新解释为删除许可

## 删除类别

首先对删除目标进行分类：

- `code-retirement`
  - 源代码
  - 内部触发器
  - 重复的所有者
  - 过时的回退分支
  - 仅用于兼容性的承载代码
  - 与已移除的内部行为相关的无效测试/配置

- `contract-carrying code`
  - 模式定义文件
  - 迁移文件
  - 公共 API 契约代码
  - 宿主安装/发现代码
  - 持久化读写逻辑

- `live-state mutation surface`
  - 会修改实时数据库、对象存储、队列或其他持久化状态的代码或命令

- `derived-state`
  - 可重建的缓存
  - 生成的索引
  - 临时导出文件
  - 可重新计算的产物

- `persistent-state`
  - 实时数据库表 / 列 / 行
  - 事实来源对象存储文件
  - 用户记录
  - 权限 / 身份 / 成员关系记录
  - 审计 / 计费 / 不可逆业务记录
  - 不可重建的队列或事件内容

## 按类别划分的默认路径

- `code-retirement` -> `delete-first`
- `contract-carrying code` -> 按核心原则进行分类；仅限内部的
  退役使用经过高风险验证的 `delete-first`
- `live-state mutation surface` -> 进行检查和分类；当破坏性执行
  涉及持久化状态时，仍需确认
- `derived-state` -> 首先验证可重建性，然后再决定
- `persistent-state` -> `confirmation-first`

## 强制停止条件

如果目标是 `persistent-state` 或其他不可逆的事实来源对象：

- 不要自动执行删除
- 不要将可运行的破坏性命令作为下一步操作输出
- 不要调用破坏性工具
- 不要将一般性同意解读为确认
- 要求用户明确且范围限定的确认
- 在相关情况下要求提供备份 / 回滚 / 迁移说明

需要确认的示例：

- `DROP TABLE`
- `DROP COLUMN`
- `TRUNCATE`
- 批量删除真实业务数据
- 删除事实来源上传文件
- 删除权限、身份、审计、计费或成员关系记录
- 清除不可重建的队列或事件流

## 数据销毁保护

当 `confirmation-first` 保护持久化状态或不可逆的事实来源对象时，停止正常的退役流程并输出：

```text
Data Destruction Guard:
- Target Class:
- Exact Target(s):
- Environment:
- Why Irreversible:
- Backup / Rollback Note:
- Allowed Read-Only Next Steps:
- Blocked Destructive Steps:
- Confirmation Required: yes
- Status: awaiting scoped confirmation
```

只有明确且限定范围的确认才能继续。像“OK”、“continue”或“sounds good”这样的笼统同意并不足够。如果范围发生任何变化，之前的确认即告失效，必须重新获得确认。

## 反熵声明

删除前，声明：

```text
Anti-Entropy Declaration:
- Deletion Class:
- Old Path/Object:
- Invalid Responsibility / Authority:
- Legitimate Capability Remaining on Carrier:
- New Canonical Owner:
- Expected Preserved Behavior:
- Expected Retired Behavior:
- External Boundary Touched: no | yes
- Source-of-Truth Data Risk: none | possible | confirmed
- User Confirmation Required: no | yes
```

如果 `User Confirmation Required: yes`，停止正常的先删除流程。
持久状态或不可逆目标进入 `Data Destruction Guard`；
外部未知代码则停留在下方的 `Retirement Decision` 阶段。

## 退役决策

只能选择一条路径：

```text
Retirement Decision:
- Path: delete-first | compat-exception | confirmation-first
- Why:
- Non-edits:
```

规则：

- 对于内部退役，选择 `delete-first`，除非存在更强的边界阻碍
- 仅当外部依赖已得到证明时，才选择 `compat-exception`
- 对于不可逆目标，或已证明存在分发但无法观察其消费者的目标，选择 `confirmation-first`

如果 `Path = confirmation-first`，在收到限定范围的确认之前，不得执行任何破坏性操作。对于外部未知代码，之前泛化的删除指令不计入确认；必须先披露风险。

## 验证计划

不要只通过“测试通过”来验证。验证旧逻辑确实已经消失，并且新所有者确实承载了该行为。

```text
Verification Plan:
- Main-path check:
- Lingering-reference check:
- Negative check:
- Boundary check:
```

含义：

- `Main-path check`：新的规范所有者仍然满足预期行为
- `Lingering-reference check`：已退役的职责不再处于活动状态；当其载体被删除时，旧路径不再被主路径引用
- `Negative check`：已退役的触发器/路径确实已停止工作
- `Boundary check`：宿主/API/架构/持久化边界未被意外破坏

## 缺口分类

如果删除后出现缺口，先进行分类，再修复：

- `expected-retirement`
- `missing-owner-logic`
- `stale-internal-consumer`
- `baseline-gap`
- `external-compat`
- `persistent-state-risk`

`persistent-state-risk` 是停止条件，不是正常的修复分支。

## 缺口闭合

修复顺序：

- `expected-retirement`
  - 更新测试、文档或调用方预期
- `missing-owner-logic`
  - 修复新的规范所有者
- `stale-internal-consumer`
  - 迁移内部消费者
- `baseline-gap`
  - 先纠正需求 / 规范 / 基线
- `external-compat`
  - 仅当存在活跃的外部依赖证据时，才允许兼容
- `persistent-state-risk`
  - 停止并请求用户确认

使用以下契约：

```text
Gap Closure:
- Gap Found:
- Gap Type:
- Repair Action:
- Reintroduced Compat: no | yes
- If yes, External Dependency Evidence:
- Retirement Trigger:
```

如果 `Gap Type = persistent-state-risk`，请停止并返回确认闸门。不要自行设计破坏性修复。

## 兼容性例外闸门

仅当以下条件全部满足时，才允许保留：

- 触及了外部边界
- 存在当前活跃依赖的证据
- 删除将破坏已发布或已记录的契约
- 当前切片无法完成所有者修复或消费者迁移
- 存在观测指标
- 存在退役触发条件

如果不满足这些条件，则不要保留兼容性代码。

## 完成语义

完成声明必须反映真实结果：

- 保留旧兼容性的内部退役 -> 应为 `bounded mitigation` 或
  `deferred debt`，而不是干净退役
- 保留外部兼容性且证据完整 -> `bounded compatibility exception`
- 未经范围确认就删除持久化状态 -> 不算完成

## 常见错误

不要：

- 将未知依赖视为存在依赖的证明
- 在已证实的外部边界上，将缺少活跃依赖证据视为删除安全的证明
- “为了安全”而让两个所有者同时保持活跃
- 在检查间隙是否属于新所有者之前，就添加回退逻辑
- 将迁移文件删除与实时数据库删除混为一谈
- 将真实来源数据清理视为普通代码退役
- 在旧逻辑仍承载主路径行为时，称任务已“清理完毕”
- 仅仅因为载体上的某个权威无效，就删除该载体；如果仍存在有独立证据支持的合法角色，则不应删除
- 将警告或防护卡视为破坏性授权

## 最小报告结构

此结构是反熵工作流的决策界面，而不是单独的最终完成报告。当反熵工作实质性地影响了已完成的任务时，其保留/退役的行为、删除类别、保留的边界、验证计划和剩余风险，应流入 `verification-before-completion` 的统一 Aegis 影响/安全回执。

```text
Aegis Visibility:
Anti-Entropy Declaration:
Retirement Decision:
Verification Plan:
Gap Closure:
```

默认使用紧凑结构。仅在任务风险需要时展开。