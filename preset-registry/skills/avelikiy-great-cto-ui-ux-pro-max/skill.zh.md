---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---
# UI/UX Pro Max - 设计智能

面向 Web 和移动应用的综合设计指南。包含 50 多种风格、161 套配色方案、57 组字体搭配、161 种带有推理规则的产品类型、99 条 UX 指南，以及覆盖 10 种技术栈的 25 种图表类型。提供可搜索的数据库，并支持基于优先级的建议。

## 何时应用

当任务涉及**UI 结构、视觉设计决策、交互模式或用户体验质量控制**时，应使用此 Skill。

### 必须使用

在以下情况下必须调用此 Skill：

- 设计新页面（落地页、仪表盘、管理后台、SaaS、移动应用）
- 创建或重构 UI 组件（按钮、模态框、表单、表格、图表等）
- 选择配色方案、字体系统、间距规范或布局系统
- 审查 UI 代码的用户体验、无障碍性或视觉一致性
- 实现导航结构、动画或响应式行为
- 做出产品层面的设计决策（风格、信息层级、品牌表达）
- 提升界面的感知质量、清晰度或易用性

### 推荐使用

在以下情况下推荐使用此 Skill：

- UI 看起来“不够专业”，但原因不明确
- 收到有关易用性或体验的反馈
- 上线前进行 UI 质量优化
- 统一跨平台设计（Web / iOS / Android）
- 构建设计系统或可复用组件库

### 无需使用

在以下情况下不需要使用此 Skill：

- 纯后端逻辑开发
- 仅涉及 API 或数据库设计
- 与界面无关的性能优化
- 基础设施或 DevOps 工作
- 非可视化脚本或自动化任务

**判断标准**：如果任务会改变某项功能的**外观、感受、动效或交互方式**，则应使用此 Skill。

## 按优先级划分的规则类别

*供人类/AI 参考：按照优先级 1→10 决定首先关注哪个规则类别；需要时使用 `--domain <Domain>` 查询详细信息。脚本不会读取此表。*

| 优先级 | 类别 | 影响 | 领域 | 关键检查项（必须具备） | 反模式（应避免） |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | 无障碍性 | 严重 | `ux` | 对比度 4.5:1、替代文本、键盘导航、ARIA 标签 | 移除焦点环、仅使用图标但无标签的按钮 |
| 2 | 触控与交互 | 严重 | `ux` | 最小尺寸 44×44px、间距 8px 以上、加载反馈 | 仅依赖悬停、状态瞬时变化（0ms） |
| 3 | 性能 | 高 | `ux` | WebP/AVIF、延迟加载、预留空间（CLS &lt; 0.1） | 布局抖动、累积布局偏移 |
| 4 | 风格选择 | 高 | `style`、`product` | 匹配产品类型、保持一致性、使用 SVG 图标（不使用表情符号） | 随意混合扁平化与拟物化风格、使用表情符号作为图标 |
| 5 | 布局与响应式设计 | 高 | `ux` | 移动优先断点、视口元标签、无水平滚动 | 水平滚动、固定像素容器宽度、禁用缩放 |
| 6 | 字体与颜色 | 中 | `typography`、`color` | 基础字号 16px、行高 1.5、语义化颜色令牌 | 正文字号 &lt; 12px、灰底灰字、在组件中直接使用十六进制颜色值 |
| 7 | 动画 | 中 | `ux` | 时长 150–300ms、动效传达含义、空间连续性 | 纯装饰性动画、为宽度/高度添加动画、不支持减少动态效果 |
| 8 | 表单与反馈 | 中 | `ux` | 可见标签、字段附近显示错误、辅助文本、渐进式披露 | 仅使用占位符作为标签、只在顶部显示错误、一次性呈现过多信息 |
| 9 | 导航模式 | 高 | `ux` | 可预测的返回行为、底部导航不超过 5 项、深度链接 | 导航负载过重、返回行为异常、无深度链接 |
| 10 | 图表与数据 | 低 | `chart` | 图例、工具提示、无障碍配色 | 仅依赖颜色传达含义 |

## 快速参考

### 1. 无障碍（关键）

- `color-contrast` - 普通文本的最低对比度为 4.5:1（大号文本为 3:1）；Material Design
- `focus-states` - 交互元素上应有可见的焦点环（2–4px；Apple HIG、MD）
- `alt-text` - 为有意义的图像提供描述性替代文本
- `aria-labels` - 仅含图标的按钮应使用 aria-label；原生应用中使用 accessibilityLabel（Apple HIG）
- `keyboard-nav` - Tab 顺序与视觉顺序一致；提供完整的键盘支持（Apple HIG）
- `form-labels` - 使用带有 for 属性的 label
- `skip-links` - 为键盘用户提供跳转到主要内容的链接
- `heading-hierarchy` - 按顺序使用 h1→h6，不跳过层级
- `color-not-only` - 不要仅通过颜色传达信息（添加图标/文本）
- `dynamic-type` - 支持系统文本缩放；避免文本增大时被截断（Apple Dynamic Type、MD）
- `reduced-motion` - 遵循 prefers-reduced-motion；当用户提出要求时减少/禁用动画（Apple Reduced Motion API、MD）
- `voiceover-sr` - 提供有意义的 accessibilityLabel/accessibilityHint；为 VoiceOver/屏幕阅读器设置合理的阅读顺序（Apple HIG、MD）
- `escape-routes` - 在模态框和多步骤流程中提供取消/返回选项（Apple HIG）
- `keyboard-shortcuts` - 保留系统和无障碍快捷键；为拖放操作提供键盘替代方式（Apple HIG）

### 2. 触控与交互（关键）

- `touch-target-size` - 最小尺寸为 44×44pt（Apple）/ 48×48dp（Material）；如有需要，将点击区域扩展到视觉边界之外
- `touch-spacing` - 触控目标之间至少保留 8px/8dp 的间距（Apple HIG、MD）
- `hover-vs-tap` - 主要交互使用点击/轻触；不要仅依赖悬停
- `loading-buttons` - 在异步操作期间禁用按钮；显示加载指示器或进度
- `error-feedback` - 在问题附近显示清晰的错误消息
- `cursor-pointer` - 为可点击元素添加 cursor-pointer（Web）
- `gesture-conflicts` - 避免在主要内容上使用水平滑动；优先使用垂直滚动
- `tap-delay` - 使用 touch-action: manipulation 减少 300ms 延迟（Web）
- `standard-gestures` - 始终使用平台标准手势；不要重新定义（例如向后轻扫、双指缩放）（Apple HIG）
- `system-gestures` - 不要阻止系统手势（控制中心、返回轻扫等）（Apple HIG）
- `press-feedback` - 按下时提供视觉反馈（涟漪/高亮；MD 状态层）
- `haptic-feedback` - 为确认和重要操作使用触觉反馈；避免过度使用（Apple HIG）
- `gesture-alternative` - 不要仅依赖手势交互；始终为关键操作提供可见控件
- `safe-area-awareness` - 让主要触控目标远离刘海、灵动岛、手势条和屏幕边缘
- `no-precision-required` - 避免要求用户精准点击小图标或细窄边缘
- `swipe-clarity` - 滑动操作必须提供清晰的可操作提示或引导（箭头、标签、教程）
- `drag-threshold` - 在开始拖动前设置移动阈值，以避免意外拖动

### 3. 性能（高）

- `image-optimization` - 使用 WebP/AVIF、响应式图像（srcset/sizes），延迟加载非关键资源
- `image-dimension` - 声明 width/height 或使用 aspect-ratio，防止布局偏移（Core Web Vitals：CLS）
- `font-loading` - 使用 font-display: swap/optional 避免文本不可见（FOIT）；预留空间以减少布局偏移（MD）
- `font-preload` - 仅预加载关键字体；避免对每个字体变体过度使用 preload
- `critical-css` - 优先加载首屏 CSS（内联关键 CSS 或尽早加载样式表）
- `lazy-loading` - 通过 dynamic import / 路由级拆分延迟加载非首屏组件
- `bundle-splitting` - 按路由/功能拆分代码（React Suspense / Next.js dynamic），以减少初始加载时间和 TTI
- `third-party-scripts` - 使用 async/defer 加载第三方脚本；审查并移除不必要的脚本（MD）
- `reduce-reflows` - 避免频繁读取/写入布局；先批量读取 DOM，再批量写入
- `content-jumping` - 为异步内容预留空间，避免布局跳动（Core Web Vitals：CLS）
- `lazy-load-below-fold` - 对首屏以下的图像和大型媒体使用 loading="lazy"
- `virtualize-lists` - 对包含 50 个以上项目的列表进行虚拟化，以提高内存效率和滚动性能
- `main-thread-budget` - 为实现 60fps，将每帧工作保持在约 16ms 以内；将繁重任务移出主线程（HIG、MD）
- `progressive-loading` - 对耗时超过 1 秒的操作使用骨架屏/微光效果，而不是长时间阻塞式加载指示器（Apple HIG）
- `input-latency` - 将轻触/滚动的输入延迟保持在约 100ms 以内（Material 响应性标准）
- `tap-feedback-speed` - 在轻触后的 100ms 内提供视觉反馈（Apple HIG）
- `debounce-throttle` - 对高频事件（滚动、调整大小、输入）使用 debounce/throttle
- `offline-support` - 提供离线状态提示和基本的回退方案（PWA / 移动端）
- `network-fallback` - 为慢速网络提供降级模式（较低分辨率的图像、更少的动画）

### 4. 风格选择（高优先级）

- `style-match` - 使风格与产品类型相匹配（使用 `--design-system` 获取建议）
- `consistency` - 所有页面使用统一风格
- `no-emoji-icons` - 使用 SVG 图标（Heroicons、Lucide），而非表情符号
- `color-palette-from-product` - 根据产品/行业选择配色方案（搜索 `--domain color`）
- `effects-match-style` - 阴影、模糊和圆角应与所选风格保持一致（玻璃拟态 / 扁平化 / 黏土风等）
- `platform-adaptive` - 遵循平台设计惯例（iOS HIG 与 Material）：导航、控件、排版、动效
- `state-clarity` - 在保持风格一致的同时，使悬停、按下和禁用状态在视觉上有明确区分（Material 状态层）
- `elevation-consistent` - 为卡片、浮层和模态框使用一致的层级/阴影体系；避免随意使用阴影值
- `dark-mode-pairing` - 同时设计浅色和深色变体，确保品牌、对比度和风格保持一致
- `icon-style-consistent` - 在整个产品中使用同一套图标/视觉语言（描边宽度、圆角半径）
- `system-controls` - 优先使用原生/系统控件，而非完全自定义的控件；仅在品牌塑造有要求时才进行定制（Apple HIG）
- `blur-purpose` - 使用模糊效果表示背景失焦（模态框、浮层），不要将其用作装饰（Apple HIG）
- `primary-action` - 每个界面只应有一个主要 CTA；次要操作应在视觉上处于从属地位（Apple HIG）

### 5. 布局与响应式设计（高优先级）

- `viewport-meta` - width=device-width initial-scale=1（绝不禁用缩放）
- `mobile-first` - 优先设计移动端，然后扩展至平板电脑和桌面端
- `breakpoint-consistency` - 使用系统化的断点（例如 375 / 768 / 1024 / 1440）
- `readable-font-size` - 移动端正文最小字号为 16px（避免 iOS 自动缩放）
- `line-length-control` - 移动端每行 35–60 个字符；桌面端每行 60–75 个字符
- `horizontal-scroll` - 移动端不得出现横向滚动；确保内容适应视口宽度
- `spacing-scale` - 使用以 4pt/8dp 为增量的间距系统（Material Design）
- `touch-density` - 保持适合触控操作的舒适组件间距：既不过于拥挤，也不会导致误触
- `container-width` - 桌面端使用一致的最大宽度（max-w-6xl / 7xl）
- `z-index-management` - 定义分层的 z-index 体系（例如 0 / 10 / 20 / 40 / 100 / 1000）
- `fixed-element-offset` - 固定导航栏/底部栏必须为其下方内容预留安全间距
- `scroll-behavior` - 避免使用会干扰主要滚动体验的嵌套滚动区域
- `viewport-units` - 移动端优先使用 min-h-dvh，而非 100vh
- `orientation-support` - 确保布局在横屏模式下仍清晰易读且便于操作
- `content-priority` - 在移动端优先展示核心内容；折叠或隐藏次要内容
- `visual-hierarchy` - 通过尺寸、间距和对比度建立视觉层级，而非仅依赖颜色

### 6. 排版与颜色（中优先级）

- `line-height` - 正文使用 1.5-1.75 的行高
- `line-length` - 每行限制为 65-75 个字符
- `font-pairing` - 标题字体与正文字体的风格特征应相匹配
- `font-scale` - 使用一致的字号层级（例如 12 14 16 18 24 32）
- `contrast-readability` - 在浅色背景上使用更深的文本颜色（例如白色背景上的 slate-900）
- `text-styles-system` - 使用平台排版系统：iOS 11 Dynamic Type 样式 / Material 5 字体角色（display、headline、title、body、label）（HIG、MD）
- `weight-hierarchy` - 使用字重强化层级：标题使用粗体（600–700），正文使用常规字重（400），标签使用中等字重（500）（MD）
- `color-semantic` - 定义语义化颜色令牌（primary、secondary、error、surface、on-surface），而非在组件中直接使用原始十六进制颜色值（Material 颜色系统）
- `color-dark-mode` - 深色模式应使用降低饱和度 / 更浅的色调变体，而非反转颜色；需单独测试对比度（HIG、MD）
- `color-accessible-pairs` - 前景色/背景色组合必须达到 4.5:1（AA）或 7:1（AAA）；使用工具进行验证（WCAG、MD）
- `color-not-decorative-only` - 功能性颜色（错误红色、成功绿色）必须搭配图标/文本；避免仅使用颜色传达含义（HIG、MD）
- `truncation-strategy` - 优先换行而非截断；必须截断时使用省略号，并通过工具提示/展开功能提供完整文本（Apple HIG）
- `letter-spacing` - 遵循各平台的默认字间距；避免对正文使用过紧的字距（HIG、MD）
- `number-tabular` - 数据列、价格和计时器使用等宽数字/等宽字体数字，以防止布局偏移
- `whitespace-balance` - 有意识地使用留白来归组相关项目并分隔各个区块；避免视觉杂乱（Apple HIG）

### 7. 动画（中等）

- `duration-timing` - 微交互使用 150–300ms；复杂过渡 ≤400ms；避免 >500ms（MD）
- `transform-performance` - 仅使用 transform/opacity；避免对 width/height/top/left 设置动画
- `loading-states` - 加载超过 300ms 时显示骨架屏或进度指示器
- `excessive-motion` - 每个视图最多为 1-2 个关键元素设置动画
- `easing` - 进入时使用 ease-out，退出时使用 ease-in；UI 过渡避免使用 linear
- `motion-meaning` - 每个动画都必须表达因果关系，而不能仅用于装饰（Apple HIG）
- `state-transition` - 状态变化（hover / active / expanded / collapsed / modal）应平滑过渡，而非瞬间切换
- `continuity` - 页面/屏幕过渡应保持空间连续性（共享元素、定向滑动）（Apple HIG）
- `parallax-subtle` - 谨慎使用视差效果；必须遵循减少动态效果设置，并且不能造成方向感混乱（Apple HIG）
- `spring-physics` - 优先使用基于弹簧/物理效果的曲线，而非 linear 或 cubic-bezier，以获得自然的观感（Apple HIG 流畅动画）
- `exit-faster-than-enter` - 退出动画应短于进入动画（约为进入时长的 60–70%），以营造响应迅速的感觉（MD 动效）
- `stagger-sequence` - 列表/网格项的进入动画应逐项错开 30–50ms；避免同时出现或过慢地逐项显现（MD）
- `shared-element-transition` - 使用共享元素 / hero 过渡，在屏幕之间保持视觉连续性（MD、HIG）
- `interruptible` - 动画必须可中断；用户轻触/手势操作应立即取消正在进行的动画（Apple HIG）
- `no-blocking-animation` - 绝不能在动画期间阻止用户输入；UI 必须保持可交互（Apple HIG）
- `fade-crossfade` - 在同一容器内替换内容时使用交叉淡化（MD）
- `scale-feedback` - 可轻触的卡片/按钮在按下时进行细微缩放（0.95–1.05）；松开时恢复（HIG、MD）
- `gesture-feedback` - 拖动、滑动和捏合操作必须提供实时视觉响应，跟随手指移动（MD 动效）
- `hierarchy-motion` - 使用位移/缩放方向表达层级关系：从下方进入 = 更深层级，向上退出 = 返回（MD）
- `motion-consistency` - 在全局统一时长/缓动 token；所有动画应具有相同的节奏和观感
- `opacity-threshold` - 淡出的元素不应长时间停留在低于 0.2 的 opacity；要么完全淡出，要么保持可见
- `modal-motion` - 模态框/面板应从其触发源开始执行动画（缩放+淡入淡出或滑入），以提供空间上下文（HIG、MD）
- `navigation-direction` - 向前导航时向左/上方运动；向后导航时向右/下方运动——保持方向逻辑一致（HIG）
- `layout-shift-avoid` - 动画不得导致布局重排或 CLS；位置变化应使用 transform

### 8. 表单与反馈（中等）

- `input-labels` - 每个输入框都应有可见标签（不能仅使用占位符）
- `error-placement` - 在相关字段下方显示错误
- `submit-feedback` - 提交时依次显示加载和成功/错误状态
- `required-indicators` - 标记必填字段（例如星号）
- `empty-states` - 没有内容时显示有帮助的信息和操作
- `toast-dismiss` - Toast 在 3-5 秒后自动消失
- `confirmation-dialogs` - 执行破坏性操作前要求确认
- `input-helper-text` - 在复杂输入框下方提供持续显示的辅助文本，而不能仅使用占位符（Material Design）
- `disabled-states` - 禁用元素应使用较低的 opacity（0.38–0.5）+ 光标变化 + 语义属性（MD）
- `progressive-disclosure` - 逐步展示复杂选项；不要一开始就向用户提供过多信息（Apple HIG）
- `inline-validation` - 在失去焦点时验证（而非每次按键时）；仅在用户完成输入后显示错误（MD）
- `input-type-keyboard` - 使用语义化输入类型（email、tel、number），以触发正确的移动端键盘（HIG、MD）
- `password-toggle` - 为密码字段提供显示/隐藏切换按钮（MD）
- `autofill-support` - 使用 autocomplete / textContentType 属性，以便系统自动填充（HIG、MD）
- `undo-support` - 对破坏性操作或批量操作提供撤销功能（例如显示“撤销删除”的 Toast）（Apple HIG）
- `success-feedback` - 使用简短的视觉反馈（勾选标记、Toast、颜色闪烁）确认操作已完成（MD）
- `error-recovery` - 错误消息必须包含清晰的恢复路径（重试、编辑、帮助链接）（HIG、MD）
- `multi-step-progress` - 多步骤流程应显示步骤指示器或进度条；允许向后导航（MD）
- `form-autosave` - 长表单应自动保存草稿，避免意外关闭时丢失数据（Apple HIG）
- `sheet-dismiss-confirm` - 关闭包含未保存更改的面板/模态框前要求确认（Apple HIG）
- `error-clarity` - 错误消息必须说明原因 + 修复方法（不能只显示“输入无效”）（HIG、MD）
- `field-grouping` - 按逻辑对相关字段进行分组（fieldset/legend 或视觉分组）（MD）
- `read-only-distinction` - 只读状态应在视觉和语义上与禁用状态有所区别（MD）
- `focus-management` - 提交出错后，自动聚焦第一个无效字段（WCAG、MD）
- `error-summary` - 出现多个错误时，在顶部显示摘要，并提供指向各字段的锚点链接（WCAG）
- `touch-friendly-input` - 移动端输入框高度 ≥44px，以满足触控目标要求（Apple HIG）
- `destructive-emphasis` - 破坏性操作使用具有语义的危险色（红色），并在视觉上与主要操作分隔（HIG、MD）
- `toast-accessibility` - Toast 不得抢占焦点；使用 aria-live="polite" 让屏幕阅读器播报（WCAG）
- `aria-live-errors` - 表单错误使用 aria-live 区域或 role="alert" 通知屏幕阅读器（WCAG）
- `contrast-feedback` - 错误和成功状态的颜色必须满足 4.5:1 的对比度（WCAG、MD）
- `timeout-feedback` - 请求超时后必须显示清晰的反馈，并提供重试选项（MD）

### 9. 导航模式（高优先级）

- `bottom-nav-limit` - 底部导航最多包含 5 个项目；使用图标搭配文本标签（Material Design）
- `drawer-usage` - 抽屉式菜单/侧边栏应用于次级导航，而非主要操作（Material Design）
- `back-behavior` - 返回导航必须可预测且保持一致；保留滚动位置/状态（Apple HIG、MD）
- `deep-linking` - 所有关键页面都必须可通过深层链接/URL 访问，以便分享和发送通知（Apple HIG、MD）
- `tab-bar-ios` - iOS：使用底部标签栏进行顶层导航（Apple HIG）
- `top-app-bar-android` - Android：使用带导航图标的顶部应用栏来呈现主要结构（Material Design）
- `nav-label-icon` - 导航项必须同时包含图标和文本标签；仅使用图标的导航会降低可发现性（MD）
- `nav-state-active` - 必须在导航中以视觉方式突出显示当前位置（颜色、字重、指示器）（HIG、MD）
- `nav-hierarchy` - 必须明确区分主导航（标签页/底部栏）和次级导航（抽屉式菜单/设置）（MD）
- `modal-escape` - 模态框和面板必须提供明确的关闭/取消方式；在移动端支持向下滑动关闭（Apple HIG）
- `search-accessible` - 搜索必须易于访问（位于顶部栏或标签页中）；提供最近使用/建议的查询（MD）
- `breadcrumb-web` - Web：对于 3 层以上的深层层级结构，使用面包屑帮助用户确定位置（MD）
- `state-preservation` - 返回时必须恢复之前的滚动位置、筛选状态和输入内容（HIG、MD）
- `gesture-nav-support` - 支持系统手势导航（iOS 侧滑返回、Android 预测性返回），且不得产生冲突（HIG、MD）
- `tab-badge` - 谨慎使用导航项上的徽标来表示未读/待处理内容；用户访问后清除徽标（HIG、MD）
- `overflow-menu` - 当操作数量超出可用空间时，使用溢出/更多菜单，而不是强行塞入所有操作（MD）
- `bottom-nav-top-level` - 底部导航仅用于顶层页面；绝不能在其中嵌套子导航（MD）
- `adaptive-navigation` - 大屏幕（≥1024px）优先使用侧边栏；小屏幕使用底部/顶部导航（Material Adaptive）
- `back-stack-integrity` - 绝不能在没有提示的情况下重置导航堆栈，或意外跳转到首页（HIG、MD）
- `navigation-consistency` - 导航位置必须在所有页面中保持一致；不要因页面类型而改变
- `avoid-mixed-patterns` - 不要在同一层级混用标签页、侧边栏和底部导航
- `modal-vs-navigation` - 不得将模态框用于主要导航流程；它们会中断用户的操作路径（HIG）
- `focus-on-route-change` - 页面转换后，将焦点移至主要内容区域，以方便屏幕阅读器用户（WCAG）
- `persistent-nav` - 从深层页面必须仍能访问核心导航；不要在子流程中将其完全隐藏（HIG、MD）
- `destructive-nav-separation` - 危险操作（删除账户、退出登录）必须在视觉和空间上与普通导航项分隔开（HIG、MD）
- `empty-nav-state` - 当某个导航目标不可用时，应说明原因，而不是直接将其隐藏（MD）

### 10. 图表与数据（低优先级）

- `chart-type` - 根据数据类型选择图表类型（趋势 → 折线图、比较 → 条形图、占比 → 饼图/环形图）
- `color-guidance` - 使用无障碍配色方案；避免仅使用红色/绿色组合，以照顾色盲用户（WCAG、MD）
- `data-table` - 提供表格作为无障碍替代方案；单独使用图表对屏幕阅读器并不友好（WCAG）
- `pattern-texture` - 使用图案、纹理或形状作为颜色的补充，使数据无需依赖颜色也能区分（WCAG、MD）
- `legend-visible` - 始终显示图例；将其放置在图表附近，不要让图例与图表分离并位于滚动区域下方（MD）
- `tooltip-on-interact` - 在悬停（Web）或点击（移动端）时提供工具提示/数据标签，显示准确数值（HIG、MD）
- `axis-labels` - 使用单位和易读的刻度标注坐标轴；避免在移动端使用截断或旋转的标签
- `responsive-chart` - 图表必须能在小屏幕上重新布局或简化（例如使用水平条形图代替垂直条形图、减少刻度数量）
- `empty-data-state` - 没有数据时显示有意义的空状态（“暂无数据”+ 引导），而不是空白图表（MD）
- `loading-chart` - 图表数据加载时使用骨架屏或微光占位效果；不要显示空的坐标轴框架
- `animation-optional` - 图表入场动画必须遵循 prefers-reduced-motion；数据应立即可读（HIG）
- `large-dataset` - 对于 1000 个以上的数据点，应进行聚合或采样；提供下钻功能来查看详细信息，而不是渲染全部数据点（MD）
- `number-formatting` - 对坐标轴和标签中的数字、日期、货币使用符合区域设置的格式（HIG、MD）
- `touch-target-chart` - 交互式图表元素（数据点、区段）的点击区域必须 ≥44pt，或在触摸时扩大（Apple HIG）
- `no-pie-overuse` - 类别超过 5 个时避免使用饼图/环形图；改用条形图以提升清晰度
- `contrast-data` - 数据线条/条形与背景之间的对比度 ≥3:1；数据文本标签的对比度 ≥4.5:1（WCAG）
- `legend-interactive` - 图例应可点击，以切换数据系列的可见性（MD）
- `direct-labeling` - 对于小型数据集，直接在图表上标注数值，以减少视线移动
- `tooltip-keyboard` - 工具提示内容必须可通过键盘访问，且不能仅依赖悬停触发（WCAG）
- `sortable-table` - 数据表格必须支持排序，并使用 aria-sort 指示当前排序状态（WCAG）
- `axis-readability` - 坐标轴刻度不得过于拥挤；保持可读的间距，并在小屏幕上自动跳过部分刻度
- `data-density` - 限制每张图表的信息密度，以避免认知负担过重；必要时拆分为多个图表
- `trend-emphasis` - 突出数据趋势而非装饰；避免使用会遮蔽数据的强渐变/阴影
- `gridline-subtle` - 网格线应使用低对比度（例如 gray-200），避免与数据争夺视觉注意力
- `focusable-elements` - 交互式图表元素（数据点、条形、扇区）必须可通过键盘导航（WCAG）
- `screen-reader-summary` - 提供文本摘要或 aria-label，为屏幕阅读器描述图表的关键洞察（WCAG）
- `error-state-chart` - 数据加载失败时必须显示错误消息和重试操作，而不是损坏的图表或空白图表
- `export-option` - 对于数据密集型产品，提供将图表数据导出为 CSV/图像的选项
- `drill-down-consistency` - 下钻交互必须保留清晰的返回路径和层级面包屑
- `time-scale-clarity` - 时间序列图必须清楚标注时间粒度（日/周/月），并允许切换

## 使用方法

使用下方的 CLI 工具搜索特定领域。

---

## 前置条件

检查是否已安装 Python：

```bash
python3 --version || python --version
```

如果未安装 Python，请根据用户的操作系统进行安装：

**macOS：**
```bash
brew install python3
```

**Ubuntu/Debian：**
```bash
sudo apt update && sudo apt install python3
```

**Windows：**
```powershell
winget install Python.Python.3.12
```

---

## 如何使用此 Skill

当用户提出以下任一请求时，请使用此 Skill：

| 场景 | 触发示例 | 从此处开始 |
|----------|-----------------|------------|
| **新项目 / 页面** | “构建一个落地页”“构建一个仪表盘” | 步骤 1 → 步骤 2（设计系统） |
| **新组件** | “创建一个定价卡片”“添加一个模态框” | 步骤 3（领域搜索：style、ux） |
| **选择风格 / 颜色 / 字体** | “什么风格适合金融科技应用？”“推荐一个配色方案” | 步骤 2（设计系统） |
| **审查现有 UI** | “审查此页面的 UX 问题”“检查无障碍性” | 上方的快速参考检查清单 |
| **修复 UI 错误** | “按钮悬停效果失效”“页面加载时布局偏移” | 快速参考 → 相关章节 |
| **改进 / 优化** | “让它运行得更快”“改善移动端体验” | 步骤 3（领域搜索：ux、react） |
| **实现深色模式** | “添加深色模式支持” | 步骤 3（领域：style “dark mode”） |
| **添加图表 / 数据可视化** | “添加一个分析仪表盘图表” | 步骤 3（领域：chart） |
| **技术栈最佳实践** | “React 性能技巧”、“SwiftUI 导航” | 步骤 4（技术栈搜索） |

请遵循以下工作流程：

### 步骤 1：分析用户需求

从用户请求中提取关键信息：
- **产品类型**：娱乐类（社交、视频、音乐、游戏）、工具类（扫描器、编辑器、转换器）、效率类（任务管理器、笔记、日历）或混合类型
- **目标受众**：C 端消费者用户；考虑年龄段、使用场景（通勤、休闲、工作）
- **风格关键词**：趣味、鲜明、极简、深色模式、内容优先、沉浸式等
- **技术栈**：React Native（本项目唯一的技术栈）

### 步骤 2：生成设计系统（必需）

**始终从 `--design-system` 开始**，以获取带有推理依据的全面建议：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

此命令会：
1. 并行搜索多个领域（product、style、color、landing、typography）
2. 应用 `ui-reasoning.csv` 中的推理规则来选择最佳匹配项
3. 返回完整的设计系统：模式、风格、颜色、字体排印、效果
4. 包含应避免的反模式

**示例：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### 步骤 2b：持久化设计系统（主配置 + 覆盖配置模式）

要保存设计系统以便**跨会话进行分层检索**，请添加 `--persist`：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

这会创建：
- `design-system/MASTER.md` — 包含所有设计规则的全局事实来源
- `design-system/pages/` — 用于存放页面特定覆盖规则的文件夹

**使用页面特定覆盖规则：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

这还会创建：
- `design-system/pages/dashboard.md` — 相对于主文件的页面特定差异

**分层检索的工作原理：**
1. 构建特定页面（例如“结账”）时，首先检查 `design-system/pages/checkout.md`
2. 如果页面文件存在，其规则将**覆盖**主文件
3. 如果不存在，则仅使用 `design-system/MASTER.md`

**上下文感知检索提示词：**
```
I am building the [Page Name] page. Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
Now, generate the code...
```

### 第 3 步：根据需要通过详细搜索进行补充

获取设计系统后，使用领域搜索获取更多详细信息：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**何时使用详细搜索：**

| 需求 | 领域 | 示例 |
|------|--------|---------|
| 产品类型模式 | `product` | `--domain product "entertainment social"` |
| 更多样式选项 | `style` | `--domain style "glassmorphism dark"` |
| 调色板 | `color` | `--domain color "entertainment vibrant"` |
| 字体搭配 | `typography` | `--domain typography "playful modern"` |
| 图表建议 | `chart` | `--domain chart "real-time dashboard"` |
| UX 最佳实践 | `ux` | `--domain ux "animation accessibility"` |
| 备选字体 | `typography` | `--domain typography "elegant luxury"` |
| 单个 Google Fonts 字体 | `google-fonts` | `--domain google-fonts "sans serif popular variable"` |
| 落地页结构 | `landing` | `--domain landing "hero social-proof"` |
| React Native 性能 | `react` | `--domain react "rerender memo list"` |
| 应用界面无障碍支持 | `web` | `--domain web "accessibilityLabel touch safe-areas"` |
| AI 提示词 / CSS 关键词 | `prompt` | `--domain prompt "minimalism"` |

### 第 4 步：技术栈指南（React Native）

获取 React Native 实现相关的最佳实践：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react-native
```

---

## 搜索参考

### 可用领域

| 领域 | 用途 | 示例关键词 |
|--------|---------|------------------|
| `product` | 产品类型建议 | SaaS、电子商务、作品集、医疗保健、美容、服务 |
| `style` | UI 样式、颜色、效果 | 玻璃拟态、极简主义、深色模式、粗野主义 |
| `typography` | 字体搭配、Google Fonts | 优雅、活泼、专业、现代 |
| `color` | 按产品类型划分的调色板 | SaaS、电子商务、医疗保健、美容、金融科技、服务 |
| `landing` | 页面结构、CTA 策略 | 首屏、以首屏为中心、用户评价、定价、社会认同 |
| `chart` | 图表类型、库建议 | 趋势、比较、时间线、漏斗图、饼图 |
| `ux` | 最佳实践、反模式 | 动画、无障碍、层叠顺序、加载 |
| `google-fonts` | 单个 Google Fonts 字体查询 | 无衬线体、等宽字体、日文字体、可变字体、热门字体 |
| `react` | React/Next.js 性能 | 瀑布流、包体积、Suspense、记忆化、重新渲染、缓存 |
| `web` | 应用界面指南（iOS/Android/React Native） | accessibilityLabel、触摸目标、安全区域、动态字体 |
| `prompt` | AI 提示词、CSS 关键词 | （样式名称） |

### 可用技术栈

| 技术栈 | 重点 |
|-------|-------|
| `react-native` | 组件、导航、列表 |

---

## 工作流示例

**用户请求：**“制作一个 AI 搜索主页。”

### 第 1 步：分析需求
- 产品类型：工具（AI 搜索引擎）
- 目标受众：希望获得快速、智能搜索体验的 C 端用户
- 风格关键词：现代、极简、内容优先、深色模式
- 技术栈：React Native

### 第 2 步：生成设计系统（必需）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "AI search tool modern minimal" --design-system -p "AI Search"
```

**输出：**包含模式、风格、颜色、字体、效果和反模式的完整设计系统。

### 第 3 步：通过详细搜索进行补充（按需）

```bash
# Get style options for a modern tool product
python3 skills/ui-ux-pro-max/scripts/search.py "minimalism dark mode" --domain style

# Get UX best practices for search interaction and loading
python3 skills/ui-ux-pro-max/scripts/search.py "search loading animation" --domain ux
```

### 第 4 步：技术栈指南

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "list performance navigation" --stack react-native
```

**然后：**综合设计系统与详细搜索结果，并实现设计。

---

## 输出格式

`--design-system` 标志支持两种输出格式：

```bash
# ASCII box (default) - best for terminal display
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - best for documentation
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## 获得更好结果的技巧

### 查询策略

- 使用**多维关键词**——组合产品 + 行业 + 基调 + 密度：使用 `"entertainment social vibrant content-dense"`，而不仅仅是 `"app"`
- 针对同一需求尝试不同的关键词：`"playful neon"` → `"vibrant dark"` → `"content-first minimal"`
- 首先使用 `--design-system` 获取完整建议，然后使用 `--domain` 深入探索任何不确定的维度
- 始终添加 `--stack react-native`，以获取特定于实现的指导

### 常见难点

| 问题 | 解决方法 |
|---------|------------|
| 无法确定风格/颜色 | 使用不同的关键词重新运行 `--design-system` |
| 深色模式存在对比度问题 | 快速参考 §6：`color-dark-mode` + `color-accessible-pairs` |
| 动画感觉不自然 | 快速参考 §7：`spring-physics` + `easing` + `exit-faster-than-enter` |
| 表单用户体验较差 | 快速参考 §8：`inline-validation` + `error-clarity` + `focus-management` |
| 导航让人感到困惑 | 快速参考 §9：`nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
| 布局在小屏幕上出现问题 | 快速参考 §5：`mobile-first` + `breakpoint-consistency` |
| 性能问题/卡顿 | 快速参考 §3：`virtualize-lists` + `main-thread-budget` + `debounce-throttle` |

### 交付前检查清单

- 在实现前运行 `--domain ux "animation accessibility z-index loading"`，作为用户体验验证步骤
- 按照快速参考中的 **§1–§3**（严重 + 高优先级）进行最终审查
- 在 375px（小型手机）和横屏方向下进行测试
- 验证启用**减少动态效果**并将 **Dynamic Type** 设置为最大字号时的行为
- 单独检查深色模式的对比度（不要假设浅色模式的值同样适用）
- 确认所有触控目标均 ≥44pt，且没有内容被安全区域遮挡

---

## 专业 UI 的通用规则

以下是经常被忽视、会使 UI 显得不专业的问题：
适用范围说明：以下规则适用于 App UI（iOS/Android/React Native/Flutter），不适用于桌面 Web 交互模式。

### 图标与视觉元素

| 规则 | 标准 | 避免 | 重要性 |
|------|----------|--------|----------------|
| **不要将 Emoji 用作结构性图标** | 使用基于矢量的图标（例如 Lucide、react-native-vector-icons、@expo/vector-icons）。 | 使用 Emoji（🎨 🚀 ⚙️）表示导航、设置或系统控件。 | Emoji 依赖字体，在不同平台上表现不一致，且无法通过设计令牌进行控制。 |
| **仅使用矢量资源** | 使用可清晰缩放并支持主题切换的 SVG 或平台矢量图标。 | 使用会模糊或出现像素化的栅格 PNG 图标。 | 确保可扩展性、清晰渲染，以及对深色/浅色模式的适配能力。 |
| **稳定的交互状态** | 为按压状态使用颜色、不透明度或层级过渡，且不改变布局边界。 | 使用会移动周围内容或引发视觉抖动的布局位移变换。 | 防止交互不稳定，并在移动端保持流畅的动效和感知品质。 |
| **正确使用品牌 Logo** | 使用官方品牌资源，并遵循其使用规范（间距、颜色、净空区域）。 | 猜测 Logo 路径、未经许可重新着色或修改比例。 | 防止品牌误用，并确保符合法律及平台规范。 |
| **一致的图标尺寸** | 将图标尺寸定义为设计令牌（例如 icon-sm、icon-md = 24pt、icon-lg）。 | 随意混用 20pt / 24pt / 28pt 等任意值。 | 在整个界面中保持节奏感和视觉层级。 |
| **描边一致性** | 在同一视觉层级内使用一致的描边宽度（例如 1.5px 或 2px）。 | 随意混用粗细不同的描边样式。 | 不一致的描边会降低视觉精致度和整体协调性。 |
| **严格区分填充与轮廓样式** | 每个层级使用一种图标样式。 | 在同一层级混用填充图标和轮廓图标。 | 保持语义清晰和风格一致。 |
| **最小触控区域** | 交互区域最小为 44×44pt（如果图标较小，请使用 hitSlop）。 | 使用未扩大点击区域的小图标。 | 符合无障碍和平台可用性标准。 |
| **图标对齐** | 将图标与文本基线对齐，并保持一致的内边距。 | 图标未对齐或其周围间距不一致。 | 防止细微的视觉失衡降低感知品质。 |
| **图标对比度** | 遵循 WCAG 对比度标准：小型元素为 4.5:1，较大的 UI 图形符号最低为 3:1。 | 使用与背景融为一体的低对比度图标。 | 确保在浅色和深色模式下均具备无障碍可访问性。 |


### 交互（App）

| 规则 | 应当 | 不应当 |
|------|----|----- |
| **点击反馈** | 在 80-150ms 内提供清晰的按压反馈（波纹/不透明度/层级） | 点击时没有视觉响应 |
| **动画时长** | 将微交互保持在 150-300ms 左右，并使用平台原生缓动效果 | 瞬时切换或缓慢动画（>500ms） |
| **无障碍焦点** | 确保屏幕阅读器的焦点顺序与视觉顺序一致，并使用描述清晰的标签 | 控件没有标签或焦点遍历顺序混乱 |
| **清晰的禁用状态** | 使用禁用语义（`disabled`/原生禁用属性）、降低视觉强调，并禁止点击操作 | 控件看起来可以点击，但点击后没有任何反应 |
| **最小触控区域** | 确保点击区域 >=44x44pt（iOS）或 >=48x48dp（Android）；图标较小时扩大点击区域 | 点击目标过小，或仅以无内边距的图标区域作为点击区域 |
| **防止手势冲突** | 每个区域仅保留一种主要手势，并避免嵌套的点击/拖动冲突 | 手势重叠导致意外操作 |
| **语义化原生控件** | 优先使用具有正确无障碍角色的原生交互基础组件（`Button`、`Pressable` 及平台等效组件） | 使用缺少语义的通用容器作为主要控件 |

### 浅色/深色模式对比度

| 规则 | 应该做 | 不应该做 |
|------|----|----- |
| **表面可读性（浅色）** | 通过足够的不透明度和层级高度，确保卡片/表面与背景清晰区分 | 使用过度透明的表面，导致层级关系模糊 |
| **文本对比度（浅色）** | 正文文本与浅色表面之间的对比度保持 >=4.5:1 | 使用低对比度的灰色正文文本 |
| **文本对比度（深色）** | 在深色表面上，主要文本对比度保持 >=4.5:1，次要文本对比度保持 >=3:1 | 深色模式下的文本与背景融为一体 |
| **边框和分隔线可见性** | 确保分隔元素在两种主题下都清晰可见（而不仅仅是在浅色模式下） | 特定主题的边框在某种模式下消失 |
| **状态对比度一致性** | 确保按下、聚焦和禁用状态在浅色与深色主题下具有同等的可辨识度 | 仅为一种主题定义交互状态 |
| **基于令牌的主题化** | 在应用的表面、文本和图标中使用按主题映射的语义颜色令牌 | 为各个页面硬编码十六进制颜色值 |
| **遮罩和模态框易读性** | 使用足够强的模态框遮罩来突出前景内容（通常为 40-60% 的黑色） | 遮罩过弱，导致背景在视觉上与前景内容相互干扰 |

### 布局与间距

| 规则 | 应该做 | 不应该做 |
|------|----|----- |
| **遵循安全区域** | 所有固定页眉、标签栏和 CTA 栏都应避开顶部和底部安全区域 | 将固定 UI 放置在刘海、状态栏或手势操作区域之下 |
| **系统栏避让** | 为状态栏/导航栏和手势主屏指示条留出间距 | 让可点击内容与操作系统界面元素发生冲突 |
| **一致的内容宽度** | 针对不同设备类别（手机/平板电脑）保持可预期的内容宽度 | 在不同页面之间混用任意宽度 |
| **8dp 间距节奏** | 对内边距、间隙和区块间距使用一致的 4/8dp 间距系统 | 使用毫无规律的随机间距增量 |
| **易读的文本行宽** | 确保长篇文本在大尺寸设备上易于阅读（避免在平板电脑上使用边到边的段落） | 长文本占满全宽，影响可读性 |
| **区块间距层级** | 根据层级定义清晰的垂直间距节奏（例如 16/24/32/48） | 相似 UI 层级使用不一致的间距 |
| **按断点自适应边距** | 在较大宽度和横屏模式下增加水平内边距 | 在所有设备尺寸和方向上使用相同的窄边距 |
| **滚动内容与固定元素共存** | 添加顶部/底部内容内边距，避免列表被固定栏遮挡 | 滚动内容被吸顶页眉/固定页脚遮挡 |

---

## 交付前检查清单

交付 UI 代码前，请核查以下项目：
适用范围说明：此检查清单适用于应用 UI（iOS/Android/React Native/Flutter）。

### 视觉质量
- [ ] 不使用表情符号作为图标（改用 SVG）
- [ ] 所有图标均来自风格一致的同一图标系列
- [ ] 使用官方品牌素材，并确保比例和安全留白正确
- [ ] 按下状态的视觉效果不会改变布局边界或造成抖动
- [ ] 始终使用语义主题令牌（不得针对各页面临时硬编码颜色）

### 交互
- [ ] 所有可点击元素都提供清晰的按下反馈（波纹/透明度/海拔高度）
- [ ] 触控目标达到最小尺寸（iOS >=44x44pt，Android >=48x48dp）
- [ ] 微交互时长保持在 150-300ms 范围内，并采用符合原生体验的缓动效果
- [ ] 禁用状态在视觉上清晰明确，且不可交互
- [ ] 屏幕阅读器的焦点顺序与视觉顺序一致，且交互元素的标签具有描述性
- [ ] 手势区域应避免嵌套或冲突的交互（点击/拖动/返回滑动冲突）

### 浅色/深色模式
- [ ] 主要文本在浅色和深色模式下的对比度均 >=4.5:1
- [ ] 次要文本在浅色和深色模式下的对比度均 >=3:1
- [ ] 分隔线/边框和交互状态在两种模式下均可清晰辨别
- [ ] 模态框/抽屉的遮罩层透明度应足以保证前景内容清晰可读（通常为 40-60% 的黑色）
- [ ] 交付前已测试两种主题（而非根据单一主题推断）

### 布局
- [ ] 标题栏、标签栏和底部 CTA 栏均遵循安全区域
- [ ] 滚动内容不会被固定栏/吸顶栏遮挡
- [ ] 已在小屏手机、大屏手机和平板设备上验证（竖屏 + 横屏）
- [ ] 水平内边距/页边距能够根据设备尺寸和屏幕方向正确调整
- [ ] 在组件、区块和页面各层级均保持 4/8dp 的间距节奏
- [ ] 长篇文本在较大设备上仍保持易读的行宽（段落不会从屏幕一侧延伸到另一侧）

### 无障碍
- [ ] 所有具有实际意义的图片/图标均提供无障碍标签
- [ ] 表单字段具有标签、提示和清晰的错误消息
- [ ] 颜色不是唯一的状态指示方式
- [ ] 支持减少动态效果和动态文本大小，且不会破坏布局
- [ ] 无障碍特征/角色/状态（已选中、已禁用、已展开）均能被正确播报