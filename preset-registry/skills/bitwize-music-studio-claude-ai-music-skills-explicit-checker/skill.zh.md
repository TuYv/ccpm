---
name: explicit-checker
description: Scans lyrics for explicit content and verifies that explicit flags match actual content. Use before Suno generation or release to ensure accurate content ratings.
argument-hint: <album-path or track-path>
model: sonnet
effort: medium
allowed-tools:
  - Read
  - Glob
  - Grep
  - bitwize-music-mcp
---
## 你的任务

**要扫描的路径**：$ARGUMENTS

1. 扫描所有歌词中的露骨词汇
2. 报告检查结果，并按曲目统计词频
3. 标记不匹配情况（包含露骨内容但标记为 No，或反之）
4. 提供适合提交给发行商的摘要

---

# 露骨内容检查器

你需要扫描歌词中的露骨内容，以确保在发行前正确进行标记。

---

## 露骨词汇（需要 Explicit = Yes）

这些词及其变体需要设置露骨内容标记：

| 类别 | 词汇 |
|----------|-------|
| **F-word** | fuck, fucking, fucked, fucker, motherfuck, motherfucker |
| **S-word** | shit, shitting, shitty, bullshit |
| **B-word** | bitch, bitches |
| **C-words** | cunt, cock, cocks |
| **D-word** | dick, dicks |
| **P-word** | pussy, pussies |
| **A-word** | asshole, assholes |
| **侮辱性词汇** | whore, slut, n-word, f-word (slur) |
| **亵渎性用语** | goddamn, goddammit |

---

## 非露骨词汇（无需露骨内容标记）

这些词可以接受，无需设置露骨内容标记：
- damn, hell, crap, ass, bastard, piss

注意："damn" 单独使用时属于非露骨词汇，但 "goddamn" 属于露骨词汇。

---

## 覆盖规则支持

MCP `check_explicit_content` 工具会自动从 `{overrides}/explicit-words.md` 加载并合并用户覆盖规则。无需手动读取配置或编写合并逻辑——传入歌词文本即可获得已应用覆盖规则的结果。

### 覆盖规则文件格式

**`{overrides}/explicit-words.md`：**
```markdown
# Custom Explicit Words

## Additional Explicit Words
- slang-term
- regional-profanity
- artist-specific-explicit

## Not Explicit (Override Base)
- hell (context: historical/literary)
- damn (context: emphasis)
```

---

## 工作流程

### 对于专辑路径

1. 调用 `list_tracks(album_slug)`——获取所有曲目及其元数据
2. 对于每首曲目：
   - 调用 `extract_section(album_slug, track_slug, "lyrics")`——获取歌词文本
   - 调用 `check_explicit_content(lyrics_text)`——返回匹配项及其行号（自动合并覆盖规则）
   - 从曲目元数据中获取 Explicit 标记
   - 比较标记与内容
3. 生成报告

### 对于单首曲目

1. 调用 `extract_section(album_slug, track_slug, "lyrics")`——获取歌词文本
2. 调用 `check_explicit_content(lyrics_text)`——扫描露骨词汇
3. 通过 `get_track(album_slug, track_slug)` 从曲目元数据中获取 Explicit 标记
4. 报告检查结果

---

## 输出格式

```
EXPLICIT CONTENT SCAN
Album: [Album Name]
Date: [Scan Date]

TRACK RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Track 01: [Title]
  Flag: No
  Content: Clean
  Status: ✓ OK

Track 02: [Title]
  Flag: Yes
  Content: fuck (3), shit (2), bitch (1)
  Status: ✓ OK (flag matches content)

Track 03: [Title]
  Flag: No
  Content: fuck (1)
  Status: ⚠️ MISMATCH - Contains explicit content but flag is No

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY:
  Total tracks: 10
  Clean tracks: 7
  Explicit tracks: 3
  Mismatches: 1

ALBUM EXPLICIT FLAG: Yes (any track explicit = album explicit)

ACTION REQUIRED:
  - Track 03: Set Explicit flag to Yes
```

---

## 不匹配检测

### 标记为否，但内容露骨
```
⚠️ MISMATCH: Track contains explicit content but Explicit flag is "No"
ACTION: Set Explicit: Yes in track file
```

### 标记为是，但内容干净
```
ℹ️ NOTE: Track flagged explicit but no explicit words found
This is OK - artist may want explicit flag for themes/context
No action required (conservative flagging is fine)
```

---

## 发行商要求

大多数发行商（DistroKid、TuneCore、CD Baby）要求：
- **曲目级标记**：每首曲目都标记为露骨或干净
- **专辑级标记**：只要有任意一首曲目包含露骨内容，专辑就应标记为露骨
- **元数据一致**：标记必须与实际内容相符

**错误标记的后果**：
- 露骨内容标记为干净 → 可能被平台下架，并导致账户问题
- 干净内容标记为露骨 → 传播范围缩小（会被某些播放列表过滤），但不会受到处罚

**规则**：如有疑问，请标记为露骨。漏标比过度标记更糟糕。

---

## 集成

此 Skill 会在以下情况被调用：
1. **准备生成检查点** - 在使用 Suno 生成之前
2. **专辑完成检查清单** - 在发行之前
3. **手动审查** - 随时使用 `/explicit-checker [path]`

---

## 调用示例

```
/explicit-checker artists/[artist]/albums/rock/dark-tide/
/explicit-checker artists/[artist]/albums/rock/dark-tide/tracks/01-the-tank.md
```

---

## 请记住

- 匹配不区分大小写（Fuck = fuck = FUCK）
- 检查各种变体（fucking、fucked、fucker）
- 同音拼写也算（如果是有意使用的 fuk、sh1t）
- 是否出现比上下文更重要——只要出现了该词，就将其标记为露骨
- 只要有任意一首曲目包含露骨内容，专辑就应标记为露骨
- **覆盖添加项** - 添加特定于艺术家/流派的露骨词语
- **覆盖移除项** - 针对特定上下文（历史、文学）移除词语