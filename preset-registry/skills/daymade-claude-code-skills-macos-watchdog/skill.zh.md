---
name: macos-watchdog
description: >-
  Design, deploy, and discipline macOS launchd watchdogs — LaunchAgents/LaunchDaemons that detect a recurring problem and auto-remediate it. Use whenever creating or editing a persistent background monitor / daemon / agent on macOS, writing a launchd plist, scheduling a self-healing script, or when a watchdog has become a disturbance itself: re-launching apps the user quit, firing repeated notifications, re-running its full repair ladder every few minutes on an unfixable network, or hammering the system (crash loops, fork storms, runaway restarts). Also use for stop/disable semantics (bootout vs bootstrap vs disable vs unload), adding cooldown / backoff / notification throttling to a self-healer, binding a monitor's lifecycle to its premise state, or auditing existing LaunchAgents. 中文触发：launchd 守护进程、常驻任务、开机自启、后台监控、定时自愈脚本。 Covers KeepAlive/ThrottleInterval/domains/logging, premise self-checks, auto-cooldown, alert layering, batch throttling.
---
# macOS Watchdog

watchdog 是一种 launchd 任务，会定期检测反复出现的问题，并在无人介入的情况下对其进行修复。真正的难点并不是“如何安装一个 plist”，而是**如何避免 watchdog 变成新的干扰源**：这台机器上的每个 watchdog 都源于一次事故，而之后反复出现的故障模式却变成了 watchdog 自身（虚假的“全部正常”报告、通知洪水、重新启动用户已经退出的应用、fork-bomb 重放）。

这是我们付出高昂代价后总结出的核心原则：**watchdog 的生命周期绑定于其前提状态**。当它存在的理由已经无法通过自身修复（WiFi 损坏、用户退出目标应用、前置状态消失）时，watchdog 必须*自行*停下——不能等待人工禁用它。

## Entry decision tree

| 当前情况是…… | 转到 |
|---|---|
| 从头安装一个新的 watchdog | § Deploy，然后 § The quiet-watchdog contract |
| 现有 watchdog 行为异常（刷屏、重新启动应用、反复轰击） | § The quiet-watchdog contract，诊断它违反了哪一条 |
| 停止 / 禁用 / 重启一个任务 | § Stop semantics |
| plist 键详情（KeepAlive 形式、域、日志记录、资源限制） | `references/launchd-plist-reference.md` |
| 冷却/退避/通知限流模式 + 脱敏后的故障案例 | `references/quiet-watchdog-patterns.md` |
| SRE 告警分层（页面通知与工单、疲劳度数据） | `references/alert-discipline.md` |

## The quiet-watchdog contract (the four clauses)

在发布或批准任何 watchdog 之前，以下四条必须全部满足。每一条都源于某个真实 watchdog 对它的违反。

### 1. Premise-state self-check — it knows when it has no job

脚本每次运行时的第一项操作：验证证明其存在合理性的状态是否仍然成立。如果不成立，则静默退出——不执行修复，不发送通知，不产生副作用。

- 代理修复 watchdog 会先检查代理应用是否正在运行；用户退出了它 → 跳过本轮。
- “配置是否切换回来”监视器会检查它所监视的配置状态；如果已经切换 → 自行停止，而不是再进行一轮误导性通知。（真实案例：某个恢复监视器在其前提已经解决后仍持续触发了 2 小时，发送了 3 条无端通知，因为没有任何机制告诉它停止。）

### 2. Remediate first, page only on sustained failure

每一轮都保持诚实地进行检测，但*具有干扰性的操作*要等到故障连续持续 N 个周期后才执行（耐心模式）。理由是：振荡链路通常会在几分钟内自行恢复；对于一个会自我限制的短暂故障，强制重新连接造成的总体影响反而有害。在选择 N 之前，先测量系统实际的自我恢复窗口（某条链路的一次 94 分钟观测显示，自我恢复时间 ≤3 分钟 → 在 5 分钟间隔下设置 N=2 个周期）。

升级阶梯（从低成本 → 高干扰）：刷新状态 → 重启连接 → 远程修复。每一级在继续升级前都要进行验证。

### 3. Escalating auto-cooldown — an unfixable environment means silence

当完整的修复阶梯失败时，说明该环境无法由 watchdog 修复（WiFi 损坏、强制门户、上游服务失效）。天真的行为——每个周期都永远重新运行完整阶梯并发送通知——正是“watchdog 每 10 分钟不断重新启动应用”。

`ThrottleInterval` **无法**解决此问题：它限制的是进程重新生成，属于固定延迟且没有退避机制；对于一个在刷屏后以 0 退出的任务，它也无能为力。冷却机制必须位于应用层：

- 在状态文件中记录连续耗尽轮次。
- 每次耗尽一轮后，进入逐级延长的暂停时段（例如 30 分钟 → 2 小时 → 6 小时，最后一级重复）。
- *进入*冷却状态时通知一次；冷却期间不再通知。某一级冷却到期后，重试一轮；任何真正的恢复都会清除计数器和冷却状态。
- 手动使用带 TTL 状态文件的 `pause [duration]` 命令作为后备方案——但自动路径必须在完全没有人工命令的情况下正常工作。要求用户记得执行某个命令的禁用机制，不算真正的机制。

可复用实现：`scripts/watchdog-cooldown.sh`（source 该文件；它提供 `paused_any`、`record_exhausted`、`clear_exhausted`、`cmd_pause`/`cmd_resume`）。

### 4. 永远不要重新启动用户明确退出的应用

在 macOS 上，当应用未运行时，`open <url-scheme>` **会启动应用**；而不带 `-g` 的 `open` 会抢占前台。使用 URL scheme（或 `open -a`，或重启 GUI 应用）执行修复的 watchdog，在用户看来就会变成“我退出了它，但它又自己回来了”。

每个此类操作都必须加守门检查：在调用其 scheme 之前，先确认目标进程仍在运行，并传入 `-g`，确保合法操作不会弹出窗口。如果用户在修复过程中退出应用，则中止整个处理阶梯——清理 trap 也必须遵守同样的守门条件，否则“退出时确保已连接”的后备逻辑就会成为重新启动应用的元凶。

## 部署（容易出问题的细节）

1. **位置**：用户 agent → `~/Library/LaunchAgents/`（GUI 会话上下文：可以打开应用、显示通知）；系统 daemon → `/Library/LaunchDaemons/`（root 用户，无 GUI 访问权限）。应根据任务是否需要用户的 GUI 会话来选择，而不是凭习惯决定。
2. **plist**：从 `assets/launchagent.template.plist` 开始（其中已注释说明：Label、ProgramArguments、StartInterval、StandardOutPath/StandardErrorPath、ThrottleInterval、Nice）。使用 `plutil -lint` 验证。`ProgramArguments` 的第 0 个元素必须是绝对路径；绝不要依赖 PATH 继承。
3. **加载/重新加载**：执行 `launchctl bootstrap gui/$(id -u) <plist>`；编辑 plist 后，先 `bootout` 再次 `bootstrap`——launchd 的活动状态必须与磁盘上的内容一致。使用 `launchctl kickstart -k gui/$(id -u)/<label>` 强制运行一次。
4. **日志**：`StandardOutPath`/`StandardErrorPath` 是必需项（没有它们，失败就会悄无声息地消失），此外还要在脚本内部进行日志轮转（上限约为 1 MB）。
5. **幂等性保护**：重复运行部署操作不得导致重复安装。`scripts/new-launchagent.sh <label> <script> <interval>` 是幂等包装器（如果已加载则先执行 bootout → 写入 plist → bootstrap → 验证 `launchctl list`）。
6. **TCC / 完全磁盘访问权限**：读取其他应用的 Group Container 或受保护目录的 LaunchAgent，需要为*实际使用的解释器*授予 FDA——Xcode 的 python3 存根可能失败，而你实际使用的 python3 却能正常工作。必须使用 `ProgramArguments` 中的确切二进制路径进行验证，而不是使用 shell 解析出的路径。
7. **默认进行批量限流**：任何会生成工作任务的 watchdog 循环（重放、模糊测试、批量扫描、并行 API 调用）都需要将明确的速率上限设为默认参数，而不是事后再优化。对于机器而言，未限流的循环与失控进程没有区别（真实案例：一次未限流的测试重放每秒派生 1,041 个进程，持续 7 分钟，并将芯片温度推高到 83 °C）。

## 停止语义（已弃用的陷阱）

| 意图 | 命令 |
|---|---|
| 立即停止，之后允许重新引导 | `launchctl bootout gui/$(id -u)/<label>`（守护进程：`sudo launchctl bootout system/<label>`） |
| 立即停止，并在登录后保持停止状态 | `launchctl disable user/$(id -u)/<label>`（反向操作：`enable`） |
| 编辑后重新加载 | `bootout` → 编辑 plist → `bootstrap` |

**绝不要使用 `launchctl unload`**：它已被弃用；在 Ventura+ 中，只要 plist 仍然存在，任务就会通过 `RunAtLoad` 重新加载——“已禁用”的看门狗会再次触发（观察到的情况：一个被 `unload` 的监视器在 2 小时内重新触发了 3 次）。`bootstrap`/`bootout` 是现代的一对命令。

## 故障排查速查表

| 症状 | 首先检查 |
|---|---|
| “它重新启动了我退出的应用” | URL scheme/`open` 调用缺少进程存活门控（条款 4） |
| “它每隔几分钟就重复执行同一个修复操作” | 没有耗尽轮次冷却机制（条款 3）；同时检查阶梯式流程的失败路径是否重置了其失败计数器 |
| “实际发生故障时它仍报告健康” | 健康检查只验证了它探测的路径——一次绿色探测 ≠ 所有平面都健康（添加对第二个平面的探测） |
| “`bootout` 没有生效 / 它又回来了” | 使用了 `unload` 而不是 `bootout`，或者 `RunAtLoad` + plist 仍然存在 |
| 静默且没有运行记录 | 缺少 `StandardErrorPath` → 故障不可见；然后运行 `log show --predicate 'process == "launchd"' --last 15m` |
| 交互式运行正常，但在 launchd 下失败 | TCC/FDA 配置在错误的解释器上；`ProgramArguments` 中存在 PATH 假设 |

每个条款的详细信息以及背后的脱敏实战案例：`references/quiet-watchdog-patterns.md`。