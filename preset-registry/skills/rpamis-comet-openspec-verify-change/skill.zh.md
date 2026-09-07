---
name: openspec-verify-change
description: Verify implementation matches change artifacts. Use when the user wants to validate that implementation is complete, correct, and coherent before archiving.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
验证实现是否与变更工件（specs、tasks、design）相匹配。

**输入**：可选地指定一个变更名称。如果省略，则检查是否可以从对话上下文中推断出来。如果含糊或有歧义，你必须提示用户选择可用的变更。

**步骤**

1. **如果未提供变更名称，提示进行选择**

   运行 `openspec list --json` 获取可用变更。使用 **AskUserQuestion 工具** 让用户进行选择。

   显示具有实现任务的变更（存在 tasks 工件）。
   如果可用，包含每个变更所使用的 schema。
   将有未完成任务的变更标记为 "(In Progress)"。

   **重要**：不要猜测或自动选择变更。始终让用户来选择。

2. **检查状态以了解 schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析该 JSON 以了解：
   - `schemaName`：所使用的工作流（例如 "spec-driven"）
   - 该变更存在哪些工件

3. **获取变更目录并加载工件**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   这会返回变更目录和 `contextFiles`（工件 ID -> 具体文件路径的数组）。从 `contextFiles` 中读取所有可用的工件。

4. **初始化验证报告结构**

   创建一个包含三个维度的报告结构：
   - **完整性**：跟踪任务和规格覆盖情况
   - **正确性**：跟踪需求实现和场景覆盖情况
   - **一致性**：跟踪设计遵循情况和模式一致性

   每个维度都可以有 CRITICAL、WARNING 或 SUGGESTION 问题。

5. **验证完整性**

   **任务完成情况**：
   - 如果存在 `contextFiles.tasks`，读取其中的每一个文件路径
   - 解析复选框：`- [ ]`（未完成）与 `- [x]`（已完成）
   - 统计已完成任务数与总任务数
   - 如果存在未完成的任务：
     - 为每个未完成的任务添加一个 CRITICAL 问题
     - 建议："Complete task: <description>" 或 "Mark as done if already implemented"

   **规格覆盖**：
   - 如果在 `openspec/changes/<name>/specs/` 中存在 delta specs：
     - 提取所有需求（以 "### Requirement:" 标记）
     - 对每个需求：
       - 在代码库中搜索与该需求相关的关键词
       - 评估实现是否很可能存在
     - 如果需求看起来未实现：
       - 添加 CRITICAL 问题："Requirement not found: <requirement name>"
       - 建议："Implement requirement X: <description>"

6. **验证正确性**

   **需求实现映射**：
   - 对 delta specs 中的每个需求：
     - 在代码库中搜索实现证据
     - 如果找到，记录文件路径和行号范围
     - 评估实现是否与需求意图相符
     - 如果检测到偏差：
       - 添加 WARNING："Implementation may diverge from spec: <details>"
       - 建议："Review <file>:<lines> against requirement X"

   **场景覆盖**：
   - 对 delta specs 中的每个场景（以 "#### Scenario:" 标记）：
     - 检查代码中是否处理了这些条件
     - 检查是否存在覆盖该场景的测试
     - 如果场景似乎未被覆盖：
       - 添加 WARNING："Scenario not covered: <scenario name>"
       - 建议："Add test or implementation for scenario: <description>"

7. **验证一致性**

   **设计遵循**：
   - 如果存在 `contextFiles.design`：
     - 提取关键决策（查找类似 "Decision:"、"Approach:"、"Architecture:" 的章节）
     - 验证实现是否遵循了这些决策
     - 如果检测到矛盾：
       - 添加 WARNING："Design decision not followed: <decision>"
       - 建议："Update implementation or revise design.md to match reality"
   - 如果没有 design.md：跳过设计遵循检查，并注明 "No design.md to verify against"

   **代码模式一致性**：
   - 审查新代码是否与项目模式一致
   - 检查文件命名、目录结构、编码风格
   - 如果发现显著偏差：
     - 添加 SUGGESTION："Code pattern deviation: <details>"
     - 建议："Consider following project pattern: <example>"

8. **生成验证报告**

   **摘要记分卡**：
   ```
   ## Verification Report: <change-name>

   ### Summary
   | Dimension    | Status           |
   |--------------|------------------|
   | Completeness | X/Y tasks, N reqs|
   | Correctness  | M/N reqs covered |
   | Coherence    | Followed/Issues  |
   ```

   **按优先级分组的问题**：

   1. **CRITICAL**（归档前必须修复）：
      - 未完成的任务
      - 缺失的需求实现
      - 每项均附带具体、可操作的建议

   2. **WARNING**（应当修复）：
      - 规格/设计偏差
      - 缺失的场景覆盖
      - 每项均附带具体建议

   3. **SUGGESTION**（最好修复）：
      - 模式不一致
      - 细微改进
      - 每项均附带具体建议

   **最终评估**：
   - 如果存在 CRITICAL 问题："X critical issue(s) found. Fix before archiving."
   - 如果仅有警告："No critical issues. Y warning(s) to consider. Ready for archive (with noted improvements)."
   - 如果全部通过："All checks passed. Ready for archive."

**验证启发式规则**

- **完整性**：聚焦于客观的清单项（复选框、需求列表）
- **正确性**：使用关键词搜索、文件路径分析和合理推断——不要求完全确定
- **一致性**：寻找明显的不一致之处，不要在风格上吹毛求疵
- **误报**：不确定时，优先选择 SUGGESTION 而非 WARNING，优先选择 WARNING 而非 CRITICAL
- **可操作性**：每个问题都必须有具体的建议，并在适用时附带文件/行号引用

**优雅降级**

- 如果只存在 tasks.md：仅验证任务完成情况，跳过规格/设计检查
- 如果存在 tasks + specs：验证完整性和正确性，跳过设计检查
- 如果工件齐全：验证全部三个维度
- 始终注明跳过了哪些检查以及原因

**输出格式**

使用清晰的 markdown，包含：
- 用于摘要记分卡的表格
- 按问题分组的列表（CRITICAL/WARNING/SUGGESTION）
- 采用以下格式的代码引用：`file.ts:123`
- 具体、可操作的建议
- 不要有类似 "consider reviewing" 的含糊建议
