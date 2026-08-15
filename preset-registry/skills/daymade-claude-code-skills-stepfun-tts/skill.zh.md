---
name: stepfun-tts
description: Generate Chinese / Japanese speech with StepFun's stepaudio-2.5-tts — Contextual TTS that replaces step-tts-2's `voice_label` with natural-language `instruction` (≤200 chars) plus inline `()` parentheses for句内 prosody. Use when the user wants emotional / prosody control over voice synthesis (whisper, pause, stress, mood pivot mid-sentence), batch-generates game / app voice lines, migrates from `step-tts-2` (the `voice_label → instruction` breaking change), or hits StepFun's stricter 2.5-era censorship (死/消失/political terms). Triggers on 阶跃 TTS, StepAudio 合成, 语音合成, 配音, 文本转语音, TTS 升级, 迁移 step-tts-2. For transcription with the sibling stepaudio-2.5-asr model, use the stepfun-asr skill instead.
---
# StepFun stepaudio-2.5-tts

使用 `stepaudio-2.5-tts` 生成中文／日文语音（发布于 2026-04，验证于 2026-04-23）。上下文式 TTS——情感和韵律通过自然语言描述控制，而非固定标签。

> 配套说明：如需使用 `stepaudio-2.5-asr`（同系列模型）进行转录，请使用 `stepfun-asr` skill——二者共用同一个 API key，但位于不同的 endpoint，并使用不同的 body 结构。

**为什么需要这个 skill**——StepAudio 2.5 有两个不易察觉的问题，如果不了解，可能会浪费数小时：

1. `stepaudio-2.5-tts` **不接受** `voice_label`（这是 step-tts-2 的用法）。现在，情感／韵律通过 `instruction`（自然语言描述，≤200 个字符）以及文本内部的内联 `()` 括号来控制。
2. 内容审查更加严格——任何包含 死 / 消失 / 敏感政治词汇的内容都会返回 `censorship_block`。可用的改写方案位于 `references/migration_from_v2.md`。

## 配置与身份验证

API key 存储在 `$STEPFUN_API_KEY`（首选）或 `${CLAUDE_PLUGIN_DATA}/config.json`（用于跨会话持久化的备用方案）中。所有随附脚本都会先尝试读取环境变量，再读取配置文件。

首次设置（单行命令）：

```bash
mkdir -p "${CLAUDE_PLUGIN_DATA}" && cat > "${CLAUDE_PLUGIN_DATA}/config.json" <<EOF
{"api_key": "<paste key here>"}
EOF
```

如果用户尚未设置 key，请让他们粘贴 key（不要猜测，也不要使用占位符）。StepFun API key 可在 https://platform.stepfun.com/ → API Keys 获取。**请使用 Normal key，而不是 Plan key**（Plan key 仅限文本模型，在音频 endpoint 上会静默失败）。

## 常见任务——决策树

| 用户需求…… | 脚本 | 关键细节 |
|---|---|---|
| 合成带有情感的 1–500 字中文 | `scripts/tts_generate.py` | 使用 `instruction` 设置情绪，使用 `()` 控制内联韵律 |
| 合成长文本（500–1000 字） | `scripts/tts_generate.py` | 1000 字是硬性上限；超出时按语义边界拆分 |
| 批量生成游戏／应用语音台词 | `scripts/tts_generate.py --batch <jsonl>` | 单独处理每个 `censorship_block` 的回退方案 |
| 对两个 TTS 模型进行 A/B 对比 | `scripts/ab_compare.sh` | 对比两个目录中的时长／大小 |
| 从 `step-tts-2` 迁移 | 参阅 `references/migration_from_v2.md` | 将 `voice_label.emotion` 改写为 `instruction` + 审查词列表 |

## 入门指南

- **合成单句语音**：运行 `python3 scripts/tts_generate.py --text "你好" --out /tmp/hello.mp3 --instruction "温暖的希望感"`。如需精细控制，请阅读下方的“上下文式 TTS”部分。
- **完整地从 `step-tts-2` 迁移到 `stepaudio-2.5-tts`**：在修改代码之前，请从头到尾阅读 `references/migration_from_v2.md`。其中包含 `INSTRUCTION_MAP`、SKIP_CENSORED 列表模式，以及用于无损 A/B 对比的输出目录策略。

## 上下文式 TTS——超越情感标签

`stepaudio-2.5-tts` 的核心特性是：不再将情感映射到固定标签，而是开始使用自然语言描述所需效果。它分为两个层次：

**全局上下文（`instruction` 参数）**——设定整段话语的整体语气。≤200 个字符。可以将其视为给配音演员的舞台指导。

```
instruction: "克制的悲伤，语气低沉柔弱，像快要消失一样"
```

**内联上下文（`input` 中的 `()` 括号）**——句内指令。括号中的内容会被作为指令处理，**不会**被朗读出来。可用于精确控制停顿、呼吸、重音或句中情绪变化。

```
input: "(试探着问)你好吗？(开心地)太好了！(突然沉下来)不过...我快要消失了。"
```

实践中有效的示例（经 2026-04-23 验证）：
- `instruction: "活泼俏皮，像是在撒娇，带点嘴硬"`——与中性语气相比，语速明显加快
- `instruction: "耳语声，气声很重，几乎听不清"`——会产生清晰可辨的耳语和气声效果
- `input: "你好(停顿一下)我是蕾格(轻声)今天(加重)的天气真不错。"`——所有内联指令均得到执行

**`stepaudio-2.5-tts` 不接受的参数**——`voice_label` 参数。错误：`voice_label is not supported for v2 models`。这是从 step-tts-2 迁移时最常见的陷阱。

## 常见错误模式（真实错误及对应修复方法）

| 错误响应 | 实际原因 | 修复方法 |
|---|---|---|
| `"voice_label is not supported for v2 models"` | 向 `stepaudio-2.5-tts` 发送了 `voice_label` | 移除 `voice_label`；将相同意图以自然语言形式写入 `instruction` |
| `"The content you provided or machine outputted is blocked." type: censorship_block` | 包含敏感词（死 / 消失 / 等） | 改写该短语，或仅针对该行回退到 `step-tts-2`（混合使用模型没有问题） |
| 音频被静默截断（输入超过 1000 个字符） | 超出硬性上限 | 按语义边界拆分；不要在句子中间截断 |

更多信息见 `references/known_issues.md`。

## 何时阅读参考文档

- `references/api_reference.md`——`/v1/audio/speech` 的精确请求/响应 JSON、所有字段及错误响应。在不使用随附脚本、而是编写原始 HTTP 调用时阅读。
- `references/migration_from_v2.md`——将 step-tts-2 项目迁移到 stepaudio-2.5-tts 的完整操作手册。其中包含情绪→指令改写表、A/B 目录策略、决策检查点，以及 2026-04 的速度/质量权衡数据（`stepaudio-2.5-tts` 比 step-tts-2 慢约 20%；韵律有可听辨的改善）。开展任何迁移工作前请先阅读。
- `references/known_issues.md`——审查拦截模式、TTS 时长膨胀、v2 系列参数命名陷阱、1000 字符硬性上限。在调试异常输出或评估是否采用时阅读。

## 设计不变量（不要破坏这些原则）

1. **非破坏性 A/B 输出**——使用新模型重新生成语料库时，应写入平行目录（`voice/zh_v25/`），绝不要覆盖生产语料库。迁移操作手册解释了原因。
2. **逐行处理审查拦截**——如果 29 行中有 2 行出现 `censorship_block`，不要让整个批次失败。记录被跳过的 ID，然后继续。混合模型回退（对被跳过的 2 行使用 step-tts-2）是正常做法。
3. **不要在新代码中重复实现 voice_label 逻辑**——任何面向 stepaudio-2.5-tts 的新 TTS 代码都应仅使用 `instruction` + 内联 `()`。不要编写按条件发送 `voice_label` 的分支。

## 定价（经 2026-04-23 验证，可能变动）

- `stepaudio-2.5-tts` 上下文合成：约 5.8 元 / 万字符
- 零样本声音克隆：约 9.9 元 / 音色

在向利益相关者报价前，请访问 https://platform.stepfun.com/docs/zh/guides/pricing/details 重新核实。