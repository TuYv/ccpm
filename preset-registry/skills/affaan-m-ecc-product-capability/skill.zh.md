---
name: product-capability
description: Translate PRD intent, roadmap asks, or product discussions into an implementation-ready capability plan that exposes constraints, invariants, interfaces, and unresolved decisions before multi-service work starts. Use when the user needs an ECC-native PRD-to-SRS lane instead of vague planning prose.
---
# 产品能力

此技能将产品意图转化为明确的工程约束。

当问题的关键不在于“我们应该构建什么？”，而在于“开始实施之前，究竟必须满足哪些条件？”时，请使用此技能。

## 何时使用

- 已有 PRD、路线图条目、讨论或创始人备注，但实施约束仍未明确表达
- 某项功能横跨多个服务、代码仓库或团队，需要在编码前建立能力契约
- 产品意图已经明确，但架构、数据、生命周期或策略方面的影响仍然模糊
- 高级工程师在评审期间不断重申相同的隐含假设
- 你需要一个可跨执行环境和会话长期使用的可复用工件

## 规范工件

如果代码仓库中存在持久化的产品上下文文件或目录，例如 `PRODUCT.md`、`docs/product/` 或项目规范目录，请在其中进行更新。

如果尚不存在能力清单，请使用以下模板创建：

- `docs/examples/product-capability-template.md`

目标不是再创建一套规划体系，而是让隐含的能力约束持久化并可复用。

## 不可妥协的规则

- 不要臆造产品事实。明确标注尚未解决的问题。
- 将用户可见的承诺与实施细节分开。
- 明确指出哪些是固定策略、哪些是架构偏好，以及哪些仍有待确定。
- 如果请求与代码仓库的现有约束冲突，应明确指出，而不是设法掩盖冲突。
- 优先创建一个可复用的能力工件，而不是零散的临时备注。

## 输入

仅阅读必要内容：

1. 产品意图
   - issue、讨论、PRD、路线图备注、创始人消息
2. 当前架构
   - 相关的代码仓库文档、契约、模式、路由、现有工作流
3. 现有能力上下文
   - `PRODUCT.md`、设计文档、RFC、迁移说明、运营模型文档
4. 交付约束
   - 身份验证、计费、合规、发布、向后兼容性、性能、评审策略

## 核心工作流

### 1. 重述能力

将需求压缩为一个精确的陈述：

- 用户或操作人员是谁
- 交付后具备什么新能力
- 哪项结果会因此发生变化

如果这项陈述不够明确，实施就会偏离方向。

### 2. 明确能力约束

提取实施前必须满足的约束：

- 业务规则
- 范围边界
- 不变量
- 信任边界
- 数据所有权
- 生命周期转换
- 发布 / 迁移要求
- 故障与恢复预期

这些内容往往只存在于高级工程师的记忆中。

### 3. 定义面向实施的契约

生成一份 SRS 风格的能力计划，其中包括：

- 能力摘要
- 明确的非目标
- 参与者与交互界面
- 必需的状态与转换
- 接口 / 输入 / 输出
- 对数据模型的影响
- 安全 / 计费 / 策略约束
- 可观测性与操作人员要求
- 阻碍实施的待解决问题

### 4. 转化为执行

最后给出确切的交接内容：

- 可直接实施
- 需要先进行架构评审
- 需要先明确产品需求

如有帮助，请指向下一个 ECC 原生工作流：

- `project-flow-ops`
- `workspace-surface-audit`
- `api-connector-builder`
- `dashboard-builder`
- `tdd-workflow`
- `verification-loop`

## 输出格式

按以下顺序返回结果：

```text
CAPABILITY
- one-paragraph restatement

CONSTRAINTS
- fixed rules, invariants, and boundaries

IMPLEMENTATION CONTRACT
- actors
- surfaces
- states and transitions
- interface/data implications

NON-GOALS
- what this lane explicitly does not own

OPEN QUESTIONS
- blockers or product decisions still required

HANDOFF
- what should happen next and which ECC lane should take it
```

## 良好结果

- 产品意图现已足够具体，可以实施，而不必在 PR 过程中重新发掘隐藏约束。
- 工程评审有了持久化产物，不再依赖记忆或 Slack 上下文。
- 生成的计划可在 Claude Code、Codex、Cursor、OpenCode 和 ECC 2.0 规划界面中复用。