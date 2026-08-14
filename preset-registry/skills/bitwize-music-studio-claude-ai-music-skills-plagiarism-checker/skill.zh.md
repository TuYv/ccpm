---
name: plagiarism-checker
description: Scans lyrics for phrases that may match existing songs using web search and LLM knowledge. Use before release to check for unintentional borrowing.
argument-hint: <album-name> [track-slug]
model: sonnet
effort: high
allowed-tools:
  - Read
  - Glob
  - Grep
  - WebSearch
  - WebFetch
  - bitwize-music-mcp
---
## 你的任务

**目标**：$ARGUMENTS

1. 获取指定曲目的歌词
2. 使用 MCP 工具提取有辨识度的短语
3. 在网上搜索最值得关注的短语，检查是否与已知歌曲匹配
4. 使用 LLM 知识独立标记相似之处
5. 生成结构化风险报告

---

# 抄袭检查器

你需要扫描歌词中可能无意间与现有歌曲雷同的短语。这是一项质量检查，而非法律工具——它可以尽早发现借用痕迹，让创作者在发布前进行修改。

---

## 工作流程

### 第 1 步：获取歌词

- 使用 `extract_section(album_slug, track_slug, "streaming")` 获取流媒体歌词（优先使用——没有会干扰网络搜索的语音拼写）
- 如果流媒体歌词为空，则回退使用 `extract_section(album_slug, track_slug, "lyrics")` 获取 Suno 歌词
- 如果提供的是原始文本，而不是专辑/曲目引用，则直接使用该文本

### 第 2 步：提取有辨识度的短语

调用 `extract_distinctive_phrases(text, max_phrases=15, include_raw_lines=False)` MCP 工具。该工具会返回：
- 按段落优先级排序的、有辨识度的 4–7 词 n-gram（前 15 个）
- 预先格式化的搜索建议，包含带引号的短语和 "lyrics"
- 已过滤掉的常见陈词滥调

### 第 3 步：网络搜索

- 使用 WebSearch 搜索工具返回的前 10–15 条 `search_suggestions`
- 对于较短的歌词（少于 100 个单词），限制为 5–8 次搜索
- 查找提及具体歌曲名称和艺人的结果
- 跳过以下结果：
  - 列出数百条匹配结果的歌词聚合网站（过于宽泛）
  - 词典/参考资料页面
  - 用户自己已发布的作品

### 第 4 步：深入比较

对于任何提及具体歌曲的搜索结果：
1. 使用 WebFetch 获取歌词页面
2. 将匹配段落与用户的歌词进行比较
3. 检查匹配属于以下哪种情况：
   - 连续单词完全相同（5 个以上）——高风险
   - 部分重叠（4 个单词）——中风险
   - 仅主题相似——低风险

### 第 5 步：LLM 知识检查

利用你的训练知识，独立扫描歌词的所有行（不仅仅是提取出的短语）：
- 标记任何与知名歌曲歌词高度相似的行
- 包含疑似来源歌曲及艺人
- 注明相似之处是在措辞、旋律钩子乐句，还是概念方面

### 第 6 步：生成报告

---

## 风险等级

| 等级 | 判定标准 | 处理措施 |
|-------|----------|--------|
| **高** | 与已知歌曲连续匹配 5 个以上单词，尤其是在副歌/钩子部分 | 立即重写该行 |
| **中** | 与已知歌曲匹配 4 个单词，或被 LLM 标记为结构相似 | 审查并考虑改写 |
| **低** | 常见措辞重叠，可能只是巧合 | 记录以供注意，无需采取措施 |

---

## 输出格式

```
PLAGIARISM CHECK REPORT
Album: [Album Name]
Track: [Track Title]
Date: [Scan Date]

PHRASES SEARCHED: [N]
WEB MATCHES FOUND: [N]
LLM FLAGS: [N]

FINDINGS:
------------------------------------------------------------------------

[HIGH] Line 12 (Chorus): "burning shadows fall tonight across the wire"
  Match: "Shadows Fall Tonight" by [Artist] — 5 consecutive words match chorus
  Source: [URL]
  Recommendation: Rewrite this line to avoid direct overlap

[MEDIUM] Line 24 (Verse 2): "walking through the ruins of the empire"
  Similarity: Resembles "Empire" by [Artist] — similar phrasing in bridge
  Source: LLM knowledge
  Recommendation: Consider rewording if concerned

[LOW] Line 8 (Verse 1): "the city sleeps beneath the stars"
  Note: Generic night imagery, appears in many songs
  Recommendation: No action needed

------------------------------------------------------------------------

SUMMARY:
  HIGH risk findings: 1
  MEDIUM risk findings: 1
  LOW risk findings: 1

VERDICT: NEEDS REVIEW
  1 high-risk match requires attention before release.

COMMON PHRASES FILTERED: [N] (not searched — too generic to flag)
```

### 判定结果

| 判定结果 | 标准 |
|---------|----------|
| **CLEAR** | 没有 HIGH 或 MEDIUM 级别的发现 |
| **NEEDS REVIEW** | 存在任何 MEDIUM 级别的发现，或 1 项 HIGH 级别的发现 |
| **REWRITE REQUIRED** | 2 项或更多 HIGH 级别的发现 |

---

## 重要说明

- **这不是法律工具。** 它用于发现可能的借用，并不能判定版权侵权。只有律师才能判定是否构成侵权。
- **优先使用流式传入的歌词。** Suno 歌词包含表音式改写（例如用 "Seh-KYOOR-ih-tee" 表示 "security"），这会产生毫无意义的网络搜索结果。
- **常见陈词滥调已预先过滤。** MCP 工具会在返回结果前移除约 75 个随处可见的短语（"break my heart"、"falling in love" 等）。这些短语过于常见，不应标记。
- **网络搜索可能失败。** 如果 WebSearch 不可用或受到速率限制，则仅使用 LLM 知识检查继续处理，并在报告中注明此限制。
- **不要用作生成前的门禁。** 此检查速度太慢（需要进行网络搜索），且可靠性太低（取决于搜索是否可用），不应阻止生成。应在发布前运行，而不是在使用 Suno 前运行。

---

## 对完整专辑运行检查

当仅提供专辑 slug 而未指定具体曲目时：

1. 通过 `list_tracks(album_slug)` 列出所有曲目
2. 对状态为 "In Progress"、"Generated" 或 "Final" 的每首曲目运行检查
3. 跳过状态为 "Not Started" 或 "Sources Pending" 的曲目
4. 将发现汇总为一份专辑级报告，并为每首曲目设置单独的章节

---

## 调用示例

```
/plagiarism-checker dark-tide
/plagiarism-checker dark-tide 03-the-wire
```