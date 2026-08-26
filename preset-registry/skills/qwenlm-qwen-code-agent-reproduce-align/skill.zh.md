---
name: agent-reproduce-align
description: Use after a Codex or Claude Code feature has been implemented in Qwen Code to run the selected reference agent and Qwen Code under the same scenario, capture HTTP and terminal traces, compare request bodies, tool/function schemas, outputs, and iterate until the reproduced behavior is close enough.
---
# Agent Reproduce Align

## 用途

当 Qwen Code 已经有候选实现，并且需要基于证据与选定的参考代理 `codex` 或 `claude-code` 达成行为一致时，使用此技能。目标不是逐字节相同，而是匹配该功能所涉及的重要可观察契约。

默认目标仓库：当前工作目录。仅当用户明确提供路径时，才使用用户指定的路径。

## 参考代理选择

使用在 `$agent-reproduce-feature` 期间选择的同一参考代理。如果之前的选择不可用，请询问一次，并将答案记录在场景或运行笔记中。

## 工作流

1. 重新陈述一致性目标：
   - 功能名称和触发方式
   - 选定的参考代理
   - 一个基线提示或交互脚本
   - 可接受的差异
   - 必须匹配的字段
2. 在独立的捕获目录中，使用相同的场景运行参考代理和 Qwen Code。
3. 当状态可能影响一致性时，在参考运行之前和之后捕获选定参考代理的本地状态。
4. 使用 `scripts/normalize_trace.py` 规范化跟踪记录。
5. 使用 `scripts/compare_traces.py` 比较规范化后的跟踪记录。
6. 按以下顺序检查差异：
   - 能够解释行为的参考代理状态变化
   - 缺失的工具/函数名称
   - 模式结构和必填字段
   - 模型设置和响应模式
   - 会影响行为的提示角色/顺序差异
   - 终端可见输出和退出状态
7. 修补 Qwen Code，重新运行最小失败场景，然后重复上述步骤。
8. 仅在仓库中保留经过脱敏的最小固件。

在首次比较之前，阅读 `references/alignment-workflow.md`。

## 常用命令

规范化：

```sh
.qwen/skills/agent-reproduce-align/scripts/normalize_trace.py \
  .repro-runs/reference/http.jsonl \
  > .repro-runs/reference/normalized.json
```

比较：

```sh
.qwen/skills/agent-reproduce-align/scripts/compare_traces.py \
  .repro-runs/reference/normalized.json \
  .repro-runs/qwen/normalized.json
```

运行配对 shell 场景：

```sh
REPRO_REFERENCE_AGENT=codex \
.qwen/skills/agent-reproduce-align/scripts/run_pair_capture.sh \
  .repro-runs/slash-help \
  "codex exec '/help'" \
  "npm test -- --runInBand"
```

对于 Claude Code，设置 `REPRO_REFERENCE_AGENT=claude-code`，并将第一个命令替换为发现的 Claude Code 命令。当设置了 `REPRO_REFERENCE_AGENT` 时，配对运行器会写入
`reference/state-before`、`reference/state-after` 和 `reference/state-diff`。仅当 shell 引号较为简单时，才使用配对运行器。对于交互式斜杠命令，使用 tmux 手动运行两次捕获，以便两侧都能接收相同的按键。仅将 `REPRO_REFERENCE_STATE_ROOT=/tmp/some-root` 用于测试或自定义状态目录。

## 比较规则

- 先比较契约，再比较措辞。确切的提示文本通常属于实现细节。
- 将缺少模式、错误的必填字段或错误的参数名称视为高信号失败。
- 仅当用户可见的工作流依赖输出顺序时，才将输出顺序视为重要因素。
- 不要追逐特定提供商的端点、模型名称、ID、时间戳、令牌计数或临时标头，除非该功能依赖这些内容。
- 不要追逐每一次本地状态写入。除非功能契约要求特定的配置、记忆或权限副作用，否则将状态差异视为解释性证据。
- 当 Qwen Code 通过用户可见场景，且剩余的跟踪差异已记录为有意差异时，停止。

## 完成标准

- 同一场景的 Reference-agent 和 Qwen Code traces 已在本地存在。
- Reference-agent state diff 已存在，或者已记录 state capture 与该场景无关。
- normalized comparison 不存在未作解释的 must-match differences。
- Qwen Code tests 或 smoke commands 覆盖了已修复的行为。
- 如果任何剩余 mismatch 会影响用户，已将其记录在 task notes 或 Qwen Code docs 中。