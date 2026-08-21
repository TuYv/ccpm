---
name: moai-ref-ui-polish
description: >
  UI polish and interface-completion reference: the small visual details — concentric
  border radius, optical alignment, shadow-vs-border, motion easing, typography
  smoothing, tabular numbers, icon stroke weight, hit areas — that separate polished
  interfaces from generic ones. Agent-extending skill that amplifies frontend/UI domain
  work with production-grade "interface taste" rules.
  NOT for: backend logic, database design, DevOps, security audits, non-UI work.

when_to_use: >
  Use for UI polish and design-completion work: building UI components, reviewing
  frontend code, implementing animations, hover/active states, shadows, borders,
  typography, icons, micro-interactions, enter/exit animations, or any visual detail
  work. Amplifies frontend domain work (manager-develop, Agent(general-purpose) with
  frontend instructions) with interface-design taste rules. Implementation examples are
  Web/CSS; the design principles are platform-neutral (apply to native mobile/desktop UI too).

user-invocable: false
metadata:
  version: "1.2.0"
  category: "domain"
  status: "active"
  updated: "2026-08-19"
  tags: "ui, polish, design, animation, typography, motion, frontend, accessibility, audit, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# UI 润色参考

## 目标代理

- `manager-develop` - 在前端/UI 组件实现期间应用润色规则（`cycle_type=tdd` 或 `cycle_type=ddd` 上下文）
- `/moai review` - UI 设计审查界面；同样可以按照 `archived-agent-rejection.md` §C，通过每次派生一个 `Agent(general-purpose)` 前端专家来使用

## 核心理念

出色的界面由大量细节共同构成，这些细节累积起来，最终带来卓越的体验。AI 代理经常会忽略这些细节——例如，为进入动画使用 `ease-in` 缓动（本应使用 `ease-out`）、在半透明阴影效果更好的地方使用实线边框，或嵌套元素的圆角半径不匹配。这些问题单独来看都不致命，但叠加在一起，便构成了“精致”与“普通”之间的差别。

在提出润色改动之前，先确定项目现有的样式系统（设计令牌、间距尺度、动效库）。绝不要为了润色修复而引入第二套样式系统——应扩展现有系统。

## 几何与对齐

| 原则 | 规则 | 理由 |
|-----------|------|-----------|
| 同心圆角半径 | `outerRadius = innerRadius + padding` | 嵌套元素的圆角半径不匹配，是界面“感觉不对劲”的最常见原因 |
| 视觉对齐优先于几何对齐 | 当几何居中看起来不对时，采用视觉对齐 | 带图标的按钮、播放三角形和非对称图标都需要手动微调；对于这些形状，几何中心在视觉上并不居中 |

## 层级与结构

| 元素 | 适用场景 | 避免 |
|---------|-----|-------|
| 半透明分层 `box-shadow` | 深度、层级、悬浮表面 | 使用实线边框表现深度（会显得厚重且扁平） |
| 边框 | 结构、分隔线、分隔元素、选中/聚焦状态 | 使用阴影进行结构分隔（含义模糊） |

## 动效

| 模式 | 规则 | 常见错误 |
|---------|------|----------------|
| 进入动画缓动 | `ease-out`（减速）——元素平稳到达 | 进入时使用 `ease-in`（元素看起来像猛然砸到位） |
| 退出动画缓动 | `ease-in`（加速离开），与进入曲线相呼应（使用较小且固定的 `translateY`） | 整体高度折叠，或使用比进入动效更生硬的运动 |
| 可中断的状态变化 | CSS `transition`（可在动画过程中被中断） | 为交互状态使用 `keyframes`（无法中断） |
| 分阶段进入 | 让具有语义关联的内容块以约 100ms 的间隔错开——仅用于低频的分阶段进入 | 在常规、高频交互中使用错开效果（会显得迟缓） |
| 上下文图标动画 | 使用 `opacity`/`scale`/`blur` 交叉淡化（缩放 0.25→1、不透明度 0→1、模糊 4px→0） | 切换 `visibility`（突兀，且无过渡） |
| 按压反馈 | 点击时使用 `scale(0.96)`——始终为 0.96 | 小于 0.95（看起来像错误，而不是按压） |
| 首次渲染进入 | 在 `AnimatePresence` 上使用 `initial={false}`（或等效方式）跳过 | 页面加载时触发进入动画（令人迷失方向） |
| 动效克制 | 高频交互不使用自定义动画；动效绝不能是唯一的反馈渠道 | 为所有内容添加动画（造成干扰、增加性能成本并影响无障碍体验） |

### 动效缓动值（Web/CSS）

| 情形 | 值 |
|------|-------|
| 使用动效库（Framer Motion 等） | `transition: { type: "spring", duration: 0.3, bounce: 0 }` |
| 不使用动效库（CSS） | 标准“减速”曲线使用 `cubic-bezier(0.2, 0, 0, 1)` |
| 绝不使用 | `transition: all` — 始终指定确切属性（`transition-property: scale, opacity`） |

### 动效的无障碍性与性能成本

| 规则 | 详情 |
|------|--------|
| 减少动态效果分支（必需） | 每个非装饰性动画都需要提供一条 `prefers-reduced-motion: reduce` 路径。大幅位移和视差动效会对患有前庭功能障碍的用户造成身体伤害。应将其简化为不透明度交叉淡化，或移除动画——绝不能只是缩短动画时长。该分支应与动画同时编写，而不是事后补加 |
| 为合成器制作动画，而非为布局制作动画 | `transform` 和 `opacity` 由合成器处理，会跳过布局和大部分绘制过程。`width`、`height`、`top`、`left`、`margin` 和 `padding` 会在每一帧触发布局计算（抖动），这正是为何同样的视觉效果在由错误属性驱动时会出现卡顿。移动使用 `translate`，调整大小使用 `scale` |

> 这些规则背后的动效原则——三轮决策流程、动效层级、
> 1/3 规则、交错预算、个性原型、迪士尼式适配范围，以及
> 情绪到动效的映射——位于 `references/motion-principles.md`（L3，仅当
> 动效是工作内容的核心时按需加载）。

## 排版

| 规则 | 实现方式（Web/CSS） | 使用场景 |
|------|--------------------------|------|
| 字体平滑 | 在根布局上设置 `-webkit-font-smoothing: antialiased` | macOS 目标平台（渲染更锐利） |
| 等宽数字 | `font-variant-numeric: tabular-nums` | 动态更新的数字（计数器、计时器、价格）——防止布局偏移 |
| 标题换行 | `text-wrap: balance` | 标题（防止孤立单词，使各行长度更均衡） |
| 正文换行 | `text-wrap: pretty` | 正文段落（避免孤行与寡行） |

## 图像

| 规则 | 值 |
|------|-------|
| 图像描边 | 低不透明度的细微 `1px` 描边 |
| 描边颜色（浅色模式） | 纯黑色 — `oklch(0 0 0 / 0.1)` |
| 描边颜色（深色模式） | 纯白色 — `oklch(1 0 0 / 0.1)` |
| 绝不使用 | 带色调的中性色描边（会被理解为一种配色选择，而不是分隔提示） |

## 交互

| 规则 | 值 |
|------|-------|
| 最小命中区域（触控/移动端） | 44 × 44 px |
| 最小命中区域（高密度桌面端） | 40 × 40 px（如果视觉元素更小，则使用伪元素扩展） |
| 命中区域重叠 | 绝不能让命中区域重叠 |
| 触控设备上的悬停（绝不能作为必要条件） | 触控设备上不存在 `:hover`——任何只能通过悬停访问的内容，在手机上都会直接消失。默认保持操作提示可见，并通过 `@media (hover: hover) and (pointer: fine)` 限定悬停样式 |
| 指针设备上的悬停（始终提供） | 反向规则同样成立：在指针设备上，每个可点击表面都需要有明确不同的悬停状态，并以约 100-200ms 的时间完成过渡。指针停留在目标上却没有任何反馈，会让人觉得它已失效 |
| `will-change` | 仅用于 `transform`、`opacity`、`filter`——且仅在观察到首帧卡顿时使用；绝不能使用 `will-change: all` |

## 图标

| 规则 | 细则 |
|------|--------|
| 描边与文本字重匹配 | 常规（400）文本旁使用 `1.5px` 描边；半粗体（600）文本旁使用 `2px` 描边 |
| 每组仅使用一种描边粗细 | 切勿在同一界面中混用图标库 |
| 通过颜色而非资源表现状态 | 图标使用 `currentColor`；状态由 CSS `color`/`opacity` 控制——切勿使用单独的资源文件 |
| 轮廓与填充 | 默认使用轮廓变体；填充变体表示激活状态 |

## 审查模式

| 模式 | 覆盖范围 | 问题数量上限 |
|------|----------|-------------|
| `quick` | 主要用户路径、高流量状态；仅限 HIGH/MEDIUM 问题 | 5 |
| `full` | 涵盖所有类别（排版、表面、动效、图标、交互）的完整范围 | 15 |

### 严重程度

| 级别 | 含义 |
|-------|---------|
| HIGH | 导致交互不可访问、具有误导性、无法阅读或反复造成干扰 |
| MEDIUM | 明显的可用性或一致性问题 |
| LOW | 局部的细节完善问题（仅限完整模式） |

### 结论

| 结论 | 条件 |
|---------|-----------|
| 阻止 | 仍存在任何 HIGH 问题 |
| 需要修改 | 仅剩 MEDIUM 或 LOW 问题 |
| 批准 | 不存在仍需处理的问题 |

> 要审计现有代码库，而不是审查差异吗？`references/design-audit.md`
>（L3，按需加载）包含以下检查清单背后的机械检测模式——
> 动效缺陷、无障碍违规、布局属性动画，以及只有在整个代码库范围内才会显现的
> 时长/缓动清单。其结果归入上述严重程度分级和问题数量上限，
> 而非采用一套独立标准。

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的辩解

| 辩解 | 事实 |
|---|---|
| “框架默认会正确处理动画” | 框架默认值是通用的。缓动、时序和交错必须针对每种交互单独指定，而不能直接继承。 |
| “实线边框比多层阴影更简单” | 实线边框传达的是结构；深度需要透明度。使用边框表现层级会显得厚重而扁平。 |
| “几何居中才是正确的，视觉调整只是在无谓争论” | 对于不对称形状（图标、播放三角形），几何中心在视觉上会产生偏差。视觉对齐带来的差异，用户能够感受到，却无法明确说出。 |
| “动效只是可选的细节优化，没有它界面也能正常工作” | 动效是一种反馈。没有动效，状态变化会变得含糊（操作生效了吗？）。但动效必须克制——让所有元素都动起来只会制造噪声。 |
| “点击区域等同于可见区域” | 20px 的图标在触摸设备上需要 44px 的点击区域。点击区域重叠或过小是最常见的移动端可用性缺陷。 |
| “`transition: all` 很方便” | 它会过渡你无意过渡的属性（布局、颜色），从而导致意外动画。始终明确指定具体属性。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 进入动画使用 `ease-in`（应使用 `ease-out`）
- 嵌套元素的圆角半径不匹配（不存在同心关系）
- 使用实线边框而不是半透明阴影来表现深度/层级
- 使用 `transition: all`，而不是指定具体属性
- 点击区域小于 40×40px，或点击区域相互重叠
- 动态更新的数字未使用 `tabular-nums`（每次更新都会导致布局偏移）
- 图标描边粗细与相邻文本字重不匹配
- 每种状态使用单独的图标资源文件，而不是通过 `currentColor` 重新着色
- 页面加载时的进入动画在未跳过的情况下触发（`initial={false}`）
- 使用 `will-change: all`，或永久设置 `will-change`，而不是仅在出现卡顿时设置
- 动画没有 `prefers-reduced-motion` 分支（或该分支只是缩短时长，而不是移除位移）
- 可以使用 `transform` 时，却通过 `top`/`left`/`width`/`height` 驱动移动（每一帧都会引发布局抖动）

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 进入动画减速（`ease-out`）；退出动画加速（`ease-in`），且进入动画的持续时间长于退出动画
- [ ] 每个非装饰性动画都有一个 `prefers-reduced-motion: reduce` 分支
- [ ] 移动使用 `transform`/`opacity`，而不是 `width`/`height`/`top`/`left`
- [ ] 嵌套元素遵循 `outerRadius = innerRadius + padding`
- [ ] 层次感使用半透明阴影；结构使用边框
- [ ] 每个 `transition` 都指定确切属性（不使用 `transition: all`）
- [ ] 点击区域满足最小 44×44px（触摸）/40×40px（桌面端）的要求，且彼此不重叠
- [ ] 动态数字使用 `tabular-nums`；标题使用 `text-wrap: balance`
- [ ] 图标使用与文本匹配的统一描边粗细；状态通过 `currentColor` 表示，而非使用单独的资源
- [ ] 首次渲染时跳过进入动画（`initial={false}` 或等效方式）
- [ ] 高频交互不使用自定义动画；动效不是唯一的反馈方式

<!-- moai:evolvable-end -->