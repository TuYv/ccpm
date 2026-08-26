---
name: clawsec-nanoclaw
version: 0.0.10
description: Use when checking for security vulnerabilities in NanoClaw skills, before installing new skills, or when asked about security advisories affecting the bot
---
# NanoClaw 的 ClawSec

安全公告监控，保护你的 WhatsApp 机器人免受技能和依赖项中的已知漏洞影响。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill clawsec-nanoclaw -a openclaw -y
```

## 概述

ClawSec 提供 MCP 工具，用于根据精选的安全公告源检查已安装的技能。它可以阻止安装存在漏洞的技能，提供可利用性上下文以便进行分诊，并提醒你注意现有技能中的问题。

**核心原则：** 安装前进行检查。监控正在运行的内容。

## 使用时机

在以下情况下使用 ClawSec 工具：
- 安装新技能（先检查安全性）
- 用户询问“我的技能安全吗？”
- 调查可疑行为
- 定期安全审计
- 收到安全通知后

不要用于：
- 代码审查（使用其他工具）
- 性能问题（这是不同的问题）
- 一般调试

## 可用的 MCP 工具

### 安装前检查

```typescript
// Before installing any skill
const safety = await tools.clawsec_check_skill_safety({
  skillName: 'new-skill',
  skillVersion: '1.0.0'  // optional
});

if (!safety.safe) {
  // Show user the risks before proceeding
  console.warn(`Security issues: ${safety.advisories.map(a => a.id)}`);
}
```

### 安全审计

```typescript
// Check all installed skills (defaults to ~/.claude/skills in the container)
const result = await tools.clawsec_check_advisories({
  installRoot: '/home/node/.claude/skills'  // optional
});

if (result.matches.some((m) =>
  m.advisory.severity === 'critical' || m.advisory.exploitability_score === 'high'
)) {
  // Alert user immediately
  console.error('Urgent advisories found!');
}
```

### 浏览公告

```typescript
// List advisories with filters
const advisories = await tools.clawsec_list_advisories({
  severity: 'high',               // optional
  exploitabilityScore: 'high'     // optional
});
```

## 快速参考

| 任务 | 工具 | 关键参数 |
|------|------|---------------|
| 安装前检查 | `clawsec_check_skill_safety` | `skillName` |
| 审计所有技能 | `clawsec_check_advisories` | `installRoot`（可选） |
| 浏览源 | `clawsec_list_advisories` | `severity`、`type`、`exploitabilityScore`（可选） |
| 验证软件包签名 | `clawsec_verify_skill_package` | `packagePath` |
| 刷新公告缓存 | `clawsec_refresh_cache` | （无） |
| 检查文件完整性 | `clawsec_check_integrity` | `mode`、`autoRestore`（可选） |
| 批准文件更改 | `clawsec_approve_change` | `path` |
| 查看基线状态 | `clawsec_integrity_status` | `path`（可选） |
| 验证审计日志 | `clawsec_verify_audit` | （无） |

## 常见模式

### 模式 1：安全安装技能

```typescript
// ALWAYS check before installing
const safety = await tools.clawsec_check_skill_safety({
  skillName: userRequestedSkill
});

if (safety.safe) {
  // Proceed with installation
  await installSkill(userRequestedSkill);
} else {
  // Show user the risks and get confirmation
  await showSecurityWarning(safety.advisories);
  if (await getUserConfirmation()) {
    await installSkill(userRequestedSkill);
  }
}
```

### 模式 2：定期安全检查

```typescript
// Add to scheduled tasks
schedule_task({
  prompt: "Check advisories using clawsec_check_advisories and alert when critical or high-exploitability matches appear",
  schedule_type: "cron",
  schedule_value: "0 9 * * *"  // Daily at 9am
});
```

### 模式 3：用户安全查询

```
用户：“我的 skills 安全吗？”

你：我会检查已安装的 skills 是否存在已知漏洞。
[Use clawsec_check_advisories]

响应：
✅ 未发现紧急问题。
- 2 个低严重性/低可利用性的安全通告
- 所有 skills 均为最新版本
```

## 常见错误

### ❌ 未检查就安装
```typescript
// DON'T
await installSkill('untrusted-skill');
```

```typescript
// DO
const safety = await tools.clawsec_check_skill_safety({
  skillName: 'untrusted-skill'
});
if (safety.safe) await installSkill('untrusted-skill');
```

### ❌ 忽略可利用性上下文
```typescript
// DON'T: Use severity only
if (advisory.severity === 'high') {
  notifyNow(advisory);
}
```

```typescript
// DO: Use exploitability + severity
if (
  advisory.exploitability_score === 'high' ||
  advisory.severity === 'critical'
) {
  notifyNow(advisory);
}
```

### ❌ 跳过严重性为 critical 的问题
```typescript
// DON'T: Ignore high exploitability in medium severity advisories
if (advisory.severity === 'critical') alert();
```

```typescript
// DO: Prioritize exploitability and severity together
if (advisory.exploitability_score === 'high' || advisory.severity === 'critical') {
  // Alert immediately
}
```

## 实现细节

**Feed Source**: https://clawsec.prompt.security/advisories/feed.json

此签名 feed 为汇总 feed。NanoClaw 通过同一个默认 URL 接收 NVD CVE、经批准的社区安全通告，以及不带 CVE 的临时 GHSA 安全通告。

**Update Frequency**: 每 6 小时（自动）

**Signature Verification**: Ed25519 签名 feed
**Package Verification Policy**: 仅限固定密钥，限制 package/signature 路径

**Cache Location**: `/workspace/project/data/clawsec-advisory-cache.json`

参见 [INSTALL.md](./INSTALL.md) 了解设置方法，参见 [docs/](./docs/) 了解高级用法。

## 实际影响

- 防止安装存在已知 RCE 漏洞的 skills
- 针对依赖项中的供应链攻击发出警报
- 提供可执行的修复步骤
- 零误报（仅使用经过整理的 feed）

## 发布产物验证

对于独立安装，请先验证签名的发布清单，再信任 `SKILL.md`、`skill.json` 或压缩包。`skill.json` 文件是软件包元数据/SBOM 的来源，而发布流水线使用 ClawSec release key 对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="clawsec-nanoclaw"
VERSION="0.0.10"
REPO="prompt-security/clawsec"
TAG="${SKILL_NAME}-v${VERSION}"
BASE="https://github.com/${REPO}/releases/download/${TAG}"
ZIP_NAME="${SKILL_NAME}-v${VERSION}.zip"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

RELEASE_PUBKEY_SHA256="711424e4535f84093fefb024cd1ca4ec87439e53907b305b79a631d5befba9c8"

curl -fsSL "$BASE/checksums.json" -o "$TMP_DIR/checksums.json"
curl -fsSL "$BASE/checksums.sig" -o "$TMP_DIR/checksums.sig"
curl -fsSL "$BASE/signing-public.pem" -o "$TMP_DIR/signing-public.pem"
curl -fsSL "$BASE/$ZIP_NAME" -o "$TMP_DIR/$ZIP_NAME"
curl -fsSL "$BASE/SKILL.md" -o "$TMP_DIR/SKILL.md"
curl -fsSL "$BASE/skill.json" -o "$TMP_DIR/skill.json"

ACTUAL_PUBKEY_SHA256="$(openssl pkey -pubin -in "$TMP_DIR/signing-public.pem" -outform DER | shasum -a 256 | awk '{print $1}')"
if [ "$ACTUAL_PUBKEY_SHA256" != "$RELEASE_PUBKEY_SHA256" ]; then
  echo "ERROR: signing-public.pem fingerprint mismatch" >&2
  exit 1
fi

openssl base64 -d -A -in "$TMP_DIR/checksums.sig" -out "$TMP_DIR/checksums.sig.bin"
openssl pkeyutl -verify -rawin -pubin \
  -inkey "$TMP_DIR/signing-public.pem" \
  -sigfile "$TMP_DIR/checksums.sig.bin" \
  -in "$TMP_DIR/checksums.json" >/dev/null

hash_file() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    sha256sum "$1" | awk '{print $1}'
  fi
}

verify_manifest_file() {
  asset="$1"
  path="$2"
  expected="$(jq -r --arg asset "$asset" '.files[$asset].sha256 // empty' "$TMP_DIR/checksums.json")"
  if [ -z "$expected" ]; then
    echo "ERROR: checksums.json missing $asset" >&2
    exit 1
  fi
  actual="$(hash_file "$path")"
  if [ "$actual" != "$expected" ]; then
    echo "ERROR: checksum mismatch for $asset" >&2
    exit 1
  fi
}

expected_archive="$(jq -r '.archive.sha256 // empty' "$TMP_DIR/checksums.json")"
if [ -z "$expected_archive" ]; then
  echo "ERROR: checksums.json missing archive.sha256" >&2
  exit 1
fi
actual_archive="$(hash_file "$TMP_DIR/$ZIP_NAME")"
if [ "$actual_archive" != "$expected_archive" ]; then
  echo "ERROR: archive checksum mismatch" >&2
  exit 1
fi

verify_manifest_file "SKILL.md" "$TMP_DIR/SKILL.md"
verify_manifest_file "skill.json" "$TMP_DIR/skill.json"

echo "Signed release manifest, archive, SKILL.md, and skill.json verified."
```

仅在此验证成功后安装或解压压缩包。