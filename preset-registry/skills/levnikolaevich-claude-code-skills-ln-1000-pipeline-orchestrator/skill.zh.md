---
name: ln-1000-pipeline-orchestrator
description: "Drives a Story through full pipeline (tasks, validation, execution, quality). Use when executing a Story end-to-end from kanban board."
disable-model-invocation: true
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L1 编排器  
**类别：** 1000 流水线

# 流水线编排器

通过在单一上下文中以 Skill() 调用的方式调用协调器，并根据协调器阶段产物推进流程，驱动选定的用户故事完成整个流水线（任务规划 -> 验证 -> 执行 -> 质量门禁）。

## 目的与范围
- 解析看板并显示可供用户选择的用户故事
- 在执行前分一批一次性提出所有业务问题；自主做出技术决策
- 驱动选定的用户故事依次完成 4 个阶段：ln-300 -> ln-310 -> ln-400 -> ln-500
- 在每个阶段结束后写入阶段说明和检查点，以便报告和恢复
- 处理失败、重试、返工周期以及向用户升级问题
- 生成包含分支名称、git 统计信息和代理审查信息的流水线报告

## 层级结构

```
L0: ln-1000-pipeline-orchestrator (sequential Skill calls, single context)
  +-- Skill("ln-300") — task decomposition (internally manages stateful task-plan workers)
  +-- Skill("ln-310") — validation (internally launches configured external review agents when available)
  +-- Skill("ln-400") — execution (internally dispatches stateful task workers)
  +-- Skill("ln-500") — quality gate (internally runs artifact-first ln-510/ln-520, verdict, finalization)
```

**关键原则：** ln-1000 通过 Skill 工具调用协调器。每个协调器管理自己的内部工作器调度，并生成阶段产物。ln-1000 不会修改现有技能——它会完全按照人工操作员的调用方式来调用这些技能，并将协调器产物视为阶段完成的主要信号。

## 任务存储模式

**必须阅读：** 加载 `references/environment_state_contract.md` 和 `references/storage_mode_detection.md`

提取：`task_provider` = 任务管理 -> 提供方（`linear` | `file`）。

## 使用场景
- 有一个用户故事已准备好处理——由用户选择具体的用户故事
- 需要端到端自动化：任务规划 -> 验证 -> 执行 -> 质量门禁
- 希望通过流水线报告对用户故事的处理进行可控管理

## 流水线：四阶段状态机

**必须阅读：** 加载 `references/pipeline_states.md`，了解转换规则和守卫条件。  
**必须阅读：** 加载 `references/loop_health_contract.md`

```
Backlog       --> Stage 0 (ln-300) --> Backlog      --> Stage 1 (ln-310) --> Todo
(no tasks)        create tasks         (tasks exist)      validate            |
                                                          | NO-GO             |
                                                          v                   v
                                                       [retry/ask]    Stage 2 (ln-400)
                                                                             |
                                                                             v
                                                                      To Review
                                                                             |
                                                                             v
                                                                      Stage 3 (ln-500)
                                                                       |          |
                                                                      PASS       FAIL
                                                                       |          v
                                                                      Done    To Rework -> Stage 2
                                                               (branch pushed)  (max 2 cycles)
```

| 阶段 | Skill | 输入状态 | 输出状态 |
|-------|-------|-------------|--------------|
| 0 | ln-300-task-coordinator | Backlog（无任务） | Backlog（已创建任务） |
| 1 | ln-310-multi-agent-validator | Backlog（存在任务） | Todo |
| 2 | ln-400-story-executor | Todo / To Rework | To Review |
| 3 | ln-500-story-quality-gate | To Review | Done / To Rework |

## 工作流

### 阶段 0：恢复检查

```
PIPELINE="{skill_repo}/ln-1000-pipeline-orchestrator/scripts/cli.mjs"
recovery = Bash: node $PIPELINE status

IF recovery.active == true:
  # Previous run interrupted — resume from CLI state
  1. Extract: story_id, stage, resume_action from recovery JSON
  2. Read already-written stage artifacts and runtime state
  3. Re-read kanban board -> secondary verification only
  4. IF recovery.state.worktree_dir exists: cd {recovery.state.worktree_dir}
  5. Jump to Phase 4, starting from resume_action

IF recovery.active == false:
  # Fresh start — proceed to Phase 1
```

### 阶段 1：发现、看板解析与 Story 选择

**必须阅读：**加载 `references/kanban_parser.md` 以了解解析模式。

1. 自动发现 `docs/tasks/kanban_board.md`（或通过存储模式操作使用 Linear API）
2. 从目标项目的 CLAUDE.md（而非 skills 仓库）中提取项目简介：
   ```
   project_brief = {
     name: <from H1 or first line>,
     tech: <from Development Commands / tech references>,
     type: <inferred: "CLI", "API", "web app", "library">,
     key_rules: <2-3 critical rules>
   }
   IF not found: project_brief = { name: basename(project_root), tech: "unknown" }
   ```
3. 解析所有状态部分：Backlog、Todo、In Progress、To Review、To Rework
4. 提取 Story 列表，包括：ID、标题、状态、Epic 名称、是否存在任务
5. 筛选：跳过处于 Done、Postponed、Canceled 状态的 Story
6. 检测每个 Story 是否存在任务：
   - 包含 `_(tasks not created yet)_` -> **无任务** -> 阶段 0
   - 包含任务行（缩进 4 个空格）-> **存在任务** -> 阶段 1+
7. 确定每个 Story 的目标阶段（参见 `references/pipeline_states.md` 中的阶段到状态映射）
8. 显示可用的 Story，并要求用户选择一个：
   ```
   Project: {project_brief.name} ({project_brief.tech})

   Available Stories:
   | # | Story | Status | Stage | Skill | Epic |
   |---|-------|--------|-------|-------|------|
   | 1 | PROJ-42: Auth endpoint | To Review | 3 | ln-500 | Epic: Auth |
   | 2 | PROJ-55: CRUD users | Backlog (no tasks) | 0 | ln-300 | Epic: Users |
   | 3 | PROJ-60: Dashboard | Todo | 2 | ln-400 | Epic: UI |

   AskUserQuestion: "Which story to process? Enter # or Story ID."
   ```
9. 存储所选 Story。仅提取所选 Story 的简介：
   ```
   description = tracker getStory(selected_story.id).body  // provider-specific transport per tracker_provider_contract.md
   story_briefs[id] = parse <!-- ORCHESTRATOR_BRIEF_START/END --> markers
   IF no markers: story_briefs[id] = { tech: project_brief.tech, keyFiles: "unknown" }
   ```

### 阶段 2：执行前问题（一次性提出）

1. 加载所选 Story 的描述（仅元数据）
2. 扫描业务歧义——即符合以下条件的问题：
   - 无法从代码库、文档或标准中找到答案
   - 答案需要业务/产品决策（支付服务商、身份验证流程、UI 偏好）
3. 将所有业务问题汇总到单个 AskUserQuestion 中
4. 技术问题——使用 `project_brief` 解决：
   - 库版本：MCP Ref / Context7（针对 `project_brief.tech` 生态系统）
   - 架构模式：`project_brief.key_rules`
   - 标准合规性：由 ln-310 阶段 2 处理

如果未发现业务问题，**跳过阶段 2**。直接进入阶段 3。

### 阶段 3：流水线设置

#### 3.0 Linear 状态缓存（仅限 Linear 模式）

```
IF storage_mode == "linear":
  statuses = list_issue_statuses(teamId=team_id)
  status_cache = {status.name: status.id FOR status IN statuses}

  REQUIRED = ["Backlog", "Todo", "In Progress", "To Review", "To Rework", "Done"]
  missing = [s for s in REQUIRED if s not in status_cache]
  IF missing: ABORT "Missing Linear statuses: {missing}. Configure workflow."
```

#### 3.1 预检：设置验证

验证目标项目中的 `.claude/settings.local.json`：
- `defaultMode` = `"bypassPermissions"`（协调器生成的 Agent 工作器需要此设置）

#### 3.2 Worktree 隔离

**必须阅读：**加载 `references/git_worktree_fallback.md`

```
branch_check = git branch --show-current
IF branch_check matches feature/* / optimize/* / upgrade/* / modernize/*:
  worktree_dir = CWD
  project_root = CWD
  branch = branch_check
ELSE:
  story_slug = slugify(selected_story.title)
  branch = "feature/{selected_story.id}-{story_slug}"
  worktree_dir = ".hex-skills/worktrees/story-{selected_story.id}"
  project_root = CWD

  changes = git diff HEAD
  IF changes not empty:
    git diff HEAD > .hex-skills/pipeline/carry-changes.patch

  git fetch origin
  base_branch = detect per references/git_scope_detection.md §Base Branch Detection
  git worktree add -b {branch} {worktree_dir} origin/{base_branch}

  IF .hex-skills/pipeline/carry-changes.patch exists:
    git -C {worktree_dir} apply .hex-skills/pipeline/carry-changes.patch && rm .hex-skills/pipeline/carry-changes.patch
    IF apply fails: WARN user "Patch conflicts -- continuing without uncommitted changes"

  cd {worktree_dir}    # All subsequent Skill calls inherit this CWD
```

协调器在启动时自行检测 `feature/*` -> 跳过其自身的 worktree 创建（ln-400 阶段 1 步骤 5）。

#### 3.3 初始化流水线状态

```
Bash: node $PIPELINE start \
  --story {selected_story.id} \
  --title "{selected_story.title}" \
  --storage {storage_mode} \
  --project-brief '{JSON.stringify(project_brief)}' \
  --story-briefs '{JSON.stringify(story_briefs)}' \
  --business-answers '{JSON.stringify(business_answers)}' \
  --status-cache '{JSON.stringify(status_cache)}' \
  --skill-repo-path "{skill_repo}" \
  --worktree-dir "{worktree_dir}" \
  --branch-name "{branch}"

IF result.recovery == true:
  # Active run found — resume instead of fresh start
  Jump to Phase 4 using result.state
```

#### 3.4 防止休眠（仅限 Windows）

```
IF platform == "win32":
  Bash: cp {skill_repo}/ln-1000-pipeline-orchestrator/references/scripts/hooks/prevent-sleep.ps1 .hex-skills/pipeline/prevent-sleep.ps1
  Bash: powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File .hex-skills/pipeline/prevent-sleep.ps1 &
  sleep_prevention_pid = $!
```

### 阶段 4：流水线执行

**必须阅读：** 加载 `references/phases/phase4_flow.md`，了解 ASSERT 守卫、阶段说明、上下文恢复和错误处理。
**必须阅读：** 加载 `references/checkpoint_format.md`，了解检查点模式。

```
# --- INITIALIZATION ---
id = selected_story.id
target_stage = determine_stage(selected_story)    # pipeline_states.md / guards.mjs

# --- PROGRESS TRACKER (survives compaction) ---
TodoWrite([
  {content: "Stage 0: Task Decomposition (ln-300)", status: "pending", activeForm: "Decomposing tasks"},
  {content: "Stage 1: Validation (ln-310)", status: "pending", activeForm: "Validating story"},
  {content: "Stage 2: Execution (ln-400)", status: "pending", activeForm: "Executing tasks"},
  {content: "Stage 3: Quality Gate (ln-500)", status: "pending", activeForm: "Running quality gate"},
  {content: "Pipeline Report + Cleanup", status: "pending", activeForm: "Generating report"}
])

# --- STAGE 0: Task Decomposition ---
IF target_stage <= 0:
  Bash: node $PIPELINE advance --story {id} --to STAGE_0
  Skill(skill: "ln-300-task-coordinator", args: "{id}")
  Read Stage 0 coordinator artifact -> Bash: node $PIPELINE record-stage-summary --story {id} --payload '{...}'
  ASSERT Stage 0 artifact: status=completed, stage=0
  IF ASSERT fails: Bash: node $PIPELINE record-loop-health --story {id} --stage 0 --payload '{"error":"Stage 0 ASSERT failed","progress_detected":false}'
  Re-read kanban only as secondary assertion
  IF ASSERT fails: Bash: node $PIPELINE pause --story {id} --reason "Stage 0 artifact missing or invalid"; ESCALATE
  Write stage notes: .hex-skills/pipeline/stage_0_notes_{id}.md (Key Decisions, Artifacts)
  Bash: node $PIPELINE checkpoint --story {id} --stage 0 --plan-score {score} --tasks-remaining '{JSON tasks}' --last-action "Tasks created"

# --- STAGE 1: Validation ---
IF target_stage <= 1:
  Bash: node $PIPELINE advance --story {id} --to STAGE_1
  IF advance fails (guard rejection): handle per error.recovery
  Skill(skill: "ln-310-multi-agent-validator", args: "{id}")
  Read Stage 1 coordinator artifact -> Bash: node $PIPELINE record-stage-summary --story {id} --payload '{...}'
  ASSERT artifact verdict = GO and readiness_score >= 5
  IF NO-GO:
    Bash: node $PIPELINE advance --story {id} --to STAGE_1    # retry (guard auto-increments validation_retries)
    IF advance fails: Bash: node $PIPELINE pause --story {id} --reason "Validation retry exhausted"; ESCALATE
    Skill(skill: "ln-310-multi-agent-validator", args: "{id}")    # retry
    Read retry Stage 1 artifact -> Bash: node $PIPELINE record-stage-summary --story {id} --payload '{...}'
  IF same ASSERT failure repeats without new Stage 1 artifact/checkpoint/status evidence:
    Bash: node $PIPELINE record-loop-health --story {id} --stage 1 --payload '{"error":"Stage 1 ASSERT failed","progress_detected":false}'
    IF result.pause.pause == true: ESCALATE using result.state.paused_reason
  Re-read kanban only as secondary assertion
  IF still NOT Todo: Bash: node $PIPELINE pause --story {id} --reason "Validation artifact or status invalid"; ESCALATE
  Extract agents_info from Stage 1 artifact metadata or review runtime state
  Write stage notes: .hex-skills/pipeline/stage_1_notes_{id}.md (Verdict, Agent Review, Key Decisions)
  Bash: node $PIPELINE checkpoint --story {id} --stage 1 --verdict {verdict} --readiness {score} --agents-info "{agents}" --last-action "Validated"

# --- COMPACTION RECOVERY (replaces old COMPACTION GUARD) ---
# If context compacted and vars lost: Bash: node $PIPELINE status --story {id}
# Extract resume_action from JSON -> continue from there. No manual JSON reads needed.

# --- STAGE 2+3 LOOP (rework cycle, managed by CLI guards) ---
WHILE true:

  # STAGE 2: Execution
  IF target_stage <= 2 OR (status shows rework cycle):
    Bash: node $PIPELINE advance --story {id} --to STAGE_2
    IF advance fails: Bash: node $PIPELINE pause --story {id} --reason "{error}"; ESCALATE; BREAK
    Skill(skill: "ln-400-story-executor", args: "{id}")
    Read Stage 2 coordinator artifact -> Bash: node $PIPELINE record-stage-summary --story {id} --payload '{...}'
    ASSERT artifact story_status = To Review
    IF ASSERT fails: Bash: node $PIPELINE record-loop-health --story {id} --stage 2 --payload '{"error":"Stage 2 ASSERT failed","progress_detected":false}'
    Re-read kanban only as secondary assertion
    IF ASSERT fails: Bash: node $PIPELINE pause --story {id} --reason "Stage 2 artifact missing or invalid"; ESCALATE; BREAK
    git_stats = parse `git diff --stat origin/{base_branch}..HEAD`
    Write stage notes: .hex-skills/pipeline/stage_2_notes_{id}.md (Key Decisions, Git commits)
    Bash: node $PIPELINE checkpoint --story {id} --stage 2 --tasks-completed '{JSON done}' --git-stats '{JSON stats}' --last-action "Implementation complete"

  # STAGE 3: Quality Gate (IMPOSSIBLE TO SKIP — next line after Stage 2)
  Bash: node $PIPELINE advance --story {id} --to STAGE_3
  Skill(skill: "ln-500-story-quality-gate", args: "{id}")
  Read Stage 3 coordinator artifact -> Bash: node $PIPELINE record-stage-summary --story {id} --payload '{...}'
  IF repeated identical quality FAIL has no new artifact/task/code delta:
    Bash: node $PIPELINE record-loop-health --story {id} --stage 3 --payload '{"error":"Stage 3 repeated quality FAIL","progress_detected":false}'
    IF result.pause.pause == true: ESCALATE using result.state.paused_reason
  Extract quality verdict, score, agents_info from Stage 3 artifact
  Re-read kanban only as secondary assertion
  Write stage notes: .hex-skills/pipeline/stage_3_notes_{id}.md (Verdict, Score, Agent Review, Branch)
  Bash: node $PIPELINE checkpoint --story {id} --stage 3 --verdict {verdict} --quality-score {score} --agents-info "{agents}" --last-action "Quality gate: {verdict}"

  IF Story status = Done:
    Bash: node $PIPELINE advance --story {id} --to DONE
    BREAK

  IF Story status = To Rework:
    Read Stage 3 artifact `metadata.rework_hint` for blocking_categories and suggested_focus
    Bash: node $PIPELINE advance --story {id} --to STAGE_2    # guard auto-increments quality_cycles
    IF advance fails (quality_cycles >= 2):
      Bash: node $PIPELINE pause --story {id} --reason "Quality gate failed 2 times"
      ESCALATE: "Quality gate failed after max cycles. Manual review needed."
      BREAK
    # Pass rework focus to ln-400:
    Skill(skill: "ln-400-story-executor", args: "{id} --rework-focus {blocking_categories}")
    CONTINUE

  Bash: node $PIPELINE pause --story {id} --reason "Unexpected Stage 3 outcome"
  ESCALATE: "Story ended Stage 3 in unexpected status. Manual review needed."
  BREAK
```

### 停止条件（质量周期）

| 条件 | 操作 |
|-----------|--------|
| 所有任务均为 Done + Story = Done | 停止 — 故事已成功完成 |
| `quality_cycles >= 2` | 停止 — 升级处理："质量门禁在达到最大周期数后仍失败。需要人工审查。" |
| 验证重试失败（重试后仍为 NO-GO） | 停止 — 升级处理：请用户指示后续操作 |
| 阶段 2 的前置条件失败 | 停止 — 升级处理："阶段 2 未完成，需要人工干预" |
| 同一阶段的 ASSERT 失败在没有新证据的情况下重复发生 | 停止 — 运行时 `record-loop-health` 会暂停流水线，并给出可操作的原因 |

### 阶段 5：清理与报告

```
# 0. Signal pipeline complete
pre_cleanup_status = Bash: node $PIPELINE status --story {id}
IF pre_cleanup_status.state.phase != "DONE":
  Bash: node $PIPELINE advance --story {id} --to DONE
```

# 1. 根据完成定义进行自我验证
status = Bash: node $PIPELINE status --story {id}
final_state = status.state.phase OR "DONE"
verification = {
  story_selected:   status.state.story_id == id
  story_processed:  final_state IN ("DONE", "PAUSED")
}
IF ANY verification == false: WARN user with details

# 2. 读取阶段备注
stage_notes = {}
FOR N IN 0..3:
  IF .hex-skills/pipeline/stage_{N}_notes_{id}.md exists:
    stage_notes[N] = read file content
  ELSE:
    stage_notes[N] = "(未记录备注)"

# 3. 提取分支信息
branch_name = git branch --show-current
git_stats_final = git diff --stat origin/{base_branch}..HEAD（如果尚未获取）

# 4. 完善流水线报告
durations = {N: stage_timestamps.stage_{N}_end - stage_timestamps.stage_{N}_start
             FOR N IN 0..3 IF both timestamps exist}

写入 docs/tasks/reports/pipeline-{date}.md：

  # 流水线报告 -- {date}

  **故事：** {id} -- {title}
  **分支：** {branch_name}
  **最终状态：** {final_state}
  **耗时：** {now() - pipeline_start_time}

  ## 任务规划 (ln-300)
  | 任务 | 计划评分 | 耗时 |
  |-------|-----------|----------|
  | 已创建 {N} 个 | {score}/4 | {durations[0]} |

  {stage_notes[0]}

  ## 验证 (ln-310)
  | 结论 | 就绪度 | 智能体审查 | 耗时 |
  |---------|-----------|-------------|----------|
  | {verdict} | {score}/10 | {agents_info} | {durations[1]} |

  {stage_notes[1]}

  ## 实现 (ln-400)
  | 状态 | 文件 | 行数 | 耗时 |
  |--------|-------|-------|----------|
  | {result} | {files_changed} | +{added}/-{deleted} | {durations[2]} |

  {stage_notes[2]}

  ## 质量门禁 (ln-500)
  | 结论 | 评分 | 智能体审查 | 返工 | 耗时 |
  |---------|-------|-------------|--------|----------|
  | {verdict} | {score}/100 | {agents_info} | {quality_cycles} | {durations[3]} |

  {stage_notes[3]}

  ## 流水线指标
  | 实际耗时 | 返工周期 | 验证重试次数 |
  |------------|--------------|-------------------|
  | {total_duration} | {quality_cycles} | {validation_retries} |

# 5. 向用户显示流水线摘要
流水线已完成：
| 故事 | 分支 | 规划 | 验证 | 实现 | 质量门禁 | 状态 |
|-------|--------|----------|------------|----------------|-------------|-------|
| {id} | {branch} | {stage0} | {stage1} | {stage2} | {stage3} | {final_state} |

报告已保存至：docs/tasks/reports/pipeline-{date}.md

# 6. 清理工作树
cd {project_root}
IF final_state == "PAUSED" AND worktree_dir exists AND worktree_dir != project_root:
  git -C {worktree_dir} add -A
  git -C {worktree_dir} commit -m "WIP: {id} pipeline paused" --allow-empty
  git -C {worktree_dir} push -u origin {branch}
  git worktree remove {worktree_dir} --force
  Display: "部分工作已保存至远程分支 {branch}。工作树已清理。"
IF final_state == "DONE" AND worktree_dir exists AND worktree_dir != project_root:
  # ln-500 已在阶段 7 中提交并推送。仅清理工作树。
  git worktree remove {worktree_dir} --force

# 7. Stop sleep prevention (Windows)
IF sleep_prevention_pid:
  kill $sleep_prevention_pid 2>/dev/null || true

# 8. Remove pipeline state files
Delete .hex-skills/pipeline/ directory

# 9. Report results location to user
```

## 将协调器产物作为编排事实依据

- 每个阶段完成后，**首先读取协调器产物**。绝不将文字输出视为完成情况的事实依据
- 每个阶段后重新读取看板，仅将其作为预期状态转换的辅助断言
- 协调器（ln-300/310/400/500）通过自身逻辑更新 Linear/看板。负责人先验证产物，然后检查看板一致性
- **更新算法：**按照 `references/kanban_update_algorithm.md` 进行 Epic 分组和缩进

## 错误处理

| 情况 | 检测方式 | 操作 |
|-----------|----------|--------|
| ln-300 任务创建失败 | Skill 返回错误 | 向用户上报：“无法为 Story {id} 创建任务” |
| ln-310 NO-GO（分数 <5） | 阶段 1 产物裁定 != GO | 重试一次。如果仍为 NO-GO -> 询问用户 |
| 任务进入 To Rework 3 次以上 | ln-400 报告返工循环 | 上报：“任务 X 已返工 3 次，需要提供意见” |
| ln-500 FAIL | 阶段 3 产物裁定 = FAIL | 由 ln-500 自动创建修复任务。重新进入阶段 2。最多进行 2 个质量周期 |
| Skill 调用错误 | Skill() 抛出异常 | `node $PIPELINE status` -> 重新调用同一个 Skill（运行时状态和产物会处理恢复） |
| 上下文压缩 | PostCompact hook 或手动检测 | `node $PIPELINE status` -> 提取 resume_action -> 继续 |

## Worker 调用（强制）

**宿主 Skill 调用：**必须通过 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能工作流，然后携带其结果/产物返回此处。
- 不要内联 Worker 逻辑，也不要在未执行目标技能的情况下将 Worker 标记为完成。

| 阶段 | Skill | 调用方式 |
|-------|-------|------------|
| 0 | ln-300-task-coordinator | `Skill(skill: "ln-300-task-coordinator", args: "{id}")` |
| 1 | ln-310-multi-agent-validator | `Skill(skill: "ln-310-multi-agent-validator", args: "{id}")` |
| 2 | ln-400-story-executor | `Skill(skill: "ln-400-story-executor", args: "{id}")` |
| 3 | ln-500-story-quality-gate | `Skill(skill: "ln-500-story-quality-gate", args: "{id}")` |

## TodoWrite 格式（强制）

```text
- Phase 1: Resolve Story and business context (pending)
- Phase 2: Ask targeted business questions only if needed (pending)
- Phase 3: Setup pipeline runtime and worktree state (pending)
- Phase 4: Execute stage 0 -> 3 sequentially with ASSERT guards (pending)
- Phase 5: Write report, clean worktree, and finalize runtime state (pending)
- Phase 6: Run pipeline meta-analysis (pending)
```

TodoWrite 格式（强制）：
```
{content: "Stage N: {name} (ln-NNN)", status: "pending", activeForm: "{verb}ing"}
```

## 关键规则

1. **单个 Story 处理。**由用户选择要处理的 Story
2. **通过 Skill 调用协调器。**负责人通过 Skill 工具调用 ln-300/ln-310/ln-400/ln-500。每个协调器管理其内部的 Worker 分派（Agent/Skill）
3. **原样使用 Skills。**绝不修改或绕过现有 Skill 逻辑
4. **产物优先验证。**每次 Skill 调用后，首先读取协调器产物，并仅将重新读取看板作为辅助断言。负责人绝不在聊天状态中缓存阶段事实
5. **质量周期限制。**每个 Story 最多允许 2 次质量 FAIL（初次 + 1 次返工）。第 2 次 FAIL 后，向用户上报
6. **Worktree 生命周期。**ln-1000 在阶段 3.4 中创建 worktree。分支收尾（commit、push）由 ln-500 完成。worktree 清理由 ln-1000 在阶段 5 中完成（负责人位于 worktree 中，因此 ln-500 会跳过清理）
7. **阶段备注。**负责人在每个阶段后写入 `.hex-skills/pipeline/stage_N_notes_{id}.md`，供 Pipeline Report 使用
8. **检查点。**CLI 脚本在每个阶段后通过 `node $PIPELINE checkpoint`，将运行作用域内的运行时状态写入 `.hex-skills/pipeline/runtime/runs/{run_id}/`

## 已知问题

| 症状 | 可能原因 | 自恢复方式 |
|---------|-------------|---------------|
| 长时间运行后，负责人输出通用文本 | 上下文压缩破坏了状态变量 | `node $PIPELINE status` -> 提取 resume_action -> 从该处继续 |
| ln-400 卡在同一任务上 | 任务陷入返工循环 | ln-400 在内部处理；返工 3 次后上报 |

## 反模式
- 执行后跳过质量门禁（阶段 3 紧接在阶段 2 的下一行，因此不可能跳过）
- 将看板状态而非协调器产物作为主要完成信号
- 直接运行 mypy/ruff/pytest，而不是让协调器处理
- 未经用户选择便处理多个 Story
- 在阶段 3.4 之外创建 worktree（协调器会自行检测 feature/*）
- 修改协调器的内部分派方式（ln-400 的 Agent/Skill 模式按原样使用就是正确的）

## Plan Mode 支持

在 Plan Mode 中调用时，显示可用 Story，并询问用户要为哪一个制定计划：

1. 解析看板（阶段 1 的步骤 1-7）
2. 显示可用 Story 表格
3. AskUserQuestion：“要为哪个 Story 制定计划？请输入 # 或 Story ID。”
4. 如果发现业务歧义，则执行阶段 2（预检问题）
5. 解析 `skill_repo_path` -- skills 仓库根目录的绝对路径
6. 显示所选 Story 的执行计划
7. 使用下述格式将计划写入计划文件，并调用 ExitPlanMode

**计划输出格式：**
```
## Pipeline Plan for {date}

> **执行前——必须阅读：** 加载 `{skill_repo_path}/ln-1000-pipeline-orchestrator/SKILL.md`（完整文件）。
> 阅读 SKILL.md 后，使用下方上下文从阶段 3（流水线设置）开始。

**故事：** {ID}: {Title}
**当前状态：** {status}
**目标阶段：** {N} ({skill_name})
**存储模式：** {file|linear}
**项目简介：** {name} ({tech})
**业务问题答案：** {answers from Phase 2, or "none"}
**技能仓库路径：** {skill_repo_path}

### 执行顺序
1. 阅读完整的 SKILL.md 及参考文件（阶段 3 的前置条件）
2. 设置 worktree 并初始化由 CLI 管理的流水线状态（阶段 3）
3. 通过 Skill() 调用按顺序执行各阶段（阶段 4）
4. 生成流水线报告（阶段 5）
5. 清理 worktree 和状态文件（阶段 5）
```

## 完成定义（在阶段 5 中自行验证）

- [ ] 用户已选择故事（`state.story_id` 已设置）
- [ ] 业务问题已解决（已存储或跳过）
- [ ] 故事已处理至终止状态（`state.phase IN ("DONE", "PAUSED")`）
- [ ] 每个阶段的 ASSERT 验证均已通过（以制品为首要依据，看板为次要依据）
- [ ] 已为每个完成的阶段编写阶段说明
- [ ] 已生成流水线报告（文件存在于 `docs/tasks/reports/`）
- [ ] 已向用户显示流水线摘要
- [ ] 已清理 worktree（阶段 5 步骤 6）
- [ ] 已运行元分析（阶段 6）

## 阶段 6：元分析

**必须阅读：** 加载  和 `references/phases/phase6_meta_analysis.md`

技能类型：`execution-orchestrator`。收到请求时，在阶段 5 之后运行。流水线特定的实现（恢复映射、趋势跟踪、假设审计、报告格式）位于 `phase6_meta_analysis.md`。

## 参考文件

### 阶段 4-6 流程（渐进式披露）
- **流水线流程：** `references/phases/phase4_flow.md`（ASSERT 防护、阶段说明、上下文恢复、错误处理）
- **元分析：** `references/phases/phase6_meta_analysis.md`（恢复映射、趋势跟踪、报告格式）

### 核心基础设施
- **必须阅读：** 加载 `references/git_worktree_fallback.md`
- **必须阅读：** 加载 `references/research_tool_fallback.md`
- **流水线状态：** `references/pipeline_states.md`
- **检查点格式：** `references/checkpoint_format.md`
- **看板解析：** `references/kanban_parser.md`
- **看板更新算法：** `references/kanban_update_algorithm.md`
- **设置模板：** `references/templates/settings_template.json`
- **防止休眠：** `references/scripts/hooks/prevent-sleep.ps1`
- **环境状态：** `references/environment_state_contract.md`
- **存储模式操作：** `references/storage_mode_detection.md`
- **自动发现模式：** `references/auto_discovery_pattern.md`

### 委派技能
- `../ln-300-task-coordinator/SKILL.md`
- `../ln-310-multi-agent-validator/SKILL.md`
- `../ln-400-story-executor/SKILL.md`
- `../ln-500-story-quality-gate/SKILL.md`

---
**版本：** 3.0.0
**最后更新：** 2026-03-19