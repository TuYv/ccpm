---
name: maggy
description: Maggy is a local AI engineering command center. AI-prioritized inbox across issue trackers (GitHub Issues/Asana), one-click TDD execute with iCPG context enrichment, daily competitor intelligence briefing.
when-to-use: "When you want a persistent dashboard to triage tickets and spawn Claude Code runs against any repo"
user-invocable: true
effort: medium
---
# Maggy 技能

**Maggy** 是一个通用的本地 AI 工程指挥中心。安装一次，将其指向团队的问题跟踪器和代码库，即可获得：

- **AI 优先级收件箱** — 根据紧急程度、OKR 对齐度和更新时间对未解决问题进行排序
- **一键执行** — 在本地启动 Claude Code，并注入 iCPG 上下文
- **竞争对手情报** — 每日提供关于竞争格局的 AI 简报
- **无需硬编码** — 适用于任何团队、任何技术栈、任何问题跟踪器

### ⚠️ Execute 权限模型（重要）

Execute 目前运行 `claude -p --dangerously-skip-permissions`，因此 TDD
流水线不会因等待批准提示而被阻塞（子进程没有终端）。
该标志**授予 Claude 在目标代码库内写入/编辑文件和运行 shell
命令的完整权限**，并且它接收的提示中包含来自问题跟踪器的内容（任何团队成员都可以创建这些内容）。

**已实施的加固措施：**
- `working_dir` 会根据 `~/.maggy/config.yaml` 中的代码库根目录列表进行验证 — Claude 无法被指向任意文件系统路径。
- 只有来自你所配置的问题跟踪器的工单才能进入 Execute；不会有来自公共互联网的输入流入提示。

**路线图：** 将无条件启用的标志置于每个代码库的配置项
（`auto_approve: true|false`）之后，使特权执行变为选择启用。
在此之前，请将 Execute 视同你对所点击按钮的任何工单执行
`git pull && make` — 只能在你拥有的仓库上运行，并针对来自你信任的作者的工单。

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

## Maggy 能提供帮助的场景

| 场景                                     | Maggy 的帮助                               |
|------------------------------------------|-----------------------------------------------|
| 早晨对 50 个未解决问题进行分流           | AI 对其进行排序；最重要的项目保持在顶部       |
| 实现一个工单                             | `Execute` → 经 iCPG 丰富的 TDD 流水线         |
| “竞争对手正在发布什么？”                 | 每日简报 + 可筛选的新闻源                     |
| 每个团队拥有多个仓库                     | 根据工单内容自动选择正确的仓库               |
| 新团队入职                               | 通过 `/maggy-init` 配置，无需编写代码         |

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

## 提供商抽象

Maggy 服务不会直接访问 GitHub/Asana——它们通过 `IssueTrackerProvider` Protocol 进行交互。可直接替换为：

- `GitHubIssuesProvider` — 扫描多个仓库，汇总未解决的问题，将“完成”映射为已关闭
- `AsanaProvider` — 查询项目，并遵循工作区范围
- `LinearProvider` — 面向未来的存根

相同的收件箱、Execute 流程和竞争对手功能可与任何提供商配合使用。

---

## Execute 流程

当你点击工单上的 Execute 时：

1. Maggy 查询配置的 iCPG，获取相关符号、影响范围和先前的意图
2. 根据工单关键词和已配置的代码库选择正确的工作目录
3. 在该目录中启动 `claude -p --dangerously-skip-permissions`
4. 运行分析 → 编写失败测试 → 实现
5. 将输出捕获到一个会话中，你可以在 Sessions 标签页中跟踪该会话

由于启动的 Claude Code 在目标仓库中运行，它会读取：
- 该仓库的 `CLAUDE.md`
- 你的全局 `~/.claude/CLAUDE.md`
- 所有引导技能
- `.claude/hooks/`、`.mcp.json`

因此 Execute 可以获得完整的引导体验——而不是精简版。

---

## 竞争对手情报

通用功能——适用于任何领域：

1. 在 `~/.maggy/config.yaml` 中配置 `competitors.categories: ["fintech", "embedded-finance"]`
2. 点击 Discover——Claude 会识别出 12-18 个竞争对手（市场领导者、AI 优先的挑战者、垂直领域专家）
3. Maggy 每日监控他们的 RSS 博客和 Google News
4. 每日简报每天生成一次（带缓存），也可以按需重新生成

---

## 未包含的内容

Maggy MVP 专注于核心功能。以下内容尚未交付：

- 会议机器人（语音）
- Slack 集成
- P2P 网络 + 会话交接
- 自我改进（`/improve-maggy`）
- Linear 提供商（仅为存根）

这些属于 v2 的工作内容。

---

## 文件

- `maggy/PLAN.md` — 架构决策依据
- `maggy/README.md` — 用户文档
- `maggy/src/providers/base.py` — IssueTrackerProvider Protocol
- `maggy/src/services/executor.py` — TDD 流程
- `maggy/src/services/competitor.py` — 发现 + 简报
- `maggy/src/services/inbox.py` — AI 优先级排序
- `commands/maggy.md` — `/maggy` 启动器
- `commands/maggy-init.md` — `/maggy-init` 设置向导