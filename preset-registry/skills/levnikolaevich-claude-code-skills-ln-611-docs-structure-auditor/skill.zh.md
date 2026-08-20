---
name: ln-611-docs-structure-auditor
description: "Checks hierarchy, links, SSOT, compression, requirements compliance, freshness, legacy cleanup. Use when auditing documentation structure."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline
license: MIT
model: claude-sonnet-4-6
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 文档结构审计器（L3 工作器）

**类型：** L3 工作器

专门审计项目文档结构质量的工作器。

## 目的与范围

- 从 8 个类别审计文档的**结构质量**
- 扫描项目中的所有 `.md` 文件，并在存在 `AGENTS.md` 时基于它构建层级结构
- 向协调器返回结构化的发现，包括严重程度、位置和建议
- 计算文档结构的合规评分（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md`、`references/docs_quality_contract.md`、`references/markdown_read_protocol.md` 和 `references/mcp_tool_preferences.md`。
可选规则目录：仅在需要确切的规则 ID、路径矩阵或许可名单中的占位符例外时，加载 `references/docs_quality_rules.json`。
工具策略：你可能作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在上下文范围内，因此默认优先使用 hex-line MCP 进行文件读取、搜索和编辑。仅当 MCP 行为不明确时，加载 `references/mcp_integration_patterns.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`project_root`、`output_dir`。

对于这个仅处理文档的工作器，`hex-line` 是可选的。可用时，将其作为处理大型 Markdown 大纲和定向读取的加速器；否则继续使用内置的 `Read/Grep/Glob/Bash`。

## 工作流程

1) **解析上下文：** 从 contextStore 中提取技术栈、项目根目录和 output_dir
2) **加载注册表（若存在）：** 当 `docs/project/.context/doc_registry.json` 可用时，将其作为首要路由来源
3) **扫描文档：** 查找项目中的所有 `.md` 文件（`AGENTS.md`、`CLAUDE.md`、`README.md`、`docs/**`）
4) **优先按章节读取：** 对于较大的文档，先获取大纲，然后读取标题标记以及 `Quick Navigation`、`Agent Entry` 和 `Maintenance`
5) **构建树：** 当存在 `AGENTS.md` 时，根据其中的外部链接构建层级结构，否则基于 `CLAUDE.md` 构建
6) **审计类别 1-7：** 执行结构检查（参见下方的审计类别）
7) **收集发现：** 记录每项违规及其严重程度、位置（file:line）、工作量估算（S/M/L）和建议
8) **计算评分：** 按严重程度统计违规数量，并计算合规评分（X/10）
9) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 构建完整的 Markdown 报告，并通过一次 Write 调用写入 `{output_dir}/611-structure.md`
10) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 审计类别

| # | 类别 | 检查内容 |
|---|----------|---------------|
| 1 | **层级结构与链接** | 当存在 `AGENTS.md` 时，它是规范根文档；所有文档均可通过链接访问；不存在孤立文件；不存在失效链接 |
| 2 | **单一事实来源** | 不存在内容重复；重复内容已替换为指向源文档的链接；所有权明确 |
| 3 | **主动压缩** | 消除冗长或重复的内容；将散文转换为表格；删除无意义的信息；即使文件未超过限制也进行压缩；参见 [size_limits.md](references/size_limits.md) |
| 4 | **要求合规性** | 标题标记正确、顶部章节正确、未超出大小限制、不包含非法代码块、文档链接与技术栈相符 |
| 5 | **时效性指标** | 检测过时迹象：内容中超过 6 个月的日期、不受支持的 API/工具引用、TODO/FIXME 标记、遗留的占位文本；深入的事实核查由专门的工作器处理 |
| 6 | **旧内容清理** | 不包含历史章节；不包含“曾被更改”之类的说明；不包含不受支持的信息；仅保留当前状态 |
| 7 | **技术栈适配** | 链接和引用与项目技术栈匹配；.NET 项目中不包含 Python 示例；使用适用于正确平台的官方文档 |
| 8 | **导入模式合规性** | 当仓库根目录存在 `AGENTS.md` 时，`CLAUDE.md` 必须恰好包含一行 `@AGENTS.md`，以及范围受限的、特定于运行环境的差异内容（总计 ≤50 行）。`CLAUDE.md` 中任何与 `AGENTS.md` 重复的内容都属于漂移。相关原理参见 `references/agent_instructions_writing_guide.md` |

### 严重程度映射

| 问题类型 | 严重程度 |
|------------|----------|
| 过时迹象（旧日期、不受支持的引用、TODO 标记） | MEDIUM |
| 损坏的链接、孤立文档 | HIGH |
| 内容重复 | MEDIUM |
| 缺少压缩机会 | LOW |
| 遗留/历史内容 | MEDIUM |
| 错误的技术栈引用 | HIGH |
| 导入模式偏移（CLAUDE.md 中存在重复的 AGENTS.md 内容、存根过大、缺少 `@AGENTS.md` 行） | HIGH |

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/611-structure.md`，其中 `category: "Documentation Structure"`，检查项包括：hierarchy_links、ssot、compression、requirements_compliance、freshness_indicators、legacy_cleanup、stack_adaptation、import_pattern_compliance。

按照 `references/audit_summary_contract.md` 返回摘要。

独立模式仍会根据共享契约，将相同的 JSON 摘要写入工作器自有的运行范围制品路径。

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告违规项；由协调器汇总后提供给用户
- **感知技术栈：** 使用 contextStore 中的 `tech_stack` 应用特定于技术栈的检查（例如 .NET 与 Node.js 的文档标准）
- **不进行深入事实核查：** 仅检测过时信号（日期、不受支持的引用、TODO 标记）
- **始终压缩：** 大小限制是上限，而不是目标。文件从 300 行压缩到 100 行就是改进
- **文档中不放代码：** 文档通过表格或 ASCII 图描述算法。代码应放在代码库中
- **代码是事实依据：** 当文档与代码冲突时，报告文档需要更新（而不是代码）
- **删除，而非归档：** 遗留内容应删除，而不是移至“archive”
- **精确定位：** 始终包含 `file:line`，以便以编程方式导航
- **共享契约优先：** 占位符策略、模板元数据策略和无代码例外以 `docs_quality_contract.md` / `docs_quality_rules.json` 为准

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已审计全部 8 个结构类别
- [ ] 已收集包含严重程度、位置、工作量和建议的发现项
- [ ] 已使用惩罚算法计算评分
- [ ] 已将报告写入 `{output_dir}/611-structure.md`（以原子方式单次调用 Write）
- [ ] 已按照契约写入摘要

## 参考文件

- 大小限制和目标：[references/size_limits.md](references/size_limits.md)
- 详细检查清单：[references/audit_checklist.md](references/audit_checklist.md)

---
**版本：** 1.0.0
**最后更新：** 2026-03-01