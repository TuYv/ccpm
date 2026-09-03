---
name: openai-image-gen
description: Generate images via OpenAI Images API (GPT Image, DALL-E 3, DALL-E 2). Supports batch generation with random prompt sampler and HTML gallery output. Use when asked to generate images with OpenAI and an OPENAI_API_KEY is available.
metadata:
  {
    "openclaw":
      {
        "emoji": "🎨",
        "requires": { "bins": ["python3"], "env": ["OPENAI_API_KEY"] },
        "primaryEnv": "OPENAI_API_KEY",
        "install":
          [
            {
              "id": "python-brew",
              "kind": "brew",
              "formula": "python",
              "bins": ["python3"],
              "label": "Install Python (brew)",
            },
          ],
      },
  }
---
# OpenAI 图像生成

通过 OpenAI Images API 生成图像，并附带一个 HTML 图库查看器。

## 运行

注意：图像生成所需时间可能超过常规的超时时间。通过 shell 运行时，请设置更高的超时值（例如 300 秒）。

```bash
python3 {baseDir}/scripts/gen.py
```

## 实用标志

```bash
# GPT image models with various options
python3 {baseDir}/scripts/gen.py --count 16 --model gpt-image-1
python3 {baseDir}/scripts/gen.py --prompt "ultra-detailed studio photo of a lobster astronaut" --count 4
python3 {baseDir}/scripts/gen.py --size 1536x1024 --quality high --out-dir ./out/images
python3 {baseDir}/scripts/gen.py --model gpt-image-1.5 --background transparent --output-format webp

# DALL-E 3 (note: count is automatically limited to 1)
python3 {baseDir}/scripts/gen.py --model dall-e-3 --quality hd --size 1792x1024 --style vivid
python3 {baseDir}/scripts/gen.py --model dall-e-3 --style natural --prompt "serene mountain landscape"

# DALL-E 2
python3 {baseDir}/scripts/gen.py --model dall-e-2 --size 512x512 --count 4
```

## 模型专属参数

### 尺寸

- **GPT 图像模型**（`gpt-image-1`、`gpt-image-1-mini`、`gpt-image-1.5`）：`1024x1024`、`1536x1024`（横向）、`1024x1536`（纵向）或 `auto`。默认值：`1024x1024`
- **dall-e-3**：`1024x1024`、`1792x1024` 或 `1024x1792`。默认值：`1024x1024`
- **dall-e-2**：`256x256`、`512x512` 或 `1024x1024`。默认值：`1024x1024`

### 质量

- **GPT 图像模型**：`auto`、`high`、`medium` 或 `low`。默认值：`high`
- **dall-e-3**：`hd` 或 `standard`。默认值：`standard`
- **dall-e-2**：仅支持 `standard`

### 其他参数

- **GPT 图像模型**支持 `--background`（`transparent`、`opaque`、`auto`）和 `--output-format`（`png`、`jpeg`、`webp`）
- **dall-e-3** 支持 `--style`（`vivid` 表示超写实风格，`natural` 表示更自然的外观）
- **dall-e-3** 仅支持 `n=1`；脚本会自动将数量限制为 1

## 输出

- 图像文件（`*.png`、`*.jpeg` 或 `*.webp`，具体取决于模型和格式）
- `prompts.json`（提示词到文件的映射）
- `index.html`（缩略图图库——在浏览器中打开即可查看）
