---
name: openapi-spec-generation
description: Generate and maintain OpenAPI 3.1 specifications from code, design-first specs, and validation patterns. Use when creating API documentation, generating SDKs, or ensuring API contract compliance.
---
# OpenAPI 规范生成

为 RESTful API 创建、维护和校验 OpenAPI 3.1 规范的全面模式。

## 何时使用此技能

- 从零开始创建 API 文档
- 从现有代码生成 OpenAPI 规范
- 设计 API 契约（设计优先方法）
- 依据规范校验 API 实现
- 从规范生成客户端 SDK
- 搭建 API 文档门户

## 核心概念

### 1. OpenAPI 3.1 结构

```yaml
openapi: 3.1.0
info:
  title: API Title
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /resources:
    get: ...
components:
  schemas: ...
  securitySchemes: ...
```

### 2. 设计方法

| 方法 | 描述 | 最适合 |
| ---------------- | ---------------------------- | ------------------- |
| **设计优先** | 先编写规范，再编写代码 | 全新 API、契约 |
| **代码优先** | 从代码生成规范 | 现有 API |
| **混合** | 注解代码并生成规范 | 演进中的 API |

## 模板与详细实操示例

完整的模板库和详细的实操示例位于 `references/details.md`。当你需要具体模板时，请阅读该文件。

## 最佳实践

### 推荐做法

- **使用 $ref** - 复用 schema、参数、响应
- **添加示例** - 真实场景的取值能帮助 API 使用方
- **记录错误** - 涵盖所有可能的错误码
- **为 API 设置版本** - 在 URL 或 header 中
- **使用语义化版本控制** - 用于规范变更

### 避免做法

- **不要使用笼统的描述** - 要具体
- **不要忽略安全定义** - 定义所有安全方案
- **不要忘记 nullable** - 对 null 要明确说明
- **不要混用风格** - 全程保持命名一致
- **不要硬编码 URL** - 使用服务器变量
