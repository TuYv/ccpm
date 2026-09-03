---
name: changelog
description: Use when updating CHANGELOG.md. Enforces consistent formatting with bolded item names, dash separators, and specific section ordering.
---
# 更新日志写作风格

## 格式

基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) 规范。

## 条目结构

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added/Changed/Fixed/Removed

- **`item-name`** - Description of change
  - Sub-bullet for additional details
  - Another detail if needed
```

## 规则

1. **加粗条目名称** - 始终以 `**\`item-name\`\*\*` 的形式包裹（加粗内部使用反引号）
2. **短横线分隔符** - 在条目名称和描述之间使用 `-`
3. **首字母大写** - 描述以大写字母开头
4. **不加句号** - 描述结尾不加句号
5. **子条目** - 缩进 2 个空格，用于补充细节

## 小节顺序

1. 新增
2. 变更
3. 修复
4. 移除

仅包含有内容的小节。

## 示例

好的：

```markdown
- **`debug plugin`** - Renamed skill: systematic-debugging → debug
- **`/workflows:plan` command** - Interactive Q&A refinement phase (#88)
  - After generating initial plan, now offers to refine with targeted questions
  - Asks up to 5 questions about ambiguous requirements
```

不好的：

```markdown
- debug plugin - renamed skill # missing bold/backticks
- **debug plugin**: renamed skill # colon instead of dash
- **`debug plugin`** - renamed skill. # has period
```

## 版本号规则

- 主版本（X.0.0）- 破坏性变更、大规模移除
- 次版本（X.Y.0）- 新功能、新插件
- 修订版本（X.Y.Z）- Bug 修复、重命名、文档更新
