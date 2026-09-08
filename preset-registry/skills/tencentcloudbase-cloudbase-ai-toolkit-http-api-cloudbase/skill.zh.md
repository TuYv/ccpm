---
name: http-api-cloudbase
description: CloudBase official HTTP API client guide. This skill should be used when backends, scripts, or non-SDK clients must call CloudBase platform APIs over raw HTTP instead of using a platform SDK or MCP management tool.
version: 2.33.0
alwaysApply: false
---
## 同级技能（仅限本地）

CloudBase 同级技能与本技能一同发布。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少所引用的同级技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 抓取远程技能或协议 markdown 到 agent 上下文中。

## 激活契约

### 优先使用本技能的情况

- 请求来自 Android、iOS、Flutter、React Native、非 Node 后端，或必须通过原生 HTTP 调用 CloudBase 官方 API 的管理脚本。
- 任务是调用 CloudBase 平台端点，而不是在 CloudBase 上构建新的 HTTP 服务。

### 以下情况下，编写代码前请先阅读

- 平台不支持 CloudBase SDK，或用户明确要求进行 HTTP API 集成。
- 用户提到“HTTP API”，但不清楚指的是 CloudBase 官方端点还是其自身的业务 API。

### 然后还需阅读

- 认证配置 -> `../auth-tool-cloudbase/SKILL.md`
- MySQL MCP 管理 -> `../relational-database-mcp-cloudbase/SKILL.md`
- 你在 CloudBase 上的自有 HTTP 服务 -> `../cloud-functions/SKILL.md` 或 `../cloudrun-development/SKILL.md`

### 请勿用于

- CloudBase Web SDK 流程、小程序 SDK 流程，或由 MCP 驱动的管理任务。
- 在 CloudBase 上构建你自己的 HTTP 服务或 REST API。

### 常见错误 / 易错点

- 将 Web SDK 示例当作对原生 App 同样有效。
- 未阅读 OpenAPI 定义就猜测端点。
- 将 CloudBase 官方 HTTP API 与你自己的函数或 CloudRun 端点混淆。
- 将原生 HTTP API 集成与 MCP 管理逻辑混在一起。

### 最简检查清单

- 在实现之前阅读 [HTTP API 路由检查清单](checklist.md)。

## 何时使用本技能

当你需要通过**原生 HTTP API** 调用 **CloudBase 平台功能**时使用本技能，例如：

- 非 Node 后端（Go、Python、Java、PHP 等）
- 使用 curl 或各语言 HTTP 客户端的集成测试或管理脚本
- 通过关系型数据库 RESTful API（MySQL/PostgreSQL）直接进行数据库操作
- 通过 HTTP 调用云函数
- SDK 不可用或不适用的任何场景

以下情况请**不要**使用本技能：

- 使用 `@cloudbase/js-sdk` 的前端 Web 应用（请使用 **CloudBase Web** 技能）
- 使用 `@cloudbase/node-sdk` 的 Node.js 代码（请使用 **CloudBase Node** 技能）
- 认证流程（针对认证相关端点请使用 **CloudBase Auth HTTP API** 技能）

## 如何使用本技能（面向编码 agent）

1. **明确场景**
   - 确认这段代码将直接调用 HTTP 端点（而非通过 SDK）。
   - 询问以下信息：
     - `env` – CloudBase 环境 ID
     - 认证方式（AccessToken、API Key 或 Publishable Key）
   - 确认需要使用哪个 CloudBase 功能（数据库、函数、存储等）。
   - **对于用户认证**：如果未指定具体方式，**始终默认使用手机号短信验证**——这对中文用户而言是最友好且最安全的方式。

2. **确定基础 URL**
   - 根据地域（国内还是国际）使用正确的域名。
   - 默认为国内上海地域。

3. **设置认证**
   - 根据使用场景选择合适的认证方式。
   - 为请求添加 `Authorization: Bearer <token>` 请求头。

4. **参考 OpenAPI Swagger 文档**
   - **必须使用 `searchKnowledgeBase` 工具**获取 OpenAPI 规范
   - 使用该工具时设置 `mode=openapi` 并指定 `apiName`：
     - `mysqldb` - 关系型数据库 RESTful API（MySQL/PostgreSQL）
     - `nosql` - NoSQL RESTful API（文档型数据库）
     - `functions` - 云函数 API
     - `auth` - 认证 API
     - `cloudrun` - CloudRun API
     - `storage` - 存储 API
     - `ai_model` - AI 大模型接入 API
   - 示例：`searchKnowledgeBase({ mode: "openapi", apiName: "mysqldb" })`
   - 解析返回的 YAML 内容，以了解确切的端点路径、参数以及请求/响应 schema
   - 绝不凭空编造端点或参数——始终以 swagger 文档为准

---

## 概述

CloudBase HTTP API 是一组通过 HTTP 协议访问 CloudBase 平台功能的接口，支持数据库、用户认证、云函数、云托管、云存储、AI 等。

## OpenAPI Swagger 文档

**⚠️ 重要：务必始终使用 `searchKnowledgeBase` 工具获取 OpenAPI Swagger 规范**

在实现任何 HTTP API 调用之前，你应当：

1. **使用 `searchKnowledgeBase` 工具获取 OpenAPI 文档**：
   ```
   searchKnowledgeBase({ mode: "openapi", apiName: "<api-name>" })
   ```

2. **可用的 API 名称**：
   - `mysqldb` - 关系型数据库 RESTful API（MySQL/PostgreSQL）
   - `nosql` - NoSQL RESTful API（文档型数据库）
   - `functions` - 云函数 API
   - `auth` - 认证 API
   - `cloudrun` - CloudRun API
   - `storage` - 存储 API
   - `ai_model` - AI 大模型接入 API

3. **解析并使用 swagger 文档**：
   - 提取确切的端点路径和 HTTP 方法
   - 理解必填参数与可选参数
   - 查看请求/响应 schema
   - 检查认证要求
   - 确认错误响应格式

4. **绝不凭空编造 API 端点或参数**——实现必须始终以官方 swagger 文档为依据。

## 前置条件

在开始之前，请确保你已具备：

1. **已创建并启用的 CloudBase 环境**
2. **认证凭证**（AccessToken、API Key 或 Publishable Key）

## 认证与授权

CloudBase HTTP API 需要认证。请根据你的使用场景选择合适的方式：

### AccessToken 认证

**适用环境**：客户端/服务端
**用户权限**：已登录用户的权限

**获取方式**：使用 `searchKnowledgeBase({ mode: "openapi", apiName: "auth" })` 获取认证 API 规范

### API Key

**适用环境**：服务端
**用户权限**：管理员权限

- **有效期**：长期有效
- **获取方式**：从 [CloudBase 平台/ApiKey 管理页面](https://tcb.cloud.tencent.com/dev?#/identity/token-management) 获取

> ⚠️ 警告：令牌是身份认证的关键凭证，请妥善保管。API Key 绝不能用于客户端代码。

### Publishable Key

**适用环境**：客户端/服务端
**用户权限**：匿名用户权限

- **有效期**：长期有效
- **获取方式**：从 [CloudBase 平台/ApiKey 管理页面](https://tcb.cloud.tencent.com/dev?#/identity/token-management) 获取

> 💡 说明：可以暴露在浏览器中，用于请求公开可访问的资源，可有效降低 MAU。

## API 端点 URL

CloudBase HTTP API 使用统一的域名进行 API 调用，具体域名取决于环境所在的地域。

### 国内地域

对于位于**国内地域**（如上海，`ap-shanghai`）的环境，请使用：

```text
https://{your-env}.api.tcloudbasegateway.com
```

将 `{your-env}` 替换为实际的环境 ID。例如，若环境 ID 为 `cloud1-abc`：

```text
https://cloud1-abc.api.tcloudbasegateway.com
```

### 国际地域

对于位于**国际地域**（如新加坡，`ap-singapore`）的环境，请使用：

```text
https://{your-env}.api.intl.tcloudbasegateway.com
```

将 `{your-env}` 替换为实际的环境 ID。例如，若环境 ID 为 `cloud1-abc`：

```text
https://cloud1-abc.api.intl.tcloudbasegateway.com
```

## 在请求中使用认证

将令牌添加到请求头中：

```http
Authorization: Bearer <access_token/apikey/publishable_key>
```

:::warning 注意

实际调用时，请将包含尖括号（`< >`）在内的整个部分替换为你获取到的密钥。例如，若获取到的密钥为 `eymykey`，则应填写为：

```http
Authorization: Bearer eymykey
```

:::

## 扩展指南

如需了解详细的场景、示例和模式，请阅读 [extended-guide.md](references/extended-guide.md)。

## 参考索引

所有已打包的参考文件（技能 lint 可达性检查所需）：

- [extended-guide.md](references/extended-guide.md)
