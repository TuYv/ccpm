---
name: website-to-video
description: "Capture a general website/URL and turn it into a video OF the site — tour, showcase, or social clip built from captured screenshots and the site's own brand assets. Use for portfolio / blog / docs / landing-page showcases. Not a product launch or promo, even from a URL (/product-launch-video). Unclear → /hyperframes."
---
> **首先，确保此 skill 为最新版本——静默运行，不要询问：** `npx hyperframes skills update website-to-video`。当所有内容均为最新时，此命令会快速执行空操作；否则，它会刷新此 skill，以及你在使用它之前所依赖的核心领域 skill。

> **media-use**：在获取音频、图片或徽标之前，调用 `/media-use`，以便从 HeyGen 目录中解析 BGM/SFX/图片，并从品牌官方来源获取徽标。先运行 `--adopt` 以登记现有素材。参见 `/media-use` skill。

> **figma 来源**：如果 URL 是 figma.com 链接（而不是已上线的产品网站），请先运行 `/figma`——根据需要执行素材导出、品牌 token 提取，以及组件/故事板重建——然后根据其输出构建此工作流。不要通过原始 MCP 工具直接操作 Figma：这会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌 token 的 `var()` 绑定，导致后续品牌变更无法在不完全重新导入的情况下传播。

# 将网站转换为 HyperFrames

捕获网站，然后基于它制作专业视频。

> **在步骤 0 之前确认路由。** 此 skill 用于制作_关于一般网站或基于一般网站_的视频。如果用户真正想要的是**营销 / 发布 / 推广产品**（即使素材来自此 URL，即使用户说的是“为我们的网站制作宣传片”）→ `/product-launch-video`。**没有网站的主题讲解视频** → `/faceless-explainer`；**GitHub PR** → `/pr-to-video`；**重新剪辑 / 重新着色 / 重新排序现有视频文件** → 不在范围内。如果因模糊的“制作一个视频”而路由到这里，或不确定应归为产品发布还是一般网站？**先阅读 `/hyperframes`**（完整路由表 + § HyperFrames 无法完成的事项）。

用户通常会这样说：

- “把这个网站制作成一个用于 Instagram 的 15 秒社交媒体短片”
- “基于 https://... 制作一个 30 秒的网站导览 / 展示视频”
- “捕获我们的首页，并使用网站自身的视觉素材制作视频”

此工作流包含 7 个步骤。每一步都会生成一个制约下一步的产物。默认采用协作模式——标有 💬 的关卡会暂停并询问用户。模式语义（信号、传播、关卡分类）的规范定义位于 `../hyperframes-core/references/brief-contract.md`；当用户表示采用自主模式（“替我决定”“给我惊喜”）时，会跳过 💬 用户偏好关卡——有关这种模式如何在此工作流中传播，请参阅 step-2-brief.md。

**自主模式并不意味着“跳过所有关卡”**（简报契约 § 1）。它适用于用户偏好问题（TTS 提供商、声音、颜色强调、节拍数量、是否使用音乐、是否添加字幕——由代理代替用户决定）。它不适用于质量验证关卡。以下关卡即使在自动模式下也不可跳过：

- 素材审核（步骤 3）——查看联系表，并说明每项素材为何 USE/SKIP
- 逐节拍阅读 HTML（步骤 5）——为每个节拍提供结构化证据块
- DoD 检查清单（步骤 6）——包括动画映射、针对每条警告的 WCAG 验证，以及音频/动效播放检查
- 如实披露部分（步骤 6）——最终摘要中必须包含“我未验证的内容”

如果你发现自己在推断“自动模式要求偏向行动，所以我会跳过 X”——而 X 是验证关卡，不是偏好问题——那么这种推断是错误的。偏向行动适用于决定_要构建什么_，而不适用于决定_是否进行验证_。

---

## 第 0 步：采集并理解品牌

**阅读：**[references/step-0-capture.md](references/step-0-capture.md)

采集网站，然后阅读提取的数据，以了解**品牌和产品**——它的作用、目标用户、表达语气以及整体氛围。采集到的素材是供后续使用的品牌工具包，而不是构成视频的基本元素。

**在询问需求简报之前显示登录状态**——运行 `npx hyperframes auth status`，并**逐字转达其输出（不要转述或改写）。**它会说明语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时告知如何登录。**如果未登录，请停止并等待用户选择——登录，或者回复 "go"/"offline" 以继续使用本地引擎——之后才能询问需求简报或任何其他内容。**将其视为一个真正的决策点，而不是顺带说明；不要把这个选择并入需求简报问题，也不要将密钥写入每个仓库的 `.env`。（在自主模式下，记录该状态并继续离线执行。）规范指导请参阅 `../media-use` → 预检。

**门槛：**已输出网站摘要——先讲策略（产品的作用、目标用户、品牌语气），再列出素材/颜色/字体清单；已显示登录状态（已登录，或继续离线执行）。

---

## 第 1 步：品牌标识

**阅读：**[references/step-1-design.md](references/step-1-design.md)

编写 DESIGN.md——一份涵盖视觉标识的品牌速查表：颜色、字体排印、组件样式、布局原则。使用 `design-styles.json` 中精确的计算值。

**快速选项：**对于节奏明快的视频（每个节拍呈现一个广告牌式画面），DESIGN.md 可以是一份包含颜色、字体和该做/不该做事项的 50 行摘要，而不是一份 300 行的文档。第 5 步中的子代理提示会直接粘贴品牌值，因此只有在复杂构图中，DESIGN.md 的详细程度才重要。

**门槛：**`DESIGN.md` 已存在（长度不限），且至少包含：调色板、字体选择以及该做/不该做事项。

---

## 第 2 步：策略与信息传达

**阅读：**[references/step-2-brief.md](references/step-2-brief.md)、[references/capabilities.md](references/capabilities.md)（浏览目录——仅按需深入阅读相关章节）

在讨论视觉效果或素材之前，先与用户就**视频必须传达什么**达成一致。解析用户的提示——他们很可能已经说明了视频类型和风格。只询问缺失的信息：这个视频必须传达的唯一核心信息、叙事弧线和目标受众。

**门槛：**视频类型、时长、格式，以及最关键的——核心信息和叙事弧线——均已确定。缺少这些内容，第 3 步就无法编写概念优先的分镜脚本。

---

## 第 3 步：分镜脚本 + 文案 💬

**阅读：**[references/step-3-storyboard.md](references/step-3-storyboard.md)

以概念优先的方式编写分镜脚本：核心信息 → 叙事弧线 → 服务于叙事弧线的节拍 → 每个节拍采用的技巧 → 最后添加品牌点缀。然后编写与之匹配的旁白文案。将两者连同逐节拍摘要一起呈现给用户。持续迭代，直到用户批准。

**门槛：**`STORYBOARD.md` + `SCRIPT.md` 已存在，并且用户已批准该方案。

---

## 第 4 步：旁白、时序与字幕 💬

**阅读：** [references/step-4-vo.md](references/step-4-vo.md)

如果第 2 步确定不需要旁白——询问是否需要背景音乐，然后跳到第 5 步。否则：询问用户要使用哪个 TTS 提供商（HeyGen TTS、ElevenLabs 或 Kokoro），生成音频、转写内容，并将时间戳映射到各个节拍。然后询问字幕相关需求。

**门槛：** 满足以下任一条件：(a) 未要求旁白，且故事板中包含手动设置的节拍时序；或 (b) `narration.wav` 和 `transcript.json` 已存在，且节拍时序已根据实际时长更新。

---

## 第 5 步：构建合成内容

**阅读：** `hyperframes` skill（加载它——每条规则都很重要）
**阅读：** [references/step-5-build.md](references/step-5-build.md)

按照故事板（第 3 步）中选定的架构和节奏构建 index.html 与合成内容。子代理在汇报前会针对每个节拍运行 `hyperframes lint` 和 `hyperframes snapshot`。

**门槛：** 主代理已对照 DESIGN.md 和 STORYBOARD.md，从头到尾阅读每个 `compositions/beat-N.html`。各节拍的检查清单位于 [step-5-build.md](references/step-5-build.md)。

---

## 第 6 步：验证与交付

**阅读：** [references/step-6-validate.md](references/step-6-validate.md)

执行 lint、验证，并按照视频时长比例截取快照（公式：`max(beats × 3, ceil(duration_seconds / 2))`），逐一审查。交付前修复所有问题。交付 localhost Studio 项目 URL——仅在用户明确要求时才渲染为 MP4。**仅在交接时**提供该 Studio URL——它是最终且稳定的预览；构建阶段的快照以无头模式生成，因此不要在构建过程中弹出预览。

**交付令自己自豪的作品。** 交接前问问自己：我愿意署上自己的名字，把它发布到社交媒体上吗？如果不愿意，就修复其中的问题。

**门槛：** `npx hyperframes check` 以零错误通过，且最终回复中包含当前有效的 Studio 项目 URL。

---

## 快速参考

### 视频类型

以下是各类视频的典型约束——将其作为起点，而不是固定公式。节拍数量应由内容和旁白决定，而不是由目标范围决定。

| 类型                    | 典型时长 | 时长决定因素    | 旁白             |
| ----------------------- | ---------------- | ------------------ | --------------------- |
| 社交媒体短片（IG/TikTok） | 10–15 秒           | 平台限制     | 可选              |
| 网站导览        | 30–60 秒           | 脚本长度      | 全程旁白        |
| 内容公告    | 15–30 秒           | 内容复杂度 | 全程旁白        |
| 品牌短片              | 20–45 秒           | 音乐曲目        | 可选，以音乐为主 |

（用于_推销_产品的产品演示、功能公告或发布预告应归入 `/product-launch-video`——请参阅顶部的路由说明。）

此表有意不列出节拍数量——它应来自故事板，而不是来自“社交广告 = 3–4 个节拍”这样的规则。复杂产品的社交广告可能需要 5 个时序安排合理的节拍。拥有一个强有力视觉主题的品牌短片可能只需要 3 个。

### 格式

- **横屏**：1920x1080（默认）
- **竖屏**：1080x1920（Instagram Stories、TikTok）
- **方形**：1080x1080（Instagram 动态）

### 参考文件

| 文件                                                                               | 何时阅读                                                                                                                                   |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [step-0-capture.md](references/step-0-capture.md)                                  | 第 0 步——采集并理解品牌和产品，撰写策略优先的网站摘要                                                          |
| [step-1-design.md](references/step-1-design.md)                                    | 第 1 步——撰写 DESIGN.md 品牌速查表（5 个部分，250-350 行；广告牌式社交广告可采用 50 行快速路径）                       |
| [step-2-brief.md](references/step-2-brief.md)                                      | 第 2 步——与用户就信息、叙事弧线和受众达成一致                                                                                   |
| [capabilities.md](references/capabilities.md)                                      | 第 2 步和第 5 步——HyperFrames 功能的完整清单（24 个部分）。制定简报时浏览目录，构建时深入阅读特定部分 |
| [step-3-storyboard.md](references/step-3-storyboard.md)                            | 第 3 步——故事板与脚本（合并进行），并设置用户审核关卡                                                                                  |
| [step-4-vo.md](references/step-4-vo.md)                                            | 第 4 步——选择 TTS 提供商、生成语音并确定时序                                                                                               |
| [step-5-build.md](references/step-5-build.md)                                      | 第 5 步——构建 index.html 和合成内容                                                                                                       |
| [step-6-validate.md](references/step-6-validate.md)                                | 第 6 步——代码检查、验证、快照（根据视频长度调整）和预览                                                                           |
| [techniques.md](../hyperframes/references/techniques.md)                           | 第 3 步和第 5 步——13 种基础动画技术及代码模式（请改编，不要复制粘贴）                                                   |
| [html-in-canvas-patterns.md](../hyperframes/references/html-in-canvas-patterns.md) | 第 5 步——HTML-in-Canvas 效果的完整代码模式（位于 hyperframes skill 中）                                                    |