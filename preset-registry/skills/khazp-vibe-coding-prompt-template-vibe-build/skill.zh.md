---
name: vibe-build
description: Build an approved MVP task using AGENTS.md, agent_docs, tests, browser checks, AI evals, and evidence reporting.
---
# 氛围式构建

阅读 `AGENTS.md`、`agent_docs/project_brief.md`、`agent_docs/tech_stack.md`、`agent_docs/code_patterns.md`、`agent_docs/testing.md`，以及当前生效的任务/规范。

工作流程：
1. 总结当前阶段和验收标准。
2. 提出最小且安全的实施计划。
3. 每次构建一项功能。
4. 运行文档中规定的检查。
5. 对于 AI/MCP/工具变更，运行文档中规定的直接、间接、负向、需要授权、失败、轨迹、审批和数据边界检查。
6. 在 `MEMORY.md` 中记录重大决策或已完成的阶段。
7. 返回证据：已更改的文件、命令、结果、截图/浏览器备注（如适用）、AI 评估/工具调用证据（如适用）、未解决的风险，以及回滚说明。

不要自动批准不受信任的 MCP 服务器、shell/写入/网络工具、生产环境操作、计费操作或破坏性变更。