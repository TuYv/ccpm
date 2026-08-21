---
name: moai-platform-auth
description: >
  Authentication and authorization specialist covering Auth0, Clerk,
  and Firebase Auth. Use when implementing authentication, MFA, SSO,
  passkeys, WebAuthn, social login, or security features.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm:*), Bash(npx:*), Bash(firebase:*), Bash(curl:*), WebFetch, WebSearch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "2.0.0"
  category: "platform"
  status: "active"
  updated: "2026-02-09"
  modularized: "false"
  platforms: "Auth0, Clerk, Firebase Auth"
  tags: "auth0, clerk, firebase, authentication, authorization, mfa, sso, passkeys, webauthn, social-login, security"
  context7-libraries: "/auth0/docs, /clerk/clerk-docs, /firebase/firebase-docs"
  related-skills: "moai-platform-supabase, moai-platform-vercel, moai-domain-backend, moai-expert-security"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 4500

# MoAI Extension: Triggers
triggers:
  keywords: ["auth0", "clerk", "firebase auth", "authentication", "authorization", "mfa", "sso", "passkeys", "webauthn", "social login", "user management", "attack protection", "auth ui", "passwordless", "oauth", "identity", "jwt", "token security"]
  agents: ["expert-backend", "expert-security", "expert-frontend"]
  phases: ["run"]
---
# 身份验证平台专家

提供全面的身份验证和授权指导，涵盖三大主流平台：Auth0（企业级安全）、Clerk（现代化用户体验）和 Firebase Auth（移动优先）。

## 平台快速选择

### Auth0 - 企业级安全

专注于安全合规和攻击防护的企业级身份平台。

最适合：需要满足严格合规要求（FAPI、GDPR、HIPAA）、具备高级攻击防护能力、采用发送者约束（DPoP/mTLS）保障令牌安全，以及支持多租户 B2B SaaS 的企业应用。

主要优势：高级攻击防护（机器人检测、已泄露密码检测、暴力破解防护）、自适应 MFA、合规认证（ISO 27001、SOC 2、FAPI）、令牌安全（DPoP、mTLS）、全面的安全监控。

成本模式：按月活跃用户数计费，企业级功能位于价格更高的套餐层级。

Context7 库：/auth0/docs

### Clerk - 现代化用户体验

现代化身份验证平台，提供美观的预构建 UI 组件并支持 WebAuthn。

最适合：重视开发者体验和用户体验的现代 Web 应用、Next.js 应用、需要以最少配置实现社交登录的应用，以及无密码身份验证。

主要优势：可直接嵌入且界面美观的 React 组件、支持 WebAuthn 和通行密钥、与 Next.js 无缝集成、组织管理、简单易用且开发者体验出色的 API。

成本模式：提供免费套餐，按月活跃用户数计费，额度较为宽裕。

Context7 库：/clerk/clerk-docs

### Firebase Auth - 移动优先集成

Google 生态系统中的身份验证服务，可与 Firebase 服务无缝集成。

最适合：移动应用（iOS、Android、Flutter）、Google 生态系统集成、无服务器 Cloud Functions、需要支持匿名身份验证并提供账户升级路径的应用，以及中小型 Web 应用。

主要优势：适用于 iOS/Android/Flutter 的原生移动 SDK、Google 登录集成、Firebase 服务集成（Firestore、Storage、Cloud Functions）、手机身份验证、额度宽裕的免费套餐。

成本模式：提供额度宽裕的免费套餐，更高用量采用按使用量付费模式。

Context7 库：/firebase/firebase-docs

## 快速决策指南

在以下情况下选择 Auth0：
- 企业级安全和合规要求至关重要
- 需要高级攻击防护和安全监控
- 要实现发送者约束令牌（DPoP、mTLS）
- 需要支持复杂的 B2B 多租户场景
- 需要满足 FAPI、GDPR、HIPAA 或 PCI DSS 合规要求

在以下情况下选择 Clerk：
- 构建现代化 Next.js 或 React 应用
- 优先考虑开发者体验和美观的 UI
- 需要快速实现无密码或 WebAuthn 身份验证
- 希望尽量减少应用中的身份验证代码
- 需要支持基于角色的访问控制的组织管理

在以下情况下选择 Firebase Auth：
- 构建移动优先应用
- 已在使用 Firebase 生态系统（Firestore、Storage、Functions）
- 需要 Google 登录或 Google 生态系统集成
- 希望使用具备账户升级路径的匿名身份验证
- 偏好采用 Cloud Functions 的无服务器架构

## 常见身份验证模式

### 通用模式

这些模式适用于所有三个平台，但具体实现因平台而异。

**会话管理：**

所有平台都支持会话持久化、刷新令牌和会话失效。Auth0 使用刷新令牌轮换，Clerk 使用可自动刷新的会话令牌，Firebase 使用带有自定义声明的 ID 令牌刷新机制。

**多因素身份验证：**

所有平台都支持多种 MFA 因素，包括 TOTP、SMS 和推送通知。Auth0 提供 WebAuthn 和自适应 MFA，Clerk 提供采用通行密钥的 WebAuthn，Firebase 提供电话验证和自定义 MFA。

**社交身份验证：**

所有平台都支持主流社交身份提供商（Google、Facebook、GitHub、Apple）。Auth0 要求为每个提供商配置连接，Clerk 提供预配置的社交登录按钮，Firebase 要求进行 OAuth 配置和 SDK 设置。

**基于角色的访问控制：**

所有平台都支持使用自定义声明或元数据进行授权。Auth0 通过 Actions 在 JWT 令牌中使用自定义声明，Clerk 使用组织角色和元数据，Firebase 通过 Admin SDK 使用自定义声明。

**令牌管理：**

所有平台都会签发用于 API 授权的 JWT 令牌。Auth0 提供带作用域的访问令牌和刷新令牌，Clerk 通过 getToken() 提供会话令牌，Firebase 提供带有自定义声明的 ID 令牌。

### 安全最佳实践

适用于所有平台：

**令牌存储：**
- 切勿将令牌存储在 Web 端的 localStorage 中（存在 XSS 漏洞）
- 尽可能使用 httpOnly cookie
- 对于 SPA，使用内存存储并启用刷新令牌轮换
- 移动应用使用安全存储（Keychain、Keystore）

**强制使用 HTTPS：**
- 在生产环境中始终使用 HTTPS
- 配置安全的重定向 URI
- 启用 HSTS 标头

**令牌验证：**
- 始终验证令牌签名
- 验证令牌受众（aud claim）
- 检查令牌过期时间（exp claim）
- 验证签发者（iss claim）

**密码策略：**
- 强制执行高强度密码要求
- 启用泄露密码检测
- 在多次尝试失败后实施账户锁定
- 使用密码强度指示器

**API 安全：**
- 要求所有受保护的端点进行身份验证
- 实施速率限制
- 使用作用域或权限进行授权
- 记录身份验证和授权事件

## 平台特定实现

有关平台特定实现的详细指导，请参阅以下参考文件：

### Auth0 实现

文件：reference/auth0.md

涵盖攻击防护配置、使用 WebAuthn 和自适应策略设置 MFA、使用 DPoP 和 mTLS 发送方约束保障令牌安全、FAPI/GDPR/HIPAA 合规功能、Security Center 监控，以及持续会话保护。

关键章节：Dashboard 导航、机器人检测配置、泄露密码检测、暴力破解防护、WebAuthn 设置、令牌验证、DPoP 实现、mTLS 证书绑定、合规认证。

### Clerk 实现

文件：reference/clerk.md

涵盖 Next.js 的 ClerkProvider 设置、身份验证组件（SignIn、SignUp、UserButton）、使用中间件保护路由、useAuth 和 useUser hooks、服务端身份验证、组织管理以及 Core 2 迁移。

主要章节：环境变量、中间件配置、保护路由、访问用户数据、组织切换、自定义身份验证流程、Webhook 集成。

### Firebase Auth 实现

文件：reference/firebase-auth.md

涵盖跨平台（Web、Flutter、iOS、Android）的 Firebase SDK 初始化、社交身份验证设置、使用短信验证码的电话身份验证、支持账户关联的匿名身份验证、用于 RBAC 的自定义声明以及 Security Rules 集成。

主要章节：项目设置、SDK 初始化、Google Sign-In、Facebook Login、电话验证、自定义声明管理、Firestore 和 Storage 规则、Cloud Functions 触发器。

### 平台比较

文件：reference/comparison.md

提供详细的比较矩阵，涵盖功能、定价、使用场景、迁移注意事项和集成复杂度。

主要章节：功能比较表、定价明细、使用场景决策矩阵、平台迁移策略、生态系统集成、开发者体验比较。

## 导航指南

使用身份验证功能时：

1. 如果正在选择平台，请从快速平台选择（见上文）开始
2. 查看通用身份验证模式，了解通用概念
3. 打开特定平台的参考文件，了解实现细节
4. 评估多个平台时，请参阅 comparison.md
5. 使用 Context7 工具访问最新的平台文档

## Context7 文档访问

使用 Context7 MCP 访问最新的平台文档：

**Auth0：**
- 使用 resolve-library-id 和 "auth0" 获取库 ID
- 使用 get-library-docs，并将主题设为 "attack-protection"、"mfa"、"tokens"、"compliance"

**Clerk：**
- 使用 resolve-library-id 和 "clerk" 获取库 ID
- 使用 get-library-docs，并将主题设为 "nextjs"、"react"、"authentication"

**Firebase Auth：**
- 使用 resolve-library-id 和 "firebase" 获取库 ID
- 使用 get-library-docs，并将主题设为 "authentication"、"security-rules"

## 配合使用效果良好

- moai-platform-supabase：集成身份验证的数据库
- moai-platform-vercel：支持边缘身份验证的部署
- `.claude/rules/moai/languages/typescript.md`：身份验证 SDK 的 TypeScript 模式（通过 paths frontmatter 自动加载）
- moai-domain-backend：包含身份验证的后端架构
- moai-domain-frontend：React/Next.js 前端集成
- moai-expert-security：安全审计和威胁建模

---

状态：活跃
版本：2.0.0（整合的平台覆盖范围）
最后更新：2026-02-09
平台：Auth0、Clerk、Firebase Auth

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化说辞

| 合理化说辞 | 事实 |
|---|---|
| “仅使用密码的身份验证对于内部工具来说已经足够” | 内部工具会通过撞库攻击遭到入侵。对于任何能够访问生产数据的工具，MFA 都是最低要求。 |
| “为了避免供应商锁定，我会从头实现身份验证” | 自定义身份验证实现是安全漏洞的主要来源。应使用经过验证的提供商，并对接口进行抽象。 |
| “用户不喜欢重新登录，因此会话过期时间可以设置得较长” | 长会话会扩大令牌被盗后的攻击窗口。应使用短会话并进行静默刷新。 |
| “社交登录只是一项便利功能” | 社交登录将身份验证委托给身份提供商。它可以减少密码存储方面的攻击面。 |
| “WebAuthn/passkeys 太新了，不适合采用” | 所有主流浏览器和平台都支持 Passkeys。它们可以消除最常见攻击媒介——网络钓鱼。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 身份验证令牌存储在 localStorage 中，而不是 httpOnly cookie 中
- 具有提升权限的账户没有可用的 MFA 选项
- 会话令牌没有过期或刷新机制
- 密码重置流程不会使现有会话失效
- OAuth 重定向 URI 接受通配符或未经验证的值

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 令牌存储在具有 httpOnly、Secure、SameSite 属性的 cookie 中（而不是 localStorage）
- [ ] 所有用户账户均已启用或可使用 MFA
- [ ] 已配置会话过期时间和自动刷新机制
- [ ] 重置密码会使该账户的所有现有会话失效
- [ ] OAuth 重定向 URI 已进行精确匹配验证（无通配符）
- [ ] 身份验证提供商的 SDK 版本为当前版本（显示依赖项版本）

<!-- moai:evolvable-end -->

## 重构说明

**R4 审核结论**（2026-04-23）：REFACTOR — 保留三项范围（Clerk、Auth.js、Supabase Auth），并缩小每个供应商的指导范围
**SPEC**：SPEC-V3R2-WF-001 §6.2 第 272 行
**重构范围**（推迟到未来的子 SPEC）：
- 为每个供应商（Clerk、Auth.js、Supabase Auth）提供范围更窄、更具可操作性的指导
- 添加用于选择供应商的实现模式对比表
- 将 OWASP 身份验证检查清单引用提取到 moai-ref-owasp-checklist

此技能保留在 v3.0 中，但其正文将在后续 SPEC 中进行重构。