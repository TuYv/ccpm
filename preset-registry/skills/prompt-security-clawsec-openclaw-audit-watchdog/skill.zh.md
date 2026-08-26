---
name: openclaw-audit-watchdog
version: 0.1.9
description: Automated daily security audits for OpenClaw agents with DM delivery and optional email reporting. Runs deep audits, creates or updates a recurring cron job, and sends formatted reports to configured recipients.
homepage: https://clawsec.prompt.security
metadata:
  openclaw:
    emoji: "🔭"
    category: "security"
    requires:
      bins: [bash, openclaw, node]
      env: [PROMPTSEC_DM_CHANNEL, PROMPTSEC_DM_TO]
    envVars:
      - name: PROMPTSEC_DM_CHANNEL
        required: true
        description: Delivery channel for cron output.
      - name: PROMPTSEC_DM_TO
        required: true
        description: Delivery recipient id/handle.
      - name: PROMPTSEC_EMAIL_TO
        required: false
        description: Optional email copy destination.
clawdis:
  emoji: "🔭"
  requires:
    bins: [bash, openclaw, node]
    env: [PROMPTSEC_DM_CHANNEL, PROMPTSEC_DM_TO]
---
# Prompt 安全审计（openclaw）

## Vercel Skills 安装

使用 Vercel Skills CLI 为此 harness 安装：

```bash
npx skills add prompt-security/clawsec --skill openclaw-audit-watchdog -a openclaw -y
```

## 安装选项

你可以通过两种方式获取 openclaw-audit-watchdog：

### 选项 A：随 ClawSec Suite 捆绑安装（推荐）

**如果你已经安装了 clawsec-suite，可能已经拥有此组件！**

Openclaw-audit-watchdog 与 ClawSec Suite 捆绑提供关键的自动化安全审计功能。安装套件时，如果你尚未安装 audit watchdog，它将从捆绑副本中部署。

**优势：**
- 方便 - 无需单独下载
- 标准位置 - 安装到 `~/.openclaw/skills/openclaw-audit-watchdog/`
- 保留现有安装 - 如果你已经安装了 audit watchdog，则不会覆盖
- 一次验证 - 作为套件包的一部分进行完整性检查

### 选项 B：独立安装（本页面）

独立安装 openclaw-audit-watchdog，无需安装完整套件。

**适合使用独立安装的情况：**
- 你只需要 audit watchdog（不需要套件的其他组件）
- 你希望在安装套件之前先进行安装
- 你更倾向于明确控制 audit watchdog 的安装过程

**优势：**
- 安装更轻量
- 独立于套件
- 直接控制安装过程

独立安装通常需要从已发布的 GitHub release 下载。将其安装到生产主机之前，请验证 release 来源和归档完整性。

继续阅读下方的独立安装说明。

---

## Release Artifact 验证

对于独立安装，请先验证已签名的 release manifest，然后再信任 `SKILL.md`、`skill.json` 或归档。`skill.json` 文件是软件包元数据/SBOM 的来源，release pipeline 使用 ClawSec release key 对 `checksums.json` 进行签名。

```bash
set -euo pipefail

SKILL_NAME="openclaw-audit-watchdog"
VERSION="0.1.9"
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

仅在此验证成功后安装或提取归档。

## 运行要求

必需运行时：
- `openclaw`
- `node`
- `bash`

可选运行时：
- 用于本地 MTA 投递的 `sendmail`
- 通过 `PROMPTSEC_SMTP_HOST` / `PROMPTSEC_SMTP_PORT` 配置的 SMTP 中继
- 仅当 `PROMPTSEC_GIT_PULL=1` 时需要 `git`

此 skill 默认不会始终启用，但调用后会创建或更新一个无人值守的 `openclaw cron` 任务。启用前，请检查已配置的 DM/电子邮件收件人，以及主机的 `openclaw`/SMTP 环境。

## 目标

创建（或更新）一个每日运行的 cron 任务，该任务：

1) 运行：
- `openclaw security audit --json`
- `openclaw security audit --deep --json`

2) 汇总发现结果（critical/warn/info + 主要发现）

3) 将报告发送至：
- 用户选择的 DM 目标（channel + recipient id/handle）
- 仅当配置了 `PROMPTSEC_EMAIL_TO` 时，才发送至可选的电子邮件收件人

默认计划：在所选时区每天 **23:00（晚上 11 点）** 运行。

投递方式：
- DM 发送至已配置的目标
- 仅当明确配置了收件人时才发送电子邮件
- 通过 `openclaw cron` 持久化（无人值守的重复任务）

## 使用示例

### 示例 1：快速开始（环境变量）

对于自动化/MDM 部署，请在调用前设置环境变量：

```bash
export PROMPTSEC_DM_CHANNEL="telegram"
export PROMPTSEC_DM_TO="@yourhandle"
export PROMPTSEC_EMAIL_TO="security@yourcompany.com" # optional
export PROMPTSEC_TZ="America/New_York"
export PROMPTSEC_HOST_LABEL="prod-server-01"

# Then invoke the skill
/openclaw-audit-watchdog
```

该 skill 将自动配置并创建 cron 任务，无需提示。如果省略 `PROMPTSEC_EMAIL_TO`，任务将仅发送 DM。

### 示例 2：交互式设置

如果未设置环境变量，该 skill 将进行最少量的提示：

```
User: /openclaw-audit-watchdog

Agent: Setting up daily security audit watchdog...
       What channel should I use for delivery? (e.g., telegram, slack)
User: telegram

Agent: What's the recipient ID or handle?
User: @myhandle

Agent: Optional email recipient? (leave blank to disable email)
User: security@yourcompany.com

Agent: Which timezone for the 23:00 daily run? (default: UTC)
User: America/Los_Angeles

Agent: ✓ Created cron job "Daily security audit (Prompt Security)"
       Schedule: Daily at 23:00 America/Los_Angeles
       Delivery: telegram → @myhandle, email → security@yourcompany.com
```

### 示例 3：更新现有任务

如果任务已经存在，该 skill 会更新它，而不是创建重复任务：

```
User: /openclaw-audit-watchdog

Agent: Found existing "Daily security audit (Prompt Security)" job.
       Current: Daily at 23:00 UTC → telegram:@oldhandle

       Update delivery target? (current: telegram:@oldhandle)
User: slack:#security-alerts

Agent: ✓ Updated cron job
       Schedule: Daily at 23:00 UTC
       Delivery: slack:#security-alerts
```

### 示例 4：投递的内容

每天在计划时间，你会收到类似以下内容的报告：

```
🔭 Daily Security Audit Report
Host: prod-server-01
Time: 2026-02-16 23:00:00 America/New_York

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Standard Audit: 12 checks passed, 2 warnings
✓ Deep Audit: 8 probes passed, 1 critical

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CRIT-001] Unencrypted API Keys Detected
→ Remediation: Move credentials to encrypted vault or use environment variables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[WARN-003] Outdated Dependencies Found
→ Remediation: Run `openclaw security audit --fix` to update

[WARN-007] Weak Permission on Config File
→ Remediation: chmod 600 ~/.openclaw/config.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run `openclaw security audit --deep` for full details.
```

### 示例 5：自定义计划

想要使用不同的计划？请在调用前进行设置：

```bash
# 每 6 小时运行一次，而不是每天运行
export PROMPTSEC_SCHEDULE="0 */6 * * *"
/openclaw-audit-watchdog
```

### 示例 6：多个环境

要管理多台服务器，请使用不同的主机标签：

```bash
# 在开发服务器上
export PROMPTSEC_HOST_LABEL="dev-01"
export PROMPTSEC_DM_TO="@dev-team"
/openclaw-audit-watchdog

# 在生产服务器上
export PROMPTSEC_HOST_LABEL="prod-01"
export PROMPTSEC_DM_TO="@oncall"
/openclaw-audit-watchdog
```

每台服务器都会发送带有明确主机标识的报告。

### 示例 7：抑制已知发现

要抑制已审核并接受的审计发现，请传入 `--enable-suppressions` 标志，并确保配置文件包含 `"enabledFor": ["audit"]` 标记：

```bash
# 创建或编辑抑制配置
cat > ~/.openclaw/security-audit.json <<'JSON'
{
  "enabledFor": ["audit"],
  "suppressions": [
    {
      "checkId": "skills.code_safety",
      "skill": "clawsec-suite",
      "reason": "First-party security tooling — reviewed by security team",
      "suppressedAt": "2026-02-15"
    }
  ]
}
JSON

# 启用抑制后运行
/openclaw-audit-watchdog --enable-suppressions
```

被抑制的发现仍会出现在报告的信息性部分中，但不会计入严重问题/警告总数。

## 抑制 / 允许列表

审计管道支持一种选择性启用的抑制机制，用于管理已审核的发现。抑制机制采用纵深防御式激活方式：两个独立的门控条件都必须满足。

### 激活要求

1. **CLI 标志：** 调用时必须传入 `--enable-suppressions` 标志。
2. **配置标记：** 配置文件必须包含 `"enabledFor"`，且数组中必须有 `"audit"`。

如果任一门控条件缺失，所有发现都会照常报告，并忽略抑制列表。

### 配置文件解析顺序（4 级）

1. 显式传入的 `--config <path>` 参数
2. `OPENCLAW_AUDIT_CONFIG` 环境变量
3. `~/.openclaw/security-audit.json`
4. `.clawsec/allowlist.json`

### 配置格式

```json
{
  "enabledFor": ["audit"],
  "suppressions": [
    {
      "checkId": "skills.code_safety",
      "skill": "clawsec-suite",
      "reason": "First-party security tooling — reviewed by security team",
      "suppressedAt": "2026-02-15"
    }
  ]
}
```

### 标记语义

- `"enabledFor": ["audit"]` -- 审计抑制已激活（还必须传入 `--enable-suppressions` 标志）
- `"enabledFor": ["advisory"]` -- 仅启用建议管道抑制（对审计没有影响）
- `"enabledFor": ["audit", "advisory"]` -- 两个管道都会遵循抑制设置
- 缺少或为空的 `enabledFor` -- 未激活任何抑制（安全默认值）

### 匹配规则

- **checkId：** 与审计发现的检查标识符精确匹配（例如 `skills.code_safety`）
- **skill：** 与发现中的技能名称进行不区分大小写的匹配
- 两个字段都必须匹配，发现才会被抑制

## 安装流程（交互式）

配置（适合 MDM）：优先使用环境变量（不进行提示）。

必需环境变量：
- `PROMPTSEC_DM_CHANNEL`（例如 `telegram`）
- `PROMPTSEC_DM_TO`（收件人 id）

可选环境变量：
- `PROMPTSEC_EMAIL_TO`（邮件收件人；未设置时，邮件发送保持禁用）
- `PROMPTSEC_TZ`（IANA 时区；默认为 `UTC`）
- `PROMPTSEC_HOST_LABEL`（报告中包含的标签；默认使用 `hostname`）
- `PROMPTSEC_INSTALL_DIR`（cron 负载用于在运行 runner 前执行 `cd` 的稳定路径；默认：`~/.config/security-checkup`）
- `PROMPTSEC_GIT_PULL=1`（如果从 git 安装，runner 将执行 `git pull --ff-only`）
- `OPENCLAW_AUDIT_CONFIG`（要持久化到 cron 负载中的抑制配置路径）
- `PROMPTSEC_SENDMAIL_BIN`（显式指定的 sendmail 路径）
- `PROMPTSEC_SMTP_HOST`、`PROMPTSEC_SMTP_PORT`、`PROMPTSEC_SMTP_HELO`、`PROMPTSEC_SMTP_FROM`（SMTP 中继设置）

路径展开规则（重要）：
- 在 `bash`/`zsh` 中，使用 `PROMPTSEC_INSTALL_DIR="$HOME/.config/security-checkup"`（或绝对路径）。
- 不要传入类似 `'$HOME/.config/security-checkup'` 的单引号字面量。
- 在 PowerShell 上，优先使用：`$env:PROMPTSEC_INSTALL_DIR = Join-Path $HOME ".config/security-checkup"`。
- 如果路径解析失败，setup 现在会退出并显示明确错误，而不是创建包含字面量 `$HOME` 的目录层级。

只有在环境变量或默认值均未设置时，才将交互式安装作为最后手段。尽量减少提示：DM 目标为必需项，电子邮件为可选项，并且在启用持久化之前，应向用户显示简洁的预检审查结果。

## 创建 cron 任务

使用 `cron` 工具创建任务，并设置：

- `schedule.kind="cron"`
- `schedule.expr="0 23 * * *"`
- `schedule.tz=<installer tz>`
- `sessionTarget="isolated"`
- `wakeMode="now"`
- `payload.kind="agentTurn"`
- `payload.deliver=true`

在创建或更新任务之前，打印预检审查结果，并明确说明：
- 此操作会创建或更新一个无人值守的周期性任务；
- 所需运行时（`openclaw`、`node`、`bash`）；
- 已配置的 DM 目标；
- 是否启用电子邮件，以及启用时对应的收件人；
- 执行时使用的安装目录和时区。

### 负载消息模板（agentTurn）

创建任务时，使用负载消息指示隔离运行执行以下操作：

1) 运行审计

- 优先使用 JSON 输出以便进行可靠解析：
  - `openclaw security audit --json`
  - `openclaw security audit --deep --json`

2) 生成简洁的文本报告：

包括：
- 时间戳 + 主机标识（如果可用）
- 汇总计数
- 对于每个 CRITICAL/WARN：`checkId` + `title` + 一行修复建议
- 如果深度探测失败：包含探测错误行

3) 发送报告：

- 使用 `message` 工具将报告通过 DM 发送给选定的用户目标

### 电子邮件发送要求

电子邮件发送是可选的。仅当配置了 `PROMPTSEC_EMAIL_TO` 时，才承诺或尝试发送电子邮件。

如果设置了 `PROMPTSEC_EMAIL_TO`，则按以下优先级尝试发送：

A) 如果本地存在兼容 sendmail 的二进制文件，优先使用它。

B) 否则回退到已配置的 SMTP 中继：
- `PROMPTSEC_SMTP_HOST`
- `PROMPTSEC_SMTP_PORT`
- 可选的 `PROMPTSEC_SMTP_HELO`
- 可选的 `PROMPTSEC_SMTP_FROM`

如果两条路径都不可行，仍然通过 DM 联系用户，并包含一行：
- `"NOTE: could not deliver email to <PROMPTSEC_EMAIL_TO> via configured sendmail/SMTP path"`

如果未设置 `PROMPTSEC_EMAIL_TO`，cron payload 必须明确说明电子邮件已禁用，而不是暗示存在默认收件人。

## 幂等性 / 更新

在添加新任务之前：

- `cron.list(includeDisabled=true)`
- 如果存在名称匹配 `"Daily security audit"` 的任务，则更新该任务，而不是添加重复任务：
  - 调整计划的 tz/expr
  - 调整 DM 目标

## 建议的命名

- 任务名称：`"Daily security audit (Prompt Security)"`

## 最小推荐默认值（不要自动更改配置）

cron 的报告应当*建议*修复方案，但不得应用这些修复。

除非明确要求，否则不要运行 `openclaw security audit --fix`。