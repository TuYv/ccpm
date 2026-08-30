---
name: session-management
description: Context preservation, tiered summarization, resumability
when-to-use: At session checkpoints, after completing major tasks, or when resuming work
user-invocable: false
effort: low
---
# 会话管理技能


用于在较长的开发会话中维护上下文，并支持在中断后无缝恢复。

---

## 核心原则

**在自然停顿点创建检查点，立即恢复。**

较长的开发会话存在上下文丢失的风险。应主动记录状态、决策和进展，以便任何会话都能从中断处准确恢复——无论是休息后回来，还是达到上下文限制。

---

## 分层摘要规则

### 第 1 层：快速更新（仅更新 current-state.md）
**触发条件**：完成任意小任务或待办事项后
**操作**：更新“Active Task”、“Progress”和“Next Steps”部分
**耗时**：约 30 秒

### 第 2 层：完整检查点（current-state.md + decisions.md）
**触发条件**：
- 完成一项功能或重大变更后
- 做出架构或库相关决策后
- 在积极工作期间完成约 20 次工具调用后
- 切换到代码库的其他区域时

**操作**：
1. 更新完整的 current-state.md
2. 将相关决策记录到 decisions.md
3. 更新正在修改的文件表格

### 第 3 层：会话归档（archive/ + 完整检查点）
**触发条件**：
- 工作会话结束时
- 完成一项重大功能或里程碑时
- 发生重大上下文切换之前
- 感觉上下文负担较重时（约 50 次以上工具调用）

**操作**：
1. 创建归档条目：`archive/YYYY-MM-DD[-topic].md`
2. 完成完整检查点
3. 清除 current-state.md 中的详细冗余笔记
4. 如果引入了新的模式，则更新 code-landmarks.md

### 决策启发式规则
```
┌─────────────────────────────────────────────────────┐
│ 完成工作后，询问：                                   │
├─────────────────────────────────────────────────────┤
│ 是否做出了决策？            → 记录到 decisions.md   │
│ 任务是否耗用了超过 10 次工具调用？→ 完整检查点      │
│ 重大功能是否完成？          → 归档                 │
│ 是否要结束会话？            → 归档 + 交接           │
│ 否则                        → 快速更新             │
└─────────────────────────────────────────────────────┘
```

---

## 会话状态结构

创建 `_project_specs/session/` 目录：

```
_project_specs/
└── session/
    ├── current-state.md      # 实时会话状态（频繁更新）
    ├── decisions.md          # 关键决策日志（仅追加）
    ├── code-landmarks.md     # 重要代码位置
    └── archive/              # 过往会话摘要
        └── 2025-01-15.md
```

---

## 当前状态文件

**`_project_specs/session/current-state.md`** - 每 15-20 分钟或取得重大进展后更新。

```markdown
# Current Session State

*Last updated: 2025-01-15 14:32*

## Active Task
[One sentence: what are we working on right now]

Example: Implementing user authentication flow with JWT tokens

## Current Status
- **Phase**: [exploring | planning | implementing | testing | debugging | refactoring]
- **Progress**: [X of Y steps complete, or percentage]
- **Blocking Issues**: [None, or describe blockers]

## Context Summary
[2-3 sentences summarizing the current state of work]

Example: Created auth middleware and login endpoint. JWT signing works.
Currently implementing token refresh logic. Need to add refresh token
rotation for security.

## Files Being Modified
| File | Status | Notes |
|------|--------|-------|
| src/auth/middleware.ts | Done | JWT verification |
| src/auth/refresh.ts | In Progress | Token rotation |
| src/auth/types.ts | Done | Token interfaces |

## Next Steps
1. [ ] Complete refresh token rotation in refresh.ts
2. [ ] Add token blacklist for logout
3. [ ] Write integration tests for auth flow

## Key Context to Preserve
- Using RS256 algorithm (not HS256) per security requirements
- Refresh tokens stored in HttpOnly cookies
- Access tokens: 15 min, Refresh tokens: 7 days

## Resume Instructions
To continue this work:
1. Read src/auth/refresh.ts - currently at line 45
2. The rotateRefreshToken() function needs error handling
3. Check decisions.md for why we chose RS256 over HS256
```

---

## 决策日志

**`_project_specs/session/decisions.md`** - 仅追加的架构和实现决策日志。

```markdown
# Decision Log

Track key decisions for future reference. Never delete entries.

---

## [2025-01-15] JWT Algorithm Choice

**Decision**: Use RS256 instead of HS256 for JWT signing

**Context**: Implementing authentication system

**Options Considered**:
1. HS256 (symmetric) - Simpler, single secret
2. RS256 (asymmetric) - Public/private key pair

**Choice**: RS256

**Reasoning**:
- Allows token verification without exposing signing key
- Better for microservices (services only need public key)
- Industry standard for production systems

**Trade-offs**:
- Slightly more complex key management
- Larger token size

**References**:
- src/auth/keys/ - Key storage
- docs/security.md - Security architecture

---

## [2025-01-14] Database Schema Approach

**Decision**: Use Drizzle ORM with PostgreSQL

**Context**: Setting up data layer

**Options Considered**:
1. Prisma - Popular, good DX
2. Drizzle - Type-safe, SQL-like
3. Raw SQL - Maximum control

**Choice**: Drizzle

**Reasoning**:
- Better TypeScript inference than Prisma
- More transparent SQL generation
- Lighter weight, faster cold starts

**References**:
- src/db/schema.ts - Schema definitions
- src/db/migrations/ - Migration files
```

---

## 代码地标

**`_project_specs/session/code-landmarks.md`** - 重要代码位置，便于快速参考。

```markdown
# Code Landmarks

Quick reference to important parts of the codebase.

## Entry Points
| Location | Purpose |
|----------|---------|
| src/index.ts | Main application entry |
| src/api/routes.ts | API route definitions |
| src/workers/index.ts | Background job entry |

## Core Business Logic
| Location | Purpose |
|----------|---------|
| src/core/auth/ | Authentication system |
| src/core/billing/ | Payment processing |
| src/core/workflows/ | Main workflow engine |

## Configuration
| Location | Purpose |
|----------|---------|
| src/config/index.ts | Environment config |
| src/config/features.ts | Feature flags |
| drizzle.config.ts | Database config |

## Key Patterns
| Pattern | Example Location | Notes |
|---------|------------------|-------|
| Service Layer | src/services/user.ts | Business logic encapsulation |
| Repository | src/repos/user.ts | Data access abstraction |
| Middleware | src/middleware/auth.ts | Request processing |

## Testing
| Location | Purpose |
|----------|---------|
| tests/unit/ | Unit tests |
| tests/integration/ | API tests |
| tests/e2e/ | End-to-end tests |
| tests/fixtures/ | Test data |

## Gotchas & Non-Obvious Behavior
| Location | Issue | Notes |
|---------|-------|-------|
| src/utils/date.ts | Timezone handling | Always use UTC internally |
| src/api/middleware.ts:45 | Auth bypass | Skip auth for health checks |
| src/db/pool.ts | Connection limit | Max 10 connections in dev |
```

---

## CLAUDE.md 会话规则

将此部分添加到 CLAUDE.md：

```markdown
## Session Management

**IMPORTANT**: Follow session-management.md skill. Update session state at natural breakpoints.

### After Every Task Completion
Ask yourself:
1. Was a decision made? → Log to `decisions.md`
2. Did this take >10 tool calls? → Full checkpoint to `current-state.md`
3. Is a major feature complete? → Create archive entry
4. Otherwise → Quick update to `current-state.md`

### Checkpoint Triggers
**Quick Update** (current-state.md):
- After any todo completion
- After small changes

**Full Checkpoint** (current-state.md + decisions.md):
- After significant changes
- After ~20 tool calls
- After any decision
- When switching focus areas

**Archive** (archive/ + full checkpoint):
- End of session
- Major feature complete
- Context feels heavy

### Session Start Protocol
When beginning work:
1. Read `_project_specs/session/current-state.md`
2. Check `_project_specs/todos/active.md`
3. Review recent `decisions.md` entries if needed
4. Continue from "Next Steps"

### Session End Protocol
Before ending or when context limit approaches:
1. Create archive: `_project_specs/session/archive/YYYY-MM-DD.md`
2. Update current-state.md with handoff format
3. Ensure next steps are specific and actionable
```

---

## 压缩策略

### 何时进行压缩（第 3 层归档）

| 触发条件 | 操作 |
|---------|--------|
| 约 50 次以上工具调用 | 总结进展，归档冗长笔记 |
| 主要功能完成 | 归档功能细节，更新里程碑 |
| 上下文切换 | 总结先前的上下文，进行归档，开启全新上下文 |
| 会话结束 | 完整移交会话内容并进行归档 |

### 保留内容与归档内容

**保留在活动上下文中：**
- 当前任务和紧接着的后续步骤
- 当前活动文件列表及其状态
- 阻塞问题
- 影响当前工作的关键决策

**归档/总结：**
- 未能奏效的探索路径
- 详细的调试跟踪信息（仅保留结论）
- 冗长的错误消息（仅保留根本原因）
- 研究笔记（仅保留建议）

### 压缩模板

进行压缩时，使用以下格式：

```markdown
## Compressed Context - [Topic]

**Summary**: [1-2 sentences]

**Key Findings**:
- [Bullet points of important discoveries]

**Decisions Made**:
- [Reference to decisions.md entries]

**Relevant Code**:
- [File:line references]

**Archived Details**: [Link to archive file if created]
```

---

## 会话归档

完成重要工作或会话结束后，创建归档：

**`_project_specs/session/archive/YYYY-MM-DD[-topic].md`**

```markdown
# Session Archive: [Date] - [Topic]

## Summary
[Paragraph summarizing what was accomplished]

## Tasks Completed
- [TODO-XXX] Description - Done
- [TODO-YYY] Description - Done

## Key Decisions
- [Reference decisions.md entries made this session]

## Code Changes
| File | Change Type | Description |
|------|-------------|-------------|
| src/auth/login.ts | Created | Login endpoint |
| src/auth/types.ts | Modified | Added RefreshToken type |

## Tests Added
- tests/auth/login.test.ts - Login flow tests
- tests/auth/refresh.test.ts - Token refresh tests

## Open Items Carried Forward
- [Anything not finished, now in active.md]

## Session Stats
- Duration: ~3 hours
- Tool calls: ~120
- Files modified: 8
- Tests added: 12
```

---

## 与待办事项系统集成

### 将待办事项关联到会话

在活动待办事项中引用会话上下文：

```markdown
## [TODO-042] Implement token refresh

**Status:** in-progress
**Session Context:** See current-state.md

### Progress Notes
- 2025-01-15: Started implementation, base structure done
- 2025-01-15: Added rotation logic, need error handling
```

### 完成待办事项时自动更新

完成待办事项时：
1. 在 active.md 中将待办事项标记为已完成
2. 更新 current-state.md 中的进度
3. 记录所作的任何决策
4. 如果引入了新的模式，则更新 code-landmarks.md

---

## 快速命令

添加到项目脚本或别名中：

```bash
# Show current session state
alias session-status="cat _project_specs/session/current-state.md"

# Quick edit session state
alias session-edit="$EDITOR _project_specs/session/current-state.md"

# View recent decisions
alias decisions="tail -100 _project_specs/session/decisions.md"

# Create session archive
session-archive() {
  cp _project_specs/session/current-state.md \
     "_project_specs/session/archive/$(date +%Y-%m-%d).md"
  echo "Archived to _project_specs/session/archive/$(date +%Y-%m-%d).md"
}
```

---

## 强制执行机制

### 1. 作为入口点的 CLAUDE.md
CLAUDE.md 必须在 Skills 部分引用 session-management.md。Claude 会首先读取 CLAUDE.md，该文件会指示其遵循会话规则。

### 2. 带有提醒的会话文件标头
在会话文件标头中包含强制执行提醒：

**current-state.md header:**
```markdown
<!--
CHECKPOINT RULES (from session-management.md):
- Quick update: After any todo completion
- Full checkpoint: After ~20 tool calls or decisions
- Archive: End of session or major feature complete
-->
```

### 3. 自检问题
完成任何任务后，Claude 都应询问：
```
□ Did I make a decision? → Log it
□ Did this take >10 tool calls? → Full checkpoint
□ Is a feature complete? → Archive
□ Am I ending/switching context? → Archive + handoff
```

### 4. 会话启动验证
启动会话时，Claude 必须：
1. 检查 `current-state.md` 是否存在并读取它
2. 宣布其发现的内容："Resuming from: [last state]"
3. 在继续之前确认后续步骤

### 5. 定期自审
每约 20 次工具调用后，Claude 应检查：
- current-state.md 是否为最新？
- 是否有尚未记录的决策？
- 上下文是否变得过于庞大？

### 6. 用户提示
用户可以通过以下请求强制执行：
- "Update session state" → 触发检查点
- "What's the current state?" → Claude 读取并报告
- "End session" → 触发归档 + 交接
- "Resume from last session" → Claude 首先读取状态文件

---

## 反模式

- **不跟踪状态** - 盲目进行，无法恢复
- **状态过于冗长** - 保持易于浏览，不要写成小说
- **状态文件过时** - 定期更新，否则它们会变得毫无用处
- **遗漏决策** - 未来的你不会记得当初为什么这样做
- **没有代码地标** - 浪费时间重新发现代码库
- **从不归档** - 会话文件会变得杂乱
- **忽略压缩信号** - 上下文过载会降低性能
- **决策后跳过检查点** - 关键上下文会丢失
- **会话结束时没有交接** - 下一次会话会在毫无上下文的情况下开始

---

## 快速参考

### 检查点决策树
```
Task completed?
    │
    ├── Decision made? ──────────────────→ Log to decisions.md
    │
    ├── >10 tool calls OR significant? ──→ Full Checkpoint
    │
    ├── Major feature done? ─────────────→ Archive
    │
    └── Otherwise ───────────────────────→ Quick Update
```

### 文件一览
| File | Update Frequency | Purpose |
|------|------------------|---------|
| current-state.md | Every task | Live state, next steps |
| decisions.md | When deciding | Architectural choices |
| code-landmarks.md | When patterns change | Code navigation |
| archive/*.md | End of session/feature | Historical record |