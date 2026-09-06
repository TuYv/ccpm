---
name: shortform-production
description: Produce readable vertical shorts with evidence-based B-roll, three opening treatments, editorial review, and authorized Metricool API delivery. Use for shortform edits, captions, hook experiments, or scheduling approved clips.
---
# 短视频制作

保持视觉风格一致。根据来源调整叙事方式。实验是一个假设，而不是已证实的留存率提升。

## 前言

如果可用，请使用仓库中的版本检查和遥测初始化：

```bash
python3 telemetry/version_check.py 2>/dev/null || true
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

远程遥测需要用户明确同意。绝不要记录内容、路径、账户详细信息或凭据。

## 选择工作类型

1. **编辑：** 阅读 [V5 风格](references/v5-style.md) 和 [创意格式](references/creative-formats.md)。使用指定的来源和带时间戳的文字稿。保留凭据、声明限定语、自然表达和 CTA。在设计插入内容前，盘点真实素材。使用可用的渲染器；此软件包提供编辑规则和交付工具。
2. **实验：** 为一个片段制作三种开场处理方案。除非明确要求完整变体，否则在渲染完整编辑之前选择一种方案。不要自动发布近似重复的版本。
3. **审查：** 阅读随附的 [评分标准](references/eval/rubric.json)、[评审提示词](references/eval/judge-prompt.md)、[参考要求](references/eval/references.json) 和 [评分卡架构](references/eval/scorecard.schema.json)。应用 [审查要求](references/review-and-learning.md)。报告缺失的证据；绝不要臆造分数。
4. **添加字幕或交付：** 阅读 [API 交付](references/metricool.md)。检查实际的最终视频和 CTA。不要为了匹配制作默认设置而重新渲染已批准的上传内容。使用 Metricool 的 API。
5. **结果：** 阅读 [审查与学习](references/review-and-learning.md)。将缺失的指标记录为 null。单条帖子无法证明某种风格胜出。

## 交付

根据请求的模式，包含相关产物：来源哈希和文字稿；声明及素材来源；开场假设和镜头列表；带版本号的母版和 SRT；封面、标题、说明文字和 CTA；审查证据；经验证的交付回执；以及有依据的表现观察。

将凭据和私有回执保存在仓库之外。保留原始媒体和之前的渲染结果。只有在有匹配证据时，才能报告 `review candidate`、`scheduled`、`publishing` 或 `published`。

使用 [下一批次计划](references/next-batch.md) 将这些规则转化为制作周期。