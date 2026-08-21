---
name: moai-domain-html-report
description: >
  Markdown-to-single-file-HTML report renderer. Six modes (status, incident,
  plan, explainer, financial, pr) selected by report type, crossed with three
  audience tiers (expert, basic, learn) derived from the active output style.
  The basic and learn tiers enrich the HTML with mermaid flowcharts, worked
  examples, and plain-language primers; the expert tier stays dense. Zero
  external JS/CSS framework dependencies — inline SVG charts, a font-CDN
  exception for Korean readability, and a tier-gated mermaid-CDN exception.
  Self-contained output for email attachment, print, and offline viewing.

when_to_use: >
  Use when a markdown report must be rendered into a single self-contained
  HTML file; mode is selected by report type and audience tier is derived
  from the active output style.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
user-invocable: true
metadata:
  version: "1.1.0"
  category: "domain"
  status: "active"
---
# html-report — 单文件 HTML 报告渲染器

## 目的和范围

此技能是一个终端渲染器，可将 Markdown 报告转换为单个自包含 HTML 文件。它接受由文本、分析或报告工作流生成的任意 Markdown 正文，并输出一个 `.html` 文件；该文件可直接在浏览器中打开、作为电子邮件附件发送、清晰打印，并且支持离线使用。

**核心原则**：

- 不使用任何外部 JS 库（不使用 Chart.js、D3、htmx）
- 不使用任何外部 CSS 框架（不使用 Tailwind、Bootstrap）
- 所有图表均直接通过内联 SVG 渲染
- 为提升韩文可读性，允许使用字体 CDN `<link>`
- **仅在 `basic` 和 `learn` 受众层级中**允许使用 Mermaid CDN `<script>`，且必须始终配有无 JS 后备方案（参见 § 图表策略）。`expert` 层级仍严格保持零 JS。

**此技能不会取代 Markdown 输出。** Markdown 仍是唯一事实来源；HTML 渲染是在其基础上运行的附加分支。

### 非对称原则——HTML 内容丰富，Markdown 对应文件内容精简

此技能生成的两种产物面向**不同的读者，因此包含的内容量也不同**。它们并非使用两种语法表示的同一份文档：

| 产物 | 读者 | 内容规则 |
|----------|--------|--------------|
| `.html` | **人类** | **增强。** 可以包含比源 Markdown 更多的内容——通俗易懂的入门说明、Mermaid 图表、完整示例、类比、术语表提示框——具体丰富程度由受众层级决定（§ 受众层级）。 |
| `.md` 对应文件 | **智能体**（上下文） | **精简。** 仅包含支撑结论所必需的事实：调查结果、决策、数字、表格、行动项。绝不包含层级增强内容。 |

[硬性要求] **受众层级增强仅作用于 HTML，绝不作用于 Markdown 对应文件。** 将层级从 `expert` 提高到 `learn` 时，不得向 `.md` 对应文件中添加任何入门说明、类比或完整示例——这些增强内容是为了指导人类，而对于已经理解该领域的智能体而言，只会徒增令牌成本。对于相同的源内容，`learn` 层级报告和 `expert` 层级报告生成的 **Markdown 对应文件大小应基本相同**；只有它们的 HTML 不同。

---

## 输入

| 参数 | 是否必需 | 默认值 | 说明 |
|----------|----------|---------|-------------|
| `markdown` | 是 | — | 要转换的 Markdown 正文 |
| `mode` | 是 | — | `status` \| `incident` \| `plan` \| `explainer` \| `financial` \| `pr` |
| `audience` | 否 | 从当前输出样式派生 | `expert` \| `basic` \| `learn`——参见 § 受众层级 |
| `slug` | 否 | 根据标题自动派生 | 输出文件名前缀 |
| `output_path` | 否 | `<cwd>/reports/<slug>-<YYYYMMDD>.html` | 输出路径 |
| `font_stack` | 否 | 各模式的默认值 | 字体映射覆盖设置 |

`mode` 和 `audience` **相互正交**：`mode` 决定报告的*结构*（包含哪些章节），`audience` 决定报告的*深度*（每个章节包含多少解释）。每种模式都可以按任意层级渲染。

---

## 输出

在 `<cwd>/reports/<slug>-<YYYYMMDD>.{html,md}` 生成两个文件：

**`.html` 文件** — 面向人类的产物：

- 大小：`expert` 层级 ≤ 50KB；`basic` / `learn` 层级 ≤ 120KB（这是内容丰富化预算——图表和示例会占用字节）
- 外部依赖：一个字体 CDN `<link>` + 两个 `preconnect` 提示（韩文字体），此外仅在 `basic` / `learn` 层级使用一个 Mermaid CDN `<script>`
- 自包含：可直接在浏览器中打开、可作为电子邮件附件发送、打印效果整洁，并且离线时仍可阅读（图表会降级为其后备内容——参见 § 图表策略）

**`.md` 孪生文件** — 面向智能体的产物（见下文）。

### Markdown 孪生文件（智能体上下文产物）

在每个 `.html` 文件旁边，以相同路径写入一个扩展名为 `.md` 的 **Markdown 孪生文件**（`<slug>-<YYYYMMDD>.md`）。HTML 文件是供人类查看的产物；Markdown 孪生文件是供机器获取上下文的产物，并且根据 § 非对称原则，它被有意设计得**比 HTML 更精简**，而不只是简单移除标签后的相同内容。

**孪生文件包含的内容** — 仅保留起关键作用的事实：

- 调研结果、决策、数字和结论
- 表格（使用 Markdown 表格）以及数字所依赖的任何图表
- 行动项、负责人和待解决问题
- **仅当图表编码了正文中没有的信息时**，才包含图表的 Mermaid 源码（例如真实的状态机、真实的依赖关系图）。如果图表只是面向初学者再次以图形方式说明某个句子，则属于内容丰富化——应予以省略。

**孪生文件省略的内容** — 受众层级为人类读者添加的一切内容：

- 通俗易懂的入门说明和术语表
- 类比和用于激发兴趣的叙事
- 重新推导既述结果的分步骤演算示例
- 自测问题、提示框、装饰性图表
- 所有 HTML 标签、内联 CSS、`<script>` 块和 SVG 图表标记

**使用规则（令牌纪律）**：每当需要使用报告作为上下文时——无论是 `Agent()` 生成提示、后续分析轮次，还是跨会话读取过去的报告——都应使用 `.md` 孪生文件，绝不要使用 `.html` 文件。原始 HTML 会把令牌浪费在标签、样式块和 SVG 路径上，而这些内容并不承载 Markdown 中尚未包含的信息（对于相同内容，通常会消耗 3–5 倍令牌）；除此之外，层级对应的丰富化内容对于智能体而言纯属额外成本。

**没有孪生文件的旧版 HTML**：如果只有 `.html` 文件，请先将起关键作用的事实提取为 Markdown（移除标签、`<style>`、`<script>`、SVG 图表标记和层级丰富化内容；将 `<table>` 转换为 Markdown 表格），然后将提取结果——而非原始 HTML——注入智能体提示或上下文中。将提取结果作为对应的 `.md` 孪生文件写入 HTML 文件旁边，这样只需承担一次处理成本。

---

## 渲染完成后——向用户报告

写入 `.html` 文件及其 `.md` 孪生文件后，响应必须完成以下两件事：

1. **摘要** — 输出所渲染内容的简要摘要：模式、**受众层级**（以及该层级的推导来源——当前输出样式或显式 `audience` 参数）、报告标题，以及文件中包含的关键章节或图表（以一个简短段落或几个项目符号呈现）。不要在响应中粘贴完整 HTML。
2. **自动打开** — 立即通过 Bash 工具运行适用于当前平台的打开程序，在用户的默认浏览器中打开渲染后的文件。不要让用户自行输入 `! open`；请直接运行打开程序，以便在 macOS、Windows 和 Linux 上都能一步显示报告：

```bash
   case "$(uname -s)" in
     Darwin) open "<output_path>" ;;
     Linux)  xdg-open "<output_path>" >/dev/null 2>&1 || echo "Open manually: <output_path>" ;;
     MINGW*|MSYS*|CYGWIN*) start "" "<output_path>" ;;
     *) echo "Open manually: <output_path>" ;;
   esac
   ```

   macOS 使用 `open`，Linux 使用 `xdg-open`（当没有可用的打开程序或显示环境时——例如无头或 WSL 环境——回退为输出绝对路径），Windows Git-Bash/MSYS 使用 `start`。如果打开命令失败或权限被拒绝，则输出绝对路径，以便用户手动打开文件。

始终自动打开报告（如果无法打开，则输出其绝对路径）——一份用户无法找到或打开的已渲染报告毫无价值。

---

## 受众层级

报告会根据读者调整其**内容深度**。除非显式的 `audience` 参数覆盖，否则层级将根据当前输出风格推导得出。

### 确定层级

从设置链中读取 `outputStyle`——`.claude/settings.local.json`（最高优先级）→ `.claude/settings.json` → `~/.claude/settings.json` → 硬编码默认值——并按以下方式映射：

| 当前输出风格 | 受众层级 | 读者 |
|---------------------|---------------|--------|
| `MoAI` | `expert` | 熟悉该领域并希望快速获取关键信息的工程师 |
| `MoAI-Easy` | `basic` | 偶尔编写代码的人；专业术语对其理解仍会造成负担 |
| `MoAI-Learn` | `learn` | 希望真正理解概念，而不仅仅是知道结果的人 |
| （任何其他值／无法确定） | `expert` | 安全的默认值——绝不擅自丰富内容 |

显式的 `audience` 参数始终优先于推导出的值。

### 各层级的呈现方式

| 元素 | `expert` | `basic` | `learn` |
|---------|----------|---------|---------|
| 章节正文 | 信息密集、简洁 | 信息密集 + 每节开头增加一个通俗易懂的段落 | 与 basic 相同 + 阐明其重要性 |
| 专业术语 | 直接使用 | **首次使用时在行内定义**——`함수 (function)` 风格，在术语后附上通俗解释 | 与 basic 相同 + 术语表提示框 |
| 图表 | 仅使用行内 SVG 图表（与当前相同） | + **一个 mermaid 流程图**，展示报告的主要流程 | + **多个 mermaid 图表**——流程图、时序图和／或状态图——每个具有值得直观展示之结构的概念各配一个 |
| 示例 | 无（数字本身即可说明问题） | 每个关键论点提供**一个完整示例**，包含具体输入和输出 | 与 basic 相同 + 通过分步演示推导结果，而不是仅仅陈述结果 |
| 类比 | 无 | 谨慎使用，仅用于确实陌生的概念 | 自由使用——每个新概念都配一个日常生活类比 |
| 结尾 | 行动项 | 行动项 + “你可以自行检查的内容” | 行动项 + 读者可用来确认自己是否理解的自查问题 |
| HTML 大小预算 | ≤ 50KB | ≤ 120KB | ≤ 120KB |
| **`.md` 对应版本** | **精简** | **精简——规则完全相同** | **精简——规则完全相同** |

最后一行是一条不变原则，在此重申，因为它最容易被违反：**任何层级都不得向 Markdown 对应版本添加任何内容。**内容丰富化仅适用于 HTML。

### 编写增强内容（basic / learn）

- **先解释，再陈述。** 在 `basic` / `learn` 层级，如果一个章节开头直接抛出原始指标，就没有达到要求。先用一句话说明该指标*是什么*以及读者为什么应该关注它，然后再给出数字。
- **每个术语首次出现时都要定义。** 先给出日常语言释义，再在括号中注明规范英文术语：`배포 (deployment) — 만든 코드를 실제 사용자에게 내보내는 일`。首次定义后，直接使用该术语即可。
- 当内容涉及流程、顺序或状态机时，**优先使用图示，而不是段落**。这正是设置这些层级的目的。
- **让每个示例都基于实际内容。** 完整示例应使用报告中的真实输入，而不是 `foo` / `bar`。
- **绝不凑字数。** 增强意味着带来*更多理解*，而不是*更多文字*。如果初学者已经能够理解某个章节，就不需要再添加入门说明。

---

## 图示策略

图表和图示根据各自类型遵循两套不同的规则。

### 内联 SVG 图表（所有层级）

定量图表——柱状图、方差图、时间线——与目前一样，均手工编写为**内联 SVG**。它们可以在任何环境中使用：浏览器、电子邮件、打印件和离线环境。这一点没有变化，并适用于所有层级。

### Mermaid 图示（仅限 `basic` / `learn` 层级）

结构性图示——流程图、时序图、状态机——使用 **mermaid** 渲染，而 mermaid 需要 JavaScript。为了继续兑现单文件、支持离线使用的承诺，mermaid 以**混合形式**输出：CDN 在浏览器中提供丰富的渲染效果，而无 JS 的回退内容则确保它在其他所有环境中仍然可读。

同时输出以下三个部分：

1. **mermaid 源码**，放在 `<pre class="mermaid">` 块中——这是 CDN 渲染的内容；在未被渲染时，它仍会以纯文本形式保持人类可读。
2. **一个 mermaid-CDN `<script type="module">`**——每份文档仅放置一次，位于 `<body>` 末尾，并使用设计令牌调色板进行初始化，使图示与报告保持一致（`--ivory` 背景上的 `--clay` 强调色）。
3. **一个 `<noscript>` 回退内容**——可以是手工编写的同一图示的内联 SVG；如果图示足够简单，其源码本身就能清晰表达含义，也可以是对流程的简短文字说明。绝不能让 `<noscript>` 为空。

```html
<pre class="mermaid">
flowchart TD
  A[Markdown source] --> B{Audience tier}
  B -->|expert| C[Dense HTML]
  B -->|basic / learn| D[Enriched HTML + diagrams]
  C --> E[Lean .md twin]
  D --> E
</pre>

<noscript>
  <!-- inline SVG of the same flow, or a prose summary -->
  <p>Flow: the markdown source branches on audience tier — expert renders dense HTML,
     basic/learn render enriched HTML with diagrams. Both paths emit the same lean .md twin.</p>
</noscript>

<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({
    startOnLoad: true,
    theme: "base",
    themeVariables: {
      primaryColor:      "#FAF9F5",  /* --ivory  */
      primaryTextColor:  "#141413",  /* --slate  */
      primaryBorderColor:"#D97757",  /* --clay   */
      lineColor:         "#87867F",  /* --g500   */
      secondaryColor:    "#E3DACC",  /* --oat    */
      tertiaryColor:     "#F0EEE6"   /* --g100   */
    }
  });
</script>
```

### 降级矩阵（读者实际看到的内容）

| 场景 | `expert` | `basic` / `learn` |
|---------|----------|-------------------|
| 浏览器，在线 | SVG 图表 | SVG 图表 + **渲染后的 Mermaid 图示** |
| 浏览器，离线 | SVG 图表 | SVG 图表 + `<noscript>` 后备内容（SVG 或文字说明） |
| 电子邮件客户端（JS 被移除） | SVG 图表 | SVG 图表 + `<noscript>` 后备内容 |
| 打印 | SVG 图表 | SVG 图表 + 后备内容（Mermaid 无法可靠地渲染到打印输出中） |

`expert` 层级严格的零 JS 保证**不受影响**——Mermaid 例外受层级限制，绝不会在该层级触发。

### 图示选择

| 内容形态 | 图示 |
|---------------|---------|
| 包含分支或决策的流程 | `flowchart` |
| 参与者/系统之间的有序交互 | `sequenceDiagram` |
| 可处于多个状态之一的事物 | `stateDiagram-v2` |
| 跨类别或时间比较的数量 | **内联 SVG 图表**（不使用 Mermaid） |
| 没有结构的单行内容 | 文字说明（不要使用图示——克制这种冲动） |

---

## 六种模式

### 已实现的模式

| 模式 | 结构分区 |
|------|--------------------|
| **`status`** | 4 个指标卡片 · 亮点 · 已完成事项表格 · 速率 SVG 条形图 · 结转事项 |
| **`incident`** | TL;DR 深色横幅 · 时间线 · `<details>` 中的日志摘录 · 代码差异面板 · 影响表格 · 行动检查清单 |
| **`plan`** | 摘要 KPI 条带 · 垂直里程碑时间线 · 数据流 SVG · 切片表格 · 风险网格 · 成功指标 |
| **`explainer`** | 侧边导航 · 可折叠的 `<details>` 步骤 · 选项卡式代码块（原生 JS） · FAQ 手风琴组件 · 提示框 |
| **`financial`** | 4 个 KPI 卡片 · 利润表（项目 / 本期 / 上期 / 变动额 / 变动百分比）· 差异 SVG 水平条形图 · 注释面板 |
| **`pr`** | TL;DR · PR 元信息行（文件 / +− / 分支）· 变更前/后双栏卡片 · 文件导览 `<details>` · 关键点 · 测试检查清单 · 发布步骤 |

#### 各模式的输入字段

每个模板填充的主要字段（模板内部变量名）：

| 模式 | 关键输入字段 |
|------|------------------|
| `status` | `{{title}}`, `{{#metrics}}`, `{{#highlights}}`, `{{#completed_rows}}`, `{{#chart_bars}}` |
| `incident` | `{{inc_id}}`, `{{severity}}`, `{{title}}`, `{{#tl_entries}}`, `{{#impact_rows}}`, `{{#actions}}` |
| `plan` | `{{title}}`, `{{#kpis}}`, `{{#milestones}}`, `{{diagram_svg}}`, `{{#slices}}`, `{{#risks}}`, `{{#metrics}}` |
| `explainer` | `{{title}}`, `{{lead}}`, `{{#steps}}`, `{{#config_tabs}}`, `{{#faq_items}}` |
| `financial` | `{{title}}`, `{{period}}`, `{{#kpis}}`, `{{#statement_rows}}`, `{{chart_height}}`, `{{#variance_bars}}` |
| `pr` | `{{pr_ref}}`, `{{title}}`, `{{author}}`, `{{branch}}`, `{{files_changed}}`, `{{additions}}`, `{{deletions}}`, `{{#focus_items}}`, `{{#test_items}}`, `{{#rollout_steps}}` |

---

## 韩文字体策略

此 Skill 允许使用单个字体 CDN `<link>` 作为唯一的外部依赖，以提高韩文的可读性。

仅使用系统字体进行渲染会导致不同操作系统之间的一致性受到破坏（macOS：Apple SD Gothic Neo，Windows：Malgun Gothic），因此需要使用字体 CDN 来确保韩文字体排版效果可预测。

### 各模式字体映射

| 模式 | sans（正文） | serif（标题） | mono（代码） |
|------|-------------|-----------------|-------------|
| `status` / `financial` / `pr` | Pretendard | Pretendard 700 | JetBrains Mono |
| `incident` | Pretendard | Pretendard 700 | JetBrains Mono |
| `plan` | Pretendard | Noto Serif KR | JetBrains Mono |
| `explainer` | Noto Sans KR | Noto Serif KR | JetBrains Mono |
| `editorial` | Pretendard | Chosunilbo Myungjo | JetBrains Mono |
| `legal` | KoPubWorld Batang | KoPubWorld Batang Bold | JetBrains Mono |

CDN URL 和 `preconnect` 模式位于 [`references/fonts.md`](references/fonts.md) 中。

---

## 设计令牌（CSS 变量约定）

每种模式都在 `:root` 中声明相同的 8 个 CSS 变量。

```css
:root {
  /* palette */
  --ivory: #FAF9F5;   /* background warm off-white */
  --paper: #FFFFFF;   /* card / panel background */
  --slate: #141413;   /* body text warm black */
  --clay:  #D97757;   /* accent / link terracotta */
  --clay-d:#B85C3E;   /* clay hover state */
  --oat:   #E3DACC;   /* secondary background / divider light tan */
  --olive: #788C5D;   /* secondary accent sage green */

  /* fonts */
  --sans:  "Pretendard", system-ui, -apple-system, sans-serif;
  --serif: "Pretendard", ui-serif, Georgia, serif;
  --mono:  "JetBrains Mono", ui-monospace, "SF Mono", monospace;

  /* layout */
  --max-width:    860px;
  --radius-panel: 12px;
  --radius-row:   8px;
  --border:       1.5px solid var(--g300);
}
```

灰度色：`--g100: #F0EEE6`、`--g300: #D1CFC5`、`--g500: #87867F`、`--g700: #3D3D3A`

完整的对比度验证和打印令牌：[`references/design-tokens.md`](references/design-tokens.md)

---

## 推荐的链式模式

此渲染器位于文本生成流水线的末端。Markdown 源内容可来自任意上游文本、分析或报告技能。

```
[text skill] → (optional review / humanize step) → html-report (mode selection)
```

最小链路（快速渲染）：

```
[text skill] → html-report (mode selection)
```

---

## 使用示例

**示例 1：每周状态报告**
```
Render the executive summary result as an HTML report for Hanul Engineering week 11.
```

**示例 2：财务报表**
```
Convert the financial-statement result into an HTML report.
```

**示例 3：事件报告**
```
Summarize the payment-gateway 502 outage as an HTML incident report. Severity is SEV-2.
```

**示例 4：PR 描述文档**
```
Turn the realtime notification channel integration pull request into an HTML review document.
```

**示例 5：根据当前输出风格派生层级**
```
Render the caching-layer design as an HTML report.
```
启用 `MoAI-Easy` 时，此请求会解析为 `basic` 层级：每个章节都以通俗易懂的引导文字开篇，使用 Mermaid 流程图展示缓存读写路径，并为每项关键论断提供一个完整示例。启用 `MoAI` 时，同一请求会解析为 `expert`，并以高密度形式渲染。无论哪种情况，对应的 `.md` 文件都是相同的精简产物。

**示例 6：显式层级覆盖**
```
Render the incident report as HTML for the expert audience — the on-call engineers already know the system.
```
显式指定的 `audience: expert` 优先于推导出的层级，因此即使在 `MoAI-Learn` 下，也不会添加入门说明或图表。

---

## 非目标

- 不取代默认的 Markdown 输出——HTML 是一个额外的渲染分支。
- 不引入 React、Vue、Tailwind CDN、Chart.js 或 D3 等外部库。唯一获准使用的外部依赖是字体 CDN（适用于所有层级）和 mermaid CDN（适用于 `basic` / `learn` 层级，并始终提供 `<noscript>` 回退方案——§ 图示策略）。所有层级的图表均使用内联 SVG；mermaid 绝不会取代图表。
- 不引入构建步骤（webpack、vite、esbuild）。
- 不将面向人类读者的产物拆分到多个文件中——报告是单个 `.html` 文件。配套的 `.md` 是*面向不同读者的不同产物*，而不是报告的另一半。
- 不扩充配套 Markdown 的内容。面向受众层级的内容深度仅适用于 HTML（§ 非对称原则）。
- 外部设计系统主题化（基于 Tailwind CDN 应用品牌令牌）不在此处所含模板的范围内，这些模板严格遵循零依赖原则。这些模板不会采用 `design_system` 参数。

---

## 参考资料

### 设计文档
- [`references/design-tokens.md`](references/design-tokens.md) — CSS 变量约定、调色板、无障碍设计
- [`references/fonts.md`](references/fonts.md) — 字体映射、CDN URL、预连接模式

### 模板
- [`references/templates/status.html.mustache`](references/templates/status.html.mustache) — 状态模式
- [`references/templates/incident.html.mustache`](references/templates/incident.html.mustache) — 事件模式
- [`references/templates/plan.html.mustache`](references/templates/plan.html.mustache) — 计划模式
- [`references/templates/explainer.html.mustache`](references/templates/explainer.html.mustache) — 讲解模式
- [`references/templates/financial.html.mustache`](references/templates/financial.html.mustache) — 财务模式
- [`references/templates/pr.html.mustache`](references/templates/pr.html.mustache) — pr 模式

设计参考：[Thariq Shihipar, “HTML 的非凡效力”](https://thariqs.github.io/html-effectiveness/)——单文件、零依赖 HTML 方法的起源。