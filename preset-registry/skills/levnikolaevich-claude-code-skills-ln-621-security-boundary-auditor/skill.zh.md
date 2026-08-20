---
name: ln-621-security-boundary-auditor
description: "Checks application security boundaries: secrets, injection, XSS, input validation, and sensitive env defaults. Use when auditing exploitable code paths."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__trace_dataflow, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 安全边界审计器（L3 工作器）

**类型：** L3 工作器

专门审计可被利用的应用程序安全边界的工作器。

## 目的与范围

- 审计代码库中的**安全边界漏洞**（类别 1：最高优先级）
- 扫描硬编码密钥、SQL 注入、XSS、缺失的输入验证和敏感环境变量默认值
- 发出 `HARDEN_SECURITY_BOUNDARY`、`REMOVE_SECRET` 或 `REMOVE_SENSITIVE_DEFAULT`
- 返回结构化发现，包括严重程度、位置、工作量、操作和建议
- 计算安全类别的合规性评分（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`best_practices`、`principles`、`codebase_root`、`output_dir`。

当数据流或跨文件引用分析能显著提高可信度时，优先使用 `hex-graph`。当 `hex-line` 可用时，优先使用它读取本地代码。如果 MCP 不可用、不受支持或未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明回退情况。

## 工作流程

检测策略：采用两层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 contextStore 中提取技术栈、最佳实践、代码库根目录和 output_dir
2) **扫描代码库（第 1 层）：** 使用 Glob/Grep 模式执行安全检查（参见下方的审计规则）
3) **分析上下文（第 2 层）：** 对于每个候选项，读取周边代码并进行分类：
   - 密钥：测试夹具 / 示例 / 模板 -> 误报。生产代码 -> 已确认
   - SQL 注入：附近存在 ORM 参数化 -> 误报。原始字符串与用户输入拼接 -> 已确认
   - XSS：框架自动转义（React JSX、Go 模板）-> 误报。不安全的上下文（`innerHTML`、`| safe`）-> 已确认
   - 敏感默认值：占位符/示例 -> 跳过。密钥/令牌/密钥值的真实回退值 -> 已确认
   - 验证：内部服务间端点 -> 降级。公共 API -> 已确认
4) **收集发现：** 记录已确认的违规项，包括严重程度、位置（文件:行号）、工作量估算（S/M/L）和建议
5) **计算评分：** 按严重程度统计违规项，并计算合规性评分（X/10）
6) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过单次 Write 调用写入 `{output_dir}/ln-621--global.md`
7) **返回摘要：** 返回最简摘要（参见输出格式）

## 审计规则（优先级：严重）

### 1. 硬编码密钥
**内容：** 源代码中的 API 密钥、密码、令牌和私钥

**检测：**
- 搜索模式：`API_KEY = "..."`、`password = "..."`、`token = "..."`、`SECRET = "..."`
- 文件扩展名：`.ts`、`.js`、`.py`、`.go`、`.java`、`.cs`
- 排除：`.env.example`、`README.md`、包含模拟数据的测试文件

**严重程度：**
- **严重：** 生产环境凭据（AWS 密钥、数据库密码、API 令牌）
- **高：** 开发/预发布环境凭据
- **中：** 非测试文件中的测试凭据

**建议：** 移至环境变量（.env），使用密钥管理服务（Vault、AWS Secrets Manager）

**工作量：** S（将硬编码值替换为 `process.env.VAR_NAME`）

### 2. SQL 注入模式
**问题：** SQL 查询使用字符串拼接，而非参数化查询

**检测：**
- 模式：`query = "SELECT * FROM users WHERE id=" + userId`、`db.execute(f"SELECT * FROM {table}")`、`` `SELECT * FROM ${table}` ``
- 语言：JavaScript、Python、PHP、Java

**严重程度：**
- **严重：** 用户输入未经清理便被直接拼接
- **高：** 生产代码中存在变量拼接
- **中：** 仅拼接内部变量

**建议：** 使用参数化查询（预处理语句）、ORM 查询构建器

**工作量：** M（重构查询以使用占位符）

### 3. XSS 漏洞
**问题：** 未经清理的用户输入被渲染到 HTML/模板中

**检测：**
- 模式：`innerHTML = userInput`、`dangerouslySetInnerHTML={{__html: data}}`、`echo $userInput;`
- 模板引擎：检查未转义的输出（`{{ var | safe }}`、`<%- var %>`）

**严重程度：**
- **严重：** 用户输入未经清理便被直接插入 DOM
- **高：** 用户输入仅经过部分清理（转义不充分）
- **中：** 内部数据一旦被入侵，可能导致 XSS

**建议：** 使用框架提供的转义机制（React 会自动转义，使用 `textContent`），并使用 DOMPurify 进行清理

**工作量：** S-M（将 `innerHTML` 替换为 `textContent`，或对内容进行清理）

### 4. 敏感环境变量默认值
**问题：** 密钥、令牌、键、凭据或特权配置值存在不安全的代码默认值

**检测：**
- 使用 Grep 搜索敏感名称的环境变量读取及其默认值：`SECRET`、`TOKEN`、`KEY`、`PASSWORD`、`PRIVATE`、`CREDENTIAL`
- 检查配置/设置类中是否存在硬编码的敏感回退值
- 排除 `.env.example`、测试、文档和明显的占位符（`changeme`、空字符串、`example`）

**严重程度：**
- **严重：** 生产环境凭据回退值，或默认的签名/加密密钥
- **高：** 已部署应用可访问的运行时配置中存在敏感默认值
- **中：** 仅限测试的文件之外存在开发/预发布环境的敏感默认值

**建议：** 移除敏感默认值，要求显式配置，并在启动时快速失败

**工作量：** S-M

### 5. 缺少输入验证
**问题：** 系统边界（API 端点、用户表单、文件上传）缺少验证

**检测：**
- API 路由未使用验证中间件
- 表单处理程序未对输入进行清理
- 文件上传未检查类型/大小
- 缺少 CORS 配置

**严重程度：**
- **CRITICAL：** 文件上传未经验证，可能导致身份验证绕过
- **HIGH：** 敏感端点（支付、身份验证、用户数据）缺少验证
- **MEDIUM：** 只读或内部端点缺少验证

**建议：** 添加验证中间件（Joi、Yup、express-validator），实施输入清理

**工作量：** M（添加验证模式和中间件）

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程按照共享契约生成自己的运行作用域产物路径。

将报告写入 `{output_dir}/ln-621--global.md`，其中 `category: "Security Boundary"`，检查项包括：hardcoded_secrets、sql_injection、xss_vulnerabilities、sensitive_env_defaults、missing_input_validation。

按照 `references/audit_summary_contract.md` 返回摘要。

独立模式仍需按照共享契约，将同一份 JSON 摘要写入由工作进程拥有的运行作用域产物路径。

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告违规问题
- **感知技术栈：** 使用 contextStore 应用特定于框架的模式（例如 React XSS 与 PHP XSS）
- **减少误报：** 排除测试文件、示例配置和文档
- **工作量应切合实际：** S = <1 小时，M = 1-4 小时，L = >4 小时
- **位置精确：** 始终包含 `file:line`，以便程序化导航
- **独特视角：** 仅审计可被利用的应用程序安全边界。不要审计软件包健康状况或环境同步。
- **必须指定操作：** 每个发现都使用 `HARDEN_SECURITY_BOUNDARY`、`REMOVE_SECRET` 或 `REMOVE_SENSITIVE_DEFAULT`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已完成全部 5 项安全检查（密钥、SQL 注入、XSS、敏感环境默认值、验证）
- [ ] 已收集包含严重程度、位置、工作量和建议的发现
- [ ] 已使用扣分算法计算分数
- [ ] 已将报告写入 `{output_dir}/ln-621--global.md`（以原子方式单次调用 Write）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出模式：** `references/audit_output_schema.md`
- 安全审计规则：[references/security_rules.md](references/security_rules.md)

---
**版本：** 3.0.0
**最后更新：** 2025-12-23