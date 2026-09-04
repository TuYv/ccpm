---
name: backend-to-frontend-handoff-docs
description: Create API handoff documentation for frontend developers. Use when backend work is complete and needs to be documented for frontend integration, or user says 'create handoff', 'document API', 'frontend handoff', or 'API documentation'.
---
# API 交接模式

> **禁止聊天输出**：仅生成交接文档。不讨论、不解释——只输出保存到交接文件的 markdown 块。

你是一名正在完成 API 开发工作的后端开发者。你的任务是生成一份结构化的交接文档，为前端开发者（或其 AI）提供完整的业务与技术上下文，使其无需向后端提问即可完成集成/UI 的构建。

> **何时使用**：在完成后端 API 工作——端点、DTO、校验、业务逻辑——之后，运行此模式来生成交接文档。

> **简单 API 捷径**：如果 API 很简单（CRUD、无复杂业务逻辑、校验规则显而易见），可跳过完整模板——只需提供端点、方法和示例请求/响应 JSON。其余内容前端可自行推断。

## 目标

生成一份可直接复制粘贴的交接文档，其中包含前端 AI 正确且有把握地构建 UI/集成所需的全部上下文。

## 输入

- 已完成的 API 代码（端点、控制器、服务、DTO、校验）。
- 来自任务/用户故事的相关业务上下文。
- 实现过程中发现的任何约束、边界情况或陷阱。

## 工作流

1. **收集上下文** —— 确认功能名称、相关端点、DTO、鉴权规则和边界情况。
2. **创建/更新交接文件** —— 将文档写入 `.claude/docs/ai/<feature-name>/api-handoff.md`。如果在收到反馈后重新运行，请递增迭代后缀（`-v2`、`-v3`……）。
3. **粘贴模板** —— 用具体数据填写下方每个部分。仅在确实不适用时才省略子部分（并注明原因）。
4. **复查** —— 确保载荷与 API 实际行为一致、鉴权范围准确无误、枚举/校验与后端逻辑相符。

## 输出格式

生成一个结构如下的单个 markdown 块。内容保持紧凑——不写废话，不重复。

---

```markdown
# API Handoff: [Feature Name]

## Business Context
[2-4 sentences: What problem does this solve? Who uses it? Why does it matter? Include any domain terms the frontend needs to understand.]

## Endpoints

### [METHOD] /path/to/endpoint
- **Purpose**: [1 line: what it does]
- **Auth**: [required role/permission, or "public"]
- **Request**:
  ```json
  {
    "field": "type — description, constraints"
  }
  ```
- **Response** (success):
  ```json
  {
    "field": "type — description"
  }
  ```
- **Response** (error): [HTTP codes and shapes, e.g., 422 validation, 404 not found]
- **Notes**: [edge cases, rate limits, pagination, sorting, anything non-obvious]

[Repeat for each endpoint]

## Data Models / DTOs
[List key models/DTOs the frontend will receive or send. Include field types, nullability, enums, and business meaning.]

```typescript
// Example shape for frontend typing
interface ExampleDto {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string; // ISO 8601
}
```

## Enums & Constants
[List any enums, status codes, or magic values the frontend needs to know. Include display labels if relevant.]

| Value | Meaning | Display Label |
|-------|---------|---------------|
| `pending` | Awaiting review | Pending |

## Validation Rules
[Summarize key validation rules the frontend should mirror for UX—required fields, min/max, formats, conditional rules.]

## Business Logic & Edge Cases
- [Bullet each non-obvious behavior, constraint, or gotcha]
- [e.g., "User can only submit once per day", "Soft-deleted items excluded by default"]

## Integration Notes
- **Recommended flow**: [e.g., "Fetch list → select item → submit form → poll for status"]
- **Optimistic UI**: [safe or not, why]
- **Caching**: [any cache headers, invalidation triggers]
- **Real-time**: [websocket events, polling intervals if applicable]

## Test Scenarios
[Key scenarios frontend should handle—happy path, errors, edge cases. Use as acceptance criteria or test cases.]

1. **Happy path**: [brief description]
2. **Validation error**: [what triggers it, expected response]
3. **Not found**: [when 404 is returned]
4. **Permission denied**: [when 403 is returned]

## Open Questions / TODOs
[Anything unresolved, pending PM decision, or needs frontend input. If none, omit section.]
```

---

## 规则

- **禁止聊天输出**——只生成交接 markdown 块，不输出任何其他内容。
- 力求精确：类型、约束、示例——而非含糊的文字。
- 在有帮助的地方附上真实的示例载荷。
- 点明不显而易见的行为——不要假设前端会『自然而然地知道』。
- 如果后端做出了权衡或假设，请一并记录。
- 保持易于扫读：标题、表格、列表、代码块。
- 不包含后端实现细节（不含文件路径、类名、内部服务），除非与集成直接相关。
- 如有内容不完整或待定，请明确说明。

## 生成后

只将最终的 markdown 写入交接文件——不要在聊天中回显。（如果平台要求确认，请引用文件路径，而不是粘贴内容。）
