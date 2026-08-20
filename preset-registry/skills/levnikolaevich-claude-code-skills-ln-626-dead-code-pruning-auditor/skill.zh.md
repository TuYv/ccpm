---
name: ln-626-dead-code-pruning-auditor
description: "Finds code that can be safely deleted: unreachable, unused, obsolete compatibility, and commented-out code. Use when pruning dead code."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__index_project, mcp__hex-graph__audit_workspace, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 死代码清理审计器（L3 工作器）

**类型：** L3 工作器

专门识别可安全删除候选项的工作器。

## 目的与范围

- 审计**死代码清理**（类别 9：低优先级）
- 查找未使用的导入、变量、函数以及被注释掉的代码
- 输出 `DELETE_DEAD_CODE`、`REMOVE_OBSOLETE_COMPAT` 或 `DELETE_COMMENTED_CODE`
- 计算合规评分（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时主机的 `AGENTS.md` 不在上下文范围内，因此默认优先使用 hex-line MCP 进行文件读取、搜索和编辑。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含技术栈、代码库根目录和 output_dir 的 `contextStore`。

当导出存活性或工作区热点能够显著改善审计效果时，优先使用 `hex-graph`。如果可用，优先使用 `hex-line` 读取本地代码。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明采用了回退方案。

## 工作流程

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) 解析上下文和 output_dir
2) 运行死代码检测（第 1 层：代码检查器、grep）
   - **支持图分析的项目：** 对于 JavaScript、TypeScript/TSX、Python、C# 和 PHP，当图索引可用时，先使用 `index_project`，然后使用有界的 `audit_workspace(verbosity="minimal", limit=5)`，将其作为检测未使用导出的主要方式。仅在有意深入分析时提高 `limit`。
   - 对于不受支持的语言、图分析不可用的运行场景以及导出存活性之外的检查，保留 grep/代码检查器作为回退方案。
3) 根据每个候选项的上下文进行分析（第 2 层）：
   - 未使用的函数：是否通过动态导入/反射使用？是否在公共 API 中导出？是否被其他包使用（monorepo）？
   - 被注释掉的代码：包含上下文的 TODO 或算法说明 -> 误报。真正无用的代码块 -> 已确认
   - 旧版兼容层：读取 git blame -- 已存在多久？是否有跟踪其移除工作的 issue/PR？
4) 收集已确认的问题
5) 计算评分
6) **编写报告：** 按照 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，通过单次 Write 调用写入 `{output_dir}/ln-626--global.md`
7) **返回摘要：** 返回最简摘要

## 审计规则

**强制阅读：** 加载 `references/clean_code_checklist.md`，了解通用死代码模式和严重程度定义。

### 1. 不可达代码
**检测：**
- 代码检查器规则：`no-unreachable`（ESLint）
- 检查 `return`、`throw`、`break` 之后的代码

**严重程度：** 中

### 2. 未使用的导入/变量/函数
**检测：**
- ESLint：`no-unused-vars`
- TypeScript：`noUnusedLocals`、`noUnusedParameters`
- Python：带有 `F401`、`F841` 的 `flake8`

**严重程度：**
- **中：** 未使用的函数（无用负担）
- **低：** 未使用的导入（需要清理）

### 3. 注释掉的代码
**检测：**
- 使用 Grep 搜索 `//.*{` 或 `/*.*function` 模式
- 包含代码语法的大型注释块（>10 行）

**严重程度：** LOW

**建议：** 删除（git 会保留历史记录）

### 4. 遗留代码与向后兼容性
**内容：** 向后兼容性垫片、不受支持的模式、应当移除的旧代码

**检测：**
- 带有旧别名的已重命名变量/函数：
  - 模式：`const oldName = newName` 或 `export { newModule as oldModule }`
  - 模式：`function oldFunc() { return newFunc(); }`（用于向后兼容的包装器）
- 不受支持的导出/重新导出：
  - 使用 Grep 搜索 `// DEPRECATED`、`@obsolete` JSDoc 标签
  - 模式：`export.*as.*old.*` 或 `export.*legacy.*`
- 针对旧版本的条件代码：
  - 模式：`if.*legacy.*` 或 `if.*old.*version.*` 或 `isOldVersion ? oldFunc() : newFunc()`
- 迁移垫片和适配器：
  - 模式：`migrate.*`、`Legacy.*Adapter`、`.*Shim`、`.*Compat`
- 注释标记：
  - 使用 Grep 搜索 `// backward compatibility`、`// legacy support`、`// TODO: remove in v`
  - 使用 Grep 搜索 `// old implementation`、`// unsupported`、`// kept for backward`

**严重程度：**
- **HIGH：** 关键路径（身份验证、支付、核心功能）中的向后兼容性垫片
- **MEDIUM：** 仍在使用的不受支持导出、超过 6 个月的迁移代码
- **LOW：** 近期迁移代码（<3 个月）、具有明确移除时间表的计划弃用项

**建议：**
- 移除向后兼容性垫片——在进行适当版本管理时，破坏性变更是可以接受的
- 删除旧实现——只保留正确的/新版本
- 移除不受支持的导出——更新使用方以采用新 API
- 在宽限期（3-6 个月）后删除迁移代码
- 清理遗留支持注释——git 历史记录会保留旧实现

**工作量：**
- **S：** 移除简单别名，删除不受支持的导出
- **M：** 将使用旧 API 的代码重构为使用新 API
- **L：** 移除影响多个模块的复杂向后兼容层

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作程序根据共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-626--global.md`，并设置 `category: "Dead Code Pruning"`，检查项为：unreachable_code、unused_exports、commented_code、legacy_shims。

按照 `references/audit_summary_contract.md` 返回摘要。

当缺少 `summaryArtifactPath` 时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-626--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 参考文件

- **整洁代码检查清单：** `references/clean_code_checklist.md`
- **审计输出架构：** `references/audit_output_schema.md`

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告，绝不删除代码
- **严重程度需考虑代码存在时长：** 超过 6 个月的旧版兼容层 = MEDIUM，少于 3 个月 = LOW
- **如实评估工作量：** S = <1h，M = 1-4h，L = >4h
- **排除项：** 跳过生成的代码、供应商代码、迁移和测试固件
- **感知 Git：** 可以放心建议删除——Git 历史记录会保留旧代码
- **独特视角：** 仅审计可安全删除的候选项。不要重构在用代码、调整模块结构或评估依赖项/软件包的健康状况。
- **必须执行的操作：** 每个发现均使用 `DELETE_DEAD_CODE`、`REMOVE_OBSOLETE_COMPAT` 或 `DELETE_COMMENTED_CODE`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（包括 output_dir）
- [ ] 已完成全部 4 项检查（不可达代码、未使用的导入/变量/函数、已注释掉的代码、旧版兼容层）
- [ ] 已从 `references/clean_code_checklist.md` 加载整洁代码检查清单
- [ ] 已收集包含严重程度、位置、工作量、操作和建议的发现
- [ ] 已按照 `references/audit_scoring.md` 计算评分
- [ ] 报告已写入 `{output_dir}/ln-626--global.md`（通过单次原子 Write 调用）
- [ ] 已按照契约编写摘要

---
**版本：** 3.0.0
**最后更新：** 2025-12-23