---
name: security-audit
description: Audit code and dependencies for security vulnerabilities. Use when reviewing PRs, checking dependencies, preparing for deployment, or when user mentions security, vulnerabilities, or audit.
---
# 安全审计技能

对代码库执行全面的安全审计，在漏洞进入生产环境之前将其识别出来。

## 何时使用此技能

- 用户提到 "security"、"audit"、"vulnerability"、"CVE"
- 在执行部署命令之前
- 在 PR 审查期间
- 用户询问依赖项时
- 定期安全检查

## 审计检查清单

### 1. 机密信息泄露

**检查是否存在硬编码的机密信息：**
```bash
# Search for common secret patterns
grep -rn "API_KEY\|SECRET\|TOKEN\|PASSWORD" --include="*.{js,ts,py,go,rb,java}" .
grep -rn "sk-\|pk_\|api_\|secret_" --include="*.{js,ts,py,go,rb,java}" .
```

**验证 .gitignore：**
```bash
# Ensure sensitive files are ignored
cat .gitignore | grep -E "\.env|secret|credential|\.pem|\.key"
```

**检查 git 历史中是否存在泄露的机密信息：**
```bash
# Search recent commits (requires git-secrets or truffleHog)
git log -p --all -S "API_KEY" --since="30 days ago"
```

✅ 通过标准：
- 没有硬编码的 API 密钥、令牌或密码
- `.env` 文件已列入 `.gitignore`
- git 历史中没有机密信息

### 2. 依赖项漏洞

**Node.js：**
```bash
npm audit
# or
yarn audit
# or  
pnpm audit
```

**Python：**
```bash
pip-audit
# or
safety check
```

**Go：**
```bash
govulncheck ./...
```

**Rust：**
```bash
cargo audit
```

✅ 通过标准：
- 无严重级别漏洞
- 不存在超过 30 天未修复的高危漏洞
- 依赖项在最近 90 天内有过更新

### 3. 输入验证

**检查以下事项：**
- 用户输入在使用前已进行净化处理
- SQL 查询使用参数化语句
- 文件路径经过验证并实施了沙箱隔离
- HTML 内容在渲染前已转义
- 防范命令注入

**常见的易受攻击模式：**
```javascript
// BAD: SQL injection
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// GOOD: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

```python
# BAD: Command injection
os.system(f"convert {user_file}")

# GOOD: Use subprocess with list
subprocess.run(["convert", user_file], check=True)
```

### 4. 身份验证与授权

**检查以下事项：**
- 密码使用 bcrypt/argon2 进行哈希（而非 MD5/SHA1）
- 会话令牌为密码学安全的随机值
- 会话会适时过期
- 对改变状态的端点启用 CSRF 保护
- 对身份验证端点实施速率限制
- 多次登录失败后锁定账户

**查找以下内容：**
```javascript
// BAD: Weak hashing
crypto.createHash('md5').update(password)

// GOOD: Bcrypt
bcrypt.hash(password, 12)
```

### 5. HTTPS 与传输安全

**检查以下事项：**
- 强制使用 HTTPS（HSTS 头）
- Cookie 设置了安全标志（`Secure`、`HttpOnly`、`SameSite`）
- 无混合内容警告
- 要求 TLS 1.2 及以上版本

### 6. 错误处理

**检查以下事项：**
- 生产环境不暴露堆栈跟踪
- 向用户显示通用错误消息
- 详细错误仅记录在日志中
- 错误消息中不包含敏感数据

```javascript
// BAD: Exposes internals
res.status(500).send({ error: err.stack })

// GOOD: Generic message
res.status(500).send({ error: 'An unexpected error
