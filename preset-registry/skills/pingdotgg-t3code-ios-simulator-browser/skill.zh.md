---
name: ios-simulator-browser
description: Stream an explicit iOS Simulator through pinned serve-sim into the T3 Code in-app browser or another agent browser. Use on Apple Silicon macOS when the user should watch simulator verification live or when browser-visible simulator evidence is needed.
---
# iOS 模拟器浏览器

使用 serve-sim 作为 iOS 模拟器的共享视觉 feed。使用 `ios-debugger-agent` 和 XcodeBuildMCP 语义 UI 工具驱动应用；不要将浏览器画布坐标视为应用可访问性缺失的替代方案。

## 确认可用性

serve-sim `0.1.45` 要求使用 Apple Silicon macOS、Xcode 命令行工具以及 Node.js 20 或更高版本。如果主机不受支持，请继续使用 XcodeBuildMCP 截图，并报告实时流不可用。

在 T3 Code 中运行时，使用其产品原生的浏览器 MCP 打开流。其他 agent 宿主可以使用其自身的浏览器或预览界面。

让 serve-sim 保持默认的 `127.0.0.1` 绑定。除非用户明确请求该访问且网络可信，否则不要将其预览暴露到局域网或通过隧道公开；该预览包含一个受令牌保护的 shell 执行路由。

## 启动一个由自己管理的流

1. 从 iOS 构建或启动工作流中获取模拟器的确切 UDID。
2. 检查是否已有针对该 UDID 的 serve-sim 流属于其他任务。只有在明确共享时才可以复用；绝不要终止其他任务的流。
3. 否则，仅清理该 UDID 对应的陈旧流，并使用限定范围的清理启动固定版本：

   ```bash
   SIMULATOR_ID=<simulator-udid>
   cleanup_serve_sim() {
     npx --yes serve-sim@0.1.45 --kill "$SIMULATOR_ID" >/dev/null 2>&1 || true
   }
   trap cleanup_serve_sim EXIT INT TERM HUP
   cleanup_serve_sim
   npx --yes serve-sim@0.1.45 "$SIMULATOR_ID"
   ```

4. 保持终端运行，并在 agent 的浏览器中打开 serve-sim 打印出的准确本地 URL。
5. 验证是否渲染出了实时模拟器画面。仅加载包装页面不足以作为证据。

## 通过语义操作进行驱动时观察

- 让用户观看 serve-sim 流，同时由 XcodeBuildMCP 执行 `snapshot_ui`、语义点击、输入、手势和截图。
- 确保浏览器和 Xcode 工具固定使用同一个模拟器 UDID。
- 不要仅仅因为流可见，就切换到通用桌面自动化或浏览器画布点击。

如果应用内浏览器明确报告预览不可用，不要安装无关的浏览器自动化工具。继续通过 XcodeBuildMCP 操作，获取模拟器截图，报告实时流不可用，并清理由自己管理的 serve-sim 进程。

## 完成

停止长时间运行的终端，并等待其清理 trap 完成。如果该终端消失且未执行清理，请针对确切的模拟器运行 `npx --yes serve-sim@0.1.45 --kill <simulator-udid>`。绝不要运行未限定范围的 `--kill`。

## 上游来源

改编自 OpenAI 的 [`build-ios-apps`](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps) 插件 `0.1.2` 版本（`ios-simulator-browser`，MIT）。它依据 Apache-2.0 许可证调用 serve-sim `0.1.45`，但未将该软件包随附打包。