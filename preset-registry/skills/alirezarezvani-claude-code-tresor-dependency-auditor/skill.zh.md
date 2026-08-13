---
name: dependency-auditor
description: Check dependencies for known vulnerabilities using npm audit, pip-audit, etc. Use when package.json or requirements.txt changes, or before deployments. Alerts on vulnerable dependencies. Triggers on dependency file changes, deployment prep, security mentions.
allowed-tools: Bash, Read
---
# 依赖审计技能

自动检查依赖项漏洞。

## 我的激活时机

- ✅ 修改了 package.json
- ✅ 更改了 requirements.txt
- ✅ 修改了 Gemfile 或 pom.xml
- ✅ 用户提及依赖项或漏洞
- ✅ 部署之前
- ✅ yarn.lock 或 package-lock.json 发生更改

## 我检查的内容

### 依赖项漏洞
- 软件包中的已知 CVE
- 已有安全修复但尚未更新的依赖项
- 恶意软件包
- 许可证兼容性问题
- 已弃用的软件包

### 支持的包管理器
- **Node.js**：npm、yarn、pnpm
- **Python**：pip、pipenv、poetry
- **Ruby**：bundler
- **Java**：Maven、Gradle
- **Go**：go modules
- **PHP**：composer

## 警报示例

### NPM 漏洞

```bash
# You run: npm install lodash

# I automatically audit:
🚨 HIGH: Prototype Pollution in lodash
📍 Package: lodash@4.17.15
📦 Vulnerable versions: < 4.17.21
🔧 Fix: npm update lodash
📖 CVE-2020-8203
   https://nvd.nist.gov/vuln/detail/CVE-2020-8203

Recommendation: Update to lodash@4.17.21 or higher
```

### Python 漏洞

```bash
# You modify requirements.txt: django==2.2.0

# I alert:
🚨 CRITICAL: Multiple vulnerabilities in Django 2.2.0
📍 Package: Django@2.2.0
📦 Vulnerable versions: < 2.2.28
🔧 Fix: Update requirements.txt to Django==2.2.28
📖 CVEs: CVE-2021-33203, CVE-2021-33571

Affected: SQL injection, XSS vulnerabilities
Recommendation: Update immediately to Django@2.2.28+
```

### 多个漏洞

```bash
# After npm install:
🚨 Dependency audit found 8 vulnerabilities:
  - 3 CRITICAL
  - 2 HIGH
  - 2 MEDIUM
  - 1 LOW

Critical issues:
  1. axios@0.21.0 - SSRF vulnerability
     Fix: npm install axios@latest

  2. ajv@6.10.0 - Prototype pollution
     Fix: npm install ajv@^8.0.0

  3. node-fetch@2.6.0 - Information disclosure
     Fix: npm install node-fetch@^2.6.7

Run 'npm audit fix' to automatically fix 6/8 issues
```

## 自动操作

### 依赖项发生更改时

```yaml
1. Detect package manager (npm, pip, etc.)
2. Run security audit command
3. Parse vulnerability results
4. Categorize by severity
5. Suggest fixes
6. Flag breaking changes
```

### 审计命令

```bash
# Node.js
npm audit
npm audit --json  # Structured output

# Python
pip-audit
safety check

# Ruby
bundle audit

# Java (Maven)
mvn dependency-check:check
```

## 严重性分类

### 严重 🚨
- 远程代码执行
- SQL 注入
- 身份验证绕过
- 可公开利用

### 高危 ⚠️
- 跨站脚本攻击
- 拒绝服务
- 信息泄露
- 攻击面广

### 中危 📋
- 影响有限的漏洞
- 需要特定条件
- 难以利用

### 低危 💡
- 轻微的安全性改进
- 违反最佳实践
- 风险极低

## 修复策略

### 自动更新

```bash
# Safe automatic fixes
npm audit fix

# May include breaking changes
npm audit fix --force
```

### 手动更新

```bash
# Check what will change
npm outdated

# Update specific package
npm update lodash

# Major version update
npm install lodash@latest
```

### 替代软件包

```
Vulnerable: request@2.88.0 (deprecated)
Alternative: axios or node-fetch
Migration guide: [link]
```

## 与 CI/CD 集成

### 阻止部署

```yaml
# .github/workflows/security.yml
- name: Dependency audit
  run: |
    npm audit --audit-level=high
    # Fails if HIGH or CRITICAL found
```

### 定期审计

```yaml
# Weekly dependency check
on:
  schedule:
    - cron: '0 0 * * 0'
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm audit
```

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是
**可在沙箱中运行：** ⚙️ 需要访问 npm/pip 软件包注册表

**沙箱配置：**
```json
{
  "network": {
    "allowedDomains": [
      "registry.npmjs.org",
      "pypi.org",
      "rubygems.org",
      "repo.maven.apache.org"
    ]
  }
}
```

## 许可证检查

我还会检查许可证兼容性：

```
⚠️ License issue: GPL-3.0 package in commercial project
📦 Package: some-gpl-package@1.0.0
📖 GPL-3.0 requires source code disclosure
🔧 Consider: Find MIT/Apache-2.0 alternative
```

## 最佳实践

1. **定期审计**：每周或每次依赖项发生变更时运行审计
2. **频繁更新**：保持依赖项为最新版本
3. **审查破坏性变更**：进行重大更新前先测试
4. **固定版本**：在生产环境中使用精确版本
5. **审计锁定文件**：提交并审计锁定文件

## 相关工具

- **security-auditor skill**：代码漏洞检测
- **@architect sub-agent**：依赖项策略
- **/review command**：部署前安全检查