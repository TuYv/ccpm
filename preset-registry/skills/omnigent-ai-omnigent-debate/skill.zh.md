---
name: debate
description: Have the Claude and GPT partners critique each other's answers across a configurable number of rounds (default 1) before converging on a synthesis. Use when the user wants the two perspectives stress-tested against each other, not just shown side by side.
---
# debate — 让两个协作伙伴辩个明白

通常，Debby 会将一个问题同时分发给两个协作伙伴，并并排展示两个答案。**debate** 则更进一步：它会把每个协作伙伴的答案转发给*另一个*协作伙伴进行批评，按可配置的轮数重复此过程，然后汇聚成一个综合结论。

## 轮数

用户选择要进行多少轮来回辩论。**默认：1 轮。**一“轮”是指一次完整的交叉批评交流（每个协作伙伴都会看到并批评另一个协作伙伴的最新答案）。如果用户明确指定了轮数（“debate this for 3 rounds”），则遵循该轮数；否则进行 1 轮。

## 流程

1. **第 0 轮 — 收集初始答案。**如果你尚未获得每个协作伙伴针对此问题给出的最新答案，请通过 `sys_session_send` 将问题并行分发给 `claude` 和 `gpt`（ANSWER 模式），为每次调用提供一个稳定的、对应各协作伙伴的 `title`——即主题加上协作伙伴的名称（例如 `debate-pricing-claude` / `debate-pricing-gpt`），结束本轮，然后使用 `sys_read_inbox` 收集两个答案。如果你在本轮中已经向用户展示了两个答案，则将它们复用为第 0 轮的答案。

2. **对于每一轮辩论（默认 1 轮）：**
   - 将另一个协作伙伴的最新答案（GPT 的答案）发送给 `claude`，要求它批评该答案，然后给出自己更新后的答案（CRITIQUE 模式）。复用该协作伙伴自己的 `title`，以便继续其原有线程。
   - 将另一个协作伙伴的最新答案（Claude 的答案）发送给 `gpt`，并提出相同要求。在同一轮中分发这两个请求，以便它们并发运行。
   - 结束本轮；使用 `sys_read_inbox` 收集两个更新后的答案。
   - 始终交叉发送答案：在第 N 轮中，每个协作伙伴批评的是另一个协作伙伴在第 N-1 轮中的答案——绝不能是自己的答案。将答案以文本形式放在消息中传递；两个协作伙伴之间不存在共享记忆。

3. **汇聚。**最后一轮结束后，自行撰写综合内容：

       ## 🟠 Claude — final
       <Claude's last answer, lightly trimmed>

       ## 🔵 GPT — final
       <GPT's last answer, lightly trimmed>

       ## How the debate moved them
       <2-4 bullets: what each conceded, what each held, where they
        ultimately agreed or still disagree>

       ## Synthesis
       <your even-handed convergence — the strongest combined answer,
        flagging any genuine remaining disagreement rather than papering
        over it>

## 注意事项

- 保持公正。你是主持人，而不是第三位辩手——你自己的观点只能出现在综合结论中，即使在那里，也应当是对双方观点的综合，而不是提出一个新立场。
- 一轮通常足以揭示真正的分歧；更多轮次往往会趋于共识或重复已有内容。如果两轮之后没有出现新的进展，请说明这一点并提前汇聚结论，而不是继续消耗更多轮次。
- 如果某个协作伙伴在辩论过程中返回空白或不清晰的结果，请先使用 `sys_session_get_history` 检查其对话，然后再重新分发请求；不要悄无声息地将任何一方排除在辩论之外。