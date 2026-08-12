---
name: enhance-claude-memory
description: "Use when improving CLAUDE.md or AGENTS.md project memory files."
version: 5.1.0
---
# enhance-claude-memory

分析项目记忆文件（CLAUDE.md、AGENTS.md）以进行优化。

## 跨工具检测

按以下顺序搜索项目记忆文件：
1. CLAUDE.md（Claude Code）
2. AGENTS.md（OpenCode、Codex）
3. .github/CLAUDE.md
4. .github/AGENTS.md

## 文件层级（参考）

**CLAUDE.md**（Claude Code）：
| 位置 | 作用域 |
|----------|-------|
| `~/.claude/CLAUDE.md` | 全局（所有项目） |
| `.claude/CLAUDE.md` or `./CLAUDE.md` | 项目根目录 |
| `src/.claude/CLAUDE.md` | 特定目录 |

**AGENTS.md**（OpenCode、Codex 及其他 AI 工具）：
| 位置 | 作用域 |
|----------|-------|
| `~/.config/opencode/AGENTS.md` or `~/.codex/AGENTS.md` | 全局（所有项目） |
| `.opencode/AGENTS.md` or `./AGENTS.md` | 项目根目录 |
| `src/AGENTS.md` | 特定目录 |

这两种文件的用途相同：为 AI 助手提供项目记忆。Claude Code 项目使用 CLAUDE.md；若要实现跨工具兼容性，则使用 AGENTS.md；若要获得最大覆盖范围，也可以同时使用两者。

## 工作流程

1. **查找** - 在项目中定位 CLAUDE.md 或 AGENTS.md
2. **读取** - 加载其内容以及 README.md 以进行比较
3. **分析** - 运行所有模式检查
4. **验证** - 根据文件系统检查文件和命令引用
5. **度量** - 计算 token 指标和重复内容
6. **报告** - 生成结构化 Markdown 输出

## 检测模式

### 1. 结构验证（高确定性）

#### 关键规则章节
- 应包含 `## Critical Rules` 或类似章节
- 规则应按优先级排列（编号或有序排列）
- 每条规则都应包含对其原因的说明

#### 架构章节
- 目录树或结构概览
- 关键文件位置
- 模块关系

#### 关键命令章节
- 常用开发命令
- 测试、构建和部署脚本
- 对 package.json 脚本的引用

### 2. 指令有效性（高确定性）

根据提示词工程研究，在以下情况下，Claude 能更好地遵循指令：

#### 肯定式优于否定式
- **不佳**：“不要使用 console.log”
- **良好**：“所有输出均使用日志记录工具”
- 检查没有提供肯定式替代方案的 “don't”、“never”、“avoid”

#### 强约束语言
- 对关键规则使用 “must”、“always”、“required”
- 弱约束语言（“should”、“try to”、“consider”）会降低遵循率
- 标记使用弱约束语言的关键规则

#### 指令层级
- 应定义规则冲突时的优先顺序
- 模式：“发生冲突时：X 优先于 Y”
- 系统指令 > 用户请求 > 外部内容

### 3. 内容位置（高确定性）

研究表明，大语言模型存在“中间信息遗失”问题——它们对开头和结尾的记忆优于中间部分。

#### 关键内容位置
- 最重要的规则应位于文件开头
- 次重要的规则应位于文件结尾
- 支持性上下文应位于中间
- 标记埋在中间章节的关键规则

#### 推荐的结构顺序
```
1. Critical Rules (START - highest attention)
2. Architecture/Structure
3. Commands/Workflows
4. Examples/References
5. Reminders/Constraints (END - high attention)
```

### 4. 引用验证（HIGH 确定性）

#### 文件引用
- 从 `[text](path)` 和 `` `path/to/file.ext` `` 中提取
- 验证每个引用的文件是否存在于文件系统中

#### 命令引用
- 提取 `npm run <script>` 和 `npm <command>`
- 根据 package.json 中的 scripts 进行验证

### 5. 效率分析（MEDIUM 确定性）

#### Token 数量
- 估算方式：`characters / 4` 或 `words * 1.3`
- 建议上限：1500 个 token（约 6000 个字符）
- 标记超过阈值的文件

#### README 重复内容
- 检测与 README.md 重叠的内容
- 标记内容重复率 >40% 的文件
- CLAUDE.md 应补充 README，而不是重复其内容

#### 冗长程度
- 优先使用项目符号列表，而非散文式段落
- 以列表形式呈现约束更易于理解和遵循
- 标记较长的散文式文本块（>5 个句子）

### 6. 质量检查（MEDIUM 确定性）

#### WHY 说明
- 规则应说明其理由
- 格式：`*WHY: explanation*` 或缩进说明
- 标记没有说明理由的规则

#### 结构深度
- 避免过深的嵌套（>3 层）
- 保持层级结构易于快速浏览
- 扁平化结构更易于解析

#### XML 风格标签（可选增强）
- Claude 使用 XML 标签进行过训练
- `<critical-rules>`、`<architecture>`、`<constraints>` 可改善解析效果
- 并非必需，但可以提升指令遵循效果

### 7. Agent/Skill 定义（MEDIUM 确定性）

如果文件定义了自定义 agent 或 skill：

#### Agent 定义格式
```markdown
### agent-name
Model: claude-sonnet-4-20250514
Description: What this agent does and when to use it
Tools: Read, Grep, Glob
Instructions: Specific behavioral instructions
```

必填字段：Description（何时使用）、Tools（受限集合）  
可选字段：Model、Instructions

#### Skill 引用
- Skill 应具有清晰的触发条件说明
- “Use when...”格式有助于自动调用

### 8. 跨平台兼容性（MEDIUM/HIGH 确定性）

#### 状态目录
- 不要硬编码 `.claude/`
- 支持 `.opencode/`、`.codex/`
- 使用 `${STATE_DIR}/` 或记录不同平台的目录差异

#### 术语
- 对于共享文件，避免使用 Claude 特有的表述
- 统一使用“AI 助手”这一通用称谓
- 或明确说明“Claude Code”与“OpenCode”之间的差异

## 输出格式

```markdown
# Project Memory Analysis: {filename}

**File**: {path}
**Type**: {CLAUDE.md | AGENTS.md}

## Metrics
| Metric | Value |
|--------|-------|
| Estimated Tokens | {tokens} |
| README Overlap | {percent}% |

## Summary
| Certainty | Count |
|-----------|-------|
| HIGH | {n} |
| MEDIUM | {n} |

### Structure Issues ({n})
| Issue | Fix | Certainty |

### Instruction Issues ({n})
| Issue | Fix | Certainty |

### Positioning Issues ({n})
| Issue | Fix | Certainty |

### Reference Issues ({n})
| Issue | Fix | Certainty |

### Efficiency Issues ({n})
| Issue | Fix | Certainty |

### Cross-Platform Issues ({n})
| Issue | Fix | Certainty |
```

## 模式统计

| 类别 | 模式数 | 确定性 |
|----------|----------|-----------|
| 结构 | 3 | HIGH |
| 指令有效性 | 3 | HIGH |
| 内容定位 | 2 | HIGH |
| 引用 | 2 | HIGH |
| 效率 | 3 | MEDIUM |
| 质量 | 3 | MEDIUM |
| Agent/Skill 定义 | 2 | MEDIUM |
| 跨平台 | 2 | MEDIUM/HIGH |
| **总计** | **20** | - |

<examples>
### 示例：缺少 WHY 说明

<bad_example>
```markdown
## Rules
1. Always run tests before committing
2. Use semantic commit messages
```
**问题**：缺少理由的规则更难遵循。
</bad_example>

<good_example>
```markdown
## Critical Rules
1. **Always run tests before committing**
   *WHY: Catches regressions before they reach main branch.*
```
**优点**：说明动机能让人更容易遵守规则。
</good_example>

### 示例：否定式指令与肯定式指令

<bad_example>
```markdown
- Don't use console.log for debugging
- Never commit directly to main
- Avoid hardcoding secrets
```
**问题**：否定式指令不如肯定式替代方案有效。
</bad_example>

<good_example>
```markdown
- Use the logger utility for all debug output
- Create feature branches and submit PRs for all changes
- Store secrets in environment variables or .env files
```
**优点**：说明应该做什么，而不只是说明要避免什么。
</good_example>

### 示例：弱约束与强约束措辞

<bad_example>
```markdown
- You should probably run tests before pushing
- Try to use TypeScript when possible
- Consider adding error handling
```
**问题**：弱化措辞（"should"、"try"、"consider"）会降低遵从度。
</bad_example>

<good_example>
```markdown
- **MUST** run tests before pushing (CI will reject failures)
- **ALWAYS** use TypeScript for new files
- **REQUIRED**: All async functions must have error handling
```
**优点**：强硬措辞可确保关键规则得到遵守。
</good_example>

### 示例：内容位置安排

<bad_example>
```markdown
## Project Overview
[Long description...]

## Installation
[Setup steps...]

## Critical Rules
1. Never push to main directly
2. Always run tests
```
**问题**：埋在中间或末尾的关键规则获得的关注较少。
</bad_example>

<good_example>
```markdown
## Critical Rules (Read First)
1. **Never push to main directly** - Use PRs
2. **Always run tests** - CI enforces this

## Project Overview
[Description...]

## Reminders
- Check CI status before merging
- Update CHANGELOG for user-facing changes
```
**优点**：关键内容位于开头和结尾。
</good_example>

### 示例：跨平台兼容性

<bad_example>
```markdown
State files are stored in `.claude/tasks.json`
```
**问题**：硬编码路径会排除其他 AI 工具。
</bad_example>

<good_example>
```markdown
State files are stored in `${STATE_DIR}/tasks.json`
(`.claude/` for Claude Code, `.opencode/` for OpenCode)
```
**优点**：可在多个 AI 助手中使用。
</good_example>

### 示例：代理定义

<bad_example>
```markdown
## Agents
- security-reviewer: reviews security
- test-writer: writes tests
```
**问题**：缺少必填字段（Tools、使用时机）。
</bad_example>

<good_example>
```markdown
## Custom Agents

### security-reviewer
Model: claude-sonnet-4-20250514
Description: Reviews code for security vulnerabilities. Use for PRs touching auth, API, or data handling.
Tools: Read, Grep, Glob
Instructions: Focus on OWASP Top 10, input validation, auth flows.

### test-writer
Model: claude-haiku-4
Description: Writes unit tests. Use after implementing new functions.
Tools: Read, Write, Bash(npm test:*)
Instructions: Use Jest patterns. Aim for >80% coverage.
```
**优点**：定义完整，包含使用时机和受限工具。
</good_example>
</examples>

## 研究参考资料

最佳实践来源：
- `agent-docs/PROMPT-ENGINEERING-REFERENCE.md` - 指令有效性、XML 标签、约束语言
- `agent-docs/CONTEXT-OPTIMIZATION-REFERENCE.md` - Token 预算、“迷失在中间”位置效应
- `agent-docs/LLM-INSTRUCTION-FOLLOWING-RELIABILITY.md` - 指令层级、正向指令与负向指令
- `agent-docs/CLAUDE-CODE-REFERENCE.md` - 文件层级、代理定义、技能格式

## 约束条件

- 在报告文件引用失效之前，务必先进行验证
- 标记效率问题时，应考虑上下文
- 跨平台建议仅供参考，并非必需
- 关于位置的建议具有较高确定性，但可能存在合理的例外情况