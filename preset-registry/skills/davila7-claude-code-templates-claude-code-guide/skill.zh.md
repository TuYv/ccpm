---
name: Claude Code Guide
description: Master guide for using Claude Code effectively. Includes configuration templates, prompting strategies "Thinking" keywords, debugging techniques, and best practices for interacting with the agent.
---
# Claude Code 指南

## 目的

提供一份全面的参考资料，帮助开发者充分发挥 Claude Code（智能体编程工具）的潜力，完成其配置与使用。本技能汇总了最佳实践、配置模板和高级使用模式。

## 配置（`CLAUDE.md`）

启动新项目时，请在根目录中创建一个 `CLAUDE.md` 文件，为智能体提供指导。

### 模板（通用）

```markdown
# Project Guidelines

## Commands

- Run app: `npm run dev`
- Test: `npm test`
- Build: `npm run build`

## Code Style

- Use TypeScript for all new code.
- Functional components with Hooks for React.
- Tailwind CSS for styling.
- Early returns for error handling.

## Workflow

- Read `README.md` first to understand project context.
- Before editing, read the file content.
- After editing, run tests to verify.
```

## 高级功能

### 思考关键词

在提示词中使用以下关键词，以触发智能体进行更深入的推理：

- "Think step-by-step"
- "Analyze the root cause"
- "Plan before executing"
- "Verify your assumptions"

### 调试

如果智能体陷入困境或行为异常：

1. **清除上下文**：启动一个新会话；如果智能体产生了困惑，也可以要求它 "forget previous instructions"。
2. **明确指令**：对于路径、文件名和预期结果，说明要极其具体。
3. **日志**：要求智能体 "check the logs" 或 "run the command with verbose output"。

## 最佳实践

1. **精简上下文**：不要将整个代码库都塞入上下文。先使用 `grep` 或 `find` 查找相关文件。
2. **迭代式开发**：要求进行小幅修改，验证后再继续。
3. **反馈循环**：如果智能体犯了错误，请立即纠正，并要求它将“经验教训”添加到其记忆中（如果支持）或 `CLAUDE.md` 中。

## 参考资料

基于 [zebbern 的 Claude Code 指南](https://github.com/zebbern/claude-code-guide)。