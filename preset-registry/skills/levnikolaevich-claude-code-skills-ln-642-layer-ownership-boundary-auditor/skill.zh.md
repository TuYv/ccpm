---
name: ln-642-layer-ownership-boundary-auditor
description: "Checks layer, resource ownership, and orchestration boundaries. Use when auditing architecture boundary enforcement."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__find_references, mcp__hex-graph__trace_paths, mcp__hex-graph__inspect_symbol, mcp__hex-graph__analyze_architecture, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：**文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 分层与所有权边界审计器

**类型：**L3 Worker

用于审计架构分层边界并检测违规问题的 L3 Worker。

## 目的与范围

- 读取 architecture.md 以了解项目的分层结构
- 检测分层违规问题（基础设施层之外存在 I/O 代码）
- **检测跨层一致性问题：**
  - 事务边界（commit/rollback 的所有权）
  - 会话所有权（DI 与本地创建）
- 检查模式覆盖情况（所有 HTTP 调用均使用客户端抽象）
- 检测重复的错误处理
- 返回违规问题列表

**范围之外：**
- 异步函数中的阻塞式 I/O（在 async def 中同步执行 open/read）
- 即发即弃任务（create_task 未设置错误处理程序）

## 输入

```
- architecture_path: string    # Path to docs/architecture.md
- codebase_root: string        # Root directory to scan
- skip_violations: string[]    # Files to skip (legacy)
- output_dir: string           # e.g., ".hex-skills/runtime-artifacts/runs/{run_id}/audit-report"

# Domain-aware (optional)
- domain_mode: "global" | "domain-aware"   # Default: "global"
- current_domain: string                   # e.g., "users", "billing" (only if domain-aware)
- scan_path: string                        # e.g., "src/users/" (only if domain-aware)
```

**当 domain_mode="domain-aware" 时：**所有 Grep/Glob 操作均使用 `scan_path`，而非 `codebase_root`。为所有发现添加 `domain` 字段。

## 工作流程

**强制阅读：**加载 `references/mcp_tool_preferences.md`。

检测策略：使用两层检测（候选项扫描，然后进行上下文验证）；仅当验证方法不明确时，加载 `references/two_layer_detection.md`。
工具策略：你可能作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此默认优先使用 hex-line MCP 进行文件读取、搜索和编辑。仅当 MCP 行为不明确时，加载 `references/mcp_integration_patterns.md`。

当引用关系、调用路径或架构耦合能够显著改进审计效果时，优先使用 `hex-graph`。对于本地代码和配置的读取，如可用则优先使用 `hex-line`。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明使用了后备方案。

### 阶段 1：发现架构

**强制阅读：**加载 `references/layer_rules.md`——使用架构预设（后备方案）、I/O 模式边界规则（阶段 2）、覆盖检查（阶段 4）和跨层一致性规则（阶段 3）。

```
Read docs/architecture.md

Extract from Section 4.2 (Top-Level Decomposition):
  - architecture_type: "Layered" | "Hexagonal" | "Clean" | "MVC" | etc.
  - layers: [{name, directories[], purpose}]

Extract from Section 5.3 (Infrastructure Layer Components):
  - infrastructure_components: [{name, responsibility}]

IF architecture.md not found:
  Use fallback presets from layer_rules.md

Build ruleset:
  FOR EACH layer:
    allowed_deps = layers that can be imported
    forbidden_deps = layers that cannot be imported
```

**图加速（如果可用）：** 如果 `contextStore.graph_indexed` 或 `.hex-skills/codegraph/index.db` 存在：
- **模块耦合：** `analyze_architecture(path=scan_root, verbosity="full")` —— 使用返回的耦合指标识别紧密耦合的层。
- **跨层调用：** 对事务/会话函数使用 `find_references(symbol)` —— 追踪各层之间 commit/rollback 的所有权。
- **编排深度：** `trace_paths(name="ServiceFn", file="...", path_kind="calls", direction="forward", depth=3, path=scan_root)` —— 从具体的服务符号出发测量调用链深度，以检查编排是否扁平。
- 对粗粒度或模块级选择器执行 `trace_paths` 得到空结果，并不足以排除某一层；当选择器范围较宽时，应回退到 `inspect_symbol` 或 grep/人工审查。
- 如果图不可用，则回退到下述基于 grep 的检测。
### 阶段 2：检测分层违规

```
scan_root = scan_path IF domain_mode == "domain-aware" ELSE codebase_root

FOR EACH violation_type IN layer_rules.md I/O Pattern Boundary Rules:
  grep_pattern = violation_type.detection_grep
  forbidden_dirs = violation_type.forbidden_in

  matches = Grep(grep_pattern, scan_root, include="*.py,*.ts,*.js")

  FOR EACH match IN matches:
    IF match.path NOT IN skip_violations:
      IF any(forbidden IN match.path FOR forbidden IN forbidden_dirs):
        violations.append({
          type: "layer_violation",
          severity: "HIGH",
          pattern: violation_type.name,
          file: match.path,
          line: match.line,
          code: match.context,
          allowed_in: violation_type.allowed_in,
          suggestion: f"Move to {violation_type.allowed_in}"
        })
```

### 阶段 3：跨层一致性检查

#### 3.1 事务边界违规

**问题：** 在不同层（仓储层 + 服务层 + API 层）调用 commit()/rollback()

**检测：**
```
repo_commits = Grep("\.commit\(\)|\.rollback\(\)", "**/repositories/**/*.py")
service_commits = Grep("\.commit\(\)|\.rollback\(\)", "**/services/**/*.py")
api_commits = Grep("\.commit\(\)|\.rollback\(\)", "**/api/**/*.py")

layers_with_commits = count([repo_commits, service_commits, api_commits].filter(len > 0))
```

**安全模式（忽略）：**
- 同一上下文中存在注释 `# best-effort telemetry`
- 文件名以 `_callbacks.py` 结尾（进度通知器）
- 存在明确的 `# UoW boundary` 注释

**违规规则：**

| 条件 | 严重程度 | 问题 |
|-----------|----------|-------|
| layers_with_commits >= 3 | 严重 | 所有层之间混合了 UoW 所有权 |
| 仓储层 + API 层提交 | 高 | 事务控制绕过服务层 |
| 仓储层 + 服务层提交 | 高 | UoW 所有者不明确（仓储层还是服务层） |
| 服务层 + API 层提交 | 中 | 事务控制横跨服务层和 API 层 |

**例外：** 对于包含明确补偿操作的 Saga 模式/分布式事务，将严重程度从“严重”降为“中”。如果 UoW 边界通过 `// architecture decision` 或 ADR 进行了记录，则跳过。

**建议：** 选择单一的 UoW 所有者（推荐服务层），从其他层移除 commit()

**工作量：** L（需要架构决策和重构）

#### 3.2 会话所有权违规

**问题：** 在同一调用链中混用 DI 注入的会话和本地创建的会话

**检测：**
```
di_session = Grep("Depends\(get_session\)|Depends\(get_db\)", "**/api/**/*.py")
local_session = Grep("AsyncSessionLocal\(\)|async_sessionmaker", "**/services/**/*.py")
local_in_repo = Grep("AsyncSessionLocal\(\)", "**/repositories/**/*.py")
```

**违规规则：**

| 条件 | 严重程度 | 问题 |
|-----------|----------|-------|
| 同一模块中同时存在 di_session 和 local_in_repo | HIGH | API 注入了不同的会话，而仓储自行创建会话 |
| 调用基于 DI 的仓储的服务中存在 local_session | MEDIUM | 调用链中的会话不匹配 |

**建议：** 始终使用 DI，或者始终使用本地会话。记录例外情况（例如遥测）

**工作量：** M

#### 3.3 扁平编排违规

**问题：** 服务层函数调用其他服务，而这些服务又调用另外的服务——形成深层编排链。

**检测：** **强制阅读：** 加载 `references/ai_ready_architecture.md`——映射服务导入关系，找出调用链深度。

**违规规则：**

| 条件 | 严重程度 | 问题 |
|-----------|----------|-------|
| 服务链 >= 3（A->B->C->D） | HIGH | 深层编排 |
| 服务链 = 2（A->B->C） | MEDIUM | 考虑扁平化 |

**建议：** 提取一个在同一层级调用所有服务的编排器。每个服务都成为调用链终点。

**工作量：** L

---

### 阶段 4：检查模式覆盖率

```
# HTTP Client Coverage
all_http_calls = Grep("httpx\\.|aiohttp\\.|requests\\.", codebase_root)
abstracted_calls = Grep("client\\.(get|post|put|delete)", infrastructure_dirs)

IF len(all_http_calls) > 0:
  coverage = len(abstracted_calls) / len(all_http_calls) * 100
  IF coverage < 90%:
    violations.append({
      type: "low_coverage",
      severity: "MEDIUM",
      pattern: "HTTP Client Abstraction",
      coverage: coverage,
      uncovered_files: files with direct calls outside infrastructure
    })

# Error Handling Duplication
http_error_handlers = Grep("except\\s+(httpx\\.|aiohttp\\.|requests\\.)", codebase_root)
unique_files = set(f.path for f in http_error_handlers)

IF len(unique_files) > 2:
  violations.append({
    type: "duplication",
    severity: "MEDIUM",
    pattern: "HTTP Error Handling",
    files: list(unique_files),
    suggestion: "Centralize in infrastructure layer"
  })
```

### 阶段 5：计算分数

**强制阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/audit_scoring.md`。

### 阶段 6：编写报告

**强制阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约自行生成运行范围内的产物路径。

```
# Build markdown report in memory with:
# - AUDIT-META (standard penalty-based: score, counts)
# - Checks table (io_isolation, http_abstraction, error_centralization, transaction_boundary, session_ownership)
# - Findings table (violations sorted by severity)
# - DATA-EXTENDED: {architecture, coverage}

IF domain_mode == "domain-aware":
  Write to {output_dir}/642-layer-boundary-{current_domain}.md
ELSE:
  Write to {output_dir}/642-layer-boundary.md
```

### 阶段 7：返回摘要

```
报告已写入：.hex-skills/runtime-artifacts/runs/{run_id}/audit-report/642-layer-boundary-users.md
评分：4.5/10 | 问题：8（严重：1 高：3 中：4 低：0）
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **首先读取 architecture.md**——绝不假定架构类型
- **跳过违规列表**——尊重标记为逐步修复的遗留文件
- **文件 + 行号 + 代码**——始终提供包含上下文的确切位置
- **可执行的建议**——始终说明应将代码移至何处
- **杜绝误报**——验证路径包含被禁止的目录，而不仅仅是包含相同的子字符串
- **独特视角：**仅审计分层、所有权和编排边界。不要审计包健康状况、通用代码质量、依赖关系图拓扑或运行时并发风险。
- **必需操作：**每个发现都使用 `MOVE_BOUNDARY`、`CHOOSE_OWNER` 或 `FLATTEN_ORCHESTRATION`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已从 docs/architecture.md 确定架构（或已使用回退方案）
- [ ] 已检查 layer_rules.md 中的所有违规类型
- [ ] **已检查跨层一致性：**
  - 已分析事务边界（提交/回滚的分布）
  - 已分析会话所有权（依赖注入与本地创建）
- [ ] 已计算 HTTP 抽象及 2 项一致性指标的覆盖率
- [ ] 违规列表包含严重程度、位置和建议
- [ ] 如果感知领域：所有 Grep 均限定在 scan_path 范围内，发现均标记了领域
- [ ] 报告已写入 `{output_dir}/642-layer-boundary[-{domain}].md`（通过单次原子 Write 调用）
- [ ] 已按契约编写摘要

## 参考文件

- 分层规则：`references/layer_rules.md`
- 评分影响：使用 `references/audit_scoring.md`

---

**版本：**2.1.0
**最后更新：**2026-02-08