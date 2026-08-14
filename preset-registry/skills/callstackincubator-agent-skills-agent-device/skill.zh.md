---
name: agent-device
description: Automates interactions for Apple-platform apps (iOS, tvOS, macOS) and Android devices. Use when navigating apps, taking snapshots/screenshots, tapping, typing, scrolling, or extracting UI info across mobile, TV, and desktop targets.
---
# agent-device

将此技能用作路由器，并遵循强制默认规则。请先阅读此文件。对于常规设备任务，执行操作前始终加载 `references/bootstrap-install.md` 和 `references/exploration.md`。使用 bootstrap 确认或建立确定性的设置。打开应用会话后，使用 exploration 进行 UI 检查、交互和验证。

## 默认操作规则

- 从保守操作开始。修改 UI 前，优先进行只读检查。
- 当任务是验证屏幕上当前可见的文本或结构时，使用普通 `snapshot`。
- 仅当需要用于所请求操作或定向查询的交互式引用（例如 `@e3`）时，才使用 `snapshot -i`。
- 避免推测性修改。可以执行最小且可逆的 UI 操作，以解除检查阻碍或完成所请求的任务，例如关闭弹出窗口、关闭警报或清除意外出现的界面。
- 除非用户明确要求，否则不要浏览网页或使用外部来源。
- 在发生有意义的 UI 变更后重新生成快照，不要重复使用过期的引用。
- 优先使用 `@ref` 或选择器定位，而不是原始坐标。
- 交互前，确保已固定正确的目标并打开应用会话。
- 保持循环简短：`open` -> inspect/act -> verify if needed -> `close`。

## 默认流程

1. 对常规设备任务执行操作前，加载 [references/bootstrap-install.md](references/bootstrap-install.md) 和 [references/exploration.md](references/exploration.md)。
2. 首先使用 bootstrap 确认或建立正确的目标、应用安装状态以及已打开的应用会话。
3. 应用会话打开并稳定后，使用 exploration 进行检查、交互和验证。
4. 如果目标是读取或验证可见内容，从普通 `snapshot` 开始。
5. 仅当需要用于交互式探索或所请求操作的引用时，才升级到 `snapshot -i`。
6. 如果只读命令能够回答问题，请在修改 UI 前使用 `get`、`is` 或 `find`。
7. 最后根据需要捕获证据，然后执行 `close`。

## QA 模式

- 开放式缺陷搜寻并生成报告：使用 [../dogfood/SKILL.md](../dogfood/SKILL.md)。
- 根据验收标准执行通过/失败 QA：继续使用此技能，从 [references/bootstrap-install.md](references/bootstrap-install.md) 开始，然后使用 [references/exploration.md](references/exploration.md) 中的 QA 循环。

## 必需的参考资料

- 对于每个常规设备任务，阅读此文件后，先加载 [references/bootstrap-install.md](references/bootstrap-install.md)，再加载 [references/exploration.md](references/exploration.md)，然后再执行操作。
- 使用 bootstrap 确认或建立确定性的设置，尤其是在沙盒或云环境中。
- 应用会话打开并稳定后，使用 exploration。
- 仅当需要其他参考资料所涵盖的内容时，才加载它们。

## 决策规则

- 需要验证文本是否可见时，使用普通 `snapshot`。
- `snapshot -i` 主要用于交互式探索和选择引用。
- 如果 `get`、`is` 或 `find` 能够在不更改 UI 状态的情况下回答问题，请使用它们。
- 使用 `fill` 替换文本。
- 使用 `type` 追加文本。
- 当任务要求“返回”时，对可预测的应用内部导航使用普通 `back`，将 `back --system` 保留给平台返回手势或按钮语义。
- 对于输入过快时会漏掉字符的防抖搜索字段，使用 `type --delay-ms` 或 `fill --delay-ms`。
- 如果尚无模拟器、未安装应用或没有已打开的应用会话，请切换到 `bootstrap-install.md`，不要自行设计设置步骤。
- 当临时 UI 阻碍检查时，先执行最小的解除阻碍操作；但除非用户要求进行相应交互，否则不要仅为了让 UI 显示数据而进行导航、搜索或输入新文本。
- 除非用户要求，否则不要使用外部查询来弥补屏幕上缺失的数据。
- 如果所需信息未显示在屏幕上，请直接说明，而不是通过额外导航、文本输入或网页搜索来弥补。
- 优先使用 `@ref` 或选择器定位，而不是原始坐标。

## 其他参考资料

- 需要日志、网络、警报、权限或故障分类处理：[references/debugging.md](references/debugging.md)
- 需要截图、差异比较、录制、回放维护或性能数据：[references/verification.md](references/verification.md)
- 需要桌面界面、菜单栏行为或 macOS 特定的交互规则：[references/macos-desktop.md](references/macos-desktop.md)
- 需要远程 HTTP 传输、通过 `--remote-config` 启动，或远程 macOS 主机上的租户租约：[references/remote-tenancy.md](references/remote-tenancy.md)