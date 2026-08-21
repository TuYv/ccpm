---
name: ship-checklist
description: Definition-of-done checklist for shipping a new write, signal, table, edge, or query to the ax graph. Use when adding a SurrealDB table/edge/field, an ingest derive-stage, a new analytic query, or any new ax capability - before opening the PR. Ensures every write gets an on-demand read AND a proactive (agent-facing) read AND docs/distribution, not just the write. Triggers on "ship", "new signal", "new table/edge", "new lens/query", "wire this up", "is this done", or finishing an ax feature branch.
---
# ship-checklist - 每次写入都需要有智能体能够发现的读取路径

ax 中反复出现的疏漏是：我们交付了**写入 + 按需 CLI 读取**，却跳过了
**主动式 / 面向智能体的读取**。只能通过手动运行 CLI 才能看到的信号，
对于自我改进循环而言是不可见的。ax 的核心主张就是让智能体发现信号并采取行动——
因此，在智能体无需被告知就能找到新写入的数据之前，这项写入工作就不算完成。

组织原则：**每次写入都需要 (B) 按需读取、(C) 主动式读取，
以及面向智能体的入口（MCP/技能）。**大多数功能完成 A+B 后就止步于此。

请在创建 PR 前运行此检查清单。可以跳过某一项——但要在 PR 中说明跳过了什么以及
原因，不要默默跳过。

## A. 写入
- [ ] 在 `schema.surql` 中定义 schema，并注册到 `SCHEMA_TABLES`（CI 镜像守卫）
- [ ] 摄取过程幂等且支持增量（感知 since），并为读取执行无解引用的反规范化（聚合中不得进行记录解引用——这会导致生产环境挂起）
- [ ] 回填：历史数据是否会获得该信号，还是只有新数据会获得？如果是后者，请注明“重新摄取前不可见”
- [ ] 阶段的 `deps` = 输入表的所有生产者

## B. 读取 - 按需
- [ ] CLI：提供一个命令，或在现有命令上提供一个分面（保持命令族一致）
- [ ] 提供用于脚本处理的 `--json` 封装
- [ ] Dashboard/studio 入口（如果是可视化内容）

## C. 读取 - 主动式（通常被遗漏的一半）
- [ ] **MCP 工具**，让智能体可以在上下文中查询它（`apps/axctl/src/mcp/tools.ts`）
- [ ] `ax improve recommend` 生成器——当信号超过阈值时生成一项提案（智能体无需提示即可获得建议）
- [ ] 接入 `ax insights` / dashboard 的后续行动（如果该信号意味着需要采取行动）
- [ ] dojo 议程项（如果夜间循环应对其采取行动）
- [ ] **技能**：一种教会智能体根据该信号*采取行动*的认知模式（例如，`ln` 技能基于 `ax cost images` 将视觉判断路由给子智能体）

## D. 文档
- [ ] `CLAUDE.md` 命令/章节文档（新增子命令需要通过文档门禁）
- [ ] llms.txt / 站点文档 / README（如果面向用户）
- [ ] CHANGELOG + 发布说明（release-please）
- [ ] 对于非简单功能，在 `docs/superpowers/specs/` 中提供规范

## E. 新手引导 / 分发
- [ ] 新手引导提示词（`@ax/onboarding-prompt`）——第 1 天使用的用户/智能体是否应该知道它的存在？
- [ ] 营销覆盖（站点页面 / 博客 / X），如果是面向用户的能力
- [ ] `/api/version` 能力标志（如果相关）

## F. 验证（提供证据，而非断言）
- [ ] 测试：纯辅助函数的单元测试 + schema 镜像守卫 + CLI 命令列表测试
- [ ] 针对真实数据库进行现场验证——将实际输出粘贴到 PR 中
- [ ] 坦诚说明“有数据前不可见”：明确指出它是否需要回填/遥测数据才能显示

## 如何使用

为每个相关条目创建一个 TodoWrite 项，或将 A-F 标题作为已勾选的列表粘贴到 PR
正文中。重点是 **C 部分**——如果一个新信号没有 MCP 工具、没有 improve 生成器，
也没有技能，智能体就永远无法自行发现它；无论写入实现得多么干净，这项功能都只完成了一半。