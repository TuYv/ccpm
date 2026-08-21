---
name: moai-ref-owasp-checklist
description: >
  OWASP Top 10 security checklist, authentication patterns, input validation,
  and HTTP security headers reference. Agent-extending skill that amplifies
  backend-implementation and security-audit workflows with production-grade security patterns.
  NOT for: frontend UI, DevOps deployment, performance optimization, testing strategy.

when_to_use: >
  Use for security reference: OWASP Top 10 vulnerabilities (injection,
  XSS, CSRF), authentication patterns, input validation, and HTTP security
  headers. Amplifies backend-implementation and security-audit workflows with
  production-grade security patterns.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-03-30"
  tags: "owasp, security, checklist, authentication, validation, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# OWASP 安全检查清单参考

## 目标智能体

- `manager-develop` - 在后端 API 实现期间应用检查清单（`cycle_type=tdd` 或 `cycle_type=ddd` 上下文）
- `/moai review --security` - 主要的安全审计调用入口（根据 SPEC-SUBCOMMAND-RETIRE-001，取代已退役的 `/moai security` 子命令）；同样也可以按照 `archived-agent-rejection.md` §C，以每次生成一个 `Agent(general-purpose)` 安全专家的方式使用

## OWASP API 安全十大风险

| 排名 | 漏洞 | 检查 | 防御措施 |
|------|-------------|-------|---------|
| A1 | **BOLA**（对象级授权失效） | 用户 A 能否访问用户 B 的资源？ | 在每个端点验证对象所有权 |
| A2 | **身份验证失效** | 密码是否过弱、登录尝试次数是否不受限制？ | bcrypt（成本因子 12+）、速率限制、MFA |
| A3 | **对象属性级授权失效** | 响应中是否暴露了隐藏字段？ | 响应 DTO、字段级过滤 |
| A4 | **不受限制的资源消耗** | 大量请求能否导致服务器崩溃？ | 速率限制、强制实施分页限制 |
| A5 | **功能级授权失效** | 普通用户能否调用管理员 API？ | RBAC 中间件、权限检查 |
| A6 | **SSRF**（服务器端请求伪造） | URL 输入能否访问内部资源？ | URL 白名单、阻止内部 IP |
| A7 | **安全配置错误** | 是否暴露了调试模式、默认账户？ | 分离生产环境配置、检查请求头 |
| A8 | **缺乏自动化威胁防护** | API 能否以异常顺序调用？ | 状态机验证、业务规则 |
| A9 | **资产管理不当** | 是否暴露了未使用的 API、旧版本？ | API 清单、版本弃用 |
| A10 | **不安全的 API 使用** | 是否盲目信任外部 API 响应？ | 验证外部响应、设置超时 |

## 身份验证检查清单

### 密码策略
- 最少 8 个字符，显示强度指示器（不采用严格规则）
- bcrypt（成本因子 12+）或 Argon2id
- 失败 5 次后临时锁定（15 分钟）或使用 CAPTCHA
- 防止重复使用最近 5 个密码

### JWT 配置
| 设置 | 推荐值 |
|---------|------------------|
| 访问令牌过期时间 | 15-30 分钟 |
| 刷新令牌过期时间 | 7-14 天 |
| 算法 | RS256（非对称）或 HS256 |
| 存储 | httpOnly + secure + sameSite cookie |
| 载荷 | 最小化：仅包含 userId、role（不包含 PII） |
| 续期 | 静默刷新或令牌轮换 |

### 会话安全
- 登录后重新生成会话 ID
- 注销时使会话失效（服务器端）
- 设置会话超时（空闲 30 分钟）
- 将会话与 IP/User-Agent 绑定（可选，严格模式）

## HTTP 安全标头

| 标头 | 值 | 用途 |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | 强制使用 HTTPS |
| `X-Content-Type-Options` | `nosniff` | 防止 MIME 嗅探 |
| `X-Frame-Options` | `DENY` 或 `SAMEORIGIN` | 防止点击劫持 |
| `Content-Security-Policy` | `default-src 'self'` | 防止 XSS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 限制引用来源信息 |
| `Permissions-Policy` | `camera=(), microphone=()` | 限制浏览器功能 |

## 输入验证检查清单

| 类型 | 方法 | 工具 |
|------|--------|------|
| 模式验证 | 类型 + 结构检查 | Zod、Joi、pydantic、Go validator |
| 长度限制 | 最小值/最大值约束 | 模式定义 |
| SQL 注入 | 参数化查询 | ORM（Prisma、GORM、SQLAlchemy） |
| XSS 防护 | HTML 转义 | DOMPurify（客户端）、服务端转义 |
| 路径遍历 | 路径规范化 | filepath.Clean + 白名单 |
| 文件上传 | 类型 + 大小验证 | MIME 类型 + 魔数检查 |
| CORS | 来源白名单 | 使用凭据时切勿设置 `origin: '*'` |

## 敏感数据处理

| 数据类型 | 存储 | 传输 | 日志记录 |
|----------|---------|-------------|---------|
| 密码 | 仅存储 bcrypt 哈希 | 仅限 HTTPS | 绝不记录 |
| API 密钥 | 环境变量 | 请求头（Authorization） | 脱敏（前 4 个字符） |
| PII | 加密（AES-256） | 仅限 HTTPS | 脱敏 |
| 信用卡 | 令牌化（支付服务提供商） | 提供商 SDK | 绝不记录 |
| 会话 | httpOnly cookie | 仅限 HTTPS | 绝不记录 |

## 安全审查严重级别

| 级别 | 标签 | 措施 | 示例 |
|-------|-------|--------|---------|
| P0 | 严重 | 阻止发布 | SQL 注入、身份验证绕过 |
| P1 | 高 | 合并前修复 | 缺少授权检查 |
| P2 | 中 | 在当前冲刺内修复 | 弱密码策略 |
| P3 | 低 | 在待办事项中跟踪 | 缺少安全响应头 |

## 信任边界验证原则

| 原则 | 适用范围 | 防御措施 |
|-----------|------------|---------|
| 缓存的或客户端提供的会话状态不能作为当前身份的证明 | 任何缓存会话/JWT 值或在本地对其进行解码的框架 | 在每次做出授权决策前，对照服务端事实来源（会话存储、令牌内省、身份提供商）重新验证身份 |
| 边缘层/网关/中间件的身份验证检查只是用户体验上的便利措施，而不是安全边界 | 反向代理、框架中间件、API 网关、无服务器边缘函数 | 每个处理变更操作的端点都要独立地重新检查身份验证和资源所有权授权 |
| 由计划任务/cron 触发的 HTTP 端点仍然是公开 URL | 任何调用 HTTP 端点的调度器（cron 作业、计划执行的无服务器函数、容器编排器计划任务） | 每次调用计划任务端点时，都要求进行共享密钥不记名令牌检查（恒定时间比较） |
| 生产构建不得暴露源映射或同等的调试产物 | 任何打包器/构建工具 | 在生产配置中禁用生产源映射、详细堆栈跟踪和构建清单 |
| Webhook 接收器必须先验证签名/HMAC 请求头，再信任载荷 | 任何 Webhook 提供商 | 在将载荷视为合法业务数据之前，使用共享密钥验证签名/HMAC |

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “这是一个内部应用程序，OWASP 不适用” | 已遭入侵的内部服务可以访问内部应用程序。OWASP 适用于所有 Web 应用程序。 |
| “框架会处理 XSS 防护” | 框架会保护默认渲染路径。动态 HTML 插入、innerHTML 和模板字面量会绕过这种保护。 |
| “我们不存储敏感数据，因此不需要加密” | 会话令牌、API 密钥和 PII 都是敏感数据。如果应用程序有用户，它就有敏感数据。 |
| “安全响应头只是纵深防御，并不重要” | 每个安全响应头都会阻止特定类别的攻击。即使输出已转义，缺少 CSP 仍会使 XSS 攻击成为可能。 |
| “我会在发布前进行安全审查” | 后期安全审查发现的问题修复成本高昂。从一开始采用安全编码实践可以预防这些问题。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 用户输入未经转义或清理便渲染到 HTML 中
- 使用字符串拼接而非参数化查询构建 SQL 查询
- 身份验证令牌存储在 localStorage 中，而非 httpOnly cookie 中
- 响应中缺少 Content-Security-Policy 标头
- 在已提交到 git 的源代码或配置文件中发现机密信息（API 密钥、密码）

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 已针对本次变更审查 OWASP Top 10 检查清单（说明评估了哪些项目）
- [ ] 用户输入在渲染到 HTML 输出之前已进行清理
- [ ] 所有数据库查询均使用参数化语句
- [ ] 安全标头已设置（CSP、X-Frame-Options、X-Content-Type-Options）
- [ ] 源代码中未发现机密信息（展示针对常见机密模式的 grep 结果）
- [ ] 身份验证令牌使用 httpOnly、Secure、SameSite cookie 属性

<!-- moai:evolvable-end -->