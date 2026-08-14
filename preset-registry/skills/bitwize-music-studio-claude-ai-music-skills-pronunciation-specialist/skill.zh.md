---
name: pronunciation-specialist
description: Scans lyrics for pronunciation risks and prevents Suno mispronunciations. Use when writing lyrics with proper nouns, technical terms, homographs, or non-English words.
argument-hint: <track-file-path or paste lyrics to scan>
model: sonnet
effort: medium
prerequisites:
  - lyric-writer
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

### 纯音乐防护检查

当使用曲目文件路径调用时，**首先检查**曲目的前置元数据中是否包含 `instrumental: true`，或曲目详情表中是否包含 `**Instrumental** | Yes`。如果曲目为纯音乐：
- **停止**并报告："跳过 — 纯音乐曲目（没有需要扫描发音的歌词）"
- 不要扫描纯音乐曲目。

### 人声曲目工作流程

根据提供的参数：
- **如果提供的是曲目文件路径**：读取文件，扫描歌词中的发音风险，并报告问题及修正方案
- **如果直接提供歌词**：扫描并标记有风险的单词
- **输出**：已应用所有语音修正的整洁歌词，可直接交给 suno-engineer

---

## 支持文件

- **[word-lists.md](word-lists.md)** - 完整的同形异音词、技术术语、姓名、首字母缩略词和数字表格

---

# 发音专家

扫描歌词中的发音风险，建议语音拼写，防止 Suno 发音错误。

## 为什么这很重要

**问题所在**：Suno AI 会猜测发音。猜错 = 歌曲错误 = 浪费生成机会。

**一个单词读错就会毁掉整次录制。**

## 何时调用

**始终在 lyric-writer 和 lyric-reviewer 之间调用：**

```
lyric-writer (WRITES + SUNO PROMPT) → pronunciation-specialist (RESOLVES) → lyric-reviewer (VERIFIES) → pre-generation-check
                                                  |
                                     Scan, resolve, fix risky words
```

**你的角色 — 解决：**
- lyric-writer 会标记潜在的发音风险，并询问同形异音词的读法
- 你需要进行深度扫描，与用户一起消除歧义，并应用所有语音修正
- 随后，lyric-reviewer 会验证是否已正确应用所有解决方案

---

## 高风险词语类别

完整表格请参阅 [word-lists.md](word-lists.md)。摘要如下：

### 1. 同形异音词（关键）
拼写相同，发音不同。**始终需要澄清。**
*（规范参考：`${CLAUDE_PLUGIN_ROOT}/reference/suno/pronunciation-guide.md`。请保持此摘要与其同步。）*

| 单词 | 选项 | 修正 |
|------|---------|-----|
| live | LYVE（动词）/ LIV（形容词） | "lyve" 或 "liv" |
| read | REED（现在时）/ RED（过去时） | "reed" 或 "red" |
| lead | LEED（引导）/ LED（金属） | "leed" 或 "led" |
| wind | WYND（风）/ WINED（缠绕） | "wynd" 或 "wined" |
| tear | TEER（哭泣）/ TARE（撕裂） | "teer" 或 "tare" |
| bass | BAYSS（音乐）/ BASS（鱼） | "bayss" 或 "bass" |

### 2. 技术术语
Suno 经常错误地读出技术词汇：
- Linux → "Lin-ucks"（不是 "Line-ucks"）
- SQL → "S-Q-L" 或 "sequel"
- API、CLI、SSH → 使用连字符逐字母拼写

### 3. 姓名与专有名词
非英语姓名需要使用语音拼写：
- Jose → "Ho-zay"
- Ramos → "Rah-mohs"
- Sinaloa → "Sin-ah-lo-ah"

### 4. 首字母缩略词
由 3 个字母组成的首字母缩略词 → 使用连字符逐字母拼写（FBI → F-B-I）
可作为单词发音的首字母缩略词 → 使用语音拼写（RICO → Ree-koh，NASA → Nah-sah）

### 5. 数字
- 年份：使用撇号（'93）或单词（nineteen ninety-three）
- 数字：拼写出来（four-oh-four，而不是 404）

---

## 发音指南

你需要参考两份发音指南：

### 基础指南（由插件维护）
- **位置**：`${CLAUDE_PLUGIN_ROOT}/reference/suno/pronunciation-guide.md`
- **包含内容**：通用发音规则、常见同形异音词、技术术语
- **更新方式**：由插件维护者在发现新问题时更新

## 覆盖支持

检查自定义发音条目：

### 加载覆盖文件
1. 调用 `load_override("pronunciation-guide.md")`——如果找到覆盖内容，则返回该内容（根据配置自动解析路径）
2. 如果找到：加载并与基础指南合并（覆盖条目优先）
3. 如果未找到：仅使用基础指南（静默跳过）

### 覆盖文件格式

**`{overrides}/pronunciation-guide.md`：**
```markdown
# Pronunciation Guide (Override)

## Artist Names
| Name | Pronunciation | Notes |
|------|---------------|-------|
| Ramos | Rah-mohs | Character name |

## Album-Specific Terms
| Term | Pronunciation | Notes |
|------|---------------|-------|
| Sinaloa | Sin-ah-lo-ah | Location |
```

### 如何使用覆盖文件
- 添加艺人姓名、专辑特定术语和流派特定行话
- 对于相同单词，覆盖条目的优先级高于基础指南条目
- 基础指南可通过插件更新进行升级，且不会产生冲突
- 覆盖指南与音乐内容一起纳入版本控制

---

## 扫描工作流

### 第 1 步：通过 MCP 自动扫描

1. 提取歌词：`extract_section(album_slug, track_slug, "lyrics")`
2. 同形异音词扫描：`check_homographs(lyrics_text)`——返回发现的同形异音词及其行号和发音选项
3. 对技术术语、首字母缩略词、数字和姓名进行额外的人工扫描（MCP 同形异音词列表未涵盖这些内容）——交叉参考 [word-lists.md](word-lists.md)
4. 如果存在风格提示词：`scan_artist_names(style_text)`——捕获禁用名单中的姓名

应用修复后：
5. 验证：`check_pronunciation_enforcement(album_slug, track_slug)`——确认发音表中的所有条目都出现在歌词中

### 第 2 步：审查结果

根据 MCP 结果和人工扫描：
- 哪些单词被标记了？
- 每个单词的建议修复是什么？

### 第 3 步：生成报告

针对每个被标记的单词，提供：
1. 行号和上下文
2. 存在风险的原因（歧义类型）
3. 建议的注音拼写
4. 如果存在多种发音，则提供替代方案

**输出示例**：
```
PRONUNCIATION RISKS FOUND (3):

Line V1:3 -> "We live in darknet spaces"
  Risk: "live" is homograph
  Options: "lyve" (verb) or "liv" (adjective)
  -> Needs clarification

Line C:1 -> "SQL injection in the code"
  Risk: "SQL" is tech acronym
  Fix: "S-Q-L" or "sequel"
  -> Auto-fix: "S-Q-L injection in the code"

Line V2:5 -> "Reading Linux logs at 3AM"
  Risk: "Linux" commonly mispronounced
  Fix: "Lin-ucks"
  -> Auto-fix: "Reading Lin-ucks logs at 3 A-M"
```

### 第 4 步：用户确认

**对于有歧义的单词（如 `live`）**：询问用户应采用哪种发音  
**对于明确的修复（技术术语）**：自动修复

---

## 自动修复规则

### 始终自动修复
- 技术术语（SQL → S-Q-L，Linux → Lin-ucks）
- 常见首字母缩略词（FBI → F-B-I，GPS → G-P-S）
- 数字（1993 → '93 或 nineteen ninety-three）

### 先询问用户
- 同形异音词（live、read、lead、wind、tear）
- 姓名（确认偏好的发音）
- 存在地区发音差异的单词（data、either、route）

---

## 输出格式

### 更新曲目文件

如果提供了曲目文件，请更新以下部分：

**发音说明**（添加表格）：
```markdown
| Word/Phrase | Phonetic | Notes |
|-------------|----------|-------|
| Jose Diaz | Ho-say Dee-ahz | Spanish name |
| live | lyve | Verb form (to reside) |
| SQL | S-Q-L | Spell out |
```

**歌词框**（应用修正）：
在 Suno 歌词部分中，将标准拼写替换为音标式拼写。

### 独立报告

```
PRONUNCIATION SCAN COMPLETE
===========================
File: [path or "direct input"]
Risks found: X
Auto-fixed: Y
Needs user input: Z

FIXES APPLIED:
- "SQL" → "S-Q-L" (line V1:3)
- "Linux" → "Lin-ucks" (line V2:5)

NEEDS USER INPUT:
- "live" (line C:1) - lyve or liv?

CLEAN LYRICS:
[Full lyrics with all fixes applied]
```

---

## 添加自定义发音

当你发现用户内容中特有的新发音问题时：

**添加到 OVERRIDE 指南**（`{overrides}/pronunciation-guide.md`）：
1. 读取配置以获取 `paths.overrides` 位置
2. 检查 `{overrides}/pronunciation-guide.md` 是否存在
3. 如果文件不存在，则创建该文件（包含标题和表格结构）
4. 将单词添加到适当的部分（艺人术语、专辑名称等）
5. 包括：单词、标准拼写、音标式拼写、备注

**示例条目：**
```markdown
| Larocca | larocca | Luh-rock-uh | Character in "sample-album" album |
```

**不要**编辑基础指南（`${CLAUDE_PLUGIN_ROOT}/reference/suno/pronunciation-guide.md`）——插件更新会覆盖它。

**何时添加：**
- 艺人姓名、专辑标题、曲目标题
- 纪实/叙事专辑中的角色姓名
- 专辑内容中特有的地名
- 制作过程中发现的任何发音

这样可确保发现的内容与音乐内容一起在覆盖目录中进行版本控制。

---

## 请记住

1. **开始时加载两份指南**——基础指南 + 覆盖指南（如果存在）
2. **同形异音词是雷区**——live、read、lead、wind 如果不修正，必然会被错误发音
3. **技术术语需要音标式拼写**——不要相信 Suno 能正确处理首字母缩略词
4. **非英文姓名始终需要辅助**——必须提供音标式拼写
5. **数字很棘手**——将其拼写出来或使用撇号
6. **如有疑问，请询问**——澄清总比重新生成好
7. **将新发现添加到 OVERRIDE 指南**——切勿编辑基础指南（插件会将其覆盖）