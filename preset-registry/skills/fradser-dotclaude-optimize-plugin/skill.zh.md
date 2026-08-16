---
name: optimize-plugin
description: This skill should be used when the user asks to "validate a plugin", "optimize plugin", "check plugin quality", "review plugin structure", or "run plugin optimizer".
argument-hint: <plugin-path>
user-invocable: true
allowed-tools: ["Read", "Glob", "Bash(realpath:*)", "Bash(python3:*)", "AskUserQuestion", "TaskCreate", "TaskUpdate", "Skill", "Task"]
---
# 插件优化

执行插件验证和优化工作流。**目标：** $ARGUMENTS

## 背景知识

使用 Skill 工具加载 `plugin-optimizer:plugin-best-practices` skill，以获取组件模板、工具调用规则和类型分类。

## 阶段 1：发现与验证

**目标**：验证结构并检测问题。编排器不得应用修复。

**操作**：
1. 使用 `realpath` 解析路径并验证其是否存在
2. 验证 `.claude-plugin/plugin.json` 是否存在
3. 查找组件目录：`commands/`、`agents/`、`skills/`、`hooks/`
4. 根据 `${CLAUDE_PLUGIN_ROOT}/examples/` 模板验证组件
5. 评估架构：如果 `commands/` 存在且包含 `.md` 文件，则使用 `AskUserQuestion` 工具询问是否迁移到 skills 结构
6. 运行验证：`python3 ${CLAUDE_PLUGIN_ROOT}/scripts/validate-plugin.py "$TARGET"`
   - 选项：`--check=structure,manifest,frontmatter,tools,tokens`
   - JSON 输出：`--json`
   - 详细输出：`-v, --verbose`
7. 按严重程度汇总问题（严重、警告、信息）

## 阶段 2：基于 Agent 的优化

**目标**：启动 agent 以应用所有修复。编排器不直接进行修复。

**条件**：始终执行。

**操作**：
1. 使用以下提示词内容启动 `plugin-optimizer:plugin-optimizer` agent：
   - 目标插件路径（阶段 1 中获得的绝对路径）
   - 验证控制台输出（阶段 1 中的问题列表）
   - 模板验证结果
   - 用户决定（如适用，包括迁移选择）
   - 指令：分析验证输出以识别问题
2. Agent 自主应用修复（在应用模板修复之前，必须使用 `AskUserQuestion` 工具，展示违规项的具体示例以及修复前后的对比）
3. Agent 在修复后递增 `.claude-plugin/plugin.json` 中的版本号：
   - 补丁版本（x.y.Z+1）：错误修复
   - 次版本（x.Y+1.0）：新增组件
   - 主版本（X+1.0.0）：破坏性变更
4. 等待 agent 完成

**路径引用规则**：
- 同一目录：使用相对路径（`./reference.md`）
- 目录外部：使用 `${CLAUDE_PLUGIN_ROOT}` 路径
- 组件模板：参见 `${CLAUDE_PLUGIN_ROOT}/examples/`

**冗余与效率**：
- 冗余：允许有策略地重复关键内容（必须/应该要求）。优先采用简洁的重述。
- 效率：Agent 检测任务是否需要 Agent Teams（可并行处理 > 5 个文件、跨多个领域）。

## 阶段 3：验证与交付物

**目标**：验证修复、生成报告并更新文档。

**操作**：
1. 执行验证脚本：`python3 ${CLAUDE_PLUGIN_ROOT}/scripts/validate-plugin.py "$TARGET"`
2. 分析结果：与阶段 1 的发现进行比较，确认严重问题已解决
3. 如果仍存在严重问题，则恢复 agent 执行
4. 使用下方模板生成最终验证报告
5. 更新 `README.md` 以反映当前状态（元数据、目录结构、使用说明；不要追加版本历史日志）

## 验证报告模板

```markdown
## Plugin Validation Report

### Plugin: [name]
Location: [absolute-path]
Version: [old] -> [new]

### Summary
[2-3 sentences with key statistics]

### Phase 1: Issues Detected
#### Critical ([count])
- `file/path` - [Issue description]

#### Warnings ([count])
- `file/path` - [Issue description]

### Phase 2: Fixes Applied
#### Structure Fixes
- [Fix description]

#### Template Conformance
- **Agents**: [Count] validated, [count] fixed
- **Instruction-type Skills**: [Count] validated, [count] fixed
- **Knowledge-type Skills**: [Count] validated, [count] fixed

#### Redundancy Fixes
- [Consolidations applied]

### Phase 3: Verification Results
- Structure validation: [PASS/FAIL]
- Manifest validation: [PASS/FAIL]
- Component validation: [PASS/FAIL]
- Tool patterns validation: [PASS/FAIL]
- Token budgets validation: [PASS/FAIL]

### Token Budget Analysis
- Skills analyzed: [count]
- Tier 1 (Metadata ~100): [OK count], [WARNING count]
- Tier 2 (SKILL.md under 5k): [OK count], [WARNING count], [CRITICAL count]
- Tier 3 (References, effectively unlimited): [total tokens]

### Component Inventory
- Commands: [count] found, [count] valid
- Agents: [count] found, [count] valid
- Skills: [count] found, [count] valid

### Remaining Issues
[Issues that couldn't be auto-fixed with explanations]

### Overall Assessment
[PASS/FAIL] - [Detailed reasoning]
```