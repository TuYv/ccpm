---
name: picoclaw-security-guardian
version: 0.0.6
description: Picoclaw security posture skill with advisory awareness, configuration drift detection, and supply-chain verification guidance.
homepage: https://clawsec.prompt.security
author: prompt-security
license: AGPL-3.0-or-later
picoclaw:
  emoji: "🦐"
  category: "security"
  requires:
    bins: [node]
  test_requires:
    bins: [bash, docker, python3, node, openssl, zip]
---
# Picoclaw Security Guardian

详细的架构/操作员文档：`wiki/modules/picoclaw-security-guardian.md`。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill picoclaw-security-guardian -a openclaw -y
```

## 发布产物验证

对于独立安装，请先验证已签名的发布清单，然后再信任 `SKILL.md`、`skill.json` 或压缩包。`skill.json` 文件是软件包元数据/SBOM 来源，发布流水线使用 ClawSec 发布密钥对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="picoclaw-security-guardian"
VERSION="0.0.6"
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

仅在验证成功后安装或提取压缩包。

## 目标

为 Picoclaw 提供与 ClawSec 为成熟平台模块跟踪的支持矩阵相同的安全能力：

| 技能名称 | 支持的平台 | 安全公告源 | 配置漂移 | 代理姿态审查通道 | 供应链验证 |
|---|---|---|---|---|---|
| picoclaw-security-guardian | Picoclaw | 是 | 是 | 独立软件包 | 是 |

## 威胁模型

Picoclaw 是一个轻量级 AI 网关，可以暴露聊天频道、Web UI、工具执行、MCP 服务器、凭据、调度器以及嵌入式/路由器部署。此技能聚焦于这些功能变得与安全相关时所涉及的信任边界。

## 默认安全姿态

- 默认只读。
- v0.0.1 中不创建调度器。
- 默认不进行出站网络访问。
- 除非操作员提供仅用于测试的临时路径，否则只在 `$PICOCLAW_HOME/security/clawsec/` 下写入明确指定的报告/配置文件输出。
- 当验证状态不是已验证时，公告检查默认以失败关闭；除非操作员针对有文档记录的紧急/离线窗口传入 `--allow-unsigned`。

## 安全公告感知

使用 `scripts/check_advisories.mjs`，并提供本地源/缓存及验证状态：

```bash
node scripts/check_advisories.mjs   --feed ~/.picoclaw/security/clawsec/feed.json   --state ~/.picoclaw/security/clawsec/feed-verification-state.json
```

该脚本会筛选适用于 `picoclaw`、`ai-gateway`、空平台/所有平台的公告，或受影响软件包条目中包含 `picoclaw` 的公告。
预期的源输入是整合后的已签名 ClawSec 安全公告源，因此其中可以包含 NVD CVE、已批准的社区公告，以及不带 CVE 的临时 GHSA 记录。

## 漂移防护

生成确定性配置文件：

```bash
node scripts/generate_profile.mjs   --output ~/.picoclaw/security/clawsec/current-profile.json
```

与已批准的基线进行比较：

```bash
node scripts/check_drift.mjs   --baseline ~/.picoclaw/security/clawsec/baseline-profile.json   --current ~/.picoclaw/security/clawsec/current-profile.json   --fail-on critical
```

严重漂移包括启用公共 Web UI、禁用 Web UI 身份验证、禁用工作区限制、未签名/不安全的验证模式、已验证安全公告源回退，以及受监视文件/发布构件指纹发生变化。

## 供应链验证

使用校验和清单及分离签名验证 Picoclaw 发布构件。要获得通过的供应链判定，必须验证已签名清单：

```bash
node scripts/verify_supply_chain.mjs \
  --artifact ./picoclaw \
  --checksums ./checksums.json \
  --signature ./checksums.json.sig \
  --public-key ./feed-signing-public.pem
```

仅校验和模式只能验证完整性，不能验证来源。仅可在时间较短且有文档记录的离线分诊窗口中使用 `--allow-unsigned-checksums`；它不应满足生产安装验证要求。

## 操作员审查说明

- 在证明身份验证和网络允许列表有效之前，将公共 UI 绑定（`0.0.0.0`、`-public`）视为严重审查事项。
- 将 MCP 服务器视为独立的信任边界；审查每个服务器对文件系统、网络和凭据的访问权限。
- 将第三方 OpenWrt/LuCI 封装程序视为独立的供应链构件。在路由器上安装之前验证其来源。
- 切勿在周期性检查或生产检查中保持启用未签名公告模式。

## 验证

```bash
python utils/validate_skill.py skills/picoclaw-security-guardian
node skills/picoclaw-security-guardian/test/profile.test.mjs
node skills/picoclaw-security-guardian/test/drift.test.mjs
node skills/picoclaw-security-guardian/test/supply_chain.test.mjs
bash -n skills/picoclaw-security-guardian/test/picoclaw_security_guardian_sandbox_regression.sh
```

## 发布前安装回归

在发布 v0.0.1 版本工件之前，从仓库根目录运行隔离安装流程：

```bash
skills/picoclaw-security-guardian/test/picoclaw_security_guardian_sandbox_regression.sh
```

该回归测试通过 Picoclaw 自身的 `find_skills` / `install_skill` 路径，从本地兼容 ClawHub 的注册表将该 skill 安装到由隔离 Docker 托管的 Picoclaw 工作区中，并使用隔离的 `HOME`、`PICOCLAW_HOME` 和 `PICOCLAW_WORKSPACE`。它会验证已签名发布工件的预检输入，确认 Picoclaw 的 skill 加载器能够列出并加载已安装的 skill，然后针对符合 Picoclaw 风格的 `config.json` 和 `launcher-config.json` 文件，运行已安装副本的配置文件、漂移、咨询信息故障关闭、咨询信息过滤以及供应链验证路径。