---
name: ln-511-code-quality-checker
description: "Checks DRY/KISS/YAGNI/architecture compliance with quantitative Code Quality Score. Use when implementation tasks are Done and need quality scoring."
allowed-tools: Read, Grep, Glob, Bash, WebFetch, mcp__Ref, mcp__context7, mcp__hex-line__outline, mcp__hex-graph__audit_workspace, mcp__hex-graph__analyze_architecture
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 代码质量检查器

**类型：** L3 Worker
**类别：** 5XX 质量

分析已完成的实现任务，并基于指标、MCP Ref 验证和问题扣分得出量化的代码质量评分。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | args、git branch、kanban、user | 要处理的 Story |

**解析：** Story Resolution Chain。
**状态筛选：** In Progress、To Review

工具策略：遵循宿主 `AGENTS.md` 中的 MCP 偏好；仅当宿主策略不存在或 MCP 行为不明确时，才加载 `references/mcp_tool_preferences.md` 和 `references/mcp_integration_patterns.md`。当项目已建立索引时，使用 `hex-graph` 作为获取克隆、架构和语义质量证据的主要途径。仅当图不可用或不受支持时，才回退到 Grep/Read。

## 目的与范围
- 加载 Story 和已完成的实现任务（排除测试任务）
- 使用指标和问题扣分计算代码质量评分
- **MCP Ref 验证：** 通过外部来源验证最优性、最佳实践和性能
- 检查 DRY/KISS/YAGNI 违规、架构边界破坏和安全问题
- 生成包含结构化问题列表的量化结论；绝不编辑 Linear 或 kanban

## 代码指标

| 指标 | 阈值 | 扣分 |
|--------|-----------|---------|
| **圈复杂度** | ≤10 正常，11-20 警告，>20 失败 | 每个函数 -5（警告）、-10（失败） |
| **函数大小** | ≤50 行正常，>50 警告 | 每个函数 -3 |
| **文件大小** | ≤500 行正常，>500 警告 | 每个文件 -5 |
| **嵌套深度** | ≤3 正常，>3 警告 | 每处 -3 |
| **参数数量** | ≤4 正常，>4 警告 | 每个函数 -2 |

## 代码质量评分

公式：`Code Quality Score = 100 - metric_penalties - issue_penalties`

**按严重程度划分的问题扣分：**

| 严重程度 | 扣分 | 示例 |
|----------|---------|----------|
| **高** | -20 | 安全漏洞、O(n²)+ 算法、N+1 查询 |
| **中** | -10 | DRY 违规、次优方案、缺少配置 |
| **低** | -3 | 命名规范、轻微代码异味 |

**评分解释：**

| 分数 | 状态 | 结论 |
|-------|--------|---------|
| 90-100 | 优秀 | PASS |
| 70-89 | 可接受 | CONCERNS |
| <70 | 低于阈值 | ISSUES_FOUND |

## 问题前缀

| 前缀 | 类别 | 默认严重程度 | MCP Ref |
|--------|----------|------------------|---------|
| SEC- | 安全（身份验证、校验、密钥） | 高 | — |
| SEC-DESTR- | 破坏性操作（防护：DB、FS、MIG、ENV、FORCE） | 高/中 | — |
| PERF- | 性能（算法、配置、瓶颈） | 中/高 | ✓ 必需 |
| MNT- | 可维护性（DRY、SOLID、复杂度、死代码） | 中 | — |
| ARCH- | 架构（分层、边界、模式、契约） | 中 | — |
| BP- | 最佳实践（实现与推荐方式不同） | 中 | ✓ 必需 |
| OPT- | 最优性（存在更适合该目标的方法） | 中 | ✓ 必需 |

**OPT- 子类别：**

| 前缀 | 类别 | 严重程度 |
|--------|----------|----------|
| OPT-OSS- | 有可用的开源替代方案 | 中（若 >200 LOC，则为高） |

**ARCH- 子类别：**

| 前缀 | 类别 | 严重程度 |
|--------|----------|----------|
| ARCH-LB- | 层边界：I/O 位于基础设施层之外、HTTP 位于领域层中 | 高 |
| ARCH-TX- | 事务边界：3 个以上层中存在 commit()、UoW 所有权混杂 | 高（若涉及身份验证/支付，则为严重） |
| ARCH-DTO- | 缺少 DTO（4 个以上参数但未使用 DTO）、实体泄漏（API 响应中包含 ORM 实体） | 中（若涉及身份验证/支付，则为高） |
| ARCH-DI- | 依赖注入：依赖项无法替换以进行测试（直接实例化、无注入机制）。例外：参数/闭包已足够的小型脚本/CLI → 跳过 | 中 |
| ARCH-CEH- | 集中式错误处理：错误被静默吞掉、堆栈跟踪泄漏到生产环境、缺少一致的错误日志记录。例外：50 行的脚本 → 降级为低 | 中（若完全没有处理器，则为高） |
| ARCH-SES- | 会话所有权：同一模块中同时存在 DI 会话和本地会话 | 中 |
| ARCH-AI-SEB | 副作用广度：一个**叶函数**中存在 3 类以上副作用。**冲突解决：**编排器/协调器函数（导入 3 个以上服务并依次委托）按预期就会包含多个类别——不要标记 SEB | 中 |
| ARCH-AI-AH | 架构诚实性：名称表示读取的函数却具有写入副作用 | 中 |
| ARCH-AI-FO | 扁平编排：**叶层**服务导入 3 个以上其他服务。编排器存在这些导入属于预期情况——不要标记 | 中 |
| ARCH-EVENT- | 事件通道一致性：发布者/订阅者名称不匹配（MISMATCH）、没有对应方的孤立通道（ORPHAN） | 高（不匹配），中（孤立） |

**PERF- 子类别：**

| 前缀 | 类别 | 严重程度 |
|--------|----------|----------|
| PERF-ALG- | 算法复杂度（大 O 表示法） | 若为 O(n²)+，则为高 |
| PERF-CFG- | 包/库配置 | 中 |
| PERF-PTN- | 架构模式性能 | 高 |
| PERF-DB- | 数据库查询、索引 | 高 |

**MNT- 子类别：**

| 前缀 | 类别 | 严重程度 |
|--------|----------|----------|
| MNT-DC- | 死代码：已被替换的实现、未使用的导出/重新导出、向后兼容包装器、不受支持的别名 | 中（若为公共 API，则为高） |
| MNT-DRY- | DRY 违规：跨文件的重复逻辑 | 中 |
| MNT-GOD- | 上帝类：包含 >15 个方法或 >500 行的类（并非仅看文件大小） | 中（若 >1000 行，则为高） |
| MNT-SIG- | 方法签名质量：布尔标志参数、返回类型不明确、命名不一致、>5 个可选参数 | 低 |
| MNT-ERR- | 错误契约不一致：同一服务中混用抛出异常和返回 None | 中 |

## 使用时机
- Story status = Done 中的所有实现任务
- 在清理技术债务和内联代理审查之前

## 工作流（简明）

**必须阅读：**加载 `references/input_resolution_pattern.md`

1) **解析 storyId：**按照指南运行 Story Resolution Chain（状态筛选器：[In Progress, To Review]）。
2) 通过 Linear 加载 Story（完整内容）和 Done 状态的实现任务（完整描述）；跳过标签为 "tests" 的任务。
3) **收集已更改文件**（`changed_files[]`）：
   **必须阅读：**加载 `references/git_scope_detection.md`
   - 如果由 ln-510 调用：使用协调器上下文中的 `changed_files[]` → 继续执行指南中的 Enrich 步骤
   - 如果独立调用：运行指南中的完整算法
4) **双层检测（强制）：**
   **必须阅读：**加载 `references/two_layer_detection.md`
   所有基于阈值的发现都需要进行第 2 层上下文分析。仅有第 1 层发现而没有第 2 层分析 = 不是有效发现。在报告任何指标违规之前，请先询问：“此违规是否是有意为之，或在设计上有合理依据？”请参阅下方指标中的 Exception 列。

5) **计算代码指标：**
   - 每个函数的圈复杂度（目标 ≤10；例外：枚举/switch 分派、状态机、解析器语法 → 降级为 LOW）
   - 函数大小（目标 ≤50 行；例外：执行顺序委托的编排函数）
   - 文件大小（目标 ≤500 行；例外：配置/模式/迁移文件、生成的代码）
   - 嵌套深度（目标 ≤3）
   - 参数数量（目标 ≤4；例外：构建器/选项模式）

6) **MCP Ref 验证（代码变更时为强制要求——如果传入 `--skip-mcp-ref` 标志则跳过）：**
   **强制阅读：** 加载 `references/research_tool_fallback.md`

   > **快速通道模式：** 使用 `--skip-mcp-ref` 调用时，跳过整个步骤（不执行 OPT-、BP-、PERF- 检查）。直接进入步骤 6（静态分析）。这样可将成本从约 5000 个 token 降至约 800 个 token，同时保留指标和静态分析的覆盖范围。

   **级别 1 — 最优性（OPT-）：**
   - 从任务中提取目标（例如，“用户身份验证”“缓存”“API 速率限制”）
   - 研究替代方案：`ref_search_documentation("{goal} approaches comparison {tech_stack} 2026")`
   - 根据项目上下文比较所选方案与替代方案
   - 将次优选择标记为 OPT- 问题

   **级别 2 — 最佳实践（BP-）：**
   - 研究：`ref_search_documentation("{chosen_approach} best practices {tech_stack} 2026")`
   - 对于库：`query-docs(library_id, "best practices implementation patterns")`
   - 将偏离推荐模式的情况标记为 BP- 问题

   **级别 3 — 性能（PERF-）：**
   - **PERF-ALG：** 分析算法复杂度（检测 O(n²)+，通过 MCP Ref 研究最优方案）
   - **PERF-CFG：** 通过 `query-docs` 检查库配置（连接池、批次大小、超时）
   - **PERF-PTN：** 研究模式陷阱：`ref_search_documentation("{pattern} performance bottlenecks")`
   - **PERF-DB：** 通过 `query-docs(orm_library_id, "query optimization")` 检查 N+1、缺失索引问题

   **触发 MCP Ref 验证的条件：**
   - 添加了新依赖项（package.json/requirements.txt 发生变更）
   - 使用了新模式/库
   - API/数据库变更
   - 关键路径中存在循环/递归
   - 添加了 ORM 查询

7) **分析代码中的静态问题（分配前缀）：**
   **强制阅读：** 加载 `references/clean_code_checklist.md`、`references/destructive_operation_safety.md`
   - 对于大型代码文件，在进行针对性读取前使用 `outline(file_path)`。
   - SEC-：硬编码凭据、未经验证的输入、SQL 注入、竞态条件
   - SEC-DESTR-：无保护的破坏性操作——使用上面已加载的 destructive_operation_safety.md 中的代码级保护措施表。检查全部 5 类保护措施（DB、FS、MIG、ENV、FORCE）。
   - MNT-：DRY 违规（MNT-DRY-：重复逻辑）、死代码（MNT-DC-：依据检查清单）、复杂条件、糟糕的命名
   - **MNT-DRY- 跨 Story 热点扫描：** 在所有 `src/` 文件中 Grep 常见模式签名（错误处理程序：`catch.*Error|handleError`，验证器：`validate|isValid`，配置访问：`getSettings|getConfig`）（计数模式）。如果任一模式出现在 5 个以上文件中，则抽样 3 个文件（每个读取 50 行）并检查结构相似性。如果相似度 >80% → MNT-DRY-CROSS（中等，-10 分）：`Pattern X duplicated in N files — extract to shared module.`
   - **首选 MNT-DRY-（hex-graph）：** 如果已建立 hex-graph 索引，则使用 `audit_workspace(path=scan_path, verbosity="minimal", limit=5, clone_member_limit=3)`。每个在不同文件中包含 2 个以上成员的克隆组 = MNT-DRY-CROSS。仅当有界预览不足时才提高限制。使用返回的热点和克隆上下文来确定优先级。如果 hex-graph 不可用，则回退到上述 Grep 模式扫描。
   - **MNT-DC- 跨 Story 未使用导出扫描：** 对于 Story 修改的每个文件，统计 `export` 声明。然后在所有 `src/` 中 Grep 对这些导出的导入引用。导入引用为 0 的导出 → MNT-DC-CROSS（中等，-10 分）：`{export} in {file} exported but never imported — remove or mark internal.`
   - **OPT-OSS- 交叉引用 ln-645（静态、快速通道安全）：** 如果 `docs/project/.audit/ln-640/*/645-open-source-replacer*.md` 存在（跨日期执行 glob，取最新文件），则检查是否有任何高置信度替代项与当前 Story 中变更的文件匹配。如果找到匹配项 → 创建 OPT-OSS-{N} 问题，其中包含 ln-645 报告中的模块路径、目标、推荐包、置信度、星标数和许可证。严重程度：如果 >200 LOC 则为高，否则为中。此检查仅读取本地文件——不调用 MCP——即使使用 `--skip-mcp-ref` 也会运行。
   - ARCH-：分层违规、循环依赖、不遵守指南
   - ARCH-LB-：层边界违规（在基础设施层之外进行 HTTP/DB/FS 调用）
   - ARCH-TX-：事务边界违规（跨多个层执行 commit()）
   - ARCH-DTO-：缺少 DTO（4 个以上重复参数）、实体泄漏（从 API 返回 ORM 实体）
   - ARCH-DI-：在业务逻辑中直接实例化（没有 DI 容器或混用多种模式）
   - ARCH-CEH-：缺少或绕过集中式错误处理
   - ARCH-SES-：会话所有权冲突（同一模块中同时存在 DI 和本地会话）
   - ARCH-AI-SEB：副作用广度（一个**叶函数**中包含 3 类以上副作用；编排函数除外——参见上表中的冲突解决规则）
   - ARCH-AI-AH：架构诚实性（以读取命名的函数存在隐藏写入）
   - ARCH-AI-FO：扁平编排（**叶级**服务导入 3 个以上服务；编排器导入除外）
   - ARCH-EVENT-：事件通道不匹配——在 changed_files[] 中 Grep `NOTIFY|pg_notify|\.publish\(|\.emit\(`（发布者）和 `LISTEN|\.subscribe\(|\.on\(`（订阅者）。交叉核对通道名称字符串。<!-- 纵深防御：ln-652 规则 6 也会进行检查 -->
   - MNT-GOD-：上帝类（每个类的方法数 >15 或行数 >500）
   - MNT-SIG-：方法签名质量（布尔标志、返回值不明确）
   - MNT-ERR-：错误契约不一致（同一服务中混用抛出/返回模式）

8) **计算代码质量评分：**
   - 从 100 分开始
   - 扣除指标罚分（参见代码指标表）
   - 扣除问题罚分（参见问题罚分表）

9) **输出裁定结果、评分和结构化问题。**
   **强制阅读：** 加载 `references/output_schema.md`
   按照 schema 格式化输出。将发现的问题添加为 Linear 评论。

## 关键规则
- 在判断合规性之前，阅读 Story/Tasks 中提及的指南。
- **MCP Ref 验证：** 对于任何架构变更，在作出判断前都必须通过 ref_search_documentation 进行验证。
- **库使用 Context7：** 审查库的使用方式时，使用 query-docs 查询以验证正确模式。
- 在评论中保留原语言（EN/RU）。
- 不要创建任务或更改状态；由调用方决定后续操作。

## 运行时摘要工件

**强制阅读：** 加载 `references/quality_summary_contract.md`、`references/quality_worker_runtime_contract.md`

运行时配置：
- 系列：`quality-worker`
- 工作器：`ln-511`
- 摘要类型：`quality-worker`
- 协调器使用的有效载荷字段：`worker`、`status`、`verdict`、`score`、`issues`、`warnings`

调用规则：
- 独立模式：省略 `runId` 和 `summaryArtifactPath`
- 托管模式：同时传入 `runId` 和准确的 `summaryArtifactPath`
- 始终在终止结果之前写入通过验证的摘要

## 完成定义

- [ ] 已加载 Story 和 Done 实现任务（不包括测试任务）
- [ ] 已计算代码指标（圈复杂度、函数/文件大小）
- [ ] 已完成 MCP Ref 验证（OPT-、BP-、PERF- 类别）
- [ ] 已检查 ARCH- 子类别（LB、TX、DTO、DI、CEH、SES、EVENT）；已检查 MNT- 子类别（DC、DRY、GOD、SIG、ERR）
- [ ] 已识别带有前缀和严重级别的问题，并包含来自 MCP Ref/Context7 的来源
- [ ] 已计算代码质量评分
- [ ] 已按照 `references/output_schema.md` 格式化输出
- [ ] 已将发现的问题作为评论发布到跟踪器

## 参考文件
- Git 范围检测：`references/git_scope_detection.md`
- 代码指标：`references/code_metrics.md`（阈值和罚分）
- 指南：`docs/guides/`
- 上下文模板：`references/templates/task_template_implementation.md`
- **整洁代码检查清单：** `references/clean_code_checklist.md`
- 研究工具回退方案：`references/research_tool_fallback.md`

---
**版本：** 5.1.0
**最后更新：** 2026-03-15