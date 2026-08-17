---
version: 0.12.0
name: higgsfield-product-photoshoot
description: |
  Generate brand-quality product images through Higgsfield product-photoshoot
  prompt enhancement on GPT Image 2 / gpt_image_2. Entry point for professional
  brand/product visuals.
  Use when: "product photo", "studio shot", "lifestyle image", "Pinterest pin",
  "hero/banner", "carousel", "ad creative", "Meta ads", "virtual try-on",
  "model wearing", "person holding product", "closeup with hands",
  "levitating/floating/splash product", "CGI/surreal product", "restyle",
  "seasonal/aesthetic variation", or any product, brand, or paid-social creative.
  Modes: product_shot, lifestyle_scene, closeup_product_with_person,
  moodboard_pin, hero_banner, social_carousel, ad_creative_pack,
  virtual_model_tryout, conceptual_product, restyle. Backend assembles the final
  prompt; never freehand it.
  NOT for: no-product text-to-image (use higgsfield-generate), branded avatar
  video (use higgsfield-generate Marketing Studio), marketplace listing cards
  (use higgsfield-marketplace-cards), Soul Character training (use
  higgsfield-soul-id).
argument-hint: "[--mode <mode>] [--count N] [prompt]"
allowed-tools: Bash
---
# 产品摄影

通过 `higgsfield product-photoshoot create` 命令生成品牌图片。CLI 会调用后端提示词增强器，其中包含特定模式的摄影词汇和结构模板，然后提交至 `gpt_image_2` 并返回图片 URL。

## 步骤 0 — 初始化

在运行任何其他命令之前：

1. 如果 `$PATH` 中没有 `higgsfield`，请安装：
   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```
2. 如果 `higgsfield account status` 失败并显示 `Session expired` / `Not authenticated`，请让用户运行 `higgsfield auth login`（交互式），并等待用户确认。

## 用户体验规则

1. 保持简洁。最终回复中仅输出图片 URL。
2. 检测用户所用语言，并使用该语言回复。模式名称和 CLI 标志保持英文。
3. 提交前最多询问 4 个简短问题。使用带标签的选项，切勿提出开放式问题。
4. 如果答案可从上下文明显得出（上传的图片、之前的对话、品牌记忆），则跳过相应问题。
5. 切勿自行编写 gpt_image_2 提示词——由后端组装。
6. 静默轮询。等待 URL 准备就绪后再交付。

## 模式

| 模式 | 适用于用户希望…… |
|---|---|
| `product_shot` | 将产品置于中性 / 影棚 / 目录风格背景中 |
| `lifestyle_scene` | 将产品置于真实环境中，包含手部、动作或氛围 |
| `closeup_product_with_person` | 包含手部 / 局部面部的紧凑构图——美妆产品使用、手持产品、演示产品 |
| `moodboard_pin` | Pinterest 原生的竖版 2:3 美学，具有情绪板风格 |
| `hero_banner` | 宽幅网站 / 电子邮件 / 营销活动页眉 |
| `social_carousel` | 用于 IG / LinkedIn / Facebook 的 3–10 张连贯轮播图 |
| `ad_creative_pack` | 用于 Meta / TikTok / Pinterest / Google Ads 的一组协调统一的静态广告变体 |
| `virtual_model_tryout` | 由 AI 渲染的模特穿戴或使用产品 |
| `conceptual_product` | 超现实 / CGI 风格 / 悬浮 / 飞溅 / 雕塑感产品图 |
| `restyle` | 转换现有图片的美学风格、氛围或季节背景 |

## 模式选择

根据意图而非表面关键词进行选择。当两种模式均适用时，优先选择更具体的模式。

- 产品 + 中性 / 干净 / 白色 / 影棚 / 目录 / Shopify → `product_shot`
- 产品 + 场景 / 使用中 / 厨房 / 户外 / 咖啡馆 / 健身房 → `lifestyle_scene`
- 手持 / 面部与产品同框 / 使用美妆产品 / 演示 → `closeup_product_with_person`
- Pinterest、图钉、竖版图钉 → `moodboard_pin`
- 主视觉、横幅、网站页眉、落地页、电子邮件页眉、宽幅格式 → `hero_banner`
- 轮播图、幻灯片帖子、多张幻灯片、可滑动 → `social_carousel`
- 广告、广告素材包、付费社交广告、Meta / TikTok / Pinterest 广告 → `ad_creative_pack`
- 模特穿戴、虚拟试穿、上身效果、时装拍摄、造型目录 → `virtual_model_tryout`
- 悬浮、漂浮、飞溅、定格运动、超现实、CGI、雕塑感 → `conceptual_product`
- 修改现有图片的美学风格、氛围、季节——不改变主体 → `restyle`

优先级裁决：
- “在厨房台面上展示我的产品的 Pinterest 图钉” → `moodboard_pin`（Pinterest 是发布平台）
- “展示我的产品使用场景的主视觉横幅” → `hero_banner`（横幅格式优先）
- “展示我的产品在不同场景中的轮播图” → `social_carousel`（多张幻灯片优先）
- “人物涂抹我的精华液的特写” → `closeup_product_with_person`（具体类型优先）

## 生成前访谈

提交前先询问 3–4 个简短问题。始终提供带标签的选项，绝不提出开放式问题。如果根据上下文可以明显得出答案，则跳过该问题。

### 类型 A — 已上传产品照片，“为我制作图片 / 拍摄产品照”

1. 需要多少张？`[1 / 3 / 5]`
2. 想要什么风格/氛围？`[Clean studio / Lifestyle / Conceptual / With a model / Other]`
3. 将用于哪里？`[Shopify / Instagram / Pinterest / Paid ads / Website hero]`
4. 是否需要匹配品牌色？（如果很明显则跳过）

### 类型 B — 已上传产品照片，并指定了使用场景

例如，“为我的产品制作广告”“制作一张 Pinterest 图钉图片”“制作一张首屏横幅”。模式已经明确。只询问缺失的信息：

1. 需要多少张？（如果是多输出模式）
2. 优惠信息 / 氛围 / 卖点是什么？
3. 有什么特别需要突出的内容吗？

### 类型 C — 只有文本，没有产品照片

1. 可以上传一张产品照片吗？（首选——保真度会高得多）
2. 如果不能，请描述产品——品类、包装、颜色、显著特征。
3. 想要什么风格？（选项与类型 A 相同）
4. 将用于哪里？

### 类型 D — 已上传现有图片，“重做 / 改变氛围 / 制作不同版本”

→ `restyle`

1. 想要什么美学风格？`[Clean girl / Cottagecore / Quiet luxury / Dark academia / Y2K / Other]`
2. 季节性场景？`[Christmas / Valentine's / Halloween / Black Friday / None]`
3. 哪些内容需要保留，哪些需要更改？（仅在不明确时询问）

### 类型 E — 模特穿戴产品（时装、配饰）

→ `virtual_model_tryout`

1. 模特原型？（根据品牌受众推荐 2–3 个）
2. 环境？`[Studio clean / Outdoor natural / Street style / Editorial / Home cozy]`
3. 构图？`[Full body / Three-quarter / Waist up / Closeup on product area]`

### 类型 F — 请求模糊，主题不明确

例如，“为我的品牌制作一些很酷的东西”。

1. 是什么产品或主题？
2. 目标？`[Sell on a marketplace / Build awareness / Run paid ads / Update website]`
3. 是否可以上传一张参考图片？

回答后 → 返回到相关的类型 A–E。

## 生成

使用单条命令。后端会组装最终提示词并提交给 `gpt_image_2`。URL 会输出到标准输出。

```bash
higgsfield product-photoshoot create \
  --mode <mode> \
  --prompt "<short user-intent description from interview answers>" \
  [--image <path-or-upload-id>]... \
  [--count <1-10>] \
  [--aspect_ratio <override>]
```

示例：

```bash
higgsfield product-photoshoot create \
  --mode lifestyle_scene \
  --prompt "bottle of cold-brew on a sunlit kitchen counter, IG feed" \
  --image bottle.jpg \
  --count 3
```

```bash
higgsfield product-photoshoot create \
  --mode moodboard_pin \
  --prompt "vertical pin for my candle brand, cottagecore mood" \
  --image candle.jpg
```

```bash
higgsfield product-photoshoot create \
  --mode restyle \
  --prompt "Christmas version, quiet-luxury aesthetic" \
  --image existing-shot.jpg
```

## 图片输入

`--image` 接受本地文件路径（自动上传）或现有的上传 UUID。需要多个参考图时，可重复使用该标志。

## 多变体

`--count 3` 会返回 3 个不同的图片 URL。后端会要求增强器在不同变体之间改变预设、光照、角度和配色——它们不会只是彼此改写后的副本。

对于 `social_carousel` 和 `ad_creative_pack`，count = 包中的幻灯片数 / 变体数。后端会自动锁定所有幻灯片的视觉系统。

## 宽高比

后端会为每种模式选择合理的默认值。仅当用户明确要求使用其他宽高比时，才使用 `--aspect_ratio` 覆盖默认值。允许的值：`1:1`、`4:5`、`5:4`、`3:4`、`4:3`、`2:3`、`3:2`、`9:16`、`16:9`。

## 分辨率

每个产品摄影任务都使用 `2k`。

## 交付结果

以简短的项目符号列表形式输出图片 URL。不要输出 JSON、ID、内部模型名称或增强后的提示词文本。如果任务失败，请简要提及并附上失败状态。

```
3 lifestyle shots ready:
- https://cdn.higgsfield.ai/.../job_abc.jpg
- https://cdn.higgsfield.ai/.../job_def.jpg
- https://cdn.higgsfield.ai/.../job_ghi.jpg
```

## 此技能不执行的操作

- 不直接编写 gpt_image_2 提示词。提示词组装由后端负责。
- 不会自动选择其他图像生成模型。始终使用 `gpt_image_2`。
- 不会取代用于品牌视频 / 虚拟形象工作流的 `higgsfield-generate` Marketing Studio。
- 对于没有产品或品牌上下文的原始文生图，不会取代 `higgsfield-generate`。

## 要避免的常见错误

- 在一条消息中提出超过 4 个访谈问题。
- 选择错误的模式（例如，用户想要 Pinterest 图钉时却选择了 `product_shot`）。
- 直接调用 `higgsfield generate create gpt_image_2 --prompt ...`，而不是 `higgsfield product-photoshoot create`——这会绕过提示词增强器，并导致输出质量明显变差。
- 将组装后的提示词粘贴给用户——他们需要的是 URL。
- 使用上表中未列出的 `--mode` 值。