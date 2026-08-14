---
name: capture-screen
description: Programmatic screenshot capture on macOS. Find window IDs with Swift CGWindowListCopyWindowInfo, control application windows via AppleScript (zoom, scroll, select), and capture with screencapture. Use when automating screenshots, capturing application windows for documentation, or building multi-shot visual workflows.
---
# 截取屏幕

在 macOS 上以编程方式截取屏幕：查找窗口、控制视图、截取图像。

## 快速开始

```bash
# Find Excel window ID
swift scripts/get_window_id.swift Excel

# Capture that window (replace 12345 with actual WID)
screencapture -x -l 12345 output.png
```

## 概述

三步工作流：

```
1. Find Window  →  Swift CGWindowListCopyWindowInfo  →  get numeric Window ID
2. Control View  →  AppleScript (osascript)           →  zoom, scroll, select
3. Capture       →  screencapture -l <WID>            →  PNG/JPEG output
```

## 第 1 步：获取窗口 ID（Swift）

使用 Swift 和 CoreGraphics 枚举窗口。这是 macOS 上**唯一可靠的方法**。

### 快速内联执行

```bash
swift -e '
import CoreGraphics
let keyword = "Excel"
let list = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[String: Any]] ?? []
for w in list {
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    let name = w[kCGWindowName as String] as? String ?? ""
    let wid = w[kCGWindowNumber as String] as? Int ?? 0
    if owner.localizedCaseInsensitiveContains(keyword) || name.localizedCaseInsensitiveContains(keyword) {
        print("WID=\(wid) | App=\(owner) | Title=\(name)")
    }
}
'
```

### 使用随附的脚本

```bash
swift scripts/get_window_id.swift Excel
swift scripts/get_window_id.swift Chrome
swift scripts/get_window_id.swift          # List all windows
```

输出格式：`WID=12345 | App=Microsoft Excel | Title=workbook.xlsx`

解析 WID 数字，以便与 `screencapture -l` 配合使用。

## 第 2 步：控制窗口（AppleScript）

以下命令已经过验证，可在截取前控制应用程序窗口。

### Microsoft Excel（完整支持 AppleScript）

```bash
# Activate (bring to front)
osascript -e 'tell application "Microsoft Excel" to activate'

# Set zoom level (percentage)
osascript -e 'tell application "Microsoft Excel"
    set zoom of active window to 120
end tell'

# Scroll to specific row
osascript -e 'tell application "Microsoft Excel"
    set scroll row of active window to 45
end tell'

# Scroll to specific column
osascript -e 'tell application "Microsoft Excel"
    set scroll column of active window to 3
end tell'

# Select a cell range
osascript -e 'tell application "Microsoft Excel"
    select range "A1" of active sheet
end tell'

# Select a specific sheet
osascript -e 'tell application "Microsoft Excel"
    activate object sheet "DCF" of active workbook
end tell'

# Open a file
osascript -e 'tell application "Microsoft Excel"
    open POSIX file "/path/to/file.xlsx"
end tell'
```

### 任意应用程序（基本控制）

```bash
# Activate any app
osascript -e 'tell application "Google Chrome" to activate'

# Bring specific window to front (by index)
osascript -e 'tell application "System Events"
    tell process "Google Chrome"
        perform action "AXRaise" of window 1
    end tell
end tell'
```

### 时序和超时

在截取前，始终在 AppleScript 命令后添加 `sleep 1`，以便用户界面完成渲染。

**重要提示**：如果目标应用程序未运行或无响应，`osascript` 会无限期挂起。请始终配合 `timeout` 使用：

```bash
timeout 5 osascript -e 'tell application "Microsoft Excel" to activate'
```

## 步骤 3：截取（screencapture）

```bash
# Capture specific window by ID
screencapture -l <WID> output.png

# Silent capture (no camera shutter sound)
screencapture -x -l <WID> output.png

# Capture as JPEG
screencapture -l <WID> -t jpg output.jpg

# Capture with delay (seconds)
screencapture -l <WID> -T 2 output.png

# Capture a screen region (interactive)
screencapture -R x,y,width,height output.png
```

### Retina 显示屏

在配备 Retina 显示屏的 Mac 上，`screencapture` 默认以 2 倍分辨率输出（例如，一个 2032x1238 的窗口会生成 4064x2476 的 PNG）。这是正常现象。若要获得 1 倍分辨率，请在截取后调整大小：

```bash
sips --resampleWidth 2032 output.png --out output_1x.png
```

### 验证截取结果

```bash
# Check file was created and has content
ls -la output.png
file output.png    # Should show "PNG image data, ..."
```

## 多次截取工作流程

完整示例：截取 Excel 工作簿的多个部分。

```bash
# 1. Open file and activate Excel
osascript -e 'tell application "Microsoft Excel"
    open POSIX file "/path/to/model.xlsx"
    activate
end tell'
sleep 2

# 2. Set up view
osascript -e 'tell application "Microsoft Excel"
    set zoom of active window to 130
    activate object sheet "Summary" of active workbook
end tell'
sleep 1

# 3. Get window ID
#    IMPORTANT: Always re-fetch before capturing. CGWindowID is invalidated
#    when an app restarts or a window is closed and reopened.
WID=$(swift -e '
import CoreGraphics
let list = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[String: Any]] ?? []
for w in list {
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    let wid = w[kCGWindowNumber as String] as? Int ?? 0
    if owner == "Microsoft Excel" { print(wid); break }
}
')
echo "Window ID: $WID"

# 4. Capture Section A (top of sheet)
osascript -e 'tell application "Microsoft Excel"
    set scroll row of active window to 1
end tell'
sleep 1
screencapture -x -l $WID section_a.png

# 5. Capture Section B (further down)
osascript -e 'tell application "Microsoft Excel"
    set scroll row of active window to 45
end tell'
sleep 1
screencapture -x -l $WID section_b.png

# 6. Switch sheet and capture
osascript -e 'tell application "Microsoft Excel"
    activate object sheet "DCF" of active workbook
    set scroll row of active window to 1
end tell'
sleep 1
screencapture -x -l $WID dcf_overview.png
```

## 失败的方法（请勿使用）

以下方法已经过测试，并确认在 macOS 上不可用：

| 方法 | 错误 | 失败原因 |
|--------|-------|-------------|
| `System Events` → `id of window` | 错误 -1728 | System Events 无法以 screencapture 所需的格式访问窗口 ID |
| Python `import Quartz` (PyObjC) | `ModuleNotFoundError` | 系统 Python 中未安装 PyObjC；请勿尝试安装它——应改用 Swift |
| `osascript` window id | 格式错误 | 返回的是 AppleScript 窗口索引，而不是 `screencapture -l` 所需的 CGWindowID |

## 权限故障排查

`swift scripts/get_window_id.swift` 通过 CoreGraphics 读取屏幕上的窗口，因此在 macOS 上需要“屏幕录制”权限。

请按以下顺序操作：

1. 确认触发条件
2. 确认目标身份
3. 在“设置”中添加/启用确切的应用

如果命令执行失败并显示 `ERROR: Failed to enumerate windows`，请执行：

```bash
open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
```

或者直接通过脚本输出相同的检查清单：

```bash
swift scripts/get_window_id.swift --permission-hint screen
swift scripts/get_window_id.swift --permission-hint microphone
```

然后：

1. 在“隐私与安全性”→“屏幕录制”中启用目标应用。
2. 如果列表中没有你的应用：
    - 确保你向真正的应用程序包授予了权限（而不是 `swift` / 终端辅助程序）。
    - 对于 CLI 工具，在权限验证期间将其构建为打包的 `.app` 并以此形式运行。
    - 点击 `+`，从 `/Applications` 手动添加该 `.app`。
3. 重启应用后重新运行命令。
4. 如果这是 CLI 工作流，还需检查启动器是否为辅助二进制文件：
   - 在大多数情况下，TCC 中显示的条目是辅助进程（`swift`、`Terminal`、`iTerm` 等），而不是业务应用。
   - 在辅助程序级别授予权限后，权限仍然有效，但这并不适合作为最终的用户体验。

对于与麦克风访问相关的提示，请对麦克风面板使用相同的处理方式：

```bash
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
```

同样的规则仍然适用：系统只能显示具体 `.app` 程序包的权限。如果请求由辅助二进制文件发起，那么设置列表对于你的产品应用而言可能会产生误导或为空。

### 快速检查模板

```text
1) Error: permission denied
2) Open target pane
3) Verify identity shown by OS = identity you granted
4) If not matched, use the script-reported candidate identities and grant the launcher process
5) Reopen/restart and verify
```

对于生产环境应用，请避免通过 `swift`/`python` 入口点请求权限；应始终在打包后的应用进程中执行权限检查，以便用户只看到一个目标。

如果你还维护其他与 macOS 权限相关的流程，请复用此标准化排查模板：

- [permission-triage-template.md](references/permission-triage-template.md)

## 支持的应用程序

| 应用程序 | 窗口 ID | AppleScript 控制 | 备注 |
|------------|-----------|-------------------|-------|
| Microsoft Excel | Swift | 完整（缩放、滚动、选择、激活工作表） | 支持程度最佳 |
| Google Chrome | Swift | 基础（激活、窗口管理） | 无法通过 AppleScript 滚动/缩放 |
| 任何 macOS 应用 | Swift | 基础（通过 `tell application` 激活） | screencapture 可通用于所有应用 |

AppleScript 的控制深度因应用程序而异。Excel 拥有最丰富的 AppleScript 字典。对于 AppleScript 支持有限的应用，请使用通过 `System Events` 模拟键盘操作作为后备方案。