---
name: 2slides-ppt-generator
description: "AI-powered presentation generation via the 2slides API — create slides from text, match a reference image style, summarize documents into decks, add AI voice narration, and export pages/audio. Use for any \"make slides\", \"create a deck\", or \"slides from this document\" request."
category: api-integration
risk: safe
source: community
source_repo: 2slides/slides-generation-2slides-skills
source_type: community
date_added: "2026-06-05"
author: 2slides
tags: [presentations, slides, powerpoint, ai, api-integration, pdf, narration, document-summarization]
tools: [claude, cursor, gemini, codex, antigravity]
plugin:
  setup:
    type: manual
    summary: "Install Python requirements and configure a 2slides API key before running generation scripts."
    docs: SKILL.md
---
# 2slides 演示文稿生成

## 详细指南

在执行此技能之前，请先阅读[详细指南](references/detailed-guide.md)。其中保留了完整的操作流程和参考资料。请将其中的安全事项、前提条件和验证要求视为强制要求。进行专项工作时，加载相关章节即可；进行端到端的工作时，请完整阅读该指南。

## 何时使用此技能

- 当用户要求从文本或大纲“创建演示文稿”、“制作幻灯片”或“生成一套幻灯片”时使用。
- 当用户希望幻灯片与参考图片的风格一致时（“照这张图片的样子制作幻灯片”）使用。
- 当用户需要无参考图片的定制设计 PDF 幻灯片时使用。
- 当用户上传文档并要求“根据此文档创建幻灯片”时使用。
- 当用户希望为生成的幻灯片添加 AI 语音旁白，或将幻灯片导出为 PNG 图片、旁白导出为 WAV 音频时使用。
- 当用户询问“有哪些可用主题？”或想要浏览/选择主题时使用。

## 安全与注意事项

- **凭据：** 此技能从 `SLIDES_2SLIDES_API_KEY` 环境变量中读取 API 密钥。切勿将密钥硬编码到命令中、提交到代码库，或回显给用户。脚本仅通过 HTTPS 以 bearer/`apikey` 值的形式将其发送至 `https://2slides.com`。
- **网络 + 付费变更操作：** 每次生成调用都会向 2slides API 发起出站网络请求，并**消耗用户的积分**（视模式而定，每页 10–210 积分）。请将生成、参考图片、定制 PDF 和旁白调用视为计费操作——在生成大型或高分辨率（4K）幻灯片之前先确认用户意图，并在页数/费用不可忽略时明确告知预计的页数和费用。
- **无破坏性本地操作：** 脚本只读取用户指定的内容/文件，并将生成的输出（例如下载的 ZIP 文件）写入用户指定的路径。它们不会修改或删除无关文件。
- **输入处理：** 参考图片和文档输入会被发送到 2slides 服务进行处理。请勿提交用户未授权交由第三方处理的机密材料。
- **下载 URL 会在 1 小时后过期**——请及时获取产物，不要将这些 URL 当作持久存储。

## 局限性

- 需要有效的 2slides 账户、API 密钥和足够的积分；此技能不负责开通或支付积分。
- 生成结果是由 AI 生成的草稿，仅作为起点，而非经过事实核查的最终交付物——使用前请审查内容。
- 此技能不能替代针对特定环境的验证或专家审查。如果缺少 API 密钥、必需的输入或预期的成本/范围，请停下来并请求澄清。
- 存在速率限制（Fast PPT 为 10 次/分钟，Nano Banana 为 6 次/分钟）；请以每 20–30 秒一次的频率轮询异步任务，而非紧密循环轮询。
