---
name: insecure-defaults
description: "Detects fail-open insecure defaults (hardcoded secrets, weak auth, permissive security) that allow apps to run insecurely in production. Use when auditing security, reviewing config management, or analyzing environment variable handling."
allowed-tools: Read Grep Glob Bash
---
# 不安全默认值检测

发现应用在缺少配置时仍以不安全方式运行的**故障开放**（fail-open）漏洞。区分可被利用的默认值与能够安全崩溃的故障关闭模式。

- **故障开放（CRITICAL）：** `SECRET = env.get('KEY') or 'default'` → 应用以弱密钥运行
- **故障关闭（SAFE）：** `SECRET = env['KEY']` → 缺失时应用崩溃

## 适用场景

- 对生产应用进行**安全审计**（认证、加密、API 安全）
- 对部署文件、IaC 模板、Docker 配置进行**配置审查**
- 对环境变量处理和密钥管理进行**代码审查**
- 部署前对硬编码凭证或弱默认值进行**检查**

## 不适用场景

不要在以下情况下使用本技能：
- 明确限定于测试环境的**测试夹具**（`test/`、`spec/`、`__tests__/` 目录下的文件）
- **示例/模板文件**（带有 `.example`、`.template`、`.sample` 后缀）
- **仅用于开发的工具**（本地开发用 Docker Compose、调试脚本）
- README.md 或 docs/ 目录中的**文档示例**
- 部署时会被替换的**构建期配置**
- 缺少正确配置时应用无法启动的**缺失即崩溃**行为（故障关闭）

拿不准时：追踪代码路径，判断应用是带着默认值运行还是直接崩溃。

## 应当驳回的辩解理由

- **“这只是开发环境的默认值”** → 只要出现在生产代码中，就是一条发现
- **“生产配置会覆盖它”** → 验证生产配置是否存在；若不存在，代码层面的漏洞依然成立
- **“没有正确配置这段代码根本不会运行”** → 用代码追踪来证明；很多应用会静默失败
- **“它位于认证之后”** → 纵深防御；被攻陷的会话依然可以利用弱默认值
- **“发布前我们会修好”** → 现在就记录；“以后”往往不会来

## 工作流程

对每一条潜在发现都遵循此工作流程：

### 1. SEARCH：进行项目探索并查找不安全默认值

确定语言、框架和项目约定。利用这些信息进一步发现诸如密钥存储位置、密钥使用模式、带凭证的第三方集成、加密方式以及其他相关配置。再利用这些信息分析不安全的默认配置。

**示例**
在 `**/config/`、`**/auth/`、`**/database/` 以及环境变量文件中搜索以下模式：
- **回退密钥：** `getenv.*\) or ['"]`、`process\.env\.[A-Z_]+ \|\| ['"]`、`ENV\.fetch.*default:`
- **硬编码凭证：** `password.*=.*['"][^'"]{8,}['"]`、`api[_-]?key.*=.*['"][^'"]+['"]`
- **弱默认值：** `DEBUG.*=.*true`、`AUTH.*=.*false`、`CORS.*=.*\*`
- **加密算法：** 安全场景中的 `MD5|SHA1|DES|RC4|ECB`

根据探索结果调整搜索策略。

关注可触达生产的代码，而非测试夹具或示例文件。

### 2. VERIFY：实际行为
对每一处匹配，追踪代码路径以理解运行时行为。

**需要回答的问题：**
- 这段代码何时执行？（启动时还是运行时）
- 如果缺少某个配置变量会发生什么？
- 是否存在强制执行安全配置的校验？

### 3. CONFIRM：生产影响
判断该问题是否会触达生产：

若生产配置提供了该变量 → 严重性降低（但仍属于代码层面的漏洞）
若生产配置缺失或使用默认值 → CRITICAL

### 4. REPORT：附带证据

**示例报告：**
```
Finding: Hardcoded JWT Secret Fallback
Location: src/auth/jwt.ts:15
Pattern: const secret = process.env.JWT_SECRET || 'default';

Verification: App starts without JWT_SECRET; secret used in jwt.sign() at line 42
Production Impact: Dockerfile missing JWT_SECRET
Exploitation: Attacker forges JWTs using 'default', gains unauthorized access
```

## 快速验证清单

**回退密钥：** `SECRET = env.get(X) or Y`
→ 验证：缺少环境变量时应用仍能启动？密钥用于加密/认证？
→ 跳过：测试夹具、示例文件

**默认凭证：** 硬编码的 `username`/`password` 对
→ 验证：在已部署配置中生效？没有运行时覆盖？
→ 跳过：已禁用的账号、文档示例

**故障开放的安全机制：** `AUTH_REQUIRED = env.get(X, 'false')`
→ 验证：默认值是否不安全（false/禁用/宽松）？
→ 安全：应用崩溃或默认值是安全的（true/启用/受限）

**弱加密算法：** 安全场景中的 MD5/SHA1/DES/RC4/ECB
→ 验证：用于密码、加密或令牌？
→ 跳过：校验和、非安全用途的哈希

**宽松访问：** CORS `*`、权限 `0777`、默认公开
→ 验证：默认值是否允许未授权访问？
→ 跳过：有正当理由且显式配置的宽松访问

**调试功能：** 堆栈跟踪、内省、详细错误信息
→ 验证：默认启用？在响应中暴露？
→ 跳过：仅用于日志、不对用户展示

详细示例与反例请参见 [examples.md](references/examples.md)。
