---
name: security-auditor
description: Continuous security vulnerability scanning for OWASP Top 10, common vulnerabilities, and insecure patterns. Use when reviewing code, before deployments, or on file changes. Scans for SQL injection, XSS, secrets exposure, auth issues. Triggers on file changes, security mentions, deployment prep.
allowed-tools: Read, Grep, Bash
---
# 安全审计技能

自动检测安全漏洞。

## 何时激活

- ✅ 代码文件被修改（尤其是身份验证、API、数据库相关文件）
- ✅ 用户提及安全或漏洞
- ✅ 部署或提交之前
- ✅ 依赖项发生变化
- ✅ 配置文件发生变化

## 扫描内容

### OWASP 十大安全风险模式

**1. SQL 注入**
```javascript
// CRITICAL: SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// SECURE: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

**2. XSS（跨站脚本攻击）**
```javascript
// CRITICAL: XSS vulnerability
element.innerHTML = userInput;

// SECURE: Use textContent or sanitize
element.textContent = userInput;
// or
element.innerHTML = DOMPurify.sanitize(userInput);
```

**3. 身份验证问题**
```javascript
// CRITICAL: Weak JWT secret
const token = jwt.sign(payload, 'secret123');

// SECURE: Strong secret from environment
const token = jwt.sign(payload, process.env.JWT_SECRET);
```

**4. 敏感数据泄露**
```python
# CRITICAL: Exposed password
password = "admin123"

# SECURE: Environment variable
password = os.getenv("DB_PASSWORD")
```

**5. 失效的访问控制**
```javascript
// CRITICAL: No authorization check
app.delete('/api/users/:id', (req, res) => {
  User.delete(req.params.id);
});

// SECURE: Authorization check
app.delete('/api/users/:id', auth, checkOwnership, (req, res) => {
  User.delete(req.params.id);
});
```

### 其他安全检查

- **不安全的反序列化**
- **安全配置错误**
- **日志记录不足**
- **缺少 CSRF 防护**
- **CORS 配置错误**

## 警报格式

```
🚨 CRITICAL: [Vulnerability type]
📍 Location: file.js:42
🔧 Fix: [Specific remediation]
📖 Reference: [OWASP/CWE link]
```

### 严重性级别

- 🚨 **严重**：必须立即修复（可被利用的漏洞）
- ⚠️ **高危**：应尽快修复（安全弱点）
- 📋 **中危**：考虑修复（潜在问题）
- 💡 **低危**：最佳实践改进

## 实际示例

### SQL 注入检测

```javascript
// You write:
app.get('/users', (req, res) => {
  const sql = `SELECT * FROM users WHERE name = '${req.query.name}'`;
  db.query(sql, (err, results) => res.json(results));
});

// I alert:
🚨 CRITICAL: SQL injection vulnerability (line 2)
📍 File: routes/users.js, Line 2
🔧 Fix: Use parameterized queries
  const sql = 'SELECT * FROM users WHERE name = ?';
  db.query(sql, [req.query.name], ...);
📖 https://owasp.org/www-community/attacks/SQL_Injection
```

### 密码存储

```python
# You write:
def create_user(username, password):
    user = User(username=username, password=password)
    user.save()

# I alert:
🚨 CRITICAL: Storing plain text password (line 2)
📍 File: models.py, Line 2
🔧 Fix: Hash passwords before storing
  from bcrypt import hashpw, gensalt
  hashed = hashpw(password.encode(), gensalt())
  user = User(username=username, password=hashed)
📖 Use bcrypt, scrypt, or argon2 for password hashing
```

### API 密钥泄露

```javascript
// You write:
const stripe = require('stripe')('sk_live_abc123...');

// I alert:
🚨 CRITICAL: Hardcoded API key detected (line 1)
📍 File: payment.js, Line 1
🔧 Fix: Use environment variables
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
📖 Never commit API keys to version control
```

## 依赖项扫描

我可以对依赖项运行安全审计：

```bash
# Node.js
npm audit

# Python
pip-audit

# Results flagged with severity
```

## 与 @code-reviewer 子代理的关系

**我（Skill）：** 快速检测漏洞模式
**@code-reviewer（子代理）：** 结合威胁建模进行深度安全审计

### 工作流程
1. 我检测漏洞模式
2. 我发出警告：“🚨 检测到 SQL 注入”
3. 你需要完整分析 → 调用 **@code-reviewer** 子代理
4. 子代理提供全面的安全审计

## 常见漏洞模式

### 身份认证
- 密码策略薄弱
- 缺少 MFA
- 会话固定
- 密码存储不安全

### 授权
- 缺少访问控制
- 权限提升
- IDOR（不安全的直接对象引用）

### 数据保护
- 敏感数据未加密
- 加密算法薄弱
- 缺少 HTTPS
- Cookie 不安全

### 输入验证
- SQL 注入
- 命令注入
- XSS
- 路径遍历

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是
**可在沙箱中运行：** ✅ 是

**可选：用于依赖项扫描**
```json
{
  "network": {
    "allowedDomains": [
      "registry.npmjs.org",
      "pypi.org",
      "api.github.com"
    ]
  }
}
```

## 与工具集成

### 与 secret-scanner Skill 配合
```
security-auditor: Checks code patterns
secret-scanner: Checks for exposed secrets
Together: Comprehensive security coverage
```

### 与 /review 命令配合
```bash
/review --scope staged --checks security

# Workflow:
# 1. My automatic security findings
# 2. @code-reviewer sub-agent deep audit
# 3. Comprehensive security report
```

## 自定义

添加公司特定的安全模式：

```bash
cp -r ~/.claude/skills/security/security-auditor \
      ~/.claude/skills/security/company-security-auditor

# Edit SKILL.md to add:
# - Internal API patterns
# - Company security policies
# - Custom vulnerability checks
```

## 了解更多

- [OWASP 十大安全风险](https://owasp.org/www-project-top-ten/)
- [CWE 25 大最危险软件弱点](https://cwe.mitre.org/top25/)
- [安全最佳实践](../../standards/security/)