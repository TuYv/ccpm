---
name: tool-renderer
description: Implement specialized rendering for Claude Code tools. Use when adding a new tool type (WebSearch, WebFetch, etc.) to the transcript viewer, or when asked to implement tool rendering.
---
# 实现工具渲染器

本指南以 WebSearch 为例，介绍如何为新的 Claude Code 工具添加渲染支持。

## 开始之前

**检查现有测试数据**，以了解工具实际的 JSON 结构：

```bash
# Find test files containing the tool
rg -l "ToolName" test/test_data/

# Look at actual JSONL entries
rg '"name":\s*"ToolName"' test/test_data/ -A 2 -B 2
```

需要识别的关键字段：
- **输入参数**：`tool_use.input` 中包含什么？
- **toolUseResult 结构**：结构化结果包含哪些元数据？
- **tool_result.content**：原始文本输出是什么样的？

转录条目中的 `toolUseResult` 字段通常包含比 `tool_result.content` 更丰富的结构化数据。**如果 `toolUseResult` 可用，始终优先从中解析。**

## 概述

工具渲染涉及多个协同工作的组件：

1. **模型**（`models.py`）- 工具输入和输出的类型定义
2. **工厂**（`factories/tool_factory.py`）- 将原始 JSON 解析为类型化模型
3. **HTML 格式化器**（`html/tool_formatters.py`）- HTML 渲染函数
4. **渲染器** - 与 HTML 和 Markdown 渲染器集成

## 第 1 步：定义模型

### 工具输入模型

在 `models.py` 中为工具的输入参数添加 Pydantic 模型：

```python
class WebSearchInput(BaseModel):
    """Input parameters for the WebSearch tool."""
    query: str
```

### 工具输出模型

为解析后的输出添加 dataclass。输出模型使用 dataclass（而非 Pydantic），因为它们由我们的解析器创建，而不是从 JSON 创建：

```python
@dataclass
class WebSearchLink:
    """Single search result link."""
    title: str
    url: str

@dataclass
class WebSearchOutput:
    """Parsed WebSearch tool output."""
    query: str
    links: list[WebSearchLink]
    preamble: Optional[str] = None  # Text before the Links
    summary: Optional[str] = None   # Markdown analysis after the Links
```

**注意：**某些工具具有包含多个部分的结构化输出。WebSearch 被解析为**前言/链接/摘要**——Links 之前的文本、Links JSON 数组，以及其后的 Markdown 分析。这样既能实现灵活渲染，又能保留所有内容。

### 更新类型联合

将新类型添加到 `ToolInput` 和 `ToolOutput` 联合中：

```python
ToolInput = Union[
    # ... existing types ...
    WebSearchInput,
    ToolUseContent,  # Generic fallback - keep last
]

ToolOutput = Union[
    # ... existing types ...
    WebSearchOutput,
    ToolResultContent,  # Generic fallback - keep last
]
```

## 第 2 步：实现工厂函数

在 `factories/tool_factory.py` 中：

### 注册输入模型

将输入模型添加到 `TOOL_INPUT_MODELS`：

```python
TOOL_INPUT_MODELS: dict[str, type[BaseModel]] = {
    # ... existing entries ...
    "WebSearch": WebSearchInput,
}
```

### 实现输出解析器

**重要提示**：始终检查工具是否有可用的结构化 `toolUseResult` 数据。这是首选方法，原因如下：
- 它比使用正则表达式解析文本内容更可靠
- 它通常包含文本中没有的元数据（计时、字节数、状态码）
- 其结构定义明确且具备类型安全性

测试数据中的 `toolUseResult` 结构示例：
```json
// WebSearch
{"query": "...", "results": [...], "durationSeconds": 15.7}

// WebFetch
{"url": "...", "result": "...", "code": 200, "codeText": "OK", "bytes": 12345, "durationMs": 1500}
```

创建一个解析器函数，从 `toolUseResult` 中提取数据：

```python
def _parse_websearch_from_structured(
    tool_use_result: ToolUseResult,
) -> Optional[WebSearchOutput]:
    """Parse WebSearch from structured toolUseResult data.

    The toolUseResult for WebSearch has the format:
    {
        "query": "search query",
        "results": [
            {"tool_use_id": "...", "content": [{"title": "...", "url": "..."}]},
            "Analysis text..."
        ]
    }
    """
    if not isinstance(tool_use_result, dict):
        return None
    query = tool_use_result.get("query")
    results = tool_use_result.get("results")
    # ... extract links from results[0].content, summary from results[1] ...
    return WebSearchOutput(query=query, links=links, preamble=None, summary=summary)


def parse_websearch_output(
    tool_result: ToolResultContent,
    file_path: Optional[str],
    tool_use_result: Optional[ToolUseResult] = None,  # Extended signature
) -> Optional[WebSearchOutput]:
    """Parse WebSearch tool result from structured toolUseResult."""
    del tool_result, file_path  # Unused
    if tool_use_result is None:
        return None
    return _parse_websearch_from_structured(tool_use_result)
```

### 注册输出解析器

将其添加到 `TOOL_OUTPUT_PARSERS`；如果使用扩展签名，**还需在 `PARSERS_WITH_TOOL_USE_RESULT` 中注册**：

```python
TOOL_OUTPUT_PARSERS: dict[str, ToolOutputParser] = {
    # ... existing entries ...
    "WebSearch": parse_websearch_output,
}

# REQUIRED for parsers that use toolUseResult - without this, the structured
# data won't be passed to your parser!
PARSERS_WITH_TOOL_USE_RESULT: set[str] = {"WebSearch", "WebFetch"}
```

**注意**：如果解析器使用 3 参数签名 `(tool_result, file_path, tool_use_result)`，则必须将其添加到 `PARSERS_WITH_TOOL_USE_RESULT`。否则，`create_tool_output()` 将不会传递结构化数据。

## 第 3 步：实现 HTML 格式化器

在 `html/tool_formatters.py` 中：

### 输入格式化器

**设计考量**：标题已经显示了关键信息（工具名称 + 主要参数）。仅当正文内容能够提供额外价值或因过长而无法完整显示在标题中时，才在正文中显示内容。

```python
def format_websearch_input(search_input: WebSearchInput) -> str:
    """Format WebSearch tool use content."""
    # If query is short enough to fit in title, return empty
    if len(search_input.query) <= 100:
        return ""  # Full query shown in title
    escaped_query = escape_html(search_input.query)
    return f'<div class="websearch-query">{escaped_query}</div>'
```

当标题已经显示了所有重要信息时，这可以避免内容重复。

### 输出格式化器

对于具有 WebSearch 这类结构化内容的工具，将所有部分合并为 Markdown，然后进行渲染：

```python
def _websearch_as_markdown(output: WebSearchOutput) -> str:
    """Convert WebSearch output to markdown: preamble + links list + summary."""
    parts = []
    if output.preamble:
        parts.extend([output.preamble, ""])
    for link in output.links:
        parts.append(f"- [{link.title}]({link.url})")
    if output.summary:
        parts.extend(["", output.summary])
    return "\n".join(parts)


def format_websearch_output(output: WebSearchOutput) -> str:
    """Format WebSearch as single collapsible markdown block."""
    markdown_content = _websearch_as_markdown(output)
    return render_markdown_collapsible(markdown_content, "websearch-results")
```

### 更新导出

将函数添加到 `__all__`：

```python
__all__ = [
    # ... existing exports ...
    "format_websearch_input",
    "format_websearch_output",
]
```

## 第 4 步：接入 HTML 渲染器

在 `html/renderer.py` 中：

### 导入格式化函数

```python
from .tool_formatters import (
    # ... existing imports ...
    format_websearch_input,
    format_websearch_output,
)
```

### 添加格式化方法

```python
def format_WebSearchInput(self, input: WebSearchInput, _: TemplateMessage) -> str:
    return format_websearch_input(input)

def format_WebSearchOutput(self, output: WebSearchOutput, _: TemplateMessage) -> str:
    return format_websearch_output(output)
```

### 添加标题方法（可选）

如需在消息头中使用自定义标题：

```python
def title_WebSearchInput(self, input: WebSearchInput, message: TemplateMessage) -> str:
    return self._tool_title(message, "🔎", f'"{input.query}"')
```

### 注意：模板是否抑制扳手图标取决于表情符号的范围

工具使用消息默认会由 `templates/transcript.html` 添加 `🛠️` 前缀，*除非*标题已经以 `html/utils.py::starts_with_emoji` 能够识别的表情符号开头。该函数将识别范围限定在以下特定 Unicode 区间：

- `0x2300-0x23FF` 杂项技术符号（`⏰ ⏳ ⏱️ ⏲️ ⏸ ⏹ ⏺ ⏏`……）
- `0x2600-0x26FF` 杂项符号
- `0x2700-0x27BF` 装饰符号
- `0x1F300-0x1F5FF` 杂项符号和象形文字
- `0x1F600-0x1F64F` 表情符号
- `0x1F680-0x1F6FF` 交通和地图符号
- `0x1F900-0x1F9FF` 补充符号

如果传递给 `_tool_title` 的图标位于这些范围**之外**，模板会贴心地在其前面添加一个 `🛠️`，从而生成类似 `🛠️ <your-icon> <ToolName>` 这样多余的双图标标题。可通过渲染一个固件并使用 grep 检查 `🛠️` 是否与你的图标同时出现，或者对照上述范围检查 `ord(your_icon)` 来验证。

如果你的图标是真正的表情符号，但位于未列出的 Unicode 范围内，请将该范围**添加到** `starts_with_emoji`，而不是选择其他图标。

## 第 5 步：实现 Markdown 渲染器

在 `markdown/renderer.py` 中：

### 导入模型

```python
from ..models import (
    # ... existing imports ...
    WebSearchInput,
    WebSearchOutput,
)
```

### 添加格式化方法

```python
def format_WebSearchInput(self, input: WebSearchInput, _: TemplateMessage) -> str:
    """Format -> empty (query shown in title)."""
    return ""

def format_WebSearchOutput(self, output: WebSearchOutput, _: TemplateMessage) -> str:
    """Format -> markdown list of links."""
    parts = [f"Query: *{output.query}*", ""]
    for link in output.links:
        parts.append(f"- [{link.title}]({link.url})")
    return "\n".join(parts)

def title_WebSearchInput(self, input: WebSearchInput, _: TemplateMessage) -> str:
    """Title -> '🔎 WebSearch `query`'."""
    return f'🔎 WebSearch `{input.query}`'
```

## 第 6 步：添加测试

创建专用测试文件 `test/test_{toolname}_rendering.py`。测试是**必需的**——它们能够捕获回归问题并记录预期行为。

### 测试结构

```python
"""Test cases for {ToolName} tool rendering."""

from claude_code_log.factories.tool_factory import parse_{toolname}_output
from claude_code_log.html.tool_formatters import (
    format_{toolname}_input,
    format_{toolname}_output,
)
from claude_code_log.models import (
    ToolResultContent,
    {ToolName}Input,
    {ToolName}Output,
)


class Test{ToolName}Input:
    """Test input model and formatting."""

    def test_input_basic(self):
        """Test input model creation."""
        ...

    def test_format_input_short(self):
        """Test formatting when content fits in title."""
        ...

    def test_format_input_long(self):
        """Test formatting when content is too long for title."""
        ...


class Test{ToolName}Parser:
    """Test output parsing."""

    def test_parse_structured_output(self):
        """Test parsing from structured toolUseResult."""
        ...

    def test_parse_minimal_output(self):
        """Test parsing with only required fields."""
        ...

    def test_parse_missing_field(self):
        """Test graceful failure with missing required field."""
        ...

    def test_parse_no_tool_use_result(self):
        """Test returns None when no toolUseResult."""
        ...


class Test{ToolName}OutputFormatting:
    """Test output HTML formatting."""

    def test_format_output_full(self):
        """Test formatting with all metadata."""
        ...

    def test_format_output_minimal(self):
        """Test formatting with minimal data."""
        ...
```

### 运行测试

```bash
# Run just your new tests
uv run pytest test/test_{toolname}_rendering.py -v

# Run full test suite to check for regressions
uv run pytest -m "not (tui or browser)" -v
```

## 检查清单

### 模型（`models.py`）
- [ ] 添加输入模型（Pydantic `BaseModel`）
- [ ] 添加输出模型（包含 `toolUseResult` 中所有字段的数据类）
- [ ] 更新 `ToolInput` 联合类型
- [ ] 更新 `ToolOutput` 联合类型

### 工厂（`factories/tool_factory.py`）
- [ ] 添加到 `TOOL_INPUT_MODELS`
- [ ] 导入输出模型
- [ ] 如果使用 `toolUseResult`，实现具有 3 个参数签名的输出解析器
- [ ] 添加到 `TOOL_OUTPUT_PARSERS`
- [ ] 添加到 `PARSERS_WITH_TOOL_USE_RESULT`（如果解析器使用 `toolUseResult`，则为必需项）

### HTML（`html/tool_formatters.py`、`html/renderer.py`）
- [ ] 导入模型
- [ ] 添加输入格式化函数
- [ ] 添加输出格式化函数
- [ ] 更新 `__all__` 导出
- [ ] 在渲染器中接入 `format_{Input}` 方法
- [ ] 在渲染器中接入 `format_{Output}` 方法
- [ ] 在渲染器中添加 `title_{Input}` 方法

### Markdown（`markdown/renderer.py`）
- [ ] 导入模型
- [ ] 添加 `format_{Input}` 方法
- [ ] 添加 `format_{Output}` 方法
- [ ] 添加 `title_{Input}` 方法

### 测试（`test/test_{toolname}_rendering.py`）
- [ ] 创建测试文件
- [ ] 测试输入模型的创建
- [ ] 测试输入格式化（短内容/长内容）
- [ ] 使用完整的结构化数据测试解析器
- [ ] 使用最少数据测试解析器
- [ ] 测试字段缺失时的解析器行为（优雅失败）
- [ ] 测试没有 `toolUseResult` 时的解析器行为
- [ ] 测试输出格式化
- [ ] 运行完整测试套件以验证没有回归问题