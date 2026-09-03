---
name: nano-banana-pro
description: Generate or edit images via Gemini 3 Pro Image (Nano Banana Pro). Use when asked to create, generate, or edit images and a Gemini API key is available. Supports text-to-image generation, single-image editing, and multi-image composition (up to 14 images).
metadata:
  {
    "openclaw":
      {
        "emoji": "🍌",
        "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"] },
        "primaryEnv": "GEMINI_API_KEY",
        "install":
          [
            {
              "id": "uv-brew",
              "kind": "brew",
              "formula": "uv",
              "bins": ["uv"],
              "label": "Install uv (brew)",
            },
          ],
      },
  }
---
# Nano Banana Pro (Gemini 3 Pro Image)

使用内置脚本生成或编辑图像。

## 生成

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "your image description" --filename "output.png" --resolution 1K
```

## 编辑（单张图像）

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "edit instructions" --filename "output.png" -i "/path/in.png" --resolution 2K
```

## 多图合成（最多 14 张图像）

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "combine these into one scene" --filename "output.png" -i img1.png -i img2.png -i img3.png
```

## API 密钥

将 `GEMINI_API_KEY` 设为环境变量，或向脚本传递 `--api-key <KEY>`。

## 宽高比（可选）

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "portrait photo" --filename "output.png" --aspect-ratio 9:16
```

## 说明

- 分辨率：`1K`（默认）、`2K`、`4K`。
- 宽高比：`1:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`。如果不指定 `--aspect-ratio`，模型会自行选择。
- 在文件名中使用时间戳以保证唯一性：`yyyy-mm-dd-hh-mm-ss-name.png`。
- 不要将图像读回上下文；只需报告保存的路径。
