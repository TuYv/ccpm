---
name: pm-planning
description: Decomposition methodology for pm agent — turns an approved ARCH document into a Beads task list with explicit dependencies, time-boxes, and acceptance criteria. The pipeline can only orchestrate work it can see; this skill defines what "seeable work" looks like.
when_to_use: |
  Apply when:
  - pm agent receives an approved ARCH-*.md from architect
  - pm needs to write PLAN-*.md
  - pm creates Beads tasks for senior-dev to claim
  Do NOT apply for:
  - nano archetypes (pm phase is skipped — senior-dev claims one task directly)
  - bug-fixes with a one-line repro (no decomposition needed)
effort: medium
allowed-tools: Read, Write, Bash(bd:*)
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
---
# PM 规划——将 ARCH 拆解为任务

pm 智能体的职责是接收架构师的 ARCH 文档，并产出以下两项内容：
1. 一份供人阅读的 `PLAN-<feature>.md`
2. 一系列供 senior-dev 认领的 `bd create` 任务

如果一名全新的 senior-dev（没有任何先前上下文）可以接手这些 bd 任务并完成交付，而不需要回来请求澄清，那么这份计划就是合格的。

## 拆解规则

### 规则 1. 任务不超过 4 小时

任何更大的任务都要拆分。如果任务是“构建身份验证系统”，应拆分为：
- 用户表的 Schema 迁移
- 包含哈希处理的注册端点
- 签发 JWT 的登录端点
- 注销 / 令牌撤销
- 测试

每项都不超过 4 小时。如果无法拆分，说明任务不明确——返回 ARCH 并进行澄清。

### 规则 2. 每个任务只产出一个制品

每个任务只产出以下其中一项：
- 一个代码文件（新建或修改）
- 一项数据库迁移
- 一个测试文件
- 一项文档更新
- 一项配置变更

如果一个任务产出多个不相关的制品，应将其拆分。

### 规则 3. 通过 `--blocks` 明确声明依赖关系

当任务 B 需要任务 A 的产出时：

```bash
bd create "Task A: schema migration" -p P1
# returns id: my-proj-001-abc

bd create "Task B: signup endpoint" -p P1 \
  --blocks-on my-proj-001-abc \
  --label senior-dev
```

流水线编排器通过读取 `bd ready --assignee senior-dev` 来确定哪些任务可以认领。依赖尚未完成的前置任务所阻塞的任务不会出现。

### 规则 4. 验收标准——“完成”意味着什么？

每个任务描述都以带项目符号的“Done when:”部分结尾。

```markdown
## Done when:
- [ ] POST /signup returns 201 with user_id on success
- [ ] Bad email returns 400 with "invalid_email"
- [ ] Duplicate email returns 409 with "email_taken"
- [ ] Password is hashed with argon2 (no plaintext in DB)
- [ ] Unit test in `tests/<area>/<feature>.test.ts` covers all 4 cases
- [ ] `npm test` passes
```

senior-dev 能够准确知道需要交付什么，以及何时可以停止。

### 规则 5. 负责人和并行执行

如果 3 个任务可以并行执行，应分别标明每个任务交由哪个智能体处理。不要将它们捆绑在一起。

```bash
bd create "..." --label senior-dev
bd create "..." --label senior-dev   # parallel
bd create "..." --label devops       # parallel, different agent
```

## PLAN-*.md 模板

```markdown
# PLAN — <feature>

Date: <ISO>
Architect ARCH: docs/architecture/ARCH-<feature>.md
Owner: pm

## Summary

2-3 sentences. What problem, what solution. Reference ARCH for detail.

## Cost estimate

(Follow skill: cost-model)

## Tasks

1. **<title>** [P1, ≤2h, senior-dev]
   - Goal: <one-sentence>
   - Done when: <bulleted criteria>
   - bd id: <ID after create>

2. **<title>** [P1, ≤4h, senior-dev]
   - Blocked on: 1
   - Goal: ...
   - Done when: ...

3. **<title>** [P2, ≤1h, qa-engineer]
   - Blocked on: 1, 2

## Pre-mortem

(Follow skill: pre-mortem)

## Gates

(Follow GATES_BY_ARCHETYPE for this archetype + project_size)
- [ ] gate:plan — after pm finishes, before senior-dev starts
- [ ] gate:qa — after qa-engineer, before ship
- [ ] gate:ship — after security-officer, before devops
```

## pm 应该拒绝而不是制定计划的情况

如果 ARCH 不完整，pm 代理可以——而且理应——拒绝制定计划。具体而言：

❌ **ARCH 缺少该功能本身的验收标准。**
退回：“ARCH 说要‘构建 webhook 处理程序’，但没有说明怎样才算成功。请重新设计架构，并明确成功标准。”

❌ **ARCH 没有指定失败模式。**
退回：“ARCH 说要‘妥善处理错误’，但没有说明‘妥善’具体指什么。请明确：记录日志 + ack？记录日志 + 重试？记录日志 + 告警？”

❌ **ARCH 与现有 ADR 冲突。**
退回：“ARCH 提议使用 Postgres，但 ADR-005 已规定使用 DynamoDB。
请先解决冲突，再制定计划。”

退回意见通过 `bd update` + 标签 `re-arch` 发送给架构师。在 ARCH 完善之前，计划将被阻塞。

## 反模式

❌ **任务以组件而非目标命名。** “构建 UserService”含义不明确。“添加 POST /signup 端点，并使用 argon2 对密码进行哈希处理”则很清晰。

❌ **未声明依赖关系。** 两个任务编辑同一个文件却没有
`--blocks-on`，将会发生冲突。务必声明依赖关系。

❌ **未实际完成一个任务就进行估算。** 如果你确实不知道
任务 1 需要多长时间，请让 senior-dev 先完成任务 1 并反馈。
然后再估算任务 2–N。

❌ **任务耗时超过 8 小时。** 拆分任务。没有例外。