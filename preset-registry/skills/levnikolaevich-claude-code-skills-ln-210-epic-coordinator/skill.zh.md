---
name: ln-210-epic-coordinator
description: "Creates or replans 3-7 Epics from scope using Decompose-First pattern. Use when initiative needs Epic-level breakdown or Epic scope changed."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# Epic 协调器

**类型：** L2 领域协调器  
**类别：** 2XX 规划

通用 Epic 管理协调器，通过范围分解处理创建和重新规划。

## 目的

基于范围分解协调 Epic 创建（CREATE）和重新规划（REPLAN）。在预览获批之前，发现和研究阶段保持只读；执行仍以内联方式在 ln-210 内完成。

## 何时使用此技能

此技能适用于：
- 启动需要分解为多个逻辑领域的新范围/计划（CREATE 模式）
- 将大型架构需求拆分为多个 Epic
- 在范围/需求发生变化时更新现有 Epic（REPLAN 模式）
- 在计划内重新平衡 Epic 范围
- 向现有计划结构中添加新的 Epic
- 作为项目规划的第一步（范围 → Epic → Story → Task）
- 为每个领域定义清晰的范围边界和成功标准

**输出：** 3-7 个跟踪器 Epic（逻辑领域/模块；传输方式取决于已配置的提供方）

## 运行时契约

**强制阅读：** 加载 `references/coordinator_runtime_contract.md`、`references/epic_planning_runtime_contract.md`、`references/epic_plan_summary_contract.md`  
**强制阅读：** 当项目包含 `docs/hypotheses/`、`docs/goals/` 或可能改变 Epic 边界的基准测试运行清单时，加载 `references/researchgraph_mcp_usage.md`。

运行时系列：`epic-planning-runtime`

标识符：
- 范围标识符

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_PLAN`
5. `PHASE_4_MODE_DETECTION`
6. `PHASE_5_PREVIEW`
7. `PHASE_6_DELEGATE`
8. `PHASE_7_FINALIZE`
9. `PHASE_8_SELF_CHECK`

决策处理：
- 预览/确认在运行时表示为 `PAUSED + pending_decision`
- 当 ln-210 用作下游协调器时，它会为 ln-200 写入最终的 `epic-plan` 摘要

协调器产物流：
- 执行仍以内联方式在 ln-210 内完成
- `PHASE_7_FINALIZE` 通过 `node references/scripts/epic-planning-runtime/cli.mjs record-plan-summary` 写入协调器摘要
- 受管理的父流程将产物存储在 `.hex-skills/runtime-artifacts/runs/{parent_run_id}/epic-plan/{identifier}.json`

## 工作器调用（强制）

| 阶段 | 工作器 | 上下文 |
|-------|--------|---------|
| 6 | 无 | CREATE/REPLAN 执行以内联方式在 ln-210 内完成；不委派下游 Skill 工作器 |

**下游契约：** ln-210 本身是 `ln-200` 的工作器，并在内联 Epic 创建/重新规划执行完成后写入机器可读的 `epic-plan` 输出。

## TodoWrite 格式（强制）

```text
- Phase 1: Discover scope and project context (pending)
- Phase 2: Research only what changes Epic boundaries (pending)
- Phase 3: Build ideal Epic plan (pending)
- Phase 4: Detect mode and validate Infra Epic need (pending)
- Phase 5: Preview and confirm plan (pending)
- Phase 6: Execute create/replan flow (pending)
- Phase 7: Finalize epic-plan summary (pending)
- Phase 8: Self-check (pending)
```

## 核心概念

### 优先分解模式

**关键原则：** 始终先分析范围并构建理想的 Epic 计划，然后检查现有 Epic 以确定模式：
- **不存在现有 Epic** → 创建模式（生成并创建所有 Epic）
- **存在现有 Epic** → 重新规划模式（进行比较并确定操作：保留/更新/废弃/创建）

**理由：** 确保基于当前范围要求进行一致的 Epic 分解，不受现有 Epic 结构影响（该结构可能已经过时或并非最优）。

### Epic 0 保留用于基础设施

**强制阅读：** 加载 `references/numbering_conventions.md`，了解 Epic 0 的规则、使用时机以及跟踪器编号方式。

---

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `scopeDoc` | 是 | args、项目文档、用户 | 用于 Epic 分解的范围文档 |

**解析方式：** Epic 解析链（适配为：范围文档发现）。
**回退方式：** 如果未找到范围文档 → AskUserQuestion：“应将什么内容分解为 Epic？”

## 工作流

### 阶段 0：工具配置

**强制阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/input_resolution_pattern.md`

提取：`task_provider` = 任务管理 → 提供商

### 阶段 1：发现

**目标：** 在进行任何预览或变更之前，收集确定 Epic 边界所需的最少上下文。

**步骤 0：解析 scopeDoc**（依据 input_resolution_pattern.md，并针对范围进行适配）：
- 如果提供了 args（范围描述或文档路径）→ 使用 args
- 否则，如果 `docs/project/requirements.md` 存在 → 将其用作范围来源
- 否则，如果 `docs/requirements.md` 存在 → 将其用作范围来源
- 否则 → AskUserQuestion：“应将什么内容分解为 Epic？”

**步骤 1：加载配置**

从 `docs/tasks/kanban_board.md` 自动发现团队 ID 和下一个 Epic 编号：
- **团队 ID：** 读取跟踪器配置表 → 回退方式：直接询问用户
- **下一个 Epic 编号：** 读取下一个 Epic 编号字段 → 回退方式：直接询问用户

**强制阅读：** 加载 `CLAUDE.md` 中的“Configuration Auto-Discovery”和“Tracker Integration”章节。

### 阶段 2：研究

**目标：** 仅研究会改变 Epic 边界、基础设施 Epic 需求或批量预览质量的内容。

**步骤 1：项目研究**

**目标：** 在询问用户之前，研究项目文档和前端代码以了解上下文。

**流程：**

0. **Researchgraph 预检（如果存在）：**
   - 如果 `docs/hypotheses/`、`docs/goals/` 或 `benchmark/runs/*/manifest.yaml` 存在，首先以只读方式运行 `verify_index`。
   - 仅当目标/假设会改变 Epic 边界、验证范围或推广/泛化工作时，才使用 `inspect_goal`、`trace_goal_tree`、`find_hypotheses` 或 `audit_goal_alignment`。
   - 将 `STALE` 图谱债务视为规划上下文，而不是其本身成为 Epic 阻碍因素。

1. **文档扫描：**
   - 使用 `Glob` 查找：`docs/requirements.md`、`docs/architecture.md`、`docs/tech_stack.md`
   - 使用 `Read` 加载找到的文档

2. **前端代码扫描（如适用）：**
   - 使用 `Glob` 查找：`**/*.html`、`src/**/*.html`、`public/**/*.html`、`templates/**/*.html`
   - 使用 `Read` 加载 HTML 文件
   - 从以下内容中提取功能领域：
     - **导航菜单：** `<nav>`、`<a href>` 链接可揭示功能区域
     - **表单：** 输入字段可揭示数据模型（用户注册、登录、结账）
     - **页面标题：** `<h1>`、`<title>` 标签可揭示功能名称
     - **路由模式：** URL 结构可揭示领域边界

   **HTML 提取示例：**
   ```html
   <nav>
     <a href="/products">Products</a>
     <a href="/cart">Shopping Cart</a>
     <a href="/checkout">Checkout</a>
   </nav>
   <!-- Reveals domains: Product Catalog, Shopping Cart, Payment -->
   ```

3. **从文档和 HTML 中提取关键信息：**
   - **业务目标：** 项目试图实现什么？（来自 requirements.md）
   - **用户画像：** 谁将使用该系统？（来自 requirements.md）
   - **主要功能领域：** 主要模块/区域有哪些？（来自 requirements.md、architecture.md、HTML 导航）
   - **技术栈：** 提到了哪些技术？（来自 tech_stack.md、architecture.md、HTML meta/script 标签）
   - **基础设施需求：** 是否提及日志记录、监控、部署、CI/CD、安全性、性能优化？

4. **合并发现：**
   - 合并来自文档和 HTML 的领域（去重、整合相似项）
   - 示例："User Auth"（来自文档）+ "Login"（来自 HTML）→ "User Management"

**回退方案：** 如果文档和 HTML 均缺失 → 跳至范围提问；不要虚构需要大量调研的细节

**步骤 2：基础设施 Epic 决策**

**目标：** 确定是否应提议基础设施 Epic（Epic 0）。

**基础设施 Epic 的判断标准：**

✅ 如果满足以下任一条件，则**提议基础设施 Epic（Epic 0）**：
1. **新项目**（未找到 `docs/infrastructure.md`，且 kanban_board.md Epic Story Counters 中没有 "Infrastructure" Epic）
2. **多技术栈**（requirements.md 或 tech_stack.md 提到前端和后端使用不同的技术栈，例如 React + Python）
3. requirements.md、architecture.md 中**提及基础设施需求**：
   - 日志记录、错误处理
   - 监控、告警
   - 托管、部署、CI/CD
   - 安全性（身份验证、授权、加密、密钥管理）
   - 性能优化（缓存、速率限制、数据库优化）

❌ 如果满足以下任一条件，则**不要提议**：
1. 现有项目（找到 `docs/infrastructure.md`）
2. Epic Story Counters 显示已存在标题中包含 "Infrastructure" 的 Epic
3. 用户在之前的交互中明确拒绝

**决策：** 存储 YES/NO 决策，以供阶段 2 使用

**发现与调研的输出：**
- 团队 ID、下一个 Epic 编号
- 项目上下文（业务目标、来自文档和 HTML 的领域、技术栈、基础设施需求）——如有发现
- 基础设施 Epic 决策（YES/NO）

---

### 阶段 2：范围分析与 Epic 规划

**目标：** 识别逻辑领域，并以内联方式构建 Epic 结构。

**流程：**

**步骤 1：自动识别领域**

使用阶段 1 步骤 2 的调研上下文：
- 如果找到项目文档 → 从 requirements.md、architecture.md 中提取领域（模块名称、功能区域）
- 如果找到 HTML → 从导航、表单和页面结构中提取领域
- 合并领域并去重
- 示例："用户认证" + "个人资料管理" → "用户管理"

**后备方案：** 如果没有文档/HTML → 询问用户基本问题（范围、目标、功能区域）

**步骤 2：构建 Epic 列表（内联）**

**如果需要基础设施（根据阶段 1 步骤 3）：**
- **Epic 0：基础设施与运维** — 按照 `numbering_conventions.md` §Epic 0 Content Template
- **Epic 1-N：** 业务领域（来自步骤 1）

**否则：**
- **Epic 1-N：** 仅包含业务领域

**步骤 3：确定 Epic 数量**

- 基础设施 Epic（如适用）：+1 个 Epic
- 简单计划（1-3 个领域）：总计 3-4 个 Epic
- 中等计划（4-6 个领域）：总计 5-7 个 Epic
- 复杂计划（7 个以上领域）：总计 7-10 个 Epic（少见）
- **每个计划最多 10 个 Epic**（强制执行）

**步骤 4：展示拟议的 Epic 结构（用户控制点 1）**

使用计划内部索引显示已识别的 Epic：

```
📋 Proposed Epic Structure:

Epic 0: Infrastructure & Operations
Epic 1: User Management
Epic 2: Product Catalog
Epic 3: Shopping Cart
Epic 4: Payment Processing
Epic 5: Order Management

Total: 6 Epics
Type "confirm" to proceed, or modify the list
```

**步骤 5：用户确认**

- 用户输入 "confirm" → 继续进入阶段 3
- 用户进行修改 → 更新领域列表并再次显示

**输出：** 已批准的 Epic 列表（Epic 0-N 或 Epic 1-N），可用于下一阶段

**只读准备规则：** 可以预先收集领域提取、HTML 扫描和基础设施 Epic 检测的结果。在预览得到确认之前，不要进入创建/重新规划流程。

### Epic 质量门禁

**背景：** 在创建 Epic 之前进行结构化质量检查，可确保范围清晰，并防止在 Story 分解过程中返工。

针对每个拟议的 Epic，验证 5 项标准：

| # | 标准 | 通过 | 失败 |
|---|-----------|------|------|
| 1 | **范围清晰度** | 包含/不包含边界清晰 | 模糊或与其他 Epic 重叠 |
| 2 | **成功标准** | 可衡量（"<200ms"、">98%"） | 模糊（"快"、"可靠"） |
| 3 | **风险文档** | 已识别依赖项/阻塞项 | 风险部分为空或过于笼统 |
| 4 | **平衡性** | 各 Epic 的范围规模相近（±30%） | 某个 Epic 包含 80% 的工作 |
| 5 | **独立性** | 不存在循环 Epic 依赖 | Epic 彼此阻塞 |

**质量分数 = 通过标准的数量（0-5）**
- 5/5：继续创建
- 3-4/5：显示警告，由用户决定
- <3/5：创建前重新设计 Epic 结构

---

### 阶段 3：检查现有 Epic

**目标：** 确定使用创建模式还是重新规划模式。

查询 kanban_board.md 和任务提供程序中现有的 Epic：

1. 读取 kanban_board.md 中的 **Epic Story Counters** 表
2. **如果 task_provider == "linear"：** 使用 `list_projects(team=teamId)` 进行交叉检查
   **否则，如果 task_provider == "github"：** 使用 `gh issue list -R {REPO} --label epic --state all --json number,title` 进行交叉检查
   **否则：** 使用 `Glob("docs/tasks/epics/*/epic.md")` 列出基于文件的 Epic
3. **统计现有 Epic 行数**（不包括表头行）

**决策点：**
- **Count = 0** → 不存在现有 Epic → **进入阶段 4+5a（CREATE MODE）**
- **Count ≥ 1** → 发现现有 Epic → **进入阶段 5b（REPLAN MODE）**

---

### 阶段 4：Epic 准备（仅限 CREATE 模式）

**触发条件：** 阶段 3 确定 Count = 0（CREATE MODE）

**目标：** 在批量预览之前准备好所有 Epic 文档。

**步骤 1：自动提取所有领域的信息**

对于每个领域（来自阶段 2），从项目文档中提取以下 5 个关键问题的答案：

1. **Q1：业务目标** - 此 Epic/领域为何重要
   - **来源：** requirements.md（领域目标部分）
   - **提取内容：** “The [domain] module aims to...” 或 “Goal: [objective]”
   - **后备来源：** architecture.md（模块用途）

2. **Q2：范围内的关键功能** - 3-5 个能力要点
   - **来源：** requirements.md（此领域的功能需求）
   - **提取内容：** 领域标题下的项目符号列表、功能描述
   - **后备来源：** architecture.md（组件职责）

3. **Q3：范围外内容** - 防止范围蔓延
   - **来源：** requirements.md（明确排除的功能部分）
   - **提取内容：** “Not in scope:”、“Future versions:”、“Out of scope for [domain]:”
   - **后备方案：** 根据 requirements.md 推断（领域中未提及的功能）

4. **Q4：成功标准** - 可衡量的结果
   - **来源：** requirements.md（领域的验收标准、指标、KPI）
   - **提取内容：** 性能目标、用户指标、质量门禁
   - **后备方案：** 根据领域类型使用通用标准（例如，后端的“<200ms API response”）

5. **Q5：已知风险**（可选）- 阻碍因素、依赖项
   - **来源：** architecture.md（技术约束、依赖项部分）
   - **提取内容：** “Risks:”、“Dependencies:”、“Constraints:”
   - **后备方案：** 如果风险至关重要，则获取用户输入；否则保留为“To be determined during Story planning”

**如果提取的信息不完整：**
- 向用户展示已提取的信息
- 针对所有领域中缺失的全部信息仅询问一次（批量提问，而非逐个领域提问）
- 示例：“对于 Epic 1（用户管理），我找不到成功标准。对于 Epic 2（支付），我找不到风险信息。请提供……”

**步骤 2：生成所有 Epic 文档**

对于每个领域，使用 epic_template_universal.md 生成完整的 Epic 文档：

**Epic 编号：**
- 如果存在基础设施 Epic（来自阶段 1 步骤 3）→ Epic 0（基础设施）、Epic 1-N（业务领域）
- 否则 → 仅使用 Epic 1-N（业务领域）

**跟踪器标题（将在阶段 5a 中创建）：**
- 使用 kanban_board.md 中的 Next Epic Number 进行顺序编号
- 格式：“Epic {Next Epic Number}: {Domain Title}”
- 示例：Next = 11 → “Epic 11: Infrastructure & Operations”

**章节：** 目标、范围内/范围外、成功标准、依赖项、风险与缓解措施、架构影响、阶段

**使用步骤 1 中提取的信息**填写所有章节

**输出：** 所有 Epic 文档均已就绪（Epic 0-N），并已在计划内完成编号

---

### 阶段 5a：Epic 创建（CREATE 模式）

**触发条件：** 阶段 4 已完成准备工作

**目标：** 显示预览、获取确认，并通过已配置的跟踪器提供商创建所有 Epic。

**步骤 1：显示批量预览（用户控制点 2）**

使用计划内部索引显示所有生成的 Epic：

```
📋 Epic Batch Preview (6 Epics to create)

═══════════════════════════════════════════════
Epic 0: Infrastructure & Operations
═══════════════════════════════════════════════
Goal: Establish foundational infrastructure, deployment pipeline, and operational capabilities to support all business Epics

Scope In:
- Logging and error handling framework
- Monitoring and alerting system
- CI/CD pipeline (GitHub Actions)
- Security baseline (secrets management, encryption)
- Performance optimization (caching, rate limiting)

Scope Out:
- Application-specific business logic
- User-facing features
- Domain-specific integrations

Success Criteria:
- All deployments automated via CI/CD (<10 min deployment time)
- System uptime ≥99.9%
- API response time <200ms (p95)
- Security audit passed

═══════════════════════════════════════════════
Epic 1: User Management
═══════════════════════════════════════════════
Goal: Enable users to register, authenticate, and manage their accounts securely

Scope In:
- User registration with email verification
- Login/logout with JWT authentication
- Password reset flow
- Profile management

Scope Out:
- Social login (OAuth) - planned for Epic 5
- Multi-factor authentication - future version
- User roles and permissions - part of Epic 3

Success Criteria:
- User registration <2 seconds
- Login success rate >98%
- Password reset completion rate >90%

[... all other Epics ...]

───────────────────────────────────────────────
Total: 6 Epics (Epic 0: Infrastructure, Epic 1-5: Business domains)
Type "confirm" to create all Epics via the configured tracker provider
```

**步骤 2：用户确认**

- 用户输入 "confirm" → 继续执行步骤 3
- 用户提供反馈 → 在阶段 4 中调整文档，重新生成预览并重复此流程

### 停止条件（预览循环）

| 条件 | 操作 |
|-----------|--------|
| 用户确认（输入 "confirm" 或批准） | 停止 — 继续创建 |
| 用户反馈轮次 >= 3 | 停止 — 询问："已进行 3 轮修订。是按当前版本继续，还是放弃？" |
| 经过 2 次返工后，Epic 质量门禁得分仍 < 3/5 | 停止 — 上报："无法达到质量阈值。请审查范围。" |

**步骤 3：创建所有 Epic**

对于每个 Epic（按顺序创建，以确保编号一致）：

1. **获取下一个 Epic 编号：**
   - 从 kanban_board.md 读取当前的下一个 Epic 编号
   - 示例：11

2. **创建 Epic（取决于提供商）：**

   **如果 task_provider == "linear"：**
   - `save_project({name: "Epic {N}: {Title}", description: epic_markdown, team: teamId, state: "planned"})`
   - 收集返回的 URL

   **否则，如果 task_provider == "github"：**
   - `gh issue create -R {REPO} --title "Epic {N}: {Title}" --body "{epic_markdown}" --label "epic"`
   - 添加到项目并将状态设置为 Backlog（按照 provider_github.md）
   - 收集返回的议题 URL

**否则（文件模式）：**
   - `mkdir -p docs/tasks/epics/epic-{N}-{slug}/stories/`
   - 使用 `Write("docs/tasks/epics/epic-{N}-{slug}/epic.md")` 写入 Epic Markdown 和文件头（`**Status:** Backlog`、`**Created:** {date}`）

3. **更新 kanban_board.md：**
   - 将 Tracker Configuration 表中的 Next Epic Number 加 1
   - 向 Epic Story Counters 添加新行：`Epic {N} | - | US001 | - | EPN_01`
   - 添加到「Epics Overview」→ Active：`- [Epic {N}: Title](link) - Backlog`

4. **收集 URL**（Linear/GitHub 模式）或文件路径（文件模式），具体参见 `references/provider_file.md, references/provider_github.md, references/provider_linear.md`

**步骤 4：显示摘要**

```
✅ Created 6 Epics for initiative

Epics created:
- Epic 11: Infrastructure & Operations (Epic 0 index) [link]
- Epic 12: User Management (Epic 1 index) [link]
- Epic 13: Product Catalog (Epic 2 index) [link]
- Epic 14: Shopping Cart (Epic 3 index) [link]
- Epic 15: Payment Processing (Epic 4 index) [link]
- Epic 16: Order Management (Epic 5 index) [link]

Next Epic Number updated to: 17

Next Steps:
1. Use ln-220-story-coordinator to create Stories for each Epic (run 6 times)
2. OR use ln-200-scope-decomposer to automate Epic + Story creation
```

**输出：** 已创建的 Epic URL + 摘要

**TodoWrite 格式：** 添加 Phase 1-5a 待办事项 + 每个 Epic 一个待办事项 + kanban 更新。将其标记为 in_progress/completed。

---

### Phase 5b：重新规划模式（发现现有 Epic）

**触发条件：** Phase 3 判定 Count ≥ 1（重新规划模式）

**完整工作流：****必须阅读：** 加载 `references/replan_workflow.md`，了解完整的重新规划流程。

**摘要：**
1. 加载现有 Epic（IF task_provider == "linear": from Linear API | IF task_provider == "github": from `gh issue list --label epic` | ELSE: from `docs/tasks/epics/*/epic.md`）
2. 将理想方案与现有方案进行比较 → 分类为：KEEP/UPDATE/OBSOLETE/CREATE
3. 显示包含差异和警告的重新规划摘要
4. 必须获得用户确认
5. 执行操作（依据 provider_*.md）+ 更新 kanban_board.md

**约束：** 切勿自动更新/归档包含进行中 Story 的 Epic。切勿删除（应使用 archived）。始终要求确认。

---

## 关键规则

- **优先分解：** 始终先构建理想的 Epic 方案，再检查现有 Epic（避免受过时结构影响）
- **Epic 0 保留给基础设施：** 业务领域从 Epic 1 开始；当检测到新项目、多技术栈或基础设施需求时，自动建议 Epic 0
- **先自动提取，再提问：** 从文档（requirements.md、architecture.md、tech_stack.md）+ HTML 中提取 Q1-Q5；仅针对缺失信息一次性向用户提问
- **切勿自动更新包含进行中 Story 的 Epic：** 重新规划模式需要用户确认；对于包含活跃 Story 的 Epic，应显示警告，而不是静默更改
- **跟踪器标题格式：** "Epic {Next Epic Number}: {Domain Title}" — 从 kanban_board.md 开始按顺序编号

---

## 完成定义

完成工作前，请验证所有检查点：

**✅ 发现阶段已完成（Phase 1）：**
- [ ] 已从 kanban_board.md 加载 Team ID
- [ ] 已从 kanban_board.md 加载 Next Epic Number
- [ ] 已扫描文档（requirements.md、architecture.md、tech_stack.md）
- [ ] 已扫描 HTML 文件（如果存在前端）
- [ ] 已作出基础设施 Epic 决策（根据项目条件选择 YES/NO）

**✅ 范围分析完成（阶段 2）：**
- [ ] 已从文档 + HTML 中自动识别领域
- [ ] 如适用，已包含基础设施 Epic（Epic 0）
- [ ] 已构建 Epic 列表（Epic 0-N 或 Epic 1-N）
- [ ] 用户已确认 Epic 结构（控制点 1）

**✅ 已检查现有 Epic（阶段 3）：**
- [ ] 已从 kanban_board.md 读取 Epic Story Counters
- [ ] 已确定现有 Epic 数量（0 → CREATE，≥1 → REPLAN）

**✅ Epic 准备完成（阶段 4 - 仅限 CREATE）：**
- [ ] 已为所有领域自动提取 Q1-Q5
- [ ] 如有需要，用户已提供缺失信息（批量问题）
- [ ] 已生成所有 Epic 文档（Epic 0-N 索引）

**✅ Epic 创建完成（阶段 5a - 仅限 CREATE）：**
- [ ] 已显示包含 Epic 0-N 索引的批量预览
- [ ] 用户已确认预览（控制点 2）
- [ ] 已通过配置的跟踪器提供方创建所有 Epic，格式为 "Epic {N}: {Title}"（N = Next Epic Number）
- [ ] 每创建一个 Epic 后均已更新 kanban_board.md：
  - Next Epic Number 增加 1
  - 已添加 Epic Story Counters 行
  - 已更新 Epics Overview
- [ ] 已显示包含所有 Epic URL 的摘要
- [ ] 已在最终处理期间记录协调器 `epic-plan` 摘要

**✅ Epic 重新规划完成（阶段 5b - 仅限 REPLAN）：**
- **强制阅读：** 加载 `references/replan_workflow.md` 以获取完整检查清单
- [ ] 已在最终处理期间记录协调器 `epic-plan` 摘要

**输出：** Epic URL 列表（Epic {N}: {Title}）+ Next Epic Number 值

---

## 使用示例

**请求：** “为电子商务平台创建 Epic”

**流程：** 阶段 1（发现 Team ID=Product、Next=11，扫描文档+HTML）→ 阶段 2（识别 6 个领域：基础设施、用户、产品、购物车、支付、订单）→ 阶段 3（count=0 → CREATE）→ 阶段 4（自动提取 Q1-Q5，生成文档）→ 阶段 5a（预览、确认、通过配置的跟踪器提供方创建：Epic 11-16）

**结果：** 已创建 6 个 Epic（Epic 0-5 内部索引，Epic 11-16 跟踪器标题）

---

## 阶段 6：元分析

可选参考：仅当用户请求运行后元分析或采用协议格式的运行反思时，才加载 `references/meta_analysis_protocol.md`。

Skill 类型：`planning-coordinator`。如有请求，请在所有阶段完成后运行。使用 `planning-coordinator` 格式输出到聊天中。

## 参考文件

- **强制阅读：** 加载 `references/environment_state_contract.md`
- **强制阅读：** 加载 `references/storage_mode_detection.md`
- **[强制] 问题解决方法：** `references/problem_solving.md`
- **编排器生命周期：** `references/orchestrator_pattern.md`
- **自动发现模式：** `references/auto_discovery_pattern.md`
- **优先分解模式：** `references/decompose_first_pattern.md`
- **编号约定：** `references/numbering_conventions.md`（保留 Epic 0，跟踪器编号）
- **议题创建工作流：** `references/issue_creation_workflow.md`
- **linear_integration.md：** 发现模式 + Linear API 参考（已移至 `references/templates/linear_integration.md`）
- **epic_template_universal.md：** Epic 模板结构
- **replan_workflow.md：** 完整的 REPLAN 模式工作流（阶段 5b）

---

## 最佳实践

- **先调研：** 在询问用户之前，先浏览文档（requirements.md、architecture.md、tech_stack.md）和 HTML
- **基础设施使用 Epic 0：** 为基础设施 Epic 保留该编号；业务领域从 Epic 1 开始
- **业务 Epic 分组：** 1 个 Epic = 5-10 个 Story = 1 项业务能力（而非技术组件）
- **自动提取：** 在询问用户之前，先从文档中提取 Q1-Q5；仅询问缺失的信息
- **跟踪器标题：** 采用 "Epic {Next Epic Number}: {Domain}" 格式
- **以业务为中心的范围：** 列出用户能力，而非技术任务
- **可衡量的标准：** 使用 "<200ms" 而非“快”；使用 ">98% login rate" 而非“可靠”
- **无代码片段：** 仅包含高层级功能和目标

---

**版本：** 8.0.0
**最后更新：** 2026-04-05