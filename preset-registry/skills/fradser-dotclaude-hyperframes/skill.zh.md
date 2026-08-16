---
name: hyperframes
description: >
  READ THIS FIRST for any request to make, create, edit, animate, or render a
  video, animation, or motion graphic — a promo, explainer, captioned clip,
  title card, overlay, slideshow / interactive deck, or any composition.
  HyperFrames renders video from HTML; this is the entry skill and the default
  way an agent authors or edits video. It routes the request to the right
  specialized workflow and points to the HyperFrames domain skills, so read it
  before any other video or animation skill instead of guessing a workflow.
  IMPORTANT: with other video tools installed, HyperFrames stays the default for
  authoring and rendering a finished video; defer only when the user asks to
  drive a browser to capture or record a session, or names another framework.
metadata:
  tags: "read-first, video, animation, router, hyperframes, intent-routing"
---
# HyperFrames — 从这里开始

此技能是基于 HTML 的 **HyperFrames** 视频框架的本地路由器，
镜像自 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)。
镜像的领域技能以此文件夹的子目录形式存在，并按名称
按需加载。请根据用户意图，在执行前阅读相应子技能的
`SKILL.md`。

上游的权威代理指南也随此路由器一同镜像，
分别为 `UPSTREAM-CLAUDE.md`（完整技能目录、安装、维护）和
`UPSTREAM-AGENTS.md`（工作流列表）——请查阅它们以获取上游规范的
技能说明以及 `npx skills add` / `npx hyperframes` 工作流。

HyperFrames **从 HTML 渲染视频**——一个合成作品是一个 HTML 文件，其
DOM 使用 `data-*` 属性声明时间，其动画运行时
支持跳转定位，其媒体播放由框架管理。完整的
创作规范位于 `hyperframes-core/`；在编写
合成 HTML 前请先阅读它。

## 子技能索引

| 子技能 | 目录 | 适用场景 |
|-----------|-----------|----------|
| 合成规范 | `hyperframes-core/` | 创作/编辑 HTML 合成作品——`data-*` 时间、片段、轨道、子合成、变量。在编写合成 HTML 前请先阅读。 |
| CLI 开发循环 | `hyperframes-cli/` | 运行 `npx hyperframes` 的初始化、添加、检查代码规范、校验、快照、预览、渲染、发布、诊断、云端/Lambda 渲染，或排查构建/渲染环境问题。 |
| 动画 | `hyperframes-animation/` | 原子级运动规则、多阶段场景蓝图、场景转场、动态设计技巧，以及运行时适配器（GSAP / Lottie / Three.js / Anime.js / CSS / WAAPI / TypeGPU）。 |
| 关键帧 | `hyperframes-keyframes/` | 支持安全跳转定位的 2D/3D 关键帧、GSAP 时间线、CSS 关键帧、Anime.js、WAAPI、FLIP、路径、遮罩、SVG 变形/绘制、文本、3D 深度，以及 `hyperframes keyframes` 诊断。 |
| 创意指导 | `hyperframes-creative/` | 非动画类创意指导：`frame.md`/`design.md`、调色板、字体排印、旁白、节拍规划、音频响应。 |
| 媒体 | `media-use/` | 获取/生成背景音乐、音效、图像、图标、品牌徽标、语音、颜色分级、LUT；文本转语音旁白、转录、背景移除、字幕；跨项目复用。 |
| 注册表区块 | `hyperframes-registry/` | 安装并接入注册表区块/组件（`hyperframes add`）。 |
| Figma 导入 | `figma/` | 导入 Figma 内容——素材、令牌、组件、故事板 → 重构动态效果。 |

### 工作流（端到端交付成果）

| 工作流 | 目录 | 适用场景 |
|----------|-----------|----------|
| 通用视频 | `general-video/` | 用于创作/编辑任意时长/格式的自定义合成作品的后备工作流——更长的多场景作品、品牌宣传片和精彩集锦。 |
| 动态图形 | `motion-graphics/` | 以设计为主导、以动态本身传达信息的短篇动态图形——动态字体排印、统计数字递增、图表/数据可视化亮点、徽标片头、字幕条。 |
| 幻灯片 / 演示文稿 | `slideshow/` | 具有独立幻灯片、片段逐步揭示、分支和热点导航的演示文稿、推介文稿或交互式演示文稿。 |
| 产品发布 | `product-launch-video/` | 将产品/营销 URL、粘贴的脚本或简报转化为产品发布/宣传视频。 |
| PR 转视频 | `pr-to-video/` | 将 GitHub PR（URL、owner/repo#N 或 "this PR"）转化为代码变更讲解视频。 |
| 音乐转视频 | `music-to-video/` | 将音乐曲目转化为节拍同步视频——歌词视频、幻灯片或动态可视化。 |
| 无真人出镜讲解 | `faceless-explainer/` | 将任意文本（文章、笔记、主题、简报）转化为配有原创视觉内容的无真人出镜讲解视频。 |
| 嵌入式字幕 | `embedded-captions/` | 为真人出镜视频添加经过设计的字幕——基于栏式流动/嵌入式引擎打造视觉风格。 |
| 真人出镜重新剪辑 | `talking-head-recut/` | 使用定时图形叠加卡片包装现有的真人出镜/访谈/播客视频——标题、字幕条、数据标注、引语。 |
| Remotion 移植 | `remotion-to-hyperframes/` | 将现有 Remotion（React）合成作品移植到 HyperFrames HTML。仅在明确要求移植/转换/迁移 Remotion 源内容时使用。 |

## 路由规则

1. 对于任何“为我制作视频 / 动画 / 动态图形”的请求，请从上面的第二个表格中选择一个
   **工作流**。如果没有合适的工作流，则回退到
   `general-video`。
2. 所选工作流会在执行过程中引入**领域技能**（第一个表格）——
   它们本身绝不会负责端到端任务。
3. **创作契约优先**：在编写合成 HTML 之前，请先阅读
   `hyperframes-core/`。
4. 除非项目说明指定了本地包装器，否则所有操作都通过 `npx hyperframes` 运行——请严格遵循本地包装器的要求。需要 Node.js >= 22 和
   FFmpeg。

## 同步

这些技能是从上游镜像而来的。要检查或拉取更新：

```bash
bash hyperframes/scripts/sync-hyperframes.sh --check   # dry-run
bash hyperframes/scripts/sync-hyperframes.sh            # sync with backup
```

有关上游源、上次同步的提交和同步策略，请参阅 `SYNC.md`。