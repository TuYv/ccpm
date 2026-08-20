---
name: ln-612-semantic-content-auditor
description: "Checks document semantic content against SCOPE and project goals, coverage gaps, off-topic content, SSOT. Use when auditing documentation relevance."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 语义内容审计员（L3 工作器）

**类型：** L3 工作器

专门用于审计项目文档语义适用性的工作器。

## 目的与范围

- 验证文档内容是否符合声明的 SCOPE 和文档类型
- 检查内容是否**与项目目标一致**（价值贡献）
- 向协调器返回结构化的发现，包括严重性、位置和修复建议
- 不根据代码库核实事实

## 目标文档

仅针对项目文档调用（不包括参考资料/任务）：

| 文档 | 验证重点 |
|----------|-------------------|
| `AGENTS.md` / `CLAUDE.md` | 入口说明保持范围明确、易于导航且不含偏题内容 |
| `docs/README.md` | 导航范围正确，描述具有相关性 |
| `docs/documentation_standards.md` | 标准适用于此项目类型 |
| `docs/principles.md` | 原则与项目架构相关 |
| `docs/project/requirements.md` | 需求范围完整，不含过时项目 |
| `docs/project/architecture.md` | 架构范围涵盖所有层 |
| `docs/project/tech_stack.md` | 技术栈范围符合项目实际情况 |
| `docs/project/api_spec.md` | API 范围涵盖所有端点组 |
| `docs/project/database_schema.md` | 模式范围涵盖所有实体 |
| `docs/project/design_guidelines.md` | 设计范围涵盖所有活跃组件 |
| `docs/project/infrastructure.md` | 基础设施范围涵盖所有部署目标 |
| `docs/project/runbook.md` | 运行手册范围涵盖设置与运维 |

**排除：** `docs/tasks/`、`docs/reference/`、`docs/presentation/`、`tests/`

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md`、`references/docs_quality_contract.md`、`references/markdown_read_protocol.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用范围内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

每次调用时从协调器接收：

| 字段 | 描述 |
|-------|-------------|
| `doc_path` | 要审计的文档路径（例如 `docs/project/architecture.md`） |
| `output_dir` | 报告输出目录（来自 contextStore） |
| `project_root` | 项目根路径 |
| `tech_stack` | 检测到的技术栈 |

对于这个仅处理文档的工作器，`hex-line` 是可选的。可用时，使用它为大型 Markdown 文件生成大纲；否则继续使用内置的 `Read/Grep/Glob/Bash`，不要因 MCP 不可用而阻塞。

## 工作流程

### 阶段 1：标头与契约提取

1. 首先阅读文档标头和顶部章节
2. 解析：
   - `SCOPE`
   - `DOC_KIND`
   - `DOC_ROLE`
   - `READ_WHEN`
   - `SKIP_WHEN`
   - `PRIMARY_SOURCES`
3. 如果没有 SCOPE 标签，则根据文档类型推断
4. 缺失时，根据共享契约推断预期的 `DOC_KIND`
5. 记录声明的目的和路由边界

### 阶段 2：感知文档类型的语义审计

根据文档类型进行判断：

| DOC_KIND | 主要语义问题 |
|----------|------------------------|
| `index` | 是否能够高效引导，并避免承载过深的事实细节？ |
| `reference` | 是否准确、足够完整且易于查找？ |
| `how-to` | 操作步骤是否可执行，顺序是否正确？ |
| `explanation` | 是否构建了正确的心智模型并阐明了理由？ |
| `record` | 是否保留了决策轨迹及其后果？ |

根据声明的范围和类型分析文档：

| 检查项 | 发现类型 |
|-------|--------------|
| 章节未服务于范围 | OFF_TOPIC |
| 范围内的某方面未被覆盖 | MISSING_COVERAGE |
| 超出范围的过多细节 | SCOPE_CREEP |
| 内容在其他位置重复 | SSOT_VIOLATION |

**代理指令文件检查**（当被审计文件为 `AGENTS.md` 或 `CLAUDE.md` 时适用）：

| 检查项 | 发现类型 | 严重程度 | 建议 |
|-------|--------------|----------|----------------|
| 样式/格式规则（缩进、引号样式、尾随空格、命名约定） | NOT_A_LINTER | WARN | 移至 Biome、Prettier、Ruff、EditorConfig 或 Claude Code Stop 钩子。指令文件会被加载到每个会话中，并占用约 100 条命令式规则的预算；确定性工具可以零上下文成本完成这些工作。 |
| 根目录中的条件性/非通用规则（`when working on src/api/...`、`if modifying the billing service`、`for the Z service`） | NON_UNIVERSAL_RULE | WARN | 移至带有 `paths:` frontmatter 过滤器的 `.claude/rules/*.md`（Anthropic 内置的路径范围限定）。非通用规则会通过 `<system-reminder>` 包装器影响 Claude Code，使其倾向于忽略整个文件。 |
| 指向手动维护的 `tasks/lessons.md` 的自我改进循环规则 | OBSOLETE_PATTERN | WARN | 删除。Claude Code 在 `~/.claude/projects/<project>/memory/` 中内置的自动记忆功能已实现此功能；并行维护一套手动约定会浪费上下文。 |

以上三项均仅为 WARN——它们需要人工判断（这是有意设置的样式规则吗？条件范围实际上是项目级的吗？）。每项发现都需引用 `references/agent_instructions_writing_guide.md`。

阅读策略：
- 先阅读标题和顶部章节
- 只阅读判断所需的正文部分
- 仅当不阅读完整文件就无法安全地进行语义判断时，才阅读完整文件

**评分：**
- 10/10：所有内容都服务于范围，且范围得到完整覆盖
- 8-9/10：存在少量偏题内容或小范围缺漏
- 6-7/10：部分章节未对齐范围，覆盖不完整
- 4-5/10：存在显著偏差和重大缺漏
- 1-3/10：文档未能服务于其声明的目的

### 阶段 3：评分与报告

根据范围对齐程度计算最终得分：

```
overall_score = weighted_average(coverage, relevance, focus)
```

覆盖度：范围被覆盖得有多完整。相关性：有多少内容服务于范围。聚焦度：不存在偏题内容的程度。

## 评分算法

**强制阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**强制阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程按照共享契约生成自己的运行级制品路径。

将报告写入 `{output_dir}/ln-612--{doc-slug}.md`，其中 `doc-slug` 派生自文档文件名（例如 `architecture`、`tech_stack`、`agents_md`）。

使用 `category: "Semantic Content"`，并执行以下检查：scope_alignment、not_a_linter、non_universal_rule、obsolete_pattern（后三项仅针对 AGENTS.md / CLAUDE.md 目标触发）。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 缺失时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显同一摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-612--architecture.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **渐进式读取：** 优先按章节读取；仅在安全判断确有需要时才全文读取
- **范围推断：** 如果没有 SCOPE 标签，则使用文档文件名推断预期范围
- **感知文档类型：** 根据文档用途进行判断，而不是使用单一的通用评判标准
- **避免误报：** 宁可遗漏问题，也不要错误报告
- **位置精确：** 发现问题时始终包含行号
- **可操作的修复建议：** 每项发现都必须包含具体的修复建议
- **不进行事实核查：** 不要对照代码验证路径、版本或端点
- **共享类别注册表：** 文档边界来自 `docs_quality_contract.md`；不要为每个文件另行制定替代性的范围规则

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已提取或推断头部契约
- [ ] 已分析内容与范围的一致性（OFF_TOPIC、MISSING_COVERAGE、SCOPE_CREEP、SSOT_VIOLATION）
- [ ] 已根据 DOC_KIND 应用语义判断
- [ ] 已使用惩罚算法计算评分
- [ ] 已将报告写入 `{output_dir}/ln-612--{doc-slug}.md`（以原子方式单次调用 Write）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出模式：** `references/audit_output_schema.md`

---
**版本：** 2.0.0
**最后更新：** 2026-03-01