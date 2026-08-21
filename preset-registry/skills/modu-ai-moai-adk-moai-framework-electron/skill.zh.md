---
name: moai-framework-electron
description: >
  Electron 33+ desktop app development specialist covering Main/Renderer
  process architecture, IPC communication, auto-update, and packaging with
  Electron Forge. Use when building cross-platform desktop applications.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "2.0.0"
  category: "framework"
  status: "active"
  updated: "2026-01-10"
  modularized: "false"
  tags: "electron, desktop, cross-platform, nodejs, chromium, ipc, auto-update, electron-builder, electron-forge"
  context7-libraries: "/electron/electron, /electron/forge, /electron-userland/electron-builder"
  related-skills: "moai-domain-frontend"
---
# Electron 33+ 桌面开发

## 快速参考

Electron 33+ 桌面应用开发专家支持使用 Web 技术构建跨平台桌面应用程序。

自动触发条件：通过 electron.vite.config.ts 或 electron-builder.yml 文件检测到 Electron 项目、桌面应用开发请求、IPC 通信模式实现

### 核心能力

Electron 33 平台：

- Chromium 130 渲染引擎，支持现代 Web 功能
- Node.js 20.18 运行时，支持访问原生系统
- 主进程原生支持 ESM
- 支持 WebGPU API，可实现 GPU 加速图形处理

进程架构：

- 每个应用程序以单个实例运行主进程，并拥有完整的 Node.js 访问权限
- 渲染器进程在沙箱环境中显示 Web 内容
- 预加载脚本通过受控的 API 暴露机制连接主进程与渲染器
- 实用工具进程负责处理后台任务，避免阻塞 UI

IPC 通信：

- 使用类型安全的 invoke/handle 模式进行请求-响应通信
- 使用 contextBridge API，让渲染器安全地访问主进程功能
- 使用基于事件的消息传递，将推送通知从主进程发送到渲染器

自动更新支持：

- 集成 electron-updater，支持发布到 GitHub 和 S3
- 支持差分更新，减小下载大小
- 更新通知和安装管理

打包选项：

- Electron Forge，提供集成式构建工具和插件生态系统
- electron-builder，支持灵活的多平台分发

安全功能：

- 使用 contextIsolation 防止原型污染
- 强制实施沙箱，实现渲染器进程隔离
- Content Security Policy 配置
- IPC 处理程序的输入验证模式

### 项目初始化

创建新的 Electron 应用程序需要使用 vite-typescript 模板运行 create-electron-app 命令。将 electron-builder 安装为用于打包的开发依赖项。将 electron-updater 添加为运行时依赖项，以提供自动更新功能。

有关详细命令和配置，请参阅 reference.md 的“快速命令”部分。

---

## 实现指南

### 项目结构

推荐的目录布局：

源目录应包含四个主要子目录：

主进程目录：包含主进程入口点、按领域组织的 IPC 处理程序定义、业务逻辑服务和窗口管理模块

预加载目录：包含预加载脚本入口点，以及用于连接主进程与渲染器的公开 API 定义

渲染器目录：包含使用 React、Vue 或 Svelte 构建的 Web 应用程序，包括 HTML 入口点和 Vite 配置

共享目录：包含主进程与渲染器进程之间共享的 TypeScript 类型和常量

项目根目录应包含用于构建配置的 electron.vite.config.ts、用于打包选项的 electron-builder.yml，以及用于存放应用图标和资源的 resources 目录。

### 主进程设置

应用程序生命周期管理：

主进程初始化遵循特定的顺序。首先，使用 app.enableSandbox() 全局启用沙箱，以确保所有渲染器进程都在隔离环境中运行。然后，请求单实例锁，防止多个应用程序实例同时运行。

窗口创建应在应用的 ready 事件触发后进行。配置 BrowserWindow，使用注重安全性的 webPreferences，包括启用 contextIsolation、禁用 nodeIntegration、启用 sandbox，以及启用 webSecurity。设置 preload 脚本路径，以向渲染进程暴露安全的 API。

处理特定于平台的行为：在 macOS 上，如果不存在任何窗口，则在用户点击程序坞图标时重新创建窗口。在其他平台上，当所有窗口都关闭时退出应用程序。

有关实现示例，请参阅 examples.md 的“主进程入口点”部分。

### 类型安全的 IPC 通信

IPC 类型定义模式：

定义一个将通道名称映射到其载荷类型的接口。按照文件操作、窗口操作和存储操作等领域对通道进行分组。这样可以同时对主进程处理程序和渲染进程调用进行类型检查。

主进程处理程序注册：

在专用模块中注册 IPC 处理程序，并从共享类型中导入类型。每个处理程序都应在处理前使用 Zod 等模式验证库对输入进行验证。对于请求-响应模式，使用 ipcMain.handle，并返回结构化结果。

Preload 脚本实现：

创建一个 API 对象，为每个通道封装 ipcRenderer.invoke 调用。使用 contextBridge.exposeInMainWorld 将此 API 作为 window.electronAPI 提供给渲染进程。包含用于事件监听器的清理函数，以防止内存泄漏。

有关完整的 IPC 实现模式，请参阅 examples.md 的“类型安全的 IPC 实现”部分。

### 安全最佳实践

强制性安全设置：

每个 BrowserWindow 都必须配置包含四项关键设置的 webPreferences。必须始终启用 contextIsolation，以防止渲染进程代码访问 Electron 内部机制。必须始终在渲染进程中禁用 nodeIntegration。必须始终启用 sandbox，以实现进程级隔离。绝不能禁用 webSecurity，以确保同源策略得到强制执行。

内容安全策略：

使用 webRequest.onHeadersReceived 配置会话级 CSP 标头。将 default-src 限制为 self，将 script-src 限制为不包含 unsafe-inline 的 self，并将 connect-src 限制为允许的 API 域名。这可以防止 XSS 攻击和未经授权的资源加载。

输入验证：

每个 IPC 处理程序都必须在处理前验证输入。通过拒绝包含父目录引用的路径来防止路径遍历攻击。根据保留字符规则验证文件名。实现文件访问时，对允许的目录使用白名单。

有关安全实现的详细信息，请参阅 reference.md 的“安全最佳实践”部分。

### 自动更新实现

更新服务架构：

创建一个 UpdateService 类来管理 electron-updater 生命周期。使用主窗口引用进行初始化，以便启用 UI 通知。将 autoDownload 配置为 false，让用户能够控制带宽使用。

事件处理：

通过通知渲染进程并提示用户确认下载来处理 update-available 事件。跟踪 download-progress 事件以显示进度指示器。通过提示用户重新启动来处理 update-downloaded 事件。

用户通知模式：

当有更新可用以及下载完成时，使用系统对话框提示用户。向渲染器发送事件，以便在应用内显示通知。支持立即安装和延迟安装。

有关更新服务的完整实现，请参阅 examples.md 的 Auto-Update Integration 部分。

### 应用打包

Electron Builder 配置：

使用反向域名表示法配置 appId，以便进行平台注册。指定 productName，以便在系统 UI 中显示。为 macOS、Windows 和 Linux 设置平台特定的构建目标。

macOS 配置：

设置 category 以进行 App Store 分类。启用 hardenedRuntime 并配置 entitlements，以便进行公证。配置同时面向 x64 和 arm64 架构的通用构建。

Windows 配置：

指定可执行文件和安装程序的图标路径。配置 NSIS 安装程序选项，包括安装目录选择。使用适当的哈希算法设置代码签名。

Linux 配置：

配置 category，以便与桌面环境集成。设置多个构建目标，包括用于通用分发的 AppImage，以及用于通过软件包管理器安装的 deb/rpm。

有关完整的配置示例，请参阅 reference.md 的 Configuration 部分。

---

## 高级模式

有关高级主题的完整文档，请参阅 reference.md 和 examples.md：

窗口状态持久化：

- 跨会话保存和恢复窗口位置及大小
- 处理多显示器和显示器变更
- 管理最大化和全屏状态

多窗口管理：

- 使用正确的父子关系创建辅助窗口
- 在多个窗口之间共享状态
- 协调窗口生命周期事件

系统托盘和原生菜单：

- 创建和更新带有上下文菜单的系统托盘图标
- 构建带有键盘快捷键的应用程序菜单
- 适用于 macOS 和 Windows 的平台特定菜单模式

实用工具进程：

- 为 CPU 密集型后台任务生成实用工具进程
- 通过 MessageChannel 与实用工具进程通信
- 管理实用工具进程的生命周期和错误处理

原生模块集成：

- 针对 Electron Node.js 版本重新构建原生模块
- 使用 better-sqlite3 进行本地数据库存储
- 集成 keytar 以安全存储凭据

协议处理程序和深度链接：

- 注册用于启动应用程序的自定义 URL 协议
- 在不同平台上处理深度链接
- 通过自定义协议处理 OAuth 回调

性能优化：

- 延迟加载窗口和大型模块
- 通过延迟初始化优化启动时间
- 对长时间运行的应用程序进行内存管理

---

## 可良好配合使用

- `.claude/rules/moai/languages/typescript.md` - 用于类型安全 Electron 开发的 TypeScript 模式（通过 paths frontmatter 自动加载）
- moai-domain-frontend - React、Vue 或 Svelte 渲染器开发
- `.claude/rules/moai/languages/javascript.md` - 用于主进程的 Node.js 模式（通过 paths frontmatter 自动加载）
- moai-domain-backend - 后端 API 集成
- moai-workflow-testing - 桌面应用程序的测试策略

---

## 故障排除

常见问题及解决方案：

启动时白屏：

确认 preload 脚本路径已相对于构建输出目录正确配置。检查 loadFile 或 loadURL 路径是否指向现有文件。启用 devTools 以检查控制台错误。检查可能阻止脚本执行的 CSP 设置。

IPC 无法工作：

确认主进程处理程序与渲染进程调用之间的通道名称完全一致。确保在窗口加载内容之前注册处理程序。确认 contextBridge 的使用遵循 exposeInMainWorld 的正确模式。

原生模块失败：

在 npm install 后运行 electron-rebuild，以重新编译原生模块。确保与 Electron 内嵌的 Node.js 版本匹配。添加 postinstall 脚本以自动执行重新构建。

自动更新无法工作：

确认应用程序已进行代码签名，因为更新需要签名。检查 electron-builder.yml 中的发布配置。启用 electron-updater 日志记录，以诊断连接问题。检查可能阻止更新检查的防火墙设置。

调试命令：

使用 npx electron-rebuild 重新构建原生模块。使用 npx electron --version 检查 Electron 版本。通过 DEBUG=electron-updater 环境变量启用详细的更新日志记录。

---

## 资源

有关完整的代码示例和配置模板，请参阅：

- reference.md - 详细的 API 文档、版本矩阵和 Context7 库映射
- examples.md - 适用于所有模式、可用于生产环境的代码示例

如需最新文档，请使用 Context7 查询：

- /electron/electron，用于 Electron 核心 API
- /electron/forge，用于 Electron Forge 工具链
- /electron-userland/electron-builder，用于打包配置

---

版本：2.0.0
最后更新：2026-01-10
变更：重构以符合 CLAUDE.md 文档标准——删除了所有代码示例，并转换为叙述性文本格式

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我可以直接在渲染进程中使用 Node.js API” | 渲染进程运行不受信任的内容。直接访问 Node.js 是一个远程代码执行漏洞入口。应通过 preload 桥接层使用 IPC。 |
| “既然我信任自己的代码，contextIsolation 就没有必要” | 上下文隔离可防止来自 Web 内容的原型污染影响 Node.js。这与是否信任自己的代码无关，而是为了隔离上下文。 |
| “自动更新可以在发布后再配置” | 在未配置自动更新的情况下发布，意味着用户将停留在存在漏洞的版本上。请在首次发布前完成配置。 |
| “我以后再打包应用，开发构建足以用于测试” | 开发构建具有不同的文件路径、权限和代码签名。只有生产环境打包构建才能暴露真实的分发问题。 |
| “IPC 很慢，我会通过全局变量共享状态” | IPC 开销仅为微秒级。全局变量会绕过出于安全目的而存在的进程隔离机制。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- `BrowserWindow` 选项中的 `nodeIntegration` 设置为 `true`
- `contextIsolation` 设置为 `false`，且没有文档化的安全理由
- 渲染器进程直接从 `electron` 或 Node 模块导入（绕过预加载脚本）
- 未配置自动更新机制
- IPC 处理程序未验证或清理来自渲染器的参数

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 所有 `BrowserWindow` 中的 `nodeIntegration` 均为 `false`，且 `contextIsolation` 均为 `true`
- [ ] 所有从渲染器到主进程的通信均使用 `contextBridge` 和 IPC
- [ ] IPC 处理程序在处理前会验证输入参数
- [ ] 已配置并测试自动更新（展示更新配置）
- [ ] 应用程序已使用 Electron Forge 成功打包（展示构建输出）
- [ ] 渲染器进程代码中没有直接使用 `require('electron')`

<!-- moai:evolvable-end -->

## 遥测窗口

**状态**：UNCLEAR（60 天窗口）
**R4 审核结论**：KEEP（监控）
**SPEC**：SPEC-V3R2-WF-001 §6.2（REQ-WF001-013）
**窗口开始日期**：2026-04-25（Wave 1.5 提交日期）
**窗口结束日期**：2026-06-24（60 天）
**重新审核触发条件**：此技能的 `SessionStart` 钩子激活次数
**决策标准**：
- 如果窗口期内激活次数 >= 5 → 永久保留
- 如果窗口期内激活次数 = 0 → 安排在 v3.1 中 RETIRE
- 如果 0 < 激活次数 < 5 → 保留并添加 `"low-use"` 标签