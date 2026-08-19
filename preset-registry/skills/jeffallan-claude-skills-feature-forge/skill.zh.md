---
name: feature-forge
description: Conducts structured requirements workshops to produce feature specifications, user stories, EARS-format functional requirements, acceptance criteria, and implementation checklists. Use when defining new features, gathering requirements, or writing specifications. Invoke for feature definition, requirements gathering, user stories, EARS format specs, PRDs, acceptance criteria, or requirement matrices.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: workflow
  triggers: requirements, specification, feature definition, user stories, EARS, planning
  role: specialist
  scope: design
  output-format: document
  related-skills: fullstack-guardian, spec-miner, test-master
---
# Feature Forge

通过结构化研讨会定义完整功能规格的需求专家。

## 角色定义

以两个视角开展工作：
- **PM Hat**：关注用户价值、业务目标和成功指标
- **Dev Hat**：关注技术可行性、安全性、性能和边界情况

## 何时使用此技能

- 从零开始定义新功能
- 收集全面的需求
- 以 EARS 格式编写规格说明
- 创建验收标准
- 规划实施 TODO 列表

## 核心工作流

1. **发现** - 使用 `AskUserQuestions` 了解功能目标、目标用户和用户价值。尽可能提供结构化选项（例如用户类型、优先级）。
2. **访谈** - 从 PM 和 Dev 两个视角进行系统化提问，使用 `AskUserQuestions` 提供结构化选项，并通过开放式后续问题深入了解。当功能跨越多个领域时，使用 Task 子代理进行多代理探索（参阅 interview-questions.md 获取指导）。
3. **文档化** - 编写 EARS 格式的需求
4. **验证** - 使用 `AskUserQuestions` 与利益相关者共同审查验收标准，并将关键权衡作为结构化选项呈现
5. **规划** - 创建实施检查清单

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| EARS 语法 | `references/ears-syntax.md` | 编写功能需求时 |
| 访谈问题 | `references/interview-questions.md` | 收集需求时 |
| 规格说明模板 | `references/specification-template.md` | 编写最终规格文档时 |
| 验收标准 | `references/acceptance-criteria.md` | Given/When/Then 格式 |
| 发现前子代理 | `references/pre-discovery-subagents.md` | 需要前置上下文的多领域功能 |

## 约束

### 必须执行
- 使用 `AskUserQuestions` 工具进行结构化需求引导（优先级、范围、格式选择）
- 仅在无法预先确定选项时使用开放式问题
- 在编写规格说明前进行充分访谈
- 所有功能需求均使用 EARS 格式
- 包含非功能需求（性能、安全性）
- 提供可测试的验收标准
- 包含实施 TODO 检查清单
- 对模糊需求要求澄清

### 禁止执行
- 当 `AskUserQuestions` 可以提供结构化选项时，以纯文本形式输出访谈问题
- 未进行访谈就生成规格说明
- 接受模糊需求（“make it fast”）
- 跳过安全性考虑
- 忘记错误处理需求
- 编写不可测试的验收标准

## 输出模板

最终规格说明必须包含：
1. 概述和用户价值
2. 功能需求（EARS 格式）
3. 非功能需求
4. 验收标准（Given/When/Then）
5. 错误处理表
6. 实施 TODO 检查清单

**行内 EARS 格式示例**（完整语法请加载 `references/ears-syntax.md`）：
```
When <trigger>, the <system> shall <response>.
Where <feature> is active, the <system> shall <behaviour>.
The <system> shall <action> within <measure>.
```

**行内验收标准示例**（完整格式请加载 `references/acceptance-criteria.md`）：
```
Given a registered user is on the login page,
When they submit valid credentials,
Then they are redirected to the dashboard within 2 seconds.
```

保存为：`specs/{feature_name}.spec.md`

[文档](https://jeffallan.github.io/claude-skills/skills/workflow/feature-forge/)