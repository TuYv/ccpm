---
name: Agentic video understanding
description: >-
  Use when an agent must extract moments, quotes, objections, hooks, or evidence
  from long video or audio cheaper than full-frame ingest — sales calls,
  podcasts, YouTube episodes, Loom trials, discovery recordings. Goal-directed
  watch via Gemini agentic video understanding (frames, audio, or transcript).
  Not for cutting, overlays, rendering, scheduling, or publishing.
---
# Agentic 视频理解

可雇用的理解层。模型接收一个目标，并决定要观看哪些内容、以什么速度观看，以及通过哪种模态（帧、音频、文字稿）获取信息，只提取所需的片段。供应商声称：与静态固定 FPS ingest 相比，成本最高可降低约 66%，token 数量最高可减少约 88%，同时准确率更高。

## 这是什么 / 不是什么

**是：** 目标 → 只观看所需内容 → 时间戳 + 引用 + 置信度。

**不是：** 视频编辑器。不要使用此 skill 进行剪辑、叠加、烧录字幕、渲染、排期、发布、发送邮件或写入 CRM。将剪辑交给 Overlap、FFmpeg 或 `net-new-video-editor`。审批仍由调用方负责。

## 使用时机

- 通话前 / 销售通话挖掘：买方异议、下一步行动、竞品提及
- 短视频评分：寻找一个 3 秒的独立 hook 以及起止点
- 长视频 / X 研究：在播客或 YouTube 素材中寻找特定人物 + 对比片段
- 人才评估：在 Loom 或试用录屏中寻找能够证明能力的证据
- 客户审计：在一次 discovery 录音中查找某个关键词的所有提及

如果任务已经有一份干净的文字稿，并且只需要进行文本搜索，则跳过。

## 输入

| 字段 | 必填 | 备注 |
|-------|----------|-------|
| `source` | 是 | 运行时可以读取的 URL 或本地媒体路径 |
| `goal` | 是 | 一句话的检索目标 |
| `keywords` | 否 | 用于偏置检索的额外字符串 |
| `max_moments` | 否 | 默认为 5 |
| `modality` | 否 | `auto`（默认）、`frames`、`audio` 或 `transcript` |

## 流程

1. **重述目标**，形成 1–3 个检索查询。每个查询都必须是可证伪的，即你能够判断某个片段是否匹配。
2. 使用 `source`、查询、`max_moments` 和模态偏好**调用 Gemini agentic video understanding**（Gemini API 或 AI Studio）。如果可用，优先使用 agentic 路径，而不是固定 FPS 的完整 ingest。API 返回候选时间窗口或明确的空集合后，该步骤完成。
3. 将片段**规范化**为下方的输出 schema。标记内容是释义还是逐字引用。删除虚构的时间戳。当每个保留的片段都包含 `t_start`、`t_end`、`modality`、`quote`、`why`、`confidence` 后，该步骤完成。
4. **停止并交接**给调用方。不要进行剪辑、叠加、排期、发布、发送邮件或写入 CRM。

## 输出 schema

供人阅读的 Markdown，可选用于机器处理的 JSON：

```json
{
  "goal": "",
  "source": "",
  "moments": [
    {
      "t_start": "MM:SS",
      "t_end": "MM:SS",
      "modality": "frames|audio|transcript",
      "quote": "",
      "verbatim": true,
      "why": "",
      "confidence": 0.0
    }
  ],
  "empty_reason": null,
  "tokens_note": "agentic path used|fallback static ingest"
}
```

## 硬性门槛

- agentic 路径可用时，不进行完整的固定 FPS ingest
- 不得捏造时间戳或引用
- 不得将完整文字稿或客户 PII 倾倒到公共产物中
- 不得通过此 skill 进行剪辑 / 渲染 / 叠加 / 排期 / 发布 / 发送

## 设置

- Gemini API key 或 Google AI Studio 访问权限：https://ai.studio
- 参阅 Google 关于 Gemini agentic video understanding 的开发者指南
- 环境变量：`GEMINI_API_KEY`（或项目现有的 Google AI 凭据）

## 调用者一行说明

- 调用前：`goal="exact next-step commitment and any pricing pushback"`
- 简短形式：`goal="best 3-second standalone hook; return in/out for one clip"`
- 人才：`goal="evidence they hit the role bar on X; max 5 moments"`
- 审计：`goal="every mention of Reddit, AEO, or budget"`

## 完成

当调用者拥有上述 schema（或有记录的空集合），且此 skill 除 Gemini 读取之外未执行任何副作用时，即视为完成。