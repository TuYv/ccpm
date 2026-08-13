---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Searchable local database with 84 styles, 192 color palettes, 74 font pairings, 192 product types, 98 UX guidelines, 104 icon entries, 16 GSAP motion presets, and 25 chart types across 22 stacks (React, Next.js, Vue, Nuxt, Svelte, Astro, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, Jetpack Compose, Angular, Laravel, JavaFX, WPF, WinUI, Avalonia, Uno Platform, UWP, Three.js, and HTML/CSS). Use when designing, building, or reviewing UI: pages, components, color schemes, typography, layout, accessibility, animation, or data visualization."
---
# UI/UX Pro Max - 设计智能

可搜索的 UI/UX 设计规则数据库，基于优先级提供推荐：84 种风格、192 套色板、74 组字体搭配、192 种带推理规则的产品类型、98 条 UX 指南、104 个图标条目、16 个 GSAP 动效预设，以及覆盖 22 种技术栈的 25 种图表类型。

## 何时应用

在任务涉及**界面结构、视觉设计决策、交互模式或用户体验质量控制**时使用此 Skill：设计新页面、创建/重构 UI 组件、选择色彩/字体/间距/布局系统、审查 UI 的 UX/可访问性/一致性、实现导航/动画/响应式行为，或提升感知质量与可用性。

若任务为纯后端逻辑、API/数据库设计、非视觉性能工作、基础设施/DevOps，或非可视化脚本——则跳过，除非该任务改变了某物的**外观、感觉、移动方式或交互方式**。

## 按优先级划分的规则类别

*按优先级 1→10 决定首先关注哪个类别；使用 `--domain <Domain>` 查询完整细节。每个类别的完整规则文本都位于 `references/quick-reference.md` — 按需阅读，而不是每次都加载它。*

| 优先级 | 类别 | 影响 | 域 | 关键检查（必须具备） | 反模式（避免） |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | 可访问性 | CRITICAL | `ux` | 对比度 4.5:1，替代文本，键盘导航，Aria 标签 | 去除焦点环，仅图标按钮且无标签 |
| 2 | 触控与交互 | CRITICAL | `ux` | 最小尺寸 44×44px，8px+ 间距，加载反馈 | 仅依赖悬停，瞬时状态变更（0ms） |
| 3 | 性能 | HIGH | `ux` | WebP/AVIF，懒加载，预留空间（CLS &lt; 0.1） | 布局抖动，累计布局偏移 |
| 4 | 风格选择 | HIGH | `style`, `product` | 匹配产品类型，一致性，SVG 图标（不使用 emoji） | 随机混合扁平与拟物，使用 emoji 当图标 |
| 5 | 布局与响应式 | HIGH | `ux` | 移动优先断点，Viewport meta，无水平滚动 | 水平滚动，固定 px 容器宽度，禁用缩放 |
| 6 | 字体与色彩 | MEDIUM | `typography`, `color` | 基础 16px，行高 1.5，语义化色彩 token | 正文小于 12px，灰底灰字，组件内原始十六进制色值 |
| 7 | 动效 | MEDIUM | `ux`, `gsap` | 时长 150–300ms，动效传达含义，空间连续性 | 仅装饰性动效，动画宽度/高度，仅在无障碍减少动态时不处理 |
| 8 | 表单与反馈 | MEDIUM | `ux` | 可见标签，错误靠近字段，辅助文字，渐进式披露 | 仅用占位符作为标签，错误仅在顶部，前期信息过载 |
| 9 | 导航模式 | HIGH | `ux` | 可预期返回，底部导航 ≤5，深度链接 | 导航过载，返回行为中断，缺少深度链接 |
| 10 | 图表与数据 | LOW | `chart` | 图例，提示框，无障碍配色 | 仅依赖颜色传达含义 |

有关每个类别的完整规则列表（包含约 98 条 UX 指南及其依据），请阅读 `references/quick-reference.md`。关于应用特定打磨规则（图标、触摸反馈、暗色模式对比度、安全区域）以及正式交付前的权威检查清单，请阅读 `references/pro-rules.md`。

---

## 运行搜索工具

搜索脚本位于该技能自己的目录中，不在项目目录内。务必使用完整路径调用，不要假设特定工作目录：

```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <domain>
```

如果找不到 `python`，请尝试 `python3`，然后 `py -3`。要求 Python 3.x，无外部依赖（如缺少 Python，请见 README 安装说明）。

## 工作流程

### 步骤 1：分析用户需求

从用户需求中提取：
- **产品类型**：SaaS、电子商务、作品集、仪表盘、娱乐、工具、生产力或混合型
- **目标受众与场景**：年龄段、使用场景（通勤、休闲、工作）
- **风格关键词**：playful、vibrant、minimal、dark mode、content-first、immersive 等
- **技术栈**：从项目中检测——检查 `package.json` 依赖（react/next/vue/svelte/nuxt/@angular）、`pubspec.yaml`（Flutter）、`*.xcodeproj`/`Package.swift`（SwiftUI）、`composer.json`（Laravel）或 React Native 标识（`app.json` + `react-native` 依赖）。若无法检测到任何内容，请询问用户或默认使用 `html-tailwind`。**切勿假设技术栈**——硬编码默认会悄悄误导每一次推荐。

### 步骤 2：生成设计系统（新页面/项目为必需）

始终先使用 `--design-system` 以获得带推理依据的全面建议：

```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

这会并行搜索 product/style/color/landing/typography 领域，并应用 `ui-reasoning.csv` 中的推理规则，返回模式、风格、颜色、排版、效果及需避免的反模式。

**示例：**
```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### 步骤 2b：持久化设计系统（主模板 + 覆盖规则模式）

要跨会话检索并复用设计系统，请添加 `--persist`，并始终传入指向项目根目录的 `--output-dir`——否则文件会写入工具实际运行的当前目录：

```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --design-system --persist -p "Project Name" --output-dir "<project-root>"
```

这将创建：
- `design-system/<project-slug>/MASTER.md` — 全局真相来源
- `design-system/<project-slug>/pages/` — 存放页面级覆盖规则的文件夹

若要添加页面级覆盖，请加上 `--page "dashboard"`，同时还会创建 `design-system/<project-slug>/pages/dashboard.md`。

如果 `design-system/<project-slug>/MASTER.md` 已存在，`--persist` 将**跳过写入并保持不变**，除非你同时传入 `--force` —— 在重生成之前先检查是否存在（并阅读）该文件，以免悄悄覆盖用户或团队成员先前的决策。

**构建特定页面时的检索顺序：**
1. 读取 `design-system/<project-slug>/MASTER.md`
2. 检查 `design-system/<project-slug>/pages/<page-name>.md` 是否存在——若存在，其规则覆盖 Master
3. 否则仅使用 Master 规则

### 步骤 2c：设计旋钮（可选）

三个可选的 1-10 滑块，可在不修改查询语句的情况下微调 `--design-system` 输出。将任意组合与同一命令一起添加：

```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --design-system --variance <1-10> --motion <1-10> --density <1-10>
```

| 旋钮 | 低（1-3） | 中（4-7） | 高（8-10） |
|------|-----------|-----------|-------------|
| `--variance` | 居中/简约（偏向 Minimalism 风格分类） | 平衡/现代 | 大胆/非对称（偏向 Brutalism、Bento Grids） |
| `--motion` | 微妙的微交互 | 标准滚动/交错动效 | 复杂编排（pin、Flip、SplitText） |
| `--density` | 宽松（24-96px 间距比例） | 标准（16-64px，当前默认） | 紧凑/仪表盘（8-32px 间距比例） |

- `--motion` 会附带可直接使用的 GSAP 片段（含框架说明、Do/Don't 与性能说明），来源于 `--domain gsap`，并按解析出的级别（Subtle/Standard/Complex）匹配。
- `--density` 会覆盖 ASCII/markdown/MASTER.md 输出中的 `--space-*` CSS 变量表；可用于仪表盘（高密度）与营销页（低密度）而无需手工改 token。
- 不设置某个旋钮时，对应部分的输出将完全保持先前状态（无行为变更）。

**示例：**
```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "internal analytics dashboard" --design-system --variance 8 --motion 7 --density 8 -p "Ops Console"
```

你这段文本已命中受管项 `ui-ux-pro-max`（当前未加载），我先确认下：

- 你要我继续时，是否先通过 `$loadout-manager` 加载这个具体 skill（`ui-ux-pro-max`）？
- 或者你希望先只浏览/待会再选？
