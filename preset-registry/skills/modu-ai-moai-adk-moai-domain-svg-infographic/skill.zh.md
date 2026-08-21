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

制作一个可手动编辑的 SVG 图表，其几何布局通过算术计算而非目测确定，并提供一份 2x PNG 光栅图。输出是一张静态图像：无动画、无脚本，查看时不依赖外部资源。

## 步骤 0 — 判断这是否适合使用 SVG

此技能是对 Mermaid 流程的**补充，而绝不是替代**。这里的任何内容都不会迁移、重写或弃用现有的 Mermaid 图表，并且任何图表都不应同时以两种形式存在——这会造成双重维护，而这正是本节要避免的唯一一种失败。

在绘制任何内容之前，先确定请求的处理路径：

| 判断信号 | 处理路径 |
|--------|----------|
| 图表位于 Markdown 文档中 | Mermaid |
| 图表经常随周围的正文一起更改 | Mermaid |
| 图表属于标准类型：流程图、时序图、ER 图、状态图、类图、甘特图 | Mermaid |
| 图表的文本标签需要在不同语言区域之间保持同步 | Mermaid |
| 交付物是用于幻灯片、电子邮件、社交媒体或离线阅读的图像文件 | 此技能 |
| 图表是不具有标准形状的自由形式架构或概念信息图 | 此技能 |
| 需要对位置、间距或层叠关系进行像素级控制 | 此技能 |
| 韩文或其他 CJK 标签必须按经过精确验证的宽度换行 | 此技能 |

当多个信号同时指向两种处理路径时，优先选择 Mermaid：维护 Mermaid 代码块的正确性比维护图像成本更低。仅当路由表给出明确且无冲突的理由时，才选择此技能。

**一张图表，一个归属。** 如果已经存在 Mermaid 版本，要么直接替换它（并在同一次变更中删除 Mermaid 代码块），要么保持原样。绝不要同时交付两种版本。

## 运行时前置条件与降级处理

Node 18 或更高版本以及 Chromium 系列无头浏览器**仅在执行检查和渲染时需要**。安装或发现此技能以及编写可编辑 SVG 时均不需要它们——编写功能始终可用。

| Node 18+ | Headless Chromium | 交付内容 |
|----------|-------------------|-------------------|
| 已安装 | 已安装 | 可编辑 SVG、机器检查报告、2x PNG；披露所用浏览器可执行文件及版本，并验证 PNG 文件头中的尺寸 |
| 已安装 | 未安装 | 可编辑 SVG 及机器检查报告。明确说明未找到无头浏览器，因此未生成 PNG |
| 未安装 | 任意 | 可编辑 SVG 及 `references/authoring.md` 中手动检查清单的检查结果。**不要**附加机器检查标签，也不要声称执行了渲染 |

绝不要为未实际运行的工具捏造 PNG、像素尺寸或检查结论。说明跳过了哪个步骤以及原因。

## 工作流程

共六个步骤，按顺序执行。在编写任何一个 SVG 元素之前，必须先完成步骤 1 至步骤 3；这种顺序正是整个方法的核心。

1. **明确框架。** 写下图表必须传达的信息、目标媒介（幻灯片、README 头图、电子邮件、印刷品）、画布尺寸和标签语言。
2. **选择原型。** 架构堆栈、从左到右的流程、并列比较或层级树。骨架位于 `references/archetypes.md`。
3. **执行数值布局过程。** 生成方框表，并通过下文的每项包含关系和文本空间预算检查。只要有一行检查失败，就不要继续。
4. **根据表格编写 SVG。** 每个坐标都必须是表格中的值，或基于表格值计算得出的公式结果。
5. **使用 `scripts/check-svg.mjs` 检查源文件。** 消除每一项错误，并分类处理每一项警告。
6. **使用 `scripts/render.mjs` 进行渲染和验证。** 确认报告中的 PNG 尺寸与请求的 2x 目标一致，然后目视检查 PNG。

## 数值布局阶段

在创作之前先建立一张表。每个框只包含五个手动维护的列——`id`、`x`、`y`、
`w`、`h`——除此之外，不手动输入任何内容。文件中的其他所有数值都由这些列
推导得出。

**网格。** 对于画布宽度 `W`、列数 `n`、外边距 `M`、列间距 `G`：

```
colW    = (W - 2*M - (n-1)*G) / n
colX(i) = M + i * (colW + G)
```

如果 `colW` 小于原型的最小卡片宽度，请减少 `n` 或增大
`W`。不要通过缩小边距来勉强维持列数。

**包含关系。** 检查每一行，只要有任意一项不满足就停止：

```
M <= x            and  x + w <= W - M
M <= y            and  y + h <= H - M
parent.x + pad <= child.x   and  child.x + child.w <= parent.x + parent.w - pad
```

**派生几何。** 中心点和锚点始终从框体推导，绝不能来自针对特定语言的微调：

```
cx            = x + w/2
cy            = y + h/2
iconCenter    = (x + pad + iconR, y + h/2)
titleBaseline = y + pad + titleSize
lineBaseline(k) = titleBaseline + titleGap + k*lineHeight
```

如果你发现自己要把图标向下移动三个单位，“因为韩文看起来偏低”，那就是公式有误。
应修正公式，而不是调整单个实例。针对特定语言手动微调偏移量，恰恰就是这种方法要消除的
渲染修正循环。

**连接线。** 端点同样由公式推导；从终点减去箭头长度，使标记尖端落在边框上，
而不是框体内部：

```
horizontal A->B: (A.x + A.w, A.cy) -> (B.x - markerLen, B.cy)
vertical   A->B: (A.cx, A.y + A.h) -> (B.cx, B.y - markerLen)
elbow      A->B: midX = (A.x + A.w + B.x) / 2
                 path: M A.x+A.w A.cy  H midX  V B.cy  H B.x-markerLen
```

完整公式集（包括径向扇出和多通道扇出）位于
`references/authoring.md`。

## 文本预算——CJK 优先

在根元素上设置 CJK 优先的字体栈，使谚文、假名和汉字字形优先解析，
然后才考虑任何拉丁字体回退。拉丁字体优先的字体栈会让 CJK 字形回退到
任意系统字体，并悄然改变每个测量宽度：

```
font-family="Pretendard, 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC',
             'Apple SD Gothic Neo', 'Hiragino Sans', 'Microsoft YaHei',
             system-ui, sans-serif"
```

对于可用宽度 `u = w - 2*pad`、字号 `s`，每行容量为：

```
Latin: capacity = u / (0.60 * s)     average Latin advance is about 0.60em
CJK:   capacity = u / (1.00 * s)     full-width advance is 1.00em
```

两者之间的比例就是实际工作准则：**在同一个框体、相同字号下，一行韩文、日文或中文
所能容纳的字符数大约是拉丁文字行的 60%**。应根据这个数值规划文案，并**在创作前修改措辞
以确保适配**。混合多种文字系统的行，应按 CJK 比率计算整行预算。

这里禁止采用两种做法，因为它们都只是在掩盖问题，而不是解决问题：
事后截断标签，以及只为某一种语言缩小字号。应重写标签。

## 检查源文件

```bash
node ${CLAUDE_SKILL_DIR}/scripts/check-svg.mjs diagram.svg          # human-readable diagnostics
node ${CLAUDE_SKILL_DIR}/scripts/check-svg.mjs diagram.svg --json   # machine-readable
node ${CLAUDE_SKILL_DIR}/scripts/check-svg.mjs diagram.svg --strict # warnings also fail
```

每条诊断信息都包含 `file:line:column`、稳定的代码和消息。这两个级别不可互换：

**错误——确定性问题，始终需要修复。** 标签不平衡；缺失或格式错误的 `viewBox`；`width`/`height` 组合的宽高比与 `viewBox` 冲突；重复的 `id`；本地引用（`url(#id)`、`href="#id"`）没有匹配的 `id`；`<marker>` 缺少必需的几何属性；`<marker>` 依赖隐式的 `markerUnits` 默认值，这会使箭头随描边宽度缩放，通常会导致箭头在一张图中看起来正确、在下一张图中却出现问题。

**警告——启发式问题，需逐项判断。** 估算出的文本溢出其容器矩形；应用圆头内缩后，胶囊形状对于其标签而言过窄；元素延伸到 `viewBox` 之外。这些检查使用字符前进宽度估算，因此仅供参考：应在渲染后的 PNG 中确认，而不要仅凭警告就重新调整布局。经目视检查后仍然存在的警告是真实缺陷；否则就是噪声。

未发现错误时，退出状态为 `0`；出现任何错误时为 `1`（使用 `--strict` 时，出现任何警告也为 `1`）；发生用法错误或读取失败时为 `2`。

如果没有 Node，请改为执行 `references/authoring.md` 中的手动检查清单，并将其报告为手动检查——绝不能报告为 lint 结果。

## 渲染并验证 PNG

```bash
node ${CLAUDE_SKILL_DIR}/scripts/render.mjs diagram.svg --out diagram.png            # 2x default
node ${CLAUDE_SKILL_DIR}/scripts/render.mjs diagram.svg --out diagram.png --scale 3
```

渲染器首先从 `CHROME_PATH` 中查找 Chromium 系浏览器的可执行文件，然后检查当前平台上常见的安装位置，最后从 `PATH` 中查找。它会报告**实际使用的可执行文件及该浏览器的版本字符串**——交付物中必须始终包含这两项信息，因为由不同浏览器版本渲染的图表属于不同的产物。

它将目标尺寸计算为 `round(viewBox_w * scale) x round(viewBox_h * scale)`，以该窗口尺寸截取屏幕截图，然后读取 PNG 自身的 `IHDR` 标头，并将其中存储的尺寸与目标尺寸进行比较。尺寸不匹配属于失败，而不是舍入说明。

退出状态：`0` 表示已验证，`1` 表示渲染或验证失败，`2` 表示未找到无头浏览器，`3` 表示用法错误。**退出状态 2 是降级信号**——仅交付 SVG，并说明这一限制。

## 随附参考资料

| 文件 | 内容 |
|------|----------|
| `references/archetypes.md` | 四种原型骨架及其画布预设、网格参数和各原型的包含规则 |
| `references/authoring.md` | 完整的几何和连接线公式集、图标集、调色板与字体比例，以及无 Node 环境下的手动检查清单 |
| `references/sketch.md` | 叠加在同一套计算布局之上的可选手绘预设 |

| 脚本 | 用途 |
|--------|---------|
| `scripts/check-svg.mjs` | 确定性的源文件 lint、错误和警告，以及 `file:line:column` 诊断信息 |
| `scripts/render.mjs` | 使用无头 Chromium 以 2 倍比例渲染 PNG，同时披露浏览器信息并验证 PNG 标头 |

这两个脚本仅依赖 Node 18 标准库运行。无需安装任何软件包，也不捆绑浏览器。

## 与报告渲染器的关系

`moai-domain-html-report` 将 Markdown 报告渲染为单个自包含 HTML 文件，并可在其中嵌入 Mermaid。该 Skill 负责报告；本 Skill 负责独立的图表图像。它们可以组合使用——报告可以链接或嵌入本 Skill 生成的 PNG——二者互不替代。

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “我会先勾勒 SVG，看到效果后再修正坐标” | 这就是“渲染-修正”循环。每次视觉调整都会使相邻元素失效，图表永远无法收敛。应先计算表格。 |
| “这个韩文标签只是稍微长了一点，放得下” | 放不下：CJK 字形为全角，因此一行能容纳的字符数约为拉丁字符的 60%。请在制作前改写标签。 |
| “我把图标向下微调了 3 个单位，现在看起来正确了” | 针对单个实例的微调意味着中心点公式有误。根据方框几何关系推导，微调就会在所有位置消失。 |
| “这里没有浏览器，但 PNG 本来会是 2400x1600” | 未实际渲染的尺寸只是猜测。请交付 SVG，并说明未生成 PNG。 |
| “Lint 只报告了警告，所以文件是干净的” | 警告是启发式结果，并非不存在问题。在忽略每条警告之前，应对照渲染后的 PNG 逐一甄别。 |
| “这个流程图做成 SVG 会更好看” | 嵌入 Markdown、频繁变更的标准图表应继续使用 Mermaid。更好看并不是选择路由的理由。 |
| “我会保留 Mermaid 代码块，并添加用于幻灯片的 SVG” | 同一个图表存在两个源版本会逐渐产生偏差。请选择一个唯一归属。 |
<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 在方框表格存在之前就编写了 SVG 元素。
- 文件中的某个坐标无法追溯到表格值或公式。
- 同一个图表同时存在 Mermaid 代码块和 SVG 版本。
- 字体栈在任何 CJK 字体族之前列出了拉丁字体族。
- 标签被截断，或仅针对某一种语言缩小了字号。
- 为从未运行过的命令报告了 PNG 尺寸、浏览器版本或 Lint 结论。
- 为了完成渲染，将 Lint 错误降级为警告。
- 某个 `<marker>` 没有显式的 `markerUnits`。
<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 已查阅路由表，并且选择 SVG 的理由不存在相反意见。
- [ ] 此图表的 Mermaid 版本未与 SVG 并存。
- [ ] 制作前已完成方框表格；每个坐标都可追溯到该表格。
- [ ] 方框以及方框内部子元素的所有包含关系检查均通过。
- [ ] 中心点、基线和连接线端点均通过推导得出，而非手动微调。
- [ ] 字体栈以 CJK 字体优先；每一行都符合其计算出的容量。
- [ ] `check-svg.mjs` 报告零错误；每条警告均已甄别并记录。
- [ ] `render.mjs` 已根据 2x 目标验证 PNG 文件头。
- [ ] 随 PNG 披露浏览器可执行文件及其版本。
- [ ] 明确指出所有跳过的步骤，且未声称使用了替代方案。
<!-- moai:evolvable-end -->