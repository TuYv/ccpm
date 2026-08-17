---
name: memory-hygiene
description: Periodic trust sweep of persistent memory and durable knowledge notes - re-verifies environment-dependent claims against the live environment, stamps last_verified + confidence, and proposes archiving drifted entries
roles: [all]
integrations: []
---
# COG 记忆卫生技能

## 目的

防止出现**陈旧但自信**的故障模式：某条记忆或知识笔记在写入时是正确的（“Webhook 位于 X”“看板 ID 是 Y”），但在环境发生变化后悄然失效，却仍然在召回时排名靠前并被付诸执行。

系统层面的做法（改编自 Gu，UC Berkeley，arXiv:2605.26112 的《From Model Scaling to System Scaling: Scaling the Harness in Agentic AI》）：**将信任作为运行时决策，而不是存储项自身的属性**。根据实时环境重新验证，并将每个条目的 `last_verified` 和 `confidence` 作为一等字段维护，以便未来召回时能够衡量可信度。

## 何时调用

- `/memory-hygiene`
- “审计我的记忆”/“检查是否存在陈旧记忆”
- 在记忆失效后（召回的事实被证明有误）
- 默认频率：每月一次

## 范围

扫描两个存储区：

1. **智能体记忆**——智能体存放持久化记忆文件的任何位置（例如 Claude Code 的自动记忆目录）。扫描除索引本身之外的每个条目。
2. **持久知识笔记**——声明中引用了环境信息（路径、URL、ID、工具名称）的 `05-knowledge/**` 文件。

用户提出要求时，可以进行部分扫描（“只检查参考条目”）。

## 声明分类

对于每个条目，将其声明分为两类：

| 类别 | 示例 | 操作 |
|---|---|---|
| **依赖环境** | 文件/目录路径、仓库名称、分支名称、频道 ID、看板 ID、URL、API 端点、cron/例程 ID、CLI 名称、版本号、“X 位于 Y” | 根据实时环境进行验证 |
| **偏好/判断** | 语气规则、格式规则、“绝不做 X”、人员相关事实、策略上下文 | 无法进行环境检查；只需验证其是否与较新的条目存在内部矛盾 |

## 验证方式（优先采用低成本方式）

- 路径和文件：`ls` / `test -e`。条目中提及的技能、命令和智能体必须仍然存在于所述路径。
- URL：使用 HEAD/GET（`curl -sI`）进行解析；标记 404 或重定向至登录页的情况。
- 仓库/分支：成本较低时使用 `gh repo view`、`git ls-remote`。
- ID（频道、看板、例程触发器）：仅当使用 MCP/CLI 一次调用即可完成检查时才进行验证；否则标记为 `unverifiable-cheaply`，并保持置信度不变。
- 跨条目矛盾：以较新的条目为准；标记较旧的条目。

每个条目的处理时间绝不要超过约 1 分钟。这是卫生维护，而不是调查。**无法验证 ≠ 已发生漂移。**

## 标记

检查条目后，原地更新其 frontmatter 中的 `metadata:` 块（除非要修正确认有误的事实，否则不要改动正文）：

```yaml
metadata:
  type: reference
  last_verified: 2026-07-10
  confidence: high   # high = verified now | medium = unverifiable cheaply | low = partially drifted
```

- 验证无误 → `confidence: high`，标记日期。
- 无法以低成本验证 → 保留此前的置信度（或设为 `medium`），标记日期。
- 部分漂移 → 直接在正文中修正发生漂移的事实（可通过报告审查）；仅当不确定修正是否完整时，才将 `confidence: low`。
- 完全过时 → **提议归档，不要删除。** 将其列入报告的“提议归档”部分；仅在用户确认后归档。

## 循环（参见 /loop-engineering）

扫描条目列表直至完成，并为每个条目设置预算保护（约 1 分钟）。确定性验证器是环境本身（`test -e`、`curl`、`gh`），绝不能依赖代理自己对某项内容是否“应该”仍然存在的记忆。需要人工确认的事项：所有删除/归档操作。

## 报告（单个文件）

每轮扫描将一份报告写入 `01-daily/YYYY-MM-DD-memory-hygiene.md`，围绕以下四个演进问题组织：

1. **哪些内容持续存在？** — 按类型统计数量（用户/反馈/项目/参考资料）。
2. **哪些内容已更新？** — 正文得到纠正的条目，列出旧内容 → 新内容。
3. **衡量了什么？** — 记分卡：`verified / unverifiable / drifted / propose-archive` 的数量，以及相较上一次扫描报告的变化（漂移的*趋势*是一次性检查所遗漏的纵向信号）。
4. **哪些内容可审计？** — 本轮扫描中的每项变更都在本报告中占一行；对于 Git 未跟踪的存储，本报告就是审计轨迹。

在报告末尾添加一个**建议归档**部分（明确列出条目，每项附一行证据）；如果有任何事项需要决策，则添加一行**等待你的决定**。

## 规则

- 删除/归档仅提出建议；时间戳和经验证的事实更正则直接应用。
- 扫描期间绝不改写条目的表达方式或重构其内容。
- 如果记忆索引指向已重命名或缺失的文件，请修复该索引。
- 不要将扫描本身写入记忆：报告文件就是记录。