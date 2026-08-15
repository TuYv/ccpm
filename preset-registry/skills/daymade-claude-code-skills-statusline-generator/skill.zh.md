---
name: statusline-generator
description: >
  Installs, configures, customizes, or troubleshoots the Claude Code statusline
  (cwd, model, token counts). Use when the user wants to set up or change the
  statusline, switch minimal vs full layouts, show absolute token counts
  (e.g. ctx 108K / 1M) instead of a percentage, add cost via ccusage or git
  status, dump the stdin JSON Claude Code passes the script, or fix a statusline
  that is blank, silent, stuck, shows "permission denied", or stopped updating
  after a script edit (often a missing chmod +x). Trigger phrases: "configure
  statusline", "statusline blank", "status line not showing", "statusline
  broken", "show token count in statusline", 状态栏, 状态栏不显示, 状态栏空白,
  显示工作目录, 显示 token 数.
---
# 状态栏生成器

Claude Code 状态栏的单一事实来源。一个脚本，两种布局，
端到端自验证。

## 快速健康检查（出现问题时从这里开始）

每当状态栏出现异常时，请先运行此命令。它可以捕获大多数“已配置但不工作”报告背后的静默故障：

```bash
bash scripts/health_check.sh
```

它会验证四个层面：
1. `~/.claude/statusline.sh` 存在且可执行。**遗漏 `chmod +x` 是最常见的
   单一静默故障原因**——Claude Code 运行该脚本时，
   `exec` 执行失败，状态栏变为空白。
2. `~/.claude/settings.json` 包含指向该脚本的有效 `statusLine` 配置块。
3. 模拟 stdin 测试，涵盖完整数据、零 token、缺失字段、
   `$HOME` 路径缩短，以及零 fork 的 git 分支渲染（通过合成的
   `.git/HEAD` 实现——不需要 git 二进制文件）。
4. 如果你之前使用 `CLAUDE_STATUSLINE_DEBUG=1` 运行过，则会从
   `/tmp/.claude-statusline-last-stdin.json` 重放真实 stdin。

每次失败都会输出一行修复命令——无需阅读文档即可恢复。

## 快速安装

```bash
bash scripts/install_statusline.sh
```

此脚本会：
- 备份任何现有的 `~/.claude/statusline.sh` 和 `settings.json`。
- 将 `generate_statusline.sh` 复制到 `~/.claude/statusline.sh`，并对其执行 `chmod +x`。
- 通过 `jq` 更新 `settings.json` 的 `statusLine` 配置块（保留其他设置）。
- **强制运行 `health_check.sh` 并显示结果**——只有验证通过后，安装
  才算“完成”。

重启 Claude Code（或发送任意新消息）即可看到状态栏更新。

## 你将获得什么

### 默认——极简单行布局

```
~/code/myproject  [main]  Opus 4.7 (1M context)  ctx: 108K / 1M
```

仅显示基本信息：缩短的路径、git 分支、模型名称、绝对 token 数量。
无颜色、无费用、无百分比。分支通过**零 fork**方式读取——脚本
将 `.git/HEAD` 作为普通文件读取（支持 worktree/子模块的 `gitdir:` 间接引用
以及 detached-HEAD 短 sha 处理），而不是生成 `git` 进程，因此没有额外开销，
即使在没有 git 二进制文件的主机上也能工作。

### 完整——包含费用和 git 信息的多行布局

在 shell 配置文件中设置 `CLAUDE_STATUSLINE_LAYOUT=full` 即可启用：

```
alex (Sonnet 4.6) [$0.42/$25.93]  ctx: 108K/1M (11%)
~/code/myproject
[git:main*+]
```

- 第 1 行：用户、模型、ccusage 会话/每日费用、使用颜色编码的 ctx（绿色 ≤50%，
  黄色 51–80%，红色 >80%）。
- 第 2 行：缩短的路径。
- 第 3 行：git 分支，其中 `*` 表示已修改，`+` 表示有未跟踪文件。

## 布局：如何切换

该脚本从环境变量而非参数中读取布局（Claude Code 通过 stdin 传递 JSON，
因此参数会产生冲突）。在 `~/.zshrc` 或 `~/.bashrc` 中设置：

```bash
# Minimal (default — same as not setting it)
export CLAUDE_STATUSLINE_LAYOUT=minimal

# Full
export CLAUDE_STATUSLINE_LAYOUT=full
```

重启 shell（或 `source` rc 文件），以便 Claude Code 继承该更改，
然后发送一条消息——状态栏将在 300ms 内刷新。

## 调试 stdin 捕获

要准确查看 Claude Code 向脚本发送的 JSON：

```bash
export CLAUDE_STATUSLINE_DEBUG=1
```

每次调用都会将其 stdin 写入 `/tmp/.claude-statusline-last-stdin.json`
（每次刷新时覆盖）。使用 `jq .` 检查。适用于：

- 诊断字段未按预期方式呈现的原因。
- 使用真实输入重新运行脚本：`cat /tmp/.claude-statusline-last-stdin.json | ~/.claude/statusline.sh`。
- 提交错误报告——粘贴该转储内容作为事实依据。

## 编写规则（为何此 Skill 采用这样的设计）

三种生产环境故障模式促成了当前设计。它们都通过代码加以防范，
而不仅仅记录在文档中：

### 规则 1——始终执行 `chmod +x`，始终通过运行来验证

任何状态栏出现无提示故障的最大单一原因，是脚本没有
可执行权限位：Claude Code 的 `exec` 会静默失败，状态栏随即变为空白，
且不显示任何错误。`install_statusline.sh` 始终执行 `chmod +x`；如果缺少
该权限位，`health_check.sh` 会将其标记出来。**如果你手动编写或编辑状态栏脚本，
请在宣布完成之前使用模拟输入进行测试：** `echo '{}' | bash your-script.sh`。

### 规则 2——没有证据，“配置完成”毫无意义

“已写入文件并更新 settings.json”并不等同于“脚本能够运行
并产生预期输出”。因此，`install_statusline.sh` 始终会在最后
运行 `health_check.sh`，若任何检查失败，则以非零状态退出。
任何代理声称“已完成！”却未提供证据的报告，都应持怀疑态度。

### 规则 3——状态栏位于热路径上：不仅要保证正确性，还要控制子进程开销

状态栏脚本看起来只是 UI 修饰，但它会在**每个并发代理会话的
每次刷新时**执行。它所生成的任何进程，其开销都会按刷新率 × 活跃会话数
成倍增加，并贯穿全天。在一台运行大量并发会话的机器上测得：
一个使用包运行器的状态栏（`bunx <pkg>@latest` 风格，每次刷新都会重新解析
注册表并重写锁文件，然后运行 `git status` + `git branch`）
每次刷新消耗约 0.4 秒 CPU 时间；而此脚本约为 0.01 秒。在大量会话中，
这一差异会在整机进程频繁创建、发热和电池消耗中占据可衡量的比重——
在一次真实的电池耗电调查（2026-07）中，状态栏被发现是耗电的主要因素之一。

具体而言：
- **绝不要在刷新时解析包。** 不要在 `statusLine.command` 中使用带
  `@latest` 的 `bunx`/`npx`——应固定版本并一次性安装，或使用本地脚本。
- **不要为获取分支而生成 `git` 进程。** 将 `.git/HEAD` 作为文件读取（参见
  脚本中的 `git_branch_fast`）——结果相同，且无需生成子进程。
- **将 `git status`（工作区脏状态）视为奢侈功能。** 它会在
  每次刷新时遍历工作树；仅完整布局会运行它，而且只有在显式启用时才运行。
- **开销预算：一次状态栏刷新应只消耗个位数毫秒，
  且最多只进行少量进程派生**（此处为一个 `jq` + 一个 `awk`）。

有关字段级陷阱（会话开始时 `used_percentage` 为 null、不同 Claude Code
版本中的 `total_input_tokens` 语义、硬编码的 `context_window_size`），请参阅
[`references/context-window-schema.md`](references/context-window-schema.md)。

## 自定义

有关颜色、自定义分段（主机名、时间等）以及禁用成本跟踪的信息，
请参阅 [`references/customization.md`](references/customization.md)。

## 依赖项

该脚本会自动检测可用工具，并在工具缺失时优雅降级：

| 工具 | 用途 | 回退方案 |
|------|-------------|----------|
| `jq` | JSON 解析（首选） | 回退到 `python3` |
| `python3` | JSON 解析回退方案 | 仅显示原始 `cwd` |
| `awk` | token 的 K/M 格式化 | 两种布局均需要 |
| `git` | 脏状态 `*`/`+` 标记（仅完整布局——最简布局无需 git，直接从 `.git/HEAD` 读取分支） | 缺失或不在仓库中时静默跳过 |
| `ccusage` | 成本（完整布局） | 缺失时静默跳过 |

在 macOS 上安装：`brew install jq`。在 Debian/Ubuntu 上安装：`apt install jq`。

## 故障排除

有关按症状分类的诊断方法，请参阅
[`references/troubleshooting-decision-tree.md`](references/troubleshooting-decision-tree.md)。
其中涵盖：

1. 状态栏为空或从不更新（chmod 原因）
2. ctx 分段缺失或错误（字段陷阱）
3. 希望显示 token 数量而非百分比（布局切换）
4. 颜色显示为原始转义码（终端兼容性）
5. Git 分段缺失（完整布局）
6. 成本分段缺失（ccusage / 缓存）
7. 编辑未生效（路径不匹配）
8. 刷新缓慢（jq 与 python3）

## 资源

| 文件 | 用途 |
|------|---------|
| `scripts/generate_statusline.sh` | 状态栏脚本。唯一事实来源。通过 `CLAUDE_STATUSLINE_LAYOUT` 提供两种布局。 |
| `scripts/install_statusline.sh` | 幂等安装程序。执行备份、复制、chmod、配置 `settings.json` 并运行健康检查。 |
| `scripts/health_check.sh` | 四层验证：文件权限、`settings.json` 配置、模拟 stdin 测试、真实 stdin 重放。 |
| `references/troubleshooting-decision-tree.md` | 症状驱动的诊断流程图。状态栏行为异常时加载。 |
| `references/customization.md` | 颜色更改、自定义分段、阈值调整、单行完整布局。用户希望修改状态栏外观时加载。 |
| `references/context-window-schema.md` | Claude Code 状态栏 JSON schema。记录每个字段，以及不同版本中 `current_usage` 与 `total_input_tokens` 的语义。 |
| `references/color_codes.md` | ANSI 颜色代码参考。进行颜色自定义时加载。 |
| `references/ccusage_integration.md` | ccusage 集成详解：缓存、JSON 结构、故障排除。处理成本相关问题时加载。 |