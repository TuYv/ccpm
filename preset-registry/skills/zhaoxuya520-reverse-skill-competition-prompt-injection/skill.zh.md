---
name: competition-prompt-injection
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for prompt-injection, retrieval poisoning, memory contamination, planner drift, MCP or tool-boundary abuse, and agent exfiltration challenges. Use when the user asks to analyze prompt injection, retrieval poisoning, memory contamination, planner drift, tool-argument corruption, or secret exposure caused by an agent chain. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛提示注入

本技能只能作为下游专门化技能使用，前提是 `$ctf-sandbox-orchestrator` 已经激活，并已确立沙箱假设、节点归属和证据优先级。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当挑战的核心是智能体系统内部的信任边界时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 识别第一条变得对模型可见的不可信内容。
2. 绘制从检索、记忆或对话记录流入规划器或执行器行为的链路。
3. 记录文本变为工具参数、文件路径、网络目标或机密请求的确切位置。
4. 在探索变体之前，先证明一条最小利用链。
5. 将提示片段和工具转换过程保存在紧凑的证据块中。

## 工作流程

### 1. 映射控制栈

- 分别跟踪系统层、开发者层、用户层、检索层、记忆层、规划器层和工具响应层。
- 区分声明的能力与运行时实际暴露的能力。
- 记录模型实际能够调用、读取或修改的内容。

### 2. 证明边界穿越

- 复现一条从不可信文本到规划器行为改变、工具参数改变或机密泄露的链路。
- 保持决定性对话记录紧凑：来源文本块、被改写的规划器状态、最终工具调用。
- 优先选择仍能演示该缺陷的最小对话记录。

### 3. 按边界报告

- 说明是哪一层失效：检索、摘要器、规划器、执行器、工具规范化，还是输出后处理。
- 将指令漂移与实际副作用区分开来。

## 阅读此参考

- 加载 `references/prompt-injection.md` 以获取清单、证据布局和常见的提示边界陷阱。

## 需要保留的内容

- 原始恶意文本块或提示
- 中间摘要或规划器漂移（当其有影响时）
- 最终的工具参数、文件路径或暴露的机密面
