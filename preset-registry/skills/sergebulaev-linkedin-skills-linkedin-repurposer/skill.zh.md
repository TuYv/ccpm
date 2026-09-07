---
name: linkedin-repurposer
description: 'Repurpose existing content into a native LinkedIn post. Take a tweet, thread, YouTube video, blog, or newsletter and rebuild it for LinkedIn: re-hook before the fold, expand to the 900 to 1300 char sweet spot, add whitespace and a CTA, move links to the first comment, run the humanizer, publish via Publora on approval. Not for writing from scratch (use linkedin-post-writer), not for auditing a draft (use linkedin-humanizer --mode audit).'
---
# LinkedIn Repurposer

把你已经创作过的内容变成一篇读起来就像专为 LinkedIn 而写的帖子。二次利用不是复制粘贴。一条在 X 上爆火的推文，直接粘贴到 LinkedIn 上就会扑街：太短、没有留白、节奏不对，正文里还带着一个会拖垮触达的链接。

这个技能做的是转换，而不是凭空生成。它会读取你的源内容，保留其中的想法，并针对 LinkedIn 2026 年的算法重建表达方式。

## 何时使用

- “把这条推文 / 推文串转成 LinkedIn 帖子”
- “把我的 YouTube 视频 / 博客 / 订阅通讯改写成 LinkedIn 内容”
- “这个在 Threads 上效果不错，帮我适配到 LinkedIn”
- “我有一个别的格式的粗略想法，帮我做成这里的原生内容”

不适用于从零起草（使用 `linkedin-post-writer`），也不适用于审阅已完成的 LinkedIn 草稿（使用 `linkedin-humanizer --mode audit`）。

## 工作原理

**先处理声音画像（适用于所有草稿）。** 如果 `../../references/voice-profile.md` 中为 `filled: yes`，则加载它，并在全文中匹配用户的声音指纹、硬性规则以及 CTA/链接风格。如果尚未填写，提一次 `linkedin-humanizer --mode profile` 可以通过几篇帖子学习用户的声音，然后按通用声音规则继续。

1. **获取源内容。** 任何格式都可以：一条推文或推文串、视频或脚本、博客段落、配文、文字稿、要点列表、一个可供阅读的链接。如果对方没有给出源内容和目标（评论 / 转发 / 点赞 / 收藏），先询问。
2. **提取主干。** 剥掉源平台的外壳，抽出那一个值得保留的论点、故事或数字。二次利用之所以失败，往往是因为留住了字句而丢掉了要点。
3. **为 LinkedIn 重新打造钩子。** 钩子必须落在前 210 个字符内，在“...see more”折叠线之前。源内容的钩子很少能原样存活；用 `../../references/hook-formulas.md` 中 16 个公式里的一个写一个新的首行，选哪个由目标决定。
4. **扩展到 LinkedIn 的长度。** X 靠压缩，LinkedIn 靠呼吸。把主干扩展到 900 到 1300 字符的黄金区间：短段落、观点之间双换行、每个节拍一个具体细节。一条信息密集的推文要变成 4 到 6 个短段落，而不是一堵文字墙。
5. **加上 LinkedIn 的形态。** 观点之间留白、一个体现真实利害或袒露脆弱的瞬间（纯观点输出型帖子在 2026 年不管用），以及一个明确的收尾提问或 CTA。
6. **修正链接与残留痕迹。** 把所有外部链接移到第一条评论里（正文内嵌链接会压制触达）。剥掉跨平台残留：话题标签墙、“link in bio”、“smash subscribe”、X 的 @ 句柄、“as I tweeted” 这类清嗓式开场白。结尾放 0 到 2 个话题标签。
7. **做一遍 humanizer 清洗。** 执行清理：按密度清除 2026 年的 AI 高频词汇、超出上限的破折号（大约每 100 词 1 个）、堆叠的三段式排比、套路化开头与揭晓式过渡。保留源内容中用户的真实数字与具名实体。
8. **审批卡片。** 展示：源 -> LinkedIn 的映射（什么变成了什么）、使用的公式、字符数、建议的发布时间窗（当地时间周二/周三/周四上午 7:30 至 9:00），以及“链接放第一条评论”的提示。
9. **批准之后。** 通过 `lib.publish(kind="post", draft_text=<approved>, target_url="https://www.linkedin.com/post/new/", platforms=[{"platform":"linkedin","platformId":<id>}], scheduled_time=<iso_or_None>)` 发布。包装器会处理 Publora / manual / diy 路由。

## 原生适配规则（源 -> LinkedIn）

- **推文 -> LinkedIn：** 扩展，而不是直接粘贴。一条推文只相当于一个钩子；在它下面用留白把论证铺开。
- **X 推文串 -> LinkedIn：** 展开为一篇行文连贯的帖子，而不是编号列表。把最精彩的一句留作钩子。
- **YouTube 视频 / 脚本 -> LinkedIn：** 先亮出成果，再讲你如何抵达那里的故事。把视频链接放在第一条评论里。
- **博客 / 订阅通讯 -> LinkedIn：** 选出最值得引用的那一个论点作为钩子，再配上能证明它的那一个故事。不要总结整篇文章。
- **Instagram / TikTok 配文 -> LinkedIn：** 去掉密集的 emoji 和话题标签块；补上 LinkedIn 所看重的职业利害感。

## 硬性规则

全局声音规则：见根目录 `SKILL.md` 中的 §Voice rules。此外还有本技能专属的规则：

- 保持源内容的**论点与事实**完整。二次利用改变的是表达方式，绝不改变含义或数字。
- 钩子必须落在前 210 个字符内，折叠线之前。
- 绝不把源内容粘贴过来再删减。要从主干重建钩子、长度和节奏。
- 正文里不放外部链接。主动提出把它放到第一条评论中。
- 至少包含一个真实利害或袒露脆弱的瞬间。保留源内容的真实数字和具名实体。
- 不要把用户的产品当自我宣传来硬塞。最多自然提及一次。

## 反模式（技能会拒绝处理）

- 对源内容略作修改就复制粘贴（那不是二次利用）。
- 保留源平台的残留痕迹（“link in bio”、“smash subscribe”、话题标签墙）。
- 产出一篇推文长度、既无留白也无扩展的帖子。
- 全大写的首行（“THIS CHANGED EVERYTHING”）。
- 破折号超过上限（大约每 100 词多于 1 个），或用破折号顶替句号。
- 没有佐证的三段式排比列表。
- “leverage”、“fundamentally”、“game-changer”、“deep dive”。
- 正文中的外部链接。
- 元层面的清嗓式开场白（“I originally posted this on...”）。

## 资源

- `../../references/hook-formulas.md` - 用于重新打造钩子的 16 个公式骨架
- `../../references/algorithm-heuristics.md` - 2026 年发布规则（时间、格式、长度）

## 相关技能

- `linkedin-post-writer` - 从零写一篇全新帖子
- `linkedin-humanizer` - 清除 AI 痕迹，另有 `--mode audit` 用于审阅结果
- `linkedin-hook-extractor` - 从你欣赏的帖子中逆向拆解出钩子
