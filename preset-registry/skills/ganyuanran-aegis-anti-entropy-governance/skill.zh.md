---
name: anti-entropy-governance
description: "Use when touching retiring old logic, collapsing duplicate owners, removing fallbacks, or schema/persistence/source-of-truth boundaries; identify opportunities automatically; destructive execution requires explicit confirmation."
---
# 反熵

## 概述

当任务不只是“修改代码”，而是“安全移除旧路径且不增加熵”时，请使用此技能。

此技能会在以下策略之间进行选择：

- `delete-first`：用于内部代码退役
- `compat-exception`：用于已证实的外部依赖边界
- `confirmation-first`：用于不可逆状态，或其分布式使用方无法观测的外部契约

它不能取代 `brainstorming`、`writing-plans`、
`systematic-debugging` 或 `verification-before-completion`。它是一个范围狭窄的
治理所有者，负责退役、回退收敛、重复所有者清理以及删除安全。

## 何时使用

在以下任一情况成立时使用：

- 应当退役旧逻辑、重复所有者或过时的回退机制
- 候选修复方案是在“删除旧路径”和“再添加一个回退机制”之间进行选择
- 内部关键字 / 短语 / 触发器逻辑正被结构化逻辑取代
- 已存在新的规范所有者，而旧所有者可能仍承载实际行为
- 清理、迁移或弃用任务涉及架构、持久化、
  事实来源或外部兼容性边界
- 任务存在将代码退役与实时数据删除混淆的风险

请勿用于：

- 不涉及退役决策的纯增量功能开发
- 微小的措辞修改
- 简单的状态查询或只读问答
- 不涉及所有者收敛、回退清理或
  删除选择的常规错误修复

## 自动组合边界

此技能应由其他所有者组合使用。它不应成为新的
全局热路径入口。

优先由以下技能组合使用：

- `brainstorming`：用于涉及退役或持久化风险的方案选择
- `writing-plans`：用于删除旧路径或涉及架构 / 迁移 /
  持久化的计划
- `systematic-debugging`：当具有诱惑力的修复方案是增加回退机制或
  在删除与保留之间做选择时
- `verification-before-completion`：用于清理 / 退役 / 兼容性 /
  迁移的收尾工作

当任务涉及所有者收敛、移除回退机制，或架构/持久化/事实来源边界时，自动加载此技能。自动加载仅用于识别并提供建议；执行破坏性操作仍然需要用户明确且范围具体的确认。

## 核心原则

默认减少内部熵，而不是保留内部历史。

使用以下规则：

- 内部代码退役 -> `delete-first`
- 外部兼容性边界 -> `compat-exception`，并提供有效的依赖证据；
  当已证实存在分发但无法观测使用方时，使用 `confirmation-first`
- 持久状态或不可逆的事实来源对象 ->
  `confirmation-first`

仅存在未知情况既不能证明存在外部依赖，也不会阻止内部
`delete-first`。一旦证实存在分发，无法观测使用方同样不能证明删除是安全的：
先进行只读检查，并要求在披露情况后获得范围具体的确认，方可进行编辑。

提及、加载或讨论破坏性操作规则绝不构成对
执行破坏性操作的授权。如果没有用户明确且范围具体的确认：

- 不执行不可逆删除
- 不进行破坏性工具调用
- 不将可运行的破坏性命令作为下一步操作输出
- 不将宽泛的同意重新解释为删除批准

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
  - 会修改线上数据库、对象存储、队列或其他持久状态的代码或命令

- `derived-state`
  - 可重建的缓存
  - 生成的索引
  - 临时导出
  - 可重新计算的产物

- `persistent-state`
  - 线上数据库表 / 列 / 行
  - 作为事实来源的对象存储文件
  - 用户记录
  - 权限 / 身份 / 成员资格记录
  - 审计 / 计费 / 不可逆的业务记录
  - 不可重建的队列或事件内容

## 各类别的默认路径

- `code-retirement` -> `delete-first`
- `contract-carrying code` -> 根据核心原则进行分类；仅限内部的退役采用 `delete-first`，并进行高风险验证
- `live-state mutation surface` -> 检查并分类；当破坏性执行涉及持久状态时，仍需获得确认
- `derived-state` -> 先验证可重建性，再作决定
- `persistent-state` -> `confirmation-first`

## 强制停止条件

如果目标是 `persistent-state` 或其他不可逆的事实来源对象：

- 不要自动执行删除
- 不要将可直接运行的破坏性命令作为下一步操作输出
- 不要调用破坏性工具
- 不要将笼统的同意解释为确认
- 要求用户对明确范围作出显式确认
- 在相关情况下，要求提供备份 / 回滚 / 迁移说明

需要确认的示例：

- `DROP TABLE`
- `DROP COLUMN`
- `TRUNCATE`
- 批量删除真实业务数据
- 删除作为事实来源的已上传文件
- 删除权限、身份、审计、计费或成员资格记录
- 清除不可重建的队列或事件流

## 数据销毁防护

当 `confirmation-first` 保护持久状态或不可逆的事实来源对象时，停止正常的退役流程并输出：

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

只有针对明确范围的显式确认才能继续。诸如 "OK"、"continue" 或 "sounds good" 之类的宽泛同意并不充分。如果范围发生任何变化，之前的确认即告失效，并且需要重新确认。

## 反熵声明

删除前，声明：

```text
Anti-Entropy Declaration:
- Deletion Class:
- Old Path/Object:
- New Canonical Owner:
- Expected Preserved Behavior:
- Expected Retired Behavior:
- External Boundary Touched: no | yes
- Source-of-Truth Data Risk: none | possible | confirmed
- User Confirmation Required: no | yes
```

如果 `User Confirmation Required: yes`，停止常规的先删除流程。
涉及持久化状态或不可逆目标时，进入 `Data Destruction Guard`；
外部情况未知的代码则继续保持在下方的 `Retirement Decision` 暂停状态。

## 退役决策

只能选择一条路径：

```text
Retirement Decision:
- Path: delete-first | compat-exception | confirmation-first
- Why:
- Non-edits:
```

规则：

- 对于内部退役，选择 `delete-first`，除非受到更强边界的阻止
- 仅当外部依赖已得到证实时，才选择 `compat-exception`
- 对于不可逆目标，或已证实存在分发但无法观测其使用方的情况，选择 `confirmation-first`

如果 `Path = confirmation-first`，在收到范围明确的确认之前，不得执行任何破坏性操作。对于外部情况未知的代码，之前笼统的删除指令不算作确认；必须先披露风险。

## 验证计划

不要只通过“测试已通过”来验证。应验证旧逻辑确实已经消失，并且新的所有者确实承载了相应行为。

```text
Verification Plan:
- Main-path check:
- Lingering-reference check:
- Negative check:
- Boundary check:
```

含义：

- `Main-path check`：新的规范所有者仍满足预期行为
- `Lingering-reference check`：主路径不再引用旧路径
- `Negative check`：已退役的触发器或路径确实已停止工作
- `Boundary check`：宿主/API/模式/持久化边界没有被意外破坏

## 缺口分类

如果删除后出现缺口，先对其分类，再进行修复：

- `expected-retirement`
- `missing-owner-logic`
- `stale-internal-consumer`
- `baseline-gap`
- `external-compat`
- `persistent-state-risk`

`persistent-state-risk` 是停止条件，而不是常规修复分支。

## 缺口闭合

修复顺序：

- `expected-retirement`
  - 更新测试、文档或调用方预期
- `missing-owner-logic`
  - 修复新的规范所有者
- `stale-internal-consumer`
  - 迁移内部使用方
- `baseline-gap`
  - 先纠正需求/规范/基线
- `external-compat`
  - 仅当存在活跃外部依赖的证据时，才允许保留兼容性
- `persistent-state-risk`
  - 停止并请求用户确认

使用以下约定：

```text
Gap Closure:
- Gap Found:
- Gap Type:
- Repair Action:
- Reintroduced Compat: no | yes
- If yes, External Dependency Evidence:
- Retirement Trigger:
```

如果 `Gap Type = persistent-state-risk`，停止并返回确认门禁。不要自行采取破坏性修复措施。

## 兼容性例外门禁

仅当以下条件全部满足时，才允许保留兼容性：

- 涉及外部边界
- 存在当前有效的依赖证据
- 删除会破坏已发布或已记录的契约
- 当前工作切片无法完成所有者修复或使用方迁移
- 存在观测指标
- 存在退役触发条件

如果不满足这些条件，请勿保留兼容性。

## 完成语义

完成声明必须反映实际结果：

- 内部退役但保留了旧兼容性 -> `bounded mitigation` 或
  `deferred debt`，而不是彻底退役
- 在证据完整的情况下保留外部兼容性 -> `bounded compatibility exception`
- 未经范围明确的确认便删除持久化状态 -> 未完成

## 常见错误

不要：

- 将未知依赖视为存在依赖的证据
- 将缺少活跃依赖证据视为跨越已证实的外部边界进行删除是安全的证据
- 为了“安全”而让两个所有者都保持活跃
- 在检查缺口是否应由新所有者负责之前添加回退机制
- 将迁移文件删除与实时数据库删除混为一谈
- 将事实来源数据清理视为普通的代码退役
- 在旧逻辑仍承担主路径行为时，声称任务“已清理”
- 将警告或防护卡片视为破坏性操作的授权

## 最小报告格式

此格式是反熵工作流的决策界面，而非单独的最终完成报告。当反熵对已完成的任务产生实质性影响时，其保留/退役的行为、删除类别、保留的边界、验证计划和残余风险应纳入 `verification-before-completion` 的统一 Aegis 影响/安全回执中。

```text
Aegis Visibility:
Anti-Entropy Declaration:
Retirement Decision:
Verification Plan:
Gap Closure:
```

默认使用紧凑格式。仅在任务风险要求时展开。