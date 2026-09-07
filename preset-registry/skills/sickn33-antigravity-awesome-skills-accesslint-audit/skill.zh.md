---
name: accesslint-audit
description: "Find and fix WCAG 2.2 accessibility issues. Two modes — report (sweep a codebase or page, produce a prioritized written report, no edits) and fix (audit→edit→verify loop on a target). Prefers direct-CDP live-DOM auditing; falls back to a browser-MCP composition or HTML-string audits."
risk: safe
source: "https://github.com/AccessLint/skills"
date_added: "2026-06-02"
---
你对可访问性进行审计，并视情况修复存在的问题。

## 何时使用
- 当任务符合以下描述时使用本技能：发现并修复 WCAG 2.2 可访问性问题。两种模式——报告（扫描代码库或页面，产出一份按优先级排序的书面报告，不修改文件）和修复（对目标执行审计→编辑→验证循环）。优先使用直接 CDP 的实时 DOM 审计；回退到浏览器 MCP 组合或 HTML 字符串审计。

## 根据用户意图选择模式

- **报告模式**——“审计我的代码库”、“审查 src/components/”、“这个页面有什么问题？”、“给我一份 a11y 报告”。你审计并撰写报告。**你不修改文件。**
- **修复模式**——“修复 X 中的 a11y 问题”、“审计并修复”、“让这个变得可访问”、“验证对比度修复是否已生效”，或者用户交给你一份违规报告并要求应用它。你审计 → 编辑 → 验证。

如果不确定，就询问。当用户只要求审计时，不要默认执行修复。

对于主线程上下文开销敏感的超大规模扫描，可以通过 `Task`（通用代理）调用本技能以实现上下文隔离。两种方式下的步骤是相同的。

## 选择流程

三种流程，按偏好程度排序。

1. **`audit_live`**——对任何 URL 都优先尝试。连接到一个正在运行的 Chrome 调试会话，或自动启动最小化的 Chrome——无需用户任何设置。单次调用；IIFE 字节不会进入你的上下文。
2. **`audit-live-page` prompt**——当用户需要审计其**现有浏览器会话**（已登录的应用、特定状态）且已连接浏览器 MCP（chrome-devtools-mcp、playwright-mcp、puppeteer-mcp）时使用。通过 `Skill` 调用，并带上 `mode: "fix"` 或 `mode: "plan"`。
3. **`audit_html`**——用于原始 HTML 字符串、文件（先用 `Read`，再用 `audit_html`），或你已渲染为字符串的 JSX。在修复模式下配合 `audit_diff({ html })` 进行验证。

对于非 URL 目标，直接跳到流程 3。对于 URL，先尝试流程 1；若自动启动失败且已连接浏览器 MCP，则使用流程 2；否则回退到流程 3，并注明实时 DOM 覆盖范围有限。

## 范围处理（报告模式）

- **目录路径**——分析其中的所有相关文件。
- **多个文件**——分析列出的文件及其引用到的导入。
- **一个 URL**——审计它。如果是 dev-server URL，则使用流程 1 或 2。
- **无参数**——请用户缩小范围。全代码库扫描很少是正确的做法。

在报告开头明确说明范围。

## 方法（报告模式）

1. **摸清范围。**使用 Glob/Grep 枚举组件、模板、样式。抽样有代表性的文件；不要盲目打开所有文件。
2. **尽可能进行实时审计**——渲染后的 DOM 能发现源码无法展示的问题。使用上文的选择方法。
3. **寻找模式。**如果一个组件违反了某条规则，相似的组件很可能也是如此。按规则 ID 和组件家族分组——不要把同一个问题列 30 次、每次列 30 个实例。
4. **按用户影响排定优先级。**严重/重要问题优先。一条规则的大量低影响违规往往只需一次根因修复。
5. **在扫描阶段的调用中使用 `format: "compact"`。**将详细输出保留给报告中要展开说明的规则。**
6. **信任 `Source:` 行。**针对 React 开发构建的实时 DOM 审计会通过 DevTools fibers 为每个违规附上 `Source: <file>:<line> (Symbol)`。用它作为文件定位指针，而不是去 grep 选择器。缺失时按稳定钩子 → 可见文本 → 树位置回退。
7. **当单次审计返回超过约 50 个违规时，停下来询问**——一份 200 个违规的报告没有可操作性。

引擎捕获的是可机械检测的问题。内容清晰度、屏幕阅读器播报质量、键盘流程连贯性以及复杂的视觉对比度需要人工判断——将这些标记为需要人工审查，不要猜测。

### 报告格式

```
# Accessibility audit — <scope>

## Summary
- N critical, M serious, K moderate, J minor (after deduplication)
- Most impactful patterns: <one-line each, max 3>

## Critical (blocks access)
For each pattern:
- **Pattern**: <one-line description>
- **WCAG**: <ID> — <name>
- **Affected files**: <file:line> (×N if repeated)
- **Fix**: <directive from engine output, or specific code change>
- **Why critical**: <user impact>

## Serious
[same shape]

## Moderate / Minor
[Bullet list, deduplicated by rule. Skip per-instance detail unless the fix differs.]

## Recommendations
- Architectural / pattern-level changes that would prevent recurrence.
- Tooling or component abstractions worth introducing.
- What to verify manually (screen reader, keyboard, low-vision testing).

## Positive findings
What the codebase does well — short, factual, reinforces practices to keep.
```

每个条目都要包含规则 ID。对 `mechanical` 规则逐字引用 `Fix:` 指令。对 `visual` / `contextual`，留下带规则 ID 的 `TODO`；不要编造内容。

## 步骤（修复模式）

1. **建立基线。**使用 `name: "before"` 和 `format: "compact"` 进行审计。
2. **规划 + 应用。**对每个违规：
   - 存在 `Source:` 行 → 打开该文件的那一行。如果列出了多个（以 `←` 分隔），第一个是 JSX 字面量；其余是外层组件。使用 `Symbol` 来消歧。
   - 没有 `Source:` → 先 grep 稳定钩子（`data-testid`、`id`、`aria-label`），然后是可见文本，然后是树位置。
   - 违规的 `Fixability:` 和 `Fix:` 字段是权威依据——逐字应用机械性修复，对 `contextual` / `visual` 留下带规则 ID 的 `TODO`。绝不编造内容。
   - 将同一文件的编辑合并为一个操作。
   - 在触碰明显目标之外的文件之前，或在执行超过约 10 处机械性修复之前，先与用户确认范围。
3. **验证。**针对基线运行 `audit_diff({ audit_name: "before" })`（或用一个新名称重新建立基线）。确认 `-fixed` 覆盖了你的目标且 `+new` 为空。

`Source:` 行来自 React DevTools fibers，仅出现在针对 React 开发构建的实时 DOM 审计中。静态审计不会有——回退到选择器。

对某条规则不确定时，调用 `explain_rule({ id: "<rule-id>" })` 以获取指导和 `browserHint`。

## 何时中止（修复模式）

- 某个违规没有 `Fix:` 指令——留下 `TODO`，不要猜测。
- 验证失败（`+new` 中有任何内容，或 `-fixed` 缺少目标规则）——指出问题并停止。不要默默地反复迭代。

## 输出（修复模式）

每个周期：使用的流程、按影响程度划分的违规、已应用的修改（文件 + 规则）、已推迟的内容（`TODO` + 原因）、最终 diff。

## 局限性
- 仅当任务明确符合上述范围时才使用本技能。
- 不要将输出视为针对特定环境的验证、测试或专家审查的替代品。
- 如果缺少必要输入、权限、安全边界或成功标准，请停下来并要求澄清。
