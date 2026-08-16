---
name: generate-image
description: Generate or edit images via two backends: Google Gemini (gemini-3-pro-image) or any OpenAI-compatible endpoint (gpt-image-2, dall-e-3). Use when the user wants to create, draw, illustrate, or edit an image, icon, logo, poster, or concept art.
user-invocable: true
argument-hint: "\"PROMPT\" --backend gemini|openai [-o out.png] [-i input.png ...] [--aspect-ratio 16:9] [--size 2K|1024x1024] [--count N] [--model ...] [--base-url URL]"
allowed-tools: ["Read", "Write", "AskUserQuestion", "Bash(uv run:*)", "Bash(*/generate_image.py:*)"]
---
# 生成图像（gemini / openai 后端）

将文本提示词（可选搭配参考图像）通过两个明确指定的后端之一转换为一张或多张图像。**`--backend` 没有默认值**——始终选择一个后端（`gemini` 或 `openai`），或者设置 `IMAGE_BACKEND`。脚本负责 API 调用、文件保存和配置；你的工作是选择后端、编写高质量的提示词，并正确设置各项参数。

- **`gemini`**——通过 `google-genai` 使用 Google 原生 Gemini API。支持完整功能集：`--aspect-ratio`、`--size` 分级（`1K`/`2K`/`4K`），以及多图像编辑/合成（`-i a.png -i b.png`）。使用 `GEMINI_API_KEY` / `GEMINI_IMAGE_MODEL`。
- **`openai`**——任意兼容 OpenAI 的图像端点（OpenAI 官方、DashScope、new-api 网关等）。使用 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_IMAGE_MODEL`。支持 `gpt-image-2`、`dall-e-3` 等。

## 前置条件

- 已安装 `uv`（该脚本是一个独立的 `uv run` 脚本；依赖项会在首次运行时安装）。
- 所选后端的 API 密钥。脚本会按顺序查找，因此以下任一方式均可：
  - `export GEMINI_API_KEY=...`（gemini 后端）或 `export OPENAI_API_KEY=...`（openai 后端），或者
  - `.env` 文件（按以下顺序检查：`$PWD/.env`，然后是 `${CLAUDE_PLUGIN_ROOT}/.env`），或者
  - 在命令行中使用 `--api-key ...`。

  **关键要求**——绝不要将 API 密钥粘贴到聊天中，也不要提交 `.env`。如果缺少密钥，脚本会准确输出设置方法——请将该信息转达给用户，而不要自行猜测。

## 工作流程

### 1. 澄清意图（仅当确实存在歧义时）

像“画一只穿宇航服的狐狸”这样的一句话请求不需要提问——直接生成即可。仅当某项选择会实质性改变结果且无法合理采用默认方案时，才（通过 AskUserQuestion）询问，例如，需要确定“横幅与头像”的宽高比，或者需要确认应当*编辑*所附图像，还是将其用作*风格参考*。

### 2. 编写提示词

在编写非简单提示词之前，请阅读 `references/prompting.md`。简而言之：以具体的方式描述主体、构图、光照、风格和氛围；将需要按字面渲染的任何文本放在引号中；对于编辑任务，应同时说明要更改什么以及要保留什么。生动的一段式提示词优于简短含糊的短语。

### 3. 运行脚本

直接调用脚本（shebang 会通过 `uv` 运行它）：

```bash
${CLAUDE_PLUGIN_ROOT}/skills/generate-image/scripts/generate_image.py "PROMPT" --backend BACKEND -o OUT.png [flags]
```

参数：

| 参数 | 用途 | 默认值 |
|------|---------|---------|
| `--backend` | `gemini`（Google 原生 API）或 `openai`（OpenAI 兼容端点）。无默认值——也可通过 `IMAGE_BACKEND` 设置。 | 必填 |
| `-o, --output` | 输出路径（`.png`/`.jpeg`） | `generated.png` |
| `-i, --input` | 参考/输入图像（可重复指定）。gemini：编辑/合成多张图像。openai：编辑单张图像（以第一张为准）。 | 无 |
| `--aspect-ratio` | `1:1 2:3 3:2 3:4 4:3 4:5 5:4 9:16 16:9 21:9`。gemini：通过 `image_config` 设置。openai：通过 `extra_body` 设置（仅限 Gemini 兼容端点）。 | 由模型决定 |
| `--size` | gemini：`1K`/`2K`/`4K`。openai：自由格式字符串（`1024x1024`、`auto` 等）。 | 由模型决定 |
| `--count` | 图像数量。gemini：进行 N 次独立调用。openai：一次调用，使用 `n=N`。 | 1 |
| `--model` | 模型 ID 或别名（否则使用 `GEMINI_IMAGE_MODEL`/`OPENAI_IMAGE_MODEL`）。gemini：`pro`/`flash`/原始 ID。openai：原始 ID（例如 `gpt-image-2`）。 | 后端默认值 |
| `--quality` | `low`/`medium`/`high`/`auto`——仅适用于 openai 后端。 | 由模型决定 |
| `--response-format` | `b64_json`/`url`/`none`——仅适用于 openai 后端。`url` 会下载到磁盘；`none` 会省略该参数。某些网关要求使用 `url`，或会拒绝该参数（此时使用 `none`）。 | `b64_json` |
| `--base-url` | 仅适用于 openai 后端：OpenAI 兼容的基础 URL。也可通过 `IMAGE_BASE_URL`/`OPENAI_BASE_URL` 设置。 | openai 必填 |
| `--api-key` | 覆盖 API 密钥（否则 gemini 使用 `GEMINI_API_KEY`，openai 使用 `OPENAI_API_KEY`）。 | 必填 |

**模型**（将别名传给 `--model`，或设置后端的环境变量）：

| 后端 | 别名 / id | 说明 |
|---------|-----------|-------|
| gemini | `pro`（默认）→ `gemini-3-pro-image` | 最高质量 |
| gemini | `flash` → `gemini-2.5-flash-image` | 更快 / 更便宜 |
| openai | `gpt-image-2`、`dall-e-3`、`gpt-image-1`、... | 端点提供的任意 id |

**示例：**

```bash
# Gemini, 2K wide banner
generate_image.py "podcast cover art" --backend gemini --aspect-ratio 16:9 --size 2K -o cover.png
# Gemini multi-image compose
generate_image.py "put the watch from image 1 on the wrist in image 2" --backend gemini -i watch.png -i wrist.png -o composite.png
# OpenAI-compatible gateway, gpt-image-2 (this gateway needs url format)
generate_image.py "a red bicycle" --backend openai --base-url https://api.tu-zi.com/v1 \
  --model gpt-image-2 --size 1024x1024 --response-format url -o bike.png
# OpenAI official
generate_image.py "a red bicycle" --backend openai --base-url https://api.openai.com/v1 --model gpt-image-2 -o bike.png
```

当用户希望获得多个选项以供挑选时，请请求 `--count 2`（或更多）并展示所有输出。
使用 `-i` 时，提示词将成为针对所提供图像的编辑/合成指令。

### 4. 报告

告知用户保存路径。如果未返回任何内容，通常是提示词被安全过滤器拦截——请如实说明，并提供改写后的提示词。输出文件是图像：通过路径引用它们；不要尝试内联其字节内容。

## 配置是渐进式的（关键最佳实践）

后端、密钥、基础 URL、模型和质量分别由
`lib/progressive_env.py` 按以下顺序解析，并在首次匹配时停止：**CLI 标志 →
进程环境变量 → `.env` 链 → 内置默认值**。因此，同一条命令既可在具有本地 `.env` 的项目中运行，也可在已导出环境变量的 shell 中运行，或在所有配置均被内联覆盖的情况下运行——这也意味着无需修改代码，只需使用 `export GEMINI_IMAGE_MODEL=...` / `export OPENAI_BASE_URL=...`
即可选择更新的模型或不同的端点。参数参考请参阅 `references/prompting.md`。

## 文件

- `scripts/generate_image.py` — 生成器（gemini 使用 `google-genai`，openai 使用 `openai`）。
- `references/prompting.md` — 提示词编写指南和完整参数参考。
- `${CLAUDE_PLUGIN_ROOT}/lib/progressive_env.py` — 共享的渐进式配置解析器。