---
name: discovery
description: Structured pre-design questioning to surface hidden constraints before any architecture decision is locked in. Forces the architect/auditor/reviewer to enumerate what they DON'T know before proposing.
when_to_use: |
  Apply BEFORE producing architecture docs, audit findings, security plans:
  - architect, before writing ARCH-*.md
  - project-auditor, at the start of /audit
  - security-officer, before threat-modeling
  - l3-support, when triaging a new incident
  - regulated-reviewer, when classifying compliance scope
  - any reviewer who needs domain context the user hasn't given
effort: medium
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(bd:*)
paths:
  - "docs/**"
  - ".great_cto/**"
  - "README*"
---
# 发现——先揭示隐藏约束

导致智能体输出不佳的最大原因是上下文缺失。在最终确定决策之前，列出并揭示你尚不了解的信息。

## 7 个发现维度

对于任何非简单请求，都应逐一检查以下维度，并将发现记录在报告的「Context」部分：

### 1. 谁依赖它？

- 还有哪些服务／团队使用你要更改的内容？
- 是否存在公共使用者（开放 API、OSS 用户）？
- 如果破坏兼容性，是否有弃用路径？

在代码仓库以及你有权访问的任何同级代码仓库中，使用以下命令进行 Grep：`grep -rE "import.*<your-module>|require.*<your-module>"`。

### 2. 当前规模如何，6 个月后又会如何？

- 当前流量：请求数/秒、查询数/秒、MB/天、日活跃用户数
- 存储：主表行数、磁盘占用空间
- 成本：每月 LLM 支出、基础设施支出
- 6 个月预测：线性增长？指数增长？未知？

如果未知，请写明：「规模未知——继续之前请向用户确认。」

### 3. 哪些内容绝对不能改变？

- 现有 API 契约（向后兼容窗口）
- 报表／BI 引用的数据库表结构列
- 其他工具使用的文件格式
- 监管承诺（审计日志保留期限、SLA RPO/RTO）

### 4. 预算是多少？

- 每月成本上限（LLM + 基础设施）
- 人力：单人任务还是跨团队协作
- 时间安排：「必须在 X 之前发布」还是「最好在 Y 之前发布」

如果未说明，默认采用「小型 project_size、1 个工程师工作周、每月预算低于 $200」。在报告中明确说明这一默认值，以便用户纠正。

### 5. 哪种故障模式最重要？

询问：「如果此功能在凌晨 3 点发生故障，什么情况会触发告警？」
- 数据丢失 → 严重
- 向用户提供错误答案 → 高
- 响应缓慢 → 中
- 糟糕的 UX（外观问题）→ 低

故障模式决定投入级别（例如，是否需要金丝雀发布？断路器？还是只需要功能开关？）。

### 6. 已经尝试过什么？

- 搜索 Beads：`bd search "<keyword>"`——之前是否尝试过此事项？
- 搜索 docs/decisions：是否存在有关此主题、已被取代的 ADR？
- 搜索 lessons.md：过去是否有关于此模式的经验总结？

如果存在以往工作，应在其基础上继续推进。不要重复劳动。

### 7. 谁来决策？

- 是否需要 CTO 批准（gate:plan、gate:ship）？
- 是否需要合规审查人员（金融科技领域的 PCI、医疗保健领域的 HIPAA）？
- 是否需要 RFC（涉及多个团队的决策）？

## 输出

在报告顶部添加发现部分：

```markdown
## Context

- **Consumers:** <list, or "unknown — TBD with user">
- **Scale:** <today, 6mo projection>
- **Frozen contracts:** <list, or "none identified">
- **Budget:** <cost + time + people>
- **Failure-mode tier:** Critical | High | Medium | Low
- **Prior work:** <links to ADRs/lessons, or "none found">
- **Decision-makers:** <gate or RFC required>
```

## 何时跳过

- **nano project_size**——发现流程属于额外开销。跳过并记录你已跳过：「nano——根据 skill 规则跳过发现流程。」
- 不改变行为的**纯工具函数提取**——跳过。
- 用户口头提出且有明确复现步骤的**错误修复**——跳过。

## 常见陷阱

- **不要想当然。** 如果你写下“我假设用户想要 X”，那么该假设应作为问题放在 Context 中，而不是作为事实。
- **不要把工作推给用户。** 探索是你的工作。尽可能通过 Glob/Grep/git 找到答案。只有在代码无法提供答案时，才询问用户。