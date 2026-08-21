---
name: moai-platform-chrome-extension
description: >
  Chrome Extension Manifest V3 development specialist covering service workers,
  content scripts, message passing, chrome.* APIs, side panel, declarativeNetRequest,
  and Chrome Web Store publishing. Use when building browser extensions.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, Bash(npm:*), Bash(npx:*), Bash(node:*), WebFetch, WebSearch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "1.0.0"
  category: "platform"
  status: "active"
  updated: "2026-02-01"
  modularized: "true"
  tags: "chrome-extension, manifest-v3, service-worker, content-script, messaging, chrome-api, browser-extension, web-store, side-panel, declarative-net-request"
  context7-libraries: "/nicedoc/chrome-extension-doc"
  related-skills: "moai-domain-frontend"
  aliases: "chrome-ext, browser-extension, crx"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 120
  level2_tokens: 8000

# MoAI Extension: Triggers
triggers:
  keywords: ["chrome extension", "manifest v3", "service worker", "content script", "chrome api", "browser extension", "popup", "side panel", "background script", "web store", "declarativeNetRequest", "chrome.runtime", "chrome.tabs", "chrome.storage", "chrome.scripting", "chrome.action", "manifest.json", "crx"]
  agents: ["expert-frontend", "expert-backend"]
  phases: ["plan", "run"]
---
# Chrome 扩展 Manifest V3 开发

## 快速参考

Chrome 扩展 Manifest V3 开发专家支持使用最新的 Chrome 平台 API 构建现代浏览器扩展。

自动触发条件：通过包含 `manifest_version 3` 的 `manifest.json`、Service Worker 文件、内容脚本声明和 Chrome API 使用模式检测到 Chrome 扩展项目

### 核心能力

Manifest V3 平台：

- Service Worker 取代持久化后台页面，以实现事件驱动架构
- 移除远程代码执行，增强安全性
- `declarativeNetRequest` 取代阻塞式 `webRequest`，用于网络过滤
- 所有 `chrome.*` API 均提供基于 Promise 的 API 方法
- `action` API 将 `browserAction` 和 `pageAction` 统一为单一界面
- 支持 Chrome 88 及更高版本

进程架构：

- Service Worker 作为单个事件驱动的后台脚本运行，并在空闲时终止
- 内容脚本在网页上下文中的隔离环境内执行
- 弹出窗口和侧边栏提供专用的 UI 界面
- 选项页面提供扩展设置界面
- DevTools 面板用于扩展 Chrome 开发者工具

通信模式：

- Service Worker 与内容脚本之间通过 `sendMessage` 传递一次性消息
- 通过 `connect` 建立基于端口通信的长连接
- 通过 `externally_connectable` 声明实现跨扩展消息传递
- 针对已验证来源，实现网页到扩展的消息传递

安全模型：

- 内容安全策略将脚本来源限制为仅自身
- 不允许使用内联脚本或执行远程代码
- 权限在安装时声明所需的 API 访问权限
- 可选权限允许在运行时经用户同意后请求访问权限
- 主机权限控制网页访问模式

### Context7 文档访问

如需获取最新的 Chrome 扩展 API 文档，请使用 Context7 MCP 工具：

步骤 1 - 解析库 ID：使用 `mcp__context7__resolve-library-id`，并以 `"chrome extension"` 作为查询，以获取与 Context7 兼容的库 ID。

步骤 2 - 获取文档：使用 `mcp__context7__get-library-docs` 和解析得到的库 ID，并指定主题和令牌分配量。

示例主题包括 `"manifest v3 configuration"`、`"service worker lifecycle"`、`"content scripts injection"`、`"message passing patterns"`、`"chrome.storage API"`、`"side panel API"` 和 `"declarativeNetRequest rules"`。

---

## 模块索引

此技能采用渐进式披露方式，通过专门模块提供详细的实现模式。

### 核心模块

`manifest-v3-reference` 涵盖 Manifest V3 扩展完整的 `manifest.json` 字段参考。主题包括必填和可选字段、字段类型与约束、权限声明、从 MV2 迁移到 MV3 的说明，以及扩展配置最佳实践。

`service-worker-patterns` 涵盖 Service Worker 生命周期、事件注册、状态管理和调试。主题包括事件驱动架构、顶层监听器注册、使用 `chrome.storage` 实现状态持久化、保活策略、用于访问 DOM 的离屏文档，以及使用 `chrome://extensions` 进行调试。

content-scripts-guide 涵盖内容脚本注入方法、隔离世界和通信。主题包括在清单中进行静态声明、使用 chrome.scripting 动态注册、以编程方式注入、隔离世界架构、DOM 访问模式以及安全注意事项。

messaging-patterns 涵盖扩展组件之间的消息传递。主题包括使用 sendMessage 发送一次性消息、使用 connect 和端口建立长期连接、异步响应模式、跨扩展消息传递、网页消息传递以及错误处理策略。

apis-quick-reference 涵盖主要的 chrome.* API，包括方法签名和权限要求。主题包括 chrome.runtime、chrome.tabs、chrome.storage、chrome.action、chrome.scripting、chrome.alarms、chrome.notifications、chrome.contextMenus、chrome.sidePanel、chrome.declarativeNetRequest、chrome.offscreen、chrome.identity 和 chrome.commands。

ui-components 涵盖弹出窗口、侧边栏、选项页面、DevTools 面板和内容脚本 UI。主题包括弹出窗口 HTML 及其生命周期、侧边栏配置和 API、选项页面模式、DevTools 扩展集成，以及由内容脚本注入的 UI。

security-csp 涵盖内容安全策略、权限模型和安全编码实践。主题包括扩展页面的 CSP 配置、最小权限原则、输入验证、XSS 防护、安全消息传递模式以及强制使用 HTTPS。

publishing-guide 涵盖 Chrome 应用商店提交和分发。主题包括开发者账号设置、扩展打包、隐私政策要求、审核流程、更新机制以及自行托管分发。

---

## 实施指南

### Manifest V3 结构

每个 Chrome 扩展都需要在项目根目录下包含一个 manifest.json 文件。有三个字段是必需的：manifest_version 设置为整数 3，name 作为扩展的显示名称且最多包含 75 个字符，version 作为兼容语义化版本规范的字符串。

description 字段提供显示在 Chrome 应用商店中的摘要，最多包含 132 个字符。icons 对象指定 16、32、48 和 128 像素的 PNG 图标，用于 Chrome UI 的各种场景。

对于后台处理，请在 background 对象内声明 service_worker 字段，将其设置为指向 Service Worker 文件的单个字符串路径。使用 ES 模块导入时，将 type 设置为 module。Service Worker 路径必须是单个字符串，而不是数组。

内容脚本声明为对象数组，每个对象都指定用于 URL 匹配的 matches 模式、用于 JavaScript 文件的 js 数组、用于样式表的可选 css 数组，以及用于控制注入时机的 run_at，其可选值为 document_start、document_end 或 document_idle。

有关详细的字段参考和迁移指南，请参阅 modules/manifest-v3-reference.md。

### Service Worker 架构

Manifest V3 中的 Service Worker 使用事件驱动模型取代了持久化后台页面。Service Worker 仅在响应事件时运行，并在空闲时终止，从而减少内存和 CPU 消耗。

所有事件监听器都必须在服务工作线程脚本的顶层注册。在回调、Promise 或异步函数内部注册的监听器无法在服务工作线程重启后继续保留。

由于服务工作线程无法访问 DOM，也没有 window 对象和 localStorage，因此请使用 chrome.storage API 保存持久化状态。对于计划任务，请使用 Alarms API，而非 setTimeout 或 setInterval，因为这些计时器无法在服务工作线程终止后继续运行。网络请求应使用 fetch，而不是 XMLHttpRequest。

对于需要访问 DOM 的长时间运行操作，请通过 chrome.offscreen.createDocument 使用 Offscreen Documents API，创建一个具备 DOM 功能的隐藏文档。

有关完整的服务工作线程模式和调试指南，请参阅 modules/service-worker-patterns.md。

### 内容脚本

内容脚本在网页上下文中执行 JavaScript 和 CSS。它们运行在隔离环境中，这意味着它们可以与宿主页面共同访问 DOM，但拥有独立的 JavaScript 执行环境，从而避免变量和函数冲突。

共有三种注入方式。静态注入在清单的 content_scripts 数组中使用 URL 匹配模式声明脚本。动态注入使用 chrome.scripting.registerContentScripts 在运行时注册。编程式注入使用 chrome.scripting.executeScript 按需注入，需要 host_permissions 或 activeTab 权限。

内容脚本只能直接访问有限的 chrome API：包括 dom、i18n、storage，以及特定的 runtime 方法，包括 connect、sendMessage、onMessage、onConnect、getManifest、getURL 和 id。所有其他 API 调用都必须通过消息传递交由服务工作线程处理。

有关注入模式、隔离环境的详细信息和安全注意事项，请参阅 modules/content-scripts-guide.md。

### 消息传递模式

扩展程序的各个组件之间使用 Chrome 消息传递机制进行通信。一次性消息使用 chrome.runtime.sendMessage 向服务工作线程发送消息，并使用 chrome.tabs.sendMessage 向内容脚本发送消息。每条消息都会通过回调或 Promise 接收单个响应。

长连接使用 chrome.runtime.connect 或 chrome.tabs.connect 建立端口。端口会保持打开状态，直到任意一方调用 disconnect、监听器被移除，或包含该端口的标签页卸载。端口支持持续的双向通信。

对于一次性消息传递中的异步响应，onMessage 监听器必须返回 true，以表明将异步调用 sendResponse；从 Chrome 144 开始，也可以直接返回 Promise。

所有消息均使用 JSON 序列化，最大大小为 64 MiB。切勿信任来自内容脚本的消息内容，因为宿主页面上下文可能已遭入侵。

有关完整的消息传递模式，包括跨扩展程序通信和网页通信，请参阅 modules/messaging-patterns.md。

### Chrome API 参考

chrome.runtime API 提供扩展程序生命周期管理、消息传递和清单访问功能。它处理安装、更新和挂起事件，并提供用于获取扩展程序 URL 和平台信息的方法。

chrome.tabs API 用于管理浏览器标签页，提供查询、创建、更新和移除标签页的方法。chrome.storage API 提供三种存储区域：local，容量为 10 MB；sync，容量为 100 KB，可在已登录的设备之间同步；以及 session，用于内存存储，并在浏览器重启时清除。

chrome.action API 用于控制工具栏按钮，包括徽章文本、图标、弹出窗口和点击处理程序。chrome.scripting API 支持以编程方式向网页中注入脚本和 CSS。

chrome.sidePanel API 用于管理扩展程序侧边栏，这是一种显示在网页内容旁的持久化 UI 界面。chrome.declarativeNetRequest API 使用静态和动态规则提供网络请求过滤功能，而无需使用阻塞式 webRequest。

有关完整的 API 方法签名和权限要求，请参阅 modules/apis-quick-reference.md。

### UI 组件

扩展程序支持多种 UI 界面。弹出窗口通过清单中的 action.default_popup 配置，并在单击工具栏按钮时显示为标准 HTML 页面。弹出窗口失去焦点时会关闭，因此应快速加载。

侧边栏通过清单中的 side_panel.default_path 配置，并在网页内容旁提供持久化面板。chrome.sidePanel API 用于控制面板行为，支持按标签页设置面板或设置全局面板。

选项页面通过清单中的 options_ui.page 配置，并在 chrome://extensions 中打开，用于配置扩展程序设置。DevTools 面板使用 devtools_page 清单字段扩展 Chrome 开发者工具。

内容脚本可以使用 DOM 操作将 UI 元素直接注入网页，并应用自定义 CSS 进行样式设置。

有关详细的 UI 实现模式，请参阅 modules/ui-components.md。

### 权限模型

权限分为四类。标准权限用于声明 API 访问要求，例如 storage、tabs、activeTab、contextMenus、notifications、scripting、alarms、sidePanel、declarativeNetRequest、identity 和 offscreen。这些权限在安装时授予。

主机权限使用 https://*.example.com/* 等模式指定可访问的网页 URL。可选权限和可选主机权限允许通过 chrome.permissions.request 在运行时请求，从而减少安装时的权限提示。

应优先使用 activeTab，而不是宽泛的主机权限，以尽量减少权限警告。仅请求扩展程序功能所必需的最低权限。

有关详细的权限策略和安全指南，请参阅 modules/security-csp.md。

### 安全最佳实践

Manifest V3 的内容安全策略将 script-src 限制为只能使用 self 和 wasm-unsafe-eval。禁止使用内联脚本、eval 和远程代码加载。所有 JavaScript 都必须打包在扩展程序包中。

内容脚本在隔离环境中运行，但由于宿主页面可以操纵共享 DOM，因此应将其视为可能已遭入侵。始终在服务工作线程中验证并清理从内容脚本接收的数据。切勿对不受信任的数据使用 eval、document.write 或 innerHTML。所有外部网络请求都应使用 HTTPS。

有关全面的安全模式和 CSP 配置，请参阅 modules/security-csp.md。

---

## 高级模式

有关高级主题的详细实现指南，请参阅 modules 目录：

Manifest V3 迁移：

- 将 MV2 后台页面转换为 Service Worker
- 使用 declarativeNetRequest 替代阻塞式 webRequest
- 将远程代码更新为打包模块
- 调整持久化状态以适配 chrome.storage 模式

复杂的 Service Worker 模式：

- 使用多 alarm 调度周期性任务
- 为长时间运行的操作保持 Service Worker 活跃
- 管理用于音频、canvas 和 DOM 解析的 Offscreen Document
- 在 Service Worker 和 Content Script 之间导入共享模块

高级 Content Script 模式：

- 根据用户偏好动态注册脚本
- 针对主世界与隔离世界的世界隔离策略
- 注入 Shadow DOM 以实现封装的 UI 组件
- 使用 MutationObserver 处理动态页面内容的模式

跨上下文通信：

- 在多个 Content Script 之间进行消息路由
- 向所有标签页广播的模式
- 外部网站与扩展之间的通信
- 通过 chrome.runtime.connectNative 与本地应用程序进行原生消息通信

存储同步：

- 使用 chrome.storage.sync 实现跨设备设置同步
- 使用 chrome.storage.session 存储临时数据
- 使用存储变更监听器实现响应式更新
- 配额管理与溢出处理策略

---

## 故障排除

常见问题及解决方案：

Service Worker 未注册：

验证 manifest.json 中的 background.service_worker 字段是单个字符串路径，而不是数组。确保 Service Worker 文件存在于声明的路径中。检查 chrome://extensions 上扩展卡片中的错误消息。在扩展详情页面点击 Service Worker 链接，以检查 Service Worker 控制台。

Content Script 未注入：

确认 manifest.json 中的 matches 模式正确匹配目标 URL。验证 run_at 的时机是否适合要访问的页面内容。检查扩展是否具有必要的主机权限。检查目标页面控制台中的 Content Script 错误。

消息传递失败：

确保发送方和接收方的通道名称及消息结构一致。验证接收监听器已在消息发送前注册。检查是否在监听器返回前调用了 sendResponse，或者为异步响应返回 true。使用 chrome.tabs.sendMessage 时，验证目标标签页是否存在。

权限被拒绝错误：

确认所有必需的权限均已在 manifest.json 中声明。对于编程式注入，验证是否已授予 host_permissions 或 activeTab 权限。检查 chrome://extensions 中是否存在任何权限警告或禁用状态。使用 chrome.permissions.contains 验证运行时权限。

扩展未在 Chrome Web Store 中显示：

确保 manifest.json 通过验证且没有错误。验证软件包中存在所有已声明的资源，包括图标、HTML 文件和脚本。检查 description 是否未超过 132 个字符。在开发者信息中心查看提交错误。

调试命令：

打开 chrome://extensions 查看所有已安装的扩展程序及其状态。启用开发者模式以访问扩展程序详细信息和错误日志。点击服务工作线程链接，打开其专用的 DevTools 控制台。使用 chrome://inspect 在页面上下文中调试内容脚本。

---

## 配合使用效果良好

- `.claude/rules/moai/languages/typescript.md`，用于扩展程序开发中的 TypeScript 模式（通过 paths frontmatter 自动加载）
- `.claude/rules/moai/languages/javascript.md`，用于 JavaScript 模式和 ES 模块用法（通过 paths frontmatter 自动加载）
- moai-domain-frontend，用于基于 React 或框架的弹出窗口和侧边栏 UI
- moai-domain-backend，用于服务端 API 集成
- moai-workflow-testing，用于扩展程序测试策略

---

## 资源

### 模块参考

有关详细的实现模式，请参阅 modules 目录：

- modules/manifest-v3-reference.md 涵盖完整的 manifest.json 字段参考
- modules/service-worker-patterns.md 涵盖服务工作线程生命周期和模式
- modules/content-scripts-guide.md 涵盖内容脚本注入和通信
- modules/messaging-patterns.md 涵盖所有消息传递模式
- modules/apis-quick-reference.md 涵盖 chrome.* API 方法签名
- modules/ui-components.md 涵盖弹出窗口、侧边栏、选项和 DevTools UI
- modules/security-csp.md 涵盖 CSP、权限和安全编码
- modules/publishing-guide.md 涵盖 Chrome 应用商店发布工作流

### 外部文档

如需最新文档，请使用 Context7 查询：

- /nicedoc/chrome-extension-doc，获取 Chrome 扩展程序 API 文档

如需 Chrome 官方文档，请使用 WebFetch 访问：

- https://developer.chrome.com/docs/extensions/develop，获取开发指南
- https://developer.chrome.com/docs/extensions/reference/api，获取 API 参考

---

状态：生产就绪
生成工具：MoAI-ADK Skill Factory v1.0
最后更新：2026-02-01
版本：1.0.0（首次发布）
覆盖范围：Manifest V3、服务工作线程、内容脚本、消息传递、Chrome API、UI、安全性、发布

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会先申请宽泛的权限，之后再缩小范围” | 用户在安装时就会看到权限。宽泛的权限会阻碍用户安装，并且可能导致 Chrome 应用商店拒绝审核。 |
| “内容脚本可以访问页面上的所有内容，因此安全性是页面自身的问题” | 内容脚本在用户的上下文中运行。通过内容脚本注入不受信任的内容会在扩展程序中形成 XSS 攻击途径。 |
| “Manifest V2 仍然可用，我不需要迁移” | Chrome 应用商店已不再接受 MV2 提交。未来的 Chrome 版本将禁用 MV2 扩展程序。 |
| “服务工作线程与后台页面相同” | 服务工作线程由事件驱动，并会在空闲时终止。持久状态必须使用 chrome.storage，而不能使用全局变量。 |
| “我稍后会添加 CSP，它只是一个安全标头” | manifest.json 中缺少 CSP 会允许内联脚本和 eval()，而它们是扩展程序的主要漏洞利用途径。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- manifest.json 请求 `<all_urls>` 或 `*://*/*` 主机权限，但未说明理由
- 内容脚本对不受信任的内容使用 eval() 或 innerHTML
- Service Worker 将状态存储在全局变量中（终止时会丢失）
- manifest.json 中缺少 content_security_policy
- 扩展在未验证来源的情况下与外部服务器通信

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] manifest.json 中的权限已最小化，且每项权限均在文档中说明了理由
- [ ] manifest.json 中已定义内容安全策略（无 unsafe-eval、无 unsafe-inline）
- [ ] Service Worker 使用 chrome.storage 存储持久状态（不使用全局变量存储状态）
- [ ] 消息传递在处理前会验证发送方来源
- [ ] 扩展已在启用开发者模式的 Chrome 中完成测试（展示测试结果）
- [ ] 已验证符合 Manifest V3 要求（未使用仅限 MV2 的 API）

<!-- moai:evolvable-end -->

## 遥测窗口

**状态**：UNCLEAR（60 天窗口）
**R4 审核结论**：KEEP（监控）
**SPEC**：SPEC-V3R2-WF-001 §6.2 (REQ-WF001-013)
**窗口开始日期**：2026-04-25（Wave 1.5 提交日期）
**窗口结束日期**：2026-06-24（60 天）
**重新审核触发条件**：此技能的 SessionStart 钩子激活次数
**决策标准**：
- 如果窗口期内激活次数 >= 5 → 永久保留
- 如果窗口期内激活次数 = 0 → 安排在 v3.1 中 RETIRE
- 如果 0 < 激活次数 < 5 → 保留并添加 "low-use" 标签