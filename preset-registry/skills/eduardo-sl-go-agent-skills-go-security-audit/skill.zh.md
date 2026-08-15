---
name: go-security-audit
description: >
  Security review for Go applications: input validation, SQL injection,
  authentication/authorization, secrets management, TLS, OWASP Top 10,
  and secure coding patterns.
  Use when performing security reviews, checking for vulnerabilities,
  hardening Go services, or reviewing auth implementations.
  Trigger examples: "security review", "check vulnerabilities", "OWASP",
  "SQL injection", "input validation", "secrets management", "auth review".
  Do NOT use for dependency CVE scanning (use go-dependency-audit) or
  concurrency safety (use go-concurrency-review).
license: MIT
metadata:
  version: "1.2.0"
---
# Go 安全审计

安全不是一项功能，而是一种属性。每一行代码要么维护安全性，
要么削弱安全性。

## 工作模式

开始之前，选择与请求相匹配的模式：

- **针对性检查** — 单个关注点（“这个查询是否可被注入？”、
  “审查这个身份验证中间件”）。仅应用相关章节。
- **差异审计** — 针对以下每个关注点，审计 PR 或工作树中发生更改的代码行。
- **完整审计**（“对服务进行安全审查”时的默认模式）— 使用“审计大型代码库”中的并行检查流程，
  全面检查代码库。

## 首先运行扫描器

在进行人工审查之前，运行自动化扫描器，并将其输出纳入审计发现中
（跳过任何未安装的扫描器，并注明这一点）：

```bash
govulncheck ./...       # known CVEs actually reachable from your code
gosec ./...             # static analysis for insecure patterns
go vet ./...            # includes some security-relevant checks
```

扫描器可以发现已知模式；下方的人工检查流程则用于发现扫描器无法识别的
逻辑缺陷。

## 审计大型代码库

下方每个编号章节都是一轮独立的审计检查。对于超过约 20 个文件的代码库：

1. 首先定位攻击面：HTTP/gRPC 处理程序、CLI 入口点、
   队列消费者，以及任何解析外部输入的代码。
2. 针对每个关注点分别进行一轮检查：(a) 输入验证与注入、
   (b) 身份验证与授权、(c) 密钥与加密、
   (d) TLS、安全响应头与速率限制、(e) 日志卫生。
3. 如果你的环境支持将工作委派给并行子代理
   或任务，请为每轮检查分配一个，因为这些检查互不重叠。
   否则，请依次执行。
4. 每项审计发现都必须引用 `file.go:line`、易受攻击的输入路径，
   并提供具体的修复方案。将所有发现汇总成一份按严重程度排序的报告。

## 1. 输入验证

### 绝不要信任用户输入。在边界处进行验证：

```go
// ✅ Good — validate before use
func (h *Handler) handleCreate(w http.ResponseWriter, r *http.Request) {
    // Limit body size
    r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB

    var req CreateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "invalid JSON")
        return
    }

    if err := validate.Struct(req); err != nil {
        respondError(w, http.StatusBadRequest, "validation failed")
        return
    }
    // proceed with validated data
}
```

### 字符串净化：

```go
// Sanitize HTML to prevent XSS
import "github.com/microcosm-cc/bluemonday"

p := bluemonday.UGCPolicy()
sanitized := p.Sanitize(userInput)

// Validate email format
import "net/mail"
_, err := mail.ParseAddress(email)

// Validate URLs
u, err := url.Parse(input)
if err != nil || (u.Scheme != "http" && u.Scheme != "https") {
    // reject
}
```

## 2. SQL 注入防护

### 始终使用参数化查询：

```go
// ✅ Good — parameterized
row := db.QueryRowContext(ctx,
    "SELECT id, name FROM users WHERE email = $1", email)

// ✅ Good — with sqlx named params
query := "SELECT * FROM users WHERE name = :name AND age > :age"
rows, err := db.NamedQueryContext(ctx, query, map[string]interface{}{
    "name": name,
    "age":  minAge,
})

// ❌ CRITICAL — string concatenation = SQL injection
query := "SELECT * FROM users WHERE email = '" + email + "'"
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", id)
```

### 动态查询：

构建动态 WHERE 子句时，请使用查询构建器或安全的字符串拼接：

```go
// ✅ Good — safe dynamic query building
var conditions []string
var args []interface{}
argIdx := 1

if name != "" {
    conditions = append(conditions, fmt.Sprintf("name = $%d", argIdx))
    args = append(args, name)
    argIdx++
}

query := "SELECT * FROM users"
if len(conditions) > 0 {
    query += " WHERE " + strings.Join(conditions, " AND ")
}
```

## 3. 身份认证与授权

### 密码处理：

```go
import "golang.org/x/crypto/bcrypt"

// Hash password
hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

// Verify password — constant-time comparison built in
err := bcrypt.CompareHashAndPassword(hash, []byte(password))
```

绝不要存储明文密码。绝不要对密码使用 MD5/SHA。

### JWT 验证：

```go
// ✅ Always validate:
// 1. Signature (algorithm must match expectation)
// 2. Expiration (exp claim)
// 3. Issuer (iss claim)
// 4. Audience (aud claim)

// ❌ CRITICAL — never disable signature verification
// ❌ CRITICAL — never accept "alg": "none"
// ❌ CRITICAL — never hardcode signing keys in source code
```

### 授权中间件：

```go
func RequireRole(role string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            user := UserFromContext(r.Context())
            if user == nil || !user.HasRole(role) {
                http.Error(w, "forbidden", http.StatusForbidden)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
```

## 4. 密钥管理

### 规则：
- 🔴 绝不要在源代码中硬编码密钥、令牌或 API 密钥
- 🔴 绝不要将密钥提交到 git（即使是在“测试”文件中）
- 🔴 绝不要记录密钥、令牌或密码

```go
// ✅ Good — from environment
dbURL := os.Getenv("DATABASE_URL")

// ✅ Good — from secrets manager
secret, err := secretsManager.GetSecret(ctx, "api-key")

// ❌ CRITICAL
const apiKey = "sk-1234567890abcdef" // hardcoded secret
```

### 使用 `.gitignore`：

```text
.env
*.pem
*.key
credentials.json
```

### 扫描泄露的密钥：

```bash
# Use gitleaks in CI
gitleaks detect --source=. --verbose
```

## 5. HTTP 安全响应头

```go
func SecurityHeaders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("Content-Security-Policy", "default-src 'self'")
        w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        w.Header().Set("X-XSS-Protection", "0") // modern browsers handle this
        next.ServeHTTP(w, r)
    })
}
```

## 6. TLS 配置

```go
tlsConfig := &tls.Config{
    MinVersion: tls.VersionTLS12,
    CipherSuites: []uint16{
        tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
        tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
    },
    PreferServerCipherSuites: true,
}

srv := &http.Server{
    TLSConfig: tlsConfig,
    // ...
}
```

## 7. 速率限制

```go
import "golang.org/x/time/rate"

type RateLimiter struct {
    limiters sync.Map
    rate     rate.Limit
    burst    int
}

func (rl *RateLimiter) Allow(key string) bool {
    limiter, _ := rl.limiters.LoadOrStore(key,
        rate.NewLimiter(rl.rate, rl.burst))
    return limiter.(*rate.Limiter).Allow()
}
```

对身份验证端点、公共 API 以及任何资源密集型操作应用速率限制。

## 8. 日志安全

```go
// ❌ CRITICAL — logging sensitive data
log.Printf("user login: email=%s password=%s", email, password)
log.Printf("auth token: %s", token)
log.Printf("request body: %v", req) // may contain secrets

// ✅ Good — redact sensitive fields
log.Printf("user login: email=%s", email)
logger.Info("auth completed", slog.String("user_id", userID))
```

## 安全审计检查清单

### 严重（🔴 阻断项）
- 不存在 SQL 注入途径（所有查询均已参数化）
- 不存在硬编码的密钥/键/令牌
- 不以明文存储密码
- 未禁用 TLS 证书验证
- 请求体大小受到限制
- 验证 JWT 签名，并拒绝 `alg: none`

### 重要（🟡 警告）
- 验证所有外部数据的输入
- 对身份验证端点和公共端点实施速率限制
- 所有响应均设置安全标头
- 对 CORS 进行严格配置
- 错误消息不会泄露内部信息
- 记录身份验证事件的审计日志

### 建议（🟢 建议项）
- 在 CI 流水线中使用 `govulncheck`
- 使用 `gitleaks` 扫描密钥
- 使用带敏感信息脱敏的结构化日志
- 固定依赖项版本并验证校验和