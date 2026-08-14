---
name: session-start
description: Runs the session startup procedure - verifies setup, loads config and state, checks skill models, and reports project status. Use at the beginning of a fresh session.
model: sonnet
effort: low
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - WebSearch
  - WebFetch
  - bitwize-music-mcp
---
## 你的任务

执行完整的会话启动流程，并向用户报告项目状态。

---

# 会话启动技能

你需要执行由 8 个步骤组成的会话启动流程，以初始化工作会话。

---

## 步骤 1：验证设置

快速检查依赖项：

```bash
~/.bitwize-music/venv/bin/python3 -c "import mcp" 2>&1 >/dev/null && echo "MCP ready" || echo "MCP missing"        # macOS/Linux/WSL
~/.bitwize-music/venv/Scripts/python.exe -c "import mcp" 2>&1 >/dev/null && echo "MCP ready" || echo "MCP missing" # Windows (Git Bash; cmd/PowerShell: %USERPROFILE%\.bitwize-music\venv\Scripts\python.exe)
```

- 如果 MCP 缺失：**立即停止**并建议运行：`/bitwize-music:setup mcp`
- 如果配置缺失（`~/.bitwize-music/config.yaml` 不存在）：建议运行 `/bitwize-music:configure`
- 在设置完成之前不要继续

## 步骤 1.5：健康检查

使用 `health_check` MCP 工具（一次调用即可检查虚拟环境软件包、技能注册情况和专辑 slug 冲突）：

**虚拟环境结果**（来自 `result.venv`）：
- `status: "ok"` → 静默继续
- `status: "stale"` → 针对不匹配项和修复命令发出警告，然后继续会话
- `status: "no_venv"` → **停止**并建议运行 `/bitwize-music:setup`
- `status: "error"` → 发出警告并继续

**技能注册结果**（来自 `result.skills`）：
- `status: "ok"` → 静默继续
- `status: "stale"` → 发出警告：列出缺失和幽灵技能名称，并显示修复消息
- `status: "no_cache"` → 警告未找到插件缓存，然后继续

**专辑 slug 冲突结果**（来自 `result.collisions`）：
- `status: "ok"` → 静默继续
- `status: "collision"` → 发出警告：列出每个 slug 及其保留和被遮蔽的流派，并显示修复方法（使用 `/bitwize-music:rename` 重命名其中一个专辑或移动其目录，然后运行 `rebuild_state`），再继续会话

## 步骤 2：加载配置

读取 `~/.bitwize-music/config.yaml`。

如果缺失，告知用户运行 `/bitwize-music:configure`。

## 步骤 3：加载覆盖项

从配置中读取 `paths.overrides`（默认值：`{content_root}/overrides`）：

- 检查 `{overrides}/CLAUDE.md`——如果找到，则纳入其中的指令
- 检查 `{overrides}/pronunciation-guide.md`——如果找到，则予以注明
- 如果缺失则静默跳过（覆盖项是可选的）

## 步骤 4：加载状态缓存

读取 `~/.bitwize-music/cache/state.json`：

- 如果缺失、损坏、架构不匹配或配置已更改，则通过 MCP 重建
  ```
  rebuild_state()
  ```

## 步骤 4.5：检查插件升级

调用 `get_pending_migrations` MCP 工具。它会将已安装的插件版本与状态中的 `last_migrated_version`（上次处理迁移时对应的版本——不同于仅用于记录已安装版本以供显示的 `plugin_version`）进行比较，并返回已经解析和排序的待处理说明。

1. **如果 `pending` 为空**（`reason: "current"`，或者当无法从 plugin.json 中读取已安装版本时为 `reason: "unknown"`）：无需采取任何操作。
2. **如果 `pending` 非空**（`reason: "upgrade"` 或 `"untracked"`）：依次处理每项迁移中的 `actions`：
   - `auto`：静默执行（先运行 `check`——如果返回 0，则跳过）
   - `action`：显示说明，并在执行前请求用户确认
   - `info`：向用户显示
   - `manual`：向用户显示相关指令
3. **处理完所有说明后**，调用 `acknowledge_migrations`（不传参数表示确认截至已安装版本的所有迁移），以免相同说明在下次会话中再次出现。
4. 报告：“已升级到 Y”，并附上所执行操作的摘要。

> `reason: "untracked"` 表示该状态早于迁移跟踪机制；截至已安装版本的全部
> 待处理迁移会一次性显示，随后由 `acknowledge_migrations` 清除。切勿仅通过重建状态来清除迁移——
> 重建会保留待处理状态；只有 `acknowledge_migrations` 才会记录
> 你已处理这些迁移。

## 步骤 5：（已移除）

会话启动时不再进行 Skill 模型检查。Skill 使用层级别名（`opus`/`sonnet`/`haiku`），这些别名会自动跟踪前沿模型，而测试套件（`/bitwize-music:test`）会强制执行模型/工作量规范——因此发布新的 Claude 模型时，无需手动检查模型。

## 步骤 6：根据状态缓存生成报告

使用 `state.json` 中的数据报告：

### 专辑创意
根据 `state.ideas.counts`——显示各状态（待处理、进行中等）的数量

### 进行中的专辑
筛选 `state.albums` 中状态为 "In Progress"、"Research Complete"、"Complete" 的专辑

对于每张专辑，显示：
- 专辑名称、流派、状态
- 曲目进度（已完成/总数）

### 待处理的来源验证
从 `state.albums` 中查找 `sources_verified` 为 "Pending" 的曲目

如果找到任何此类曲目，请警告：“这些曲目的来源尚未验证——在完成验证之前无法生成。”

### 上次会话上下文
根据 `state.session`：
- 上次处理的专辑
- 上次所处阶段
- 待处理操作

## 步骤 7：显示情境提示

根据状态显示一条相关提示：

| 条件 | 提示 |
|-----------|-----|
| 不存在专辑 | “尝试使用 `/bitwize-music:tutorial` 创建你的第一张专辑” |
| 存在创意但不存在专辑 | “你有专辑创意！使用 `/bitwize-music:album-ideas list` 查看它们” |
| 存在进行中的专辑 | “从上次中断处继续：`/bitwize-music:resume <album-name>`” |
| 已加载覆盖文件 | “已从 {overrides}/ 加载自定义覆盖文件” |
| 缺少覆盖文件 | “使用覆盖文件自定义工作流——请参阅 `/reference/overrides/`” |
| 存在待处理的验证 | “必须先完成来源验证，才能继续生成” |

另显示一条随机通用提示（在以下提示中轮换）：
- “询问‘接下来我该做什么？’以获取工作流指导”
- “使用 `/bitwize-music:resume` 快速返回某张专辑”
- “researcher Skill 会协调 10 个专门的子 Skill 进行深入研究”
- “生成前请检查发音——Suno 无法根据上下文推断发音”
- “使用 `/bitwize-music:clipboard` 复制用于 Suno 的歌词/提示词”
- “使用 `/bitwize-music:mastering-engineer` 对音频进行母带处理，以获得专业效果”

## 步骤 8：询问

以“你想处理什么？”结尾。

---

## 报告格式

```
SESSION START
=============

Setup: MCP ready, config loaded
Health: [venv ok, skills ok, no collisions | warnings listed]
Overrides: [loaded from {path} | not found (optional)]
State: [loaded | rebuilt | error]

ALBUM IDEAS
  Pending: X | In Progress: Y

IN-PROGRESS ALBUMS
  [album-name] (genre) - Status [X/Y tracks]
  [album-name] (genre) - Status [X/Y tracks]

PENDING VERIFICATIONS
  [album-name]: track-01, track-05

LAST SESSION
  Album: [name] | Phase: [phase]
  Pending: [actions]

TIP: [contextual tip]

What would you like to work on?
```

---

## 请记住

1. **不要跳过步骤** — 每个步骤都关系到会话完整性
2. **必要时重建状态** — 过时的状态会导致错误的建议
3. **保持简洁** — 这是状态报告，不是对话
4. **对验证问题发出警告** — 未经验证的来源会阻止生成
5. **只给一个提示，不要给五个** — 选择与当前状态最相关的提示