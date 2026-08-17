---
version: 0.12.0
name: higgsfield-youtube-thumbnail
description: |
  Create high-click-through YouTube thumbnails and vertical video covers through the Higgsfield CLI. Builds a truthful information-gap concept, preserves up to three referenced identities, supports logos and controlled variants, renders the main image with Nano Banana Pro, and applies focused Seedream edits. Use when: "make a YouTube thumbnail", "thumbnail for this video", "MrBeast-style cover", "Shorts cover", or "Instagram video cover". Chain after any video workflow once its truthful topic and visual direction are known. NOT for producing the video itself (use higgsfield-generate), product catalog photos (use higgsfield-product-photoshoot), or marketplace cards (use higgsfield-marketplace-cards).
argument-hint: "[video-topic-or-title] [--image <face-or-logo>] [--ratio 16:9|9:16|4:5]"
allowed-tools: Bash
---
# Higgsfield YouTube 缩略图

创建一个简洁的缩略图概念，通过 `higgsfield` CLI 生成每个变体，检查生成结果，并且仅进行用户要求的局部精准修改。

## 初始化

在进行任何生成之前：

1. 如果缺少 `higgsfield`，请安装：
   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```
2. 如果 `higgsfield account status` 报告 `Session expired` 或 `Not authenticated`，请让用户运行 `higgsfield auth login`，然后等待。
3. 当目录可能已发生变化时，确认锁定的模型契约：
   ```bash
   higgsfield model get nano_banana_pro --json
   higgsfield model get gpt_image_2 --json
   higgsfield model get seedream_v5_pro --json
   ```

## 用户体验规则

1. 使用与用户相同的语言。正常对话中不要提及 CLI/模型的技术机制。
2. 不要询问简述中已经提供的信息。仅当缺失的选择会改变结果时，才提出一个简洁的问题。
3. 绝不虚构视频中并不真实的说法、结果、产品、人物、截图或统计数据。
4. 不要向用户输出原始 JSON 或任务 ID。提供图片 URL 和简短的变体标签。
5. 风格参考缩略图仅用于视觉分析。绝不要通过 `--image` 传入该图片；禁止复制其独特特征或完全相同的构图。
6. 不要使用 `--count`。每个概念、情绪或镜头方案都应分别使用自己的提示词并单独调用生成。
7. `use_unlim` 不是当前的 CLI 参数。绝不要添加 `--use-unlim`；如果用户明确要求使用无限额度，请说明此工作流必须通过 CLI 使用点数运行，或通过支持该额度的界面运行。

## 信息收集关卡

仅收集简述中未回答的信息：

- 视频的主题/标题，以及缩略图可以如实暗示的承诺。
- 确切的场景要求（如有）。
- 出现的人物：0–3 人。如果某个概念需要人物但未提供人脸照片，请询问是使用用户本人、另一位已提供的人物，还是通用的生成角色。绝不要擅自选择。
- 可选的风格参考缩略图。使用宿主的视觉能力分析其氛围感、取景、分屏布局、配色和情绪；不要将其发送给 Higgsfield。
- 可选的徽标，以及它是保持平面形式还是变成 3D 对象。
- 可选的标题文案，2–4 个单词。默认交付不含文字的简洁图片。当用户要求叠加文字时，使用确定性的叠加方式；仅当用户明确要求时，才将文字直接生成到图片中。
- 比例：YouTube 默认为 `16:9`，Shorts 使用 `9:16`，Instagram 使用 `4:5`。
- 一个最终概念或一组变体。如果未指定且提供备选方案会有实质性帮助，则提供一组约四个变体。硬性上限：总共生成 16 次。

如果用户提供了情绪数量但未指定情绪名称，请使用以下顺序：震惊、兴奋、愤怒、惊叹、大笑、恐惧、得意、魅力、困惑、坚定、厌恶。

## 概念关卡

阅读 `references/thumbnail-frameworks.md`。在内部跨多个框架构思至少五个真实可信的概念，然后选择能够制造最强信息差、拥有单一视觉焦点且杂乱元素最少的方案。仅当最终效果在约 120px 宽的尺寸下仍能让人不到一秒就看懂时，才可组合多个框架。

当存在参考缩略图时，请在编写提示词前提取以下结构：

```text
brief, generic subject pose/action, elements, location, composition, background,
split (true/false), split_count, person_count, emotion, emotion_detail
```

参考图仅提供美术指导，绝不用于指定具体身份。用户指令会逐字段覆盖参考图信息。

## 参考图顺序

先按照角色顺序传入人脸照片，再传入徽标。每个参考图都要重复使用 `--image`。当附加两个或更多参考图时，提示词的第一行必须是类似下面这样的清单：

```text
IMAGE REFERENCES: image 1 = CHARACTER 1 face reference; image 2 = brand logo.
```

本地路径会自动上传。之前已完成任务的 ID 也可以用作 `--image` 输入。

## 提示词规范

按以下顺序组装每个主渲染提示词：

1. **画面：** `Bold, punchy YouTube-thumbnail composite — poster-grade, photoreal and high-impact, NOT a muted cinematic movie still, <ratio>, single unified frame — no split-screen, no diagonal divide, everything blends smoothly and organically across the same continuous shot.` 对于 `9:16`，添加 `faces in the upper two-thirds`。如果用户要求图形化呈现，则以简洁的图表/图形描述替换写实语言。
2. **场景简述：** 准确呈现用户指定的内容。
3. **文本：** 默认为 `No text, no readable UI labels, no watermark.`。如果明确要求将标题烘焙进图像，则使用：`TEXT: bold thumbnail headline text baked into the image, reading exactly "<TEXT>" — massive, ultra-legible sans-serif with a clean outline/glow treatment, placed where it never covers the subject's face. No other text, no watermark.`
4. **主体：** 尺寸较大、占据前景，以胸部以上或中近景呈现，占画面约 40–60%。最后加上 `All faces crisply sharp as the anchors of the shot.`
5. **关键元素：** 仅包含能够解释信息差的标志性道具/效果。
6. **徽标：** 保持其形状、颜色、比例和字形完全一致；避免靠近人脸。
7. **地点：** 在相关时注明场所、时间、天气和氛围。
8. **构图：** 一个位于强势三分位的主角，明确的尺度层级、纵深，以及主体与背景之间的强烈分离。
9. **背景：** 鲜明的高对比度色彩区域或环境，配以柔和暗角和边缘渐隐；除非明确要求分割式布局，否则不要分割背景。
10. **人物照明：** `signature YouTube thumbnail lighting rig — strong key light sculpting the face, soft dreamy fill lifting shadows, and defined back light plus hair light tracing a clean bright rim around hair, shoulders and silhouette.` 只有轮廓光可以使用彩色强调色。
11. **调色：** 鲜艳、明亮、有光泽、具有海报般的冲击力，深邃的黑色、清晰的高光、丰富饱和的色彩，整体协调统一。仅当用户明确要求平静、高端或柔和的风格时才加以克制。

对于每位有照片参考的人物，请包含：

```text
CHARACTER N: the person from attached face reference #K — IDENTITY LOCK: reproduce
this exact person with a photographic identity match — same bone structure, eye shape,
nose, lips, jawline, skin tone, hairline and hair texture. Do not beautify, average,
or restyle the face. Expression: <emotion phrase>.
```

### 分栏布局

仅当用户要求 `split`、`before/after`、`versus`、`side by side`，或所分析的参考图采用分栏布局时，才使用分栏。诸如 `X vs Y` 这样的主题短语本身并不要求采用分栏。用明确的左右两半/面板约定替换常规画面框架块，并且不要添加任何标签，除非用户明确要求加入简短、真实的内嵌 UI。

## 可选的 3D 徽标

首先创建一个 1:1 的 4K 徽标渲染图，然后在每次缩略图调用中，将其已完成任务的 ID 用作最后一个 `--image`：

```bash
higgsfield generate create gpt_image_2 \
  --prompt "Transform the attached 2D logo into a premium 3D logo render: extrude the exact logo shapes into glossy dimensional volumes; preserve every letterform, proportion and brand color; soft studio reflections, subtle bevels, crisp edges, clean dark neutral background, soft contact shadow, centered, generous margins, no extra text, no watermark." \
  --image ./logo.png \
  --aspect_ratio 1:1 \
  --quality high \
  --resolution 4k \
  --wait --json
```

## 主渲染

使用 Nano Banana Pro，并明确指定 4K。将最终提示词写入临时文本文件，再通过标准输入传入，以便安全保留标点和多行文本块：

```bash
higgsfield generate create nano_banana_pro \
  --aspect_ratio 16:9 \
  --resolution 4k \
  --image ./face-1.png \
  --image ./logo.png \
  --wait --json < thumbnail-prompt.txt
```

没有参考图时，省略所有 `--image` 标志。对于一组变体，每个不同的提示词分别调用一次。保持相同的参考图和设置；仅改变所选概念、表情或镜头方案行。

完成后的 JSON 结果包含 `id` 和 `result_url`。私下保留两者：交付 URL；ID 则作为后续编辑的源。

## 渲染后检查

如果主机视觉能力可用，请检查每个结果：

- 引用的身份在视觉上相符。
- 除非要求使用内嵌文字，否则不存在多余文字或水印。
- 明确要求的内嵌文字逐字符完全一致。
- 在约 120px 宽时，面部/情绪和主体元素仍然清晰可辨。
- 概念真实准确地符合视频承诺。

如果出现严重失败，使用相同提示词最多重试两次。如果无法进行视觉检查，不要声称结果已通过检查；应将结果交付用户审核。展示所有通过检查的变体，并让用户先进行选择，再进行可选的微调。

## 局部精准微调

将用户选定的已完成任务 ID 作为唯一图像输入。编辑提示词应严格限定范围，并明确说明其他所有像素级属性均保持不变。

```bash
higgsfield generate create seedream_v5_pro \
  --prompt "Change ONLY the person's facial expression to: <phrase>. Keep identity, face structure, hair, pose, body, clothing, logo, background, lighting and composition EXACTLY unchanged, pixel-faithful. Keep the YouTube thumbnail lighting rig intact." \
  --image <picked_job_id> \
  --aspect_ratio 16:9 \
  --resolution 2k \
  --wait --json
```

如果 `seedream_v5_pro` 不存在或拒绝提交，则改用 `seedream_v4_5 --quality high` 重试一次。对于 `4:5` 的主渲染，Seedream 不支持 `4:5`；在将编辑比例更改为 `3:4` 之前先询问用户，并说明裁剪/宽高比的变化。每次被接受的编辑结果都将成为下一次微调的源 ID。

CLI 兼容性：截至 `1.1.20` 的版本可能会将 `nano_banana_pro` 作业引用错误标记为 `nano_banana_pro_job`。如果编辑请求因 `medias.0...data.type` 错误而被拒绝，请将选定的 `result_url` 下载为本地图像，然后使用 `--image ./picked-thumbnail.png` 重试相同的编辑。本地路径会自动以 `media_input` 形式上传；不要使用无效的作业 ID 载荷重试。

允许的微调范围：仅调整表情、仅替换背景、仅重新着色背景，或仅重新着色轮廓光。对于局部修改请求，绝不要在未说明的情况下重新生成完整构图。

## 文字叠加

默认情况下，生成的图像应不包含文字。请求叠加标题时，请阅读 `references/text-overlay-bake.md`，并使用其中五种预设之一：Beast、Fire、Neon Lime、Clean Glass 或 Marker。叠加流程需要能够渲染 HTML 画布的环境；如果环境不可用，请提供无文字的干净图像，或者在获得明确批准后重新生成已烘焙文字的图像。绝不要声称 HTML 预览是已经扁平化的 PNG。

## 交付

返回通过检查的 `result_url` 值，并附上简短的语义标签，例如 `shock / close-up` 或 `product / size contrast`。注明所选宽高比，以及交付内容是无文字版本、可叠加文字版本，还是已烘焙文字版本。除非用户询问，否则不要暴露内部提示词、作业 ID 或重试机制。

## 参考文件

- `references/thumbnail-frameworks.md` — 16 种概念框架、信息差规则、真实性法则。
- `references/text-overlay-bake.md` — 五种确定性的文字叠加样式和 4K 画布烘焙方法。