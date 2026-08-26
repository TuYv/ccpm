---
name: picoclaw-self-pen-testing
version: 0.0.5
description: Picoclaw-only local posture-review skill focused on read-only findings and safe operator remediation guidance.
homepage: https://clawsec.prompt.security
author: prompt-security
license: AGPL-3.0-or-later
picoclaw:
  emoji: "🦐"
  category: "security"
  requires:
    bins: [node]
  test_requires:
    bins: [node]
---
# Picoclaw 姿态审查（独立包）

用途：将 Picoclaw 姿态审查检查与更广泛的 guardian 包隔离，以便对敏感于审核的检查进行独立版本控制和发布。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill picoclaw-self-pen-testing -a openclaw -y
```

## 发布构件验证

对于独立安装，在信任 `SKILL.md`、`skill.json` 或归档文件之前，请验证已签名的发布清单。`skill.json` 文件是包元数据/SBOM 来源，发布流水线使用 ClawSec 发布密钥对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="picoclaw-self-pen-testing"
VERSION="0.0.5"
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

仅在此验证成功后安装或解压该归档。

## 范围

此技能仅针对现有的 Picoclaw 安全态势配置文件执行本地、只读的态势审查分析。

它会标记：
- 公共 Web UI 暴露
- 已禁用的 UI 身份验证
- 不受限制的工作区/工具
- 未签名验证模式
- MCP 信任边界审查需求
- 调度器持久化审查
- 明文机密标记
- 多通道身份验证审查

## 用法

```bash
node scripts/self_pen_test.mjs --profile ~/.picoclaw/security/clawsec/current-profile.json
```

## 验证

```bash
python utils/validate_skill.py skills/picoclaw-self-pen-testing
node skills/picoclaw-self-pen-testing/test/self_pen_test.test.mjs
```