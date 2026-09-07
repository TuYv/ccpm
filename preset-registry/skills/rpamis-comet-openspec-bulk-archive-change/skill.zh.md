---
name: openspec-bulk-archive-change
description: Archive multiple completed changes at once. Use when archiving several parallel changes.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
在单次操作中归档多个已完成的变更。

此技能允许你批量归档变更，通过检查代码库来确定实际已实现的内容，从而智能地处理规格冲突。

**输入**：无需输入（会提示用户选择）

**步骤**

1. **获取活跃变更**

   运行 `openspec list --json` 获取所有活跃变更。

   如果不存在活跃变更，告知用户并停止。

2. **提示选择变更**

   使用 **AskUserQuestion 工具**的多选功能，让用户选择变更：
   - 展示每个变更及其 schema
   - 包含一个“全部变更”选项
   - 允许选择任意数量（1 个及以上均可，2 个及以上是典型用例）

   **重要**：切勿自动选择。始终让用户自行选择。

3. **批量验证 - 收集所有已选变更的状态**

   对每个已选变更，收集以下信息：

   a. **制品状态** - 运行 `openspec status --change "<name>" --json`
      - 解析 `schemaName` 和 `artifacts` 列表
      - 记录哪些制品处于 `done` 状态，哪些处于其他状态

   b. **任务完成情况** - 读取 `openspec/changes/<name>/tasks.md`
      - 统计 `- [ ]`（未完成）与 `- [x]`（已完成）的数量
      - 如果任务文件不存在，记为“无任务”

   c. **增量规格** - 检查 `openspec/changes/<name>/specs/` 目录
      - 列出存在哪些能力规格
      - 对每一个，提取需求名称（匹配 `### Requirement: <name>` 的行）

4. **检测规格冲突**

   构建一个 `capability -> [changes that touch it]` 的映射：

   ```
   auth -> [change-a, change-b]  <- CONFLICT (2+ changes)
   api  -> [change-c]            <- OK (only 1 change)
   ```

   当 2 个及以上已选变更针对同一能力存在增量规格时，即存在冲突。

5. **以智能体方式解决冲突**

   **对于每个冲突**，调查代码库：

   a. 从每个冲突变更中**读取增量规格**，以了解各自声称要添加/修改的内容

   b. **搜索代码库**以寻找实现证据：
      - 查找实现了各增量规格中需求的代码
      - 检查相关文件、函数或测试

   c. **确定解决方案**：
      - 如果实际上只有一个变更已实现 -> 仅同步该变更的规格
      - 如果两者都已实现 -> 按时间顺序应用（先旧后新，新的覆盖旧的）
      - 如果两者都未实现 -> 跳过规格同步，并警告用户

   d. 为每个冲突**记录解决方案**：
      - 应用哪个变更的规格
      - 以何种顺序应用（如果两者都应用）
      - 理由（在代码库中发现了什么）

6. **展示汇总状态表**

   展示一个汇总所有变更的表格：

   ```
   | Change              | Artifacts | Tasks | Specs   | Conflicts | Status |
   |---------------------|-----------|-------|---------|-----------|--------|
   | schema-management   | Done      | 5/5   | 2 delta | None      | Ready  |
   | project-config      | Done      | 3/3   | 1 delta | None      | Ready  |
   | add-oauth           | Done      | 4/4   | 1 delta | auth (!)  | Ready* |
   | add-verify-skill    | 1 left    | 2/5   | None    | None      | Warn   |
   ```

   对于冲突，展示解决方案：
   ```
   * Conflict resolution:
     - auth spec: Will apply add-oauth then add-jwt (both implemented, chronological order)
   ```

   对于未完成的变更，展示警告：
   ```
   Warnings:
   - add-verify-skill: 1 incomplete artifact, 3 incomplete tasks
   ```

7. **确认批量操作**

   使用 **AskUserQuestion 工具**进行单次确认：

   - “归档 N 个变更？”，并根据状态提供选项
   - 选项可能包括：
     - “归档全部 N 个变更”
     - “仅归档 N 个就绪的变更（跳过未完成的）”
     - “取消”

   如果存在未完成的变更，需明确说明它们将被归档并附带警告。

8. **对每个已确认的变更执行归档**

   按确定的顺序处理变更（遵循冲突解决方案）：

   a. 如果存在增量规格，则**同步规格**：
      - 采用 openspec-sync-specs 的方式（由智能体驱动的智能合并）
      - 对于冲突，按已解决的顺序应用
      - 记录是否已执行同步

   b. **执行归档**：
      ```bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      ```

   c. 为每个变更**跟踪结果**：
      - 成功：归档成功
      - 失败：归档过程中出错（记录错误）
      - 跳过：用户选择不归档（如适用）

9. **展示摘要**

   展示最终结果：

   ```
   ## Bulk Archive Complete

   Archived 3 changes:
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   Skipped 1 change:
   - add-verify-skill (user chose not to archive incomplete)

   Spec sync summary:
   - 4 delta specs synced to main specs
   - 1 conflict resolved (auth: applied both in chronological order)
   ```

   如果存在任何失败：
   ```
   Failed 1 change:
   - some-change: Archive directory already exists
   ```

**冲突解决示例**

示例 1：只有一个已实现
```
Conflict: specs/auth/spec.md touched by [add-oauth, add-jwt]

Checking add-oauth:
- Delta adds "OAuth Provider Integration" requirement
- Searching codebase... found src/auth/oauth.ts implementing OAuth flow

Checking add-jwt:
- Delta adds "JWT Token Handling" requirement
- Searching codebase... no JWT implementation found

Resolution: Only add-oauth is implemented. Will sync add-oauth specs only.
```

示例 2：两者均已实现
```
Conflict: specs/api/spec.md touched by [add-rest-api, add-graphql]

Checking add-rest-api (created 2026-01-10):
- Delta adds "REST Endpoints" requirement
- Searching codebase... found src/api/rest.ts

Checking add-graphql (created 2026-01-15):
- Delta adds "GraphQL Schema" requirement
- Searching codebase... found src/api/graphql.ts

Resolution: Both implemented. Will apply add-rest-api specs first,
then add-graphql specs (chronological order, newer takes precedence).
```

**成功时的输出**

```
## Bulk Archive Complete

Archived N changes:
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

Spec sync summary:
- N delta specs synced to main specs
- No conflicts (or: M conflicts resolved)
```

**部分成功时的输出**

```
## Bulk Archive Complete (partial)

Archived N changes:
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

Skipped M changes:
- <change-2> (user chose not to archive incomplete)

Failed K changes:
- <change-3>: Archive directory already exists
```

**无变更时的输出**

```
## No Changes to Archive

No active changes found. Create a new change to get started.
```

**护栏规则**
- 允许任意数量的变更（1 个及以上即可，2 个及以上是典型用例）
- 始终提示用户选择，绝不自动选择
- 尽早检测规格冲突，并通过检查代码库加以解决
- 当两个变更都已实现时，按时间顺序应用规格
- 仅在实现缺失时才跳过规格同步（警告用户）
- 确认前清晰展示每个变更的状态
- 对整个批次使用单次确认
- 跟踪并报告所有结果（成功/跳过/失败）
- 移动到归档时保留 .openspec.yaml
- 归档目录目标使用当前日期：YYYY-MM-DD-<name>
- 如果归档目标已存在，该变更失败，但继续处理其他变更
