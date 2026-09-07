---
name: session-analyzer
description: This skill should be used when the user asks to "analyze session", "세션 분석", "evaluate skill execution", "스킬 실행 검증", "check session logs", "로그 분석", provides a session ID with a skill path, or wants to verify that a skill executed correctly in a past session. Post-hoc analysis of Claude Code sessions to validate skill/agent/hook behavior against SKILL.md specifications.
version: 1.0.0
user-invocable: true
---
# Session Analyzer Skill

用于对照 SKILL.md 规范验证 Claude Code 会话行为的事后分析工具。

## 用途

分析已完成的会话，以验证：
1. **预期行为 vs 实际行为** - 技能是否遵循了 SKILL.md 的工作流程？
2. **组件调用** - SubAgents、Hooks 和工具是否被正确调用？
3. **产物** - 预期的文件是否被创建/删除？
4. **Bug 检测** - 是否存在意外错误或偏差？

---

## 输入要求

| 参数 | 是否必需 | 说明 |
|-----------|----------|-------------|
| `sessionId` | YES | 待分析会话的 UUID |
| `targetSkill` | YES | 用于对照验证的 SKILL.md 路径 |
| `additionalRequirements` | NO | 额外的验证标准 |

---

## 阶段 1：定位会话文件

### 步骤 1.1：查找会话文件

会话文件位于 `~/.claude/`：

```bash
# Main session log
~/.claude/projects/-{encoded-cwd}/{sessionId}.jsonl

# Debug log (detailed)
~/.claude/debug/{sessionId}.txt

# Agent transcripts (if subagents were used)
~/.claude/projects/-{encoded-cwd}/agent-{agentId}.jsonl
```

使用脚本定位文件：
```bash
${baseDir}/scripts/find-session-files.sh {sessionId}
```

### 步骤 1.2：确认文件存在

在继续之前，请确认所有必需的文件均存在。如果调试日志缺失，分析将受到限制。

---

## 阶段 2：解析目标 SKILL.md

### 步骤 2.1：提取预期组件

阅读目标 SKILL.md 并识别：

**来自 YAML Frontmatter：**
- `hooks.PreToolUse` - 预期的 PreToolUse 钩子及匹配器
- `hooks.PostToolUse` - 预期的 PostToolUse 钩子
- `hooks.Stop` - 预期的 Stop 钩子
- `hooks.SubagentStop` - 预期的 SubagentStop 钩子
- `allowed-tools` - 该技能被允许使用的工具

**来自 Markdown 正文：**
- 提及的 SubAgents（`Task(subagent_type="...")`）
- 调用的技能（`Skill("...")`）
- 创建的产物（`.dev-flow/drafts/`、`.dev-flow/plans/` 等）
- 工作流程步骤和条件

### 步骤 2.2：构建预期行为清单

根据 SKILL.md 分析结果创建清单：

```markdown
## Expected Behavior

### SubAgents
- [ ] Explore agent called (parallel, run_in_background)
- [ ] gap-analyzer called before plan generation
- [ ] reviewer called after plan creation

### Hooks
- [ ] PreToolUse[Edit|Write] triggers plan-guard.sh
- [ ] Stop hook validates reviewer approval

### Artifacts
- [ ] Draft file created at .dev-flow/drafts/{name}.md
- [ ] Plan file created at .dev-flow/plans/{name}.md
- [ ] Draft file deleted after OKAY

### Workflow
- [ ] Interview Mode before Plan Generation
- [ ] User explicit request triggers plan generation
- [ ] Reviewer REJECT causes revision loop
```

---

## 阶段 3：分析调试日志

调试日志（`~/.claude/debug/{sessionId}.txt`）包含详细的执行轨迹。

### 步骤 3.1：提取 SubAgent 调用

搜索模式：
```
SubagentStart with query: {agent-name}
SubagentStop with query: {agent-id}
```

使用脚本：
```bash
${baseDir}/scripts/extract-subagent-calls.sh {debug-log-path}
```

### 步骤 3.2：提取钩子事件

搜索模式：
```
Getting matching hook commands for {HookEvent} with query: {tool-name}
Matched {N} unique hooks for query "{query}"
Hooks: Processing prompt hook with prompt: {prompt}
Hooks: Prompt hook condition was met/not met
permissionDecision: allow/deny
```

使用脚本：
```bash
${baseDir}/scripts/extract-hook-events.sh {debug-log-path}
```

### 步骤 3.3：提取工具调用

搜索模式：
```
executePreToolHooks called for tool: {tool-name}
File {path} written atomically
```

### 步骤 3.4：提取钩子结果

对于基于 prompt 的钩子，查找模型响应：
```
Hooks: Model response: {
  "ok": true/false,
  "reason": "..."
}
```

---

## 阶段 4：验证产物

### 步骤 4.1：检查文件创建

对每个预期的产物：
1. 在调试日志中搜索 `FileHistory: Tracked file modification for {path}`
2. 搜索 `File {path} written atomically`
3. 验证当前文件系统状态

### 步骤 4.2：检查文件删除

对于应当被删除的文件：
1. 在 Bash 调用中搜索 `rm` 命令
2. 验证该文件在文件系统中已不存在

---

## 阶段 5：比较预期与实际行为

### 步骤 5.1：构建对比表

```markdown
| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Explore agent | 2 parallel calls | 2 calls at 09:39:26 | ✅ |
| gap-analyzer | Called before plan | Called at 09:43:08 | ✅ |
| reviewer | Called after plan | 2 calls (REJECT→OKAY) | ✅ |
| PreToolUse hook | Edit\|Write matcher | Triggered for Write | ✅ |
| Stop hook | Validates approval | Returned ok:true | ✅ |
| Draft file | Created then deleted | Created→Deleted | ✅ |
| Plan file | Created | Exists (10KB) | ✅ |
```

### 步骤 5.2：识别偏差

标记任何不匹配之处：
- 缺失的组件调用
- 错误的操作顺序
- 钩子失败
- 缺失的产物
- 意外的错误

---

## 阶段 6：生成报告

### 报告模板

```markdown
# Session Analysis Report

## Session Info
- **Session ID**: {sessionId}
- **Target Skill**: {skillPath}
- **Analysis Date**: {date}

---

## 1. Expected Behavior (from SKILL.md)

[Summary of expected workflow]

---

## 2. Skill/SubAgent/Hook Verification

### SubAgents
| SubAgent | Expected | Actual | Time | Result |
|----------|----------|--------|------|--------|
| ... | ... | ... | ... | ✅/❌ |

### Hooks
| Hook | Matcher | Triggered | Result |
|------|---------|-----------|--------|
| ... | ... | ... | ✅/❌ |

---

## 3. Artifacts Verification

| Artifact | Path | Expected State | Actual State |
|----------|------|----------------|--------------|
| ... | ... | ... | ✅/❌ |

---

## 4. Issues/Bugs

| Severity | Description | Location |
|----------|-------------|----------|
| ... | ... | ... |

---

## 5. Overall Result

**Verdict**: ✅ PASS / ❌ FAIL

**Summary**: [1-2 sentence summary]
```

---

## 脚本参考

| 脚本 | 用途 |
|--------|---------|
| `find-session-files.sh` | 定位某个会话 ID 对应的所有文件 |
| `extract-subagent-calls.sh` | 从调试日志中解析 subagent 调用 |
| `extract-hook-events.sh` | 从调试日志中解析钩子事件 |

---

## 使用示例

```
User: "Analyze session 3cc71c9f-d27a-4233-9dbc-c4f07ea6ec5b against .claude/skills/specify/SKILL.md"

1. Find session files
2. Parse SKILL.md → Expected: Explore, gap-analyzer, reviewer, hooks
3. Analyze debug log → Extract actual calls
4. Verify artifacts → Check .dev-flow/
5. Compare → Build verification table
6. Generate report → PASS/FAIL with details
```

---

## 其他资源

### 参考文件
- **`references/analysis-patterns.md`** - 用于日志分析的详细 grep 模式
- **`references/common-issues.md`** - 已知问题与排查方法

### 脚本
- **`scripts/find-session-files.sh`** - 会话文件定位器
- **`scripts/extract-subagent-calls.sh`** - SubAgent 调用提取器
- **`scripts/extract-hook-events.sh`** - 钩子事件提取器
