---
name: quality-engineering-business-analysis
description: 'Investigate requirements via atomic AC decomposition, actor/permission matrices, and truth-table edge cases; enforce User Story standards (scope fences, platform tags, toggles). Use when writing/reviewing Stories or AC with multi-condition logic, feature toggles, or market variants (VN/MY/SG).'
metadata:
  triggers:
    files:
    - '**/user_story.md'
    keywords:
    - acceptance criteria
    - AC
    - business rules
    - jira story
    - toggle
    - market
    - write user story
    - improve user story
    - review story
    - BA
---
# 业务分析标准（深度分析 + 用户故事编写）

## **优先级：P0（严重）**

## 1. 深度调查协议

- **原子化 AC 拆分**：将**验收标准（AC）**拆分为**单条件**逻辑单元（例如，“用户可以执行 X 和 Y” -> “用户可以执行 X”、“用户可以执行 Y”）。
- **变量识别**：提取所有**功能开关**、**市场规则**（VN/MY/SG）和**用户角色**。
- **平台一致性**：验证逻辑是否同时适用于 **Web** 和 **Mobile**；尽早标记不一致的行为。
- **真值表验证**：将复杂的多条件逻辑映射到**逻辑真值表**。

## 2. 动态参与者与权限映射

- 识别所有**参与者**（例如，`Customer`、`Sales Rep`、`Admin`）。
- 使用**参与者/权限矩阵**映射每个参与者的具体约束。
- [权限模式](references/analysis_patterns.md)

## 3. 边缘情况与边界分析

- **状态验证**：验证所有实体状态（例如，`Active`、`Suspended`）和网络状态下的行为。
- **边界检测**：分析**货币**、**日期**和**数量限制**。
- **负向测试**：识别**未授权访问**、**无效输入**和**空值安全**相关流程。

## 4. 反模式（分析）

- **禁止浅层阅读**：调查其_隐含影响_，不要复述。
- **禁止假设**：将未定义状态（例如，离线）标记为 P0 阻塞项。
- **禁止宽松映射**：确保 AC 与技术影响说明 100% 一致。

## 5. 用户故事编写标准

- **故事结构**：每个故事必须使用 `As a [Actor], I want [Goal], so that [Value]`。
- **AC 格式**：每条 AC 必须包含一个 `Given / When / Then` 块——每个块仅包含一个条件。
- **平台标签**：每条 AC 必须以 `[WEB]`、`[MOBILE]` 或 `[BOTH]` 为前缀——切勿在一个 AC 块中混合多个平台。
- **开关契约**：每条功能开关 AC 必须注明开关名称和状态：`Toggle: <FlagName> = ON/OFF`。
- **市场隔离**：任何市场特定的 AC 必须以 `[Market: VN]`、`[Market: MY]` 等为前缀。
- **范围界定**：明确包含 `## In Scope`、`## Out of Scope` 和 `## Deferred` 章节。延期项必须链接到 Jira 工单——切勿写“待讨论”。
- **翻译 AC**：语言/区域设置行为应作为单独的 AC，而不是内联说明。

完整编写模板请参阅[用户故事模板](references/user_story_template.md)。

## 6. 反模式（用户故事编写）

- **禁止混合平台 AC**：内嵌的 `[MOBILE ONLY]` 会掩盖平台一致性缺口——应使用平台标签。
- **禁止“待讨论”**：替换为 `## Deferred` 中链接的 Jira 工单。
- **禁止隐式开关状态**：每条 AC 始终明确声明 ON 和 OFF 两种行为。
- **禁止捆绑 AC**：“用户看到 X、Y 和 Z” → 拆分为三个独立的 AC 块。

## 7. 验证清单

在编写或审查任何用户故事后、将其标记为可供开发之前执行：

- [ ] 每条 AC 都有 `[WEB]`、`[MOBILE]` 或 `[BOTH]` 平台标签
- [ ] 每条开关 AC 都明确声明 `= ON` 和 `= OFF` 两种状态
- [ ] 任何 AC 块包含的 `And` 条件均不超过一个（如果它，则拆分）
- [ ] 任何位置均无“待讨论”文本——已替换为 `## Deferred` 中的 Jira 链接
- [ ] 故事包含 `## In Scope`、`## Out of Scope` 和 `## Deferred` 章节
- [ ] 故事使用 `As a / I want / So that` 标头
- [ ] 市场特定的 AC 以 `[Market: VN]`、`[Market: MY]` 等为前缀
- [ ] 翻译/区域设置行为有独立的 AC，或通过 Jira 链接延期处理

## 规范响应锚点

应用此技能时，请在相关情况下于回答中保留以下领域术语或等效的具体示例：
- Actor
- Mobile
- Variable

- 其他基于任务的精确锚点：Truth table