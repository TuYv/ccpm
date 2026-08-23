---
name: cli-setup-verify
description: Verify the Omnigent CLI's setup/onboarding flow, terminal UI/UX, and critical user journeys in a completely isolated, reproducible loop. Drives the real `omnigent` binary through a PTY (pexpect) inside a throwaway OMNIGENT_CONFIG_HOME / OMNIGENT_DATA_DIR sandbox that never touches the user's real ~/.omnigent, captures ANSI-stripped frames for UX inspection, and proves a change is verifiable via a before→fix→after baseline diff. Load when developing or reviewing a CLI setup/onboarding/REPL/picker change (omnigent/cli.py, omnigent/onboarding/*, omnigent/repl/*, scripts/install_oss.sh), reproducing a cold-start/first-run UX bug, or confirming a fix actually lands. Several agents can run it concurrently on separate worktrees.
---
# 在闭环中验证 Omnigent CLI 的设置与 UX

Omnigent CLI 给人的第一印象是：`curl | sh` → 运行 `omnigent` → 选择一个
模型凭据 → 启动会话。此 Skill 让智能体能够**进入该流程、
检查 UI/UX，并证明某项变更是否可验证**——无需
浏览器，无需真实凭据，并且**绝不会触碰开发者真实的
`~/.omnigent`**。

其引擎是 `verify_cli.py`（与此文件位于同一目录）。它在一次性
沙箱内通过伪终端（`pexpect`）驱动真实的
`omnigent` 二进制文件，捕获渲染内容、运行断言，并输出一行机器可读的
`SUMMARY {json}`。

> **重点在于形成可验证的闭环**，而不是一次性检查：
> 1. 在**未修复的**代码上运行场景 → 基线（`--label before`）。
> 2. 进行变更。
> 3. 运行**相同的**场景 → `--label after`。
> 4. 对比两行 `SUMMARY`。只有当某项具体的
>    检查结果或备注在两次运行之间**发生翻转**时，修复才是“可验证的”。如果没有发生翻转，
>    就无法证明修复产生了任何作用——请返回第 2 步。

## 为什么这是安全的（请先阅读）

此处真实的 `~/.omnigent` 可能有**数 GB**（聊天数据库、运行器日志、原生
harness 状态）。沙箱通过三种方式隔离每一次写入：

- **默认情况下，`HOME` 会被重定向到沙箱中。**这是最关键的
  一点。`OMNIGENT_CONFIG_HOME` / `OMNIGENT_DATA_DIR`（`omnigent/cli.py`
  中的 `_CONFIG_HOME_ENV_VAR` / `_DATA_DIR_ENV_VAR`）会重定向配置和数据——但
  CLI 的**诊断日志记录器会忽略它们**：它会在 `state_dir()` 下写入每次调用独有的
  `cli-*.log`，而该目录被硬编码为 `Path.home()/.omnigent/logs`
  （`omnigent_ui_sdk/terminal/_config.py`）。因此，只有重定向 `HOME` 才能防止
  非帮助类命令（`config list`、设置流程生成的 PTY、`server stop`）
  写入真实主目录。驱动程序会为你完成此操作。
- `--strip-path` 会缩减 `PATH`，使 `node`/`tmux`/`claude`/`codex` 显示为“未
  安装” → 从而模拟真正的新机器冷启动。
- 除非传入 `--keep-env-creds`，否则子进程环境中的模型密钥
  （`ANTHROPIC_API_KEY`，……）会被移除。

**`--inherit-home` 会选择退出** `HOME` 隔离——仅在需要通过环境中的
`~/.claude` / `~/.databrickscfg` 身份验证访问带真实凭据的 REPL 时使用。
这种方式**安全性较低**：此时，非帮助类命令会将 `cli-*.log` 写入真实的
`~/.omnigent/logs`。

每次运行都会在执行前后**对真实的 `~/.omnigent` 生成指纹**
（仅获取文件状态，不读取内容）：包括顶层配置文件**以及**
`logs/cli-*.log` 诊断文件的集合。新增配置文件、mtime 发生变化，*或者*出现新的 `cli-*.log`
基本文件名，都会触发 `real_config_untouched: false`。使用默认隔离时，
这种情况绝不会发生；在 `--inherit-home` 下则确实会发生——而这正是
该防护检查要捕获的违规行为。如果该检查结果曾为 `false`，请停止并
进行调查。请先运行 `check-isolation`，确认该闭环在你的
机器上是安全的。

## 前置条件

- 你当前位于**包含待测试代码的工作树中**（每个并行智能体
  使用各自的工作树）。驱动程序会运行 `--repo` 所指定检出目录中的 `omnigent`。
- 安装了 `pexpect` 的 Python——项目的 `.venv/bin/python` 已包含它
  （`pyproject.toml` 中的 `pexpect>=4.9`）。请使用该解释器运行驱动程序。
- 一个 `omnigent` 二进制文件：驱动程序会自动查找 `<repo>/.venv/bin/omnigent`，也可以
  传入 `--omnigent <path>`。
- 设置 / 选择器 / 帮助 / 冷启动场景**不需要凭据，也不需要
  harness**。只有 `repl-commands` 需要可正常工作的 harness 和凭据：请传入
  `--inherit-home`（使用环境中的 `~/.claude` 身份验证）和/或 `--keep-env-creds`（环境变量中的 API
  密钥），并搭配 `--agent`。如果无法到达提示符，它会报告 `skipped`，
  而绝不会给出错误的通过结果。

## 快速开始

```bash
REPO=/path/to/your/worktree
PY=$REPO/.venv/bin/python
DRV=$REPO/.claude/skills/cli-setup-verify/verify_cli.py

# 0. Prove the sandbox is safe on this machine (do this once).
#    HOME is isolated by default — no flag needed.
$PY $DRV --scenario check-isolation --repo "$REPO"

# 1. See exactly what a brand-new user sees on a fresh machine.
$PY $DRV --scenario cold-start --strip-path --keep-sandbox --repo "$REPO"
#    → reads the printed `artifacts` path, then `cat <that>/cold_start.txt`

# 2. Lint the top-level help (and any subcommand's).
$PY $DRV --scenario help-snapshot --repo "$REPO"
$PY $DRV --scenario help-snapshot --subcommand server --repo "$REPO"
```

每次运行都会输出 `SUMMARY {…}`，如果有任何检查失败，则以非零状态退出（`skipped` 场景以 0 状态退出）。通过管道传给 `… | grep '^SUMMARY' | python -m json.tool` 以便阅读。

## 场景目录

| 场景 | 驱动内容 | 关键检查／说明 | 对应发现 |
|---|---|---|---|
| `check-isolation` | 在沙箱中运行 `omnigent config list`（无 PTY） | `config_list_ran`、`sandbox_config_home_used`、`real_config_untouched` | 所有操作的安全门槛 |
| `cold-start` | 在模拟的新机器上通过 PTY 运行 `omnigent setup` | `onboarding_rendered`、`harness_menu_present`；注意 `guided_default_affordance` | 冷启动死胡同；缺少“建议从这里开始” |
| `setup-snapshot` | 运行 `omnigent setup`，可选择使用 `--nav-down N` 执行向下箭头操作 | `menu_rendered`；每一步保存一帧 | 选择器标记／页脚／对齐；80×24 窄终端 |
| `help-snapshot` | 运行 `omnigent [--subcommand] --help`（无 PTY） | `help_rendered`、`no_param_leak`、`no_update_dup`；注意 `top_level_command_count` | `:param` 泄漏、重复的 `update`/`upgrade`、命令泛滥 |
| `repl-commands` | `omnigent run <agent>` REPL，发送 `/help` + `/quit` | `help_lists_commands`；注意 `quit_advertised` | REPL 可发现性（`/help`、`/quit`） |

`--list-scenarios` 也会输出这些场景。捕获的帧会保存在输出的 `artifacts` 目录中，包括 `<name>.txt`（已移除 ANSI，用于阅读／断言）和 `<name>.ansi.txt`（原始内容，可使用 `less -R` 查看真实颜色）。

## 可验证循环——完整示例

发现：*“`server --help` 将 Sphinx 的 `:param`/`:returns` 泄漏到了用户帮助中。”*

```bash
# BEFORE the fix (on the unfixed code):
$PY $DRV --scenario help-snapshot --subcommand server --label before --repo "$REPO"
#   → "no_param_leak": {"ok": false, ...}      ← bug reproduced (the baseline)

# ... make the change (move :param docs into # comments) ...

# AFTER the fix:
$PY $DRV --scenario help-snapshot --subcommand server --label after --repo "$REPO"
#   → "no_param_leak": {"ok": true, "detail": "clean"}   ← flipped → fix is verifiable
```

同样的模式可以证明 `update`/`upgrade` 重复问题（`no_update_dup`）、冷启动死胡同问题（`guided_default_affordance` 说明从 `absent`→`present`），或 REPL 中 `/quit` 的可发现性问题（`quit_advertised` 说明从 `no`→`yes`）。**如果检查／说明没有发生翻转，就无法证明修复有效**——这正是继续工作的信号，也正是该循环旨在强制做出的判断。

如果某个发现尚无机器检查，请添加一个（参见“Adding a scenario”），使修复变得可验证，而非仅停留在断言层面。

## 有针对性地检查 UI/UX

- **默认使用窄终端。** 驱动程序使用 **80×24**——这是新用户窗口的实际尺寸，也是横幅溢出和选择器重绘超出底部等错误容易出现的地方。使用 `--cols 120 --rows 40` 重新运行以对比宽裕布局；比较这两个帧的差异。
- **阅读帧内容，不要只相信检查结果。** `cat <artifacts>/cold_start.txt` 会显示屏幕的原始内容——全是 `✗` 的菜单、页脚提示（根级别的 `Esc back`）、标记（`❯`），以及状态栏的对齐情况。帧本身*就是* UX 证据。
- **比较选择器以确保一致性。** `setup-snapshot --nav-down 3` 会捕获你移动时的测试框架菜单；目视检查标记、页脚和高亮相对于主题选择器及恢复选择器是否发生偏移（不同引擎的渲染方式不同）。

## 覆盖所有关键用户旅程

此技能负责**设置 / 新用户引导 / 首次运行 / TUI** 旅程。仓库已经具备互补的 CUJ 覆盖——请结合使用两者：

- **实时设置/UX 旅程 → 此技能的场景**（冷启动、设置、选择器、帮助、REPL 可发现性）。
- **更深入的端到端旅程 → `tests/e2e/test_journey_*.py`**（从首次会话到编写代码、恢复/断开连接、分叉/探索、文件上传、协作等）。使用项目的门控运行器运行其中一部分，例如：
  `uv run --frozen --group test python -m pytest tests/e2e/test_journey_first_session_to_code.py -q`。
- **可复用的 PTY 辅助工具**位于 `tests/e2e/omnigent/_pexpect_harness.py`
  （`spawn_omnigent_run`、`wait_for_ready`、`submit_prompt`、`await_turn_complete`、
  `clean_exit`），快照比较器位于 `tests/e2e/omnigent/_snapshot.py`
  ——应优先扩展这些工具，而不是重新实现。

若要操作此技能尚未编写脚本的界面，请使用沙箱环境以及驱动程序导出的按键（`KEY_UP`/`KEY_DOWN`/`KEY_ENTER`/
`KEY_ESC`）手动启动它，然后对结果执行 `drain()` 和 `save_frame()`。

## 清理——不可妥协

- 驱动程序会强制终止 PTY 子进程及其后代，并针对沙箱运行
  `omnigent server stop`，以清理所有已启动的后台服务器。运行后，确认没有任何泄漏：
  `pgrep -af "omnigent.*(server|runner|host._daemon)"`——任何绑定到你的
  沙箱数据目录的进程都应由你终止。
- 除非使用 `--keep-sandbox`，否则沙箱临时目录会被删除。如果保留沙箱以供检查，请在完成后使用 `rm -rf` 将其删除。
- 始终通过驱动程序操作 CLI（它会重定向 `HOME` 以及配置/数据相关设置），绝不要直接运行 `omnigent setup`——否则会写入真实的 `~/.omnigent`。如果传入 `--inherit-home`，则应预期向真实的 `~/.omnigent/logs` 写入 `cli-*.log`，并出现 `real_config_untouched: false`——这表示保护机制正在生效，并非错误。

## 诚实性

如果无法访问被测界面（缺少测试框架、缺少凭据或受无头环境限制），场景必须报告 `skipped`——**不要声称 CUJ 已通过**。修复的最有力证据是复现出的基线（`before`）以及结果发生反转的修复后状态（`after`）；请同时报告两条 `SUMMARY` 行，而不是对摘要再次进行总结。

## 添加场景

在 `verify_cli.py` 中编写 `scenario_<name>(args, sandbox, result)`：驱动 CLI
（复用 `pexpect.spawn(... env=sandbox.env, dimensions=(args.rows, args.cols))`、
`drain()`、`save_frame()` 和 `KEY_*` 常量），通过
`result.add(name, ok, detail)`（使运行失败）或 `result.notes.append(...)`
（仅供参考，用于记录修复前后的状态翻转）记录发现，将其注册到 `SCENARIOS`，并在
上方目录中添加一行。每个真实、可观察的行为仅保留一个断言，以便通过单项检查的状态翻转
证明修复有效。

## 被测代码

- 首次运行分派／无参数路由：`omnigent/cli.py`（`run`、首次运行
  计划、`_run_configure_harnesses_interactive`）。
- 新用户引导：`omnigent/onboarding/*`（`setup.py`、`interactive.py`、
  `configure_models.py`、`provider_selection.py`、`detected.py`）。
- TUI／REPL 与选择器：`omnigent/repl/*`（`_repl.py`、`_theme_picker.py`、
  `_resume_picker.py`）、`omnigent/_terminal_picker_theme.py`。
- 安装程序：`scripts/install_oss.sh`。