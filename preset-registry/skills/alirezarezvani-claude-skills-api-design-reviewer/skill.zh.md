---
name: "api-design-reviewer"
description: "Comprehensive REST API design review with automated linting, breaking-change detection, and design scorecards. Catches inconsistent conventions, missing versioning, and design smells before APIs ship. Use when reviewing a PR that adds or changes API endpoints, auditing an existing API for v2 migration, or establishing API standards for a team."
---
# API 设计审查器

**级别：** 强大  
**类别：** 工程 / 架构  
**维护者：** Claude Skills 团队  

## 概述

API 设计审查器技能可对 API 设计进行全面分析和审查，重点关注 REST 约定、最佳实践和行业标准。此技能通过自动化检查、破坏性变更检测和设计评分卡，帮助工程团队构建一致、可维护且设计良好的 API。

## 快速开始——先运行工具

```bash
# 1. Lint an OpenAPI/Swagger spec for convention violations
python3 scripts/api_linter.py openapi.json --format json -o lint.json

# 2. Detect breaking changes between two spec versions (gate: exits non-zero with --exit-on-breaking)
python3 scripts/breaking_change_detector.py openapi-v1.json openapi-v2.json --format json --exit-on-breaking -o breaking.json

# 3. Score overall design quality (gate: --min-grade fails below threshold)
python3 scripts/api_scorecard.py openapi.json --format json --min-grade B -o scorecard.json
```

审查流程：运行全部三个工具，向用户报告检查器发现的问题、破坏性变更和评级，进行修复，然后重新运行，直至检查器不再报告问题、`--exit-on-breaking` 检查通过（或已针对破坏性变更提升版本号），并且评分卡达到约定的 `--min-grade`。绝不能仅依据文字说明就批准 API 审查——必须附上工具输出。

## 核心能力

### 1. API 检查与约定分析
- **资源命名约定**：强制资源使用 kebab-case，字段使用 camelCase
- **HTTP 方法使用**：验证是否正确使用 GET、POST、PUT、PATCH、DELETE
- **URL 结构**：分析端点模式的一致性以及是否符合 RESTful 设计
- **状态码合规性**：确保使用适当的 HTTP 状态码
- **错误响应格式**：验证错误响应结构是否一致
- **文档覆盖率**：检查缺失的描述和文档空白

### 2. 破坏性变更检测
- **端点移除**：检测已移除或弃用的端点
- **响应结构变更**：识别响应结构的修改
- **字段移除**：跟踪 API 响应中已移除或重命名的字段
- **类型变更**：捕获可能导致客户端中断的字段类型修改
- **新增必填字段**：标记可能破坏现有集成的新必填字段
- **状态码变更**：检测预期状态码的变化

### 3. API 设计评分与评估
- **一致性分析**（30%）：评估命名约定、响应模式和结构一致性
- **文档质量**（20%）：评估 API 文档的完整性和清晰度
- **安全实现**（20%）：审查身份验证、授权和安全标头
- **易用性设计**（15%）：分析易用性、可发现性和开发者体验
- **性能模式**（15%）：评估缓存、分页和效率模式

## REST 设计原则

### 资源命名约定
```
✅ Good Examples:
- /api/v1/users
- /api/v1/user-profiles
- /api/v1/orders/123/line-items

❌ Bad Examples:
- /api/v1/getUsers
- /api/v1/user_profiles
- /api/v1/orders/123/lineItems
```

### HTTP 方法用法
- **GET**：检索资源（安全、幂等）
- **POST**：创建新资源（非幂等）
- **PUT**：替换整个资源（幂等）
- **PATCH**：部分更新资源（不一定幂等）
- **DELETE**：删除资源（幂等）

### URL 结构最佳实践
```
Collection Resources: /api/v1/users
Individual Resources: /api/v1/users/123
Nested Resources: /api/v1/users/123/orders
Actions: /api/v1/users/123/activate (POST)
Filtering: /api/v1/users?status=active&role=admin
```

## 版本控制策略

### 1. URL 版本控制（推荐）
```
/api/v1/users
/api/v2/users
```
**优点**：清晰、明确、易于路由  
**缺点**：URL 数量激增、缓存复杂度增加

### 2. 请求头版本控制
```
GET /api/users
Accept: application/vnd.api+json;version=1
```
**优点**：URL 简洁、支持内容协商  
**缺点**：不够直观、难以手动测试

### 3. 媒体类型版本控制
```
GET /api/users
Accept: application/vnd.myapi.v1+json
```
**优点**：符合 REST 风格、支持多种表示形式  
**缺点**：复杂、较难实现

### 4. 查询参数版本控制
```
/api/users?version=1
```
**优点**：易于实现  
**缺点**：不符合 REST 风格、可能被忽略

## 分页模式

### 基于偏移量的分页
```json
{
  "data": [...],
  "pagination": {
    "offset": 20,
    "limit": 10,
    "total": 150,
    "hasMore": true
  }
}
```

### 基于游标的分页
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIzfQ==",
    "hasMore": true
  }
}
```

### 基于页码的分页
```json
{
  "data": [...],
  "pagination": {
    "page": 3,
    "pageSize": 10,
    "totalPages": 15,
    "totalItems": 150
  }
}
```

## 错误响应格式

### 标准错误结构
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid parameters",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email address is not valid"
      }
    ],
    "requestId": "req-123456",
    "timestamp": "2026-02-16T13:00:00Z"
  }
}
```

### HTTP 状态码用法
- **400 Bad Request**：请求语法或参数无效
- **401 Unauthorized**：需要身份验证
- **403 Forbidden**：访问被拒绝（已通过身份验证，但未获授权）
- **404 Not Found**：未找到资源
- **409 Conflict**：资源冲突（重复、版本不匹配）
- **422 Unprocessable Entity**：语法有效，但存在语义错误
- **429 Too Many Requests**：超过速率限制
- **500 Internal Server Error**：意外的服务器错误

## 身份验证和授权模式

### Bearer Token 身份验证
```
Authorization: Bearer <token>
```

### API Key 身份验证
```
X-API-Key: <api-key>
Authorization: Api-Key <api-key>
```

### OAuth 2.0 流程
```
Authorization: Bearer <oauth-access-token>
```

### 基于角色的访问控制（RBAC）
```json
{
  "user": {
    "id": "123",
    "roles": ["admin", "editor"],
    "permissions": ["read:users", "write:orders"]
  }
}
```

## 速率限制实现

### 响应头
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### 超出限制时的响应
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 3600
  }
}
```

## HATEOAS（超媒体作为应用状态引擎）

### 实现示例
```json
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "_links": {
    "self": { "href": "/api/v1/users/123" },
    "orders": { "href": "/api/v1/users/123/orders" },
    "profile": { "href": "/api/v1/users/123/profile" },
    "deactivate": { 
      "href": "/api/v1/users/123/deactivate",
      "method": "POST"
    }
  }
}
```

## 幂等性

### 幂等方法
- **GET**：始终安全且幂等
- **PUT**：应当是幂等的（替换整个资源）
- **DELETE**：应当是幂等的（结果相同）
- **PATCH**：可能是幂等的，也可能不是

### 幂等键
```
POST /api/v1/payments
Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000
```

## 向后兼容性指南

### 安全变更（非破坏性）
- 向请求添加可选字段
- 向响应添加字段
- 添加新端点
- 将必填字段改为可选字段
- 添加新的枚举值（并进行优雅处理）

### 破坏性变更（需要提升版本号）
- 从响应中移除字段
- 将可选字段改为必填字段
- 更改字段类型
- 移除端点
- 更改 URL 结构
- 修改错误响应格式

## OpenAPI/Swagger 验证

### 必需组件
- **API 信息**：标题、描述、版本
- **服务器信息**：基础 URL 和描述
- **路径定义**：包含方法的所有端点
- **参数定义**：查询参数、路径参数、请求头参数
- **请求/响应模式**：完整的数据模型
- **安全定义**：身份验证方案
- **错误响应**：标准错误格式

### 最佳实践
- 使用一致的命名约定
- 为所有组件提供详细描述
- 为复杂对象提供示例
- 定义可复用的组件和模式
- 根据 OpenAPI 规范进行验证

## 性能注意事项

### 缓存策略
```
Cache-Control: public, max-age=3600
ETag: "123456789"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

### 高效数据传输
- 使用适当的 HTTP 方法
- 实现字段选择（`?fields=id,name,email`）
- 支持压缩（gzip）
- 实现高效分页
- 使用 ETag 进行条件请求

### 资源优化
- 避免 N+1 查询
- 实现批量操作
- 对繁重操作使用异步处理
- 支持部分更新（PATCH）

## 安全最佳实践

### 输入验证
- 验证所有输入参数
- 清理用户数据
- 使用参数化查询
- 实现请求大小限制

### 身份验证安全
- 全面使用 HTTPS
- 实现安全的令牌存储
- 支持令牌过期和刷新
- 使用强身份验证机制

### 授权控制
- 实施最小权限原则
- 使用基于资源的权限
- 支持细粒度访问控制
- 审计访问模式

## 工具和脚本

### api_linter.py
分析 API 规范是否符合 REST 约定和最佳实践。

**功能：**
- OpenAPI/Swagger 规范验证
- 命名约定检查
- HTTP 方法使用验证
- 错误格式一致性检查
- 文档完整性分析

### breaking_change_detector.py
比较不同版本的 API 规范，以识别破坏性变更。

**功能：**
- 端点比较
- Schema 变更检测
- 字段删除/修改跟踪
- 迁移指南生成
- 影响严重程度评估

### api_scorecard.py
对 API 设计质量进行全面评分。

**功能：**
- 多维度评分
- 详细的改进建议
- 字母等级评定（A-F）
- 基准比较
- 进度跟踪

## 集成示例

### CI/CD 集成
```yaml
- name: "api-linting"
  run: python scripts/api_linter.py openapi.json

- name: "breaking-change-detection"
  run: python scripts/breaking_change_detector.py openapi-v1.json openapi-v2.json

- name: "api-scorecard"
  run: python scripts/api_scorecard.py openapi.json
```

### Pre-commit Hooks
```bash
#!/bin/bash
python engineering/skills/api-design-reviewer/scripts/api_linter.py api/openapi.json
if [ $? -ne 0 ]; then
  echo "API linting failed. Please fix the issues before committing."
  exit 1
fi
```

## 最佳实践总结

1. **一致性优先**：保持命名、响应格式和模式的一致性
2. **文档**：提供全面且最新的 API 文档
3. **版本控制**：通过清晰的版本控制策略为演进做好规划
4. **错误处理**：实施一致且信息明确的错误响应
5. **安全性**：将安全性融入 API 的每一层
6. **性能**：从一开始就面向规模扩展和效率进行设计
7. **向后兼容性**：尽量减少破坏性变更，并提供迁移路径
8. **测试**：实施全面的测试，包括契约测试
9. **监控**：为 API 使用情况和性能添加可观测性
10. **开发者体验**：优先考虑易用性和清晰的文档

## 应避免的常见反模式

1. **基于动词的 URL**：使用名词表示资源，而不是使用动作
2. **不一致的响应格式**：保持标准的响应结构
3. **过度嵌套**：避免层级过深的资源结构
4. **忽略 HTTP 状态码**：针对不同场景使用适当的状态码
5. **糟糕的错误消息**：提供可操作且具体的错误信息
6. **缺少分页**：始终对列表端点进行分页
7. **没有版本控制策略**：从第一天起就为 API 演进做好规划
8. **暴露内部结构**：面向外部使用者设计 API，而不是追求内部便利
9. **缺少速率限制**：保护 API 免受滥用和过载
10. **测试不充分**：测试所有方面，包括错误情况和边界条件

定期使用代码检查、破坏性变更检测和评分工具，可确保持续改进，并有助于在整个开发生命周期中保持 API 质量。