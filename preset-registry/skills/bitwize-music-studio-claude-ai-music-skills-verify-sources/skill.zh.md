---
name: verify-sources
description: Captures human source verification for tracks, timestamps it, and updates track files. Use when sources need human review before generation.
argument-hint: <album-name>
model: sonnet
effort: low
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS（专辑名称）

引导用户完成指定专辑中所有来源待验证曲目的来源验证。

---

# 来源验证技能

你负责推动完成**人工来源验证关卡**——这是研究与生成之间的关键检查点。在人工确认所有来源均真实、可访问且表述准确之前，不得在 Suno 上生成任何曲目。

---

## 第 1 步：查找专辑

1. 调用 `find_album(name)`——通过名称、slug 或部分内容进行模糊匹配
2. 如果未找到，MCP 将返回可用专辑

## 第 2 步：识别待验证曲目

1. 调用 `get_pending_verifications(album_slug="{album}")`——返回目标专辑中待验证的曲目
2. 如果未指定专辑，则调用 `get_pending_verifications()` 获取所有专辑中的待验证曲目

如果没有待验证曲目：
```
All tracks in [album] have been verified. No action needed.
```

如果存在待验证曲目，将其列出：
```
SOURCE VERIFICATION: [Album Title]
===================================

Tracks needing verification:
  1. [track-slug] — [track-title]
  2. [track-slug] — [track-title]
  ...

Total: X tracks pending verification
```

## 第 3 步：逐一检查每首曲目

对于每首待验证曲目：

1. 调用 `extract_links(album_slug, track_slug)`——从曲目文件中提取 Markdown 链接
2. 调用 `extract_links(album_slug, "SOURCES.md")`——获取完整的引用列表
3. **读取 RESEARCH.md**（如果存在），了解证据链、置信度以及声明与来源之间的映射关系——这能让人工验证者了解每个来源应当支持*什么内容*，而不仅仅是看到 URL
4. **向用户展示来源**：

```
TRACK: [track-title]
--------------------
Sources referenced in this track:

  1. [Source Name](URL) — [brief description of what it supports]
  2. [Source Name](URL) — [brief description]
  ...

Please verify:
  - Each URL is accessible and contains the claimed information
  - No sources are fabricated or hallucinated
  - Claims in lyrics are supported by cited sources

Type "verified" to confirm, or describe any issues.
```

4. **等待用户回复**：
   - 如果回复“verified”（或等效的肯定答复）→ 更新曲目
   - 如果用户报告了问题 → 记录问题，并询问用户接下来如何处理

## 第 4 步：更新曲目文件

当用户确认某首曲目的来源已通过验证时：

1. 调用 `update_track_field(album_slug, track_slug, "sources-verified", "✅ Verified (YYYY-MM-DD)")`——更新字段并自动重新构建状态缓存
   - 使用今天的日期

2. **确认更新**：
```
✅ [track-title] — Sources verified (2025-02-06)
```

3. 继续处理下一首待验证曲目

## 第 5 步：更新专辑状态（自动推进）

处理完所有曲目后，检查是否应推进专辑状态：

1. 调用 `get_album_progress(album_slug)`——检查当前已有多少首曲目通过验证
2. **如果所有曲目均已通过验证**（不再有待验证曲目）：
   - 读取专辑 README，检查当前专辑状态
   - 如果专辑状态为 `Research Complete`：
     - 更新专辑 README：将 `| **Status** | Research Complete |` → `| **Status** | Sources Verified |`
     - 报告：“专辑状态已推进：Research Complete → Sources Verified”
   - 如果专辑状态为 `In Progress`：
     - 报告：“所有曲目来源均已通过验证。专辑状态保持为 In Progress（已经过了研究阶段）。”
3. **如果仍有部分曲目待验证**：
   - 报告剩余曲目数量及具体曲目
4. **重新构建状态缓存**：调用 `rebuild_state()`，确保 MCP 服务器拥有最新数据

5. **摘要报告**：
```
VERIFICATION COMPLETE
=====================
Album: [title]
Tracks verified: X/Y
Album status: [previous] → [new status]
Date: YYYY-MM-DD

All sources verified. This album is cleared for lyric writing.
Next step: /bitwize-music:lyric-writer [track] (write lyrics from verified sources)
```

**部分验证报告**（如果仍有部分曲目待处理）：
```
VERIFICATION PROGRESS
=====================
Album: [title]
Tracks verified this session: X
Tracks still pending: Y
  - [track-slug] — [reason if known]

Album status: unchanged ([current])
Resume verification later with /bitwize-music:verify-sources [album]
```

---

## 问题处理

如果用户报告来源存在问题：

1. **记录问题**：以注释或说明的形式记录在曲目文件中
2. **不要标记为已验证**——将状态保持为 Pending
3. **建议解决方案**：
   - 来源 URL 已失效 → “你能找到更新后的 URL 吗？”
   - 来源无法支持相关陈述 → “我们应该修改歌词，还是寻找支持该陈述的来源？”
   - 来源是捏造的 → “我会移除此来源。我们需要修改曲目吗？”
4. 问题解决后，重新提交以供验证

---

## 请记住

- **绝不自动验证**——此技能专门用于人工审核
- **清晰呈现来源**——用户需要实际检查每个 URL
- **为所有内容添加日期戳**——验证日期对审计记录非常重要
- **一次处理一首曲目**——不要仓促推进，每首曲目都很重要
- **更新状态缓存**——更改后运行索引器更新，以确保 MCP 服务器拥有最新数据