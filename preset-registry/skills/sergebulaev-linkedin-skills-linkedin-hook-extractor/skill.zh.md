---
name: linkedin-hook-extractor
description: Reverse-engineer the hook formula from a viral LinkedIn post URL. Returns which of the 16 canonical 2026 formulas it uses (anaphora, R.I.P., year-pivot, time-anchor, curiosity-gap, contrarian, comment-gate, emotional cold-open, named-gratitude, and 7 more), why it worked, and a blank template. Use to learn from a competitor's post, not to write your own (use linkedin-post-writer).
---
# LinkedIn Hook Extractor

粘贴一条爆款 LinkedIn 帖子的 URL，即可获得：它使用的是哪种钩子公式、确切的结构、其有效的原因，以及一个映射到你主题的空白模板。

## 何时使用

- 用户发现一条想研究的热门帖子
- 用户想复刻某位创作者的模式
- 在使用 `linkedin-post-writer` 之前，先以经过验证的结构为草稿打底

## 输入

一个 LinkedIn 帖子 URL（任意类型：activity、share、ugcPost）。

## 输出

- **识别出的公式**（来自 `../../references/hook-formulas.md` 的 F1-F16）及置信度分数
- **结构拆解：**
  - 钩子行（前 210 个字符）
  - 主体架构（分节 + 各节作用）
  - 收尾模式
  - 触发互动的手法（数字、具名实体、脆弱点）
- 从心理学角度解释**它为什么有效**
- **空白模板**，填有与原文对应的槽位标记，随时可注入用户自己的语气
- **注意事项：**原帖中任何会导致通不过 2026 年审计的内容（长破折号、AI 词汇、过时的手法）

## 步骤

1. **解析 URL。** `lib.url_parser.parse_linkedin_url` → `post_urn`。
2. **抓取帖子正文。**如果设置了 `APIFY_TOKEN`，调用 `lib.ApifyClient.fetch_post(url)`。否则请用户直接粘贴文本。
3. **分类。**使用以下特征与 16 种公式进行匹配：
   - 前 2 行：是否首语重复？疑问句？自白式？数字开头？
   - 主体：编号列表？带日期的实据？清单式？拆解式？
   - 收尾：镜像式提问？身份重构？承诺？
   - F11-F16 线索：无铺垫、直入情感场景（F11 Emotional Cold-Open）；"I don't know who needs to hear this" 式安抚（F12 Permission Slip）；以正面反转收场的假坏消息（F13 Bait-and-Switch）；点名致谢的人物罗列（F14 Named Gratitude）；"{jargon} explained to kids" 式术语表（F15 Explain-to-Kids）；"outside I'm called X, at home none of it survives"（F16 Status-Strip）。
4. **评估置信度。**若有多个公式匹配，返回前 2 个及其匹配度分数。
5. **提取结构。**抽取每个逻辑段落，并按其在公式中的角色标注。
6. **生成空白模板。**把具体内容替换为与用户主题相匹配的 `{slot}` 标记。
7. **审计原文。**标记原文中的任何 AI 痕迹，以免用户照搬。

## 示例

完整示例见 `references/examples.md`。

## 公式参考

16 种规范公式及完整骨架见 `../../references/hook-formulas.md`。

## 文件

- `SKILL.md` — 本文件
- `references/classification-rules.md` — 特征提取 + 打分启发式规则

## 相关技能

- `linkedin-post-writer` — 使用提取到的模板起草你自己的帖子
- `linkedin-humanizer --mode audit` — 发布前审计你的草稿
