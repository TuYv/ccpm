---
name: ln-634-test-coverage-auditor
description: "Identifies missing tests for unique critical local logic: money, auth, permissions, data integrity, algorithms, and domain rules. Use when auditing critical logic coverage gaps."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__audit_workspace, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
model: claude-haiku-4-5
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 关键逻辑覆盖审计器（L3 Worker）

**类型：** L3 Worker

专门识别独特关键本地逻辑中缺失测试的工作器。

## 目的与范围

- 审计**关键逻辑覆盖**（类别 4：高优先级）
- 仅识别未经测试的独特本地逻辑
- 按类别分类（资金、身份验证/权限、数据完整性、算法、领域规则）
- 针对缺失的高价值测试输出 `ADD_MISSING` 发现项
- 不要仅为了提高覆盖率百分比而建议测试
- 计算合规评分（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`、`codebase_root`、`output_dir`。

**领域感知：** 支持 `domain_mode` + `current_domain`（参见 `audit_output_schema.md#domain-aware-worker-output`）。

当热点分析能显著改善覆盖缺口发现时，优先使用 `hex-graph`。如果可用，读取本地代码和测试时优先使用 `hex-line`。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明使用了回退方案。

## 工作流

检测策略：使用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) **解析上下文** -- 提取字段，确定 `scan_path`（如有指定，则采用领域感知方式）
     否则：
       scan_path = codebase_root
       domain_name = null
     ```

2) **识别 scan_path 中的关键本地逻辑**（不是整个代码库）
   - 扫描 `scan_path` 中的生产代码，查找资金/身份验证/权限/数据/算法/领域规则关键词
   - 所有 Grep/Glob 模式均使用 `scan_path`（而不是 codebase_root）
   - 示例：`Grep(pattern="payment|refund|discount", path=scan_path)`

3) **检查每条关键路径的测试覆盖情况（第 1 层）**
   - 搜索所有测试文件中的覆盖情况（测试可能位于与生产代码不同的位置）
   - 按函数名、模块名或测试描述进行匹配
3b) **上下文分析（第 2 层——强制）：** 对每个缺口候选项，询问：
   - 此函数是否已被 E2E/集成测试覆盖？-> **降级为 LOW**
   - 此函数是否为少于 10 行且由已测试代码调用的辅助函数？-> **跳过**
   - 关键词匹配是否为误报（例如，`paymentIcon()` 是 UI，而不是支付逻辑）？-> **跳过**

4) **收集缺失的测试**
   - 为每个发现项添加 `domain: domain_name` 标签（如果采用领域感知模式）
   - 为每个确认的发现项设置 `action: "ADD_MISSING"`

5) **计算评分：** 按严重程度统计违规项，并计算合规评分（X/10）

6) **编写报告：** 按照 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，通过单次 Write 调用将其写入 `{output_dir}/ln-634--{identifier}.md`（如果采用领域感知模式，也写入 `{output_dir}/ln-634--{identifier}.md`）

7) **返回摘要：** 向协调器返回最精简摘要（参见输出格式）

## 关键本地逻辑分类

### 1. 资金流（优先级 20+）

**定义：** 任何处理金融交易的代码

**示例：**
- 支付处理（`/payment`、`processPayment()`）
- 折扣/促销（`calculateDiscount()`、`applyPromoCode()`）
- 税费计算（`calculateTax()`、`getTaxRate()`）
- 退款（`processRefund()`、`/refund`）
- 发票/计费（`generateInvoice()`、`createBill()`）
- 货币换算（`convertCurrency()`）

**最低优先级：** 20

**关键原因：** 资金损失、欺诈、法律合规

### 2. 身份验证与权限（优先级 20+）

**定义：** 本地身份验证、授权、权限和安全决策

**示例：**
- 登录/登出（`/login`、`authenticate()`）
- 令牌刷新（`/refresh-token`、`refreshAccessToken()`）
- 密码重置（`/forgot-password`、`resetPassword()`）
- 权限/RBAC（`checkPermission()`、`hasRole()`）
- 加密/哈希（自定义加密编排或策略，而非 bcrypt/argon2 等库行为）
- API 密钥验证（`validateApiKey()`）

**最低优先级：** 20

**关键原因：** 安全漏洞、数据泄露、未经授权的访问

### 3. 数据完整性（优先级 15+）

**定义：** CRUD 操作、事务、验证

**示例：**
- 关键 CRUD（`createUser()`、`deleteOrder()`、`updateProduct()`）
- 数据库事务（`withTransaction()`）
- 数据验证（自定义验证器，而非框架默认行为）
- 数据迁移（`runMigration()`）
- 唯一性约束（`checkDuplicateEmail()`）

**最低优先级：** 15

**关键原因：** 数据损坏、数据丢失、状态不一致

### 4. 算法与领域规则（优先级 15+）

**定义：** 编码项目特有行为的本地计算、分支规则、状态转换和算法

**示例：**
- 排名/评分算法
- 资格规则
- 领域状态转换
- 超出框架默认行为的自定义验证规则
- 导入/导出转换

**最低优先级：** 15

**关键原因：** 产品行为错误、错误决策、业务状态损坏

## 审计规则

### 1. 识别关键本地逻辑

**流程：**
- 扫描代码库中的资金相关关键词：`payment`、`refund`、`discount`、`tax`、`price`、`currency`
- 扫描身份验证/权限关键词：`auth`、`login`、`password`、`token`、`permission`、`role`、`policy`
- 扫描数据关键词：`transaction`、`validation`、`migration`、`constraint`
- 扫描算法/领域规则关键词：`score`、`rank`、`eligibility`、`state`、`workflow`、`rule`
- 排除框架默认行为、生成的行为和库原语；对于现有测试的产品与平台测试关注点，由 `ln-631` 负责

### 2. 检查测试覆盖

**对于每条关键路径：**
- 在测试文件中搜索匹配的测试名称/描述
- 如果未找到测试 -> 添加到缺失测试列表
- 如果找到了测试但覆盖不足（仅覆盖正向情况，没有边界情况）-> 添加到缺口列表

### 3. 对缺口分类

**按优先级划分严重程度：**
- **CRITICAL：** 优先级 20+（资金、安全）
- **HIGH：** 优先级 15-19（数据、核心流程）
- **MEDIUM：** 优先级 10-14（重要但非关键）
- **降级条件：** 函数已被 E2E 测试覆盖 -> LOW。少于 10 行且由已测试代码调用的辅助函数 -> 跳过

### 4. 提供理由

**对于每个缺失的测试：**
- 说明其关键原因（资金损失、安全漏洞等）
- 建议测试类型（E2E、集成、单元）
- 将操作设置为 `ADD_MISSING`
- 估算工作量（S/M/L）

## 评分算法

**强制阅读：** 加载 `references/audit_scoring.md`。

**按优先级映射严重程度：**
- 优先级 20+（资金、安全）缺失测试 -> CRITICAL
- 优先级 15-19（数据完整性、核心流程）缺失测试 -> HIGH
- 优先级 10-14（重要）缺失测试 -> MEDIUM
- 优先级 <10（锦上添花）-> LOW

## 输出格式

**强制阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约生成自己的运行范围制品路径。

将报告写入 `{output_dir}/ln-634--{identifier}.md`（全局）或 `{output_dir}/ln-634--{identifier}.md`（领域感知），其中 `category: "Critical Logic Coverage"`，检查项为：money_logic_coverage、auth_permission_coverage、data_integrity_coverage、algorithm_domain_rule_coverage。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
报告已写入：.hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-634--{identifier}.md
评分：X.X/10 | 问题：N（C:N H:N M:N L:N）
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **领域感知扫描：** 如果 `domain_mode="domain-aware"`，仅扫描 `scan_path` 中的生产代码（而不是整个代码库）
- **标记发现项：** 采用领域感知模式时，在每个发现项中包含 `domain` 字段
- **测试搜索范围：** 搜索所有测试文件中的覆盖情况（测试可能位于与生产代码不同的位置）
- **按名称匹配：** 使用函数名、模块名或测试描述将测试与生产代码进行匹配
- **不要自动修复：** 仅报告
- **独特视角：** 仅查找独特关键本地逻辑中缺失的测试。不要评估现有的低价值测试、E2E 用户旅程优先级、可信度、判定依据强度、人工证据或结构。
- **不做覆盖率百分比工作：** 不要仅为了提高行/分支覆盖率指标而建议测试。
- **操作要求：** 每个发现项都使用 `action: "ADD_MISSING"`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir、domain_mode、current_domain）
- [ ] 已确定 scan_path（领域路径或代码库根目录）
- [ ] 已识别 scan_path 中的关键本地逻辑（资金、身份验证/权限、数据完整性、算法、领域规则）
- [ ] 已检查每条关键本地逻辑路径的测试覆盖情况
- [ ] 已收集缺失的测试，并包含严重程度、优先级、理由、领域和 `ADD_MISSING` 操作
- [ ] 已使用惩罚算法计算评分
- [ ] 已将报告写入 `{output_dir}/ln-634--{identifier}.md` 或 `ln-634--{identifier}.md`（单次原子 Write 调用）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出架构：** `references/audit_output_schema.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23