---
name: document
description: |
  Document canvas for displaying and editing markdown content.
  Use when showing documents, emails, or when users need to select text for editing.
---
# 文档画布

显示 Markdown 文档，并提供可选的文本选择和差异高亮功能。

## 示例提示词

可以尝试向 Claude 提出：

- “起草一封发给营销团队的电子邮件，内容关于第一季度产品发布”
- “帮我编辑这篇博客文章——显示文章内容，以便我高亮需要修改的部分”
- “撰写一份项目提案并让我审阅”
- “显示 README，以便我选择要更新的章节”
- “为这则客户投诉撰写回复”

## 场景

### `display`（默认）
带 Markdown 渲染的只读文档视图。用户可以滚动，但无法选择文本。

```bash
bun run src/cli.ts show document --scenario display --config '{
  "content": "# Hello World\n\nThis is **markdown** content.",
  "title": "My Document"
}'
```

### `edit`
支持文本选择的交互式文档视图。用户可以通过单击并拖动来选择文本，所选内容会通过 IPC 实时发送。

- 渲染 Markdown 并提供语法高亮（标题、粗体、斜体、代码、链接、列表、引用块）
- 差异高亮：新增内容使用绿色背景，删除内容使用红色背景
- 单击并拖动以选择文本
- 所选内容自动通过 IPC 发送

```bash
bun run src/cli.ts spawn document --scenario edit --config '{
  "content": "# My Blog Post\n\nThis is the **introduction** to my post.\n\n## Section One\n\n- Point one\n- Point two",
  "title": "Blog Post Draft",
  "diffs": [
    {"startOffset": 50, "endOffset": 62, "type": "add"}
  ]
}'
```

### `email-preview`
用于显示电子邮件内容的专用视图。

```bash
bun run src/cli.ts show document --scenario email-preview --config '{
  "content": "Dear Team,\n\nPlease review the attached document.\n\nBest regards,\nAlice",
  "title": "RE: Project Update"
}'
```

## 配置

```typescript
interface DocumentConfig {
  content: string;        // Markdown content
  title?: string;         // Document title (shown in header)
  diffs?: DocumentDiff[]; // Optional diff markers for highlighting
  readOnly?: boolean;     // Disable selection (default: false for edit)
}

interface DocumentDiff {
  startOffset: number;    // Character offset in content
  endOffset: number;
  type: "add" | "delete";
}
```

## Markdown 渲染

支持的 Markdown 功能：
- **标题**（`# H1`、`## H2` 等）
- **粗体**（`**text**`）
- **斜体**（`*text*`）
- **代码**（`` `inline` `` 和围栏代码块）
- **链接**（`[text](url)`）
- **列表**（使用 `-` 或 `*` 作为项目符号）
- **引用块**（`>`）

## 选择结果

```typescript
interface DocumentSelection {
  selectedText: string;   // The selected text
  startOffset: number;    // Start character offset
  endOffset: number;      // End character offset
  startLine: number;      // Line number (1-based)
  endLine: number;
  startColumn: number;    // Column in start line
  endColumn: number;
}
```

## 控制方式

- **鼠标单击并拖动**：选择文本（`edit` 场景）
- `↑/↓` 或滚动：浏览文档
- `q` 或 `Esc`：关闭/取消

## API 用法

```typescript
import { editDocument, displayDocument } from "${CLAUDE_PLUGIN_ROOT}/src/api";

// Display read-only document
await displayDocument({
  content: "# My Document\n\nContent here.",
  title: "View Mode",
});

// Interactive editing with selection
const result = await editDocument({
  content: "# My Document\n\nSelect some **text** here.",
  title: "Edit Mode",
  diffs: [{ startOffset: 20, endOffset: 30, type: "add" }],
});

if (result.success && result.data) {
  console.log(`Selected: "${result.data.selectedText}"`);
  console.log(`Position: ${result.data.startOffset}-${result.data.endOffset}`);
}
```