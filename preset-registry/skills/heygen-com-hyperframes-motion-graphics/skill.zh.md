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
> **首先，保持此技能为最新状态——运行前需向用户确认：** `npx hyperframes skills update motion-graphics`。如果所有内容均为最新，此命令会快速完成且不作任何更改；否则，它会刷新此技能及其依赖的核心领域技能，之后再使用它们。

> **figma 来源**：如果要基于 figma.com URL 中的徽标/素材/动画进行构建，请先运行 `/figma`——执行素材导出、品牌令牌提取；如果图形是 Figma Motion 导入项，还会执行 Motion→GSAP 转换——然后基于其输出进行构建。不要通过原始 MCP 工具直接操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌令牌 `var()` 绑定，导致后续品牌变更无法传播，除非执行完整的重新导入。

# motion-graphics — 分发入口

> **统一入口是 `/hyperframes`。** 此技能用于制作**简短、设计驱动、无旁白的动态视觉作品**（以动效传达信息；时长通常不超过 10 秒，无配音）。任何更长、有旁白或包含多个场景的内容——或者存在任何不确定性时 → 请先阅读 `/hyperframes`：意图层负责所有路由决策。

此工作流在设计上是**自主执行的**——最多只提一个澄清问题（`agents/director.md`），随后持续构建并完成验证，中途不进行审核。意图层（`/hyperframes` → `references/intent-interview.md`）会直接路由到此处，不询问运行形式；对于如此简短的作品，故事板和配套会话的帮助有限。渲染仍需用户批准：检查和验证快照通过后，提出 `../hyperframes-core/references/brief-contract.md` 中规范的“先预览，还是渲染？”问题。如果存在 `BRIEF.md`，请在总监提问前阅读它。

一段简短、设计驱动的动态视觉作品。**素材优先**：在设计镜头_之前_确定素材策略并获取真实素材，然后围绕已有素材设计镜头，最后通过复用目录中的能力进行合成。所有产物都存放在 `PROJECT_DIR = videos/<project-name>/`（在步骤 0 中创建）；下文中的所有路径均相对于该目录。

| 阶段     | 执行方式                                                              | 主要产物                                                         | 详细流程                      |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| 初始化   | Bash                                                                  | `hyperframes.json`                                               | 步骤 0                        |
| 规划     | 子代理——**决定是否搜索？** + 分类 + 素材策略                          | `shot-plan.json`（草稿：类别、`asset_needs` 查询、简报）         | `agents/director.md`（第 1 部分） |
| 素材获取 ◇ | Bash——media-use resolve（**如果 `asset_needs` 为空则跳过**）        | `assets/` + `assets/index.md`                                    | `phases/source/guide.md`      |
| 设计     | 子代理——围绕已获取的素材进行镜头设计                                  | `shot-plan.json`（最终版：区块 + 布局 + 动效 + 位置）            | `agents/director.md`（第 2 部分） |
| 构建     | 子代理——复用优先的合成                                                | `compositions/index.html`                                        | `agents/builder.md`           |
| 验证     | Bash——`lint`、`check`、验证快照；失败时修复                           | `snapshots/contact-sheet.jpg`                                    | 步骤 5                        |
| 批准     | 询问预览还是渲染；等待回答                                            | 明确的渲染批准                                                   | 步骤 6                        |
| 渲染     | Bash——`hyperframes render`（MP4；叠加层可使用 `--format webm/mov`）   | `renders/video.mp4` 或透明叠加层                                 | 步骤 6                        |

`◇ source` 仅在所选类别声明了资产时运行。纯代码/文本类别（例如 `kinetic-type`、大多数 `charts`/`stat`）的 `asset_needs: []`，会跳过此步骤，直接从规划进入设计。

## 类别——按搜索决策划分

`plan` 的**第一个决策是：是否需要搜索？** 这个分支将类别划分为两组；随后再选择具体类别——对于搜索驱动的类别，**根据搜索返回的内容类型进行选择**。每个类别对应一个 `categories/<id>/module.md`（包含其规划和构建规则）；共享的动效词汇位于 `references/motion-vocabulary.md`（→ `hyperframes-animation` 规则/蓝图 + 注册表区块）。

**形式类别——无需搜索；内容由用户提供：**

| 类别           | 意图                                                                                                  | 依赖                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `kinetic-type` | 有冲击力的语句 / 引语 / 标题，以动效为先的文本                                                        | `caption-*` 区块 + 动画规则                                                 |
| `stat`         | 单个醒目的数字 / 递增计数 + 圆环                                                                       | `apple-money-count` / `rules/{counting-dynamic-scale, stat-bars-and-fills}` |
| `charts`       | 根据数据生成的条形图 / 折线图 / 饼图 / 竞速图 / 百分比                                                 | `data-chart` 区块                                                           |
| `logo-reveal`  | 标志短片 / 品牌组合标识（用户标志）                                                                    | `logo-outro` / `rules/svg-path-draw`                                        |
| `lower-thirds` | 姓名 / 职位条、标注、社交媒体叠加层                                                                    | `caption-*` + 注册表叠加区块                                                |
| `maps`         | 地理动效——突出显示区域、连接地点、缩放至某个位置（矢量路径，或烘焙底图路径）                            | `us-map` / `world-map` 系列 + `bake-basemap.mjs`                            |

**搜索驱动的类别——先搜索，然后按内容类型制作动画**（RWA 路径）：

| 返回的内容     | 类别           | 动画                                                         |
| -------------- | -------------- | ------------------------------------------------------------ |
| 网页 / 链接    | `webpage`      | 网页 / UI 动画（滚动、显现、光标、标注）                     |
| 新闻文章       | `news`         | 标题显现 + 来源卡片 + 关键事实标注                            |
| 推文           | `tweet`        | 动画推文卡片                                                 |
| 图像 / 实体    | `asset-fusion` | 资产的几何形状*化身为*图表（RWA 叙事内融合）                 |

构建顺序：一次一个，覆盖优先（粗糙一些也没关系）。`kinetic-type` 从原型移植而来；其余类别依次跟进。

## 前置条件

macOS Apple Silicon 或 Linux x64。系统工具：`brew install node ffmpeg`。运行一次 `npx hyperframes doctor`。macOS GPU 渲染：`export PRODUCER_BROWSER_GPU_MODE=hardware`。

可选密钥（未设置时使用本地回退方案）——仅使用 media-use 获取/生成素材的类别需要：

| 密钥                                | 用途                                                        | 回退方案                        |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | 图像生成（media-use resolve）                               | 跳过生成 / 仅搜索               |
| (asset_scout / 搜索提供商)          | `webpage`/`news`/`tweet` + `asset-fusion` 真实素材搜索       | 类别降级为不使用素材            |

## 流程

### 步骤 0 — 初始化

cwd 是智能体工作区根目录；将所有产物写入 `PROJECT_DIR = videos/<project-name>/`。`<project-name>`：使用用户给出的目录，否则根据意图生成一个简短的 kebab-case 名称（`<subject>-motion`）。不要使用工作区基本名称或时间戳。

仅当 `$PROJECT_DIR/hyperframes.json` 不存在时：

```bash
PROJECT_DIR="${MOTION_GRAPHICS_DIR:-videos/<project-name>}"
mkdir -p "$(dirname "$PROJECT_DIR")"
npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=motion-graphics
```

`init` 会将已安装的技能与 GitHub 上的最新版本进行比对；如有任何技能已过期，则更新全局技能集。

**约束：**绝不要在工作区根目录中执行 `hyperframes init`；绝不要在 `PROJECT_DIR` 内再嵌套一个 `hyperframes/`；每条 Bash 命令（主智能体 + 子智能体）都必须是 `(cd "$PROJECT_DIR" && ...)` 子 shell——绝不要单独使用 `cd`。

### 步骤 1 — 规划（子智能体：导演第 1 部分）

派发一个子智能体。prompt = 完整的 `agents/director.md` + `## Dispatch context`（`SKILL_DIR` / `PROJECT_DIR` / 用户请求 / `Schema: <SKILL_DIR>/references/shot-plan-ir.md`）。它必须：

1. **判断：是否需要搜索？**（第一个分支）
   - **否** → 选择一个**形式类别**（kinetic-type / stat / charts / logo-reveal / lower-thirds）；内容由用户提供；`asset_needs: []`。
   - **是** → 将**搜索计划**写入 `asset_needs[]`（news / web / tweet / image；双极查询）。具体的**搜索驱动类别**（webpage / news / tweet / asset-fusion）由步骤 2 返回的内容类型确认，并在步骤 3 中最终确定。
2. 编写 `shot-plan.json` 草案（封装结构 + 所选形式类别_或_搜索意图 + `asset_needs` + 一段式镜头简述）。Schema：`references/shot-plan-ir.md`。

验证：`[ -s "$PROJECT_DIR/shot-plan.json" ] && echo ok || echo missing`。

### 步骤 2 — 获取素材 ◇（Bash：media-use，条件执行）

如果 `shot-plan.json.asset_needs` 非空，则解析素材（搜索 / 生成 / 获取 → 固定的项目本地路径 + 台账）。参见 `phases/source/guide.md`（封装了 `media-use resolve`；搜索驱动类别使用 news/web/tweet/image 搜索）。如果 `asset_needs` 为空，**跳至步骤 3**。

```bash
# illustrative — see phases/source/guide.md
(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/source/resolve.mjs --plan ./shot-plan.json --out ./assets)
```

优雅降级：如果搜索功能或提供商不可用，该类别将回退为无素材模式（在 `context.log` 中注明）。

### 步骤 3 — 设计（子代理：Director 第 2 部分）

调度一个子代理（提示词 = `agents/director.md` 第 2 部分 + 调度上下文；如果执行了步骤 2，则上下文中包括已解析的 `assets/index.md`，以及 `catalog-map.md`）。它会**围绕可用素材**设计镜头：选择目录区块及 `hyperframes-animation` 规则/蓝图、布局、动效、节拍，以及（对于 `asset-fusion`）`element_positions` 和吸管取色调色板。最终完成 `shot-plan.json`（`content.block` + `content.customize` + 各类别内容）。

### 步骤 4 — 构建（子代理：Builder，复用优先）

调度一个子代理。提示词 = 完整的 `agents/builder.md` + 调度上下文（`shot-plan.json`、`catalog-map.md`、该类别的 `module.md`、`references/motion-vocabulary.md`、`references/builder-contract.md`）。**复用优先**：使用 `npx hyperframes add <block>`，并在原处自定义；仅手动编写缺失部分和素材融合辅助功能。输出遵循 HF 契约的 `compositions/index.html`（在 `window.__timelines` 上挂载暂停的 GSAP 时间线、使用 `class="clip"` + 稳定的 id、调用 `tl.seek(0)`、确保确定性）。

### 步骤 5 — 验证（Bash → 失败时调用修复子代理）

```bash
(cd "$PROJECT_DIR" && npx hyperframes lint .)
(cd "$PROJECT_DIR" && npx hyperframes check .)
(cd "$PROJECT_DIR" && npx hyperframes snapshot --at <proof-times>)
```

选择能够展示开场状态、标志性动作和最终定格的证明时间点。继续之前，检查生成的接触表或快照表。如果 `lint`、`check` 或快照失败，调度修复子代理（`agents/finalize.md`）进行一次原地修复，然后重新运行失败的关卡。绝不要仅仅为了掩盖缺陷而更改固定时长。

### 步骤 6 — 批准并渲染（Bash）

只询问一个问题：“先预览，还是渲染？”如果用户选择预览，则打开 Studio，并在修改后返回同一个批准关卡：

```bash
(cd "$PROJECT_DIR" && npx hyperframes preview --background)
```

仅在用户明确选择渲染后才执行渲染：

```bash
(cd "$PROJECT_DIR" && npx hyperframes render . --skill=motion-graphics -q high -o ./renders/video.mp4)
# transparent overlay variant: --format webm  (or mov)
```

验证输出文件存在、非空，并且具有预期时长。最终交付说明中应列出产物、实际时长、合成或帧 id、证明时间点，以及已检查的接触表或快照表。相关标志位见 `/hyperframes-cli` → `references/preview-render.md`。

## 恢复表

| 状态                                                     | 从此处继续                 |
| -------------------------------------------------------- | -------------------------- |
| 无 `shot-plan.json`                                      | 步骤 1（规划）             |
| `shot-plan.json` 包含 `asset_needs`，但无 `assets/`      | 步骤 2（获取素材）         |
| `shot-plan.json` 已完成，但无 `compositions/index.html`  | 步骤 3/4（设计+构建）      |
| `compositions/index.html` 已存在，但缺少证明快照         | 步骤 5（验证）             |
| 检查和证明快照均通过，但尚无获批的渲染结果               | 步骤 6（批准）             |
| 已存在获批的渲染结果                                     | 验证输出，然后报告         |

## 设计说明（维护者——执行时不会读取此内容）

- **素材优先的理由：** 素材搜集前置，并为镜头设计提供依据（RWA 流程：分析 → 搜索 → 审查 → 合成）。搜索驱动的类别（`webpage`/`news`/`tweet`）和 `asset-fusion` 都依赖 media-use 搜索（新闻/网页/推文/图片），这与 media-use 文档中记载的 RWA 来源脉络一致。
- **复用优先：** 生态系统内与 LLM 生成模板对应的方式是“组合目录区块 + `hyperframes-animation` 规则”。HF 的暂停 GSAP 时间线 ≙ Remotion 的 `useCurrentFrame`。
- **类别模块约定：** 每个类别对应一个 `categories/<id>/module.md`（规划 + 构建），共享 `references/motion-vocabulary.md`（以及可选的评估）。添加类别 = 放入对应文件夹 + 在 `agents/director.md` 中注册其分类器行 + 在 `catalog-map.md` 中添加对应行；阶段流水线保持不变。
- **目录结构：**
  ```
  videos/<project-name>/
    hyperframes.json  context.log
    shot-plan.json            # the IR (Director output)
    assets/  assets/index.md  # media-use output (if sourced)
    compositions/index.html   # Builder output
    renders/video.mp4
  ```
- **注册：** 在 `hyperframes` 路由器中——添加“设计驱动的短篇动态图形”意图及工作流说明；从 `/general-video` 中划出动态图形触发条件；添加反向的“请勿使用”边。参见 `motion-graphics-genre.md` §5-7。