---
name: draft-patterns
description: |
  Use when asked about UX patterns, interaction best practices, form design,
  navigation patterns, or loading states. Examples: "best practice for form
  validation", "navigation pattern for dashboard", "loading state UX"
allowed-tools: Read, Bash, Glob, Grep
version: 0.6.6
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# draft-patterns — UX 模式参考

遵循 docs/output-kit.md 中定义的输出格式——CLI 最多 40 行、框线绘制骨架、统一的严重性指标、压缩后的文字。

## 使用时机

用户询问交互模式、最佳实践、表单设计、导航或加载/空状态相关内容时。

## 工作流程

1. **从用户请求中识别模式类别**（表单、导航、加载、空状态、模态框等）
2. **搜索 UX 知识库：**

   ```bash
   python3 -m draft_agent.uiux search --domain ux --query "{pattern_category}" --limit 5
   ```

3. **交叉参考结果中的严重性评级**——优先呈现 Critical 和 High
4. **输出**包含代码示例和严重性评级的结构化应做/不应做表格

## 输出格式

```
┌─ UX Patterns — {pattern_category} ──────────────────────────────────────────┐
│ Category    │ Issue              │ Do                  │ Don't    │ Severity │
├─────────────┼────────────────────┼─────────────────────┼──────────┼──────────┤
│ {category}  │ {issue}            │ {do}                │ {dont}   │ Critical │
│ {category}  │ {issue}            │ {do}                │ {dont}   │ High     │
│ {category}  │ {issue}            │ {do}                │ {dont}   │ Medium   │
└─────────────┴────────────────────┴─────────────────────┴──────────┴──────────┘

Code example ({do_example_label}):
{code_block}
```

## 反模式

- 切勿在未检查平台上下文（Web、移动端还是桌面端）的情况下推荐模式
- 切勿忽略严重性评级——必须明确指出 Critical 问题
- 每个类别展示的模式不得超过 7 个，除非进行分组
- 对于实现层面的问题，切勿省略代码示例

## 交付

如果输出超过 CLI 的 40 行限制，则调用 `/atlas-report` 并提供完整发现结果。HTML 报告即为输出。CLI 只是回执——包含框线标题、单行结论、前 3 项发现以及报告路径。切勿将分析内容直接倾倒到 CLI 中。