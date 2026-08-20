---
name: ln-624-code-maintainability-hotspot-auditor
description: "Checks local maintainability hotspots: complexity, long methods, god modules, signatures, algorithms, and constants. Also flags identifier drift across API/DTO/DB layers. Use when auditing code hotspots."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__audit_workspace, mcp__hex-graph__analyze_architecture, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 代码可维护性热点审计器（L3 工作器）

**类型：** L3 工作器

专门审计难以阅读、修改或推理的局部代码热点的工作器。

## 目的与范围

- 审计**代码可维护性热点**（优先级：中）
- 检查复杂度指标、方法签名质量、局部算法效率、常量管理、跨层标识符一致性
- 输出 `REFACTOR_HOTSPOT`、`SIMPLIFY_SIGNATURE`、`EXTRACT_CONSTANT` 或 `UNIFY_IDENTIFIER`
- 返回包含严重程度、位置、工作量和建议的结构化发现
- 计算代码质量类别的合规评分（X/10）

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含以下字段的 `contextStore`：`tech_stack`、`best_practices`、`principles`、`codebase_root`、`output_dir`。

**领域感知：** 支持 `domain_mode` + `current_domain`（参见 `audit_output_schema.md#domain-aware-worker-output`）。

## 工作流

检测策略：使用两层检测（候选扫描，然后进行上下文验证）；仅当验证方法不明确时，才加载 `references/two_layer_detection.md`。

1) **解析上下文**——提取字段，确定 `scan_path`（如已指定，则采用领域感知方式），提取 `output_dir`
2) **扫描代码库中的违规项（第 1 层）**
   - 所有 Grep/Glob 模式均使用 `scan_path`（而非 codebase_root）
   - **图加速（如可用）：** 如果 `contextStore.graph_indexed` 为真或 `.hex-skills/codegraph/index.db` 存在：
     - **复杂度 + 上帝类：** `audit_workspace(path=scan_path, verbosity="minimal", limit=5)`——使用返回的热点预先识别复杂函数和上帝类。仅在有意进行深入分析时提高 `limit`。
     - **模块指标：** `analyze_architecture(path=scan_path, verbosity="full")`——使用返回的耦合指标分析级联深度和耦合情况。
     - 如果图不可用，则回退到下方的 grep 模式。
     - **先查看大纲再读取：** 在读取大型源文件之前使用 `outline(file_path)`——了解函数/类结构，以便进行复杂度分析。
   - 示例：使用 `Grep(pattern="if.*if.*if", path=scan_path)` 检测嵌套
3) **分析每个候选项的上下文（第 2 层——强制）**
   只有第 1 层发现而没有第 2 层分析 = 不是有效发现。报告前，先问：“此违规是有意为之，还是设计上合理？”
   - 圈复杂度：复杂度是来自针对枚举的 switch/case（合理），还是来自深层嵌套条件（不合理）？枚举分派 -> 降级为 LOW 或跳过
   - O(n^2)：阅读上下文——n 是多少？如果有界（n < 100），则降低严重程度
   - 上帝类：它是否为配置/模式/构建器类？-> 降级
   - 标识符漂移：重命名是否通过显式序列化器别名（`@JsonProperty`、`alias_generator`、`@SerializedName`）或 ORM 列映射（`@Column(name=...)`）进行协调？如果是 -> 降级或跳过
4) **收集包含严重程度、位置、工作量和建议的发现**
   - 为每项发现添加 `domain: domain_name` 标签（如果启用了领域感知）
5) **使用惩罚算法计算评分**
6) **编写报告：** 按照 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-624--{domain}.md`（全局模式下则写入 `624-quality.md`）
7) **返回摘要：** 返回最简摘要（参见输出格式）

## 审计规则（优先级：中）

### 1. 圈复杂度
**内容：** 单个函数中的决策点过多（> 10）

**检测：**
- 统计 if/else、switch/case、三元运算符、&&、||、for、while
- 使用工具：`eslint-plugin-complexity`、`radon`（Python）、`gocyclo`（Go）

**严重程度：**
- **高：** 复杂度 > 20（极难测试）
- **中：** 复杂度为 11-20（建议重构）
- **低：** 复杂度为 8-10（可接受，但需监控）
- **降级条件：** 枚举/switch 分派、状态机、解析器语法 -> 降级为低或跳过

**建议：** 拆分函数、提取辅助方法、使用提前返回

**工作量：** 中-大（取决于复杂度）

### 2. 深层嵌套（> 4 层）
**内容：** 嵌套的 if/for/while 块层级过深

**检测：**
- 统计缩进层级
- 模式：if { if { if { if { if { ... } } } } }

**严重程度：**
- **高：** > 6 层（难以阅读）
- **中：** 5-6 层
- **低：** 4 层
- **降级条件：** 嵌套由提前返回的守卫子句造成（结构较深，但逻辑呈线性）-> 降级

**建议：** 提取函数、使用守卫子句、反转条件

**工作量：** 中（重构结构）

### 3. 过长的方法（> 50 行）
**内容：** 函数过长，承担了过多职责

**检测：**
- 统计从函数开始到结束之间的行数
- 排除注释和空行

**严重程度：**
- **高：** > 100 行
- **中：** 51-100 行
- **低：** 40-50 行（临界）
- **降级条件：** 采用顺序委派的编排函数；数据转换管道 -> 降级

**建议：** 拆分为更小的函数，应用单一职责原则

**工作量：** 中（提取逻辑）

### 4. 上帝类/模块（> 500 行）
**内容：** 文件承担了过多职责

**检测：**
- 统计文件中的行数（排除注释）
- 检查公共方法/函数的数量

**严重程度：**
- **高：** > 1000 行
- **中：** 501-1000 行
- **低：** 400-500 行
- **降级条件：** 配置/模式/迁移文件、生成的代码、桶式/index 文件 -> 跳过

**建议：** 拆分为多个文件，应用关注点分离原则

**工作量：** 大（重大重构）

### 5. 参数过多（> 5）
**内容：** 函数参数过多

**检测：**
- 统计函数参数
- 检查构造函数和方法

**严重程度：**
- **中：** 6-8 个参数
- **低：** 5 个参数（临界）
- **降级条件：** Builder/options 模式构造函数；框架要求的签名（中间件、钩子）-> 跳过

**建议：** 使用参数对象、Builder 模式、默认参数

**工作量：** 小-中（重构签名及调用）

### 6. O(n^2) 或更差的算法
**内容：** 对集合执行低效的嵌套循环

**检测：**
- 嵌套 for 循环：`for (i) { for (j) { ... } }`
- 嵌套数组方法：`arr.map(x => arr.filter(...))`

**严重程度：**
- **高：** 热点路径（API 请求处理程序）中的 O(n^2)
- **中：** 偶发操作中的 O(n^2)
- **低：** 小型数据集（n < 100）上的 O(n^2)
- **降级条件：** n 有界（领域保证 n < 100）；一次性初始化/迁移代码 -> 降级为低或跳过

**建议：** 使用哈希映射，采用单次遍历进行优化，并使用更合适的数据结构

**工作量：** M（算法重新设计）

### 7. 常量管理
**问题：** 魔法数字/字符串、常量分散、重复定义

**检测：**

| 问题 | 模式 | 示例 |
|-------|---------|---------|
| 魔法数字 | 在条件判断/计算中硬编码数字 | `if (status === 2)` |
| 魔法字符串 | 在比较中硬编码字符串 | `if (role === 'admin')` |
| 分散定义 | 常量散布在多个文件中 | `MAX_SIZE = 100` 出现在 5 个文件中 |
| 重复定义 | 相同值出现多次 | `STATUS_ACTIVE = 1` 出现在 3 处 |
| 无集中管理文件 | 缺少 `constants.ts` 或 `config.py` | 没有单一事实来源 |

**严重程度：**
- **高：** 业务逻辑中的魔法数字（支付金额、状态）
- **中：** 重复常量（相同值定义 3 次或更多）
- **中：** 没有集中管理常量的文件
- **低：** 日志记录/调试中的魔法字符串
- **以下情况降低严重程度：** HTTP 状态码（200、404、500）-> 忽略。算法中的数学常量（0、1、-1）-> 忽略。测试数据 -> 忽略

**建议：**
- 创建集中管理常量的文件（`constants.ts`、`config.py`、`constants.go`）
- 将魔法数字提取为具名常量：`const STATUS_ACTIVE = 1`
- 合并重复定义，并从集中管理文件中导入
- 对相关常量使用枚举

**工作量：** M（提取常量、更新导入、合并重复定义）

### 8. 方法签名质量
**问题：** 方法契约设计不佳，降低了可读性和可维护性

**检测：**

| 问题 | 模式 | 示例 |
|-------|---------|---------|
| 布尔标志参数 | 签名中存在 >=2 个布尔参数 | `def process(data, is_async: bool, skip_validation: bool)` |
| 可选参数过多 | 存在 >=3 个带默认值的可选参数 | `def query(db, limit=10, offset=0, sort="id", order="asc")` |
| 动词命名不一致 | 同一模块中，相同类型的操作使用不同动词 | `get_user()` 与 `fetch_account()` 与 `load_profile()` |
| 返回类型不明确 | 使用 `-> dict`、`-> Any`、`-> tuple`，且未使用 TypedDict/NamedTuple | 使用 `def get_stats() -> dict`，而非 `-> StatsResponse` |

**严重程度：**
- **中：** 布尔标志参数（应使用枚举/策略）、返回类型不明确
- **低：** 可选参数过多、命名不一致

**建议：**
- 布尔标志：替换为枚举、策略模式或独立方法
- 可选参数：归组到配置/选项数据类中
- 命名：在每个模块中统一动词约定（同步操作使用 `get_`、异步操作使用 `fetch_` 等）
- 返回类型：使用 TypedDict、NamedTuple 或数据类，而不是原始字典/元组

**工作量：** S-M（重构签名及调用方）

### 9. 跨层标识符一致性
**问题：** 同一概念在 API 契约、DTO、服务、仓储、数据库列或内部模块中使用不同的标识符

**检测：**

| 问题 | 模式 | 示例 |
|-------|---------|---------|
| 外部契约偏移 | API/OpenAPI/外部模式中的字段名与 DTO/服务/仓储/数据库列不同 | OpenAPI 中使用 `user_id`，但 DTO 中使用 `uid`，服务中使用 `userId`，数据库列中使用 `user` |
| 同义词偏移（内部） | 同一实体在不同模块中使用相互竞争的名称 | 对同一概念使用 `customer`、`client`、`account` 和 `user` |
| 未经中介的大小写/命名法转换 | 在未显式声明序列化器别名的情况下切换 snake/camel/kebab 命名法 | 将 API 字段 `created_at` 赋值给 `creationTime`，但未声明别名 |
| 缩写偏移 | 同一概念同时存在全称和缩写形式 | `organization` 与 `org` 与 `orgId` 与 `organizationId` |

**严重程度：**
- **高：** 在代码内部重命名外部契约字段，且未设置显式的序列化器别名——上游契约变更时存在静默破坏的风险
- **中：** 同一实体在 3 个以上模块中出现同义词漂移（`customer` / `client` / `account`）
- **中：** 大小写形式转换，但未提供显式的别名映射
- **低：** 单个有界模块中存在两种变体的漂移；仅限内部代码中的缩写漂移
- **以下情况应降级：** 通过 ORM 完成映射并设置了显式列别名、框架要求的转换（例如通过代码生成实现 GraphQL camelCase）、根据契约生成的 DTO、因与语言关键字冲突而被迫重命名 -> 降级或跳过

**第 2 层要求：** 同义词漂移检测依赖精心维护的项目术语表，或需要阅读使用上下文。仅使用 Grep 并不足够——报告前必须确认两个标识符指代同一概念。

**建议：**
- **外部契约场景：** 在 DTO / service / repository / DB column 中始终原样沿用外部 API 名称。如果大小写形式或语言约定存在冲突，应在边界处一次性配置序列化器别名（`@JsonProperty`, `alias_generator`, `@SerializedName`），而不是在代码内部重命名字段
- **仅限内部的场景：** 选择语义最精确的变体，在所有模块中执行查找/替换，并将规范术语记录到共享术语表或共享 constants/enum 模块中。尽可能添加 lint 规则或代码生成步骤，以防止重新引入其他变体
- 关于单个模块内的动词命名，请参阅规则 #8（方法签名质量）

**工作量：** S-M（重命名 + 序列化器配置）。如果需要重命名 DB column 并执行迁移，则为 L

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程根据共享契约自行生成运行范围内的制品路径。

将报告写入 `{output_dir}/ln-624--{domain}.md`（全局模式下为 `624-quality.md`），使用 `category: "Code Maintainability Hotspots"`，并包含以下检查项：cyclomatic_complexity、deep_nesting、long_methods、god_classes、too_many_params、quadratic_algorithms、magic_numbers、method_signatures、identifier_consistency。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显同一摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-624--orders.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告
- **领域感知扫描：** 如果 `domain_mode="domain-aware"`，则仅扫描 `scan_path`（而不是整个代码库）
- **标记发现项：** 在领域感知模式下，每个发现项都必须包含 `domain` 字段
- **指标工具：** 如果已有工具可用，请使用现有工具（ESLint complexity plugin、radon、gocyclo）
- **独特视角：** 仅审计局部可维护性热点。不要审计重复代码、包健康状况、架构边界、N+1 持久化行为或编排所有权。标识符一致性发现项关注一个概念跨层的命名连续性；这不同于 ln-623（代码重复）和 ln-643（DTO 是否存在 / 签名中的层泄漏）。
- **所需操作：** 每个发现项使用 `REFACTOR_HOTSPOT`、`SIMPLIFY_SIGNATURE`、`EXTRACT_CONSTANT` 或 `UNIFY_IDENTIFIER`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（包括 domain_mode、current_domain、output_dir）
- [ ] 已确定 scan_path（领域路径或代码库根目录）
- [ ] 已完成全部 9 项检查（范围限定为 scan_path）：
  - 复杂度、嵌套、长度、上帝类、参数、O(n^2)、常量、方法签名、标识符一致性
- [ ] 已收集发现项，包括严重程度、位置、工作量、建议、领域
- [ ] 已计算得分
- [ ] 报告已写入 `{output_dir}/ln-624--{domain}.md`（通过单次原子 Write 调用）
- [ ] 已按照契约编写摘要

## 参考文件

- **审计输出模式：** `references/audit_output_schema.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23