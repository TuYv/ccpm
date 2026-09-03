---
name: agent-sources
description: Guides ccusage agent source formats. Use when checking where an agent stores its logs, how raw records map to tokens and models, how precomputed costs interact with cost modes, or which reports an agent supports.
---
# ccusage Agent 数据源

每个 agent 都是 `rust/adapters/<agent>` 下的一个适配器 crate，负责把某一个来源的原始日志转换成共享的报告结构。`ccusage <report>` 会聚合所有来源；`ccusage <agent> <report>` 则只限定到其中一个。

各 agent 接受哪些报告并不统一，而且这一信息被编码了两次：`rust/crates/ccusage-cli/src/types.rs` 中的 `STANDARD_AGENT_REPORTS` / `OPENCODE_AGENT_REPORTS` 驱动解析，而 `rust/crates/ccusage-cli-parser/src/parser.rs` 中的 `agent_report_supported` 决定按各 agent 名称分别接受哪些报告。修改某个 agent 的报告集合意味着要同时更新这两处。除非源数据强制造成差异，否则应保持各 agent 之间命令名称和标志语义的一致；如果确实出现了差异，请在注释中说明。

成本处理是共享的，而不是按 agent 区分：`auto`、`calculate` 和 `display` 的区别仅在于记录中预先计算好的 `costUSD` 如何与由 token 推导出的成本相竞争，这一决策位于 `rust/crates/ccusage-core/src/cost.rs`。定价来自 LiteLLM，`--offline` 背后则是一份内嵌的快照（`pricing.rs`，以及 `rust` skill 中关于这两份快照如何被构建进二进制文件的说明）。

## 修改数据源之前

先阅读该 agent 自己的文档——其中记载了路径、记录结构、token 映射、模型回退以及成本方面的特殊之处，这些内容并未共享：

- `rust/adapters/<agent>/README.md` —— 该 crate 负责哪些部分，以及其数据存放在哪里。
- `rust/adapters/<agent>/src/README.md` —— 记录结构以及 token/成本规则，仅提供给需要它们的数据源。

架构以及共享部分与各数据源之间的边界位于 `rust/adapters/README.md`；每次变更的工作流程位于 `rust/adapters/AGENTS.md`。
