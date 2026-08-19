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

通过 OpenRouter 的 Image API 生成和编辑图像。该 API 可通过一种统一的请求格式访问 Gemini、Seedream、Recraft、GPT-Image、Riverflow 以及其他约三十种模型。

## 适用场景

**在以下场景使用此 skill：** 照片和写实图像、插画和艺术作品、概念艺术、演示文稿和海报视觉素材、徽标和矢量图形、图像编辑，以及基于参考图像的合成。

**以下场景请改用 `scientific-schematics`：** 流程图、电路图、生物通路、系统架构图、CONSORT 图以及其他技术示意图。

## API key

生成图像需要 OpenRouter key。脚本按以下顺序解析：

1. `--api-key`
2. `OPENROUTER_API_KEY` 环境变量
3. `.env` 文件中的 `OPENROUTER_API_KEY=`，搜索范围先从工作目录向上查找，然后查找脚本自身所在目录

如果不存在上述任何一项，脚本会退出并显示设置说明。获取 key：https://openrouter.ai/keys

`--list-models`、`--model-info` 和 `--dry-run` 无需 key。

## 快速开始

```bash
# Generate
python scripts/generate_image.py "A beautiful sunset over mountains"

# Edit an existing image
python scripts/generate_image.py "Make the sky purple" -i photo.jpg -o edited.png
```

路径均相对于此 skill 所在目录。输出文件默认为 `generated_image.<ext>`，其中扩展名取决于模型返回的媒体类型。运行结束后会打印本次请求的费用。

**然后查看图像。** 在任何地方使用图像之前，先读回文件并检查：构图、宽高比以及其中的任何文字，都是模型可能在不提示的情况下出错的地方。

## 选择模型

默认模型：`google/gemini-3.1-flash-image`。

| 需求 | 模型 |
| --- | --- |
| 综合质量、遵循提示词 | `google/gemini-3.1-flash-image` |
| 最高等级的 Gemini | `google/gemini-3-pro-image` |
| 低成本迭代 | `google/gemini-3.1-flash-lite-image`（仅 1K）、`openai/gpt-image-1-mini` |
| 可控的写实效果、可复现的种子 | `bytedance-seed/seedream-4.5` |
| 每次请求生成多张图像 | `bytedance-seed/seedream-4.5`、`openai/gpt-image-2`（最多 10 张） |
| 矢量 / SVG 输出 | `recraft/recraft-v4.1-vector` |
| 透明背景 | 使用 `--background transparent` 的 `openai/gpt-image-1` |
| 图像中包含清晰可读的文字 | `recraft/recraft-v4.1`、`sourceful/riverflow-v2.5-pro` —— 请参阅下面的注意事项 |

`references/models.md` 包含完整目录，以及每个模型的参数、允许值和价格。实时列表是权威来源，并且免费：

```bash
python scripts/generate_image.py --list-models            # every model and its allowed values
python scripts/generate_image.py --list-models gemini     # filtered by substring
python scripts/generate_image.py --model-info openai/gpt-image-1   # one model, plus pricing
```

## 不同模型支持的参数各不相同

这是最需要注意的地方。不同模型声明的参数集**以及允许值**各不相同；发送模型不支持的内容会被拒绝，而不是被忽略。

该脚本会在产生任何费用之前，使用实时目录检查请求，因此错误的参数会在不到一秒内在本地失败，并打印出合法值：

```console
$ python scripts/generate_image.py "abstract pattern" -m openai/gpt-image-2 --background transparent
Error: Request rejected before billing (1 problem):
  - background=transparent is not allowed; this model accepts: auto, opaque
```

粗略指南——但应以检查结果为准，因为目录会发生变化：

- `--resolution` — Gemini、Seedream、Riverflow、Krea、Grok。各模型的档位不同：`512` 仅适用于 Gemini
  3.1 Flash，`4K` 适用于 Gemini 3 Pro / Seedream / Riverflow，而 **`1K` 仅适用于**
  `gemini-3.1-flash-lite-image` 和 Krea 模型。
- `--output-format` — 仅适用于 Riverflow 2.5（`png`、`jpeg`、`webp`；`fast` 变体仅接受 `jpeg`）。
  Gemini、OpenAI、Seedream 和 Recraft 都会自行选择容器格式。
- `--quality`、`--background`、`--output-compression` — OpenAI 系列，以及 Riverflow 2.5 上的
  `--background`。**`--background transparent` 不适用于 `gpt-image-2` 或
  `gpt-5.4-image-2`** — 请使用 `gpt-image-1`、`gpt-image-1-mini`、`gpt-5-image` 或 `gpt-5-image-mini`。
- `--seed` — Seedream 和 Krea。不适用于 Gemini，也不适用于 OpenAI。
- `--aspect-ratio` — 几乎所有模型都支持，但枚举值差异很大：`gpt-image-1` 仅接受
  `1:1`、`3:2`、`2:3`、`auto`，而 `gpt-5-image*` 完全不接受该参数。
- `--n` — 每个模型都有上限：Gemini、Riverflow、MAI 和 Grok 为 1，Recraft 为 6，Seedream
  和 OpenAI 为 10。Krea 模型会直接拒绝该参数。

传入 `--dry-run` 可在不生成图像或产生费用的情况下进行验证，并打印出完全一致的请求正文。
如果希望由 API 自行裁决，可使用 `--no-preflight` 跳过检查。

## 编写提示词

提示词质量对输出质量的影响大于模型选择。请分别用一句话说明以下内容：

1. **主体** — 画面中有什么，以及占据多少画面。“96 孔板上方的一支吸头。”
2. **媒介和风格** — 照片、水彩画、3D 渲染、扁平矢量图、科学插图。
3. **光线和配色** — “柔和的漫射光，冷蓝色和白色的配色。”
4. **构图** — “广角镜头，主体位于中心偏左，右侧留出用于标题的空白。”
5. **需要避免的内容** — “不要有文字、标签或水印。”

对于海报和幻灯片而言，要求为说明文字或标题预留空白，是最有用的构图指令。

以较低成本进行迭代：先使用 `gemini-3.1-flash-lite-image` 起草，然后使用你实际想要的模型重新生成已确定措辞的提示词。
如果要进行优化而不是重新开始，请将上一次的输出作为参考图传回（`-i out.png`），并仅描述需要修改的内容。

## 编辑和参考图像

`-i/--input` 可重复使用，并接受本地路径、HTTP(S) URL 或数据 URL。本地文件会进行 base64 编码，并作为
`input_references` 发送。

```bash
# Single-image edit
python scripts/generate_image.py "Add sunglasses to the person" -i portrait.png

# Composite several references
python scripts/generate_image.py "Blend these two styles" -i style_a.png -i style_b.jpg -o blend.png

# Reference an image already on the web
python scripts/generate_image.py "Restyle as a watercolor" -i https://example.com/photo.jpg
```

参考图数量限制各不相同：OpenAI 为 16，Gemini 和 Seedream 为 14，`riverflow-v2*-pro` 为 10，`gemini-2.5-flash-image` 和 Grok 为 3，Recraft、MAI 和 Krea 为 1。接受的本地格式：PNG、JPEG、GIF、WebP。Riverflow v2 除输出费用外，还会按每张参考图收取 $0.20。

## 示例

`-o` 路径是脚本创建的目标路径，并不是随 skill 打包的文件。

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

| Flag | Purpose |
| --- | --- |
| `prompt` | 图像描述，或要应用的编辑操作（除非使用 `--list-models` / `--model-info`，否则为必填） |
| `-m`、`--model` | 模型 slug（默认 `google/gemini-3.1-flash-image`） |
| `-o`、`--output` | 输出路径；扩展名默认为返回的媒体类型 |
| `-i`、`--input` | 参考图——路径、URL 或 data URL。可重复指定 |
| `--n` | 每次请求生成的图像数量，受模型限制 |
| `--aspect-ratio` | `1:1`、`16:9`、`9:16`、`4:3`、`3:2`、`21:9`、…——不同模型的枚举值不同 |
| `--resolution` | `512`、`1K`、`2K`、`4K`——不同模型的分辨率等级不同 |
| `--quality` | `auto`、`low`、`medium`、`high`（OpenAI） |
| `--output-format` | `png`、`jpeg`、`webp`（Riverflow 2.5） |
| `--background` | `auto`、`transparent`、`opaque` |
| `--output-compression` | 0–100，OpenAI 模型 |
| `--seed` | 在支持的情况下生成确定性输出 |
| `--api-key` | 覆盖环境变量和 `.env` |
| `--timeout` | 请求超时时间，单位为秒（默认 300） |
| `--retries` | 针对速率限制和 5xx 响应的重试次数（默认 2） |
| `--no-preflight` | 跳过计费请求前的免费能力检查 |
| `--dry-run` | 验证并打印请求，然后退出而不生成图像 |
| `--list-models` | 打印包含允许值的模型目录，可选择过滤，然后退出 |
| `--model-info` | 打印某个模型的允许值和定价，然后退出 |

不存在 `--size`：目录中的模型都不接受 `size` 参数。使用
`--aspect-ratio` 和 `--resolution` 调整输出形状。

## API 形式

对于不使用脚本的直接请求：

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

`b64_json` 是原始 base64，**不是**数据 URL。`media_type` 反映实际格式，因此命名文件时应遵循该字段 — 矢量模型返回
`image/svg+xml`，而 `gemini-3.1-flash-lite-image` 返回的是
JPEG，而不是 PNG。

流式传输（`"stream": true`）会发出 `image_generation.partial_image`、`image_generation.completed`
和 `error` 事件，最后以 `data: [DONE]` 终止。只有 OpenAI 模型支持此功能，随附的
脚本不会使用它。

计费是非此即彼的：一次生成要么完成并全额计费，要么失败且不计费 — 因此，被拒绝的参数只会耗费时间，不会产生费用。流式预览帧不会单独收费。在自带密钥的账户上，`usage.cost` 显示为 `0`，实际金额位于
`cost_details.upstream_inference_cost` 中；脚本会报告该数值，而不会声称此次运行是免费的。

## 成本

按图像计费的模型成本可预测：Seedream $0.04、Recraft v4.1 $0.035（vector $0.08、pro $0.21）、
Riverflow 2.5 fast $0.019、pro $0.13–0.17，以及 Grok $0.05–0.07。

Gemini、OpenAI 和 MAI 按输出 token 计费，费用会随分辨率增加 — 一张 4K 图像的成本
大约是一张 1K 图像的十六倍。实测：一次 1K `gemini-3.1-flash-lite-image` 渲染会产生 1120
个输出 token，费用为 $0.034。同样尺寸下，`gemini-3.1-flash-image` 的费用是其两倍，
`gemini-3-pro-image` 是其四倍。使用低分辨率和低价模型进行草稿生成；确定尺寸后再付费。

## 注意事项和限制

- **不能相信模型生成的文字。** 生成图像中的文字可能拼写错误、
  乱码或凭空捏造。要求生成“无文字”图像，然后在 LaTeX、PowerPoint 或 HTML 中叠加真实文字 — 或者
  在标签是重点时使用 `scientific-schematics`。
- **生成的图像是插图，绝不是证据。** 它没有展示任何经过测量的内容。
  绝不要将其呈现为显微镜图像、成像结果、凝胶图或仪器输出，绝不要让它替代报告结果的
  图表，并在图注中将其标注为插图。Nature 和 Science 都要求披露生成式 AI 图像的使用情况，多个期刊也禁止在
  明确标注为概念艺术的范围之外使用此类图像 — 投稿前请确认目标期刊的要求。
- 生成是一次付费 API 调用。迭代措辞时，优先使用低价模型和低分辨率。
- 根据模型和分辨率的不同，生成大约需要 5–60 秒。
- 参考图像会上传到 OpenRouter。不要发送未发表或敏感数据、患者图像，或任何处于禁运期的数据。
- 绝不要硬编码 API key。将其保存在环境变量或被忽略的 `.env` 文件中。
- 编辑图像时应给出具体提示：“将天空改为日落色调”优于“编辑天空”。
- 拒绝请求会以提及内容政策的 HTTP 400 或 403 响应返回，而不是生成一张糟糕的图像。请改写提示 —
  临床和解剖学主题比请求本身应有的程度更容易触发审核。
- 速率限制和 5xx 响应会自动重试；4xx 响应是最终结果，因为需要修改的是请求本身。

## 相关技能

- `scientific-schematics` — 技术图表、流程图、电路图、路径图
- `scientific-slides` — 嵌入生成视觉内容的演示文稿
- `latex-posters` — 嵌入主视觉图像的海报