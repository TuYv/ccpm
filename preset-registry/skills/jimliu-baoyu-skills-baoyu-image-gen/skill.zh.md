---
name: baoyu-image-gen
description: AI image generation with OpenAI GPT Image 2.5, Azure OpenAI, Google, OpenRouter, DashScope, Z.AI GLM-Image, MiniMax, Jimeng, Seedream, Replicate and Agnes APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. Use when user asks to generate, create, or draw images.
version: 2.2.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-image-gen
    requires:
      anyBins:
        - bun
        - npx
---
# 图像生成（AI SDK）

官方 API 图像生成。支持 OpenAI GPT Image 2.5、Azure OpenAI、Google、OpenRouter、DashScope（阿里通义万象）、Z.AI GLM-Image、MiniMax、Jimeng（即梦）、Seedream（豆包）、Replicate 和 Agnes。

## 用户输入工具

当此 skill 提示用户时，遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent 运行时公开的内置用户输入工具，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号或答案。
3. **批量提问**：如果工具支持每次调用多个问题，则将所有适用的问题合并到一次调用中；如果仅支持单个问题，则按优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例，在其他运行时中请替换为本地等效工具。

## 脚本目录

`{baseDir}` = 此 SKILL.md 所在的目录。下面所有 `scripts/...` 路径均相对于 `{baseDir}`。主脚本：`{baseDir}/scripts/main.ts`。批量负载辅助工具：`{baseDir}/scripts/build-batch.ts`。解析 `${BUN_X}`：优先使用 `bun`；否则使用 `npx -y bun`；再否则建议执行 `brew install oven-sh/bun/bun`。

## 步骤 0：加载偏好设置 ⛔ 阻塞

在任何图像生成之前，此步骤都必须完成，生成操作会被阻止，直到 EXTEND.md 存在。

按以下顺序检查这些路径；以第一个命中的路径为准：

| 路径 | 范围 |
|------|------|
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-gen/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | 用户主目录 |

- **找到** → 加载、解析并应用。如果 `default_model.[provider]` 为 null → 仅询问模型。
- **未找到** → 使用 AskUserQuestion 执行首次设置（`references/config/first-time-setup.md`），收集 provider + model + quality + save location。保存 EXTEND.md，然后继续。在此步骤完成前不要生成图像。

旧版兼容性：如果 `.baoyu-skills/baoyu-imagine/EXTEND.md` 存在而新路径不存在，运行时会将其重命名为 `baoyu-image-gen`。如果两者都存在，运行时会保留两者，并使用新路径。

**EXTEND.md 键**：default provider、default quality、default aspect ratio、default image size、OpenAI image API dialect、default models、batch worker cap、provider-specific batch limits。架构：`references/config/preferences-schema.md`。

## 用法

最小可用示例请见 `references/usage-examples.md`，其中包含按 provider 调用和批量模式的完整示例。

### 保持身份的参考图提示词

当用户希望保留参考图中的真人、角色或物体时，不要用冗长的通用描述替换参考图。优先使用简短、明确的身份保持措辞：

- “将参考图中的人物/物体作为同一身份使用。不要重新设计，也不要创建外观相似的新主体。”
- “仅改变场景、服装、姿势、光照、渲染风格和构图。保留参考图中的脸部、比例、发型、关键配饰及整体身份。”
- 如果使用多张参考图，请说明它们是同一主体，并且应共同定义其身份。

注意：像“年轻的东亚女性、椭圆脸、清澈的眼睛……”这样的冗长描述，可能会导致模型根据描述合成一个新人物，而不是保留被引用的人物。

```bash
# Basic
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio and high quality
${BUN_X} {baseDir}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9 --quality 2k

# Prompt from files
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference image
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# Specific provider
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider dashscope --model qwen-image-2.0-pro

# OpenAI GPT Image 2
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openai --model gpt-image-2.5-flare

# Codex CLI (uses logged-in Codex subscription — no OPENAI_API_KEY required; requires `codex` on PATH)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider codex-cli --ar 16:9

# Batch mode
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4

# Build a batch file from outline.md + prompts/ (e.g. baoyu-article-illustrator output)
${BUN_X} {baseDir}/scripts/build-batch.ts --outline outline.md --prompts prompts --output batch.json --images-dir attachments
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4
```

## 参考图身份保留

当用户希望保留参考图中的人物或物体时：

- 优先使用少量经过筛选的现有源参考图（通常为 2–4 张），而不是大量图片；体积较大的多 MB 参考图可能会使流式传输提供商不稳定。
- 在提示词中明确说明这些参考图展示的是同一个主体，并要求输出使用该主体的身份。避免冗长的通用面部特征描述，因为这可能导致模型合成一个外观相似的新人物。
- 除非用户明确要求，否则不要使用新生成的输出作为参考图；生成的参考图会叠加身份漂移。
- 如果结果变得过度精致或像网红风格，请减少风格化参考图，并添加明确的反美化约束（不要瘦脸、放大眼睛、浓妆、商业旅行摄影风格或过度磨皮）。
- 如果主体需要看起来更年轻或更年长，请保留面部特征，并通过服装、姿势、场景和造型来表现年龄；不要要求模型改变面部身份。

## 选项

| 选项 | 描述 |
|--------|-------------|
| `--prompt <text>`、`-p` | 提示词文本 |
| `--promptfiles <files...>` | 从文件中读取提示词（拼接各文件内容） |
| `--image <path>` | 输出图像路径（单图模式下必需） |
| `--batchfile <path>` | 用于生成多张图像的 JSON 批处理文件 |
| `--jobs <count>` | 批处理模式下的工作线程数（默认：自动，最大值取自配置，内置默认值为 10） |
| `--provider google\|openai\|azure\|openrouter\|dashscope\|zai\|minimax\|jimeng\|seedream\|replicate\|codex-cli\|agnes` | 强制指定提供商（默认：自动检测；`codex-cli` 不会被自动选择，必须通过 CLI 或 EXTEND.md 固定指定） |
| `--model <id>`、`-m` | 模型 ID，默认值和允许的值请参阅提供商参考 |
| `--ar <ratio>` | 宽高比（`16:9`、`1:1`、`4:3`……） |
| `--size <WxH>` | 显式指定尺寸（例如 `1024x1024`；对于 `gpt-image-2.5-*` 和 `gpt-image-2`，宽度和高度必须是 16 的倍数，最长边最大为 3840px，宽高比不得超过 3:1） |
| `--quality normal\|2k` | 质量预设（默认：`2k`） |
| `--imageSize 1K\|2K\|4K` | Google/OpenRouter 的图像尺寸（默认：取自质量预设） |
| `--imageApiDialect openai-native\|ratio-metadata` | OpenAI 兼容端点方言，对于要求将宽高比作为 `size` 并将 `metadata.resolution` 作为分辨率的网关，请使用 `ratio-metadata` |
| `--ref <files...>` | 参考图。Google 多模态、OpenAI GPT Image 编辑、Azure OpenAI 编辑（仅限 PNG/JPG）、OpenRouter 多模态模型、Replicate 支持的系列、MiniMax 主体参考、Seedream 5.0/4.5/4.0、DashScope `wan2.7-image-pro`/`wan2.7-image` 均支持。Jimeng、Seedream 3.0、SeedEdit 3.0，或 DashScope 中 `wan2.7-image*` 系列之外的任何模型均不支持 |
| `--n <count>` | 图像数量。Replicate 要求使用 `--n 1`（单输出保存语义） |
| `--json` | JSON 输出 |

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API 密钥 |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API 密钥 |
| `OPENROUTER_API_KEY` | OpenRouter API 密钥 |
| `GOOGLE_API_KEY` | Google API 密钥 |
| `DASHSCOPE_API_KEY` | DashScope API 密钥 |
| `ZAI_API_KEY` (别名 `BIGMODEL_API_KEY`) | Z.AI API 密钥 |
| `MINIMAX_API_KEY` | MiniMax API 密钥 |
| `REPLICATE_API_TOKEN` | Replicate API 令牌 |
| `JIMENG_ACCESS_KEY_ID`, `JIMENG_SECRET_ACCESS_KEY` | 即梦 Volcengine 凭据 |
| `ARK_API_KEY` | Seedream（豆包）Volcengine ARK API 密钥 |
| `<PROVIDER>_IMAGE_MODEL` | 各提供商的模型覆盖设置（`OPENAI_IMAGE_MODEL`、`GOOGLE_IMAGE_MODEL`、`DASHSCOPE_IMAGE_MODEL`、`ZAI_IMAGE_MODEL`/`BIGMODEL_IMAGE_MODEL`、`MINIMAX_IMAGE_MODEL`、`OPENROUTER_IMAGE_MODEL`、`REPLICATE_IMAGE_MODEL`、`JIMENG_IMAGE_MODEL`、`SEEDREAM_IMAGE_MODEL`、`AGNES_IMAGE_MODEL`） |
| `AZURE_OPENAI_DEPLOYMENT` (别名 `AZURE_OPENAI_IMAGE_MODEL`) | Azure 默认部署 |
| `<PROVIDER>_BASE_URL` | 各提供商的端点覆盖设置 |
| `AZURE_API_VERSION` | Azure 图像 API 版本（默认值为 `2025-04-01-preview`） |
| `JIMENG_REGION` | 即梦区域（默认值为 `cn-north-1`） |
| `OPENAI_IMAGE_API_DIALECT` | `openai-native` \| `ratio-metadata` |
| `OPENROUTER_HTTP_REFERER`, `OPENROUTER_TITLE` | 可选的 OpenRouter 来源标 attribution |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | 覆盖批处理工作线程上限 |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | 各提供商的并发数（例如 `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY`；对于 codex-cli，使用 `BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY`） |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | 各提供商的启动间隔 |
| `BAOYU_CODEX_IMAGEGEN_BIN` | 覆盖 `codex-cli` 提供商的 codex-imagegen 包装器路径（默认值：内置的 `scripts/codex-imagegen/main.ts`；接受 `.ts` 或旧版 `.sh`/二进制文件） |
| `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` | 为 `codex-cli` 提供商启用幂等缓存（默认关闭） |
| `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS` | `codex-cli` 提供商每次尝试执行 `codex exec` 的超时时间（默认值：300000 ms） |
| `BAOYU_CODEX_IMAGEGEN_RETRIES` | `codex-cli` 提供商在可重试错误上的包装器端重试次数（默认值：2） |
| `BAOYU_CODEX_IMAGEGEN_LOG_FILE` | 为 `codex-cli` 提供商追加 JSONL 诊断日志 |

**加载优先级**：CLI 参数 > EXTEND.md > 环境变量 > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

### Codex/ChatGPT OAuth 不是 OpenAI API 密钥

`--provider openai --model gpt-image-2.5-flare` 使用标准 OpenAI Images API（`/v1/images/generations` 或 `/v1/images/edits`），并且需要 `OPENAI_API_KEY`。Codex 或 ChatGPT 桌面端登录属于另一种权限，不能直接替代 `OPENAI_API_KEY`；不要将 Codex OAuth 令牌粘贴到 `OPENAI_API_KEY` 中，也不要只设置 `OPENAI_BASE_URL` 指向 Codex 后端。

如果用户希望使用其 Codex 订阅 / GPT Image 2 权限而不使用 OpenAI API 密钥，请通过 Codex 原生后端，而不是本技能的 `openai` 提供商进行调用：

- 在 Codex 运行时：使用原生 `imagegen` 技能/工具。
- 在已安装并登录 `codex` CLI 的非 Codex 运行时中：使用 `baoyu-image-gen --provider codex-cli`（首选方式，可为所有其他 provider 提供相同的重试 / 缓存 / 批处理流程）。该 provider 会启动内置的 `scripts/codex-imagegen/main.ts`；相同代码位于上游的 `packages/baoyu-codex-imagegen/src/main.ts`，供独立调用方使用。
- 在带有原生 `image_generate` 工具的 Hermes 运行时中：使用该工具作为回退方案，并说明参考图像是直接传入的，还是根据提取出的特征重建的。

不要修改现有的 `openai` provider，使其静默使用 Codex OAuth。第一类 Codex-CLI 路径是专用的 `codex-cli` provider，它拥有独立的身份验证（Codex 登录）、路由（`codex exec`）、请求格式和测试。请参阅 `references/codex-oauth-vs-openai-api-key.md`。

## 模型解析

优先级（从高到低）适用于每个 provider：

1. CLI 标志 `--model <id>`
2. EXTEND.md 中的 `default_model.[provider]`
3. 环境变量 `<PROVIDER>_IMAGE_MODEL`
4. 内置默认值

对于 OpenAI，内置默认值为 `gpt-image-2.5-flare`（速度快、延迟最低）。对于复杂场景和精确编辑，`gpt-image-2.5-sunburst` 是能力最强的变体；`gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 以及带日期的 GPT Image 快照（例如 `gpt-image-2.5-flare-2026-09-08`、`gpt-image-2-2026-04-21`）仍可通过 `--model` 或 `OPENAI_IMAGE_MODEL` 选择。

对于 Google，内置默认值为 `gemini-3-pro-image`。`gemini-3.1-flash-image` 是速度更快、成本更低的选项，而 `gemini-3.1-flash-lite-image` 是最便宜的选项——它只能生成 1K 输出，因此 `--quality 2k` / `--imageSize 2K|4K` 会被限制为 1K，并显示警告。

对于 DashScope，内置默认值为 `qwen-image-2.0-pro`；`qwen-image-3.0-pro` 是最新的旗舰模型，并使用相同的尺寸规则。

对于 Azure，`--model` / `default_model.azure` 是 Azure 部署名称。`AZURE_OPENAI_DEPLOYMENT` 是首选环境变量；`AZURE_OPENAI_IMAGE_MODEL` 作为向后兼容的别名保留。如果你的 Azure 部署名称采用底层模型名称，请使用 `gpt-image-2.5-flare`；否则使用准确的自定义部署名称。

EXTEND.md 会覆盖环境变量：如果 EXTEND.md 设置了 `default_model.google: "gemini-3-pro-image"`，而环境变量设置了 `GOOGLE_IMAGE_MODEL=gemini-3.1-flash-image`，则以 EXTEND.md 为准。

**在每次生成前显示模型信息**：

- `Using [provider] / [model]`
- `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

## OpenAI 兼容网关方言

`provider=openai` 表示身份验证和路由入口与 OpenAI 兼容。它**不**保证上游图像 API 使用 OpenAI 原生语义。当网关要求不同的通信格式时，请在 EXTEND.md、`OPENAI_IMAGE_API_DIALECT` 或 `--imageApiDialect` 中设置 `default_image_api_dialect`：

- `openai-native`：像素尺寸 `size`（`1536x1024`）和原生 OpenAI 质量字段
- `ratio-metadata`：宽高比尺寸 `size`（`16:9`），以及 `metadata.resolution`（`1K|2K|4K`）和 `metadata.orientation`

对于 OpenAI 原生 API 或严格兼容的克隆服务，使用 `openai-native`；对于位于 Gemini 或类似模型前方的兼容网关，尝试使用 `ratio-metadata`。当前限制：`ratio-metadata` 仅适用于文生图；参考图编辑仍需使用 `openai-native` 或提供一流编辑支持的服务商。

## 提供商专属指南

每个提供商都有各自的特性（模型系列、尺寸规则、参考图支持、限制）。当用户选择该提供商或要求非默认行为时，请阅读以下文档：

| 提供商 | 参考文档 |
|----------|-----------|
| DashScope（Qwen-Image 系列、自定义尺寸） | `references/providers/dashscope.md` |
| Z.AI（GLM-Image、cogview-4） | `references/providers/zai.md` |
| MiniMax（image-01、主体参考） | `references/providers/minimax.md` |
| OpenRouter（多模态模型、`/chat/completions` 流程） | `references/providers/openrouter.md` |
| Replicate（nano-banana、Seedream、Wan） | `references/providers/replicate.md` |
| Codex CLI（封装内置的 `scripts/codex-imagegen/`；Codex 登录，无需 `OPENAI_API_KEY`） | `references/providers/codex-cli.md` |
| Agnes（agnes-image-2.5-flash、参考图支持） | `references/providers/agnes.md` |

## 提供商选择

1. 提供 `--ref` 且未提供 `--provider` → 自动选择顺序为 Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax → Agnes（MiniMax 的主体参考更专注于角色/肖像一致性）
2. 指定 `--provider` → 使用该提供商（若提供 `--ref`，则必须为 google/openai/azure/openrouter/replicate/seedream/minimax/codex-cli/agnes）
3. 仅存在一个 API 密钥 → 使用对应的提供商
4. 存在多个密钥 → 默认优先级：Google → OpenAI → Azure → OpenRouter → DashScope → Z.AI → MiniMax → Replicate → Jimeng → Seedream → Agnes
5. `codex-cli` **绝不会自动选择** — 请在 EXTEND.md 中设置 `default_provider: codex-cli`，或传入 `--provider codex-cli`。它通过内置的 `scripts/codex-imagegen/main.ts` TS 入口点（使用 `bun` 运行）启动 `codex exec`，并使用用户的 Codex 订阅（无需 `OPENAI_API_KEY`）。要求 `codex` 位于 `PATH` 中且已完成有效的 `codex login`。

## 质量预设

| 预设 | Google imageSize | OpenAI size | OpenRouter size | Replicate resolution | 使用场景 |
|--------|------------------|-------------|-----------------|----------------------|----------|
| `normal` | 1K | 1024px 目标 | 1K | 1K | 快速预览 |
| `2k`（默认） | 2K | 2048px 目标 | 2K | 2K | 封面、插图、信息图 |

Google/OpenRouter 的 `imageSize` 可通过 `--imageSize 1K|2K|4K` 覆盖。

对于 OpenAI 原生 `gpt-image-2.5-*` 和 `gpt-image-2`，`normal` 映射为 `quality=medium` 以及接近所请求宽高比的低延迟有效尺寸；`2k` 映射为 `quality=high` 以及 2048px 级别尺寸，例如 `2048x2048`、`2048x1152` 或 `1152x2048`。使用显式 `--size` 指定有效的自定义或 4K 输出，例如 `3840x2160`。

## 宽高比

支持：`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`2.35:1`。

- Google 多模态：`imageConfig.aspectRatio`
- OpenAI：`gpt-image-2.5-*` 和 `gpt-image-2` 会使用最接近所请求宽高比的有效自定义尺寸；较早的 GPT Image 和 DALL·E 模型会使用最接近的受支持固定尺寸
- OpenRouter：`imageGenerationOptions.aspect_ratio`；若仅提供 `--size <WxH>`，则会推断宽高比
- Replicate：行为因模型而异 — `google/nano-banana*` 使用 `aspect_ratio`，`bytedance/seedream-*` 使用已记录的 Replicate 宽高比，Wan 2.7 将 `--ar` 映射为具体的 `size`
- MiniMax：官方 `aspect_ratio` 值；若仅提供 `--size <WxH>` 而未提供 `--ar`，则会为 `image-01` 发送 `width`/`height`

## 生成模式

**默认**：顺序执行。当 `--batchfile` 包含 2 个或更多待处理任务时，自动启用**批量并行**。

| 情况 | 优先选择 | 原因 |
|-----------|--------|-----|
| 单张图片，或 1-2 张简单图片 | 顺序执行 | 协调开销更低，更易于调试 |
| 使用已保存提示词文件的多张图片 | 批量（`--batchfile`） | 复用已定稿的提示词，应用统一的限流和重试机制，吞吐量更可预测 |
| 每张图片仍需要单独推理、编写提示词或探索风格 | 子代理 | 生成过程仍具有探索性，每张图片都需要独立分析 |
| 输入为 `outline.md` + `prompts/`（例如来自 `baoyu-article-illustrator`） | 批量执行：使用 `{baseDir}/scripts/build-batch.ts` 组装负载 | 大纲和提示词文件已经包含生成所需的全部信息 |

经验法则：提示词文件保存完成后，如果任务是“生成全部图片”，优先使用批量模式，而不是子代理。只有当生成过程与每张图片的思考过程紧密相关，或需要进行差异化创意探索时，才使用子代理。

**并行行为**：

- 默认 worker 数量自动确定，受配置限制，内置默认值为 10
- 仅在批量模式下应用针对提供商的限流；默认设置经过调优，可提升吞吐量并避免 RPM 突发
- 使用 `--jobs <count>` 覆盖默认值
- 每张图片最多重试 3 次
- 最终输出包括成功数量、失败数量以及每张图片的失败原因

## 错误处理

- 缺少 API key → 返回包含配置说明的错误
- 生成失败 → 每张图片自动重试最多 3 次
- 无效的宽高比 → 发出警告，并使用默认值继续
- 参考图片与不受支持的提供商/模型组合 → 返回包含修复提示的错误

### Codex image2 fallback

如果 `--provider openai --model gpt-image-2.5-flare` 因缺少 `OPENAI_API_KEY` 而失败，但当前运行时具有原生图像生成后端，或仓库级别的 `codex-imagegen` 封装可用，请使用该路径，不要让用户继续等待。请明确说明回退方案是真正的参考图像生成，还是仅根据提取出的视觉特征，通过文本提示词进行重建。请参阅 `references/codex-image2-fallback.md`。

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/usage-examples.md` | 涵盖各提供商和批量模式的扩展 CLI 示例 |
| `references/codex-oauth-vs-openai-api-key.md` | 为什么 Codex/ChatGPT OAuth image2 权益无法通过 baoyu-image-gen 的标准 OpenAI API key 提供商使用 |
| `references/codex-image2-fallback.md` | 在缺少 OpenAI API 凭据但 Codex/原生图像生成可用时的实际回退行为 |
| `references/providers/dashscope.md` | DashScope 系列、尺寸和限制 |
| `references/providers/zai.md` | Z.AI GLM-image / cogview-4 |
| `references/providers/minimax.md` | MiniMax image-01 及主体参考 |
| `references/providers/openrouter.md` | OpenRouter 多模态流程 |
| `references/providers/replicate.md` | Replicate 支持的系列及防护机制 |
| `references/providers/agnes.md` | Agnes（agnes-image-2.5-flash）的尺寸、参考图和限制 |
| `references/config/preferences-schema.md` | EXTEND.md schema |
| `references/config/first-time-setup.md` | 首次设置流程 |

## 扩展支持

通过 `EXTEND.md` 使用自定义配置。路径和架构请参见步骤 0。