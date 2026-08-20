---
name: ln-632-test-e2e-priority-auditor
description: "Audits E2E coverage for critical user-visible journeys and wasteful E2E tests. Use when reviewing E2E journey value."
allowed-tools: Read, Grep, Glob, Bash
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# E2E 用户旅程审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计 E2E 测试是否能够证明关键的用户可见旅程。

## 目的与范围

- 审计 **E2E 用户旅程覆盖率**（类别 2：高优先级）
- 验证关键路径（资金/安全/数据优先级 >=20）的 E2E 覆盖情况
- 验证核心用户旅程（优先级 15-19）的 E2E 覆盖情况
- 识别浪费资源的 E2E 测试（有效性评分 <15）
- 输出 `ADD_MISSING_E2E`、`DELETE_LOW_VALUE_E2E` 或 `DOWNGRADE_E2E`
- 计算合规评分（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`、`codebase_root`、`output_dir`。

## 工作流程

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 contextStore 中提取技术栈、关键路径、用户旅程、测试文件列表和 output_dir
2) **识别关键路径（第 1 层）：** 扫描代码库以查找关键路径（资金、安全、数据）
2b) **上下文分析（第 2 层——强制）：** 对每个候选关键路径，询问：
   - 这是从已进行 E2E 测试的路径调用的辅助函数吗？-> **降级为 MEDIUM**
   - 这是否已被包含真实断言的集成测试覆盖？-> **降级为 LOW**
   - 关键词匹配是否为误报（例如，`calculateDiscount()` 是纯数学计算，并且已有单元测试）？-> **跳过**
3) **识别核心旅程：** 识别核心用户旅程（多步骤流程）
4) **检查关键路径覆盖情况：** 检查关键路径（优先级 >=20）的 E2E 覆盖情况
5) **检查旅程覆盖情况：** 检查用户旅程（优先级 15-19）的 E2E 覆盖情况
6) **验证 E2E 测试：** 验证现有 E2E 测试（有效性评分 >=15）
7) **收集发现项：** 记录每项违规及其严重程度、位置（文件:行号）、工作量估算（S/M/L）和建议
8) **计算评分：** 按严重程度统计违规数量，并计算合规评分（X/10）
9) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-632--global.md`
10) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 审计规则

### 1. 关键路径 E2E 覆盖

**规则：** 每条关键路径都必须有 E2E 测试

**关键路径（优先级 >=20）：**
- **资金**（优先级 25）：付款处理、退款、折扣、税费计算
- **安全**（优先级 25）：登录、身份验证、密码重置、令牌刷新、权限
- **数据导出**（优先级 20）：报告、CSV 生成、数据迁移

**检测：**
1. 扫描代码库以查找关键关键词：`payment`、`refund`、`login`、`auth`、`export`
2. 提取关键函数/端点
3. 检查每条关键路径是否存在 E2E 测试
4. 优先级 >=20 的路径缺少 E2E 测试 -> CRITICAL 严重程度

**严重程度：**
- **CRITICAL：** 优先级 25（资金、安全）没有 E2E 测试
- **HIGH：** 优先级 20（数据导出）没有 E2E 测试
- **降级条件：** 函数是辅助函数，且由已有 E2E 测试覆盖的路径调用 -> MEDIUM。已由集成测试覆盖 -> LOW

**建议：** 对缺少端到端覆盖的用户可见关键路径使用 `ADD_MISSING_E2E`

**工作量：** M

### 2. 核心用户旅程 E2E 覆盖

**规则：** 多步骤关键流程必须有 E2E 测试

**核心旅程（优先级 15-19）：**
- 注册 -> 电子邮件验证 -> 首次登录（优先级 16）
- 商品搜索 -> 加入购物车 -> 结账（优先级 18）
- 文件上传 -> 处理 -> 下载结果（优先级 15）

**检测：**
1. 识别路由/控制器中的多步骤流程
2. 检查是否存在端到端旅程测试
3. 优先级 >=15 且缺少 E2E -> HIGH 严重程度

**严重程度：**
- **HIGH：** 核心用户旅程（优先级 >=15）缺少 E2E
- **MEDIUM：** 旅程覆盖不完整（仅测试了部分步骤）

**建议：** 对缺失的关键用户旅程使用 `ADD_MISSING_E2E`

**工作量：** M-L

### 3. E2E 测试有效性验证

**规则：** 每个 E2E 测试都必须证明其优先级 >=15 是合理的

**检查：**
对于每个 E2E 测试，计算有效性分数 = 影响 × 概率
- 如果分数 <15 -> 标记为“可能浪费资源的 E2E”
- 建议：当较低层级的测试能够以更低成本验证相同行为时，使用 `DOWNGRADE_E2E`；当该旅程不存在产品风险时，使用 `DELETE_LOW_VALUE_E2E`

**示例：**
- 针对“API 返回 200 OK”的 E2E 测试 -> 影响 2，概率 1 -> 分数 2 -> **浪费资源**
- 针对“使用折扣付款时计算正确”的 E2E 测试 -> 影响 5，概率 5 -> 分数 25 -> **有价值**

**严重程度：**
- **MEDIUM：** 有效性分数 <15 的 E2E 测试
- **LOW：** 分数为 10-14 的 E2E 测试（需要审查）

**建议：** 使用 `DOWNGRADE_E2E` 将其降级为集成测试/单元测试，或使用 `DELETE_LOW_VALUE_E2E`

**工作量：** S

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

**严重程度映射：**
- 优先级 25（资金、安全）缺少 E2E -> CRITICAL
- 优先级 20（数据导出）缺少 E2E -> HIGH
- 优先级 15-19（核心旅程）缺少 E2E -> HIGH
- 浪费资源的 E2E（分数 <15）-> MEDIUM
- 旅程覆盖不完整 -> LOW

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程按照共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-632--global.md`，其中 `category: "E2E Journey Coverage"`，检查项为：critical_path_coverage、user_journey_coverage、e2e_usefulness_validation。发现项必须包含 `action`，其值为 `ADD_MISSING_E2E`、`DELETE_LOW_VALUE_E2E` 或 `DOWNGRADE_E2E`。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-632--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告问题
- **独特视角：** 仅评估端到端用户可见旅程的价值。不要检查单元测试的产品行为、判定标准的有效性、结构或手动脚本。
- **仅基于风险：** 按业务影响（资金 > 安全 > 数据）确定优先级，而不是按代码覆盖率百分比
- **工作量务实评估：** S = <1h，M = 1-4h，L = >4h
- **有效性评分阈值：** 仅将评分 <15 的 E2E 测试标记为低价值
- **不强制测试金字塔：** 不要建议 E2E/集成/单元测试比例——重点关注关键路径覆盖情况

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已识别关键路径（资金、安全、数据）并给出优先级评分
- [ ] 已完成全部 3 项检查（关键路径覆盖、用户旅程覆盖、E2E 有效性验证）
- [ ] 已收集发现的问题，包括严重程度、位置、工作量、建议和操作
- [ ] 已使用扣分算法计算评分
- [ ] 报告已写入 `{output_dir}/ln-632--global.md`（通过单次原子 Write 调用）
- [ ] 已按契约写入摘要

## 参考文件

- **审计输出架构：** `references/audit_output_schema.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23