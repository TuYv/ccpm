---
name: nanoclaw-traffic-guardian
version: 0.0.1-beta5
description: NanoClaw runtime traffic monitoring baseline for host-side proxy inspection with container-safe MCP and IPC status surfaces.
homepage: https://clawsec.prompt.security
author: prompt-security
license: AGPL-3.0-or-later
nanoclaw:
  requires:
    node: ">=18.0.0"
---
# NanoClaw 流量守护

这是一个基线规范 skill。当前暂不随附代理或运行时实现。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill nanoclaw-traffic-guardian -a openclaw -y
```

## Release Artifact 验证

对于独立安装，请在信任 `SKILL.md`、`skill.json` 或归档文件之前，验证已签名的 release manifest。`skill.json` 文件是包元数据/SBOM 来源，release pipeline 使用 ClawSec release key 对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="nanoclaw-traffic-guardian"
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

只有在此验证成功后，才能安装或提取归档文件。

## 范围

构建者应将此 skill 用作 NanoClaw 运行时流量监控的接入基础：

- 宿主机侧 HTTP 代理检查
- 使用由宿主机持有的 CA 材料进行可选的 HTTPS 检查
- 出站数据泄露检测
- 入站注入检测
- 脱敏的本地威胁日志
- 用于状态、发现结果和配置检查的 MCP 工具
- 用于容器安全地与宿主机通信的 IPC 处理程序

优先将其作为 `clawsec-nanoclaw` 的可选伴侣，而不是现有 advisory/signature/integrity 套件的强制扩展。

## 安全契约

- 仅支持选择性启用。
- 默认仅检测并记录。
- 不自动安装系统 CA。
- 不允许容器访问 CA 私钥。
- 第一版实现不进行阻断。
- 在写入日志或返回 MCP 响应之前脱敏机密。
- 将所有状态保存在 `NANOCLAW_TRAFFIC_GUARDIAN_HOME` 或由宿主机管理的 NanoClaw 安全数据目录下。

## 构建入口

实现前请阅读 `SPEC.md`。按以下方式使用占位文件夹：

| 路径 | 预期用途 |
|---|---|
| `lib/` | 检测规则、脱敏、类型、报告格式化 |
| `host-services/` | 宿主机侧代理生命周期、日志访问、IPC 处理程序 |
| `mcp-tools/` | 容器侧用于状态和发现结果的 MCP 工具 |
| `test/` | 单元测试、主机/容器 IPC 测试、脱敏测试 |

## 首次实现必须具备的行为

1. 在启动代理之前验证配置。
2. 通过由宿主机管理的生命周期路径启动监控器。
3. 将 CA 密钥材料保留在宿主机侧。
4. 在有界字节数限制内检查 HTTP 请求/响应文本。
5. 仅当操作员提供每个运行时的信任配置时，才支持可选的 HTTPS MITM。
6. 输出包含脱敏片段的 JSONL 发现结果。
7. 提供仅返回状态和脱敏发现结果的 MCP 工具。

## v0.0.1 实现不在范围内的内容

- 自动修改系统信任存储
- 透明网络拦截
- 默认阻断
- 将流量发送至外部服务
- 向容器暴露原始请求/响应正文