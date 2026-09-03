---
name: auth-implementation-patterns
description: Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, scalable access control systems. Use when implementing auth systems, securing APIs, or debugging security issues.
---
# 认证与授权实现模式

运用行业标准模式和现代最佳实践，构建安全、可扩展的认证与授权系统。

## 何时使用本技能

- 需要实现用户认证系统时
- 需要保护 REST 或 GraphQL API 时
- 需要添加 OAuth2/社交登录时
- 需要实现基于角色的访问控制（RBAC）时
- 需要设计会话管理时
- 需要迁移认证系统时
- 需要调试认证相关问题时
- 需要实现 SSO 或多租户架构时

## 核心概念

### 1. 认证与授权

**认证（AuthN）**：你是谁？

- 验证身份（用户名/密码、OAuth、生物特征）
- 签发凭证（会话、令牌）
- 管理登录/登出

**授权（AuthZ）**：你能做什么？

- 权限检查
- 基于角色的访问控制（RBAC）
- 资源所有权校验
- 策略执行

### 2. 认证策略

**基于会话：**

- 服务器存储会话状态
- Session ID 保存在 cookie 中
- 传统、简单、有状态

**基于令牌（JWT）：**

- 无状态、自包含
- 可水平扩展
- 可存储声明（claims）

**OAuth2/OpenID Connect：**

- 委托认证
- 社交登录（Google、GitHub）
- 企业 SSO

## 详细模式与示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

1. **绝不存储明文密码**：始终使用 bcrypt/argon2 进行哈希
2. **使用 HTTPS**：对传输中的数据进行加密
3. **短生命周期的访问令牌**：最长不超过 15-30 分钟
4. **安全的 Cookie**：设置 httpOnly、secure、sameSite 标志
5. **校验所有输入**：邮箱格式、密码强度
6. **对认证端点进行限流**：防止暴力破解攻击
7. **实现 CSRF 防护**：适用于基于会话的认证
8. **定期轮换密钥**：JWT 密钥、会话密钥
9. **记录安全事件**：登录尝试、认证失败
10. **尽可能使用 MFA**：增加额外的安全层

## 常见陷阱

- **弱密码**：强制执行强密码策略
- **将 JWT 存储在 localStorage 中**：容易受到 XSS 攻击，应使用 httpOnly cookie
- **令牌不过期**：令牌应设置过期时间
- **仅在客户端进行认证校验**：务必在服务端进行校验
- **不安全的密码重置**：应使用带过期时间的安全令牌
- **没有限流**：容易受到暴力破解攻击
- **信任客户端数据**：务必在服务端进行校验
