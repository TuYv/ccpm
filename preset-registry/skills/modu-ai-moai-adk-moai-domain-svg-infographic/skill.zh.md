---
name: moai-domain-svg-infographic
description: >
  Author editable SVG technical infographics — architecture, flow, comparison,
  hierarchy — by computing the layout numerically before writing markup, then
  rendering a 2x PNG via headless Chromium. Carries a CJK-first font stack, a
  deterministic source lint, and mermaid-vs-SVG selection rules.

when_to_use: >
  Use for a static diagram image bound for slides, email, social, or offline
  use, or a freeform architecture infographic needing pixel control or precise
  Korean line wrapping. Markdown-embedded diagrams that change often or stay
  locale-synced remain mermaid.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
user-invocable: true
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-07-24"
  modularized: "true"
  tags: "svg, infographic, diagram, architecture, flow, png, chromium, cjk, layout"
  related-skills: "moai-domain-html-report"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# SVG 技术信息图

制作一张可手工编辑的 SVG 图，其几何布局通过算术计算而非目测决定，并提供一张对应的 2x PNG 栅格图。输出为单张静态图像：无动画、无脚本，查看时不依赖外部资源。

## 第 0 步——判断这是否适合使用 SVG

此技能是对 Mermaid 流程的**补充，绝不能取代它**。这里的任何内容都不会自行迁移、重写或弃用现有的 Mermaid 图（唯一的例外是：调用方通过捆绑参考资料表中的可选导入器引用发起导入；此时由下述单一归属规则管控，并在同一次变更中直接替换源图），而且任何图都不应同时以两种形式存在——那会造成双重维护，而这正是本节旨在防止的唯一一种失败。

在绘制任何内容之前，先确定请求的处理路线：

| 判断信号 | 处理路线 |
|--------|----------|
| 图位于 Markdown 文档内 | Mermaid |
| 图经常随周围正文一起变更 | Mermaid |
| 图属于标准类型：流程图、时序图、ER 图、状态图、类图、甘特图 | Mermaid |
| 图中的文本标签需要在不同语言区域之间保持同步 | Mermaid |
| 交付物是用于幻灯片、电子邮件、社交媒体或离线阅读的图像文件 | 此技能 |
| 图是不具备标准形状的自由形式架构或概念信息图 | 此技能 |
| 需要对位置、间距或层叠进行像素级控制 | 此技能 |
| 韩文或其他 CJK 标签必须按经过精确验证的宽度换行 | 此技能 |

当多个信号同时指向两种路线时，优先选择 Mermaid：与图像相比，保持 Mermaid 代码块正确所需的成本更低。仅当路由表给出了明确且无相反信号的理由时，才选择此技能。

**一张图，一个归属。** 如果 Mermaid 版本已经存在，要么直接替换它（并在同一次变更中删除 Mermaid 代码块），要么保持原样。绝不能同时交付两者。

## 运行时前提条件与降级处理

Node 18 或更高版本以及 Chromium 系列无头浏览器**仅用于检查和渲染**。安装此技能、发现此技能或编写可编辑 SVG 均不需要它们——SVG 编写始终可用。

| Node 18+ | 无头 Chromium | 交付内容 |
|----------|-------------------|-------------------|
| 已安装 | 已安装 | 可编辑 SVG、机器检查报告、2x PNG；同时披露浏览器可执行文件及其版本，并验证 PNG 文件头中的尺寸 |
| 已安装 | 未安装 | 可编辑 SVG及机器检查报告。明确说明未找到无头浏览器，因此未生成 PNG |
| 未安装 | 任意情况 | 可编辑 SVG及 `references/authoring.md` 中人工检查清单的结果。**不要**附加机器检查标签，也不要声称执行了渲染 |

绝不能为未实际运行的工具编造 PNG、像素尺寸或检查结论。说明跳过了哪个步骤以及跳过的原因。

## 工作流程

共六个步骤，按顺序执行。在编写任何一个 SVG 元素之前，必须先完成第 1 至第 3 步；这一顺序正是整个方法的核心。

1. **定框架。** 写下图表必须传达的核心信息，然后设置下方四个输出参数。它们会改变交付物、画布、信息密度和措辞，因此必须在选择原型之前确定，而不是之后。
2. **选择原型。** 架构堆栈、从左到右的流程、并排对比或层级树。骨架位于 `references/archetypes.md`。
3. **执行数值布局。** 生成方框表，并通过下方所有容纳关系检查和文本预算检查。任何一行未通过时都不得继续。
4. **根据表格编写 SVG。** 每个坐标要么直接取自表格值，要么通过基于表格值的公式计算得出。
5. **使用 `scripts/check-svg.mjs` 检查源文件。** 清除所有错误；逐一研判所有警告。
6. **使用 `scripts/render.mjs` 渲染并验证。** 确认报告中的 PNG 尺寸与所要求的 2x 目标一致，然后目视检查 PNG。

### 四个输出调节项

| 调节项 | 可选值 | 默认值 |
|------|--------|---------|
| **format** | `svg` · `svg+png` | `svg+png` |
| **size** | `doc-inline`（宽 1200）· `slide-16x9`（1600x900）· `social-og`（1200x630）· `print-a4-landscape`（1754x1240）· `fit`（原型自身的预设） | `doc-inline` |
| **detail** | `faithful`（<=24 个节点，分区排列）· `balanced`（<=12）· `simplified`（<=7） | `balanced` |
| **audience** | `engineer` · `mixed` · `executive` | `mixed` |

每个调节项都有默认值，因为没有默认值的调节项会让一份由四部分组成的约定
在每次调用时都变成四个问题。在交付物旁注明最终确定的四个值，以便后续重新生成
相同的产物。`size` 不仅设置 `viewBox`，还设置字号层级，而 `audience` 控制措辞，
而非节点数量——两者均在 `references/archetypes.md` 中有详细说明。

### 复杂度预算

**每种类型都有节点上限，超出上限就意味着拆分或简化——
绝不能缩小方框。** 上限由 `detail` 调节项决定：`balanced` 模式下为 12 个节点，
`simplified` 模式下为 7 个，`faithful` 模式下为 24 个，且只能位于带标签的分区内。
在所有模式下：连接线最多 12 条，`accent` 元素最多 2 个。`faithful`
仅豁免节点数量限制，其他限制均不豁免。各原型的上限见
`references/archetypes.md`。

## 数值布局阶段

在创作之前先构建一张表。每个方框有五个自有列——`id`、`x`、`y`、
`w`、`h`——除此之外，文件中不应手动输入任何数字。所有其他数字都由这些值推导得出。

**网格。** 对于画布宽度 `W`、`n` 列、外边距 `M`、列间距 `G`：

```
colW    = (W - 2*M - (n-1)*G) / n
colX(i) = M + i * (colW + G)
```

如果 `colW` 小于该原型的最小卡片宽度，请减少 `n` 或增大
`W`。不要通过缩小边距来勉强维持列数。

**包含关系。** 检查每一行，如有任一条件不满足，立即停止：

```
M <= x            and  x + w <= W - M
M <= y            and  y + h <= H - M
parent.x + pad <= child.x   and  child.x + child.w <= parent.x + parent.w - pad
```

**派生几何数据。** 中心点和锚点应根据方框计算，绝不能通过针对特定语言的
微调来确定：

```
cx            = x + w/2
cy            = y + h/2
iconCenter    = (x + pad + iconR, y + h/2)
titleBaseline = y + pad + titleSize
lineBaseline(k) = titleBaseline + titleGap + k*lineHeight
```

如果你发现自己要把图标下移三个单位，“因为韩文文本位置偏低”，
那就是公式有误。应修正公式，而不是调整具体实例。针对特定语言的手动偏移
正是此方法旨在消除的渲染修复循环。

**连接线。** 端点同样通过计算得出；从终点中减去箭头长度，
使标记尖端落在边框上，而不是落在边框内部：

```
horizontal A->B: (A.x + A.w, A.cy) -> (B.x - markerLen, B.cy)
vertical   A->B: (A.cx, A.y + A.h) -> (B.cx, B.y - markerLen)
elbow      A->B: midX = (A.x + A.w + B.x) / 2
                 path: M A.x+A.w A.cy  H midX  V B.cy  H B.x-markerLen
```

完整公式集（包括径向展开和多通道扇出）见
`references/authoring.md`。

## 文本预算——CJK 优先

在根元素上设置 CJK 优先的字体栈，以便谚文、假名和汉字字形优先解析，然后才考虑任何拉丁字体回退。拉丁字体优先的字体栈会使 CJK 字形回退到任意系统字体，并在不知不觉中改变所有测量宽度：

```
font-family="Pretendard, 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC',
             'Apple SD Gothic Neo', 'Hiragino Sans', 'Microsoft YaHei',
             system-ui, sans-serif"
```

对于可用宽度 `u = w - 2*pad` 和字号 `s`，每行容量为：

```
Latin: capacity = u / (0.60 * s)     average Latin advance is about 0.60em
CJK:   capacity = u / (1.00 * s)     full-width advance is 1.00em
```

二者之间的比例就是实际工作准则：**在相同字号和相同文本框中，韩文、日文或中文行所能容纳的字符数约为拉丁文字行的 60%**。请根据这一数字规划文案，并**在创作之前修改措辞以使其适配**。混合多种文字系统的行，其整个长度均按 CJK 比率估算。

这里禁止采用两种做法，因为它们都只是在掩盖问题，而不是解决问题：事后截断标签，以及只针对某一种语言缩小字号。应当重写标签。

## 可访问的 SVG 输出

SVG 本身没有可访问名称。如果缺少可访问名称，它会被宣读为未标记的图形，其中的 `<text>` 也不会被读取——因此，未标记的图表并不是体验降级的图表，而是根本不存在的图表。此 Skill 输出的每个 SVG 都包含以下四项：

- 根 `<svg>` 上的 `role="img"`。
- 使用 `aria-labelledby` 指定 `<title>` 和 `<desc>` 的 id。
- 将 `<title>` 作为位于 `<defs>` 之前的**第一个**子元素，用于保存图表名称。
- 使用 `<desc>` 描述*内容*——即读者从中获得的信息——绝不逐框叙述几何布局。

ID 必须**为每个图表添加前缀**（`<slug>-title`、`<slug>-desc`）：当两个图表以内联方式放入同一页面时，未加前缀的 `title` / `desc` 会发生冲突，导致第二个图表被使用第一个图表的名称宣读。真正用于装饰的图形应改为包含 `aria-hidden="true"`，并且不设置标题——图表绝不属于装饰性图形。

`check-svg.mjs` 会将此要求作为错误 `SVG060`-`SVG064` 强制执行。可复制的骨架和双方向夹具检查位于 `references/authoring.md` 第 8 节。

## 检查源文件

```bash
node ${CLAUDE_SKILL_DIR}/scripts/check-svg.mjs diagram.svg          # human-readable diagnostics
node ${CLAUDE_SKILL_DIR}/scripts/check-svg.mjs diagram.svg --json   # machine-readable
node ${CLAUDE_SKILL_DIR}/scripts/check-svg.mjs diagram.svg --strict # warnings also fail
```

每条诊断信息都包含 `file:line:column`、稳定的代码和一条消息。以下两个级别不可互换：

**错误——确定性问题，始终需要修复。** 标签不平衡；缺少 `viewBox` 或其格式错误；`width`/`height` 对的宽高比与 `viewBox` 矛盾；`id` 重复；局部引用（`url(#id)`、`href="#id"`）没有匹配的 `id`；`<marker>` 缺少必需的几何属性；`<marker>` 依赖隐式的 `markerUnits` 默认值，导致箭头随描边宽度缩放，这通常会造成箭头在一张图表中显示正常，而在下一张图表中显示异常；缺少可访问 SVG 约定中的某一部分（`SVG060`-`SVG064`）——没有 `role`、没有 `aria-labelledby`、`<title>` 不是第一个子元素、缺少 `<desc>`，或者使用了未加前缀的 `title` / `desc` id。

**警告——基于启发式规则，需逐项分诊。** 估算文本溢出了其容器矩形；应用圆头内缩后，胶囊形元素过窄，无法容纳其标签；元素延伸到了 `viewBox` 之外。这些检查使用字符前进宽度估算，因此仅供参考：应在渲染后的 PNG 中确认，而不要仅凭警告就重新调整布局。经过目视检查后仍然存在的警告是真正的缺陷；不存在的则是噪声。

未发现错误时，退出状态为 `0`；出现任何错误时为 `1`（使用 `--strict` 时，出现任何警告也为 `1`）；用法错误或读取失败时为 `2`。

如果没有 Node，请改为逐项执行 `references/authoring.md` 中的手动检查清单，并将其报告为手动检查——绝不能报告为 lint 结果。

## 渲染并验证 PNG

```bash
node ${CLAUDE_SKILL_DIR}/scripts/render.mjs diagram.svg --out diagram.png            # 2x default
node ${CLAUDE_SKILL_DIR}/scripts/render.mjs diagram.svg --out diagram.png --scale 3
```

渲染器首先从 `CHROME_PATH` 解析 Chromium 系浏览器的可执行文件，然后查找该平台上众所周知的安装位置，最后从 `PATH` 中查找。它会报告**实际使用的确切可执行文件以及该浏览器的版本字符串**——交付物中始终要包含这两项，因为由不同浏览器构建版本渲染的图表属于不同的制品。

它将目标尺寸计算为 `round(viewBox_w * scale) x round(viewBox_h * scale)`，按该窗口尺寸截图，然后读取 PNG 自身的 `IHDR` 头，并将其中存储的尺寸与目标尺寸进行比较。尺寸不匹配属于失败，而不是舍入说明。

退出状态：`0` 表示验证成功，`1` 表示渲染或验证失败，`2` 表示未找到无头浏览器，`3` 表示用法错误。**退出状态 2 是降级信号**——仅交付 SVG，并说明这一限制。

## 随附参考资料

| 文件 | 内容 |
|------|----------|
| `references/archetypes.md` | 四种原型骨架及其画布预设、网格参数和各原型的包含规则 |
| `references/authoring.md` | 完整的几何与连接线公式集、图标集、调色板与字号层级，以及无 Node 环境下的手动检查清单 |
| `references/import-drawio.md` | 现有 draw.io 源文件的可选迁移路径：先解码容器（四种形态），然后从 IR 基于数值布局重新创作，并在同一次更改中完成单一归属替换 |
| `references/import-mermaid.md` | 现有 mermaid 源文件的可选迁移路径：从 IR 基于数值布局重新创作，并在同一次更改中完成单一归属替换 |
| `references/sketch.md` | 叠加在同一套计算布局之上的可选手绘预设 |

| 脚本 | 用途 |
|--------|---------|
| `scripts/check-svg.mjs` | 确定性的源文件 lint，提供错误、警告和 `file:line:column` 诊断信息 |
| `scripts/render.mjs` | 使用无头 Chromium 进行 2x PNG 渲染，并披露浏览器信息和验证 PNG 头 |
| `scripts/test-check-svg.mjs` | 通过 lint 运行每个固件，并断言各自精确的诊断代码集合；首次出现不匹配时以非零状态退出 |
| `scripts/fixtures/` | 42 个 SVG，从正反两方面固定 lint 行为——包括无障碍名称契约（`a11y-present.svg` 必须通过 lint，`a11y-missing.svg` 必须失败）和连接线几何检查；每个固件都会声明其必须产生的代码 |

每个脚本都仅依赖 Node 18 标准库运行。无需安装任何软件包，也不捆绑浏览器。

## 归属说明

六条连接线规则、复杂度预算、无障碍 SVG 约定、四个输出调节项、粗制滥造症状列表，以及带有反转规则的语义角色皮肤，均改编自 `cathrynlavery/diagram-design` v2.6.1（MIT）——采用重新表述而非复制，因为该 Skill 允许加载外部字体和使用 HTML 输出变体，而本 Skill 禁止这些做法。

## 与报告渲染器的关系

`moai-domain-html-report` 将 Markdown 报告渲染为一个自包含的 HTML 文件，并可在其中嵌入 Mermaid。该 Skill 负责报告；本 Skill 负责独立的图表图像。二者可以组合使用——报告可以链接或嵌入由本 Skill 生成的 PNG——但彼此不能替代。

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会先勾画 SVG，看到效果后再修正坐标” | 这就是渲染—修正循环。每次视觉修正都会使相邻元素失效，图表永远无法收敛。应先计算表格。 |
| “这个韩文标签只是略长一点，能放得下” | 放不下：CJK 字形是全角的，因此一行大约只能容纳拉丁文字数量的 60%。应在创作前重写标签。 |
| “我把图标向下微调了 3 个单位，现在看起来对了” | 针对单个实例的微调意味着中心点公式有误。根据框体几何推导，所有地方的微调都会随之消失。 |
| “这里没有浏览器，但 PNG 本来会是 2400x1600” | 未经渲染的尺寸只是猜测。交付 SVG，并说明没有生成 PNG。 |
| “代码检查只报告了警告，所以文件是干净的” | 警告具有启发式性质，不等于问题不存在。应对照渲染后的 PNG 逐项判定，再决定是否忽略。 |
| “这个流程图做成 SVG 会更好看” | 嵌入 Markdown、频繁变更的标准图表应继续使用 Mermaid。更好看并不是选择输出方式的理由。 |
| “我会保留 Mermaid 代码块，并为幻灯片添加 SVG” | 同一张图表存在两个来源，内容必然逐渐偏离。只能选择一个归属。 |
<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 在框体表格存在之前就编写了 SVG 元素。
- 文件中的某个坐标无法追溯到表格值或公式。
- 同一张图表同时以 Mermaid 代码块和 SVG 的形式存在。
- 字体栈在任何 CJK 字体族之前列出了拉丁字体族。
- 标签被截断，或者仅针对某一种语言缩小了字号。
- 报告了某个从未运行过的命令所对应的 PNG 尺寸、浏览器版本或代码检查结论。
- 为了完成渲染，将代码检查错误降级为警告。
- 某个 `<marker>` 没有显式的 `markerUnits`。

### 粗制滥造的症状——渲染图像中需要检查的十四项

这些是示意图看起来像自动生成作品的标志。每一项都应对照图像进行检查，而不是审美偏好问题。

| # | 输出中的症状 |
|---|---|
| 1 | 深色背景搭配青色或紫色的发光描边 |
| 2 | 使用等宽字体显示人类可读的名称（等宽字体应用于端口、路径和类型） |
| 3 | 每个节点都具有相同的宽度和填充，导致无法看出重要性差异 |
| 4 | 图例位于图表区域内部，并与节点重叠 |
| 5 | 连接线标签没有遮罩，线条从字形中穿过 |
| 6 | 连接线上使用垂直 `writing-mode` 文本 |
| 7 | 三张宽度完全相同的摘要卡片 |
| 8 | 任意元素使用 `filter` 或投影 |
| 9 | 卡片的 `rx` 大于 12，或标签块的 `rx` 大于 8 |
| 10 | 三个或更多节点使用 `accent`，导致没有视觉焦点 |
| 11 | 沿用 Mermaid 渲染中的间距和布线路径 |
| 12 | 违反 `authoring.md` 第 2.5 节六条连接线规则中的任意一条——在不共享任何坐标轴的框体之间使用对角线、遮罩接触其线条、遮罩被后面的节点裁剪、两条连接线共用一条路径、两条连接线共用一个连接点、未使用虚线的连接线从非端点框体后方穿过。六条规则中有三条由 `check-svg.mjs` 在明确规定的范围内进行机器检查：C2 对应 `SVG070`（间距小于 6 个单位）和 `SVG073`（间距大于 10 个单位），但仅检查与连接线距离不超过 16 个单位的遮罩，因此位置更远的标签——包括原型 A2 的分支标签——不会被检查；C6 对应 `SVG071`；C4 对应 `SVG072`，但仅检查**到达**点，因此出发侧的拥挤情况，以及既不带 `marker-end` 也不带 `marker-start` 的连接线，均不会被报告。C1、C3 和 C5 仍只能通过肉眼检查。`SVG074` 并非这些检查之一，而是其覆盖范围说明：每个文件只警告一次，指出某个 `transform`——包括传递性影响，因此一个包裹用的 `<g>` 会影响其内部的所有内容——导致 M 个候选项中的 N 个未进入几何检查，使其处于未验证状态。 |
| 13 | 使用渐变填充来代替层级设计决策 |
| 14 | 使用表情符号或象形符号作为图标，而不是使用图标集路径 |
<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 已查阅路由表，且选择 SVG 有无异议的理由。
- [ ] 此图表的 Mermaid 版本未与 SVG 同时保留。
- [ ] 已明确四项输出参数：格式、尺寸、细节、受众。
- [ ] 节点数量未超过 `detail` 上限；连接线不超过 12 条；启用 `accent` 的元素不超过 2 个。
- [ ] 创作前已完成框体表；每个坐标都可追溯至该表。
- [ ] 框体以及框体内子元素的所有包含关系检查均已通过。
- [ ] 中心点、基线和连接线端点均通过计算得出，而非手工微调。
- [ ] 字体栈以中日韩字体优先；每一行均符合计算得出的容量限制。
- [ ] 所有六条连接线规则均已满足（`references/authoring.md` 第 2.5 节）。
- [ ] 已具备无障碍契约：`role`、`aria-labelledby`、置于首位的 `<title>`、
      描述内容的 `<desc>`，以及按图表添加前缀的 ID。
- [ ] `check-svg.mjs` 报告零错误；每条警告均已分类处置并记录。
- [ ] `render.mjs` 已根据 2 倍目标验证 PNG 文件头。
- [ ] 已随 PNG 披露浏览器可执行文件及其版本。
- [ ] 任何跳过的步骤均已明确指出，且未声称使用了替代步骤。
<!-- moai:evolvable-end -->