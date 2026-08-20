---
name: ln-631-test-business-logic-auditor
description: "Detects tests proving platform behavior instead of local product behavior. Use when auditing product-behavior focus."
allowed-tools: Read, Grep, Glob, Bash
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）相对于此技能目录。

# 产品行为审计器（L3 Worker）

**类型：** L3 Worker

专门审计测试是否证明产品行为，而非平台行为的工作器。

## 目的与范围

- 审计**产品行为聚焦度**（类别 1：高优先级）
- 检测验证语言、框架、库、生成内容或默认平台行为，而非本地产品逻辑的测试
- 输出 `DELETE_NON_PRODUCT_TEST` 或 `REWRITE_TO_PRODUCT_BEHAVIOR`
- 计算合规分数（X/10）

## 输入

**强制阅读：** 加载 `references/audit_worker_core_contract.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`testFilesMetadata`、`codebase_root`、`output_dir`。

## 工作流

检测策略：使用两层检测（候选扫描，然后进行上下文验证）；仅当验证方法存在歧义时加载 `references/two_layer_detection.md`。

1) **解析上下文：** 从 `contextStore` 中提取技术栈、框架检测模式、测试文件列表和 output_dir
2) **扫描代码库（第 1 层）：** 扫描测试文件以查找框架/库测试（参见下方的审计规则）
2b) **上下文分析（第 2 层——强制）：** 对于每个候选项，阅读测试代码并判断：
   - 此测试是否针对封装了框架原语的自定义代码（例如使用 useState 的自定义 hook）？-> **保留**（测试的是集成，而非框架）
   - 此测试是否只调用语言/框架/库 API，而不包含任何自定义产品逻辑？-> `DELETE_NON_PRODUCT_TEST`
   - 能否重写此测试，以断言本地规则、映射、策略或错误行为？-> `REWRITE_TO_PRODUCT_BEHAVIOR`
   - 这是否是导入库以进行 mock 设置的测试辅助程序/实用工具？-> **跳过**（并非针对框架行为的测试）
3) **收集发现：** 记录每项违规，包括严重程度、位置（file:line）、工作量估算（S/M/L）和建议
4) **计算分数：** 按严重程度统计违规数量，计算合规分数（X/10）
5) **编写报告：** 根据 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，并通过一次 Write 调用写入 `{output_dir}/ln-631--global.md`
6) **返回摘要：** 向协调器返回最简摘要（参见输出格式）

## 审计规则

### 1. 框架测试检测

**内容：** 验证框架行为（Express、Fastify、Koa）而非我们自身业务逻辑的测试

**检测模式：**
- `(express|fastify|koa).(use|get|post|put|delete|patch)`
- 测试名称："middleware is called"、"route handler works"、"Express app listens"

**严重程度：** **中**

**建议：** 当测试仅验证框架行为时，使用 `DELETE_NON_PRODUCT_TEST`。当聚焦的断言可以证明本地集成逻辑时，使用 `REWRITE_TO_PRODUCT_BEHAVIOR`。

**工作量：** S（删除测试文件或测试块）

### 2. ORM/数据库库测试

**内容：** 验证 Prisma/Mongoose/Sequelize/TypeORM 行为的测试

**检测模式：**
- `(prisma|mongoose|sequelize|typeorm).(find|findMany|create|update|delete|upsert)`
- 测试名称："Prisma findMany returns array"、"Mongoose save works"

**严重程度：** **中等**

**建议：** 当测试仅验证 ORM 行为时，使用 `DELETE_NON_PRODUCT_TEST`。对于仓储策略、查询组合、错误映射或事务规则，使用 `REWRITE_TO_PRODUCT_BEHAVIOR`。

**工作量：** S

### 3. 加密/哈希库测试

**内容：** 验证 bcrypt/argon2 哈希行为的测试

**检测模式：**
- `(bcrypt|argon2).(hash|compare|verify|hashSync)`
- 测试名称："bcrypt hashes password"、"argon2 compares correctly"

**严重程度：** **中等**

**建议：** 当测试仅验证库行为时，使用 `DELETE_NON_PRODUCT_TEST`。对于密码策略、凭据生命周期或封装层错误处理，使用 `REWRITE_TO_PRODUCT_BEHAVIOR`。

**工作量：** S

### 4. JWT/令牌库测试

**内容：** 验证 JWT 签名/验证的测试

**检测模式：**
- `(jwt|jsonwebtoken).(sign|verify|decode)`
- 测试名称："JWT signs token"、"JWT verifies signature"

**严重程度：** **中等**

**建议：** 当测试仅验证 JWT 库行为时，使用 `DELETE_NON_PRODUCT_TEST`。对于令牌声明、过期策略、角色或认证流程，使用 `REWRITE_TO_PRODUCT_BEHAVIOR`。

**工作量：** S

### 5. HTTP 客户端库测试

**内容：** 验证 axios/fetch/got 行为的测试

**检测模式：**
- `(axios|fetch|got|request).(get|post|put|delete|patch)`
- 测试名称："axios makes GET request"、"fetch returns data"

**严重程度：** **中等**

**建议：** 当测试仅验证 HTTP 客户端行为时，使用 `DELETE_NON_PRODUCT_TEST`。对于重试策略、超时策略、请求构造或错误映射，使用 `REWRITE_TO_PRODUCT_BEHAVIOR`。

**工作量：** S

### 6. React Hooks/框架测试

**内容：** 验证 React hooks 行为（useState、useEffect 等）的测试

**检测模式：**
- `(useState|useEffect|useContext|useReducer|useMemo|useCallback)`
- 测试名称："useState updates state"、"useEffect runs on mount"

**严重程度：** **低**（如果测试的是我们自己的自定义 hook 逻辑，则可以接受）

**建议：** 如果测试的是框架行为，则使用 `DELETE_NON_PRODUCT_TEST`。如果可以通过产品可见行为断言自定义 hook 或组件策略，则使用 `REWRITE_TO_PRODUCT_BEHAVIOR`。

**工作量：** S-M

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作进程根据共享契约生成其自己的、限定于本次运行的产物路径。

将报告写入 `{output_dir}/ln-631--global.md`，其中 `category: "Product Behavior Focus"`，检查项为：framework_tests、orm_tests、crypto_tests、jwt_tests、http_client_tests、react_hooks_tests。发现的问题必须包含 `action`，其值为 `DELETE_NON_PRODUCT_TEST` 或 `REWRITE_TO_PRODUCT_BEHAVIOR`。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 不存在时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显同一摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-631--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告问题
- **唯一视角：** 仅判断测试是否证明了本地产品行为。不要评估产品组合价值、E2E 覆盖率、隔离性、断言机制强度或结构。
- **框架特定模式：** 根据项目实际使用的技术栈匹配检测模式
- **工作量应切合实际：** S = <1h，M = 1-4h，L = >4h
- **考虑上下文：** 对库的自定义封装（例如使用 useState 的自定义 hook）属于我们自己的代码——不要标记
- **排除测试辅助工具：** 不要标记那些通过导入库来进行 mock 设置的共享测试工具

## 完成标准

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已成功解析 contextStore（包括 output_dir）
- [ ] 已完成全部 6 项检查（框架、ORM、加密、JWT、HTTP 客户端、React hooks）
- [ ] 已收集包含严重程度、位置、工作量、建议和操作的发现项
- [ ] 已使用扣分算法计算分数
- [ ] 已将报告写入 `{output_dir}/ln-631--global.md`（通过单次原子 Write 调用）
- [ ] 已按照契约写入摘要

## 参考文件

- **审计输出架构：** `references/audit_output_schema.md`

---
**版本：** 3.0.0
**最后更新：** 2025-12-23