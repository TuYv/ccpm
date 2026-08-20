---
name: ln-614-docs-fact-checker
description: "Verifies claims in .md files (paths, versions, counts, configs, endpoints) against codebase, cross-checks contradictions. Use when auditing docs accuracy."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-line__outline, mcp__hex-line__read_file, mcp__hex-graph__index_project, mcp__hex-graph__find_symbols, mcp__hex-graph__find_references
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 文档事实核查器（L3 工作器）

**类型：** L3 工作器

专门从文档中提取可验证声明，并依据实际代码库逐一验证这些声明的工作器。

## 目的与范围

- 优先处理规范文档和声明密集型文档，然后从 Markdown 文档中提取可验证声明
- 依据代码库验证每项声明（Grep/Glob/Read/Bash）
- 检测**跨文档矛盾**（同一事实存在不同表述）
- 范围包括 `docs/reference/`、`docs/tasks/`、`tests/`
- 单次调用（而非逐文档调用）-> 跨文档检查需要全局视角
- 不检查范围一致性或结构质量

## 输入

**必须读取：** 加载 `references/audit_worker_core_contract.md`、`references/docs_quality_contract.md`、`references/markdown_read_protocol.md` 和 `references/mcp_tool_preferences.md`。
可选规则目录：仅当需要确切的规则 ID、路径矩阵或允许列表中的占位符例外时，才加载 `references/docs_quality_rules.json`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`project_root`、`output_dir`。

## 工作流程

### 阶段 1：解析上下文

从 contextStore 中提取技术栈、项目根目录和 output_dir。

### 阶段 2：发现文档

对项目中的 Markdown 文档执行 Glob。排除：
- `node_modules/`、`.git/`、`dist/`、`build/`
- `docs/project/.audit/`（审计输出，而非项目文档）
- `CHANGELOG.md`（按设计即为历史记录）

如果 `docs/project/.context/doc_registry.json` 存在：
- 首先加载它
- 优先处理 `doc_role=canonical`
- 优先处理声明类型密集的文件（路径、端点、版本、命令）
- 降低导航中心文档的优先级，除非矛盾指向这些文档

### 阶段 3：提取声明（第 1 层）

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

对于每个优先处理的文档，使用以章节为先的读取方式，通过 Grep/正则表达式模式提取可验证声明。

对于文档引用的代码文件，在使用内置读取功能之前，先使用 `outline()` 和以发现为先的 `read_file()`。仅当验证转变为后续编辑时，才请求 `edit_ready=true, verbosity="full"`。只有在直接检查清单/文件后，实体身份或引用解析仍存在歧义时，才使用 `hex-graph`。

**必须读取：** 加载 [references/claim_extraction_rules.md](references/claim_extraction_rules.md)，以获取各声明类型的详细提取模式。

9 种声明类型：

| # | 声明类型 | 提取内容 | 提取模式 |
|---|-----------|-----------------|-------------------|
| 1 | **文件路径** | 源文件、目录、配置的路径 | 反引号中的路径、匹配 `src/`、`lib/`、`app/`、`docs/`、`config/`、`tests/` 的链接目标 |
| 2 | **版本** | 软件包/工具/镜像版本 | 依赖项/软件包/镜像名称附近的语义化版本模式 |
| 3 | **计数/统计信息** | 关于代码库的数值声明 | `\d+ (modules|formats|endpoints|services|tables|parsers|files|workers)` |
| 4 | **API 端点** | HTTP 方法 + 路径 | `(GET|POST|PUT|DELETE|PATCH) /[\w/{}:]+` |
| 5 | **配置键/环境变量** | 环境变量、配置键 | 配置上下文中的 `[A-Z][A-Z_]{2,}`、`process.env.`、`os.environ` |
| 6 | **CLI 命令** | Shell 命令 | 反引号代码块中的 `npm run`、`python`、`docker`、`make` |
| 7 | **函数/类名称** | 代码实体引用 | 反引号或代码上下文中的 CamelCase/snake_case |
| 8 | **行号引用** | file:line 模式 | `[\w/.]+:\d+` 模式 |
| 9 | **Docker/基础设施声明** | 镜像标签、端口、服务名称 | Docker 上下文中带标签的镜像名称、端口映射 |

每条声明的输出格式：`{doc_path, line, claim_type, claim_value, raw_context}`。

### 阶段 4：验证声明（第 2 层）

对每条提取的声明，根据代码库进行验证：

| 声明类型 | 验证方法 | 发现类型 |
|------------|-------------------|--------------|
| 文件路径 | 使用 Glob 或 `ls` 检查是否存在 | PATH_NOT_FOUND |
| 版本 | Grep 包文件（package.json、requirements.txt、docker-compose.yml）并进行比较 | VERSION_MISMATCH |
| 数量 | 使用 Glob/Grep 统计实际实体数量，并与声明的数量进行比较 | COUNT_MISMATCH |
| API 端点 | Grep 路由/控制器定义 | ENDPOINT_NOT_FOUND |
| 配置键 | 在源代码中 Grep 其实际用法 | CONFIG_NOT_FOUND |
| CLI 命令 | 检查 package.json 脚本、Makefile 目标以及二进制文件是否存在 | COMMAND_NOT_FOUND |
| 函数/类 | 在源代码中 Grep 其定义 | ENTITY_NOT_FOUND |
| 行号 | 读取文件对应行，检查内容是否与声明的上下文匹配 | LINE_MISMATCH |
| Docker/基础设施 | 在 docker-compose.yml 中 Grep 镜像标签和端口 | INFRA_MISMATCH |

**误报过滤（第 2 层推理）：**
- 模板占位符（`{placeholder}`、`YOUR_*`、`<project>`、`xxx`）-> 跳过
- 示例/假设路径（前面带有 "e.g."、"for example"、"such as"）-> 跳过
- 将来时态的声明（"will add"、"planned"、"TODO"）-> 跳过或标记为 LOW
- 条件声明（"if using X, configure Y"）-> 仅当在 tech_stack 中检测到 X 时才验证
- 外部服务路径（URL、外部仓库）-> 跳过
- SCOPE/注释 HTML 块中描述其他项目的路径 -> 跳过
- `.env.example` 中的值 -> 跳过（预期与实际值不同）

### 阶段 5：跨文档一致性

比较各文档中提取的声明以查找矛盾：

| 检查项 | 方法 | 发现类型 |
|-------|--------|--------------|
| 同一路径，不同位置 | 对文件路径声明进行分组，检查是否都指向同一个实际路径 | CROSS_DOC_PATH_CONFLICT |
| 同一实体，不同版本 | 按实体名称对版本声明进行分组，并比较各个值 | CROSS_DOC_VERSION_CONFLICT |
| 同一指标，不同数量 | 按主题对数量声明进行分组，并比较各个值 | CROSS_DOC_COUNT_CONFLICT |
| 规范中存在但指南中不存在的端点 | 比较 api_spec.md 与 guides/runbook 中的端点声明 | CROSS_DOC_ENDPOINT_GAP |

算法：
```
claim_index = {}  # key: normalized(claim_type + entity), value: [{doc, line, value}]
FOR claim IN all_verified_claims WHERE claim.verified == true:
  key = normalize(claim.claim_type, claim.entity_name)
  claim_index[key].append({doc: claim.doc_path, line: claim.line, value: claim.claim_value})

FOR key, entries IN claim_index:
  unique_values = set(entry.value for entry in entries)
  IF len(unique_values) > 1:
    CREATE finding(type=CROSS_DOC_*_CONFLICT, severity=HIGH,
      location=entries[0].doc + ":" + entries[0].line,
      issue="'" + key + "' stated as '" + val1 + "' in " + doc1 + " but '" + val2 + "' in " + doc2)
```

### 阶段 6：评分与报告

**强制阅读：** 加载 `references/audit_scoring.md`。

使用惩罚公式计算分数。编写报告。

## 审计类别（用于 Checks 表）

| ID | 检查项 | 覆盖内容 |
|----|-------|---------------|
| `path_claims` | 文件/目录路径 | 根据文件系统验证所有路径引用 |
| `version_claims` | 版本号 | 根据清单文件验证软件包、工具和镜像版本 |
| `count_claims` | 数量与统计数据 | 根据实际数量验证数值断言 |
| `endpoint_claims` | API 端点 | 根据控制器/路由器验证路由定义 |
| `config_claims` | 配置与环境变量 | 根据源代码验证环境变量和配置键 |
| `command_claims` | CLI 命令 | 根据 package.json/Makefile 验证脚本和命令 |
| `entity_claims` | 代码实体名称 | 根据源代码定义验证函数和类 |
| `line_ref_claims` | 行号引用 | 根据实际文件内容验证 file:line |
| `cross_doc` | 跨文档一致性 | 确保不同文档中的相同事实一致 |

## 严重性映射

| 问题类型 | 严重性 | 理由 |
|------------|----------|-----------|
| PATH_NOT_FOUND（关键文件：AGENTS.md、CLAUDE.md、runbook、api_spec） | CRITICAL | 设置/入门流程失败 |
| PATH_NOT_FOUND（其他文档） | HIGH | 引用具有误导性 |
| VERSION_MISMATCH（主版本） | HIGH | 存在根本性错误 |
| VERSION_MISMATCH（次版本/补丁版本） | MEDIUM | 表面上的版本漂移 |
| COUNT_MISMATCH | MEDIUM | 指标具有误导性 |
| ENDPOINT_NOT_FOUND | HIGH | API 使用者受到影响 |
| CONFIG_NOT_FOUND | HIGH | 部署失败 |
| COMMAND_NOT_FOUND | HIGH | 设置/CI 失败 |
| ENTITY_NOT_FOUND | MEDIUM | 引发困惑 |
| LINE_MISMATCH | LOW | 轻微不准确 |
| INFRA_MISMATCH | HIGH | Docker/部署受到影响 |
| CROSS_DOC_*_CONFLICT | HIGH | 削弱信任，文档相互矛盾 |

## 输出格式

**强制阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器按照共享契约自行生成限定于本次运行的制品路径。

将报告写入 `{output_dir}/ln-614--global.md`，其中 `category: "Fact Accuracy"`，检查项为：path_claims、version_claims、count_claims、endpoint_claims、config_claims、command_claims、entity_claims、line_ref_claims、cross_doc。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-614--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告违规项；协调器会汇总后提供给用户
- **代码是事实依据：** 当文档与代码冲突时，文档是错误的（除非代码存在缺陷）
- **必须提供证据：** 每项发现都应包含所使用的验证命令及其结果
- **不要误报：** 宁可遗漏问题，也不要错误报告。若不确定，将其归类为 LOW 并附上说明
- **位置精确：** 始终包含 `file:line`，以便程序化导航
- **范围广泛：** 扫描所有 .md 文件——不要跳过 docs/reference/、tests/ 或任务文档
- **有针对性地深入：** 优先对规范性文档和包含大量断言的文档投入最深入的验证工作
- **重视跨文档问题：** 文档之间的矛盾比单个文档中的错误更会削弱信任
- **高效批量处理：** 先提取所有断言，再按类型批量验证（集中验证所有路径、所有版本）
- **共享占位符策略：** 遵循 `docs_quality_rules.json` 中允许使用的设置占位符；不要在任务设置文档中提升其严重性
- **仅在存在语义歧义时使用 hex-graph：** 对于代码实体和引用，仅当直接检查清单/文件后仍无法明确符号身份或引用解析时，才优先使用图查询，而不是反复使用 grep

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] contextStore 解析成功（包括 output_dir）
- [ ] 已发现所有 `.md` 文件（广泛范围）
- [ ] 已提取全部 9 种类型的声明
- [ ] 已根据代码库验证每条声明并提供证据
- [ ] 已检查跨文档一致性
- [ ] 已通过第 2 层推理过滤误报
- [ ] 已使用惩罚算法计算评分
- [ ] 报告已写入 `{output_dir}/ln-614--global.md`（单次原子 Write 调用）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出模式：** `references/audit_output_schema.md`
- **检测方法：** `references/two_layer_detection.md`
- 声明提取规则：[references/claim_extraction_rules.md](references/claim_extraction_rules.md)

---
**版本：** 1.0.0
**最后更新：** 2026-03-06