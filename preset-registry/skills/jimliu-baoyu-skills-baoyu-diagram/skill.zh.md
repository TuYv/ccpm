---
name: baoyu-diagram
description: Create professional, dark-themed SVG diagrams of any type — architecture diagrams, flowcharts, sequence diagrams, structural diagrams, mind maps, timelines, illustrative/conceptual diagrams, and more. Use this skill whenever the user asks for any kind of technical or conceptual diagram, visualization of a system, process flow, data flow, component relationship, network topology, decision tree, org chart, state machine, or any visual representation of structure/logic/process. Also trigger when the user says "画个图" "画一个架构图" "diagram" "flowchart" "sequence diagram" "draw me a ..." or uploads content and asks to visualize it. Output is always a standalone .svg file.
version: 1.117.3
---
# 图表生成器

创建涵盖多种图表类型的专业 SVG 图表。所有输出均为单个自包含的 `.svg` 文件，并嵌入样式和字体。

## 支持的图表类型

| 类型 | 使用时机 | 关键特征 |
|------|-------------|-------------------|
| **架构图** | 系统组件与关系 | 分组框、连接箭头、区域边界 |
| **流程图** | 决策逻辑、流程步骤 | 菱形决策节点、圆角步骤框、定向流 |
| **时序图** | 参与者之间按时间顺序进行的交互 | 垂直生命线、水平消息、激活条 |
| **结构图** | 类图、ER 图、组织结构图 | 分区框、类型化关系（继承、组合） |
| **思维导图** | 头脑风暴、主题探索 | 中心节点、放射状分支、有机布局 |
| **时间线** | 按时间顺序排列的事件 | 水平/垂直轴、事件标记、时间段跨度 |
| **说明图** | 概念性解释、比较 | 自由布局、图标、注释、视觉隐喻 |
| **状态机** | 状态转换、生命周期 | 圆角状态节点、带标签的转换、开始/结束标记 |
| **数据流图** | 数据转换管道 | 处理气泡、数据存储、外部实体 |

## 设计系统

### 配色方案

用于组件类别的语义颜色：

| 类别 | 填充（rgba） | 描边 | 用途 |
|----------|-------------|--------|---------|
| 主色 | `rgba(8, 51, 68, 0.4)` | `#22d3ee`（青色） | 前端、面向用户、输入 |
| 次色 | `rgba(6, 78, 59, 0.4)` | `#34d399`（翡翠绿） | 后端、服务、处理 |
| 第三色 | `rgba(76, 29, 149, 0.4)` | `#a78bfa`（紫罗兰） | 数据库、存储、持久化 |
| 强调色 | `rgba(120, 53, 15, 0.3)` | `#fbbf24`（琥珀色） | 云、基础设施、区域 |
| 警示色 | `rgba(136, 19, 55, 0.4)` | `#fb7185`（玫瑰色） | 安全、错误、警告 |
| 连接器色 | `rgba(251, 146, 60, 0.3)` | `#fb923c`（橙色） | 总线、队列、中间件 |
| 中性色 | `rgba(30, 41, 59, 0.5)` | `#94a3b8`（石板色） | 外部、通用、未知 |
| 高亮色 | `rgba(59, 130, 246, 0.3)` | `#60a5fa`（蓝色） | 活动状态、焦点、当前步骤 |

对于流程图和时序图，应按角色（参与者、决策、流程）而非按技术来分配颜色。

### 排版

使用嵌入式 SVG `@font-face` 或系统等宽字体作为后备：

```svg
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap');
  text { font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace; }
</style>
```

按角色划分的字号：
- **标题：** 16px，字重 700
- **组件名称：** 11-12px，字重 600
- **副标签 / 描述：** 9px，字重 400，颜色 `#94a3b8`
- **注释 / 说明：** 8px，字重 400
- **微小标签（位于箭头上）：** 7-8px

### 核心视觉元素

**背景：** `#0f172a`（slate-900），带有细微网格：
```svg
<defs>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/>
  </pattern>
</defs>
<rect width="100%" height="100%" fill="#0f172a"/>
<rect width="100%" height="100%" fill="url(#grid)"/>
```

**箭头标记（标准）：**
```svg
<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
</marker>
```

**箭头标记（彩色）——根据需要为每种颜色创建：**
```svg
<marker id="arrow-cyan" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee"/>
</marker>
```

**开放式箭头（用于异步/返回消息）：**
```svg
<marker id="arrow-open" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="#64748b" stroke-width="1.5"/>
</marker>
```

### SVG 结构与分层

按以下顺序绘制元素，以获得正确的 z-ordering（SVG 按从后到前的顺序绘制）：

1. 背景填充 + 网格图案
2. 区域/分组边界（虚线轮廓）
3. 连接箭头和线条
4. 不透明遮罩矩形（与组件框位置相同，`fill="#0f172a"`）
5. 组件框（半透明填充 + 描边）
6. 文本标签
7. 图例（右下角或底部区域，位于所有边界之外）
8. 标题块（左上角）

不透明遮罩矩形技巧至关重要——没有它，半透明的组件填充会显示下方的箭头：
```svg
<!-- Mask layer: opaque background to hide arrows -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="#0f172a"/>
<!-- Visual layer: styled component -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="rgba(8,51,68,0.4)" stroke="#22d3ee" stroke-width="1.5"/>
<text x="180" y="125" fill="white" font-size="11" font-weight="600" text-anchor="middle">API Gateway</text>
<text x="180" y="141" fill="#94a3b8" font-size="9" text-anchor="middle">Kong / Nginx</text>
```

### 间距规则

这些规则可以防止重叠——请严格遵守：

- **组件框高度：**50-70px（标准），80-120px（大型/复杂组件）
- **组件之间的最小间距：**垂直方向 40px，水平方向 30px
- **箭头标签间距：**距离任意框边缘 10px
- **区域边界内边距：**围绕所包含组件的内边缘留出 20px
- **图例位置：**至少位于图表最低元素下方 20px
- **标题块：**距离左上角 20px，位于图表内容区域之外
- **viewBox：**始终扩展到能够容纳所有内容，并在四周各留出 30px 的边距

### 组件模式

**标准框（服务/进程）：**
```svg
<rect x="X" y="Y" width="160" height="60" rx="6" fill="#0f172a"/>
<rect x="X" y="Y" width="160" height="60" rx="6" fill="FILL" stroke="STROKE" stroke-width="1.5"/>
<text x="CX" y="Y+24" fill="white" font-size="11" font-weight="600" text-anchor="middle">Name</text>
<text x="CX" y="Y+40" fill="#94a3b8" font-size="9" text-anchor="middle">description</text>
```

**判断菱形（流程图）：**
```svg
<g transform="translate(CX, CY)">
  <polygon points="0,-35 50,0 0,35 -50,0" fill="#0f172a"/>
  <polygon points="0,-35 50,0 0,35 -50,0" fill="rgba(120,53,15,0.3)" stroke="#fbbf24" stroke-width="1.5"/>
  <text y="4" fill="white" font-size="10" font-weight="600" text-anchor="middle">Condition?</text>
</g>
```

**数据库圆柱体：**
```svg
<g transform="translate(X, Y)">
  <rect x="0" y="10" width="120" height="50" rx="2" fill="#0f172a"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="#0f172a"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="#0f172a"/>
  <rect x="0" y="10" width="120" height="50" fill="rgba(76,29,149,0.4)"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1.5"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="rgba(76,29,149,0.4)" stroke="#a78bfa" stroke-width="1.5"/>
  <line x1="0" y1="10" x2="0" y2="60" stroke="#a78bfa" stroke-width="1.5"/>
  <line x1="120" y1="10" x2="120" y2="60" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="60" y="40" fill="white" font-size="11" font-weight="600" text-anchor="middle">PostgreSQL</text>
</g>
```

**区域边界：**
```svg
<rect x="X" y="Y" width="W" height="H" rx="12" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,4"/>
<text x="X+12" y="Y+16" fill="#fbbf24" font-size="9" font-weight="600">AWS us-east-1</text>
```

**安全组：**
```svg
<rect x="X" y="Y" width="W" height="H" rx="8" fill="none" stroke="#fb7185" stroke-width="1" stroke-dasharray="4,4"/>
<text x="X+10" y="Y+14" fill="#fb7185" font-size="8" font-weight="500">VPC / Security Group</text>
```

## 特定类型的布局指南

将此 SKILL.md 文件的目录路径确定为 `{baseDir}`。在开始布局之前，阅读特定图表类型的参考文件。参考文件位于 `{baseDir}/references/`，其中包含详细的布局算法和示例。

### 架构图
→ 阅读 `{baseDir}/references/architecture.md`

要点：数据流从左到右或从上到下。将相关服务分组到区域边界中。在各层之间使用总线/连接线。将数据库放置在底部或右侧。

### 流程图
→ 阅读 `{baseDir}/references/flowchart.md`

要点：主要流程从上到下。使用菱形表示决策，并在出口箭头上标注 Yes/No。使用圆角矩形表示开始/结束。使用 Highlight 颜色突出显示成功路径。

### 时序图
→ 阅读 `{baseDir}/references/sequence.md`

要点：顶部使用方框表示参与者，使用垂直虚线表示生命线，使用水平箭头表示消息（实线=同步，虚线=返回）。时间向下流逝。激活条表示处理过程。如果消息较复杂，则为其编号。

### 结构图
→ 阅读 `{baseDir}/references/structural.md`

要点：使用分区框（类图中的名称 / 属性 / 方法）。关系线：实线加实心菱形=组合，实线加空心菱形=聚合，虚线箭头=依赖，实线三角形=继承。

### 思维导图

从中心概念向外自由辐射布局。使用有机曲线（带三次贝塞尔曲线的 `<path>`）表示分支。使用调色板改变分支颜色。中心节点使用更大的字体，向外逐渐减小。

### 时间线

使用水平或垂直轴线。使用圆形或菱形事件标记显示在轴线上。描述文本偏移到交替两侧，以避免重叠。使用颜色对事件类型进行分类。

### 状态机
复合状态使用带双边框的圆角矩形。初始状态使用实心圆，最终状态使用靶心。自转换使用曲线箭头。所有转换均使用 `event [guard] / action` 格式标注。

## 输出规则

1. 输出**单个 `.svg` 文件**——除 Google Fonts 导入外，不得有外部依赖
2. 设置 `viewBox` 以容纳所有内容，并留出 30px 边距；不要设置固定的 `width`/`height` 属性（让 SVG 响应式缩放）
3. 在根 `<svg>` 元素上包含 `xmlns="http://www.w3.org/2000/svg"`
4. 将所有 `<style>`、`<defs>`、标记和图案置于 SVG 顶部
5. 对居中的标签使用 `text-anchor="middle"`；确保文本不会溢出框体
6. **中文文本支持：**当标签包含中文字符时，使用 `font-family: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', sans-serif'` 并增大框体宽度——CJK 字符更宽
7. **保存位置：**如果输入是文件，保存到 `{inputFileDir}/diagram/`。否则保存到 `{projectDir}/diagram/{topic-slug}/`。如果目录不存在则创建

## 脚本

将此 SKILL.md 文件的目录路径确定为 `{baseDir}`。脚本路径：`{baseDir}/scripts/main.ts`。

解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果可用 `npx` → `npx -y bun`；否则建议安装 bun。

### SVG → @2x PNG

保存 SVG 后，将其转换为 @2x PNG：

```bash
${BUN_X} {baseDir}/scripts/main.ts <svg-path> [options]
```

选项：
- `-s, --scale <n>` — 缩放系数（默认值：2）
- `-o, --output <path>` — 自定义输出路径（默认值：`<input>@2x.png`）
- `--json` — JSON 输出

## 流程

1. 根据用户请求识别图表类型
2. 如果该类型存在相关参考文件，则读取该文件
3. 规划布局：列出所有组件，确定分组和流向，计算位置
4. 按照上述分层顺序编写 SVG
5. 验证间距规则——不得重叠，图例位于边界之外，`viewBox` 足够大
6. 保存 SVG 文件
7. 运行 `${BUN_X} {baseDir}/scripts/main.ts <svg-path>` 以生成 @2x PNG
8. 将两个文件展示给用户