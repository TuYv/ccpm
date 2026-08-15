---
name: android-aso
description: When the user wants to optimize their Google Play Store listing — title, short description, full description, keywords, ratings, or Play Store-specific features. Use when the user mentions "Google Play", "Android", "Play Store", "Play Console", "short description", "full description indexed", "Google Play ASO", or wants Google Play-specific keyword, creative, or ratings strategy. For iOS App Store optimization, see aso-audit and metadata-optimization.
metadata:
  version: 1.0.0
---
# Android ASO（Google Play）

你是一名 Google Play ASO 专家。Google Play 的算法与 iOS 有根本区别——完整描述会被索引，没有隐藏的关键词字段，并且评分是持续累积的（不会随版本重置）。

## 与 iOS 的主要区别

| 因素 | Google Play | Apple App Store |
|--------|------------|----------------|
| **关键词索引** | 标题 + 简短描述 + 完整描述（均会被索引） | 仅标题 + 副标题 + 关键词字段 |
| **隐藏的关键词字段** | ✗ 无 | ✓ 100 字符字段 |
| **描述是否被索引** | ✓ 完整的 4000 个字符 | ✗ 不会被索引 |
| **评分** | 持续累积——永不重置 | 每个版本可重置（可以申请重置） |
| **A/B 测试** | Play 商店实验（原生功能） | 产品页面优化 |
| **屏幕截图** | 每种语言 2–8 张 | 每种语言最多 10 张 |
| **置顶大图** | 必需（1024×500px） | 不适用 |
| **算法信号** | 安装量、互动度、评分、关键词 | 关键词匹配度、评分、转化率 |
| **评论索引** | 评论和回复均会被索引 | 不会被索引 |

## 字符限制

| 字段 | 限制 | 是否被索引 | 权重 |
|-------|-------|---------|--------|
| **标题** | 30 个字符 | ✓ | 最高 |
| **简短描述** | 80 个字符 | ✓ | 高 |
| **完整描述** | 4000 个字符 | ✓ | 中 |
| **开发者名称** | — | ✓ | 低 |

## 初步评估

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**你是否拥有 Play Console 访问权限？**（用于获取实际关键词数据）
3. 询问：**你当前的标题和简短描述是什么？**
4. 询问：**对你而言最重要的 3 个关键词是什么？**
5. 询问：**你的应用属于哪个类别？**

## 元数据优化

### 标题（30 个字符）

- 将品牌名称或主要关键词放在开头——选择两者中更具优势的一个
- 自然地加入 1 个高搜索量关键词：`Brand – Keyword Descriptor`
- ✅ "Headspace: Meditation & Sleep" | ❌ "Best Meditation App for You"

### 简短描述（80 个字符）

- 这是用户在搜索结果中最先看到的内容
- 用一句有吸引力的话自然地融入 2–3 个最重要的关键词
- ✅ "Guided meditation, sleep sounds & breathing exercises for stress relief"
- 不要重复标题中的主要关键词

### 完整描述（4000 个字符——会被索引）

**兼顾算法与转化的结构：**

```
[Hook paragraph — 2–3 sentences]
Lead with the core value proposition. Include primary keyword in first 167 chars
(shown above the fold).

[Feature bullets — 5–8 items]
• [Feature]: [Benefit]
Use keywords naturally. Vary phrasing — don't repeat exact phrases.

[Social proof]
"Trusted by X million users" / awards / press mentions

[Call to action]
Download [App Name] today — [value prop].

[Keywords section — natural, not stuffed]
A paragraph using keyword variants, synonyms, and long-tail terms.
```

**关键词密度规则：**目标关键词应在完整描述中出现 3–5 次。结合使用完全匹配形式和变体。切勿堆砌关键词。

### 本地化

Google Play 会按语言分别索引描述。每个语言区域都是全新的关键词机会——应进行翻译和本地化，而不是仅使用自动翻译。

## Play 商店关键词研究

使用 Appeeky 关键词工具，然后针对 Play 进行调整：

```bash
GET /v1/keywords/metrics?keywords=meditation,mindfulness,sleep sounds&country=us
GET /v1/keywords/suggestions?term=meditation&country=us
```

**Play 特有的注意事项：**
- 长尾短语效果良好（完整描述会被索引）
- 语义相似性很重要——Google 的算法能够理解同义词
- 用户评论和问答也会被索引——评论中的常用词可以作为关键词信号

## 宣传图片（1024×500px）

Play 商店要求必须提供。当没有视频时，它会显示在商品详情页顶部。

- 在一张图片中展示核心使用场景
- 确保文字清晰可辨——不要使用过小的文案
- 与截图保持品牌风格一致
- 即使没有文字也能发挥作用（文字在某些界面上可能会被截断）

## 评分策略

与 iOS 不同，Play 评分**永远不会重置**——用户给出的每一条评分都会计入统计。

**要提高评分：**
1. 回复每一条 1–3 星评论（可通过算法提升评分）
2. 在回复中邀请用户重新评分——用户可以更新自己的评论
3. 使用 `review-management` 技能获取回复模板
4. 修复低评分中提到的问题并回复：“已在 X.X 版本中修复”

**评分提示时机**（另请参阅 `rating-prompt-strategy` 技能）：
- 在用户明确获得成功体验后提示，而不是在冷启动时提示
- 使用 Play 应用内评价 API：`ReviewManager.requestReviewFlow()`

## Play 商店实验（A/B 测试）

原生支持对以下内容进行 A/B 测试：
- 图标
- 宣传图片
- 截图（最多 3 个变体）
- 简短说明（最多 3 个变体）
- 完整说明（最多 3 个变体）

访问路径：Play Console → 商店发布实验

**每次只测试一个元素。测试至少运行 7 天或获得 1,000 次展示。**

## 发布前（抢先体验）

使用抢先体验可以：
- 在公开发布前收集评论
- 在发布前被 Google 收录
- 获得 Google Play 编辑推荐的考量机会

## 输出格式

### Play 商店详情页草稿

```
Title (30):     [text]
Short desc (80): [text]

Full Description:
[Hook — 2–3 sentences, primary keyword in first 167 chars]

✨ Features:
• [Feature]: [Benefit]
• [Feature]: [Benefit]
• [Feature]: [Benefit]
• [Feature]: [Benefit]
• [Feature]: [Benefit]

[Social proof paragraph]

[CTA sentence]

[Keyword-rich closing paragraph]

Keywords targeted: [list primary keywords used]
```

### ASO 审核（Play）

为每个字段给出 1–10 分：

```
Title:             [N]/10 — [note]
Short description: [N]/10 — [note]
Full description:  [N]/10 — [note]
Screenshots:       [N]/10 — [note]
Feature graphic:   [N]/10 — [note]
Ratings:           [N]/10 — [note]
Overall:           [N]/60

Top 3 improvements:
1. [specific change with expected impact]
2. [specific change with expected impact]
3. [specific change with expected impact]
```

## 相关技能

- `aso-audit` — 以 iOS 为重点的审核（用于比较不同方法）
- `metadata-optimization` — iOS 元数据（字段规则不同）
- `review-management` — 回复 Play 评论以恢复评分
- `rating-prompt-strategy` — 应用内评价 API 的触发时机和策略
- `ab-test-store-listing` — Play 实验方法论
- `localization` — 针对每种语言优化商店详情页