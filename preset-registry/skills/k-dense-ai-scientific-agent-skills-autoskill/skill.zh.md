---
name: autoskill
description: Observe the user's screen via screenpipe, detect repeated research workflows, match them against existing scientific-agent-skills, and draft new skills (or composition recipes that chain existing ones) for the patterns not yet covered. Use when the user asks to analyze their recent work and propose skills based on what they actually do. Requires the screenpipe daemon (https://github.com/screenpipe/screenpipe) running locally on port 3030 — the skill has no other data source and will refuse to run if screenpipe is unreachable. All detection runs locally; only redacted cluster summaries reach the LLM.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
  version: "1.3"
  skill-author: K-Dense Inc.
  openclaw:
    requires:
      bins:
      - screenpipe
    primaryEnv: SCREENPIPE_TOKEN
    envVars:
    - name: SCREENPIPE_TOKEN
      required: true
      description: Auth token for the local screenpipe daemon.
    - name: ANTHROPIC_API_KEY
      required: false
      description: For Claude API calls during skill drafting.
    - name: FOUNDRY_API_KEY
      required: false
      description: Optional Foundry access for drafting.
---
# autoskill

> **需要正在运行的 [screenpipe](https://github.com/screenpipe/screenpipe) 守护进程。** 此 skill 没有备用数据源——它仅从本地 screenpipe HTTP API（默认地址为 `http://localhost:3030`）读取数据。如果守护进程未运行，`run()` 会抛出 `ScreenpipeUnreachable`，并提供安装说明。

> **网络访问与环境变量。** 此 skill 会向以下位置发起经过身份验证的 HTTP 请求：(a) 用户本地回环地址上的 screenpipe 守护进程；(b) 用户配置的 LLM 后端，后端可以是 `http://localhost:1234/v1`（LM Studio，默认）、`https://api.anthropic.com`（选择启用的 Claude），或用户提供的 BYOK Foundry 网关。此 skill 会读取三个环境变量——`SCREENPIPE_TOKEN`、`ANTHROPIC_API_KEY`、`FOUNDRY_API_KEY`——并且每个变量仅用于向其名称所指示的单一端点进行身份验证。不会访问其他网络目的地，不会进行遥测，也不会向任何第三方传出数据。

## 概述

将用户自己的工作流历史——由本地 [screenpipe](https://github.com/screenpipe/screenpipe) 守护进程被动捕获——转化为新的 skills。此 skill 按需运行：用户指定一个时间窗口后调用它；它会查询 screenpipe 的本地 HTTP API，对重复的工作流模式进行聚类，将每个模式与此仓库中现有的 skills 进行比较，并生成一个暂存文件夹，其中包含供用户审阅、编辑和正式启用的提案。

## 何时使用此 Skill

当用户要求以下操作时调用此 skill：
- “分析我过去 4 小时 / 一天 / 一周的活动，并提出新的 skills。”
- “看看我一直在做什么，并告诉我哪些内容还没有被覆盖。”
- “根据我最近的工作流起草一个 skill。”
- “为我重复执行的工作流寻找组合配方。”

不要将其用于针对 screenpipe 本身的一次性问题、实时屏幕查询，或在用户没有明确请求的情况下调用——此 skill 会分析敏感的本地内容，必须由用户明确触发。

## 隐私保护

- **Screenpipe 会在捕获时处理应用/窗口过滤。** 将 `references/screenpipe-config.yaml` 复制到用户的 screenpipe 配置中，以安装初始拒绝列表。敏感应用（密码管理器、消息应用、银行应用）从一开始就不会进行 OCR。
- **原始 OCR 数据不会离开设备。** `scripts/fetch_window.py` 通过 localhost HTTP 获取数据。`scripts/cluster.py` 将时间线精简为应用/持续时间/标题摘要。`scripts/redact.py` 会在任何聚类摘要发送给 LLM 之前，作为纵深防御措施移除电子邮件地址、API 密钥、bearer token 和电话号码。
- **LLM 后端默认为 `local`。** 推荐的设置是运行 `Gemma-4-31B-it` 的 [LM Studio](https://lmstudio.ai/)——在适合大多数工作站 GPU 的规模下提供强大的推理能力，并且数据永远不会离开你的设备。云端后端（`claude`、`foundry`）需要选择启用，并在 `config.yaml` 中有相关文档，供明确需要使用它们的用户参考。无论选择哪种后端，检测和嵌入始终在本地运行。
- **试运行模式**（`--plan`）会在任何 LLM 调用之前，打印将要分析的完整时间线。
- **localhost 的 TLS**（可选，用于符合企业策略）：请参阅 `references/https-proxy.md` 了解 Caddy 模式。

## 前置条件

### 1. Screenpipe 守护进程

安装官方发行版或从源码构建均可。无论哪种方式，守护进程默认都会在 `localhost:3030` 上绑定 HTTP 服务。

**从源码构建**（如果你希望使用不带桌面 GUI 的 CLI 守护进程，推荐此方式）：

```bash
git clone --depth 1 https://github.com/mediar-ai/screenpipe.git
cd screenpipe
cargo build -p screenpipe-engine --release
# System deps (macOS): cmake + full Xcode.app (not just Command Line Tools).
#   brew install cmake
#   # if xcodebuild plug-ins error: sudo xcodebuild -runFirstLaunch
./target/release/screenpipe doctor   # confirm permissions + ffmpeg
./target/release/screenpipe record --disable-audio --use-pii-removal
```

首次运行时将提示你授予 macOS 屏幕录制权限。授予权限后重新启动。

### 2. Screenpipe API 令牌

本地 API 现在要求使用 bearer 身份验证。获取你的令牌并导出：

```bash
export SCREENPIPE_TOKEN=$(screenpipe auth token)
```

（或者直接在 `config.yaml` 中设置 `screenpipe.token`——推荐使用环境变量，因为这样可避免将密钥纳入版本控制。）

### 3. Python 环境

在仓库根目录通过 `pipenv`：

```bash
pipenv install httpx pyyaml sentence-transformers
```

嵌入模型（`sentence-transformers/all-MiniLM-L6-v2`，约 80 MB）会在首次运行时下载。

### 4. 本地 LLM（默认路径）— LM Studio

- 安装 [LM Studio](https://lmstudio.ai/)。
- 下载 `Gemma-4-31B-it`（或其他强大的推理模型；在 `config.yaml` 中调整 `local.model`）。
- 通过 CLI 加载以供无头模式使用（无需 GUI）：

```bash
lms load gemma-4-31b-it --context-length 131072 --gpu max -y
lms status   # confirm server running on :1234
```

### 5. 云端 LLM 后端（可选，主动选择加入）

仅当你明确选择不使用本地模型时：
- `claude`：设置 `ANTHROPIC_API_KEY`，并在 `config.yaml` 中将 `backend: claude`。
- `foundry`：设置 `FOUNDRY_API_KEY`，将 `backend: foundry`，并把 `foundry.endpoint` 设置为你的企业网关 URL。

## 架构

```
screenpipe daemon (user-installed)
        │  HTTP on localhost:3030
        ▼
scripts/fetch_window.py    → normalized timeline events
scripts/redact.py          → regex scrub (defense-in-depth)
scripts/cluster.py         → sessions + clusters (local only)
scripts/match_skills.py    → top-k vs existing 135 skills (local embeddings)
scripts/synthesize.py      → LLM judge: reuse / compose / novel
        │
        ▼
~/.autoskill/proposed/<timestamp>/        (default; override with --out)
  ├── report.md
  ├── composition-recipes/<name>/SKILL.md
  └── new-skills/<name>/SKILL.md

scripts/promote.py         → user-approved proposal → skills/<name>/
```

## 工作流程

该技能在 `scripts/autoskill.py` 中提供了一个统一的 CLI，包含三个子命令：

```bash
python scripts/autoskill.py doctor   --config config.yaml --skills-dir ../
python scripts/autoskill.py run      --start ... --end ... --config config.yaml
python scripts/autoskill.py promote  --proposed ~/.autoskill/proposed/<ts> --skills-dir ../ --name <skill>
```

### 0. 使用 `doctor` 进行预检

在完整运行前，一次性验证所有依赖项：

```bash
python scripts/autoskill.py doctor \
  --config skills/autoskill/config.yaml \
  --skills-dir skills
```

报告涵盖 `config`（后端选择有效）、`skills_dir`（存在）、`screenpipe`（可访问且已认证）以及 `llm`（LM Studio 正在提供服务或存在 API key）。任何一项失败都会以非零状态退出，并将出错行标记为 `error`。

### 1. 运行流水线

```bash
export SCREENPIPE_TOKEN=$(screenpipe auth token)
python scripts/autoskill.py run \
  --start "2026-04-17T00:00:00Z" \
  --end   "2026-04-17T23:59:59Z" \
  --config skills/autoskill/config.yaml \
  --skills-dir skills
```

提案默认会存放在 `~/.autoskill/proposed/<timestamp>/` 中，使实验性输出与 skills 仓库隔离。传入 `--out PATH` 可覆盖此设置。

内部流程：
1. **获取** — `fetch_window` 对 screenpipe 的 `/search` 端点进行分页，将事件规范化为 `{ts, app, window_title, text, content_type}`。
2. **脱敏** — `redact` 会从 OCR 文本和窗口标题中清除电子邮件、API keys、bearer tokens 以及电话号码，作为对 screenpipe 自身 PII 移除机制的纵深防御。
3. **聚类** — `segment_sessions` 按空闲间隔（默认 10 分钟）拆分会话，并丢弃过短的会话；`cluster_sessions` 按应用签名对会话进行分组，只保留大小达到 `min_cluster_size`（默认值为 2）的集群。
4. **匹配** — `load_skill_descriptions` 读取 `skills/` 中每个 `SKILL.md` 的 frontmatter；`top_k_matches` 使用本地 `sentence-transformers` 嵌入（余弦相似度）对每个集群与所有 skills 进行匹配排序。
5. **合成** — `synthesize` 提示配置的 LLM 后端，将每个集群分类为 `reuse`、`compose` 或 `novel`，并在适用时生成 SKILL.md 正文。
6. **报告** — 写入 `<out_dir>/<ts>/report.md`，并为每个提案写入 `new-skills/<name>/SKILL.md` 或 `composition-recipes/<name>/SKILL.md`。

添加 `--dry-run` 可在聚类后停止；这会跳过 LLM（以及 `sentence-transformers` 的加载），仅写入供检查的 `plan.md`。

### 2. 审查并发布

打开 `~/.autoskill/proposed/<ts>/report.md`，直接编辑草稿，删除任何不需要的内容。然后：

```bash
python scripts/autoskill.py promote \
  --proposed ~/.autoskill/proposed/2026-04-17T14-30-00 \
  --skills-dir skills \
  --name zotero-pubmed-helper
```

`promote` 会将目录移动到 `skills/<name>/`，并拒绝覆盖已有的 skill。如果找不到提案或目标已存在，则会以非零状态退出，并显示友好的错误信息。

## 配置

完整结构请参见 `config.yaml`。默认值（本地优先）：

```yaml
backend: local
local:
  endpoint: http://localhost:1234/v1   # LM Studio's Developer server
  model: Gemma-4-31B-it

screenpipe:
  url: http://localhost:3030           # or https://screenpipe.local via Caddy

cluster:
  min_session_minutes: 5
  idle_gap_minutes: 10
  min_cluster_size: 2
```

如需选择云端后端：

```yaml
backend: claude                         # or foundry
claude:
  model: claude-opus-4-7
```

## 组合配方与新技能

- **compose**：LLM 判断串联现有技能即可覆盖该工作流。生成的 SKILL.md 刻意保持简短——仅包含 frontmatter 和一个按顺序调用现有技能的 "Workflow" 部分。发现该技能的同一个 agent runtime 随后即可端到端地调用它。
- **novel**：现有技能的任何组合都无法覆盖该需求。此时会起草一份更完整的 SKILL.md，同时仍遵循仓库约定（frontmatter、Overview、When to Use、Workflow）。在正式发布之前，用户应始终审阅新技能草稿。

## 测试

该技能由仓库根目录下 `tests/autoskill/` 中的一组小型 pytest 测试套件覆盖。每个脚本都会通过依赖注入（模拟 HTTP 传输、存根后端、存根 embedder）进行独立单元测试：

```bash
python -m pytest tests/autoskill -v
```

## 与本仓库中其他技能的组合

autoskill 的 embedding index 覆盖全部 135 个同级技能。看起来属于科学写作的工作流会匹配 `scientific-writing` / `literature-review` / `citation-management`；图表相关工作会匹配 `scientific-schematics` / `generate-image` / `infographics`；幻灯片准备会匹配 `scientific-slides` / `pptx`；等等。当某个集群与两个或三个同级技能的匹配得分较高时，生成的组合配方会明确列出这些技能名称，以便用户未来的 agent invocations 使用本仓库中已经记录的优化路径。