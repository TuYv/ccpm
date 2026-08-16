---
name: remotion
version: 1.0.0
description: "Programmatic video creation in React with Remotion. Use this skill whenever the user writes Remotion, npx create-video, remotion studio/render/still, useCurrentFrame/interpolate/Sequence, Composition, Mediabunny, or any React-driven video/animation/caption/motion-graphics task — including scaffolding a project, writing markup, rendering/exporting (incl. transparent), adding captions/subtitles, making Studio-editable animations, building a Remotion SaaS (Player/Lambda/Vercel/Cloudflare), or getting media metadata. Do NOT use for ffmpeg-only pipelines, video.js/players, WebRTC live streaming, framer-motion web animation, or After Effects."
metadata:
  tags: [remotion, video, react, animation, composition, render, captions, saas]
---
# Remotion 技能

此技能是所有 Remotion 视频创作操作的路由器。它与上游 `remotion-dev/skills` 仓库保持一致。请根据用户意图，在执行操作前读取相应子技能的 `SKILL.md`。

**子技能具有权威性。** 每个子技能目录下的文件均为逐字保留的上游内容——请勿编辑这些文件；应改为从上游重新同步。下表为索引，子技能的 `SKILL.md` 则是具体指令。

## 子技能索引

| 子技能 | 入口 | 使用场景 |
|-----------|-------|----------|
| 新建项目 | [`remotion-create/remotion-create.md`](remotion-create/remotion-create.md) | 搭建新的 Remotion 项目（`npx create-video`）、设计视频、启动 Studio 预览 |
| React 标记 | [`remotion-markup/remotion-markup.md`](remotion-markup/remotion-markup.md) | 编写 Remotion React 标记——核心内容：动画、媒体、序列、时间控制、字体、效果、地图、Lottie、DOM 测量、转场、裁剪 |
| 渲染 | [`remotion-render/remotion-render.md`](remotion-render/remotion-render.md) | 渲染视频和静态图像（`npx remotion render/still`）、透明视频 |
| 字幕 | [`remotion-captions/remotion-captions.md`](remotion-captions/remotion-captions.md) | 转录、导入 SRT，以及显示字幕 |
| 交互性 | [`remotion-interactivity/remotion-interactivity.md`](remotion-interactivity/remotion-interactivity.md) | 使动画可在 Remotion Studio 可视化模式中编辑 |
| SaaS / 应用 | [`remotion-saas/remotion-saas.md`](remotion-saas/remotion-saas.md) | 构建视频应用——`<Player>`、在 Lambda/Vercel/Cloudflare/Node 上渲染、客户端渲染、选择框架 |
| Mediabunny | [`mediabunny/mediabunny.md`](mediabunny/mediabunny.md) | 在浏览器中处理多媒体——获取音频/视频时长、获取视频尺寸 |

## 如何路由

1. 根据**使用场景**列识别用户意图。
2. 如果任务跨越多个领域（例如“构建一个可渲染字幕的 Remotion SaaS”），请按照任务所需的顺序加载每个相关子技能。
3. 读取子技能的入口文件（`<name>/<name>.md`，从 `SKILL.md` 中解除嵌套，以避免自动发现子技能），然后继续读取其中指向的任何 `references/` 风格的 `.md` 文件（每个子技能文件夹都包含自己的详细说明文件）。
4. 子技能通过类似 `../remotion-markup/remotion-markup.md` 的相对路径相互引用——这些路径均在此 `remotion/` 目录内解析。

## 关于交叉引用的说明

一些上游子技能文件包含类似 `[Remotion 最佳实践](../remotion-best-practices/remotion-best-practices.md)` 的链接。`remotion-best-practices/` 是一个本地垫片（并非上游子技能），它会转发到此顶层路由器——请将这些链接视为“返回 Remotion 路由器”（即此文件）。所有其他同级交叉引用（`../remotion-markup/remotion-markup.md`、`../remotion-captions/remotion-captions.md` 等）均可正确解析。