---
version: 0.12.0
name: higgsfield-generate
description: |
  Generate images/videos/3D assets/audio via Higgsfield AI. Defaults:
  GPT Image 2.5 for image/design/text, Seedance 2.5 for
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

向任意 Higgsfield 模型提交任务。封装 `higgsfield` CLI。涵盖通用图像/视频/3D/音频生成、Marketing Studio（品牌广告、头像、产品、钩子、设置），以及次要功能 Virality Predictor 视频评分。

## 步骤 0 — 初始化

在执行任何其他命令之前：

1. 如果 `$PATH` 中没有 `higgsfield`，请安装：
   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```
2. 如果 `higgsfield account status` 失败并显示 `Session expired` / `Not authenticated`，请让用户运行 `higgsfield auth login`（交互式），并等待确认。


## UX 规则

1. 保持简洁。聊天中不要输出原始 ID 或 JSON 转储。对于生成的资源，输出媒体 URL；对于 Virality Predictor，输出文本摘要。
2. 不要使用内部术语。不要叙述“调用 higgsfield cost”“轮询任务”等过程。
3. 根据用户的第一条消息判断其语言，并使用该语言回复。技术参数（`--aspect_ratio 16:9`）保持英文。
4. 不要一次询问多个问题。选择一个合理的默认模型；只有确实缺少必要信息时，才一次询问一个问题。
5. 不要预估成本，也不要主动选择更便宜的模型，除非用户提出要求。优先使用质量默认模型。
6. 对 `generate create` 传入 `--wait`，使命令阻塞直到完成，并直接打印结果 URL。避免采用两步式的 `create` → `wait` 模式。

## 发现功能的保护规则

查找 Higgsfield 功能/模型时，不要只依赖语义搜索或 CLI `--help`。应先运行未过滤的模型列表，然后检查可能的 `job_set_type` 名称。如果用户表示某个模型存在，但搜索没有结果，请相信这一信号，并通过完整模型列表进行验证。

工作流与模型是分开的。使用 `higgsfield workflow list` 发现工作流，并使用 `higgsfield workflow get <workflow_name>` 检查参数。

Virality Predictor 的定义如下：

- 面向客户的名称：Virality Predictor
- 技术 `job_set_type`：`brain_activity`
- 类别/输出：文本报告。这是视频输入/文本输出的分析模型，不是文本/聊天生成模型。
- 输入：上传的视频
- 用途：分析已完成视频的钩子、注意力、留存率和传播潜力

如果用户说“分析这个视频”“给这个广告评分”“评估这个钩子”或类似内容，请路由到 `brain_activity`，即使它出现在文本/分析模型下。应根据任务意图和所需输入进行分类，而不能只根据输出类别。

## 工作流 — 通用生成

1. **选择模型。** 从核心默认模型开始，除非需求明显需要专用模型：

   - **GPT Image 2.5** → 高保真通用生成、平面设计、UI、横幅、排版和图像中文字的默认图像模型。
   - **Seedance 2.5**（`seedance_2_5`）→ 严肃动态、电影感片段、多镜头工作和图生视频的 SOTA 默认视频模型。支持 4–30 秒输出，最高 1080p；需要原生 4K 时使用 Seedance 2.0。
   - **Nano Banana 2/Lite/Pro** → 角色、卡通、风格化和参考图驱动图像工作的默认模型；追求速度/成本时使用 Lite，处理更复杂的需求时使用 Pro。
   - **Marketing Studio** → 广告、UGC、产品演示、开箱、电视广告、演示者视频以及品牌/产品工作流的默认选择。
   - **Seed Audio 1.0** → 文本转音频、语音、音效、环境音、拟音和类似音乐的音频的默认音频模型，除非用户指定 Sonilo/Mirelo。

**图像：**
   - 完整品牌识别、Logo 系统、配色方案、字体设计、品牌手册、包装系统、标牌或协调统一的品牌资产套件 → 改用 `higgsfield-brandkit`。
   - YouTube 缩略图、Shorts 封面或 Instagram 视频封面 → 改用 `higgsfield-youtube-thumbnail`。
   - 品牌产品视觉素材（Pinterest pin、生活方式图、主视觉横幅、广告套件、虚拟试穿）→ 改用 `higgsfield-product-photoshoot`。不是本 Skill。
   - 带有品牌名称或标签文字的生成式产品概念图 / 包装 / 易拉罐 / 瓶子 → GPT Image 2.5。
   - 带有头像和产品的品牌广告图（Marketing Studio 形式）→ Marketing Studio Image（见下方 Marketing Studio）
   - 审美化 UGC / 时尚编辑风 / 生活方式角色 → Soul 2.0
   - 电影感静帧 → Soul Cinema
   - 极具角色特征的创意人格（纯文本、风格鲜明）→ Soul Cast
   - 地点 / 环境 / 无人物场景 → Soul Location（同类最佳）
   - Logo、图标、矢量风格插画、品牌标志、受控配色图形 → Recraft V4.1（`recraft_v4_1`，通常搭配 `--model_type vector`）
   - 人脸编辑 + 复杂场景替换 → Seedream 4.5
   - Soul Character（来自 `higgsfield-soul-id` 的 reference id）→ 静帧使用 Soul 2.0，电影感内容使用 Soul Cinema
   - 角色或卡通风格作品 → Nano Banana 2；快速/简单的参考图编辑使用 Nano Banana 2 Lite（`nano_banana_2_lite`），复杂案例则升级到 Nano Banana Pro
   - 快速且低成本的迭代 → Z Image
   - **其他所有情况的默认选择 → GPT Image 2.5。** 平面设计、UI、横幅、排版和高保真通用生成。

   **视频：**
   - 根据主题、故事或文档制作完整的带旁白讲解视频 → 使用 `higgsfield-video-explainer`，不要使用通用视频生成。
   - 所有广告 / 商业 / 品牌广告视频 → Marketing Studio（见下方 Marketing Studio）
   - 根据草图/时间戳编辑现有视频，或调整到另一种宽高比 → 使用工作流（`draw_to_video` 或 `reframe`），不要使用模型。参见 `references/workflows.md`。
   - **默认的全能型严肃视频选择（多镜头、身份一致性要求高、运动密集型、图生视频、4–30s 请求）→ Seedance 2.5。** SOTA。不要仅仅因为其 duration enum 更易读就降级使用 Seedance 1.5；先验证 Seedance 2.5。
   - 没有强烈动态的单平面场景、成本更低的选项 → Kling 3.0；如果用户明确要求 Turbo、更快或成本更低的 Kling 输出 → Kling 3.0 Turbo（`kling3_0_turbo`）
   - 廉价的干净镜头、无剪辑，仅在用户要求更便宜/预算型输出时使用 → Seedance 1.5 Pro
   - 电影级最高保真度 → Cinema Studio Video 3.0
   - 物理效果强、成本低、无需音频 → Minimax Hailuo
   - 快速批量 / 大批量生成 → Veo 3.1 Lite
   - 从必需的起始图像生成大胆/风格化的图生视频 → Grok Video 1.5（`grok_video_v15`）。需要一个 `--start-image` 或 `--image`，时长为 2–15s，分辨率为 `480p` 或 `720p`。
   - 支持最多 7 张图像或一个视频参考的多模态参考生视频 → Gemini Omni Flash（`gemini_omni`）；继续将 Seedance 2.5 作为严肃视频的默认选择。
   - 基于参考生成、编辑现有视频或延长视频 → **Seedance 2.5**（`seedance_2_5`），其模式为 `t2v` / `omni_reference` / `video_edit` / `video_extension`，并接受图像/视频/音频参考数组。对于参考输入（包括起始帧/结束帧）使用 `omni_reference`；`t2v` 不接受媒体。支持最高 **1080p**；仅在需要原生 4K 时使用 Seedance 2.0。

**视频分析：**
   - 评估成片的钩子、病毒式传播潜力、注意力、留存率或分散注意力的风险 → Virality Predictor (`brain_activity`)。这是一个视频分析模型，会返回文本评分/报告，而不是生成媒体资产。

   **3D：**
   - 可游玩游戏中的 3D 资产或覆盖整个游戏的资产系统 → 使用 `higgsfield-game-generation`。
   - 根据一张或多张物体/产品参考图创建实际的 3D 网格/模型/GLB → Multi-Image to 3D (`multi_image_to_3d`)。使用重复的 `--image` 传入 1–4 张图片；当资产需要纹理时使用 `--should_texture true`。如果用户只要求 3D 渲染图片，则使用图像模型。

   **音频：**
   - **音频生成的默认选择 → Seed Audio 1.0 (`seed_audio`)。**用于文本转音频、音效、氛围音、拟音、冲击声、环境音、声音风格生成以及类似音乐的音频。它需要 `--prompt`；仅当用户提供了参考内容时，才使用可选的 `--audio-references`/`--image-references`。
   - 仅当用户明确要求 Sonilo，或你需要使用该专业音乐模型时，才使用 Sonilo Music (`sonilo_music`)。它需要 `--prompt` 和 `--duration`，并返回音频。
   - 仅当用户明确要求 Mirelo，或你需要使用该旧版音效模型时，才使用 Mirelo Text to Audio (`mirelo_text_to_audio`)。它需要 `--prompt` 和 `--duration`，并返回音频。

   要获取传递给 `higgsfield generate create` 的实际 `--model` ID，请运行 `higgsfield model list --json | jq`，将显示名称映射到 ID。完整表格请参见 `references/model-catalog.md`。

2. **直接将媒体输入传递给标志参数。**媒体标志接受本地文件路径或 UUID。CLI 会自动上传路径，并自动识别 UUID 对应的是任务还是上传内容。无需预先上传。每个模型都会声明可接受的媒体角色或 `*_references` 参数 — 请参见 `references/media-inputs.md`。
3. **快速验证。**如果不确定参数，请运行一次 `higgsfield model get <jst> --json`，然后仅传递所需内容。使用旧模型回退之前，先验证首选模型。其他情况下使用架构默认值。对于非致命的强制调整，服务器会返回 `adjustments`（例如 `aspect_ratio=99:99` → 最接近的匹配值）；对于无效的声明参数值，则返回结构化错误。
4. **一次性提交并等待。**`higgsfield generate create <jst> [--prompt "..."] [media flags] [param flags] --wait`。该命令会阻塞，直到任务进入终止状态，并将结果打印到标准输出。可调参数：`--wait-timeout 20m`（默认 10m）、`--wait-interval 5s`（默认 3s）。Virality Predictor 不需要提示词；传入 `--video`。
5. **交付结果。**对于生成的媒体和 3D 资产，发送主要结果 URL，并附上一行摘要（模型、视频时长；3D 资产则提供 GLB/资产 URL）。对于 Virality Predictor，提供评分、业务解读以及 Open report 链接。正常聊天输出中不要展示 Virality Predictor 的 `.glb`、`.bin` 或区域表内部信息。

如需检查或稍后重新运行，`higgsfield generate list --json` 和 `higgsfield generate get <id> --json` 可用于回顾。若任务是在未使用 `--wait` 的情况下启动，仍可使用 `higgsfield generate wait <id>` 重新加入等待。

对于工作流任务，请使用 `higgsfield generate workflow <workflow_name> ... --wait`。成本语法为 `higgsfield generate cost workflow <workflow_name> ...`。请参阅 `references/workflows.md`。

## 媒体标志

| 标志 | 用途 | 接受它的模型 |
|---|---|---|
| `--image <path-or-id>` | 参考图像 | 大多数图像模型、`grok_video_v15`、`multi_image_to_3d`、`seedance_2_0`、`seedance_2_5`、`veo3`、`marketing_studio_video` |
| `--start-image <path-or-id>` | 图像到视频过渡的第一帧 | `grok_video_v15`、`kling3_0`、`kling3_0_turbo`、`kling2_6`、`veo3_1`、`seedance_2_0`、`seedance_2_5`、`marketing_studio_video` |
| `--end-image <path-or-id>` | 过渡的最后一帧 | `kling3_0`、`seedance_2_0`、`seedance_2_5`、`marketing_studio_video` |
| `--video <path-or-id>` | 参考视频或分析视频 | `seedance_2_0`、`seedance_2_5`、`brain_activity` |
| `--audio <path-or-id>` | 参考音频（口型同步、配乐匹配） | `seedance_2_0`、`seedance_2_5`（参考输入；与生成输出音频不同） |

对于参考数组模型，显式标志为 `--image-references`、`--video-references` 和 `--audio-references`；当架构公开这些参数时，`--image`、`--video` 和 `--audio` 是其短别名。

每个标志都接受本地文件路径（会自动上传）或 UUID（来自 `higgsfield upload create` 的上传 ID，或之前任务的 ID）。每个模型都会声明自己的媒体角色或 `*_references` 参数。完整表格请参阅 `references/media-inputs.md`。

## 常用参数

标志会透传给模型架构。使用 `higgsfield model get <jst>` 进行发现。

```bash
higgsfield generate create gpt_image_2_5 --prompt "neon city at dusk" --aspect_ratio 16:9 --resolution 2k --wait
higgsfield generate create nano_banana_2 --prompt "anime character concept, expressive pose" --image ./ref.png --wait
higgsfield generate create seedance_2_5 --prompt "camera dollies in" --mode omni_reference --start-image ./first.png --duration 12 --resolution 1080p --wait
higgsfield generate create grok_video_v15 --prompt "cinematic handheld shot, neon rainy street" --start-image ./image.png --duration 5 --resolution 720p --wait
higgsfield generate create text2image_soul_v2 --prompt "..." --soul-id <soul_ref_id> --quality 2k --wait
higgsfield generate create multi_image_to_3d --image ./front.png --image ./side.png --should_texture true --wait
higgsfield generate create seed_audio --prompt "cinematic rain ambience with distant thunder" --wait
higgsfield generate create sonilo_music --prompt "cinematic synthwave track" --duration 12 --wait
higgsfield generate create mirelo_text_to_audio --prompt "glass breaking in a large hall" --duration 4 --wait
higgsfield generate create brain_activity --video ./ad.mp4 --wait
```

对于机器可读的输出（链式流水线、代理上下文），请添加 `--json`。使用 `--wait --json` 时，你会获得最终的任务对象数组。不使用 `--wait` 时，你会获得任务 ID。Virality Predictor 会将原始分析和渲染产物存储在任务参数中，但默认文本输出应保持为分数加上 Open report。

Stdin 提示：`echo "..." | higgsfield generate create z_image --wait`。

Soul 图像质量：对于 `text2image_soul_v2` 和 `soul_cinematic`，传递 `--quality 1.5k` 或 `--quality 2k`。这些是面向 UI 的质量等级；后端会将其映射为 `720p`/`1080p`，并根据所选 `--aspect_ratio` 映射到模型特定的尺寸。`soul_location` 没有质量选择器；它会根据宽高比使用固定尺寸。

## Marketing Studio

品牌图像/视频生成：头像 + 产品 + 可选的设置钩子/设置 + 广告风格模式。使用模型 `marketing_studio_video` 和 `marketing_studio_image`。

### 概念

- **Avatar** — 演示者的面部形象。可以使用精选的 `preset`（运行 `higgsfield marketing-studio avatars list` 浏览），也可以使用 `custom`（通过 `higgsfield marketing-studio avatars create` 上传照片）。对于 UGC 模式，如果需求描述中明确提到人物，则头像为可选项；后端可以自动创建 Soul Character。当用户需要特定的演示者时，传入头像。
- **Product** — 包含标题和参考图像的品牌商品。可以从 URL 导入（`higgsfield marketing-studio products fetch --url ...`），也可以通过上传图像创建（`higgsfield marketing-studio products create`）。
- **Webproduct** — App Store / 网页版本。获取 App Store URL 时会自动路由到此类型。
- **Hook** — 可复用的开场角度 / 广告钩子。使用 `higgsfield marketing-studio hooks list` 浏览。钩子文本会添加到用户提示词的开头；它不会替代 `--prompt`。
- **Setting** — 可复用的环境 / 场景上下文。使用 `higgsfield marketing-studio settings list` 浏览。
- **Ad reference** — 可复用的灵感视频，可以绑定到头像和/或产品。可以通过上传视频创建（`--video-input <upload_id>`），也可以通过之前生成的视频任务创建（`--job <job_id>`）。使用 `higgsfield marketing-studio ad-references list` 浏览。请参阅 `references/marketing-ad-references.md`。
- **Brand kit** — 用于记录品牌身份（名称、徽标、主视觉图像、颜色、字体、语调），以便在多次图像生成中复用。通过提供网站 URL 创建（`higgsfield marketing-studio brand-kits fetch --url https://… --wait`）。请参阅 `references/marketing-brand-kits.md`。
- **Ad format** — 用于驱动生成图像视觉结构的预设（`headline`、`bullet-points` 等）。只读，可使用 `higgsfield marketing-studio ad-formats list` 浏览。`dtc-ads generate` 必须提供此项输入。

### 发现命令

当用户询问现有内容时，使用以下完全相同的 list 命令：

```bash
higgsfield marketing-studio avatars list --json
higgsfield marketing-studio products list --json
higgsfield marketing-studio hooks list --json
higgsfield marketing-studio settings list --json
higgsfield marketing-studio ad-references list --json
higgsfield marketing-studio brand-kits list --json
higgsfield marketing-studio ad-formats list --json
```

`--hook_id` 和 `--setting_id` 仅受 `marketing_studio_video` 支持；不要将它们传递给 `marketing_studio_image`。

### UX 规则（补充）

- 每个阶段只问一个问题。不要一开始就询问产品 + 头像 + 模式。
- **两种广告方案互斥。** 用户要么提供广告参考视频（参考驱动），要么选择钩子/设置块（由模块组合而成），绝不能同时使用两者。如果用户已选择广告参考，则不要提供钩子/设置选项；如果用户选择了钩子/设置，则不要提出附加广告参考。
- **广告参考来源。** 唯一有效的输入是本地视频文件（通过 `higgsfield upload create ... --video` 上传）或之前的视频任务。如果用户提供了其他内容，请要求其提供本地文件。
- **`dtc-ads` 广告格式是必填项。** 始终要求用户从 `ad-formats list` 中选择。没有自动默认值；如果缺少 `--format-id`，CLI 和服务器都会拒绝调用。
- **`dtc-ads` 可选输入。** 当需求中需要时，建议使用头像、产品和参考媒体；只附加用户选择的内容。

### 工作流 — 快速广告视频

1. **获取产品。**
   - 已有产品 → `higgsfield marketing-studio products list --json`
   - URL → `higgsfield marketing-studio products fetch --url <url> --wait`（轮询直到导入完成）
   - 本地图片 → `higgsfield upload create <photo>...`，然后执行 `higgsfield marketing-studio products create --title "..." --image <id>...`
   记录产品 id。使用 `--hook_id` 时，强烈建议传入 `--product_ids`；钩子旨在切换到某个产品，没有产品上下文时效果不佳。
2. **需要时选择 avatar。**
   - 默认：执行 `higgsfield marketing-studio avatars list`，选择与品牌调性匹配的预设。
   - 自定义：`higgsfield marketing-studio avatars create --name "..." --image <upload_id>`。
   对于 UGC 模式，如果不需要特定的出镜者且 brief 提到了人物，可以省略 `--avatars`；后端能够合成 Soul Character。
3. **可选地选择设置项。**
   - 钩子：`higgsfield marketing-studio hooks list --json`
   - 场景：`higgsfield marketing-studio settings list --json`
   仅对 `marketing_studio_video` 传入选定的 ID，使用 `--hook_id <hook_id>` 和 `--setting_id <setting_id>`。除非用户明确希望强化相同措辞，否则不要将钩子的 prompt 复制到 `--prompt` 中。
4. **需要时选择模式。** 默认模式为 `ugc`；仅仅因为存在 `--hook_id` 并不要求指定 `--mode`。其他当前可用的 slug：`ugc_how_to`、`ugc_unboxing`、`product_showcase`、`product_review`、`tv_spot`、`wild_card`、`ugc_virtual_try_on`、`virtual_try_on`。**钩子/场景仅对 `ugc`、`ugc_how_to`、`ugc_unboxing`、`product_review`、`ugc_virtual_try_on` 有效** — 不要将 `--hook_id` / `--setting_id` 与其他模式一起传入。参见 `references/marketing-modes.md`。
5. **生成（一次完成）。**
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
   选择了设置钩子和/或场景时，添加 `--hook_id <hook_id>` 和/或 `--setting_id <setting_id>`。
   `product_ids` 和 `avatars` 是 JSON 数组；通过 `@/path/to/file.json` 传入。不要将裸 UUID 传给 `--product_ids`。
   分辨率为 `480p` 或 `720p`。宽高比可选 `auto`/`21:9`/`16:9`/`4:3`/`1:1`/`3:4`/`9:16`。这里支持 `--generate-audio true`（不同于 `seedance_2_0`）。`--wait` 会阻塞直到完成；对于较长的广告生成任务，将 `--wait-timeout 30m` 调大。
6. **交付。** URL + 一行摘要（模式、时长）。

### 点击生成广告快捷方式（URL 驱动）

当用户提供产品 URL 并希望一次性生成营销视频时：

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

后端会按 URL 去重，因此重复运行会复用现有实体，而不会重新获取。

### 工作流 — 营销图片

与上面相同，但使用 `marketing_studio_image` 模型：

```bash
higgsfield generate create marketing_studio_image \
  --prompt "..." \
  --aspect_ratio 1:1 \
  --resolution 2k \
  --wait
```

## Virality Predictor 视频评分

当用户想要将已完成的视频作为商业创意进行评估时，使用 Virality Predictor（`brain_activity`）：评估开场吸引力、病毒传播潜力、注意力、留存率，或内容/产品吸引注意力以及减少分心的效果。将“Virality Predictor”作为面向客户的功能名称；`brain_activity` 仅是 CLI/job_set_type。

```bash
higgsfield generate create brain_activity --video ./creative.mp4 --wait
```

结果是文本，而不是生成的图像/视频。报告总体评分、峰值开场时间、持续评分、最强/最弱区段，以及（如果存在）报告 URL。将其解读为用于创意测试的客观注意力代理指标：更高的 Visual/Auditory/Language/Attention 评分表示更强的刺激和注意力；更低的 Default Mode 更好，因为这表示更少的走神。

CLI 会输出一个类似 `https://<app-domain>/apps/virality-predictor?resultJobId=<job_id>` 的 Open report URL。发送该 URL 以查看可视化报告。原始工件 URL，例如 `brain_example_url`、`vertexMapBinaryUrl` 和 `vertexMapUrl`，属于实现细节；只有在用户询问原始数据或实现细节时才提及它们。

推荐的最终格式：

```text
Overall score: 44/100
Peak hook: 49% at 1s
Sustain: 89%
Strongest region: Visual Cortex
Risk: Default Mode is high, which can indicate mind-wandering.

Open report: <report_url>
```

## 错误

- `Missing required params: prompt` → 用户未提供提示词；请向其索要。
- `Missing required params: medias` on `brain_activity` / Virality Predictor → 通过 `--video <path-or-id>` 传入且仅传入一个视频。
- `Invalid values: aspect_ratio=99:99 (allowed: ...)` → 枚举值错误；从允许的值中选择。
- `Unknown params: foo` → 架构不接受该标志；检查 `higgsfield model get <jst>`。如果该错误出现在 `hook_id` 或 `setting_id` 上，则所选模型/job_set_type 不支持 Marketing Studio 设置项。
- `Session expired` → `higgsfield auth login`。

更多内容请参见 `references/troubleshooting.md`。

## 参考文档

按需加载：

- `references/model-catalog.md` — 为任务选择合适的模型
- `references/workflows.md` — `draw_to_video` 和 `reframe` 工作流生成
- `references/prompt-engineering.md` — 编写有效的提示词
- `references/media-inputs.md` — 图像/视频/音频参考流程以及 Virality Predictor 视频分析
- `references/troubleshooting.md` — 常见错误及修复方法
- `references/marketing-avatars.md` — 预设头像与自定义头像
- `references/marketing-products.md` — URL 获取与手动创建产品
- `references/marketing-setup-items.md` — 钩子/设置项的发现与使用
- `references/marketing-ad-references.md` — 广告参考视频（创建/列出/获取）
- `references/marketing-brand-kits.md` — 品牌套件（从 URL 获取、列出、获取）
- `references/marketing-dtc-ads.md` — DTC Ads Engine（`dtc-ads generate`）
- `references/marketing-modes.md` — 所有 Marketing Studio 模式