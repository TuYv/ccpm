---
name: claw-release
version: 0.0.4
description: Release automation for Claw skills and website. Guides through version bumping, tagging, and release verification.
homepage: https://clawsec.prompt.security
metadata:
  internal: true
  openclaw:
    emoji: "🚀"
    category: "utility"
    internal: true
clawdis:
  emoji: "🚀"
  requires:
    bins: [bash, git, jq, gh]
---
# Claw 发布

用于发布 skill 和管理 ClawSec 目录的内部工具。

**由 [Prompt Security](https://prompt.security) 提供的内部工具**

---

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill claw-release -a openclaw -y
```

## 运行说明

- 仅限内部维护者工作流使用。
- 必需的运行时：`bash`、`git`、`jq`、`gh`
- 必需的凭据：已完成身份验证且拥有创建发布权限的 GitHub CLI
- 副作用：创建提交、标签，将内容推送到远程仓库，并发布 GitHub Releases
- 信任模型：仅从受信任的检出目录运行，且工作树必须干净并获得维护者批准

## 发布构件验证

对于独立安装，在信任 `SKILL.md`、`skill.json` 或归档文件之前，请验证已签名的发布清单。`skill.json` 文件是软件包元数据/SBOM 的来源，发布流水线使用 ClawSec 发布密钥对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="claw-release"
VERSION="0.0.4"
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

## 快速参考

| 发布类型 | 命令 | 标签格式 |
|-------------|---------|------------|
| Skill 发布 | `./scripts/release-skill.sh <name> <version>` | `<name>-v<version>` |
| 预发布 | `./scripts/release-skill.sh <name> 1.0.0-beta1` | `<name>-v1.0.0-beta1` |

---

## 发布流程

### 步骤 1：确定版本类型

询问发生了哪些变更：
- **仅修复 Bug** → 补丁版本（1.0.0 → 1.0.1）
- **新增功能，向后兼容** → 次版本（1.0.0 → 1.1.0）
- **破坏性变更** → 主版本（1.0.0 → 2.0.0）
- **测试性/不稳定版本** → 预发布版本（1.0.0-beta1、1.0.0-rc1）

### 步骤 2：发布前检查

```bash
# Check for uncommitted changes
git status

# Verify skill directory exists
ls skills/<skill-name>/skill.json

# Get current version
jq -r '.version' skills/<skill-name>/skill.json
```

### 步骤 3：运行发布脚本

```bash
./scripts/release-skill.sh <skill-name> <new-version>
```

该脚本将：
1. 验证版本格式（semver）
2. 检查标签是否已存在
3. 更新 skill.json 版本
4. 更新 SKILL.md frontmatter 版本（如果文件存在）
5. 更新硬编码的版本 URL（feed_url）
6. 提交变更
7. 创建带注释的 git 标签

### 步骤 4：推送发布

```bash
git push && git push origin <skill-name>-v<version>
```

### 步骤 5：验证发布

推送后，CI/CD 流水线将：
1. 验证 skill 是否存在
2. 验证版本是否与 skill.json 匹配
3. 验证版本是否与 SKILL.md frontmatter 匹配（如果存在）
4. 根据 SBOM 生成校验和
5. 创建 .skill 软件包（ZIP）
6. 创建 GitHub Release
7. 触发网站重建（针对非内部 skill）

请在以下位置验证：
- **GitHub Releases：** `https://github.com/prompt-security/clawsec/releases/tag/<skill-name>-v<version>`
- **GitHub Actions：** 检查工作流运行状态

---

## 撤销发布（推送前）

如果需要在推送前撤销：

```bash
git tag -d <skill-name>-v<version>
git reset --soft HEAD~1
```

`git reset --soft` 会保留工作树中的发布变更，因此你可以检查或修改这些变更，而不会丢弃数据。

---

## 预发布版本

对于 beta、alpha 或候选发布版本：

```bash
./scripts/release-skill.sh <skill-name> 1.2.0-beta1
./scripts/release-skill.sh <skill-name> 1.2.0-alpha1
./scripts/release-skill.sh <skill-name> 1.2.0-rc1
```

预发布版本会在 GitHub Releases 中自动标记。

---

## 常见问题

| 错误 | 解决方案 |
|-------|----------|
| `Tag already exists` | 选择其他版本号 |
| `Version mismatch in CI` | 确保使用了发布脚本（而不是手动打标签） |
| `SKILL.md version mismatch` | 确保使用了会同时更新 skill.json 和 SKILL.md 的发布脚本 |
| `Uncommitted changes` | 先提交或暂存：`git stash` 或 `git add . && git commit` |
| `skill.json not found` | 确认 skill 目录路径正确 |

---

## 内部 Skills

在其 `openclaw` 部分中包含 `"internal": true` 的 Skills：
- 仍通过 GitHub Releases 按正常流程发布
- 不会显示在公共 skills 目录网站中
- 仍可直接从发布 URL 下载

此技能（`claw-release`）是内部技能。

---

## 现有技能

| 技能 | 类别 | 内部 |
|-------|----------|----------|
| clawsec-feed | 安全 | 否 |
| clawtributor | 安全 | 否 |
| openclaw-audit-watchdog | 安全 | 否 |
| soul-guardian | 安全 | 否 |
| claw-release | 实用工具 | 是 |

---

## 验证清单

发布后，确认：
- [ ] GitHub Release 已存在且标签正确
- [ ] Release 包含：skill.json、SKILL.md、checksums.json、.skill package
- [ ] 如适用，Release 已标记为预发布版本
- [ ] GitHub Actions 工作流已成功完成
- [ ] 网站已更新（仅适用于非内部技能）

---

## 许可证

GNU AGPL v3.0 或更高版本 - 详情请参阅仓库。

由 [Prompt Security](https://prompt.security) 团队构建。