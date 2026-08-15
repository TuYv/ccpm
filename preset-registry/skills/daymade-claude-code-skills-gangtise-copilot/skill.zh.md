---
name: gangtise-copilot
description: Gangtise (岗底斯投研) OpenAPI skill suite installer and diagnostic tool. One-click install 19 official skills (data, research, utility), configure accessKey/secretAccessKey, run health diagnostics. Trigger when user mentions Gangtise, 岗底斯, any gangtise-* skill, credential setup, or reports errors like 'token is invalid' / '接口地址错误'.
---
# Gangtise Copilot

面向完整 Gangtise（岗底斯投研）OpenAPI 技能套件的一键安装器、凭证配置器和诊断层。

---

## 🚀 一次性安装（完整流程）

要让 Gangtise 从零开始完全正常运行，你**只需阅读本节**。请按顺序执行以下步骤。

### 第 1 步 — 将此技能下载到智能体的技能目录

**首选方法**（git clone）：
```bash
git clone --depth 1 https://github.com/daymade/claude-code-skills.git /tmp/gangtise-repo
cp -r /tmp/gangtise-repo/gangtise-copilot <your-agent-skills-dir>/
```

**备用方法**（当 git clone 超时或不可用时——直接使用 GitHub API）：
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
    ("gangtise-copilot/SKILL.md",                         "<skills-dir>/gangtise-copilot/SKILL.md"),
    ("gangtise-copilot/scripts/install_gangtise.sh",      "<skills-dir>/gangtise-copilot/scripts/install_gangtise.sh"),
    ("gangtise-copilot/scripts/configure_auth.sh",        "<skills-dir>/gangtise-copilot/scripts/configure_auth.sh"),
    ("gangtise-copilot/scripts/diagnose.sh",              "<skills-dir>/gangtise-copilot/scripts/diagnose.sh"),
    ("gangtise-copilot/references/installation_flow.md",   "<skills-dir>/gangtise-copilot/references/installation_flow.md"),
    ("gangtise-copilot/references/credentials_setup.md",    "<skills-dir>/gangtise-copilot/references/credentials_setup.md"),
    ("gangtise-copilot/references/skill_registry.md",       "<skills-dir>/gangtise-copilot/references/skill_registry.md"),
    ("gangtise-copilot/references/known_issues.md",         "<skills-dir>/gangtise-copilot/references/known_issues.md"),
    ("gangtise-copilot/references/best_practices.md",       "<skills-dir>/gangtise-copilot/references/best_practices.md"),
    ("gangtise-copilot/config-template/authorization.json.example", "<skills-dir>/gangtise-copilot/config-template/authorization.json.example"),
]:
    size = fetch_github_file(path, local)
    print(f"OK {path} → {local} ({size} bytes)")
```

> **重要提示**：与 GitHub 的网络连接可能不稳定。如果任何文件下载失败，请仅重试该文件，最多重试 3 次，每次尝试之间等待 2 秒。不要因单个文件失败而中止整个流程。

### 第 2 步 — 向智能体注册此技能

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

**作用**：从华为云 OBS 官方存储桶下载 4 个 ZIP 包，解压出 19 个技能目录，并将它们以符号链接的方式链接到检测到的智能体技能目录中（`~/.openclaw/skills/`、`~/.claude/skills/` 等）。

**已知的智能体技能目录路径**（如果自动检测未能识别你的目录）：

| 智能体 | 技能目录 |
|---|---|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.agents/skills/` |
| OpenClaw | `~/.openclaw/skills/` 或 `<agent-workspace>/skills/` |

如果安装失败，请查看 `references/installation_flow.md`。

### 第 4 步 — 配置凭证

```bash
bash <gangtise-copilot-dir>/scripts/configure_auth.sh \
  --access-key <your-accessKey> \
  --secret-key <your-secretAccessKey>
```

**作用**：
1. 写入 `~/.config/gangtise/authorization.json`（权限模式为 600）
2. 发起实时身份验证调用，以确认凭证有效
3. 写入 `~/.GTS_AUTHORIZATION` 运行时令牌
4. **创建符号链接**，将每个已安装技能自身的 `<gangtise-skill-dir>/scripts/.authorization` 链接到共享凭证文件

> ⚠️ **关键提示**：完成第 3 步后，即使凭证已存在，`diagnose.sh` 也可能报告“19 个技能缺少 .authorization”。即使 `~/.config/gangtise/authorization.json` 已经存在，也要执行第 4 步——`configure_auth.sh` 会创建缺失的符号链接。

### 第 5 步 — 验证安装

```bash
bash <gangtise-copilot-dir>/scripts/diagnose.sh
```

预期输出：**9 项通过 ✅，0 项失败 ❌**——全部 19 个技能均已存在、凭证有效，并且 RAG 可访问。

如果仍有任何 ❌ 或 ⚠️，请对照查看 `references/known_issues.md`。

### 第 6 步 — 使用真实查询进行测试

```bash
# Example: query latest research report for 宁德时代
# Use gangtise-file-client with its report runner:
cd <gangtise-copilot-dir>/references/
# See skill_registry.md for the exact command per skill
```

---

## 概述

Gangtise 是一个中国专业投资研究数据平台。它提供的 OpenAPI 涵盖研究报告、公司公告、会议纪要、首席分析师观点、财务报表、估值指标、OHLC 行情数据、股东数据、行业指标，以及预构建研究工作流技能目录。底层 API 设计良好，但其技能生态系统**难以发现**：没有公开清单列出这 19 个技能；这些技能以独立 ZIP 文件的形式分发在一个已禁用列表权限的华为云 OBS 存储桶中；并且这些技能采用两套并行的命名约定（精简功能线使用 `gangtise-<name>`，完整功能线使用 `gangtise-<name>-client`），两者具备不同的功能集。首次使用的用户必须通过逆向分析才能掌握完整的技能清单，然后才能进行安装。

Gangtise Copilot 通过一条命令解决了这个问题：

1. 通过单一的“批量下载并分发”流程，将全部 19 个 Gangtise 官方技能安装到 Claude Code、OpenClaw 和 Codex。
2. 引导用户完成 accessKey + secretAccessKey 设置，并向 `open.gangtise.com/application/auth/oauth/open/loginV2` 发起实时身份验证调用。
3. 提供只读诊断脚本，用于报告已安装的技能、有效的凭证以及可访问的功能层级。
4. 提供预设安装模式（`minimal` / `workshop` / `full`），使用户能够根据其账户许可证实际允许的范围选择合适的安装规模——有关为何“安装规模最大”并非安全默认选项的原因，请参阅 `references/known_issues.md` 中的 ISSUE-007。

**2026 年 4 月使用时的运行时注意事项**：安装技能后，即使 `~/.config/gangtise/authorization.json` 已存在，也要运行 `configure_auth.sh`。上游 CLI 脚本还会读取 `~/.GTS_AUTHORIZATION`，这是一个仅包含运行时令牌的文件。配置程序会刷新这两个文件。

## 架构原则（不得违反）

此技能是 Gangtise OpenAPI 技能套件之上的一个**包装层**。以下包装层约定不容更改：

- **绝不将上游文件内置到本技能中。** 此技能目录不包含任何 Gangtise 技能内容的副本、分叉版本或摘录。Gangtise 发布新版本时，用户可以直接获得新版本，不会受到此包装层的任何干扰——安装程序每次运行都会从规范的 OBS URL 重新下载。
- **修复（如有需要）应在运行时进行，而不是在发布时进行。** 此包装层提炼自一次未遇到任何上游实际缺陷的会话——问题在于可发现性和安装编排，而非文件损坏。如果未来出现上游缺陷，会将其添加到 `references/known_issues.md`，并提供运行时修复说明，而不会在发布时打补丁。
- **修改上游文件前始终先征得同意。** 修改任何已安装的 `gangtise-*` 技能目录，都需要通过 AskUserQuestion 获得用户的明确同意。
- **授人以渔，而非隐藏细节。** 每个安装步骤都会向用户准确展示下载了哪些技能、下载来源以及凭证文件的保存位置。这样用户就能学会自行维护其安装。

## 此技能的功能

| 功能 | 入口点 | 详情 |
|---|---|---|
| 1. 安装 Gangtise 技能（最小默认集、研讨会别名、完整集或通过 `--only` 自定义） | `scripts/install_gangtise.sh` | 参见 `references/installation_flow.md` |
| 2. 配置 accessKey + secretAccessKey 凭证 | `scripts/configure_auth.sh` | 参见 `references/credentials_setup.md` |
| 3. 诊断安装状态、凭证有效性和功能层级 | `scripts/diagnose.sh` | 参见 `references/known_issues.md` |
| 4. 查找哪个 Gangtise 技能可以回答特定的数据问题 | 下方的技能注册表 + `references/skill_registry.md` | — |

## 路由

触发此技能时，对用户的意图进行分类，并跳转到对应的功能：

| 用户说了类似这样的话…… | 转到 |
|---|---|
| "装 gangtise"、"安装 gangtise"、"我想用 gangtise 的数据"、"把 gangtise 的 skill 都装上" | **一键安装（上面的步骤 1–5）** |
| "配 gangtise 的 key"、"配置 gangtise 凭证"、"gangtise accessKey"、"secretAccessKey" | **功能 2** |
| "gangtise 报错"、"令牌无效"、"接口地址错误"、"gangtise skill 加载失败"、"我的 gangtise 装得不对" | **功能 3** |
| "宁德时代的研报"、"过去 30 天的首席观点"、"OHLC 蜡烛图"、"个股研究报告 L2"、"对宁德时代做观点 PK" | **功能 4** → 技能注册表 → 调用匹配的上游技能 |
| "帮我从头跑一遍 gangtise" | 一键安装（依次执行步骤 1–5） |

如有疑问，请从**功能 3**（`diagnose.sh`）开始——它是唯一的只读入口点，并且会准确显示当前哪些安装和凭证受到阻碍。运行它绝不会产生破坏性副作用。

## 能力 1：安装 Gangtise 技能

Gangtise 在华为云 OBS 存储桶中发布了 19 个独立技能。它们被组织为 3 个捆绑 ZIP 包和 1 个独立 ZIP 包。安装程序会下载这 4 个压缩包，提取其中的 19 个技能目录，并将每个目录以符号链接的方式链接到检测到的智能体技能目录中。

### 分发源

所有技能均来自 Gangtise 官方 OBS 存储桶：

```
https://gts-download.obs.myhuaweicloud.com/skills/
```

不使用镜像。安装程序直接使用此 URL。

### 捆绑包映射

| 捆绑包 | 大小 | 包含内容 |
|---|---|---|
| `gangtise-skills-client.zip` | 160 KB | data-client、kb-client、file-client、**file-client-no-download**、**stockpool-client** |
| `gangtise-research.zip` | 220 KB | stock-research、opinion-pk、thematic-research、stock-selector、event-review、interview-outline、announcement-digest、opinion-summarizer、wechat-summary、data-processor |
| `gangtise-skills.zip` | 118 KB | data (v1.2.0)、file、kb — 旧版“minimal”并行产品线 |
| `gangtise-web-client.zip` | 8 KB | web-client（独立提供，不在任何捆绑包中） |

**总计**：4 次 HTTP 请求 → 19 个技能目录。

有两个技能（`gangtise-file-client-no-download` 和 `gangtise-stockpool-client`）**仅存在于 `gangtise-skills-client` 捆绑包中**——它们没有独立的 ZIP 包。如果简单地采用“列出每个技能的独立 ZIP 包”这种方法，就会完全遗漏它们。完整说明请参阅 `references/known_issues.md` 中的 ISSUE-002。

### 一条命令安装

```bash
bash scripts/install_gangtise.sh
```

选项：

```bash
bash scripts/install_gangtise.sh --preset minimal    # default — 3 skills via public open-* endpoints
bash scripts/install_gangtise.sh --preset workshop   # alias for minimal (same 3 skills)
bash scripts/install_gangtise.sh --preset full       # all 19 skills (most -client will fail without skills-backend ACL)
bash scripts/install_gangtise.sh --only data-client,kb-client,file-client  # custom subset
bash scripts/install_gangtise.sh --no-openclaw       # skip OpenClaw even if detected
bash scripts/install_gangtise.sh --target claude-code  # force single target
```

### 预设内容

| 预设 | 技能 | 适用场景 |
|---|---|---|
| **minimal**（默认） | `gangtise-data`、`gangtise-file`、`gangtise-kb` | 保守型安装方案，适用于任何能够完成身份验证的账户。仅使用公共 `open-*` 端点——不受 ISSUE-007 影响。涵盖 OHLC、财务数据、公告、海外报告和 RAG 检索。 |
| **workshop** |（`minimal` 的别名——同样的 3 个技能） | 历史版本的预设捆绑了 7 个高度依赖 `-client` 的技能，但由于 ISSUE-007，这些技能在大多数账户上都会被阻止，并导致现场演示无法正常运行。该预设现在与 `minimal` 指向相同的 3 个技能，因此不会再让工作坊使用者误踩陷阱。 |
| **full** | 全部 19 个技能 | 同时并列安装两条产品线。适合探索完整的 Gangtise 技能目录。**如果你的账户缺少 `skills-backend/*` ACL，大多数 `-client` 技能将在运行时失败**——请先使用 ISSUE-007 中的诊断方法进行确认。 |

## 能力 2：配置凭据

每个 Gangtise 技能都需要一个与其 Python 运行时位于同一位置的 `.authorization` 凭据文件，文件采用以下两种格式之一：

**格式 A** — accessKey + secretAccessKey（最常见，可自动刷新令牌）：
```json
{
  "accessKey": "<your-accessKey>",
  "secretAccessKey": "<your-secretAccessKey>"
}
```

**格式 B** — 长期令牌（高级用法，适用于预先生成的长效令牌）：
```json
{
  "long-term-token": "Bearer <token>"
}
```

由于 19 个技能都需要相同的 `.authorization` 文件，封装工具会在 `~/.config/gangtise/authorization.json` 存储**一个共享文件**（遵循 XDG 标准，权限模式为 600），并将每个技能的本地凭据文件符号链接到该文件。轮换凭据时只需编辑一个文件，而不是 19 个。

运行配置工具：

```bash
bash scripts/configure_auth.sh
```

它将：

1. 提示输入 accessKey 和 secretAccessKey（如果已设置 `GANGTISE_ACCESS_KEY` / `GANGTISE_SECRET_KEY` 环境变量，则从中读取）。
2. 写入 `~/.config/gangtise/authorization.json`，并将权限模式设为 600。
3. 向 `https://open.gangtise.com/application/auth/oauth/open/loginV2` 发起**实时身份验证调用**，以验证凭据确实有效。
4. 写入 `~/.GTS_AUTHORIZATION`，其中包含上游 CLI 脚本所需的纯运行时令牌。
5. 为每个已安装技能的本地凭据文件创建指向共享 XDG 文件的符号链接。
6. 报告成功，并显示 Gangtise 身份验证服务器返回的 uid + userName。

### 凭据轮换

```bash
# Edit one file:
$EDITOR ~/.config/gangtise/authorization.json

# Re-verify against the live server:
bash scripts/configure_auth.sh --verify-only
```

无需更改其他文件——符号链接仍然指向更新后的文件。

## 能力 3：诊断安装状态

```bash
bash scripts/diagnose.sh
```

诊断脚本是**严格只读的**。它会检查：

- 在检测到的每个智能体的 `skills/` 目录中，19 个技能中的哪些已存在
- `~/.config/gangtise/authorization.json` 是否存在且权限模式为 600
- 每个技能的本地凭据文件是否为指向共享 XDG 文件的有效符号链接
- 存储的凭据能否通过实时身份验证调用（仅需调用 `oauth/open/loginV2` 的简短探测）
- 规范 RAG 端点是否能响应最小查询（限定范围的存活性检查——证明凭据具有 `rag` 权限范围，而不仅仅是身份验证权限范围）

退出码：

- `0` — 全部正常
- `1` — 一个或多个问题需要用户处理
- `2` — 诊断本身失败（网络错误、无互联网连接等）

如果诊断报告了问题，请将输出与 `references/known_issues.md` 进行交叉核对。每个报告的问题都对应一个具体的修复章节。

## 能力 4：技能注册表——“哪个技能能回答我的数据问题？”

这是封装工具不那么显而易见的价值所在。Gangtise 的 19 个技能构成了一个**二维矩阵**（数据层级 × 操作类型），但相关文档并不清晰。使用下表将用户问题分派给正确的技能：

### 数据层技能（6）

| 想要…… | 上游技能 | 调用方式 |
|---|---|---|
| 查询整个知识库中的语义内容（报告 + 观点 + 纪要） | gangtise-kb-client | 使用 `kb` 运行器，通过 `-q` 指定查询，并可选用 `--file-types` / `--securities` |
| 按类型 + 日期 + 证券列出文档（报告、公告、摘要、观点、路演） | gangtise-file-client | 针对每种文档类型使用专用运行器（report / opinion / summary / announcement / investment_calendar / foreign_report / internal_report / wechat_message） |
| 获取 A 股或港股的 OHLC 日 K 线 | gangtise-data-client | 使用 `quote` 运行器，通过 `--securities {name}` 指定证券，并通过 `-sd` / `-ed` 指定日期范围 |
| 获取财务报表（利润表 / 资产负债表 / 现金流量指标） | gangtise-data-client | 使用 `financial` 运行器，通过 `--securities {name}` 指定证券，并通过 `--indicators` 指定指标 |
| 获取估值指标（PE / PS / PB / PEG + 历史百分位） | gangtise-data-client | 使用 `valuation` 运行器，通过 `--securities {name}` 指定证券 |
| 获取主营业务构成（按产品 / 行业 / 地区） | gangtise-data-client | 使用 `main_business` 运行器，通过 `--securities {name}` 指定证券，并通过 `--classify-method` 指定分类方法 |
| 获取股东 / 前十大持有人数据 | gangtise-data-client | 使用 `shareholder` 运行器，通过 `--securities {name}` 指定证券 |
| 获取宏观 / 行业指标（GDP、CPI、汽车销量、大宗商品价格） | gangtise-data-client | 使用 `industry_indicator` 运行器，通过 `-k {keyword}` 指定关键词 |
| 按名称查找证券标准代码 | gangtise-data-client | 使用 `security` 运行器，通过 `-k {name}` 指定名称 |
| 按主题或行业列出板块成分股 | gangtise-data-client | 使用 `block_component` 运行器，通过 `-k {theme}` 指定主题 |
| 按类别列出指数成分股 | gangtise-data-client | 使用 `index` 运行器，通过 `-k {index type}` 指定指数类型 |
| 在开放网络中搜索 Gangtise 内部知识库未收录的公开信息 | gangtise-web-client | 使用 `web` 运行器，通过 `-q {query}` 指定查询 |

完整的各运行器参数参考和跨技能组合示例，请参阅 [`references/skill_registry.md`](references/skill_registry.md)。

### 工作流层技能（10 个）——高阶研究工作流

这些技能将数据层技能**编排**为端到端的研究工作流。它们遵循 Gangtise 的专业投资研究模板和内置合规护栏（不得使用“买入 / 卖出 / 目标价 / 推荐”等表述），生成 Markdown + HTML 报告。

| 需求 | 使用 |
|---|---|
| 生成 L1-L4 深度的股票研究报告（L1 = 1 页框架，L4 = 完整的机构级覆盖报告） | `gangtise-stock-research` |
| 对投资论点进行对抗性分析（“针对这一看多观点唱反调”） | `gangtise-opinion-pk` |
| 开展主题 / 行业研究（驱动因素分析、枚举阶段、股票筛选、表现检验） | `gangtise-thematic-research` |
| 根据研究标准筛选股票 | `gangtise-stock-selector` |
| 针对市场事件撰写一篇 800-1000 字的事件复盘 / 事后分析 | `gangtise-event-review` |
| 生成公司会议提纲（3 步工作流：数据 → 议题 → 问题） | `gangtise-interview-outline` |
| 跟踪股票池中的近期公告并生成每日摘要 | `gangtise-announcement-digest` |
| 汇总首席分析师近期观点 | `gangtise-opinion-summarizer` |
| 将微信群讨论记录整理为结构化的投资日报 | `gangtise-wechat-summary` |
| 获取有关如何设计自定义数据处理工作流的方法论指导 | `gangtise-data-processor` |

### 实用工具技能（3 个）

| 技能 | 用途 |
|---|---|
| `gangtise-stockpool-client` | 创建 / 重命名 / 删除股票池；向其中添加或移除股票。仅在 `gangtise-skills-client.zip` 中分发。 |
| `gangtise-file-client-no-download` | 禁用下载功能的 `file-client` 变体——适用于只读环境或合规敏感场景。 |
| 旧版 `gangtise-data` / `gangtise-file` / `gangtise-kb` | 较旧的精简并行产品线。`data` 为 v1.2.0，使用严格类型的证券代码（不支持名称解析）。仅当用户需要更小的功能范围时安装。 |

有关完整的各技能脚本目录、版本和能力矩阵，请参阅 `references/skill_registry.md`。

## 此技能拒绝执行的操作

- 将任何 `gangtise-*` 技能的内容引入、分叉或镜像到此目录——仅引用规范的 OBS URL。
- 在 SKILL.md 中固定上游技能版本——安装程序始终下载当前的 OBS 构件。
- 静默修改上游文件——任何修改路径（如果将来添加）都必须通过 AskUserQuestion 获得明确同意。
- 硬编码个人 accessKey / secretAccessKey 值。
- 提供投资建议或作出交易决策。Gangtise 自身的技能已实施这些合规规则；此包装器仅进行严格委托。

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