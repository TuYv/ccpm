---
name: github-sensitive-data-cleanup
description: >-
  Scan and remove sensitive data (secrets, API keys, private domains/IPs, PII)
  from GitHub repository history. Use this skill whenever the user says
  "scan sensitive data", "clean git history", "remove secrets from repo",
  "sanitize GitHub history", "清理敏感数据", "历史重写", "force push",
  "泄露", or needs to repair a public repo after accidental secret/private
  context leakage. Also use before any force push to a public repository to
  verify visibility, backup, and scan results.
---
# GitHub 敏感数据清理

## 概述

本技能指导你安全地从 Git 仓库历史记录中移除敏感数据，并将清理后的历史记录推送到 GitHub。它总结了从真实事件中获得的宝贵经验：先扫描，在重写前备份，重写后验证，并且在未检查仓库可见性和复刻数量之前，绝不要强制推送到公共仓库。

随附的脚本会自动执行机械性的操作：

- `scripts/scan_repo.py` — 扫描仓库中的密钥和私有上下文。
- `scripts/rewrite_history.py` — 创建备份，并使用
  `git-filter-repo` 重写历史记录。
- `scripts/verify_cleanup.py` — 确认敏感内容已被移除。
- `scripts/safe_push.py` — 验证仓库可见性并安全推送。

**本技能在设计上采取保守策略。** 如果任何安全检查失败，它都会停止并请求人工确认，而不是继续执行。

## 何时使用本技能

当用户出现以下情况时，触发本技能：

- 说“扫描敏感数据”“扫描敏感信息”“看看仓库有没有泄露”。
- 想要“清理 Git 历史记录”“净化历史记录”“重写历史记录”
  或“从历史记录中移除密钥”。
- 不慎将密钥、私有域名、内部 IP 或 PII 推送到了公共仓库。
- 即将强制推送到公共仓库（即使不涉及敏感数据）。
- 提到 `git filter-repo`、`BFG`、`git-filter-branch` 或历史记录重写。

## 前置条件

在每台机器上安装一次以下工具：

```bash
# git-filter-repo (modern replacement for git-filter-branch)
brew install git-filter-repo

# gitleaks (secret scanner)
brew install gitleaks

# GitHub CLI
brew install gh
```

这些脚本假定 `git-filter-repo` 和 `gitleaks` 位于 `PATH` 中。本技能会在执行破坏性操作之前对此进行检查。

## 安全规则（不可协商）

1. **先扫描，再决定。** 绝不要仅凭猜测重写历史记录。
2. **重写前创建备份。** 使用 `git bundle` 或全新的裸克隆。
3. **在任何推送之前，使用 `gh repo view` 验证仓库可见性。** 不要根据 URL 或目录名称推断仓库是公共还是私有。
4. **绝不要使用 `--no-verify` 绕过钩子。** 如果 PII Guard 钩子失败，
   请修复根本问题或添加允许列表；不要绕过。
5. **优先使用 `--force-with-lease`。** 只有当远程引用因历史记录重写本身而过期时，才退回使用 `--force`。
6. **重写后进行验证。** 干净的 `git log` 并不足够；请重新运行扫描器并执行 AI 语义审查。
7. **存在复刻的公共仓库需要格外谨慎。** 每个复刻都会保留旧历史记录的副本。如果泄露的数据风险较高，请与复刻所有者协调处理。

## 工作流程

### 步骤 0：确认仓库路径和当前分支

```bash
cd /path/to/repo
git status --short
git remote -v
```

### 步骤 1：扫描敏感数据

运行扫描器以找出需要移除的内容：

```bash
uv run --with gitpython scripts/scan_repo.py --repo /path/to/repo --output /tmp/scan-report.json
```

扫描器会自动从仓库根目录下的 `.pii-patterns` 加载仓库特定的模式。如果该文件包含真实的私有域名，**请勿提交该文件**——将其添加到 `.gitignore`，或将其保存在仓库外部。如果工作树中存在未跟踪的文件，`rewrite_history.py` 将中止执行。

要启用第 3 层（来自你的 gitleaks 配置的私有基础设施上下文和
可选的身份信息文件）：

```bash
uv run --with gitpython scripts/scan_repo.py \
  --repo /path/to/repo \
  --gitleaks-config ~/scripts/git-pii-guard/gitleaks.toml \
  --identities-file ~/.config/github-sensitive-data-cleanup/identities.txt \
  --output /tmp/scan-report.json
```

`--gitleaks-config` 标志会从你的私有 gitleaks 配置中读取
`private-domain-context` 和 `private-ip-context` 规则。实际模式
仍保留在你的私有配置中；不会有任何内容被复制到此公开 Skill 中。

检查 `/tmp/scan-report.json`。它包括：

- `gitleaks` 检测结果（密钥、API 密钥、令牌）。
- 自定义模式匹配结果（内部 IP、电话号码、个人身份信息）。
- 第 3 层上下文匹配结果（来自你的配置的私有域名、IP、身份信息）。
- 提醒你针对正则表达式无法检测的内容执行 AI 语义审查。

如果未发现任何敏感信息，**请停止**。不要重写历史记录。

### 步骤 1.5：AI 语义审查（第 4 层）

正则表达式扫描器（第 1-3 层）无法检测新出现的私有上下文：真实姓名、
项目代号、文字记录片段、内部会议引用或
架构描述。你必须执行 AI 语义审查。

对标记出的提交使用 `references/ai_semantic_review_prompt.md` 中的提示词。
反复执行审查，直到不再发现新的私有上下文。

如果跳过此步骤，你可能会推送 gitleaks 从未被配置为
查找的私有上下文。

### 步骤 2：对检测结果分类并选择修复方式

针对每项检测结果，确定：

- **轮换凭据**（对于仍然有效的密钥，始终先执行此操作）。
- **从历史记录中移除**（适用于私有域名/IP、个人身份信息，或已经轮换但
  仍会泄露内部上下文的密钥）。
- **添加到 `.gitignore` 或允许列表**（仅适用于误报）。

**必须先轮换仍然有效的密钥，再清理历史记录。** 从历史记录中移除
并不会使已经泄露的密钥失效。

### 步骤 3：准备替换文件

创建一个文本文件，按照 `git-filter-repo`
`--replace-text` 格式每行写入一项替换规则：

```text
literal:internal.example.com==>example.com
literal:private.example.org==>example.org
literal:sk-example-aaaaaaaaaaaaaaaa==>sk-example-REDACTED
```

将这些内容替换为你的实际敏感字符串。不要提交真实值；
请将替换文件保存在仓库之外。

使用 `literal:` 进行精确字符串匹配。对于正则表达式替换，请使用
`regex:`（仅当你对该模式有信心时）。

将此文件保存在仓库之外，例如 `/tmp/sensitive-replacements.txt`。

### 步骤 4：创建备份

```bash
uv run scripts/rewrite_history.py --repo /path/to/repo \
  --replacements /tmp/sensitive-replacements.txt \
  --backup /tmp/repo-backup.bundle
```

此脚本会：

1. 验证 `git-filter-repo` 已安装且可执行。
2. 检查工作树是否干净（没有未提交的更改或未跟踪的
   文件）。如果不干净，则中止。
3. 为当前状态创建 `git bundle` 备份。
4. 使用 `git bundle verify` 验证备份 bundle。
5. 运行 `git filter-repo --replace-text`。
6. 报告旧提交哈希和新提交哈希。

**如果备份或验证步骤失败，脚本将停止。** 请勿手动继续。

### 步骤 5：验证清理结果

```bash
uv run scripts/verify_cleanup.py --repo /path/to/repo --replacements /tmp/sensitive-replacements.txt
```

此操作会重新运行扫描器，并检查所有提交中是否仍存在任何原始敏感字符串。如果发现任何内容，请返回步骤 3。

### 步骤 6：检查可见性并推送

```bash
uv run scripts/safe_push.py --repo /path/to/repo --remote origin --branch main
```

此脚本会：

1. 运行 `gh repo view` 以确认 `visibility`、`isPrivate` 和 `forks`。
2. 如果仓库是公开的并且存在复刻，则发出醒目的警告。
3. 首先使用 `--force-with-lease`。
4. 仅当远程引用因本地历史重写而过期时，才回退使用 `--force`。
5. 拒绝添加 `--no-verify`。

如果 PII Guard 钩子失败，请修复问题并重新运行。请勿绕过。

### 步骤 7：推送后验证

推送成功后：

1. 在 GitHub 上打开仓库，确认敏感字符串已从提交历史中消失。
2. 检查打开的 PR 是否仍指向有效的提交。重写历史可能会破坏现有的 PR 分支。
3. 对于高风险泄露，请通知所有复刻仓库的所有者。

## 随附脚本的作用

### `scripts/scan_repo.py`

运行 `gitleaks` 以及自定义的 bash/grep 层，以检测 gitleaks 未覆盖的模式（私有域名、内部 IP、中国手机号码、某些 PII）。输出 JSON 报告。

```bash
uv run --with gitpython scripts/scan_repo.py --repo /path/to/repo --output /tmp/report.json
```

### `scripts/rewrite_history.py`

创建备份 bundle，并运行 `git filter-repo --replace-text`。

```bash
uv run --with gitpython scripts/rewrite_history.py \
  --repo /path/to/repo \
  --replacements /tmp/sensitive-replacements.txt \
  --backup /tmp/repo-backup.bundle
```

### `scripts/verify_cleanup.py`

重新运行扫描器，并使用 grep 检查所有提交中是否存在原始敏感字符串。

```bash
uv run --with gitpython scripts/verify_cleanup.py \
  --repo /path/to/repo \
  --replacements /tmp/sensitive-replacements.txt
```

### `scripts/safe_push.py`

检查可见性并安全推送。

```bash
uv run --with gitpython scripts/safe_push.py --repo /path/to/repo --remote origin --branch main
```

## 处理特殊情况

### 仓库存在打开的 PR

重写历史会使打开的 PR 中的提交引用失效。推送后：

1. 请 PR 作者将其分支变基到新的 `main` 上。
2. 如果 PR 是你的，请删除本地分支，获取重写后的 `main`，然后通过 cherry-pick 将更改生成为新提交。

### 仓库存在复刻

在复刻仓库所有者进行同步之前，公开复刻会保留旧历史。对于高风险泄露（仍然有效的密钥、生产环境凭据），请考虑：

1. 立即轮换凭据（强制要求）。
2. 请求 GitHub Support 删除敏感数据的缓存视图。
3. 使用简短、客观的消息通知复刻仓库所有者。

对于风险较低的泄露（内部域名、占位 IP），请记录此次重写并继续处理后续工作。

### `git filter-repo` 报告 "need a fresh clone"

`git-filter-repo` 会拒绝在具有多个远程仓库或非 origin
引用的仓库上运行。修复方法：

```bash
git clone --mirror /path/to/repo /tmp/repo-mirror.git
cd /tmp/repo-mirror.git
# run rewrite_history.py against the mirror
```

### gitleaks 误报

如果 gitleaks 将文档示例或测试夹具标记为问题，请在仓库的 `.gitleaks.toml` 或 `.gitleaksignore`
中添加允许列表条目（切勿使用 `--no-verify`）。有关允许列表模式，请参阅 `references/tooling_notes.md`。

## 此 Skill 不会做什么

- 它不会为你轮换线上凭据。先轮换凭据，再清理历史记录。
- 它不会从 GitHub 自身的备份或分叉中移除数据。它只清理
  上游仓库的历史记录。
- 它不会绕过 git 钩子。如果钩子执行失败，请修复根本原因。
- 它不会让密钥泄露变得“安全”。一旦推送，就应假定数据已被他人看到。

## 参考资料

- `references/incident-lessons.md` — 真实清理过程中出现的问题，以及此 Skill 如何
  防止这些错误。
- `references/tooling_notes.md` — 如何在 `git-filter-repo` 和 BFG 之间进行选择、
  允许列表模式以及常见错误。
- `references/ai_semantic_review_prompt.md` — 第 4 层 AI 语义审查提示词，
  用于查找正则表达式无法捕获的私密上下文。