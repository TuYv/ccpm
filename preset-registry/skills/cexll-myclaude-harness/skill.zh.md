---
name: harness
description: "This skill should be used for multi-session autonomous agent work requiring progress checkpointing, failure recovery, and task dependency management. Triggers on '/harness' command, or when a task involves many subtasks needing progress persistence, sleep/resume cycles across context windows, recovery from mid-task failures with partial state, or distributed work across multiple agent sessions. Synthesized from Anthropic and OpenAI engineering practices for long-running agents."
---
# Harness — 长时间运行的智能体框架

一种可执行协议，使任何智能体任务都能跨多个会话持续运行，并支持自动恢复进度、解析任务依赖关系、失败回滚以及标准化错误处理。

## 设计原则

1. **为智能体而非人类设计** — 测试输出、文档和任务结构是智能体的主要接口
2. **进度文件就是上下文** — 上下文窗口重置后，进度文件 + git 历史记录 = 完整恢复
3. **过早宣布完成是首要失败模式** — 包含明确完成标准的结构化任务列表可防止过早宣布成功
4. **标准化一切可供 grep 检索的内容** — ERROR 位于同一行、结构化时间戳、一致的前缀
5. **快速反馈循环** — 预先计算统计信息，在完整验证前运行冒烟测试
6. **一切操作都具备幂等性** — 初始化脚本、任务执行和环境设置都必须能够安全地重复运行
7. **安全失败，而非静默失败** — 每次失败都必须有明确的恢复策略

## 命令

```
/harness init <project-path>     # Initialize harness files in project
/harness run                     # Start/resume the infinite loop
/harness status                  # Show current progress and stats
/harness add "task description"  # Add a task to the list
```

## 激活标记

只有当 Harness 根目录（与 `harness-tasks.json` 位于同一目录）中存在 `.harness-active` 标记文件时，钩子才会生效。

- `/harness init` 和 `/harness run` 必须创建此标记：`touch <project-path>/.harness-active`
- 当所有任务都已完成（不存在状态为 pending/in_progress/retryable 的任务）时，将其删除：`rm <project-path>/.harness-active`
- 如果没有此标记，所有钩子都不执行任何操作——它们会立即以状态码 0 退出

## 进度持久化（双文件系统）

在项目工作目录中维护两个文件：

### harness-progress.txt（仅追加日志）

记录跨会话的所有智能体操作的自由文本日志。绝不截断。

```
[2025-07-01T10:00:00Z] [SESSION-1] INIT Harness initialized for project /path/to/project
[2025-07-01T10:00:05Z] [SESSION-1] INIT Environment health check: PASS
[2025-07-01T10:00:10Z] [SESSION-1] LOCK acquired (pid=12345)
[2025-07-01T10:00:11Z] [SESSION-1] Starting [task-001] Implement user authentication (base=def5678)
[2025-07-01T10:05:00Z] [SESSION-1] CHECKPOINT [task-001] step=2/4 "auth routes created, tests pending"
[2025-07-01T10:15:30Z] [SESSION-1] Completed [task-001] (commit abc1234)
[2025-07-01T10:15:31Z] [SESSION-1] Starting [task-002] Add rate limiting (base=abc1234)
[2025-07-01T10:20:00Z] [SESSION-1] ERROR [task-002] [TASK_EXEC] Redis connection refused
[2025-07-01T10:20:01Z] [SESSION-1] ROLLBACK [task-002] git reset --hard abc1234
[2025-07-01T10:20:02Z] [SESSION-1] STATS tasks_total=5 completed=1 failed=1 pending=3 blocked=0 attempts_total=2 checkpoints=1
```

### harness-tasks.json（结构化状态）

```json
{
  "version": 2,
  "created": "2025-07-01T10:00:00Z",
  "session_config": {
    "concurrency_mode": "exclusive",
    "max_tasks_per_session": 20,
    "max_sessions": 50
  },
  "tasks": [
    {
      "id": "task-001",
      "title": "Implement user authentication",
      "status": "completed",
      "priority": "P0",
      "depends_on": [],
      "attempts": 1,
      "max_attempts": 3,
      "started_at_commit": "def5678",
      "validation": {
        "command": "npm test -- --testPathPattern=auth",
        "timeout_seconds": 300
      },
      "on_failure": {
        "cleanup": null
      },
      "error_log": [],
      "checkpoints": [],
      "completed_at": "2025-07-01T10:15:30Z"
    },
    {
      "id": "task-002",
      "title": "Add rate limiting",
      "status": "failed",
      "priority": "P1",
      "depends_on": [],
      "attempts": 1,
      "max_attempts": 3,
      "started_at_commit": "abc1234",
      "validation": {
        "command": "npm test -- --testPathPattern=rate-limit",
        "timeout_seconds": 120
      },
      "on_failure": {
        "cleanup": "docker compose down redis"
      },
      "error_log": ["[TASK_EXEC] Redis connection refused"],
      "checkpoints": [],
      "completed_at": null
    },
    {
      "id": "task-003",
      "title": "Add OAuth providers",
      "status": "pending",
      "priority": "P1",
      "depends_on": ["task-001"],
      "attempts": 0,
      "max_attempts": 3,
      "started_at_commit": null,
      "validation": {
        "command": "npm test -- --testPathPattern=oauth",
        "timeout_seconds": 180
      },
      "on_failure": {
        "cleanup": null
      },
      "error_log": [],
      "checkpoints": [],
      "completed_at": null
    }
  ],
  "session_count": 1,
  "last_session": "2025-07-01T10:20:02Z"
}
```

任务状态：`pending` → `in_progress`（临时状态，仅在主动执行期间设置）→ `completed` 或 `failed`。如果在会话开始时发现任务处于 `in_progress` 状态，则表示上一个会话被中断——请按照上下文窗口恢复协议进行处理。

在并发模式下（参见并发控制），任务还可能包含声明元数据：`claimed_by` 和 `lease_expires_at`（ISO 时间戳）。

**会话边界**：会话从代理开始执行会话启动协议时开始，并在满足停止条件或上下文窗口重置时结束。每个会话都会获得唯一的 `SESSION-N` 标识符（N = `session_count` 递增后的值）。

## 并发控制

在修改 `harness-tasks.json` 之前，使用可移植的 `mkdir` 获取排他锁（该操作在所有 POSIX 系统上都是原子的，同时适用于 macOS 和 Linux）：

```bash
# Acquire lock (fail fast if another agent is running)
# Lock key must be stable even if invoked from a subdirectory.
ROOT="$PWD"
SEARCH="$PWD"
while [ "$SEARCH" != "/" ] && [ ! -f "$SEARCH/harness-tasks.json" ]; do
  SEARCH="$(dirname "$SEARCH")"
done
if [ -f "$SEARCH/harness-tasks.json" ]; then
  ROOT="$SEARCH"
fi

PWD_HASH="$(
  printf '%s' "$ROOT" |
    (shasum -a 256 2>/dev/null || sha256sum 2>/dev/null) |
    awk '{print $1}' |
    cut -c1-16
)"
LOCKDIR="/tmp/harness-${PWD_HASH:-unknown}.lock"
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  # Check if lock holder is still alive
  LOCK_PID=$(cat "$LOCKDIR/pid" 2>/dev/null)
  if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
    echo "ERROR: Another harness session is active (pid=$LOCK_PID)"; exit 1
  fi
  # Stale lock — atomically reclaim via mv to avoid TOCTOU race
  STALE="$LOCKDIR.stale.$$"
  if mv "$LOCKDIR" "$STALE" 2>/dev/null; then
    rm -rf "$STALE"
    mkdir "$LOCKDIR" || { echo "ERROR: Lock contention"; exit 1; }
    echo "WARN: Removed stale lock${LOCK_PID:+ from pid=$LOCK_PID}"
  else
    echo "ERROR: Another agent reclaimed the lock"; exit 1
  fi
fi
echo "$$" > "$LOCKDIR/pid"
trap 'rm -rf "$LOCKDIR"' EXIT
```

记录锁的获取：`[timestamp] [SESSION-N] LOCK acquired (pid=<PID>)`
记录锁的释放：`[timestamp] [SESSION-N] LOCK released`

模式：

- **排他模式（默认）**：在整个会话期间持有锁（`trap EXIT` 处理程序会自动释放锁）。同一状态根目录中的任何第二个会话都会快速失败。
- **并发模式（通过 `session_config.concurrency_mode: "concurrent"` 选择启用）**：将此锁视为**状态事务锁**。仅在读取、修改、写入 `harness-tasks.json`（包括 `.bak`/`.tmp`）以及追加写入 `harness-progress.txt` 时持有该锁。在执行实际工作之前立即释放它。

并发模式不变量：

- 所有工作进程都必须指向同一个状态根目录（即包含 `harness-tasks.json` 的目录）。如果使用不同的工作树或克隆，请显式固定该目录（例如 `HARNESS_STATE_ROOT=/abs/path/to/state-root`）。
- 任务选择仅供参考；真正的关卡是在锁保护下进行**原子声明**：设置 `status="in_progress"`，设置 `claimed_by`（稳定的工作进程 ID，例如 `HARNESS_WORKER_ID`），并设置 `lease_expires_at`。如果声明失败（任务已经处于 `in_progress` 状态且租约仍然有效），请选择另一个符合条件的任务并重试。
- 切勿在同一个 git 工作目录中运行两个工作进程。请使用不同的工作树或克隆。否则，回滚（`git reset --hard` / `git clean -fd`）会破坏其他工作进程的内容。

## 无限循环协议

### 会话启动（每次都执行）

1. **读取状态**：读取 `harness-progress.txt` 的最后 200 行以及完整的 `harness-tasks.json`。如果 JSON 无法解析，请参阅错误处理中的 JSON 损坏恢复。
2. **读取 git**：运行 `git log --oneline -20` 和 `git diff --stat`，以检测未提交的工作。
3. **获取锁**（取决于模式）：如果另一个会话处于活动状态，独占模式将失败。并发模式仅在状态事务期间使用锁。
4. **恢复中断的任务**（请参阅下文的上下文窗口恢复）
5. **健康检查**：如果 `harness-init.sh` 存在，则运行它。
6. **跟踪会话**：递增 JSON 中的 `session_count`。检查 `session_count` 是否达到 `max_sessions`——如果达到，则记录 STATS 并停止。将每会话任务计数器初始化为 0。
7. **选择下一个任务**，使用下文的任务选择算法。

### 任务选择算法

选择任务前，执行依赖项验证：

1. **循环检测**：对于每个未完成的任务，沿 `depends_on` 递归遍历。如果任何任务出现在其自身的依赖链中，则将其标记为 `failed`，并记录 `[DEPENDENCY] Circular dependency detected: task-A -> task-B -> task-A`。自引用（`depends_on` 包含自身 id）也属于循环。
2. **阻塞传播**：如果某个任务的 `depends_on` 包含一个已 `failed` 且永远不会重试的任务（其 `attempts >= max_attempts`，或者其 `error_log` 包含 `[DEPENDENCY]` 条目），则将被阻塞的任务标记为 `failed`，并记录 `[DEPENDENCY] Blocked by failed task-XXX`。重复执行，直到没有更多任务可传播。

然后按照以下优先顺序选择下一个任务：

1. `status: "pending"` 且其所有 `depends_on` 任务均为 `completed` 的任务——先按 `priority` 排序（P0 > P1 > P2），再按 `id` 排序（较小者优先）。
2. `status: "failed"`、`attempts < max_attempts`，且其所有 `depends_on` 任务均为 `completed` 的任务——先按优先级排序，再按失败时间排序（最早失败者优先）。
3. 如果没有剩余的合格任务 → 记录最终 STATS → 停止。

### 任务执行周期

对于每个任务，严格按照以下顺序执行：

1. **认领**（以原子方式在锁内执行）：记录 `started_at_commit` = 当前 HEAD 哈希。将状态设置为 `in_progress`，设置 `claimed_by`，设置 `lease_expires_at`，并记录 `Starting [<task-id>] <title> (base=<hash>)`。如果任务已被认领（处于 `in_progress` 状态且租约有效），则选择另一个合格任务并重试。
2. **带检查点执行**：执行工作。每完成一个重要步骤后，记录：
   ```
   [timestamp] [SESSION-N] CHECKPOINT [task-id] step=M/N "description of what was done"
   ```
   同时向任务的 `checkpoints` 数组追加：`{ "step": M, "total": N, "description": "...", "timestamp": "ISO" }`。在并发模式下，每到一个检查点都要续租（将 `lease_expires_at` 向后延长）。
3. **验证**：使用超时包装器运行任务的 `validation.command`（优先使用 `timeout`；在 macOS 上使用 coreutils 中的 `gtimeout`）。如果 `validation.command` 为空/null，则记录 `ERROR [<task-id>] [CONFIG] Missing validation.command` 并停止——没有客观检查时不得宣布完成。运行前，确认命令存在（例如 `command -v <binary>`）——如果缺失，则按 `ENV_SETUP` 错误处理。
   - 命令以 0 退出 → PASS
   - 命令以非零值退出 → FAIL
   - 命令超过超时时间 → TIMEOUT
4. **记录结果**：
   - **成功**：status=`completed`，设置 `completed_at`，记录 `Completed [<task-id>] (commit <hash>)`，执行 git commit。
   - **失败**：递增 `attempts`，将错误追加到 `error_log`。通过 `git cat-file -t <hash>` 验证 `started_at_commit` 是否存在——如果不存在，则将任务标记为失败并将尝试次数设为 max_attempts。否则，执行 `git reset --hard <started_at_commit>` 和 `git clean -fd`，以回滚所有提交并删除未跟踪文件。如果定义了 `on_failure.cleanup`，则执行它。记录 `ERROR [<task-id>] [<category>] <message>`。将状态设置为 `failed`（当 attempts < max_attempts 时，任务选择算法的第 2 轮会处理重试）。
5. **跟踪**：递增每会话任务计数器。如果达到 `max_tasks_per_session`，则记录 STATS 并停止。
6. **继续**：立即选择下一个任务（零空闲时间）。

### 停止条件

- 所有任务均为 `completed`
- 所有剩余任务均因达到 `max_attempts` 而 `failed`，或被失败的依赖项阻塞
- 本次会话已达到 `session_config.max_tasks_per_session`
- 所有会话累计已达到 `session_config.max_sessions`
- 用户中断

## 上下文窗口恢复协议

当新会话启动并发现一个 `status: "in_progress"` 的任务时：

- 独占模式：将其视为上一个会话被中断，并执行下方的恢复协议。
- 并发模式：仅当以下任一条件成立时才恢复任务：(a) `claimed_by` 与当前工作进程匹配；或 (b) `lease_expires_at` 已过期（租约失效）。否则，将其视为由另一个工作进程持有，不要修改。

1. **检查 git 状态**：
   ```bash
   git diff --stat          # Uncommitted changes?
   git log --oneline -5     # Recent commits since task started?
   git stash list           # Any stashed work?
   ```
2. **检查检查点**：读取任务的 `checkpoints` 数组，以确定最后完成的步骤
3. **决策矩阵**（通过检查提交消息中是否包含任务 ID，验证近期提交是否属于此任务）：

| 有未提交的更改？ | 有近期任务提交？ | 有检查点？ | 操作 |
|---|---|---|---|
| 否 | 否 | 无 | 将任务标记为 `failed`，原因设为 `[SESSION_TIMEOUT] No progress detected`，并增加尝试次数 |
| 否 | 否 | 有 | 验证文件状态是否与检查点声明一致。如果文件反映了检查点进度，则从最后一步继续。否则，将任务标记为 `failed`——工作已丢失 |
| 否 | 是 | 任意 | 运行 `validation.command`。如果通过 → 标记为 `completed`。如果失败 → 执行 `git reset --hard <started_at_commit>`，标记为 `failed` |
| 是 | 否 | 任意 | 在保留未提交更改的情况下运行验证。如果通过 → 提交并标记为 `completed`。如果失败 → 执行 `git reset --hard <started_at_commit>` + `git clean -fd`，标记为 `failed` |
| 是 | 是 | 任意 | 提交未提交的更改，然后运行 `validation.command`。如果通过 → 标记为 `completed`。如果失败 → 执行 `git reset --hard <started_at_commit>` + `git clean -fd`，标记为 `failed` |

4. **记录恢复操作**：`[timestamp] [SESSION-N] RECOVERY [task-id] action="<action taken>" reason="<reason>"`

## 错误处理与恢复策略

每个错误类别都有默认恢复策略：

| 类别 | 默认恢复方式 | 代理操作 |
|----------|-----------------|--------------|
| `ENV_SETUP` | 重新运行初始化，如果仍然失败则停止 | 立即再次运行 `harness-init.sh`。如果连续失败两次，则记录日志并停止——环境已损坏 |
| `CONFIG` | 停止（需要人工修复） | 准确记录配置错误（文件 + 字段），然后停止。不要猜测或自动修改任务元数据 |
| `TASK_EXEC` | 通过 `git reset --hard <started_at_commit>` 回滚，然后重试 | 验证 `started_at_commit` 是否存在（`git cat-file -t <hash>`）。如果不存在，则在达到 `max_attempts` 时将任务标记为失败。否则执行重置；如果定义了 `on_failure.cleanup`，则运行它；如果尝试次数小于 `max_attempts`，则重试 |
| `TEST_FAIL` | 通过 `git reset --hard <started_at_commit>` 回滚，然后重试 | 重置到 `started_at_commit`，分析测试输出以确定修复方案，然后进行有针对性的修改并重试 |
| `TIMEOUT` | 终止进程、执行清理，然后重试 | 使用 `timeout <seconds> <command>` 包装验证命令。发生超时时，运行 `on_failure.cleanup`，然后重试（如果反复发生，可考虑拆分任务） |
| `DEPENDENCY` | 跳过任务，标记为被阻塞 | 记录失败的依赖项，将任务标记为 `failed`，并注明依赖项原因 |
| `SESSION_TIMEOUT` | 使用上下文窗口恢复协议 | 新会话通过恢复协议评估部分进度——根据验证结果，任务可能被标记为完成或失败 |

**JSON 损坏**：如果无法解析 `harness-tasks.json`，请检查 `harness-tasks.json.bak`（每次修改前写入）。如果备份存在且有效，则从备份恢复。如果没有有效备份，则记录 `ERROR [ENV_SETUP] harness-tasks.json corrupted and unrecoverable` 并停止——任务元数据（验证命令、依赖项、清理操作）无法仅从日志中重建。

**备份协议**：每次写入 `harness-tasks.json` 之前，将当前文件复制到 `harness-tasks.json.bak`。以原子方式写入更新：先将 JSON 写入 `harness-tasks.json.tmp`，然后使用 `mv` 将其移至目标位置（读取方绝不应看到不完整的文件）。

## 环境初始化

如果项目根目录中存在 `harness-init.sh`，则在每个会话开始时运行它。该脚本必须是幂等的。

`harness-init.sh` 示例：
```bash
#!/bin/bash
set -e
npm install 2>/dev/null || pip install -r requirements.txt 2>/dev/null || true
curl -sf http://localhost:5432 >/dev/null 2>&1 || echo "WARN: DB not reachable"
npm test -- --bail --silent 2>/dev/null || echo "WARN: Smoke test failed"
echo "Environment health check complete"
```

## 标准化日志格式

所有日志条目均使用便于 grep 检索的单行格式：

```
[ISO-timestamp] [SESSION-N] <TYPE> [task-id]? [category]? message
```

`[task-id]` 和 `[category]` 在适用时包含（任务范围的条目）。会话级条目（`INIT`、`LOCK`、`STATS`）不包含它们。

类型：`INIT`、`Starting`、`Completed`、`ERROR`、`CHECKPOINT`、`ROLLBACK`、`RECOVERY`、`STATS`、`LOCK`、`WARN`

错误类别：`ENV_SETUP`、`CONFIG`、`TASK_EXEC`、`TEST_FAIL`、`TIMEOUT`、`DEPENDENCY`、`SESSION_TIMEOUT`

筛选：
```bash
grep "ERROR" harness-progress.txt                    # All errors
grep "ERROR" harness-progress.txt | grep "TASK_EXEC" # Execution errors only
grep "SESSION-3" harness-progress.txt                # All session 3 activity
grep "STATS" harness-progress.txt                    # All session summaries
grep "CHECKPOINT" harness-progress.txt               # All checkpoints
grep "RECOVERY" harness-progress.txt                 # All recovery actions
```

## 会话统计信息

会话结束时，更新 `harness-tasks.json`：将 `last_session` 设置为当前时间戳。（此处**不要**递增 `session_count`——它会在会话开始时递增。）然后追加：

```
[timestamp] [SESSION-N] STATS tasks_total=10 completed=7 failed=1 pending=2 blocked=0 attempts_total=12 checkpoints=23
```

`blocked` 在生成统计信息时计算：其 `depends_on` 包含永久失败任务的待处理任务数量。它不是存储的状态值。

## 初始化命令（`/harness init`）

1. 创建包含初始化条目的 `harness-progress.txt`
2. 创建包含空任务列表和默认 `session_config` 的 `harness-tasks.json`
3. 可选择创建 `harness-init.sh` 模板（chmod +x）
4. 询问用户：是否将工作流文件添加到 `.gitignore`？

## 状态命令（`/harness status`）

读取 `harness-tasks.json` 和 `harness-progress.txt`，然后显示：

1. 任务摘要：按状态统计数量（已完成、失败、待处理、已阻塞）。`blocked` = 其 `depends_on` 包含永久失败任务的待处理任务（计算得出，而非存储的状态）。
2. 每个任务占一行：`[status] task-id: title (attempts/max_attempts)`
3. `harness-progress.txt` 的最后 5 行
4. 会话次数和上次会话时间戳

不获取锁（只读操作）。

## 添加命令（`/harness add`）

向 `harness-tasks.json` 追加一个新任务，其 id 自动递增（`task-NNN`），状态为 `pending`，默认 `max_attempts: 3`，`depends_on` 为空，并且不设置验证命令（任务完成前必须设置）。提示用户填写可选字段：`priority`、`depends_on`、`validation.command`、`timeout_seconds`。需要获取锁（会修改 JSON）。

## 工具依赖项

需要：Bash、文件读写、git。所有 harness 操作都必须从项目根目录执行。
不需要：特定的 MCP 服务器、编程语言或测试框架。

并发模式需要使用隔离的工作目录（`git worktree` 或单独的克隆）。不要在同一个工作树中运行并发 worker。