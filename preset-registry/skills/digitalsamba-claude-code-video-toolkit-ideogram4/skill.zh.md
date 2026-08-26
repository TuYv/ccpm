---
name: ideogram4
description: Prompting patterns for Ideogram 4 text-to-image — best-in-class in-image text rendering and exact color/layout control via structured JSON captions. Use when generating images that need legible on-image text (title cards, thumbnails, logos, signage, CTAs), precise brand colors, or controlled spatial layout. Triggers include title slide image, thumbnail with text, on-image text, legible text in image, brand color palette image, bounding-box layout, Ideogram.
---
# Ideogram 4 Skill

使用 **Ideogram 4**（9.3B，开放权重，于 2026 年 6 月发布）进行文本到图像生成。它的
超能力是**业界领先的图像内文字渲染能力**——在渲染清晰可读的招牌、徽标、说明文字和多行文本方面，
其表现优于大得多的模型（FLUX.2 dev 32B、Qwen-Image 20B、Hunyuan 80B）——此外还支持**精确的
颜色调色板和边界框控制**。

这一优势被**锁定在结构化 JSON caption 格式之后**。使用纯文本提示词只能获得 FLUX 级别的结果，
也就完全失去了使用该模型的意义。本 skill 教 Claude 充当“魔法提示词”扩展器——将用户的随意请求
转换为 Ideogram 4 训练所使用的 JSON caption。

> **后端：**该工具包使用 Ideogram 的**托管 v4 API**（而非自托管权重）。API
> 接受结构化的 `json_prompt`，因此本 skill 教授的所有内容都可以直接应用——Claude
> 构建 caption，工具将其作为 `json_prompt` 发送。付费 API 方案包含**商业许可证**，而可自行托管的
> 权重不包含该许可（仅限非商业用途）——这就是我们使用 API 的原因。
> 成本约为每张图 0.03 美元（turbo）至 0.09 美元（quality）。

## 何时使用此 Skill

当图像需要以下内容时，应优先选择 Ideogram 4（而不是 FLUX.2）：
- **图像中清晰可读的文字**——标题卡、缩略图、下三分之一字幕背景、招牌、徽标、
  引语卡、内置标题的 CTA
- **精确的品牌颜色**——基于十六进制颜色调色板的条件控制，可针对每个元素设置
- **受控布局**——使用边界框将文字/对象放置在特定区域
- 图像中的**多语言文字**

以下情况请改用 **FLUX.2**：图像没有关键文字、需要带商业许可的输出，
或者只是想要快速生成氛围背景。FLUX 接受自然语言纯文本提示词；Ideogram
需要 JSON。参见 `tools/flux2.py`。

## 需要做对的一件事

**始终输出结构化 JSON caption，而不是普通句子。**该模型的训练数据
*全部都是*明确命名每个元素的 JSON caption。Claude 比 Ideogram 的免费托管魔法提示词更擅长扩展，
（其官方文档指出，随产品提供的魔法提示词“并非生产环境中使用的同一版本”），因此应使用本 skill
自行构建 caption，而不是直接传入原始文本。

最小有效 caption：

```json
{"high_level_description":"A sailboat at sunset on calm water.","style_description":{"aesthetics":"serene, warm, golden hour","lighting":"golden hour backlighting","photo":"wide angle, f/8","medium":"photograph","color_palette":["#FF6B35","#F7C59F","#004E89"]},"compositional_deconstruction":{"background":"Calm ocean at low horizon with orange-pink sky.","elements":[{"type":"obj","desc":"White triangular sail silhouetted against the setting sun."}]}}
```

完整 schema、严格的键排序规则以及 bbox 坐标系详见 **`prompting.md`**。
标题卡、缩略图和引语卡的完整示例详见 **`examples.md`**。

## 快速参考 — `tools/ideogram4.py`

> 对 Ideogram 托管 v4 API 的轻量封装。需要在 `.env` 中设置 `IDEOGRAM_API_KEY`
> （密钥来自 developer.ideogram.ai）。`--json` 会将 caption 作为 API 的 `json_prompt`
> 字段发送（不使用服务端魔法提示词——Claude 负责扩展）；`--prompt` 会发送 `text_prompt`。

```bash
# Hand-authored JSON caption (the recommended path for text/layout) — Claude writes caption.json
uv run tools/ideogram4.py --json caption.json --output title.png

# Caption from stdin (Claude can pipe it directly)
cat caption.json | uv run tools/ideogram4.py --json - --output title.png

# Plain prompt — Ideogram's server-side magic prompt expands it (weaker; prefer --json)
uv run tools/ideogram4.py --prompt "Title card: 'AI ENGINEERING REVIEW' bold white on dark" --output title.png

# Inject brand hex colors into the caption's palette (JSON mode)
uv run tools/ideogram4.py --json caption.json --brand digital-samba --output cta.png

# Quality tier + resolution
uv run tools/ideogram4.py --json caption.json --speed QUALITY --resolution 2048x2048 --output slide.png
```

## 关键文件

- `prompting.md` — 完整的 JSON schema、严格的键顺序、bbox 坐标系统、调色板规则
- `examples.md` — 标题卡、缩略图、引语卡、品牌 CTA 的完整示例

## 视频制作适用场景

Ideogram 4 在工具包中的定位是生成**内嵌文本的幻灯片和缩略图**，这是 FLUX 和
LTX-2 无法胜任的场景（两者生成的文本都会乱码）。适合的搭配包括：

| 使用场景 | Ideogram 4 的优势 |
|----------|----------------|
| **带标题文本**的标题卡 / CTA 背景 | 一次生成即可获得清晰文本 + 精确的品牌十六进制颜色 |
| YouTube/社交媒体**带醒目短语的缩略图** | 生成醒目易读的大字是它最擅长的能力 |
| 引语卡 / 数据卡 | 支持多行文本 + 通过 bboxes 控制布局 |
| 产品演示场景中的标牌/徽标 | 其他模型无法生成的图像内文本 |

然后将静帧输入 Remotion（`<OffthreadVideo>`/`Img`），或使用 `tools/ltx2.py --input` 为其添加动画。