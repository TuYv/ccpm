---
name: bm-status
description: Report the Basic Memory for Codex configuration, reachability, hook expectations, recent Codex checkpoints, and active tasks.
---
# Codex 状态的 Basic Memory

收集简洁的诊断信息。不要过度调查。

## 收集

1. CLI 可访问性：
   - `basic-memory --version`
   - 后备方案 `bm --version`
   - 后备方案 `uvx basic-memory --version`

   如果没有可用的启动器，仍应继续。插件钩子脚本仍可使用
   由 uv 管理的环境；应将钩子健康状态报告为不可用，而不是
   声称钩子无法工作。

2. 插件配置：
   - 读取 `~/.codex/basic-memory.json`，然后读取最近项目中的
     `.codex/basic-memory.json`；项目键会覆盖用户键
   - 报告解析后的 `primaryProject`、`secondaryProjects`、`teamProjects`、
     `captureFolder`、`rememberFolder`、`recallTimeframe`、`focus`、
     `sessionProfile`、`repository`、`checkpointOnCompact` 和 `captureEvents`
   - 将省略的 Codex 默认值解析为 `rememberFolder=codex/remember`
     和 `checkpointOnCompact=true`

3. 核心钩子健康状态：
   - 使用第一个可用的启动器运行
     `basic-memory hook status --harness codex --project-dir <repo-root>`
   - 报告该命令返回的共享收件箱路径、待处理信封数、已归档信封数、上次
     刷新时间、设置状态、解析后的主项目、捕获状态、捕获
     文件夹、检查点提示状态、Basic Memory 版本和 uv 版本
   - 收件箱计数是所有受支持工具的全局计数；不要将积压
     完全归因于 Codex
   - 将该命令的设置解析结果视为钩子行为的权威依据；如果
     它与手动读取的配置不一致，请显示差异

4. 钩子文件：
   - 如果从此仓库运行，请确认 `plugins/codex/hooks/hooks.json` 存在
   - 提醒用户，Codex 插件钩子必须经过审查并被信任后
     才会运行

5. Basic Memory 查询：
   - 查询最近的 `type=codex_session`；当
     `sessionProfile=coding` 时，还应使用
     `repository=<configured repository>` 查询 `type=coding_session`，然后合并、去重、按
     最新优先排序，并保留最新的五条；当缺少仓库时，绝不要运行无范围限定的编码会话查询；
     这些是由智能体创建的检查点，而生命周期信封仍是本地操作轨迹
   - 活跃的 `type=task`、`status=active`
   - 未关闭的 `type=decision`、`status=open`

## 展示

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

按类型、标题和永久链接（如有）列出最近的检查点。当事件捕获已启用且待处理信封正在累积，或上次刷新为 `never` 时发出警告，同时注明其他测试工具也可能计入共享计数。捕获已禁用时，不要针对收件箱为空发出警告。