---
name: album-dashboard
description: Shows a structured progress dashboard for an album with percentage complete per phase, blocking items, and status breakdown. Use for a quick visual overview of album progress.
argument-hint: <album-name>
model: haiku
prerequisites:
  - resume
allowed-tools:
  - Read
  - Glob
  - Grep
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS（专辑名称）

为指定专辑生成结构化的进度仪表板。

---

# 专辑仪表板

你需要为专辑生成一份全面的进度报告，展示各工作流阶段的完成百分比、阻塞项以及结构化的状态明细。

---

## 工作流阶段

跟踪以下阶段的完成情况：

| 阶段 | 完成条件 |
|-------|-------------|
| 1. 概念 | 专辑 README 中已定义标题、流派和曲目列表 |
| 2. 研究 | RESEARCH.md 和 SOURCES.md 存在（如果基于来源） |
| 3. 来源验证 | 所有包含来源的曲目都具有 `sources_verified: Verified` 或 `N/A` |
| 4. 歌词 | 所有曲目的 Lyrics Box 中都有歌词 |
| 5. 发音 | 发音表中的所有条目都已应用于歌词 |
| 6. 审核 | 歌词已审核（不存在严重问题） |
| 7. 生成 | 所有曲目都具有 `has_suno_link: true` |
| 8. 母带处理 | `{audio_root}/artists/{artist}/albums/{genre}/{album}/` 中存在音频文件 |
| 9. 发布 | 专辑状态为 "Released" |

---

## 数据收集

### 从 MCP 服务器

1. 调用 `get_album_progress(album_slug)` — 返回完成情况统计、阶段检测结果以及按状态分类的曲目数量
2. 调用 `find_album(name)` — 返回专辑元数据（流派、状态、包含各曲目字段的曲目列表）
3. 调用 `list_track_files(album_slug)` — 返回曲目及其文件路径，用于执行任何其他检查

这三个调用取代所有手动读取 state.json 和文件 glob 操作。

---

## 仪表板格式

```
ALBUM DASHBOARD
===============

[Album Title] ([genre])
Status: [status]

PROGRESS BY PHASE
─────────────────
[============================  ] 90%  Concept
[============================  ] 90%  Research
[========================      ] 75%  Source Verification
[====================          ] 63%  Lyrics Written
[================              ] 50%  Pronunciation
[============                  ] 38%  Reviewed
[========                      ] 25%  Generated
[                              ]  0%  Mastered
[                              ]  0%  Released

OVERALL: ████████░░░░░░░░ 47% complete

TRACK STATUS BREAKDOWN
──────────────────────
| # | Track | Status | Suno | Sources |
|---|-------|--------|------|---------|
| 01 | Track One | Final | link | Verified |
| 02 | Track Two | In Progress | — | Pending |
| 03 | Track Three | Not Started | — | N/A |
...

BLOCKING ITEMS
──────────────
! Track 02: Sources pending verification — blocks generation
! Track 05: No style prompt — blocks generation
! Track 07: Pronunciation table not applied — blocks generation

SUMMARY
───────
Tracks: [X complete / Y total]
Blocking: [N items]
Next action: [recommendation]
```

---

## 阶段完成度计算

### 概念阶段
- 100%：专辑 README 包含标题，并且曲目列表中包含实际曲目名称（不是模板）
- 50%：README 存在，但曲目列表是模板占位内容
- 0%：没有 README

### 研究阶段（仅限基于来源的专辑）
- 100%：RESEARCH.md 和 SOURCES.md 均存在且包含内容
- 50%：仅存在其中一个
- N/A：专辑不基于来源（没有曲目具有 sources_verified 字段，或所有曲目的值均为 N/A）

### 来源验证阶段
- % =（`sources_verified` 为 `Verified` 或 `N/A` 的曲目数）/ 曲目总数 * 100
- 计算分母时跳过 `sources_verified` 为 `N/A` 的曲目

### 歌词阶段
- % =（包含歌词内容的曲目数）/ 曲目总数 * 100

### 生成阶段
- % =（`has_suno_link=true` 的曲目数）/ 曲目总数 * 100

### 母带处理阶段
- 检查 `{audio_root}/artists/{artist}/albums/{genre}/{album}/` 中是否存在 WAV/FLAC 文件
- % =（找到的音频文件数）/ 曲目总数 * 100

### 发行阶段
- 如果专辑状态为 `Released`，则为 100%；否则为 0%

---

## 请记住

1. **可视化进度条** — 使用 ASCII 进度条以便快速浏览
2. **突出显示阻塞项** — 阻塞项是最重要的信息
3. **包含下一步操作** — 以明确的建议结尾
4. **确保准确** — 仔细计数，不要估算
5. **妥善处理缺失数据** — 如果 `audio_root` 不存在，母带处理进度为 0%