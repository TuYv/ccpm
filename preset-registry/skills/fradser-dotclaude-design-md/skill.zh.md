---
name: design-md
description: Author, consume, and enforce a DESIGN.md design system spec (Google Labs open format, package @google/design.md). This skill should be used when the project has a DESIGN.md at the root or under docs/, when the user mentions "design tokens", "design system spec", "DESIGN.md", "tokens.json", needs to translate a design system into Tailwind theme config, export tokens to DTCG, lint token consistency, diff design system revisions, or check WCAG contrast on component color pairs. Acts as the upstream source of truth for the impeccable sub-commands (colorize/typeset/audit/critique), web-design-guidelines, and shadcn.
user-invocable: true
allowed-tools: ["Bash(npx @google/design.md*)", "Bash(npx @google/design.md@latest *)", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch"]
---
# DESIGN.md — 设计系统的唯一事实来源

DESIGN.md 是一种开放格式（仓库：`google-labs-code/design.md`，软件包：`@google/design.md`），用于向编码智能体描述视觉标识。它将**机器可读的设计令牌**（YAML 前置元数据）与**人类可读的设计依据**（Markdown 正文）结合起来。令牌具有规范性；正文则提供应用上下文。

加载此技能后，设计系统将不再是智能体需要猜测的内容，而是智能体可以*读取*的内容。前端插件中的所有同级设计技能都应在 DESIGN.md 存在时以其为准。

## 强制准备工作

该规范处于 `alpha` 阶段，仍在积极开发中。在进行任何非简单的编写工作之前，请获取权威规范和 lint 规则：

```bash
npx @google/design.md@latest spec --rules
```

将该输出视为权威标准。对于高风险更改，不要凭记忆复述 schema——请重新验证。

## 检测与模式

执行操作之前，请确定当前处于以下三种模式中的哪一种。

1. **使用模式** — 项目根目录或 `docs/DESIGN.md` 中存在 `DESIGN.md`。请先阅读它，理解 `## Overview` 和 `## Do's and Don'ts`，并确保后续的每条建议都以其中的令牌为依据。
2. **编写模式** — 用户要求“创建设计系统”“编写设计令牌”“生成样式指南”，或者希望在初始化 shadcn 的同时创建一个初始设计系统。
3. **提议模式** — 文件不存在，用户也未明确提出要求，但正在从头选择颜色或排版。使用 `AskUserQuestion` 询问是否要先采用 DESIGN.md，再决定是否分散使用临时十六进制值。

使用 `ls DESIGN.md docs/DESIGN.md 2>/dev/null` 或 `Glob("{DESIGN.md,docs/DESIGN.md,design/DESIGN.md}")` 进行检测。不要想当然。

## 规范要点

章节顺序是固定的。章节可以省略，但已存在的章节必须遵循以下顺序（`section-order` lint 规则会发出警告）：

| # | 章节                 | 别名               |
|:--|:---------------------|:-------------------|
| 1 | 概述                 | 品牌与风格         |
| 2 | 颜色                 | —                  |
| 3 | 排版                 | —                  |
| 4 | 布局                 | 布局与间距         |
| 5 | 层级与深度           | 层级               |
| 6 | 形状                 | —                  |
| 7 | 组件                 | —                  |
| 8 | 应做与不应做         | —                  |

YAML 前置元数据 schema（简略版——对于边界情况，请对照 `spec --rules` 进行验证）：

```yaml
---
version: alpha
name: <string>
description: <string>                   # optional
colors:
  <token-name>: "#RRGGBB"               # any CSS color (hex/named/rgb/hsl/oklch/color-mix); hex recommended, converted to sRGB for WCAG checks
typography:
  <token-name>:
    fontFamily: <string>
    fontSize: <Dimension>               # px | em | rem
    fontWeight: <number>                # 100..900
    lineHeight: <Dimension | number>    # unitless = multiplier of fontSize (preferred)
    letterSpacing: <Dimension>
    fontFeature: <string>               # optional, maps to font-feature-settings
    fontVariation: <string>             # optional, maps to font-variation-settings
rounded:
  <scale>: <Dimension>                  # sm, md, lg, xl, full, ...
spacing:
  <scale>: <Dimension | number>
components:
  <component>:
    backgroundColor: "{colors.primary}"  # references via {path.to.token}
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"  # components may reference composite typography
    rounded: "{rounded.md}"
    padding: <Dimension>
    size|height|width: <Dimension>
---
```

有效的组件属性：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、`width`。变体表示为同级键（`button-primary`、`button-primary-hover`、`button-primary-active`）。

推荐的（非规范性）令牌名称：

- **颜色：** `primary`、`secondary`、`tertiary`、`neutral`、`surface`、`on-surface`、`error`
- **排版：** `headline-display`、`headline-lg`、`headline-md`、`body-lg`、`body-md`、`body-sm`、`label-lg`、`label-md`、`label-sm`
- **圆角：** `none`、`sm`、`md`、`lg`、`xl`、`full`

## CLI 工作流

所有命令都接受文件路径或用 `-` 表示标准输入。默认输出为 JSON，发生错误/回归时退出代码为 `1`。

### `lint` — 验证结构和令牌解析

```bash
npx @google/design.md@latest lint DESIGN.md
```

检查工具会运行八条规则：

| 规则                  | 严重程度 | 含义                                                   |
|:----------------------|:---------|:----------------------------------------------------------|
| `broken-ref`          | error    | `{path.to.token}` 无法解析                        |
| `missing-primary`     | warning  | 已定义颜色但没有 `primary` — 智能体将自动合成  |
| `contrast-ratio`      | warning  | 组件背景色/文本颜色对低于 WCAG AA 4.5:1                |
| `orphaned-tokens`     | warning  | 已定义颜色令牌，但从未被任何组件引用    |
| `missing-typography`  | warning  | 存在颜色但没有排版定义 — 智能体将回退到默认值 |
| `section-order`       | warning  | 章节未按规范顺序排列                           |
| `token-summary`       | info     | 各章节的令牌数量                                  |
| `missing-sections`    | info     | 存在其他令牌时缺少可选章节          |

首先修复 `error` 行。向用户明确提示 `contrast-ratio` 警告——如果项目承诺符合 WCAG AA+，则将其提升为发布阻断项。

### `diff` — 检测两个修订版本之间的回归

```bash
npx @google/design.md@latest diff DESIGN.md DESIGN.next.md
```

当候选版本的错误或警告比基线版本更多时，以 `1` 退出。在提交任何令牌模式变更之前使用。

### `export` — 输出可使用的令牌结构

```bash
npx @google/design.md@latest export --format tailwind DESIGN.md   # v3 theme.extend JSON
npx @google/design.md@latest export --format dtcg DESIGN.md       # W3C DTCG tokens.json
```

### `spec` — 将规范注入智能体提示词

```bash
npx @google/design.md@latest spec                     # full markdown spec
npx @google/design.md@latest spec --rules             # + lint rules table
npx @google/design.md@latest spec --rules-only        # only the rules table
npx @google/design.md@latest spec --format json       # programmatic
```

### 编程式 API（用于编写脚本时）

```ts
import { lint } from '@google/design.md/linter';

const report = lint(markdownString);
report.findings;      // Finding[]
report.summary;       // { errors, warnings, info }
report.designSystem;  // parsed DesignSystemState
```

## Tailwind v4 适配（关键）

`export --format tailwind` 输出的是 **Tailwind v3** 结构（包含 `colors`、`fontFamily`、`fontSize`、`borderRadius`、`spacing` 的 JS `theme.extend` 对象）。前端插件面向的是采用 CSS 优先 `@theme { ... }` 的 **Tailwind v4**。不要将原始 JSON 直接放入 `tailwind.config.*`。

输出到 `app/globals.css`（或任何包含 `@theme` 的位置）时，请应用以下转换：

| DESIGN.md 令牌                       | Tailwind v4 CSS 变量                  |
|:-------------------------------------|:--------------------------------------|
| `colors.<name>`                      | `--color-<name>`                      |
| `typography.<name>.fontFamily`       | `--font-<name>`                       |
| `typography.<name>.fontSize`         | `--text-<name>`                       |
| `typography.<name>.lineHeight`       | `--text-<name>--line-height`          |
| `typography.<name>.letterSpacing`    | `--text-<name>--letter-spacing`       |
| `typography.<name>.fontWeight`       | `--font-weight-<name>`                |
| `rounded.<scale>`                    | `--radius-<scale>`                    |
| `spacing.<scale>`                    | `--spacing-<scale>`                   |

示例：

```css
@theme {
  --color-primary: #1a1c1e;
  --color-neutral: #f7f5f2;
  --font-h1: "Public Sans", sans-serif;
  --text-h1: 3rem;
  --text-h1--line-height: 1.1;
  --text-h1--letter-spacing: -0.02em;
  --radius-sm: 4px;
  --spacing-md: 16px;
}
```

对于 v3 项目，直接将 JSON 复制到 `theme.extend` 中即可，无须继续处理。

## 同级 Skill 集成

当 DESIGN.md 存在时，**它是唯一事实来源**。覆盖其他 Skill 中基于启发式规则的默认值：

- **`frontend:impeccable`** —— 将 `## Overview` 和 `## Do's and Don'ts` 的正文注入上下文收集协议。绝不要建议与已定义令牌冲突的调色板。
- **`frontend:impeccable`（参数：`colorize`）** —— 将新的强调色限制在 `colors.*` 映射中。如果确实缺少某种色相，应建议将其（连同令牌名称）添加到 DESIGN.md，而不是内联原始十六进制值。
- **`frontend:impeccable`（参数：`typeset`）** —— 直接从 `typography.*` 令牌中获取。先呈现 `missing-typography` 检查结果，再建议从头选择字体。
- **`frontend:impeccable`（参数：`audit`）** —— 将 `lint --format json` 作为审计的一部分运行。在报告中包含每一项 `error`；对于承诺符合 AA 标准的项目，将 `contrast-ratio` 警告视为阻塞项。
- **`frontend:impeccable`（参数：`critique`）** —— 标记可用性问题时，引用 `## Do's and Don'ts`。
- **`frontend:web-design-guidelines`** —— 将 `contrast-ratio` 检查结果与指南规则交叉核对。
- **`frontend:shadcn`** —— 将 DESIGN.md 中的 `components.button-primary.*` 映射到 shadcn 的 CSS 变量约定（`--primary`、`--primary-foreground`、`--radius`）。DESIGN.md 导出的语义变量可满足 shadcn 的“不要使用原始 `bg-blue-500`”规则。

## 编写流程

1. 使用 `AskUserQuestion` 收集：品牌个性（2–3 个形容词）、主要品牌颜色、字体偏好（衬线 / 无衬线 / 几何）、目标密度（宽松 / 紧凑）。
2. 起草 YAML 前置元数据，至少包含 `primary` 和 `neutral` 颜色。缺少 `neutral` 时，大多数章节都会出问题。
3. 首先编写 `## Overview`——它为后续的每项令牌决策奠定基础。
4. 填写 `## Colors` 和 `## Typography`。仅在基础令牌稳定后扩展 `## Components`。
5. 运行 `lint`。在编写任何实现代码之前修复 `error` 行。
6. 运行 `export --format tailwind`，应用上述 v4 转换，并提交到项目的全局样式表。
7. 如果项目还需要向 Figma 变量或单独的令牌流水线提供数据，请运行 `export --format dtcg`。

## 使用流程

1. 完整阅读 `DESIGN.md`。深入理解 `## Overview` 和 `## Do's and Don'ts`。
2. 在会话开始时运行一次 `lint --format json`。在继续之前，将所有 `error` 告知用户。
3. 在文字建议中按名称引用令牌（“为 CTA 使用 `colors.tertiary`”）。让实现代码生成匹配的 Tailwind v4 变量（例如 `bg-[var(--color-tertiary)]` 或项目映射的工具类）。
4. 切勿引入无法用现有令牌表示的原始十六进制值或 rem 值。如果需要新令牌，建议将其添加到 DESIGN.md，然后重新运行 `lint`。

## 注意事项

- 规范版本为 `alpha`。如果距离上次使用已超过一周，请重新查看 `spec --rules`。
- `export --format tailwind` 仍以 v3 为目标。在上游发布 v4 适配器之前，请应用上述 v4 转换。
- Linter 的 WCAG 检查结果默认属于警告——当为实现 AA+ 承诺而运行 `frontend:impeccable` 时，将其提升为错误（参数：`audit`）。
- 无运行时依赖。所有 CLI 调用都通过 `npx @google/design.md@latest` 执行。不要将 `@google/design.md` 添加到 `dependencies` 或 `devDependencies`。
- `alpha` 状态意味着令牌组可能增加或移除字段——将未知属性视为警告而非错误（与规范中的“Consumer Behavior for Unknown Content”表一致）。

## 参考资料

- 规范（实时）：`npx @google/design.md@latest spec`
- Lint 规则（实时）：`npx @google/design.md@latest spec --rules-only`
- 规范（缓存）：`./references/upstream-spec.md`——上游 `docs/spec.md` 的固定快照，由 `frontend/scripts/sync-design-md.sh` 刷新
- README（缓存）：`./references/upstream-README.md`——CLI 参考资料、令牌互操作说明
- GitHub 仓库：https://github.com/google-labs-code/design.md
- 示例：https://github.com/google-labs-code/design.md/tree/main/examples——`atmospheric-glass`、`paws-and-paths`、`totality-festival`
- 发布博客：https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/