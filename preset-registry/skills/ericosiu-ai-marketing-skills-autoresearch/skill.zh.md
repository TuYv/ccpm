---
name: autoresearch
description: Run Karpathy-style autoresearch optimization on any content. Generates 50+ variants, scores with a 5-expert simulated panel, evolves winners through multiple rounds, outputs optimized version + full experiment log. Use when optimizing landing pages, email sequences, ad copy, headlines, form pages, CTA text, or any conversion-focused content. Triggers on "optimize this page", "run autoresearch", "score these variants", "A/B test this copy".
---
# 自动研究技能

适用于任何以转化为目标的内容的 Karpathy 式优化循环。无需流量。使用模拟专家评审团。只需几分钟，而非数周。

**适用场景：** 发布前的内容优化。生成 50 个以上的变体，由 5 位模拟专家评分，对优胜者进行迭代，输出最佳版本和完整实验日志。

**不适用场景：** 发布后基于真实流量的 A/B 测试——这需要真实的分析数据，而非模拟评分。

> **执行顺序：** 首先运行自动研究，使模拟评分达到 85 分以上。然后部署。最后使用真实流量进行验证。

---

## 你将获得的输出

每次运行都会输出 3 个文件：

| 文件 | 用途 |
|------|---------|
| `{name}-optimized.{ext}` | 优胜的优化后内容 |
| `data/{name}-experiments.json` | 完整的实验日志——包含所有变体和全部评分 |
| `data/{name}-optimization-report.md` | 人类可读的摘要，包含优胜理由 |

---

## 专家评审团（5 种角色）

使用全部 5 位专家对每个变体进行评分。每一轮将所有变体放入**单次 API 调用**中进行批量评分。

| # | 角色 | 评分视角 |
|---|---------|-------------|
| 1 | **中型 B2B 公司（营收 5000 万以上）的 CMO** | “这会让我停下来并参与互动吗？” |
| 2 | **持怀疑态度的创始人** | “我相信这一点吗？我会信任这家公司吗？” |
| 3 | **转化率优化专家** | “这是否清晰、具体，并能推动用户采取行动？” |
| 4 | **资深文案撰稿人** | “这是否具有吸引力、差异化，并且文案精良？” |
| 5 | **你的 CEO/创始人** | “直接、痴迷于 ROI、不讲废话。我会把它放在自己的网站上吗？” |

> **自定义：** 将角色 #5 替换为你自己的 CEO/创始人风格。在 `references/founder-voice.md` 文件中定义其关注重点和沟通风格。

每位评审的评分范围为 0–100。**最终得分 = 5 位评审评分的平均值。**

---

## 轮次结构（针对每个内容元素）

```
Round 1:
  → Generate 10 variants of the element
  → Batch-score all 10 with the 5-expert panel (1 API call)
  → Rank by average score
  → Keep top 3

Round 2 (Evolution):
  → Analyze what the top 3 did right
  → Generate 10 new variants that push those winning patterns further
  → Batch-score all 10 (1 API call)
  → Keep top 3

Round 3 (If score < threshold):
  → Identify weakest scoring dimension
  → Generate 10 variants optimized for that dimension
  → Batch-score → keep top 1

Multi-element cross-breeding:
  → Take top 1 winner from each element
  → Generate 5 combinations that mix winning elements
  → Score holistically as complete units
  → Output the single best combination
```

**停止条件：** 得分最高的变体达到最低评分阈值（默认值：80），或已完成 3 轮。

---

## 内容类型与评分维度

### 落地页
**需要优化的元素：** 首屏主标题、副标题、CTA 文案、问题描述部分、社会认同

**评分维度：**
- `first_impression` — 它能否立即抓住注意力？
- `clarity` — 用户能否立即理解所提供的内容？
- `trust` — 它是否让人觉得可信？
- `urgency` — 是否有理由立即采取行动？
- `would_convert` — 评审是否真的会点击？

### 邮件序列
**需要优化的元素：** 主题行、开场白、正文文案、CTA、附言行

**评分维度：**
- `would_open` — 主题行通过率
- `would_read` — 开场白是否吸引人？
- `would_click` — CTA 是否具有吸引力？
- `would_reply` — 内容是否足够个性化，能让人愿意回复？
- `spam_risk` — 内容是否显得像垃圾邮件？（越低越好；计算最终得分时需反转）

### 广告文案
**需要优化的元素：** 标题、描述、CTA

**评分维度：**
- `scroll_stopping` — 是否能让用户停止滚动？
- `clarity` — 能否在 3 秒内清楚传达价值主张？
- `click_worthiness` — 评审是否想要点击？
- `relevance` — 是否符合潜在受众的意图？
- `differentiation` — 是否能从竞争对手中脱颖而出？

### 表单页面
**需要优化的元素：** 标题、辅助文本、价值主张要点、按钮文本、字段顺序、感谢文案

**评分维度：**
- `first_impression` — 是否让人觉得值得填写？
- `trust` — 用户是否相信其信息是安全的，并且优惠真实可信？
- `completion_likelihood` — 评审是否愿意开始填写？
- `lead_quality` — 是否能吸引真正有意向的潜在客户（而非只问不买的人）？
- `would_fill_out` — 最终直觉判断：他们是否会提交？

---

## 分步执行协议

### 第 1 步：接收并解析

阅读源内容。自动识别内容类型，或与用户确认：
- HTML 文件 → 落地页或表单页面
- Markdown / 纯文本 → 邮件或广告文案
- 如果不明确，请询问："这是落地页、邮件序列、广告文案，还是表单页面？"

提取所有可优化的元素。将其列出并反馈给用户：
```
Found 5 elements to optimize:
1. Hero headline: "We help B2B companies grow"
2. Subheadline: "Full-service digital marketing..."
3. CTA: "Get Started"
4. Problem statement: [excerpt]
5. Social proof: [excerpt]

Optimizing: all | Variants per round: 10 | Min score: 80
```

### 第 2 步：获取 API 密钥

检查 Anthropic API 密钥：`$ANTHROPIC_API_KEY` 环境变量。

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 第 3 步：运行优化轮次

针对每个元素，按照上述轮次结构运行。

**关键 API 效率规则：** 始终将所有变体批量放入一个提示词中。绝不能为每个变体单独调用一次 API。一轮包含 10 个变体 = 1 次 API 调用。

模型偏好（按顺序）：
1. `claude-sonnet-4-5`（首选——快速且智能）
2. `claude-opus-4`（需要最高质量时使用）
3. 如果上述模型不可用，则使用任意 claude-3.5+ 模型

### 第 4 步：交叉融合（多元素）

在所有元素都选出优胜版本后：
1. 将每个元素的最佳版本组合成一个完整单元
2. 生成 5 个自然融合各获胜元素的整体变体
3. 对完整单元进行评分（而非只评估各个部分）
4. 选择整体得分最高的优胜版本

### 第 5 步：写入输出文件

```bash
# Create output directory
mkdir -p data

# Write optimized content
# Write experiments JSON
# Write optimization report
```

**实验 JSON 结构：**
```json
{
  "run_id": "autoresearch-{name}-{timestamp}",
  "content_type": "landing_page",
  "source_file": "path/to/original",
  "min_score_threshold": 80,
  "rounds": [
    {
      "round": 1,
      "element": "hero_headline",
      "variants": [
        {
          "id": 1,
          "text": "...",
          "scores": {
            "cmo": 72,
            "skeptical_founder": 68,
            "cro": 75,
            "copywriter": 70,
            "founder": 65
          },
          "avg_score": 70
        }
      ],
      "top_3": [1, 4, 7],
      "winner_score": 82
    }
  ],
  "final_winner": {
    "hero_headline": "...",
    "subheadline": "...",
    "cta": "...",
    "holistic_score": 87
  }
}
```

### 第 6 步：汇报结果

向用户总结结果：
- 最终胜出方案的得分
- 最大得分跃升（哪个元素的改进最大）
- 排名前 2 的备选方案（以防胜出方案感觉不合适）
- 全部 3 个输出文件的路径
- 明确的下一步操作

---

## 用户选项

| 选项 | 默认值 | 说明 |
|--------|---------|-------------|
| `elements` | 全部 | 要优化哪些元素 |
| `variants_per_round` | 10 | 每轮生成多少个变体 |
| `min_score` | 80 | 达到此分数时停止 |
| `rounds` | 3 | 停止前的最大轮数 |
| `auto_apply` | false | 是否使用胜出方案覆盖源文件 |
| `content_type` | 自动检测 | 如果自动检测有误，强制指定内容类型 |

---

## 质量门槛

- **< 70：** 不要发布。存在根本性问题。
- **70-79：** 勉强可用。再进行一轮，重点优化得分最低的维度。
- **80-84：** 良好。可以发布。使用真实流量进行验证。
- **85-89：** 出色。可以放心发布。
- **90+：** 极为罕见。立即发布。

---

## 要避免的反模式

- **绝不要为每个变体单独调用一次 API。** 始终进行批量调用。一轮 10 个变体 = 1 次调用。
- **不要过度优化单一维度。** 如果清晰度达到 95，但信任度只有 45，那么总分就具有误导性。
- **不要运行超过 5 轮。** 如果 3 轮后仍未达到 80 分，问题就在战略层面（定位错误），而不是战术层面（措辞不当）。
- **在每个元素各自选出胜出方案之前，不要进行交叉组合。** 过早交叉组合会产生不连贯的搭配。