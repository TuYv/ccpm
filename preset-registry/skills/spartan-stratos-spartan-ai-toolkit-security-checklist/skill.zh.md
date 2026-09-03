---
name: security-checklist
description: Security best practices for Micronaut/Kotlin backend including authentication, authorization, input validation, and OWASP prevention. Use when implementing auth, validating inputs, or reviewing security.
allowed_tools:
  - Read
  - Glob
  - Grep
---
# 安全检查清单

对 Micronaut/Kotlin 后端代码执行安全审计。

## 何时使用

- 为端点添加身份验证或授权
- 在新增或修改的端点上验证用户输入
- 合并前审查代码的安全问题
- 检查常见漏洞（SQL 注入、XSS、IDOR）
- 设置密钥管理

## 流程

> 代码示例、漏洞对照表以及 SAFE/DANGEROUS 模式请参见 audit-reference.md。

1. **检查身份验证** — 每个控制器都有 @Secured，当前用户从安全上下文中获取
2. **检查授权** — 在返回资源前验证用户是否有权访问该资源
3. **检查输入验证** — 控制器参数使用 @Valid，请求 DTO 使用 Jakarta 注解
4. **检查 SQL 注入防护** — 使用 Exposed ORM（自动参数化），绝不使用字符串拼接的原始 SQL
5. **检查常见漏洞** — SQL 注入、XSS、CSRF、身份验证绕过、IDOR、批量赋值、数据暴露、速率限制
6. **检查密钥管理** — 不硬编码密钥，使用环境变量，绝不记录令牌/密码/PII，绝不提交 .env
7. **检查响应净化** — 响应 DTO 控制对外暴露的内容，绝不返回原始实体

## 交互风格

- 始终检查所有类别，不跳过任何部分
- 优先标记最危险的问题
- 为每个修复提供代码示例，而不只是文字描述
- 既告诉你哪里有问题，也告诉你如何修复

## 规则

- 每个端点必须有 @Secured 注解
- 管理员端点使用 OAuthSecurityRule.ADMIN
- 用户只能访问自己的资源（或管理员可以访问所有资源）
- 使用 @Valid 和 Jakarta 注解验证输入
- 禁止使用字符串拼接的原始 SQL 查询
- 响应 DTO 中排除敏感字段
- 绝不记录令牌/密码
- 错误消息不泄露内部细节
- 身份验证端点启用速率限制

## 输出

生成一份按类别给出通过/未通过结果的检查清单报告：

- [ ] 所有端点都有 @Secured 注解
- [ ] 管理员端点使用 OAuthSecurityRule.ADMIN
- [ ] 用户只能访问自己的资源（或管理员可以访问所有资源）
- [ ] 使用 @Valid 和 Jakarta 注解验证输入
- [ ] 无字符串拼接的原始 SQL 查询
- [ ] 响应 DTO 中排除敏感字段
- [ ] 绝不记录令牌/密码
- [ ] 错误消息不泄露内部细节
- [ ] 身份验证端点启用速率限制
