---
name: design-system
description: Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
argument-hint: "[component or token]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---
# 设计系统

Token 架构、组件规范、系统化设计、幻灯片生成。

## 何时使用

- 设计 token 的创建
- 组件状态定义
- CSS 变量系统
- 间距/排版比例
- 设计到代码的交接
- Tailwind 主题配置
- **幻灯片/演示生成**

## Token 架构

加载：`references/token-architecture.md`

### 三层结构

```text
Primitive (raw values)
       ↓
Semantic (purpose aliases)
       ↓
Component (component-specific)
```

**示例：**
```css
/* Primitive */
--color-blue-600: #2563EB;

/* Semantic */
--color-primary: var(--color-blue-600);

/* Component */
--button-bg: var(--color-primary);
```

## 快速开始

**生成 token：**
```bash
node scripts/generate-tokens.cjs --config tokens.json -o tokens.css
```

**校验使用情况：**
```bash
node scripts/validate-tokens.cjs --dir src/
```

## 参考资料

| 主题 | 文件 |
|-------|------|
| Token 架构 | `references/token-architecture.md` |
| 原始 Token | `references/primitive-tokens.md` |
| 语义 Token | `references/semantic-tokens.md` |
| 组件 Token | `references/component-tokens.md` |
| 组件规格 | `references/component-specs.md` |
| 状态与变体 | `references/states-and-variants.md` |
| Tailwind 集成 | `references/tailwind-integration.md` |

## 组件规范模式

| 属性 | 默认 | 悬停 | 激活 | 禁用 |
|----------|---------|-------|--------|----------|
| 背景 | primary | primary-dark | primary-darker | muted |
| 文本 | white | white | white | muted-fg |
| 边框 | none | none | none | muted-border |
| 阴影 | sm | md | none | none |

## 脚本

| 脚本 | 用途 |
|--------|---------|
| `generate-tokens.cjs` | 从 JSON token 配置生成 CSS |
| `validate-tokens.cjs` | 检查代码中的硬编码值 |
| `search-slides.py` | BM25 搜索 + 上下文推荐 |
| `slide-token-validator.py` | 校验 slide HTML 的 token 合规性 |
| `fetch-background.py` | 从 Pexels/Unsplash 获取图片 |

## 模板

| 模板 | 用途 |
|----------|---------|
| `design-tokens-starter.json` | 包含三层结构的入门 JSON |

## 集成

**与 brand：** 从品牌色彩/排版提取原始层
**与 ui-styling：** 组件 token → Tailwind 配置

**技能依赖：** brand、ui-styling
**主要代理：** ui-ux-designer、frontend-developer

## 幻灯片系统

使用 design tokens + Chart.js + 上下文决策系统的品牌一致演示。

### 单一事实来源

| 文件 | 用途 |
|------|---------|
| `docs/brand-guidelines.md` | 品牌识别、语气、色彩 |
| `assets/design-tokens.json` | Token 定义（primitive→semantic→component） |
| `assets/design-tokens.css` | CSS 变量（在幻灯片中导入） |
| `assets/css/slide-animations.css` | CSS 动效库 |

### 幻灯片搜索（BM25）

```bash
# Basic search (auto-detect domain)
python scripts/search-slides.py "investor pitch"

# Domain-specific search
python scripts/search-slides.py "problem agitation" -d copy
python scripts/search-slides.py "revenue growth" -d chart

# Contextual search (Premium System)
python scripts/search-slides.py "problem slide" --context --position 2 --total 9
python scripts/search-slides.py "cta" --context --position 9 --prev-emotion frustration
```

### 决策系统 CSV

| 文件 | 用途 |
|------|---------|
| `data/slide-strategies.csv` | 15 种 deck 结构 + 情绪曲线 + sparkline beats |
| `data/slide-layouts.csv` | 25 种布局 + 组件变体 + 动画 |
| `data/slide-layout-logic.csv` | 目标 → 布局 + break_pattern 标志 |
| `data/slide-typography.csv` | 内容类型 → 排版比例 |
| `data/slide-color-logic.csv` | 情绪 → 色彩处理 |
| `data/slide-backgrounds.csv` | 幻灯片类型 → 图片类别（Pexels/Unsplash） |
| `data/slide-copy.csv` | 25 种文案公式（PAS、AIDA、FAB） |
| `data/slide-charts.csv` | 25 种图表类型与 Chart.js 配置 |

### 上下文决策流程

```text
1. Parse goal/context
        ↓
2. Search slide-strategies.csv → Get strategy + emotion beats
        ↓
3. For each slide:
   a. Query slide-layout-logic.csv → layout + break_pattern
   b. Query slide-typography.csv → type scale
   c. Query slide-color-logic.csv → color treatment
   d. Query slide-backgrounds.csv → image if needed
   e. Apply animation class from slide-animations.css
        ↓
4. Generate HTML with design tokens
        ↓
5. Validate with slide-token-validator.py
```

### 模式打破（Duarte Sparkline）

高级 deck 在情绪上交替以提高参与度：
```
"What Is" (frustration) ↔ "What Could Be" (hope)
```

系统会在 1/3 与 2/3 位置计算模式断点。

### 幻灯片要求

**所有幻灯片都必须：**
1. 导入 `assets/design-tokens.css` —— 作为唯一真实来源
2. 使用 CSS 变量：`var(--color-primary)`、`var(--slide-bg)` 等
3. 图表使用 Chart.js（不得使用仅 CSS 柱状图）
4. 包含导航（键盘方向键、点击、进度条）
5. 内容居中对齐
6. 聚焦于说服/转化

### Chart.js 集成

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<canvas id="revenueChart"></canvas>
<script>
new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            data: [5, 12, 28, 45],
            borderColor: '#FF6B6B',  // Use brand coral
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            tension: 0.4
        }]
    }
});
</script>
```

### Token 合规性

```css
/* CORRECT - uses token */
background: var(--slide-bg);
color: var(--color-primary);
font-family: var(--typography-font-heading);

/* WRONG - hardcoded */
background: #0D0D0D;
color: #FF6B6B;
font-family: 'Space Grotesk';
```

### 参考实现

具备全部功能的工作示例：
```
assets/designs/slides/claudekit-pitch-251223.html
```

### 命令

```bash
/slides:create "10-slide investor pitch for ClaudeKit Marketing"
```

## 最佳实践

1. 组件中绝不能使用原始十六进制颜色值，必须始终引用 token
2. 语义层支持主题切换（浅色/深色）
3. 组件 token 支持按组件进行定制
4. 使用 HSL 格式控制透明度
5. 记录每个 token 的用途
6. **幻灯片必须导入 design-tokens.css 并且只使用 var()**
