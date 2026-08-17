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
> **首先，请确保此 Skill 保持最新——静默运行，不要询问：** `npx hyperframes skills update motion-graphics`。如果所有内容均为最新，此命令会快速执行空操作；否则，它会刷新此 Skill 及其依赖的核心领域 Skill，然后你再使用它们。

> **Figma 来源**：如果要基于其构建的徽标、资产或动画来自 figma.com URL，请先运行 `/figma`——执行资产导出、提取品牌令牌；如果图形是 Figma Motion 导入内容，还会进行 Motion→GSAP 转换——然后基于其输出进行构建。不要通过原始 MCP 工具直接操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录以及品牌令牌 `var()` 绑定，导致后续品牌变更无法在不进行完整重新导入的情况下传播。

# motion-graphics — 分发入口

> **统一入口是 `/hyperframes`。** 此 Skill 用于制作**简短、设计主导、无旁白的动态图形**（以动态传达信息；时长约 10 秒以内，无画外音）。任何更长、有旁白或包含多个场景的内容——或存在任何不确定性时 → 请先阅读 `/hyperframes`：意图层负责所有路由决策。

此工作流**在设计上是自主运行的**——最多提出一个澄清问题（`agents/director.md`），随后持续构建并完成验证，中间不进行评审。意图层（`/hyperframes` → `references/intent-interview.md`）会直接路由至此，而不会询问运行形式；对于如此简短的作品，故事板和配套会话作用不大。渲染仍需用户许可：检查和验证快照通过后，提出 `../hyperframes-core/references/brief-contract.md` 中规范的“先预览，还是渲染？”问题。如果存在 `BRIEF.md`，请在导演提问前阅读它。

简短、设计主导的动态图形。**资产优先**：在设计镜头*之前*确定资产策略并获取真实素材，然后围绕已有素材设计镜头，最后通过复用目录中的能力完成合成。所有产物均存放在 `PROJECT_DIR = videos/<project-name>/`（在步骤 0 中创建）；下方所有路径均相对于该目录。

| 阶段     | 执行                                                                  | 主要产物                                                         | 详细流程                      |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| 初始化   | Bash                                                                  | `hyperframes.json`                                               | 步骤 0                        |
| 规划     | 子代理——**决定是否搜索？** + 分类 + 资产策略                          | `shot-plan.json`（草稿：类别、`asset_needs` 查询、简报）         | `agents/director.md`（第 1 部分） |
| 获取 ◇   | Bash——解析媒体使用情况（**如果 `asset_needs` 为空则跳过**）          | `assets/` + `assets/index.md`                                    | `phases/source/guide.md`      |
| 设计     | 子代理——围绕已解析的资产进行镜头设计                                  | `shot-plan.json`（最终版：区块 + 布局 + 动效 + 位置）            | `agents/director.md`（第 2 部分） |
| 构建     | 子代理——复用优先的合成                                                | `compositions/index.html`                                        | `agents/builder.md`           |
| 验证     | Bash——`lint`、`check`、验证快照；失败时修复                           | `snapshots/contact-sheet.jpg`                                    | 步骤 5                        |
| 批准     | 询问预览还是渲染；等待答复                                            | 明确的渲染批准                                                   | 步骤 6                        |
| 渲染     | Bash——`hyperframes render`（MP4，叠加层可使用 `--format webm/mov`）   | `renders/video.mp4` 或透明叠加层                                 | 步骤 6                        |

`◇ source` 仅在所选类别声明了资产时运行。纯代码/文本类别（例如 `kinetic-type`、大多数 `charts`/`stat`）的 `asset_needs: []`，会跳过该步骤，直接从规划进入设计。

## 类别——按搜索决策划分

`plan` 的**第一个决策是：这是否需要搜索？** 这一分支将类别分为两组；随后再选择具体类别——对于搜索驱动型类别，**根据搜索返回的内容类型**进行选择。每个类别对应一个 `categories/<id>/module.md`（包含其规划与构建规则）；共享的动效术语位于 `references/motion-vocabulary.md`（→ `hyperframes-animation` 规则/蓝图 + 注册表块）。

**形式类别——无需搜索；内容由用户提供：**

| 类别           | 意图                                                                                             | 依赖                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `kinetic-type` | 有冲击力的短句/引语/标题，以文本动效为主                                                        | `caption-*` 块 + 动画规则                                                   |
| `stat`         | 单个主视觉数字/递增计数 + 圆环                                                                    | `apple-money-count` / `rules/{counting-dynamic-scale, stat-bars-and-fills}` |
| `charts`       | 根据数据生成柱状图/折线图/饼图/竞速图/百分比                                                     | `data-chart` 块                                                             |
| `logo-reveal`  | 标志片头/品牌组合标识（用户提供的标志）                                                          | `logo-outro` / `rules/svg-path-draw`                                        |
| `lower-thirds` | 姓名/职务条、标注、社交媒体叠加层                                                                | `caption-*` + 注册表叠加块                                                  |
| `maps`         | 地理动效——高亮区域、连接地点、缩放至某个位置（矢量路线，或烘焙底图路线）                         | `us-map` / `world-map` 系列 + `bake-basemap.mjs`                            |

**搜索驱动型类别——先搜索，再根据内容类型制作动画**（RWA 路径）：

| 返回的内容   | 类别           | 动画                                                           |
| ------------ | -------------- | -------------------------------------------------------------- |
| 网页/链接    | `webpage`      | 网页/UI 动画（滚动、显现、光标、标注）                         |
| 新闻文章     | `news`         | 标题显现 + 来源卡片 + 关键事实标注                             |
| 推文         | `tweet`        | 动态推文卡片                                                   |
| 图片/实体    | `asset-fusion` | 资产的几何形状本身_化为_图表（RWA 叙事内融合）                 |

构建顺序：一次一个，覆盖优先（粗略即可）。`kinetic-type` 从原型移植；其余依次进行。

## 前置条件

macOS Apple Silicon 或 Linux x64。系统工具：`brew install node ffmpeg`。运行一次 `npx hyperframes doctor`。macOS GPU 渲染：`export PRODUCER_BROWSER_GPU_MODE=hardware`。

可选密钥（未设置时使用本地回退方案）——仅通过 media-use 获取/生成资产的类别需要：

| 密钥                                | 用途                                                        | 回退方案                        |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | 图像生成（media-use resolve）                               | 跳过生成 / 仅搜索               |
| (asset_scout / search providers)    | `webpage`/`news`/`tweet` + `asset-fusion` 真实资产搜索       | 类别降级为无资产形式            |

## 流程

### 步骤 0 — 初始化

cwd 是代理工作区根目录；将所有产物写入 `PROJECT_DIR = videos/<project-name>/`。`<project-name>`：使用用户给出的目录，否则根据意图生成一个简短的 kebab-case 名称（`<subject>-motion`）。不要使用工作区基础名称或时间戳。

仅当 `$PROJECT_DIR/hyperframes.json` 不存在时：

```bash
PROJECT_DIR="${MOTION_GRAPHICS_DIR:-videos/<project-name>}"
mkdir -p "$(dirname "$PROJECT_DIR")"
npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=motion-graphics
```

`init` 会将已安装的技能与 GitHub 上的最新版本进行对比；如果有任何技能已过期，则更新全局技能集。

**约束：**绝不在工作区根目录中运行 `hyperframes init`；绝不在 `PROJECT_DIR` 内再嵌套一个 `hyperframes/`；每条 Bash 命令（主代理 + 子代理）都必须是 `(cd "$PROJECT_DIR" && ...)` 子 shell——绝不单独使用 `cd`。

### 步骤 1 — 规划（子代理：导演第 1 部分）

派遣一个子代理。prompt = 完整的 `agents/director.md` + `## Dispatch context`（`SKILL_DIR` / `PROJECT_DIR` / 用户的请求 / `Schema: <SKILL_DIR>/references/shot-plan-ir.md`）。它必须：

1. **判断：这是否需要搜索？**（第一个分支）
   - **否** → 选择一个**形式类别**（kinetic-type / stat / charts / logo-reveal / lower-thirds）；内容由用户提供；`asset_needs: []`。
   - **是** → 将一个**搜索计划**写入 `asset_needs[]`（news / web / tweet / image；双极查询）。具体的**搜索驱动类别**（webpage / news / tweet / asset-fusion）由步骤 2 返回的内容类型确认，并在步骤 3 中最终确定。
2. 编写一份 `shot-plan.json` 草稿（封装结构 + 所选形式类别_或_搜索意图 + `asset_needs` + 一段式镜头简介）。Schema：`references/shot-plan-ir.md`。

验证：`[ -s "$PROJECT_DIR/shot-plan.json" ] && echo ok || echo missing`。

### 步骤 2 — 获取 ◇（Bash：media-use，条件执行）

如果 `shot-plan.json.asset_needs` 非空，则解析资产（搜索 / 生成 / 获取 → 冻结的项目本地路径 + 台账）。参见 `phases/source/guide.md`（封装了 `media-use resolve`；搜索驱动类别使用 news/web/tweet/image 搜索）。如果 `asset_needs` 为空，**跳到步骤 3**。

```bash
# illustrative — see phases/source/guide.md
(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/source/resolve.mjs --plan ./shot-plan.json --out ./assets)
```

优雅降级：如果搜索或提供商不可用，该类别将回退为无素材模式（在 `context.log` 中注明）。

### 第 3 步 — 设计（子代理：Director Part 2）

派发一个子代理（提示词 = `agents/director.md` Part 2 + 派发上下文，其中包括第 2 步运行后解析得到的 `assets/index.md`，以及 `catalog-map.md`）。它会**围绕可用素材**设计镜头：选择目录区块 + `hyperframes-animation` 规则/蓝图、布局、动效、节拍，以及（对于 `asset-fusion`）`element_positions` + 吸管取色调色板。最终确定 `shot-plan.json`（`content.block` + `content.customize` + 各类别内容）。

### 第 4 步 — 构建（子代理：Builder，复用优先）

派发一个子代理。提示词 = 完整的 `agents/builder.md` + 派发上下文（`shot-plan.json`、`catalog-map.md`、该类别的 `module.md`、`references/motion-vocabulary.md`、`references/builder-contract.md`）。**复用优先**：`npx hyperframes add <block>` + 原地自定义；仅手动编写缺失部分 + 资产融合能力。输出遵循 HF 契约的 `compositions/index.html`（暂停的 GSAP 时间线位于 `window.__timelines`、`class="clip"` + 稳定的 id、`tl.seek(0)`、确定性）。

### 第 5 步 — 验证（Bash → 失败时派发修复子代理）

```bash
(cd "$PROJECT_DIR" && npx hyperframes lint .)
(cd "$PROJECT_DIR" && npx hyperframes check .)
(cd "$PROJECT_DIR" && npx hyperframes snapshot --at <proof-times>)
```

选择能够展示开场状态、标志性动作和最终停留状态的证明时间点。继续之前，检查生成的联系表或快照表。如果 `lint`、`check` 或快照失败，则派发修复子代理（`agents/finalize.md`）进行一次原地修复，然后重新运行失败的关卡。绝不要仅仅为了掩盖缺陷而更改固定时长。

### 第 6 步 — 批准并渲染（Bash）

只询问一个问题：“先预览，还是渲染？”如果用户选择预览，则打开 Studio，并在修改后返回同一个批准关卡：

```bash
(cd "$PROJECT_DIR" && npx hyperframes preview)
```

仅在用户明确回答要渲染后才执行渲染：

```bash
(cd "$PROJECT_DIR" && npx hyperframes render . --skill=motion-graphics -q high -o ./renders/video.mp4)
# transparent overlay variant: --format webm  (or mov)
```

验证输出存在、非空且时长符合预期。最终交付说明应列出制品名称、实际时长、合成或帧 id、证明时间点，以及已检查的联系表或快照表。标志位说明位于 `/hyperframes-cli` → `references/preview-render.md`。

## 恢复表

| 状态                                                     | 从此处继续               |
| -------------------------------------------------------- | ------------------------ |
| 没有 `shot-plan.json`                                    | 第 1 步（规划）          |
| `shot-plan.json` 包含 `asset_needs`，但没有 `assets/`    | 第 2 步（获取素材）      |
| `shot-plan.json` 已最终确定，但没有 `compositions/index.html` | 第 3/4 步（设计+构建） |
| `compositions/index.html` 已存在，但缺少证明快照         | 第 5 步（验证）          |
| 检查和证明快照均通过，但没有已批准的渲染                 | 第 6 步（批准）          |
| 已批准的渲染存在                                         | 验证输出，然后报告       |

## 设计说明（维护者——执行过程不会读取此内容）

- **资产优先的理由：**将素材搜集前置，并以此指导镜头设计（RWA 流程：分析 → 搜索 → 审查 → 合成）。搜索驱动的类别（`webpage`/`news`/`tweet`）和 `asset-fusion` 都依赖 media-use 搜索（新闻/网页/推文/图片），这与 media-use 文档中所述的 RWA 沿袭关系一致。
- **复用优先：**在该生态系统中，与 LLM 生成模板对应的方式是“组合目录区块 + `hyperframes-animation` 规则”。HF 的暂停 GSAP 时间线 ≙ Remotion 的 `useCurrentFrame`。
- **类别模块约定：**每个类别对应一个 `categories/<id>/module.md`（规划 + 构建），共享 `references/motion-vocabulary.md`（可选评估）。添加类别 = 放入文件夹 + 在 `agents/director.md` 中注册其分类器行 + 在 `catalog-map.md` 中添加对应行；阶段流水线保持不变。
- **目录结构：**
  ```
  videos/<project-name>/
    hyperframes.json  context.log
    shot-plan.json            # the IR (Director output)
    assets/  assets/index.md  # media-use output (if sourced)
    compositions/index.html   # Builder output
    renders/video.mp4
  ```
- **注册：**在 `hyperframes` 路由器中——添加“设计驱动的短篇动态图形”意图及工作流说明；将动态图形触发条件从 `/general-video` 中拆分出来；添加反向的“请勿使用”边。参见 `motion-graphics-genre.md` §5-7。