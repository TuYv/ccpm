---
name: ccusage-agent-sources
description: Guides ccusage agent source work for Rust CLI parsers, log paths, token mappings, costs, reports, and adapter command behavior.
---
# ccusage 代理源

在改动任何 ccusage 代理适配器的数据加载、token 归一化、费用计算或命令时，请使用此技能。

## 共享报告概念

报告将原始使用量聚合为按日、按月、按会话或按计费块的摘要，并以表格或 JSON 形式输出。

规范的命令入口是统一的 `ccusage` CLI：

```sh
ccusage daily
ccusage codex daily
ccusage opencode daily
ccusage amp daily
ccusage pi daily
```

独立的代理包装包已被移除。请在文档、测试和示例中使用统一的 `ccusage <agent> ...` 命令，不要重新引入诸如 `ccusage-codex`、`ccusage-opencode`、`ccusage-amp` 或 `ccusage-pi` 之类的包装命令。

费用模式：

- `auto` - 优先使用预计算的 `costUSD`（如可用），否则根据 token 计算。
- `calculate` - 根据 token 数量计算，并忽略预计算的费用。
- `display` - 使用预计算的费用，缺失时显示 `0`。

定价通常来自 LiteLLM 的 `model_prices_and_context_window.json`。`--offline` 标志会在支持的场景下强制使用内嵌的定价快照。

## 代理详情

在修改解析器行为、token 映射、数据目录检测、回退模型或代理特定的 CLI 标志之前，请只阅读相关的参考文档：

- Claude Code：`references/claude-code.md`
- Codex：`references/codex.md`
- OpenCode：`references/opencode.md`
- Amp：`references/amp.md`
- pi-agent：`references/pi-agent.md`

## 实现说明

- 将 Codex、OpenCode、Amp 和 pi-agent 视为统一 `ccusage` CLI 下的代理子命令。
- 在合适的场景下，复用共享的 Rust 模块来处理渲染、表格布局、日志、日期格式化、进度、定价、文件遍历和聚合。
- 保持命令名称和标志语义一致，除非源数据迫使其存在差异。
- 用于捆绑/私有包的内部工作区运行时库应归入 `devDependencies`。

## 适配器布局

新增或迁移的运行时代理实现应放在 `rust/crates/ccusage/src/adapter/<agent>/` 下。将代理特定的代码保留在该目录中。当实现规模增长时，按职责拆分文件：

- `mod.rs` - 对外的适配器接口与命令接线。
- `paths.rs` - 环境变量、默认目录和路径发现。
- `parser.rs` - 原始记录解析及 token/模型映射。
- `loader.rs` - 文件遍历、SQLite 读取、去重以及日期过滤的入口点。
- `report.rs` - 代理特定的 JSON/表格行塑形。
- `types.rs` - 未在适配器外共享的源本地类型。

仅将 `apps/ccusage/src` 用于剩余的 npm 启动器、包脚本、schema 产物和基准测试。除非用户明确将工作范围限定在包层，否则不要新增 TypeScript 运行时适配器逻辑。

将现有加载器迁移到适配器时，请将内部导入更新为适配器路径，而不是添加兼容性再导出垫片。仅当旧的根级模块属于包声明的公开导出的一部分、或是专门的打包入口时，才保留它们。

在源数据允许的情况下，使用共享的 ccusage 基础设施来处理渲染、表格布局、日志、日期格式化、进度、定价获取器生命周期、JSONL 遍历、SQLite 加载、去重和聚合。代理适配器应主要负责源特定的日志发现、解析、token 映射、模型映射以及源特定的元数据。

将“与 Claude 相同的基础设施”理解为不只是共享文件遍历。当存在稳定的行标记时，JSONL 适配器应使用共享的扫描辅助函数；当 worker 侧聚合或类型化传输载荷可以保持相同输出时，大数据量路径应避免返回大型中间对象向量。

当多个适配器暴露相同的原始日志结构时，应优先使用小型共享 Rust 辅助模块，而不是重复实现周期/会话聚合。对于高度特化的加载器（例如 Codex 解析），当其文件格式或定价语义有此要求时，应保持独立。

## 适配器迁移清单

对于每个已迁移或新增的代理：

- 将所有源特定的运行时逻辑放在 `rust/crates/ccusage/src/adapter/<agent>/` 下。
- 实现快速检测，在找到可用的源文件后立即短路返回。
- 使用共享的文件遍历、适用的 JSONL 扫描、SQLite 加载、日志、定价获取器生命周期、日期格式化、表格渲染以及全代理聚合。
- 让适配器代码负责源路径、原始解析、token 映射、模型映射、源元数据以及代理特定的定价。
- 为路径发现、解析器行为、聚合总计以及重要的遗留兼容性添加基于 Rust fixture 的测试。
- 当真实用户日志目录有助于捕捉 schema 漂移时，添加默认跳过的本地数据冒烟测试。
- 为受影响的报告模式添加或更新 CLI JSON 断言和表格快照。
- 对所有列出受支持代理、命令、选项、报告模式或示例的面向用户的入口进行审查。当适配器改变了用户可运行或可发现的内容时，请更新根目录 `README.md`、`apps/ccusage/README.md`、`docs/guide/` 以及 VitePress 导航。文档规范请使用 `ccusage-docs` 技能。
- 新增代理指南时，除非用户明确将文档排除在范围之外，否则应在同一次变更中包含 README 使用示例、文档指南内容、相关指南链接以及 VitePress 导航。
- 在修改表格布局、进度、加载动画或响应式行为时，使用 `cmux-debug` 验证终端输出。
- 将受影响的代理与 main 分支或上一个标签进行基准对比，并记录在对比时间窗口内 JSON 输出是否仍然一致。
