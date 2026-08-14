---
name: auto-repo-setup
description: >-
  Diagnose, repair, and standardize repository setup and safe Git workflows for
  Claude Code or Codex. Use when a repository will not run, a collaborator is
  onboarding, dependencies or credentials are missing, the user wants startup
  sync, SessionStart output is duplicated, project instructions or hooks need
  auditing, or commit/push/conflict/history-cleanup needs a guarded workflow.
  Route ordinary startup behavior through project instructions or a natural
  language request; use lifecycle hooks only when behavior must occur before the
  first prompt and the target runtime has been verified.
argument-hint: "[repository path]"
---
# 自动化仓库设置

在不改变用户通常工作方式的前提下，使仓库可用。将设置视为一项基于证据的仓库任务，而不是面向具有特定职位人员的特殊界面。

## 入口路由

在更改任何内容之前，先对请求进行分类。不要仅仅因为这些模式都包含“设置”一词就将其合并。

| 用户期望的结果 | 模式 | 首要操作 |
|---|---|---|
| “无法运行”、缺少依赖项、新机器 | 环境修复 | 阅读项目说明并检测实际技术栈 |
| “开始工作前先同步”、“拉取最新内容” | 会话例程 | 遵循项目说明，或执行用户以自然语言提出的请求 |
| 重复或意外的 hook 输出 | Hook 诊断 | 在编辑配置之前，统计注册次数和触发会话数 |
| 团队成员需要可重复执行的交接流程 | 仓库交接 | 审核现有的上手指南，仅补充缺失的操作约定 |
| 提交、推送、冲突、泄露的密钥/历史记录 | Git 安全 | 在执行变更操作前阅读 [references/git_safety.md](references/git_safety.md) |
| 必须在首次提示之前发生的行为 | 启动自动化 | 阅读 [references/startup_automation.md](references/startup_automation.md) 并通过其中的 hook 门禁 |

## 操作原则

1. **不要根据角色推断能力。** 应与用户展现出的操作层级相匹配。协作者可以告诉代理“先同步远程仓库”；除非用户明确要求，否则不要凭空创建启动器、快捷方式或向导。
2. **使用能够满足目标的最简机制。** 优先顺序如下：
   直接向 Agent 发出指令 → 项目指令 → 显式命令 → 生命周期
   hook。Hook 并不是语句的更专业版本。
3. **先检查权威信息，再生成内容。** 依次阅读当前用户请求、项目说明、上手指南/运行手册、清单文件、锁文件和实际命令输出。对于未声明需要 ONBOARDING.md、Python、uv、ffmpeg 或 .env 的仓库，不要将它们设为必需项。
4. **保留用户的工作成果。** 绝不要为了让设置看起来成功而自动执行 stash、merge、rebase、force、丢弃或覆盖本地更改。
5. **定义可证伪的成功状态。** “依赖项已安装”还不够；应运行项目实际使用的冒烟测试或启动命令，并验证可观察到的结果。
6. **在查明原因之前，让诊断保持只读。** 安装、配置编辑、hook 注册、提交和外部写入操作需要用户请求所隐含的授权；破坏性操作或公开操作需要明确批准。

## 工作流 A — 环境修复

### A1. 阅读项目结构说明

仅阅读实际存在的文件，并遵循以下顺序：

1. AGENTS.md 和 AGENTS.override.md
2. CLAUDE.md 和限定作用域的项目规则
3. ONBOARDING.md 或仓库指定的设置指南/运行手册
4. README.md
5. 清单文件、锁文件、任务运行器、CI 和容器配置
6. 仅当请求涉及代理行为时，才读取现有的 Claude/Codex 设置

如果不存在上手指南，请根据权威清单文件和实际运行过的命令推断设置路径。除非请求中包含持久化交接，否则不要停下来询问是否要创建文档。

### A2. 运行只读能力清单检查

当已有 Python 3.10+ 运行环境可用时，使用随附的 scripts/check_env.py 检查仓库根目录。该脚本会检测声明的生态系统，并且仅检查相关工具链；它不会安装依赖项，也不会读取机密值。如果缺少的前置条件正是 Python 本身，则直接执行同等的只读清单检查，而不要仅仅为了运行审计而安装 Python。

~~~bash
uv run python scripts/check_env.py --repo <repo-root>
uv run python scripts/check_env.py --repo <repo-root> --json
~~~

将该清单视为证据，而不是项目设置规范。自定义运行手册或 CI 工作流可能需要通用清单无法推断出的工具。

预期结果：

- exit 0：根据清单文件推断出的所有工具链均可用；
- exit 1：缺少一个或多个推断出的前置条件；
- exit 2：无法安全检查仓库或其元数据。

### A3. 修复根本原因

对于每项未通过的要求：

1. 记录确切的命令、退出代码、stdout 和 stderr。
2. 将故障追溯到声明它的来源：项目指南、清单文件、锁文件、配置或运行时日志。
3. 应用符合项目规范的最小修复。
4. 重新运行未通过的检查，然后再继续下一项。

不要一开始就重启、重新安装所有内容或切换包管理器。不要打印 .env 或凭据内容；在不回显值的情况下验证其是否存在及其行为。

### A4. 验证产品路径

运行项目文档中说明的冒烟测试、构建命令或启动命令。如果不存在，则根据 CI/任务运行器配置推导一个，并明确标注该命令是推导得出的。验证可观察到的结果，而不仅仅是零退出代码。

报告：

- 出现了什么故障及相关证据；
- 做了哪些更改；
- 确切的验证方式及结果；
- 任何仍需用户执行的操作或因权限不足而受阻的事项。

## 工作流 B — 常规 Git 同步

对于“开始工作前同步”，优先使用一条由使用该仓库的各个 Agent 共享的简短项目指令。常规流程如下：

1. 检查分支、上游和工作区状态。
2. 如果工作区干净，则运行 git pull --ff-only。
3. 如果存在本地更改，不要自动暂存或拉取；说明当前状态。
4. 如果本地与远程历史已分叉，不要自动合并、变基或强制操作；说明当前状态。
5. 如果网络连接失败，请明确说明；仅当用户的任务可以基于本地版本安全继续时，才继续在本地工作。

协作者也可以直接说：

> 开始之前先同步最新的远程版本。

这是一条常规的 Agent 指令，而不是降级后的后备方案。

不要仅仅为了自动执行此常规流程而注册 SessionStart。静态行为应写入 AGENTS.md/CLAUDE.md；Agent 可以检查上下文并处理异常的 Git 状态，而不是将这些状态隐藏在 shell 进程中。

## 工作流 C — 仓库交接

仅当用户需要持久化的交接资料，并且现有项目导航尚未提供此类资料时，才创建或修订入门文档。

将 [references/onboarding_template.md](references/onboarding_template.md) 用作检查清单，而不是照搬为 Python/视频模板：

- 从清单文件和实际项目命令中推导先决条件；
- 在每条命令后包含预期输出；
- 将一次性设置与日常使用分开；
- 包含针对实际观察到的故障的恢复步骤；
- 将项目说明作为操作层面的 SSOT，并避免重复配置值。

在对用户而言重要的每个目标操作系统上验证所有命令。

## 工作流 D — 启动自动化与钩子诊断

在添加或更改任何钩子之前，请阅读 [references/startup_automation.md](references/startup_automation.md)。

### 首先诊断重复输出

1. 枚举项目、本地、用户、托管和插件的钩子注册项。
2. 统计匹配的条目；不要根据三次输出推断存在“三个注册项”。
3. 确定是哪些根会话、恢复、压缩或子代理触发了它们。
4. 验证事件匹配器和当前运行时载荷。
5. 在提出更改建议之前说明根本原因。

### 仅在通过钩子门禁后安装

随附的初始化程序专用于 Claude Code，并且仅安装轻量级的启动上下文提示。它会保留不相关的设置、添加启动匹配器、验证指南路径、以原子方式写入，并且具有幂等性。

首先预览：

~~~bash
uv run python scripts/init_session_start_hook.py \
  --repo <repo-root> \
  --guide ONBOARDING.md \
  --dry-run
~~~

在用户确认确实需要进行提示前注入后，运行同一条命令，但不带 --dry-run。使用 --remove 仅删除受管理的条目。

切勿照搬此配置到 Codex。Codex 项目行为通常应放在 AGENTS.md 中；如果确实需要 Codex 钩子，请先验证已安装版本的根代理/子代理行为和载荷。

## Git 安全

在提交、推送、解决冲突或重写历史记录之前，请阅读 [references/git_safety.md](references/git_safety.md)。关键规则如下：

- 仅暂存预期的路径；
- 除非用户在本次会话中明确输入了绕过指令，否则绝不绕过钩子；
- 推送前从托管服务验证仓库可见性；
- 在公开推送、强制推送或重写历史记录之前获得明确批准；
- 根据项目语义解决冲突，绝不盲目选择“ours”或“theirs”；
- 在撤销已泄露的凭据之前，不得将历史记录清理视为完成。

使用 [references/pii_guard.md](references/pii_guard.md) 审查公开分发的内容。扫描器显示绿色并不能替代语义审查。

如需执行只读的历史记录扫描，现有的 scripts/sanitize_history.sh 仍然可用。它绝不会重写历史记录；应将其发现视为待核实项，并且未经明确批准，不得执行重写命令。

## 反向审查边界

当获批工作会实质性更改安全策略、共享生命周期钩子、CI/CD、依赖项或破坏性 Git 行为时，请使用反向审查。不要为常规设置检查或单行项目说明组建审查团队。根据发生概率、成本、实际使用情况和直接验证来筛选每项发现。

## 资源

- scripts/check_env.py — 可感知技术栈的只读仓库清点工具
- scripts/init_session_start_hook.py — 带防护机制的 Claude Code 启动提醒管理器
- scripts/sanitize_history.sh — 只读的历史记录候选项扫描工具
- [references/startup_automation.md](references/startup_automation.md) — 项目
  指令、命令与钩子的决策和验证
- [references/git_safety.md](references/git_safety.md) — 同步、提交、推送、
  冲突及历史记录重写的关卡
- [references/onboarding_template.md](references/onboarding_template.md) — 持久化的
  交接清单
- [references/pii_guard.md](references/pii_guard.md) — 公开内容扫描层