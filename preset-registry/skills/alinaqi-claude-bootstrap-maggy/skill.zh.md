---
name: maggy
description: Maggy is a local AI engineering command center. AI-prioritized inbox across issue trackers (GitHub Issues/Asana), one-click TDD execute with iCPG context enrichment, daily competitor intelligence briefing.
when-to-use: "When you want a persistent dashboard to triage tickets and spawn Claude Code runs against any repo"
user-invocable: true
effort: medium
---
# Maggy Skill

**Maggy** 是一个通用的本地 AI 工程指挥中心。只需安装一次，将其连接到团队的问题跟踪器和代码库，即可获得：

- **AI 优先级收件箱** — 根据紧迫性、OKR 一致性和新近程度对开放问题进行排序
- **一键执行** — 在本地启动 Claude Code，并注入 iCPG 上下文
- **竞品情报** — 每日提供关于竞争格局的 AI 简报
- **无需硬编码** — 适用于任何团队、任何技术栈和任何问题跟踪器

### ⚠️ 执行权限模型（重要）

Execute 当前运行 `claude -p --dangerously-skip-permissions`，以确保 TDD
流水线不会因等待批准提示而阻塞（子进程没有终端）。
该标志**授予 Claude 完整权限，使其能够在目标代码库中写入/编辑文件并运行 shell
命令**，而且 Claude 收到的提示中包含来自问题跟踪器的内容（任何团队成员都可以编写这些内容）。

**已实施的安全加固措施：**
- `working_dir` 会根据 `~/.maggy/config.yaml`
  中的代码库根目录列表进行验证，因此无法将 Claude 指向任意文件系统路径。
- 只有来自已配置跟踪器的工单才能进入 Execute；不会有任何公共互联网
  输入流入提示。

**路线图：**将这个无条件使用的标志移至按代码库配置的选项之后
（`auto_approve: true|false`），使特权执行变为选择性启用。
在此之前，请将 Execute 视为对你按下按钮的任何工单执行 `git pull && make`
——只在你拥有的仓库中运行，并且仅处理来自你信任的作者的工单。

```
┌──────────────────────────────────────────────────────────────┐
│  maggy               ──────────────┐                          │
│  ├── skills/         ← installed globally → ~/.claude/       │
│  ├── commands/       ← installed globally → ~/.claude/       │
│  ├── scripts/icpg/   ← used by Maggy for context enrichment  │
│  └── maggy/          ← dashboard: run `./install.sh` to use  │
│      ├── src/                                                │
│      │   ├── providers/   ← GitHub / Asana / Linear          │
│      │   ├── services/    ← inbox, competitor, executor      │
│      │   └── api/         ← FastAPI routes                   │
│      └── install.sh                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Maggy 适用的场景

| 场景                                     | Maggy 如何提供帮助                              |
|------------------------------------------|-----------------------------------------------|
| 早晨对 50 个开放问题进行分类处理         | AI 对它们进行排序；最重要的项目保持置顶        |
| 实现工单                                 | `Execute` → iCPG 增强的 TDD 流水线             |
| “竞争对手正在发布什么？”                 | 每日简报 + 可筛选的新闻动态                    |
| 每个团队有多个仓库                       | 根据工单内容自动选择正确的仓库                 |
| 新团队入职                               | 通过 `/maggy-init` 配置，无需编写代码           |

---

## 安装和配置

```bash
# One-time install
cd $(cat ~/.claude/.bootstrap-dir)/maggy
./install.sh

# Configure
# Edit ~/.maggy/config.yaml — see maggy/config.example.yaml for the schema

# Credentials
export GITHUB_TOKEN=ghp_...
export ANTHROPIC_API_KEY=sk-ant-...

# Run
python3 -m src.main

# Or from Claude Code:
#   /maggy-init    # interactive wizard
#   /maggy         # launch dashboard
```

---

## 提供方抽象

Maggy 服务永远不会直接访问 GitHub/Asana，而是通过 `IssueTrackerProvider` 协议与它们交互。可在以下提供方之间直接替换：

- `GitHubIssuesProvider` — 扫描多个仓库，汇总未关闭的议题，并将“完成”映射为已关闭
- `AsanaProvider` — 查询项目，并遵循工作区范围
- `LinearProvider` — 为未来预留的存根

同一套收件箱、Execute 流水线和竞品功能可与任意提供方配合使用。

---

## Execute 流水线

当你在工单上点击 Execute 时：

1. Maggy 查询已配置的 iCPG，以获取相关符号、影响范围和先前意图
2. 根据工单关键词和已配置的代码库选择正确的工作目录
3. 在该目录中启动 `claude -p --dangerously-skip-permissions`
4. 依次执行分析 → 编写失败测试 → 实现
5. 将输出捕获到会话中，你可以在 Sessions 选项卡中跟踪该会话

由于启动的 Claude Code 在目标仓库中运行，因此它会加载：
- 该仓库的 `CLAUDE.md`
- 你的全局 `~/.claude/CLAUDE.md`
- 所有引导技能
- `.claude/hooks/`、`.mcp.json`

因此，Execute 能获得完整的引导体验，而不是精简版本。

---

## 竞品情报

通用——适用于任何领域：

1. 在 `~/.maggy/config.yaml` 中配置 `competitors.categories: ["fintech", "embedded-finance"]`
2. 点击 Discover——Claude 会识别 12–18 个竞争对手（市场领导者、AI 优先的挑战者、垂直领域专家）
3. Maggy 每天监控其 RSS 博客和 Google 新闻
4. 每日简报每天生成一次（并缓存），也可按需重新生成

---

## 未包含的功能

Maggy MVP 专注于核心功能。以下功能尚未发布：

- 会议机器人（语音）
- Slack 集成
- P2P 网络和会话移交
- 自我改进（`/improve-maggy`）
- Linear 提供方（仅有存根）

这些属于 v2 的工作范围。

---

## 文件

- `maggy/PLAN.md` — 架构设计依据
- `maggy/README.md` — 用户文档
- `maggy/src/providers/base.py` — IssueTrackerProvider 协议
- `maggy/src/services/executor.py` — TDD 流水线
- `maggy/src/services/competitor.py` — 发现和简报
- `maggy/src/services/inbox.py` — AI 优先级排序
- `commands/maggy.md` — `/maggy` 启动器
- `commands/maggy-init.md` — `/maggy-init` 设置向导