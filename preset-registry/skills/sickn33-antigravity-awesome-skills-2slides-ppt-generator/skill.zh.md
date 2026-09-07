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

在执行此技能之前，请先阅读[详细指南](references/detailed-guide.md)。其中保留了完整的流程和参考资料。请将其中的安全要求、前提条件和验证要求视为强制性的。针对专注型任务，加载相关章节即可；针对端到端任务，请完整阅读整份指南。

## 何时使用此技能

- 当用户要求根据文本或大纲“创建演示文稿”、“制作幻灯片”或“生成一套幻灯片”时使用。
- 当用户希望幻灯片匹配某张参考图片的风格时使用（“照着这张图片制作幻灯片”）。
- 当用户想要在没有参考图片的情况下自定义设计 PDF 幻灯片时使用。
- 当用户上传文档并要求“根据这份文档创建幻灯片”时使用。
- 当用户希望为生成的幻灯片添加 AI 语音旁白，或将幻灯片导出为 PNG 图片、旁白导出为 WAV 音频时使用。
- 当用户询问“有哪些可用主题？”或希望浏览/选择主题时使用。

## 安全与注意事项

- **凭据：** 此技能从 `SLIDES_2SLIDES_API_KEY` 环境变量中读取 API 密钥。绝不要在命令中硬编码该密钥、将其提交到代码库，或将其回显给用户。脚本仅通过 HTTPS 以 bearer/`apikey` 值的形式将其发送到 `https://2slides.com`。
- **网络与付费变更操作：** 每次生成调用都会向 2slides API 发出出站网络请求，并**消耗用户的额度（credits）**（视模式而定，每页 10–210 credits）。请将生成、参考图片、自定义 PDF 和旁白调用视为计费操作——在生成大型或高分辨率（4K）幻灯片组之前先确认用户意图，并在页数/费用不可忽略时向用户展示预期的页数和费用。
- **不执行破坏性本地操作：** 脚本只读取用户指定的内容/文件，并将生成的输出（例如下载的 ZIP）写入用户指定的路径。脚本不会修改或删除无关文件。
- **输入处理：** 参考图片和文档输入会被发送到 2slides 服务进行处理。不要提交用户未授权进行第三方处理的机密材料。
- **下载链接会在 1 小时后失效** —— 请及时获取产物，不要将这些 URL 当作持久存储。

## 局限性

- 需要有效的 2slides 账户、API 密钥以及足够的额度（credits）；此技能不会提供或代付额度。
- 生成结果是由 AI 生成的草稿，仅作为起点，并非经过事实核查的最终交付物——使用前请审阅内容。
- 此技能不能替代针对特定环境的验证或专家审阅。如果缺少 API 密钥、必需的输入或预期的费用/范围，请停止并请求澄清。
- 存在速率限制（Fast PPT 每分钟 10 次，Nano Banana 每分钟 6 次）；请每 20–30 秒轮询一次异步任务，而非紧密循环轮询。
