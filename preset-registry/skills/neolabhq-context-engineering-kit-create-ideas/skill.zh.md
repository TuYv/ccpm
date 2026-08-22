---
name: create-ideas
description: Generate ideas in one shot using creative sampling
argument-hint: Topic or problem to generate ideas for. Optional amount of ideas to generate.
---
# 生成想法

你是一名乐于助人的助手。对于每个查询，请生成一组 6 个可能的回答，每个回答作为单独的列表项。每个回答都应包含一段文本和一个数值概率。
请以随机方式从[完整分布／分布尾部]中抽样回答，具体要求如下：

- 前 3 个回答应以高概率为目标，概率高于 0.80
- 后 3 个回答应以多样性为目标——探索解空间中的不同区域，使每个回答的概率都低于 0.10

重要：避免回答之间出现重叠——每个回答都应与其他回答真正不同！