---
name: common-mobile-visual-testing
description: Standardizes mobile UI audits, performance/scroll checks, RTL verification, and state-specific testing on iOS/Android.
metadata:
  triggers:
    keywords:
    - visual test
    - mobile test
    - verify ui
    - dark mode test
    - accessibility audit
    - behavioral test
    - visual regression
    - localization test
---
# 🕵 移动端视觉与行为测试

## **优先级：P1（高）**

> [!IMPORTANT]
> **第 2 层（方法论）**：移动端 UI/UX 策略审计。
> **第 3 层（领域）**：i18n、A11y（动态字体）、平台（刘海屏/RTL）。

## 🧪 测试思维

分析差异并回答：
1.  **改了什么？**（受影响的页面、逻辑路径）
2.  **会出问题吗？**（回归、状态转换）
3.  **视觉审计**：截断、对齐、层级顺序、颜色。
4.  **行为审计**：点击目标、导航、数据准确性。

## 📋 场景矩阵

| 变更类型 | 要运行的场景 |
| :--- | :--- |
| **UI/样式** | 视觉审计 + 深色模式 + QoS 检查（CPU/内存） |
| **导航** | 用户流程 + 深度链接 + 层级顺序 |
| **列表/网格** | 滚动测试 + 分页 + 空状态 |
| **i18n/区域设置** | RTL + 截断 + 区域设置逻辑 |
| **无障碍** | 动态字体 + 高对比度 + 权限说明 |

## 🛠️ 核心工具映射

| 场景 | Appium 工具 |
| :--- | :--- |
| **系统警报** | `appium_alert`（先检查层级结构） |
| **性能** | `appium_mobile_performance_data`（在流程执行期间监控） |
| **视觉检查** | `appium_screenshot`（基准/差异） |
| **布局审计** | `appium_get_source`（层级结构/aria） |

## 🚫 反模式

- **忽略 QoS**：应用在负载下会崩溃或卡顿。**必须**使用 `appium_mobile_performance_data` 检查并报告 **QoS**（滚动/视频）。
- **盲目点击**：交互前检查状态。使用 `appium_screenshot`。
- **因警报陷入停滞**：出现意外警报？使用 `appium_alert` → `accept`/`dismiss`。
- **正常路径偏见**：绝不能忽略空、加载中或错误状态。
- **忽视深度链接**：通过深度链接验证“冷启动”。
- **单一设备视野局限**：验证最小和最大屏幕尺寸。

## 🔗 参考资料

- **appium-mcp**：[appium-mcp](../../quality-engineering/quality-engineering-appium-mcp/SKILL.md)
- **场景详情**：[scenarios](references/scenarios.md)