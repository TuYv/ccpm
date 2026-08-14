---
name: bm-remember
description: Quickly save a small fact, reminder, or user preference into Basic Memory from Codex without turning it into a full decision or checkpoint.
---
# 记住

用于轻量级记录：“记住这一点”“保存这个”“记录这个”，或记录应在当前对话结束后保留的简短事实。

## 步骤

1. 读取 `~/.codex/basic-memory.json`，然后读取最近项目中的 `.codex/basic-memory.json`；项目键会覆盖用户键：
   - `primaryProject`，默认省略
   - `rememberFolder`，默认为 `codex/remember`

   在起草笔记前应用 `bm-writing` 技能。使其详略程度与这种轻量级记录相匹配；不要将一个简短事实扩充成长篇文章。

2. 确定要保存的确切文本。如果用户提供了文本，请保留其措辞。如果用户说“记住这一点”，但其指代不明确，请提出一个简短的问题。

3. 使用 `write_note` 写入：
   - `title`：将第一行截短至 80 个字符，或使用简短的描述性标题
   - `directory`：`rememberFolder`
   - `content`：要记住的文本
   - `tags`：`["codex", "manual-capture"]`
   - 如果已配置，则路由到 `primaryProject`

4. 使用永久链接进行一行确认。

不要将其用于存在多个备选方案的决策或工作交接。对于这些情况，请使用 `bm-decide` 或 `bm-checkpoint`。