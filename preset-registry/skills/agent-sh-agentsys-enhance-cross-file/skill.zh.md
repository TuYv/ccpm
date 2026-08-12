---
name: enhance-cross-file
description: "Use when checking cross-file consistency: tools vs frontmatter, agent references, duplicate rules, contradictions."
version: 5.1.0
argument-hint: "[path]"
---
# enhance-cross-file

分析 agents、skills 和 workflows 之间的跨文件语义一致性。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const targetPath = args.find(a => !a.startsWith('--')) || '.';
```

## 用途

检测跨越多个文件的问题——这些问题无法通过单文件分析发现：
- 提示词正文中使用了工具，但未在前置元数据中声明
- 引用了不存在的 Agent
- 多个文件中存在重复指令（增加维护负担）
- 规则相互矛盾（ALWAYS 与 NEVER 冲突）
- 存在未被任何工作流引用的孤立 Agent
- Skill 工具不匹配（allowed-tools 与实际使用情况不一致）

## 工作流

1. **运行分析器** - 执行 JavaScript 分析器以获取检测结果：
   ```bash
   node -e "const a = require('./lib/enhance/cross-file-analyzer.js'); console.log(JSON.stringify(a.analyze('.'), null, 2));"
   ```
   对于特定路径：`a.analyze('./plugins/enhance')`

2. **解析结果** - 分析器返回包含 `summary` 和 `findings` 的 JSON
3. **报告** - 按类别返回检测结果

JavaScript 分析器（`lib/enhance/cross-file-analyzer.js`）实现了所有跨文件检测。以下模式为参考文档。

## 检测模式

### 1. 工具一致性（中等确定性）

**tool_not_in_allowed_list**：提示词正文中使用了工具，但该工具不在前置元数据的 `tools:` 列表中

```yaml
# Frontmatter declares:
tools: Read, Grep

# But body uses:
Use Write({ file_path: "/out" })  # <- Not declared!
```

**skill_tool_mismatch**：Skill 的 `allowed-tools` 与 Skill 正文中实际使用的工具不匹配

### 2. 工作流一致性（中等确定性）

**missing_workflow_agent**：`subagent_type: "plugin:agent-name"` 引用了不存在的 Agent

**orphaned_prompt**：Agent 文件存在，但没有任何工作流引用它（可能是入口点——需手动检查）

**incomplete_phase_transition**：工作流阶段提到了 `Phase N`，但不存在对应的章节

### 3. 指令一致性（中等确定性）

**duplicate_instructions**：相同的 MUST/NEVER 指令出现在 3 个或更多文件中（应提取到共享位置）

**contradictory_rules**：一个文件要求 `ALWAYS X`，而另一个文件要求 `NEVER X`

## 输出格式

```markdown
## Cross-File Analysis

**Files Analyzed**: {agents} agents, {skills} skills, {commands} commands

### Tool Consistency ({n})
| Agent | Issue | Fix |
|-------|-------|-----|
| exploration-agent | Uses Write but not in tools list | Add Write to frontmatter |

### Workflow Issues ({n})
| Source | Issue | Fix |
|--------|-------|-----|
| workflow.md | References nonexistent agent | Check spelling or create agent |

### Instruction Consistency ({n})
| Instruction | Files | Fix |
|-------------|-------|-----|
| "NEVER push --force" | 4 files | Extract to CLAUDE.md |
```

## 约束

- 所有模式均为中等确定性（需要结合上下文判断）
- 不自动修复（跨文件更改需要人工审查）
- 跳过 `<bad-example>`、`<bad_example>`、`<badexample>` 标签内的内容
- 跳过信息字符串中包含 `bad` 的代码块内容
- 入口点 Agent（orchestrator、validator、discoverer）不视为孤立 Agent

## 模式统计

| 类别 | 模式数 | 可自动修复 |
|----------|----------|--------------|
| 工具一致性 | 2 | 0 |
| 工作流 | 3 | 0 |
| 一致性 | 3 | 0 |
| **总计** | **8** | **0** |