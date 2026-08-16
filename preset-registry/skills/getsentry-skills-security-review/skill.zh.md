---
name: security-review
description: Security code review for vulnerabilities. Use when asked to "security review", "find vulnerabilities", "check for security issues", "audit security", "OWASP review", or review code for injection, XSS, authentication, authorization, cryptography issues. Provides systematic review with confidence-based reporting.
allowed-tools: Read, Grep, Glob, Bash, Task
license: LICENSE
---
<!--
参考资料基于 OWASP Cheat Sheet Series（CC BY-SA 4.0）
https://cheatsheetseries.owasp.org/
-->

# 安全审查技能

识别代码中可被利用的安全漏洞。仅报告**高置信度**的发现——即存在明确的漏洞模式，且输入由攻击者控制。

## 范围：研究与报告

**关键区别：**

- **报告对象**：仅限用户提供的特定文件、差异或代码
- **研究范围**：整个代码库，以便在报告前建立充分的置信度

在标记任何问题之前，你必须研究代码库以了解：
- 此输入实际上来自哪里？（追踪数据流）
- 其他地方是否存在验证/清理措施？
- 它是如何配置的？（检查设置、配置文件、中间件）
- 框架提供了哪些保护措施？

**不要仅基于模式匹配报告问题。** 先进行调查，然后仅报告你确信可被利用的问题。

## 置信度级别

| 级别 | 标准 | 操作 |
|-------|----------|--------|
| **高** | 已确认存在漏洞模式，且输入由攻击者控制 | **报告**并注明严重性 |
| **中** | 存在漏洞模式，但输入来源不明确 | **注明**“需要验证” |
| **低** | 理论性问题、最佳实践、纵深防御 | **不要报告** |

## 不要标记

### 一般规则
- 测试文件（除非明确要求审查测试安全性）
- 死代码、注释掉的代码、文档字符串
- 使用**常量**或**服务器控制的配置**的模式
- 需要先通过身份验证才能到达的代码路径（应改为注明身份验证要求）

### 服务器控制的值（不由攻击者控制）

这些值由运维人员配置，不受攻击者控制：

| 来源 | 示例 | 安全原因 |
|--------|---------|---------------|
| Django 设置 | `settings.API_URL`、`settings.ALLOWED_HOSTS` | 在部署时通过配置/环境进行设置 |
| 环境变量 | `os.environ.get('DATABASE_URL')` | 部署配置 |
| 配置文件 | `config.yaml`、`app.config['KEY']` | 服务器端文件 |
| 框架常量 | `django.conf.settings.*` | 用户无法修改 |
| 硬编码值 | `BASE_URL = "https://api.internal"` | 编译时常量 |

**SSRF 示例——不是漏洞：**
```python
# SAFE: URL comes from Django settings (server-controlled)
response = requests.get(f"{settings.SEER_AUTOFIX_URL}{path}")
```

**SSRF 示例——是漏洞：**
```python
# VULNERABLE: URL comes from request (attacker-controlled)
response = requests.get(request.GET.get('url'))
```

### 由框架缓解的模式
在标记前检查相应语言指南。常见的误报包括：

| 模式 | 通常安全的原因 |
|---------|----------------------|
| Django `{{ variable }}` | 默认自动转义 |
| React `{variable}` | 默认自动转义 |
| Vue `{{ variable }}` | 默认自动转义 |
| `User.objects.filter(id=input)` | ORM 会对查询进行参数化 |
| `cursor.execute("...%s", (input,))` | 参数化查询 |
| `innerHTML = "<b>Loading...</b>"` | 常量字符串，不含用户输入 |

**仅在以下情况下标记：**
- Django：`{{ var|safe }}`、`{% autoescape off %}`、`mark_safe(user_input)`
- React：`dangerouslySetInnerHTML={{__html: userInput}}`
- Vue：`v-html="userInput"`
- ORM：使用字符串插值的 `.raw()`、`.extra()`、`RawSQL()`

## 审查流程

### 1. 识别上下文

我正在审查哪种类型的代码？

| 代码类型 | 加载这些参考文档 |
|-----------|----------------------|
| API 端点、路由 | `authorization.md`、`authentication.md`、`injection.md` |
| 前端、模板 | `xss.md`、`csrf.md` |
| 文件处理、上传 | `file-security.md` |
| 加密、密钥、令牌 | `cryptography.md`、`data-protection.md` |
| 数据序列化 | `deserialization.md` |
| 外部请求 | `ssrf.md` |
| 业务工作流 | `business-logic.md` |
| GraphQL、REST 设计 | `api-security.md` |
| 配置、标头、CORS | `misconfiguration.md` |
| CI/CD、依赖项 | `supply-chain.md` |
| 错误处理 | `error-handling.md` |
| 审计、日志记录 | `logging.md` |

### 2. 加载语言指南

根据文件扩展名或导入项：

| 指示项 | 指南 |
|------------|-------|
| `.py`、`django`、`flask`、`fastapi` | `languages/python.md` |
| `.js`、`.ts`、`express`、`react`、`vue`、`next` | `languages/javascript.md` |
| `.go`、`go.mod` | `languages/go.md` |
| `.rs`、`Cargo.toml` | `languages/rust.md` |
| `.java`、`spring`、`@Controller` | `languages/java.md` |

### 3. 加载基础设施指南（如适用）

| 文件类型 | 指南 |
|-----------|-------|
| `Dockerfile`、`.dockerignore` | `infrastructure/docker.md` |
| K8s 清单、Helm 图表 | `infrastructure/kubernetes.md` |
| `.tf`、Terraform | `infrastructure/terraform.md` |
| GitHub Actions、`.gitlab-ci.yml` | `infrastructure/ci-cd.md` |
| AWS/GCP/Azure 配置、IAM | `infrastructure/cloud.md` |

### 4. 标记前进行调查

**对于每个潜在问题，调查代码库以建立充分的判断依据：**

- 该值实际来自哪里？追踪数据流。
- 它是在部署时配置的（设置、环境变量），还是来自用户输入？
- 其他地方是否存在验证、净化或允许列表机制？
- 适用了哪些框架保护机制？

只有在了解更广泛的上下文并具有高度把握后，才报告问题。

### 5. 验证可利用性

对于每个潜在发现，确认：

**输入是否由攻击者控制？**

| 攻击者可控（需调查） | 服务器可控（通常安全） |
|-----------------------------------|----------------------------------|
| `request.GET`、`request.POST`、`request.args` | `settings.X`、`app.config['X']` |
| `request.json`、`request.data`、`request.body` | `os.environ.get('X')` |
| `request.headers`（大多数标头） | 硬编码常量 |
| `request.cookies`（未签名） | 配置中的内部服务 URL |
| URL 路径段：`/users/<id>/` | 来自管理员/系统的数据库内容 |
| 文件上传（内容和文件名） | 已签名的会话数据 |
| 来自其他用户的数据库内容 | 框架设置 |
| WebSocket 消息 | |

**框架是否会缓解此问题？**
- 查看语言指南，了解自动转义和参数化机制
- 检查是否存在执行净化的中间件/装饰器

**上游是否进行了验证？**
- 在此代码之前进行输入验证
- 使用了净化库（DOMPurify、bleach 等）

### 6. 仅报告高置信度问题

跳过理论性问题。只报告经研究后已确认可被利用的问题。

---

## 严重性分类

| 严重性 | 影响 | 示例 |
|----------|--------|----------|
| **严重** | 可直接利用、影响严重、无需身份验证 | RCE、可访问数据的 SQL 注入、身份验证绕过、硬编码密钥 |
| **高** | 在特定条件下可被利用，影响显著 | 存储型 XSS、访问元数据的 SSRF、可访问敏感数据的 IDOR |
| **中** | 需要特定条件，影响中等 | 反射型 XSS、针对状态变更操作的 CSRF、路径遍历 |
| **低** | 纵深防御问题，直接影响极小 | 缺少响应头、错误信息过于详细、在非关键场景中使用弱算法 |

---

## 常见模式快速参考

### 始终报告（严重）
```
eval(user_input)           # Any language
exec(user_input)           # Any language
pickle.loads(user_data)    # Python
yaml.load(user_data)       # Python (not safe_load)
unserialize($user_data)    # PHP
deserialize(user_data)     # Java ObjectInputStream
shell=True + user_input    # Python subprocess
child_process.exec(user)   # Node.js
```

### 始终报告（高）
```
innerHTML = userInput              # DOM XSS
dangerouslySetInnerHTML={user}     # React XSS
v-html="userInput"                 # Vue XSS
f"SELECT * FROM x WHERE {user}"    # SQL injection
`SELECT * FROM x WHERE ${user}`    # SQL injection
os.system(f"cmd {user_input}")     # Command injection
```

### 始终报告（密钥）
```
password = "hardcoded"
api_key = "sk-..."
AWS_SECRET_ACCESS_KEY = "..."
private_key = "-----BEGIN"
```

### 首先检查上下文（报告前必须调查）
```
# SSRF - ONLY if URL is from user input, NOT from settings/config
requests.get(request.GET['url'])     # FLAG: User-controlled URL
requests.get(settings.API_URL)       # SAFE: Server-controlled config
requests.get(f"{settings.BASE}/{x}") # CHECK: Is 'x' user input?

# Path traversal - ONLY if path is from user input
open(request.GET['file'])            # FLAG: User-controlled path
open(settings.LOG_PATH)              # SAFE: Server-controlled config
open(f"{BASE_DIR}/{filename}")       # CHECK: Is 'filename' user input?

# Open redirect - ONLY if URL is from user input
redirect(request.GET['next'])        # FLAG: User-controlled redirect
redirect(settings.LOGIN_URL)         # SAFE: Server-controlled config

# Weak crypto - ONLY if used for security purposes
hashlib.md5(file_content)            # SAFE: File checksums, caching
hashlib.md5(password)                # FLAG: Password hashing
random.random()                      # SAFE: Non-security uses (UI, sampling)
random.random() for token            # FLAG: Security tokens need secrets module
```

---

## 输出格式

```markdown
## Security Review: [File/Component Name]

### Summary
- **Findings**: X (Y Critical, Z High, ...)
- **Risk Level**: Critical/High/Medium/Low
- **Confidence**: High/Mixed

### Findings

#### [VULN-001] [Vulnerability Type] (Severity)
- **Location**: `file.py:123`
- **Confidence**: High
- **Issue**: [What the vulnerability is]
- **Impact**: [What an attacker could do]
- **Evidence**:
  ```python
  [Vulnerable code snippet]
  ```
- **Fix**: [How to remediate]

### Needs Verification

#### [VERIFY-001] [Potential Issue]
- **Location**: `file.py:456`
- **Question**: [What needs to be verified]
```

如果未发现漏洞，请注明：“未发现高置信度漏洞。”

---

## 参考文件

### 核心漏洞（`references/`）
| 文件 | 涵盖内容 |
|------|--------|
| `injection.md` | SQL、NoSQL、操作系统命令、LDAP、模板注入 |
| `xss.md` | 反射型、存储型、基于 DOM 的 XSS |
| `authorization.md` | 授权、IDOR、权限提升 |
| `authentication.md` | 会话、凭据、密码存储 |
| `cryptography.md` | 算法、密钥管理、随机性 |
| `deserialization.md` | Pickle、YAML、Java、PHP 反序列化 |
| `file-security.md` | 路径遍历、文件上传、XXE |
| `ssrf.md` | 服务端请求伪造 |
| `csrf.md` | 跨站请求伪造 |
| `data-protection.md` | 密钥泄露、PII、日志记录 |
| `api-security.md` | REST、GraphQL、批量赋值 |
| `business-logic.md` | 竞态条件、工作流绕过 |
| `modern-threats.md` | 原型污染、LLM 注入、WebSocket |
| `misconfiguration.md` | 响应头、CORS、调试模式、默认配置 |
| `error-handling.md` | 失效开放、信息泄露 |
| `supply-chain.md` | 依赖项、构建安全 |
| `logging.md` | 审计失败、日志注入 |

### 语言指南（`languages/`）
- `python.md` - Django、Flask、FastAPI 模式
- `javascript.md` - Node、Express、React、Vue、Next.js
- `go.md` - Go 特有的安全模式
- `rust.md` - Rust unsafe 块、FFI 安全
- `java.md` - Spring、Java EE 模式

### 基础设施（`infrastructure/`）
- `docker.md` - 容器安全
- `kubernetes.md` - K8s RBAC、密钥、策略
- `terraform.md` - IaC 安全
- `ci-cd.md` - 流水线安全
- `cloud.md` - AWS/GCP/Azure 安全