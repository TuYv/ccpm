---
name: core-actionbook
description: "Internal support skill for actionbook MCP selectors used by Rust documentation research workflows. Use only when another rust-skills workflow explicitly requests actionbook-backed selectors."
user-invocable: false
disable-model-invocation: true
---
# Actionbook

预先计算的浏览器自动化操作手册。智能体无需解析完整的 HTML，而是接收结构化的页面信息。

## 工作流程

1. **search_actions** - 按关键字搜索，返回基于 URL 的操作 ID 和内容预览
2. **get_action_by_id** - 获取包含页面详情、DOM 结构和元素选择器的完整操作手册
3. **执行** - 使用浏览器自动化工具和返回的选择器执行操作

## MCP 工具

- `search_actions` - 按关键字搜索。返回：基于 URL 的操作 ID、内容预览、相关性分数
- `get_action_by_id` - 获取完整的操作详情。返回：操作内容、页面元素选择器（CSS/XPath）、元素类型、允许的方法（click、type、extract）、文档元数据

### 参数

**search_actions**:
- `query`（必需）：搜索关键字（例如，"airbnb search"、"google login"）
- `type`：`vector` | `fulltext` | `hybrid`（默认）
- `limit`：最大结果数（默认：5）
- `sourceIds`：按来源 ID 筛选（以逗号分隔）
- `minScore`：最低相关性分数（0-1）

**get_action_by_id**:
- `id`（必需）：基于 URL 的操作 ID（例如，`example.com/page`）

## 响应示例

```json
{
  "title": "Airbnb Search",
  "url": "www.airbnb.com/search",
  "elements": [
    {
      "name": "location_input",
      "selector": "input[data-testid='structured-search-input-field-query']",
      "type": "textbox",
      "methods": ["type", "fill"]
    }
  ]
}
```