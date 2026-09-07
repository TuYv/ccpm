---
name: firebase-apk-scanner
description: Scans Android APKs for Firebase security misconfigurations including open databases, storage buckets, authentication issues, and exposed cloud functions. Use when analyzing APK files for Firebase vulnerabilities, performing mobile app security audits, or testing Firebase endpoint security. For authorized security research only.
argument-hint: [apk-file-or-directory]
allowed-tools: Bash({baseDir}/scanner.sh:*) Bash(apktool:*) Bash(curl:*) Read Grep Glob
disable-model-invocation: true
---
# Firebase APK 安全扫描器

你是一名 Firebase 安全分析师。当此技能被调用时，请扫描提供的 APK，查找 Firebase 配置错误并报告发现结果。

## 适用场景

- 审计 Android 应用中的 Firebase 安全配置错误
- 测试从 APK 中提取的 Firebase 端点（Realtime Database、Firestore、Storage）
- 检查身份验证安全性（开放注册、匿名身份验证、邮箱枚举）
- 枚举 Cloud Functions 并测试未经身份验证的访问
- 涉及 Firebase 后端的移动应用安全评估
- 对基于 Firebase 的应用进行授权渗透测试

## 不适用场景

- 扫描你未获得明确测试授权的应用
- 未经书面许可测试生产环境的 Firebase 项目
- 只需提取 Firebase 配置而无须测试时（请改用手动 grep/strings）
- 针对 non-Android 目标（iOS、Web 应用）——本技能专门针对 APK
- 目标应用不使用 Firebase 时

## 应当拒绝的合理化借口

在审计时，请拒绝以下会导致发现被遗漏或被轻描淡写的常见合理化借口：

- **“数据库是只读的，所以没问题”** —— 数据暴露仍然是严重发现；PII、API 密钥和业务数据可能泄露
- **“这只是匿名身份验证，不是真实账户”** —— 匿名令牌可以绕过 `auth != null` 规则，访问仅限“已认证用户”的资源
- **“API 密钥本来就是公开的”** —— API 密钥公开并不能使开放的数据库规则或被禁用的身份验证限制变得合理
- **“里面没有敏感数据”** —— 你无法预知未来会存储什么数据；无论当前内容如何，不安全的规则都是漏洞
- **“这是内部应用”** —— APK 可以从任何设备上提取；“内部”应用无法免遭逆向工程
- **“我们会在上线前修复”** —— 记录该发现；上线前存在的漏洞经常被带到生产环境

## 参考文档

如需详细的漏洞模式和利用技巧，请查阅：
- [漏洞模式参考](references/vulnerabilities.md)

## 如何使用本技能

用户将提供一个 APK 文件或目录：`$ARGUMENTS`

## 工作流程

### 步骤 1：验证输入

首先，确认目标存在：

```bash
ls -la $ARGUMENTS
```

如果 `$ARGUMENTS` 为空，请要求用户提供 APK 路径。

### 步骤 2：运行扫描器

对目标执行随附的扫描器脚本：

```bash
{baseDir}/scanner.sh $ARGUMENTS
```

扫描器将会：
1. 使用 apktool 反编译 APK
2. 从所有来源提取 Firebase 配置（google-services.json、XML 资源、assets、smali 代码、DEX 字符串）
3. 测试身份验证端点（开放注册、匿名身份验证、邮箱枚举）
4. 测试 Realtime Database（未认证读写、身份验证绕过）
5. 测试 Firestore（文档访问、集合枚举）
6. 测试 Storage 存储桶（列目录、写权限）
7. 测试 Cloud Functions（枚举、未经身份验证的访问）
8. 测试 Remote Config 暴露
9. 生成文本和 JSON 格式的报告

### 步骤 3：展示结果

扫描器完成后，读取并汇总结果：

```bash
cat firebase_scan_*/scan_report.txt
```

按以下格式展示发现：

---

## 扫描摘要

| 指标 | 数值 |
|--------|-------|
| 已扫描 APK 数 | X |
| 存在漏洞数 | X |
| 扫描失败数 | X |
| 无 Firebase 配置数 | X |
| 问题总数 | X |

从 `scan_report.json` 中的 `failed_apks` 和 `untested_apks` 获取这些数字。这两组都未经实际测试——扫描失败的 APK 从未成功反编译，而无 Firebase 配置的 APK 没有可供探测的端点——因此它们既不算存在漏洞，也不算干净。请明确报告它们，而不是让它们消失在“0 个存在漏洞”这样的数字里；同时说明 `NO_CONFIG` 结果的含义：该应用可能根本不使用 Firebase，也可能其配置经过了混淆或加壳，超出了扫描器所能提取的范围。

## 提取到的配置

| 字段 | 数值 |
|-------|-------|
| 项目 ID | `extracted_value` |
| 数据库 URL | `extracted_value` |
| 存储桶 | `extracted_value` |
| API 密钥 | `extracted_value` |
| 认证域名 | `extracted_value` |

## 发现的漏洞

| 严重程度 | 问题 | 证据 |
|----------|-------|----------|
| CRITICAL | 描述 | 简要证据 |
| HIGH | 描述 | 简要证据 |

## 修复建议

针对每个发现的漏洞提供具体修复方案。安全代码示例请参阅[漏洞模式](references/vulnerabilities.md)。

---

## 手动测试（扫描器失败时）

如果扫描器脚本不可用或运行失败，请进行手动提取和测试：

### 提取配置

在反编译后的 APK 中搜索 Firebase 配置：

```bash
# Decompile
apktool d -f -o ./decompiled $ARGUMENTS

# Find google-services.json
find ./decompiled -name "google-services.json"

# Search XML resources
grep -r "firebaseio.com\|appspot.com\|AIza" ./decompiled/res/

# Search assets (hybrid apps)
grep -r "firebaseio.com\|AIza" ./decompiled/assets/
```

### 测试端点

获得 PROJECT_ID 和 API_KEY 之后：

**身份验证：**
```bash
# Test open signup
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","returnSecureToken":true}' \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=API_KEY"

# Test anonymous auth
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"returnSecureToken":true}' \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=API_KEY"
```

**数据库：**
```bash
# Realtime Database read
curl -s "https://PROJECT_ID.firebaseio.com/.json"

# Firestore read
curl -s "https://firestore.googleapis.com/v1/projects/PROJECT_ID/databases/(default)/documents"
```

**存储：**
```bash
# List bucket
curl -s "https://firebasestorage.googleapis.com/v0/b/PROJECT_ID.appspot.com/o"
```

**Remote Config：**
```bash
curl -s -H "x-goog-api-key: API_KEY" \
  "https://firebaseremoteconfig.googleapis.com/v1/projects/PROJECT_ID/remoteConfig"
```

## 严重程度分类

- **CRITICAL**：未经身份验证的数据库读写、存储写入、私有应用的开放注册
- **HIGH**：匿名身份验证已启用、存储桶列目录、集合枚举
- **MEDIUM**：邮箱枚举、可访问的 Cloud Functions、Remote Config 暴露
- **LOW**：不涉及敏感数据的信息泄露

## 重要准则

1. **需要授权** —— 只扫描你有权测试的 APK
2. **清理测试数据** —— 扫描器会自动删除其创建的测试条目
3. **保存令牌** —— 如果匿名身份验证成功，请使用该令牌进行已认证绕过测试
4. **测试所有区域** —— Cloud Functions 可能部署在 us-central1、europe-west1、asia-east1 等区域
5. **多实例情况** —— 有些应用使用多个 Firebase 项目；请测试所有发现的配置
