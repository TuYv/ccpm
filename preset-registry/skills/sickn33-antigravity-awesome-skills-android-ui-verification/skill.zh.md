---
name: android_ui_verification
description: Automated end-to-end UI testing and verification on an Android Emulator using ADB.
risk: safe
source: community
date_added: "2026-02-28"
---
# Android UI 验证技能

本技能提供了一种系统化方法，用于通过 ADB 命令在 Android 模拟器上测试 React Native 应用。它支持自主交互、状态验证和视觉回归检查。

## 何时使用
- 验证 React Native 或原生 Android 应用中的 UI 变更。
- 自主调试布局问题或交互缺陷。
- 在手动测试太慢时确保功能正常。
- 捕获自动化截图用于 PR 文档。

## 🛠 前提条件
- Android 模拟器正在运行。
- `adb` 已安装并位于 PATH 中。
- 应用处于调试模式以便访问 logcat。

## 🚀 工作流程

### 1. 设备校准
在交互之前，务必先确认屏幕分辨率，以确保点击坐标准确。
```bash
adb shell wm size
```
*注意：布局通常是经过缩放的。请以该命令返回的物理尺寸作为坐标计算的基准。*

### 2. UI 检查（状态发现）
使用 `uiautomator` dump 来查找 UI 元素（按钮、输入框）的精确边界。
```bash
adb shell uiautomator dump /sdcard/view.xml && adb pull /sdcard/view.xml ./artifacts/view.xml
```
在 `view.xml` 中搜索 `text`、`content-desc` 或 `resource-id`。`bounds` 属性 `[x1,y1][x2,y2]` 定义了可点击区域。

### 3. 交互命令
- **点击（Tap）**：`adb shell input tap <x> <y>`（使用元素边界的中点）。
- **滑动（Swipe）**：`adb shell input swipe <x1> <y1> <x2> <y2> <duration_ms>`（用于滚动）。
- **文本输入**：`adb shell input text "<message>"`（注意：对特殊字符的支持有限）。
- **按键事件**：`adb shell input keyevent <code_id>`（例如，66 表示回车键）。

### 4. 验证与报告
#### 视觉验证
在交互之后截取屏幕截图，以确认 UI 变更。
```bash
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png ./artifacts/test_result.png
```

#### 分析验证
实时监控 JS 控制台日志，以检测错误或记录成功信息。
```bash
adb logcat -d | grep "ReactNativeJS" | tail -n 20
```

#### 清理
务必将生成的文件存放在 `artifacts/` 文件夹中，以满足项目组织规范。

## 💡 最佳实践
- **等待动画**：在交互与验证之间始终添加短暂的休眠（例如 1-2 秒）。
- **点击中点**：计算 `[x1,y1][x2,y2]` 的算术平均值，以获得最可靠的点击目标。
- **日志标记**：在代码中使用独特的日志消息（例如 `✅ Action Successful`），以便于 `grep` 验证。
- **快速失败**：如果 `uiautomator dump` 失败或未找到预期文本，应停下来进行排查，而不是盲目点击。

## 局限性
- 仅当任务明确符合上述范围时才使用此技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少所需的输入、权限、安全边界或成功标准，请停下来并请求澄清。
