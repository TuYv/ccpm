---
name: ax-add-ingest-stage
description: Use when adding a new ingest stage or a new SurrealDB table to the ax graph. Encodes the exact registration gotchas that fail CI if missed.
---
# 向 ax 添加摄取阶段 / 表

来之不易的检查清单——以下每个步骤都有对应的 CI 门禁，跳过任何一步都会导致失败。

## 新增 SurrealDB 表
1. 将 `DEFINE TABLE ... SCHEMAFULL` 及字段添加到 `packages/schema/src/schema.surql`（显式定义顶层字段；嵌套对象 → JSON 编码的 `string`；日期时间使用 JS `Date`）。
2. **在 `SCHEMA_TABLES` 中注册该表**（`apps/axctl/src/queries/insights.ts`）——镜像测试会比较 `DEFINE TABLE` 名称与 `SCHEMA_TABLES`，如有遗漏则 **CI 失败**。
3. 在 worktree 中运行 `bun install`，确保 `@ax/schema` 解析到 worktree 副本（而不是主工作树的符号链接），之后镜像测试才能通过。

## 新增带 `derive` 标签的摄取阶段
1. 将 `StageDef` 放在阶段文件底部（参照 `apps/axctl/src/ingest/derive-opportunities.ts`）：`export const FooKey = Schema.Literal("foo")` + `fooStage`。
2. 在 `apps/axctl/src/ingest/stage/registry.ts` 中注册：添加 import，将 `FooKey` 添加到 `IngestStageKey` 的 `Schema.Union([...])` 中，并将 `fooStage` 添加到 `ALL_STAGES`。
3. **更新 `apps/axctl/src/cli/effect-cli.test.ts`**：将 `resolveIngestStages: default runs every stage` 的 `.toHaveLength(N)` 增加 1，并将你的 key（按顺序排列）添加到 `--derive-only` 列表中。否则 CI 会失败。
4. **隔离失败**：使用 `Effect.catchCause` 包装阶段主体并返回零行统计结果，确保阶段错误永远不会中止外围的摄取流程。

## 新增 CLI 子命令
必须在**两个** CLI 参考文档门禁中记录，否则 CI 会失败：`docs/cli.md`（或 README）+ `apps/site/public/llms.txt`（scripts/check-cli-reference.ts），并在 `apps/site/app/routes/docs/-cli-reference.data.ts` 中添加一张卡片（scripts/check-site-cli-reference.test.ts）。

## Effect v4 beta 的注意事项
- 多参数 `Schema.Literal(...)` 会被折叠 → 使用 `Schema.Literals([...])`。
- `Schema.Date` 无法完成 JSON 往返转换 → 使用 `Schema.DateFromString.check(Schema.isDateValid())`。