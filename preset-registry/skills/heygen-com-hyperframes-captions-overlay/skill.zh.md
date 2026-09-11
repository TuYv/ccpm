---
name: captions-overlay
description: Overlay doctrine for the embedded-captions workflow — the caption MODEL (drop / rail / embed) and the rule that captions are an OVERLAY composited on top of the film, never a reserved bottom band you shift content up to avoid. Load when adding captions/subtitles to a talking-head or launch video, when deciding whether a phrase should be dropped, ride the verbatim rail, or be promoted to a scarce embedded climax, when laying out a composition that will carry captions (do NOT reserve a keep-out band), or when centering a composition on the true frame center under captions. Quotes the rail+embed model from embedded-captions and constraint #13 (captions overlay, keep-out band retired) from the product-launch-video scene agent. Applies ON TOP of embedded-captions.
metadata:
  internal: true
---
# 字幕叠加原则

> **叠加原则——补充上游的 `embedded-captions` skill。适用于其之上；不要认为它已被合并进上游 skill。**

这里结合了两个理念。首先是**字幕模型**——每个说出的短语都属于 `drop`、`rail` 或 `embed`，而 `embed` 是稀缺且需要赢得的高潮，不是默认选项。其次是**叠加法则**——字幕行作为叠加层合成在影片之上；它**不是**预留区域，因此绝不能为了“给字幕腾出空间”而将内容上移，或留下死区。两者相互强化：由于字幕以叠加层的形式呈现（逐字显示的 `rail` 位于前景，偶尔出现的 `embed` 位于主体背后），构图能够保持完整画幅，并以真正的垂直中心为核心。

## 字幕模型——drop / rail / embed

每个说出的短语都属于以下三种情况之一（与 `embedded-captions` 中的定义完全一致）：

|           | 含义                                             | 呈现方式                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | 填充语——um/uh、结巴、自我纠正       | 不显示                                                                                                                                                         |
| **rail**  | 默认情况——普通口语内容（逐字呈现） | 清晰的下三分之一字幕，位于**前景**，易于阅读。重点词可以获得行内 `emphasis` 高亮（强调色 / 活跃词弹出效果）——但它仍位于 `rail` 上。 |
| **embed** | 被提升的高潮——标题式重点节拍           | 一个大词合成在主体**背后**（带遮罩遮挡），配合精心设计的入场与退场效果                                                                        |

**`rail` 承载大部分文本；`embed` 是稀缺且需要赢得的高潮**——每个节拍 ≤1 个，绝不能有两个相邻或同时可见的 `embed`，间隔至少 ≥ 一个节拍。短片通常使用一个 `embed`；较长的讲解视频则每个段落大约使用一个。把每个词都嵌入是最常见的错误。

这是 **Standard** 模式的形态（`rail` = 逐字呈现的下三分之一字幕；`embed` = 合成在主体背后的高潮）。**Cinematic** 模式会移除 `rail`，让所有内容都采用 `embed` 风格——仅用于纯电影化需求，绝不能用于讲解 / 配音内容，因为此类内容必须保证文字可读。

### 以 `rail` 为先，`embed` 稀缺（承载性规则）

以下内容引自 `embedded-captions` 的不可妥协原则：

- **面对出镜讲解 / 讲解视频时，优先使用 `rail`。**不要嵌入整篇逐字稿——大部分文本应放在 `rail` 上；只将高潮部分嵌入。把所有内容都嵌入是默认错误。
- **`embed` 必须稀缺且分散。**每个句子 / 节拍 ≤1 个 `embed`，绝不能有两个相邻或同时可见的 `embed`，间隔至少 ≥ 一个节拍，最多只能有一个 `apex`。高潮 = 每个节拍的峰值，**而不是**“整段视频唯一的最终回报”。

## 覆盖层法则 —— 字幕不是预留区域

在生成的发布构图中，启用字幕时，finalize composites 会将一条
**小巧、简洁的逐词字幕行**作为覆盖层叠加到整部影片**之上**
（单行文字，底部居中，大约占画布高度底部的 5-8%）。它是覆盖层，而不是预留区域（产品发布视频场景代理约束 #13 的原文）：

- 将构图置于**真正的垂直中心**——y = H / 2（横屏为 540，
  竖屏为 960）。不要为了“腾出字幕空间”而将内容上移；将构图
  放在 0.42 × H 并留下底部空带才是 bug，而不是修复方案。
- 内容可以延伸到画布底部。全出血主体、轨道和背景都可以使用。
- **唯一一条宽松的礼貌规则：**避免将_关键的小字号可读文字_（URL 行、
  法律声明行、子字幕）正好放在字幕行所在的底部约 80px 中央区域——覆盖层
  会与其争夺注意力。字幕皮肤经过设计，可以在内容之上保持可读，因此大型图像、
  卡片和环境内容位于字幕下方没有问题。
- 没有机器 keep-out gate（旧的 `captions.mjs keepout` 检查已废弃）。
  Finalize snapshot QA 通过视觉方式判断字幕叠加在内容之上的可读性。

## 为什么这两条规则属于同一套原则

模型表示，轨道位于**前景**，而 embed 是一个罕见的词，会被合成到
**主体之后**——二者都是添加到原样交付的素材上的图层。覆盖层法则则表示，
字幕行是合成到整部影片**之上**的图层，而不是从布局中划出的区域。因此，在字幕
流程和发布视频流程中，字幕都是要添加的覆盖层，而不是要预留的区域：

- 保留完整画面；以真正的中心为基准；让内容延伸到边缘。
- 让轨道（或小型覆盖层字幕行）承载逐字内容。
- 只有在真正的峰值时才将某个词提升为 embed——稀少、分散，绝不同时出现两个。
- 不预留任何区域；通过视觉方式判断字幕叠加在内容之上的可读性，而不是使用 keep-out gate。