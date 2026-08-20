---
name: ln-638-test-oracle-effectiveness-auditor
description: "Audits assertion strength and test oracles that prove real defects. Use when finding weak tests that execute code but prove little."
allowed-tools: Read, Grep, Glob, Bash
license: MIT
model: claude-haiku-4-5
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 测试预言机有效性审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计测试是否具有能够捕获真实产品缺陷的有效预言机。

## 目的与范围

- 审计**测试预言机有效性**（类别 9：中优先级）
- 识别执行了代码但几乎无法证明其正确性的测试
- 检查断言强度、语义预言机质量、过度模拟、薄弱的快照，以及可用时基于变异测试的证据
- 输出 `STRENGTHEN_ORACLE`、`DELETE_WEAK_ORACLE` 或 `ADD_MUTATION_EVIDENCE`
- 计算合规分数（X/10）

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`、`codebase_root`、`output_dir`。

## 工作流程

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 contextStore 中提取技术栈、测试文件列表、codebase_root 和 output_dir
2) **查找弱预言机候选项（第 1 层）：** 扫描自动化测试，查找无断言、模糊断言、仅使用快照的测试、过度模拟，以及报告存在时的变异测试存活项
3) **上下文分析（第 2 层——强制）：** 对每个候选项，询问：
   - 这是一个有意设计的冒烟测试，其唯一契约是“启动时不会崩溃”吗？ -> 降级或跳过，除非它掩盖了关键行为
   - 快照是否与语义断言配合使用？ -> 跳过仅使用快照的问题
   - 模拟是否验证了边界处的产品侧契约？ -> 跳过过度模拟的问题
   - 是否缺少变异测试证据？ -> 除非是预言机已经很弱的关键模块，否则不要要求进行变异测试
4) **收集发现项：** 记录每个已确认问题的严重程度、位置、工作量、操作和建议
5) **计算分数：** 按严重程度统计违规项，并计算合规分数（X/10）
6) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-638--global.md`
7) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 审计规则

### 1. 断言强度

**内容：** 没有断言、断言模糊，或对于多种错误实现仍会通过的测试

**检测：**
- 调用生产代码但不包含 `expect`、`assert`、`should` 或框架特定验证的测试
- 模糊断言，例如 `toBeTruthy`、`toBeDefined`、`not.toThrow`，或在领域值很重要时仅检查状态
- 不验证错误类型、消息或状态的异常测试

**第 2 层：**
- 跳过框架生成的冒烟测试，除非它们是关键路径的唯一测试覆盖
- 当产品契约明确仅要求存在性时，降低简单存在性检查的严重程度

**严重程度：** 关键逻辑为 **高**，其他情况为 **中**

**建议：** 断言产品特定的输出、状态转换、副作用、发出的事件或持久化数据，确保真实回归发生时测试会失败

**工作量：** S-M
**操作：** `STRENGTHEN_ORACLE`；如果测试不包含任何产品信号，则使用 `DELETE_WEAK_ORACLE`

### 2. 有意义的判定依据

**含义：** 测试的预期结果与产品行为无关

**检测：**
- 当存在更丰富的领域行为可供验证时，断言却仅检查对象是否存在、数组长度、HTTP 状态、渲染容器是否存在或 mock 调用次数
- 预期值照搬实现，而不是基于独立的业务规则或已知示例

**严重程度：** **中**

**建议：** 将结构性断言替换为基于需求、示例、fixture 或黄金数据推导出的行为级断言

**工作量：** S-M
**操作：** `STRENGTHEN_ORACLE`

### 3. 仅使用快照的判定依据

**含义：** 快照测试没有针对其所保护的产品行为进行语义断言

**检测：**
- 使用 `toMatchSnapshot`、图像快照、序列化 JSON 快照或黄金文件，但附近没有语义断言
- 无需理解所保护的行为，就能轻易批准快照更新

**第二层：**
- 如果快照就是产品契约，并且已记录相应的审查规范，则跳过
- 如果快照与验证关键字段或用户可见行为的语义断言配合使用，则跳过

**严重程度：** **中**

**建议：** 仅将快照保留为辅助证据；为关键行为添加语义断言，或者在仅使用快照的测试不提供任何独特信号时将其删除

**工作量：** S-M
**操作：** `STRENGTHEN_ORACLE` 或 `DELETE_WEAK_ORACLE`

### 4. 过度 Mock

**含义：** 测试对被测系统或内部协作者进行过度 mock，以至于没有执行真实行为

**检测：**
- 被 mock 的函数同时也是被测函数
- 大多数断言验证的是 mock，而不是产品可见的输出或状态
- 内部方法被 stub 为之后断言的确切值

**第二层：**
- 当边界 mock 用于隔离外部系统，并且测试仍然断言本地产品行为时，这种做法是有效的
- 不要重复 `ln-635` 中的隔离问题发现；此项检查关注的是证明强度，而不是依赖控制

**严重程度：** 当测试看似覆盖关键逻辑，但实际只验证了 mock 时为 **高**；其他情况下为 **中**

**建议：** 执行真实的本地行为，仅 mock 外部边界；断言产品契约，而不是实现调用

**工作量：** M
**操作：** `STRENGTHEN_ORACLE`

### 5. 变异式证据

**含义：** 使用变异测试报告或等效证据，检测那些在生产行为发生变化时不会失败的测试

**检测：**
- 如果存在变异测试报告，将存活的变异体映射到断言薄弱的测试或模块
- 如果不存在报告，则识别测试已表现出弱判定依据信号、可能适合进行变异检查的关键模块

**严重程度：** 仅缺少变异证据时为 **低**；当存活的变异体证实断言薄弱时为 **中**

**建议：** 仅为关键的局部逻辑添加变异式证据；不要要求整个测试套件都进行变异测试

**工作量：** M-L
**操作：** `ADD_MUTATION_EVIDENCE`

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

**严重程度映射：**
- 关键行为没有预言机、对关键逻辑过度模拟 -> HIGH
- 语义断言薄弱、仅使用快照的测试、存在变异存活项 -> MEDIUM
- 具有弱预言机信号的关键模块缺少变异证据 -> LOW

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-638--global.md`，其中 `category: "Oracle Effectiveness"`，并包含以下检查项：assertion_strength、meaningful_oracle、snapshot_oracle、over_mocking、mutation_style_evidence。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显同一摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-638--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告
- **独特视角：** 仅审计预言机/断言的有效性。不要评估产品与平台的侧重点、E2E 用户旅程价值、组合价值、缺失的覆盖范围、可信度、人工证据或结构。
- **不强制要求变异测试：** 除非已有相关证据，或关键模块的预言机薄弱，否则不要要求进行变异测试。
- **必须指定操作：** 每个发现都使用 `STRENGTHEN_ORACLE`、`DELETE_WEAK_ORACLE` 或 `ADD_MUTATION_EVIDENCE` 之一。
- **工作量应切合实际：** S = <1h，M = 1-4h，L = >4h

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已检查断言强度
- [ ] 已检查有意义的预言机质量
- [ ] 已检查仅使用快照的预言机候选项
- [ ] 已检查过度模拟对证明强度的影响
- [ ] 已在可用时使用变异式证据
- [ ] 已应用第 2 层上下文分析
- [ ] 已收集包含严重程度、位置、工作量、操作和建议的发现
- [ ] 已使用扣分算法计算分数
- [ ] 已将报告写入 `{output_dir}/ln-638--global.md`（单次原子 Write 调用）
- [ ] 已根据契约写入摘要

---
**版本：** 1.0.0
**最后更新：** 2026-05-09