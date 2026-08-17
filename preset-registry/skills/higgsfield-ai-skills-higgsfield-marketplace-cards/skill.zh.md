---
version: 0.12.0
name: higgsfield-marketplace-cards
description: |
  Generate marketplace product image cards through Higgsfield: compliant
  main image, secondary product images, and A+ style content modules. Use when
  the user asks for marketplace listing images, product detail cards,
  secondary product images, product infographics, lifestyle listing shots,
  A+ style content, marketplace image sets, or sales-ready product visuals.
  Backend owns marketplace compliance references and prompt templates; this skill
  only routes user intent to the CLI.
  NOT for generic brand product photography without marketplace/listing context
  (use higgsfield-product-photoshoot), video generation or UGC ads (use
  higgsfield-generate), or Soul Character training (use higgsfield-soul-id).
argument-hint: "[--scope main|product-images|aplus|full-set] [prompt]"
allowed-tools: Bash
---
# Marketplace 卡片

使用 `higgsfield marketplace-cards create` 创建可直接用于 Marketplace 的商品视觉素材。
CLI 会先调用后端增强器（Marketplace 规则和模板在其中保持私有），然后创建 `nano_banana_2` 任务并输出结果 URL。

## 初始化

1. 如果 `$PATH` 中没有 `higgsfield`，请使用 Bash 运行官方安装程序进行安装：`curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh`。
2. 如果 `higgsfield account status` 因身份验证错误而失败，请让用户运行 `higgsfield auth login`。

## 用户体验规则

1. 使用用户的语言回复。
2. 运行前最多只询问一个简短的确认问题。
3. 优先使用商品图片。如果用户只提供文本或 URL，仅在商品详情明确时继续。
4. 不要自行编写最终的图像生成提示词。该工作由后端增强器负责。
5. 最终回答应仅包含生成完毕的图片 URL 和简短标签。

## 范围选择

当用户要求常见素材组合时，使用 `--scope`：

| 范围 | 创建内容 |
|---|---|
| `main` | 1 张 Marketplace 主图 |
| `product-images` | 主图 + 5 张辅图 |
| `aplus` | 主图 + 7 个 A+ 模块 |
| `full-set` | 主图 + 5 张辅图 + 7 个 A+ 模块 |

仅在需要自定义子集时重复使用 `--asset`：

- `main_image`
- `infographic`
- `multi_angle`
- `detail_shot`
- `lifestyle`
- `whats_in_box`
- `aplus_hero_banner`
- `aplus_pain_points`
- `aplus_features`
- `aplus_ingredients`
- `aplus_efficacy`
- `aplus_how_to_use`
- `aplus_endorsement`

## 命令

根据用户的请求构建并运行一条 `higgsfield marketplace-cards create` 命令。

对于常见素材组合，使用 `--scope <main|product-images|aplus|full-set>`、`--prompt "<short product and listing intent>"`、可选的重复参数 `--image <path-or-upload-id>`，以及可选的上下文参数：`--product_context`、`--brand_context`、`--category`、`--visual_style`。

选择参数时参考以下示例：

- 商品图片：`higgsfield marketplace-cards create --scope product-images --prompt "sparkling peach lemonade can for marketplace listing" --image ./can.png --category "beverage"`
- 完整素材集：`higgsfield marketplace-cards create --scope full-set --prompt "premium skincare serum, clean clinical marketplace visual system" --image ./serum.jpg --brand_context "minimal white and sage palette"`
- 自定义子集：重复使用 `--asset`，例如 `--asset main_image --asset infographic --asset lifestyle`。
- 已有完成的主图任务：将 `--main-job <completed_main_job_id>` 与所需的辅图或 A+ `--asset` 值一起使用。

## 交付

输出带标签的 URL：

```text
Marketplace cards ready:
- Main image: https://...
- Infographic: https://...
- Lifestyle: https://...
```

除非用户明确要求，否则请避免输出 JSON、任务 ID、内部模型名称或增强后的提示词。