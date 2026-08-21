---
name: quality-engineering-appium-mcp
description: Drives iOS/Android mobile devices via Appium MCP. Use for verifying mobile bugs, E2E tests, and navigating real device clouds (LambdaTest/BrowserStack).
metadata:
  triggers:
    keywords:
    - appium
    - mobile verify
    - android verify
    - ios verify
    - lambdatest
    - real device cloud
    - flutter widget tap
---
# 📱 Appium MCP（移动端自动化）

## **优先级：P1（高）**

> [!IMPORTANT]
> **第 0 层（基础设施）**：会话创建、设备云连接、基本操作系统交互。
> **第 1 层（核心手势）**：针对原生移动端元素的点击、滑动和文本输入。
> **第 2 层（Flutter/单画布）**：通过截图和坐标点击实现视觉优先的自动化。

## 🔌 激活

**触发词**：`appium`、`mobile verify`、`android verify`、`ios verify`、`lambdatest`、`real device cloud`、`flutter widget tap`。

## 🛠 核心工作流（目标导向）

| 步骤 | 工具 | 目的 |
| :--- | :--- | :--- |
| 1 | `appium_session_management` (`create`) | 打开会话。**韧性**：失败时使用 `noReset: true` 重试。 |
| 2 | `appium_get_window_size` | 为高密度显示屏缩放坐标。 |
| 3 | `appium_screenshot` | 捕获视觉状态，用于**语义推理**。 |
| 4 | `appium_gesture` / `appium_set_value` | 执行交互。**自愈**：如果 UUID 失效，则重新扫描层级结构。 |
| 5 | `appium_session_management` (`delete`) | **必须清理**。 |

## 💡 AI 驱动的方法
- **语义意图**：在层级结构中查找元素（例如，“登录按钮”），而不是使用原始坐标。能够适应布局变化。
- **动态处理**：出现意外弹窗？暂停操作，分析警告框，关闭后继续。
- **视觉锚点**：找到稳定的“锚点”（例如，页眉），并据此推导相对坐标。

## 🚫 反模式（零容忍）

- **硬编码 XPath**：使用 `accessibility id` 或 `uiautomator`。XPath 不稳定。
- **仅使用隐式等待**：绝不要假设页面已加载。轮询“事实来源”元素。
- **忽略 QoS**：通过 `appium_mobile_performance_data` 审查 CPU/内存。防止卡顿/崩溃。
- **遗留会话**：必须执行清理。在清理块中调用 `delete`。

## ✅ 评估标准

- **清理率**：会话关闭率达到 100%。
- **视觉准确性**：基于坐标的点击落在目标中心 5% 的范围内。
- **安全性**：工具参数或日志中不得包含密钥。

## 🔗 参考资料

- **视觉测试**：[common-mobile-visual-testing](../../common/common-mobile-visual-testing/SKILL.md) — 关于验证内容的方法论。
- **LambdaTest 设置**：[lambdatest-cloud-setup](references/lambdatest-cloud-setup.md) — RDC 配置。
- **工具速查表**：[tool-cheatsheet](references/tool-cheatsheet.md) — 可快速复制粘贴的参数。
- **项目上下文**：[project-context](references/project-context.md) — 项目特定的覆盖层/宏。