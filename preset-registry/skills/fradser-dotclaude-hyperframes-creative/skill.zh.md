---
name: hyperframes-creative
description: Non-animation creative direction for HyperFrames videos. Use for design spec (frame.md / design.md) handling, palettes, typography, narration, beat planning, audio-reactive visuals, composition patterns, and brand / style decisions. For atomic motion patterns and scene blueprints, use `hyperframes-animation`.
---
# HyperFrames 创意

品牌、节奏、风格、旁白和构图方向。在 `hyperframes-core` 的技术契约就绪后使用。

有关运动模式、场景蓝图、转场和 CSS 标记效果，请使用 `hyperframes-animation`——此技能特意不涉及动画。

> **对于任何非简单构图，请首先阅读以下两份文档——它们优先于 Web 设计惯例：**
>
> - `references/house-style.md`——“解读提示词，生成真实内容”、应避免的偷懒默认做法清单，以及背景/前景分层方案。正是这些内容将字面化的样式重塑转变为一个真正的_概念_。
> - `references/video-composition.md`——视频媒介中的尺度、深度和前景细节。它说明了如何避免空洞的网页式布局，同时又不会强制规定统一的元素数量。
>
> 跳过这些文档，是导致输出千篇一律、看起来像网页的首要原因。它们并不是下方路由表中的可选条目——对于任何不止一行的编辑，在选择颜色或编写 HTML 之前，都要先打开并阅读这两份文档。

## 工作流程

1. 如果项目有设计规范，**首先阅读它**，并将其 frontmatter 令牌视为品牌准则（颜色、字体、间距、语气、约束）。应读取哪个文件（优先级为 `frame.md` → `design.md` → `DESIGN.md`）以及如何解析（frontmatter = 规范，正文 = 上下文），统一定义在 [`references/design-spec.md`](references/design-spec.md) 中——按照该文档进行解析和加载。
2. 如果不存在设计规范，并且用户要求提供视觉方向，请选择一条路径：
   - 现成的 frame-preset（可选）→ `frame-presets/`（采用一个 `FRAME.md` 作为 `frame.md`；参见 `references/design-spec.md`）
   - 指定的风格或氛围 → `references/visual-styles.md`
   - 快速默认方案 → `references/house-style.md`
   - 交互式选择 → `references/design-picker.md`
3. 对于多场景工作，在编写 HTML 之前先规划节拍和节奏 → `references/beat-direction.md`。有关场景转场，请转到 `hyperframes-animation/transitions/`。
4. 对于重度运动效果的工作，请先阅读 `references/motion-principles.md`（高层指导原则），然后转到 `hyperframes-animation` 查看原子级规则。

## 路由

| 主题                                                                          | 阅读                                           |
| ----------------------------------------------------------------------------- | ---------------------------------------------- |
| 采用现成的 frame-preset 作为 `frame.md`（可选）                               | `frame-presets/` · `references/design-spec.md` |
| 默认调色板、运动、排版，以及需要质疑的偷懒默认做法                            | `references/house-style.md`                    |
| 命名风格预设、从氛围到风格的路由                                              | `references/visual-styles.md`                  |
| 调色板专用颜色令牌                                                            | `palettes/*.md`                                |
| 构图模式——画中画、文字置于主体之后、标题卡、幻灯片                            | `references/composition-patterns.md`           |
| 统计数据／信息图表呈现                                                        | `references/data-in-motion.md`                 |
| 对开放式提示词进行结构化扩展                                                  | `references/prompt-expansion.md`               |
| 视频媒介的密度、尺度、颜色和画面构图                                          | `references/video-composition.md`              |
| 逐节拍指导、节奏规划、转场时机                                                | `references/beat-direction.md`                 |
| 创作完成后的规范验证（颜色、字体、圆角、间距、深度）                          | `references/design-adherence.md`               |
| 高层运动指导原则和 GSAP 品质规则                                              | `references/motion-principles.md`              |
| 字体选择、字体搭配、渲染视频的字体指导原则                                    | `references/typography.md`                     |
| 故事原则——钩子语言、价值先于证据、将故事板视为提案                            | `references/story-spine.md`                    |
| 脚本节奏、语气、开场、数字读法                                                | `references/narration.md`                      |
| 映射到运动的预计算音频频段                                                    | `references/audio-reactive.md`                 |

## 脚本

- `scripts/contrast-report.mjs` — 检查渲染帧中的对比度警告。
- `scripts/extract-audio-data.py` — 为音频响应式合成预提取音频频段数据。
- `scripts/package-loader.mjs` — 用于捆绑式创意工具的支持脚本。

`contrast-report.mjs` 会优先从当前项目解析辅助软件包，随后可引导加载捆绑的 HyperFrames 软件包版本。仅当你在捆绑的 CLI/技能安装环境之外运行该技能，并且需要显式固定引导加载的版本时，才设置 `HYPERFRAMES_SKILL_PKG_VERSION=<version>`。

请在仓库根目录下使用显式路径运行，例如：

```bash
python skills/hyperframes-creative/scripts/extract-audio-data.py <audio-file>
```

动画分析工具（`animation-map.mjs`）位于 `hyperframes-animation/scripts/` 中。

## 边界

- 不要覆盖 `hyperframes-core` 的技术规则。
- 不要强制要求为最小化技术合成使用设计系统。
- 除非请求明确要求，或者你先提出扩展方案，否则不要添加额外的场景、旁白、音乐、字幕或转场。
- 仅参考与任务相关的操作指南；不要为简单编辑读取所有参考资料。