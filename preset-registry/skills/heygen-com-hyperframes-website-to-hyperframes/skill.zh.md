---
name: website-to-hyperframes
description: |
  Capture a website and create a HyperFrames video from it. Use when: (1) a user provides a URL and wants a video, (2) someone says "capture this site", "turn this into a video", "make a promo from my site", (3) the user wants a social ad, product tour, or any video based on an existing website, (4) the user shares a link and asks for any kind of video content. Even if the user just pastes a URL — this is the skill to use.
---
# 从网站到 HyperFrames

捕获网站，然后基于它制作专业视频。

用户会提出类似这样的要求：

- “捕获 https://...，并为我制作一个 25 秒的产品发布视频”
- “将这个网站制作成一个用于 Instagram 的 15 秒社交广告”
- “根据 https://... 创建一个 30 秒的产品导览视频”

工作流包含 7 个步骤。每个步骤都会生成一个制约下一步的产物。默认情况下采用协作模式——标有 💬 的关卡会暂停并询问用户。如果用户明确表示采用自主模式（“替我决定”“给我惊喜”），则会跳过 💬 用户偏好关卡；有关这种模式如何传递到后续步骤，请参阅 step-2-brief.md。

**自主模式并不意味着“跳过所有关卡”。** 自动模式涵盖用户偏好问题（TTS 提供商、语音、颜色强调、节拍数量、是否添加音乐、是否添加字幕——由代理代表用户做出决定）。它不涵盖质量验证关卡。以下关卡在自动模式下仍不可跳过：

- 资产审核（步骤 3）——查看联系表，并说明对每项资产做出 USE/SKIP 决定的理由
- 逐节拍读取 HTML（步骤 5）——为每个节拍提供结构化证据块
- DoD 检查清单（步骤 6）——包括动画映射、对每条警告进行 WCAG 验证，以及音频/动效播放
- 如实披露部分（步骤 6）——最终总结中必须包含“我没有验证的内容”

如果你发现自己在这样推理：“自动模式要求倾向于采取行动，所以我要跳过 X”——而 X 是验证关卡，不是偏好问题——那么这种推理就是错误的。倾向于采取行动适用于决定_要构建什么_，而不适用于决定_是否进行验证_。

---

## 步骤 0：捕获并理解品牌

**阅读：** [references/step-0-capture.md](references/step-0-capture.md)

捕获网站，然后阅读提取的数据，以了解**品牌和产品**——它的用途、目标用户、表达方式，以及它所营造的氛围。捕获的资产是供后续使用的品牌工具包，而不是构成视频的基本素材。

**关卡：** 输出网站摘要——先介绍策略层面的信息（产品用途、目标用户、品牌调性），再列出资产、颜色和字体清单。

---

## 步骤 1：品牌标识

**阅读：** [references/step-1-design.md](references/step-1-design.md)

编写 DESIGN.md——一份涵盖视觉标识的品牌速查表，包括颜色、排版、组件样式和布局原则。使用 `design-styles.json` 获取精确的计算值。

**快速选项：** 对于节奏较快的视频（每个节拍对应一块广告牌），DESIGN.md 可以是一份 50 行的摘要，包含颜色、字体以及应该做和不应该做的事项，而不必是一份 300 行的文档。步骤 5 中的子代理提示词会直接粘贴品牌值，因此 DESIGN.md 的详细程度只对复杂构图有影响。

**关卡：** `DESIGN.md` 已存在（长度不限），且至少包含：调色板、字体选择以及应该做和不应该做的事项。

---

## 步骤 2：策略与信息传达

**阅读：** [references/step-2-brief.md](references/step-2-brief.md)、[references/capabilities.md](references/capabilities.md)（浏览目录——仅在需要时深入阅读相关章节）

在讨论视觉效果或资产之前，先与用户就**视频必须传达什么**达成一致。解析用户的提示词——他们很可能已经提供了视频类型和风格。只询问缺失的信息：这个视频必须传达的唯一核心信息、叙事脉络以及目标受众。

**关卡：** 视频类型、时长、格式，以及最关键的——信息与叙事弧线均已确定。缺少这些内容，步骤 3 就无法编写以概念为先的故事板。

---

## 步骤 3：故事板 + 脚本 💬

**阅读：** [references/step-3-storyboard.md](references/step-3-storyboard.md)

以概念为先编写故事板：信息 → 叙事弧线 → 服务于叙事弧线的节拍 → 每个节拍采用的技巧 → 最后添加品牌点缀。然后编写与之匹配的旁白脚本。将两者连同逐节拍摘要一起呈现给用户。持续迭代，直至用户批准。

**关卡：** `STORYBOARD.md` + `SCRIPT.md` 均已存在，并且用户已批准该方案。

---

## 步骤 4：旁白、时间安排 + 字幕 💬

**阅读：** [references/step-4-vo.md](references/step-4-vo.md)

如果步骤 2 中决定不使用旁白——询问是否需要背景音乐，然后跳至步骤 5。否则：询问用户要使用哪个 TTS 提供商（HeyGen TTS、ElevenLabs 或 Kokoro），生成音频、转录，并将时间戳映射到各个节拍。然后询问字幕相关要求。

**关卡：** 满足以下任一条件：(a) 用户未要求旁白，且故事板中包含手动设置的节拍时间；或 (b) `narration.wav` + `transcript.json` 均已存在，且节拍时间已根据实际时长更新。

---

## 步骤 5：构建合成内容

**阅读：** `hyperframes` skill（加载它——每一条规则都很重要）  
**阅读：** [references/step-5-build.md](references/step-5-build.md)

按照故事板（步骤 3）中选定的架构与节奏构建 index.html 和合成内容。子代理在汇报之前，需对每个节拍运行 `hyperframes lint` 和 `hyperframes snapshot`。

**关卡：** 主代理已依据 DESIGN.md 和 STORYBOARD.md，从头到尾阅读并检查每个 `compositions/beat-N.html`。[step-5-build.md](references/step-5-build.md) 中包含逐节拍检查清单。

---

## 步骤 6：验证与交付

**阅读：** [references/step-6-validate.md](references/step-6-validate.md)

执行 lint、验证，并根据视频长度生成一定数量的快照（公式：`max(beats × 3, ceil(duration_seconds / 2))`），然后逐一审查。在交付前修复所有问题。交付 localhost Studio 项目 URL——仅在用户明确要求时才渲染为 MP4。

**交付令你引以为傲的作品。** 在移交之前，问问自己：我愿意署上自己的名字，把它发布到社交媒体上吗？如果不愿意，就修复其中的问题。

**关卡：** `npx hyperframes lint` 和 `npx hyperframes validate` 均以零错误通过，且最终回复中包含有效的 Studio 项目 URL。

---

## 快速参考

### 视频类型

以下是不同视频类型的典型约束——将其作为起点，而不是固定公式。节拍数量应由内容和旁白决定，而不是由目标范围决定。

| 类型                  | 典型时长 | 时长决定因素    | 旁白             |
| --------------------- | ---------------- | ------------------ | --------------------- |
| 社交广告（IG/TikTok） | 10–15 秒           | 平台限制     | 可选              |
| 产品演示          | 30–60 秒           | 脚本长度      | 全程旁白        |
| 功能发布  | 15–30 秒           | 功能复杂度 | 全程旁白        |
| 品牌短片            | 20–45 秒           | 音乐曲目        | 可选，以音乐为主 |
| 发布预告         | 10–20 秒           | 开场吸引力        | 极少               |

节拍数被有意排除在此表之外——它应该来自故事板，而不是来自“社交广告 = 3-4 个节拍”这样的固定规则。复杂产品的社交广告可能需要 5 个时机精准的节拍。具有一个鲜明视觉主旨的品牌短片可能只需要 3 个。

### 格式

- **横屏**：1920x1080（默认）
- **竖屏**：1080x1920（Instagram Stories、TikTok）
- **方形**：1080x1080（Instagram feed）

### 参考文件

| 文件                                                                               | 何时阅读                                                                                                                                   |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [step-0-capture.md](references/step-0-capture.md)                                  | 步骤 0——采集并理解品牌和产品，编写策略优先的网站摘要                                                          |
| [step-1-design.md](references/step-1-design.md)                                    | 步骤 1——编写 DESIGN.md 品牌速查表（5 个部分，250-350 行；对于广告牌风格的社交广告，可采用 50 行的快速路径）                       |
| [step-2-brief.md](references/step-2-brief.md)                                      | 步骤 2——与用户就信息、叙事弧线和受众达成一致                                                                                   |
| [capabilities.md](references/capabilities.md)                                      | 步骤 2 和 5——HyperFrames 功能的完整清单（24 个部分）。在需求简报阶段浏览目录，在构建阶段深入阅读特定部分 |
| [step-3-storyboard.md](references/step-3-storyboard.md)                            | 步骤 3——故事板 + 脚本（合并进行），并设置用户审核关卡                                                                                  |
| [step-4-vo.md](references/step-4-vo.md)                                            | 步骤 4——TTS 提供商选择、生成和时序安排                                                                                               |
| [step-5-build.md](references/step-5-build.md)                                      | 步骤 5——构建 index.html + 合成内容                                                                                                       |
| [step-6-validate.md](references/step-6-validate.md)                                | 步骤 6——代码检查、验证、快照（根据视频长度调整）和预览                                                                           |
| [techniques.md](../hyperframes/references/techniques.md)                           | 步骤 3 和 5——13 种基础动画技术及代码模式（应进行调整，不要复制粘贴）                                                   |
| [html-in-canvas-patterns.md](../hyperframes/references/html-in-canvas-patterns.md) | 步骤 5——HTML-in-Canvas 效果的完整代码模式（位于 hyperframes skill 中）                                                    |