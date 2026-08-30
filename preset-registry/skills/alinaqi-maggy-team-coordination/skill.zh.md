---
name: team-coordination
description: Multi-person projects - shared state, todo claiming, handoffs
when-to-use: When multiple developers are working on the same repo
user-invocable: false
effort: low
---
# 团队协作 Skill


**目的：** 让团队中的多个 Claude Code 会话能够协调工作、避免冲突。管理共享状态、待办事项认领、决策同步以及会话感知。

---

## 核心理念

```
┌─────────────────────────────────────────────────────────────────┐
│  TEAM CLAUDE CODE                                               │
│  ─────────────────────────────────────────────────────────────  │
│  Multiple devs, multiple Claude sessions, one codebase.         │
│  Coordination > Speed. Communication > Assumptions.             │
│                                                                 │
│  Before you start: Check who's working on what.                 │
│  Before you claim: Make sure nobody else has it.                │
│  Before you decide: Check if it's already decided.              │
│  Before you push: Pull and sync state.                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 团队状态结构

当项目变为多人协作时，创建以下结构：

```
_project_specs/
├── team/
│   ├── state.md              # Who's working on what right now
│   ├── contributors.md       # Team members and their focus areas
│   └── handoffs/             # Notes when passing work to others
│       └── [feature]-handoff.md
├── session/
│   ├── current-state.md      # YOUR session state (personal)
│   ├── decisions.md          # SHARED - architectural decisions
│   └── code-landmarks.md     # SHARED - important code locations
└── todos/
    ├── active.md             # SHARED - with claim annotations
    ├── backlog.md            # SHARED
    └── completed.md          # SHARED
```

---

## 团队状态文件

**`_project_specs/team/state.md`：**

```markdown
# Team State

*Last synced: [timestamp]*

## Active Sessions

| Contributor | Working On | Started | Files Touched | Status |
|-------------|------------|---------|---------------|--------|
| @alice | TODO-042: Add auth | 2024-01-15 10:30 | src/auth/* | 🟢 Active |
| @bob | TODO-038: Fix checkout | 2024-01-15 09:00 | src/cart/* | 🟡 Paused |
| - | - | - | - | - |

## Claimed Todos

| Todo | Claimed By | Since | ETA |
|------|------------|-------|-----|
| TODO-042 | @alice | 2024-01-15 | Today |
| TODO-038 | @bob | 2024-01-14 | Tomorrow |

## Recently Completed (Last 48h)

| Todo | Completed By | When | PR |
|------|--------------|------|-----|
| TODO-037 | @alice | 2024-01-14 | #123 |

## Conflicts to Watch

| Area | Contributors | Notes |
|------|--------------|-------|
| src/auth/* | @alice, @carol | Carol needs auth for TODO-045, coordinate |

## Announcements

- [2024-01-15] @alice: Refactoring auth module, avoid touching until EOD
- [2024-01-14] @bob: New env var required: STRIPE_WEBHOOK_SECRET
```

---

## 贡献者文件

**`_project_specs/team/contributors.md`：**

```markdown
# Contributors

## Team Members

| Handle | Name | Focus Areas | Timezone | Status |
|--------|------|-------------|----------|--------|
| @alice | Alice Smith | Backend, Auth | EST | Active |
| @bob | Bob Jones | Frontend, Payments | PST | Active |
| @carol | Carol White | DevOps, Infra | GMT | Part-time |

## Ownership

| Area | Primary | Backup | Notes |
|------|---------|--------|-------|
| Authentication | @alice | @bob | All auth changes need @alice review |
| Payments | @bob | @alice | Stripe integration |
| Infrastructure | @carol | @alice | Deploy scripts, CI/CD |
| Database | @alice | @carol | Migrations need sign-off |

## Communication

- Slack: #project-name
- PRs: Always tag area owner for review
- Urgent: DM on Slack

## Working Hours Overlap

```
EST:  |████████████████████|
PST:  |   ████████████████████|
GMT:  |████████████|
      6am        12pm       6pm       12am EST

最佳重叠时间：美国东部时间上午 9 点至中午 12 点（三人均可）
```
```

---

## 工作流

### 开始会话

```
┌─────────────────────────────────────────────────────────────────┐
│  START SESSION CHECKLIST                                        │
│  ─────────────────────────────────────────────────────────────  │
│  1. git pull origin main                                        │
│  2. Read _project_specs/team/state.md                           │
│  3. Check claimed todos - don't take what's claimed             │
│  4. Claim your todo in active.md                                │
│  5. Update state.md with your session                           │
│  6. Push state changes before starting work                     │
│  7. Start working                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 认领待办事项

在 `active.md` 中添加认领注释：

```markdown
## [TODO-042] Add email validation

**Status:** in-progress
**Claimed:** @alice (2024-01-15 10:30 EST)
**ETA:** Today

...
```

### 工作期间

- 如果接触到新文件，请更新 `state.md`
- 做出架构决策前，请检查 `decisions.md`
- 如果做出决策，请立即将其添加到 `decisions.md`
- 每隔 1-2 小时推送一次状态更新（让团队保持同步）

### 结束会话

```
┌─────────────────────────────────────────────────────────────────┐
│  END SESSION CHECKLIST                                          │
│  ─────────────────────────────────────────────────────────────  │
│  1. Commit your work (even if WIP)                              │
│  2. Update your current-state.md                                │
│  3. Update team state.md (status → Paused or Done)              │
│  4. If passing to someone: create handoff note                  │
│  5. Unclaim todo if abandoning                                  │
│  6. Push everything                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 创建交接说明

将工作交给另一位团队成员时，创建：

**`_project_specs/team/handoffs/auth-feature-handoff.md`：**

```markdown
# Handoff: Auth Feature (TODO-042)

**From:** @alice
**To:** @bob
**Date:** 2024-01-15

## Status

70% complete. Core auth flow works, need to add:
- [ ] Password reset flow
- [ ] Email verification

## What's Done

- Login/logout working
- JWT tokens implemented
- Session management done

## What's Left

1. Password reset - see src/auth/reset.ts (skeleton exists)
2. Email verification - need to integrate SendGrid

## Key Decisions Made

- Using JWT not sessions (see decisions.md)
- Tokens expire in 7 days
- Refresh tokens stored in httpOnly cookies

## Watch Out For

- The `validateToken` function has a weird edge case with expired tokens
- Don't touch `authMiddleware.ts` - it's fragile rn

## Files to Start With

1. src/auth/reset.ts - password reset
2. src/email/verification.ts - email flow
3. tests/auth.test.ts - add tests here

## Questions?

Slack me @alice if stuck
```

---

## 冲突预防

### 文件级感知

在修改文件之前，检查 state.md 以了解谁正在处理什么：

```markdown
## Active Sessions

| Contributor | Working On | Started | Files Touched | Status |
|-------------|------------|---------|---------------|--------|
| @alice | TODO-042 | ... | src/auth/*, src/middleware/* | 🟢 Active |
```

如果你需要修改 `src/auth/*`，而 Alice 正在处理该目录：
1. 检查是否确实存在冲突（是否是同一个文件？是否是相同的函数？）
2. 在继续之前通过 Slack 协调
3. 在 "Conflicts to Watch" 部分添加备注

### 推送前检查

推送前务必执行：

```bash
git pull origin main
# Resolve any conflicts
git push
```

### PR 标记

始终在 PR 中标记负责相关领域的所有者：

```markdown
## PR: Add password reset flow

Implements TODO-042

cc: @alice (auth owner), @bob (reviewer)

### Changes
- Added password reset endpoint
- Added email templates

### Testing
- [ ] Unit tests pass
- [ ] Manual testing done
```

---

## 决策同步

### 做出决策之前

1. 拉取最新的 `decisions.md`
2. 检查是否已经存在该决策
3. 如果存在类似决策，遵循该决策（保持一致性优先于个人偏好）
4. 如果需要做出新决策，添加该决策并立即推送

### 决策格式

```markdown
## [2024-01-15] JWT vs Sessions for Auth (@alice)

**Decision:** Use JWT tokens
**Context:** Need auth for API and mobile app
**Options:**
1. Sessions - simpler, server-side state
2. JWT - stateless, works for mobile
**Choice:** JWT
**Reasoning:** Mobile app needs stateless auth, JWT works across platforms
**Trade-offs:** Token revocation is harder, need refresh token strategy
**Approved by:** @bob, @carol
```

---

## 命令

### 检查团队状态

```bash
# See who's working on what
cat _project_specs/team/state.md

# Quick active sessions check
grep "🟢 Active" _project_specs/team/state.md
```

### 认领 Todo

1. 编辑 `_project_specs/todos/active.md`
2. 在 todo 中添加认领标注
3. 更新 `_project_specs/team/state.md`
4. 提交并推送

### 释放认领

1. 从 todo 中移除认领标注
2. 更新 state.md（从 Claimed Todos 中移除）
3. 提交并推送

---

## 团队 Git Hooks

### 添加推送前 Hook

将团队状态同步检查添加到 pre-push：

```bash
# In .git/hooks/pre-push (add to existing)

# Check if team state is current
echo "🔄 Checking team state..."
git fetch origin main --quiet

LOCAL_STATE=$(git show HEAD:_project_specs/team/state.md 2>/dev/null | md5)
REMOTE_STATE=$(git show origin/main:_project_specs/team/state.md 2>/dev/null | md5)

if [ "$LOCAL_STATE" != "$REMOTE_STATE" ]; then
    echo "⚠️  Team state has changed on remote!"
    echo "   Run: git pull origin main"
    echo "   Then check _project_specs/team/state.md for updates"
    # Warning only, don't block
fi
```

---

## Claude 指令

### 会话开始时

当用户在团队项目中开始会话时：

1. 检查是否存在 `_project_specs/team/state.md`
2. 如果存在，读取该文件并报告：
   - 当前有哪些人处于活跃状态
   - 哪些 todo 已被认领
   - 需要注意的任何冲突
   - 最近的公告

3. 询问他们想要处理什么
4. 检查该事项是否已被认领
5. 帮助他们认领并更新状态

### 会话期间

- 在操作文件之前，检查是否有其他人正在那里工作
- 在做出决策之前，检查 decisions.md
- 定期提醒用户更新状态

### 会话结束时

- 提示用户更新 state.md
- 询问他们是否需要创建交接
- 提醒他们推送状态变更

---

## 单人 → 多人协作转换

当项目需要团队协作时：

1. 运行 `/check-contributors`
2. 创建 `_project_specs/team/` 结构
3. 初始化 `state.md` 和 `contributors.md`
4. 为活动待办事项添加认领注释
5. 更新 CLAUDE.md 以引用 team-coordination.md skill

---

## 快速参考

### 状态图标

```
🟢 Active - Currently working
🟡 Paused - Stepped away, will return
🔴 Blocked - Needs help/waiting on something
⚪ Offline - Not working today
```

### 认领格式

```markdown
**Claimed:** @handle (YYYY-MM-DD HH:MM TZ)
```

### 每日站会模板

```markdown
## Standup [DATE]

### @alice
- Yesterday: Finished TODO-042 auth flow
- Today: Starting TODO-045 password reset
- Blockers: None

### @bob
- Yesterday: Fixed checkout bug
- Today: Payment webhook integration
- Blockers: Need STRIPE_WEBHOOK_SECRET from @carol
```

---

## 检查清单

### 开始工作
- [ ] `git pull origin main`
- [ ] 读取 `team/state.md`
- [ ] 检查待办事项是否未被认领
- [ ] 在 `active.md` 中认领待办事项
- [ ] 更新 `state.md`
- [ ] 推送状态变更

### 结束工作
- [ ] 提交所有变更
- [ ] 更新 `current-state.md`
- [ ] 更新 `team/state.md`
- [ ] 如有需要，创建交接
- [ ] 推送所有内容