---
name: ui-ux-pro-max
description: "UI/UX design intelligence with searchable style, palette, typography, and chart databases. Use when designing UI components, choosing colors/fonts, reviewing code for UX issues, building landing pages, or implementing responsive layouts."
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---
# UI/UX Pro Max - 设计智能

面向 Web 和移动应用的全面设计指南。涵盖 13 个技术栈，包含 67 种风格、96 套配色方案、57 组字体搭配、99 条 UX 准则和 25 种图表类型。提供可搜索的数据库以及基于优先级的推荐。

## 何时应用

在以下情况下参考这些准则：
- 设计新的 UI 组件或页面
- 选择配色方案和排版字体
- 审查代码中的 UX 问题
- 构建落地页或仪表盘
- 实现无障碍访问要求

## 按优先级划分的规则类别

| 优先级 | 类别 | 影响 | 领域 |
|----------|----------|--------|--------|
| 1 | 无障碍访问 | 关键 | `ux` |
| 2 | 触控与交互 | 关键 | `ux` |
| 3 | 性能 | 高 | `ux` |
| 4 | 布局与响应式 | 高 | `ux` |
| 5 | 排版与颜色 | 中 | `typography`, `color` |
| 6 | 动画 | 中 | `ux` |
| 7 | 风格选择 | 中 | `style`, `product` |
| 8 | 图表与数据 | 低 | `chart` |

## 快速参考

### 1. 无障碍访问（关键）

- `color-contrast` - 普通文本对比度至少为 4.5:1
- `focus-states` - 交互元素上显示可见的焦点环
- `alt-text` - 为有意义的图片提供描述性替代文本
- `aria-labels` - 为纯图标按钮添加 aria-label
- `keyboard-nav` - Tab 键顺序与视觉顺序一致
- `form-labels` - 使用带有 for 属性的 label

### 2. 触控与交互（关键）

- `touch-target-size` - 触控目标最小为 44x44px
- `hover-vs-tap` - 主要交互使用点击/轻触
- `loading-buttons` - 异步操作期间禁用按钮
- `error-feedback` - 在问题附近显示清晰的错误信息
- `cursor-pointer` - 为可点击元素添加 cursor-pointer

### 3. 性能（高）

- `image-optimization` - 使用 WebP、srcset、懒加载
- `reduced-motion` - 检查 prefers-reduced-motion
- `content-jumping` - 为异步内容预留空间

### 4. 布局与响应式（高）

- `viewport-meta` - width=device-width initial-scale=1
- `readable-font-size` - 移动端正文文字最小 16px
- `horizontal-scroll` - 确保内容宽度不超出视口
- `z-index-management` - 定义 z-index 层级（10, 20, 30, 50）

### 5. 排版与颜色（中）

- `line-height` - 正文行高使用 1.5-1.75
- `line-length` - 每行限制为 65-75 个字符
- `font-pairing` - 标题与正文字体的气质相互匹配

### 6. 动画（中）

- `duration-timing` - 微交互使用 150-300ms
- `transform-performance` - 使用 transform/opacity，而非 width/height
- `loading-states` - 骨架屏或加载动画

### 7. 风格选择（中）

- `style-match` - 风格与产品类型相匹配
- `consistency` - 所有页面使用统一风格
- `no-emoji-icons` - 使用 SVG 图标，而非 emoji

### 8. 图表与数据（低）

- `chart-type` - 图表类型与数据类型相匹配
- `color-guidance` - 使用无障碍友好的配色方案
- `data-table` - 提供表格替代方案以满足无障碍需求

## 使用方法

使用下方的 CLI 工具搜索特定领域。

> Python 脚本的使用方法请参见 `python-setup.md`。

---

## 示例工作流

**用户请求：**“为专业护肤服务制作落地页”

### 步骤 1：分析需求
- 产品类型：美容/水疗服务
- 风格关键词：优雅、专业、柔和
- 行业：美容/养生
- 技术栈：html-tailwind（默认）

### 步骤 2：生成设计系统（必需）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
```

**输出：**包含模式、风格、配色、排版、效果以及反模式的完整设计系统。

### 步骤 3：按需补充详细搜索

```bash
# Get UX guidelines for animation and accessibility
python3 skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# Get alternative typography options if needed
python3 skills/ui-ux-pro-max/scripts/search.py "elegant luxury serif" --domain typography
```

### 步骤 4：技术栈指南

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
```

**然后：**将设计系统与详细搜索结果综合起来，并实现该设计。

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

## 获得更佳结果的技巧

1. **关键词要具体** - "healthcare SaaS dashboard" > "app"
2. **多次搜索** - 不同的关键词会揭示不同的洞察
3. **组合多个领域** - 风格 + 排版 + 颜色 = 完整的设计系统
4. **务必检查 UX** - 搜索 "animation"、"z-index"、"accessibility" 以排查常见问题
5. **使用 stack 标志** - 获取针对具体实现的最佳实践
6. **迭代** - 如果首次搜索不匹配，尝试换用不同的关键词

---

## 专业 UI 的通用规则

以下是常被忽视、会让 UI 显得不专业的问题：

### 图标与视觉元素

| 规则 | 应做 | 不应做 |
|------|----|----- |
| **不使用 emoji 图标** | 使用 SVG 图标（Heroicons、Lucide、Simple Icons） | 将 🎨 🚀 ⚙️ 等 emoji 用作 UI 图标 |
| **稳定的悬停状态** | 悬停时使用颜色/透明度过渡 | 使用会导致布局偏移的 scale 变换 |
| **正确的品牌 Logo** | 从 Simple Icons 查证官方 SVG | 凭猜测或使用错误的 Logo 路径 |
| **一致的图标尺寸** | 使用固定 viewBox (24x24) 配合 w-6 h-6 | 随意混用不同的图标尺寸 |

### 交互与光标

| 规则 | 应做 | 不应做 |
|------|----|----- |
| **光标指针** | 为所有可点击/可悬停的卡片添加 `cursor-pointer` | 让交互元素保留默认光标 |
| **悬停反馈** | 提供视觉反馈（颜色、阴影、边框） | 元素没有任何可交互的提示 |
| **平滑过渡** | 使用 `transition-colors duration-200` | 状态瞬间切换或过于缓慢（>500ms） |

### 亮色/暗色模式对比度

| 规则 | 应做 | 不应做 |
|------|----|----- |
| **玻璃卡片在亮色模式** | 使用 `bg-white/80` 或更高的不透明度 | 使用 `bg-white/10`（过于透明） |
| **亮色模式文字对比度** | 文字使用 `#0F172A`（slate-900） | 正文文字使用 `#94A3B8`（slate-400） |
| **亮色模式弱化文字** | 至少使用 `#475569`（slate-600） | 使用 gray-400 或更浅的颜色 |
| **边框可见性** | 亮色模式下使用 `border-gray-200` | 使用 `border-white/10`（不可见） |

### 布局与间距

| 规则 | 应做 | 不应做 |
|------|----|----- |
| **悬浮导航栏** | 添加 `top-4 left-4 right-4` 间距 | 将导航栏紧贴 `top-0 left-0 right-0` |
| **内容内边距** | 考虑固定导航栏的高度 | 让内容被固定元素遮挡 |
| **一致的最大宽度** | 使用相同的 `max-w-6xl` 或 `max-w-7xl` | 混用不同的容器宽度 |

---

## 交付前检查清单

在交付 UI 代码之前，请核验以下事项：

### 视觉质量
- [ ] 没有将 emoji 用作图标（改用 SVG）
- [ ] 所有图标来自统一的图标集（Heroicons/Lucide）
- [ ] 品牌 Logo 正确（已通过 Simple Icons 核验）
- [ ] 悬停状态不会导致布局偏移
- [ ] 直接使用主题颜色（bg-primary），而非 var() 包装

### 交互
- [ ] 所有可点击元素均具有 `cursor-pointer`
- [ ] 悬停状态提供清晰的视觉反馈
- [ ] 过渡平滑（150-300ms）
- [ ] 键盘导航时焦点状态可见

### 亮色/暗色模式
- [ ] 亮色模式文字具有足够对比度（最低 4.5:1）
- [ ] 玻璃/透明元素在亮色模式下可见
- [ ] 两种模式下边框均可见
- [ ] 交付前测试两种模式

### 布局
- [ ] 悬浮元素与边缘之间有适当间距
- [ ] 没有内容被固定导航栏遮挡
- [ ] 在 375px、768px、1024px、1440px 下均有良好响应
- [ ] 移动端无水平滚动

### 无障碍访问
- [ ] 所有图片均有替代文本
- [ ] 表单输入项均有标签
- [ ] 颜色不是唯一的指示方式
- [ ] 已遵循 `prefers-reduced-motion`
