---
name: bm-status
description: Report the Basic Memory for Codex configuration, reachability, hook expectations, recent Codex checkpoints, and active tasks.
---
# Codex 基础记忆状态

收集简洁的诊断信息。不要过度调查。

## 收集

1. CLI 可达性：
   - `basic-memory --version`
   - fallback `bm --version`
   - fallback `uvx --prerelease=allow basic-memory --version`

   如果没有解析出任何启动器，也要继续。插件钩子脚本仍可使用其由 uv 管理的环境；将钩子健康状态报告为不可用，而不是声称钩子无法工作。

2. 插件配置：
   - 先读取 `~/.codex/basic-memory.json`，然后读取最近的项目
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
   - 报告该命令返回的共享收件箱路径、待处理信封、已归档信封、上次
     flush、设置状态、解析后的主项目、捕获状态、捕获文件夹、检查点提示
     状态、Basic Memory 版本和 uv 版本
   - 收件箱计数是所有受支持 harness 的全局计数；不要将积压完全归因于 Codex
   - 将命令的设置解析结果视为钩子行为的规范依据；如果它与手动读取的配置
     不一致，请显示该不匹配

4. 钩子文件：
   - 如果从此仓库运行，请确认 `plugins/codex/hooks/hooks.json` 存在
   - 提醒用户：Codex 插件钩子必须经过审查并信任后才能运行

5. Basic Memory 查询：
   - 查询最近的 `type=codex_session`；当
     `sessionProfile=coding` 时，还要查询带有
     `repository=<configured repository>` 的 `type=coding_session`，然后合并、
     去重、按最新时间降序排列，并保留最新的五条；当缺少 repository 时，绝不
     运行不带范围的 coding-session 查询；这些是由代理编写的检查点，而生命
     周期信封仍属于本地运行轨迹
   - 活跃的 `type=task`、`status=active`
   - 未关闭的 `type=decision`、`status=open`

## 呈现

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
- Hook runtime: basic-memory <version>; uv <version or missing>
- Recent checkpoints: <count across coding_session and codex_session>
- Active tasks: <count>
- Open decisions: <count>
- Hooks: installed; trust review required in Codex
```

按类型、标题以及可用时的永久链接列出最近的检查点。当事件捕获已启用且待处理的事件包正在累积，或上次刷新时间为 `never` 时发出警告，同时指出其他 harness 可能会对共享计数作出贡献。  
捕获已禁用时，不要针对收件箱为空发出警告。