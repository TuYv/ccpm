---
name: clawsec-clawhub-checker
version: 0.0.8
description: ClawHub reputation checker for clawsec-suite. Adds a standalone reputation gate before guarded skill installation.
homepage: https://clawsec.prompt.security
clawdis:
  emoji: "🛡️"
  requires:
    bins: [node, clawhub, openclaw]
  depends_on: [clawsec-suite]
---
# ClawSec ClawHub 检查器

在 `clawsec-suite` 受保护的安装器之上增加信誉门控。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill clawsec-clawhub-checker -a openclaw -y
```

## 操作说明

- 必需的运行时：`node`、`clawhub`、`openclaw`
- 依赖项：已安装的 `clawsec-suite`
- 副作用：不会影响其他 skill；此软件包不会重写已安装套件中的文件
- Advisory hook 的连接在此版本中是可选的，需要手动完成
- 网络行为：信誉检查会调用 ClawHub inspect/search 端点
- 信任模型：评分采用启发式方法，并且需要经过确认

## 功能说明

1. 从 ClawHub 读取 skill 元数据（`inspect --json`）
2. 评估扫描器状态（包括在存在时的 VirusTotal 摘要）
3. 应用额外的信誉启发式指标（创建时间、更新情况、作者历史、下载量）
4. 当评分低于阈值时，要求明确指定 `--confirm-reputation`

## 安装

在 `clawsec-suite` 之后安装：

```bash
npx clawhub@latest install clawsec-suite
npx clawhub@latest install clawsec-clawhub-checker
```

可选的安装前检查（验证本地路径并打印建议命令）：

```bash
node ~/.openclaw/skills/clawsec-clawhub-checker/scripts/setup_reputation_hook.mjs
```

## 发布工件验证

对于独立安装，请在信任 `SKILL.md`、`skill.json` 或压缩包之前，验证已签名的发布清单。`skill.json` 文件是软件包元数据/SBOM 的来源，而发布流水线会使用 ClawSec 发布密钥对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="clawsec-clawhub-checker"
VERSION="0.0.8"
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

仅在此验证成功后安装或解压归档。

## 用法

直接从此 skill 运行增强安装程序：

```bash
node ~/.openclaw/skills/clawsec-clawhub-checker/scripts/enhanced_guarded_install.mjs \
  --skill some-skill \
  --version 1.0.0
```

如果某个 skill 低于阈值，仅在获得明确批准后重新运行：

```bash
node ~/.openclaw/skills/clawsec-clawhub-checker/scripts/enhanced_guarded_install.mjs \
  --skill some-skill \
  --version 1.0.0 \
  --confirm-reputation
```

## 可选的 Advisory-Hook 接入（手动）

此版本不会自动修改 `clawsec-suite` hook 文件。  
如果你依赖包含 `reputationWarning` / `reputationWarnings` 的 advisory 警报，请手动接入 checker 模块：

- 源模块：`~/.openclaw/skills/clawsec-clawhub-checker/hooks/clawsec-advisory-guardian/lib/reputation.mjs`
- 目标 hook 文件：`~/.openclaw/skills/clawsec-suite/hooks/clawsec-advisory-guardian/handler.ts`

请将此接入视为一项有意进行的本地自定义，并在启用前进行审查。

## 退出代码

- `0` 可以安全安装
- `42` 需要 advisory 确认（来自 clawsec-suite）
- `43` 需要信誉确认
- `1` 错误

## 配置

环境变量：

- `CLAWHUB_REPUTATION_THRESHOLD` - 最低分数（0-100，默认值：70）

## 安全说明

- 这是纵深防御措施，不能替代 advisory 匹配
- 扫描器输出可能产生误报和漏报
- 在覆盖警告之前，始终审查 skill 代码

## 开发

关键文件：

- `scripts/enhanced_guarded_install.mjs`
- `scripts/check_clawhub_reputation.mjs`
- `scripts/setup_reputation_hook.mjs`
- `hooks/clawsec-advisory-guardian/lib/reputation.mjs`

## 许可证

GNU AGPL v3.0 或更高版本 - ClawSec 安全套件的一部分