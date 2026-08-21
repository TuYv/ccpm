---
name: common-ui-design
description: Design distinctive, production-grade frontend UI with bold aesthetic choices. Use when building web components, pages, interfaces, dashboards, or applications in any framework (React, Next.js, Angular, Vue, HTML/CSS).
metadata:
  triggers:
    keywords:
    - build a page
    - create a component
    - design a dashboard
    - landing page
    - UI for
    - build a layout
    - make it look good
    - improve the design
    - build UI
    - create interface
    - design screen
---
# UI 设计方向

## **优先级：P0（关键）**

在编写任何代码之前，先明确并坚持一个经过深思熟虑的审美方向。

## 阶段 0：设计思考（编码前必做）

在开始实现之前，先回答以下问题：

1. **目的**：这个 UI 要解决什么问题？它的用户是谁？
2. **基调**：选择一种鲜明的风格并坚持到底——极致简约 | 极繁主义 | 复古未来主义 | 编辑/杂志风 | 奢华/精致 | 粗野主义/原始感 | 活泼/玩具感 | 有机/自然 | 装饰艺术 | 工业/实用主义
3. **差异化**：说出一个能让用户记住这个界面的特点。

大胆的极繁主义和精致的极简主义都可以奏效——关键在于设计意图，而非视觉强度。

## 审美维度

### 排版

- 将独特的**展示字体**与精致的**正文字体**搭配使用；绝不要默认使用系统字体。
- 通过 `next/font`、`@font-face` 或 Google Fonts API 自托管——生产环境中绝不要使用 CDN `<link>`。
- 参见[字体搭配与基调示例](references/tones.md)

### 色彩与主题

- 主导色 + 鲜明强调色 > 畏缩且平均分布的配色方案。
- 使用 CSS 自定义属性（`--color-primary`、`--color-accent`）来保持一致性。
- 明确选择深色或浅色——不要仅仅因为浅色感觉“安全”就默认使用它。

### 动效

- 一个精心编排的入场动画（错落显现、`animation-delay`）> 零散的微交互。
- CSS 优先：`@keyframes`、`transition`、`animation-delay`；React：复杂动画序列使用 Motion 库。
- 参见[动效模式](references/motion.md)

### 空间构图

- 有意识地打破网格：不对称、重叠、对角线流动、突破网格的元素。
- 要么留出充足的负空间，要么采用受控的高密度布局——绝不要停留在无意形成的中间状态。

### 背景与纵深

- 营造氛围：渐变网格、噪点纹理、分层透明效果、颗粒叠层。
- 强烈的阴影和装饰性边框应与所选基调相匹配。
- 纯白色/灰色背景 = 错失创意机会。

## 反模式

- **不要使用通用默认字体**：Inter/Roboto/Arial/system-ui 会产生令人过目即忘的 UI；应选择富有个性的字体。
- **不要使用白底紫色渐变**：这是最被滥用的 AI 审美；应坚持采用符合具体情境的设计。
- **不要使用零散动画**：一个精心编排的入场动画胜过十个随机的悬停效果。
- **不要采用偶然形成的布局**：每一项间距和定位决策都必须服务于审美意图。
- **不要重复使用同一种审美**：在明暗、字体风格和基调上进行变化——绝不要趋同于单一风格。

## 参考资料

- [基调色板与字体搭配](references/tones.md)——选择审美方向或字体时加载
- [动效模式](references/motion.md)——实现动画或过渡效果时加载

## 规范响应锚点

应用此技能时，请在相关情况下保留下列领域术语，或在回答中使用含义等同的具体示例：
- aesthetic

- 其他与任务相关的精确锚点：typography