---
name: ln-635-test-isolation-auditor
description: "Audits whether test results can be trusted: flakiness, isolation, real external dependencies, time/random/order dependency, and shared state. Use when auditing test trustworthiness."
allowed-tools: Read, Grep, Glob, Bash
license: MIT
model: claude-haiku-4-5
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 可信度审计员（L3 工作器）

**类型：** L3 工作器

专门用于审计自动化测试结果是否具有确定性、隔离性和可信度的工作器。

## 目的与范围

- 审计**测试可信度**（类别 5：中优先级）
- 检查确定性、隔离性和依赖项控制
- 检测不稳定测试、时间/随机性/顺序依赖、共享状态和真实外部依赖
- 输出 `REWRITE_FOR_DETERMINISM` 或 `DELETE_IF_LOW_VALUE`
- 计算合规评分（X/10）

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`、`codebase_root`、`output_dir`。

## 工作流

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 `contextStore` 中提取技术栈、可信度检查清单、测试文件列表和 `output_dir`
2) **检查隔离性（第 1 层）：** 检查 6 个类别（API、数据库、文件系统、时间、随机性、网络）的隔离性
2b) **上下文分析（第 2 层——必须执行）：** 对于每个隔离性违规问题，询问：
   - 这是**集成测试**吗？（有意使用真实依赖项）-> **不要标记**。仅标记**单元测试**中的隔离性问题
   - 是否通过测试配置设置了内存数据库（无法通过 grep 看到）？-> **跳过**
   - 这是为其他测试设置 mock 的测试辅助程序吗？-> **跳过**
3) **检查确定性：** 检查不稳定测试、依赖时间的断言、依赖顺序的测试以及共享可变状态
4) **评估可信度处理措施：** 默认使用 `REWRITE_FOR_DETERMINISM`；仅当根据明显的本地证据，测试既不可信又价值较低时，才使用 `DELETE_IF_LOW_VALUE`
5) **收集发现：** 记录每个违规问题的严重程度、位置（文件:行号）、工作量估算（S/M/L）、处理措施和建议
6) **计算评分：** 按严重程度统计违规问题，并计算合规评分（X/10）
7) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用将其写入 `{output_dir}/ln-635--global.md`
8) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 审计规则：测试隔离性

### 1. 外部 API

**良好：** 已进行 Mock（jest.mock、sinon、nock）
**不良：** 对外部 API 发起真实 HTTP 调用

**检测：**
- Grep 查找未使用 mock 的 `axios.get`、`fetch(`、`http.request`
- 检查测试是否发起实际网络调用

**严重程度：** **高**

**建议：** 确保外部 API 调用受到控制（mock、stub 或测试服务器）。工具选择取决于项目技术栈。**例外：** 集成测试本就应使用真实依赖项——不要标记

**工作量：** M

### 2. 数据库

**良好：** 内存数据库（sqlite :memory:）或已进行 Mock
**不良：** 真实数据库（PostgreSQL、MySQL）

**检测：**
- 检查数据库连接字符串（localhost:5432、真实数据库 URL）
- Grep 查找未使用 `:memory:` 的 `beforeAll(async () => { await db.connect() })`

**严重程度：** **中**

**建议：** 确保数据库状态在不同测试运行之间受到控制并彼此隔离。**例外：** 通过配置使用内存数据库的集成测试 -> 跳过

**工作量：** M-L

### 3. 文件系统

**良好：** 已模拟（mock-fs、vol）
**不良：** 真实文件读写

**检测：**
- 搜索未使用模拟的 `fs.readFile`、`fs.writeFile`
- 检查测试是否创建/删除真实文件

**严重程度：** **中**

**建议：** 确保文件系统操作彼此隔离（模拟、临时目录或清理）。工具选择取决于项目技术栈

**工作量：** S-M

### 4. 时间/日期

**良好：** 已模拟（jest.useFakeTimers、sinon.useFakeTimers）
**不良：** 未使用模拟的 `new Date()`、`Date.now()`

**检测：**
- 搜索测试文件中未配合 `useFakeTimers` 使用的 `new Date()`

**严重程度：** **中**

**建议：** 确保依赖时间的逻辑使用受控时钟（伪计时器、注入的时钟或时间提供程序）。工具选择取决于项目技术栈

**工作量：** S

### 5. 随机性

**良好：** 使用种子的随机数（Math.seedrandom、固定种子）
**不良：** 未设置种子的 `Math.random()`

**检测：**
- 搜索未设置种子的 `Math.random()`

**严重程度：** **低**

**建议：** 使用带种子的随机数以确保测试结果具有确定性

**工作量：** S

### 6. 网络

**良好：** 已模拟（Express 使用 supertest，不使用真实端口）
**不良：** 真实网络请求（`localhost:3000`、绑定到端口）

**检测：**
- 搜索测试中的 `app.listen(3000)`
- 检查是否存在真实 HTTP 请求

**严重程度：** **中**

**建议：** 使用 `supertest`（无需真实端口）

**工作量：** M

## 审计规则：确定性

### 1. 不稳定测试

**定义：** 随机通过/失败的测试

**检测：**
- 多次运行测试，检查结果是否不一致
- 搜索未被正确 await 的 `setTimeout`、`setInterval`
- 检查是否存在竞态条件（异步操作未被 await）

**严重程度：** **高**

**建议：** 修复竞态条件，正确使用 async/await

**工作量：** M-L

### 2. 依赖时间的断言

**定义：** 针对当前时间的断言（`expect(timestamp).toBeCloseTo(Date.now())`）

**检测：**
- 搜索断言中的 `Date.now()`、`new Date()`

**严重程度：** **中**

**建议：** 模拟时间

**工作量：** S

### 3. 依赖顺序的测试

**定义：** 以不同顺序运行时会失败的测试

**检测：**
- 以随机顺序运行测试，检查是否失败
- 搜索测试之间共享的可变状态

**严重程度：** **中**

**建议：** 隔离测试，在 beforeEach 中重置状态

**工作量：** M

### 4. 共享可变状态

**定义：** 在多个测试之间被修改的全局变量

**检测：**
- 搜索模块级别的 `let globalVar`
- 检查测试之间是否共享状态

**严重程度：** **中**

**建议：** 使用 `beforeEach` 重置状态

**工作量：** S-M

## 审计规则：可信度拖累因素

### 1. 具有共享设置的超大型测试（>100 行）

**定义：** 超过 100 行、测试过多场景的测试

**检测：**
- 统计每个测试的行数
- 如果超过 100 行 -> 巨型测试

**严重程度：** **中**

**建议：** 拆分为聚焦的测试（每个测试对应一个场景）

**工作量：** S-M

### 2. 慢吞吞测试（>5 秒）

**问题：** 测试运行耗时超过 5 秒

**检测方法：**
- 测量测试持续时间
- 如果 >5s -> 慢吞吞测试

**严重程度：** **中**

**建议：** 使用从项目技术栈中选择的测试替身或内存服务来控制外部依赖；仅在确认隔离后再并行执行

**工作量：** M

### 3. 连体婴测试（未控制依赖的单元测试）

**问题：** 测试标记为 "Unit"，但未模拟依赖

**检测方法：**
- 检查测试名称是否包含 "Unit"
- 验证所有依赖是否均已模拟
- 如果没有模拟 -> 实际上是集成测试

**严重程度：** **低**

**建议：** 模拟依赖，或者将其重命名为集成测试

**工作量：** S

### 4. 默认值盲区（使用默认配置的测试）

**问题：** 测试仅使用默认配置值。使用 `references/risk_based_testing_guide.md` 中的非默认配置规则；仅在需要示例时加载 `references/risk_based_testing_methodology.md`。

**检测方法：**
- 在测试设置中 grep 常见默认值：`:8080`、`:3000`、`30000`、`limit: 20`、`offset: 0`
- 检查测试配置值是否与框架/库的默认值一致
- 在源代码中查找与测试值匹配的 `|| DEFAULT` 模式

**严重程度：** **高**

**工作量：** S

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

**严重程度映射：**
- 不稳定测试、未受控制的外部 API、默认值盲区 -> 高
- 真实数据库、文件系统、时间/日期、网络、过大的共享设置、慢吞吞测试 -> 中
- 未设置种子的随机操作、依赖顺序、连体婴测试 -> 低

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程根据共享契约生成自己的运行范围工件路径。

将报告写入 `{output_dir}/ln-635--global.md`，其中 `category: "Test Trustworthiness"`，检查项为：api_isolation、db_isolation、fs_isolation、time_isolation、random_isolation、network_isolation、flaky_tests、order_dependency、shared_state、default_value_blindness。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-635--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

**注意：** 发现项会被扁平化为单个数组。使用 `principle` 字段前缀（Isolation / Determinism / Dependency Control）来标识问题类别。每个发现项都包含 `action: "REWRITE_FOR_DETERMINISM"` 或 `action: "DELETE_IF_LOW_VALUE"`。

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告问题
- **工作量须符合实际：** S = <1h，M = 1-4h，L = >4h
- **扁平化问题清单：** 将隔离性 + 确定性 + 依赖控制问题合并到单一问题数组中，使用 `principle` 前缀进行区分
- **结合上下文：** 对于集成测试，可以接受将 Supertest 与真实的 Express 应用结合使用
- **唯一审计角度：** 仅审计测试结果是否可信。不要评估产品行为、E2E 流程价值、作品集价值、覆盖缺失、判定依据强度、手动证据或结构。
- **必须采取的操作：** 每个问题均使用 `REWRITE_FOR_DETERMINISM`，除非证据表明该测试的价值也足够低，可使用 `DELETE_IF_LOW_VALUE`。

**Monitor（2.1.98+）：** 对于预计每次耗时 >30s 的重复测试运行，使用 `Monitor`。后备方案：`Bash(run_in_background=true)`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已完成全部 3 个审计组：
  - 隔离性（6 个类别：API、DB、FS、时间、随机性、网络）
  - 确定性（4 项检查：不稳定、时间依赖、顺序依赖、共享状态）
  - 依赖控制（过大的共享设置、慢速测试、耦合依赖、默认值盲区）
- [ ] 已收集问题，包括严重程度、位置、工作量、操作、建议
- [ ] 已使用扣分算法计算得分
- [ ] 报告已写入 `{output_dir}/ln-635--global.md`（通过单次原子 Write 调用）
- [ ] 已按照约定编写摘要

---
**版本：** 3.0.0
**最后更新：** 2025-12-23