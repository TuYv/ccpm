---
name: document-api-endpoint
description: Document and type a Sentry API endpoint. Write or fix @extend_schema decorators, specify response TypedDicts, type request parameters, correct type drift between the declared schema and the runtime response, and validate the generated spec. Use when asked to "document an endpoint", "add OpenAPI docs", "add/fix @extend_schema", "type an endpoint response", "fix the response type", "fix type drift", "reuse a response type", "split an overloaded endpoint", "specify the response schema", "add a TypedDict response", "migrate a legacy api-docs path", "fix a parameter type", or "make an endpoint public" / "promote an endpoint" (promotion is one section here).
---
# 为 Sentry API 端点编写文档并标注类型

使用 drf-spectacular 为 Sentry 端点添加或修复 OpenAPI 文档。完整参考文档位于 https://develop.sentry.dev/backend/api/public/，其中对你最有用的部分是 https://develop.sentry.dev/backend/api/public/#5-method-decorator。本技能在此基础上总结了一些不易察觉的经验。大部分工作在于确保声明的 schema 与端点实际返回的内容一致。在编写文档之前，应先确定由哪个端点类处理该路由以及它的具体行为；调用该端点的 MCP 工具通常是确认其行为最快的方式。将 PRIVATE/EXPERIMENTAL 端点提升为 PUBLIC 是其中一种应用场景（见下文）。

## 工作流程

1. 类级别的 `@extend_schema(tags=[...])`——使用最接近的现有 `OPENAPI_TAGS` 条目。
2. 方法级别的 `@extend_schema(operation_id=..., parameters=[...], responses={...}, examples=...)`。
3. 复用 `src/sentry/apidocs/parameters.py` 和 `examples/*.py`；确保已设置 `owner = ApiOwner.<TEAM>`。
4. 如果旧版 `api-docs/paths/**/*.json` 覆盖了该路径，请将其删除（参见经验 4）。
5. 进行验证，然后与实时端点进行核对（经验 1）。

## 经验

### 1. 仔细比较代码的实际行为与声明的类型
理想情况下，应使用真实令牌请求实时端点，并将返回的键和类型与 TypedDict 进行差异比较。序列化器有时并不准确。注意检查以下情况：计数返回为浮点数而非整数、声明为 `int` 的 ID 输出为字符串、嵌套类型声明了错误数量的字段。应修正声明的类型，使其与运行时行为一致。
```bash
curl -s -H "Authorization: Bearer $TOKEN" "https://us.sentry.io/api/0/<endpoint>" | jq 'keys'
```

### 2. 复用规范的响应类型
遵循代码库中的 `XxxResponseOptional(TypedDict, total=False)` mixin 模式（主类声明必需字段）。可为 null 与不存在的区别：`T | None` = 键始终存在，但值可能为 null；`NotRequired[T]` = 仅在特定条件下设置该键（例如传入 `expand` 查询参数）。应复用现有的规范类型，而不是在 `*_types.py` 中重新声明第二份或第三份副本。如果没有可直接复用的规范类型（例如来自 vroom/profiling 等其他服务的代理 payload），应将其类型标注为 `dict[str, Any]`，而不是自行创建新的镜像类型；同时应从所属服务的仓库确认其结构，而不能只参考序列化器。

### 3. 让类型自行推断。避免使用 `cast` 和 `# type: ignore`
当序列化器返回基础类型并附加额外字段时，应重构生成响应的代码，使响应类型能够被推断，而不是强制指定。

### 4. 旧版文档迁移必须按路径整体完成
删除 `api-docs/paths/**/*.json` 文件及其在 `api-docs/openapi.json` 中的 `$ref`。drf-spectacular 的 `APPEND_PATHS` 不会合并 HTTP 方法，因此一旦某个路径上的任何方法使用了 `@extend_schema`，该路径上的所有*旧版*方法都会消失——应在一次提交中迁移该路径上的所有方法。

## 提升为 PUBLIC

完成上述工作流程后，仅对具体端点执行以下操作（同级端点保持 PRIVATE）：

- 将 `publish_status[<METHOD>]` → `PUBLIC`，并设置 `owner = ApiOwner.<TEAM>`。
- 在切换状态的同一次变更中，从 `API_OWNERSHIP_ALLOWLIST_DONT_MODIFY` 中移除该方法。
- 如果端点已冗余或正在重命名，应先在单独的变更中删除或弃用旧版本，然后在此基础上叠加发布变更。
- 如果 scope 变宽（`event:read` → `event:{admin,read,write}`），请在 PR 中注明——这是 drf-spectacular 根据 `permission_classes` 重新生成的结果，仅影响文档。

只有在 `sentry-api-schema` 重新生成下游内容后，更改才会同步到 `@sentry/api` SDK / MCP。

## 验证

```bash
make build-api-docs
pnpm run validate-api-examples
.venv/bin/pytest -q --reuse-db tests/apidocs/endpoints/<area>/test_<name>.py
.venv/bin/prek run -q --files <changed paths>
```