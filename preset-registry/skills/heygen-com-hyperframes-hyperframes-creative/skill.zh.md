---
name: hyperframes-creative
description: Non-animation creative direction for HyperFrames videos. Use for design spec (frame.md / design.md) handling, palettes, typography, narration, beat planning, audio-reactive visuals, composition patterns, and brand / style decisions. For atomic motion patterns and scene blueprints, use `hyperframes-animation`.
---
# HyperFrames 创意设计

品牌、节奏、风格、旁白和构图指导。在 `hyperframes-core` 的技术契约就绪后使用。

有关动效模式、场景蓝图、转场和 CSS 标记效果，请使用 `hyperframes-animation`——此技能特意不涉及动画。

> **对于任何非简单构图，请首先阅读以下两份文档——它们的优先级高于 Web 设计惯例：**
>
> - `references/house-style.md`——“解读提示词，生成真实内容”、应避免的偷懒式默认做法清单，以及背景/前景分层方案。正是这些内容让字面上的样式重制转化为一个真正的_概念_。
> - `references/video-composition.md`——视频媒介的尺度、景深和前景细节。它说明了如何避免空洞的网页式布局，同时又不强制规定统一的元素数量。
>
> 跳过这些文档，是产出通用化、网页式视觉效果的首要原因。它们并非下方路由表中的可选条目——对于任何不止一行的编辑，请在选择颜色或编写 HTML 之前先打开并阅读这两份文档。

## 工作流程

1. 如果项目有设计规范，**请先阅读它**，并将其前置元数据标记视为品牌的权威定义（颜色、字体、间距、语气、约束）。应读取哪个文件（优先级为 `frame.md` → `design.md` → `DESIGN.md`），以及如何解析该文件（前置元数据 = 规范，正文 = 上下文），均已在 [`references/design-spec.md`](references/design-spec.md) 中统一定义——请按照该文档进行解析和加载。
2. 如果不存在设计规范，并且用户要求提供视觉方向，请选择一种路径：
   - 现成的画面预设（可选）→ `frame-presets/`（采用某个 `FRAME.md` 作为 `frame.md`；参见 `references/design-spec.md`）
   - 指定的风格或氛围 → `references/visual-styles.md`
   - 快速默认方案 → `references/house-style.md`
   - 交互式选择 → `references/design-picker.md`
3. 对于多场景工作，请在编写 HTML 之前规划节拍和节奏 → `references/beat-direction.md`。有关场景转场，请转至 `hyperframes-animation/transitions/`。
4. 对于动效密集型工作，请先阅读 `references/motion-principles.md`（高层级约束原则），然后前往 `hyperframes-animation` 查看具体规则。

## 路由

| 主题                                                                                                   | 阅读                                           |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 采用现成的画面预设作为 `frame.md`（可选）                                                              | `frame-presets/` · `references/design-spec.md` |
| 默认调色板、动效、字体排印，以及需要质疑的偷懒式默认做法                                               | `references/house-style.md`                    |
| 命名风格预设、从氛围到风格的路由                                                                       | `references/visual-styles.md`                  |
| 特定调色板的颜色标记                                                                                    | `palettes/*.md`                                |
| 构图模式——画中画、文字置于主体后方、标题卡、幻灯片展示                                                 | `references/composition-patterns.md`           |
| 统计数据／信息图呈现                                                                                    | `references/data-in-motion.md`                 |
| 对开放式提示词进行结构化扩展                                                                            | `references/prompt-expansion.md`               |
| 视频媒介的密度、尺度、色彩和画面构图                                                                    | `references/video-composition.md`              |
| 逐节拍指导、节奏规划、转场时机                                                                          | `references/beat-direction.md`                 |
| 创作完成后的规范验证（颜色、字体、圆角、间距、景深）                                                    | `references/design-adherence.md`               |
| 高层级动效约束原则和 GSAP 品质规则                                                                       | `references/motion-principles.md`              |
| 字体选择、字体搭配、渲染视频的字体排印约束原则                                                          | `references/typography.md`                     |
| 故事准则——钩子语言、价值先于证据、将故事板视为提案、视觉素材可追溯至来源                                | `references/story-spine.md`                    |
| 脚本节奏、语气、开场、数字读法                                                                          | `references/narration.md`                      |
| 映射至动效的预计算音频频段                                                                              | `references/audio-reactive.md`                 |

## 脚本

- `scripts/contrast-report.mjs` — 检查渲染帧中的对比度警告。
- `scripts/extract-audio-data.py` — 为音频响应式合成预先提取音频频段数据。
- `scripts/package-loader.mjs` — 用于捆绑式创意工具的支持脚本。

`contrast-report.mjs` 会优先从当前项目解析辅助程序包，然后可以引导加载捆绑的 HyperFrames 程序包版本。仅当在捆绑的 CLI/技能安装环境之外运行该技能，并且需要显式固定该引导版本时，才设置 `HYPERFRAMES_SKILL_PKG_VERSION=<version>`。

请从仓库根目录使用显式路径运行，例如：

```bash
python skills/hyperframes-creative/scripts/extract-audio-data.py <audio-file>
```

动画分析工具（`animation-map.mjs`）位于 `hyperframes-animation/scripts/` 中。

## 边界

- 不要覆盖 `hyperframes-core` 的技术规则。
- 不要要求极简技术合成必须使用设计系统。
- 除非请求中明确要求，或你先提出扩展建议，否则不要添加额外的场景、旁白、音乐、字幕或转场。
- 仅针对具体任务查阅操作指南；进行简单编辑时，不要阅读所有参考资料。