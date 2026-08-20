---
name: ln-512-tech-debt-cleaner
description: "Auto-fixes low-risk tech debt (unused imports, dead code, commented-out code) with >=90% confidence. Use when audit findings need safe automated cleanup."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__audit_workspace, mcp__hex-graph__find_references, mcp__hex-line__outline, mcp__hex-line__read_file, mcp__hex-line__edit_file, mcp__hex-line__bulk_replace, mcp__hex-line__verify, mcp__hex-line__changes
license: MIT
model: claude-sonnet-4-6
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 技术债务清理器（L3 Worker）

**类型：** L3 Worker

自动清理由代码库审计发现的安全、低风险技术债务问题。

## 目的与范围

- **接收**来自 `docs/project/codebase_audit.md`（ln-620 输出）或 ln-511 代码质量输出的审计发现
- **筛选**置信度 >=90% 且可自动修复的问题
- **应用**安全修复：移除未使用的导入、删除死代码、清理被注释掉的代码块、移除不受支持的别名
- **绝不触碰**业务逻辑、复杂重构或架构变更
- **创建**单个提交，并包含所有变更的结构化摘要
- 可从 ln-510 质量协调器流水线调用，也可独立调用

## 可自动修复的类别

| 类别 | 来源前缀 | 风险 | 自动修复操作 |
|----------|--------------|------|-----------------|
| 未使用的导入 | MNT-DC- | 低 | 删除导入行 |
| 未使用的变量 | MNT-DC- | 低 | 删除声明 |
| 未使用的函数（未导出） | MNT-DC- | 低 | 删除函数块 |
| 被注释掉的代码（>5 行） | MNT-DC- | 低 | 删除注释块 |
| 向后兼容垫片（>6 个月） | MNT-DC- | 中 | 删除垫片并更新重新导出 |
| 不受支持的别名 | MNT-DC- | 低 | 删除别名行 |
| 行尾空白 / 空行 | MNT- | 低 | 修剪 / 合并 |

## 不可自动修复（始终跳过）

| 类别 | 原因 |
|----------|--------|
| DRY 违规（MNT-DRY-） | 需要就提取位置做出架构决策 |
| 上帝类（MNT-GOD-） | 拆分需要领域知识 |
| 安全问题（SEC-） | 需要根据具体上下文进行修复 |
| 架构违规（ARCH-*） | 需要做出设计决策 |
| 性能问题（PERF-*） | 需要进行基准测试 |
| 任何工作量为 M 或 L 的发现 | 对自动修复而言过于复杂 |

## 使用时机

- 在代码质量分析完成后，当可应用安全、低风险的清理时使用
- **独立模式：** 在 `ln-620` 代码库审计完成后使用（由用户手动触发）
- **计划任务：** 作为保持代码库整洁的定期“垃圾回收”

## 输入

- **流水线模式（ln-510）：** 来自 ln-511 代码质量输出的发现（通过协调器上下文传递）
- **独立模式：** `docs/project/codebase_audit.md`（ln-620 输出）

**强制阅读：** 加载 `references/mcp_tool_preferences.md`——只要可用，处理代码文件时始终使用 hex-line MCP。除非 hex-line 不可用，否则不得回退到标准 Read/Edit。

**强制阅读：** 加载 `references/mcp_integration_patterns.md`。

处理代码文件时，以 `hex-line` 作为主要路径；执行死代码引用检查时，以 `hex-graph` 作为主要路径。仅当相关 MCP 不可用时，才回退到内置的 Read/Edit/Grep。

## 工作流

1) **加载发现：** 读取 `docs/project/codebase_audit.md`。解析死代码部分（ln-626 结果）和代码质量部分（ln-624 结果）中的发现。

2) **筛选可自动修复的问题：**
   - 类别必须在上方的“可自动修复”表格中
   - 严重程度必须为低或中（不得为高/严重）
   - 工作量必须为 S（小）
   - 跳过以下位置的文件：`node_modules/`、`vendor/`、`dist/`、`build/`、`*.min.*`、生成的代码、测试夹具

3) **验证每个发现项（置信度检查）：**
   **强制阅读：** 加载 `references/clean_code_checklist.md`
   对于每个候选修复项：
   a) 读取指定位置的目标文件
   b) 确认发现项仍然存在（文件自审计后可能已发生变化）
   c) 确认移除操作安全：
      - 对于未使用的导入：使用 grep 搜索整个代码库中的用法（引用数必须为 0）
      - 对于未使用的函数：使用 grep 搜索函数名称（调用位置必须为 0）
      - 对于被注释掉的代码：确认该块是代码，而非文档
      - 对于不受支持的别名：确认已无使用方
   d) 分配置信度分数（0-100）。仅当置信度 >=90 时才继续

   **Hex-line 加速（如果可用）：** 如果 Hex-line MCP 服务器可用：
   - 在手动清理编辑之前，使用 `outline(file_path)` 以及以发现为先的 `read_file()`。仅当 `edit_file` 需要修订版本/校验和时，才使用 `edit_ready=true, verbosity="full"` 重新读取。
   - **批量清理：** 当使用相同模式修复超过 3 个文件时（例如移除未使用的导入），先使用 `bulk_replace(dry_run=true)` 预览，再使用 `bulk_replace()` 应用。
   - **验证编辑：** 每次修复后，使用 `verify(file_path, checksums)` 确认不存在过期状态。
   - **语义死代码检查：** 在删除导出、包装器、别名或兼容层之前，使用 `find_references()`。
   - 仅当相关 MCP 不可用时，才回退到逐文件使用 Edit 或 Grep。
4) **使用逐修复项保留/丢弃机制应用修复（自动研究模式）：**
   **强制阅读：** 加载 `references/ci_tool_detection.md` 以了解发现层级。检测一次 lint + typecheck 命令（供所有修复复用）。

   按文件对已验证的修复进行分组。对于每个文件（独立处理各文件）：
   - 按行号降序排列文件内的修复项（自底向上可防止行偏移）
   - 使用 Edit 工具应用该文件的所有修复
   - 对修改后的文件运行 lint/typecheck
   - **如果通过** → `git add {file}`（状态：**保留**）
   - **如果失败** → `git checkout -- {file}`（状态：**丢弃**），记录被丢弃的修复
   - 跟踪每个修复项：文件、删除的行、类别、发现项 ID、状态（保留/丢弃）

   如果未检测到 lint/type 命令：应用所有修复，跳过逐文件验证并发出警告，对所有已修改文件执行 `git add`。

5) **创建提交（仅包含保留的修复）：**
   - 所有保留的文件已在第 4 步通过 `git add` 暂存
   - 如果保留的文件数为零（全部被丢弃）：跳过提交，报告所有失败项
   - 提交消息格式：
     ```
     chore: automated tech debt cleanup

     Removed {N} auto-fixable findings from codebase audit:
     - {count} unused imports
     - {count} dead functions
     - {count} commented-out code blocks
     - {count} unsupported aliases

     Source: docs/project/codebase_audit.md
     Confidence threshold: >=90%
     ```

7) **更新审计报告：**
   - 将“上次清理”部分添加到 `docs/project/codebase_audit.md`：
     ```markdown
     ## Last Automated Cleanup
     **Date:** YYYY-MM-DD
     **Findings fixed:** N of M auto-fixable
     **Skipped:** K (confidence <90% or verification failed)
     **Build check:** PASSED / SKIPPED
     ```

## 输出格式

```yaml
verdict: CLEANED | NOTHING_TO_CLEAN | ALL_DISCARDED
stats:
  total_findings: {from audit}
  auto_fixable: {filtered count}
  kept: {files that passed lint/typecheck}
  discarded: {files that failed lint/typecheck}
  skipped: {confidence <90 or stale}
fixes:
  - file: "src/utils/helpers.ts"
    line: 45
    category: "unused_function"
    removed: "formatDate()"
    finding_id: "MNT-DC-003"
    status: "keep"
  - file: "src/api/v1/auth.ts"
    line: 12
    category: "unsupported_alias"
    removed: "export { newAuth as oldAuth }"
    finding_id: "MNT-DC-007"
    status: "discard"
    discard_reason: "typecheck failed: Type error in auth.ts:15"
commit_sha: "abc1234" | null
```

## 关键规则

- **安全第一：** 当置信度 <90% 时，绝不修复。如有疑问，则跳过。
- **自下而上编辑：** 始终从文件底部向顶部应用修复，以避免行号偏移。
- **按文件保留/丢弃：** 如果某个文件未通过代码检查器/类型检查器，则仅还原该文件（`git checkout -- {file}`），保留其他成功的文件。
- **不得修改业务逻辑：** 绝不修改函数体、条件语句或控制流。
- **显式暂存：** 按名称暂存文件，绝不使用 `git add .` 或 `git add -A`。
- **幂等：** 如果审计报告未发生变化，运行两次不会产生任何更改。
- **感知 Git 状态：** 仅操作已跟踪的文件。跳过未跟踪或已忽略的文件。
- **排除项：** 跳过生成的代码、供应商目录、压缩文件和测试夹具。

## 运行时摘要工件

**必须阅读：** 加载 `references/quality_summary_contract.md`、`references/quality_worker_runtime_contract.md`

运行时配置：
- 系列：`quality-worker`
- 工作器：`ln-512`
- 摘要类型：`quality-worker`
- 协调器使用的有效载荷字段：`worker`、`status`、`verdict`、`issues`、`warnings`、`artifact_path`

调用规则：
- 独立运行：省略 `runId` 和 `summaryArtifactPath`
- 托管运行：同时传入 `runId` 和准确的 `summaryArtifactPath`
- 始终在终止结果之前写入经过验证的摘要

## 完成定义

- [ ] 已加载并解析审计报告
- [ ] 已将发现项筛选为可自动修复的类别
- [ ] 已验证每个发现项的置信度 >=90%
- [ ] 已按文件自下而上应用修复
- [ ] 已验证构建完整性（代码检查 + 类型检查），或已跳过并发出警告
- [ ] 已使用结构化消息创建单个提交（或在构建失败时全部还原）
- [ ] 已使用“Last Automated Cleanup”章节更新审计报告
- [ ] 已向调用方返回 YAML 输出

## 参考文件

- **整洁代码检查清单：** `references/clean_code_checklist.md`
- **审计输出模式：** `references/audit_output_schema.md`
- **审计报告模板：** `references/templates/codebase_audit_template.md`

---
**版本：** 1.0.0
**最后更新：** 2026-02-15