---
name: generate-image
description: Generate or edit images with AI models through the OpenRouter Image API (Gemini, Seedream, Recraft, GPT-Image, Riverflow). Use for photos, illustrations, artwork, concept art, visual assets, logos, and image editing or compositing from reference images. For flowcharts, circuits, pathways, and other technical diagrams, use the scientific-schematics skill instead.
license: MIT
compatibility: Requires Python 3.9+ and network access to openrouter.ai. The bundled script uses only the standard library. Image generation requires the OPENROUTER_API_KEY credential and bills per request; listing models, inspecting a model, and --dry-run do not. Targets the OpenRouter Image API (POST /api/v1/images) as verified on 2026-07-31.
allowed-tools: Read Write Edit Bash
metadata:
  version: "3.0"
  skill-author: K-Dense Inc.
  last-reviewed: "2026-07-31"
  openclaw:
    primaryEnv: OPENROUTER_API_KEY
    envVars:
      - name: OPENROUTER_API_KEY
        required: true
        description: OpenRouter API key used for image generation.
---
# 生成图像

通过 OpenRouter 的 Image API 生成和编辑图像，该 API 可通过统一的请求格式调用 Gemini、Seedream、Recraft、
GPT-Image、Riverflow 以及其他约三十种模型。

## 使用时机

**将此技能用于：** 照片和写实图像、插画和艺术作品、概念艺术、演示文稿和海报视觉设计、
徽标和矢量图形、图像编辑，以及基于参考图像的合成。

**以下情况请改用 `scientific-schematics`：** 流程图、电路图、生物通路图、系统架构图、CONSORT 图以及其他技术示意图。

## API 密钥

生成图像需要 OpenRouter 密钥。脚本按以下顺序解析密钥：

1. `--api-key`
2. `OPENROUTER_API_KEY` 环境变量
3. `.env` 文件中的 `OPENROUTER_API_KEY=`，先从工作目录向上搜索，然后搜索脚本所在目录

如果不存在密钥，脚本会退出并显示设置说明。密钥地址：https://openrouter.ai/keys

`--list-models`、`--model-info` 和 `--dry-run` 无需密钥。

## 快速开始

```bash
# Generate
python scripts/generate_image.py "A beautiful sunset over mountains"

# Edit an existing image
python scripts/generate_image.py "Make the sky purple" -i photo.jpg -o edited.png
```

路径相对于此技能的目录。输出文件默认为 `generated_image.<ext>`，其中扩展名遵循模型返回的媒体类型。
每次请求的费用会在运行结束后打印。

**然后查看图像。** 在任何地方使用图像之前，先读取文件并检查：构图、宽高比以及其中的文字，都是模型可能在不提示的情况下出错的部分。

## 选择模型

默认模型：`google/gemini-3.1-flash-image`。

| 需求 | 模型 |
| --- | --- |
| 通用质量、提示词遵循度 | `google/gemini-3.1-flash-image` |
| Gemini 最高等级 | `google/gemini-3-pro-image` |
| 低成本迭代 | `google/gemini-3.1-flash-lite-image`（仅支持 1K）、`openai/gpt-image-1-mini` |
| 可控制的写实效果、可复现的种子 | `bytedance-seed/seedream-4.5` |
| 每次请求生成多张图像 | `bytedance-seed/seedream-4.5`、`openai/gpt-image-2`（最多 10 张） |
| 矢量 / SVG 输出 | `recraft/recraft-v4.1-vector` |
| 透明背景 | 使用带有 `--background transparent` 的 `openai/gpt-image-1` |
| 图像中的文字清晰可读 | `recraft/recraft-v4.1`、`sourceful/riverflow-v2.5-pro` —— 参见下方的注意事项 |

`references/models.md` 包含完整目录，以及每个模型的参数、允许值和价格。实时列表权威且免费：

```bash
python scripts/generate_image.py --list-models            # every model and its allowed values
python scripts/generate_image.py --list-models gemini     # filtered by substring
python scripts/generate_image.py --model-info openai/gpt-image-1   # one model, plus pricing
```

## 不同模型对参数的支持各不相同

这是最需要正确处理的地方。模型所声明的参数集**以及允许值**各不相同，发送模型不支持的参数会被拒绝，而不是被忽略。

该脚本会在产生任何费用之前，根据实时目录检查请求，因此错误的参数会在不到一秒内在本地失败，并打印出合法值：

```console
$ python scripts/generate_image.py "abstract pattern" -m openai/gpt-image-2 --background transparent
Error: Request rejected before billing (1 problem):
  - background=transparent is not allowed; this model accepts: auto, opaque
```

粗略指南——但应以检查结果为准，因为目录会不断变化：

- `--resolution` — Gemini、Seedream、Riverflow、Krea、Grok。各模型支持的档位不同：只有 Gemini
  3.1 Flash 支持 `512`，Gemini 3 Pro / Seedream / Riverflow 支持 `4K`，而 **只有**
  `gemini-3.1-flash-lite-image` 和 Krea 模型支持 `1K`。
- `--output-format` — 仅限 Riverflow 2.5（`png`、`jpeg`、`webp`；`fast` 变体仅接受 `jpeg`）。
  Gemini、OpenAI、Seedream 和 Recraft 都会自行选择容器格式。
- `--quality`、`--background`、`--output-compression` — OpenAI 系列，以及 Riverflow 2.5
  的 `--background`。**`--background transparent` 不适用于 `gpt-image-2` 或
  `gpt-5.4-image-2`**——请使用 `gpt-image-1`、`gpt-image-1-mini`、`gpt-5-image` 或
  `gpt-5-image-mini`。
- `--seed` — Seedream 和 Krea 支持。不支持 Gemini 和 OpenAI。
- `--aspect-ratio` — 几乎所有模型都支持，但枚举值差异很大：`gpt-image-1` 仅接受
  `1:1`、`3:2`、`2:3`、`auto`，而 `gpt-5-image*` 完全不接受该参数。
- `--n` — 每个模型都有上限：Gemini、Riverflow、MAI 和 Grok 为 1，Recraft 为 6，Seedream
  和 OpenAI 为 10。Krea 模型会直接拒绝该参数。

传入 `--dry-run` 可进行验证，并打印出未经生成或计费的完整请求正文。
当你希望由 API 自行裁定时，可使用 `--no-preflight` 跳过检查。

## 编写提示词

提示词质量对输出质量的影响大于模型选择。请分别用一句话说明：

1. **主体** — 画面中有什么，以及主体占多大比例。“96 孔板上方的一根移液器吸头。”
2. **媒介和风格** — 摄影、水彩画、3D 渲染、扁平矢量图、科学插图。
3. **光线和配色** — “柔和的漫射光，冷蓝色和白色的配色。”
4. **构图** — “广角镜头，主体位于中心偏左，右侧留出空白区域放置标题。”
5. **需要避免的内容** — “不要有文字、标签或水印。”

对于海报和幻灯片而言，要求为说明文字或标题预留空白区域，是最有用的构图指令。

以低成本迭代：先使用 `gemini-3.1-flash-lite-image` 打草稿，然后用你实际想要的模型重新生成已经确定的措辞。
如果要优化而不是重新开始，请将上一次的输出作为参考图传入（`-i out.png`），并只描述需要修改的内容。

## 编辑和参考图像

`-i/--input` 可重复使用，并接受本地路径、HTTP(S) URL 或数据 URL。本地文件会进行
base64 编码，并作为 `input_references` 发送。

```bash
# 编辑单张图像
python scripts/generate_image.py "Add sunglasses to the person" -i portrait.png

# 合成多个参考图像
python scripts/generate_image.py "Blend these two styles" -i style_a.png -i style_b.jpg -o blend.png

# 引用网上已有的图像
python scripts/generate_image.py "Restyle as a watercolor" -i https://example.com/photo.jpg
```

参考图数量上限各不相同：OpenAI 为 16，Gemini 和 Seedream 为 14，`riverflow-v2*-pro` 为 10，`gemini-2.5-flash-image` 和 Grok 为 3，Recraft、MAI 和 Krea 为 1。本地支持的格式：PNG、JPEG、GIF、WebP。Riverflow v2 会在输出费用之外，按每张参考图额外收取 $0.20。

## 示例

`-o` 路径是脚本创建的目标路径，并不是随 skill 一起提供的文件。

```bash
# Wide hero image for a poster, with space reserved for the title
python scripts/generate_image.py \
  "Laboratory with modern equipment, photorealistic, well-lit, wide shot, \
   equipment on the left, empty wall on the right, no text" \
  --aspect-ratio 21:9 --resolution 2K -o poster/hero.png

# Conceptual illustration for a manuscript — illustrative, never presented as data
python scripts/generate_image.py \
  "Stylised illustration of immune cells surrounding a tumour cell, scientific illustration, \
   cool palette, no text" \
  --resolution 2K -o figures/immunotherapy_concept.png

# Vector logo
python scripts/generate_image.py \
  "Minimal geometric fox logo, two colors" \
  -m recraft/recraft-v4.1-vector -o assets/logo.svg

# Slide background with a transparent alpha channel
python scripts/generate_image.py \
  "Abstract molecular pattern, subtle, blue and white, no text" \
  -m openai/gpt-image-1 --background transparent -o slides/bg.png

# Four variations in one request
python scripts/generate_image.py \
  "Stylized neuron network illustration" \
  -m bytedance-seed/seedream-4.5 --n 4 -o variations.png
# -> variations_1.png ... variations_4.png

# Reproducible output
python scripts/generate_image.py "A cat astronaut" \
  -m bytedance-seed/seedream-4.5 --seed 42

# Check a request costs nothing to get wrong
python scripts/generate_image.py "A cat astronaut" --resolution 4K --dry-run
```

## 脚本参数

| Flag | 用途 |
| --- | --- |
| `prompt` | 图像描述，或要应用的编辑操作（除非使用 `--list-models` / `--model-info`，否则必填） |
| `-m`, `--model` | 模型 slug（默认 `google/gemini-3.1-flash-image`） |
| `-o`, `--output` | 输出路径；扩展名默认为返回的媒体类型 |
| `-i`, `--input` | 参考图 — 路径、URL 或 data URL。可重复指定 |
| `--n` | 每次请求生成的图像数量，受模型限制 |
| `--aspect-ratio` | `1:1`、`16:9`、`9:16`、`4:3`、`3:2`、`21:9`、… — 各模型的枚举值不同 |
| `--resolution` | `512`、`1K`、`2K`、`4K` — 各模型的分辨率档位不同 |
| `--quality` | `auto`、`low`、`medium`、`high`（OpenAI） |
| `--output-format` | `png`、`jpeg`、`webp`（Riverflow 2.5） |
| `--background` | `auto`、`transparent`、`opaque` |
| `--output-compression` | 0–100，OpenAI 模型 |
| `--seed` | 在支持的情况下生成确定性输出 |
| `--api-key` | 覆盖环境变量和 `.env` |
| `--timeout` | 请求超时时间，单位为秒（默认 300） |
| `--retries` | 针对速率限制和 5xx 响应的重试次数（默认 2） |
| `--no-preflight` | 跳过计费请求之前的免费能力检查 |
| `--dry-run` | 验证并打印请求，然后退出而不生成图像 |
| `--list-models` | 打印包含允许值的模型目录，可选择筛选后再退出 |
| `--model-info` | 打印某个模型的允许值和定价，然后退出 |

不存在 `--size`：目录中的模型都不接受 `size` 参数。使用
`--aspect-ratio` 和 `--resolution` 调整输出形状。

## API 结构

无需脚本直接发送请求：

```bash
curl -s https://openrouter.ai/api/v1/images \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-3.1-flash-image",
    "prompt": "A red bicycle against a white wall",
    "aspect_ratio": "16:9"
  }'
```

响应：

```json
{
  "created": 1748372400,
  "data": [{ "b64_json": "<base64>", "media_type": "image/png" }],
  "usage": {
    "prompt_tokens": 4,
    "completion_tokens": 1120,
    "total_tokens": 1124,
    "cost": 0.0672,
    "completion_tokens_details": { "image_tokens": 1120 }
  }
}
```

`b64_json` 是原始 base64，**不是**数据 URL。`media_type` 反映实际格式，因此命名文件时应遵循该字段——矢量模型返回 `image/svg+xml`，而 `gemini-3.1-flash-lite-image` 返回的是 JPEG，而不是 PNG。

流式传输（`"stream": true`）会发出 `image_generation.partial_image`、`image_generation.completed`
和 `error` 事件，并以 `data: [DONE]` 结束。只有 OpenAI 模型支持此功能，内置脚本不会使用它。

计费是全有或全无：生成要么完成并全额计费，要么失败且不计费——因此，被拒绝的参数只会浪费时间，不会产生费用。流式预览帧不会单独收费。在自带密钥的账户中，`usage.cost` 显示为 `0`，实际金额位于
`cost_details.upstream_inference_cost`；脚本会报告该数值，而不是声称此次运行是免费的。

## 费用

按图像计费的模型费用较为可预测：Seedream $0.04、Recraft v4.1 $0.035（vector $0.08，pro $0.21）、
Riverflow 2.5 fast $0.019 和 pro $0.13–0.17，Grok $0.05–0.07。

Gemini、OpenAI 和 MAI 按输出 token 计费，费用会随分辨率增加——4K 图像的费用大约是一张 1K 图像的
十六倍。实测结果：一张 1K 的 `gemini-3.1-flash-lite-image` 图像需要 1120 个输出 token，费用为
$0.034。同样尺寸下，`gemini-3.1-flash-image` 的费用是其两倍，而 `gemini-3-pro-image` 是其四倍。先用低分辨率和廉价模型生成草稿；确定后再为尺寸付费。

## 注意事项和限制

- **不能相信模型生成的文本。** 生成图像中的文字可能拼写错误、乱码或凭空捏造。要求生成“无文字”图像，然后在 LaTeX、PowerPoint 或 HTML 中叠加真实文字——或者在标签是重点时使用
  `scientific-schematics`。
- **生成的图像是插图，绝不是证据。** 它没有展示任何经过测量的内容。绝不要将其当作显微镜、成像、凝胶或仪器输出，绝不要让它替代报告结果的图，并在图注中将其标注为插图。《Nature》和《Science》都要求披露生成式 AI 图像，且一些期刊禁止在明确标注的概念艺术之外使用此类图像——投稿前请确认目标期刊的要求。
- 生成是一次付费的 API 调用。在反复调整措辞时，优先使用廉价模型和低分辨率。
- 生成大约需要 5–60 秒，具体取决于模型和分辨率。
- 参考图像会上传到 OpenRouter。不要发送未发表或敏感数据、患者图像或任何处于禁运期的数据。
- 绝不要硬编码 API 密钥。将其保存在环境变量或被忽略的 `.env` 文件中。
- 编辑时应提供具体提示：“将天空改为日落色调”胜过“编辑天空”。
- 拒绝会以提及内容政策的 HTTP 400 或 403 响应返回，而不是返回一张糟糕的图像。请改写提示——临床和解剖主题比请求本身所应有的程度更容易触发审核。
- 速率限制和 5xx 响应会自动重试；4xx 响应是最终结果，因为需要更改的是请求本身。

## 相关技能

- `scientific-schematics` — 技术示意图、流程图、电路图、通路图
- `scientific-slides` — 嵌入生成视觉素材的演示文稿
- `latex-posters` — 嵌入主视觉图像的海报