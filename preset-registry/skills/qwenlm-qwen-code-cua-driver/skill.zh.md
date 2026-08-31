---
name: cua-driver
description: Drive a native GUI app (macOS, Windows, Linux) via the Qwen Cua Driver CLI (default) or MCP server; snapshot its accessibility tree, act through snapshot-bound element tokens, native menu paths, exact window geometry, or pixel coordinates, and verify from fresh state. Use when the user asks you to operate, drive, automate, or perform a GUI task in a real application on the host.
version: 0.20.2 # x-release-please-version
metadata:
  openclaw:
    requires:
      bins:
        - qwen-cua-driver
    envVars:
      - name: CUA_DRIVER_EMBEDDED
        required: false
        description: Set to 1 when a macOS host app launches the driver in embedded mode.
      - name: CUA_DRIVER_HOST_BUNDLE_ID
        required: false
        description: Bundle identifier of the macOS host app in embedded mode.
      - name: CUA_DRIVER_PATH
        required: false
        description: Optional path to a qwen-cua-driver binary used by an embedding host.
      - name: CUA_DRIVER_RS_ENABLE_WAYLAND
        required: false
        description: Set to 1 to enable the native Wayland backend.
      - name: CUA_DRIVER_RS_MCP_HTTP_PORT
        required: false
        description: Optional port for the local MCP HTTP endpoint.
      - name: CUA_DRIVER_RS_MCP_HTTP_TOKEN
        required: false
        description: Required host-generated bearer token when the local MCP HTTP endpoint is enabled.
    homepage: https://github.com/QwenLM/qwen-code/tree/main/packages/cua-driver
---
# Qwen Cua 驱动程序

通过 `qwen-cua-driver` 编排跨平台应用自动化。每当用户要求驱动原生应用时，都应遵循此 skill 中的循环，而不是随意调用工具——操作前快照这一不变量不是可选项，跳过它会导致流程悄无声息地失效。

## 平台专属阅读 — 请先阅读此部分

此文件是**跨平台核心**：快照不变量、CLI 与 MCP 的选择、工具表面命名、行为矩阵、规范循环、像素点击契约以及常见故障模式。平台专属内容（禁止列表、辅助功能树实现、启动语义、点击分发）位于同一目录下的配套文件中：

- **macOS** — 阅读 `MACOS.md`（无前台契约、禁止调用 `open`/`osascript`/`cliclick`、AXMenuBar 导航、SkyLight 像素点击分发）。
- **Windows** — 阅读 `WINDOWS.md`（UIA 树与 AX、UWP / ApplicationFrameHost 承载、分层 UIA+PostMessage 点击链、Session 0 隔离、Windows 特有的抢焦点向量）。
- **Linux** — 阅读 `LINUX.md`（通过 AT-SPI + XSendEvent 实现的 X11 后台输入，以及特定合成器的 Wayland 能力）。

跨平台主题也各自有对应文件：

- `BROWSER.md` — 精确的原生窗口绑定、显式浏览器准备、类型化 Chromium/Electron 页面工具、输入信任级别，以及浏览器 Chrome 和不受支持引擎的原生回退方案。
- `RECORDING.md` — 会话录制 + `replay_trajectory`。

根据主机环境使用相应的组合。如有疑问，运行
`qwen-cua-driver doctor` — 它会报告平台和正确的入口点。

## 从最窄的语义路径开始

在打开或操作应用程序之前，明确所需的后置条件，并使用下面第一个适用的路径。在停止或继续之前，在同一领域验证结果：

0. **调用方提供的、用于非 GUI 结果的无头/后台操作。**
   优先使用精确的应用 API/SDK、服务或数据库客户端、CLI 或文件系统操作，而不是模拟用户行为。这包括适合批处理的文件移动、重命名、复制、目录创建、归档提取、数据转换和进程检查。读回生成的语义状态；仅凭零退出状态不能证明操作成功。
1. **用于应用程序或窗口结果的类型化 Cua 操作。** 对于精确几何尺寸，使用 `set_window_frame`；对于已知的原生应用程序菜单路径，使用 `invoke_menu`；对于受支持的页面内容，使用类型化浏览器工具；对于剪贴板状态，使用剪贴板工具。分别通过 `list_windows`、`get_browser_state` 或 `clipboard_read` 进行验证。
2. **后台辅助功能操作。** 使用新鲜的 AX/UIA/AT-SPI 目标。
3. **后台像素操作。** 使用来自同一状态快照的像素。
4. **前台传送。** 仅重试证据表明无法在后台执行的操作。
5. **桌面回退。** 仅为该次调用选择一个精确的桌面目标。后续调用可以在同一会话中返回到精确的窗口目标。

当结果存在于应用程序的 UI 或窗口状态中，或用户明确要求操作该 GUI 时，请使用 Cua Driver。一旦任务跨越了这一边界，不要使用会修改应用 UI 的 shell 脚本来替代 Cua 有针对性且经过验证的操作。shell 是调用代理的能力，而不是 Cua Driver MCP 服务器的能力；仅使用 MCP 的客户端不得假定存在 shell。

### 文件系统结果与 GUI 备用方案

当请求的结果是文件系统变更，且调用方具有无头文件系统或命令能力时，应将其保留在第 0 层。枚举确切的源集合，在进行任何更改之前确定目标冲突策略，执行一次可安全批量处理的操作，然后分别读回源和目标清单进行核验。不要仅仅为了模拟调用方可以直接执行并验证的移动、复制或重命名操作而打开文件管理器。

如果调用方没有此类能力，则使用文件管理器作为 GUI 备用方案，并保持每项声明的范围明确：

1. 输入行内重命名并设置其值后，使用平台的确认键提交，然后获取新的快照。行内编辑器中的值读回只能证明编辑器发生了更改；不能证明文件系统重命名已经提交。
2. 对于多选，请使用平台修饰键（macOS 上为 `cmd`，Windows/Linux 上为 `ctrl`）。在 macOS 和 Windows 上，使用 `delivery_mode:"foreground"` 发出带修饰键的点击，以便目标观察到实际的修饰键状态；被拒绝的后台尝试是升级信号，而不是应当信任或重复的失败操作。为下一步操作重新获取快照。只有在每个预期项目都已选中且之前的选择仍被保留时，才能继续。
3. 在跨窗口拖放或粘贴之后，验证目标包含完整的预期集合，并确认源反映了复制与移动的语义。已传递的拖动、按键或菜单操作并不能证明文件操作已经完成。
4. 如果目标冲突呈现出无法识别的策略或含义不明确的部分结果，请停止该 GUI 路径并报告尚未解决的状态，而不是盲目重试。

### 剪贴板结果与 GUI 备用方案

当请求的后置条件是系统剪贴板中的精确值，而不是实际执行选择并复制这一手势时，应保持操作的语义性。从最窄的类型化来源读取值，调用 `clipboard_write`，然后通过 `clipboard_read` 证明实际的剪贴板状态。对于浏览器内容，这意味着使用 `get_browser_state` 读取页面并写入准确观察到的文本；无需先点击被动的页面文本引用。

仅当用户明确要求执行该手势、来源无法以语义方式公开该值，或直接剪贴板工具不可用时，才使用视觉选择后跟随平台复制快捷键。将其视为 GUI 备用方案：在操作前重新获取快照，在应用程序提供所选范围时验证该范围，并且仅对无法在后台完成的传递步骤进行升级。

## 无前台原则（窗口阶段）

在面向窗口的后台操作期间，**用户当前位于最前台的应用绝不能发生变化。**每个平台
都有自己的禁止命令列表：

- macOS：任何 `open` 调用、任何会改变 GUI
  状态的 `osascript`、`cliclick`、针对其他应用窗口的
  `cghidEventTap` 写入操作。完整列表见 `MACOS.md`。
- Windows：任何会在目标上触发 `ShowWindow`/`SetForegroundWindow`
  的 `Start-Process`、`WScript.Shell.AppActivate`、附加到
  前台线程以转发输入的操作。完整列表见 `WINDOWS.md`。

如果你准备使用一个含有“activate”“foreground”、
“raise”或“make key”的命令，请停下来，将其转换为使用
cua-driver 工具来实现相同意图，同时避免窃取焦点。

桌面目标是每次调用时明确选择操作可见桌面的目标，因此会使用前台/系统输入。只有在尝试并验证过更窄范围的窗口阶梯后，才能使用它。权限策略仍必须允许访问显示资源。绝不要根据失败的操作或公开的会话标签推断桌面权限。

## GUI 传输默认设置——优先使用 cua-driver，而不是 GUI shell 封装

**默认传输方式是 `qwen-cua-driver` CLI**——通过 `Bash` shell 调用
`qwen-cua-driver <tool-name> '<JSON-args>'`。只有在用户明确要求使用 MCP
工具时，才使用（前缀为
`mcp__cua-driver__*` 的）MCP 工具。
CLI 更优先，因为它能立即使用重新构建的版本，更容易诊断失败，而且没有每个工具的 schema 加载开销。

本 skill 中对 `click(...)`、`get_window_state(...)` 等的每次引用，都表示
`qwen-cua-driver click '{...}'`——只有在请求使用 MCP 时，才转换为 MCP 形式。

### Claude Code computer-use 兼容模式

对于普通的 Claude Code 使用，保持使用上面的默认 CLI 或 `qwen-cua-driver` MCP
服务器路径。如果用户明确希望使用 Claude Code 的
vision/computer-use 风格流程，可以注册：

```bash
qwen-cua-driver mcp-config --client claude   # then paste + run the printed line
```

观察：Claude Code 的 vision 流程似乎将截图 MCP 工具视为图像定位锚点。此兼容模式保留常规的 CuaDriver 工具，仅更改 `screenshot`。兼容模式下的 `screenshot` 需要
`pid` 和 `window_id`，只捕获该目标窗口，并返回窗口本地像素
坐标系。请从 `launch_app` 或 `list_windows` 开始，然后调用
`screenshot({pid, window_id})`；不要假设使用桌面坐标或全屏捕获。

对于此 Claude Code vision/computer-use 风格路径，请使用 MCP。不要
将 shell 调用 `qwen-cua-driver screenshot` 作为替代方案：CLI 截图仍可作为 CuaDriver 调用正常工作，但不会暴露
Claude Code 似乎用作图像定位提示的
`mcp__cua-computer-use__screenshot` 工具名称。

## 从 shell 使用 cua-driver

工具名称使用 `snake_case`，管理子命令使用
`kebab-case`——不存在歧义。工具调用形式为 `qwen-cua-driver
<tool-name> '<JSON-args>'`。管理子命令：

- `qwen-cua-driver serve` — 当短生命周期客户端必须共享运行时状态或平台身份时，启动一个显式的持久服务。Bare MCP 在 Windows/Linux 上直接管理其运行时，在 macOS 上使用签名应用服务；`qwen-cua-driver mcp --socket <endpoint>` 可显式选择服务。
  一次性 CLI 工具调用仍使用服务路径。macOS 用户：请参阅
  `MACOS.md`，了解经由 LaunchServices 路由的启动形式。
- `qwen-cua-driver stop` / `status`
- `qwen-cua-driver list-tools`、`describe <tool>`
- `qwen-cua-driver recording start|stop|status` — 请参阅 `RECORDING.md`
- `qwen-cua-driver check-update [--json] [--no-cache]` — 只读的“是否有更新版本可用？”探测。其负载与 `check_for_update` MCP 工具相同；可配合 `qwen-cua-driver update --apply` 进行安装。

规范的多步骤工作流（示例形式——各平台特定的启动惯用方式请参阅各操作系统的配套文件）：

```bash
qwen-cua-driver serve
qwen-cua-driver launch_app '{"bundle_id":"..."}'
# → {pid: 844, windows: [{window_id: 10725, ...}]}
qwen-cua-driver get_window_state '{"pid":844,"window_id":10725}'
# Use the returned structuredContent.elements[].element_token:
qwen-cua-driver click '{"pid":844,"element_token":"s0000002a:14"}'
qwen-cua-driver verify_state '{"pid":844,"window_id":10725,"expect":[{"element":{"selector":{"label_contains":"Saved"},"exists":true}}]}'
qwen-cua-driver stop
```

对于 Chromium 页面内容，保持相同的原生窗口选择，但切换到浏览器能力循环：使用一个生命周期会话，通过 `get_browser_state` 绑定 `(pid, window_id)`，对返回的标签页创建快照，然后使用 `browser_click`、`browser_type` 或 `browser_navigate`。在使用此路径前，请阅读 `BROWSER.md`。浏览器目标 id、标签页 id 和引用均限定于会话范围，过时的引用必须通过新快照替换。

## Agent 光标叠加层

用于演示和屏幕录制的可视化光标叠加层。它会在首次执行包含光标的操作时初始化，包括 `move_cursor`，并跟随传输层的隐式或命名生命周期会话。使用 `set_agent_cursor_enabled` 切换命名光标的显示状态，以隐藏或重新显示它。内置的
`cua.default` 主题使用会话颜色的指针，并在同一会话颜色中叠加更大、
光标形状的光晕。光晕会在整个轮廓周围渐变为透明。操作标记使用相同的
会话颜色中心和白色描边效果，并配有更紧密、更柔和的光晕。这种搭配可在各种
背景下保持对比度。它为闲置、观察、点击、拖动、滚动、文本、按键、导航、应用、
传输、录制和系统活动提供动画。运动调节参数：
`set_agent_cursor_motion` 接受 `start_handle`、
`end_handle`、`arc_size`、`arc_flow`、`spring` 中的任意子集——可在运行时调节，
并持久化到配置中。

交付和目标上下文会以主机拥有的标签形式显示在会话徽章中。主题仅控制十二种操作动画。
会话名称和上下文标签会独立淡出，因此活动工具可以显示其执行上下文，而不会暴露已经淡出的会话名称。

**按会话划分的光标。** 每个 MCP 会话都会自动拥有自己的光标，该光标以会话的 id 为键（代理会为每个 MCP 连接生成一个会话 id，而守护进程会将光标、配置覆盖项和录制范围限定在该会话内）。CLI 和 SDK 契约会显式接收声明的 `session`。光标主题控制不再接受 `cursor_id` 或旧版的形状/颜色/图像字段。输入传递工具仍可使用 `cursor_id` 来命名虚拟指针；它绝不会用于选择图像。默认光标为 Cua 蓝色，而每个命名会话都会从内置调色板中获得一个稳定的填充色。只能通过 `set_agent_cursor_theme` 选择预安装的主题；主题源路径和内联动画数据绝不会通过代理工具接受。请使用受信任的本地 `qwen-cua-driver cursor-theme` 工作流来验证、编译、预览、安装、列出或移除自定义主题。

**可见性注意事项（AX 运行）。** 在纯无障碍操作运行中（通过 `element_index` 点击），第一次操作会**将光标播种到屏幕上目标附近的一小段距离处，并播放短暂的滑行 + 脉冲动画**——而不是让已经位于屏幕上的光标从之前的位置沿长贝塞尔曲线移动。这个效果很细微，在录制中很容易错过。如果你希望演示或屏幕录制中出现清晰的_滑行_光标，请先执行像素点击（`click({pid,x,y})`）或先调用 `move_cursor` 将光标显示在屏幕上；后续 AX 操作随后就会正常沿完整路径滑行。

像素 `click` 已经会让叠加层滑行。不要在同一目标上调用 `click` 前立即调用 `move_cursor`；这样会播放两次滑行动画。请使用 `move_cursor` 在不点击的情况下放置叠加层，或者按照上述方式，在执行 AX 操作前进行一次性播种。

需要合适的 UI 事件循环。服务运行时和私有工作线程运行时都会提供该事件循环。在 macOS 上，如果使用同进程 SDK 运行时，或使用不带经认证主线程适配器的 `qwen-cua-driver mcp --direct`，叠加层操作会返回结构化的 `facility_unavailable` 结果；不要将其视为成功移动了光标。一次性 CLI 适配器本身不拥有叠加层。

## 核心不变量——每次操作前进行快照，并在之后进行验证

**每次操作都必须针对会话的有效范围，先进行观察，再执行操作，最后完成验证。** 对窗口执行操作前，使用 `get_window_state(pid, window_id)`（或在桌面范围内使用 `get_desktop_state(session)`），然后使用 `verify_state` 验证一个可表达的窗口范围后置条件。在有效的桌面范围内，`verify_state` 会有意返回 `window_scope_disabled`；请使用新获取的 `get_desktop_state` 结果以及代理自行完成的视觉/语义读取来进行验证。

- **之前**——操作前快照会解析你将要使用的 `element_index`。之前轮次中的索引已经过期；服务器会在每次快照时替换元素索引映射，该映射以 `(pid, window_id)` 为键。第 N 轮中的索引无法在第 N+1 轮解析，同一个应用中窗口 A 的索引也无法针对窗口 B 解析。跳过此步骤会导致基于元素索引的操作失败，并返回 `No cached AX state`。
- **之后**——`verify_state(pid, window_id, expect)` 会检查有界且确定性的后置条件。结果为 `satisfied`、`unsatisfied` 或 `unknown`；`unknown` 绝不表示成功。当结果还需要进行视觉读取时，请设置 `include_screenshot:true`。驱动程序会返回最终图像，但不会对其进行解释。多模态代理工具负责读取该图像，并决定是停止、重试还是升级处理。

`unknown_reason` 用于区分无效/不受支持的谓词、不受信任的网页内容、匹配结果不明确、目标缺失、观察结果不可用，以及 `stability_unproven`。未针对所请求的连续样本数进行观察的正向最终样本，其状态是 `stability_unproven`，而不是成功。
元素不存在的判断是保守的：当可访问性投影无法证明其搜索域是穷尽的时，不存在仍保持为 `unknown`。

不要让驱动程序臆测任务含义或自动重试操作。对于无法用 `verify_state` 表达的后置条件，应获取全新的状态快照，并让代理显式判断树和/或图像。像素点击和桌面操作同样适用。

### 读取操作事实时不要将其与任务成功混淆

成功的操作会返回 `effect` 和 `route`，以及可选的类型化 `delivery`、`evidence` 和 `escalation`。这些字段描述的是执行器；它们并不表示用户的任务已完成。

- `confirmed` 表示驱动程序已获得该操作可发布的值回读结果或窗口变化证据。
- `partial` 表示仅交付了 `delivery.delivered_count`。
- `unverifiable` 表示驱动程序无法证明该效果。
- `suspected_noop` 表示现有证据表明没有产生有用变化。
- `refused` 表示所选路由有意未进行交付。

路由词汇经过特意设计，可跨平台使用：
`accessibility`、`synthetic_events`、`global_input`、`dom` 和
`trusted_input`。不要根据私有的操作系统传输名称进行分支处理。

可选的升级项是 harness 指令，绝不是自动重试：

- `pixel`：刷新视觉状态并选择精确的像素目标；
- `foreground`：如果授权栈允许使用该工具和精确目标，则显式选择前台交付；
- `page`：将原生窗口绑定到受支持的浏览器页面路由；
- `session`：来自旧版 capture-scope daemon 的传统兼容性信号；
  当前调用方应在具体操作中改为选择桌面目标。

根据封闭的原因词汇进行分支处理：
`route_unavailable`、`delivery_failed`、`effect_unconfirmed`、
`suspected_noop` 和 `permission_required`。

每次操作后，继续使用 `verify_state` 或新的状态快照来判断实际任务后置条件。多模态 harness 负责视觉读取，以及决定停止、重试还是沿阶梯继续推进。

## 在每次操作中选择目标

一个会话负责生命周期、光标、录制、清理和遥测状态。它不会存储当前的捕获模态。在每次操作中选择一个精确目标：

```jsonc
{"target":{"kind":"window","pid":844,"window_id":10725}}
{"target":{"kind":"desktop","display_id":"primary"}}
```

窗口目标使用窗口局部坐标以及后台/前台交付阶梯。桌面目标使用屏幕坐标和前台交付。桌面操作不会禁用后续调用中的窗口工具。

`start_session` 是可选的。对于多次调用的运行，建议使用简短的公共
`session` 标签，并在每个接受该标签的调用中传入相同标签。该标签的作用域为单次调用：如果后续调用省略它，则该调用使用已认证传输的隐式会话。在同一传输上未命名的调用会复用该隐式身份。默认空闲 TTL 为五分钟。在执行操作前调用 `start_session(session)`，可为运行命名或配置运行，也可重新激活一个已结束的名称。

不要使用 `config set capture_scope` 或 `set_config`；该键已废弃，磁盘上的过期值会被忽略。`start_session.capture_scope`、`get_session_state` 和 `escalate_session` 已弃用，仅作为兼容性接口保留。不存在 `deescalate_session`。诸如 `_session_id` 之类的保留字段属于传输元数据，无法创建授权。

## 将授权与会话分离

受信任的主机在启动时选择一个权限配置文件。`standard` 保留正常的配置文件行为和剩余的审批要求，`bounded` 要求经过审核的能力清单，且没有运行时审批路径，`unrestricted` 则在明确接受风险后绕过 Cua 审批提示。在每种配置文件中，硬性不变量以及托管策略和用户策略仍然具有约束力。

可选的能力清单是 `standard` 和 `unrestricted` 中默认拒绝的上限；`bounded` 则要求提供能力清单。它可以从所选配置文件中移除工具或类型化资源，但不能授予其他授权层所拒绝的工具、资源或审批绕过权限。只有在工具及每个经适配器证明的资源都处于清单范围内之后，才会考虑审批。

请同时使用规范的启动参数对：

```bash
qwen-cua-driver mcp \
  --permission-mode standard \
  --capability-manifest ./capabilities.yaml \
  --approve-capability-manifest
```

能力清单 v3 省略文件级别的 `mode` 和 `ask.tools`。其
`allow.tools` 列表非空。生命周期字段在 `standard` 和 `unrestricted` 中是可选的；`bounded` 则要求同时设置 `expires_after` 和 `idle_timeout`。较旧的 `--session-policy` 名称仍作为兼容性别名保留，但不得用于新配置。

启动、结束、命名、重新连接会话，或省略会话，都不会改变权限授权。公共会话标签是生命周期元数据，绝不是授权、调用方身份或持有者凭证。

### 为什么现在由调用方负责选择窗口

过去，`get_app_state` 会通过最大面积启发式为你选择窗口；对于带有大型屏幕外实用工具面板的应用，这会返回错误的界面。具体复现方式如下：IINA 的 OpenSubtitles 辅助窗口（600×432，位于屏幕外）的面积超过了可见的 320×240 播放器窗口，因此 `get_app_state(pid)` 会截取不可见面板的屏幕截图，点击也会无提示地落在该面板上。新的 `get_window_state(pid, window_id)` 要求调用方明确指定窗口——驱动程序会验证该窗口属于给定的 pid 且位于当前 Space/桌面上，然后精确截取所请求的内容。可通过 `list_windows` 枚举候选窗口，或者读取 `launch_app` 已返回的 `windows` 数组。

## 行为矩阵

### 感知与模式无关——`get_window_state` 返回两者

`get_window_state(pid, window_id)` **默认同时返回无障碍树和屏幕截图。**不存在可供选择的捕获模式，也无需进行任何配置——你应结合无障碍树和屏幕截图进行定位，并将二者相互交叉核对。这一点很重要，因为无障碍树在某些界面上会**撒谎**：

- **Electron** 会针对 AX
  shim 回显确认 `set_value` / `type_text`，但渲染后的文本视图从未改变。
- **Catalyst**（iOSAppOnMac）会暴露空值或占位符 `AXValue`。
- **虚拟化 / 位于视口外的列表行**会报告错误的 frame（高度为
  `h:1`、位于屏幕外的 origin），即使这些行实际上并未完成布局。

默认会提供 grounding 截图，因此当树看起来不对时，你会在**同一响应中**查看像素——无需二次捕获，也无需切换模式。

> **性能选择退出 — `include_screenshot`。** `include_screenshot`
> （布尔值，默认值为 `true`）是唯一的控制项，它是一个**性能**控制项，
> 而不是模态选择项。默认同时返回两者（grounding 优先）。传入
> `include_screenshot:false` 可跳过屏幕抓取，仅获取树——当你只是要在
> **对元素执行 ax 操作前重新建立索引**、不需要根据像素重新进行 grounding 时，这是更廉价的路径。
> `ax`/`px` 的决定仍然在操作时进行，而不是在这里。

> **`capture_mode` 已弃用且会被忽略。** `get_window_state` 仍然会接受它，
> 因此旧调用方不会报错，但它**没有任何作用**——无论你传入什么（`ax`、`vision`、
> `som` 或其他值），树和截图都会一并返回。不再存在
> `ax`/`vision`/`som` 捕获选项。请完全不要再使用 "vision"
> 一词来表示感知。（名为 `screenshot` 的工具是独立的——返回原始 PNG，
> 不执行 AX 遍历——与此无关。）

### 在 ACTION 时选择模态 — `ax` 与 `px`

你不选择捕获模式；你选择在操作调用中**如何寻址目标**，
而这个选择会决定所使用的层级：

- **元素 ax 操作** — 传入 `element_token`（首选），或传入同一响应中的精确
  `element_index` + `snapshot_id` 对。
  通过**可访问性层级**分发：AXPress（macOS）/ UIA Invoke（Windows）/ AT-SPI `doAction`（Linux）。
  可在后台执行，不受 z-order 影响，并且是唯一可由**驱动验证**的层级。
- **元素 px 操作** — 传入 `x`、`y`。通过**像素层级**分发，直接读取
  `get_window_state` 响应中已有截图里的坐标。尽力而为；由调用方确认效果。

`ax`↔`element_index`，`px`↔像素 `x,y`。我们弃用了 "vision" 一词来表示
_分发_路径——因为它混淆了感知与分发。
感知始终是两者兼有；分发则是 `ax` 或 `px`。

**键盘系列也同时支持这两种形式。** `type_text`、`press_key`
和 `hotkey` 接受绑定快照的元素目标（ax）**或** `x,y`（px），两者互斥，
与指针工具相同。px 形式会先在 `(x,y)` 处执行**像素点击**，以建立真实的渲染器焦点，
然后向现在获得焦点的元素传送按键（它会复用 `click` 的坐标转换和
`delivery_mode`）。因此，例如可以使用
`type_text({pid, window_id, x, y, text})`，通过一次调用为 AX 路径无法触及的
Chromium/Electron 输入框先建立焦点再输入；也可以使用
`hotkey({pid, x, y, keys:["cmd","v"]})` 将内容粘贴到指定字段。

**输入默认值（阶梯）。** 直接使用 `element_token`（ax）调用 `type_text`——
它会直接定位字段，无需预先点击。在 Electron/Catalyst 上，AX 层会回显写入操作，
却不会将其渲染出来，因此驱动会在那里返回 `effect:"unverifiable"`，并带有
`escalation.target:"pixel"`（绝不会错误地返回 `effect:"confirmed"`）——
请遵循这一升级路径，并核对响应中的截图（唯一的事实依据）。升级到 px 形式——
`type_text({pid, window_id, x, y, text})`——它会通过像素点击建立焦点，然后输入。
**如果目标控件处于关闭状态**（例如搜索按钮、折叠字段），请先通过 AX-press 将其打开
（AX 操作可以在后台执行）：px 聚焦点击无法可靠地同时打开并聚焦关闭的控件，
因此文本会泄漏到当前已经获得焦点的其他控件中。
只有在仍然丢失输入时，才升级到 `delivery_mode:"foreground"`。

**`set_value` 按设计仅限 AX** —— 当意图是替换控件的完整值时使用它：下拉框、复选框、滑块、步进器，以及 Finder 的内联重命名编辑器等原生文本字段。当意图是在当前选区或光标处插入文本时，使用 `type_text`。它对应的像素操作是在控件上执行 `click`/`drag`，而不是“在某个像素处设置值”。因此：插入文本 → `type_text`（ax+px）；替换已呈现的原生值 → `set_value`；通过像素操作控件 → `click`/`drag`。

**操作响应携带已闭合的操作事实**

使用上文“读取操作事实时不要将其与任务成功混淆”中的 `effect`、`route`、可选的 `delivery`、`evidence` 和 `escalation` 规则。旧的 `verified`、`path`、坐标、scope 以及 `escalation.recommended` 响应字段已不再存在。
完整的 wire contract 和 0.14 迁移说明位于
`../../../docs/action-result-contract.md`。

一次成功的无障碍值写入，仍可能在提供方仅于操作调用展开后才发布新值时返回
`effect:"unverifiable"`。在重试前获取新的快照；立即重试可能导致文本重复。只有当某个网页界面的无障碍层回显了写入，但无法证明渲染器已观察到该写入时，才会使用显式的像素升级。

当 AX 树为空时，`get_window_state` 本身（例如 Electron/Chromium/canvas 等非 AX 界面）会返回 `degraded: true`
以及针对观测的升级提示——通常会指向像素（你仍然拥有同一次调用返回的截图，可用它点击空白处）。

**操作升级的平台差异。** 在 **Wayland** 上，未聚焦的窗口无法在后台进行像素定位（libei →
`background_unavailable`），因此操作目标是
**`foreground`，而不是 `pixel`**。macOS、X11 以及大多数 Windows 界面
可以在后台进行像素定位，因此目标为 `pixel`。参见
`LINUX.md` / `WINDOWS.md`。

## 先验证再升级阶梯（算法）

每次快照都会同时提供树和截图，因此验证绝不意味着“去获取一张截图”——这意味着将树与
你已经拥有的像素进行交叉核对，并且只有在出现真实信号时才更改
_dispatch rung_。逐级执行：

```
# Routes 0–1 — resolve non-GUI, exact geometry, and supported page outcomes first
# Use a caller-provided semantic operation for a non-GUI outcome, then read it back.
# For exact window geometry: set_window_frame(...), then list_windows(...) readback.
# For a known native menu command: invoke_menu(pid, window_id, path), then verify its effect.
# For supported page content: get_browser_state(...), typed browser action, refresh refs.
# Continue below only when the postcondition actually requires native UI interaction.

# Route 2 — element AX/UIA/AT-SPI action, backgrounded
get_window_state(pid, window_id)            # tree + screenshot, both, always
resp = click(pid, element_token)            # or type_text / set_value / press_key
check = verify_state(                       # bounded structured read-back
    pid, window_id,
    expect=[...],
    include_screenshot=true                 # optional evidence for multimodal harness
)

if check.status == "satisfied":
    done                                    # driver-verified

if check.status == "unknown" and check has an image:
    harness reads the image                  # model-owned visual interpretation
    if visual outcome is satisfied: done

# escalate only on a real signal
if resp.effect == "suspected_noop"
   or resp.escalation.target == "pixel"
   or get_window_state.degraded            # empty tree → non-AX surface
   or check.status != "satisfied"
   or the tree looks wrong vs the screenshot:   # e.g. an h:1 / off-viewport row

    # Route 3 — element px action off the SAME screenshot
    pick the target pixel from the screenshot already in the response
    click(pid, x, y)                        # background pixel — still no foreground
    verify_state(..., include_screenshot=true)
    if it landed: done

# Route 4 — background delivery was dropped (insert/click never arrived)
if resp.escalation.target == "foreground"
   or the px action still did nothing:
    re-call the same action with delivery_mode:"foreground"
    # on Wayland this is the ONLY escalation — px-bg can't target an
    # unfocused window there; see LINUX.md
    verify again

# Route 5 — per-call desktop fallback
# Reach this only after semantic, AX, window-pixel, and foreground-window
# delivery have all been exhausted and verified ineffective.
get_desktop_state()                         # full primary display
desktop_action(target={kind:"desktop", display_id:"primary"}, ...)
get_desktop_state()                         # verify in the same coordinate frame
```

需要牢记的两个要点：(1) 在 canvas / web /
Catalyst / virtualized surface 上，AX tree **会说谎**，因此，一个未发生变化或虚假的树，伴随
`suspected_noop`/`degraded` — 或者树与
screenshot 只是存在不一致 — 都是在提示你，应当基于已有的
screenshot 执行**元素像素操作**；(2) `px` 是切换到像素寻址路径的一个_有意识的_开关，并不是另一种 capture。

**Window state → 可用操作**

| state                      | `get_window_state`                                                                             | element-index click (AX/UIA) | `press_key` commit                                    | pixel click                    |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------- | ------------------------------ |
| frontmost                  | ✅                                                                                             | ✅                           | ✅                                                    | ✅                             |
| backgrounded / visible     | ✅                                                                                             | ✅                           | ✅                                                    | ✅                             |
| **minimized**              | ✅                                                                                             | ✅ (actions fire in place)   | ❌ silent no-op — use `set_value` or click equivalent | ❌ no on-screen bounds         |
| hidden                     | ✅                                                                                             | ✅                           | depends                                               | ❌                             |
| on another desktop / Space | ⚠️ tree may be stripped on some apps — response carries `off_space: true` so you can detect it | ✅                           | ✅                                                    | ❌ not in current-desktop list |

**关键单元格 — minimized + keyboard commit。** 击键会到达应用，但在最小化窗口上，无障碍焦点不会传播到渲染器焦点。按优先顺序排列的解决方法：
使用 `set_value` 直接写入字段的完整值，或者
使用 element-index-click 点击具有等效提交功能的按钮（Go、Submit、
checkbox）。只有在最后不得已时，才告诉用户需要取消最小化窗口。

## 规范循环

```
# for multi-call work, repeat the same session label on every call that accepts it
launch_app(target, session)
  → pick window_id from the returned `windows` array
    (or call list_windows(pid) separately)
  → get_window_state(pid, window_id)
    → [act]  # pass target={kind:"window", pid, window_id}
  → verify_state(pid, window_id, expect)  # structured check; optional image
end_session(session?)             # optional explicit cleanup
```

对于屏幕绝对坐标操作，将窗口部分替换为
`get_desktop_state() → action(target={kind:"desktop",display_id:"primary"}, ...)
→ get_desktop_state()`。桌面操作使用该精确全显示屏图像中的坐标。

`launch_app` 现在会在 pid 旁返回一个 `windows` 数组，因此常见情况可以简化为两次调用（`launch_app` → `get_window_state`），无需单独经过 `list_windows`。

**对于多次调用的工作，优先使用命名会话。** 选择一个简短的标签（例如 `session: "research-1"`），并在每次接受该参数的调用中传入相同的值。只传入一次并不会持久生效：后续省略 `session` 的调用会使用传输层的隐式会话。当你需要在执行操作前为运行命名或配置运行，或需要在 `end_session` 后恢复某个名称时，请调用 `start_session(session)`。对于一次性工作或有意不命名的工作，可以省略该参数，传输层仍会提供一个私有的生命周期标识和可见的代理光标。公开标签便于检查和清理，但它不是凭证。在适用时使用 `end_session` 结束；关闭传输连接或五分钟的空闲 TTL 也会回收该会话。

**并发运行/子代理：** 每个传输连接都有自己的隐式会话。此外，`launch_app` 是幂等的——两次运行启动同一个应用时会获得**同一个**实例（对于 Calculator 这类单实例应用，则会获得同一个窗口），因此它们会相互干扰。让每次运行使用**自己的连接**（以独立拥有生命周期/光标），并且向 `launch_app` 传入 `creates_new_application_instance: true`（→ 自己的窗口）。元素缓存以 `(pid, window_id)` 为键，光标则属于私有生命周期会话，因此不同实例和传输连接可以让各次运行保持隔离。

**并行性与顺序。** 不同会话提供不同的_光标_，而不是不同的_连接_。共享一个 `qwen-cua-driver mcp`（stdio）连接的子代理，其工具调用会由传输层**串行化**——它们会轮流执行，而不是并行运行。这不是正确性问题（会话 + 窗口隔离意味着它们不会相互冲突），只是吞吐量问题。若要实现真正的并行代理，请让每个代理使用**自己的连接**：使用不同的 `qwen-cua-driver mcp` 进程，或让每个代理的 MCP 客户端指向守护进程的 HTTP 端点。设置 `CUA_DRIVER_RS_MCP_HTTP_PORT` 和由主机生成的、至少 32 个字符的 `CUA_DRIVER_RS_MCP_HTTP_TOKEN`，然后向 `POST http://127.0.0.1:<port>/mcp` 发送 `Authorization: Bearer <token>`。守护进程会并发提供连接；每个连接内的顺序保证每个代理自身的操作序列（例如 `3 → + → 1 → =`）正确。

`list_apps` 用于应用级发现（回答“安装了/正在运行/位于最前台的是什么？”），而不是核心操作循环的一部分。在循环中跳过它。对于**窗口级**问题——“这个应用是否有可见窗口？”、“这个窗口位于哪个桌面？”、“这个 pid 的哪些窗口是主窗口？”——请改为调用 `list_windows`；应用记录不会携带窗口状态，这是有意为之。在常见的单窗口情况下，可以完全跳过 `list_windows`，直接读取 `launch_app` 已返回的 `windows` 数组。

### 使用快照并通过绑定到快照的目标执行操作

使用 `launch_app` 的 `windows` 数组中的 `window_id` 调用
`get_window_state({pid, window_id})`（或者在与长生命周期进程交互时，使用新获取的
`list_windows({pid})`）。默认情况下，它会**同时返回树和截图**，因此你可以通过一次调用，既使用
`element_token` 分派操作，又基于像素进行定位——无需更改配置，也无需切换模式。如果你只是在执行元素操作之前重新建立索引，并不需要最新像素，可以传入
`include_screenshot:false` 来跳过截图（这是一个性能调节项，而不是模态选择）。

响应包含：

- `tree_markdown` — 每个可操作元素都会标记为 `[N]`；具有相同 `element_index` 的结构化行中包含其不透明的
  `element_token`。树可能非常庞大（Finder 约有 1600 个元素，约 190 KB）；当其超出令牌限制时，MCP
  harness 会将其保存到文件并返回路径。使用 `Bash` +
  `jq -r '.tree_markdown'` + `grep` 提取所需的部分。
- `effect` / `escalation` / `degraded` — 验证后升级
  信号（参见上文的行为矩阵）：`degraded: true` 表示返回的树为空（非 AX 界面），因此你应当在同一响应中根据截图，通过
  `px` 执行操作。
- `screenshot_file_path` — 当截图被写入磁盘而不是内联时存在（你传入了
  `screenshot_out_file`，或使用了节省上下文的 CLI 路径）；否则帧会以内联形式返回。
- `screenshot_width` / `_height` / `_scale_factor` — 所捕获图像的尺寸。只要执行了截图就会存在（即除非你传入了 `include_screenshot:false`）。

**获取截图文件（CLI 和受上下文限制的代理）：**

```bash
# 写入文件 — stdout 保持可读（仅包含 AX/UIA 树 / 摘要，不包含 base64）
qwen-cua-driver get_window_state '{"pid":N,"window_id":W,"screenshot_out_file":"/tmp/shot.jpg"}'

# CLI --screenshot-out-file 标志等价于此用法
qwen-cua-driver get_window_state '{"pid":N,"window_id":W}' --screenshot-out-file /tmp/shot.jpg
```

通过 CLI 或从上下文窗口无法容纳约 31 KB 内联 base64 的代理调用 `get_window_state` 时，传入
`screenshot_out_file`（例如使用带有本地 Ollama 模型的 OpenCode）。设置此参数后，MCP 图像内容块会从响应中省略——模型只会收到树和
`screenshot_file_path`，随后从磁盘读取图像。

**树和截图是互补的，而非冗余的——并且它们来自_同一次调用_。** 两者各自都携带另一者无法提供的信号，这正是你需要交叉核对它们的原因：

- **树**告诉你_哪些元素可点击_——角色、标签、绑定到快照的元素句柄、所声明的操作、父子
  结构。这是执行**元素操作**的事实依据。
- **截图**告诉你_应该选择哪一个_——树中通常会有许多标签相似或为空的按钮（“Delete”“OK”、标有匿名 UUID 的按钮、重复的静态文本），视觉上下文可以帮助消除歧义。截图中可见的标题、颜色和布局关系往往不会出现在树中（尤其是在
  Chromium / Electron / Web 内容中），而且截图还能帮助你发现树在_撒谎_（`h:1` / 位于视口外的行、Catalyst 空值）。

默认通过 `element_token` 进行调度（即 **element ax action**）——
这是可验证、可后台执行的路径。当树无法消除歧义时
（标签重复或为空）、树为空时（`degraded` — 非 AX
表面）、某个操作返回 `suspected_noop`，或树与像素不一致时，
执行 **element px action**
（基于同一张截图的 `x,y`）。切勿重新捕获以进行切换——截图
已经存在；你只需改变 _寻址_ 目标的方式。

只有当目标是树中不存在的画布 /
视频 / WebGL / 自定义绘制表面时，才使用像素坐标
（参见下方的“像素坐标点击”）。

每个元素上的 `actions=[...]` 列表仅供**参考**，并非
权威信息。cua-driver 不会根据它执行预检——
`click({pid, element_token})` 始终尝试默认操作（或你传入的操作），
并呈现目标返回的任何结果。**先尝试点击**——仅根据返回的错误代码
进行切换。

### 工具调度表

每一行都假定使用新鲜的 `get_window_state`。优先使用其不透明的
`element_token`。如果客户端使用可见的整数，则必须将响应中的
`snapshot_id` 与 `element_index` 一并发送；在 0.17 中，单独的索引会安全失败。
仅像素形式不依赖快照句柄。

| 意图                             | 工具                                                                                                            | 备注                                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 列出应用的窗口                   | `list_windows({pid})`                                                                                           | 返回 `window_id`、`title`、`bounds`、`z_index`、`is_on_screen`、`on_current_space`。`launch_app` 的响应中已经包含这些信息——仅对长期运行的 pid 调用此工具                                               |
| 设置精确的窗口框架               | `set_window_frame({pid, window_id, x, y, width, height})`                                                       | 使用平台窗口管理器，并且仅在几何信息读回后才返回 `confirmed`；如果结果不是 confirmed，则继续之前再次检查 `list_windows`                                                |
| 调用原生应用菜单                 | `invoke_menu({pid, window_id, path:["Window","Arrange","Left"]})`                                              | 在每一跳都从实时原生状态中解析精确的直接子项标签；拒绝缺失、有歧义或禁用的片段，绝不回退到像素；随后验证命令的语义效果          |
| 对窗口进行快照                   | `get_window_state({pid, window_id})`                                                                            | 返回 `tree_markdown` + `screenshot_*`；填充 `(pid, window_id)` 元素索引缓存                                                                                                                        |
| 验证后置条件                     | `verify_state({pid, window_id, expect, include_screenshot?})`                                                   | 轮询有界的结构化谓词；返回 `satisfied`、`unsatisfied` 或 `unknown`。可选的最终图像由代理工具链解释，而非驱动程序解释                                                 |
| 左键单击                         | `click({pid, element_token})` 或 `click({pid, window_id, element_index, snapshot_id})`                          | 默认 `action: "press"`。像素形式：`click({pid, x, y})`（window_id 可选）— `modifier: ["cmd"\|"ctrl"]`                                                                                                        |
| 双击 / 打开                      | `double_click({pid, element_token})`                                                                            | 当元素声明了某个操作时使用默认操作（Finder 项目上的 Open / 可打开的行），否则在元素中心执行带坐标戳记的像素双击                                                                        |
| 右键单击 / 上下文菜单            | `right_click({pid, element_token})` 或 `click({pid, element_token, action:"show_menu"})`                       | 浏览器页面内容应在可用时使用类型化路径；参见 `BROWSER.md`                                                                                                                                     |
| 在光标处输入                     | `type_text({pid, text, element_token})`（ax）或 `type_text({pid, text, window_id, x, y})`（px）                  | ax 会聚焦元素，然后通过平台的文本设置原语写入；**px** 会对 `(x,y)` 执行像素点击以聚焦渲染器，然后输入——这是 Chromium/Electron 输入框无法通过 AX 路径访问时的一次调用修复方案       |
| 设置整个非文本控件的值           | `set_value({pid, element_token, value})`                                                                         | **按设计仅支持 AX**——下拉框/`AXPopUpButton`、复选框、滑块、步进器；**也是最小化窗口上的键盘提交变通方案。** 对于文本使用 `type_text`；要通过像素操作控件，使用 `click`/`drag` |
| 滚动                             | `scroll({pid, direction, amount, by, element_token})`                                                           | 为每个 pid 合成 PageUp/PageDown/方向键                                                                                                                                                                            |
| 聚焦并发送按键                   | `press_key({pid, key, element_token, modifiers})`（ax）或 `press_key({pid, key, x, y})`（px）                    | ax 会先定位元素，然后发送按键；**px** 会对 `(x,y)` 执行像素点击以聚焦，然后发送按键                                                                                                               |
| 向 pid 发送按键                  | `press_key({pid, key, modifiers})`                                                                              | 不改变焦点；按键发送到 pid 当前的焦点                                                                                                                                                                      |
| 修饰键组合                       | `hotkey({pid, keys})`（无焦点）或 `hotkey({pid, x, y, keys})`（px）                                            | 例如 `["cmd","c"]` / `["ctrl","c"]`；按每个 pid 发送，而不是 HID 点击。**px** 会先对 `(x,y)` 执行像素点击以聚焦字段，例如 `["cmd","v"]` 将内容粘贴到其中                                                             |

`list_windows.z_index` 使用一种可移植的约定：整数值越大，越靠近前端。选择具有最大非空值的最前端候选窗口。如果所有值都是 `null`（在原生 Wayland 上可能如此），请使用显式回退方案；绝不要将 `null` 当作零，也不要根据数组顺序推断堆叠关系。`launch_app` 返回的 `windows` 记录使用相同的约定。

在有效桌面作用域中，前台/系统等价操作会省略
`pid`/`window_id`，并传入 `scope:"desktop"`：`click`、`scroll`、`drag`、
`move_cursor`、`type_text`、`press_key` 和 `hotkey`。坐标是来自最新
`get_desktop_state` 图像的屏幕绝对像素坐标。

**窗口作用域的键盘/文本原语要求提供 `pid`。**它们使用指定目标对应的每个 pid 的事件发布路径。只有严格/有效桌面会话可以省略 `pid`，并且这会有意将键盘输入路由到当前前台应用程序。

**为什么基于快照的元素目标是首选路径：**可用于隐藏、被遮挡或不在桌面上的窗口，避免抢占焦点，并且在树重建后会安全失败，而不会静默地将目标重新指向被复用的索引。标签会告诉你正在点击什么。只有在辅助功能树无法满足需求时，才使用像素坐标。

## 跨平台参数契约

捕获、分发和寻址参数——`session`、
`delivery_mode`、`capture_mode`（已弃用/忽略——请参阅行为矩阵；仍保留在架构中，以免旧调用方报错）、`scope`、
`modifier`、`button`、`element_index`、`snapshot_id`、`element_token`——是一个**共享的
架构契约**：在 macOS、Windows 和 Linux 上具有完全相同的_形状_
（`type`/`enum`/`items`）。
它们由
`cua-driver-core::tool_schema` 中的规范片段（以及 `capture_mode`）组合而成，并且 CI 门禁
（`schema_consistency_test`）会在每个平台上将每个工具的实时 `tools/list` 通过结构检查器运行，因此三个界面不会
静默偏离。_贡献者注意：_当你在某个工具上添加或编辑这些共享参数之一时，请从片段中提取——不要重新手写 JSON，否则门禁会失败。（描述可以合法地因工具而异；门禁比较的是形状，而不是正文。）

对于调用方有两个后果：

- **`session` 在所有三个平台上的每个操作工具和光标工具上都被接受。**当平台会移动光标时，它会连接到光标；在其他地方则仅被架构接受——因此，你在 macOS 上传入的同一个 `session` 不会再被 Windows/Linux_拒绝_，而此前它们会因
  `additionalProperties:false` 而拒绝未知键。
- **`delivery_mode`（默认值为 `"background"` / `"foreground"`）适用于整个输入工具族**——`click`、`double_click`、`right_click`、`drag`、
  `scroll`、`type_text`、`press_key`、`hotkey`——且保持统一。`foreground` 档位会短暂地将目标置于前台，执行操作，然后恢复之前的最前端窗口：当后台尝试未生效时，这是明确的最后手段。**`foreground` 是一种响应，而不是一种预测。**始终先触发默认的 `background`，让驱动告知你它无法执行（返回 `background_unavailable` 错误，且
  `escalation.recommended == "foreground"`，或返回操作成功结果，且
  `escalation.target == "foreground"`）——或者先观察到已确认的无操作——_然后_再升级。
  不要这样推断：“这是 GTK/Chromium/Electron 应用，所以后台操作会失败，因此我会预先将其置于前台”：工具架构中的工具包列表是_驱动内部的检测器_，不是让你根据猜测预先切换前台的清单。（具体来说：GIMP 的 GTK 工具箱可以正常接受后台像素点击——预先执行前台点击只会无谓地窃取用户焦点。）每个平台的_后台_档位实际能够承载的内容各不相同（例如，Windows 后台点击无法携带 `modifier` 状态——请参阅 `WINDOWS.md`）；架构是统一的，但剩余限制取决于操作系统。

**必需参数集合契约。** `click` 不需要任何参数（`required:[]`），
`scroll` 需要 `["direction"]`，`zoom` 需要
`["window_id","x1","y1","x2","y2"]`——在每个平台上都相同。`pid` 是
**有条件必需的**（除非是无窗口的桌面范围调用，否则都需要），并且会在代码中通过清晰的错误信息进行校验，而不是固定在架构中——因此，对于桌面范围操作省略 `pid` 不再会被架构拒绝。

真正的平台特定参数会根据设计排除在共享契约之外（启动应用标识符、仅限 Windows 的 `debug_window_info`、仅限 macOS 且只返回状态的 `check_permissions.prompt`）。各操作系统对应的文件会列出在该平台上执行时需要关注的剩余参数。

## 像素坐标点击

像素路径（`click({pid, x, y})`）适用于无障碍树无法触及的界面——画布、视频播放器、WebGL、自定义绘制的控件。坐标是**窗口本地的屏幕截图像素**（与 PNG `get_window_state` 返回的图像处于相同坐标空间）。原点在左上角，y 轴向下。驱动程序会在内部处理屏幕坐标转换。
在 `x, y` 旁边传入 `window_id` 是可选的，但建议这样做——它会将坐标转换固定到生成该像素的屏幕截图所属窗口。

`get_window_state` 返回的 PNG 默认会限制为**长边 1568 px**（`max_image_dimension` 配置），与 Anthropic 多模态视觉的下采样限制一致。模型进行推理所依据的图像，与点击工具坐标系所使用的图像具有**相同分辨率**——只需查看 PNG，选取一个像素，然后点击该像素即可。不需要进行缩放计算。

默认采用此方式，是因为“渲染后的缩略图”与“原生 PNG”之间的不匹配，反复导致坐标估计失误。如果选择退出此限制（在像素级精确验证流程中显式设置 `max_image_dimension=0`），则旧规则仍然适用：不要根据客户端渲染的内容凭目测估计坐标——它的尺寸可能比磁盘上的 PNG 小 2-4 倍，而缩略图空间中 2% 的误差会变成真实图像中约 80 px 的误差。

对于小型或密集型 UI 中的精确定位：

1. `get_window_state({pid, window_id})` → 长边限制为 1568 的图像，以及
   `screenshot_width` / `screenshot_height`。使用 `--screenshot-out-file <path>` 写入磁盘。
2. 查看 PNG。由于它与所看到的内容一致，可以直接选取目标像素。
3. 需要精确定位时，在图像上绘制十字准线（**不要**裁剪——裁剪会丢失坐标系），并在点击前进行确认：

```python
from PIL import Image, ImageDraw
img = Image.open('/tmp/shot.png')
draw = ImageDraw.Draw(img)
x, y = <your_coordinate>
r = 18
draw.ellipse([x-r, y-r, x+r, y+r], outline='red', width=4)
draw.line([x-30, y, x+30, y], fill='red', width=3)
draw.line([x, y-30, x, y+30], fill='red', width=3)
img.save('/tmp/shot_annotated.png')
```

4. 只有在用户（或你自己重新查看标注图像后）确认十字准线位于目标上时，才调度点击。

不同形式：

- `click({pid, x, y})` — 单击鼠标左键。
- `click({pid, x, y, count: 2})` — 双击。
- `click({pid, x, y, modifier: ["cmd"\|"ctrl"]})` — 带修饰键的点击。
  接受 `cmd/shift/option/alt/ctrl` 的任意子集。
- `right_click({pid, x, y})` — 同样接受 `modifier`。

像素路径会为代理光标叠加层制作动画，但绝不会让真实光标发生跳转（驱动程序在 macOS 和 Windows 上使用的每个 pid 事件路径都会绕过 HID 合成）。如果 pid 没有屏幕上的窗口，调用会报错 `pid X has no on-screen window` ——你需要一个可见窗口来锚定转换。分发细节（macOS 上的 SkyLight、Windows 上的分层 UIA+PostMessage）请参阅各操作系统对应的 companion 文件。

## Web 渲染应用（浏览器、Electron、Tauri）

对于 Chromium 系列浏览器和 Electron，请使用 **`BROWSER.md`** 中准确且限定于会话的浏览器能力工作流。它以原生的 `(pid, window_id)` 选择作为入口，通过 `browser_prepare` 明确设置流程，并区分受信任的浏览器输入与明确请求的合成 DOM 事件。

对于浏览器界面、权限提示、下载、文件选择器、Safari、Firefox、Tauri，以及任何无法进行精确浏览器绑定的嵌入式 webview，请使用原生的 `get_window_state` 和 AX/PX 操作阶梯。旧版 `page` 工具仍作为兼容性接口保留；对于新的浏览器工作流，不要以它作为起点。

## 每次操作后都要验证——强制要求

**始终**在操作后进行验证。对于窗口是否存在/边界，或语义元素是否存在、值、启用状态或选中状态等结构化状态，优先使用 `verify_state({pid, window_id, expect})`。使用其有界轮询和稳定采样要求，不要自行编写 sleep。`unknown` 表示驱动程序无法确定该谓词；它不代表成功。一旦会话获得有效的桌面作用域，应改用新的 `get_desktop_state(session)` 结果——该捕获策略会拒绝窗口作用域的 `verify_state`。

当视觉证据有用时，传入 `include_screenshot:true`。此时同一结果还会包含一张新的最终窗口图像。驱动程序仍只评估结构化谓词；多模态代理工具会读取像素，并决定是停止、重试还是沿操作阶梯继续。对于工具无法表达的后置条件，应明确获取一份新的 `get_window_state` 快照，并让工具根据其树和图像进行判断。

只有在出现真实信号时，才切换到**元素 px 操作**：操作响应携带了 `effect:"suspected_noop"`，验证返回了 `unsatisfied`/`unknown`，快照状态为 `degraded`（树为空 → 非 AX 界面），树看起来没有变化/无法读取或与截图不一致，或者 `escalation.target` 将你指向那里（`pixel`）。这就是行为矩阵部分中的先验证后升级阶梯。如果树没有变化**且**截图确认没有任何移动，则该操作很可能静默失败了——**告诉用户你尝试了什么以及观察到了什么**，不要用“已完成”之类的措辞掩盖这一点（并考虑在 `escalation.target == "foreground"` 时使用 `delivery_mode:"foreground"`）。跳过这一步的代理会将静默丢弃的操作报告为成功——这是最常见的单一失败模式。

## 记录轨迹

会话范围内的操作录制与回放，用于演示、回归测试和训练数据。仅当用户明确要求录制会话时才调用——此技能不会自动启用。CLI 接口：
`qwen-cua-driver recording start|stop|status`；原始工具：
`start_recording` / `stop_recording`。默认启用视频捕获（主显示器 →
`recording.mp4`）；传递 `record_video: false` 可选择禁用。

完整流程请参阅 **`RECORDING.md`**：启用/禁用、turn 文件夹内容、通过
`replay_trajectory` 回放，以及 element_index
无法跨会话保留的注意事项。

## 常见错误模式（跨平台）

| 错误文本                                                                             | 含义                                                                                                                                                                          | 修复                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `No cached AX state for pid X window_id W`                                          | 你在本轮中跳过了 `get_window_state`，或者传给 click 的 `window_id` 与快照缓存所对应的值不同                                                                                     | 先调用 `get_window_state({pid: X, window_id: W})`——使用你准备点击的同一个 window_id                                                                                                                                    |
| `snapshot_id_required` / `stale_element_token`                                     | 提供了裸索引，或者有更新的快照取代了此目标                                                                                                                                        | 重新运行 `get_window_state`；使用新的 `element_token`，或者将其 `snapshot_id` 与匹配的整数一起发送                                                                                                                     |
| `window_id W belongs to pid P, not …`                                               | 传入的 window_id 属于不同的进程                                                                                                                                                | 使用 `list_windows({pid: X})` 枚举此进程自己的窗口                                                                                                                                                                     |
| `ambiguous_window_target`                                                           | 仅使用 PID 的窗口操作匹配到了多个符合条件的顶层窗口                                                                                                                             | 使用返回的候选项或 `list_windows({pid: X})`，选择目标 sibling，然后使用其明确的 `window_id` 重试                                                                                                                       |
| `AX action … failed with code …` / `UIA invoke failed`                              | 元素不支持默认操作                                                                                                                                                              | 尝试使用 `show_menu`、`confirm`、`cancel`、`pick`，或者退回到对元素中心执行像素点击                                                                                                                                    |
| `The user doesn't want to proceed with this tool use. The tool use was rejected …` | harness 对权限提示拒绝和对正在运行的工具执行手动中断（Esc / stop）均使用此 _exact_ 字符串——从工具结果中无法区分二者                                                                 | 将其视为“工具已取消，无结果，等待用户”。不要改述为“你停止了我”；请引用该字面消息，并指出已取消的工具及其参数，以便用户分辨哪些操作正在执行、哪些操作已经生效 |

特定平台的错误（macOS 上的 TCC 对话框、Windows 上的 Session 0 / UAC
提示、Linux 上的 AT-SPI 总线问题）位于各自的配套文件中。

## 应避免的事项

- **绝不要**在同一窗口重新获取快照后继续复用元素目标。
  新快照会立即使旧令牌失效。裸 `element_index`
  输入会被拒绝；请使用 `element_token` 或 `element_index` + `snapshot_id`。
- **不要混淆两种寻址模式。** 树会提供
  `element_index` 句柄；截图（同一次调用）会提供
  像素框架。**元素 AX 操作**按索引寻址，而
  **元素 PX 操作**按 `x,y` 寻址。默认使用 `element_index`，只有在出现真实信号时（`suspected_noop` / `degraded` /
  重复标签 / 树与像素不一致）才执行 px 操作。不要传入从截图中读出的
  `element_index`，也不要在未将其与图像核对的情况下，点击根据树中的（可能不可靠的）框架计算出的像素坐标。
- **优先使用无障碍操作，而不是像素操作。** `click({pid, x, y})`
  适用于画布 / WebView 区域，但它会盲目点击原始坐标。在退回到坐标操作之前，应先穷尽无障碍路径（菜单栏、cmd-k
  调色板、工具栏项目、键盘快捷键）。
  （AX 路径**不会**跳过代理光标叠加层——它会植入并脉冲显示会话光标，并在目标元素上绘制焦点框；只是不会在第一次操作时播放长距离滑动。
  有关演示录制的注意事项，请参阅“代理光标叠加层”。）
- **绝不要**在没有针对该具体破坏性步骤获得用户明确意图的情况下，执行破坏性操作（删除文件、关闭未保存的文档、发送消息、提交表单）。
- **绝不要**自主启动应用；除非用户最初的请求明确暗示需要启动，否则请先向用户确认。

## 端到端任务示例

**用户：**“在系统文件管理器中打开 Downloads 文件夹。”

1. 在 macOS 上使用 `launch_app({bundle_id: "com.apple.finder", urls: ["~/Downloads"]})`，
   或在 Windows 上使用 `launch_app({name: "explorer", args: ["%USERPROFILE%\\Downloads"]})`。返回 `{pid, windows: [{window_id, title, ...}]}`。
   启动操作具有幂等性；驱动程序通过平台的启动原语打开一个隐藏窗口——不会激活窗口，也不会抢夺焦点。
2. `get_window_state({pid, window_id})` → 验证预期窗口标题是否存在，并确认树已填充（侧边栏、列表视图、文件）。
3. 完成。

特定平台的示例和边缘情况（Finder 菜单导航、Explorer 功能区、GNOME Files）位于按操作系统划分的配套文件中。