---
name: openclaw-traffic-guardian
version: 0.0.1-beta5
description: OpenClaw runtime traffic monitoring baseline for opt-in HTTP/HTTPS proxy inspection, egress detection, inbound injection detection, and social-account policy review.
homepage: https://clawsec.prompt.security
author: prompt-security
license: AGPL-3.0-or-later
clawdis:
  emoji: "TG"
  requires:
    bins: [node, python3]
---
# OpenClaw 流量防护

这是一个基线规范 skill。目前它有意不附带代理或运行时实现。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill openclaw-traffic-guardian -a openclaw -y
```

## 发布构件验证

对于独立安装，请在信任 `SKILL.md`、`skill.json` 或归档文件之前，验证已签名的发布清单。`skill.json` 文件是包元数据/SBOM 来源，发布流水线使用 ClawSec 发布密钥对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="openclaw-traffic-guardian"
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

只有在此验证成功后，才能安装或解压归档文件。

## 范围

构建者应将此 skill 用作 OpenClaw 运行时流量监控的落点：

- 以操作员为范围的 HTTP 代理检查
- 可选的 HTTPS 检查，以及按进程配置的 CA 信任
- 出站数据泄露检测
- 入站注入检测
- 对需审批的社交账号变更进行审查
- 脱敏的本地威胁日志
- 可选的 OpenClaw hook/status 集成

不要将此能力合并到 `clawsec-scanner`、`openclaw-audit-watchdog` 或 `soul-guardian` 中。这些 skill 具有不同的信任边界和安全契约。

## 安全契约

- 仅允许选择性启用。
- 默认仅检测并记录。
- 不自动安装系统 CA。
- 不修改全局 `HTTP_PROXY` 或 `HTTPS_PROXY`。
- 首个实现版本不进行阻断。
- 在写入日志或发送对话告警之前对机密信息进行脱敏。
- 将所有状态保存在 `OPENCLAW_TRAFFIC_GUARDIAN_HOME` 或 `~/.openclaw/security/clawsec/traffic-guardian` 下。

## 构建者入口

实现前请先阅读 `SPEC.md`。按以下方式使用占位文件夹：

| 路径 | 预期用途 |
|---|---|
| `lib/` | 检测规则、脱敏、事件模式、报告格式化 |
| `scripts/` | 启动、停止、状态、配置验证、日志查询辅助工具 |
| `hooks/openclaw-traffic-guardian-hook/` | 可选的 OpenClaw hook/status 集成 |
| `test/` | 单元测试、代理 fixture 测试、脱敏测试、进程范围测试 |

## 首个实现版本必须具备的行为

1. 在启动代理之前验证配置。
2. 以前台模式或明确的后台模式启动监控器。
3. 将代理环境变量限定在目标 OpenClaw 进程的范围内。
4. 在有界字节数限制内检查 HTTP 请求/响应文本。
5. 仅当操作员提供按进程配置的信任配置时，才支持可选的 HTTPS MITM。
6. 将匹配 `SPEC.md` 中 Outbound POLICY_REVIEW 条件的请求标记为需要操作员审查的发现，包括 TweetClaw 或其他 X/Twitter 自动化写入，以及在没有新的操作员审批标记的情况下由调度器/后台运行器重复执行的请求。
7. 从有界的请求元数据中检测重复执行/后台运行器上下文，例如路径、标头、user-agent、客户端上下文、工具调用元数据或调度器标识符。
8. 输出 JSONL 格式的发现，其中包含经过脱敏的片段，以及来源类型、变更类别、审批标记是否存在、直接操作员上下文与后台运行器上下文。
9. 提供一个 `status` 命令，用于报告模式、监听器、CA 指纹（如果存在）以及最近的发现。

## v0.0.1 实现范围之外

- 自动修改系统信任存储
- 透明网络拦截
- 默认阻断
- 将流量发送到外部服务
- 收集完整的请求/响应正文