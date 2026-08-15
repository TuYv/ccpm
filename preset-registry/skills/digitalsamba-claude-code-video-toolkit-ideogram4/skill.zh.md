---
name: ideogram4
description: Prompting patterns for Ideogram 4 text-to-image — best-in-class in-image text rendering and exact color/layout control via structured JSON captions. Use when generating images that need legible on-image text (title cards, thumbnails, logos, signage, CTAs), precise brand colors, or controlled spatial layout. Triggers include title slide image, thumbnail with text, on-image text, legible text in image, brand color palette image, bounding-box layout, Ideogram.
---
# Ideogram 4 技能

使用 **Ideogram 4**（93 亿参数、开放权重，于 2026 年 6 月发布）进行文生图。它的
超能力是**业内领先的图内文本渲染能力**——在渲染清晰可读的标牌、徽标、说明文字
和多行文本方面，它胜过规模大得多的模型（FLUX.2 dev 32B、Qwen-Image 20B、Hunyuan 80B）——此外还支持**精确的调色板和边界框控制**。

这一优势**只有通过结构化 JSON 描述格式才能发挥出来**。使用纯文本提示词只能获得
FLUX 水平的结果，完全失去了使用这个模型的意义。本技能教 Claude 充当“魔法提示词”
扩展器——将用户的随意请求转换为 Ideogram 4 训练时所使用的 JSON 描述。

> **后端：**该工具包使用 Ideogram 的**托管式 v4 API**（而非自行托管的权重）。该 API
> 接受结构化的 `json_prompt`，因此本技能教授的所有内容都可以直接应用——Claude
> 构建描述，工具将其作为 `json_prompt` 提交。付费 API 套餐包含**商业
> 许可证**，而可自行托管的权重（仅限非商业用途）并不包含——这就是我们使用该 API 的原因。
> 成本约为每张图 0.03 美元（turbo）至 0.09 美元（quality）。

## 何时使用本技能

当图像需要满足以下要求时，应优先选择 Ideogram 4（而非 FLUX.2）：
- **清晰可读的图内文本**——标题卡、缩略图、下三分之一字幕背景、标牌、徽标、
  引语卡，以及直接嵌入标题的 CTA
- **精确的品牌颜色**——按元素进行十六进制调色板条件控制
- **可控的布局**——使用边界框将文本或对象放置在特定区域
- 图像中的**多语言文本**

以下情况请改用 **FLUX.2**：图像中没有关键文本、你需要具有商业许可的输出，
或者只想快速生成具有氛围感的背景。FLUX 使用纯自然语言提示词；Ideogram
需要 JSON。请参阅 `tools/flux2.py`。

## 最需要做对的一件事

**始终输出结构化 JSON 描述，而不是纯文本句子。**该模型*完全*
基于明确命名每个元素的 JSON 描述进行训练。Claude 是比 Ideogram 免费托管的魔法提示词功能
更出色的扩展器（其官方文档也注明，随产品提供的版本“与生产环境中使用的版本并不相同”），因此请使用本技能自行构建描述，而不要直接传入原始文本。

最小有效描述：

```json
{"high_level_description":"A sailboat at sunset on calm water.","style_description":{"aesthetics":"serene, warm, golden hour","lighting":"golden hour backlighting","photo":"wide angle, f/8","medium":"photograph","color_palette":["#FF6B35","#F7C59F","#004E89"]},"compositional_deconstruction":{"background":"Calm ocean at low horizon with orange-pink sky.","elements":[{"type":"obj","desc":"White triangular sail silhouetted against the setting sun."}]}}
```

完整的 schema、严格的键顺序规则以及 bbox 坐标系详见 **`prompting.md`**。
标题卡、缩略图和引语卡的完整示例详见 **`examples.md`**。

## 快速参考——`tools/ideogram4.py`

> Ideogram 托管式 v4 API 的轻量封装。需要在 `.env` 中设置 `IDEOGRAM_API_KEY`
>（密钥来自 developer.ideogram.ai）。`--json` 会将描述作为 API 的 `json_prompt`
> 字段提交（不使用服务端魔法提示词——由 Claude 负责扩展）；`--prompt` 则提交 `text_prompt`。

```bash
# Hand-authored JSON caption (the recommended path for text/layout) — Claude writes caption.json
python3 tools/ideogram4.py --json caption.json --output title.png

# Caption from stdin (Claude can pipe it directly)
cat caption.json | python3 tools/ideogram4.py --json - --output title.png

# Plain prompt — Ideogram's server-side magic prompt expands it (weaker; prefer --json)
python3 tools/ideogram4.py --prompt "Title card: 'AI ENGINEERING REVIEW' bold white on dark" --output title.png

# Inject brand hex colors into the caption's palette (JSON mode)
python3 tools/ideogram4.py --json caption.json --brand digital-samba --output cta.png

# Quality tier + resolution
python3 tools/ideogram4.py --json caption.json --speed QUALITY --resolution 2048x2048 --output slide.png
```

## 关键文件

- `prompting.md` — 完整的 JSON schema、严格的键顺序、bbox 坐标系、调色板规则
- `examples.md` — 标题卡、缩略图、引语卡和品牌 CTA 的完整示例 caption

## 在视频制作中的定位

Ideogram 4 在工具包中的专长是制作**带有内嵌文字的幻灯片和缩略图**，这是 FLUX 和
LTX-2 无法胜任的（两者都会渲染出乱码文字）。适合的典型场景：

| 使用场景 | 为什么选择 Ideogram 4 |
|----------|----------------|
| **带有标题文字的**标题卡／CTA 背景 | 一次生成即可获得清晰可读的文字和精确的品牌十六进制颜色 |
| 带有醒目短语的 YouTube／社交媒体**缩略图** | 大号、清晰可读的文字是其最大优势 |
| 引语卡／统计数据卡 | 通过 bbox 控制多行文字和布局 |
| 产品演示场景中的标牌／徽标 | 能够渲染其他模型无法生成的图中文字 |

然后将静态图像传入 Remotion（`<OffthreadVideo>`/`Img`），或使用 `tools/ltx2.py --input` 为其制作动画。