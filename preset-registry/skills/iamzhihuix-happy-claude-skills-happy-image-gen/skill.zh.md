---
name: happy-image-gen
description: Universal AI image generation supporting OpenAI DALL·E / gpt-image, Google Gemini Image / Imagen, Replicate (Flux / SDXL / any model), Stability AI, FAL, Ark (Seedream 4.5), Bailian (qwen-image / wanx), and SiliconFlow. Use this skill whenever the user asks to generate, create, draw, illustrate, render, or synthesize images from text prompts or reference images. Typical phrases include "draw a ...", "generate an image of ...", "画一张 ...", "给我来张图", "make a poster of ...", "create an illustration ...", or any mention of image-generation model families like DALL·E, gpt-image, Flux, SDXL, Seedream, Imagen, Gemini image, Kolors, or Wanx. Always use this skill even if the user does not name a specific model — pick a provider based on their EXTEND.md defaults or available API keys in the environment. Do NOT use this skill when the user explicitly mentions 即梦 / Dreamina / Jimeng — those go to happy-dreamina instead.
version: 0.1.0
---
# happy-image-gen

通过一个 CLI 跨 8 个提供商生成静态图像：`bun scripts/main.ts ...`。同一个 CLI 同时支持文生图和图生图（参考图驱动）编辑。

## 快速使用

```bash
bun scripts/main.ts --prompt "A calico cat on green grass, cinematic light" --ar 16:9 --image ./out.png
```

## 何时调用此技能

当用户出现以下情况时，调用此技能：

- 要求根据文本生成、创建、绘制、渲染、插画或合成图像。
- 要求重新设计或转换他们提供了路径的现有图像。
- 提及任何图像生成模型（DALL·E、gpt-image、Flux、SDXL、Gemini Image、Imagen、Seedream、Kolors、Wanx、Stable Diffusion），但未指定即梦/Dreamina/Jimeng。

当用户明确提及即梦、Jimeng 或 `dreamina` CLI 时，改为路由到 `happy-dreamina`。

## 步骤 0：预检（阻塞性——必须在任何生成操作之前运行）

运行以下检查：

1. **查找 EXTEND.md 配置。** 按以下顺序检查：
   - `./.happy-skills/happy-image-gen/EXTEND.md`（项目）
   - `$XDG_CONFIG_HOME/happy-skills/happy-image-gen/EXTEND.md`
   - `~/.happy-skills/happy-image-gen/EXTEND.md`（用户）

   如果均不存在，运行 `bun scripts/main.ts --setup`，并按照 `references/config/first-time-setup.md` 创建一个。在用户至少配置了一个提供商之前，不要继续生成。

2. **验证提供商是否可用。** 确认环境变量已设置（例如 `OPENAI_API_KEY`），或者 EXTEND.md 引用了能够解析的 `api_key_env` / `api_key_source`。如果都无法解析，则返回设置流程。

3. **验证 Bun 是否可用。** 运行 `command -v bun`。如果缺失，则回退使用 `npx -y bun scripts/main.ts ...`。

## 步骤 1：选择提供商

按以下优先顺序选择：

1. 用户明确传入的 `--provider <id>`。
2. EXTEND.md 中的 `default_provider`。
3. 环境中存在 API 密钥的第一个提供商。自动检测时的优先顺序：`openai` → `google` → `replicate` → `stability` → `fal` → `ark` → `bailian` → `siliconflow`。

有关每个提供商所需的环境变量、默认模型和优势，请参阅 `references/providers.md`（例如，图中文字优先选择 `google`，Flux 系列的照片级真实感优先选择 `replicate`，中文文本保真度优先选择 `ark`）。

## 步骤 2：填写参数

- **`--prompt`**：用户的完整请求，去除首尾空白。始终使用双引号。
- **`--ar`**：宽高比——`1:1` / `16:9` / `9:16` / `3:4` / `4:3`。有关每个提供商如何解释此参数，请参阅 `references/aspect_ratio_map.md`。
- **`--quality`**：`draft`（最快且最便宜）、`hd`（默认）或 `ultra`（4K 级别，速度较慢）。
- **`--ref <path>`**：如有多个参考图像，可重复使用。并非所有提供商都支持此参数——请参阅 providers.md。
- **`--model`**：覆盖所选提供商的默认模型。除非用户要求使用特定模型，否则省略。
- **`--image <path>`**：必需——输出文件路径。使用描述性名称（例如 `./out/hero-landscape.png`）。

## 步骤 3：运行

```bash
bun scripts/main.ts \
  --prompt "..." \
  --image ./out.png \
  --provider openai \
  --ar 1:1 \
  --quality hd
```

成功时，CLI 会输出解析后的绝对路径和字节数。在 `--json` 模式下，它会输出：

```json
{ "success": true, "provider": "openai", "model": "gpt-image-1", "image": "/abs/path.png", "size_bytes": 1416341, "format": "png" }
```

将该路径回复给用户。

## 步骤 4：处理错误

- **`config: No provider selected ...`** — 环境变量中没有 API 密钥，也没有 EXTEND.md。返回步骤 0。
- **`[openai] OpenAI images API 401 ...`** — 密钥无效或已过期。请用户更新密钥。
- **`[openai] ... 400 ... content_policy_violation`** — 提示词被拦截。向用户显示原始错误；不要改述。
- **超时/网络错误** — 重试一次。如果仍然失败，向用户显示原始消息和 `provider`，以便用户了解需要检查什么。

有关各提供商的错误表，请参阅 `references/error_codes.md`。

## 参考资料

按需阅读：

- **`references/providers.md`** — 全部 8 个提供商、所需的环境变量、默认模型和优势。
- **`references/aspect_ratio_map.md`** — 各提供商如何解释 `--ar`。
- **`references/error_codes.md`** — 各提供商的常见错误和修复方法。
- **`references/config/first-time-setup.md`** — `--setup` 的分步指南。
- **`references/config/extend-schema.md`** — EXTEND.md 架构参考。

`EXTEND.md` 的模板：`assets/EXTEND.template.md`。