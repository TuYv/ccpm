---
name: soul-guardian
version: 0.0.9
description: Drift detection + baseline integrity guard for agent workspace files with automatic alerting support
homepage: https://clawsec.prompt.security
metadata: {"openclaw":{"emoji":"👻","category":"security"}}
clawdis:
  emoji: "👻"
  requires:
    bins: [python3]
---
# soul-guardian 👻

保护代理的核心文件（SOUL.md、AGENTS.md 等）免遭未经授权的更改，并通过自动检测、恢复和**用户提醒**来确保安全。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill soul-guardian -a openclaw -y
```

## 运行说明

- 必需运行时：`python3`
- 可选运行时：用于 cron 集成的 `openclaw`、用于 macOS 调度的 `launchctl`、用于演示辅助工具的 `bash`
- 副作用：可以将受保护的文件自动恢复到已批准的基线，并在本地写入审计/隔离状态
- 网络行为：默认无网络行为
- 信任模型：任何调度均为选择性启用，但恢复模式会有意覆盖发生偏移的文件

## Release Artifact 验证

对于独立安装，在信任 `SKILL.md`、`skill.json` 或存档之前，请验证已签名的发布清单。`skill.json` 文件是软件包元数据/SBOM 来源，发布流水线使用 ClawSec release key 对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="soul-guardian"
VERSION="0.0.9"
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

## 快速开始（3 个步骤）

### 步骤 1：初始化基线
```bash
cd ~/.openclaw/workspace
python3 skills/soul-guardian/scripts/soul_guardian.py init --actor setup --note "initial baseline"
```

### 步骤 2：启用监控
```bash
python3 skills/soul-guardian/scripts/soul_guardian.py enable-monitoring
```
这将展示如何将监控添加到你的工作流中。

### 步骤 3：添加到 HEARTBEAT.md（推荐）

将以下内容添加到你的 HEARTBEAT.md，以实现自动监控：

```markdown
## Soul Guardian Check
- Run `python3 skills/soul-guardian/scripts/soul_guardian.py check --actor heartbeat --output-format alert`
- If any output is produced, relay it to the user immediately as a security alert
```

就是这样！Soul Guardian 现在将：
- ✅ 检测受保护文件的未经授权更改
- ✅ 将 SOUL.md 和 AGENTS.md 自动恢复到已批准的基线
- ✅ 在检测并处理偏移时向你发出警报

---

## 它保护的内容（默认策略）

| 文件 | 模式 | 发生偏移时的操作 |
|------|------|-----------------|
| SOUL.md | restore | 自动恢复 + 警报 |
| AGENTS.md | restore | 自动恢复 + 警报 |
| USER.md | alert | 仅发出警报 |
| TOOLS.md | alert | 仅发出警报 |
| IDENTITY.md | alert | 仅发出警报 |
| HEARTBEAT.md | alert | 仅发出警报 |
| MEMORY.md | alert | 仅发出警报 |
| memory/*.md | ignore | 忽略 |

## 命令

### 检查偏移（带警报输出）
```bash
python3 skills/soul-guardian/scripts/soul_guardian.py check --output-format alert
```
- 没有偏移时保持静默
- 检测到偏移时输出人类可读的警报
- 非常适合集成到心跳机制中

### 监视模式（持续监控）
```bash
python3 skills/soul-guardian/scripts/soul_guardian.py watch --interval 30
```
持续运行，每 30 秒检查一次。

### 批准有意进行的更改
```bash
python3 skills/soul-guardian/scripts/soul_guardian.py approve --file SOUL.md --actor user --note "intentional update"
```

### 查看状态
```bash
python3 skills/soul-guardian/scripts/soul_guardian.py status
```

### 验证审计日志完整性
```bash
python3 skills/soul-guardian/scripts/soul_guardian.py verify-audit
```

---

## 警报格式

检测到偏移时，`--output-format alert` 将生成类似以下内容的输出：

```
==================================================
🚨 SOUL GUARDIAN SECURITY ALERT
==================================================

📄 FILE: SOUL.md
   Mode: restore
   Status: ✅ RESTORED to approved baseline
   Expected hash: abc123def456...
   Found hash:    789xyz000111...
   Diff saved: /path/to/patches/drift.patch

==================================================
Review changes and investigate the source of drift.
If intentional, run: soul_guardian.py approve --file <path>
==================================================
```

此输出专为直接转发给 TUI/聊天中的用户而设计。

---

## 安全模型

**它的功能：**
- 检测文件系统相对于已批准基线的偏移（sha256）
- 生成统一差异以供审查
- 通过哈希链维护可防篡改的审计日志
- 拒绝对符号链接执行操作
- 使用原子写入进行恢复

**它不会做什么：**
- 无法证明是谁做出了更改（操作者信息仅为尽力而为的元数据）
- 如果攻击者同时控制工作区和状态目录，则无法提供保护
- 不能替代备份

**建议：** 将状态目录存放在工作区之外，以获得更好的韧性。

---

## 演示

运行完整的演示流程，查看 soul-guardian 的实际运行效果：

```bash
bash skills/soul-guardian/scripts/demo.sh
```

该流程将：
1. 验证状态干净（静默检查）
2. 将恶意内容注入 SOUL.md
3. 运行心跳检查（生成警报）
4. 显示 SOUL.md 已恢复

---

## 故障排除

**“未初始化”错误：**
先运行 `init` 以设置基线。

**漂移持续发生：**
检查是什么在修改你的文件。查看审计日志和补丁。

**想要批准一项更改：**
检查更改后，运行 `approve --file <path>`。