---
name: baoyu-image-gen
description: AI image generation with OpenAI GPT Image 2, Azure OpenAI, Google, OpenRouter, DashScope, Z.AI GLM-Image, MiniMax, Jimeng, Seedream, Replicate and Agnes APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. Use when user asks to generate, create, or draw images.
version: 2.1.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-image-gen
    requires:
      anyBins:
        - bun
        - npx
---
# 图像生成（AI SDK）

基于官方 API 的图像生成。支持 OpenAI GPT Image 2、Azure OpenAI、Google、OpenRouter、DashScope（阿里通义万象）、Z.AI GLM-Image、MiniMax、Jimeng（即梦）、Seedream（豆包）、Replicate 和 Agnes。

## 用户输入工具

当此 skill 提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent runtime 提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果工具每次只能提出一个问题，则按照优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例——在其他 runtime 中，请替换为本地等效工具。

## 脚本目录

`{baseDir}` = 此 SKILL.md 所在的目录。下面所有 `scripts/...` 路径均相对于 `{baseDir}`。主脚本：`{baseDir}/scripts/main.ts`。批处理负载辅助脚本：`{baseDir}/scripts/build-batch.ts`。解析 `${BUN_X}`：优先使用 `bun`；否则使用 `npx -y bun`；再否则建议执行 `brew install oven-sh/bun/bun`。

## 步骤 0：加载偏好设置 ⛔ 阻塞性步骤

在进行任何图像生成之前，必须完成此步骤——在 `EXTEND.md` 存在之前，生成操作会被阻止。

按以下顺序检查这些路径；以第一个命中的路径为准：

| 路径 | 范围 |
|------|------|
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-gen/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | 用户主目录 |

- **找到** → 加载、解析并应用。如果 `default_model.[provider]` 为 null → 仅询问模型。
- **未找到** → 使用 AskUserQuestion 执行首次设置（`references/config/first-time-setup.md`），收集 provider + model + quality + 保存位置。保存 EXTEND.md，然后继续。完成此步骤之前不得生成图像。

旧版兼容性：如果 `.baoyu-skills/baoyu-imagine/EXTEND.md` 存在而新路径不存在，runtime 会将其重命名为 `baoyu-image-gen`。如果两者都存在，runtime 将保持不变并使用新路径。

**EXTEND.md 键**：默认 provider、默认 quality、默认 aspect ratio、默认 image size、OpenAI image API 方言、默认模型、批处理 worker 上限、provider 专属批处理限制。架构定义：`references/config/preferences-schema.md`。

## 用法

最小可用示例——完整示例集（包括各 provider 的调用方式和批处理模式）请参见 `references/usage-examples.md`。

### 保持身份的参考图提示词

当用户希望保留参考图中的真实人物/角色/物体时，**不要**用冗长的通用描述替代参考图。优先使用简短、强调身份保持的措辞：

- "使用参考图中的人物/物体，并保持其为同一身份。不要重新设计，也不要创建外观相似的新主体。"
- "只改变场景、服装、姿势、光照、渲染风格和构图。保留参考图中的面部/比例/发型/关键配饰/整体身份。"
- 如果使用多张参考图，请说明它们是同一主体，并应共同定义其身份。

陷阱：像“年轻东亚女性、椭圆脸、明亮的眼睛……”这样的长描述，可能会导致模型合成一个符合该描述的新人物，而不是保留所引用的人物。

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
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openai --model gpt-image-2

# Codex CLI (uses logged-in Codex subscription — no OPENAI_API_KEY required; requires `codex` on PATH)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider codex-cli --ar 16:9

# Batch mode
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4

# Build a batch file from outline.md + prompts/ (e.g. baoyu-article-illustrator output)
${BUN_X} {baseDir}/scripts/build-batch.ts --outline outline.md --prompts prompts --output batch.json --images-dir attachments
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4
```

## 参考图像身份保留

当用户希望保留参考图像中的人物/物体时：

- 相较于使用大量图像，优先选用一小组经过筛选的现有源参考图（通常为 2–4 张）；数 MB 以上的大型参考图可能会使流式提供商不稳定。
- 在提示词中说明这些参考图是同一主体，且输出必须使用该身份。避免冗长、通用的面部特征描述，因为这可能导致模型合成一个外貌相似的新人物。
- 除非用户明确要求，否则不要将新生成的输出用作参考图；生成的参考图会加剧漂移。
- 如果结果变得过于精致或像网红风格，请减少风格化参考图，并添加明确的反美化约束（不瘦脸、不放大眼睛、不浓妆、不采用商业旅行拍摄风格、不过度磨皮）。
- 如果主体应显得更年轻/年长，请保留面部，并通过服装、姿态、场景和造型表达年龄；不要要求模型改变面部身份。

## 选项

| 选项 | 说明 |
|--------|-------------|
| `--prompt <text>`, `-p` | 提示词文本 |
| `--promptfiles <files...>` | 从文件读取提示词（拼接后使用） |
| `--image <path>` | 输出图像路径（单图模式下必需） |
| `--batchfile <path>` | 用于多图生成的 JSON 批处理文件 |
| `--jobs <count>` | 批处理模式的工作线程数（默认：自动；最大值来自配置；内置默认值为 10） |
| `--provider google\|openai\|azure\|openrouter\|dashscope\|zai\|minimax\|jimeng\|seedream\|replicate\|codex-cli\|agnes` | 强制指定提供商（默认：自动检测；`codex-cli` 永远不会被自动选择——必须通过 CLI 或 EXTEND.md 固定指定） |
| `--model <id>`, `-m` | 模型 ID — 有关默认值和允许的值，请参阅提供商参考资料 |
| `--ar <ratio>` | 宽高比（`16:9`、`1:1`、`4:3`、…） |
| `--size <WxH>` | 明确指定尺寸（例如 `1024x1024`；对于 `gpt-image-2`，宽度/高度必须是 16 的倍数，最长边最大为 3840px，比例不得宽于 3:1） |
| `--quality normal\|2k` | 质量预设（默认：`2k`） |
| `--imageSize 1K\|2K\|4K` | Google/OpenRouter 的图像尺寸（默认：取自质量设置） |
| `--imageApiDialect openai-native\|ratio-metadata` | OpenAI 兼容端点方言 — 对于要求使用宽高比 `size` 加 `metadata.resolution` 的网关，请使用 `ratio-metadata` |
| `--ref <files...>` | 参考图像。受 Google 多模态、OpenAI GPT Image 编辑、Azure OpenAI 编辑（仅 PNG/JPG）、OpenRouter 多模态模型、Replicate 支持的系列、MiniMax 主体参考、Seedream 5.0/4.5/4.0、DashScope `wan2.7-image-pro`/`wan2.7-image` 支持。Jimeng、Seedream 3.0、SeedEdit 3.0，以及 `wan2.7-image*` 系列以外的任何 DashScope 模型均不支持 |
| `--n <count>` | 图像数量。Replicate 需要 `--n 1`（单输出保存语义） |
| `--json` | JSON 输出 |

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API 密钥 |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API 密钥 |
| `OPENROUTER_API_KEY` | OpenRouter API 密钥 |
| `GOOGLE_API_KEY` | Google API 密钥 |
| `DASHSCOPE_API_KEY` | DashScope API 密钥 |
| `ZAI_API_KEY`（别名 `BIGMODEL_API_KEY`） | Z.AI API 密钥 |
| `MINIMAX_API_KEY` | MiniMax API 密钥 |
| `REPLICATE_API_TOKEN` | Replicate API 令牌 |
| `JIMENG_ACCESS_KEY_ID`, `JIMENG_SECRET_ACCESS_KEY` | Jimeng（即梦）Volcengine 凭证 |
| `ARK_API_KEY` | Seedream（豆包）Volcengine ARK API 密钥 |
| `<PROVIDER>_IMAGE_MODEL` | 按提供商覆盖模型（`OPENAI_IMAGE_MODEL`、`GOOGLE_IMAGE_MODEL`、`DASHSCOPE_IMAGE_MODEL`、`ZAI_IMAGE_MODEL`/`BIGMODEL_IMAGE_MODEL`、`MINIMAX_IMAGE_MODEL`、`OPENROUTER_IMAGE_MODEL`、`REPLICATE_IMAGE_MODEL`、`JIMENG_IMAGE_MODEL`、`SEEDREAM_IMAGE_MODEL`、`AGNES_IMAGE_MODEL`） |
| `AZURE_OPENAI_DEPLOYMENT`（别名 `AZURE_OPENAI_IMAGE_MODEL`） | Azure 默认部署 |
| `<PROVIDER>_BASE_URL` | 按提供商覆盖端点 |
| `AZURE_API_VERSION` | Azure 图像 API 版本（默认值为 `2025-04-01-preview`） |
| `JIMENG_REGION` | Jimeng 区域（默认值为 `cn-north-1`） |
| `OPENAI_IMAGE_API_DIALECT` | `openai-native` \| `ratio-metadata` |
| `OPENROUTER_HTTP_REFERER`, `OPENROUTER_TITLE` | 可选的 OpenRouter 归属信息 |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | 覆盖批处理工作线程上限 |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | 按提供商设置并发数（例如 `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY`；对于 codex-cli，使用 `BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY`） |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | 按提供商设置启动间隔 |
| `BAOYU_CODEX_IMAGEGEN_BIN` | 覆盖 `codex-cli` 提供商的 codex-imagegen 包装器路径（默认值：内置的 `scripts/codex-imagegen/main.ts`；接受 `.ts` 或旧版 `.sh`/二进制文件） |
| `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` | 为 `codex-cli` 提供商启用幂等性缓存（默认关闭） |
| `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS` | `codex-cli` 提供商每次尝试的 `codex exec` 超时时间（默认值：300000 ms） |
| `BAOYU_CODEX_IMAGEGEN_RETRIES` | `codex-cli` 提供商在可重试错误时由包装器执行的重试次数（默认值：2） |
| `BAOYU_CODEX_IMAGEGEN_LOG_FILE` | 为 `codex-cli` 提供商追加 JSONL 诊断日志 |

**加载优先级**：CLI 参数 > EXTEND.md > 环境变量 > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

### Codex/ChatGPT OAuth 不是 OpenAI API 密钥

`--provider openai --model gpt-image-2` 使用标准 OpenAI Images API（`/v1/images/generations` 或 `/v1/images/edits`），并且需要 `OPENAI_API_KEY`。Codex 或 ChatGPT 桌面端登录属于不同的授权，不能直接替代 `OPENAI_API_KEY`；不要将 Codex OAuth 令牌粘贴到 `OPENAI_API_KEY` 中，也不要仅将 `OPENAI_BASE_URL` 设置为 Codex 后端。

如果用户希望在没有 OpenAI API 密钥的情况下使用其 Codex 订阅 / GPT Image 2 权益，请通过 Codex 原生后端路由，而不要使用此技能的 `openai` 提供商：

- 在 Codex runtime 中：使用原生的 `imagegen` skill/tool。
- 在已安装并登录 `codex` CLI 的非 Codex runtime 中：使用 `baoyu-image-gen --provider codex-cli`（首选——它提供与其他 provider 相同的重试 / 缓存 / 批处理流程）。该 provider 会启动内置的 `scripts/codex-imagegen/main.ts`；相同代码位于上游的 `packages/baoyu-codex-imagegen/src/main.ts`，供独立调用者使用。
- 在具有原生 `image_generate` tool 的 Hermes runtime 中：将该 tool 作为回退方案，并说明参考图像是直接传入的，还是根据提取的特征重建的。

不要修改现有的 `openai` provider 以静默使用 Codex OAuth。一级的 Codex-CLI 路径是专用的 `codex-cli` provider，它拥有独立的身份验证（Codex login）、路由（`codex exec`）、请求格式和测试。参见 `references/codex-oauth-vs-openai-api-key.md`。

## Model Resolution

以下优先级（从高到低）适用于每个 provider：

1. CLI flag `--model <id>`
2. EXTEND.md `default_model.[provider]`
3. Env var `<PROVIDER>_IMAGE_MODEL`
4. 内置默认值

对于 OpenAI，内置默认值为 `gpt-image-2`。`gpt-image-1.5`、`gpt-image-1` 以及 GPT Image 快照仍可通过 `--model` 或 `OPENAI_IMAGE_MODEL` 选择。

对于 Azure，`--model` / `default_model.azure` 是 Azure deployment name。`AZURE_OPENAI_DEPLOYMENT` 是首选的 env var；保留 `AZURE_OPENAI_IMAGE_MODEL` 作为向后兼容的别名。如果你的 Azure deployment 以底层模型命名，请使用 `gpt-image-2`；否则使用准确的自定义 deployment name。

EXTEND.md 会覆盖 env vars：如果 EXTEND.md 设置了 `default_model.google: "gemini-3-pro-image"`，而 env var 设置了 `GOOGLE_IMAGE_MODEL=gemini-3.1-flash-image`，则以 EXTEND.md 为准。

**在每次生成前显示模型信息**：

- `Using [provider] / [model]`
- `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

## OpenAI-Compatible Gateway Dialects

`provider=openai` 表示身份验证和路由入口与 OpenAI 兼容。它**不**保证上游图像 API 使用 OpenAI 原生语义。当 gateway 需要不同的 wire format 时，请在 EXTEND.md、`OPENAI_IMAGE_API_DIALECT` 或 `--imageApiDialect` 中设置 `default_image_api_dialect`：

- `openai-native`：像素尺寸 `size`（`1536x1024`）和 OpenAI 原生 quality fields
- `ratio-metadata`：宽高比 `size`（`16:9`），以及 `metadata.resolution`（`1K|2K|4K`）和 `metadata.orientation`

对 OpenAI 原生 API 或严格克隆实现使用 `openai-native`；对于位于 Gemini 或类似模型前面的兼容性 gateway，可尝试使用 `ratio-metadata`。当前限制：`ratio-metadata` 仅适用于 text-to-image；参考图像编辑仍需要 `openai-native`，或需要使用具有一级编辑支持的 provider。

## Provider-Specific Guides

每个 provider 都有自己的特性（模型系列、尺寸规则、参考图支持、限制）。当用户选择该 provider，或询问非默认行为时，请阅读以下内容：

| Provider | Reference |
|----------|-----------|
| DashScope（Qwen-Image 系列、自定义尺寸） | `references/providers/dashscope.md` |
| Z.AI（GLM-Image、cogview-4） | `references/providers/zai.md` |
| MiniMax（image-01、subject-reference） | `references/providers/minimax.md` |
| OpenRouter（多模态模型、`/chat/completions` 流程） | `references/providers/openrouter.md` |
| Replicate（nano-banana、Seedream、Wan） | `references/providers/replicate.md` |
| Codex CLI（封装内置的 `scripts/codex-imagegen/`；Codex login，不使用 `OPENAI_API_KEY`） | `references/providers/codex-cli.md` |
| Agnes（agnes-image-2.1-flash、参考图支持） | `references/providers/agnes.md` |

## 提供商选择

1. 提供了 `--ref` 且未提供 `--provider` → 自动按 Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax → Agnes 的顺序选择（MiniMax 的主体参考功能更专注于角色/肖像一致性）
2. 指定了 `--provider` → 使用该提供商（如果提供了 `--ref`，则必须是 google/openai/azure/openrouter/replicate/seedream/minimax/codex-cli/agnes）
3. 仅存在一个 API 密钥 → 使用对应的提供商
4. 存在多个密钥 → 默认优先级：Google → OpenAI → Azure → OpenRouter → DashScope → Z.AI → MiniMax → Replicate → Jimeng → Seedream → Agnes
5. `codex-cli` **永远不会被自动选择** — 在 EXTEND.md 中设置 `default_provider: codex-cli`，或传入 `--provider codex-cli`。它通过随附的 `scripts/codex-imagegen/main.ts` TS 入口点（使用 `bun` 运行）生成 `codex exec`，并使用用户的 Codex 订阅（无需 `OPENAI_API_KEY`）。要求 `PATH` 中存在 `codex`，并且已通过有效的 `codex login` 登录。

## 质量预设

| 预设 | Google imageSize | OpenAI size | OpenRouter size | Replicate resolution | 使用场景 |
|--------|------------------|-------------|-----------------|----------------------|----------|
| `normal` | 1K | 目标为 1024px | 1K | 1K | 快速预览 |
| `2k`（默认） | 2K | 目标为 2048px | 2K | 2K | 封面、插图、信息图 |

Google/OpenRouter 的 `imageSize` 可以通过 `--imageSize 1K|2K|4K` 覆盖。

对于原生 OpenAI `gpt-image-2`，`normal` 映射为 `quality=medium`，并使用接近所请求宽高比的低延迟有效尺寸；`2k` 映射为 `quality=high`，并使用 2048px 级别的尺寸，例如 `2048x2048`、`2048x1152` 或 `1152x2048`。对于有效的自定义尺寸或 4K 输出，请使用显式的 `--size`，例如 `3840x2160`。

## 宽高比

支持：`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`2.35:1`。

- Google multimodal：`imageConfig.aspectRatio`
- OpenAI：`gpt-image-2` 会针对所请求的宽高比使用最接近的有效自定义尺寸；较旧的 GPT Image 和 DALL·E 模型则使用其最接近的受支持固定尺寸
- OpenRouter：`imageGenerationOptions.aspect_ratio`；如果只提供了 `--size <WxH>`，则会推断宽高比
- Replicate：行为取决于模型 — `google/nano-banana*` 使用 `aspect_ratio`，`bytedance/seedream-*` 使用 Replicate 文档规定的宽高比，Wan 2.7 则将 `--ar` 映射为具体的 `size`
- MiniMax：使用官方的 `aspect_ratio` 值；如果提供了 `--size <WxH>` 但未提供 `--ar`，则会为 `image-01` 发送 `width`/`height`

## 生成模式

**默认**：顺序执行。**批量并行**：当 `--batchfile` 包含 2 个或更多待处理任务时自动启用。

| 情况 | 优先选择 | 原因 |
|-----------|--------|-----|
| 一张图片，或 1–2 张简单图片 | 顺序执行 | 协调开销更低，也更容易调试 |
| 使用已保存提示词文件的多张图片 | 批量（`--batchfile`） | 复用已定稿的提示词，应用统一的限流/重试策略，并提供可预测的吞吐量 |
| 每张图片仍需要独立的推理 / 提示词编写 / 风格探索 | 子代理 | 工作仍处于探索阶段，每张图片都需要独立分析 |
| 输入是 `outline.md` + `prompts/`（例如来自 `baoyu-article-illustrator`） | 批量 — 使用 `{baseDir}/scripts/build-batch.ts` 组装负载 | 大纲和提示词文件已经包含所需的全部信息 |

经验法则：一旦提示词文件已保存，且任务是“生成所有这些内容”，优先使用批处理而不是子代理。仅当生成过程需要逐图思考或发散式创意探索时，才使用子代理。

**并行行为**：

- 默认工作线程数为自动设置，受配置限制，内置默认值为 10
- 仅在批处理模式下应用提供商专属的限流；默认设置经过调整，可提高吞吐量，同时避免 RPM 突发
- 使用 `--jobs <count>` 覆盖
- 每张图最多重试 3 次
- 最终输出包括成功数量、失败数量以及每张图的失败原因

## 错误处理

- 缺少 API 密钥 → 返回包含设置说明的错误
- 生成失败 → 每张图自动重试最多 3 次
- 无效的宽高比 → 发出警告，并使用默认值继续
- 使用不受支持的提供商/模型处理参考图 → 返回包含修复提示的错误

### Codex image2 回退

如果 `--provider openai --model gpt-image-2` 因缺少 `OPENAI_API_KEY` 而失败，但当前运行时具有原生图像生成后端，或仓库级别的 `codex-imagegen` 包装器可用，请使用该路径，而不是让用户继续等待。请明确说明回退方案是真正的参考图像生成，还是仅根据提取的视觉特征通过文本提示进行重建。参见 `references/codex-image2-fallback.md`。

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/usage-examples.md` | 涵盖各提供商和批处理模式的扩展 CLI 示例 |
| `references/codex-oauth-vs-openai-api-key.md` | 为什么 Codex/ChatGPT OAuth 的 image2 权益无法通过 baoyu-image-gen 的标准 OpenAI API 密钥提供商使用 |
| `references/codex-image2-fallback.md` | 在缺少 OpenAI API 凭据但 Codex/原生图像生成功能可用时的实际回退行为 |
| `references/providers/dashscope.md` | DashScope 系列、尺寸和限制 |
| `references/providers/zai.md` | Z.AI GLM-image / cogview-4 |
| `references/providers/minimax.md` | MiniMax image-01 与主体参考 |
| `references/providers/openrouter.md` | OpenRouter 多模态流程 |
| `references/providers/replicate.md` | Replicate 支持的系列及防护措施 |
| `references/providers/agnes.md` | Agnes（agnes-image-2.1-flash）的尺寸、参考图和限制 |
| `references/config/preferences-schema.md` | EXTEND.md 架构 |
| `references/config/first-time-setup.md` | 首次设置流程 |

## 扩展支持

通过 EXTEND.md 使用自定义配置。路径和架构请参见步骤 0。