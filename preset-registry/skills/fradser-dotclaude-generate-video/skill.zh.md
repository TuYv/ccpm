---
name: generate-video
description: Generate short videos from a text prompt or from still images using ByteDance Seedance on Volcengine Ark (火山方舟). Use this skill whenever the user wants to create, generate, render, or animate a video, clip, animation, motion graphic, or product demo — including text-to-video ("a drone shot over a forest at sunrise") and image-to-video, where a still becomes the first frame, or two stills are morphed start-to-end. Triggers include "generate a video", "make a clip", "animate this image", "turn this storyboard into video", "生成视频", "做个视频", "让这张图动起来", "图生视频", "首尾帧生成视频". Prefer this skill over describing a video in text.
user-invocable: true
argument-hint: "\"PROMPT\" [-o out.mp4] [--first-frame img] [--last-frame img] [--duration 5] [--resolution 720p] [--ratio 16:9] [--no-audio] [--seed N]"
allowed-tools: ["Read", "Write", "AskUserQuestion", "Bash(uv run:*)", "Bash(*/generate_video.py:*)"]
---
# 生成视频（火山引擎方舟上的 Seedance）

将文本提示词（可选择使用首帧、尾帧或参考图像作为锚点）转换为短视频。脚本会提交异步任务，轮询直至任务完成，
然后下载 `.mp4`。生成过程需要几分钟，因此请提前说明所需时间，并让任务持续运行。

## 前置条件

- `uv` 可用（自包含的 `uv run` 脚本；依赖项会在首次运行时安装）。
- 火山引擎方舟密钥。密钥会按以下顺序逐步解析，因此满足任意一种方式即可：
  - 在 shell 中执行 `export ARK_API_KEY=...`，或
  - 使用 `.env` 文件（按以下顺序检查：`$PWD/.env`，然后是 `${CLAUDE_PLUGIN_ROOT}/.env`），或
  - 在命令行中使用 `--api-key ...`。

  **关键要求** -- 切勿将 API 密钥粘贴到聊天中，也不要提交 `.env`。如果缺少密钥，
  脚本会准确打印设置方法——请转述该信息，而不要自行猜测。

## 工作流程

### 1. 确定模式

- **文生视频** — 仅使用提示词。适合没有源图像的情况。
- **图生视频** — 传入 `--first-frame img.png`。该静态图像会成为起始帧，
  模型会为其添加动态效果。这是为故事板画面或产品渲染图制作动画的正确模式。
- **首帧→尾帧变形** — 同时传入 `--first-frame a.png` 和 `--last-frame b.png`，在两张静态图像之间插值生成
  过渡效果。
- **参考图引导** — 使用 `--image path:reference_image`（可重复）引导风格和构图。

如果用户附加了图像，除非他们明确希望生成全新的场景，否则默认使用图生视频模式。

### 2. 编写提示词

在编写非简单提示词之前，请阅读 `references/prompting.md`。Seedance 很适合处理
按时间描述镜头的提示词（例如 `[0s-2s] … [2s-5s] …` 这样的节拍）、镜头运动，
以及必须保持不变的内容。对于图生视频，请明确说明需要保留源图像的哪些特征
（风格、取景、颜色），以避免视频片段发生偏移。

### 3. 运行脚本

直接调用脚本（shebang 会通过 `uv` 运行它）：

```bash
${CLAUDE_PLUGIN_ROOT}/skills/generate-video/scripts/generate_video.py "PROMPT" -o OUT.mp4 [flags]
```

参数：

| 参数 | 用途 | 默认值 |
|------|---------|---------|
| `-o, --output` | 输出 `.mp4` 路径 | `output.mp4` |
| `--first-frame` | 起始帧图像（图生视频） | 无 |
| `--last-frame` | 结束帧图像（首帧→尾帧变形） | 无 |
| `--image` | `PATH` 或 `PATH:ROLE`（`first_frame`/`last_frame`/`reference_image`）；可重复 | 无 |
| `--ratio` | 宽高比：`16:9`、`9:16`、`1:1`，… | `16:9` |
| `--resolution` | `480p` / `720p` / `1080p`（方舟不支持 2K/4K） | `720p` |
| `--duration` | 时长（秒），Seedance 2.0 支持 `4`–`15` | 5 |
| `--watermark` | 保留服务提供商的水印 | 关闭 |
| `--no-audio` | 禁用原生音频（2.0 默认生成同步音频） | 音频开启 |
| `--seed` | 用于复现结果的整数种子 | 随机 |
| `--model` | `pro`、`fast`、`mini` 或原始 id（否则使用 `SEEDANCE_MODEL`） | `pro` |

**模型**（将别名传给 `--model`，或设置 `SEEDANCE_MODEL`）：

| 别名 | 模型 id | 用途 |
|-------|----------|---------|
| `pro`（默认） | `doubao-seedance-2-0-260128` | 完整质量，最高支持 1080p |
| `fast` | `doubao-seedance-2-0-fast-260128` | 成本更低 / 速度更快，最高支持 720p |
| `mini` | `doubao-seedance-2-0-mini-260615` | 最轻量 / 成本最低 |

脚本在轮询期间会阻塞（状态信息会输出到 stderr）。对于批量工作，优先选择较长的单次运行，而不是许多短小的运行——每个任务都有固定开销，并且 API 按任务计费。

### 4. 报告

告知用户保存路径和所用设置（时长、分辨率）。输出格式为 `.mp4`：通过路径引用它。如果任务失败，请转述提供商的错误消息并建议修复方法（通常是使用更温和的提示词、更换宽高比或使用有效的源图像）。

## 渐进式配置（关键最佳实践）

API 密钥、模型 ID 和基础 URL 均由 `lib/progressive_env.py` 按以下顺序解析，并在首次匹配时停止：**CLI 标志 → 进程环境变量 → `.env` 链 → 内置默认值**。

有两个值得了解的影响：
- **无需更改代码即可切换模型版本。** 默认模型是当前的
  `doubao-seedance-2-0-260128`；若要使用其他或更新的 Seedance 版本，请设置
  `export SEEDANCE_MODEL=<id>`（或传入 `--model`）。请在 Ark 控制台中确认准确的 ID——不要假定像 “Seedance 3” 这样的营销名称对应某个字面意义上的模型 ID。
- **无需更改代码即可切换区域。** 默认基础 URL 是 cn-beijing 端点；如需使用其他 Ark 区域，请设置
  `export ARK_BASE_URL=...`。

## 文件

- `scripts/generate_video.py` — 生成器（通过 Ark REST 使用 Seedance，异步处理 + 轮询 + 下载）。
- `references/prompting.md` — 提示词编写指南和完整参数参考。
- `${CLAUDE_PLUGIN_ROOT}/lib/progressive_env.py` — 共享的渐进式配置解析器。