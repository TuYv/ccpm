---
name: clawsec-suite
version: 0.1.16
description: ClawSec suite manager with embedded advisory-feed monitoring, cryptographic signature verification, approval-gated malicious-skill response, and guided setup for additional security skills.
homepage: https://clawsec.prompt.security
clawdis:
  emoji: "📦"
  requires:
    bins: [node, npx, openclaw, curl, jq, shasum, openssl, unzip]
---
# ClawSec Suite

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill clawsec-suite -a openclaw -y
```

## 运行说明

- 必需的运行时：`node`、`npx`、`openclaw`、`curl`、`jq`、`shasum`、`openssl`、`unzip`
- 副作用：设置脚本会在 `~/.openclaw/hooks` 下安装一个咨询性钩子，可选创建无人值守的 `openclaw cron` 任务，并使用 `npx clawhub@latest install` 执行受保护的安装
- 网络行为：除非固定使用本地路径，否则会获取已签名的咨询信息源构件和远程目录元数据
- 信任模型：该套件可以建议移除或阻止风险安装，但移除/安装覆盖操作仍需经过批准

这意味着 `clawsec-suite` 可以：
- 监控 ClawSec 咨询信息源，
- 跟踪自上次检查以来新增的咨询信息，
- 将咨询信息与本地已安装的 skills 进行交叉引用，
- 针对恶意 skill 咨询信息建议移除，并首先要求用户明确批准，
- 同时继续作为其他 ClawSec 防护措施的设置/管理入口。

## 内置与可选防护措施

### 内置于 clawsec-suite
- 嵌入式已签名咨询信息信任集：`advisories/feed.json`、`feed.json.sig`、`checksums.json`、`checksums.json.sig` 和 `feed-signing-public.pem`
- `HEARTBEAT.md` 中的可移植心跳工作流
- 咨询信息轮询 + 状态跟踪 + 受影响 skill 检查
- OpenClaw 咨询信息守护钩子包：`hooks/clawsec-advisory-guardian/`
- 用于钩子和可选 cron 调度的设置脚本：`scripts/`
- 受保护的安装器：`scripts/guarded_skill_install.mjs`
- 用于发现可安装 skills 的动态目录发现工具：`scripts/discover_skill_catalog.mjs`

### 单独安装（动态目录）
`clawsec-suite` 不会在本文档中硬编码附加 skill 名称。

在运行时从权威索引（`https://clawsec.prompt.security/skills/index.json`）发现当前目录：

```bash
SUITE_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-suite"
node "$SUITE_DIR/scripts/discover_skill_catalog.mjs"
```

回退行为：
- 如果远程目录索引可访问且有效，套件会使用该索引。
- 如果远程索引不可用或格式错误，脚本会回退到 `skill.json` 中套件本地的目录元数据。

## 安装

### 跨 shell 路径说明

- 在 `bash`/`zsh` 中，保持路径变量可展开（例如 `INSTALL_ROOT="$HOME/.openclaw/skills"`）。
- 不要对 home 变量路径使用单引号（避免使用 `'$HOME/.openclaw/skills'`）。
- 在 PowerShell 中，设置显式路径：
  - `$env:INSTALL_ROOT = Join-Path $HOME ".openclaw\\skills"`
- 如果传入的路径包含未解析的 token（如 `\$HOME/...`），套件脚本现在会快速失败并显示明确错误。

### 选项 A：通过 clawhub（推荐）

```bash
npx clawhub@latest install clawsec-suite
```

### 选项 B：通过签名 + 校验和验证手动下载

```bash
set -euo pipefail

VERSION="${SKILL_VERSION:?Set SKILL_VERSION (e.g. 0.0.8)}"
INSTALL_ROOT="${INSTALL_ROOT:-$HOME/.openclaw/skills}"
DEST="$INSTALL_ROOT/clawsec-suite"
BASE="https://github.com/prompt-security/clawsec/releases/download/clawsec-suite-v${VERSION}"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

# Pinned release-signing public key (verify fingerprint out-of-band on first use)
# Fingerprint (SHA-256 of SPKI DER): 711424e4535f84093fefb024cd1ca4ec87439e53907b305b79a631d5befba9c8
RELEASE_PUBKEY_SHA256="711424e4535f84093fefb024cd1ca4ec87439e53907b305b79a631d5befba9c8"
cat > "$TEMP_DIR/release-signing-public.pem" <<'PEM'
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAS7nijfMcUoOBCj4yOXJX+GYGv2pFl2Yaha1P4v5Cm6A=
-----END PUBLIC KEY-----
PEM

ACTUAL_KEY_SHA256="$(openssl pkey -pubin -in "$TEMP_DIR/release-signing-public.pem" -outform DER | shasum -a 256 | awk '{print $1}')"
if [ "$ACTUAL_KEY_SHA256" != "$RELEASE_PUBKEY_SHA256" ]; then
  echo "ERROR: Release public key fingerprint mismatch" >&2
  exit 1
fi

ZIP_NAME="clawsec-suite-v${VERSION}.zip"

# 1) Download release archive + signed checksums manifest + signing public key
curl -fsSL "$BASE/$ZIP_NAME" -o "$TEMP_DIR/$ZIP_NAME"
curl -fsSL "$BASE/checksums.json" -o "$TEMP_DIR/checksums.json"
curl -fsSL "$BASE/checksums.sig" -o "$TEMP_DIR/checksums.sig"

# 2) Verify checksums manifest signature before trusting any hashes
openssl base64 -d -A -in "$TEMP_DIR/checksums.sig" -out "$TEMP_DIR/checksums.sig.bin"
if ! openssl pkeyutl -verify \
  -pubin \
  -inkey "$TEMP_DIR/release-signing-public.pem" \
  -sigfile "$TEMP_DIR/checksums.sig.bin" \
  -rawin \
  -in "$TEMP_DIR/checksums.json" >/dev/null 2>&1; then
  echo "ERROR: checksums.json signature verification failed" >&2
  exit 1
fi

EXPECTED_ZIP_SHA="$(jq -r '.archive.sha256 // empty' "$TEMP_DIR/checksums.json")"
if [ -z "$EXPECTED_ZIP_SHA" ]; then
  echo "ERROR: checksums.json missing archive.sha256" >&2
  exit 1
fi

if command -v shasum >/dev/null 2>&1; then
  ACTUAL_ZIP_SHA="$(shasum -a 256 "$TEMP_DIR/$ZIP_NAME" | awk '{print $1}')"
else
  ACTUAL_ZIP_SHA="$(sha256sum "$TEMP_DIR/$ZIP_NAME" | awk '{print $1}')"
fi

if [ "$EXPECTED_ZIP_SHA" != "$ACTUAL_ZIP_SHA" ]; then
  echo "ERROR: Archive checksum mismatch for $ZIP_NAME" >&2
  exit 1
fi

echo "Checksums manifest signature and archive hash verified."

# 3) Install verified archive
mkdir -p "$INSTALL_ROOT"
rm -rf "$DEST"
unzip -q "$TEMP_DIR/$ZIP_NAME" -d "$INSTALL_ROOT"

chmod 600 "$DEST/skill.json"
find "$DEST" -type f ! -name "skill.json" -exec chmod 644 {} \;

echo "Installed clawsec-suite v${VERSION} to: $DEST"
echo "Next step (OpenClaw): node \"\$DEST/scripts/setup_advisory_hook.mjs\""
```

## OpenClaw 自动化（Hook + 可选 Cron）

安装套件后，启用 advisory guardian hook：

```bash
SUITE_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-suite"
node "$SUITE_DIR/scripts/setup_advisory_hook.mjs"
```

安装并启用持久化 hook 前，设置脚本会输出预检审查结果。

可选：创建或更新一个定期 cron 提醒（默认每隔 `6h`），触发主会话 advisory 扫描：

```bash
SUITE_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-suite"
node "$SUITE_DIR/scripts/setup_advisory_cron.mjs"
```

创建或更新无人值守任务前，cron 设置脚本会输出预检审查结果。

此功能会：
- 在 `agent:bootstrap` 和 `/new`（`command:new`）时执行扫描，
- 将 advisory 的 `affected` 条目与已安装的技能进行比对，
- 处理包含 `application: "openclaw"` 的 advisory（以及为保持向后兼容而处理不含 `application` 的旧条目），
- 在出现新的匹配项时发出通知，
- 并在执行任何移除流程前请求用户明确批准。

启用 hook 后重启 OpenClaw 网关。然后运行一次 `/new`，以便在下一个会话上下文中强制立即执行扫描。

## 受保护的技能安装流程（双重确认）

当用户请求安装技能时，将其视为第一次请求，并运行受保护的安装检查：

```bash
SUITE_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-suite"
node "$SUITE_DIR/scripts/guarded_skill_install.mjs" --skill helper-plus --version 1.0.1
```

行为：
- 如果未找到 advisory 匹配项，则继续安装。
- 如果省略 `--version`，匹配将采用保守策略：任何引用该技能名称的 advisory 都会被视为匹配项。
- 如果找到 advisory 匹配项，脚本会输出 advisory 上下文，并以代码 `42` 退出。
- 然后要求用户进行明确的第二次确认，并使用 `--confirm-advisory` 重新运行：

```bash
node "$SUITE_DIR/scripts/guarded_skill_install.mjs" --skill helper-plus --version 1.0.1 --confirm-advisory
```

这将强制执行：
1. 第一次确认：用户请求安装。
2. 第二次确认：用户查看 advisory 详情后，明确批准安装。

## 内置 Advisory Feed 行为

内置 feed 逻辑使用以下默认值：

- 远程整合 feed URL：`https://clawsec.prompt.security/advisories/feed.json`
- Feed 内容：NVD CVE、经批准的社区 advisory，以及不含 CVE 的临时 GHSA advisory。
- 远程 feed 签名 URL：`${CLAWSEC_FEED_URL}.sig`（使用 `CLAWSEC_FEED_SIG_URL` 覆盖）
- 远程校验和清单 URL：同级目录下的 `checksums.json`（使用 `CLAWSEC_FEED_CHECKSUMS_URL` 覆盖）
- 本地种子回退：`~/.openclaw/skills/clawsec-suite/advisories/feed.json`
- 本地 feed 签名：`${CLAWSEC_LOCAL_FEED}.sig`（使用 `CLAWSEC_LOCAL_FEED_SIG` 覆盖）
- 本地校验和清单：`~/.openclaw/skills/clawsec-suite/advisories/checksums.json`
- 固定的 feed 签名密钥：`~/.openclaw/skills/clawsec-suite/advisories/feed-signing-public.pem`（使用 `CLAWSEC_FEED_PUBLIC_KEY` 覆盖）
- 状态文件：`~/.openclaw/clawsec-suite-feed-state.json`
- Hook 速率限制环境变量（OpenClaw hook）：`CLAWSEC_HOOK_INTERVAL_SECONDS`（默认值为 `300`）。

**故障安全验证：**默认要求 Feed 签名。当存在配套的校验和构件时，会验证校验和清单。只有在上游尚未提供已签名的 Feed 构件、而你正在采用此版本时，才可将 `CLAWSEC_ALLOW_UNSIGNED_FEED=1` 设置为临时迁移绕过选项。

### 快速 Feed 检查

```bash
FEED_URL="${CLAWSEC_FEED_URL:-https://clawsec.prompt.security/advisories/feed.json}"
STATE_FILE="${CLAWSEC_SUITE_STATE_FILE:-$HOME/.openclaw/clawsec-suite-feed-state.json}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if ! curl -fsSLo "$TMP/feed.json" "$FEED_URL"; then
  echo "ERROR: Failed to fetch advisory feed"
  exit 1
fi

if ! jq -e '.version and (.advisories | type == "array")' "$TMP/feed.json" >/dev/null; then
  echo "ERROR: Invalid advisory feed format"
  exit 1
fi

mkdir -p "$(dirname "$STATE_FILE")"
if [ ! -f "$STATE_FILE" ]; then
  echo '{"schema_version":"1.0","known_advisories":[],"last_feed_check":null,"last_feed_updated":null}' > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
fi

NEW_IDS_FILE="$TMP/new_ids.txt"
jq -r --argfile state "$STATE_FILE" '($state.known_advisories // []) as $known | [.advisories[]?.id | select(. != null and ($known | index(.) | not))] | .[]?' "$TMP/feed.json" > "$NEW_IDS_FILE"

if [ -s "$NEW_IDS_FILE" ]; then
  echo "New advisories detected:"
  while IFS= read -r id; do
    [ -z "$id" ] && continue
    jq -r --arg id "$id" '.advisories[] | select(.id == $id) | "- [\(.severity | ascii_upcase)] \(.id): \(.title)"' "$TMP/feed.json"
    jq -r --arg id "$id" '.advisories[] | select(.id == $id) | "  Exploitability: \(.exploitability_score // "unknown" | ascii_upcase)"' "$TMP/feed.json"
  done < "$NEW_IDS_FILE"
else
  echo "FEED_OK - no new advisories"
fi
```

## 可利用性上下文

Feed 中的公告可以包含 `exploitability_score` 和 `exploitability_rationale` 字段，帮助代理按照现实世界威胁的优先级进行处理：

- **可利用性评分**：`high`、`medium`、`low` 或 `unknown`
- **结合上下文的评估**：会考虑攻击向量、身份验证要求以及 AI 代理的部署模式
- **漏洞利用可用性**：检测公开漏洞利用代码及其武器化状态

处理公告时，除了严重性之外，还应根据可利用性确定优先级。HIGH 严重性 + HIGH 可利用性的 CVE，比 CRITICAL 严重性 + LOW 可利用性的 CVE 更为紧急。

如需了解详细方法，请参阅[可利用性评分文档](../../wiki/exploitability-scoring.md)。

## 心跳集成

使用套件心跳脚本作为唯一的定期安全检查入口：

- `skills/clawsec-suite/HEARTBEAT.md`

它负责处理：
- 套件更新检查，
- Feed 轮询，
- 新公告检测，
- 受影响技能交叉引用，
- 针对恶意/建议移除公告的需审批响应指导，
- 以及持久化状态更新。

## 需审批的响应约定

如果公告表明某个技能为恶意技能或建议移除该技能，且该技能已安装：

1. 立即向用户告知公告详情和严重性。
2. 建议移除或禁用受影响的技能。
3. 将原始安装请求仅视为第一意图。
4. 在执行删除/禁用操作之前（或继续进行有风险的安装之前），要求用户明确进行第二次确认。
5. 只有在获得第二次确认后才能继续。

套件钩子和心跳检测指南默认采用非破坏性设计。

## 建议抑制 / 允许列表

建议守护程序流水线支持对已由安全团队审查并接受的建议进行选择性抑制。这对于第一方工具，或不适用于你的部署环境的建议非常有用。

### 激活

建议抑制只需要一个开关：配置文件必须包含 `"enabledFor"`，且其数组中包含 `"advisory"`。无需使用 CLI 标志——配置文件中的哨兵值本身就是选择启用的开关。

如果缺少 `enabledFor` 数组、数组为空，或不包含 `"advisory"`，则所有建议都会照常报告。

### 配置文件解析（4 层）

建议守护程序按照与审计流水线相同的优先级顺序解析抑制配置：

1. 显式的 `--config <path>` 参数
2. `OPENCLAW_AUDIT_CONFIG` 环境变量
3. `~/.openclaw/security-audit.json`
4. `.clawsec/allowlist.json`

### 配置格式

```json
{
  "enabledFor": ["advisory"],
  "suppressions": [
    {
      "checkId": "CVE-2026-25593",
      "skill": "clawsec-suite",
      "reason": "First-party security tooling — reviewed by security team",
      "suppressedAt": "2026-02-15"
    },
    {
      "checkId": "CLAW-2026-0001",
      "skill": "example-skill",
      "reason": "Advisory does not apply to our deployment configuration",
      "suppressedAt": "2026-02-16"
    }
  ]
}
```

### 哨兵语义

- `"enabledFor": ["advisory"]` -- 仅启用建议抑制
- `"enabledFor": ["audit"]` -- 仅启用审计抑制（对建议流水线无影响）
- `"enabledFor": ["audit", "advisory"]` -- 两条流水线都遵循抑制设置
- 缺少或为空的 `enabledFor` -- 不启用抑制（安全默认值）

### 匹配规则

- **checkId：** 与建议 ID 精确匹配（例如 `CVE-2026-25593` 或 `CLAW-2026-0001`）
- **skill：** 与建议中受影响的技能名称进行不区分大小写的匹配
- 两个字段都必须匹配，建议才会被抑制

### 每个抑制条目的必填字段

| 字段 | 描述 | 示例 |
|-------|-------------|---------|
| `checkId` | 要抑制的建议 ID | `CVE-2026-25593` |
| `skill` | 受影响的技能名称 | `clawsec-suite` |
| `reason` | 用于审计追踪的理由（必填） | `First-party tooling, reviewed by security team` |
| `suppressedAt` | ISO 8601 日期（YYYY-MM-DD） | `2026-02-15` |

### 与审计流水线共享配置

建议流水线和审计流水线共享同一个配置文件。使用 `enabledFor` 数组控制哪些流水线遵循抑制列表：

```json
{
  "enabledFor": ["audit", "advisory"],
  "suppressions": [
    {
      "checkId": "skills.code_safety",
      "skill": "clawsec-suite",
      "reason": "First-party tooling — audit finding accepted",
      "suppressedAt": "2026-02-15"
    },
    {
      "checkId": "CVE-2026-25593",
      "skill": "clawsec-suite",
      "reason": "First-party tooling — advisory reviewed",
      "suppressedAt": "2026-02-15"
    }
  ]
}
```

审计条目（带有类似 `skills.code_safety` 的检查标识符）仅由审计管道匹配。建议条目（带有类似 `CVE-2026-25593` 或 `CLAW-2026-0001` 的建议 ID）仅由建议管道匹配。每个管道都会筛选与自身相关的条目。

## 可选技能安装

动态发现当前可用的可安装技能，然后安装所需的技能：

```bash
SUITE_DIR="${INSTALL_ROOT:-$HOME/.openclaw/skills}/clawsec-suite"
node "$SUITE_DIR/scripts/discover_skill_catalog.mjs"

# then install any discovered skill by name
npx clawhub@latest install <skill-name>
```

也可以获取供自动化使用的机器可读输出：

```bash
node "$SUITE_DIR/scripts/discover_skill_catalog.mjs" --json
```

## 安全注意事项

- 始终先验证 `checksums.json` 的签名，然后再信任其中的文件 URL/哈希值；之后验证每个文件的校验和。
- 验证建议源的分离签名；不要在临时迁移窗口之外启用 `CLAWSEC_ALLOW_UNSIGNED_FEED`。
- 限制建议轮询速率（两次检查之间至少间隔 5 分钟）。
- 将影响已安装技能的 `critical` 和 `high` 建议视为需要立即处理的事项。
- 如果从独立的 `clawsec-feed` 迁移出去，请保留一个规范状态文件，以避免重复通知。
- 在首次使用前，通过带外方式固定并验证公钥指纹。