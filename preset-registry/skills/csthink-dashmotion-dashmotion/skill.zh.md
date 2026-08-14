---
name: dashmotion
version: 2.2.4
description: 'Create dark-themed, animated technical diagrams as self-contained HTML+SVG files — flowcharts whose connectors visibly flow, and architecture diagrams where requests travel as light dots through the system (Diagrid/Temporal landing-page style). Use this skill whenever the user asks for a flowchart, workflow, pipeline, process diagram, state machine, system architecture, infrastructure, cloud, microservices, or network topology diagram — and especially when they mention "animated", "flowing", "dynamic", "alive", "GIF-like", or want a diagram for a landing page, README, docs, or product demo. Also use it to convert Mermaid source (a mermaid code block or .mmd file) into an animated diagram — "animate this mermaid", "make this flowchart move". Prefer this over static diagram output whenever the diagram represents anything that moves: requests, events, data, jobs, messages, or control flow.'
---
# Dashmotion

创建专业的动画技术图，并输出为单个自包含 HTML 文件。名称就是其实现方式：`stroke-dash`偏移动画 + `animateMotion`——仅此而已。输出为矢量格式，可无限循环，大小仅几 KB，并且能在任何浏览器中打开。

## 第 1 步——选择模式

| 用户需求 | 模式 | 阅读 |
|---|---|---|
| 步骤、顺序、分支、并行执行、状态转换（“发生什么、以什么顺序发生”） | **流程** | `references/flow-mode.md` + `resources/template-flow.html` |
| 组件、服务、基础设施、包含关系、拓扑（“系统由什么构成”） | **架构** | `references/architecture-mode.md` + `resources/template-architecture.html` |

混合请求（“展示我们的微服务，以及订单如何流经这些服务”）→ 使用架构模式；动画形式的请求路径*就是*流程。只有当流程包含拓扑无法表达的分支逻辑时，才生成两个单独的文件。

**Mermaid 输入**——如果请求包含 Mermaid 源代码（一个 ```mermaid 代码块、一个 `.mmd` 文件或粘贴的代码），还必须先阅读 `references/mermaid-input.md`，再进行其他操作。支持：`flowchart`/`graph` 和 `stateDiagram-v2`；不支持其他图表类型——请明确说明，并提供替代方案。上述模式路由规则仍然适用（mermaid 是语法，而不是语义），并且无论源代码声明的方向是什么，布局始终会重新按从上到下的方向计算。

**开始前请阅读对应模式的参考文件。** 其中的布局计算规则正是 `scripts/layout.py` 所实现的内容（第 5 步）——请阅读它，以便构建清晰的语义图，将颜色/形状/动画样式层应用到脚本生成的几何结构上（并用于手动计算后备方案）。它包含了避免常见问题所需的规则：重叠、箭头穿过方框、循环断裂。

## 第 2 步——两种动画约定（两种模式均适用）

### 流动的虚线连接线——`stroke-dashoffset`

```css
.flow { stroke-dasharray: 5 5; animation: dashmove 0.75s linear infinite; }
@keyframes dashmove { to { stroke-dashoffset: -10; } }
```

- 偏移量的变化值必须等于一个完整的 `stroke-dasharray` 周期（此处为 5+5=10），否则循环会出现明显跳变。
- 负偏移沿路径的绘制方向流动 → **始终从源节点到目标节点编写连接线的 `d`。**
- 0.6–0.9 秒呈现出“电流”般的效果；慢于 1.5 秒则会显得像是出现了卡顿。

### 移动的圆点——`<animateMotion>`

```svg
<circle r="3.5" class="dot" fill="#34d399">
  <animateMotion dur="2s" repeatCount="indefinite"
    path="M400 178 L400 204 L170 204 L170 222"/>
</circle>
```

- `path` 原样复用连接线的 `d`；圆点会精确地沿线移动。
- 圆形没有 `cx`/`cy`——由 `animateMotion` 对其进行定位。
- 使用 `begin="0.7s"` 等设置错开的开始时间。每张图总共使用 3–6 个圆点；将它们放在方向信息具有意义的位置（扇出、汇聚、主要请求路径），绝不要在每条边上都放置圆点。
- 在架构模式中，圆点在语义上表示**传输中的请求/消息**——让圆点沿符合实际情况的端到端路径移动。

## 第 3 步——共享设计令牌

- 页面：`#020617`，40px 网格图案（`#0f1b33`，0.5px 线条）；本地安装 JetBrains Mono 时使用该字体，否则使用系统等宽字体栈（`ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace`）——不获取 Web 字体，文件完全自包含。
- 文本：标签使用 `#e2e8f0` 13px/500，副标签使用 `#64748b` 10px，图例使用 11px。
- 节点圆角为 `rx="8"`；START/END 胶囊的 `rx` = height/2。
- 使用 `context-stroke` 的单个共享箭头标记（继承每条线的颜色）：

```svg
<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
```

- 连接线端点应在距离节点边缘 **4px** 处停止，避免箭头刺穿边框。
- **每个连接线 `<path>` 都必须具有 `fill="none"`**（或位于 `<g fill="none">` 中）——SVG 默认使用黑色填充，如果没有该属性，L 形路径会渲染成一个巨大的黑色多边形。
- Z 轴绘制顺序：网格 → 连接线 → 圆点 → 节点。节点会遮盖线条末端；圆点会“进入”节点并消失，而不是从节点上方滑过。
- ViewBox：`0 0 W H`，其中 H = 最低元素的底部位置 + 50。绝不使用负坐标。

## 步骤 4 — 无障碍与动画（不可妥协）

- 将所有 CSS 动画都封装在 `@media (prefers-reduced-motion: no-preference)` 中。
- SMIL 会忽略该媒体查询 → 保留模板中的内联脚本，该脚本会在启用减少动态效果时移除 `.dot` 元素，并连接可见的 ⏯ 暂停切换控件（`animation-play-state: paused` + `svg.pauseAnimations()`）。
- SVG 添加 `role="img"` + `<title>` + `<desc>`。

## 步骤 5 — 生成文件

dashmotion 提供了一个确定性布局引擎 `scripts/layout.py`（纯标准库）。它会执行各模式参考文档中描述的坐标运算——行打包、分支间距、边界内边距、正交轨道/通道路由——**并渲染完成的 HTML**：几何结构 + 模式样式层 + 你的文案。因此，你**无需**手动计算坐标，*也无需*将 35 个 rect 和 38 个 path `d` 手动抄写到模板中（这两种做法都很慢）。你决定*语义和文案*；脚本负责编写*文件*。完整约定参见 `references/layout-script.md`。

**脚本路径——只要 `python3` 可用，就使用它：**

1. 将请求——或根据 `references/mermaid-input.md` 解析的 Mermaid 源码——解析为 `references/layout-script.md` 中定义的语义图 JSON。**这是你的判断层**，它包含图表所需的一切：
   - 结构：节点（对于架构图，使用 `type` + `tier`——**对于未分组/单组架构图，省略 `tier`**（引擎会自动分层）；对于多组架构图，则需要写入，参见 `layout-script.md`；使用每个节点的 `group` 表示边界归属；流程图的 `shape` **仅为胶囊节点和决策节点编写——绝不要使用 `"shape": "step"`**，步骤节点应省略该字段）、边（`kind`）、组、旅程、任何 `legendExtra`、classDef 保留信息；
   - **文案**：`title`、`subtitle`，以及（对于架构图）恰好包含三张卡片的 `summary`（`accent` 为 cyan/violet/rose，包含 `title`、`items[]`）——面向用户的措辞由你编写，并在此处写入 JSON。
2. 将其写入**临时路径，而不是输出文件夹**——例如 `"$TMPDIR/dashmotion-graph.json"`（或任何 `mktemp` 路径）——然后运行 `python3 <this-skill-directory>/scripts/layout.py "$TMPDIR/dashmotion-graph.json" --render <topic>-dashmotion.html`。语义 JSON 是可丢弃的构建中间产物；交付的 HTML 并不依赖它，因此**绝不要将其写在 `.html` 旁边**——用户的文件夹中应只包含完成的图表。脚本会计算几何结构、应用样式层（按 `type` 设置节点填充/描边、不透明底层 + 样式化 rect 遮罩对、按边的 `kind` 设置 `flow`/`flow-async`/`flow-auth` 连接线类、为每段旅程设置圆点颜色，并使用交错、串联的 `begin`），插入你的文案，并写出**完整、自包含、可直接交付的文件**。标记为 `"loop": true` 的边会渲染为 `↻ label` 注释，而不是路径。
3. 对该文件执行步骤 6。渲染器通过构造保证了结构正确，但步骤 6 仍是最终权威——务必执行。
4. 所有视觉效果仍由你最终决定：如需调整措辞、强调内容、旅程或类型，**编辑 JSON 并重新渲染**（成本低且结果确定）；如需手动微调标签或颜色，直接编辑生成的文件。你不再需要做的是照抄坐标——脚本现在负责几何结构（方案 A）及其周边样板内容。

不要先编写 JSON，然后*又*手动编写 HTML——这会再次产生此路径原本要消除的相同转录成本。渲染、检查、交付。

**手工计算的备用方案——仅当 `python3` 不可用时：**在写入坐标前，根据模式参考明确完成布局运算；复制模板，替换 SVG 内容 / 标题 / 页眉 / 图例 / 摘要卡片（保留 CSS + 暂停切换按钮 + 减少动态效果脚本）；选择 3–6 条圆点路径，复制连接线的 `d` 值并错开 `begin`。这是 2.2 之前的路径——速度较慢，但不需要 Python。

告知用户，该文件可直接在任何浏览器中打开。

### GIF/MP4 导出（仅在用户要求时）

切勿手动渲染帧。对打开的文件进行屏幕录制（macOS ⌘⇧5），或使用无头模式：
`npx timecut <file.html> --viewport=1200,900 --duration=3 --fps=30 --output=flow.mp4`，然后运行 `ffmpeg -i flow.mp4 flow.gif`。
当所有持续时间都能整除 3 秒时，3 秒的录制可实现无缝循环——如果目标是导出 GIF，优先使用 0.75 秒 / 1.5 秒 / 3 秒。

## 步骤 6 — 结构自检（交付前）

文件并非写完就算完成——只有通过此项检查才算完成。`--render` 输出在结构上天然可靠，但仍必须执行检查（它也是手工计算备用方案的保障；该方案的坐标会以可预测的方式出错——连接线层出错的频率远高于文本层）。务必验证，不要想当然。

**机械化路径（只要 `python3` 可用就使用）：**对刚写入的文件运行随附的检查器——

```bash
python3 <this-skill-directory>/scripts/check_diagram.py <your-file>.html
```

它会以确定性的方式检测下列故障类别（重叠、连接线穿过方框、虚线循环接缝、超出边界、圆点偏离其所在直线、黑色填充、端点刺入、悬空的 begin 引用、XML 格式错误）。修复报告的每一项违规并重新运行，直到它输出 `0 violations`。脚本可用时，切勿手动推演算术，切勿自行编写临时验证脚本，并且**绝不要通过打开浏览器或截取屏幕截图来验证**——以该脚本为准；对于它无法检查的项目（标签冲突、精确的边界内边距、图例位置），仍需通过读取数值进行检查。

**如果输入是 Mermaid**，还需对保真度复核（检查清单第 6 项）进行机械化处理：将源内容保存到临时 `.mmd` 文件并运行——

```bash
python3 <this-skill-directory>/scripts/check_fidelity.py <source>.mmd <your-file>.html
```

修复问题，直到它输出 `PASS`。它会验证源文件中的每个节点/边/分组标签是否都**原样**出现，并确认连接线数量与源文件中的边数一致。因此，标签和图例条目必须与源文件中的写法完全一致——不得改写，不得将两个源字符串合并为一个，也不得添加括号（图例条目 `v2 点线橙框` 必须保持为 `v2 点线橙框`，绝不能改成 `v2 治理骨架（点线橙框）`）。这与结构检查存在相同的低召回率陷阱：用文字声称“我原样保留了内容”仍会遗漏实际偏差；脚本不会。

**文字版备用方案（仅当 `python3` 不可用时）：**请使用实际数值进行算术运算，验证下面的每一项（把比较过程写出来），不要仅凭目测代码。修复每一项违规，并重新检查，直到列表中不再有问题。

1. **重叠** — 对每一对位于同一行的元素：`left.x + left.width + gap ≤ right.x`（流程图的 gap ≥ 20 / 架构图的 gap ≥ 40）。对每一对上下堆叠的元素：`top.y + top.height + gap ≤ bottom.y`。边界必须完整包含其子元素，并在四个方向上均留出 ≥ 20px 的内边距；任意两个框之间的部分重叠始终是错误。
2. **连接线穿过框体** — 逐段检查每条路径：在两个端点之间，路径不得进入任何节点矩形。检查每条水平轨道的 `y` 是否与其经过的矩形冲突（`rect.y ≤ y ≤ rect.y + height` 表示发生碰撞）；垂直下行线的 `x` 也应进行同样检查。应使用轨道模式重新布线来修复，而不是挪动框体，导致其他地方出现问题。
3. **动画循环** — 对每个动画类：`|stroke-dashoffset delta|` 必须是 `stroke-dasharray` 周期总和的整数倍（例如 `5 5` → 10），**包括以内联方式覆盖 dasharray 的连接线**（使用 `-10` 关键帧进行动画的异步 `2 4` 边会在每个循环中出现接缝——应为其提供专用关键帧）。对于每个 `animateMotion`，明确指出其轨迹 `d` 所对应的唯一一条连接线——跨越两条连接线的圆点路径会径直穿过它们之间的组件；应将其拆分为按跳连接的多个圆点。每个 `begin="X.end+…"` 都必须引用一个实际存在的 `id`。
4. **ViewBox 边界** — 任何位置都不得出现负坐标；每个矩形的 `x+width`/`y+height` 以及每个路径坐标都必须位于 `0 0 W H` 范围内；H ≥ 最低元素的底部坐标 + 20；图例位于最低边界的下方（架构图）。
5. **连接线与标记规范** — 每条连接线 `<path>` 最终都必须解析为 `fill="none"`；端点应在距离目标边框约 4px 处停止，绝不能进入框体内部；SVG 注释中不得出现 `--`（`<!-- A -- B -->` 会提前结束注释，并将多余文本泄漏到文档中）。
6. **Mermaid 保真度（仅限 mermaid 输入）** — 由上文的 `check_fidelity.py` 进行自动检查；运行该脚本并修复至 `PASS`。它会根据源文件重新计数：节点矩形/胶囊形数量 == 源节点 ID 数量（仅为 `[*]` 添加 START/END 胶囊形）；连接线路径数 + 使用 `↻` 渲染的循环数 == 展开链和 `&` 后的源边数量；每个节点、边、分组以及**图例**标签都必须**逐字一致**（包括从 图例 子图合并而来的图例项——保留其确切文本）。如果没有 `python3`，则手动重新计数。详情见 `references/mermaid-input.md`。

仅在完成一次无需修复任何问题的检查后交付文件。

## 输出约定

一个自包含的 `.html`：嵌入式 CSS、内联 SVG、无外部资源、无 JS 依赖——仅包含约 15 行的内联暂停/减少动态效果脚本。直接从文件系统打开时可正确渲染。