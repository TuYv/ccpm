---
name: design-intelligence
description: "Design system bootstrapping and token generation. Takes project context and outputs ready-to-use design tokens, Tailwind config, and CSS variables."
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
---
# 设计智能 — 令牌生成与设计系统从零搭建

这个技能帮助你从零开始搭建设计系统。向它提供你的项目背景（行业、品牌、用户），它就会生成可直接使用的设计令牌，并附上 Tailwind 配置片段和 CSS 变量文件。

## 何时使用

- 为新项目搭建设计系统（`/spartan:ux system`）
- 为特定行业/品牌选择配色方案
- 生成排版比例
- 创建间距系统
- 引导生成组件清单

## 本技能的作用

1. 获取项目背景（做什么、面向谁、行业、风格个性）
2. 生成完整的设计令牌集
3. 以 3 种格式输出：令牌参考文档、Tailwind 配置、CSS 变量
4. 根据项目类型创建组件清单

## 工作原理

### 步骤 1：收集背景信息

提出以下问题（用户已经回答过的可以跳过）：

1. **你在构建什么？**（仪表盘、SaaS、市场平台、移动应用、落地页等）
2. **谁会使用它？**（开发者、业务用户、消费者、管理员）
3. **风格个性是什么？**选择 2-3 个：
   - 干净 / 专业 / 企业化
   - 大胆 / 活泼 / 创意
   - 极简 / 技术 / 面向开发者
   - 温暖 / 友好 / 平易近人
   - 高端 / 奢华 / 精致
   - 数据密集 / 紧凑 / 信息丰富
4. **浅色、深色，还是两者都要？**
5. **是否已有确定的品牌色？**（如果有，以其为基础）
6. **参考应用？**（具有你想要的品质的应用）

### 步骤 2：生成配色方案

根据背景信息，生成完整的配色方案：

**深色主题：**
```
Background:     #0F172A (slate-900 family)
Surface:        rgba(30, 41, 59, 0.5) (glass effect)
Primary:        [based on personality — blue for professional, green for growth, etc.]
Primary Hover:  [10% darker]
Accent:         [complementary or analogous — use sparingly, max 10-15%]
Text:           #F8FAFC (near white)
Text Secondary: #94A3B8 (slate-400)
Text Muted:     #64748B (slate-500)
Border:         rgba(148, 163, 184, 0.1)
Success:        #22C55E
Warning:        #F59E0B
Error:          #EF4444
```

**浅色主题：**
```
Background:     #FFFFFF or #F8FAFC
Surface:        #FFFFFF
Primary:        [based on personality]
Primary Hover:  [10% darker]
Accent:         [complementary]
Text:           #0F172A (near black)
Text Secondary: #475569 (slate-600)
Text Muted:     #64748B (slate-500)
Border:         #E2E8F0 (slate-200)
Success:        #16A34A
Warning:        #D97706
Error:          #DC2626
```

**根据风格个性选择颜色：**

| 风格个性 | 主色范围 | 强调色范围 |
|-------------|--------------|-------------|
| 专业 / 企业化 | 蓝色（#2563EB → #1E40AF） | 石板灰或琥珀色 |
| 大胆 / 创意 | 紫色（#7C3AED）、粉色（#EC4899） | 黄色或青色 |
| 极简 / 技术 | 灰色（#374151）、黑色（#111827） | 一个明亮的强调色 |
| 温暖 / 友好 | 橙色（#EA580C）、青绿色（#0D9488） | 琥珀色或玫瑰色 |
| 高端 / 奢华 | 深蓝（#1E3A5F）、金色（#B8860B） | 银色或香槟色 |
| 数据密集 | 中性蓝（#3B82F6） | 绿色表示正向，红色表示负向 |

### 步骤 3：生成排版比例

根据风格个性选择字体搭配：

| 风格个性 | 推荐字体 | 理由 |
|-------------|-------------------|-----|
| 专业 | DM Sans、Plus Jakarta Sans | 简洁的几何风格，适合 UI |
| 技术 | JetBrains Mono（代码）+ Inter（UI） | 对开发者友好 |
| 创意 | Outfit、Space Grotesk | 独特但易读 |
| 温暖 | Nunito、Quicksand | 圆润、亲切的感觉 |
| 高端 | Playfair Display（标题）+ Lato（正文） | 优雅的对比 |
| 数据密集 | Inter、Roboto Mono（数字） | 表格数字，高可读性 |

**字号比例（基准 16px）：**
```
h1: 36px / 700 / 1.2 line-height
h2: 30px / 700 / 1.25
h3: 24px / 600 / 1.3
h4: 20px / 600 / 1.35
h5: 18px / 600 / 1.4
h6: 16px / 600 / 1.4
body: 16px / 400 / 1.6
body-sm: 14px / 400 / 1.5
caption: 12px / 500 / 1.4
```

### 步骤 4：生成间距与圆角

**间距比例（8px 基准）：**
```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   16px  (1rem)
lg:   24px  (1.5rem)
xl:   32px  (2rem)
2xl:  48px  (3rem)
3xl:  64px  (4rem)
```

**按风格个性的圆角：**

| 风格个性 | 卡片 | 按钮 | 徽章 | 输入框 |
|-------------|------|--------|-------|-------|
| 专业 | 8px | 6px | 4px | 6px |
| 极简 | 0-4px | 4px | 2px | 4px |
| 友好 | 12-16px | 8px | 9999px | 8px |
| 高端 | 12px | 8px | 6px | 8px |

**按风格个性的阴影：**

| 风格个性 | 样式 |
|-------------|-------|
| 专业 | 细微：`0 1px 3px rgba(0,0,0,0.1)` |
| 极简 | 无阴影或非常细微的边框 |
| 友好 | 柔和：`0 4px 12px rgba(0,0,0,0.08)` |
| 高端 | 分层：`0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)` |
| 深色主题 | 发光：`0 0 20px rgba(primary, 0.15)` |

### 步骤 5：以 3 种格式输出

#### 格式 1：令牌参考文档（`.planning/design/system/tokens.md`）

包含所有令牌的人类可读 markdown 文档，供设计师和所有命令使用。

#### 格式 2：Tailwind 配置片段

```typescript
// Paste into tailwind.config.ts → theme.extend
{
  colors: {
    primary: '[value]',
    'primary-hover': '[value]',
    accent: '[value]',
    background: '[value]',
    surface: '[value]',
    // ... all color tokens
  },
  fontFamily: {
    sans: ['[font]', 'sans-serif'],
  },
  borderRadius: {
    card: '[value]',
    button: '[value]',
  },
  boxShadow: {
    card: '[value]',
  },
}
```

#### 格式 3：CSS 变量

```css
:root {
  /* Colors */
  --color-primary: [value];
  --color-primary-hover: [value];
  --color-accent: [value];
  --color-bg: [value];
  --color-surface: [value];
  --color-text: [value];
  --color-text-secondary: [value];
  --color-text-muted: [value];
  --color-border: [value];
  --color-success: [value];
  --color-warning: [value];
  --color-error: [value];

  /* Typography */
  --font-family: '[font]', sans-serif;
  --font-size-h1: 36px;
  /* ... full scale */

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Radius */
  --radius-card: [value];
  --radius-button: [value];
  --radius-badge: [value];

  /* Shadows */
  --shadow-sm: [value];
  --shadow-md: [value];
  --shadow-lg: [value];
}
```

### 步骤 6：生成组件清单

根据项目类型，列出所需的组件：

**仪表盘 / SaaS：**
- 侧边栏导航、顶栏、统计卡片、数据表格、图表、模态框、表单、Toast 通知、下拉菜单、徽章、头像、面包屑

**市场平台 / 电商：**
- 商品卡片、搜索栏、筛选器、购物车、结账表单、评论、评分、图片画廊、价格展示、分类导航

**移动应用：**
- 底部标签栏、下拉刷新、可滑动卡片、操作面板、悬浮操作按钮、列表项、空状态、引导页

**落地页：**
- 首屏区域、功能网格、用户评价、价格表、CTA 按钮、页脚、导航、社会证明

将组件清单保存到 `.planning/design/system/components.md`。

---

## 代码生成的设计系统约束

**在生成 UI 代码且设计令牌已存在时：**

首先阅读 `.planning/design/system/tokens.md` 或 `.planning/design-config.md`。你的代码必须使用这些令牌。不要使用 Tailwind 默认值、通用颜色或随意编造的间距。

可以把它想象成爵士乐手：和弦进行已经确定（即令牌）。你的任务是在其中构建出优美的作品。不要改变调性。

---

## 交付前检查清单

- [ ] 已生成全部 3 种输出格式（令牌文档、Tailwind、CSS 变量）
- [ ] 颜色具有足够的对比度（文本为 4.5:1）
- [ ] 排版比例一致且易读
- [ ] 间距使用网格（无任意值）
- [ ] 组件清单与项目类型匹配
- [ ] design-config.md 已更新（如果之前已存在）
