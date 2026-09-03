---
name: agent-council
description: Collect and synthesize opinions from multiple AI agents. Use when users say "summon the council", "ask other AIs", or want multiple AI perspectives on a question.
---
# Agent Council

收集多个 AI 的意见并综合成一个答案。

## 用法

运行任务并收集结果：

```bash
JOB_DIR=$(./skills/agent-council/scripts/council.sh start "your question here")
./skills/agent-council/scripts/council.sh wait "$JOB_DIR"
./skills/agent-council/scripts/council.sh results "$JOB_DIR"
./skills/agent-council/scripts/council.sh clean "$JOB_DIR"
```

一次性执行：

```bash
./skills/agent-council/scripts/council.sh "your question here"
```

## 参考资料

- `references/overview.md` — 工作流程与背景。
- `references/examples.md` — 使用示例。
- `references/config.md` — 成员配置。
- `references/requirements.md` — 依赖项与 CLI 检查。
- `references/host-ui.md` — 宿主 UI 检查清单指南。
- `references/safety.md` — 安全注意事项。
