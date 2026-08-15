---
name: remotion
description: Toolkit-specific Remotion patterns — custom transitions, shared components, and project conventions. For core Remotion framework knowledge (hooks, animations, rendering, etc.), see the `remotion-official` skill.
---
# Remotion — 工具包扩展

> **Remotion 核心知识**位于 `.claude/skills/remotion-official/`（从官方 [remotion-dev/skills](https://github.com/remotion-dev/skills) 仓库同步）。本文档仅介绍**工具包特有的**模式。

## 共享组件

可复用的视频组件位于 `lib/components/`。在模板中通过以下方式导入：

```tsx
import { AnimatedBackground, SlideTransition, Label } from '../../../../lib/components';
```

| 组件 | 用途 |
|-----------|---------|
| `AnimatedBackground` | 浮动形状背景（变体：柔和、科技、温暖、深色） |
| `SlideTransition` | 场景转场（淡入淡出、缩放、向上滑动、模糊淡入淡出） |
| `Label` | 可选带有 JIRA 引用的浮动标签徽章 |
| `Vignette` | 电影感边缘暗化叠加层 |
| `LogoWatermark` | 角落中的品牌徽标水印 |
| `SplitScreen` | 并排视频对比 |
| `NarratorPiP` | 画中画演示者叠加层 |
| `Envelope` | 带有封口翻盖打开动画的 3D 信封 |
| `PointingHand` | 带有滑入和脉冲动画的手指表情符号 |
| `MazeDecoration` | 用于角落的动画等距网格装饰 |

## 自定义转场

工具包在 `lib/transitions/` 中包含一个转场库，用于实现官方 `@remotion/transitions` 包之外的场景间效果。

### 使用 TransitionSeries

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
// Import custom transitions from lib (adjust path based on your project location)
import { glitch, lightLeak, clockWipe, checkerboard } from '../../../../lib/transitions';
// Or import from @remotion/transitions for official ones
import { slide, fade } from '@remotion/transitions/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <TitleSlide />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={glitch({ intensity: 0.8 })}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={120}>
    <ContentSlide />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### 可用的自定义转场

| 转场 | 选项 | 最适合 |
|------------|---------|----------|
| `glitch()` | `intensity`, `slices`, `rgbShift` | 技术演示、前卫的揭示效果、赛博朋克风格 |
| `rgbSplit()` | `direction`, `displacement` | 现代科技风格、充满活力的转场 |
| `zoomBlur()` | `direction`, `blurAmount` | 行动号召、高能时刻、冲击效果 |
| `lightLeak()` | `temperature`, `direction` | 庆祝场景、电影美学、温馨时刻 |
| `clockWipe()` | `startAngle`, `direction`, `segments` | 与时间相关的内容、趣味揭示效果 |
| `pixelate()` | `maxBlockSize`, `gridSize`, `scanlines`, `glitchArtifacts`, `randomness` | 复古/游戏风格、数字化变换 |
| `checkerboard()` | `gridSize`, `pattern`, `stagger`, `squareAnimation` | 趣味揭示效果、结构化转场 |

**棋盘格模式：** `sequential`, `random`, `diagonal`, `alternating`, `spiral`, `rows`, `columns`, `center-out`, `corners-in`

### 转场示例

```tsx
// Tech/cyberpunk feel
glitch({ intensity: 0.8, slices: 8, rgbShift: true })

// Warm celebration
lightLeak({ temperature: 'warm', direction: 'right' })

// High energy zoom
zoomBlur({ direction: 'in', blurAmount: 20 })

// Chromatic aberration
rgbSplit({ direction: 'diagonal', displacement: 30 })

// Clock sweep reveal
clockWipe({ direction: 'clockwise', startAngle: 0 })

// Retro pixelation
pixelate({ maxBlockSize: 50, glitchArtifacts: true })

// Checkerboard patterns
checkerboard({ pattern: 'diagonal', gridSize: 8 })
checkerboard({ pattern: 'spiral', gridSize: 10 })
checkerboard({ pattern: 'center-out', squareAnimation: 'scale' })
```

### 转场时长指南

| 类型 | 帧数 | 说明 |
|------|--------|-------|
| 快速切换 | 15-20 | 快速、有冲击力 |
| 标准 | 30-45 | 最常用 |
| 戏剧性 | 50-60 | 缓慢揭示 |
| 故障效果 | 20-30 | 应呈现突发感 |
| 漏光 | 45-60 | 需要足够的扫过时间 |

### 预览转场

运行展示库以查看所有转场：

```bash
cd showcase/transitions && npm run studio
```

## 工具包约定

以下是此工具包特有的选择。有关 Remotion 的通用最佳实践（插值钳制、`useVideoConfig`、`delayRender`、`staticFile`、禁用 CSS 动画），请参阅 `remotion-official` 技能。

1. **所有项目均使用 30fps** — 时间计算：帧数 = 秒数 × 30
2. **playbackRate 必须保持恒定** — 对于可变或极端速度，请使用 FFmpeg 进行预处理
3. **视频/音频组件** — 模板使用来自 `remotion` 的 `<OffthreadVideo>` 和 `<Audio>`。上游现在也提供了来自 `@remotion/media` 的 `<Video>`/`<Audio>` 文档（更新，支持 trim 属性和音高偏移）。两种方式都可以正确渲染；扩展现有模板时，为保持一致性，请优先采用工具包所选择的方式。

## 项目时间约定

| 场景类型 | 时长 | 说明 |
|------------|----------|-------|
| 标题 | 3-5s (90-150f) | Logo + 标题文案 |
| 概览 | 10-20s | 3-5 个要点 |
| 演示 | 10-30s | 调整 playbackRate 以适配时长 |
| 统计数据 | 8-12s | 3-4 张统计卡片 |
| 片尾名单 | 5-10s | 快速淡出 |

**节奏：**旁白速度约为每分钟 150 个单词。时长由旁白决定。

## 高级 API

有关所有钩子、组件、渲染器、Lambda 和 Player API 的详细 API 文档，请参阅 [reference.md](reference.md)。

## 许可证说明

Remotion 使用特殊许可证。公司进行商业使用时可能需要获取许可证。请查看 https://remotion.dev/license

---

## 反馈与贡献

如果此技能缺少信息或仍可改进：

- **缺少某种模式？** 描述你所需要的内容
- **发现错误？** 告诉我哪里有问题
- **想要贡献？** 我可以帮助你：
  1. 更新此技能并进行改进
  2. 为 github.com/digitalsamba/claude-code-video-toolkit 创建 PR

只需说“改进此技能”，我就会指导你更新 `.claude/skills/remotion/SKILL.md`。