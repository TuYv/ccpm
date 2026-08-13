---
name: secret-scanner
description: Detect exposed secrets, API keys, credentials, and tokens in code. Use before commits, on file saves, or when security is mentioned. Prevents accidental secret exposure. Triggers on file changes, git commits, security checks, .env file modifications.
allowed-tools: Read, Grep
---
# 密钥扫描器 Skill

防止代码库中的密钥意外泄露。

## 何时激活

- ✅ Git 提交之前
- ✅ 文件被修改/保存时
- ✅ 用户提及密钥、API 密钥或凭据时
- ✅ .env 文件被更改时
- ✅ 配置文件被修改时

## 检测内容

### API 密钥和令牌
- AWS 访问密钥（AKIA...）
- Stripe API 密钥（sk_live_...、pk_live_...）
- GitHub 令牌（ghp_...）
- Google API 密钥
- OAuth 令牌
- JWT 密钥

### 数据库凭据
- 数据库连接字符串
- MySQL/PostgreSQL 密码
- MongoDB 连接 URI
- Redis 密码

### 私钥
- SSH 私钥
- RSA/DSA 密钥
- PGP/GPG 密钥
- SSL 证书

### 身份验证密钥
- 密码变量
- 身份验证令牌
- 会话密钥
- 加密密钥

## 警报示例

### API 密钥检测
```javascript
// You type:
const apiKey = 'sk_live_1234567890abcdef';

// I immediately alert:
🚨 CRITICAL: Exposed Stripe API key detected!
📍 File: config.js, Line 3
🔧 Fix: Use environment variables
  const apiKey = process.env.STRIPE_API_KEY;
📖 Add to .gitignore: .env
```

### AWS 凭据
```python
# You type:
aws_access_key = "AKIAIOSFODNN7EXAMPLE"

# I alert:
🚨 CRITICAL: AWS access key exposed!
📍 File: aws_config.py, Line 1
🔧 Fix: Use AWS credentials file or environment variables
  aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
📖 Never commit AWS credentials
```

### 数据库密码
```yaml
# You type in docker-compose.yml:
environment:
  DB_PASSWORD: "mySecretPassword123"

# I alert:
🚨 CRITICAL: Database password in configuration file!
📍 File: docker-compose.yml, Line 5
🔧 Fix: Use .env file
  DB_PASSWORD: ${DB_PASSWORD}
📖 Add .env to .gitignore
```

## 检测模式

### 模式类型

**高置信度：**
- 已知的 API 密钥格式（Stripe、AWS 等）
- 私钥标头
- JWT 令牌
- 包含凭据的连接字符串

**中等置信度：**
- 名为 "password"、"secret"、"key" 的变量
- 敏感上下文中的 Base64 编码字符串
- 赋值语句中的长随机字符串

**低置信度（标记以供审查）：**
- 通用密钥模式
- 注释中的潜在凭据

## Git 集成

### 提交前保护

```bash
# Before commit, I scan:
git add .
git commit

# I block if secrets found:
🚨 CRITICAL: Cannot commit - secrets detected!
📍 3 secrets found:
  - config.js:12 - API key
  - .env:5 - Database password (in gitignore - OK)
  - auth.js:45 - JWT secret

❌ Commit blocked - remove secrets first
```

### .gitignore 验证

检查敏感文件是否位于 .gitignore 中：

```
✅ .env - In .gitignore (good)
⚠️ config/secrets.json - NOT in .gitignore (add it!)
✅ .aws/credentials - In .gitignore (good)
```

## 误报处理

### 示例文件
```javascript
// I understand these are examples:
// Example: const apiKey = 'your_api_key_here';
// TODO: Add your API key from environment
```

### 测试文件
```javascript
// Test fixtures are OK (but flagged for review):
const mockApiKey = 'sk_test_1234567890abcdef';  // ✅ Test key
```

### 文档
```markdown
<!-- Documentation examples are flagged but low priority -->
Set your API key: `export API_KEY=your_key_here`
```

## 与 security-auditor 的关系

**secret-scanner（我）：** 暴露的密钥和凭据  
**security-auditor：** 代码漏洞模式

### 协同使用
```
secret-scanner: Finds hardcoded API key
security-auditor: Finds how the key is used insecurely
Combined: Complete security picture
```

## 快速修复

### 迁移到环境变量

```javascript
// Before:
const apiKey = 'sk_live_abc123';

// After:
const apiKey = process.env.API_KEY;

// .env file (add to .gitignore):
API_KEY=sk_live_abc123
```

### 使用密钥管理

```javascript
// AWS Secrets Manager
const AWS = require('aws-sdk');
const secrets = new AWS.SecretsManager();
const secret = await secrets.getSecretValue({ SecretId: 'myApiKey' }).promise();
```

### 配置文件

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - API_KEY=${API_KEY}  # From .env file

# .env (gitignored)
API_KEY=sk_live_abc123
```

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是（推荐）  
**可在沙箱中运行：** ✅ 是

- **文件系统**：只读访问
- **网络**：无需网络
- **配置**：无需配置

## 自定义

添加公司特定的密钥模式：

```bash
cp -r ~/.claude/skills/security/secret-scanner \
      ~/.claude/skills/security/company-secret-scanner

# Edit SKILL.md to add:
# - Internal API key formats
# - Company-specific secret patterns
# - Custom detection rules
```

## 最佳实践

1. **绝不要提交密钥** - 使用环境变量
2. **使用 .gitignore** - 添加 .env、secrets.json 等
3. **轮换暴露的密钥** - 如果已经提交，立即轮换
4. **使用密钥管理** - AWS Secrets Manager、HashiCorp Vault
5. **定期审计** - 检查代码中是否存在暴露的密钥

## 应急响应

### 如果密钥已被提交

1. **立即轮换密钥**
2. **从 git 历史记录中移除**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config/secrets.json" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **强制推送**（与团队协调）
4. **使用新密钥更新所有部署**

## 相关工具

- **security-auditor skill**：漏洞检测
- **@code-reviewer sub-agent**：安全审查
- **/review command**：全面的安全检查