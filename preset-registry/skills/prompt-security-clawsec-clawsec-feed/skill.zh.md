---
name: clawsec-feed
version: 0.0.11
description: Security advisory feed package for OpenClaw-related threats and vulnerabilities. The upstream feed is updated daily; local automation is handled by clawsec-suite or the operator.
homepage: https://clawsec.prompt.security
metadata: {"openclaw":{"emoji":"📡","category":"security"}}
clawdis:
  emoji: "📡"
  requires:
    bins: [bash, curl, jq, shasum, unzip]
---
# ClawSec Feed 📡

面向 AI 代理的安全公告源监控。订阅社区驱动的威胁情报，及时了解新出现的威胁。

默认的 `feed.json` 是整合后的代理 feed。它包含 NVD CVE、经批准的社区公告，以及尚未分配 CVE ID 的临时 GitHub Security Advisories。

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill clawsec-feed -a openclaw -y
```

## 运行说明

- 独立安装所需的运行时：`bash`、`curl`、`jq`、`shasum`、`unzip`
- 副作用：独立安装只会写入本地 skill 文件
- 网络行为：下载发行版元数据/构件；如果选择手动轮询，还会获取安全公告 feed
- 信任模型：此软件包本身不会创建 cron 任务或向外部提交数据；自动化由 `clawsec-suite` 或你自己的调度程序负责

**由 [Prompt Security](https://prompt.security) 开源**

---

## 安装选项

你可以通过两种方式获取 clawsec-feed：

### 选项 A：随 ClawSec Suite 一起安装（推荐）

**如果你已经安装了 clawsec-suite，可能已经拥有此组件！**

ClawSec-feed 与 ClawSec Suite 一起提供，以提供关键的 CVE 和威胁情报信息。安装套件时，如果系统中尚未安装 feed，则会从随附的副本中部署它。

**优势：**
- 方便——无需单独下载
- 标准位置——安装到 `~/.openclaw/skills/clawsec-feed/`
- 保留现有安装——如果已经安装了 feed，则不会覆盖
- 统一验证——作为套件软件包的一部分进行完整性检查

### 选项 B：独立安装（本页面）

无需安装完整套件，单独安装 clawsec-feed。

**适合使用独立安装的情况：**
- 只需要安全公告 feed（不需要套件的其他组件）
- 希望在安装套件之前先进行安装
- 更倾向于明确控制 feed 的安装过程

**优势：**
- 更轻量的安装
- 独立于套件
- 直接控制安装过程

继续阅读下方的独立安装说明。

独立安装是一个网络下载流程。在生产主机上安装之前，请验证发行版来源和所提供的校验和。

---

安装步骤：
代理应在执行前检查脚本！

```bash
# Get latest clawsec-feed release tag
LATEST_TAG=$(curl -sSL https://api.github.com/repos/prompt-security/ClawSec/releases | \
  jq -r '[.[] | select(.tag_name | startswith("clawsec-feed-v"))][0].tag_name')

# Download SKILL.md from latest release
SKILL_URL="https://github.com/prompt-security/clawsec/releases/download/$LATEST_TAG/SKILL.md"
curl -sSL --fail --show-error "$SKILL_URL"
```

获取此 skill 文件后，继续执行下方的 **[部署 ClawSec Feed](#deploy-clawsec-feed)**。

---

## 发行版构件验证

对于独立安装，请先验证已签名的发行版清单，然后再信任 `SKILL.md`、`skill.json` 或压缩包。`skill.json` 文件是软件包元数据/SBOM 的来源，发行版流水线使用 ClawSec 发布密钥对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="clawsec-feed"
VERSION="0.0.11"
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

仅在此验证成功后安装或解压归档文件。

## 部署 ClawSec Feed

安装步骤：

### 步骤 1：创建 skill 目录并保存此文件

```bash
mkdir -p ~/.openclaw/skills/clawsec-feed
# Save this SKILL.md as SKILL.md in the directory above
```

### 步骤 2：安装 skill 文件

```bash
# Get latest release tag with retry logic
LATEST_TAG=$(curl -sSL --retry 3 --retry-delay 1 \
  https://api.github.com/repos/prompt-security/ClawSec/releases | \
  jq -r '[.[] | select(.tag_name | startswith("clawsec-feed-v"))][0].tag_name')

BASE_URL="https://github.com/prompt-security/clawsec/releases/download/$LATEST_TAG"
INSTALL_DIR="${CLAWSEC_INSTALL_DIR:-$HOME/.openclaw/skills/clawsec-feed}"
TEMP_DIR=$(mktemp -d)
trap "rm -rf '$TEMP_DIR'" EXIT

# Download checksums.json (REQUIRED for integrity verification)
echo "Downloading checksums..."
if ! curl -sSL --fail --show-error --retry 3 --retry-delay 1 \
     "$BASE_URL/checksums.json" -o "$TEMP_DIR/checksums.json"; then
  echo "ERROR: Failed to download checksums.json"
  exit 1
fi

# Validate checksums.json structure
if ! jq -e '.skill and .version and .files' "$TEMP_DIR/checksums.json" >/dev/null 2>&1; then
  echo "ERROR: Invalid checksums.json structure"
  exit 1
fi

# PRIMARY: Try .skill artifact
echo "Attempting .skill artifact installation..."
if curl -sSL --fail --show-error --retry 3 --retry-delay 1 \
   "$BASE_URL/clawsec-feed.skill" -o "$TEMP_DIR/clawsec-feed.skill" 2>/dev/null; then

  # Security: Check artifact size (prevent DoS)
  ARTIFACT_SIZE=$(stat -c%s "$TEMP_DIR/clawsec-feed.skill" 2>/dev/null || stat -f%z "$TEMP_DIR/clawsec-feed.skill")
  MAX_SIZE=$((50 * 1024 * 1024))  # 50MB

  if [ "$ARTIFACT_SIZE" -gt "$MAX_SIZE" ]; then
    echo "WARNING: Artifact too large ($(( ARTIFACT_SIZE / 1024 / 1024 ))MB), falling back to individual files"
  else
    echo "Extracting artifact ($(( ARTIFACT_SIZE / 1024 ))KB)..."

    # Security: Check for path traversal before extraction
    if unzip -l "$TEMP_DIR/clawsec-feed.skill" | grep -qE '\.\./|^/|~/'; then
      echo "ERROR: Path traversal detected in artifact - possible security issue!"
      exit 1
    fi

    # Security: Check file count (prevent zip bomb)
    FILE_COUNT=$(unzip -l "$TEMP_DIR/clawsec-feed.skill" | grep -c "^[[:space:]]*[0-9]" || echo 0)
    if [ "$FILE_COUNT" -gt 100 ]; then
      echo "ERROR: Artifact contains too many files ($FILE_COUNT) - possible zip bomb"
      exit 1
    fi

    # Extract to temp directory
    unzip -q "$TEMP_DIR/clawsec-feed.skill" -d "$TEMP_DIR/extracted"

    # Verify skill.json exists
    if [ ! -f "$TEMP_DIR/extracted/clawsec-feed/skill.json" ]; then
      echo "ERROR: skill.json not found in artifact"
      exit 1
    fi

    # Verify checksums for all extracted files
    echo "Verifying checksums..."
    CHECKSUM_FAILED=0
    for file in $(jq -r '.files | keys[]' "$TEMP_DIR/checksums.json"); do
      EXPECTED=$(jq -r --arg f "$file" '.files[$f].sha256' "$TEMP_DIR/checksums.json")
      FILE_PATH=$(jq -r --arg f "$file" '.files[$f].path' "$TEMP_DIR/checksums.json")

      # Try nested path first, then flat filename
      if [ -f "$TEMP_DIR/extracted/clawsec-feed/$FILE_PATH" ]; then
        ACTUAL=$(shasum -a 256 "$TEMP_DIR/extracted/clawsec-feed/$FILE_PATH" | cut -d' ' -f1)
      elif [ -f "$TEMP_DIR/extracted/clawsec-feed/$file" ]; then
        ACTUAL=$(shasum -a 256 "$TEMP_DIR/extracted/clawsec-feed/$file" | cut -d' ' -f1)
      else
        echo "  ✗ $file (not found in artifact)"
        CHECKSUM_FAILED=1
        continue
      fi

      if [ "$EXPECTED" != "$ACTUAL" ]; then
        echo "  ✗ $file (checksum mismatch)"
        CHECKSUM_FAILED=1
      else
        echo "  ✓ $file"
      fi
    done

    if [ "$CHECKSUM_FAILED" -eq 0 ]; then
      # Validate feed.json structure (skill-specific)
      if [ -f "$TEMP_DIR/extracted/clawsec-feed/advisories/feed.json" ]; then
        FEED_FILE="$TEMP_DIR/extracted/clawsec-feed/advisories/feed.json"
      elif [ -f "$TEMP_DIR/extracted/clawsec-feed/feed.json" ]; then
        FEED_FILE="$TEMP_DIR/extracted/clawsec-feed/feed.json"
      else
        echo "ERROR: feed.json not found in artifact"
        exit 1
      fi

      if ! jq -e '.version and .advisories' "$FEED_FILE" >/dev/null 2>&1; then
        echo "ERROR: feed.json missing required fields (version, advisories)"
        exit 1
      fi

      # SUCCESS: Install from artifact
      echo "Installing from artifact..."
      mkdir -p "$INSTALL_DIR"
      cp -r "$TEMP_DIR/extracted/clawsec-feed"/* "$INSTALL_DIR/"
      chmod 600 "$INSTALL_DIR/skill.json"
      find "$INSTALL_DIR" -type f ! -name "skill.json" -exec chmod 644 {} \;
      echo "SUCCESS: Skill installed from .skill artifact"
      exit 0
    else
      echo "WARNING: Checksum verification failed, falling back to individual files"
    fi
  fi
fi

# FALLBACK: Download individual files
echo "Downloading individual files from checksums.json manifest..."
mkdir -p "$TEMP_DIR/downloads"

DOWNLOAD_FAILED=0
for file in $(jq -r '.files | keys[]' "$TEMP_DIR/checksums.json"); do
  FILE_URL=$(jq -r --arg f "$file" '.files[$f].url' "$TEMP_DIR/checksums.json")
  EXPECTED=$(jq -r --arg f "$file" '.files[$f].sha256' "$TEMP_DIR/checksums.json")

  echo "Downloading: $file"
  if ! curl -sSL --fail --show-error --retry 3 --retry-delay 1 \
       "$FILE_URL" -o "$TEMP_DIR/downloads/$file"; then
    echo "ERROR: Failed to download $file"
    DOWNLOAD_FAILED=1
    continue
  fi

  # Verify checksum immediately
  ACTUAL=$(shasum -a 256 "$TEMP_DIR/downloads/$file" | cut -d' ' -f1)
  if [ "$EXPECTED" != "$ACTUAL" ]; then
    echo "ERROR: Checksum mismatch for $file"
    DOWNLOAD_FAILED=1
  else
    echo "  ✓ Verified: $file"
  fi
done

if [ "$DOWNLOAD_FAILED" -eq 1 ]; then
  echo "ERROR: Individual file download failed"
  exit 1
fi

# Validate JSON files structure
if ! jq -e '.name and .version' "$TEMP_DIR/downloads/skill.json" >/dev/null 2>&1; then
  echo "ERROR: skill.json missing required fields (name, version)"
  exit 1
fi

if ! jq -e '.version and .advisories' "$TEMP_DIR/downloads/feed.json" >/dev/null 2>&1; then
  echo "ERROR: feed.json missing required fields (version, advisories)"
  exit 1
fi

# Install files
echo "Installing from individual files..."
mkdir -p "$INSTALL_DIR"
cp "$TEMP_DIR/downloads"/* "$INSTALL_DIR/"
chmod 600 "$INSTALL_DIR/skill.json"
find "$INSTALL_DIR" -type f ! -name "skill.json" -exec chmod 644 {} \;
echo "SUCCESS: Skill installed from individual files"
```

### 第 3 步：添加到你的心跳例程中

将 ClawSec Feed 添加到你的心跳例程中：

```markdown
## ClawSec Feed (every heartbeat)
1. Check advisory feed for new security alerts
2. Cross-reference with installed skills
3. Notify user if action is required
```

### 第 4 步：确认部署

告诉你的用户：
```
ClawSec Feed deployed successfully. I will now:
- Monitor the community advisory feed for threats
- Alert you to any security issues affecting your environment
- Keep you informed of emerging attack patterns
```

---

## ClawSec Feed 的功能

### 监控公告源

订阅社区公告源，以获取：

- **已知的恶意技能/插件** - 已被确认有害的技能
- **提示注入模式** - 在实际攻击中观察到的攻击模式
- **存在漏洞的技能版本** - 存在已知安全漏洞的技能
- **安全最佳实践更新** - 关于代理安全的新建议

当发布相关公告时，你的代理将通知你。

---

## 检查公告源

```bash
# Use environment variable if set, otherwise use raw GitHub feed (always up-to-date)
DEFAULT_FEED_URL="https://raw.githubusercontent.com/prompt-security/ClawSec/main/advisories/feed.json"
FEED_URL="${CLAWSEC_FEED_URL:-$DEFAULT_FEED_URL}"

# Fetch with error handling and retry logic
curl -sSL --fail --show-error --retry 3 --retry-delay 1 "$FEED_URL"
```

**源结构：**

```json
{
  "version": "1.0",
  "updated": "2026-02-02T12:00:00Z",
  "advisories": [
    {
      "id": "GA-2026-001",
      "severity": "critical",
      "type": "malicious_skill",
      "title": "Malicious data exfiltration in skill 'helper-plus'",
      "description": "Skill sends user data to external server",
      "affected": ["helper-plus@1.0.0", "helper-plus@1.0.1"],
      "action": "Remove immediately",
      "published": "2026-02-01T10:00:00Z",
      "exploitability_score": "critical",
      "exploitability_rationale": "Trivially exploitable through normal skill usage; no special conditions required. Active exploitation observed in the wild."
    }
  ]
}
```

---

## 解析源

### 获取公告数量

```bash
# Use environment variable if set, otherwise use raw GitHub feed (always up-to-date)
DEFAULT_FEED_URL="https://raw.githubusercontent.com/prompt-security/ClawSec/main/advisories/feed.json"
FEED_URL="${CLAWSEC_FEED_URL:-$DEFAULT_FEED_URL}"

TEMP_FEED=$(mktemp)
trap "rm -f '$TEMP_FEED'" EXIT

if ! curl -sSL --fail --show-error --retry 3 --retry-delay 1 "$FEED_URL" -o "$TEMP_FEED"; then
  echo "Error: Failed to fetch advisory feed"
  exit 1
fi

# Validate JSON before parsing
if ! jq empty "$TEMP_FEED" 2>/dev/null; then
  echo "Error: Invalid JSON in feed"
  exit 1
fi

FEED=$(cat "$TEMP_FEED")

# Get advisory count with error handling
COUNT=$(echo "$FEED" | jq '.advisories | length')
if [ $? -ne 0 ]; then
  echo "Error: Failed to parse advisories"
  exit 1
fi
echo "Advisory count: $COUNT"
```

### 获取严重公告

```bash
# Parse critical advisories with jq error handling
CRITICAL=$(echo "$FEED" | jq '.advisories[] | select(.severity == "critical")')
if [ $? -ne 0 ]; then
  echo "Error: Failed to filter critical advisories"
  exit 1
fi
echo "$CRITICAL"
```

### 获取过去 7 天的安全公告

```bash
# Use UTC timezone for consistent date handling
WEEK_AGO=$(TZ=UTC date -v-7d +%Y-%m-%dT00:00:00Z 2>/dev/null || TZ=UTC date -d '7 days ago' +%Y-%m-%dT00:00:00Z)
RECENT=$(echo "$FEED" | jq --arg since "$WEEK_AGO" '.advisories[] | select(.published > $since)')
if [ $? -ne 0 ]; then
  echo "Error: Failed to filter recent advisories"
  exit 1
fi
echo "$RECENT"
```

### 按可利用性评分筛选

共享的可利用性优先级指导文档维护于：

- [`wiki/exploitability-scoring.md`](../../wiki/exploitability-scoring.md)
- [`skills/clawsec-suite/SKILL.md`](../clawsec-suite/SKILL.md)（“快速检查订阅源”）

### 获取安全公告的可利用性上下文

```bash
# Show exploitability details for a specific CVE
CVE_ID="CVE-2026-27488"
echo "$FEED" | jq --arg cve "$CVE_ID" '.advisories[] | select(.id == $cve) | {
  id: .id,
  severity: .severity,
  exploitability_score: .exploitability_score,
  exploitability_rationale: .exploitability_rationale,
  title: .title
}'
```

### 按可利用性对安全公告排序

```bash
# Sort advisories by exploitability (critical → high → medium → low)
# This helps agents focus on the most immediately actionable threats
echo "$FEED" | jq '[.advisories[] | select(.exploitability_score != null)] |
  sort_by(
    if .exploitability_score == "critical" then 0
    elif .exploitability_score == "high" then 1
    elif .exploitability_score == "medium" then 2
    elif .exploitability_score == "low" then 3
    else 4 end
  )'
```

---

## 交叉引用已安装的技能

检查已安装的技能是否受到安全公告的影响：

```bash
# List your installed skills (adjust path for your platform)
INSTALL_DIR="${CLAWSEC_INSTALL_DIR:-$HOME/.openclaw/skills}"

# Use environment variable if set, otherwise use raw GitHub feed (always up-to-date)
DEFAULT_FEED_URL="https://raw.githubusercontent.com/prompt-security/ClawSec/main/advisories/feed.json"
FEED_URL="${CLAWSEC_FEED_URL:-$DEFAULT_FEED_URL}"

TEMP_FEED=$(mktemp)
trap "rm -f '$TEMP_FEED'" EXIT

if ! curl -sSL --fail --show-error --retry 3 --retry-delay 1 "$FEED_URL" -o "$TEMP_FEED"; then
  echo "Error: Failed to fetch advisory feed"
  exit 1
fi

# Validate and parse feed
if ! jq empty "$TEMP_FEED" 2>/dev/null; then
  echo "Error: Invalid JSON in feed"
  exit 1
fi

FEED=$(cat "$TEMP_FEED")
AFFECTED=$(echo "$FEED" | jq -r '.advisories[].affected[]?' 2>/dev/null | sort -u)
if [ $? -ne 0 ]; then
  echo "Error: Failed to parse affected skills from feed"
  exit 1
fi

# Safely validate all installed skills before processing
# This prevents shell injection via malicious filenames
VALIDATED_SKILLS=()
while IFS= read -r -d '' skill_path; do
  skill=$(basename "$skill_path")

  # Validate skill name BEFORE adding to array (prevents injection)
  if [[ "$skill" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    VALIDATED_SKILLS+=("$skill")
  else
    echo "Warning: Skipping invalid skill name: $skill" >&2
  fi
done < <(find "$INSTALL_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)

# Check each validated skill against affected list
# Use grep -qF for fixed string matching (prevents regex injection)
for skill in "${VALIDATED_SKILLS[@]}"; do
  # At this point, $skill is guaranteed to match ^[a-zA-Z0-9_-]+$
  if echo "$AFFECTED" | grep -qF "$skill"; then
    echo "WARNING: Installed skill '$skill' has a security advisory!"
    # Get advisory details for this skill
    echo "$FEED" | jq --arg s "$skill" '.advisories[] | select(.affected[] | contains($s))'
  fi
done
```

**如果发现受影响的技能：**
1. 查看安全公告，了解详细信息和严重性
2. 对于严重/高严重性问题，立即通知用户
3. 包含安全公告中的建议操作

---

## 安全公告类型

| 类型 | 描述 |
|------|-------------|
| `malicious_skill` | 被识别为具有恶意 intent 的技能 |
| `vulnerable_skill` | 存在安全漏洞的技能 |
| `prompt_injection` | 已知的提示注入模式 |
| `attack_pattern` | 观察到的攻击技术 |
| `best_practice` | 安全建议 |

---

## 严重性级别

| 严重性 | 所需操作 |
|----------|-----------------|
| `critical` | 立即通知用户并采取行动 |
| `high` | 尽快通知用户，并制定修复计划 |
| `medium` | 在下一次交互时通知 |
| `low` | 记录以供参考 |

---

## 优先处理高可利用性威胁

**重要：** 审查安全公告时，除了严重性之外，始终要根据**可利用性评分**进行优先级排序。可利用性评分表示漏洞在实践中被利用的难易程度，有助于你将注意力集中在最具可操作性的威胁上。

### 可利用性优先级

| 可利用性 | 含义 | 操作优先级 |
|----------------|---------|-----------------|
| `high` | 使用公开工具即可轻易或直接利用 | **立即通知** |
| `medium` | 可以利用，但需要特定条件 | **按标准通知** |
| `low` | 难以利用或仅停留在理论层面 | **低优先级通知** |

### 如何在通知中使用可利用性

1. **首先筛选高可利用性安全公告：**
   ```bash
   # 获取高可利用性安全公告
   echo "$FEED" | jq '.advisories[] | select(.exploitability_score == "high")'
   ```

2. **在通知中包含可利用性：**
   ```
   📡 ClawSec Feed: 高可利用性警报

   CRITICAL - CVE-2026-27488（可利用性：HIGH）
     → skill-loader v2.1.0 中存在可被轻易利用的 RCE
     → 已有公开的漏洞利用代码
     → 建议操作：立即移除或升级到 v2.1.1
   ```

3. **同时根据严重性和可利用性进行优先级排序：**
   - HIGH 严重性 + HIGH 可利用性的 CVE，比 CRITICAL 严重性 + LOW 可利用性的 CVE 更紧急
   - 将用户注意力集中在既严重又易于利用的威胁上
   - 包含可利用性方面的理由，帮助用户理解风险背景

### 通知优先级顺序示例

存在多个安全公告时，按以下顺序呈现：
1. **严重性为 Critical + 可利用性为 High** —— 最紧急
2. **严重性为 High + 可利用性为 High**
3. **严重性为 Critical + 可利用性为 Medium/Low**
4. **严重性为 High + 可利用性为 Medium/Low**
5. **严重性为 Medium/Low**（任意可利用性）

这样可以确保你优先向用户提示最具可操作性、最危险且需要立即处理的威胁。

---

## 何时通知用户

**立即通知（Critical）：**
- 影响已安装技能的新 Critical 安全公告
- 检测到正在进行的攻击
- **高可利用性评分**（无论严重性如何）

**尽快通知（高）：**
- 影响已安装技能的新高严重性安全公告
- 获取安全公告源失败（网络问题？）
- 高严重性但可利用性中等

**下次交互时通知（中）：**
- 新的中严重性安全公告
- 常规安全更新
- 可利用性低的安全公告

**仅记录（低/信息）：**
- 低严重性安全公告（用户询问时提及）
- 已检查安全公告源，没有新的安全公告
- 理论性漏洞（可利用性低、严重性低）

---

## 响应格式

### 如果有新的安全公告：

```
📡 ClawSec Feed: 自上次检查以来有 2 条新安全公告

CRITICAL - GA-2026-015: 恶意提示模式 "ignore-all"（可利用性：高）
  → 检测到提示注入技术。更新系统提示防御措施。
  → 可利用性：使用公开记录的技术即可轻松利用。

HIGH - GA-2026-016: 易受攻击的技能 "data-helper" v1.2.0（可利用性：中）
  → 你已安装此技能！建议操作：更新到 v1.2.1 或移除。
  → 可利用性：需要特定配置；无法轻易利用。
```

### 如果没有新内容：

```
FEED_OK - 已检查安全公告源，没有新的警报。📡
```

---

## 状态跟踪

跟踪上次检查安全公告源的时间，以识别新的安全公告：

```json
{
  "schema_version": "1.0",
  "last_feed_check": "2026-02-02T15:00:00Z",
  "last_feed_updated": "2026-02-02T12:00:00Z",
  "known_advisories": ["GA-2026-001", "GA-2026-002"]
}
```

保存到：`~/.openclaw/clawsec-feed-state.json`

### 状态文件操作

```bash
STATE_FILE="$HOME/.openclaw/clawsec-feed-state.json"

# Create state file with secure permissions if it doesn't exist
if [ ! -f "$STATE_FILE" ]; then
  echo '{"schema_version":"1.0","last_feed_check":null,"last_feed_updated":null,"known_advisories":[]}' > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
fi

# Validate state file before reading
if ! jq -e '.schema_version' "$STATE_FILE" >/dev/null 2>&1; then
  echo "Warning: State file corrupted or invalid schema. Creating backup and resetting."
  cp "$STATE_FILE" "${STATE_FILE}.bak.$(TZ=UTC date +%Y%m%d%H%M%S)"
  echo '{"schema_version":"1.0","last_feed_check":null,"last_feed_updated":null,"known_advisories":[]}' > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
fi

# Check for major version compatibility
SCHEMA_VER=$(jq -r '.schema_version // "0"' "$STATE_FILE")
if [[ "${SCHEMA_VER%%.*}" != "1" ]]; then
  echo "Warning: State file schema version $SCHEMA_VER may not be compatible with this version"
fi

# Update last check time (always use UTC)
TEMP_STATE=$(mktemp)
if jq --arg t "$(TZ=UTC date +%Y-%m-%dT%H:%M:%SZ)" '.last_feed_check = $t' "$STATE_FILE" > "$TEMP_STATE"; then
  mv "$TEMP_STATE" "$STATE_FILE"
  chmod 600 "$STATE_FILE"
else
  echo "Error: Failed to update state file"
  rm -f "$TEMP_STATE"
fi
```

---

## 速率限制

**重要：** 为避免向安全公告源服务器发送过多请求，请遵循以下指南：

| 检查类型 | 建议间隔 | 最小间隔 |
|------------|---------------------|------------------|
| 心跳检查 | 每 15-30 分钟 | 5 分钟 |
| 完整安全公告源刷新 | 每 1-4 小时 | 30 分钟 |
| 交叉引用扫描 | 每个会话一次 | 5 分钟 |

```bash
# Check if enough time has passed since last check
STATE_FILE="$HOME/.openclaw/clawsec-feed-state.json"
MIN_INTERVAL_SECONDS=300  # 5 minutes

LAST_CHECK=$(jq -r '.last_feed_check // "1970-01-01T00:00:00Z"' "$STATE_FILE" 2>/dev/null)
LAST_EPOCH=$(TZ=UTC date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_CHECK" +%s 2>/dev/null || date -d "$LAST_CHECK" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(TZ=UTC date +%s)

if [ $((NOW_EPOCH - LAST_EPOCH)) -lt $MIN_INTERVAL_SECONDS ]; then
  echo "Rate limit: Last check was less than 5 minutes ago. Skipping."
  exit 0
fi
```

---

## 环境变量（可选）

| 变量 | 描述 | 默认值 |
|----------|-------------|---------|
| `CLAWSEC_FEED_URL` | 自定义公告源 URL | Consolidated signed feed |
| `CLAWSEC_INSTALL_DIR` | 安装目录 | `~/.openclaw/skills/clawsec-feed` |

---

## 更新 ClawSec Feed

检查并安装较新版本：

```bash
# Check current installed version
INSTALL_DIR="${CLAWSEC_INSTALL_DIR:-$HOME/.openclaw/skills/clawsec-feed}"
CURRENT_VERSION=$(jq -r '.version' "$INSTALL_DIR/skill.json" 2>/dev/null || echo "unknown")
echo "Installed version: $CURRENT_VERSION"

# Check latest available version
LATEST_URL="https://api.github.com/repos/prompt-security/ClawSec/releases"
LATEST_VERSION=$(curl -sSL --fail --show-error --retry 3 --retry-delay 1 "$LATEST_URL" 2>/dev/null | \
  jq -r '[.[] | select(.tag_name | startswith("clawsec-feed-v"))][0].tag_name // empty' | \
  sed 's/clawsec-feed-v//')

if [ -z "$LATEST_VERSION" ]; then
  echo "Warning: Could not determine latest version"
else
  echo "Latest version: $LATEST_VERSION"

  if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "Update available! Run the deployment steps with the new version."
  else
    echo "You are running the latest version."
  fi
fi
```

---

## 初始下载完整性

**引导信任问题：** 此技能的初始下载无法由技能本身进行验证。要建立信任：

1. **验证源 URL** - 确保你是从 `https://clawsec.prompt.security` 下载的
2. **检查发布签名** - GitHub 会为我们的发布版本签名；请验证该发布版本是否与校验和一致。
3. **比较校验和** - 下载后，将 SHA-256 哈希值与已发布的 `checksums.json` 进行比较：

```bash
# After downloading SKILL.md, verify its integrity
EXPECTED_HASH="<hash-from-checksums.json>"
ACTUAL_HASH=$(shasum -a 256 SKILL.md | cut -d' ' -f1)

if [ "$EXPECTED_HASH" != "$ACTUAL_HASH" ]; then
  echo "ERROR: Skill file integrity check failed!"
  echo "This file may have been tampered with. Do not proceed."
  exit 1
fi
```

**注意：** 为获得最大程度的安全性，请通过单独的可信渠道验证 checksums.json（例如直接从 GitHub 发布页面 UI 获取，而不是通过 curl 获取）。

---

## 相关技能

- **openclaw-audit-watchdog** - 自动执行每日安全审计
- **clawtributor** - 向社区报告漏洞

---

## 许可证

GNU AGPL v3.0 或更高版本 - 详情请参阅仓库。

由 [Prompt Security](https://prompt.security) 团队和智能体社区使用 📡 构建。