---
version: 0.12.0
name: higgsfield-generate
description: |
  Generate images/videos/3D assets/audio via Higgsfield AI. Defaults:
  GPT Image 2 for image/design/text, Seedance 2.0 for
  video, Nano Banana 2/Lite/Pro for character/reference
  images, Marketing Studio for ads, Seed Audio 1.0 for audio.
  Use when: "generate an image", "make a video", "animate
  this photo", "image-to-video", "edit/stylize/remix this
  image", "reframe this video", "edit this video from a
  sketch", "create a 3D model/GLB", "create a sound effect",
  "make music", "text-to-audio", "create an ad", "make a UGC
  video", "unboxing", "presenter video", "import product from
  URL", or "analyze video virality". Supports generic generation,
  workflows, Marketing Studio, and Virality Predictor.
  Chain with higgsfield-soul-id for face/identity consistency.
  NOT for: Soul training, brand systems/brandbooks (use
  higgsfield-brandkit), photoshoots, cards, YouTube thumbnails
  (use higgsfield-youtube-thumbnail), explainers (use
  higgsfield-video-explainer), playable games/assets (use
  higgsfield-game-generation), or TTS.
argument-hint: "[prompt-or-analysis-request] [--model <name>] [--image|--video <path-or-id>]"
allowed-tools: Bash
---
# Higgsfield 生成

向任意 Higgsfield 模型提交任务。封装了 `higgsfield` CLI。涵盖通用图像/视频/3D/音频生成、Marketing Studio（品牌广告、虚拟形象、产品、钩子、场景），以及作为次要功能的 Virality Predictor 视频评分。

## 第 0 步 — 初始化

执行任何其他命令之前：

1. 如果 `$PATH` 中没有 `higgsfield`，请安装：
   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```
2. 如果 `higgsfield account status` 执行失败并显示 `Session expired` / `Not authenticated`，请让用户运行 `higgsfield auth login`（交互式），并等待用户确认。


## 用户体验规则

1. 保持简洁。不要在聊天中输出原始 ID，也不要转储 JSON。对于生成的资产，输出媒体 URL；对于 Virality Predictor，输出文本摘要。
2. 不要使用内部术语。不要叙述“调用 higgsfield cost”“轮询任务”。
3. 根据用户的第一条消息检测其语言，并使用该语言回复。技术参数（`--aspect_ratio 16:9`）保持英文。
4. 不要一次询问多个问题。选择合理的默认模型，仅在确实缺少信息时才每次询问一个问题。
5. 除非用户要求，否则不要预估成本，也不要为了降低成本而优化模型选择。优先使用质量最佳的默认选项。
6. 向 `generate create` 传递 `--wait`，使该命令阻塞直至完成，并自行输出结果 URL。避免使用分两步执行的 `create` → `wait` 模式。

## 发现机制防护规则

查找 Higgsfield 功能/模型时，不要只依赖语义搜索或 CLI `--help`。应先运行未经过滤的模型列表，然后检查可能的 `job_set_type` 名称。如果用户表示某个模型确实存在，但搜索未返回结果，应相信这一信息，并在回答前通过完整模型列表进行验证。

工作流与模型相互独立。使用 `higgsfield workflow list` 发现工作流，并使用 `higgsfield workflow get <workflow_name>` 检查参数。

Virality Predictor 通过以下形式提供：

- 面向客户的名称：Virality Predictor
- 技术 `job_set_type`：`brain_activity`
- 类别/输出：文本报告。这是一种视频输入/文本输出的分析，而不是文本/聊天生成模型。
- 输入：已上传的视频
- 用途：对成片视频的钩子、注意力、留存率和传播潜力进行分析

如果用户说“分析这个视频”“为这个广告评分”“评估这个钩子”或类似请求，应路由到 `brain_activity`，即使它出现在文本/分析模型下。应根据任务意图和所需输入进行分类，而不是只根据输出类别分类。

## 工作流 — 通用生成

1. **选择模型。** 除非需求明显需要专用模型，否则从核心默认模型开始：

   - **GPT Image 2** → 高保真通用生成、平面设计、UI、横幅、字体排印和图中文字的默认图像模型。
   - **Seedance 2.0** → 复杂运动、电影感片段、多镜头创作、图生视频，以及 4–15 秒、最高 4K 制作级输出的默认视频模型。支持 12 秒。
   - **Nano Banana 2/Lite/Pro** → 角色、卡通、风格化和参考图驱动型图像工作的默认模型；需要速度/成本优势时使用 Lite，处理更复杂的需求时使用 Pro。
   - **Marketing Studio** → 广告、UGC、产品演示、开箱、电视广告、出镜人视频以及品牌/产品工作流的默认选择。
   - **Seed Audio 1.0** → 文生音频、语音、音效、环境音、拟音和类音乐音频的默认音频模型，除非用户指定 Sonilo/Mirelo。

**图像：**
   - 完整的品牌识别、徽标系统、配色方案、字体系统、品牌手册、包装系统、标识系统或协调统一的品牌资产套件 → 改用 `higgsfield-brandkit`。
   - YouTube 缩略图、Shorts 封面或 Instagram 视频封面 → 改用 `higgsfield-youtube-thumbnail`。
   - 品牌产品视觉素材（Pinterest 图钉、生活方式图片、主视觉横幅、广告素材包、虚拟试穿）→ 改用 `higgsfield-product-photoshoot`。不要使用此 Skill。
   - 带有品牌名称或标签文字的生成式产品概念图 / 包装 / 易拉罐 / 瓶子 → GPT Image 2。
   - 带有虚拟形象 + 产品的品牌广告图片（Marketing Studio 形式）→ Marketing Studio Image（参见下方的 Marketing Studio）
   - 美学风格的 UGC / 时尚大片 / 生活方式角色 → Soul 2.0
   - 电影感静帧 → Soul Cinema
   - 极具个性的创意人物形象（仅文本、特色鲜明）→ Soul Cast
   - 地点 / 环境 / 无人物场景 → Soul Location（同类最佳）
   - 徽标、图标、矢量风格插图、品牌标志、限定配色的图形 → Recraft V4.1（`recraft_v4_1`，通常搭配 `--model_type vector`）
   - 人脸编辑 + 复杂场景替换 → Seedream 4.5
   - Soul Character（来自 `higgsfield-soul-id` 的引用 ID）→ 静态图使用 Soul 2.0，电影感内容使用 Soul Cinema
   - 角色或卡通风格作品 → Nano Banana 2；快速/简单的参考图编辑使用 Nano Banana 2 Lite（`nano_banana_2_lite`），遇到复杂情况则升级使用 Nano Banana Pro
   - 快速且低成本的迭代 → Z Image
   - **其他所有情况默认使用 → GPT Image 2。** 适用于平面设计、UI、横幅、字体排印和高保真通用生成。

   **视频：**
   - 根据主题、故事或文档制作完整的旁白解说视频 → 使用 `higgsfield-video-explainer`，而不是通用视频生成。
   - 所有广告 / 商业 / 品牌广告视频 → Marketing Studio（参见下方的 Marketing Studio）
   - 根据草图/时间戳编辑现有视频，或将其重新构图为其他宽高比 → 使用工作流（`draw_to_video` 或 `reframe`），而不是模型。参见 `references/workflows.md`。
   - **默认的全能型专业视频模型（多镜头、身份一致性、动态丰富、图生视频、4–15 秒请求）→ Seedance 2.0。** 业界领先。不要仅仅因为 Seedance 1.5 的时长枚举更容易理解就降级使用它；应优先验证 Seedance 2.0。
   - 动态不强的单平面场景，且需要比 Seedance 2.0 更低的成本 → Kling 3.0；如果用户明确要求 Turbo、更快或成本更低的 Kling 输出 → Kling 3.0 Turbo（`kling3_0_turbo`）
   - 无剪辑的低成本干净镜头，仅当用户要求更便宜/预算型输出时使用 → Seedance 1.5 Pro
   - 电影级最高保真度 → Cinema Studio Video 3.0
   - 成本低且物理效果出色，无需音频 → Minimax Hailuo
   - 快速批量 / 大规模生成 → Veo 3.1 Lite
   - 基于必需的起始图像生成大胆/风格化的图生视频 → Grok Video 1.5（`grok_video_v15`）。需要一个 `--start-image` 或 `--image`，时长为 2–15 秒，分辨率为 `480p` 或 `720p`。
   - 使用最多 7 张图像或一个视频参考进行多模态参考视频生成 → Gemini Omni Flash（`gemini_omni`）；专业视频仍默认选择 Seedance 2.0。
   - 参考驱动的生成、编辑现有视频或扩展视频 → **Seedance 2.5**（`seedance_2_5`），其模式包括 `t2v` / `omni_reference` / `video_edit` / `video_extension`，并接收图像/视频/音频参考数组。它并不是比 Seedance 2.0 更新的版本：其最高仅支持 **720p**，因此任何需要 1080p 或 4K 的任务仍应使用 Seedance 2.0。

**视频分析：**
   - 评估成片视频的开场吸引力、病毒式传播潜力、注意力、留存率或分散注意力的风险 → Virality Predictor（`brain_activity`）。这是一个返回文本评分/报告的视频分析模型，而非生成媒体资产。

   **3D：**
   - 可玩游戏中的 3D 资产或游戏全局资产系统 → 使用 `higgsfield-game-generation`。
   - 根据一张或多张物体/产品参考图像创建实际的 3D 网格/模型/GLB → Multi-Image to 3D（`multi_image_to_3d`）。通过重复使用 `--image` 传入 1–4 张图像；当资产需要纹理时，使用 `--should_texture true`。如果用户只要求生成一张 3D 渲染图片，则改用图像模型。

   **音频：**
   - **音频生成默认选择 → Seed Audio 1.0（`seed_audio`）。**用于文本生成音频、音效、环境氛围音、拟音、冲击音、环境声音、特定声音风格的生成以及类似音乐的音频。它要求提供 `--prompt`；仅当用户提供了参考素材时，才使用可选的 `--audio-references`/`--image-references`。
   - 仅当用户明确要求使用 Sonilo，或你需要这一专业音乐模型时，才使用 Sonilo Music（`sonilo_music`）。它要求提供 `--prompt` 和 `--duration`，并返回音频。
   - 仅当用户明确要求使用 Mirelo，或你需要这一旧版音效模型时，才使用 Mirelo Text to Audio（`mirelo_text_to_audio`）。它要求提供 `--prompt` 和 `--duration`，并返回音频。

   要获取传递给 `higgsfield generate create` 的实际 `--model` ID，请运行 `higgsfield model list --json | jq`，将显示名称映射到 ID。完整表格请参阅 `references/model-catalog.md`。

2. **将媒体输入直接传递给标志。**媒体标志接受本地文件路径**或** UUID。CLI 会自动上传路径，并自动检测 UUID 对应的是作业还是上传内容。无需预先上传。每个模型都会声明其接受的媒体角色或 `*_references` 参数——请参阅 `references/media-inputs.md`。
3. **快速验证。**如果不确定参数，请运行一次 `higgsfield model get <jst> --json`，并仅传入所需内容。在回退到旧模型之前，先验证首选模型。其他情况下使用模式默认值。对于非致命的强制转换（例如 `aspect_ratio=99:99` → 最接近的匹配项），服务器会返回 `adjustments`；对于已声明参数的无效值，则会返回结构化错误。
4. **一次性提交并等待。**`higgsfield generate create <jst> [--prompt "..."] [media flags] [param flags] --wait`。该命令会阻塞至终止状态，并将结果打印到标准输出。可调参数：`--wait-timeout 20m`（默认 10 分钟）、`--wait-interval 5s`（默认 3 秒）。Virality Predictor 不需要提示词；传入 `--video`。
5. **交付。**对于生成的媒体和 3D 资产，发送主要结果 URL，并附上一行摘要（模型；如果是视频，则还包括时长；如果是 3D，则包括 GLB/资产 URL）。对于 Virality Predictor，提供评分、业务解读和打开报告的链接。在常规聊天输出中，不要展示 Virality Predictor 的 `.glb`、`.bin` 或区域表内部信息。

如需稍后检查或重新运行，`higgsfield generate list --json` 和 `higgsfield generate get <id> --json` 可用于回溯查看。如果需要重新接入未使用 `--wait` 启动的作业，仍可使用 `higgsfield generate wait <id>`。

对于工作流任务，请使用 `higgsfield generate workflow <workflow_name> ... --wait`。成本查询语法为 `higgsfield generate cost workflow <workflow_name> ...`。参见 `references/workflows.md`。

## 媒体标志

| 标志 | 用途 | 支持该标志的模型 |
|---|---|---|
| `--image <path-or-id>` | 参考图像 | 大多数图像模型、`grok_video_v15`、`multi_image_to_3d`、`seedance_2_0`、`seedance_2_5`、`veo3`、`marketing_studio_video` |
| `--start-image <path-or-id>` | 用于图生视频转场的第一帧 | `grok_video_v15`、`kling3_0`、`kling3_0_turbo`、`kling2_6`、`veo3_1`、`seedance_2_0`、`marketing_studio_video` |
| `--end-image <path-or-id>` | 用于转场的最后一帧 | `kling3_0`、`seedance_2_0`、`marketing_studio_video` |
| `--video <path-or-id>` | 参考视频或待分析视频 | `seedance_2_0`、`seedance_2_5`、`brain_activity` |
| `--audio <path-or-id>` | 参考音频（口型同步、配乐匹配） | `seedance_2_0`、`seedance_2_5`（请使用此标志，而不是 `--generate-audio`） |

对于使用参考数组的模型，显式标志为 `--image-references`、`--video-references` 和 `--audio-references`；当架构公开相应参数时，`--image`、`--video` 和 `--audio` 是简短别名。

每个标志都接受本地文件路径（自动上传）或 UUID（来自 `higgsfield upload create` 的上传 ID，或先前的任务 ID）。每个模型都声明自己的媒体角色或 `*_references` 参数。完整表格请参见 `references/media-inputs.md`。

## 通用参数

标志会直接传递给模型架构。使用 `higgsfield model get <jst>` 查看可用参数。

```bash
higgsfield generate create gpt_image_2 --prompt "neon city at dusk" --aspect_ratio 16:9 --resolution 2k --wait
higgsfield generate create nano_banana_2 --prompt "anime character concept, expressive pose" --image ./ref.png --wait
higgsfield generate create seedance_2_0 --prompt "camera dollies in" --start-image ./first.png --duration 12 --resolution 4k --wait
higgsfield generate create grok_video_v15 --prompt "cinematic handheld shot, neon rainy street" --start-image ./image.png --duration 5 --resolution 720p --wait
higgsfield generate create text2image_soul_v2 --prompt "..." --soul-id <soul_ref_id> --quality 2k --wait
higgsfield generate create multi_image_to_3d --image ./front.png --image ./side.png --should_texture true --wait
higgsfield generate create seed_audio --prompt "cinematic rain ambience with distant thunder" --wait
higgsfield generate create sonilo_music --prompt "cinematic synthwave track" --duration 12 --wait
higgsfield generate create mirelo_text_to_audio --prompt "glass breaking in a large hall" --duration 4 --wait
higgsfield generate create brain_activity --video ./ad.mp4 --wait
```

对于机器可读输出（链式流水线、智能体上下文），请添加 `--json`。使用 `--wait --json` 时，你将获得最终的任务对象数组。不使用 `--wait` 时，你将获得任务 ID。Virality Predictor 会将原始分析和渲染产物存储在任务参数中，但默认文本输出应仅保留评分和“打开报告”。

Stdin 提示词：`echo "..." | higgsfield generate create z_image --wait`。

Soul 图像质量：对于 `text2image_soul_v2` 和 `soul_cinematic`，传入 `--quality 1.5k` 或 `--quality 2k`。这些是面向 UI 的档位；后端会根据所选的 `--aspect_ratio`，将其映射为 `720p`/`1080p` 以及模型特定的尺寸。`soul_location` 没有质量选择器；它针对每种宽高比使用固定尺寸。

## 营销工作室

品牌化图像/视频生成：虚拟形象 + 产品 + 可选的开场钩子/场景设置 + 广告风格模式。使用模型 `marketing_studio_video` 和 `marketing_studio_image`。

### 概念

- **虚拟形象** — 出镜者面孔。可使用精选的 `preset`（通过 `higgsfield marketing-studio avatars list` 浏览），或使用 `custom`（通过 `higgsfield marketing-studio avatars create` 上传照片）。对于 UGC 模式，如果需求描述中明确提到人物，则虚拟形象是可选的；后端可以自动创建 Soul Character。当用户需要特定出镜者时，请传入虚拟形象。
- **产品** — 包含标题和参考图像的品牌商品。可从 URL 导入（`higgsfield marketing-studio products fetch --url ...`），或使用上传的图像创建（`higgsfield marketing-studio products create`）。
- **网页产品** — App Store / 网页版本。获取 App Store URL 时会自动路由。
- **开场钩子** — 可复用的开场角度/广告钩子。通过 `higgsfield marketing-studio hooks list` 浏览。钩子文本会添加到用户提示词的开头；它不会替代 `--prompt`。
- **场景设置** — 可复用的环境/场景上下文。通过 `higgsfield marketing-studio settings list` 浏览。
- **广告参考** — 可复用的灵感视频，可以绑定到虚拟形象和/或产品。可通过上传的视频（`--video-input <upload_id>`）或之前的生成任务（`--job <job_id>`）创建。通过 `higgsfield marketing-studio ad-references list` 浏览。请参阅 `references/marketing-ad-references.md`。
- **品牌套件** — 记录品牌的身份信息（名称、徽标、主视觉图像、颜色、字体、语调），以便在图像生成中复用。通过提交网站 URL 创建（`higgsfield marketing-studio brand-kits fetch --url https://… --wait`）。请参阅 `references/marketing-brand-kits.md`。
- **广告格式** — 用于驱动生成图像视觉结构的预设（`headline`、`bullet-points` 等）。只读，通过 `higgsfield marketing-studio ad-formats list` 浏览。它是 `dtc-ads generate` 的必需输入。

### 发现命令

当用户询问现有哪些内容时，请使用以下确切的列表命令：

```bash
higgsfield marketing-studio avatars list --json
higgsfield marketing-studio products list --json
higgsfield marketing-studio hooks list --json
higgsfield marketing-studio settings list --json
higgsfield marketing-studio ad-references list --json
higgsfield marketing-studio brand-kits list --json
higgsfield marketing-studio ad-formats list --json
```

只有 `marketing_studio_video` 支持 `--hook_id` 和 `--setting_id`；不要将它们传给 `marketing_studio_image`。

### UX 规则（补充）

- 每个阶段只问一个问题。不要一开始就同时询问产品、虚拟形象和模式。
- **两种广告制作方式互斥。** 用户要么提供广告参考视频（参考驱动），**要么**选择开场钩子/场景设置模块（由模块组合）——绝不能同时使用。如果用户已选择广告参考，则不要提供开场钩子/场景设置选项；如果已选择开场钩子/场景设置，则不要提议附加广告参考。
- **广告参考来源。** 唯一有效的输入是本地视频文件（通过 `higgsfield upload create ... --video` 上传）或之前的视频任务。如果用户提供的是其他内容，请要求其提供本地文件。
- **`dtc-ads` 的广告格式是必需的。** 始终要求用户从 `ad-formats list` 中选择。不存在自动默认值——CLI 和服务器都会拒绝未提供 `--format-id` 的调用。
- **`dtc-ads` 的可选输入。** 当需求描述需要时，建议使用虚拟形象、产品和参考媒体；仅附加用户选择的内容。

### 工作流 — 快速广告视频

1. **获取产品。**
   - 现有产品 → `higgsfield marketing-studio products list --json`
   - URL → `higgsfield marketing-studio products fetch --url <url> --wait`（轮询直至导入完成）
   - 本地图片 → `higgsfield upload create <photo>...`，然后运行 `higgsfield marketing-studio products create --title "..." --image <id>...`
   记录产品 ID。使用 `--hook_id` 时，强烈建议同时传入 `--product_ids`；钩子的设计用途是引入产品，在缺少产品上下文时效果很差。
2. **如有需要，选择虚拟形象。**
   - 默认：运行 `higgsfield marketing-studio avatars list`，选择一个符合品牌调性的预设。
   - 自定义：`higgsfield marketing-studio avatars create --name "..." --image <upload_id>`。
   对于 UGC 模式，如果不需要特定出镜者且需求中提到了人物，则可以省略 `--avatars`；后端可以合成一个 Soul Character。
3. **可选：选择配置项。**
   - 钩子：`higgsfield marketing-studio hooks list --json`
   - 场景：`higgsfield marketing-studio settings list --json`
   仅针对 `marketing_studio_video`，将所选 ID 以 `--hook_id <hook_id>` 和 `--setting_id <setting_id>` 的形式传入。除非用户明确希望强化相同的措辞，否则不要将钩子的提示词复制到 `--prompt` 中。
4. **如有需要，选择模式。**默认模式为 `ugc`；不能仅仅因为存在 `--hook_id` 就要求提供 `--mode`。当前其他 slug：`ugc_how_to`、`ugc_unboxing`、`product_showcase`、`product_review`、`tv_spot`、`wild_card`、`ugc_virtual_try_on`、`virtual_try_on`。**钩子/场景仅适用于 `ugc`、`ugc_how_to`、`ugc_unboxing`、`product_review`、`ugc_virtual_try_on`** — 不要将 `--hook_id` / `--setting_id` 与其他模式一起传入。参见 `references/marketing-modes.md`。
5. **生成（一次性）。**
   ```bash
   PRODUCT_IDS_JSON=$(mktemp)
   AVATARS_JSON=$(mktemp)
   printf '["<product_id>"]' > "$PRODUCT_IDS_JSON"
   printf '[{"id":"<avatar_id>","type":"preset"}]' > "$AVATARS_JSON"

   higgsfield generate create marketing_studio_video \
     --prompt "..." \
     --avatars @"$AVATARS_JSON" \
     --product_ids @"$PRODUCT_IDS_JSON" \
     --mode ugc \
     --duration 15 \
     --resolution 720p \
     --aspect_ratio 9:16 \
     --wait
   ```
   如果选择了配置钩子/场景，请添加 `--hook_id <hook_id>` 和/或 `--setting_id <setting_id>`。
   `product_ids` 和 `avatars` 是 JSON 数组；请通过 `@/path/to/file.json` 传入。不要向 `--product_ids` 传入单独的 UUID。
   分辨率为 `480p` 或 `720p`。宽高比可以是 `auto`/`21:9`/`16:9`/`4:3`/`1:1`/`3:4`/`9:16` 之一。此处支持 `--generate-audio true`（与 `seedance_2_0` 不同）。`--wait` 会阻塞直至完成；对于耗时较长的广告生成任务，请将超时时间提高为 `--wait-timeout 30m`。
6. **交付。**URL + 一行摘要（模式、时长）。

### 点击生成广告快捷方式（URL 驱动）

当用户提供产品 URL，并希望一次性生成营销视频时：

```bash
# 1. Trigger fetch (returns the product id, import runs in the background)
higgsfield marketing-studio products fetch --url https://shop.example.com/sneakers --wait

# 2. Generate the marketing video against the same URL — backend reuses the entity
higgsfield generate create marketing_studio_video \
  --url https://shop.example.com/sneakers \
  --mode ugc \
  --duration 15 \
  --aspect_ratio 9:16 \
  --wait
```

后端会按 URL 去重，因此重复运行时会复用现有实体，而不是重新获取。

### 工作流 — 营销图片

与上文相同，但使用 `marketing_studio_image` 模型：

```bash
higgsfield generate create marketing_studio_image \
  --prompt "..." \
  --aspect_ratio 1:1 \
  --resolution 2k \
  --wait
```

## Virality Predictor 视频评分

当用户希望将已完成的视频作为商业创意进行评估时，请使用 Virality Predictor（`brain_activity`），评估内容包括：开头吸引力、病毒式传播潜力、注意力、留存率，或内容/产品在保持用户专注和减少分心方面的表现。将“Virality Predictor”视为面向客户的功能名称；`brain_activity` 仅用作 CLI/job_set_type。

```bash
higgsfield generate create brain_activity --video ./creative.mp4 --wait
```

结果是文本，而不是生成的图片/视频。请报告总体得分、吸引力峰值所在秒数、持续度得分、最强/最弱区域，以及报告 URL（如果存在）。将其解读为用于创意测试的客观注意力代理指标：Visual/Auditory/Language/Attention 得分越高，表明刺激和专注度越强；Default Mode 越低越好，因为这意味着走神更少。

CLI 会输出一个 Open report URL，例如 `https://<app-domain>/apps/virality-predictor?resultJobId=<job_id>`。将该 URL 发送给用户以供查看可视化报告。`brain_example_url`、`vertexMapBinaryUrl` 和 `vertexMapUrl` 等原始产物 URL 属于实现细节；仅当用户要求获取原始数据或实现细节时才提及它们。

良好的最终输出格式：

```text
Overall score: 44/100
Peak hook: 49% at 1s
Sustain: 89%
Strongest region: Visual Cortex
Risk: Default Mode is high, which can indicate mind-wandering.

Open report: <report_url>
```

## 错误

- `Missing required params: prompt` → 用户未提供提示词；向用户询问提示词。
- `Missing required params: medias` 在 `brain_activity` / Virality Predictor 中出现 → 通过 `--video <path-or-id>` 传入且仅传入一个视频。
- `Invalid values: aspect_ratio=99:99 (allowed: ...)` → 枚举值无效；从允许的值中选择。
- `Unknown params: foo` → schema 不接受该标志；检查 `higgsfield model get <jst>`。如果 `hook_id` 或 `setting_id` 出现此错误，则所选模型/job_set_type 不支持 Marketing Studio 设置项。
- `Session expired` → `higgsfield auth login`。

更多信息请参阅 `references/troubleshooting.md`。

## 参考文档

按需加载：

- `references/model-catalog.md` — 为任务选择合适的模型
- `references/workflows.md` — `draw_to_video` 和 `reframe` 工作流生成
- `references/prompt-engineering.md` — 编写有效的提示词
- `references/media-inputs.md` — 图片/视频/音频参考流程和 Virality Predictor 视频分析
- `references/troubleshooting.md` — 常见错误和修复方法
- `references/marketing-avatars.md` — 预设头像与自定义头像
- `references/marketing-products.md` — URL 获取与手动创建产品
- `references/marketing-setup-items.md` — hooks/settings 的发现与使用
- `references/marketing-ad-references.md` — 广告参考视频（创建/列出/获取）
- `references/marketing-brand-kits.md` — 品牌套件（从 URL 获取、列出、获取）
- `references/marketing-dtc-ads.md` — DTC Ads Engine（`dtc-ads generate`）
- `references/marketing-modes.md` — Marketing Studio 的所有模式