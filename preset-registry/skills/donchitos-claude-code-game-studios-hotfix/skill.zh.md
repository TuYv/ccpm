---
name: hotfix
description: "Emergency fix workflow that bypasses normal sprint processes with a full audit trail. Creates hotfix branch, tracks approvals, and ensures the fix is backported correctly."
argument-hint: "[bug-id or description]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion
model: sonnet
---
> **仅限显式调用**：此技能仅应在用户使用 `/hotfix` 明确请求时运行。不要根据上下文匹配自动调用。

## 阶段 1：评估严重程度

阅读缺陷描述或 ID。使用以下标准评估严重程度：

- **S1（严重）**：游戏无法游玩、数据丢失、安全漏洞
- **S2（重大）**：重要功能损坏，但存在变通方案
- **S3 或更低**：轻微问题——适用常规缺陷修复工作流

使用 `AskUserQuestion` 进行确认：
- 提示："我已将此问题评估为 **[assessed severity]**——[brief rationale]。请确认严重程度以继续："
- 选项：
  - `[A] S1（严重）——游戏无法游玩、数据丢失或安全问题`
  - `[B] S2（重大）——重要功能损坏，但存在变通方案`
  - `[C] S3 或更低——转至常规缺陷修复工作流`

如果选择 [C]：停止。结论：**已重定向**——S3 及更低级别的问题请使用常规缺陷修复工作流。

---

## 阶段 2：创建热修复记录

起草热修复记录：

```markdown
## Hotfix: [Short Description]
Date: [Date]
Severity: [S1/S2]
Reporter: [Who found it]
Status: IN PROGRESS

### Problem
[Clear description of what is broken and the player impact]

### Root Cause
[To be filled during investigation]

### Fix
[To be filled during implementation]

### Testing
[What was tested and how]

### Approvals
- [ ] Fix reviewed by lead-programmer
- [ ] Regression test passed (qa-tester)
- [ ] Release approved (producer)

### Rollback Plan
[How to revert if the fix causes new issues]
```

询问："我可以将此内容写入 `production/hotfixes/hotfix-[date]-[short-name].md` 吗？"

如果可以，则写入该文件，并在需要时创建目录。

---

## 阶段 3：创建热修复分支

检查这是否是 git 仓库：

`Bash: git rev-parse --is-inside-work-tree 2>/dev/null`

如果此命令失败或返回空值：注明“不是 git 仓库——请手动创建分支。”并跳过分支创建。

如果检查通过，请在创建分支前使用 `AskUserQuestion`：
- 提示："已准备好从 [base-ref] 创建热修复分支 'hotfix/[short-name]' 吗？"
- 选项：
  - `[A] 是——创建分支`
  - `[B] 使用其他基础引用——我会指定`
  - `[C] 跳过——我会自行创建分支`

仅当用户选择 [A] 时运行 `git checkout -b hotfix/[short-name] [base-ref]`。如果选择 [B]：请用户提供基础引用，然后使用该引用运行命令。如果选择 [C]：跳过分支创建并继续执行阶段 4。

---

## 阶段 4：调查并实施

专注于能够解决问题的最小变更。不要在热修复过程中同时进行重构、清理或添加功能。

通过运行受影响系统的针对性测试来验证修复。检查相邻系统是否出现回归问题。

更新热修复记录，补充根本原因、修复详情和测试结果。

---

## 阶段 5：收集批准

使用 Task 工具并行请求签核：

- `subagent_type: lead-programmer`——审查修复的正确性和副作用
- `subagent_type: qa-tester`——对受影响的系统运行针对性回归测试
- `subagent_type: producer`——批准部署时间和沟通计划

在继续之前，三者都必须返回 APPROVE。如果其中任何一个返回 CONCERNS 或 REJECT，请勿部署——先明确问题并将其解决。

---

## 阶段 5b：QA 重新准入门禁

获得批准后，确定部署热修复之前所需的 QA 范围。通过 Task 启动 `qa-lead`，并提供：
- 热修复说明和受影响的系统
- 阶段 5 的回归测试结果
- 涉及已更改文件的所有系统列表（使用 Grep 查找调用方）

询问 qa-lead：**完整冒烟检查是否足够，还是此修复需要进行有针对性的 team-qa 测试？**

根据结论执行：
- **冒烟检查足够**——针对热修复构建运行 `/smoke-check`。如果结果为 PASS，则进入阶段 6。
- **需要有针对性的 QA 测试**——仅针对已更改的系统运行 `/team-qa [affected-system]`。如果 QA 返回 APPROVED 或 APPROVED WITH CONDITIONS，则进入阶段 6。
- **需要完整 QA**——涉及核心系统的 S1 修复可能需要运行完整的 `/team-qa sprint`。这会延迟部署，但可以防止发布有问题的补丁。

不得跳过此门禁。一个破坏其他功能的热修复比原始缺陷更糟糕。

---

## 阶段 6：更新缺陷状态并部署

如果原始缺陷文件存在，请更新该文件：

```markdown
## Fix Record
**Fixed in**: hotfix/[branch-name] — [commit hash or description]
**Fixed date**: [date]
**Status**: Fixed — Pending Verification
```

在缺陷文件头部将 `**Status**: Fixed — Pending Verification` 设置为该值。

输出部署摘要：

```
## Hotfix Ready to Deploy: [short-name]

**Severity**: [S1/S2]
**Root cause**: [one line]
**Fix**: [one line]
**QA gate**: [Smoke check PASS / Team-QA APPROVED]
**Approvals**: lead-programmer ✓ / qa-tester ✓ / producer ✓
**Rollback plan**: [from Phase 2 record]

Merge to: release branch AND development branch
Next: /bug-report verify [BUG-ID] after deploy to confirm resolution
```

### 规则
- 热修复必须是解决问题所需的最小改动——不得清理代码，不得重构
- 每个热修复都必须在部署前记录回滚计划
- 热修复分支必须同时合并到发布分支和开发分支
- 所有热修复都必须在 48 小时内进行事后审查
- 如果修复过于复杂，需要超过 4 小时，请上报给 `technical-director`

---

## 阶段 7：部署后验证

部署后，运行 `/bug-report verify [BUG-ID]`，确认该修复已在部署的构建中解决问题。

如果结果为 VERIFIED FIXED：运行 `/bug-report close [BUG-ID]`，正式关闭该缺陷。
如果结果为 STILL PRESENT：热修复失败——立即重新打开缺陷，评估是否回滚，并进行上报。

使用 `/retrospective hotfix` 安排在 48 小时内进行事后审查。

使用 `AskUserQuestion`：
- 提示："热修复已完成。下一步做什么？"
- 选项：
  - `[A] Run /smoke-check to verify the fix`
  - `[B] Run /patch-notes to document this hotfix`
  - `[C] Stop here`