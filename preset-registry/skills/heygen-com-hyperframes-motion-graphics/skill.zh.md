---
name: motion-graphics
description: >
  A short, design-led motion graphic where motion is the message — kinetic
  typography, stat count-up, chart/data-viz hit, logo sting / brand lockup,
  lower-third / callout / social overlay, animated map (highlight regions,
  connect places, zoom to a location), animated tweet / news-article /
  headline, webpage / UI animation (scroll, cursor, callouts), or fusing a
  real image's geometry into a chart. Usually under 10s (up to ~30s), no
  narration or live-action subject; renders to MP4 or transparent overlay.
  Longer / narrated / multi-scene → /general-video. Unclear → /hyperframes.
---
> **首先，保持此技能为最新状态，静默运行，不要询问：** `npx hyperframes skills update motion-graphics`。当所有内容均为最新时会快速无操作；否则会在你依赖它们之前，刷新此技能及其依赖的核心领域技能。

> **figma 源文件**：如果要据此构建的徽标/资产/动画来自 figma.com URL，请先运行 `/figma`，然后基于其输出进行构建，包括资产导出、品牌令牌，以及当图形是 Figma Motion 导入时的 Motion→GSAP 转换。不要直接通过原始 MCP 工具操作 Figma：这会跳过 SVG 清理、`.media/manifest.jsonl` 溯源记录和品牌令牌 `var()` 绑定，因此后续品牌变更将无法传播，除非重新完整导入。

# motion-graphics — 调度入口

> **入口是 `/hyperframes`。** 此技能用于制作**简短、以设计为主导、无旁白的动态图形**（运动即信息；约 10 秒以内，无配音）。任何更长、有旁白或多场景的内容，或存在任何不确定性时 → 请先阅读 `/hyperframes`：意图层负责所有路由决策。

此工作流**在设计上是自主执行的**：最多只提出一个澄清问题（`agents/director.md`），随后无需中间评审即可构建并完成验证。意图层（`/hyperframes` → `references/intent-interview.md`）会直接路由至此，不会询问运行形态相关问题；对于如此短的作品，故事板和配套会话几乎没有额外价值。渲染仍需用户把关：检查和证明快照通过后，询问 `../hyperframes-core/references/brief-contract.md` 中的标准“先预览，还是渲染？”问题。当存在 `BRIEF.md` 时，请在导演的问题之前先阅读它。

一段简短、以设计为主导的动态图形。**资产优先**：在设计镜头之前决定资产策略并获取真实素材，然后围绕现有素材设计镜头，接着通过复用目录能力进行合成。所有产物均放入 `PROJECT_DIR = videos/<project-name>/`（在步骤 0 中创建）；下方所有路径均相对于该目录。

| 阶段    | 执行方式                                                             | 主要产物                                                         | 详细流程                      |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| 初始化     | Bash                                                                  | `hyperframes.json`                                               | 步骤 0                        |
| 规划     | 子代理 — **决定是否搜索？** + 分类 + 资产策略                         | `shot-plan.json`（草稿：类别、`asset_needs` 查询、简介）          | `agents/director.md`（第 1 部分） |
| 获取 ◇ | Bash — 媒体使用解析（若 `asset_needs` 为空则**跳过**）                 | `assets/` + `assets/index.md`                                    | `phases/source/guide.md`      |
| 设计     | 子代理 — 围绕已解析资产进行镜头设计                                   | `shot-plan.json`（最终版：块 + 布局 + 运动 + 位置）               | `agents/director.md`（第 2 部分） |
| 构建     | 子代理 — 优先复用的合成                                               | `compositions/index.html`                                        | `agents/builder.md`           |
| 验证     | Bash — `lint`、`check`、证明快照；失败时修复                          | `snapshots/contact-sheet.jpg`                                    | 步骤 5                        |
| 批准     | 询问预览或渲染；等待答复                                               | 明确的渲染批准                                                   | 步骤 6                        |
| 渲染     | Bash — `hyperframes render`（MP4，或叠加层使用 `--format webm/mov`） | `renders/video.mp4` 或透明叠加层                                  | 步骤 6                        |

`◇ source` 仅在所选类别声明了资产时运行。纯代码/文本类别（例如 `kinetic-type`、大多数 `charts`/`stat`）的 `asset_needs: []`，会直接从计划跳到设计。

## 类别 — 按搜索决策拆分

`plan` 的**第一个决策是：这是否需要搜索？** 这个分支将类别分为两组；随后选择具体类别——对于搜索驱动的类别，**依据搜索返回的内容类型**进行选择。每个类别对应一个 `categories/<id>/module.md`（包含其规划 + 构建规则）；共享的动效词汇位于 `references/motion-vocabulary.md`（→ `hyperframes-animation` 规则/蓝图 + 注册表区块）。

**形式类别 — 无需搜索；用户提供内容：**

| 类别       | 意图                                                                                                         | 主要依赖                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `kinetic-type` | 有冲击力的短句 / 引言 / 标题，以动效文本为主                                                                 | `caption-*` 区块 + 动画规则                                        |
| `stat`         | 单个主视觉数字 / 计数递增 + 圆环                                                                           | `apple-money-count` / `rules/{counting-dynamic-scale, stat-bars-and-fills}` |
| `charts`       | 基于数据的柱状图 / 折线图 / 饼图 / 竞速图 / 百分比                                                                          | `data-chart` 区块                                                          |
| `logo-reveal`  | Logo 动画短片 / 品牌组合（用户 Logo）                                                                          | `logo-outro` / `rules/svg-path-draw`                                        |
| `lower-thirds` | 姓名 / 职务栏、标注、社交媒体叠加层                                                                   | `caption-*` + 注册表叠加区块                                       |
| `maps`         | 地理动效——突出显示区域、连接地点、缩放至某个位置（矢量路径，或烘焙底图路径） | `us-map` / `world-map` 系列 + `bake-basemap.mjs`                          |

**搜索驱动类别 — 先搜索，再按内容类型制作动画**（RWA 路径）：

| 返回内容 | 类别       | 动画                                                      |
| -------- | ---------- | -------------------------------------------------------------- |
| 网页 / 链接   | `webpage`      | 网页 / UI 动画（滚动、揭示、光标、标注）      |
| 新闻文章     | `news`         | 标题揭示 + 来源卡片 + 关键事实标注              |
| 推文            | `tweet`        | 动态推文卡片                                            |
| 图像 / 实体   | `asset-fusion` | 资产的几何形态_成为_图表（RWA 叙事内融合） |

构建顺序：一次一个，覆盖优先（粗略即可）。`kinetic-type` 从原型移植；其余随后跟进。

## 前置条件

macOS Apple Silicon 或 Linux x64。系统工具：`brew install node ffmpeg`。运行一次 `npx hyperframes doctor`。macOS GPU 渲染：`export PRODUCER_BROWSER_GPU_MODE=hardware`。

可选密钥（未设置时使用本地回退）——仅供通过 media-use 获取/生成资产的类别使用：

| 密钥                                | 用途                                                        | 回退方案                        |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | 图像生成（media-use resolve）                               | 跳过生成 / 仅搜索               |
| （asset_scout / 搜索提供商）        | `webpage`/`news`/`tweet` + `asset-fusion` 真实资产搜索      | 类别降级为无资产                |

## 流程

### 步骤 0 — 初始化

cwd 是代理工作区根目录；将所有产物写入 `PROJECT_DIR = videos/<project-name>/` 下。`<project-name>`：使用用户提供的目录；否则根据意图使用简短的 kebab-case 名称（`<subject>-motion`）。不要使用工作区 basename 或时间戳。

仅当 `$PROJECT_DIR/hyperframes.json` 不存在时：

```bash
PROJECT_DIR="${MOTION_GRAPHICS_DIR:-videos/<project-name>}"
mkdir -p "$(dirname "$PROJECT_DIR")"
npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=motion-graphics
```

`init` 会根据 GitHub 上的最新版本检查已安装的技能；如果有任何技能过期，则更新全局技能集。

**约束：**绝不在工作区根目录执行 `hyperframes init`；绝不在 `PROJECT_DIR` 内嵌套另一个 `hyperframes/`；每个 Bash 命令（主代理 + 子代理）都必须是 `(cd "$PROJECT_DIR" && ...)` 子 shell——绝不能使用裸 `cd`。

### 步骤 1 — 规划（子代理：Director 第 1 部分）

派发一个子代理。prompt = 完整的 `agents/director.md` + `## Dispatch context`（`SKILL_DIR` / `PROJECT_DIR` / 用户请求 / `Schema: <SKILL_DIR>/references/shot-plan-ir.md`）。它必须：

1. **决定：这是否需要搜索？**（第一个分支）
   - **否** → 选择一个**形式类别**（kinetic-type / stat / charts / logo-reveal / lower-thirds）；内容由用户提供；`asset_needs: []`。
   - **是** → 在 `asset_needs[]` 中输出一个**搜索计划**（news / web / tweet / image；双极查询）。具体的**搜索驱动类别**（webpage / news / tweet / asset-fusion）将在步骤 2 根据返回的内容类型确认，并在步骤 3 最终确定。
2. 编写一份草稿 `shot-plan.json`（封套 + 所选形式类别 _或_ 搜索意图 + `asset_needs` + 一段式镜头简介）。Schema：`references/shot-plan-ir.md`。

验证：`[ -s "$PROJECT_DIR/shot-plan.json" ] && echo ok || echo missing`。

### 步骤 2 — 获取 ◇（Bash：media-use，条件执行）

如果 `shot-plan.json.asset_needs` 非空，则解析资产（搜索 / 生成 / 获取 → 冻结的项目本地路径 + 台账）。参见 `phases/source/guide.md`（封装 `media-use resolve`；搜索驱动类别使用 news/web/tweet/image 搜索）。如果 `asset_needs` 为空，**跳至步骤 3**。

```bash
# illustrative — see phases/source/guide.md
(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/source/resolve.mjs --plan ./shot-plan.json --out ./assets)
```

优雅降级：如果某个搜索/提供方不可用，该类别将回退为无资产模式（在 `context.log` 中记录）。

### 第 3 步 — 设计（子代理：Director 第 2 部分）

调度一个子代理（提示词 = `agents/director.md` 第 2 部分 + 调度上下文，其中包括第 2 步运行后解析得到的 `assets/index.md` + `catalog-map.md`）。它会**围绕可用资产**设计镜头：选择目录区块 + `hyperframes-animation` 规则/蓝图、布局、运动、节拍，以及（对于 `asset-fusion`）`element_positions` + 吸管调色板。最终确定 `shot-plan.json`（`content.block` + `content.customize` + 每个类别的内容）。

### 第 4 步 — 构建（子代理：Builder，优先复用）

调度一个子代理。提示词 = 完整的 `agents/builder.md` + 调度上下文（`shot-plan.json`、`catalog-map.md`、该类别的 `module.md`、`references/motion-vocabulary.md`、`references/builder-contract.md`）。**优先复用**：`npx hyperframes add <block>` + 就地定制；仅针对缺口和 asset-fusion 交互能力手工编写。输出遵守 HF 合约的 `compositions/index.html`（在 `window.__timelines` 上放置暂停状态的 GSAP 时间线、`class="clip"` + 稳定 id、`tl.seek(0)`、保持确定性）。

### 第 5 步 — 验证（Bash → 失败时调度修复子代理）

```bash
(cd "$PROJECT_DIR" && npx hyperframes lint .)
(cd "$PROJECT_DIR" && npx hyperframes check .)
(cd "$PROJECT_DIR" && npx hyperframes snapshot --at <proof-times>)
```

选择能够展示开场状态、标志性动作和最终定格的证明时间点。在继续之前，检查生成的联系表或快照表。在 `lint`、`check` 或快照失败时，调度修复子代理（`agents/finalize.md`）执行一次就地修复，然后重新运行失败的门禁。绝不要仅仅为了掩盖缺陷而更改固定时长。

### 第 6 步 — 批准并渲染（Bash）

询问一个问题：“先预览，还是渲染？”如果用户选择预览，打开 Studio，并在修改后返回同一个批准门禁：

```bash
(cd "$PROJECT_DIR" && npx hyperframes preview --background)
```

只有在用户明确回答渲染后才执行渲染：

```bash
(cd "$PROJECT_DIR" && npx hyperframes render . --skill=motion-graphics -q high -o ./renders/video.mp4)
# transparent overlay variant: --format webm  (or mov)
```

验证输出存在、非空，并且具有预期时长。最终交付中需注明产物、实际时长、合成或帧 id、证明时间点，以及已检查的联系表或快照表。相关标志位于 `/hyperframes-cli` → `references/preview-render.md`。

## 恢复表

| 状态                                                     | 从何处继续                 |
| -------------------------------------------------------- | -------------------------- |
| 没有 `shot-plan.json`                                    | 第 1 步（规划）            |
| `shot-plan.json` 有 `asset_needs`，但没有 `assets/`       | 第 2 步（来源）            |
| `shot-plan.json` 已最终确定，但没有 `compositions/index.html` | 第 3/4 步（设计+构建）     |
| `compositions/index.html` 存在，但没有证明快照            | 第 5 步（验证）            |
| 检查和证明快照通过，但没有已批准的渲染                    | 第 6 步（批准）            |
| 已存在已批准的渲染                                        | 验证输出，然后报告         |

## 设计说明（维护者 — 执行阶段不会读取此内容）

- **资产优先的理由：**素材搜集前置，并为镜头设计提供依据（RWA 流程：分析 → 搜索 → 审核 → 合成）。以搜索驱动的类别（`webpage`/`news`/`tweet`）和 `asset-fusion` 都依赖媒体用途搜索（news/web/tweet/image），这正是 media-use 有文档记录的 RWA 渊源。
- **复用优先：**生态系统内与 LLM 生成模板对应的方案是“组合目录模块 + `hyperframes-animation` 规则”。HF 的暂停 GSAP 时间线 ≙ Remotion 的 `useCurrentFrame`。
- **类别模块契约：**每个类别对应一个 `categories/<id>/module.md`（规划 + 构建），共享 `references/motion-vocabulary.md`（+ 可选评估）。添加一个类别 = 放入该文件夹 + 在 `agents/director.md` 中注册其分类器行 + 在 `catalog-map.md` 中添加其对应行；阶段流水线保持不变。
- **目录结构：**
  ```
  videos/<project-name>/
    hyperframes.json  context.log
    shot-plan.json            # the IR (Director output)
    assets/  assets/index.md  # media-use output (if sourced)
    compositions/index.html   # Builder output
    renders/video.mp4
  ```
- **注册：**在 `hyperframes` 路由中 — 添加“设计主导的短动态视觉图形”意图 + 工作流描述；从 `/general-video` 中剥离动态图形触发条件；添加反向的 DO-NOT-use 边。参见 `motion-graphics-genre.md` §5-7。