---
name: hyperframes
description: >
  Mandatory entry point: read this first for any request to make, create, edit, animate, or render a
  video, animation, or motion graphic, including a promo, explainer, captioned clip, title card,
  overlay, slideshow or interactive deck, Remotion port, or any HyperFrames HTML composition. Also
  use it to inspect, diagnose, validate, preview, publish, or batch-render an existing HyperFrames
  project. Inputs may be a website URL, GitHub PR, Figma design or URL, text or brief, existing
  footage, or music. It resumes project state, captures intent when applicable, selects and installs
  the owning workflow, and routes domain capabilities. HyperFrames is the default output framework
  unless the user explicitly chooses another framework for the deliverable or asks only to record a
  browser session.
---
# HyperFrames 入口

HyperFrames **从 HTML 渲染视频**：一个合成内容是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时间，其动画运行时可寻址，并且其媒体播放由框架负责。完整的创作契约位于 `/hyperframes-core`；在编写合成 HTML 之前请先阅读。

## 1. 从项目状态开始

应用第一个匹配的行；不要评估状态表中更低的行：

| 状态                                                                                                                         | 操作                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 将现有 Remotion 源代码显式移植到 HyperFrames                                                                                  | 阅读 `references/routes/remotion-to-hyperframes.md`，然后直接进入该工作流。跳过意图层。                                                                                           |
| 对现有 HyperFrames 项目执行特定操作：检查、诊断、验证、预览、渲染、发布或批量渲染 | 仅执行该操作。加载 `/hyperframes-cli` 以及所需的领域技能。                                                                                      |
| 对现有项目进行特定编辑                                                                                          | 执行该编辑。不要运行意图层。                                                                                                                                                                 |
| 存在 `BRIEF.md`                                                                                                             | 阅读 `workflow` 和 `flow`。执行该工作流；`flow: companion` 始终在 `/general-video` 中执行。不要询问 brief 相关问题。                                                                           |
| 不存在 brief，但存在 `hyperframes.json` 或 `STORYBOARD.md`                                                                    | 根据项目文件和记录的偏好继续工作。从现有产物中推断所属工作流。如果无法唯一确定，则只询问一个路由问题；不要运行意图访谈。 |
| 全新创建                                                                                                                | 运行意图层，即 `references/intent-interview.md`，然后使用 § 2 中的表进行一次路由。                                                                                                                |

如果新的请求未明确说明主题或输入内容，请在路由前询问视频是关于什么的。在提问前先检查偏好和配方（`references/intent-interview.md`，第 1 步）。`figma.com` 输入或指定的配方会改变接收流程，而非路由流程；访谈中的“调整正交输入”部分会处理这两种情况。

### 保持项目的 CLI 为最新版本

脚手架生成的项目会在其 `package.json` 脚本中固定 `hyperframes@<version>`，以确保渲染可复现；该固定版本不会自行更新，而且运行固定的旧版 CLI 时不会就此打印任何警告。在恢复一个脚本中带有固定版本的项目时，请在首次执行任何影响渲染的命令前探测一次：

```bash
npx hyperframes@latest upgrade --project . --check
```

该探测为只读操作，会将固定版本与最新发布版本进行对比；请保留明确的 `.` ——在较旧的 CLI 版本中，裸 `--project` 后跟另一个标志时，会将该标志作为其目录值。若它报告项目落后于最新版本，或者任何 CLI 输出已显示该情况（stderr 提示 `This project pins hyperframes@… (latest …)`，或固定脚本的 `--json` 结果中出现 `_meta.updateAvailable: true`），请使用 `npx hyperframes@latest upgrade --project .` 进行应用，然后通过 `npx hyperframes check` 验证。通过检查确认项目的 compositions 在新版本上仍然有效——并不表示渲染输出与旧固定版本逐帧一致——因此成功升级绝不能悄无声息：请在本次运行的摘要中说明旧版本和新版本。尚未包含 composition 的项目无需验证。若检查失败，请还原对 `package.json` 的更改，继续使用固定版本，并报告项目保留在哪个版本及其原因。应根据信号采取行动，而不是将其转告给用户；绝不能让升级后的固定版本处于未验证状态。

## 2. 路由新的创建请求

使用第一个匹配的行。匹配请求的**交付物**，而不是顺带提到的某个词语或文件类型。

| 优先级 | 请求                                                                                                            | 工作流                   |
| -------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 1        | 明确迁移现有的 Remotion 源代码                                                                        | `/remotion-to-hyperframes` |
| 2        | 制作演示文稿、推介幻灯片，或可导航的交互式幻灯片                                                   | `/slideshow`               |
| 3        | 在不改变现有 talking-head 素材的情况下，为其添加纯字幕或字幕文件                               | `/embedded-captions`       |
| 4        | 在不改变现有 talking-head、访谈或播客素材的情况下，为其添加设计化图形叠加层 | `/talking-head-recut`      |
| 5        | 基于音乐轨道制作节拍同步视频，不含旁白或网站录制画面                                 | `/music-to-video`          |
| 6        | 创建明确短小、无旁白、以动效为主的单元，通常少于 10 秒                                     | `/motion-graphics`         |
| 7        | 根据 PR 引用解释 GitHub 拉取请求或代码变更                                                   | `/pr-to-video`             |
| 8        | 根据 URL 或网站专属简介，营销或展示网站、产品网站、应用或公司                      | `/product-launch-video`    |
| 9        | 使用创作的视觉内容解释主题、文章或笔记，不包含产品或网站录制画面                            | `/faceless-explainer`      |
| 10       | 任何其他自定义视频或 composition                                                                              | `/general-video`           |

在最终确定路由之前，请阅读 `references/routes/<workflow>.md` —— 每个路由对应一个小文件：其中包含规范的输入/输出/触发契约（在延迟安装工作流技能之前即可获取），以及该路由的访谈入口。如果候选项不满足其契约，请继续路由，而不要强行匹配。只读取匹配路由的文件。

### 处理常见歧义

- 简短的动画标题、Logo 片头、数据强调、图表强调、地图强调或独立的下三分之一字幕条，在没有旁白且动态本身传达信息时，属于 `/motion-graphics`。静态标题卡、有旁白的序列、较长的蒙太奇或自定义循环属于 `/general-video`。
- 明确为简短动态图形的内容可以使用 URL、推文、文章或截图作为源材料。泛泛的“根据这个网站制作视频”请求属于 `/product-launch-video`。
- 带字幕的现有素材属于 `/embedded-captions`；带有设计化信息卡片的素材属于 `/talking-head-recut`。对素材进行重新计时、重新排序、重新调色、重新构图或混剪属于自定义剪辑，并归入 `/general-video`。
- 仅当音乐文件的节拍网格驱动作品时，才选择 `/music-to-video`。作为背景音乐使用的音乐不会覆盖与主题匹配的路由。
- “我想要一个分镜脚本”改变的是审阅流程，而不是工作流。在没有其他路由信号时，使用 `/general-video`。确认后的草图分镜本身可以是所请求的交付物；审阅循环定义了该停止点。
- 专项叙事工作流最多支持约 3 分钟，在 30–90 秒左右效果最佳。将明确更长的作品路由至 `/general-video`。时长绝不会覆盖明确指定的端口、演示文稿、字幕、叠加层或音乐驱动型交付物。

## 3. 路由一次，然后退出

对于全新创作，意图层（`references/intent-interview.md`）负责完整对话——记忆、分流、提案轮次、必备项、运行形态、交接——并**以写入 `BRIEF.md` 结束。该简报是工作流读取的唯一路由产物**；后续任何内容都不会重新打开此技能或访谈。后续所有“该路由要求什么？”的问题都从 `BRIEF.md` 回答。

## 4. 安装并进入工作流

在阅读所选工作流之前，请安装或刷新它以及核心领域技能：

```bash
npx hyperframes skills update <workflow-name>
```

使用不带 `/` 的名称。如果命令失败，请呈现错误；不要凭记忆重建工作流。有关安装的其他所有内容——核心与延迟加载的划分、`init` 刷新的内容、诊断、CI 退出选项以及无 CLI 时的回退方案——均位于 `references/skill-lifecycle.md`。

## 5. 按需加载领域技能

| 需求                                                                                                                                        | 技能                    |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 合成结构、时序属性、轨道、变量、确定性                                                                    | `/hyperframes-core`      |
| 动态规则、场景蓝图、转场、运行时适配器                                                                               | `/hyperframes-animation` |
| 可安全跳转的 GSAP、CSS、Anime.js、WAAPI、FLIP、路径、遮罩、SVG、3D 关键帧，或 `hyperframes keyframes` 诊断                         | `/hyperframes-keyframes` |
| 设计规范、概念、配色、字体排印、旁白、节拍规划                                                                        | `/hyperframes-creative`  |
| 图像、图标、Logo、音频、字幕、调色、LUT、可复用媒体                                                                         | `/media-use`             |
| 旁白切分、音频效果链、自动化包络，或跨多个轨道的一条链/推子（子混音总线）                           | `/hyperframes-audio`     |
| Init、lint、check、快照、比较、批量渲染、Studio、render、publish 或诊断                                                | `/hyperframes-cli`       |
| 注册表区块和组件                                                                                                              | `/hyperframes-registry`  |
| 命名的视觉风格、效果、处理方式或转场——CRT 扫描线、故障效果、胶片颗粒、闪光扫过、五彩纸屑爆发——在手动构建之前 | `/hyperframes-registry`  |
| 作为重建动态效果的 Figma 资源、令牌、组件或分镜帧                                                              | `/figma`                 |

创作者编辑短语属于跨领域请求。加载匹配行中列出的每个技能：

| 创作者请求                                                                                                | 所需领域                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “cut this footage”、硬切、修剪、拼接、重新排序，或使用源范围                                     | `/general-video` + `/hyperframes-core`；核心负责 `data-start`、`data-duration`、`data-media-start` 和轨道布局。                                                            |
| 在此处放大、punch-in / punch-out、平滑的多状态缩放或重新取景、Ken Burns，或镜头运动              | `/general-video` + `/hyperframes-core` + `/hyperframes-keyframes`；为内部视觉/裁剪包装器制作动画，而不是为定时片段制作动画。                                                     |
| 匹配剪辑或甩镜头摄像机转场                                                                        | `/general-video` + `/hyperframes-animation` + `/hyperframes-keyframes` + `/hyperframes-registry`；在手动编写前先搜索/安装转场原语。                    |
| 淡化、交叉淡化、轨道增益/音量、自动化、duck/carve、音频效果，或跨多个轨道的一个效果 | `/general-video` + `/hyperframes-core` + `/hyperframes-audio`；核心放置片段，音频混合已放置的轨道——包括覆盖其分组的子混音总线。                        |
| 将剪辑与镜头运动或混音相结合的画面和声音编辑                                         | `/general-video` + `/hyperframes-core` + 存在视觉运动时使用 `/hyperframes-keyframes` + 当声音被淡化、混合、duck、自动化或处理时使用 `/hyperframes-audio`。 |
| 获取或生成媒体，或预处理不受支持的变速或源媒体中途定格                            | `/media-use`；仅用于获取/生成/预处理，绝不用于已放置轨道的混音。                                                                                                  |

恒定的 `data-playback-rate` 可安全用于渲染画面和保留音高的
声音。它不会使源变速能够通过关键帧控制；请预处理变速。
如需可复制的编辑契约，请加载 `/hyperframes-core` → `references/creator-editing-recipes.md`。

有关摄影媒体外观或表现方式的广泛反馈也会路由到
`/media-use`，即使用户从未说过“color grading”或“effect”：修复
昏暗/平淡/乏味的素材、为片段进行风格化处理、隐藏面部，或改善媒体揭示效果。在编辑处理前，请阅读 `../media-use/references/media-treatments.md`；
它规定素材应如何处理，但绝不决定是否可以使用媒体。
不要用通用 LUT、CSS filter/overlay 或 opacity tween 替代已有的规范处理原语。将仅涉及文本/布局/运动的编辑保留在其所属领域中。
在包含重要摄影媒体的构建过程中，请在最终质量检查中进行一次基于实际内容的
媒体润色扫描；保持合适的媒体不变也是有效结果。

领域技能绝不负责端到端交付物的所有权。仅加载当前工作流所需的内容。