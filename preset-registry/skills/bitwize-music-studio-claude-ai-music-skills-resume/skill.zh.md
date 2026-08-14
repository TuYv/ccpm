---
name: resume
description: Finds an album by name and shows detailed status with next steps. Use when the user mentions an album name or wants to continue previous work.
argument-hint: <album-name>
model: sonnet
effort: low
allowed-tools:
  - Read
  - Glob
  - Bash
  - bitwize-music-mcp
---
# 继续专辑工作

**目的**：找到一个专辑，并从上次中断的地方继续工作。

**用法**：
```
/bitwize-music:resume <album-name>
/bitwize-music:resume my-album
/bitwize-music:resume "demo album"
```

**何时使用**：当用户希望继续处理现有专辑时。

---

## 说明

使用专辑名称调用此技能时：

### 第 1 步：通过 MCP 查找专辑

1. 调用 `find_album(name)`——按名称、slug 或部分内容进行模糊匹配（不区分大小写）
2. 如果未找到：MCP 会返回可用专辑——建议最接近的匹配项或 `/bitwize-music:new-album`
3. 如果有多个匹配项：列出所有匹配项及其路径，并询问用户选择哪一个
4. 如果 MCP 返回缓存过期/缺失错误：调用 `rebuild_state()`，然后重试

### 第 2 步：获取专辑进度

1. 调用 `get_album_progress(album_slug)`——返回按状态统计的曲目数量、完成百分比和检测到的工作流阶段
2. 调用 `list_tracks(album_slug)`——返回每首曲目的详细信息（状态、has_suno_link、sources_verified）

### 第 3 步：更新会话上下文

调用 `update_session(album=album_slug, phase=detected_phase)`，设置当前专辑和阶段。

### 第 4 步：确定当前阶段

根据专辑和曲目状态，确定工作流阶段：

| 专辑状态 | 曲目状态 | 当前阶段 |
|--------------|----------------|---------------|
| 构思中 | 大多数为“未开始” | 规划——需要填写专辑 README 并创建曲目 |
| 研究完成 | 部分为“来源待确认” | 验证——需要人工验证来源（纪实类专辑） |
| 来源已验证 | 所有来源均已验证 | 可以开始创作——来源已确认，可以开始创作歌词（纪实类专辑） |
| 进行中 | 状态混合，部分为“未开始” | 创作——需要完成歌词（或将器乐曲目交由 suno-engineer 处理） |
| 进行中 | 部分为“来源待确认” | 验证——需要人工验证来源 |
| 进行中 | 所有曲目均有歌词 | 可以开始生成——运行“可以开始生成”检查点 |
| 进行中 | 部分为“已生成” | 生成中——继续在 Suno 上生成。检查生成日志，找出需要重新生成的被拒曲目 |
| 进行中 | 全部为“已生成”，没有“最终版” | 审听与批准——试听已生成的曲目，用 ✓ 标记保留曲目，并重新生成被拒曲目 |
| 已完成 | 全部为“最终版” | 母带处理——可以开始处理音频母带 |
| 已发行 | 全部为“最终版” | 已发行——专辑已上线 |

**注意**：非纪实类专辑会跳过 `Research Complete` 和 `Sources Verified`——它们会直接从 `Concept` → `In Progress`。

### 第 5 步：向用户报告

提供清晰的状态报告：

```
📁 Album: [Album Title]
   Location: {content_root}/artists/{artist}/albums/{genre}/{album}/
   Status: [Album Status]

📊 Progress:
   - Tracks: [X completed / Y total] ([N vocal, M instrumental])
   - Not Started: X
   - In Progress: Y
   - Generated: Z
   - Final: N

📍 Current Phase: [Phase Name]

✅ What's Done:
   - [List completed items]

⏭️ Next Steps:
   1. [Specific action 1]
   2. [Specific action 2]
   3. [Specific action 3]

Ready to continue? Tell me what you'd like to work on.
```

### 第 6 步：推荐唯一最佳的下一步操作

从下面的决策树中选择**一个**明确的建议。不要列出 5 个选项——选择最佳选项，包含技能名称，并明确指出具体曲目。

**决策树**（从上到下进行判断，第一个匹配项优先）：

**纯器乐检测**：检查每首曲目的 frontmatter 中是否包含 `instrumental: true`，或 Track Details 表中是否包含 `**Instrumental** | Yes`。纯器乐曲目会完全跳过歌词工作流，直接进入 `/bitwize-music:suno-engineer`。

```
Album Status = "Concept"
  → "Define the album concept. Run /bitwize-music:album-conceptualizer"

Album Status = "Research Complete"
  → Any tracks Sources Pending?
    YES → "Sources need verification. Run /bitwize-music:verify-sources [album]"
    NO  → Any "Not Started" tracks instrumental?
      YES → "Create Style Box for instrumental track [name]. Use /bitwize-music:suno-engineer"
      NO  → "Ready to write! Pick a track and use /bitwize-music:lyric-writer"

Album has tracks with "Not Started"
  → Is the first not-started track instrumental?
    YES → "Create Style Box for [track]. Use /bitwize-music:suno-engineer directly (instrumental track)"
    NO  → "Write lyrics for [first not-started track]. Use /bitwize-music:lyric-writer"

Album has tracks with "In Progress" (lyrics partially written)
  → "Finish lyrics for [first in-progress track]. Use /bitwize-music:lyric-writer"

Album has tracks with "Sources Pending"
  → "Verify sources for [track]. Run /bitwize-music:verify-sources [album]"

All tracks have lyrics (or Style Box for instrumentals), none generated
  → Mixed album (vocal + instrumental)?
    YES → "All tracks ready! Run /bitwize-music:pronunciation-specialist on vocal tracks, then /bitwize-music:lyric-reviewer, then /bitwize-music:pre-generation-check to validate all gates (instrumental tracks auto-skip lyrics gates)."
    NO  → "All lyrics complete! Style prompts should be ready. Run /bitwize-music:pronunciation-specialist to check for pronunciation risks, then /bitwize-music:lyric-reviewer for final QC, then /bitwize-music:pre-generation-check to validate all gates before generating on Suno."

Some tracks generated, some not
  → Any Generated tracks without ✓ in Generation Log Rating?
    YES → "Track [name] was generated but not approved. Listen and decide:
           - Happy? Mark ✓ in Generation Log and set Status: Final
           - Not happy? Log the reason, then:
             Style issue → /bitwize-music:suno-engineer to revise Style Box
             Lyrics issue → /bitwize-music:lyric-writer to fix, then regenerate
             Bad luck → Regenerate on Suno with same settings (it's non-deterministic)"
    NO  → "Generate [first un-generated track] on Suno. Use /bitwize-music:suno-engineer"

All tracks generated, none Final
  → "All tracks generated! Listen to each track and approve:
     - Mark keepers with ✓ in Generation Log Rating column
     - Reject and regenerate any that don't meet quality standards
     - Once all have ✓, batch-approve:
       Use update_track_field(album_slug, track_slug, 'status', 'Final') for each approved track.
       Once all Final, album advances to Complete automatically."

All tracks generated, some Final
  → Any Generated (non-Final) tracks without ✓?
    YES → "Review track [name] — listen and approve (✓) or regenerate"
    NO  → "All tracks approved! Batch-approve: update_track_field(album_slug, track_slug, 'status', 'Final') for each.
           Then import audio with /bitwize-music:import-audio, then master with /bitwize-music:mastering-engineer"

All tracks Final
  → "All tracks approved! Import audio with /bitwize-music:import-audio, then master with /bitwize-music:mastering-engineer"

Album Status = "Complete"
  → "Album is complete! Release with /bitwize-music:release-director"

Album Status = "Released"
  → "This album is released! Consider /bitwize-music:promo-director for promotional content"
  → Also suggest: "Start a new album? Check /bitwize-music:album-ideas list"
```

**按以下格式给出建议：**
```
RECOMMENDED NEXT ACTION:
  [Clear, specific instruction with skill name and track name]

WHY:
  [One sentence explaining why this is the right next step]
```

### 未指定专辑时（无参数）

如果调用时未提供专辑名称：
1. 调用 `get_session()`——检查会话上下文中的 `last_album`，并继续处理该专辑
2. 如果没有会话上下文，调用 `list_albums()` 查找所有正在进行中的专辑
3. 优先级：最接近完成 > 未受阻的工作 > 最近处理过的专辑
4. 如果不存在任何专辑，建议使用 `/bitwize-music:new-album`

如果有多个专辑正在进行，请提供多专辑摘要：
```
You have X albums. Here's the most actionable:

PRIORITY 1: [album-name] ([genre])
  Status: [status] | Progress: [X/Y tracks]
  → [Recommended action]

Also in progress:
  - [album-2] — [brief status]
```

---

## 示例

### 示例 1：处于歌词创作阶段的专辑

```
/bitwize-music:resume my-album

📁 Album: My Album
   Location: ~/bitwize-music/artists/bitwize/albums/rock/my-album/
   Status: In Progress

📊 Progress:
   - Tracks: 3 completed / 8 total
   - Not Started: 3
   - In Progress: 2
   - Final: 3

📍 Current Phase: Writing Lyrics

✅ What's Done:
   - Tracks 1-3 have final lyrics
   - Album concept and tracklist defined

⏭️ Next Steps:
   1. Complete lyrics for Track 4 (in progress)
   2. Complete lyrics for Track 5 (in progress)
   3. Write lyrics for Tracks 6-8

Ready to continue? Tell me which track you'd like to work on.
```

### 示例 2：已准备好生成的专辑

```
/bitwize-music:resume demo-album

📁 Album: Demo Album
   Location: ~/bitwize-music/artists/bitwize/albums/electronic/demo-album/
   Status: In Progress

📊 Progress:
   - Tracks: 8 / 8 total (all lyrics complete)
   - Final: 8

📍 Current Phase: Ready to Generate

✅ What's Done:
   - All 8 tracks have complete lyrics
   - All lyrics phonetically reviewed
   - Suno Style and Lyrics boxes filled

⏭️ Next Steps:
   1. Run Ready to Generate checkpoint (I'll verify everything)
   2. Start generating on Suno
   3. Log generation attempts

Shall I run the Ready to Generate checkpoint now?
```

### 示例 3：未找到专辑

```
/bitwize-music:resume my-album

❌ Album 'my-album' not found.

Available albums:
- demo-album (electronic) - In Progress
- example-tracks (hip-hop) - Complete

Did you mean one of these? Or use /bitwize-music:new-album to create a new album.
```

---

## 实现说明

- **使用 MCP 工具**——使用 `find_album`、`get_album_progress`、`list_tracks`、`update_session`，而不是直接读取 state.json
- **不区分大小写匹配**——"Sample-Album" 应匹配 "sample-album"
- **妥善处理专辑缺失的情况**——列出已有专辑，不要报错
- **明确说明后续步骤**——不要只说“继续处理”，而要准确说明具体要做什么
- **包含完整路径**——用户需要知道文件位于何处
- **谨慎使用表情符号**——仅用于报告中的章节标题

---

## 模型

使用 **Sonnet 4.5**——这是一项协调与报告任务，而非创意工作。