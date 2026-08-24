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
# HyperFrames 入口点

HyperFrames **从 HTML 渲染视频**——合成内容是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时间安排，其动画运行时支持定位跳转，其媒体播放由框架负责控制。完整的创作约定位于 `/hyperframes-core`；在编写合成 HTML 之前，请先阅读该文档。

## 1. 从项目状态开始

应用第一个匹配的行；不要评估下方的状态行：

| 状态                                                                                                                          | 操作                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 明确将现有 Remotion 源代码移植到 HyperFrames                                                                                  | 阅读 `references/routes/remotion-to-hyperframes.md`，然后直接转到该工作流。跳过意图层。                                                                                                                     |
| 对现有 HyperFrames 项目执行特定操作：检查、诊断、验证、预览、渲染、发布或批量渲染                                            | 仅执行该操作。跳过意图和工作流路由；加载 `/hyperframes-cli` 以及所需的领域技能。                                                                                                                            |
| 对现有项目进行特定编辑                                                                                                        | 执行该编辑。不要运行意图层。                                                                                                                                                                                |
| 存在 `BRIEF.md`                                                                                                               | 读取 `workflow` 和 `flow`。执行该工作流；`flow: companion` 始终在 `/general-video` 中执行。不要询问任何简报问题。                                                                                           |
| 没有简报，但存在 `hyperframes.json` 或 `STORYBOARD.md`                                                                        | 从项目文件和已记录的偏好继续。根据现有产物推断所属工作流。如果无法唯一确定，则只询问一个路由问题；不要运行意图访谈。                                                                                        |
| 全新创作                                                                                                                      | 运行意图层——`references/intent-interview.md`——然后使用第 2 节中的表格进行一次路由。                                                                                                                         |

如果一个全新的请求没有明确主题或输入，请在路由前询问视频是关于什么的。在提出任何问题之前，先检查偏好和方案（`references/intent-interview.md`，第 1 步）。`figma.com` 输入或指定的方案只会改变信息收集方式，而不会改变路由——访谈中的“适配正交输入”部分会处理这两种情况。

### 保持项目的 CLI 为最新版本

脚手架生成的项目会在其 `package.json` 脚本中固定 `hyperframes@<version>`，以确保渲染结果可复现；固定的版本不会自行更新，而且使用旧版 CLI 的固定版本运行时不会对此发出警告。恢复一个脚本中带有固定版本的项目时，请在执行第一个会影响渲染的命令之前探测一次：

```bash
npx hyperframes@latest upgrade --project . --check
```

该探测是只读的，会将固定版本与最新版本进行比较并报告结果；请保留显式的 `.`——在旧版 CLI 中，如果仅使用 `--project`，后面紧跟的另一个标志会被当作目录值。当探测报告项目版本落后时——或者任何 CLI 输出已表明这一点（stderr 通知 `This project pins hyperframes@… (latest …)`，或固定版本脚本的 `--json` 结果中出现 `_meta.updateAvailable: true`）——请使用 `npx hyperframes@latest upgrade --project .` 执行升级，然后通过 `npx hyperframes check` 进行验证。检查通过表示项目的合成在新版本上仍能通过验证——并不表示渲染输出与旧固定版本逐帧完全一致——因此成功升级绝不能悄无声息：请在本次运行的摘要中注明旧版本和新版本。尚无合成的项目无需验证。如果检查失败，请还原对 `package.json` 的更改，继续使用固定版本，并报告项目继续使用哪个版本以及原因。请根据信号采取行动，而不是仅将其转告给用户；绝不能让升级后的固定版本处于未验证状态。

## 2. 路由全新创作请求

使用第一个匹配的行。匹配请求的**交付物**，而不是顺带提到的某个词语或文件类型。

| 优先级 | 请求                                                                                               | 工作流                     |
| ------ | -------------------------------------------------------------------------------------------------- | -------------------------- |
| 1      | 明确要求移植现有的 Remotion 源代码                                                                 | `/remotion-to-hyperframes` |
| 2      | 创作演示文稿、推介幻灯片或可导航的交互式幻灯片                                                    | `/slideshow`               |
| 3      | 为现有的真人讲解视频添加普通的内嵌字幕或字幕，且不更改视频内容                                     | `/embedded-captions`       |
| 4      | 为现有的真人讲解、访谈或播客视频添加经过设计的图形叠加层，且不更改原始视频素材                     | `/talking-head-recut`      |
| 5      | 根据音乐轨道制作与节拍同步的视频，不包含旁白或网站捕获                                             | `/music-to-video`          |
| 6      | 创建明确要求时长短、无旁白、以动效为主的单元，通常不超过 10 秒                                    | `/motion-graphics`         |
| 7      | 根据 PR 引用解释 GitHub 拉取请求或代码更改                                                         | `/pr-to-video`             |
| 8      | 根据 URL 或网站专属简报，营销或展示网站、产品网站、应用或公司                                      | `/product-launch-video`    |
| 9      | 使用创作的视觉内容解释某个主题、文章或笔记，且不包含产品或网站捕获                                 | `/faceless-explainer`      |
| 10     | 任何其他自定义视频或合成                                                                           | `/general-video`           |

在最终确定路由之前，请阅读 `references/routes/<workflow>.md`——每个路由对应一个小文件，其中包含规范的输入/输出/触发契约（在延迟安装的工作流技能就绪之前即可使用），以及该路由的访谈入口。如果候选项不满足其契约，请继续路由，而不是强行匹配。只读取匹配路由的文件。

### 解决常见歧义

- 当简短的动画标题、logo 闪现、数据展示、图表展示、地图展示或独立字幕条没有旁白，且动态本身就是信息时，应使用 `/motion-graphics`。静态标题卡、有旁白的序列、较长的蒙太奇或自定义循环应使用 `/general-video`。
- 明确要求的简短动态图形可以使用 URL、推文、文章或截图作为素材来源。泛泛的“根据这个网站制作视频”请求应使用 `/product-launch-video`。
- 为现有素材添加字幕应路由到 `/embedded-captions`；为素材添加经过设计的信息卡片应路由到 `/talking-head-recut`。调整素材时序、重新排序、重新着色、重新构图或重新混剪属于自定义编辑，应回退到 `/general-video`。
- 只有当音乐文件的节拍网格驱动整个作品时，才选择 `/music-to-video`。作为铺底音乐使用的音乐不会覆盖与主题匹配的路由。
- “我想要一个分镜脚本”改变的是审核流程，而不是工作流。如果没有其他路由信号，请使用 `/general-video`。已确认的手绘分镜板本身可能就是所需的交付物；审核循环会定义该停止点。
- 专门的叙事工作流支持最长约 3 分钟的内容，并且最适合 30–90 秒左右的作品。明显更长的作品应路由到 `/general-video`。时长绝不会覆盖明确的端口、演示文稿、字幕、叠加层或音乐驱动型交付物。

## 3. 只路由一次，然后退出

对于全新创作，意图层（`references/intent-interview.md`）负责运行完整对话——记忆、分类、提案轮次、必备项、运行形式、移交——并且**最终写入 `BRIEF.md`。简报是工作流读取的唯一路由产物**；此后的任何环节都不会重新打开此技能或访谈。后续所有“该路由有哪些要求？”的问题，都应根据 `BRIEF.md` 回答。

## 4. 安装并进入工作流

在读取选定的工作流之前，安装或刷新该工作流及核心领域技能：

```bash
npx hyperframes skills update <workflow-name>
```

使用不带 `/` 的名称。如果命令失败，请直接显示错误；不要根据记忆重建工作流。有关安装的其他所有内容——核心与延迟安装的拆分方式、`init` 会刷新哪些内容、诊断、CI 选择退出以及无 CLI 时的回退方案——均位于 `references/skill-lifecycle.md`。

## 5. 按需加载领域技能

| 需求                                                                                                                | 技能                     |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 合成结构、计时属性、轨道、变量、确定性                                            | `/hyperframes-core`      |
| 动效规则、场景蓝图、转场、运行时适配器                                                       | `/hyperframes-animation` |
| 可安全跳转的 GSAP、CSS、Anime.js、WAAPI、FLIP、路径、蒙版、SVG、3D 关键帧，或 `hyperframes keyframes` 诊断 | `/hyperframes-keyframes` |
| 设计规范、概念、调色板、字体排印、旁白、节拍规划                                                | `/hyperframes-creative`  |
| 图像、图标、logo、音频、字幕、调色、LUT、可复用媒体                                                 | `/media-use`             |
| 旁白空间预留、音频效果链、自动化包络，或跨多个轨道使用同一效果链/推子（子混音总线）   | `/hyperframes-audio`     |
| 初始化、代码检查、校验、快照、比较、批量渲染、Studio、渲染、发布或诊断                        | `/hyperframes-cli`       |
| 注册表区块和组件                                                                                      | `/hyperframes-registry`  |
| Figma 资源、令牌、组件，或重建为动态内容的分镜帧                                      | `/figma`                 |

创作者的编辑表述属于跨领域请求。请加载匹配行中列出的所有技能：

| 创作者请求                                                                                                     | 所需领域                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “剪切这段素材”、硬切、修剪、拼接、重新排序或使用一段源素材范围                                                 | `/general-video` + `/hyperframes-core`；core 负责 `data-start`、`data-duration`、`data-media-start` 和轨道布局。                                                                   |
| 在此处放大、快速推近 / 拉远、平滑的多状态缩放或重新构图、Ken Burns 效果或镜头运动                              | `/general-video` + `/hyperframes-core` + `/hyperframes-keyframes`；对内部视觉元素 / 裁剪包装器设置动画，而不是对定时剪辑设置动画。                                                 |
| 匹配剪辑或甩镜镜头转场                                                                                         | `/general-video` + `/hyperframes-animation` + `/hyperframes-keyframes` + `/hyperframes-registry`；先搜索 / 安装转场基元，再手动编写。                                             |
| 淡入淡出、交叉淡化、轨道增益 / 音量、自动化、闪避 / 挖槽、音频效果，或对多条轨道应用同一效果                   | `/general-video` + `/hyperframes-core` + `/hyperframes-audio`；core 放置剪辑，audio 对已放置的轨道进行混音——包括在一组轨道上使用子混音总线。                                      |
| 将剪切与镜头运动或混音结合起来的画面和声音编辑                                                                 | `/general-video` + `/hyperframes-core`；有视觉运动时还需 `/hyperframes-keyframes`；声音需要淡入淡出、混音、闪避、自动化或处理时还需 `/hyperframes-audio`。                          |
| 获取或生成媒体，或对不受支持的速度渐变 / 源素材中段定格进行预处理                                             | `/media-use`；仅用于获取 / 生成 / 预处理，绝不用于已放置轨道的混音。                                                                                                             |

恒定的 `data-playback-rate` 对画面和保持音高的声音而言可安全渲染。
它无法让源素材速度渐变支持关键帧；请预处理速度渐变。
如需可复制的编辑约定，请加载 `/hyperframes-core` → `references/creator-editing-recipes.md`。

关于摄影媒体外观或表现方式的宽泛反馈也应路由至
`/media-use`，即使用户从未提到“调色”或“效果”：修复
过暗 / 平淡 / 乏味的素材、为剪辑赋予风格、隐藏人脸，或改善媒体的
揭示效果。在编辑处理方式之前，请阅读 `../media-use/references/media-treatments.md`；
它规定如何处理素材，而不规定是否可以使用媒体。
不要用通用 LUT、CSS 滤镜 / 叠加层或不透明度补间动画来替代
现有的规范处理基元。仅涉及文本 / 布局 / 动效的编辑应保留在
其所属领域中。
在包含重要摄影媒体的构建过程中，请在最终质量检查中加入一次基于实际内容的
媒体润色扫描；不改动本就合适的媒体也是有效结果。

领域 Skill 绝不负责端到端的交付成果。仅加载当前工作流所需的内容。