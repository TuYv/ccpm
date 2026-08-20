---
name: ln-613-code-comments-auditor
description: "Checks inline code documentation quality: WHY-not-WHAT, density, forbidden content, docstrings quality, actuality, legacy cleanup. Use when auditing comments and docstrings."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline, mcp__hex-line__read_file
license: MIT
model: claude-sonnet-4-6
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 内联代码文档审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计内联代码文档质量的工作器：注释、文档字符串和特定于语言的文档块。

## 目的与范围

- 从 6 个类别审计内联代码文档的**质量与合规性**
- 通用于任何技术栈（自动检测注释语法）
- 向协调器返回结构化的发现，包括严重程度、位置和建议
- 计算“内联代码文档”类别的合规性评分（X/10）
- 范围仅限于注释/文档字符串/JSDoc/XML 文档
- 范围之外：代码设计质量、命名质量、测试质量、架构质量或功能正确性，但注释与代码相矛盾的情况除外

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`project_root`、`output_dir`。

## 工作流程

1) **解析上下文：** 从 contextStore 中提取技术栈、项目根目录和 output_dir
2) **扫描：** 查找所有源文件（使用 `tech_stack` 进行检测）
   **Hex-line 主要路径：** 在分析注释之前，对代码文件使用 `outline(file_path)` 和发现优先的 `read_file()`。仅当审计转为后续编辑时，才使用 `edit_ready=true, verbosity="full"`。不要在此处使用 `hex-graph`——注释质量属于代码阅读问题，而不是语义图问题。
3) **提取：** 解析内联注释和文档字符串/JSDoc
4) **审计：** 执行 6 个类别的检查（参见下方“审计类别”）
5) **收集发现：** 记录每项违规及其严重程度、位置（文件:行）、工作量估算（S/M/L）和建议
6) **计算评分：** 按严重程度统计违规数量，计算合规性评分（X/10）
7) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-613--global.md`
8) **返回摘要：** 向协调器返回最简摘要（参见“输出格式”）

## 审计类别

| # | 类别 | 检查内容 |
|---|----------|---------------|
| 1 | **解释 WHY 而非 WHAT** | 注释应解释理由，而不是显而易见的代码行为；不得复述代码 |
| 2 | **密度（15-20%）** | 注释与代码的比例处于该范围内；注释不过多或过少 |
| 3 | **无禁止内容** | 不含日期/作者；不含历史说明；注释中不含代码示例 |
| 4 | **文档字符串质量** | 与函数签名匹配；参数有文档说明；返回类型准确 |
| 5 | **时效性** | 注释与代码行为一致；不存在过时的引用；示例可运行 |
| 6 | **遗留内容清理** | 不存在缺少上下文的 TODO；不存在被注释掉的代码；不存在不受支持的说明 |

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约自行生成限定于本次运行的制品路径。

将报告写入 `{output_dir}/ln-613--global.md`，其中 `category: "Inline Code Documentation"`，并执行以下检查：why_not_what、density、forbidden_content、docstrings_quality、actuality、legacy_cleanup。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 缺失时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-613--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

**严重性映射：**

| 问题类型 | 严重性 |
|------------|----------|
| 注释中的作者姓名、日期 | CRITICAL |
| 被注释掉的代码块 | HIGH |
| 陈旧/过时的注释 | HIGH |
| 仅描述显而易见行为的 WHAT 注释 | MEDIUM |
| 密度偏差 >5% | MEDIUM |
| 轻微密度偏差 | LOW |

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告违规项；由协调器汇总后提供给用户
- **修复代码，而非规则：** 绝不要修改规则文件（*_rules.md、*_standards.md）来让违规项通过检查
- **以代码为准：** 当注释与代码矛盾时，标记该文档需要更新；不要将其扩展为通用代码质量审查
- **WHY > WHAT：** 应删除用于解释显而易见行为的注释
- **通用性：** 适用于任何语言；自动检测注释语法
- **位置精确：** 始终包含 `file:line`，以便以编程方式导航

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已扫描所有源文件（技术栈来自 contextStore）
- [ ] 已审计全部 6 个类别
- [ ] 已收集包含严重性、位置、工作量和建议的发现项
- [ ] 已使用惩罚算法计算分数
- [ ] 已将报告写入 `{output_dir}/ln-613--global.md`（通过单次原子 Write 调用）
- [ ] 已按照契约写入摘要

## 参考文件

- 注释规则和模式：[references/comments_rules.md](references/comments_rules.md)

---
**版本：** 4.0.0
**最后更新：** 2026-03-01