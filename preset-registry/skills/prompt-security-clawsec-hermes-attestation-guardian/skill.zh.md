---
name: hermes-attestation-guardian
version: 0.1.7
description: Hermes-only runtime security attestation and drift detection skill for operator-managed Hermes infrastructure.
homepage: https://clawsec.prompt.security
hermes:
  emoji: "🛡️"
  requires:
    bins: [node]
---
# Hermes Attestation Guardian

重要范围：
- 此 skill 仅面向 Hermes 基础设施（CLI/Gateway/profile-managed 部署）。
- 此 skill 不是 OpenClaw runtime hook package。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill hermes-attestation-guardian -a hermes-agent -y
```

## Release Artifact 验证

对于 standalone installs，在信任 `SKILL.md`、`skill.json` 或 archive 之前，验证已签名的 release manifest。`skill.json` 文件是 package metadata/SBOM source，release pipeline 使用 ClawSec release key 对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="hermes-attestation-guardian"
VERSION="0.1.7"
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

仅当此验证成功后，才安装或解压该归档。

## 目标

生成确定性的 Hermes 姿态证明，使用失败即关闭的完整性检查对其进行验证，并使用稳定的严重性映射比较基线漂移。

## Hermes guard 信任策略说明

从社区来源安装时，将 Hermes guard 配置为使用基于签名的信任（受信任签名者指纹允许列表），而不是仅基于来源名称的信任。未知签名者指纹应继续遵循社区策略，无效签名必须保持阻止状态。

## 命令

```bash
# Generate attestation (default output: ~/.hermes/security/attestations/current.json)
node scripts/generate_attestation.mjs

# Generate with explicit policy + deterministic timestamp
node scripts/generate_attestation.mjs \
  --policy ~/.hermes/security/attestation-policy.json \
  --generated-at 2026-04-15T18:00:00.000Z \
  --write-sha256

# Verify schema + canonical digest
node scripts/verify_attestation.mjs --input ~/.hermes/security/attestations/current.json

# Verify with baseline diff (baseline must be authenticated)
node scripts/verify_attestation.mjs \
  --input ~/.hermes/security/attestations/current.json \
  --baseline ~/.hermes/security/attestations/baseline.json \
  --baseline-expected-sha256 <trusted-baseline-sha256> \
  --fail-on-severity high

# Optional detached signature verification
node scripts/verify_attestation.mjs \
  --input ~/.hermes/security/attestations/current.json \
  --signature ~/.hermes/security/attestations/current.json.sig \
  --public-key ~/.hermes/security/keys/attestation-public.pem

# Refresh advisory feed verification state (fail-closed by default)
node scripts/refresh_advisory_feed.mjs

# Check advisory feed verification + feed summary
node scripts/check_advisories.mjs

# Guarded advisory-aware skill verification gate (returns 42 on advisory match without explicit confirm)
node scripts/guarded_skill_verify.mjs --skill some-skill --version 1.2.3

# Explicit operator acknowledgement path for advisory matches
node scripts/guarded_skill_verify.mjs --skill some-skill --version 1.2.3 --confirm-advisory

# Optional temporary unsigned bypass (dangerous; emergency-only)
HERMES_ADVISORY_ALLOW_UNSIGNED_FEED=1 node scripts/refresh_advisory_feed.mjs --allow-unsigned

# Preview scheduler config without mutating user schedule state
node scripts/setup_attestation_cron.mjs --every 6h --print-only

# Apply managed scheduler block
node scripts/setup_attestation_cron.mjs --every 6h --apply

# Preview advisory check scheduler config (guarded flow, print-only default)
node scripts/setup_advisory_check_cron.mjs --every 6h --skill some-skill --print-only

# Apply advisory check scheduler block (uses guarded_skill_verify flow)
node scripts/setup_advisory_check_cron.mjs --every 6h --skill some-skill --version 1.2.3 --apply

# Emergency-only: unsigned bypass for scheduled advisory checks (do not keep enabled)
node scripts/setup_advisory_check_cron.mjs --every 6h --skill some-skill --allow-unsigned --apply
```

警告：计划任务中的 `--allow-unsigned` 仅用于事件响应。恢复后立即移除它，并恢复已签名公告验证。

## Attestation payload（已实现）

生成器会输出：
- schema_version、platform、generated_at
- 生成器元数据（skill + node version）
- 主机元数据（hostname/platform/arch）
- posture.runtime（网关启用标志 + 高风险开关）
- posture.feed_verification 状态（verified|unverified|unknown），来源于 `$HERMES_HOME/security/advisories/feed-verification-state.json`
- posture.integrity watched_files 和 trust_anchors（存在性 + sha256）
- digests.canonical_sha256，针对稳定的规范化 JSON 表示计算

## Fail-closed behavior

在以下情况下，验证器会以非零状态退出：
- schema 验证失败
- 规范摘要算法不受支持，或摘要绑定不匹配
- 预期文件的 sha256 不匹配（如果已配置）
- 分离签名验证失败（如果已配置）
- 提供 baseline，但未进行经过身份验证的信任绑定（`--baseline-expected-sha256` 和/或 baseline 签名 + 公钥）
- baseline 身份验证失败，或 baseline schema/digest 验证失败
- baseline diff 的最高严重级别达到或超过 `--fail-on-severity`（默认值：critical）

严重性消息以 INFO / WARNING / CRITICAL 样式的行输出。

## Side effects

- `generate_attestation.mjs` 会在 `$HERMES_HOME/security/attestations` 下写入一个 JSON 文件（以及可选的 `.sha256`）。
- `verify_attestation.mjs` 为只读操作。
- `refresh_advisory_feed.mjs` 会在 `$HERMES_HOME/security/advisories` 下写入已验证的 feed 缓存和验证状态。
- `check_advisories.mjs` 为只读操作。
- `guarded_skill_verify.mjs` 会重新运行 feed 刷新/验证（具有相同的 advisory 缓存和状态副作用），然后执行支持 advisory 的门禁检查。
- 除非提供 `--apply`，否则 `setup_attestation_cron.mjs` 为只读操作。
- `setup_attestation_cron.mjs --apply` 只会重写当前用户托管计划任务块，该块由以下标记限定：
  - `# >>> hermes-attestation-guardian >>>`
  - `# <<< hermes-attestation-guardian <<<`
- 除非提供 `--apply`，否则 `setup_advisory_check_cron.mjs` 为只读操作。
- `setup_advisory_check_cron.mjs --apply` 只会重写当前用户 advisory-check 托管计划任务块，该块由以下标记限定：
  - `# >>> hermes-attestation-guardian-advisory-check >>>`
  - `# <<< hermes-attestation-guardian-advisory-check <<<`
  - 生成的命令路径使用 `guarded_skill_verify.mjs`（支持 advisory 的门禁），而不是原始的 `check_advisories.mjs`

## Advisory feed override knobs

默认的已签名 advisory feed 已进行整合：其中可以包含 NVD CVE、已批准的社区 advisory，以及不含 CVE 的临时 GHSA 记录。Hermes 仍会根据受影响的软件包名称和受支持的版本范围执行匹配门禁。

- 源选择：`HERMES_ADVISORY_FEED_SOURCE=auto|remote|local`
- 远程工件：`HERMES_ADVISORY_FEED_URL`、`HERMES_ADVISORY_FEED_SIG_URL`、`HERMES_ADVISORY_FEED_CHECKSUMS_URL`、`HERMES_ADVISORY_FEED_CHECKSUMS_SIG_URL`
- 本地工件：`HERMES_LOCAL_ADVISORY_FEED`、`HERMES_LOCAL_ADVISORY_FEED_SIG`、`HERMES_LOCAL_ADVISORY_FEED_CHECKSUMS`、`HERMES_LOCAL_ADVISORY_FEED_CHECKSUMS_SIG`
- 固定密钥覆盖：`HERMES_ADVISORY_FEED_PUBLIC_KEY`（默认使用内置的固定密钥）
- 可选校验和开关：`HERMES_ADVISORY_VERIFY_CHECKSUM_MANIFEST`（默认：启用）
- 仅用于不安全的紧急绕过：`HERMES_ADVISORY_ALLOW_UNSIGNED_FEED=1`

## 备注

- Hermes 扫描和测试上下文按设计基于 `.mjs`：
  - 运行时脚本：`scripts/*.mjs`
  - 共享库：`lib/*.mjs`
  - 回归测试：`test/*.test.mjs`
- 保持 `.mjs` 路径/扩展名稳定，以确保扫描器范围、SBOM 接线和测试工具引用保持有效。
- 默认输出根目录为 `~/.hermes/security/attestations/`。
- 未实现破坏性修复操作（删除/恢复/隔离）。
- 在 v0.0.2 中尚未实现 Advisory feed 远程 URL 允许列表；操作员必须明确地信任已配置的 feed/checksum 端点。
- 受保护的 Advisory 版本匹配支持 `>=`、`<=`、`>`、`<`、`=`、`^`、`~`、通配符 `*`、以空格或逗号分隔的 AND 比较器集合，以及 SemVer 预发布版本优先级。OR 和连字符范围仍不受支持，并采用默认拒绝策略。
- 来自整合 NVD feed 的有效 CPE 2.3 条目将作为非软件包元数据接受，并在软件包名称匹配中忽略。格式错误的 CPE 条目仍采用默认拒绝策略。
- 操作员策略文件是可选的 JSON，其中包含：
  - `watch_files`：文件路径列表
  - `trust_anchor_files`：文件路径列表