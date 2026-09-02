---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
---
# UI/UX Pro Max - 设计智能

面向 Web 和移动应用的综合设计指南。包含 50+ 种样式、161 套配色方案、57 组字体搭配、161 类产品类型及其推理规则、99 条 UX 指南，以及跨 10 种技术栈的 25 种图表类型。支持搜索的数据库，并提供基于优先级的推荐。

## 何时应用

当任务涉及**UI 结构、视觉设计决策、交互模式，或用户体验质量控制**时，应使用此 Skill。

### 必须使用

在以下情况下必须调用此 Skill：

- 设计新页面（Landing Page、Dashboard、Admin、SaaS、Mobile App）
- 创建或重构 UI 组件（buttons、modals、forms、tables、charts 等）
- 选择配色方案、排版系统、间距标准或布局系统
- 审查 UI 代码的用户体验、可访问性或视觉一致性
- 实现导航结构、动画或响应式行为
- 做出产品级设计决策（样式、信息层级、品牌表达）
- 提升界面的感知质量、清晰度或可用性

### 推荐使用

在以下情况下推荐使用此 Skill：

- UI 看起来“还不够专业”，但原因不明确
- 接收关于可用性或体验的反馈
- 上线前的 UI 质量优化
- 对齐跨平台设计（Web / iOS / Android）
- 构建设计系统或可复用组件库

### 可跳过

在以下情况下不需要此 Skill：

- 纯后端逻辑开发
- 仅涉及 API 或数据库设计
- 与界面无关的性能优化
- 基础设施或 DevOps 工作
- 非视觉脚本或自动化任务

**判定标准**：如果任务会改变某个功能**看起来如何、感觉如何、如何移动，或如何被交互**，则应使用此 Skill。

## 按优先级划分的规则类别

*供人类/AI 参考：按 1→10 的优先级决定应首先关注哪个规则类别；需要时使用 `--domain <Domain>` 查询详情。脚本不会读取此表。*

| 优先级 | 类别 | 影响 | Domain | 关键检查（必须具备） | 反模式（避免） |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | 可访问性 | CRITICAL | `ux` | 对比度 4.5:1、Alt text、键盘导航、Aria-labels | 移除焦点环、没有标签的仅图标按钮 |
| 2 | 触控与交互 | CRITICAL | `ux` | 最小尺寸 44×44px、8px+ 间距、加载反馈 | 仅依赖 hover、即时状态变化（0ms） |
| 3 | 性能 | HIGH | `ux` | WebP/AVIF、懒加载、预留空间（CLS < 0.1） | 布局抖动、累计布局偏移 |
| 4 | 样式选择 | HIGH | `style`, `product` | 匹配产品类型、一致性、SVG 图标（无 emoji） | 随机混用扁平与拟物风格、用 emoji 充当图标 |
| 5 | 布局与响应式 | HIGH | `ux` | 移动优先断点、viewport meta、无横向滚动 | 横向滚动、固定 px 容器宽度、禁用缩放 |
| 6 | 排版与颜色 | MEDIUM | `typography`, `color` | 基础 16px、行高 1.5、语义化颜色 token | 正文字体小于 12px、灰上加灰、组件中直接使用原始 hex |
| 7 | 动画 | MEDIUM | `ux` | 持续时间 150–300ms、动效传达含义、空间连续性 | 仅装饰性动画、动画 width/height、没有 reduced-motion |
| 8 | 表单与反馈 | MEDIUM | `ux` | 可见标签、字段附近显示错误、辅助说明、渐进式披露 | 仅用占位符当标签、错误只显示在顶部、前置信息过载 |
| 9 | 导航模式 | HIGH | `ux` | 可预测的返回、底部导航 ≤5、深度链接 | 导航过载、返回行为异常、没有深度链接 |
| 10 | 图表与数据 | LOW | `chart` | 图例、工具提示、可访问颜色 | 仅依赖颜色传达含义 |

## 快速参考

### 1. 无障碍（CRITICAL）

- `color-contrast` - 普通文本的最小对比度为 4.5:1（大号文本为 3:1）；Material Design
- `focus-states` - 交互元素上有可见的焦点环（2–4px；Apple HIG、MD）
- `alt-text` - 为有意义的图像提供描述性的替代文本
- `aria-labels` - 仅图标按钮使用 aria-label；native 中使用 accessibilityLabel（Apple HIG）
- `keyboard-nav` - Tab 顺序与视觉顺序一致；完整的键盘支持（Apple HIG）
- `form-labels` - 使用带 for 属性的 label
- `skip-links` - 为键盘用户提供跳转到主内容的链接
- `heading-hierarchy` - 按顺序使用 h1→h6，不跳级
- `color-not-only` - 不要只用颜色传达信息（加入图标/文本）
- `dynamic-type` - 支持系统文本缩放；随着文本增大避免截断（Apple Dynamic Type、MD）
- `reduced-motion` - 尊重 prefers-reduced-motion；在需要时减少/禁用动画（Apple Reduced Motion API、MD）
- `voiceover-sr` - 提供有意义的 accessibilityLabel/accessibilityHint；为 VoiceOver/屏幕阅读器保持逻辑阅读顺序（Apple HIG、MD）
- `escape-routes` - 在模态框和多步骤流程中提供取消/返回
- `keyboard-shortcuts` - 保留系统和无障碍快捷键；为拖放提供键盘替代方式（Apple HIG）

### 2. 触控与交互（CRITICAL）

- `touch-target-size` - 最小 44×44pt（Apple）/ 48×48dp（Material）；必要时将可点击区域扩展到视觉边界之外
- `touch-spacing` - 触控目标之间至少保留 8px/8dp 间距（Apple HIG、MD）
- `hover-vs-tap` - 主要交互使用点击/轻触；不要只依赖悬停
- `loading-buttons` - 在异步操作期间禁用按钮；显示加载指示器或进度
- `error-feedback` - 在问题附近显示清晰的错误信息
- `cursor-pointer` - 为可点击元素添加 cursor-pointer
- `gesture-conflicts` - 避免在主内容上使用水平滑动；优先垂直滚动
- `tap-delay` - 使用 touch-action: manipulation 以减少 300ms 延迟（Web）
- `standard-gestures` - 一致地使用平台标准手势；不要重新定义（例如返回滑动、双指缩放）（Apple HIG）
- `system-gestures` - 不要阻止系统手势（控制中心、返回滑动等）（Apple HIG）
- `press-feedback` - 按下时提供视觉反馈（ripple/highlight；MD 状态层）
- `haptic-feedback` - 在确认和重要操作中使用触觉反馈；避免过度使用（Apple HIG）
- `gesture-alternative` - 不要只依赖手势交互；关键操作始终提供可见控件
- `safe-area-awareness` - 将主要触控目标放在远离刘海、Dynamic Island、手势条和屏幕边缘的位置
- `no-precision-required` - 避免要求对小图标或细边缘进行像素级精确点击
- `swipe-clarity` - 滑动操作必须有清晰的可见暗示或提示（箭头、标签、教程）
- `drag-threshold` - 在开始拖动前使用移动阈值，以避免误拖

### 3. 性能（HIGH）

- `image-optimization` - 使用 WebP/AVIF、响应式图片（srcset/sizes），对非关键资源进行懒加载
- `image-dimension` - 声明 width/height 或使用 aspect-ratio 以防止布局偏移（Core Web Vitals: CLS）
- `font-loading` - 使用 font-display: swap/optional 以避免文本不可见（FOIT）；预留空间以减少布局偏移（MD）
- `font-preload` - 只预加载关键字体；避免对每个变体都过度使用 preload
- `critical-css` - 优先加载首屏 CSS（内联关键 CSS 或提前加载样式表）
- `lazy-loading` - 通过动态导入 / 路由级拆分对非首屏组件进行懒加载
- `bundle-splitting` - 按路由/功能拆分代码（React Suspense / Next.js dynamic）以减少初始加载和 TTI
- `third-party-scripts` - 以 async/defer 方式加载第三方脚本；审查并移除不必要的脚本（MD）
- `reduce-reflows` - 避免频繁的布局读写；批量处理 DOM 读取后再写入
- `content-jumping` - 为异步内容预留空间以避免布局跳动（Core Web Vitals: CLS）
- `lazy-load-below-fold` - 对首屏以下的图片和重型媒体使用 loading="lazy"
- `virtualize-lists` - 对 50+ 项的列表进行虚拟化，以提升内存效率和滚动性能
- `main-thread-budget` - 将每帧工作控制在约 16ms 以内，以实现 60fps；把重任务移出主线程（HIG、MD）
- `progressive-loading` - 对超过 1s 的操作使用骨架屏 / shimmer，而不是长时间阻塞式加载指示器（Apple HIG）
- `input-latency` - 将输入延迟控制在约 100ms 以内，适用于点击/滚动（Material 响应标准）
- `tap-feedback-speed` - 在轻触后的 100ms 内提供视觉反馈（Apple HIG）
- `debounce-throttle` - 对高频事件（滚动、调整大小、输入）使用 debounce/throttle
- `offline-support` - 提供离线状态提示和基本回退（PWA / mobile）
- `network-fallback` - 为慢速网络提供降级模式（更低分辨率图片、更少动画）

### 4. 样式选择（高）

- `style-match` - 将样式与产品类型匹配（使用 `--design-system` 获取推荐）
- `consistency` - 在所有页面上使用相同样式
- `no-emoji-icons` - 使用 SVG 图标（Heroicons、Lucide），不要使用表情符号
- `color-palette-from-product` - 根据产品/行业选择配色方案（搜索 `--domain color`）
- `effects-match-style` - 阴影、模糊、圆角与所选样式保持一致（glass / flat / clay 等）
- `platform-adaptive` - 遵循平台惯例（iOS HIG 与 Material）：导航、控件、排版、动效
- `state-clarity` - 让 hover/pressed/disabled 状态在保持风格一致的同时清晰可辨（Material state layers）
- `elevation-consistent` - 为卡片、抽屉、模态框使用一致的 elevation/阴影尺度；避免随机阴影值
- `dark-mode-pairing` - 让浅色/深色变体一起设计，以保持品牌、对比度和风格一致
- `icon-style-consistent` - 在整个产品中使用同一套图标集/视觉语言（笔画宽度、圆角）
- `system-controls` - 优先使用原生/系统控件，而不是完全自定义的控件；只有在品牌需要时才自定义（Apple HIG）
- `blur-purpose` - 使用模糊来表示背景被遮挡（模态框、抽屉），不要把它当作装饰（Apple HIG）
- `primary-action` - 每个屏幕只应有一个主 CTA；次要操作在视觉上应从属（Apple HIG）

### 5. 布局与响应式（高）

- `viewport-meta` - width=device-width initial-scale=1（绝不禁用缩放）
- `mobile-first` - 先为移动端设计，再扩展到平板和桌面端
- `breakpoint-consistency` - 使用系统化断点（例如 375 / 768 / 1024 / 1440）
- `readable-font-size` - 移动端正文最小 16px（避免 iOS 自动缩放）
- `line-length-control` - 移动端每行 35–60 个字符；桌面端 60–75 个字符
- `horizontal-scroll` - 移动端不要出现水平滚动；确保内容适配视口宽度
- `spacing-scale` - 使用 4pt/8dp 递增间距系统（Material Design）
- `touch-density` - 保持组件间距适合触控：既不拥挤，也不容易误触
- `container-width` - 桌面端使用一致的最大宽度（max-w-6xl / 7xl）
- `z-index-management` - 定义分层的 z-index 尺度（例如 0 / 10 / 20 / 40 / 100 / 1000）
- `fixed-element-offset` - 固定导航栏/底部栏必须为下方内容预留安全内边距
- `scroll-behavior` - 避免嵌套滚动区域干扰主滚动体验
- `viewport-units` - 在移动端优先使用 `min-h-dvh` 而不是 `100vh`
- `orientation-support` - 保持在横屏模式下布局仍然清晰且可操作
- `content-priority` - 在移动端优先展示核心内容；折叠或隐藏次要内容
- `visual-hierarchy` - 通过尺寸、间距、对比度建立层次，而不是仅靠颜色

### 6. 排版与颜色（中）

- `line-height` - 正文使用 1.5-1.75 的行高
- `line-length` - 每行限制在 65-75 个字符
- `font-pairing` - 匹配标题字体与正文字体的气质
- `font-scale` - 使用一致的字号尺度（例如 12 14 16 18 24 32）
- `contrast-readability` - 在浅色背景上使用更深的文字（例如白底配 slate-900）
- `text-styles-system` - 使用平台字体系统：iOS 11 Dynamic Type styles / Material 5 type roles（display、headline、title、body、label）（HIG, MD）
- `weight-hierarchy` - 使用字重强化层次：标题加粗（600–700），正文常规（400），标签中等（500）（MD）
- `color-semantic` - 定义语义化颜色 token（primary、secondary、error、surface、on-surface），不要在组件中直接使用原始 hex（Material color system）
- `color-dark-mode` - 深色模式使用去饱和 / 更浅的色阶变体，而不是反色；需单独测试对比度（HIG, MD）
- `color-accessible-pairs` - 前景/背景配对必须达到 4.5:1（AA）或 7:1（AAA）；使用工具验证（WCAG, MD）
- `color-not-decorative-only` - 功能性色彩（错误红、成功绿）必须配合图标/文字；避免仅靠颜色传达含义（HIG, MD）
- `truncation-strategy` - 优先换行而不是截断；需要截断时使用省略号，并通过 tooltip/展开提供完整文本（Apple HIG）
- `letter-spacing` - 遵循平台默认字间距；避免在正文上使用紧密字距（HIG, MD）
- `number-tabular` - 数据列、价格和计时器使用等宽/表格式数字，以防止布局抖动
- `whitespace-balance` - 有意识地使用留白来分组相关项并分隔区块；避免视觉杂乱（Apple HIG）

### 7. 动画（MEDIUM）

- `duration-timing` - 微交互使用 150–300ms；复杂过渡 ≤400ms；避免 >500ms（MD）
- `transform-performance` - 仅使用 transform/opacity；避免为宽度/高度/top/left 做动画
- `loading-states` - 当加载超过 300ms 时显示骨架屏或进度指示器
- `excessive-motion` - 每个视图最多只对 1–2 个关键元素做动画
- `easing` - 进入时使用 ease-out，退出时使用 ease-in；避免 UI 过渡使用 linear
- `motion-meaning` - 每个动画都必须表达因果关系，而不只是装饰性效果（Apple HIG）
- `state-transition` - 状态变化（hover / active / expanded / collapsed / modal）应平滑过渡，而不是突然跳变
- `continuity` - 页面/屏幕过渡应保持空间连续性（共享元素、方向性滑动）（Apple HIG）
- `parallax-subtle` - 视差效果要谨慎使用；必须尊重减少动态效果设置，且不能造成眩晕感（Apple HIG）
- `spring-physics` - 优先使用基于弹簧/物理的曲线，而不是 linear 或 cubic-bezier，以获得更自然的感觉
- `exit-faster-than-enter` - 退出动画应比进入动画更短（约为进入时长的 60–70%），以体现响应性（MD motion）
- `stagger-sequence` - 列表/网格项进入时按 30–50ms 依次错开；避免全部同时出现或过慢的显现
- `shared-element-transition` - 使用共享元素 / hero 过渡来在屏幕之间保持视觉连续性（MD, HIG）
- `interruptible` - 动画必须可中断；用户点击/手势应立即取消进行中的动画（Apple HIG）
- `no-blocking-animation` - 动画期间绝不能阻塞用户输入；UI 必须保持可交互（Apple HIG）
- `fade-crossfade` - 在同一容器内替换内容时使用交叉淡入淡出
- `scale-feedback` - 可点击卡片/按钮在按下时做轻微缩放（0.95–1.05）；松开时恢复（HIG, MD）
- `gesture-feedback` - 拖拽、滑动和捏合必须提供实时视觉反馈，跟随手指移动（MD Motion）
- `hierarchy-motion` - 使用 translate/scale 的方向来表达层级：从下方进入 = 更深层，从上方退出 = 返回上层
- `motion-consistency` - 在全局统一 duration/easing token；所有动画共享同一种节奏和感觉
- `opacity-threshold` - 淡出的元素不应长时间停留在 opacity 0.2 以下；要么完全淡出，要么保持可见
- `modal-motion` - Modal/sheet 应从触发源位置动画出现（scale+fade 或 slide-in），以提供空间上下文（HIG, MD）
- `navigation-direction` - 前进导航向左/上动画，后退导航向右/下动画——保持方向逻辑一致（HIG）
- `layout-shift-avoid` - 动画不能造成布局重排或 CLS；位置变化应使用 transform

### 8. 表单与反馈（MEDIUM）

- `input-labels` - 每个输入项都要有可见标签（不能只靠 placeholder）
- `error-placement` - 错误信息显示在相关字段下方
- `submit-feedback` - 提交时要有加载态，然后显示成功/失败状态
- `required-indicators` - 标记必填字段（例如星号）
- `empty-states` - 在没有内容时提供有帮助的提示信息和操作
- `toast-dismiss` - Toast 应在 3–5 秒后自动消失
- `confirmation-dialogs` - 对破坏性操作进行确认
- `input-helper-text` - 对复杂输入项在下方提供持续的辅助说明，而不只是 placeholder（Material Design）
- `disabled-states` - 禁用元素使用降低的不透明度（0.38–0.5）+ 光标变化 + 语义属性（MD）
- `progressive-disclosure` - 逐步展示复杂选项；不要一开始就让用户负担过重（Apple HIG）
- `inline-validation` - 在失焦时校验（不是每次按键）；只在用户完成输入后显示错误（MD）
- `input-type-keyboard` - 使用语义化输入类型（email、tel、number）来唤起正确的移动端键盘（HIG, MD）
- `password-toggle` - 为密码字段提供显示/隐藏切换
- `autofill-support` - 使用 autocomplete / textContentType 属性，以便系统自动填充（HIG, MD）
- `undo-support` - 允许对破坏性或批量操作进行撤销（例如“撤销删除” toast）（Apple HIG）
- `success-feedback` - 用简短的视觉反馈确认已完成的操作（对勾、toast、颜色闪烁）（MD）
- `error-recovery` - 错误信息必须包含清晰的恢复路径（重试、编辑、帮助链接）（HIG, MD）
- `multi-step-progress` - 多步骤流程应显示步骤指示器或进度条；允许返回上一步（MD）
- `form-autosave` - 长表单应自动保存草稿，以防意外关闭导致数据丢失（Apple HIG）
- `sheet-dismiss-confirm` - 在未保存更改时关闭 sheet/modal 前应先确认（Apple HIG）
- `error-clarity` - 错误信息必须说明原因 + 解决方法（而不只是“无效输入”）（HIG, MD）
- `field-grouping` - 相关字段应按逻辑分组（fieldset/legend 或视觉分组）（MD）
- `read-only-distinction` - 只读状态在视觉和语义上都应与禁用状态不同（MD）
- `focus-management` - 提交出错后，自动聚焦到第一个无效字段（WCAG, MD）
- `error-summary` - 对多个错误，在顶部显示摘要，并提供到各字段的锚点链接（WCAG）
- `touch-friendly-input` - 移动端输入高度 ≥44px，以满足触控目标要求（Apple HIG）
- `destructive-emphasis` - 破坏性操作使用语义化危险色（红色），并与主要操作视觉分隔（HIG, MD）
- `toast-accessibility` - Toast 不能抢焦点；使用 aria-live="polite" 进行屏幕阅读器播报（WCAG）
- `aria-live-errors` - 表单错误应使用 aria-live 区域或 role="alert" 通知屏幕阅读器（WCAG）
- `contrast-feedback` - 错误和成功状态颜色必须满足 4.5:1 的对比度要求（WCAG, MD）
- `timeout-feedback` - 请求超时必须显示清晰反馈并提供重试选项（MD）

### 9. 导航模式 (HIGH)

- `bottom-nav-limit` - 底部导航最多 5 项；使用带图标的标签（Material Design）
- `drawer-usage` - 使用抽屉/侧边栏承载次要导航，而不是主要操作（Material Design）
- `back-behavior` - 返回导航必须可预测且一致；保留滚动/状态（Apple HIG, MD）
- `deep-linking` - 所有关键屏幕都必须可通过深链接 / URL 到达，以便分享和通知（Apple HIG, MD）
- `tab-bar-ios` - iOS：使用底部 Tab Bar 作为顶层导航（Apple HIG）
- `top-app-bar-android` - Android：使用带导航图标的 Top App Bar 作为主要结构（Material Design）
- `nav-label-icon` - 导航项必须同时有图标和文本标签；只有图标的导航会损害可发现性（MD）
- `nav-state-active` - 当前所在位置必须在导航中有明显视觉高亮（颜色、字重、指示器）（HIG, MD）
- `nav-hierarchy` - 主导航（tabs/bottom bar）与次级导航（drawer/settings）必须清晰分离（MD）
- `modal-escape` - 模态框和抽屉必须提供清晰的关闭/退出方式；移动端支持下滑关闭（Apple HIG）
- `search-accessible` - 搜索必须易于触达（顶部栏或 tab）；提供最近/推荐查询（MD）
- `breadcrumb-web` - Web：在 3+ 层深的层级中使用面包屑，以帮助定位（MD）
- `state-preservation` - 返回时必须恢复之前的滚动位置、筛选状态和输入内容（HIG, MD）
- `gesture-nav-support` - 支持系统手势导航（iOS 左滑返回、Android 预测性返回），且不产生冲突（HIG, MD）
- `tab-badge` - 在导航项上谨慎使用徽标来表示未读/待处理；用户查看后清除（HIG, MD）
- `overflow-menu` - 当操作超出可用空间时，使用溢出/更多菜单，而不是硬塞进去（MD）
- `bottom-nav-top-level` - 底部导航只用于顶层屏幕；绝不要在其中嵌套子导航（MD）
- `adaptive-navigation` - 大屏幕（≥1024px）优先使用侧边栏；小屏幕使用底部/顶部导航（Material Adaptive）
- `back-stack-integrity` - 绝不要悄然重置导航栈或意外跳回首页（HIG, MD）
- `navigation-consistency` - 导航位置必须在所有页面保持一致；不要因页面类型而改变
- `avoid-mixed-patterns` - 不要在同一层级同时混用 Tab + Sidebar + Bottom Nav
- `modal-vs-navigation` - 模态框不能用于主要导航流程；它们会打断用户路径（HIG）
- `focus-on-route-change` - 页面切换后，将焦点移到主内容区域，便于屏幕阅读器用户使用（WCAG）
- `persistent-nav` - 核心导航必须能从深层页面继续访问；不要在子流程中把它完全隐藏起来（HIG, MD）
- `destructive-nav-separation` - 危险操作（删除账户、登出）必须在视觉和空间上与正常导航项分开（HIG, MD）
- `empty-nav-state` - 当某个导航目标不可用时，要解释原因，而不是静默隐藏它（MD）

### 10. 图表与数据 (LOW)

- `chart-type` - 图表类型要与数据类型匹配（趋势 → 折线，比较 → 柱状，占比 → 饼图/环图）
- `color-guidance` - 使用可访问的配色方案；避免仅用红/绿配对，以照顾色盲用户（WCAG, MD）
- `data-table` - 提供表格替代方案以支持无障碍；图表本身不利于屏幕阅读器使用（WCAG）
- `pattern-texture` - 通过图案、纹理或形状补充颜色，使数据在无颜色条件下也能区分（WCAG, MD）
- `legend-visible` - 始终显示图例；放在靠近图表的位置，不要分离到下方的滚动折叠之外（MD）
- `tooltip-on-interact` - 在悬停（Web）或点击（移动端）时提供工具提示/数据标签，显示准确数值（HIG, MD）
- `axis-labels` - 坐标轴要标注单位和可读的刻度；避免在移动端出现截断或旋转标签
- `responsive-chart` - 图表在小屏幕上必须重新排布或简化（例如用横向柱状图代替纵向图，减少刻度）
- `empty-data-state` - 当没有数据时，显示有意义的空状态（“暂无数据” + 指引），不要只显示空白图表（MD）
- `loading-chart` - 图表数据加载时使用骨架屏或闪烁占位；不要显示空的坐标轴框架
- `animation-optional` - 图表入场动画必须尊重 prefers-reduced-motion；数据应立即可读（HIG）
- `large-dataset` - 对于 1000+ 数据点，要聚合或抽样；提供下钻查看细节，而不是全部渲染出来（MD）
- `number-formatting` - 坐标轴和标签上的数字、日期、货币要使用符合本地化的格式（HIG, MD）
- `touch-target-chart` - 交互式图表元素（点、段）必须具备 ≥44pt 的点击区域，或在触摸时放大（Apple HIG）
- `no-pie-overuse` - 不要对超过 5 个类别使用饼图/环图；改用柱状图以提高清晰度
- `contrast-data` - 数据线/柱与背景的对比度 ≥3:1；数据文本标签 ≥4.5:1（WCAG）
- `legend-interactive` - 图例应可点击，以切换系列可见性（MD）
- `direct-labeling` - 对于小型数据集，直接在图表上标注数值，以减少视线往返
- `tooltip-keyboard` - 工具提示内容必须可通过键盘访问，不能只依赖悬停（WCAG）
- `sortable-table` - 数据表必须支持排序，并使用 `aria-sort` 表示当前排序状态（WCAG）
- `axis-readability` - 坐标轴刻度不能过于拥挤；保持可读间距，在小屏幕上自动跳过部分刻度
- `data-density` - 每张图表的信息密度要受限，以避免认知过载；必要时拆分成多张图
- `trend-emphasis` - 强调数据趋势而非装饰；避免使用会遮蔽数据的重渐变/阴影
- `gridline-subtle` - 网格线应保持低对比度（例如 gray-200），不要与数据竞争
- `focusable-elements` - 交互式图表元素（点、柱、扇区）必须可通过键盘导航（WCAG）
- `screen-reader-summary` - 为图表提供文本摘要或 aria-label，向屏幕阅读器描述其关键洞察（WCAG）
- `error-state-chart` - 数据加载失败时必须显示错误消息和重试操作，而不是损坏/空白图表
- `export-option` - 对于数据密集型产品，提供图表数据的 CSV/图片导出
- `drill-down-consistency` - 下钻交互必须保留清晰的返回路径和层级面包屑
- `time-scale-clarity` - 时间序列图必须清楚标注时间粒度（天/周/月），并允许切换

## 如何使用

使用下面的 CLI 工具搜索特定领域。

---

## 前置条件

检查 Python 是否已安装：

```bash
python3 --version || python --version
```

如果未安装 Python，请根据用户的操作系统安装：

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## 如何使用此 Skill

当用户提出以下任一请求时，使用此 skill：

| 场景 | 触发示例 | 从哪里开始 |
|----------|-----------------|------------|
| **新项目 / 页面** | "Build a landing page", "Build a dashboard" | Step 1 → Step 2 (design system) |
| **新组件** | "Create a pricing card", "Add a modal" | Step 3 (domain search: style, ux) |
| **选择风格 / 颜色 / 字体** | "What style fits a fintech app?", "Recommend a color palette" | Step 2 (design system) |
| **审查现有 UI** | "Review this page for UX issues", "Check accessibility" | Quick Reference checklist above |
| **修复 UI bug** | "Button hover is broken", "Layout shifts on load" | Quick Reference → relevant section |
| **改进 / 优化** | "Make this faster", "Improve mobile experience" | Step 3 (domain search: ux, react) |
| **实现深色模式** | "Add dark mode support" | Step 3 (domain: style "dark mode") |
| **添加图表 / 数据可视化** | "Add an analytics dashboard chart" | Step 3 (domain: chart) |
| **技术栈最佳实践** | "React performance tips"、"SwiftUI navigation" | Step 4 (stack search) |

按以下流程执行：

### Step 1: 分析用户需求

提取用户请求中的关键信息：
- **产品类型**：娱乐（社交、视频、音乐、游戏）、工具（扫描、编辑、转换）、生产力（任务管理、笔记、日历）或混合
- **目标受众**：C 端消费者用户；考虑年龄段、使用场景（通勤、休闲、工作）
- **风格关键词**：playful、vibrant、minimal、dark mode、content-first、immersive 等
- **Stack**：从项目中读取，不要假设。这里提到的这句
  "React Native (this project's only tech stack)" — inherited from the project
  this skill was vendored from, not true here. `data/stacks/` carries sixteen;
  pick the one the project actually uses.

### Step 2: 生成设计系统（必需）

**始终先运行 `--design-system`**，以获得包含推理依据的完整建议：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

此命令会：
1. 并行搜索领域（product、style、color、landing、typography）
2. 应用 `ui-reasoning.csv` 中的推理规则来选择最佳匹配
3. 返回完整设计系统：pattern、style、colors、typography、effects
4. 包含需要避免的反模式

**示例：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### Step 2b: 持久化设计系统（Master + Overrides 模式）

要将设计系统保存为**跨会话的分层检索**，添加 `--persist`：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

这会创建：
- `design-system/MASTER.md` — 包含所有设计规则的全局事实来源
- `design-system/pages/` — 页面级覆盖的文件夹

**带页面级覆盖：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

这也会创建：
- `design-system/pages/dashboard.md` — 相对于 Master 的页面级偏差

**分层检索的工作方式：**
1. 在构建特定页面时（例如 "Checkout"），先检查 `design-system/pages/checkout.md`
2. 如果页面文件存在，其中的规则会**覆盖** Master 文件
3. 如果不存在，则仅使用 `design-system/MASTER.md`

**支持上下文感知的检索提示：**
```
I am building the [Page Name] page. Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
Now, generate the code...
```

### 第 3 步：按需补充详细搜索

获取设计系统后，使用领域搜索来获取更多细节：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**何时使用详细搜索：**

| 需求 | 领域 | 示例 |
|------|------|------|
| 产品类型模式 | `product` | `--domain product "entertainment social"` |
| 更多样式选项 | `style` | `--domain style "glassmorphism dark"` |
| 颜色方案 | `color` | `--domain color "entertainment vibrant"` |
| 字体搭配 | `typography` | `--domain typography "playful modern"` |
| 图表建议 | `chart` | `--domain chart "real-time dashboard"` |
| UX 最佳实践 | `ux` | `--domain ux "animation accessibility"` |
| 备用字体 | `typography` | `--domain typography "elegant luxury"` |
| 单个 Google Fonts | `google-fonts` | `--domain google-fonts "sans serif popular variable"` |
| 落地页结构 | `landing` | `--domain landing "hero social-proof"` |
| React Native 性能 | `react` | `--domain react "rerender memo list"` |
| App 界面可访问性 | `web` | `--domain web "accessibilityLabel touch safe-areas"` |
| 密集型企业 / CRM | `dense` | `--domain dense "saved view inline edit bulk"` |
| AI 提示 / CSS 关键词 | `prompt` | `--domain prompt "minimalism"` |

### 第 4 步：技术栈指南（React Native）

获取 React Native 实现方面的最佳实践：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react-native
```

---

## 搜索参考

### 可用领域

| 领域 | 用途 | 示例关键词 |
|--------|--------|---------|
| `product` | 产品类型建议 | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI 风格、颜色、效果 | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | 字体搭配、Google Fonts | elegant, playful, professional, modern |
| `color` | 按产品类型划分的配色方案 | saas, ecommerce, healthcare, beauty, fintech, service |
| `landing` | 页面结构、CTA 策略 | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | 图表类型、库推荐 | trend, comparison, timeline, funnel, pie |
| `ux` | 最佳实践、反模式 | animation, accessibility, z-index, loading |
| `google-fonts` | 单个 Google Fonts 查询 | sans serif, monospace, japanese, variable font, popular |
| `react` | React/Next.js 性能 | waterfall, bundle, suspense, memo, rerender, cache |
| `web` | 应用界面指南（iOS/Android/React Native） | accessibilityLabel, touch targets, safe areas, Dynamic Type |
| `prompt` | AI 提示词、CSS 关键词 | (style name) |

> **从此 vendored 版本中移除：** `data/design.csv` 和 `data/draft.csv`
> （208 KB）。`scripts/core.py`、`scripts/design_system.py` 或
> 此文件中都没有引用它们，因此引擎从未打开过它们——其中的内容在看起来像覆盖的同时并没有被任何人看到。上游也已将它们删除。不要恢复它们。
> （`data/ui-reasoning.csv` **会**被 `design_system.py` 读取，并且保留。）

### 可用栈

| Stack | Focus |
|-------|-------|
| `react-native` | 组件、导航、列表 |

---

## 示例工作流

**用户请求：**“做一个 AI 搜索首页。”

### 第 1 步：分析需求
- 产品类型：工具（AI 搜索引擎）
- 目标受众：追求快速、智能搜索的 C 端用户
- 风格关键词：现代、极简、内容优先、深色模式
- 技术栈：React Native

### 第 2 步：生成设计系统（必需）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "AI search tool modern minimal" --design-system -p "AI Search"
```

**输出：**完整的设计系统，包含模式、风格、颜色、排版、效果和反模式。

### 第 3 步：按需补充更详细的搜索

```bash
# 获取现代工具类产品的风格选项
python3 skills/ui-ux-pro-max/scripts/search.py "minimalism dark mode" --domain style

# 获取搜索交互和加载方面的 UX 最佳实践
python3 skills/ui-ux-pro-max/scripts/search.py "search loading animation" --domain ux
```

### 第 4 步：技术栈指南

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "list performance navigation" --stack react-native
```

**然后：**综合设计系统 + 详细搜索结果并实现设计。

---

## 输出格式

`--design-system` 标志支持两种输出格式：

```bash
# ASCII box（默认）- 终端显示最佳
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - 文档最适合
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## 获取更好结果的技巧

### 查询策略

- 使用**多维关键词**——把产品 + 行业 + 语气 + 密度组合起来：`"entertainment social vibrant content-dense"`，不要只用 `"app"`
- 针对同一个需求尝试不同关键词：`"playful neon"` → `"vibrant dark"` → `"content-first minimal"`
- 先用 `--design-system` 获取完整建议，再用 `--domain` 深入查看你不确定的任何维度
-  हमेशा添加 `--stack react-native` 以获得实现相关指导

### 常见卡点

| 问题 | 怎么做 |
|---------|------------|
| 无法决定风格/颜色 | 用不同关键词重新运行 `--design-system` |
| 深色模式对比度有问题 | Quick Reference §6: `color-dark-mode` + `color-accessible-pairs` |
| 动效感觉不自然 | Quick Reference §7: `spring-physics` + `easing` + `exit-faster-than-enter` |
| 表单 UX 很差 | Quick Reference §8: `inline-validation` + `error-clarity` + `focus-management` |
| 导航感觉混乱 | Quick Reference §9: `nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
| 小屏幕布局出问题 | Quick Reference §5: `mobile-first` + `breakpoint-consistency` |
| 性能 / 卡顿 | Quick Reference §3: `virtualize-lists` + `main-thread-budget` + `debounce-throttle` |

### 交付前检查清单

- 在实现前运行 `--domain ux "animation accessibility z-index loading"` 作为 UX 验证检查
- 最终复核时逐项检查 Quick Reference **§1–§3**（CRITICAL + HIGH）
- 在 375px（小屏手机）和横屏方向下测试
- 验证在启用 **reduced-motion** 和将 **Dynamic Type** 设为最大字号时的行为
- 单独检查深色模式下的对比度（不要假设浅色模式的数值同样适用）
- 确认所有触控目标均 ≥44pt，且没有内容被安全区域遮挡

---

## 专业 UI 的通用规则

这些是经常被忽视、会让 UI 显得不专业的问题：
范围说明：以下规则适用于 App UI（iOS/Android/React Native/Flutter）
，并且**不是**桌面 Web 的交互模式。请按原文理解：这是该技能中
最具体的材料，并且它将自己排除在本仓库通常面向的 Web 工作之外。
对于 Web 界面，请将其作为背景参考，并以 `agents/design-advisor.md`
中的设计契约作为约束规则。

### 图标与视觉元素

| 规则 | 标准 | 避免 | 重要原因 |
|------|------|------|------|
| **不要将 Emoji 作为结构性图标** | 使用基于矢量的图标（例如 Lucide、react-native-vector-icons、@expo/vector-icons）。 | 将 emoji（🎨 🚀 ⚙️）用于导航、设置或系统控件。 | Emoji 依赖字体，在不同平台上的表现不一致，而且无法通过设计 token 精确控制。 |
| **仅使用矢量资产** | 使用 SVG 或平台矢量图标，以获得良好缩放能力并支持主题化。 | 使用会模糊或像素化的位图 PNG 图标。 | 确保可缩放、清晰渲染，以及深色/浅色模式适配。 |
| **稳定的交互状态** | 使用颜色、不透明度或层级变化来表现按压状态，而不要改变布局边界。 | 使用会移动周围内容或引发视觉抖动的布局位移变换。 | 防止交互不稳定，并保持流畅的动效与感知质量。 |
| **正确的品牌标识** | 使用官方品牌资产，并遵循其使用指南（间距、颜色、留白）。 | 猜测 logo 路径、擅自改色或修改比例。 | 防止品牌误用，并确保法律/平台合规。 |
| **一致的图标尺寸** | 将图标尺寸定义为设计 token（例如 icon-sm、icon-md = 24pt、icon-lg）。 | 随意混用 20pt / 24pt / 28pt 等任意值。 | 在整个界面中保持节奏与视觉层级。 |
| **描边一致性** | 在同一视觉层内使用一致的描边宽度（例如 1.5px 或 2px）。 | 任意混用粗细不同的描边风格。 | 不一致的描边会降低精致感和整体协调性。 |
| **实心与线框风格纪律** | 在同一层级只使用一种图标风格。 | 在同一层级混用实心和线框图标。 | 保持语义清晰与风格一致。 |
| **触控目标最小值** | 交互区域最小为 44×44pt（如果图标更小，使用 hitSlop 扩展）。 | 没有扩展点击区域的小图标。 | 满足可访问性和平台可用性标准。 |
| **图标对齐** | 将图标与文本基线对齐，并保持一致的内边距。 | 图标错位或周围间距不一致。 | 防止细微的视觉失衡，这会降低感知质量。 |
| **图标对比度** | 遵循 WCAG 对比度标准：小元素为 4.5:1，较大的 UI 符号最低为 3:1。 | 低对比度图标与背景融为一体。 | 确保在浅色和深色模式下都具备可访问性。 |

### 交互（App）

| 规则 | 要做 | 不要做 |
|------|----|----- |
| **点击反馈** | 在 80-150ms 内提供清晰的按下反馈（涟漪/透明度/阴影） | 点击后没有任何视觉响应 |
| **动画时长** | 将微交互控制在约 150-300ms，并使用平台原生的缓动 | 过渡瞬间完成，或动画过慢（>500ms） |
| **可访问性焦点** | 确保屏幕阅读器的焦点顺序与视觉顺序一致，且标签具有描述性 | 控件没有标签，或焦点遍历令人困惑 |
| **禁用状态清晰度** | 使用禁用语义（`disabled`/原生 disabled 属性）、降低强调，并且不响应点击 | 控件看起来可点，但实际无效 |
| **触控目标最小尺寸** | 保持点击区域至少为 44x44pt（iOS）或 48x48dp（Android）；如果图标更小则扩展命中区域 | 触控目标过小，或只有图标点击区域而没有内边距 |
| **手势冲突预防** | 每个区域只保留一个主要手势，避免嵌套的点击/拖拽冲突 | 重叠的手势导致误操作 |
| **语义化原生控件** | 优先使用原生交互组件（`Button`、`Pressable`、平台等价组件）并带有正确的可访问性角色 | 用普通容器充当主要控件，却没有语义 |

### 浅色/深色模式对比度

| 规则 | 要做 | 不要做 |
|------|----|----- |
| **表面可读性（浅色）** | 让卡片/表面与背景清晰分离，并具有足够的不透明度/层级感 | 表面过于透明，导致层次关系模糊 |
| **文本对比度（浅色）** | 保持正文在浅色表面上的对比度 >=4.5:1 | 低对比度的灰色正文 |
| **文本对比度（深色）** | 保持深色表面上的主文本对比度 >=4.5:1、次级文本对比度 >=3:1 | 深色模式下文本与背景融为一体 |
| **边框与分隔线可见性** | 确保分隔线在两种主题下都清晰可见（不只是浅色模式） | 主题相关边框在某一模式下消失 |
| **状态对比一致性** | 让按下/聚焦/禁用状态在浅色和深色主题中都同样易于区分 | 只为一种主题定义交互状态 |
| **令牌驱动的主题化** | 在应用表面/文本/图标中使用映射到各主题的语义颜色令牌 | 在每个页面硬编码 hex 值 |
| **遮罩与模态可读性** | 使用足够强的模态遮罩来隔离前景内容（通常为 40-60% 黑色） | 遮罩过弱，背景在视觉上仍然抢占注意力 |

### 布局与间距

| 规则 | 要做 | 不要做 |
|------|----|----- |
| **安全区域兼容** | 对所有固定头部、标签栏和 CTA 栏都要尊重顶部/底部安全区域 | 将固定 UI 放在刘海、状态栏或手势区域下方 |
| **系统栏留白** | 为状态栏/导航栏和手势主页指示器预留间距 | 让可点击内容与 OS 界面元素冲突 |
| **一致的内容宽度** | 按设备类别（手机/平板）保持可预测的内容宽度 | 在不同页面之间混用任意宽度 |
| **8dp 间距节奏** | 为内边距/间隔/区块间距使用一致的 4/8dp 间距系统 | 没有节奏感的随机间距增量 |
| **可读的文本行宽** | 在大屏设备上保持长文本易读（避免平板上整段文字通栏铺满） | 全宽长文本，降低可读性 |
| **区块间距层级** | 按层级定义清晰的垂直节奏层次（例如 16/24/32/48） | 相近 UI 层级却使用不一致的间距 |
| **按断点自适应边距** | 在更宽的视口和横屏下增加水平内边距 | 所有设备尺寸/方向都使用同样窄的边距 |
| **滚动与固定元素共存** | 添加底部/顶部内容内边距，避免列表被固定栏遮挡 | 滚动内容被粘性头部/底部栏遮住 |

---

## 交付前检查清单

在交付 UI 代码之前，请核对这些项：
范围说明：此清单适用于 App UI（iOS/Android/React Native/Flutter），
因此它不适用于 web 界面 — 在将其作为仪表盘的交付前门槛之前，请先查看上面的说明。

### 视觉质量
- [ ] 不使用 emoji 作为图标（改用 SVG）
- [ ] 所有图标都来自一致的图标家族和风格
- [ ] 使用官方品牌资源，比例和留白正确
- [ ] 按下态视觉不会改变布局边界或引起抖动
- [ ] 语义化主题 token 使用一致（不为每个页面临时硬编码颜色）

### 交互
- [ ] 所有可点击元素都提供清晰的按下反馈（ripple/opacity/elevation）
- [ ] 触控目标满足最小尺寸（iOS >=44x44pt，Android >=48x48dp）
- [ ] 微交互时长保持在 150-300ms 范围内，并使用有原生手感的缓动
- [ ] 禁用状态视觉清晰且不可交互
- [ ] 屏幕阅读器的焦点顺序与视觉顺序一致，交互标签具有描述性
- [ ] 手势区域避免嵌套/冲突交互（tap/drag/back-swipe 冲突）

### 明暗模式
- [ ] 主文本在明暗两种模式下的对比度都 >=4.5:1
- [ ] 次级文本在明暗两种模式下的对比度都 >=3:1
- [ ] 分隔线/边框和交互状态在两种模式下都能清楚区分
- [ ] 模态框/抽屉的遮罩透明度足够强，以保持前景可读性（通常为 40-60% 黑色）
- [ ] 两种主题都已在交付前测试过（不是只根据单一主题推断）

### 布局
- [ ] 头部、标签栏和底部 CTA 栏都尊重安全区域
- [ ] 滚动内容不会被固定/粘性栏遮住
- [ ] 已在小屏手机、大屏手机和平板上验证（纵向 + 横向）
- [ ] 水平内边距/间距会根据设备尺寸和方向正确适配
- [ ] 4/8dp 间距节奏在组件、区块和页面层级上保持一致
- [ ] 长篇文本在大设备上的阅读宽度仍然合适（不会边到边铺满整段）

### 无障碍
- [ ] 所有有意义的图像/图标都有无障碍标签
- [ ] 表单字段都有标签、提示和清晰的错误信息
- [ ] 不只依赖颜色来传达信息
- [ ] 支持减少动效和动态文字大小，且不会导致布局破坏
- [ ] 无障碍特征/角色/状态（selected、disabled、expanded）能被正确播报