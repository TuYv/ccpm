---
name: ln-633-test-value-auditor
description: "Scores each test by portfolio value and returns KEEP/DELETE/MERGE/REWRITE. Use when pruning test-suite cost."
allowed-tools: Read, Grep, Glob, Bash
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 组合价值审计器（L3 工作器）

**类型：** L3 工作器

专门负责计算每个测试的组合价值和维护成本的工作器。

## 目的与范围

- 审计**组合价值**（类别 3：关键优先级）
- 计算价值分数 = 影响程度 x 发生概率，然后根据独特性、回归历史和维护成本进行调整
- 作出规范的 `KEEP`、`DELETE`、`MERGE` 或 `REWRITE` 决策
- 计算合规分数（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`、`codebase_root`、`output_dir`。

## 工作流程

检测策略：使用双层检测（先扫描候选项，再进行上下文验证）；仅当验证方法存在歧义时，加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 contextStore 中提取技术栈、影响程度/发生概率矩阵、测试文件列表和 output_dir
2) **计算分数（第 1 层）：** 对每个测试：计算价值分数 = 影响程度 x 发生概率，然后标注重复覆盖、已知回归防护和维护成本
2b) **上下文分析（第 2 层——强制）：** 在最终确定 `DELETE` 或 `MERGE` 决策之前，询问：
   - 这是针对已知历史缺陷的回归防护吗？-> 无论分数如何都应 **KEEP**
   - 即使分数 <10，此测试是否覆盖关键业务规则（支付、身份验证）？-> 如果断言较弱，应 **REWRITE**，而不是 DELETE
   - 这是唯一覆盖关键流程中某个边界情况的测试吗？-> **KEEP**
   - 是否有其他测试以更清晰的断言或更低的成本证明了相同行为？-> **MERGE**
3) **决策分类：** KEEP、DELETE、MERGE 或 REWRITE
4) **收集发现：** 记录每项 REVIEW/REMOVE 决策，包括严重程度、位置（文件:行号）、工作量估算（S/M/L）和建议
5) **计算分数：** 按严重程度统计违规数量，计算合规分数（X/10）
6) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，通过单次 Write 调用写入 `{output_dir}/ln-633--global.md`
7) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 实用性分数计算

### 公式

```
Usefulness Score = Business Impact (1-5) x Failure Probability (1-5)
```

### 影响程度评分（1-5）

| 分数 | 影响程度 | 示例 |
|-------|--------|----------|
| **5** | **关键** | 资金损失、安全漏洞、数据损坏 |
| **4** | **高** | 核心流程中断（结账、登录、注册） |
| **3** | **中** | 功能部分失效、用户体验下降 |
| **2** | **低** | 轻微的用户体验问题、外观缺陷 |
| **1** | **微不足道** | 外观问题，对用户无影响 |

### 发生概率评分（1-5）

| 分数 | 发生概率 | 指标 |
|-------|-------------|------------|
| **5** | **非常高** | 复杂算法、新技术、依赖项众多 |
| **4** | **高** | 多个依赖项、并发、边界情况 |
| **3** | **中** | 标准 CRUD、框架默认行为、成熟模式 |
| **2** | **低** | 简单逻辑、成熟完善的库、简单操作 |
| **1** | **非常低** | 简单赋值、由框架生成、不可能出错 |

### 决策阈值

| 分数范围 | 决策 | 操作 |
|-------------|----------|--------|
| **>=15** | **保留** | 测试有价值，继续维护 |
| **10-14** | **重写** | 仅当断言能够证明独特的产品风险时才保留 |
| **<10** | **删除** | 删除测试，不值得付出维护成本。**例外：**针对已知缺陷的回归防护测试 -> 保留 |

## 评分示例

### 示例 1：支付处理测试

```
Test: "processPayment calculates discount correctly"
Impact: 5 (Critical -- money calculation)
Probability: 4 (High -- complex algorithm, multiple payment gateways)
Usefulness Score = 5 x 4 = 20
Decision: KEEP
```

### 示例 2：电子邮件验证测试

```
Test: "validateEmail returns true for valid email"
Impact: 2 (Low -- minor UX issue if broken)
Probability: 2 (Low -- simple regex, well-tested library)
Usefulness Score = 2 x 2 = 4
Decision: DELETE (likely already covered by E2E registration test)
```

### 示例 3：登录流程测试

```
Test: "login with valid credentials returns JWT"
Impact: 4 (High -- core flow)
Probability: 3 (Medium -- standard auth flow)
Usefulness Score = 4 x 3 = 12
Decision: REWRITE (if E2E covers the flow, merge/delete duplicate assertions; otherwise focus assertions on auth behavior)
```

## 审计规则

### 1. 计算每个测试的分数

**流程：**
- 阅读测试文件，提取测试名称/描述
- 分析被测代码（CUT）
- 确定影响程度（1-5）
- 确定发生概率（1-5）
- 计算有用性分数

### 2. 对决策进行分类

**保留：**
- 高价值测试（资金、安全、数据完整性）
- 核心流程（结账、登录）
- 复杂算法

**合并：**
- 证明相同行为的重复测试
- 应当合并为一个场景的零散断言
- 仅存在表面断言差异的重复设置

**重写：**
- 断言较弱的中等价值测试
- 需要更明确的产品风险判定依据的测试

**删除：**
- 低价值测试（表面性、琐碎）
- 与 E2E 测试重复的测试

### 3. 识别模式

**常见的低价值测试：**
- 测试简单的 getter/setter
- 测试常量值
- 测试类型注解
- 重复的设置/断言变体
- 维护成本超过其信心价值的测试

## 评分算法

**强制阅读：**加载 `references/audit_scoring.md`。

**按价值分数映射严重程度：**
- 分数 <5 -> 严重（测试浪费大量维护工作）
- 分数 5-9 -> 高（测试很可能没有价值）
- 分数 10-14 -> 中（需要审查）
- 分数 >=15 -> 无问题（保留）

## 输出格式

**强制阅读：**加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 为每项编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作程序按照共享契约生成其自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-633--global.md`，其中 `category: "Portfolio Value"`，检查项为：value_score、delete_candidates、merge_candidates、rewrite_candidates。发现项必须包含规范的 `action`，其值为 `KEEP`、`DELETE`、`MERGE` 或 `REWRITE`。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立的运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-633--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

**注意：** 决策为 `KEEP` 的测试将作为保留证据进行汇总，而不是作为发现。发现仅包含 `DELETE`、`MERGE` 和 `REWRITE` 决策。

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告
- **独特视角：** 负责最终的测试组合价值决策。不要重复进行平台行为检测、关键覆盖发现、隔离性、预期结果强度或结构检查。
- **工作量应切合实际：** S = <1小时，M = 1-4小时，L = >4小时
- **客观评分：** 根据代码分析而非假设评估影响和发生概率
- **不报告 KEEP 测试：** 发现中仅包含 `DELETE`、`MERGE` 和 `REWRITE` 决策
- **交叉参考 E2E：** `REVIEW` 决策取决于 E2E 是否已覆盖该场景

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已计算每个测试的价值评分（影响 × 发生概率，并结合独特性、回归和维护上下文）
- [ ] 已对决策进行分类：KEEP、DELETE、MERGE、REWRITE
- [ ] 已收集包含 severity、location、effort、recommendation 和 action 的发现
- [ ] 已使用扣分算法计算评分
- [ ] 报告已写入 `{output_dir}/ln-633--global.md`（以原子方式通过单次 Write 调用完成）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出架构：** `references/audit_output_schema.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23