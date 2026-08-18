---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---
# UI/UX Pro Max - 设计智能

面向 Web 和移动应用的综合设计指南。包含 50+ 种风格、161 个配色方案、57 组字体搭配、161 种产品类型及其推理规则、99 条 UX 指南，以及涵盖 10 个技术栈的 25 种图表类型。支持搜索的数据库，并提供基于优先级的推荐。

## 适用时机

当任务涉及 **UI 结构、视觉设计决策、交互模式或用户体验质量控制** 时，应使用此 Skill。

### 必须使用

在以下情况下必须调用此 Skill：

- 设计新页面（落地页、仪表盘、管理后台、SaaS、移动应用）
- 创建或重构 UI 组件（按钮、模态框、表单、表格、图表等）
- 选择配色方案、排版系统、间距规范或布局系统
- 审查 UI 代码的用户体验、无障碍性或视觉一致性
- 实现导航结构、动画或响应式行为
- 做出产品层面的设计决策（风格、信息层级、品牌表达）
- 提升界面的感知质量、清晰度或易用性

### 建议使用

在以下情况下建议使用此 Skill：

- UI 看起来“不够专业”，但原因不明确
- 收到关于易用性或用户体验的反馈
- 上线前的 UI 质量优化
- 对齐跨平台设计（Web / iOS / Android）
- 构建设计系统或可复用组件库

### 可跳过

在以下情况下不需要使用此 Skill：

- 纯后端逻辑开发
- 仅涉及 API 或数据库设计
- 与界面无关的性能优化
- 基础设施或 DevOps 工作
- 非视觉类脚本或自动化任务

**判断标准**：如果任务会改变某项功能的 **外观、感受、动效或交互方式**，就应使用此 Skill。

## 按优先级划分的规则类别

*供人类/AI 参考：按照优先级 1→10 决定首先关注的规则类别；需要时使用 `--domain <Domain>` 查询详细信息。脚本不会读取此表。*

| 优先级 | 类别 | 影响 | 领域 | 关键检查项（必须具备） | 反模式（应避免） |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | 无障碍性 | 严重 | `ux` | 对比度 4.5:1、替代文本、键盘导航、Aria-label | 移除焦点环、没有标签的纯图标按钮 |
| 2 | 触控与交互 | 严重 | `ux` | 最小尺寸 44×44px、间距至少 8px、加载反馈 | 仅依赖悬停、状态瞬时变化（0ms） |
| 3 | 性能 | 高 | `ux` | WebP/AVIF、延迟加载、预留空间（CLS &lt; 0.1） | 布局抖动、累积布局偏移 |
| 4 | 风格选择 | 高 | `style`、`product` | 匹配产品类型、一致性、SVG 图标（不使用 emoji） | 随意混用扁平化与拟物化风格、使用 emoji 作为图标 |
| 5 | 布局与响应式 | 高 | `ux` | 移动优先断点、Viewport meta、不出现水平滚动 | 水平滚动、固定 px 容器宽度、禁用缩放 |
| 6 | 排版与颜色 | 中 | `typography`、`color` | 基础字号 16px、行高 1.5、语义化颜色 token | 正文小于 12px、灰色文字配灰色背景、在组件中直接使用原始 hex 值 |
| 7 | 动画 | 中 | `ux` | 时长 150–300ms、动效传达含义、空间连续性 | 仅用于装饰的动画、为宽度/高度添加动画、不支持 reduced-motion |
| 8 | 表单与反馈 | 中 | `ux` | 可见标签、字段附近显示错误、辅助文本、渐进式披露 | 仅使用占位符作为标签、仅在顶部显示错误、一次性展示过多内容 |
| 9 | 导航模式 | 高 | `ux` | 可预测的返回行为、底部导航不超过 5 项、深层链接 | 导航过载、返回行为异常、不支持深层链接 |
| 10 | 图表与数据 | 低 | `chart` | 图例、工具提示、无障碍配色 | 仅依靠颜色传达含义 |

## 快速参考

### 1. 无障碍访问（关键）

- `color-contrast` - 普通文本的最低对比度为 4.5:1（大号文本为 3:1）；Material Design
- `focus-states` - 交互元素应具有可见的焦点环（2–4px；Apple HIG、MD）
- `alt-text` - 为有意义的图片提供描述性的替代文本
- `aria-labels` - 仅图标按钮使用 aria-label；原生应用中使用 accessibilityLabel（Apple HIG）
- `keyboard-nav` - Tab 顺序应与视觉顺序一致；完整支持键盘操作（Apple HIG）
- `form-labels` - 使用带有 for 属性的 label
- `skip-links` - 为键盘用户提供跳转至主要内容的链接
- `heading-hierarchy` - h1→h6 顺序递进，不跳过层级
- `color-not-only` - 不要仅通过颜色传达信息（添加图标/文本）
- `dynamic-type` - 支持系统文本缩放；文本变大时避免截断（Apple Dynamic Type、MD）
- `reduced-motion` - 尊重 prefers-reduced-motion；用户请求时减少/禁用动画（Apple Reduced Motion API、MD）
- `voiceover-sr` - 提供有意义的 accessibilityLabel/accessibilityHint；为 VoiceOver/屏幕阅读器提供合乎逻辑的阅读顺序（Apple HIG、MD）
- `escape-routes` - 在模态框和多步骤流程中提供取消/返回操作（Apple HIG）
- `keyboard-shortcuts` - 保留系统和无障碍快捷键；为拖放操作提供键盘替代方式（Apple HIG）

### 2. 触控与交互（关键）

- `touch-target-size` - 最小为 44×44pt（Apple）/ 48×48dp（Material）；必要时将点击区域扩展至视觉边界之外
- `touch-spacing` - 触控目标之间至少保留 8px/8dp 间距（Apple HIG、MD）
- `hover-vs-tap` - 主要交互使用点击/轻触；不要仅依赖悬停
- `loading-buttons` - 异步操作期间禁用按钮；显示旋转指示器或进度
- `error-feedback` - 在问题附近显示清晰的错误信息
- `cursor-pointer` - 为可点击元素添加 cursor-pointer（Web）
- `gesture-conflicts` - 避免在主要内容上使用水平滑动；优先使用垂直滚动
- `tap-delay` - 使用 touch-action: manipulation 减少 300ms 延迟（Web）
- `standard-gestures` - 一致地使用平台标准手势；不要重新定义（例如返回滑动、双指缩放）（Apple HIG）
- `system-gestures` - 不要阻止系统手势（控制中心、返回滑动等）（Apple HIG）
- `press-feedback` - 按下时提供视觉反馈（涟漪/高亮；MD 状态层）
- `haptic-feedback` - 对确认和重要操作使用触觉反馈；避免过度使用（Apple HIG）
- `gesture-alternative` - 不要依赖仅手势的交互；始终为关键操作提供可见控件
- `safe-area-awareness` - 主要触控目标应远离刘海、灵动岛、手势栏和屏幕边缘
- `no-precision-required` - 避免要求用户精确点击小图标或细窄边缘
- `swipe-clarity` - 滑动操作必须展示明确的可供性或提示（箭头、标签、教程）
- `drag-threshold` - 开始拖动前使用移动阈值，以避免意外拖动

### 3. 性能（高）

- `image-optimization` - 使用 WebP/AVIF、响应式图片（srcset/sizes），并延迟加载非关键资源
- `image-dimension` - 声明 width/height 或使用 aspect-ratio，以防止布局偏移（Core Web Vitals：CLS）
- `font-loading` - 使用 font-display: swap/optional 避免不可见文本（FOIT）；预留空间以减少布局偏移（MD）
- `font-preload` - 仅预加载关键字体；避免对每个变体过度使用 preload
- `critical-css` - 优先处理首屏 CSS（内联关键 CSS 或提前加载样式表）
- `lazy-loading` - 通过动态导入 / 路由级拆分延迟加载非首屏组件
- `bundle-splitting` - 按路由/功能拆分代码（React Suspense / Next.js dynamic），以减少初始加载时间和 TTI
- `third-party-scripts` - 异步/延迟加载第三方脚本；审查并移除不必要的脚本（MD）
- `reduce-reflows` - 避免频繁读取/写入布局；先批量读取 DOM，再批量写入
- `content-jumping` - 为异步内容预留空间，以避免布局跳动（Core Web Vitals：CLS）
- `lazy-load-below-fold` - 对首屏以下的图片和大型媒体使用 loading="lazy"
- `virtualize-lists` - 对包含 50 个以上项目的列表进行虚拟化，以改善内存效率和滚动性能
- `main-thread-budget` - 在 60fps 下将每帧工作控制在约 16ms 以内；将繁重任务移出主线程（HIG、MD）
- `progressive-loading` - 对耗时超过 1 秒的操作使用骨架屏 / 微光效果，而不是长时间阻塞式旋转指示器（Apple HIG）
- `input-latency` - 将轻触/滚动的输入延迟控制在约 100ms 以内（Material 响应性标准）
- `tap-feedback-speed` - 在轻触后的 100ms 内提供视觉反馈（Apple HIG）
- `debounce-throttle` - 对高频事件（滚动、调整大小、输入）使用防抖/节流
- `offline-support` - 提供离线状态提示和基础降级方案（PWA / 移动端）
- `network-fallback` - 为慢速网络提供降级模式（低分辨率图片、更少动画）

### 4. 样式选择（高优先级）

- `style-match` - 根据产品类型匹配样式（使用 `--design-system` 获取建议）
- `consistency` - 在所有页面中使用一致的样式
- `no-emoji-icons` - 使用 SVG 图标（Heroicons、Lucide），不要使用表情符号
- `color-palette-from-product` - 根据产品/行业选择配色方案（搜索 `--domain color`）
- `effects-match-style` - 阴影、模糊、圆角应与所选样式保持一致（glass / flat / clay 等）
- `platform-adaptive` - 遵循平台惯用模式（iOS HIG 对比 Material）：导航、控件、排版、动效
- `state-clarity` - 让悬停/按下/禁用状态在保持风格一致的同时具有明显的视觉区分（Material 状态层）
- `elevation-consistent` - 为卡片、底部面板、模态框使用一致的层级/阴影尺度；避免使用随机的阴影值
- `dark-mode-pairing` - 同时设计浅色/深色变体，以保持品牌、对比度和风格的一致性
- `icon-style-consistent` - 在整个产品中使用同一套图标集/视觉语言（描边宽度、圆角）
- `system-controls` - 优先使用原生/系统控件，而不是完全自定义控件；仅在品牌要求时进行自定义（Apple HIG）
- `blur-purpose` - 使用模糊来表示背景可关闭状态（模态框、底部面板），不要将其作为装饰（Apple HIG）
- `primary-action` - 每个屏幕只能有一个主要 CTA；次要操作在视觉上应处于从属地位（Apple HIG）

### 5. 布局与响应式（高优先级）

- `viewport-meta` - width=device-width initial-scale=1（绝不要禁用缩放）
- `mobile-first` - 采用移动端优先设计，然后扩展到平板和桌面端
- `breakpoint-consistency` - 使用系统化的断点（例如 375 / 768 / 1024 / 1440）
- `readable-font-size` - 移动端正文最小使用 16px（避免 iOS 自动缩放）
- `line-length-control` - 移动端每行 35–60 个字符；桌面端每行 60–75 个字符
- `horizontal-scroll` - 移动端不得出现水平滚动；确保内容适配视口宽度
- `spacing-scale` - 使用 4pt/8dp 增量间距系统（Material Design）
- `touch-density` - 保持组件间距适合触控：不要过于拥挤，也不要造成误触
- `container-width` - 在桌面端使用一致的最大宽度（max-w-6xl / 7xl）
- `z-index-management` - 定义分层的 z-index 级别（例如 0 / 10 / 20 / 40 / 100 / 1000）
- `fixed-element-offset` - 固定导航栏/底部栏必须为下方内容预留安全内边距
- `scroll-behavior` - 避免嵌套滚动区域干扰主要滚动体验
- `viewport-units` - 移动端优先使用 min-h-dvh，而不是 100vh
- `orientation-support` - 在横屏模式下保持布局易读且可操作
- `content-priority` - 移动端优先显示核心内容；折叠或隐藏次要内容
- `visual-hierarchy` - 通过尺寸、间距、对比度建立层级，而不是仅依赖颜色

### 6. 排版与颜色（中优先级）

- `line-height` - 正文使用 1.5-1.75 的行高
- `line-length` - 将每行限制在 65-75 个字符
- `font-pairing` - 让标题和正文的字体个性相匹配
- `font-scale` - 使用一致的字体比例（例如 12 14 16 18 24 32）
- `contrast-readability` - 在浅色背景上使用更深的文字颜色（例如白色背景上的 slate-900）
- `text-styles-system` - 使用平台字体系统：iOS 11 Dynamic Type 样式 / Material 5 类型角色（display、headline、title、body、label）（HIG、MD）
- `weight-hierarchy` - 使用 font-weight 强化层级：粗体标题（600–700）、常规正文（400）、中等粗细标签（500）（MD）
- `color-semantic` - 定义语义颜色令牌（primary、secondary、error、surface、on-surface），不要在组件中直接使用原始十六进制颜色值（Material color system）
- `color-dark-mode` - 深色模式使用降低饱和度/更明亮的色调变体，而不是反转颜色；分别测试对比度（HIG、MD）
- `color-accessible-pairs` - 前景色/背景色组合必须达到 4.5:1（AA）或 7:1（AAA）；使用工具进行验证（WCAG、MD）
- `color-not-decorative-only` - 功能性颜色（错误红色、成功绿色）必须同时包含图标/文本；避免仅通过颜色表达含义（HIG、MD）
- `truncation-strategy` - 优先换行而不是截断；需要截断时使用省略号，并通过工具提示/展开提供完整文本（Apple HIG）
- `letter-spacing` - 遵循平台默认的 letter-spacing；避免在正文中使用过紧的字距（HIG、MD）
- `number-tabular` - 对数据列、价格和计时器使用等宽/表格式数字，以防止布局偏移
- `whitespace-balance` - 有意识地使用留白来归类相关项目并分隔各个区块；避免视觉杂乱（Apple HIG）

### 7. 动画（中等）

- `duration-timing` - 微交互使用 150–300ms；复杂过渡 ≤400ms；避免超过 500ms（MD）
- `transform-performance` - 仅使用 transform/opacity；避免对 width/height/top/left 设置动画
- `loading-states` - 加载超过 300ms 时显示骨架屏或进度指示器
- `excessive-motion` - 每个视图最多为 1–2 个关键元素添加动画
- `easing` - 进入时使用 ease-out，退出时使用 ease-in；避免在线性 UI 过渡中使用 linear
- `motion-meaning` - 每个动画都必须表达因果关系，而不只是装饰效果（Apple HIG）
- `state-transition` - 状态变化（hover / active / expanded / collapsed / modal）应平滑过渡，而不是突然切换
- `continuity` - 页面/屏幕过渡应保持空间连续性（共享元素、方向性滑动）（Apple HIG）
- `parallax-subtle` - 谨慎使用视差效果；必须遵循 reduced-motion 设置，且不得造成方向迷失（Apple HIG）
- `spring-physics` - 优先使用基于弹簧/物理效果的曲线，而不是 linear 或 cubic-bezier，以获得自然的感觉（Apple HIG 流畅动画）
- `exit-faster-than-enter` - 退出动画应比进入动画更短（约为进入动画时长的 60–70%），以提升响应感（MD motion）
- `stagger-sequence` - 列表/网格项目的进入动画按每项 30–50ms 的间隔错开；避免同时出现或过慢地逐项显示（MD）
- `shared-element-transition` - 使用共享元素 / hero 过渡来保持屏幕之间的视觉连续性（MD、HIG）
- `interruptible` - 动画必须可中断；用户的点击/手势应立即取消正在进行的动画（Apple HIG）
- `no-blocking-animation` - 动画期间绝不能阻塞用户输入；UI 必须保持可交互
- `fade-crossfade` - 在同一容器内替换内容时使用交叉淡化
- `scale-feedback` - 可点击卡片/按钮在按下时使用细微缩放（0.95–1.05）；释放时恢复原状（HIG、MD）
- `gesture-feedback` - 拖动、滑动和捏合必须提供实时视觉反馈，跟随手指移动（MD Motion）
- `hierarchy-motion` - 使用平移/缩放方向表达层级：从下方进入 = 更深层级，向上退出 = 返回（MD）
- `motion-consistency` - 在全局统一 duration/easing 令牌；所有动画共享相同的节奏和感受
- `opacity-threshold` - 淡出元素不应在 opacity 0.2 以下停留；要么完全淡出，要么保持可见
- `modal-motion` - 模态框/底部表单应从其触发源处开始动画（缩放+淡化或滑入），以提供空间上下文（HIG、MD）
- `navigation-direction` - 向前导航向左/向上动画；向后导航向右/向下动画，方向逻辑必须保持一致（HIG）
- `layout-shift-avoid` - 动画不得导致布局重排或 CLS；位置变化使用 transform

### 8. 表单与反馈（中等）

- `input-labels` - 每个输入框都应有可见标签（不能仅依赖 placeholder）
- `error-placement` - 在相关字段下方显示错误信息
- `submit-feedback` - 提交时先显示加载状态，然后显示成功/错误状态
- `required-indicators` - 标记必填字段（例如使用星号）
- `empty-states` - 无内容时显示有帮助的消息和操作
- `toast-dismiss` - Toast 在 3–5 秒后自动消失
- `confirmation-dialogs` - 执行破坏性操作前进行确认
- `input-helper-text` - 在复杂输入框下方提供持久的辅助文本，而不仅仅使用 placeholder（Material Design）
- `disabled-states` - 禁用元素使用降低的不透明度（0.38–0.5）+ 光标变化 + 语义属性（MD）
- `progressive-disclosure` - 逐步展示复杂选项；不要一开始就让用户面对过多内容（Apple HIG）
- `inline-validation` - 在失焦时验证（而不是每次按键时）；仅在用户完成输入后显示错误（MD）
- `input-type-keyboard` - 使用语义化输入类型（email、tel、number）以触发正确的移动端键盘（HIG、MD）
- `password-toggle` - 为密码字段提供显示/隐藏切换功能（MD）
- `autofill-support` - 使用 autocomplete / textContentType 属性，以便系统自动填充（HIG、MD）
- `undo-support` - 为破坏性或批量操作提供撤销功能（例如在“删除”Toast 中提供“撤销”）（Apple HIG）
- `success-feedback` - 使用简短的视觉反馈确认操作已完成（勾选标记、Toast、颜色闪烁）（MD）
- `error-recovery` - 错误消息必须包含明确的恢复路径（重试、编辑、帮助链接）（HIG、MD）
- `multi-step-progress` - 多步骤流程显示步骤指示器或进度条；允许返回上一页（MD）
- `form-autosave` - 长表单应自动保存草稿，以防意外关闭导致数据丢失（Apple HIG）
- `sheet-dismiss-confirm` - 关闭包含未保存更改的 sheet/modal 前进行确认（Apple HIG）
- `error-clarity` - 错误消息必须说明原因及修复方法（不能只写“输入无效”）（HIG、MD）
- `field-grouping` - 按逻辑分组相关字段（使用 fieldset/legend 或视觉分组）（MD）
- `read-only-distinction` - 只读状态在视觉和语义上都应与禁用状态有所区别（MD）
- `focus-management` - 提交出错后，自动聚焦第一个无效字段（WCAG、MD）
- `error-summary` - 存在多个错误时，在顶部显示摘要，并提供指向各字段的锚点链接（WCAG）
- `touch-friendly-input` - 移动端输入框高度 ≥44px，以满足触摸目标要求（Apple HIG）
- `destructive-emphasis` - 破坏性操作使用语义化危险颜色（红色），并在视觉上与主要操作分隔开（HIG、MD）
- `toast-accessibility` - Toast 不得抢夺焦点；使用 aria-live="polite" 向屏幕阅读器播报（WCAG）
- `aria-live-errors` - 表单错误使用 aria-live 区域或 role="alert" 通知屏幕阅读器（WCAG）
- `contrast-feedback` - 错误和成功状态的颜色必须满足 4.5:1 的对比度要求（WCAG、MD）
- `timeout-feedback` - 请求超时时必须显示明确的反馈，并提供重试选项（MD）

### 9. 导航模式（高）

- `bottom-nav-limit` - 底部导航最多 5 个项目；使用带图标的标签（Material Design）
- `drawer-usage` - 抽屉/侧边栏用于次级导航，而非主要操作（Material Design）
- `back-behavior` - 返回导航必须可预测且一致；保留滚动位置/状态（Apple HIG、MD）
- `deep-linking` - 所有关键页面必须可通过深层链接 / URL 访问，以便分享和发送通知（Apple HIG、MD）
- `tab-bar-ios` - iOS：顶级导航使用底部 Tab Bar（Apple HIG）
- `top-app-bar-android` - Android：使用带导航图标的 Top App Bar 构建主要结构（Material Design）
- `nav-label-icon` - 导航项目必须同时具有图标和文本标签；仅图标导航会影响可发现性（MD）
- `nav-state-active` - 必须在导航中通过视觉方式突出显示当前位置（颜色、字重、指示器）（HIG、MD）
- `nav-hierarchy` - 必须明确区分主要导航（标签页/底部栏）与次级导航（抽屉/设置）（MD）
- `modal-escape` - 模态框和底部面板必须提供明确的关闭/取消方式；移动端支持向下滑动关闭（Apple HIG）
- `search-accessible` - 搜索必须易于访问（顶部栏或标签页）；提供最近/建议查询（MD）
- `breadcrumb-web` - Web：对于 3 层及以上的深层层级，使用面包屑帮助用户定位（MD）
- `state-preservation` - 返回时必须恢复之前的滚动位置、筛选状态和输入内容（HIG、MD）
- `gesture-nav-support` - 支持系统手势导航（iOS 侧滑返回、Android 预测返回），且不产生冲突（HIG、MD）
- `tab-badge` - 谨慎地在导航项目上使用徽标以表示未读/待处理内容；用户访问后清除（HIG、MD）
- `overflow-menu` - 当操作超出可用空间时，使用溢出/更多菜单，而不是强行塞入（MD）
- `bottom-nav-top-level` - 底部导航仅用于顶级页面；绝不在其中嵌套子导航（MD）
- `adaptive-navigation` - 大屏幕（≥1024px）优先使用侧边栏；小屏幕使用底部/顶部导航（Material Adaptive）
- `back-stack-integrity` - 绝不静默重置导航栈，也不要意外跳转到首页（HIG、MD）
- `navigation-consistency` - 所有页面的导航位置必须保持一致；不要因页面类型而改变
- `avoid-mixed-patterns` - 不要在同一层级混用 Tab + 侧边栏 + 底部导航
- `modal-vs-navigation` - 不得将模态框用于主要导航流程；这会中断用户路径（HIG）
- `focus-on-route-change` - 页面切换后，将焦点移至主内容区域，方便屏幕阅读器用户使用（WCAG）
- `persistent-nav` - 从深层页面也必须能够访问核心导航；不要在子流程中将其完全隐藏（HIG、MD）
- `destructive-nav-separation` - 危险操作（删除账户、退出登录）必须在视觉和空间上与普通导航项目分离（HIG、MD）
- `empty-nav-state` - 当某个导航目标不可用时，说明原因，而不是静默隐藏它（MD）

### 10. 图表与数据（低）

- `chart-type` - 使图表类型与数据类型匹配（趋势 → 折线图、比较 → 柱状图、占比 → 饼图/圆环图）
- `color-guidance` - 使用无障碍色板；避免仅使用红/绿配对，以照顾色觉障碍用户（WCAG、MD）
- `data-table` - 为无障碍访问提供表格替代方案；仅有图表对屏幕阅读器并不友好（WCAG）
- `pattern-texture` - 使用图案、纹理或形状补充颜色，使数据在不依赖颜色时仍可区分（WCAG、MD）
- `legend-visible` - 始终显示图例；将其放在图表附近，而不是置于滚动折叠区域下方（MD）
- `tooltip-on-interact` - 在悬停（Web）或点击（移动端）时提供显示精确值的工具提示/数据标签（HIG、MD）
- `axis-labels` - 为坐标轴标注单位和易读的刻度；避免在移动端使用截断或旋转的标签
- `responsive-chart` - 图表必须在小屏幕上重排或简化（例如使用水平柱状图替代垂直柱状图、减少刻度）
- `empty-data-state` - 没有数据时显示有意义的空状态（“尚无数据” + 引导），而不是空白图表（MD）
- `loading-chart` - 图表数据加载期间使用骨架屏或微光占位符；不要显示空的坐标轴框架
- `animation-optional` - 图表入场动画必须遵循 `prefers-reduced-motion`；数据应立即可读（HIG）
- `large-dataset` - 对于 1000+ 个数据点，进行聚合或采样；提供下钻查看详情，而不是渲染全部数据（MD）
- `number-formatting` - 对坐标轴和标签上的数字、日期、货币使用区域设置感知的格式化方式（HIG、MD）
- `touch-target-chart` - 交互式图表元素（点、区段）必须具有 ≥44pt 的点击区域，或在触摸时扩展（Apple HIG）
- `no-pie-overuse` - 超过 5 个类别时避免使用饼图/圆环图；为清晰起见改用柱状图
- `contrast-data` - 数据线/柱与背景的对比度 ≥3:1；数据文本标签 ≥4.5:1（WCAG）
- `legend-interactive` - 图例应可点击，以切换数据系列的可见性（MD）
- `direct-labeling` - 对于小型数据集，直接在图表上标注数值，以减少视线移动
- `tooltip-keyboard` - 工具提示内容必须可通过键盘访问，且不能仅依赖悬停（WCAG）
- `sortable-table` - 数据表必须支持排序，并使用 `aria-sort` 表示当前排序状态（WCAG）
- `axis-readability` - 坐标轴刻度不能过于拥挤；保持易读间距，并在小屏幕上自动跳过部分刻度
- `data-density` - 限制每张图表的信息密度，避免认知负担过重；必要时拆分为多张图表
- `trend-emphasis` - 强调数据趋势而非装饰；避免使用会遮挡数据的浓重渐变/阴影
- `gridline-subtle` - 网格线应保持低对比度（例如 `gray-200`），以免与数据争夺注意力
- `focusable-elements` - 交互式图表元素（点、柱、扇区）必须可通过键盘导航（WCAG）
- `screen-reader-summary` - 为屏幕阅读器提供描述图表关键洞察的文本摘要或 `aria-label`（WCAG）
- `error-state-chart` - 数据加载失败时必须显示带重试操作的错误消息，而不是损坏/空白图表
- `export-option` - 对于数据密集型产品，提供图表数据的 CSV/图片导出
- `drill-down-consistency` - 下钻交互必须保持清晰的返回路径和层级面包屑
- `time-scale-clarity` - 时间序列图必须清晰标注时间粒度（日/周/月），并允许切换

## 使用方法

使用下面的 CLI 工具搜索特定领域。

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

当用户提出以下任一请求时，使用此 skill：

| 场景 | 触发示例 | 起始步骤 |
|----------|-----------------|------------|
| **新建项目 / 页面** | "构建一个落地页"、"构建一个仪表板" | 步骤 1 → 步骤 2（设计系统） |
| **新建组件** | "创建一个定价卡片"、"添加一个模态框" | 步骤 3（领域搜索：style、ux） |
| **选择样式 / 颜色 / 字体** | "什么样式适合金融科技应用？"、"推荐一个配色方案" | 步骤 2（设计系统） |
| **审查现有 UI** | "审查这个页面的 UX 问题"、"检查可访问性" | 上面的快速参考检查清单 |
| **修复 UI bug** | "按钮悬停效果坏了"、"页面加载时布局发生偏移" | 快速参考 → 相关部分 |
| **改进 / 优化** | "让它更快"、"改善移动端体验" | 步骤 3（领域搜索：ux、react） |
| **实现深色模式** | "添加深色模式支持" | 步骤 3（领域：style "dark mode"） |
| **添加图表 / 数据可视化** | "添加一个分析仪表板图表" | 步骤 3（领域：chart） |
| **技术栈最佳实践** | "React 性能优化技巧"、"SwiftUI 导航" | 步骤 4（技术栈搜索） |

遵循以下工作流：

### 步骤 1：分析用户需求

从用户请求中提取关键信息：
- **产品类型**：娱乐类（社交、视频、音乐、游戏）、工具类（扫描器、编辑器、转换器）、生产力类（任务管理器、笔记、日历）或混合型
- **目标受众**：C 端消费者用户；考虑年龄段和使用场景（通勤、休闲、工作）
- **样式关键词**：活泼、鲜艳、极简、深色模式、内容优先、沉浸式等
- **技术栈**：从项目中读取，不要自行假设。此处写着
  "React Native（此项目唯一的技术栈）" ——这是从该 skill
  所 vendored 的项目继承而来的，并不适用于此处。`data/stacks/` 中包含十六种技术栈；
  选择项目实际使用的那一种。

### 步骤 2：生成设计系统（必需）

**始终先使用 `--design-system`**，以获取包含完整理由的综合建议：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

此命令将：
1. 并行搜索各个领域（产品、样式、颜色、落地页、字体）
2. 应用 `ui-reasoning.csv` 中的推理规则，选择最匹配的结果
3. 返回完整的设计系统：布局模式、样式、颜色、字体、效果
4. 包含需要避免的反模式

**示例：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### 步骤 2b：持久化设计系统（主配置 + 覆盖配置模式）

要保存设计系统，以便**跨会话进行层级检索**，请添加 `--persist`：

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
- `design-system/pages/dashboard.md` — 相对于 Master 的页面特定偏差

**层级检索的工作方式：**
1. 构建特定页面（例如“Checkout”）时，首先检查 `design-system/pages/checkout.md`
2. 如果页面文件存在，其中的规则**优先于** Master 文件
3. 如果不存在，则专门使用 `design-system/MASTER.md`

**上下文感知检索提示词：**
```
I am building the [Page Name] page. Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
Now, generate the code...
```

### 第 3 步：根据需要通过详细检索进行补充

获取设计系统后，使用领域检索来获取额外的详细信息：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**使用详细检索的场景：**

| 需求 | 领域 | 示例 |
|------|--------|---------|
| 产品类型模式 | `product` | `--domain product "entertainment social"` |
| 更多风格选项 | `style` | `--domain style "glassmorphism dark"` |
| 配色方案 | `color` | `--domain color "entertainment vibrant"` |
| 字体组合 | `typography` | `--domain typography "playful modern"` |
| 图表建议 | `chart` | `--domain chart "real-time dashboard"` |
| UX 最佳实践 | `ux` | `--domain ux "animation accessibility"` |
| 备选字体 | `typography` | `--domain typography "elegant luxury"` |
| 单独查询 Google Fonts | `google-fonts` | `--domain google-fonts "sans serif popular variable"` |
| Landing 页面结构 | `landing` | `--domain landing "hero social-proof"` |
| React Native 性能 | `react` | `--domain react "rerender memo list"` |
| 应用界面无障碍 | `web` | `--domain web "accessibilityLabel touch safe-areas"` |
| AI 提示词 / CSS 关键词 | `prompt` | `--domain prompt "minimalism"` |

### 第 4 步：技术栈指南（React Native）

获取 React Native 实现相关的最佳实践：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react-native
```

---

## 检索参考

### 可用领域

| 领域 | 用途 | 示例关键词 |
|--------|---------|------------------|
| `product` | 产品类型建议 | SaaS、电子商务、作品集、医疗保健、美容、服务 |
| `style` | UI 风格、颜色、效果 | glassmorphism、minimalism、dark mode、brutalism |
| `typography` | 字体组合、Google Fonts | elegant、playful、professional、modern |
| `color` | 按产品类型划分的配色方案 | saas、ecommerce、healthcare、beauty、fintech、service |
| `landing` | 页面结构、CTA 策略 | hero、hero-centric、testimonial、pricing、social-proof |
| `chart` | 图表类型、库推荐 | trend、comparison、timeline、funnel、pie |
| `ux` | 最佳实践、反模式 | animation、accessibility、z-index、loading |
| `google-fonts` | 单独查询 Google Fonts | sans serif、monospace、japanese、variable font、popular |
| `react` | React/Next.js 性能 | waterfall、bundle、suspense、memo、rerender、cache |
| `web` | 应用界面指南（iOS/Android/React Native） | accessibilityLabel、touch targets、safe areas、Dynamic Type |
| `prompt` | AI 提示词、CSS 关键词 | （风格名称） |

> **已从此 vendored copy 中移除：** `data/design.csv` 和 `data/draft.csv`
> （208 KB）。这两个文件都未在 `scripts/core.py`、`scripts/design_system.py` 或
> 本文件中声明，因此引擎从未打开过它们 —— 其中的内容无人获取，却看起来像是覆盖范围的一部分。上游也删除了它们。请勿恢复。
> （`data/ui-reasoning.csv` 确实会被 `design_system.py` 读取，并予以保留。）

### 可用技术栈

| Stack | Focus |
|-------|-------|
| `react-native` | 组件、导航、列表 |

---

## 示例工作流

**用户请求：**“制作一个 AI 搜索主页。”

### 第 1 步：分析需求
- 产品类型：工具（AI 搜索引擎）
- 目标受众：希望获得快速、智能搜索的 C 端用户
- 风格关键词：现代、简约、内容优先、深色模式
- 技术栈：React Native

### 第 2 步：生成设计系统（必需）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "AI search tool modern minimal" --design-system -p "AI Search"
```

**输出：**包含布局模式、风格、颜色、字体、效果和反模式的完整设计系统。

### 第 3 步：补充详细搜索（按需）

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

- 使用**多维关键词** —— 将产品 + 行业 + 调性 + 信息密度结合起来：`"entertainment social vibrant content-dense"`，而不只是`"app"`
- 针对同一需求尝试不同关键词：`"playful neon"` → `"vibrant dark"` → `"content-first minimal"`
- 先使用 `--design-system` 获取完整建议，然后使用 `--domain` 深入探索你不确定的维度
- 实现相关的指导始终添加 `--stack react-native`

### 常见卡点

| 问题 | 处理方式 |
|---------|------------|
| 无法确定风格/颜色 | 使用不同关键词重新运行 `--design-system` |
| 深色模式对比度问题 | Quick Reference §6：`color-dark-mode` + `color-accessible-pairs` |
| 动画感觉不自然 | Quick Reference §7：`spring-physics` + `easing` + `exit-faster-than-enter` |
| 表单 UX 较差 | Quick Reference §8：`inline-validation` + `error-clarity` + `focus-management` |
| 导航感觉令人困惑 | Quick Reference §9：`nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
| 小屏幕上的布局崩坏 | Quick Reference §5：`mobile-first` + `breakpoint-consistency` |
| 性能问题 / 卡顿 | Quick Reference §3：`virtualize-lists` + `main-thread-budget` + `debounce-throttle` |

### 交付前检查清单

- 在实现前运行 `--domain ux "animation accessibility z-index loading"`，执行一轮 UX 验证
- 最终审查时逐项检查 Quick Reference **§1–§3**（CRITICAL + HIGH）
- 在 375px（小屏手机）和横屏方向下进行测试
- 验证启用 **reduced-motion** 和将 **Dynamic Type** 设置为最大字号时的行为
- 独立检查深色模式下的对比度（不要假设浅色模式的数值同样适用）
- 确认所有触控目标均 ≥44pt，且没有内容被安全区域遮挡

---

## 专业 UI 的通用规则

以下是经常被忽视、但会让 UI 看起来不够专业的问题：
范围说明：以下规则适用于 App UI（iOS/Android/React Native/Flutter），
并不是桌面 Web 的交互模式。请按原文理解：这是该 skill 中最具体的内容，
它明确排除了本仓库通常处理的 Web 工作。对于 Web 界面，将其作为背景参考，
并以 `agents/design-advisor.md` 中设计契约的约束性规则为准。

### 图标与视觉元素

| 规则 | 标准 | 避免 | 重要原因 |
|------|----------|--------|----------------|
| **不得使用 Emoji 作为结构性图标** | 使用基于矢量的图标（例如 Lucide、react-native-vector-icons、@expo/vector-icons）。 | 使用 Emoji（🎨 🚀 ⚙️）作为导航、设置或系统控件。 | Emoji 依赖字体，在不同平台上的表现不一致，也无法通过设计令牌进行控制。 |
| **仅使用矢量资源** | 使用能够平滑缩放并支持主题适配的 SVG 或平台矢量图标。 | 使用会模糊或出现像素化的栅格 PNG 图标。 | 确保可缩放性、清晰渲染，以及对深色/浅色模式的适配能力。 |
| **交互状态保持稳定** | 使用颜色、不透明度或海拔变化来表现按压状态，同时不改变布局边界。 | 使用会移动周围内容或触发视觉抖动、导致布局变化的变换效果。 | 防止交互不稳定，保持移动端的流畅动效和感知质量。 |
| **使用正确的品牌 Logo** | 使用官方品牌资源，并遵循其使用指南（间距、颜色、安全空间）。 | 猜测 Logo 路径、非官方地重新着色，或修改其比例。 | 防止品牌误用，确保符合法律和平台规范。 |
| **图标尺寸保持一致** | 将图标尺寸定义为设计令牌（例如 icon-sm、icon-md = 24pt、icon-lg）。 | 随意混用 20pt / 24pt / 28pt 等数值。 | 保持界面各处的节奏和视觉层级一致。 |
| **保持描边一致** | 在同一视觉层级内使用一致的描边宽度（例如 1.5px 或 2px）。 | 随意混用粗细不一的描边样式。 | 描边不一致会降低界面的精致感和整体协调性。 |
| **严格区分填充与轮廓样式** | 每个层级使用一种图标样式。 | 在同一层级混用填充图标和轮廓图标。 | 保持语义清晰和风格统一。 |
| **触控目标最小尺寸** | 交互区域最小为 44×44pt（图标较小时使用 hitSlop）。 | 使用未扩展点击区域的小图标。 | 符合无障碍要求和平台可用性标准。 |
| **图标对齐** | 将图标与文字基线对齐，并保持内边距一致。 | 图标未对齐，或图标周围的间距不一致。 | 防止细微的视觉失衡，避免降低感知质量。 |
| **图标对比度** | 遵循 WCAG 对比度标准：小元素为 4.5:1，大型 UI 字形最低为 3:1。 | 使用与背景融为一体的低对比度图标。 | 确保在浅色和深色模式下都具备良好的可访问性。 |

### 交互（应用）

| 规则 | 应该做 | 不应该做 |
|------|----|----- |
| **点击反馈** | 在 80-150ms 内提供明确的按下反馈（波纹/透明度/高度） | 点击时没有视觉响应 |
| **动画时长** | 将微交互控制在约 150-300ms，并使用平台原生缓动 | 瞬时过渡或缓慢动画（>500ms） |
| **无障碍焦点** | 确保屏幕阅读器的焦点顺序与视觉顺序一致，并使用描述性标签 | 未标记的控件或令人困惑的焦点遍历 |
| **禁用状态清晰度** | 使用禁用语义（`disabled`/原生 disabled props）、降低视觉强调，并且不执行点击操作 | 控件看起来可以点击，但实际没有任何操作 |
| **触控目标最小尺寸** | 保持点击区域 >=44x44pt（iOS）或 >=48x48dp（Android）；图标较小时扩大命中区域 | 点击目标过小，或图标独占命中区域且没有内边距 |
| **防止手势冲突** | 每个区域仅保留一个主要手势，并避免嵌套点击/拖动冲突 | 手势重叠导致误操作 |
| **语义化原生控件** | 优先使用具有正确无障碍角色的原生交互原语（`Button`、`Pressable`、平台等效控件） | 在缺少语义的情况下，将通用容器用作主要控件 |

### 浅色/深色模式对比度

| 规则 | 应该做 | 不应该做 |
|------|----|----- |
| **表面可读性（浅色）** | 通过足够的不透明度/高度，让卡片/表面与背景清晰区分 | 表面过于透明，导致层级模糊 |
| **文本对比度（浅色）** | 确保正文文本相对于浅色表面的对比度 >=4.5:1 | 使用对比度过低的灰色正文文本 |
| **文本对比度（深色）** | 确保主要文本的对比度 >=4.5:1，次要文本在深色表面上的对比度 >=3:1 | 深色模式下的文本与背景混在一起 |
| **边框和分隔线可见性** | 确保分隔线在两种主题中都清晰可见，而不只是浅色模式 | 仅为某个主题定义边框，导致其在另一个模式中消失 |
| **状态对比度一致性** | 确保按下/聚焦/禁用状态在浅色和深色主题中都同样容易区分 | 只为其中一个主题定义交互状态 |
| **基于 Token 的主题化** | 使用按主题映射的语义颜色 Token，覆盖应用中的表面/文本/图标 | 使用按屏幕硬编码的十六进制颜色值 |
| **遮罩层和模态框可读性** | 使用足够强的模态框遮罩层来隔离前景内容（通常为 40-60% 黑色） | 遮罩层过弱，导致背景在视觉上与前景内容争夺注意力 |

### 布局与间距

| 规则 | 应该做 | 不应该做 |
|------|----|----- |
| **安全区域适配** | 为所有固定的头部、标签栏和 CTA 栏遵守顶部/底部安全区域 | 将固定 UI 放置在刘海、状态栏或手势区域下方 |
| **系统栏间距** | 为状态栏/导航栏和手势 Home 指示条添加间距 | 让可点击内容与操作系统界面元素发生碰撞 |
| **一致的内容宽度** | 针对不同设备类别（手机/平板）保持可预测的内容宽度 | 在不同屏幕之间混用任意宽度 |
| **8dp 间距节奏** | 对内边距/间隙/区块间距使用一致的 4/8dp 间距系统 | 使用没有规律的随机间距增量 |
| **易读的文本宽度** | 在大屏设备上保持长篇文本的可读性（避免平板上的通栏段落） | 使用影响可读性的全宽长文本 |
| **区块间距层级** | 根据层级定义清晰的垂直节奏层级（例如 16/24/32/48） | 相近的 UI 层级使用不一致的间距 |
| **按断点自适应边距** | 在更宽的屏幕和横屏模式下增加水平内边距 | 在所有设备尺寸/屏幕方向上使用相同的窄边距 |
| **滚动内容与固定元素共存** | 添加底部/顶部内容内边距，避免列表被固定栏遮挡 | 让滚动内容被粘性头部/底部遮挡 |

---

## 交付前检查清单

交付 UI 代码前，请核对以下项目：
范围说明：此检查清单适用于应用 UI（iOS/Android/React Native/Flutter），
因此不适用于 Web 界面——在将其作为仪表盘的
交付前门禁之前，请先查看上面的说明。

### 视觉质量
- [ ] 不使用 emoji 作为图标（改用 SVG）
- [ ] 所有图标均来自风格和样式一致的图标系列
- [ ] 使用官方品牌资源，并确保比例正确且留有安全空间
- [ ] 按压状态的视觉效果不会改变布局边界或导致抖动
- [ ] 统一使用语义化主题 token（不在各个屏幕中临时硬编码颜色）

### 交互
- [ ] 所有可点击元素都提供明确的按压反馈（ripple/opacity/elevation）
- [ ] 触控目标达到最小尺寸（iOS >=44x44pt，Android >=48x48dp）
- [ ] 微交互时长保持在 150-300ms 范围内，并使用符合原生体验的缓动效果
- [ ] 禁用状态在视觉上清晰可辨，并且不可交互
- [ ] 屏幕阅读器的焦点顺序与视觉顺序一致，交互标签描述清晰
- [ ] 手势区域避免嵌套或相互冲突的交互（tap/drag/back-swipe 冲突）

### 浅色/深色模式
- [ ] 浅色和深色模式下，主要文本对比度均 >=4.5:1
- [ ] 浅色和深色模式下，次要文本对比度均 >=3:1
- [ ] 浅色和深色模式下，分隔线/边框和交互状态均清晰可辨
- [ ] 模态框/抽屉的 scrim 不透明度足够高，以保持前景内容清晰可读（通常为 40-60% 黑色）
- [ ] 交付前已测试两种主题（不能根据单一主题推断）

### 布局
- [ ] headers、tab bars 和底部 CTA bars 均遵循安全区域
- [ ] 滚动内容不会被固定/吸顶栏遮挡
- [ ] 已在小型手机、大型手机和平板设备上完成验证（横屏 + 竖屏）
- [ ] 水平内边距/间距会根据设备尺寸和屏幕方向正确适配
- [ ] 在组件、区块和页面层级均保持 4/8dp 间距节奏
- [ ] 长篇文本在较大设备上的行宽仍保持可读（段落不使用贴边布局）

### 无障碍
- [ ] 所有有意义的图片/图标都具有无障碍标签
- [ ] 表单字段具有标签、提示和清晰的错误消息
- [ ] 颜色不是唯一的指示方式
- [ ] 支持减少动态效果和动态文本大小，且不会破坏布局
- [ ] 无障碍 traits/roles/states（selected、disabled、expanded）均能被正确播报