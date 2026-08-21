---
name: common-web-visual-testing
description: Standardizes visual audits, responsive design, and behavioral testing for web apps. Use to verify a web UI fix or cross-browser behavior; defer backend API refactors, Playwright installation/tooling setup, and Appium/mobile automation.
metadata:
  triggers:
    keywords:
      - web test
      - browser test
      - responsive audit
      - verify web ui
      - cross-browser check
      - web accessibility
---
# 🌐 Web 视觉与行为测试

## **优先级：P1（高）**

> [!IMPORTANT]
> **第 2 层（方法论）**：战略性 Web UI/UX 审计。
> **第 3 层（领域）**：响应式、A11y（WCAG）、浏览器引擎差异。

## 🧪 测试思维（对比审计）

视觉测试最好采用**对比审计**循环：

1.  **基线（之前）**：捕获生产环境/主分支的 `snapshot --aria` + `screenshot`。
2.  **实现（之后）**：对本地环境/功能分支执行相同的捕获。
3.  **审计**：比较状态，检查回归、CLS 和 Aria 偏移。

响应必须将两次捕获标记为**之前**和**之后**（或“基线”和“已修复”），并包含差异以及对相邻元素副作用的检查。

## 📋 场景矩阵

| 变更类型           | 要运行的场景                                      |
| :---------------- | :------------------------------------------------- |
| **CSS/布局**       | 响应式审计 + 悬停 + CLS 检查                      |
| **表单/输入**      | 验证消息 + 焦点状态 + 错误边界                    |
| **导航**           | URL 同步 + 固定页头 + 后退按钮状态持久化          |
| **资源/字体**      | 延迟加载 + 图标检查 + LCP 审计                    |
| **无障碍访问**     | Tab 顺序 + Aria 快照 + 颜色对比度                 |

## 🚫 反模式

- **单一视口**：绝不能只验证桌面端。还要检查移动端（375px）+ 平板端（768px）。
- **忽略布局偏移**：检查加载状态（骨架屏）→ 页面不得跳动。
- **未遮罩动态内容**：**必须**通过 `--mask` 或 JS（`opacity: 0`）遮罩时间戳/余额。避免“误报回归”。
- **盲目断言**：完成前使用 `playwright-cli snapshot --aria` 验证状态。
- **外部依赖**：模拟/绕过第三方服务（聊天、分析）→ 防止测试不稳定。

## 🔗 参考资料

- **playwright-cli**：[playwright-cli](../../quality-engineering/quality-engineering-playwright-cli/SKILL.md)
- **诊断解码器**：[diagnostic-decoder](references/diagnostic-decoder.md)
- **DOM 与截图对比**：[dom-snapshot-vs-screenshot](references/dom-snapshot-vs-screenshot.md)
- **登录与数据**：[login-and-test-data](references/login-and-test-data.md)
- **场景详情**：[scenarios](references/scenarios.md)