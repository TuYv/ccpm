---
name: context-shunt
description: Offload large / multi-file reads to a cheap worker model so raw files never enter Claude's context (token savings)
when-to-use: When answering a question that requires reading large or many files, reviewing logs, or scanning generated output — anything you don't need to edit
user-invocable: false
effort: low
---
# Context Shunt — 低成本读取，保持上下文精简

读取大文件进入上下文是代理模型最昂贵、推理价值最小的操作。这个 shunt 会把这些读取交给一个廉价的工作模型（`bulk-read`），由它回答关于这些文件的问题并返回一个紧凑的摘要。原始字节不会进入本次会话的上下文。

这与整轮路由（srooter / `route-task`）是正交的：后者为*整轮*选择模型；而 shunt 则在当前轮次确实需要访问时，压缩*工具调用*带入上下文的内容。

## 决策：读原文、shunt，还是 graph？

- **正在编辑这个确切文件** — 直接读原文。你需要每一行；绝不要根据摘要来编辑。
- **跨大文件或多个文件的事实/答案** — `bulk-read "<question>" file...`。
- **代码符号（函数/类/route）** — `get_code_snippet(qualified_name)`：免费且精确。
- **你需要完整内容的小文件（低于阈值）** — 直接读原文。

shunt 的回答用于理解，不用于生成 diff。

## 用法

```bash
bulk-read "token refresh 是如何工作的？" src/auth/session.ts src/auth/refresh.ts
bulk-read "启动时读取了哪些配置键？" $(git ls-files 'config/*.yaml')
```

`bulk-read` 会打印结构化要点，并引用 `path:line`，或者输出
`NOT FOUND IN PROVIDED FILES`。节省的 token 报告会输出到 stderr。

## 配置

环境变量或 `~/.claude/shunt.conf`（见 `templates/shunt.conf`）：

- `SHUNT` — `on`/`off` 的 PreToolUse hook 总开关。
- `SHUNT_MIN_LINES` — 大读取阈值（默认 350）。
- `SHUNT_MODE` — `suggest`（默认）/`block` / `off`，用于 hook 对大读取的处理。
- `SHUNT_GRAPH_NUDGE` — `on`/`off`，每会话一次的 graph 提示。
- `SHUNT_MODEL` — 工作进程命令（默认 `deepseek --flash`；也支持 `gemini-api --flash-lite`、`qwen3`、`glm`）。

`context-shunt-gate` PreToolUse hook 会强制执行这些阈值；这个 skill 会告诉你何时应该主动使用 `bulk-read`。