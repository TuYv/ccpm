---
name: bm-status
description: Report the Basic Memory for Codex configuration, reachability, hook expectations, recent Codex checkpoints, and active tasks.
---
# Codex 状态的基本记忆

收集简洁的诊断信息。不要过度调查。

## 收集

1. CLI 可达性：
   - `basic-memory --version`
   - fallback `bm --version`
   - fallback `uvx --prerelease=allow basic-memory --version`

   如果没有解析出任何启动器，继续执行。插件钩子脚本仍可使用其由 uv 管理的环境；将钩子健康状态报告为不可用，不要声称钩子无法工作。

2. 插件配置：
   - 读取 `~/.codex/basic-memory.json`，然后读取最近的项目
     `.codex/basic-memory.json`；项目键覆盖用户键
   - 报告解析后的 `primaryProject`、`secondaryProjects`、`teamProjects`、
     `captureFolder`、`rememberFolder`、`recallTimeframe`、`focus`、
     `sessionProfile`、`repository`、`checkpointOnCompact` 和 `captureEvents`
   - 将省略的 Codex 默认值解析为
     `rememberFolder=codex/remember`，
     以及 `checkpointOnCompact=true`

3. 核心钩子健康状态：
   - 使用第一个可用的启动器，运行
     `basic-memory hook status --harness codex --project-dir <repo-root>`
   - 报告该命令输出的共享收件箱路径、待处理信封、已归档信封、上次刷新、
     设置状态、解析后的主项目、捕获状态、捕获文件夹、检查点提示状态、
     Basic Memory 版本和 uv 版本
   - 收件箱计数涵盖所有受支持的 harness；不要将积压仅归因于 Codex
   - 将命令的设置解析结果视为钩子行为的规范依据；如果它与手动读取的配置不一致，
     显示该不匹配

4. 钩子文件和启动器可见性：
   - 独立于 CLI 可达性，在当前环境中检查 `uv --version`；
     uv 是钩子运行所必需的前置条件
   - 区分“此 shell 中缺少 uv”和“Desktop 钩子运行时已验证”；shell 成功不能证明
     Desktop 钩子进程的 PATH 正确
   - 当 Desktop/WSL 钩子失败而 TUI 正常工作时，检查实际的钩子启动错误和 PATH；
     `uv: command not found` 会在 Python 脚本能够输出诊断信息之前发生
   - 查阅 `../../README.md` 中的“Troubleshooting Desktop hooks on WSL”
     以了解默认位置探测和条件性符号链接解决方法
   - 只有在观察到启动上下文和压缩后的检查点笔记时，才报告 Desktop 钩子执行已验证；
     否则标记为未验证
   - 如果从此仓库运行，确认 `plugins/codex/hooks/hooks.json` 存在
   - 提醒用户 Codex 插件钩子必须经过审查和信任后才能运行

5. Basic Memory 查询：
   - 查询最近的 `type=codex_session`；当
     `sessionProfile=coding` 时，同时查询带有
     `repository=<configured repository>` 的 `type=coding_session`，然后合并、去重、
     按最新优先排序，并保留最新的五条；当 repository 缺失时，绝不要运行未限定范围的
     coding-session 查询；这些是由代理编写的检查点，而生命周期信封仍是本地操作跟踪
   - 活跃的 `type=task`、`status=active`
   - 未关闭的 `type=decision`、`status=open`

## 当前状态

使用以下格式：

```text
Basic Memory for Codex
- CLI: <version or missing>
- Project: <primaryProject or default>
- Reads from: <secondaryProjects or none>
- Share targets: <teamProjects or none>
- Capture folder: <captureFolder>
- Remember folder: <rememberFolder>
- Recall timeframe: <recallTimeframe>
- Session profile: <general | coding>
- Repository: <owner/name or none>
- Checkpoint on compact: <enabled | disabled>
- Event capture: <enabled | disabled>
- Shared hook inbox: <path or unavailable>
- Shared pending envelopes: <count or unavailable>
- Shared archived envelopes: <count or unavailable>
- Last flush: <timestamp, never, or unavailable>
- Hook runtime in this environment: basic-memory <version>; uv <version or missing>
- Desktop hook execution: <verified from context and checkpoint | unverified>
- Recent checkpoints: <count across coding_session and codex_session>
- Active tasks: <count>
- Open decisions: <count>
- Hooks: installed; trust review required in Codex
```

按类型、标题以及可用时的永久链接列出最近的检查点。当事件捕获已启用且待处理信封正在累积，或上次刷新时间为 `never` 时发出警告，同时说明其他 harness 可能会对共享计数有所贡献。事件捕获已禁用时，不要针对收件箱为空发出警告。