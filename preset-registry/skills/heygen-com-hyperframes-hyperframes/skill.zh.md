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

HyperFrames **从 HTML 渲染视频**——合成作品是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时序，其动画运行时支持定位查找，其媒体播放由框架管理。完整的创作约定位于 `/hyperframes-core`；编写合成 HTML 前请先阅读该约定。

## 1. 从项目状态开始

应用第一个匹配的行；不要再判断其下方的状态行：

| 状态                                                                                                                         | 操作                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 明确将现有 Remotion 源代码移植到 HyperFrames                                                                      | 阅读 `references/routes/remotion-to-hyperframes.md`，然后直接进入该工作流。跳过意图层。                                                                                           |
| 对现有 HyperFrames 项目执行特定操作：检查、诊断、验证、预览、渲染、发布或批量渲染 | 仅执行该操作。跳过意图和工作流路由；加载 `/hyperframes-cli` 以及任何所需的领域技能。                                                                                      |
| 对现有项目进行特定编辑                                                                                          | 执行该编辑。不要运行意图层。                                                                                                                                                                 |
| `BRIEF.md` 存在                                                                                                             | 读取 `workflow` 和 `flow`。执行该工作流；`flow: companion` 始终在 `/general-video` 中执行。不要询问任何简报问题。                                                                           |
| 没有简报，但 `hyperframes.json` 或 `STORYBOARD.md` 存在                                                                    | 从项目文件和已记录的偏好设置继续。根据现有产物推断所属工作流。如果无法唯一确定，则只询问一个路由问题；不要运行意图访谈。 |
| 全新创作                                                                                                                | 运行意图层——`references/intent-interview.md`——然后使用第 2 节的表格进行一次路由。                                                                                                                |

如果一个新请求没有明确主题或输入，应先询问视频的内容，再进行路由。提出任何问题之前，先检查偏好设置和配方（`references/intent-interview.md`，第 1 步）。`figma.com` 输入或具名配方只会改变信息收集方式，而不会改变路由——访谈中的“适配正交输入”部分会处理这两种情况。

### 使项目的 CLI 保持最新

脚手架生成的项目会在其 `package.json` 脚本中固定 `hyperframes@<version>`，以确保渲染结果可复现；该固定版本不会自行更新，而且使用较旧 CLI 固定版本运行时也不会显示相关警告。恢复处理脚本中包含固定版本的项目时，应在执行第一个会影响渲染的命令之前检查一次：

```bash
npx hyperframes@latest upgrade --project . --check
```

该检查是只读的，会将固定版本与最新版本进行比较并报告结果；请保留显式的 `.`——在较旧的 CLI 版本中，如果只写 `--project`，其后的另一个标志会被当作目录值使用。当检查报告项目版本落后时——或者任何 CLI 输出已经表明这一点时（stderr 提示 `This project pins hyperframes@… (latest …)`，或固定版本脚本的 `--json` 结果中出现 `_meta.updateAvailable: true`）——使用 `npx hyperframes@latest upgrade --project .` 执行升级，然后使用 `npx hyperframes check` 验证。检查通过表示项目的合成在新版本上仍能通过验证，而不表示渲染输出与旧固定版本逐帧完全一致，因此成功升级绝不能不作说明：应在本次运行的摘要中写明旧版本和新版本。尚无合成的项目无需验证。如果检查失败，应还原对 `package.json` 的更改，继续使用固定版本，并报告项目继续使用哪个版本以及原因。应根据信号直接采取行动，而不是将其转述给用户；绝不能让升级后的固定版本处于未验证状态。

## 2. 对新建请求进行路由

使用第一个匹配的行。应匹配请求的**交付成果**，而不是顺带提及的某个词语或文件类型。

| 优先级 | 请求                                                                                                         | 工作流                     |
| ------ | ------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 1      | 明确要求移植现有的 Remotion 源代码                                                                           | `/remotion-to-hyperframes` |
| 2      | 制作演示文稿、路演幻灯片或可导航的交互式幻灯片                                                              | `/slideshow`               |
| 3      | 为现有的口播镜头添加纯字幕，而不更改原始镜头                                                                | `/embedded-captions`       |
| 4      | 为现有的口播、访谈或播客镜头添加经过设计的图形叠加层，而不更改原始镜头                                      | `/talking-head-recut`      |
| 5      | 根据音乐音轨制作与节拍同步的视频，不包含旁白或网站捕获内容                                                  | `/music-to-video`          |
| 6      | 创建明确要求简短、无旁白且以动态效果为主的单元，通常短于 10 秒                                             | `/motion-graphics`         |
| 7      | 根据 PR 引用解释 GitHub 拉取请求或代码变更                                                                  | `/pr-to-video`             |
| 8      | 根据 URL 或针对特定网站的简报，对网站、产品网站、应用或公司进行营销或展示                                   | `/product-launch-video`    |
| 9      | 使用虚构的视觉内容解释某个主题、文章或笔记，不包含产品或网站捕获内容                                        | `/faceless-explainer`      |
| 10     | 任何其他自定义视频或合成                                                                                     | `/general-video`           |

在最终确定路由之前，请阅读 `references/routes/<workflow>.md`——每条路由对应一个小文件：其中包含规范的输入/输出/触发条件契约（在延迟安装的工作流技能尚未就绪前即可使用），以及该路由的访谈入口。如果候选项不满足其契约，请继续路由，而不是强行匹配。只读取匹配路由对应的文件。

### 解决常见歧义

- 当简短的动画标题、徽标片头、数据亮点、图表亮点、地图亮点或独立下三分之一字幕没有旁白，且动态效果本身就是所要传达的信息时，应路由至 `/motion-graphics`。静态标题卡、有旁白的序列、较长的蒙太奇或自定义循环应路由至 `/general-video`。
- 明确要求简短的动态图形时，可以使用 URL、推文、文章或截图作为素材来源。笼统的“根据这个网站制作视频”请求应路由至 `/product-launch-video`。
- 为现有素材添加字幕应路由至 `/embedded-captions`；为素材添加经过设计的信息卡片应路由至 `/talking-head-recut`。调整素材的时间、顺序、颜色、画幅或对其进行混剪属于自定义编辑，应回退至 `/general-video`。
- 仅当音乐文件的节拍网格驱动整个作品时，才选择 `/music-to-video`。作为背景音乐使用的音乐不会覆盖与主题匹配的路由。
- “我想要一个故事板”改变的是审核流程，而不是工作流。如果没有其他路由信号，请使用 `/general-video`。已确认的手绘故事板本身也可以是请求的交付物；审核循环会定义该停止点。
- 专用叙事工作流支持最长约 3 分钟的内容，并且最适合 30–90 秒的作品。明显更长的作品应路由至 `/general-video`。时长绝不会覆盖明确指定的端口、幻灯片、字幕、叠加层或音乐驱动型交付物。

## 3. 仅路由一次，然后退出

对于全新创作，意图层（`references/intent-interview.md`）负责运行完整对话——记忆、分诊、提案轮次、必备项、运行形式、交接——并且**最终写入 `BRIEF.md`。简报是工作流读取的唯一路由产物**；之后不会再次打开此技能或访谈。后续所有“该路由有什么要求？”之类的问题，都应根据 `BRIEF.md` 回答。

## 4. 安装并进入工作流

在读取所选工作流之前，请安装或刷新该工作流以及核心领域技能：

```bash
npx hyperframes skills update <workflow-name>
```

请使用不带 `/` 的纯名称。如果命令失败，请直接呈现错误；不要凭记忆重建工作流。有关安装的其他所有内容——核心与延迟安装的拆分、`init` 会刷新哪些内容、诊断、CI 退出机制以及无 CLI 时的回退方案——均位于 `references/skill-lifecycle.md`。

## 5. 按需加载领域技能

| 需求                                                                                                                | 技能                     |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 合成结构、时间属性、轨道、变量、确定性                                                                              | `/hyperframes-core`      |
| 动效规则、场景蓝图、转场、运行时适配器                                                                              | `/hyperframes-animation` |
| 可安全跳转的 GSAP、CSS、Anime.js、WAAPI、FLIP、路径、蒙版、SVG、3D 关键帧，或 `hyperframes keyframes` 诊断         | `/hyperframes-keyframes` |
| 设计规范、概念、调色板、字体排印、旁白、节拍规划                                                                    | `/hyperframes-creative`  |
| 图像、图标、徽标、音频、字幕、调色、LUT、可复用媒体                                                                 | `/media-use`             |
| 旁白避让、音频效果链或轨道上的自动化包络                                                                            | `/hyperframes-audio`     |
| Init、lint、check、快照、比较、批量渲染、Studio、渲染、发布或诊断                                                  | `/hyperframes-cli`       |
| 注册表区块和组件                                                                                                    | `/hyperframes-registry`  |
| 作为重建动效使用的 Figma 资源、令牌、组件或故事板帧                                                                 | `/figma`                 |

关于摄影媒体外观或表现方式的宽泛反馈也应归入
`/media-use`，即使用户从未提及“调色”或“效果”：修复
昏暗、平淡或乏味的素材，为剪辑添加风格化效果，遮挡人脸，或改进媒体的
揭示效果。在编辑处理方式之前，请阅读 `../media-use/references/media-treatments.md`；
它规定了应如何处理素材，而不决定是否可以使用媒体。
不要使用通用 LUT、CSS 滤镜/叠加层或不透明度补间来替代
现有的规范处理原语。纯文本、布局或动效编辑应保留在
各自所属的领域中。
在构建包含重要摄影媒体的内容时，请在最终质量检查中加入一次有依据的
媒体润色检查；不对适合的媒体进行更改也是一种有效结果。

领域技能绝不负责端到端可交付成果。只加载当前工作流所需的内容。