---
name: remotion-to-hyperframes
description: 'Port an existing Remotion (React) composition''s source to HyperFrames HTML. Use ONLY on an explicit ask to port/convert/migrate/translate a Remotion source — one-way, Remotion-only. A passing Remotion mention, reference-only code, or "make something like my Remotion video" is a fresh build (/general-video). Unclear → /hyperframes.'
---
> **首先，保持此 skill 为最新状态——运行前请先与用户确认：** `npx hyperframes skills update remotion-to-hyperframes`。一切均为最新时会快速空操作；否则，它会在依赖这些 skill 之前刷新此 skill 及其依赖的核心领域 skill。

# Remotion 到 HyperFrames

> **入口是 `/hyperframes`。** 仅当要将现有 **Remotion**（React）合成的源代码单向迁移到 HyperFrames 时使用此 skill。创建**新的**合成、从非 Remotion 源（After Effects、Framer Motion、纯 React / CSS——不存在可供翻译的 Remotion 源）重新创建、仅顺带提及 Remotion，或存在任何不确定性时 → 首先阅读 `/hyperframes`：意图层负责所有路径决策。

## 概述

将 Remotion（基于 React）视频合成转换为 HyperFrames（HTML + GSAP）合成。大多数 Remotion 习惯用法都有直接对应的 HyperFrames 等价形式——对于典型合成而言，约 80% 的转换是机械式的。此 skill 编码了映射规则，并通过拒绝转换不适合 HF seek 驱动模型的模式，针对容易产生信息损失的 20% 情况提供防护；同时建议改用 [PR #214](https://github.com/heygen-com/hyperframes/pull/214) 中的运行时互操作模式。

此 skill 附带一个**分层测试语料库**（T1–T4，共 4 个 fixture），根据测量得到的 SSIM 阈值对转换结果进行评分。不要在未运行评估的情况下进行转换——某个转换结果即使“看起来正确”，但渲染出的 SSIM 比经过验证的基线低 0.05，也属于悄无声息的错误。

## 适用场景

**仅当用户明确要求从 Remotion 迁移时使用此 skill。** 触发短语示例：

- “把我的 Remotion 项目迁移到 HyperFrames”
- “将这段 Remotion 代码转换为 HyperFrames”
- “从 Remotion 迁移”
- “翻译这个 Remotion 合成”
- “将这个重写为 HyperFrames HTML”

**以下情况不要使用此 skill：**

- (a) 用户正在创建**新的** HyperFrames 合成，即使他们拥有或正在对 A/B 测试一个类似的 Remotion 视频。
- (b) 用户只是顺带提及 Remotion，并未要求迁移。
- (c) 用户分享 Remotion 代码只是作为参考资料，而不是要求进行翻译。
- (d) 用户要求“制作一个和我的 Remotion 版本相同的视频”，但没有明确要求迁移源代码——将其视为全新的 HyperFrames 构建。

**不支持（请拒绝——这不是此 skill 的用途）：**

- **反向迁移。** 将 HyperFrames 合成导出回 _Remotion_（或任何其他框架）并不是支持的工作流——转换方向仅为 Remotion → HyperFrames。请明确说明这一点。
- **非 Remotion 源。** After Effects 项目（`.aep`）、Framer Motion / 纯 React / CSS 动画，或任何其他工具的源代码都不是 Remotion 合成——不存在可供转换的 Remotion 源。请通过 `/general-video` 原生重新创建，或者在 HyperFrames 无法表示该内容时拒绝。

如有疑问，默认使用 `/general-video`（通用 HyperFrames 创作流程）来创作原生 HyperFrames 合成。

## 工作流

### 步骤 1：检查源代码

对 Remotion 源代码目录运行 [`scripts/lint_source.py`](scripts/lint_source.py)。该检查程序会检测无法顺利转换的模式：

- **阻塞项**（拒绝转换 + 建议使用互操作方案）：`useState`、`useReducer`、依赖数组非空的 `useEffect`/`useLayoutEffect`、异步 `calculateMetadata`、第三方 React UI 库（MUI、Chakra、Mantine、antd、shadcn、Radix、NextUI）。
- **警告项**（丢弃该构造后继续转换）：`@remotion/lambda` 配置、`delayRender`、`useCallback`、`useMemo`、自定义 hooks。
- **信息项**（转换并添加说明）：`staticFile`、`interpolateColors`。

如果出现任何阻塞项，**停止操作**。阅读 [`references/escape-hatch.md`](references/escape-hatch.md)，并显示建议消息。警告不会阻止转换 — 在步骤 3 中丢弃相关构造，并在 `TRANSLATION_NOTES.md` 中记录差异。`@remotion/lambda` 配置是规范的警告案例：该技能会删除 import 和 `renderMediaOnLambda(...)` 调用，但会转换组合的其余部分。

### 步骤 2：规划转换

阅读 [`references/api-map.md`](references/api-map.md) — 其中列出了每个 Remotion API 及其 HF 对等项或对应主题的参考文档。根据源代码使用的内容，确定需要哪些主题参考文档：

| 源代码包含                                                               | 加载参考文档                              |
| ------------------------------------------------------------------------- | ----------------------------------------- |
| `Composition`、`defaultProps`、`schema`、`calculateMetadata`              | [`parameters.md`](references/parameters.md)   |
| `Sequence`、`Series`、`Loop`、`AbsoluteFill`、`Freeze`                    | [`sequencing.md`](references/sequencing.md)   |
| `useCurrentFrame`、`interpolate`、`spring`、`Easing`、`interpolateColors` | [`timing.md`](references/timing.md)           |
| `Audio`、`Video`、`Img`、`IFrame`、`staticFile`、`delayRender`            | [`media.md`](references/media.md)             |
| `TransitionSeries`、`@remotion/transitions`                               | [`transitions.md`](references/transitions.md) |
| `@remotion/lottie`                                                        | [`lottie.md`](references/lottie.md)           |
| `@remotion/google-fonts/<Family>`、`Font.loadFont`、`@font-face`          | [`fonts.md`](references/fonts.md)             |

不要全部加载 — 只加载特定源代码所需的文档。

**对于表格未映射的任何视觉效果，请搜索在线目录。** 当源代码绘制的效果没有对应的 HF API — 例如扫描线/CRT 覆盖层、故障或色差处理、着色器擦除、胶片颗粒效果 — 在 GSAP 中手写实现之前，运行 `npx hyperframes catalog --query "<the effect, in plain English>" --json`。搜索**无需安装任何内容**：不需要项目、不需要预先执行 `add`，也不需要账户。它可以从任何目录对整个托管注册表（约 400 个区块和组件）进行排序，`transitions.md` 已通过 `npx hyperframes add sdf-iris` 对 `clockWipe()` / `iris()` 采用了这一路径。实际组件比手写近似实现更接近源效果，因此通常会提高 SSIM，而不是降低它 — 但步骤 4 中的渲染差异仍然是最终判断依据。如果搜索没有返回合适的结果，再手写该效果；无论哪种情况，都要在 `TRANSLATION_NOTES.md` 中记录替换方案。

### 第 3 步：生成 HF composition

生成 `index.html`，其中包含：

- 携带 composition 的 `data-composition-id`、`data-start="0"`、以秒为单位的 `data-duration`、`data-fps`、`data-width`、`data-height`，以及每个标量 prop 对应一个 `data-*` 属性的根 `<div id="stage">`。
- 包含 `data-start` / `data-duration` / `data-track-index` 的场景 div 平铺列表。
- 用于布局的内联 `<style>`；CSS 设置每个动画属性的 `from` 状态。
- 位于底部的单个 `<script>` 标签，其中包含一个暂停的 `gsap.timeline({paused: true})`。每个 Remotion `useCurrentFrame()` 推导都要在正确的偏移位置转换为此时间轴上的一个补间动画。
- `window.__timelines["<composition-id>"] = tl;` 将时间轴注册到 HF 运行时。

将自定义 React 子组件按照 prop 接口作为模板，以重复 HTML 的形式内联（参见 [`parameters.md`](references/parameters.md) 了解每个实例的 `data-*` 模式）。

### 第 4 步：验证

运行评估测试框架，完整指南参见 [`references/eval.md`](references/eval.md)。快速流程：

```bash
# Render Remotion baseline (after npm install in the fixture)
cd remotion-src && npx remotion render <CompositionId> out/baseline.mp4

# Render HF translation
cd ../hf-src && npx hyperframes render --skill=remotion-to-hyperframes --output ../hf.mp4

# SSIM diff
../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
```

阈值：低于源 composition 复杂度等级的 `p05` 约 0.02（参见 `eval.md` 中经过验证的阈值表）。如果差异测试失败，运行 [`scripts/frame_strip.sh`](scripts/frame_strip.sh) 查看具体哪些帧存在差异，然后重新阅读相关的 timing/sequencing/media 参考文档。

**关键**：两次渲染必须使用匹配的像素格式。在 Remotion 源代码的 `remotion.config.ts` 中设置 `Config.setVideoImageFormat("png")` + `Config.setColorSpace("bt709")`，否则差异测试衡量的是编码器差异（SSIM 约降低 0.05），而不是转换保真度。

### 第 5 步：记录差异

任何未能顺利转换的内容（丢弃的音量渐变、近似实现的自定义 presentation、替代字体）都要在 HF 输出旁边写入 `TRANSLATION_NOTES.md`。格式参见 [`references/limitations.md`](references/limitations.md)。

## 此 skill 明确不执行的操作

- **转换 React 状态机。** 通过 `useState` + `useEffect` 驱动动画的 compositions 并不是 HyperFrames 的基于 seek 的模型中的确定性帧捕获目标。建议使用运行时互操作模式。
- **让 Remotion 的渲染流水线与 HyperFrames 并行运行。** 这是 [PR #214](https://github.com/heygen-com/hyperframes/pull/214) 中的运行时互操作模式，是针对无法通过此 skill lint 的 compositions 的独立解决方案。

（`@remotion/lambda` **不是**阻塞项，Lambda 配置属于部署，而非动画。此 skill 会将其作为警告丢弃，并转换其余内容。参见 [`references/escape-hatch.md`](references/escape-hatch.md)。）

## 如何自行评估转换结果

运行测试语料库编排器：

```bash
./assets/test-corpus/run.sh
```

它会运行 T1、T2、T3（渲染 + 差异比对）和 T4（lint 验证），打印按层级划分的通过/失败表，并生成汇总 JSON 报告。使用它可在干净检出环境中验证该技能是否端到端正常工作，也可在编辑任何参考资料后用作回归检查。

已验证的基线（截至 2026-04-27）：

| 层级 | 合成形态                                    | 平均 SSIM | 阈值 |
| ---- | ------------------------------------------- | --------- | ---- |
| T1   | 单元素淡入                                  | 0.974     | 0.95 |
| T2   | 多场景 + 弹簧 + 音频 + 图像                 | 0.985     | 0.95 |
| T3   | 数据驱动、自定义子组件、计数递增            | 0.953     | 0.90 |
| T4   | 逃生舱口（8 个 lint 用例）                   | 8/8 通过  | 不适用 |