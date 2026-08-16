---
name: tropes
description: Detects and eliminates AI writing tropes that make text sound artificial or formulaic. Use when generating text content, writing documentation, creating code comments, or reviewing writing style. Supports four-tier JSON preferences (global/project x shared/local office.json) read via load-preferences.sh.
---
# AI 写作套路检测

扫描生成的文本，查找会使内容显得不自然或公式化的常见 AI 写作模式。此技能提供了一套用于识别和消除这些套路的系统化工作流。

来源：[tropes.fyi](https://tropes.fyi)，作者：[ossama.is](https://ossama.is)  
原始 Gist：[ossa-ma/f3baa9d2](https://gist.github.com/ossa-ma/f3baa9d25154c33095e22272c631f5a1) — 此技能的 `references/` 所依据并扩展的原始 33 条套路列表。

## 核心原则

**像人类专家一样写作：富于变化、准确且专业。**

目标是在过度口语化或随意的写作方式与 AI 生成内容典型的晦涩、公式化风格之间找到“中间地带”。某种模式偶尔使用一次通常没有问题；当多种套路集中出现，或同一种套路在全文中反复出现时，才会产生问题。

## 何时检查

在以下情况下扫描套路：
- 生成任何文本内容（文档、注释、消息）
- 在提交或发布前审阅文字
- 编辑 AI 生成的草稿
- 回答用户问题或编写说明

## 检测工作流

### 0. 加载用户偏好

关键：用户偏好存储在 `office.*.json` 文件中（而不是 Claude Code 的 `settings.json`）。这些文件是 office 插件自身的偏好文件，遵循 `.claude/plugin-name.local.*` 约定，并使用 `.json` 作为载体。它们不参与运行框架的四层设置合并 — 合并由 `load-preferences.sh` 完成。

运行加载器脚本，将合并后的偏好作为单个 JSON 对象获取：

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/load-preferences.sh
```

该脚本按优先级顺序（从高到低）读取最多四个文件：`.claude/office.local.json`（项目级，个人）> `.claude/office.json`（项目级，共享）> `~/.claude/office.local.json`（全局，个人）> `~/.claude/office.json`（全局，共享）。它会对这些文件进行深度合并（标量由更高优先级层替换，列表会拼接并去重，pattern_caps 按 `id` 去重，dead_metaphors.entries 按 `word` 去重），然后将合并后的 JSON 输出到标准输出。如果缺少 jq 或所有文件均不存在，则会以开放式失败方式回退到 `{}`，并应用默认规则。

将合并后的偏好作为对下述默认检测规则的覆盖或补充：
- `banned_words` / `banned_phrases` / `zh.*` / `en.*` — 添加到默认套路词汇中
- `preferred_terms` — 修订时建议使用的替换词
- `skip_categories` — 完全禁用指定类别（枚举值：`word-choice`、`sentence-structure`、`paragraph-structure`、`tone`、`formatting`、`composition`、`professional-balance`）
- `sensitivity` — 覆盖阈值（`strict` 会标记单次出现；`relaxed` 仅标记出现 3 次及以上的情况）
- `tone` — 调整专业性平衡的基准线
- `formatting.max_em_dashes` / `formatting.allow_bold_first_bullets` — 格式阈值
- `dead_metaphors` — 对每个词强制执行次数上限（默认为 1；`quote_exception` 会跳过引语）；建议使用 `replacement`
- `pattern_caps` — 对每种模式强制执行次数上限（`reversal_sentence`、`parallelism_triple`、`arrow_flow`、`numbered_bold_sections`），并遵循 `forbidden_in` / `scope` / `exception`
- `rhetorical_bans` — 按稳定 ID 禁止修辞模式（`self_qa`、`self_eval_summary`、`parallel_antithesis_subheading`、`process_meta_narration`）
- `principles` — 作为附加检查应用的判断性自由文本规则

如果两个文件都不存在，则在检测运行完成后，提议使用默认值创建全局文件。

有关完整的字段参考和合并规则，请参阅 `references/preferences-schema.md`。

### 1. 模式扫描

通读文本并识别：
- 重复的句子结构或开头
- 公式化的过渡语（"It's worth noting"、"Here's the thing"）
- 可以用简单词语替代的华丽词汇
- 显得刻意的修辞模式
- 过于口语化或“闲聊式”、缺乏专业分量的片段

### 2. 聚集检查

检查多个套路是否同时出现：
- 单个段落中出现 3 个以上模式 = 高风险
- 同一模式在一篇文本中使用 2 次以上 = 需要修改
- 破折号出现 5 次以上 = 格式问题

### 3. 修改策略

对于每个识别出的套路：
- **用词**：替换为更简单、更直接的语言或精确的技术术语（避免“魔法副词”）。
- **句子结构**：自然地改变开头和长度，将相关想法组织成连贯的段落。
- **过渡**：使用逻辑驱动的连接语（例如 "Consequently,"、"Conversely"），而不是填充性短语。
- **格式**：减少破折号，移除以粗体开头的项目符号。

### 4. 验证

修改后：
- 重新扫描仍然存在的模式
- 检查文本朗读时是否自然
- 确保内容具体明确（具体细节，而不是模糊归因）
- 确认语气专业且易于理解（“专家式清晰表达”）

### 5. 偏好同步（可选）

检测运行完成后，提议将偏好保存到以下四个文件之一（默认为 `~/.claude/office.local.json`）：
- `~/.claude/office.local.json` — 全局个人默认配置
- `~/.claude/office.json` — 全局共享基准配置
- `.claude/office.local.json` — 项目个人配置（将其加入 gitignore）
- `.claude/office.json` — 项目共享配置（将其提交，供团队使用）

当用户希望与团队共享规则时，建议使用 `.json`（共享）文件；对于个人偏好，则建议使用 `.local.json` 文件。然后：
- 新标记的词语 → `banned_words` / `banned_phrases` / `zh.banned_words` / `en.banned_words`
- 重复出现的修正模式 → `preferred_terms`
- 新的陈词滥调式隐喻 → `dead_metaphors.entries`（包含 `word`、`replacement`、`cap`）
- 新的句式上限 → `pattern_caps`（包含 `id`、`max`/`max_nodes`，以及可选的 `forbidden_in`/`scope`/`exception`）
- 修辞模式禁令 → `rhetorical_bans`（稳定 ID）
- 判断性规则 → `principles`
- 敏感度调整 → `sensitivity`

除非用户指定项目级别，否则默认目标为全局文件。不要自动写入。提供差异预览：哪个文件、哪个字段，以及合并后的 JSON 将呈现为何种形式。让用户确认后再写入。

## 模式类别

完整的套路目录分为七个类别。根据需要加载特定的参考资料：

1. **用词** - `references/word-choice.md`
   华丽词汇、魔法副词、浮夸句式

2. **句子结构** - `references/sentence-structure.md`
   否定式排比、反问句、公式化模式

3. **段落结构** - `references/paragraph-structure.md`
   短句片段、伪装成列表体的内容

4. **语气** - `references/tone.md`
   虚假悬念、说教式口吻、模糊归因

5. **格式** - `references/formatting.md`
   过度使用长破折号、以粗体开头的项目符号、Unicode 装饰字符

6. **篇章组织** - `references/composition.md`
   分形式总结、陈腐隐喻、内容重复

7. **专业表达的平衡** - `references/professional-balance.md`
   既避免过度口语化的“人类腔”，也避免晦涩的“AI 腔”。

另有一个辅助 schema（不属于惯用模式类别）：

- **用户偏好** - `references/preferences-schema.md`
  两级 JSON 配置：全局 `~/.claude/office.local.json` + 项目 `.claude/office.local.json`，由 `load-preferences.sh` 读取并合并。自定义禁用词语/短语、陈腐隐喻、模式上限、敏感度、语气、跳过的类别。