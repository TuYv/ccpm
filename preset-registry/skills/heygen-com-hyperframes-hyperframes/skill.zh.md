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

HyperFrames **从 HTML 渲染视频**——一个合成作品就是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时间，其动画运行时可进行 seek，其媒体播放由框架负责。完整的创作约定位于 `/hyperframes-core`；在编写合成 HTML 之前请先阅读该文档。

## 1. 从项目状态开始

应用第一个匹配的行；不要评估状态表中靠后的行：

| 状态                                                                                                                         | 操作                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 将现有 Remotion 源代码明确移植到 HyperFrames                                                                      | 阅读 `references/routes/remotion-to-hyperframes.md`，然后直接转到该工作流。跳过意图层。                                                                                           |
| 对现有 HyperFrames 项目的具体操作：检查、诊断、验证、预览、渲染、发布或批量渲染 | 仅执行该操作。跳过意图和工作流路由；加载 `/hyperframes-cli` 以及所需的领域技能。                                                                                      |
| 对现有项目进行具体编辑                                                                                          | 执行该编辑。不要运行意图层。                                                                                                                                                                 |
| 存在 `BRIEF.md`                                                                                                             | 阅读 `workflow` 和 `flow`。执行该工作流；`flow: companion` 始终在 `/general-video` 中执行。不要询问任何 brief 问题。                                                                           |
| 没有 brief，但存在 `hyperframes.json` 或 `STORYBOARD.md`                                                                    | 根据项目文件和已记录的偏好继续执行。从现有产物中推断所属工作流。如果无法唯一确定，则只询问一个仅用于路由的问题；不要运行意图访谈。 |
| 全新创建                                                                                                                | 运行意图层——`references/intent-interview.md`——然后使用第 2 节的表格进行一次路由。                                                |

如果新请求未明确说明主题或输入内容，请在路由之前询问视频的主题。在询问任何内容之前，先检查偏好设置和配方（`references/intent-interview.md`，第 1 步）。`figma.com` 输入或指定的配方会改变信息收集方式，但不会改变路由——访谈中的“Adapt orthogonal inputs”部分会处理这两种情况。

### 保持项目的 CLI 为最新版本

脚手架生成的项目会在其 `package.json` 脚本中固定 `hyperframes@<version>`，以确保渲染结果可复现；该固定版本不会自动更新，并且使用旧版 CLI 的固定版本运行不会显示相关警告。在恢复一个脚本中带有版本固定的项目时，请在首次执行会影响渲染的命令之前探测一次：

```bash
npx hyperframes@latest upgrade --project . --check
```

该探测操作是只读的，并会将固定版本与最新发行版进行比较；请保留显式的 `.`——在较旧的 CLI 版本中，单独使用 `--project` 并在后面跟随另一个标志时，会将该标志作为目录值。如果它报告项目版本落后——或者任何 CLI 输出已经显示了这一点（stderr 提示 `This project pins hyperframes@… (latest …)`，或固定脚本的 `--json` 结果中包含 `_meta.updateAvailable: true`）——请使用 `npx hyperframes@latest upgrade --project .` 应用更新，然后使用 `npx hyperframes check` 进行验证。检查通过表示项目的 compositions 仍能在新版本上通过验证——并不表示渲染输出与旧固定版本逐帧一致——因此成功升级绝不能悄无声息：在本次运行的摘要中注明旧版本和新版本。尚未包含任何 composition 的项目无需验证。如果检查失败，请还原对 `package.json` 的更改，继续使用固定版本，并报告项目继续使用的版本及原因。应根据该信号采取行动，而不是将其转述给用户；绝不要留下未经验证的升级版本。

## 2. 路由新建请求

使用第一个匹配的行。匹配请求所需的**交付物**，而不是顺带提及的单词或文件类型。

| 优先级 | 请求                                                                                                            | 工作流                   |
| -------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 1        | 明确将现有的 Remotion 源移植过来                                                                        | `/remotion-to-hyperframes` |
| 2        | 编写演示文稿、路演幻灯片或可导航的交互式演示文稿                                                   | `/slideshow`               |
| 3        | 为现有的出镜讲话视频添加普通字幕或隐藏式字幕，但不改变视频内容                               | `/embedded-captions`       |
| 4        | 为现有的出镜讲话、采访或播客视频添加设计化图形叠加层，但不改变视频内容 | `/talking-head-recut`      |
| 5        | 根据音乐轨道制作节拍同步视频，不包含旁白或网站录制                                 | `/music-to-video`          |
| 6        | 创建明确较短、无旁白、以动效为主的单元，通常少于 10 秒                                     | `/motion-graphics`         |
| 7        | 根据 PR 引用解释 GitHub 拉取请求或代码变更                                                   | `/pr-to-video`             |
| 8        | 根据 URL 或特定网站的简介，对网站、产品网站、应用或公司进行营销或展示                      | `/product-launch-video`    |
| 9        | 使用虚构视觉内容解释主题、文章或笔记，不包含产品或网站录制                            | `/faceless-explainer`      |
| 10       | 任何其他自定义视频或 composition                                                                              | `/general-video`           |

在最终确定路由之前，读取 `references/routes/<workflow>.md` —— 每个路由对应一个小文件：其中包含规范的输入/输出/触发器契约（在延迟安装的工作流技能就绪之前即可用），以及该路由的访谈入口。如果候选项不满足其契约，请继续路由，而不要强行匹配。只读取匹配路由对应的文件。

### 解决常见歧义

- 简短的动画标题、logo 动效、数据统计动效、图表动效、地图动效或独立的 lower-third，如果没有旁白且运动本身就是信息表达，应归入 `/motion-graphics`。静态标题卡、带旁白的序列、较长的蒙太奇或自定义循环应归入 `/general-video`。
- 明确要求制作简短 motion graphic 时，可以使用 URL、推文、文章或截图作为素材来源。笼统的“根据这个网站制作视频”请求应归入 `/product-launch-video`。
- 带字幕的现有素材应归入 `/embedded-captions`；带有设计化信息卡片的素材应归入 `/talking-head-recut`。对素材进行重新定时、重新排序、重新着色、重新取景或混剪属于自定义编辑，应继续归入 `/general-video`。
- 只有在音乐文件的节拍网格驱动整个作品时，才应选择 `/music-to-video`。作为背景使用的音乐不会覆盖与主题匹配的路由。
- “我想要一个 storyboard”改变的是审阅流程，而不是工作流。在没有其他路由信号时，使用 `/general-video`。一份经过确认的手绘 storyboard 本身可能就是请求的交付物；审阅循环会定义该停止点。
- 专用叙事工作流支持最长约 3 分钟的内容，最适合 30–90 秒左右的作品。对于明显更长的作品，应归入 `/general-video`。时长永远不会覆盖明确指定的端口、deck、字幕、overlay 或音乐驱动型交付物。

## 3. 路由一次，然后退出

对于全新创作，意图层（`references/intent-interview.md`）会运行完整对话流程——记忆、分流、提案轮次、必备项、运行形态、交接——并且**最终写入 `BRIEF.md`。该 brief 是工作流读取的唯一路由产物**；之后不会重新打开此技能或访谈。之后每当被问到“该路由要求什么？”时，都应从 `BRIEF.md` 中作答。

## 4. 安装并进入工作流

在读取所选工作流之前，安装或刷新该工作流及核心领域技能：

```bash
npx hyperframes skills update <workflow-name>
```

使用不带 `/` 的简写名称。如果命令失败，请报告错误；不要凭记忆重建工作流。关于安装的其他所有内容——核心技能与延迟加载技能的划分、`init` 刷新的内容、诊断、CI 退出选项以及无 CLI 备用方案——均位于 `references/skill-lifecycle.md` 中。

## 5. 按需加载领域技能

| 需求                                                                                                                | 技能                    |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 构图结构、时序属性、轨道、变量、确定性                                            | `/hyperframes-core`      |
| 动作规则、场景蓝图、转场、运行时适配器                                                       | `/hyperframes-animation` |
| 可安全 seek 的 GSAP、CSS、Anime.js、WAAPI、FLIP、路径、遮罩、SVG、3D 关键帧，或 `hyperframes keyframes` 诊断 | `/hyperframes-keyframes` |
| 设计规范、概念、配色、字体、旁白、节拍规划                                                | `/hyperframes-creative`  |
| 图片、图标、logo、音频、字幕、调色、LUT、可复用媒体                                                 | `/media-use`             |
| 旁白切分、音效链或轨道上的自动化包络                                            | `/hyperframes-audio`     |
| Init、lint、check、快照、比较、批量渲染、Studio、渲染、发布或诊断                        | `/hyperframes-cli`       |
| 注册表区块和组件                                                                                      | `/hyperframes-registry`  |
| Figma 素材、令牌、组件，或作为重建动作的 storyboard 帧                                      | `/figma`                 |

创作者编辑短语属于跨域请求。加载匹配行中列出的每个 skill：

| 创作者请求                                                                                   | 必需领域                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “剪辑这段素材”、硬切、修剪、拼接、重新排序，或使用源素材范围                        | `/general-video` + `/hyperframes-core`；core 负责 `data-start`、`data-duration`、`data-media-start` 以及轨道布局。                                                            |
| 在这里放大、推入 / 拉出、平滑的多状态缩放或重新构图、Ken Burns，或摄像机移动 | `/general-video` + `/hyperframes-core` + `/hyperframes-keyframes`；为内部视觉 / 裁剪包装器添加动画，而不是为有时间控制的片段添加动画。                                                     |
| 匹配剪辑或甩镜头摄像机转场                                                           | `/general-video` + `/hyperframes-animation` + `/hyperframes-keyframes` + `/hyperframes-registry`；先搜索 / 安装转场原语，再手动编写。                    |
| 淡入淡出、交叉淡化、轨道增益 / 音量、自动化、闪避 / 挖空，或音频效果                      | `/general-video` + `/hyperframes-core` + `/hyperframes-audio`；core 负责放置片段，音频负责混合已放置的轨道。                                                                      |
| 将剪辑与摄像机移动或混音结合起来的画面和声音编辑                            | 有视觉移动时使用 `/general-video` + `/hyperframes-core` + `/hyperframes-keyframes`；声音发生淡化、混合、闪避、自动化或处理时使用 `/hyperframes-audio`。 |
| 获取或生成媒体，或预处理不受支持的变速渐变 / 源素材中途冻结               | `/media-use`；仅负责素材获取 / 生成 / 预处理，绝不负责已放置轨道的混音。                                                                                                  |

恒定的 `data-playback-rate` 对画面和保持音调的声音来说是渲染安全的。它不会让源素材变速渐变支持关键帧；请预处理变速渐变。
对于可复制的编辑契约，请加载 `/hyperframes-core` → `references/creator-editing-recipes.md`。

关于摄影媒体外观或行为的宽泛反馈同样会路由到
`/media-use`，即使用户从未说“色彩分级”或“效果”：修复过暗 / 平淡 / 无趣的素材、为片段添加风格、隐藏人脸，或改善媒体呈现。编辑处理方式前请阅读
`../media-use/references/media-treatments.md`；它规定如何处理素材，而不是是否可以使用媒体。
不要用通用 LUT、CSS 滤镜 / 叠加层或不透明度补间来替代现有的规范处理原语。将仅涉及文本 / 布局 / 动作的编辑保留在其所属领域。
在包含重要摄影媒体的构建过程中，请在最终质量检查中加入一次有依据的媒体润色扫描；保留合适的媒体不变也是有效结果。

领域技能从不负责端到端交付。仅加载当前工作流所需的内容。