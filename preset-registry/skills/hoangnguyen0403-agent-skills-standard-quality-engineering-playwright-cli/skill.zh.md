---
name: quality-engineering-playwright-cli
description: Standardizes token-efficient browser automation via playwright-cli. Use for web verification, navigation, and capturing snapshots/logs.
metadata:
  triggers:
    keywords:
    - playwright-cli
    - browser automation
    - web verify
    - browser navigate
    - page verification
---
# 🎭 Playwright CLI（Web 自动化）

## **优先级：P1（高）**

> [!IMPORTANT]
> **第 0 层（基础设施）**：浏览器进程管理、命名会话、网络/控制台日志。
> **第 1 层（核心交互）**：点击、填写和导航（`open` 与 `goto`）。
> **第 2 层（验证）**：基于快照的断言和身份验证状态持久化。

## 🔌 激活

**触发词**：`playwright-cli`、`browser automation`、`web verify`、`snapshot`、`auth-state.json`。

## 🛠 核心工作流

| 步骤 | 命令 | 用途 |
| :--- | :--- | :--- |
| 1 | `playwright-cli -s={ID} open <url>` | 启动**命名会话**。（必须使用 `-s=`）。 |
| 2 | `playwright-cli -s={ID} snapshot --aria` | **Aria 快照**：供 LLM 推理使用的类 YAML 视图（最适合断言）。 |
| 3 | `playwright-cli -s={ID} console` | 检查 JS 错误/警告。 |
| 4 | `playwright-cli -s={ID} screenshot` | 视觉证据。对动态内容使用 `--mask <ref>`。 |
| 5 | `playwright-cli -s={ID} close` | **必须执行的清理操作**。 |

对于滚动后才出现的吸顶页眉，请滚动到页眉可见，使用 `hover` 悬停在页眉上（或其稳定的角色/引用上）以建立可见状态，然后捕获 `screenshot`。在证据捕获完成之前，保持命名会话处于打开状态。

## 💡 面向智能体的优化
- **Aria 优先**：将 `snapshot --aria` 用作“查看”页面的主要方式。它可以过滤噪声。
- **稳健的定位器**：优先使用基于角色的引用（例如 `button[name="Submit"]`），而不是脆弱的 CSS 类。
- **视觉稳定性**：在捕获前执行 `document.body.style.animation = 'none'` 以冻结动画。

## 🚫 反模式（零容忍）

- **未命名会话**：绝不能省略 `-s=`。裸命令会在并发运行之间发生冲突。
- **重复打开**：首次运行使用 `open`；会话中途导航使用 `goto`。
- **未遮罩的快照**：比较前遮罩时钟/随机 ID，以避免误报。
- **孤立进程**：即使失败，也始终要 `close` 会话。

## ✅ 评估标准

- **清理率**：会话关闭率达到 100%。
- **断言质量**：90% 的断言使用 `snapshot`，而不是像素。
- **身份验证持久化**：在多步骤流程中成功复用 `state-load`。

## 🔗 参考资料

- **Web 视觉测试**：[common-web-visual-testing](../../common/common-web-visual-testing/SKILL.md) — 关于验证内容的方法论。
- **反模式原理**：[anti-patterns-rationale](references/anti-patterns-rationale.md) — 这些规则存在的原因。
- **项目上下文**：[project-context](references/project-context.md) — 项目特定的市场/VPN/身份验证模式。

## 规范响应锚点

当此技能适用时，请在相关情况下，在回答中保留以下领域术语或等效的具体示例：
- 🎭 Playwright CLI（Web 自动化）

## 修复锚点

- 修复锚点：hover、screenshot