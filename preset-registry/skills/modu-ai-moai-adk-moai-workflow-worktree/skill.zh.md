---
name: moai-workflow-worktree
description: >
  Git worktree management for parallel SPEC development with isolated workspaces,
  automatic branch registration, and seamless MoAI-ADK integration. Use when
  setting up parallel development environments.

when_to_use: >
  Use for git worktree management: parallel SPEC development with isolated
  workspaces, automatic branch registration, branch isolation, and
  seamless MoAI-ADK integration for multiple concurrent SPECs.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Grep, Glob
user-invocable: false
metadata:
  version: "1.1.0"
  category: "workflow"
  status: "active"
  updated: "2026-01-08"
  modularized: "true"
  tags: "git, worktree, parallel, development, spec, isolation"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# MoAI 工作树管理

用于并行 SPEC 开发的 Git 工作树管理系统，提供隔离工作区、自动注册以及与 MoAI-ADK 的无缝集成。

核心理念：每个 SPEC 都应拥有独立的隔离工作区，从而实现真正的并行开发，避免上下文切换带来的额外开销。

## 快速参考（30 秒）

什么是 MoAI 工作树管理？
一种专门的 Git 工作树系统，可为每个 SPEC 创建隔离的开发环境，从而实现无冲突的并行开发。

主要功能：
- 隔离工作区：每个 SPEC 都有自己的工作树，并拥有独立的 Git 状态
- 自动注册：工作树注册表会跟踪所有活动工作区
- 并行开发：可以同时开发多个 SPEC
- 无缝集成：可与 /moai:1-plan、/moai:2-run、/moai:3-sync 工作流配合使用
- 智能同步：在需要时自动与基础分支同步
- 自动清理：自动清理已合并的工作树

快速访问：
- CLI 命令：请参阅 modules/worktree-commands.md 中的工作树命令模块
- 管理模式：请参阅 modules/worktree-management.md 中的工作树管理模块
- 并行工作流：请参阅 modules/parallel-development.md 中的并行开发模块
- 集成指南：请参阅 modules/integration-patterns.md 中的集成模式模块
- 故障排除：请参阅 modules/troubleshooting.md 中的故障排除模块

使用场景：
- 并行开发多个 SPEC
- 隔离的测试环境
- 功能分支隔离
- 代码审查工作流
- 实验性功能开发

---

## 实施指南（5 分钟）

### 1. 核心架构 - 工作树管理系统

目的：为并行 SPEC 开发创建隔离的 Git 工作树。

主要组件：

1. 工作树注册表 - 跟踪所有工作树的中央注册表
2. 管理器层 - 核心工作树操作，包括创建、切换、删除和同步
3. CLI 接口 - 用户友好的命令界面
4. 模型 - 用于工作树元数据的数据结构
5. 集成层 - MoAI-ADK 工作流集成

注册表结构：

注册表文件以 JSON 格式存储工作树元数据。每个工作树条目都包含标识符、文件路径、分支名称、创建时间戳、上次同步时间、状态（活动或已合并）以及基础分支引用。配置部分定义了工作树根目录、自动同步偏好设置以及已合并分支的清理行为。

文件结构：

工作树系统会在用户的全局主目录中创建专用的目录结构。在工作树根目录（~/.moai/worktrees/{ProjectName}/）中，可以找到中央注册表 JSON 文件以及每个 SPEC 的独立目录。每个 SPEC 目录都包含用于工作树元数据的 .git 文件以及所有项目文件的完整副本。

详细参考：请参阅 modules/worktree-management.md 中的工作树管理模块

---

### 2. CLI 命令 - 完整的命令界面

目的：为工作树管理提供直观的 CLI 命令。

核心命令：

要为某个 SPEC 创建新的 worktree，请使用 new 命令，并在后面指定 SPEC ID 和描述。要列出所有 worktree，请使用 list 命令。要切换到特定 worktree，请使用 switch 命令并指定 SPEC ID。要获取用于 shell 集成的 worktree 路径，请结合 eval 使用 go 命令。要将 worktree 与其基础分支同步，请使用 sync 命令。要移除 worktree，请使用 remove 命令。要清理已合并的 worktree，请使用 clean 命令。要显示 worktree 状态，请使用 status 命令。对于配置管理，请使用 config 命令及其 get 或 set 子命令。

命令类别：

1. 创建：new 命令用于创建隔离的 worktree
2. 导航：list、switch 和 go 命令用于浏览和导航
3. 管理：sync、remove 和 clean 命令用于维护 worktree
4. 状态：status 命令用于检查 worktree 状态
5. 配置：config 命令用于管理设置

Shell 集成：

要切换到 worktree 目录，有两种效果很好的方法。switch 命令可直接切换到 worktree 目录。go 命令会输出一条可由 shell 通过 eval 执行的 cd 命令，这是 shell 脚本和自动化场景的推荐模式。

详细参考：请参阅 modules/worktree-commands.md 中的 Worktree 命令模块

---

### 3. 并行开发工作流——隔离的 SPEC 开发

目的：实现真正的并行开发，无需切换上下文。

工作流集成：

在使用 /moai:1-plan 的规划阶段，会创建 SPEC，同时 worktree new 命令会自动设置 worktree 隔离环境。

在开发阶段，隔离的 worktree 环境提供独立的 Git 状态，且上下文切换开销为零。

在使用 /moai:3-sync 的同步阶段，worktree sync 命令可确保干净集成，并提供冲突解决支持。

在清理阶段，worktree clean 命令可自动清理并维护注册表。

并行开发的优势：

1. 上下文隔离：每个 SPEC 都有自己的 Git 状态、文件和环境
2. 零切换成本：可在 worktree 之间即时切换
3. 独立开发：可同时处理多个 SPEC
4. 安全实验：为实验性功能提供隔离环境
5. 干净集成：自动同步并解决冲突

工作流示例：

首先，为 SPEC-001 创建一个 worktree，并提供类似 "User Authentication" 的描述，然后切换到该目录。接着，运行 /moai:2-run SPEC-001，在隔离环境中进行开发。然后，返回主仓库，为 SPEC-002 创建另一个 worktree，并提供 "Payment Integration" 描述。切换到该 worktree，然后运行 /moai:2-run SPEC-002 进行并行开发。需要时，可在 worktree 之间切换并继续开发。最后，在准备集成时同步这两个 worktree。

详细参考：请参阅 modules/parallel-development.md 中的并行开发模块

---

### 4. 集成模式——MoAI-ADK 工作流集成

目的：与 MoAI-ADK 的 Plan-Run-Sync 工作流无缝集成。

集成点：

在使用 /moai:1-plan 的规划阶段集成中，创建 SPEC 后，使用新命令和 SPEC ID 创建 worktree。输出会提供切换到 worktree 的指导，可以使用 switch 命令，也可以使用带 go 命令的 shell eval 模式。

在使用 /moai:2-run 的开发阶段，worktree 隔离提供了一个干净的开发环境，具有独立的 Git 状态，可防止冲突并支持自动注册表跟踪。

在使用 /moai:3-sync 的同步阶段，创建 PR 之前，为该 SPEC 运行 sync 命令。PR 合并后，使用 merged-only 标志运行 clean 命令，以移除已完成的 worktree。

自动检测模式：

系统通过检查父目录中是否存在注册表文件来检测 worktree 环境。检测到后，会从当前目录名称中提取 SPEC ID。带 sync-check 选项的 status 命令会自动识别需要同步的 worktree。

配置集成：

MoAI 配置支持 worktree 设置，包括用于自动创建 worktree 的 auto_create、用于自动同步的 auto_sync、用于自动清理已合并分支的 cleanup_merged，以及用于通过项目名称替换来指定 worktree 目录位置的 worktree_root。

详细参考：请参阅位于 modules/integration-patterns.md 的集成模式模块

---

### 5. `--spawn` — 在新的 tmux 窗口中启动队友会话

目的：在 worktree 中启动 Claude 或 GLM 会话，**同时不放弃当前所在的会话**。

启动命令（`moai cc`、`moai glm`、`moai cg`）通常会替换正在运行的 shell，这适合“立即在此工作”，但无法表达“继续当前工作，同时在旁边启动一个队友”。`--spawn` 会改为在新的 tmux 窗口中重新执行相同的命令，然后返回，以便调用者继续工作。

与 `-w <name>` 结合使用时，一条命令即可在隔离的 worktree 中启动队友：

```bash
moai cg -w feat-auth --spawn    # GLM teammate in .claude/worktrees/feat-auth
moai cc -w feat-auth --spawn    # Claude teammate, same worktree
moai glm -w feat-auth --spawn   # all-GLM teammate
```

行为：

- 新窗口以分离状态创建（`tmux new-window -d`），因此焦点会保留在调用者的窗格中。输出的窗格 ID（例如 `%7`）是切换到该窗格时使用的句柄。
- 生成的窗口从项目根目录启动，因此简短的 `-w <name>` 值会基于 `.claude/worktrees/<name>/` 进行解析。
- `--spawn` 由 MoAI 消费，绝不会传递给 Claude Code。位于 `--` 透传标记之后的 token 会保持不变。
- 参数会经过 shell 引用，因此包含空格或 shell 元字符的 worktree 名称能够完整传递到生成的进程。

要求——如果缺少以下任一项，都会返回明确错误，而不是静默回退，因为回退会替换调用者的会话，而这正是 `--spawn` 所要避免的结果：

| 缺少项 | 消息 |
|---------|---------|
| `$TMUX`（不在会话中） | `tmux session required for --spawn` |
| `tmux` 二进制文件 | `--spawn requires the tmux binary` |
| `PATH` 中的 `moai` 二进制文件 | `--spawn needs the moai binary in PATH` |

在这些检查运行之前，不会更改任何设置，因此拒绝操作不会对环境产生任何影响。生成的命令会在新窗口中自行执行模式设置（`applyCCMode` / `applyCGMode`）。

与已弃用的 `--team` 标志的关系：此前，`moai worktree new --team` 会通过一步操作创建工作树并启动会话，涵盖四种模式。其中三种现在仅使用 `-w` 即可实现（原地启动及其交接指引回退方案），第四种——在新的 tmux 窗口中生成——则由 `--spawn` 实现。其只写不读的 swarm 注册表也随之弃用；从未有任何内容读取 `.moai/state/swarm/`。

---

## 高级实现（10 分钟以上）

### 多开发者工作树协调

共享工作树注册表：

将注册表类型设置为团队模式，并指定所有团队成员均可访问的共享注册表路径，以配置团队工作树设置。对于共享环境中特定于开发者的工作树，创建工作树时使用 developer 标志，为条目添加开发者名称前缀。带有 all-developers 标志的 list 命令会显示所有团队成员的工作树，而带有 team-overview 的 status 命令则提供整合后的团队视图。

### 高级同步策略

选择性同步模式：

sync 命令支持使用 include 和 exclude 模式进行选择性同步，从而仅同步特定目录或文件。对于冲突解决，可以选择 auto-resolve 来处理简单冲突、选择交互式解决来手动处理冲突，或选择 abort 来取消同步操作。

### 工作树模板和预设

自定义工作树模板：

使用 template 标志创建具有特定设置的工作树。frontend 模板可能包括 npm install、eslint 设置以及 pre-commit hooks。backend 模板可能包括创建和激活虚拟环境以及安装依赖项。通过 config 命令设置模板专用的设置命令，以配置自定义模板。

### 性能优化

优化工作树操作：

为了更快地创建工作树，请使用带有 depth 值的 shallow 标志进行浅克隆。background 标志可启用后台同步。带有 all 选项的 parallel 标志可对所有工作树执行并行操作。通过配置中的 cache enable 和 cache TTL 设置启用缓存，从而加快重复操作。

---

## 配合使用效果良好

命令：
- moai:1-plan - 创建 SPEC 并自动设置工作树
- moai:2-run - 在隔离的工作树环境中进行开发
- moai:3-sync - 集成自动工作树同步
- moai:9-feedback - 改进工作树工作流

技能：
- moai-foundation-core - 并行开发模式
- moai-workflow-project - 项目管理集成
- moai-workflow-spec - SPEC 驱动开发
- moai-git-strategy - Git 工作流优化

工具：
- Git worktree - Git 原生工作树功能
- Rich CLI - 格式化终端输出
- Click framework - 命令行界面框架

---

## 快速决策指南

对于新的 SPEC 开发，请使用带自动设置的 worktree 隔离模式。主要方法是 worktree 隔离，辅助模式是与 /moai:1-plan 集成。

对于跨多个 SPEC 的并行开发，请使用多个 worktree 并结合 shell 集成。主要方法是维护多个 worktree，辅助模式是在它们之间快速切换。

对于共享环境中的团队协作，请使用带开发者前缀的共享注册表。主要方法是共享注册表模式，辅助模式是冲突解决。

对于代码审查工作流，请使用隔离的审查 worktree。主要方法是使用 worktree 隔离进行审查，辅助模式是在审查完成后进行干净同步。

对于实验性功能，请使用带自动清理的临时 worktree。主要方法是创建临时 worktree，辅助模式是进行可自动移除的安全实验。

模块深入解析：
- Worktree 命令：完整的 CLI 参考请参阅 modules/worktree-commands.md
- Worktree 管理：核心架构请参阅 modules/worktree-management.md
- 并行开发：工作流模式请参阅 modules/parallel-development.md
- 集成模式：MoAI-ADK 集成请参阅 modules/integration-patterns.md
- 故障排除：问题解决方法请参阅 modules/troubleshooting.md

完整示例：请参阅 examples.md
外部资源：请参阅 reference.md

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “对于这么小的改动，使用 worktree 隔离有些小题大做” | 在并行工作进行期间，对 main 进行的小改动会导致合并冲突。Worktree 可以避免这种情况。 |
| “我直接在 main 分支上工作会更快” | 在 main 上工作会阻止其他代理写入。Worktree 可实现并行工作。 |
| “为安全起见，只读代理也需要 worktree 隔离” | 只读代理（mode: plan）无法写入。添加隔离只会浪费资源，没有任何益处。 |
| “我可以跳过 worktree 清理，git 会处理它” | 陈旧的 worktree 分支会不断积累，并使 git worktree list 的结果变得混乱。使用后务必执行清理。 |
| “代理提示词中使用绝对路径没有问题，因为 worktree 具有相同的结构” | 指向主仓库的绝对路径会完全绕过 worktree 隔离。请使用相对路径。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 实现代理在团队模式下生成时未使用 isolation: worktree
- 只读代理生成时使用了 isolation: worktree（不必要的开销）
- 代理提示词中包含指向主项目目录内写入目标的绝对路径
- 团队会话完成后未清理 worktree（残留陈旧分支）
- worktree 隔离代理的提示词内，Bash 命令中包含 cd /absolute/project/path

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 执行实现工作的团队成员使用 isolation: worktree（检查代理生成参数）
- [ ] 只读团队成员不使用 isolation: worktree（确认 mode: plan 已足够）
- [ ] 代理提示词仅通过相对路径引用写入目标文件
- [ ] 会话结束后，`git worktree list` 未显示陈旧的 worktree
- [ ] 已在 Claude Code >= 2.1.97 上验证 worktree CWD 隔离（检查版本）
- [ ] Hook 脚本（handle-worktree-create.sh、handle-worktree-remove.sh）存在且可执行

<!-- moai:evolvable-end -->