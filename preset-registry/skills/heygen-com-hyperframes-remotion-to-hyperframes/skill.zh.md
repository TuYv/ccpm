---
name: remotion-to-hyperframes
description: 'Port an existing Remotion (React) composition''s source to HyperFrames HTML. Use ONLY on an explicit ask to port/convert/migrate/translate a Remotion source — one-way, Remotion-only. A passing Remotion mention, reference-only code, or "make something like my Remotion video" is a fresh build (/general-video). Unclear → /hyperframes.'
---
> **首先，请保持此技能为最新状态——运行前先向用户确认：** `npx hyperframes skills update remotion-to-hyperframes`。如果所有内容均为最新，此命令会快速完成且不执行任何操作；否则，它会刷新此技能及其依赖的核心领域技能，之后你才能使用它们。

# 从 Remotion 到 HyperFrames

> **统一入口是 `/hyperframes`。** **仅**在将现有 **Remotion**（React）合成的源代码单向移植到 HyperFrames 时使用此技能。创作**新的**合成、从非 Remotion 源重新创建（After Effects、Framer Motion、纯 React / CSS——不存在可供转换的 Remotion 源代码）、仅顺带提及 Remotion，或存在任何不确定性时 → 请先阅读 `/hyperframes`：意图层负责所有路由决策。

## 概述

将基于 React 的 Remotion 视频合成转换为 HyperFrames（HTML + GSAP）合成。大多数 Remotion 惯用模式在 HyperFrames 中都有直接对应的实现——对于约 80% 的典型合成，这种转换是机械式的。本技能对这些映射进行了编码，并通过拒绝转换不适合 HF 跳转定位驱动模型的模式来防止其余 20% 出现有损转换，同时建议改用 [PR #214](https://github.com/heygen-com/hyperframes/pull/214) 中的运行时互操作模式。

本技能附带一个**分层测试语料库**（T1–T4，共 4 个测试样例），它会根据测得的 SSIM 阈值对转换结果进行评分。不要在未运行评估的情况下进行转换——某个转换可能“看起来没问题”，但渲染结果比经过验证的基线低 0.05 SSIM，这意味着它实际上存在难以察觉的错误。

## 使用时机

**仅当用户明确要求从 Remotion 迁移时，才使用此技能。** 触发短语示例：

- “将我的 Remotion 项目移植到 HyperFrames”
- “将此 Remotion 代码转换为 HyperFrames”
- “从 Remotion 迁移”
- “转换此 Remotion 合成”
- “将其重写为 HyperFrames HTML”

**在以下情况下，请勿使用此技能：**

- (a) 用户正在创作一个**新的** HyperFrames 合成，即使他们已有一个类似的 Remotion 视频或正在对其进行 A/B 测试。
- (b) 用户只是顺带提及 Remotion，并未要求迁移。
- (c) 用户分享 Remotion 代码是为了将其作为参考资料，而不是要求进行转换。
- (d) 用户要求制作“与我的 Remotion 视频相同的视频”，但未明确要求迁移源代码——应将其视为一次全新的 HyperFrames 构建。

**不支持（请拒绝——这并非此技能的用途）：**

- **反向转换。** 将 HyperFrames 合成导出_到_ Remotion（或任何其他框架）并不是受支持的工作流——仅支持 Remotion → HyperFrames 的转换。请明确说明这一点。
- **非 Remotion 源。** After Effects 项目（`.aep`）、Framer Motion / 纯 React / CSS 动画或任何其他工具的源文件都不是 Remotion 合成——不存在可供转换的 Remotion 源代码。请通过 `/general-video` 以原生方式重新创建；如果 HyperFrames 无法表示，则予以拒绝。

如有疑问，默认改用 `/general-video`（通用 HyperFrames 创作流程）创作原生 HyperFrames 合成。

## 工作流程

### 第 1 步：检查源代码

在 Remotion 源代码目录上运行 [`scripts/lint_source.py`](scripts/lint_source.py)。该检查工具会检测无法顺利转换的模式：

- **阻断项**（拒绝转换并建议使用互操作方案）：`useState`、`useReducer`、具有非空依赖项的 `useEffect`/`useLayoutEffect`、异步 `calculateMetadata`、第三方 React UI 库（MUI、Chakra、Mantine、antd、shadcn、Radix、NextUI）。
- **警告项**（删除相关构造后继续转换）：`@remotion/lambda` 配置、`delayRender`、`useCallback`、`useMemo`、自定义 hooks。
- **信息项**（转换并附加说明）：`staticFile`、`interpolateColors`。

如果触发任何阻断项，**立即停止**。阅读 [`references/escape-hatch.md`](references/escape-hatch.md) 并给出其中的建议消息。警告项不会阻止转换——在第 3 步中删除有问题的构造，并在 `TRANSLATION_NOTES.md` 中注明缺失之处。`@remotion/lambda` 配置是典型的警告案例：该 skill 会删除 import 和 `renderMediaOnLambda(...)` 调用，但会转换 composition 的其余部分。

### 第 2 步：规划转换

阅读 [`references/api-map.md`](references/api-map.md)——其中索引了每个 Remotion API 及其 HF 等效项或对应的主题参考文档。根据源代码使用的内容，确定需要哪些主题参考文档：

| 源代码包含                                                              | 加载参考文档                                  |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| `Composition`、`defaultProps`、`schema`、`calculateMetadata`              | [`parameters.md`](references/parameters.md)   |
| `Sequence`、`Series`、`Loop`、`AbsoluteFill`、`Freeze`                    | [`sequencing.md`](references/sequencing.md)   |
| `useCurrentFrame`、`interpolate`、`spring`、`Easing`、`interpolateColors` | [`timing.md`](references/timing.md)           |
| `Audio`、`Video`、`Img`、`IFrame`、`staticFile`、`delayRender`            | [`media.md`](references/media.md)             |
| `TransitionSeries`、`@remotion/transitions`                               | [`transitions.md`](references/transitions.md) |
| `@remotion/lottie`                                                        | [`lottie.md`](references/lottie.md)           |
| `@remotion/google-fonts/<Family>`、`Font.loadFont`、`@font-face`          | [`fonts.md`](references/fonts.md)             |

不要加载全部参考文档——只加载特定源代码所需的文档。

### 第 3 步：生成 HF composition

输出 `index.html`，其中包含：

- 根 `<div id="stage">`，携带 composition 的 `data-composition-id`、`data-start="0"`、`data-duration`（以秒为单位）、`data-fps`、`data-width`、`data-height`，并为每个标量 prop 添加一个 `data-*`。
- 场景 div 的扁平列表，包含 `data-start` / `data-duration` / `data-track-index`。
- 用于布局的内联 `<style>`；CSS 设置每个动画属性的 `from` 状态。
- 位于底部的单个 `<script>` 标签，其中包含一个暂停的 `gsap.timeline({paused: true})`。每个 Remotion `useCurrentFrame()` 派生值都会在此时间线的正确偏移位置转换为一个 tween。
- 使用 `window.__timelines["<composition-id>"] = tl;` 向 HF 运行时注册时间线。

将自定义 React 子组件内联为重复的 HTML，并使用 prop 接口作为模板（有关每个实例的 `data-*` 模式，请参阅 [`parameters.md`](references/parameters.md)）。

### 步骤 4：验证

运行评估工具——完整指南请参阅 [`references/eval.md`](references/eval.md)。快速操作路径：

```bash
# Render Remotion baseline (after npm install in the fixture)
cd remotion-src && npx remotion render <CompositionId> out/baseline.mp4

# Render HF translation
cd ../hf-src && npx hyperframes render --skill=remotion-to-hyperframes --output ../hf.mp4

# SSIM diff
../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
```

阈值：比源内容复杂度层级的 `p05` 低约 0.02（请参阅 `eval.md` 中经过验证的阈值表）。如果差异检查失败，请运行 [`scripts/frame_strip.sh`](scripts/frame_strip.sh) 查看究竟是哪些帧出现偏差，然后重新阅读相关的时序、序列或媒体参考文档。

**关键要求**：两次渲染必须使用匹配的像素格式。在 Remotion 源项目的 `remotion.config.ts` 中设置 `Config.setVideoImageFormat("png")` + `Config.setColorSpace("bt709")`——否则，差异检查衡量的是编码器差异（SSIM 下降约 0.05），而不是转换保真度。

### 步骤 5：记录缺失项

任何未能完整转换的内容（丢弃的音量渐变、近似实现的自定义呈现效果、替换的字体），都应记录在 HF 输出旁的 `TRANSLATION_NOTES.md` 中。格式请参阅 [`references/limitations.md`](references/limitations.md)。

## 此技能明确不会执行的操作

- **转换 React 状态机。** 通过 `useState` + `useEffect` 驱动动画的合成内容，在 HyperFrames 基于定位跳转的模型中并非确定性的帧捕获目标。建议使用运行时互操作模式。
- **在 HyperFrames 旁运行 Remotion 的渲染管线。** 这是来自 [PR #214](https://github.com/heygen-com/hyperframes/pull/214) 的运行时互操作模式——它是针对无法通过此技能 lint 检查的合成内容的独立解决方案。

（`@remotion/lambda` 并非阻碍因素——Lambda 配置属于部署配置，而非动画配置。此技能会在发出警告后将其丢弃，并转换其余内容。请参阅 [`references/escape-hatch.md`](references/escape-hatch.md)。）

## 如何评估自己的转换结果

运行测试语料库编排脚本：

```bash
./assets/test-corpus/run.sh
```

它会运行 T1、T2、T3（渲染 + 差异检查）和 T4（lint 验证），输出按层级划分的通过/失败表，并生成汇总 JSON 报告。可使用它验证此技能能否在全新检出的代码库上端到端正常工作，也可在编辑任何参考文档后将其用作回归检查。

经过验证的基线（截至 2026-04-27）：

| 层级 | 合成内容结构                                | 平均 SSIM | 阈值      |
| ---- | ------------------------------------------- | --------- | --------- |
| T1   | 单元素淡入                                  | 0.974     | 0.95      |
| T2   | 多场景 + 弹簧动画 + 音频 + 图像             | 0.985     | 0.95      |
| T3   | 数据驱动、自定义子组件、递增计数             | 0.953     | 0.90      |
| T4   | 逃生舱口（8 个 lint 用例）                  | 8/8 通过  | 不适用    |