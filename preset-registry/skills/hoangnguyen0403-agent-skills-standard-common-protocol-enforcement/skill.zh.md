---
name: common-protocol-enforcement
description: Enforce Red-Team verification and adversarial protocol audit. Use only when verifying completion, performing self-scans, or checking protocol violations; do not activate for ordinary implementation, configuration, or unit-test requests.
metadata:
  triggers:
    keywords:
    - verify done
    - protocol check
    - self-scan
    - pre-write audit
    - task complete
    - audit violations
    - retrospective
    - scan
    - red-team
---
# 协议执行（红队验证）

## **优先级：P0（严重）**


## 红队验证协议

在宣布任何任务“完成”或调用 `notify_user` 之前：

1. **对抗性审计**：搜索本应存在项目规则却使用了 Standard Defaults 的地方。
2. **协议检查**：确认在写入前已加载 active skills 和工作流。
3. **证据检查**：询问哪个命令或产物能够证明完成声明。
4. **执行偏差检查**：询问是否因追求速度或便利而跳过了结构性规则。

## ** 写入后自检**

工具调用后立即执行：

- **扫描**：阅读差异或文件内容。
- **匹配**：对照所有 active skills 中的 `Anti-Patterns` 进行检查。
- **修复**：如果检测到违规，立即重新编辑。

## 危险信号

- **如果在重新验证前出现“完成”，则停止**：暂时不要声明完成。
- **如果依赖记忆而不是重新读取文件，则停止**：reload 权威来源。
- **如果走捷径的理由是“改动很小，可以跳过协议”，则停止**：小改动会掩盖偏差。

## 防止合理化

- **“改动很小”**：小改动仍然会违反防护规则。
- **“测试之前已经通过”**：旧证据无法证明当前状态。
- **“我已经熟悉这个模式”**：仍然要加载 active skill。

## 反模式

- **避免“完成”偏差**：功能成功 != 协议成功。
- **不要依赖记忆**：写入前始终以检索为先（使用 Skill view_file）。
- **不要跳过协议**：大多数违规都发生在“小改动”中。

## 执行偏差检测

检查是否存在：

- 使用本地模拟对象，而不是共享伪对象。
- 使用硬编码样式，而不是 design tokens。
- 使用未配合标准错误处理的 try-catch 块。
- 思考过程中缺少 `Pre-Write Audit Log`。

## 参考资料

## 规范响应锚点

应用此 skill 时，请在相关情况下保留以下领域术语，或在回答中提供等效的具体示例：
- active skill
- active skills
- reload

- 其他基于任务的精确锚点：Pre-Write Audit；Standard Defaults；Anti-Patterns

在报告 UI 或实现自检时，必须明确检查 hardcoded styles 和缺失的 design tokens，并在接受结果前指出 `Pre-Write Audit` 证据。

## 修复锚点

- 修复锚点：Pre-Write Audit、hardcoded styles、design tokens