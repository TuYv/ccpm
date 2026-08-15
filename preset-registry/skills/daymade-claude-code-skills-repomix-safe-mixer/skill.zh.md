---
name: repomix-safe-mixer
description: Safely package codebases with repomix by automatically detecting and removing hardcoded credentials before packing. Use when packaging code for distribution, creating reference packages, or when the user mentions security concerns about sharing code with repomix.
---
# Repomix 安全打包工具

## 概述

通过自动检测并移除硬编码凭据，使用 repomix 安全地打包代码库。

此 Skill 可防止使用 repomix 打包代码时意外泄露凭据。它会扫描硬编码的机密信息（API 密钥、数据库凭据、令牌），报告检测结果，并确保打包过程安全。

**适用场景**：使用 repomix 打包代码以供分发、创建可共享的参考包，或任何对代码中硬编码凭据存在安全顾虑的情况。

## 核心工作流

### 标准安全打包

使用此 Skill 的 `scripts/` 目录中的 `safe_pack.py` 执行完整工作流：扫描 → 报告 → 打包。

```bash
python3 scripts/safe_pack.py <directory>
```

**功能说明**：
1. 扫描目录中的硬编码凭据
2. 报告检测结果，并提供文件和行号详情
3. 如果发现机密信息，则阻止打包
4. 仅在扫描结果无异常时使用 repomix 打包

**示例**：
```bash
python3 scripts/safe_pack.py ./my-project
```

**未发现问题时的输出**：
```
🔍 Scanning ./my-project for hardcoded secrets...
✅ No secrets detected!
📦 Packing ./my-project with repomix...
✅ Packaging complete!
   Package is safe to distribute.
```

**发现机密信息时的输出**：
```
🔍 Scanning ./my-project for hardcoded secrets...
⚠️  Security Scan Found 3 Potential Secrets:

🔴 supabase_url: 1 instance(s)
   - src/client.ts:5
     Match: https://your-project-ref.supabase.co

❌ Cannot pack: Secrets detected!
```

### 选项

**自定义输出文件**：
```bash
python3 scripts/safe_pack.py \
  ./my-project \
  --output package.xml
```

**使用 repomix 配置**：
```bash
python3 scripts/safe_pack.py \
  ./my-project \
  --config repomix.config.json
```

**从扫描中排除匹配模式**：
```bash
python3 scripts/safe_pack.py \
  ./my-project \
  --exclude '.*test.*' '.*\.example'
```

**强制打包（危险，跳过扫描）**：
```bash
python3 scripts/safe_pack.py \
  ./my-project \
  --force  # ⚠️ NOT RECOMMENDED
```

## 独立机密信息扫描

使用此 Skill 的 `scripts/` 目录中的 `scan_secrets.py` 仅执行扫描（不进行打包）。

```bash
python3 scripts/scan_secrets.py <directory>
```

**使用场景**：
- 移除凭据后验证清理结果
- 提交前安全检查
- 审计现有代码库

**示例**：
```bash
python3 scripts/scan_secrets.py ./my-project
```

**用于程序化处理的 JSON 输出**：
```bash
python3 scripts/scan_secrets.py \
  ./my-project \
  --json
```

**排除匹配模式**：
```bash
python3 scripts/scan_secrets.py \
  ./my-project \
  --exclude '.*test.*' '.*example.*' '.*SECURITY_AUDIT\.md'
```

## 可检测的机密信息类型

扫描器可检测常见的凭据模式，包括：

**云服务提供商**：
- AWS 访问密钥（`AKIA...`）
- Cloudflare R2 账户 ID 和访问密钥
- Supabase 项目 URL 和匿名密钥

**API 密钥**：
- Stripe 密钥（`sk_live_...`、`pk_live_...`）
- OpenAI API 密钥（`sk-...`）
- Google Gemini API 密钥（`AIza...`）
- 通用 API 密钥

**身份验证**：
- JWT 令牌（`eyJ...`）
- OAuth 客户端机密
- 私钥（`-----BEGIN PRIVATE KEY-----`）
- Turnstile 密钥（`0x...`）

完整列表和模式请参阅 `references/common_secrets.md`。

## 处理检测到的密钥

发现密钥时：

### 步骤 1：审查发现项

检查每个发现项，确认它是真实凭据（而不是占位符或示例）。

### 步骤 2：替换为环境变量

**替换前**：
```javascript
const SUPABASE_URL = "https://your-project-ref.supabase.co";
const API_KEY = "<hardcoded-anon-key-DO-NOT-COMMIT>";
```

**替换后**：
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project-ref.supabase.co";
const API_KEY = import.meta.env.VITE_API_KEY || "your-api-key-here";

// Validation
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error("⚠️ Missing VITE_SUPABASE_URL environment variable");
}
```

### 步骤 3：创建 .env.example

```bash
# Example environment variables
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_API_KEY=your-api-key-here

# Instructions:
# 1. Copy this file to .env
# 2. Replace placeholders with real values
# 3. Never commit .env to version control
```

### 步骤 4：验证清理结果

再次运行扫描器，确认密钥已移除：
```bash
python3 scripts/scan_secrets.py ./my-project
```

### 步骤 5：安全打包

确认无误后，进行安全打包：
```bash
python3 scripts/safe_pack.py ./my-project
```

## 暴露后的处理措施

如果凭据已经暴露（例如已提交到 git 或公开分享）：

1. **立即轮换凭据** - 生成新的密钥/令牌
2. **撤销旧凭据** - 禁用已泄露的凭据
3. **审计使用情况** - 检查日志中是否存在未经授权的访问
4. **监控** - 为异常活动设置警报
5. **更新部署** - 使用新凭据部署代码
6. **记录事件** - 记录暴露的内容和已采取的措施

## 常见误报

扫描器会跳过常见的误报：

**占位符**：
- `your-api-key`, `example-key`, `placeholder-value`
- `<YOUR_API_KEY>`, `${API_KEY}`, `TODO: add key`

**测试/示例文件**：
- 与 `.*test.*`, `.*example.*`, `.*sample.*` 匹配的文件

**注释**：
- 以 `//`, `#`, `/*`, `*` 开头的行

**环境变量引用**（正确用法）：
- `process.env.API_KEY`
- `import.meta.env.VITE_API_KEY`
- `Deno.env.get('API_KEY')`

如有需要，可使用 `--exclude` 跳过其他模式。

## 与 Repomix 集成

此技能可与标准 repomix 配合使用：

**默认用法**（无配置）：
```bash
python3 scripts/safe_pack.py ./project
```

**使用 repomix 配置**：
```bash
python3 scripts/safe_pack.py \
  ./project \
  --config repomix.config.json
```

**自定义输出位置**：
```bash
python3 scripts/safe_pack.py \
  ./project \
  --output ~/Downloads/package-clean.xml
```

此技能会在安全验证后在内部运行 repomix，并传递配置和输出选项。

## 工作流示例

### 工作流 1：打包一个干净的项目

```bash
# Scan and pack in one command
python3 scripts/safe_pack.py \
  ~/workspace/my-project \
  --output ~/Downloads/my-project-package.xml
```

### 工作流 2：清理并打包含有密钥的项目

```bash
# Step 1: Scan to discover secrets
python3 scripts/scan_secrets.py ~/workspace/my-project

# Step 2: Review findings and replace credentials with env vars
# (Edit files manually or with automation)

# Step 3: Verify cleanup
python3 scripts/scan_secrets.py ~/workspace/my-project

# Step 4: Package safely
python3 scripts/safe_pack.py \
  ~/workspace/my-project \
  --output ~/Downloads/my-project-clean.xml
```

### 工作流 3：提交前审计

```bash
# Pre-commit hook: scan for secrets
python3 scripts/scan_secrets.py . --json

# Exit code 1 if secrets found (blocks commit)
# Exit code 0 if clean (allows commit)
```

## 资源

**参考资料**：
- `references/common_secrets.md` - 完整的凭据模式目录

**脚本**：
- `scripts/scan_secrets.py` - 独立的安全扫描器
- `scripts/safe_pack.py` - 完整的扫描 → 打包工作流

**相关技能**：
- `repomix-unmixer` - 从 repomix 包中提取文件
- `skill-creator` - 创建新的 Claude Code 技能

## 安全说明

此技能可检测常见模式，但可能无法发现所有类型的凭据。请始终：
- 手动审查检测结果
- 轮换已泄露的凭据
- 使用 .env.example 模板
- 验证环境变量
- 监控未经授权的访问

**不能替代**：CI/CD 中的密钥扫描、Git 历史记录扫描或全面的安全审计。