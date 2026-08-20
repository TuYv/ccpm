---
name: ln-623-duplication-overabstraction-auditor
description: "Checks evidence-backed duplication, over-abstraction, and unused extensibility. Use when auditing DRY/KISS/YAGNI risk."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__audit_workspace, mcp__hex-graph__find_implementations, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 重复与过度抽象审计器（L3 工作器）

**类型：** L3 工作器

专门审计重复、过度抽象和未使用的扩展性。

## 目的与范围

- 审计**重复和过度抽象**（DRY/KISS/YAGNI）
- 返回包含严重程度、位置、工作量、pattern_signature 和建议的结构化发现
- 输出 `MERGE_DUPLICATION`、`REMOVE_ABSTRACTION` 或 `REMOVE_YAGNI`
- 计算“重复与过度抽象”类别的合规分数（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`best_practices`、`principles`、`codebase_root`、`output_dir`。

**领域感知：** 支持 `domain_mode` + `current_domain`（参见 `audit_output_schema.md#domain-aware-worker-output`）。

当克隆组、实现或语义关系能够显著改善审计效果时，优先使用 `hex-graph`。如可用，读取本地代码时优先使用 `hex-line`。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明采用了回退方案。

## 工作流

检测策略：使用双层检测（候选扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) **解析上下文**——提取字段，确定 `scan_path`（如已指定，则采用领域感知方式），提取 `output_dir`
2) **加载检测模式**
   - **强制阅读：** 加载 `references/detection_patterns.md`，获取特定于语言的 Grep/Glob 模式
   - 选择与项目 `tech_stack` 匹配的模式
3) **扫描代码库中的违规项（第 1 层）**
   - 所有 Grep/Glob 模式均使用 `scan_path`（而非 codebase_root）
   - **图加速（如可用）：** 如果 `contextStore.graph_indexed` 或 `.hex-skills/codegraph/index.db` 存在：
     - **DRY（1.1-1.10）：** `audit_workspace(path=scan_path, verbosity="minimal", limit=5, clone_member_limit=3)`——返回的每个克隆组均为 DRY 候选项。仅在有意深入分析时提高限制。使用克隆类型和热点上下文进行严重程度分类。如果不可用，则回退到 grep 模式。
     - **KISS 继承：** 对抽象类使用 `find_implementations(symbol)`——统计实现数量（1 个实现 = KISS 候选项）。通过图追踪继承深度。
     - **复杂度：** `audit_workspace(path=scan_path, verbosity="minimal", limit=5)`——使用返回的热点，预先识别用于 KISS/质量分析的复杂函数。仅在有意深入分析时提高 `limit`。
     - **大纲优先读取：** 在读取大型源文件之前使用 `outline(file_path)`——先了解结构，再分析原则。
   - 按照 `detection_patterns.md` 中的分步检测流程执行
   - 应用 `detection_patterns.md#exclusions` 中的排除规则
4) **按候选项分析上下文（第 2 层）**
   - DRY：读取两个代码块，确认是否确实存在重复（而非仅仅命名相似或共享接口）
   - KISS：检查抽象是否服务于 DI 模式（有效的单实现接口），或是否属于过早抽象
   - YAGNI：检查功能标志是最近添加的（有意为之），还是已闲置数月
5) **生成建议**
   - **强制阅读：** 加载 `references/refactoring_decision_tree.md` 以选择模式
   - 通过决策树将每项发现与适当的重构模式匹配
6) **收集包含严重程度、位置、工作量、pattern_id、pattern_signature 和建议的发现**
   - 为每项发现添加 `domain: domain_name` 标签（如果启用了领域感知）
   - 为托管式聚合分配 `pattern_signature`
7) **使用扣分算法计算分数**
8) **编写报告：** 按照 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-623--{domain}.md`（全局模式下则写入 `623-principles.md`）。**包含带有 pattern_signature 字段的 `<!-- FINDINGS-EXTENDED -->` JSON 块**，用于跨领域 DRY 分析
9) **返回摘要：** 返回最简摘要（参见输出格式）

## 两层检测

检测策略：采用两层检测（先扫描候选项，再进行上下文验证）；仅当验证方法存在歧义时才加载 `references/two_layer_detection.md`。

所有发现都需要进行第 2 层上下文分析。只有第 1 层发现而没有第 2 层分析 = 不是有效发现。报告前，请先询问：“这种违规是有意为之，还是设计上有合理依据？”

| 发现类型 | 第 2 层降级示例 |
|-------------|--------------------------|
| DRY | 生命周期/所有权不同的模块 -> 跳过。为实现解耦而有意重复 -> 跳过 |
| KISS | 框架要求的抽象（例如 Spring 中的 DI）-> 降级。目前只有一个实现，但接口用于测试 -> 跳过 |
| YAGNI | 用于 A/B 测试的功能标志 -> 跳过。运维团队使用的配置选项 -> 跳过 |

## 审计规则

### 1. DRY 违规（不要重复自己）

**强制阅读：**加载 `references/detection_patterns.md`，了解每种类型的检测步骤。

| 类型 | 内容 | 严重程度 | 例外（跳过/降级） | 默认建议 | 工作量 |
|------|------|----------|---------------------------|----------------------|--------|
| **1.1** 相同代码 | 多个文件中存在相同的函数/常量/代码块（>10 行） | 高：业务关键代码（身份验证、支付）。中：工具代码。低：出现次数 <5x 的简单常量 | 生命周期/所有权不同的模块 -> 跳过。有意解耦 -> 跳过 | 提取函数 -> 根据重复范围决定放置位置 | M |
| **1.2** 重复验证 | 多个文件中存在相同的验证模式（电子邮件、密码、电话、URL） | 高：身份验证/支付。中：出现 3+x 的用户输入验证。低：出现次数 <3x 的格式检查 | 不同的安全上下文（身份验证与公开场景）-> 跳过 | 提取到共享验证器模块 | M |
| **1.3** 重复错误消息 | 使用硬编码错误字符串，而不是集中式目录 | 中：关键消息被硬编码或没有错误目录。低：出现位置 <3 个 | 需要根据上下文采用不同措辞的面向用户字符串 -> 降级 | 创建常量/错误消息文件 | M |
| **1.4** 相似模式 | 函数具有相同的调用序列/控制流，但名称/实体不同 | 中：关键路径中的业务逻辑。低：出现次数 <3x 的工具代码 | 预计会分化演进的模块 -> 跳过 | 提取公共逻辑（有关模式，请参阅决策树） | M |
| **1.5** 重复 SQL/ORM | 不同服务中存在相同查询 | 高：支付/身份验证查询。中：常见查询出现 3+x。低：简单查询出现次数 <3x | 不同的限界上下文；共享数据库比重复更糟 -> 跳过 | 提取到 Repository 层 | M |
| **1.6** 复制粘贴的测试 | 多个测试文件中存在相同的准备/清理/测试夹具 | 中：准备代码出现在 5 个以上文件中。低：少于 5 个文件 | 为了清晰性/独立性而有意隔离测试 -> 降级 | 提取到测试辅助工具 | M |
| **1.7** 重复 API 响应 | 在没有 DTO 的情况下使用相同的响应对象结构 | 中：出现在 5 个以上端点中。低：少于 5 个端点 | 具有不同版本生命周期的响应 -> 跳过 | 创建 DTO/Response 类 | M |
| **1.8** 重复中间件链 | 多个路由上存在相同的中间件/装饰器堆栈 | 中：相同链出现在 5 个以上路由上。低：少于 5 个路由 | 具有不同身份验证/速率限制要求的路由 -> 跳过 | 创建具名中间件组，并在路由器级别应用 | M |
| **1.9** 重复类型定义 | 字段相同度达到 80%+ 的接口/结构体/类型 | 中：出现在 5 个以上文件中。低：2-4 个文件 | 具有不同所有权/演进路径的类型 -> 跳过 | 创建共享基础类型，并按需扩展 | M |
| **1.10** 重复映射逻辑 | 多个位置存在相同的实体->DTO / DTO->实体转换 | 中：出现在 3 个以上位置。低：2 个位置 | 具有不同验证/数据扩充规则的映射 -> 跳过 | 创建专用 Mapper 类/函数 | M |

**建议选择：** 使用 `references/refactoring_decision_tree.md`，根据重复位置（第 1 层）和逻辑类型（第 2 层）选择正确的重构模式。

### 2. KISS 违规（保持简单直白）

| 违规项 | 检测方法 | 严重程度 | 例外（跳过/降级） | 建议 | 工作量 |
|-----------|-----------|----------|---------------------------|---------------|--------|
| 只有 1 个实现的抽象类 | Grep `abstract class` -> 统计子类数量 | HIGH：妨碍理解核心逻辑 | 用于 DI/测试的接口 -> 跳过。框架要求（Spring、ASP.NET）-> 跳过 | 移除抽象并内联 | L |
| 用于少于 3 种类型的工厂 | Grep 工厂模式 -> 统计分支数量 | MEDIUM：不必要的模式 | 工厂用于 DI/测试替换 -> 降级 | 替换为直接构造 | M |
| 超过 3 层的深度继承 | 跟踪 extends 链 | HIGH：层级结构脆弱 | 框架强制要求的层级结构（UI 组件、ORM 模型）-> 降级 | 使用组合扁平化 | L |
| 过多的泛型约束 | Grep `<T extends ... & ...>` | LOW：可接受的权衡 | 用于公共 API 边界的类型安全 -> 跳过 | 简化约束 | M |
| 仅作包装的类 | 阅读：所有方法都委托给内部对象 | MEDIUM：不必要的间接层 | 用于隔离外部 API 的适配器模式 -> 跳过 | 移除包装器，直接使用内部对象 | M |

### 3. YAGNI 违规（你不会需要它）

| 违规项 | 检测方法 | 严重程度 | 例外（跳过/降级） | 建议 | 工作量 |
|-----------|-----------|----------|---------------------------|---------------|--------|
| 无效的功能标志（始终为 true/false） | Grep 标志 -> 验证其从未切换 | LOW：需要清理 | A/B 测试标志 -> 跳过。由运维控制的开关 -> 跳过 | 移除标志，保留活跃代码路径 | M |
| 从未被重写的抽象方法 | Grep abstract -> 搜索实现 | MEDIUM：未使用的可扩展性 | 公共库中的插件/扩展点 -> 降级 | 移除抽象，改为具体方法 | M |
| 未使用的配置选项 | Grep 配置键 -> 0 个引用 | LOW：无效配置 | 特定于环境的配置（staging/prod）-> 标记前先验证 | 移除选项 | S |
| 只有 1 个实现的接口 | Grep interface -> 统计实现类数量 | MEDIUM：过早抽象 | 用于 DI/测试 mock 的接口 -> 跳过 | 移除接口，直接使用类 | M |
| 过早引入的泛型（仅用于 1 种类型） | Grep 泛型用法 -> 统计类型参数 | LOW：过度工程化 | 为使用者设计的公共库 API -> 跳过 | 将泛型替换为具体类型 | S |

### 4. 证据门槛

不要报告审美偏好。只有当执行者能够展示重复代码、没有实际变化点的抽象，或会增加维护成本的未使用扩展性时，发现项才有效。

| 问题 | 所需证据 | 操作 |
|-------|-------------------|--------|
| 重复 | 匹配的代码块、重复的验证/查询/映射，或跨文件重复的 pattern_signature | `MERGE_DUPLICATION` |
| 过度抽象 | 只有一个实际实现且不存在框架/测试需求的抽象层 | `REMOVE_ABSTRACTION` |
| YAGNI | 当前未使用的功能标志、配置选项、泛型或扩展点 | `REMOVE_YAGNI` |

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器按照共享契约生成其自身限定于本次运行的制品路径。

将报告写入 `{output_dir}/ln-623--{domain}.md`（全局模式下则为 `623-principles.md`），并使用 `category: "Duplication & Over-Abstraction"`。

**FINDINGS-EXTENDED 块（此工作器必需）：** 在 Findings 表格之后，包含一个 `<!-- FINDINGS-EXTENDED -->` JSON 块，其中包含所有用于托管聚合且带有 `pattern_signature` 的 DRY 发现。遵循 `references/templates/audit_worker_report_template.md`。

**pattern_id：** DRY 类型标识符（`dry_1.1` 至 `dry_1.10`）。非 DRY 发现中省略。

**pattern_signature：** 检测到的模式的规范化键（例如 `validation_email`、`sql_users_findByEmail`、`middleware_auth_validate_ratelimit`）。多个领域中出现相同签名时，会触发跨领域 DRY 发现。其格式定义于 `references/detection_patterns.md`。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-623--users.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告
- **领域感知扫描：** 如果 `domain_mode="domain-aware"`，则仅扫描 `scan_path`
- **标记发现：** 在领域感知模式下，每项发现都要包含 `domain` 字段
- **模式签名：** 每项 DRY 发现都要包含 `pattern_id` + `pattern_signature`
- **上下文感知：** 使用项目的 `principles.md` 定义可接受的内容
- **工作量要切合实际：** S = <1h，M = 1-4h，L = >4h
- **排除项：** 跳过生成的代码、供应商代码和迁移（参见 `detection_patterns.md#exclusions`）
- **独特审计视角：** 仅审计重复、过度抽象和未使用的扩展性。不要审计交付门禁、安全性、包健康状况、局部复杂度指标、架构边界或运行时生命周期。
- **必须指定操作：** 每项发现使用 `MERGE_DUPLICATION`、`REMOVE_ABSTRACTION` 或 `REMOVE_YAGNI`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（包括 domain_mode、current_domain、output_dir）
- [ ] 已确定 scan_path（领域路径或代码库根目录）
- [ ] 已从 `references/detection_patterns.md` 加载检测模式
- [ ] 已完成全部 3 项检查（范围限定为 scan_path）：
  - DRY（10 个子类别：1.1-1.10）、KISS、YAGNI
- [ ] 已通过 `references/refactoring_decision_tree.md` 选择建议
- [ ] 已收集包含 severity、location、effort、action、pattern_id、pattern_signature、recommendation、domain 的发现
- [ ] 已按照 `references/audit_scoring.md` 计算得分
- [ ] 已将报告写入 `{output_dir}/ln-623--{domain}.md`，并包含 FINDINGS-EXTENDED 块（使用单次原子 Write 调用）
- [ ] 已按照契约写入摘要

## 参考文件

- **检测模式：** [references/detection_patterns.md](references/detection_patterns.md)
- **重构决策树：** [references/refactoring_decision_tree.md](references/refactoring_decision_tree.md)

---
**版本：** 5.0.0
**最后更新：** 2026-02-08