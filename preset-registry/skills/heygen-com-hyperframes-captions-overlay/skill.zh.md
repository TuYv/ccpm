---
name: captions-overlay
description: Overlay doctrine for the embedded-captions workflow — the caption MODEL (drop / rail / embed) and the rule that captions are an OVERLAY composited on top of the film, never a reserved bottom band you shift content up to avoid. Load when adding captions/subtitles to a talking-head or launch video, when deciding whether a phrase should be dropped, ride the verbatim rail, or be promoted to a scarce embedded climax, when laying out a composition that will carry captions (do NOT reserve a keep-out band), or when centering a composition on the true frame center under captions. Quotes the rail+embed model from embedded-captions and constraint #13 (captions overlay, keep-out band retired) from the product-launch-video scene agent. Applies ON TOP of embedded-captions.
---
# 字幕叠加原则

> **叠加原则——作为上游 `embedded-captions` skill 的补充。它是在其基础上额外应用的；不要指望它会被整合进上游 skill。**

这里结合了两个理念。第一是**字幕模型**——每个口语短语都属于 `drop`、
`rail` 或 `embed`，而 embed 是稀缺且需要精心铺垫的高潮，而非默认选择。第二是
**叠加法则**——字幕行作为叠加层合成在影片之上；它并非预留区域，因此绝不能为了给它“腾出空间”
而将内容上移或留下一条空白带。二者相辅相成：由于字幕以叠加层的形式呈现（逐字稿
rail 位于前景，偶尔出现的 embed 位于主体之后），画面构图可以完整保留整个画幅，并围绕真正的
垂直中心展开。

## 字幕模型——drop / rail / embed

每个口语短语都属于以下三种类型之一（原样引自 `embedded-captions`）：

|           | 含义                                             | 呈现方式                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | 填充词——嗯/呃、结巴、自我纠正       | 不显示                                                                                                                                                         |
| **rail**  | 默认类型——普通口语内容（逐字呈现） | 简洁的下三分之一字幕，位于**前景**，清晰易读。重点词可以获得行内 `emphasis` 高亮（强调色/当前词弹出效果）——但仍保留在 rail 上。 |
| **embed** | 被提升的高潮——标题式节拍              | 一个大词合成在**主体之后**（遮罩遮挡），并配有经过设计的入场和退场效果                                                                        |

**rail 承载大部分文本；embed 是稀缺且需要精心铺垫的高潮**——每个节拍 ≤1 个，
绝不能有两个相邻或同时可见，彼此至少间隔一个节拍。短片段通常使用一个 embed；
长篇讲解则大约每个章节使用一个。将每个词都做成 embed 是常见错误。

这是 **Standard** 模式的形态（rail = 逐字呈现的下三分之一字幕；embed = 合成在
主体之后的高潮内容）。**Cinematic** 模式会移除 rail，并让所有内容都采用
embed 风格——仅在明确要求纯电影化效果时使用，切勿用于必须确保文字可读的讲解 / 旁白内容。

### rail 优先，embed 稀缺（起支撑作用的规则）

引自 `embedded-captions` 中不可妥协的规则：

- **对口播 / 讲解内容，rail 优先。** 不要把整份转录文本都做成 embed——大部分
  文本应使用 rail；仅将高潮做成 embed。将所有内容都做成 embed 是最常见的错误。
- **embed 必须稀缺且保持间隔。** 每个句子/节拍 ≤1 个 embed，绝不能有两个相邻或
  同时可见，彼此至少间隔一个节拍，最多只能有一个 `apex`。高潮 = 每个节拍的峰值，**而不是**“整段
  视频唯一的终极爆点”。

## 叠加层法则——字幕不是预留区域

在生成的发布视频构图中，启用字幕后，最终合成会将一条**小巧、极简、逐词显示的字幕行**作为叠加层置于整部影片之上（单行文本，底部居中，大致位于画布高度最下方约 5-8% 的范围内）。它是叠加层，而不是预留区域（逐字引自 product-launch-video 场景智能体的约束 #13）：

- **让构图中心对准真正的垂直中心——y = H / 2**（横向画布为 540，纵向画布为 960）。不要为了给字幕“腾出空间”而将内容上移；将构图中心放在 0.42 × H 并在下方留出空白带才是 bug，而不是修复方案。
- 内容可以延伸到画布底部。欢迎使用铺满画面的主体、字幕轨和背景。
- **一条温和的礼让规则：**避免将_关键的小号可读文本_（URL 行、法律声明行、次级字幕）恰好放在底部中央约 80px、字幕行所在的区域内——叠加层会与其产生视觉冲突。字幕下方可以放置大型图像 / 卡片 / 氛围内容；字幕样式本就是为叠加在内容之上仍保持可读而设计的。
- 不存在机器强制的避让门禁（旧的 `captions.mjs keepout` 检查已停用）。最终快照 QA 会以视觉方式判断字幕叠加在内容之上时的可读性。

**禁用字幕时：**定位自由度完全相同——只是该叠加层不存在。

## 为什么这两条规则属于同一套原则

该模型规定，字幕轨位于**前景**，而嵌入词是极少数被合成到**主体后方**的词——二者都是添加到原样交付的镜头之上的图层。叠加层法则规定，字幕行是合成在整部影片**之上**的图层，而不是从布局中划出的区域。因此，无论在字幕流水线还是发布视频流水线中，字幕都是你添加的叠加层，而不是你预留的区域：

- 保留完整画面；以真正的中心为基准进行居中；让内容延伸至边缘。
- 让字幕轨（或小型叠加字幕行）承载原文措辞。
- 仅在真正的高潮点将某个词提升为嵌入词——数量要少、彼此要有间隔，绝不同时出现两个。
- 不预留任何区域；通过视觉方式判断字幕叠加在内容之上时的可读性，而不是依赖避让门禁。