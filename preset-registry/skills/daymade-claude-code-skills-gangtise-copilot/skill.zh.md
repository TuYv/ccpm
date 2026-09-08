---
name: gangtise-copilot
description: Gangtise (岗底斯投研) OpenAPI skill suite installer and diagnostic tool. One-click install 19 official skills (data, research, utility), configure accessKey/secretAccessKey, run health diagnostics. Trigger when user mentions Gangtise, 岗底斯, any gangtise-* skill, credential setup, or reports errors like 'token is invalid' / '接口地址错误'.
---
# Gangtise Copilot

面向完整 Gangtise（岗底斯投研）OpenAPI skill 套件的一键安装程序、凭据配置器和诊断层。

---

## 🚀 一键安装（完整流程）

这是从零开始到 Gangtise 完全可用时**唯一需要阅读的部分**。请按顺序执行步骤。

### 步骤 1 —— 将此 skill 下载到 agent 的 skills 目录

**主要方法**（git clone）：
```bash
git clone --depth 1 https://github.com/daymade/claude-code-skills.git /tmp/gangtise-repo
cp -r /tmp/gangtise-repo/daymade-financial/gangtise-copilot <your-agent-skills-dir>/
```

**备用方法**（当 git clone 超时或不可用时，直接使用 GitHub API）：
```python
# Python one-liner to download and write any file from GitHub:
import urllib.request, json, base64, os
def fetch_github_file(repo_path, local_path):
    url = f"https://api.github.com/repos/daymade/claude-code-skills/contents/{repo_path}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    d = json.loads(urllib.request.urlopen(req, timeout=20).read())
    content = base64.b64decode(d["content"]).decode("utf-8")
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    open(local_path, "w").write(content)
    return len(content)

# Download all files:
for path, local in [
    ("daymade-financial/gangtise-copilot/SKILL.md",                         "<skills-dir>/gangtise-copilot/SKILL.md"),
    ("daymade-financial/gangtise-copilot/scripts/install_gangtise.sh",      "<skills-dir>/gangtise-copilot/scripts/install_gangtise.sh"),
    ("daymade-financial/gangtise-copilot/scripts/configure_auth.sh",        "<skills-dir>/gangtise-copilot/scripts/configure_auth.sh"),
    ("daymade-financial/gangtise-copilot/scripts/diagnose.sh",              "<skills-dir>/gangtise-copilot/scripts/diagnose.sh"),
    ("daymade-financial/gangtise-copilot/scripts/classify_response.py",     "<skills-dir>/gangtise-copilot/scripts/classify_response.py"),
    ("daymade-financial/gangtise-copilot/references/installation_flow.md",   "<skills-dir>/gangtise-copilot/references/installation_flow.md"),
    ("daymade-financial/gangtise-copilot/references/credentials_setup.md",    "<skills-dir>/gangtise-copilot/references/credentials_setup.md"),
    ("daymade-financial/gangtise-copilot/references/skill_registry.md",       "<skills-dir>/gangtise-copilot/references/skill_registry.md"),
    ("daymade-financial/gangtise-copilot/references/known_issues.md",         "<skills-dir>/gangtise-copilot/references/known_issues.md"),
    ("daymade-financial/gangtise-copilot/references/best_practices.md",       "<skills-dir>/gangtise-copilot/references/best_practices.md"),
    ("daymade-financial/gangtise-copilot/config-template/authorization.json.example", "<skills-dir>/gangtise-copilot/config-template/authorization.json.example"),
]:
    size = fetch_github_file(path, local)
    print(f"OK {path} → {local} ({size} bytes)")
```

> **重要**：连接 GitHub 的网络可能不稳定。如果有任何文件下载失败，请针对该文件重试，最多重试 3 次，每次尝试之间间隔 2 秒。单个文件失败时，**不要**中止整个流程。

### 第 2 步 — 向你的智能体注册此技能

对于 **OpenClaw**：在智能体的技能目录中创建符号链接，并在网关配置中启用它：
```bash
# Find the OpenClaw skills directory
ls ~/workspace/agent/skills/     # or ls ~/.openclaw/skills/

# Symlink this skill
ln -sf <gangtise-copilot-source-dir> <openclaw-skills-dir>/gangtise-copilot

# Enable in OpenClaw gateway config (if the agent supports skill entries in config)
# Run: openclaw config set 'skills.entries.gangtise-copilot' '{}'
# Then restart the gateway using OpenClaw's own script, not this skill's:
# sh <openclaw-install-dir>/scripts/restart.sh
```

### 第 3 步 — 安装全部 19 个 Gangtise 官方技能

```bash
bash <gangtise-copilot-dir>/scripts/install_gangtise.sh --preset full
```

**功能说明**：从官方华为云 OBS 存储桶下载 4 个 ZIP 包，解压 19 个技能目录，并将它们符号链接到检测到的智能体技能目录中（`~/.openclaw/skills/`、`~/.claude/skills/` 等）。

**已知的智能体技能目录路径**（如果自动检测未找到你的目录）：

| 智能体 | 技能目录 |
|---|---|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.agents/skills/` |
| OpenClaw | `~/.openclaw/skills/` 或 `<agent-workspace>/skills/` |

如果安装失败，请查看 `references/installation_flow.md`。

### 第 4 步 — 配置凭据

```bash
bash <gangtise-copilot-dir>/scripts/configure_auth.sh \
  --access-key <your-accessKey> \
  --secret-key <your-secretAccessKey>
```

**功能说明**：
1. 写入 `~/.config/gangtise/authorization.json`（权限模式为 600）
2. 执行实时认证调用，以验证凭据可用
3. 写入 `~/.GTS_AUTHORIZATION` 运行时令牌
4. **创建符号链接**，将每个已安装技能自身的 `<gangtise-skill-dir>/scripts/.authorization` 链接到共享凭据文件

> ⚠️ **重要**：完成第 3 步后，即使凭据已存在，`diagnose.sh` 也可能报告“19 个技能缺少 .authorization”。即使 `~/.config/gangtise/authorization.json` 已存在，也应运行第 4 步，因为 `configure_auth.sh` 会创建缺失的符号链接。

### 第 5 步 — 验证安装

```bash
bash <gangtise-copilot-dir>/scripts/diagnose.sh
```

预期输出：没有 `❌` 行。确切的通过数量取决于已安装的智能体和预设。成功的 OAuth 检查仅证明凭据能够生成令牌；RAG 行会单独报告可连接、空成功、权限拒绝、认证拒绝，或配额/权益响应。

如果仍有任何 ❌ 或 ⚠️，请与 `references/known_issues.md` 交叉核对。

### 第 6 步 — 使用真实查询进行测试

```bash
# Example: query latest research report for 宁德时代
# Use gangtise-file-client with its report runner:
cd <gangtise-copilot-dir>/references/
# See skill_registry.md for the exact command per skill
```

---

## 概述

Gangtise 是一个中国专业投资研究数据平台。它发布了一个 OpenAPI，涵盖研究报告、公司公告、会议纪要、首席分析师观点、财务报表、估值指标、OHLC 市场数据、股东数据、行业指标，以及预构建研究工作流技能目录。底层 API 设计良好，但技能生态**不可发现**：没有公开清单列出这 19 个技能；这些技能以独立 ZIP 文件形式分发在一个禁用了目录列出权限的华为云 OBS 存储桶中；并且技能采用两套并行命名规范（精简版为 `gangtise-<name>`，全功能版为 `gangtise-<name>-client`），两者提供不同的功能集。首次使用的用户必须逆向梳理完整的技能清单，才能安装它们。

Gangtise Copilot 通过一条命令解决这一问题：

1. 通过单次打包下载 + 分发流程，将全部 19 个官方 Gangtise skill 安装到 Claude Code、OpenClaw 和 Codex。
2. 通过对 `open.gangtise.com/application/auth/oauth/open/loginV2` 发起实时认证调用，引导用户完成 accessKey + secretAccessKey 设置。
3. 提供一个只读诊断脚本，报告已安装哪些 skill、哪些凭证有效，以及可访问哪些能力层级。
4. 提供预设安装模式（`minimal` / `workshop` / `full`），使用户能根据其账户许可证实际允许的范围匹配安装规模——有关为何“安装最多”并非安全默认选项，请参阅 `references/known_issues.md` 中的 ISSUE-007。

**来自 2026 年 4 月使用情况的运行时说明**：安装 skill 后，即使 `~/.config/gangtise/authorization.json` 已存在，也请运行 `configure_auth.sh`。上游 CLI 脚本还会读取 `~/.GTS_AUTHORIZATION`，这是一个纯运行时 token 文件。配置程序会刷新这两个文件。

## 架构原则（不得违反）

此 skill 是 Gangtise OpenAPI skill 套件之上的**包装层**。包装层契约不可协商：

- **绝不内置上游文件。** 此 skill 目录不包含任何 Gangtise skill 内容的副本、分叉或摘录。当 Gangtise 发布新版本时，用户无需受到此包装层干预即可获得新版本——安装程序每次运行都会从规范的 OBS URL 重新下载。
- **修复（如有）在运行时进行，而非发布时。** 此包装层源于一个未遇到实际上游 bug 的会话——阻碍在于可发现性和安装编排，而非文件损坏。如果未来出现上游 bug，它们会连同运行时修复说明被添加到 `references/known_issues.md`，而不会在发布时修补。
- **操作上游文件前始终先询问。** 修改任何已安装的 `gangtise-*` skill 目录，都需要通过 AskUserQuestion 获得用户的明确同意。
- **教会用户，而非隐藏细节。** 每个安装步骤都会向用户准确展示下载了哪些 skill、从何处下载，以及凭证文件保存在哪里。这能帮助用户学会维护自己的安装。

## 此 skill 的功能

| 能力 | 入口 | 详情 |
|---|---|---|
| 1. 安装 Gangtise skill（默认 minimal、workshop 别名、full 或 `--only` 自定义） | `scripts/install_gangtise.sh` | 参阅 `references/installation_flow.md` |
| 2. 配置 accessKey + secretAccessKey 凭证 | `scripts/configure_auth.sh` | 参阅 `references/credentials_setup.md` |
| 3. 诊断安装状态、凭证有效性和能力层级 | `scripts/diagnose.sh` | 参阅 `references/known_issues.md` |
| 4. 查询哪个 Gangtise skill 能回答特定数据问题 | 下方 skill 注册表 + `references/skill_registry.md` | — |

## 路由

触发此 skill 时，判断用户意图并跳转到相应能力：

| 用户说了类似的话… | 前往 |
|---|---|
| “装 gangtise”、“安装 gangtise”、“我想用 gangtise 的数据”、“把 gangtise 的 skill 都装上” | **一站式安装（上述第 1–5 步）** |
| “配 gangtise 的 key”、“配置 gangtise 凭证”、“gangtise accessKey”、“secretAccessKey” | **能力 2** |
| “gangtise 报错”、“token 无效”、“接口地址错误”、“gangtise skill 加载失败”、“我的 gangtise 装得不对” | **能力 3** |
| “宁德时代的研报”、“过去 30 天的首席观点”、“OHLC 蜡烛图”、“个股研究报告 L2”、“对宁德时代做观点 PK” | **能力 4** → skill 注册表 → 调用匹配的上游 skill |
| “帮我从头跑一遍 gangtise” | 一站式安装（依次执行第 1–5 步） |

如有疑问，请先从 **Capability 3**（`diagnose.sh`）开始，这是唯一的只读入口，并且会准确显示当前哪些安装和凭据受到阻塞。运行它不会产生任何破坏性副作用。

## Capability 1：安装 Gangtise 技能

Gangtise 在 Huawei Cloud OBS 存储桶中发布了 19 个相互独立的技能。它们被组织为 3 个捆绑 ZIP 包和 1 个独立 ZIP 包。安装程序会下载这 4 个压缩包，提取其中的 19 个技能目录，并将每个目录符号链接到检测到的代理的技能目录中。

### 分发源

所有技能均来自官方 Gangtise OBS 存储桶：

```
https://gts-download.obs.myhuaweicloud.com/skills/
```

没有镜像源。安装程序直接使用此 URL。

### 捆绑包映射

| 捆绑包 | 大小 | 包含内容 |
|---|---|---|
| `gangtise-skills-client.zip` | 160 KB | data-client、kb-client、file-client、**file-client-no-download**、**stockpool-client** |
| `gangtise-research.zip` | 220 KB | stock-research、opinion-pk、thematic-research、stock-selector、event-review、interview-outline、announcement-digest、opinion-summarizer、wechat-summary、data-processor |
| `gangtise-skills.zip` | 118 KB | data (v1.2.0)、file、kb，即传统的“minimal”并行线路 |
| `gangtise-web-client.zip` | 8 KB | web-client（独立存在，不属于任何捆绑包） |

**总计**：4 个 HTTP 请求 → 19 个技能目录。

两个技能（`gangtise-file-client-no-download` 和 `gangtise-stockpool-client`）**仅存在于 `gangtise-skills-client` 捆绑包中**，没有独立 ZIP 包。简单地“为每个技能列出独立 ZIP 包”的做法会完全遗漏它们。完整说明请参阅 `references/known_issues.md` 中的 ISSUE-002。

### 一键安装

```bash
bash scripts/install_gangtise.sh
```

参数：

```bash
bash scripts/install_gangtise.sh --preset minimal    # 默认 — 通过公开的 open-* 端点安装 3 个技能
bash scripts/install_gangtise.sh --preset workshop   # minimal 的别名（相同的 3 个技能）
bash scripts/install_gangtise.sh --preset full       # 全部 19 个技能（如果没有 skills-backend ACL，大多数 -client 会失败）
bash scripts/install_gangtise.sh --only data-client,kb-client,file-client  # 自定义子集
bash scripts/install_gangtise.sh --no-openclaw       # 即使检测到 OpenClaw，也跳过它
bash scripts/install_gangtise.sh --target claude-code  # 强制使用单个目标
```

### 预设内容

| 预设 | 技能 | 适用对象 |
|---|---|---|
| **minimal**（默认） | `gangtise-data`、`gangtise-file`、`gangtise-kb` | 适用于能够访问公开 `open-*` 端点的账户的保守安装方案。它避开了 ISSUE-007 中的 `skills-backend/*` ACL，但 API 点位和产品权限仍然适用。涵盖 OHLC、财务数据、公告、外部报告和 RAG 检索。 |
| **workshop** | （minimal 的别名，即相同的 3 个技能） | 历史预设曾捆绑 7 个高度依赖 `-client` 的技能，但这些技能在大多数账户上会受到 ISSUE-007 的限制，并导致现场演示无法正常运行。现在该预设指向与 `minimal` 相同的 3 个技能，因此不会再让 workshop 陷入故障。 |
| **full** | 全部 19 个技能 | 同时提供两条线路。适合探索完整的 Gangtise 技能目录。**如果你的账户缺少 `skills-backend/*` ACL，大多数 `-client` 技能将在运行时失败**，请先通过 ISSUE-007 中的诊断进行确认。 |

## 能力 2：配置凭据

每个 Gangtise skill 都需要一个与其 Python 运行时同目录的 `.authorization` 凭据文件，文件可采用以下两种格式之一：

**格式 A** — accessKey + secretAccessKey（最常见，会自动刷新令牌）：
```json
{
  "accessKey": "<your-accessKey>",
  "secretAccessKey": "<your-secretAccessKey>"
}
```

**格式 B** — 长期令牌（高级用法，用于预生成的长期有效令牌）：
```json
{
  "long-term-token": "Bearer <token>"
}
```

由于 19 个 skill 都需要相同的 `.authorization` 文件，包装器会在 `~/.config/gangtise/authorization.json`（XDG 标准，权限模式为 600）中存储**一个共享文件**，并将每个 skill 的本地凭据文件符号链接到该文件。轮换凭据时，只需编辑一个文件，无需修改 19 个文件。

运行配置程序：

```bash
bash scripts/configure_auth.sh
```

它将：

1. 提示输入 accessKey 和 secretAccessKey（或者在已设置时从 `GANGTISE_ACCESS_KEY` / `GANGTISE_SECRET_KEY` 环境变量读取）。
2. 将内容写入权限模式为 600 的 `~/.config/gangtise/authorization.json`。
3. 对 `https://open.gangtise.com/application/auth/oauth/open/loginV2` 执行一次**实时认证调用**，以验证凭据确实有效。
4. 写入 `~/.GTS_AUTHORIZATION`，其中包含上游 CLI 脚本所需的裸运行时令牌。
5. 为每个已安装 skill 的本地凭据文件创建指向共享 XDG 文件的符号链接。
6. 报告成功，并显示 Gangtise 认证服务器返回的 uid + userName。

### 凭据轮换

```bash
# 编辑一个文件：
$EDITOR ~/.config/gangtise/authorization.json

# 通过实时服务器重新验证：
bash scripts/configure_auth.sh --verify-only
```

无需修改任何其他文件 — 符号链接仍会指向更新后的文件。

## 能力 3：诊断安装状态

```bash
bash scripts/diagnose.sh
```

诊断脚本**严格只读**。它会检查：

- 在每个检测到的代理 `skills/` 目录中，19 个 skill 中哪些已存在
- `~/.config/gangtise/authorization.json` 是否存在且权限模式为 600
- 每个 skill 的本地凭据文件是否为指向共享 XDG 文件的有效符号链接
- 已存储的凭据是否能通过实时认证调用（只需调用 `oauth/open/loginV2` 的短探测）
- 规范 RAG 端点是否能响应最小查询。结果会区分：含匹配项的成功响应、成功但为空的响应、认证拒绝、权限拒绝、配额/授权响应、格式错误的响应以及网络故障。它会保留 HTTP 状态、API 代码、`errorType` 和 `traceId`，但不会打印凭据或完整令牌响应。

退出代码：

- `0` — 全部正常
- `1` — 一个或多个问题需要用户处理
- `2` — 诊断程序本身失败（网络错误、无互联网连接等）

如果 diagnose 报告问题，请将输出与 `references/known_issues.md` 交叉对照。每个报告的问题都对应一个特定的修复章节。

## 能力 4：Skill 注册表 — “哪个 skill 能回答我的数据问题？”

这是包装器不那么显而易见的价值。Gangtise 的 19 个 skill 构成一个**二维矩阵**（数据层级 × 操作类型），但文档并未清楚说明。请使用下表将用户问题路由到正确的 skill：

### 数据层技能（6）

| 想要… | 上游技能 | 调用方式 |
|---|---|---|
| 跨知识库查询语义内容（报告 + 观点 + 纪要） | gangtise-kb-client | 使用 `kb` runner，并通过 `-q` 指定查询，可选 `--file-types` / `--securities` |
| 按类型 + 日期 + 证券列出文档（报告、公告、摘要、观点、路演） | gangtise-file-client | 针对每种文档类型使用专用 runner（report / opinion / summary / announcement / investment_calendar / foreign_report / internal_report / wechat_message） |
| 获取 A 股或港股的 OHLC 日 K 线数据 | gangtise-data-client | 使用 `quote` runner，并通过 `--securities {name}` 指定证券、`-sd` / `-ed` 指定日期范围 |
| 获取财务报表（利润表 / 资产负债表 / 现金流量指标） | gangtise-data-client | 使用 `financial` runner，并通过 `--securities {name}` 和 `--indicators` 指定参数 |
| 获取估值指标（PE / PS / PB / PEG + 历史分位数） | gangtise-data-client | 使用 `valuation` runner，并通过 `--securities {name}` 指定证券 |
| 获取主营业务构成（按产品 / 行业 / 地区） | gangtise-data-client | 使用 `main_business` runner，并通过 `--securities {name}` 和 `--classify-method` 指定参数 |
| 获取股东 / 前十大持有人数据 | gangtise-data-client | 使用 `shareholder` runner，并通过 `--securities {name}` 指定证券 |
| 获取宏观 / 行业指标（GDP、CPI、汽车销量、商品价格） | gangtise-data-client | 使用 `industry_indicator` runner，并通过 `-k {keyword}` 指定关键词 |
| 按名称查询证券标准代码 | gangtise-data-client | 使用 `security` runner，并通过 `-k {name}` 指定名称 |
| 按主题或行业列出板块成分股 | gangtise-data-client | 使用 `block_component` runner，并通过 `-k {theme}` 指定主题 |
| 按类别列出指数成分股 | gangtise-data-client | 使用 `index` runner，并通过 `-k {index type}` 指定指数类型 |
| 搜索 Gangtise 内部知识库中未收录的公开网络信息 | gangtise-web-client | 使用 `web` runner，并通过 `-q {query}` 指定查询 |

完整的各 runner 参数参考及跨技能组合示例，请参阅 [`references/skill_registry.md`](references/skill_registry.md)。

### 工作流层技能（10）— 高阶研究工作流

这些技能将数据层技能进行**编排**，形成端到端研究工作流。它们会按照 Gangtise 的专业投资研究模板及内置合规护栏生成 Markdown + HTML 报告（不使用“买入 / 卖出 / 目标价 / 推荐”表述）。

| 想要… | 使用 |
|---|---|
| 生成 L1-L4 深度的个股研究报告（L1 = 单页框架，L4 = 完整机构覆盖） | `gangtise-stock-research` |
| 对投资论点进行对抗性分析（“针对这个看多判断扮演反方”） | `gangtise-opinion-pk` |
| 开展主题 / 行业研究（驱动因素分析、枚举阶段、股票筛选、业绩检验） | `gangtise-thematic-research` |
| 基于研究标准筛选股票 | `gangtise-stock-selector` |
| 为市场事件撰写一篇 800-1000 字的事件复盘 / 事后分析 | `gangtise-event-review` |
| 生成公司调研提纲（3 步工作流：数据 → 主题 → 问题） | `gangtise-interview-outline` |
| 跟踪股票池近期公告并生成每日摘要 | `gangtise-announcement-digest` |
| 汇总首席分析师近期观点 | `gangtise-opinion-summarizer` |
| 将微信聊天群讨论记录转化为结构化投资日报 | `gangtise-wechat-summary` |
| 获取有关如何设计自定义数据处理工作流的方法论指导 | `gangtise-data-processor` |

### 实用技能（3 个）

| 技能 | 用途 |
|---|---|
| `gangtise-stockpool-client` | 创建 / 重命名 / 删除股票池；向其中添加或移除股票。仅包含在 `gangtise-skills-client.zip` 中。 |
| `gangtise-file-client-no-download` | `file-client` 的变体，禁用下载功能，适用于只读环境或对合规性要求较高的场景。 |
| 旧版 `gangtise-data` / `gangtise-file` / `gangtise-kb` | 较早的精简并行版本。`data` 为 v1.2.0，使用严格类型化的证券代码（不进行名称解析）。仅当用户需要更小的功能范围时安装。 |

请参阅 `references/skill_registry.md`，了解完整的单技能脚本目录、版本和功能矩阵。

## 此技能拒绝执行的操作

- 将任何 `gangtise-*` 技能的内容供应商化、派生或镜像到此目录中，仅引用规范的 OBS URL。
- 在 SKILL.md 中固定上游技能版本，安装程序始终下载最新的 OBS 构件。
- 静默修改上游文件，任何修改路径（如果将来添加）都需要通过 AskUserQuestion 获得明确同意。
- 硬编码个人 accessKey / secretAccessKey 值。
- 提供投资建议或交易决策。Gangtise 自有技能已经执行这些合规规则；此封装严格进行委托。

## 文件布局

```
gangtise-copilot/
├── SKILL.md                         # This file
├── scripts/
│   ├── install_gangtise.sh          # Download bundles → stage → distribute
│   ├── configure_auth.sh            # Set up + verify credentials
│   └── diagnose.sh                  # Read-only health report
├── references/
│   ├── installation_flow.md         # How the installer works, flag reference, troubleshooting
│   ├── credentials_setup.md         # accessKey / secretAccessKey, XDG paths, liveness check
│   ├── skill_registry.md            # Complete per-skill capability matrix
│   ├── known_issues.md              # Two parallel product lines, bundle-only skills, and other gotchas
│   └── best_practices.md            # How to combine stock-research + opinion-pk + data-client effectively
└── config-template/
    └── authorization.json.example   # Credential file template (placeholder values only)
```