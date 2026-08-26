---
name: picoclaw-traffic-guardian
version: 0.0.1-beta5
description: Picoclaw runtime traffic monitoring baseline for lightweight AI gateway proxy inspection, egress detection, and posture integration.
homepage: https://clawsec.prompt.security
author: prompt-security
license: AGPL-3.0-or-later
picoclaw:
  emoji: "TG"
  requires:
    bins: [node, python3]
---
# Picoclaw Traffic Guardian

这是一项基线规范技能。目前尚未附带代理或运行时实现。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill picoclaw-traffic-guardian -a openclaw -y
```

## Release Artifact Verification

对于独立安装，请先验证已签名的 release manifest，然后再信任 `SKILL.md`、`skill.json` 或归档文件。`skill.json` 文件是软件包元数据/SBOM 来源，release pipeline 使用 ClawSec release key 对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="picoclaw-traffic-guardian"
VERSION="0.0.1-beta5"
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

只有在此验证成功后，才能安装或解压该归档文件。

## 范围

构建者应将此 skill 用作 Picoclaw 运行时流量监控的落地区域：

- 轻量级 AI 网关 HTTP 代理检查
- 可选的 HTTPS 检查，使用按进程配置的 CA 信任
- 出站数据外泄检测
- 入站注入检测
- 脱敏的本地威胁日志
- 为 `picoclaw-security-guardian` 导出配置文件

不要将代理运行时所有权添加到 `picoclaw-security-guardian` 或 `picoclaw-self-pen-testing`。这些 skill 应对该监控器的状态进行配置分析、漂移检查或审查，而不是运行它。

## 安全契约

- 仅允许选择启用。
- 默认仅检测并记录。
- 不自动安装系统 CA。
- 不修改全局代理环境。
- 首个实现中不进行阻断。
- 在日志、摘要或配置文件输出之前脱敏机密信息。
- 将所有状态保存在 `PICOCLAW_TRAFFIC_GUARDIAN_HOME` 或 `$PICOCLAW_HOME/security/clawsec/traffic-guardian` 下。

## 构建者入口

实现前阅读 `SPEC.md`。按如下方式使用占位文件夹：

| 路径 | 预期用途 |
|---|---|
| `lib/` | 检测器规则、脱敏、配置文件导出、报告格式化 |
| `scripts/` | 启动、停止、状态、配置验证、日志查询、配置文件导出辅助工具 |
| `test/` | 单元测试、代理 fixture 测试、脱敏测试、配置文件集成测试 |

## 首个实现的必需行为

1. 在不启动代理的情况下验证配置。
2. 在前台或显式后台模式下启动监控器。
3. 将代理环境变量的作用范围限定为目标 Picoclaw 网关进程。
4. 在有界字节数限制内检查 HTTP 请求/响应文本。
5. 仅当操作员提供按进程配置的信任配置时，才支持可选的 HTTPS MITM。
6. 输出包含脱敏片段的 JSONL 发现结果。
7. 导出一个小型配置文件片段，供 `picoclaw-security-guardian` 纳入确定性安全态势配置文件。

## v0.0.1 实现范围之外的内容

- 自动修改系统信任存储
- 透明网络拦截
- 默认阻断
- 将流量发送到外部服务
- 收集完整的请求/响应正文