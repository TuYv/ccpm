---
name: ios-debugger-agent
description: Build, launch, inspect, and drive iOS apps with the repository-configured XcodeBuildMCP server. Use on macOS for iOS Simulator builds, focused native test runs, semantic UI automation, screenshots, logs, or debugging, including T3 Code Mobile verification.
---
# iOS 调试代理

使用仓库配置的 `xcodebuildmcp` 工具，而不是要求全局安装 Codex 插件。在客户端提供 MCP 工具时，优先使用 MCP 工具，而不是直接使用 `xcodebuild`、`xcrun` 或 `simctl`。

## 确认可用性

此工作流要求 macOS 14.5 或更高版本、Xcode 16 或更高版本，以及 Node.js 18 或更高版本。仓库在 Claude Code 的 `.mcp.json` 和 Codex 的 `.codex/config.toml` 中都固定了 XcodeBuildMCP 版本。项目 MCP 服务器可能需要一次性信任或批准，之后重新创建会话。

如果缺少这些工具：

1. 确认仓库已受信任，并且其项目 MCP 服务器已获批准。
2. 在批准配置后，重启或重新创建代理会话。
3. 当服务器启动但模拟器或 UI 自动化工具不可用时，运行 `npx --yes xcodebuildmcp@2.6.2 doctor`。根据其提供的可执行建议完成 Xcode 或 AXe 设置。
4. 仅当当前代理客户端无法提供项目 MCP 工具时，才回退到固定版本的 XcodeBuildMCP CLI 或原生 Apple CLI。

不要要求贡献者全局安装 OpenAI 的 `build-ios-apps` 插件。

## 建立一个模拟器上下文

1. 在发现、构建、启动或 UI 操作之前调用 `session_show_defaults`。
2. 调用 `list_sims` 并选择一个明确的模拟器 UDID。优先选择已经启动的模拟器；当验证需要时，启动一个已安装的模拟器，但未经用户授权不要创建或下载运行时。
3. 使用项目或工作区、scheme、Debug 配置、模拟器 ID，以及在已知时提供 bundle identifier，调用 `session_set_defaults`。
4. 后续每一次构建、启动、截图、日志捕获和 UI 操作，都固定使用同一个 UDID。

避免使用通用的 Mac 窗口自动化来在多个 Simulator 窗口之间切换。明确的设备标识更加可靠。

## 选择构建或启动方式

- 当原生源代码、原生依赖、entitlements 或项目配置发生变化时，使用 `build_run_sim`。
- 使用 `test_sim` 运行最小范围的相关原生测试目标或测试用例；不要例行地运行整个工作区的测试矩阵。
- 当兼容的应用已经安装且不需要重新构建原生代码时，使用 `launch_app_sim`。
- 要复用现有的构建产物，使用 `get_sim_app_path` 或 `get_app_bundle_id`，必要时使用 `install_app_sim` 安装，然后启动应用。
- 除非任务同时需要这两种产物，否则不要紧接着在 `build_run_sim` 之前执行仅构建操作。

启动后，在交互之前调用 `snapshot_ui` 或 `screenshot`。仅有一个打开的 Simulator 窗口，不能证明目标应用已启动。

## 以语义方式驱动 UI

1. 调用 `snapshot_ui` 获取当前的辅助功能层级结构和元素引用。
2. 仅使用当前 `elementRef` 值，且其快照条目列出了目标操作。XcodeBuildMCP `2.6.2` 不接受 `tap` 的坐标；当应用没有提供可操作的引用时，优先使用已注册的深层链接或其他应用支持的路径，否则报告辅助功能阻塞问题。
3. 在导航或布局发生变化后，使用 `snapshot_ui` 刷新。元素引用仅对对应的快照有效。
4. 在可用时，使用 `wait_for_ui` 等待异步过渡，而不是固定等待。
5. 为能够证明受影响流程的状态，捕获最终的 `screenshot`。

需要时使用 `gesture` 或作用域限定的滑动操作。如果手势不可靠，请返回已知路由或重新启动，而不是切换到通用桌面自动化。

## 捕获日志和调试

- 使用 `start_sim_log_cap` 和 `stop_sim_log_cap`，并提供准确的 bundle identifier，以捕获专注于目标的运行时日志。
- 仅在任务需要运行时诊断时使用调试器工具；连接到选定的模拟器和应用，而不是连接到不明确的进程。
- 总结相关错误，而不是返回无界限的日志。

## 清理

仅停止为当前测试启动的日志捕获、调试器会话、应用或模拟器。保留预先存在的模拟器和不相关的会话。

## 上游

改编自 OpenAI 的 [`build-ios-apps`](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps) 插件版本 `0.1.2`（`ios-debugger-agent`，MIT），并与 XcodeBuildMCP `2.6.2` 的工具名称保持一致。