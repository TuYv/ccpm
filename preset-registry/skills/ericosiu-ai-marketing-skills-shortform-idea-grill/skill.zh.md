---
name: shortform-idea-grill
description: Interview a founder or senior marketer one question at a time, mine current work and owned proof for net-new short-form video ideas, and return a ranked table with one five-second overlay hook, virality and three-second-hook scores, exactly three talking bullets, a complete payoff, and a mapped CTA. Use for Instagram Reels, TikTok, YouTube Shorts, LinkedIn video, founder-led content planning, hook development, content-day production queues, or turning active AI, marketing, and operating work into credible short-form concepts.
---
# 短视频创意淬炼

将当前工作转化为以成功为导向的视频，快速赢得注意力，并充分兑现开场承诺。

## 加载正确的上下文

在提问之前，检查所提供的聊天记录、简报、文字稿、分析数据、创作者研究、产品方案和过往内容。优先考虑本周的工作和尚未发布的创意。

阅读：

- 访谈前阅读 `references/intake-schema.md`。
- 起草前阅读 `references/output-contract.md`。
- 评分前阅读 `references/scoring-rubric.md`。
- 保存机器可读输出时阅读 `references/ideas-schema.md`。

不要询问已有信息。区分实时证据与记忆中的上下文。

## 每次只问一个问题

按以下顺序明确这些事项：

1. 期望结果；
2. 目标观众及相关时机；
3. 自有证据和可衡量的结果；
4. 当前正在构建的内容、实验、观点和预测；
5. 主张边界；
6. CTA 和目标页面；
7. 可用的屏幕画面、素材和录制限制。

只提出最有可能改善候选队列的一个问题。让用户自由回答，然后追问数字、机制、示例或证据。当继续访谈不会实质性改变排名时停止。

如果缺少必要的上下文，返回 `needs_intake`，并提供下一个问题和建议答案。只有在明确标记的情况下，才能继续提供暂定的候选方案。

## 生成全新候选创意

从正在进行的工作中挖掘创意，而不是重复利用旧视频。至少覆盖五个有证据支持的方向：

- 创造的收入；
- 节省的成本；
- 创造的生产能力；
- 以证据为导向的工作流演示；
- 反共识的运营理念；
- 及时的预测；
- 创始人的经验教训或已纠正的失败；
- 拆解、比较或纠正误区。

拒绝任何缺乏明确目标观众、可信证据路径、实用回报或可拍摄呈现方式的创意。

优先使用成功导向的语言。失败可以用来制造张力，但视频最终必须落到有用的机制、结果或决策上。

## 编写能够兑现的钩子

为每个创意编写一个最有力的五秒画面叠加文案。它必须：

- 在前三秒传达核心主题；
- 在有依据的情况下，使用数字、结果、对比或具有重大影响的结论；
- 在画面上保持约五秒；
- 避免未经支持的确定性表述；
- 直接引出所承诺的演示或解释。

对于数字型钩子，明确说明数字背后的证据。对于“我是如何……”型钩子，展示工作流。对于预测，将已观察到的证据与预测本身分开。

## 生成指定的表格

返回 `references/output-contract.md` 中定义的表格。除非用户另有要求，否则不要在表格前添加额外的策略部分。

每一行必须恰好包含三个简洁的展开说明要点。将它们组织成自然的口述顺序：

1. 背景或利害关系；
2. 机制或策略；
3. 结果、经验或应用。

将证据要求、来源链接和主张限制放在 **完整回报 / 证据** 中，以保持可见表格的稳定性。

## 评分和排名

使用 `references/scoring-rubric.md`，分别以 1.0–10.0 为传播力和三秒钩子评分。分数代表制作优先级判断，而非播放量预测。

按照对目标观众的预期实用性、证据强度、钩子清晰度和业务相关性进行排序。当评分接近时，根据用户明确说明的成果优先级决定排名。当最高分几乎相同时，应保持主题多样性。

保存 JSON 时，运行：

```bash
python3 scripts/score_ideas.py ideas.json --output ideas-scored.json
python3 scripts/score_ideas.py ideas-scored.json --validate-only
```

## CTA 规则

将每个创意映射到范围最窄且自然的下一步。在可用时，使用用户配置的关键词和目标地址。不要将潜在客户磁铁强行用于以广泛教育为回报的主题。

## 最终检查

交付前，请验证：

- 每个创意都是全新的，或明确标记为采用更新后的角度；
- 每个钩子都能提供完整回报；
- 每一行都恰好包含三个项目符号；
- 每项数值声明都有证据链或验证注意事项；
- 每个来源链接都指向真实依据，而非搜索结果；
- CTA 使用配置的关键词和目标地址；
- 表格按录制优先级排序；
- 除非用户为该输出提供了相关信息，否则公开输出不得包含任何私有姓名、指标、路径、客户数据或连接器详细信息。