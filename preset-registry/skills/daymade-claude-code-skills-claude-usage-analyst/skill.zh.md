---
name: claude-usage-analyst
description: Analyze Claude Code and Claude Desktop Code token usage, cost, quota burn, model mix, cache read/write, and 5-hour block consumption using ccusage evidence. Use when the user asks why Claude quota was exhausted, whether a model such as fable/opus/sonnet is unusually expensive, how many tokens were spent today or historically, or needs a human-friendly explanation of local Claude Code CLI/Desktop usage.
---
# Claude 使用情况分析器

## 概述

使用此技能，基于本地 `ccusage` 数据生成有证据支持的使用情况说明。将观测到的数字与解读分开，并用通俗易懂的语言解释额度消耗情况。

## 工作流程

1. 验证 `ccusage` 是否可用：
   ```bash
   ccusage --version
   ```
   如果缺失，请使用 `npm install -g ccusage@latest` 安装或更新，或通过 `npx ccusage@latest` 运行。

2. 针对请求的时间范围运行随附的分析器：
   ```bash
   python3 /path/to/claude-usage-analyst/scripts/analyze_claude_usage.py \
     --since YYYY-MM-DD --until YYYY-MM-DD --timezone Asia/Shanghai
   ```
   在所选时区中，`--since/--until` 默认值为今天。
   如需进行历史比较，请将 `--since` 设置为更早的日期，例如当月第一天；否则，排名/中位数字段只描述单个目标日期。

3. 如果用户要求比较特定模型，请传入别名：
   ```bash
   python3 scripts/analyze_claude_usage.py --model-a fable --model-b opus-4-8
   ```

4. 撰写最终答案时，请阅读 `references/explanation-guide.md`。

## 证据规则

- 数值结论应基于 `ccusage` 输出或随附分析器的输出。
- 说明数据范围：`ccusage claude` 衡量本地 Claude Code 使用日志；如果本地存在 Claude Desktop 的 Claude Code 会话日志，也会包含这些会话。它并不是普通 Claude.ai 聊天账单的完整记录。
- 报告日期时注明时区。
- 清楚解释缓存：即使这些文字不是用户输入的，缓存读取 token 仍会产生用量和额度压力。
- 除非用户提供套餐详细信息，否则不要根据本地 token 数量推断 Anthropic 套餐的额度规则。当确切的套餐计费方式未知时，请使用“类似额度的压力”或“ccusage 估算的成本/token 消耗”等表述。
- 比较模型时，同时比较 token 量和估算成本。不同模型的 token 量可能相近，但成本更高。

## 输出结构

除非用户另有要求，否则使用以下结构：

1. 使用通俗语言给出简短结论。
2. 证据表：token 总量、成本、输入、输出、缓存创建、缓存读取。
3. 模型比较表。
4. 讨论额度耗尽时，提供 5 小时时段表。
5. 解释为何会产生这些消耗。
6. 置信度与注意事项。

确保非技术用户也能轻松阅读。避免使用“缓存读取”等未加解释的术语，应使用一句话说明其含义。