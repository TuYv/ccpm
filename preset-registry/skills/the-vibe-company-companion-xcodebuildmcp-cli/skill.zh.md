---
name: xcodebuildmcp-cli
description: "Use the official XcodeBuildMCP CLI for deterministic Apple-platform discovery, build, test, simulator run, debugging, logs, screenshots, and UI inspection. Use for tool execution and verification, not for product shaping or SwiftUI architecture."
metadata:
  short-description: "Verify Apple-platform builds"
---
# XcodeBuildMCP CLI

将 XcodeBuildMCP 作为 iOS、macOS、watchOS、tvOS 和 visionOS 项目发现与验证的唯一工具边界。它通过一个确定性的 CLI 暴露 Apple 开发者工具工作流；当任务需要构建、测试、模拟器启动、截图、日志、调试或 UI 检查时，Agents 和 Claude 都应使用它。

## 受保护的不变量

- 使用 xcodebuildmcp 可执行文件进行发现、构建、测试、运行、调试、日志和 UI 自动化。不要退回到直接使用原始的 xcodebuild、xcrun 或 simctl。
- 从可执行文件中发现已安装的接口。不要假设此前记住的工具名、工作流、模拟器、scheme 或选项仍然有效。
- 保持命令序列最小且可观察。优先使用一个能满足请求的直接工作流。对于模拟器运行意图，优先使用组合的 build-and-run 工作流；除非用户明确要求，不要将 build 与 build-and-run 串联使用。
- 在第一次构建、运行或测试操作之前检查会话默认值/配置。使用可执行文件的帮助来定位当前的 session-defaults 或配置查看命令。
- 永远不要以命令参数的形式打印、持久化或传递密钥。对粘贴的输出和截图中的敏感值进行遮蔽。将生成的产物保留在请求的或已忽略的运行区域内。
- CLI 缺失属于环境前提条件，并不等于可以静默安装软件的许可。告知用户有哪些官方安装选项，并在安装或更改环境之前请求授权。

## 帮助优先的发现

按顺序执行以下检查，一旦确定了实际的工作流即停止：

    xcodebuildmcp --help
    xcodebuildmcp tools
    xcodebuildmcp <workflow> --help
    xcodebuildmcp <workflow> <tool> --help

利用工具列表和帮助输出来发现项目检查、会话配置、构建、测试、模拟器、设备、日志、调试、截图和 UI 自动化操作。在工作流需要时，明确写出所选的 scheme、项目/工作区路径、包路径、配置、目标设备（destination）和测试计划。

## Companion iOS 验证

对于本仓库，在执行第一个操作之前先阅读 apps/ios/AGENTS.md 和 apps/ios/README.md。使用现有的项目/包路径和 scheme。一次典型的聚焦检查包括：

- 为 apps/ios/CompanionKit 运行 Swift 包测试工作流；
- 为一个已知的 iOS 模拟器构建应用；
- 当请求包含启动应用时，使用 build-and-run；
- 当视觉行为重要时，通过 UI 查询、交互、辅助功能标签和截图来检查变更后的屏幕。

不要把编译成功当作产品正确性的证明。检查实际的模拟器状态，并验证变更可能影响的加载、空态、错误、权限、减弱动态效果/透明度、键盘/安全区域以及长内容等状态。保留共享的 /v1 契约，绝不要将客户端用作通往 Box 或 Pi 的途径。

## 失败处理与移交

失败时，保留最小可用的命令、退出状态、相关的帮助/日志摘录、目标与目标设备（destination）以及下一个安全动作。区分源码/测试失败与模拟器不可用、签名问题、依赖缺失或 CLI 缺失。当某个含义不明的外部操作可能已经启动或更改了状态时，不要自动重试；先检查该工具的会话状态。

将实现和产品决策移交给 ios-product-dev 或 swiftui-expert-dev。将跨平台视觉决策移交给 design-frontend-dev。返回一份简明的验证报告，涵盖所使用的命令/工作流、目标与目标设备、执行的检查、产物或截图、失败情况以及任何未验证的路径。

## 退出标准

- 已验证 CLI 存在，或在未进行未经批准的安装的情况下报告了缺失的前提条件和官方安装选项。
- 通过帮助和工具的发现确立了实际使用的工作流和参数。
- 在第一次构建、运行或测试之前已检查会话默认值/配置。
- 最小相关的构建/测试/运行/UI 检查已完成，并报告了它们的真实结果。
