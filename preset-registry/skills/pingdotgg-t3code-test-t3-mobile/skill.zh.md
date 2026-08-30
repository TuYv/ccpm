---
name: test-t3-mobile
description: Launch and test T3 Code Mobile on an iOS Simulator or Android Emulator against disposable local T3 environments, including Metro and dev-client reuse, native rebuild decisions, per-client pairing, seeded projects, semantic UI control, screenshots, and iOS serve-sim streaming. Use after mobile UI or native changes, when reproducing phone or tablet behavior, pairing an emulator to isolated state, or verifying mobile behavior on macOS, Linux, or Windows.
---
# 测试 T3 移动端

针对一次性的 T3 状态执行一轮聚焦的端到端移动端验证。使用同级目录中的 [`test-t3-app`](../test-t3-app/SKILL.md) skill 作为配对令牌语义和 SQLite fixture 的详细参考。

命令示例使用 POSIX shell 语法。在 Windows 上，使用 PowerShell 等效写法：使用 `$env:NAME = "value"` 设置变量，使用 `[System.IO.Path]::GetTempPath()` 获取明确的临时目录，并将多行示例写在一行中，或使用 PowerShell 反引号。若 `adb` 不在 `PATH` 中，请使用 `$env:ANDROID_HOME\platform-tools\adb.exe`。

## 选择可行的平台

在启动进程前检查主机和受影响的代码：

- 在安装了 Xcode 的 macOS 上，如果更改是跨平台的，优先选择一个具有代表性的 iOS Simulator，以便用户可以通过 serve-sim 观察。加载并遵循 [`ios-debugger-agent`](../ios-debugger-agent/SKILL.md)，当可以进行实时串流时，加载 [`ios-simulator-browser`](../ios-simulator-browser/SKILL.md)。
- 在安装了 Android SDK 的 macOS、Linux 或 Windows 上，当 Android 是受影响的界面，或 iOS 工具不可用时，使用一个 Android Emulator。
- 当更改具有平台特定性时，测试对应平台。当两个平台都不可行时，报告缺少的 SDK、模拟器或 dev-client 前置条件，而不要声称已完成验证。

当 Android 是有效的代表性目标时，不要将不可用的 iOS 工具视为阻塞因素。

## 选择最轻量的有效启动路径

- 对于 JavaScript、TypeScript 或仅涉及资源的更改，复用已安装且兼容的开发客户端并启动 Metro。不要仅为了加载新 bundle 而重新构建原生代码。
- 对于原生源代码、原生依赖、entitlement、config plugin 或生成的项目更改，重新构建受影响的平台。
- 仅当确实需要 Expo clean prebuild 时，才使用 `vp run ios:dev` 或 `vp run android:dev`；这两个命令都会重新生成原生项目。
- 如果用户要求不要重新构建原生代码，且没有安装兼容的应用，则在可用时复用现有的兼容 `.app` 或 `.apk` 构件。否则报告缺少 dev client，而不要默默地重新构建。

两个平台上的开发身份均为：

- 应用：`T3 Code Dev`
- Bundle/package identifier：`com.t3tools.t3code.dev`
- URL scheme：`t3code-dev`

Bundle 或 package 的存在只能证明变体正确，不能证明原生兼容性。只有当当前更改没有改变其 Expo SDK、原生依赖、config plugin、entitlement、生成的项目或原生源代码时，才可以复用它。

## 启动一个一次性的 T3 环境

从仓库根目录运行后端命令。使用被忽略的、工作树本地的 `.t3` 目录，或使用主机操作系统的临时目录机制创建一个新目录。明确指定的基础目录会将状态存储在 `<base-dir>/userdata` 中；绝不要让测试指向共享的 `~/.t3` 状态。

在启动后端之前，先创建少量有意义的 Git 项目：

```bash
node apps/server/src/bin.ts project add <git-workspace> \
  --base-dir <base-dir> \
  --title <project-title>
```

在后端启动前运行 `project add`，可使其独占离线数据库访问权限。如果后端已经在运行，请等待其就绪，以便 CLI 通过正在运行的服务器进行分发；切勿在服务器运行期间并发执行离线变更。

仅对一次性使用的投影 fixture 直接执行 SQLite 变更。遵循 `test-t3-app` 的做法，在写入前停止后端。

完成数据填充后，启动无头后端：

```bash
node apps/server/src/bin.ts serve \
  --host 127.0.0.1 \
  --port <server-port> \
  --base-dir <base-dir> \
  --no-browser
```

使用以下客户端来源：

- iOS Simulator：`http://127.0.0.1:<server-port>`
- Android Emulator：`http://10.0.2.2:<server-port>`
- Physical device：将后端绑定到 `0.0.0.0`，并使用主机可访问的局域网来源

输入完整的 `http://` 来源，以明确测试传输协议。裸 IP 地址默认使用 HTTP，而裸主机名默认使用 HTTPS。在同时测试 Web 和移动端时，改为运行 `vp run dev --home-dir <base-dir> --host 127.0.0.1`，不要在同一基础目录上再启动第二个后端。

## 安全地启动或复用 Metro

从 `apps/mobile` 运行 Metro。

1. 检查预定 Metro 端口上的进程及其 `/status` 响应。仅当该进程健康、属于当前 worktree，并且与 `APP_VARIANT=development`、`--dev-client` 及 scheme `t3code-dev` 匹配时，才复用它。
2. 切勿终止其他 worktree 的 Metro。必要时使用空闲的显式端口。
3. 在标准端口上运行 `vp run dev:client`。使用其他端口时，保留完整的开发身份：

   ```bash
   APP_VARIANT=development vp exec expo start \
     --dev-client \
     --scheme t3code-dev \
     --lan \
     --port <metro-port>
   ```

   在 PowerShell 中，先设置 `$env:APP_VARIANT = "development"`，然后运行不带前置赋值的 `vp exec expo start ...` 命令。

4. 为所选设备打开准确的开发客户端 URL，并确认加载的 bundle 属于当前 worktree 和 Metro 端口。

### iOS 启动

使用 `ios-debugger-agent` 选择一个 UDID，并设置以下 XcodeBuildMCP 会话默认值：

- Workspace：`<repo>/apps/mobile/ios/T3CodeDev.xcworkspace`
- Scheme：`T3CodeDev`
- Configuration：`Debug`
- Simulator ID：所选 UDID
- Bundle ID：`com.t3tools.t3code.dev`

使用以下命令检查已安装的客户端：

```bash
xcrun simctl get_app_container <simulator-udid> com.t3tools.t3code.dev app
xcrun simctl openurl <simulator-udid> <printed-dev-client-url>
```

接受 iOS 确认提示，并在开发者菜单遮挡应用时将其关闭。

### Android 启动

从 `adb devices` 中选择一个正在运行的模拟器序列号，并检查已安装的客户端：

```bash
adb -s <emulator-serial> shell pm path com.t3tools.t3code.dev
adb -s <emulator-serial> reverse tcp:<metro-port> tcp:<metro-port>
adb -s <emulator-serial> shell am start -W \
  -a android.intent.action.VIEW \
  -d '<printed-dev-client-url>' \
  com.t3tools.t3code.dev
```

不要启动、停止、擦除或重新配置其他任务所拥有的模拟器。仅跟踪并在之后停止由本测试拥有的进程。

## 每个客户端只配对一次

使用仓库根目录中捆绑的辅助脚本。它会针对正在运行的后端的确切基础目录签发一个新的凭据，使用编码后的查询参数携带该凭据打开现有的 Add Environment 路由，并要求该路由连接一次：

```bash
.agents/skills/test-t3-mobile/scripts/pair-client.sh \
  ios <simulator-udid> <server-port> <base-dir>

.agents/skills/test-t3-mobile/scripts/pair-client.sh \
  android <emulator-serial> <server-port> <base-dir>
```

只运行所选平台对应的命令。该辅助脚本对 iOS 使用 `http://127.0.0.1:<server-port>`，对 Android 使用 `http://10.0.2.2:<server-port>`。只有在测试非开发 URL scheme 时，才传入第五个参数。

该辅助脚本会打开以下已注册的路由：

```text
t3code-dev://connections/new?pairingUrl=<encoded-pairing-url>&autoConnect=1
```

Add Environment 路由负责具体行为：`pairingUrl` 会预填其常规主机和令牌输入框，而 `autoConnect=1` 会在开发构建中提交一次，并在成功后返回 Home。不带 `autoConnect` 时，同一路由只会预填表单，以便手动检查。

不要通过模拟器键盘自动化输入配对主机或令牌。即使宿主 Mac 使用美国输入法源，Xcode 的语义输入器也会通过模拟器当前的键盘状态发送类似 HID 的按键事件，这可能导致大写令牌和标点符号损坏。一次性路由是确定性的配对路径。仅在必要时将可见表单作为备用方案，并粘贴凭据，而不要逐字符输入。

在操作受影响的流程之前，确认预期的种子项目已经出现。

配对凭据属于机密信息，生命周期很短，且只能使用一次。为每个模拟器、仿真器、实体设备或浏览器创建不同的凭据。如果尝试失败，请签发新凭据，而不是重试旧凭据。不要在截图、提交记录或最终回复中暴露令牌。

## 驱动并观察受影响的流程

### iOS

使用 `snapshot_ui` 以及来自 XcodeBuildMCP 的当前元素引用执行点击和输入。在宿主支持时，将同一个 UDID 传递给 `ios-simulator-browser`，这样用户就可以在 T3 Code 中观看。将该串流用作视觉反馈，而不要因为它而切换到脆弱的浏览器坐标操作。

### Android

优先使用当前代理主机提供的语义化 Android 自动化。否则，使用 `adb shell uiautomator dump` 检查当前层级结构，定位稳定的资源 ID、内容描述、文本或边界，并使用范围明确的 `adb shell input` 操作。导航后刷新层级结构。使用 `adb exec-out screencap -p` 捕获最终状态。

Android 不使用 `serve-sim`。如果宿主已经提供兼容浏览器的 Android 镜像，则使用该镜像；否则，返回重点明确的仿真器截图作为证据，而不要在验证期间安装无关的串流基础设施。

## 验证并清理

除非更改明确涉及平台、操作系统版本或屏幕尺寸，否则只在一台具有代表性的设备上操作受影响的流程。完成前：

1. 确认应用已连接到预期的临时环境，而不是仅仅渲染出空的断开连接状态。
2. 捕获相关的最终状态。
3. 从 T3 Code Dev 中移除临时环境。
4. 使用 `adb -s <emulator-serial> reverse --remove tcp:<metro-port>` 移除为本次测试创建的任何 `adb reverse` 规则。
5. 仅停止本次测试启动的 serve-sim、Metro、backend、emulator 和 log 进程。
6. 仅移除为本次测试而明确创建的基础目录和临时 Git 仓库。如果其中包含有用的复现证据，则保留它们。

保持本地验证的范围集中。不要将此工作流变成完整的仓库测试运行。

## 排查可预见的故障

- **出现旧 UI 或旧错误：** 在诊断应用之前，确认 Metro 的 worktree、variant、URL 和端口。
- **完成上述检查后，Metro 仍提供过时或无效的转换结果：** 停止所管理的 Metro 进程，并在标准端口上运行一次 `vp run dev:client:reset`。对于自定义端口，将 `--clear` 添加到上面的完整显式 `expo start` 命令中。
- **环境仍为空：** 确认平台特定的 HTTP origin，使用新 token，并确认项目播种使用了完全相同的基础目录。
- **第二个客户端无法配对：** 配对 token 只能使用一次；请重新签发一个 token。
- **配对表单打开但无法连接：** 确认 deep link 使用现有的 `connections/new` 路由，包含 `autoConnect=1`，并携带新生成的编码后的 `pairingUrl`。
- **配对文本的大小写或标点发生变化：** 不要重试语义化输入。使用 `scripts/pair-client.sh`；模拟器键盘布局和 HID 输入路径对于凭据而言并不可靠。
- **iOS 语义化操作失败：** 设置明确的 XcodeBuildMCP 默认值，并使用 `snapshot_ui` 刷新。
- **Android 无法访问 Metro：** 确认针对确切 Metro 端口的 `adb reverse`，并重新启动 development-client URL。
- **Android 无法访问 backend：** 对于 Android Emulator 使用 `10.0.2.2`，而不是 `127.0.0.1`。