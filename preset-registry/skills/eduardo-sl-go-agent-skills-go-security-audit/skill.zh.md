---
name: go-security-audit
description: >
  Security review for Go applications: input validation, SQL injection,
  authentication/authorization, secrets management, TLS, OWASP Top 10, and
  secure coding patterns. Use when performing security reviews, checking for
  vulnerabilities, hardening Go services, or reviewing auth implementations.
  Trigger examples: "security review", "check vulnerabilities", "OWASP",
  "SQL injection", "input validation", "secrets management", "auth review".
  Not for: dependency CVEs (go-dependency-audit), concurrency safety
  (go-concurrency-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. govulncheck, gosec and gitleaks are optional. Read-only: this skill reports findings, it does not edit code.
allowed-tools: Read Glob Grep Bash(go:*) Bash(gofmt:*) Bash(govulncheck:*) Bash(gosec:*) Bash(gitleaks:*)
metadata:
  author: eduardo-sl
  version: "1.4.0"
---
# Go 安全审计

安全不是一项功能——而是一种属性。每一行代码要么维护它，要么削弱它。

## 运行模式

开始前，选择与请求匹配的模式：

- **定向检查**——针对单一问题（“这个查询是否可注入？”、“审查这个身份验证中间件”）。只应用相关章节。
- **差异审计**——针对 PR 或工作树中发生更改的代码行，审计以下所有问题。
- **完整审计**（“对该服务进行安全审查”时的默认模式）——使用“审计大型代码库”中的并行检查流程扫描整个代码库。

## 先运行扫描器

在手动审查之前，先运行自动化扫描器，并将其输出纳入发现结果（未安装的扫描器跳过并注明）：

```bash
govulncheck ./...       # known CVEs actually reachable from your code
gosec ./...             # static analysis for insecure patterns
go vet ./...            # includes some security-relevant checks
```

扫描器可以发现已知模式；下面的手动检查流程则用于发现它们无法识别的逻辑缺陷。

## 审计大型代码库

下面的每个编号章节都是一个独立的审计流程。对于超过约 20 个文件的代码库：

1. 首先定位攻击面：HTTP/gRPC 处理程序、CLI 入口点、队列消费者，以及任何解析外部输入的代码。
2. 针对每个问题分别运行一个检查流程：(a) 输入验证 + 注入，(b) 身份验证/授权，(c) 密钥 + 加密，(d) TLS + 安全标头 + 速率限制，(e) 日志卫生。
3. 如果你的环境支持将工作委派给并行子代理或任务，则为每个流程分配一个——这些流程之间不会重叠。否则按顺序运行。
4. 每个发现结果都必须引用 `file.go:line`、存在漏洞的输入路径以及具体修复方案。汇总为一份按严重性排序的报告。

按需加载的详细参考资料：

- `references/injection.md` — 边界验证、清理、参数化查询和动态查询。
- `references/auth-and-transport.md` — 密码、JWT、授权中间件、密钥、TLS、标头和速率限制。

只有在下面的章节不足以解决问题时，才读取参考文件。

## 1. 输入验证

在边界处验证数据，在该值进入任何业务代码之前完成验证：

- 使用 `http.MaxBytesReader` 限制请求正文大小——无界解码器可能导致内存耗尽。
- 解码到类型化结构体中，然后对其进行验证。解码成功不代表该值有效。
- 拒绝，而不是修复。回复状态码，不要回复内部错误文本。
- 对任何重新渲染为 HTML 的内容进行清理（`bluemonday`），使用 `net/mail` 解析电子邮件，并拒绝 scheme 不是 `http`/`https` 的 URL。

示例见 `references/injection.md`。

## 2. SQL 注入防护

始终将值作为查询参数传递。字符串拼接不存在所谓的安全限度：

```go
// ✅ Good — parameterized
row := db.QueryRowContext(ctx, "SELECT id, name FROM users WHERE email = $1", email)

// ❌ CRITICAL — SQL injection
query := "SELECT * FROM users WHERE email = '" + email + "'"
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", id)
```

动态过滤条件应通过追加占位符（`$1`、`$2`、……）并将值收集到 `args` 切片中来构建——绝不能直接插入值本身。表名和列名无法参数化：应针对固定集合对其进行允许列表校验。

示例见 `references/injection.md`。

## 3. 身份验证与授权

- 使用 `bcrypt`（或 argon2id）对密码进行哈希处理。绝 NEVER 存储明文密码，绝 NEVER 使用 MD5/SHA——它们速度很快，而这里需要的恰恰不是这一特性。
- 使用 `bcrypt.CompareHashAndPassword` 进行比较，它采用常量时间比较。手写比较会泄露时序信息。
- 验证每个重要的 JWT 声明：使用预期算法验证签名，以及验证 `exp`、`iss`、`aud`。拒绝 `alg: none`，绝不要将签名密钥硬编码。
- 在中间件中针对每个请求执行授权，从请求上下文中读取身份信息。没有角色检查的端点就是公共端点。
- 检查所有权，而不仅仅是角色：用户 A 持有的有效令牌不得读取用户 B 的行。

示例见 `references/auth-and-transport.md`。

## 4. 密钥管理

- 🔴 绝 NEVER 将密钥、令牌或 API 密钥硬编码在源代码中
- 🔴 绝 NEVER 将密钥提交到 git（即使是在“测试”文件中）
- 🔴 绝 NEVER 记录密钥、令牌或密码

从环境或密钥管理器中读取这些值，将 `.env`、`*.pem`、`*.key` 和 `credentials.json` 保存在 `.gitignore` 中，并在 CI 中运行 `gitleaks detect`，这样泄露会导致构建失败，而不是在历史记录中长期存在。

示例见 `references/auth-and-transport.md`。

## 5. 传输、标头与速率限制

- 在每个响应中设置 `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`Content-Security-Policy` 和 HSTS。
- TLS：使用 `MinVersion: tls.VersionTLS12` 和明确的密码套件列表。在测试之外绝 NEVER 使用 `InsecureSkipVerify: true`。
- 对身份验证端点、公共 API 以及任何高开销操作进行速率限制，并按客户端而不是全局进行限流。

示例见 `references/auth-and-transport.md`。

## 6. 日志安全

记录标识符，绝不记录凭据：

```go
// ❌ CRITICAL
log.Printf("user login: email=%s password=%s", email, password)
log.Printf("request body: %v", req) // may contain secrets

// ✅ Good — redacted
logger.Info("auth completed", slog.String("user_id", userID))
```

记录整个结构体是常见的泄露来源：对请求结构体使用 `%v` 会打印出下个迭代中有人添加的任何字段。

## 安全审计清单

### Critical (🔴 BLOCKER)
- No SQL injection vectors (all queries parameterized)
- No hardcoded secrets/keys/tokens
- No plaintext password storage
- No disabled TLS certificate verification
- Request body size limited
- JWT signature verified, `alg: none` rejected

### Important (🟡 WARNING)
- Input validation on all external data
- Rate limiting on auth and public endpoints
- Security headers set on all responses
- CORS configured restrictively
- Error messages don't leak internals
- Audit logging for auth events

### Recommended (🟢 SUGGESTION)
- `govulncheck` in CI pipeline
- `gitleaks` for secret scanning
- Structured logging with redaction
- Dependency pinning with verified checksums