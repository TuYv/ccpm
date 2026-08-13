---
name: scrum-master-agent
description: Comprehensive Scrum Master assistant for sprint planning, backlog grooming, retrospectives, capacity planning, and daily standups with intelligent context-aware reporting
---
# Scrum Master 智能体

一款面向 SaaS 初创公司和应用工程团队、可用于生产环境的 Scrum Master 助手。此技能提供智能冲刺分析、容量规划、待办事项优先级排序以及可执行的洞察，并采用高效利用 token、可感知上下文的输出格式。

## 功能

### 冲刺管理
- **冲刺规划**：基于容量分配故事，并跟踪速率
- **待办事项梳理**：结合工作量、价值和风险分析进行优先级评分
- **冲刺健康状况监控**：实时跟踪燃尽情况并提供预测性警报
- **速率分析**：分析历史趋势并进行预测

### 团队运营
- **每日站会**：极其精简的进度摘要（50-100 个 token）
- **容量规划**：计算团队可用容量，并处理节假日和 PTO
- **冲刺回顾**：结合情感分析提取行动项
- **风险检测**：针对范围蔓延、速率下降和任务受阻自动发出警报

### 多工具集成
- **Linear**：原生 JSON 导入，支持 Linear 特定字段映射
- **Jira**：支持自定义字段的 REST API 适配器
- **GitHub Projects**：通过 GraphQL 集成跟踪议题和 PR
- **Azure DevOps**：支持冲刺层级结构的工作项查询


### 通知集成
- **Slack 通知**：高效利用 token 的 webhook 集成，支持丰富的区块格式
- **MS Teams 通知**：面向 Microsoft Teams 频道的 Adaptive Card 集成
- **可选/默认禁用**：使用此技能无需进行设置，通知功能可按需启用
- **用户选择**：通过配置或环境变量选择 Slack 或 Teams
- **简明摘要**：通知限制为 50-100 个 token，且仅包含最重要的 3 项风险
### 智能输出设计
- **上下文检测**：自动适配 Claude AI Desktop 与 Claude Code
- **Token 效率**：采用摘要优先并逐步披露详情的方式
- **条件警报**：仅在确实存在警告或风险时显示
- **格式优化**：Claude AI 使用 Markdown 表格，CLI 使用 ASCII 图表

## 输入要求

### 支持的格式
1. **JSON**（推荐）：
   ```json
   {
     "tool": "linear|jira|github|azure",
     "sprint_name": "Sprint 45",
     "start_date": "2025-11-05",
     "end_date": "2025-11-19",
     "team_capacity": 80,
     "stories": [...]
   }
   ```

2. **CSV**：
   ```csv
   story_id,title,points,status,assignee,priority,blocked
   STORY-123,User login,5,In Progress,Alice,High,false
   ```

3. **YAML**：
   ```yaml
   sprint:
     name: "Sprint 45"
     team:
       - name: Alice
         capacity: 40
       - name: Bob
         capacity: 40
   ```

4. **工具特定的导出格式**：
   - Linear：从项目视图导出为 JSON
   - Jira：使用 REST API 或导出为 CSV
   - GitHub Projects：使用 GraphQL 查询或导出为 CSV
   - Azure DevOps：工作项查询结果

### 必填字段
- **冲刺元数据**：name、start_date、end_date、team_capacity
- **故事**：id、title、points、status、assignee
- **可选字段**：priority、blocked、dependencies、labels、created_date

### 数据质量
- 故事点必须为数值（斐波那契数列或 T 恤尺码）
- 日期采用 ISO 8601 格式（YYYY-MM-DD）
- 状态值统一为：Todo、In Progress、In Review、Done
- 团队容量以每个冲刺的故事点数表示

## 输出格式

### 1. 每日站会（超轻量级）
**Token 预算**：50-100 tokens
```
🚀 Sprint 45 - Day 7/10

✅ Completed: 3 stories (13 pts)
🔄 In Progress: 5 stories (21 pts)
⚠️ Blocked: 1 story (5 pts) - Needs DB access

Velocity: On track (65% complete, 70% time elapsed)
```

### 2. 冲刺规划（中等详细程度）
**Token 预算**：200-500 tokens
```
📊 Sprint 45 Planning Summary

Capacity: 80 pts | Committed: 75 pts | Buffer: 5 pts

High Priority (35 pts):
  - STORY-123: User authentication (8 pts)
  - STORY-124: Payment integration (13 pts)
  - STORY-125: Dashboard redesign (8 pts)

Recommendations:
  1. P0: Address DB access blocker
  2. P1: Reduce scope if velocity drops below 85%
  3. P2: Consider splitting STORY-124 (13 pts is risky)
```

### 3. 冲刺评审（完整报告）
**Token 预算**：500-1000 tokens

包括：
- 速率趋势（CLI 使用 ASCII 图表，Claude AI 使用表格）
- 燃尽分析及预测完成日期
- 团队绩效指标（吞吐量、周期时间）
- 风险警报（有条件显示——仅在存在问题时）
- 按优先级排列的建议（P0/P1/P2）

### 4. 回顾分析
**Token 预算**：300-500 tokens
```
🔍 Sprint 45 Retrospective

What Went Well:
  - 95% velocity achievement
  - Zero production incidents
  - Early story completion (3 days before deadline)

What Needs Improvement:
  - 2 stories blocked for >2 days
  - Code review delays (avg 18 hours)

Action Items:
  [P0] Establish DB access protocol (Owner: Alice, Due: 11/12)
  [P1] Set 8-hour code review SLA (Owner: Bob, Due: 11/15)
  [P2] Add automated status updates (Owner: Team, Due: 11/20)
```

### 5. 可选的 JSON 导出
用于工具集成和仪表板：
```json
{
  "sprint": "Sprint 45",
  "metrics": {
    "velocity": 75,
    "completion_rate": 0.95,
    "cycle_time_avg": 3.2
  },
  "risks": [...],
  "recommendations": [...]
}
```

## 使用方法

### 快速调用

**每日站会**：
```
@scrum-master-agent

Generate a quick standup summary for Sprint 45 using the attached Linear export.
```

**冲刺规划**：
```
@scrum-master-agent

Help me plan Sprint 46. Team capacity is 80 points. Here's the backlog (CSV attached).
Prioritize based on effort, value, and risk.
```

**燃尽分析**：
```
@scrum-master-agent

Analyze Sprint 45 burndown. Are we on track? When will we likely finish?
Attached: Jira sprint export (JSON)
```

**回顾**：
```
@scrum-master-agent

Generate retrospective report for Sprint 45. Focus on blockers and cycle time.
Attached: GitHub Projects export (CSV)
```

**容量规划**：
```
@scrum-master-agent

Calculate team capacity for next sprint. Alice is on PTO for 3 days, Bob has 2 days of meetings.
Team size: 4 engineers (40 pts each normally).
```

### 高级用法

**多工具对比**：
```
Compare velocity trends across last 3 sprints using Linear data for Sprint 43-44 and Jira data for Sprint 45.
```

**风险分析**：
```
Identify high-risk stories in the backlog. Flag anything with >8 points, blockers, or missing dependencies.
```

**自定义指标**：
```
Calculate sprint health score based on: velocity (40%), burndown trend (30%), blocked items (20%), team morale (10%).
```

## 脚本

### 核心模块

- **`parse_input.py`**：支持多种格式的解析器（JSON/CSV/YAML），包含特定于工具的适配器
- **`tool_adapters.py`**：用于 Linear、Jira、GitHub、Azure DevOps 的集成适配器
- **`calculate_metrics.py`**：全部 6 项指标的计算（速率、燃尽、容量、优先级、健康度、回顾）
- **`detect_context.py`**：环境检测（Claude AI Desktop 与 Claude Code）
- **`format_output.py`**：具备令牌效率的上下文感知报告生成
- **`notify_channels.py`**：Slack 和 MS Teams Webhook 集成（可选）
- **`prioritize_backlog.py`**：结合工作量/价值/风险分析的优先级评分

### 计算详情

**1. 速率分析**：
- 过去 3-5 个冲刺的历史平均值
- 趋势分析（改善/下降/稳定）
- 下一冲刺预测

**2. 燃尽跟踪**：
- 每日故事点完成量
- 理想燃尽线计算
- 预测完成日期（线性回归）

**3. 容量规划**：
- 团队可用时间计算（带薪休假、节假日、会议）
- 故事点分配
- 缓冲建议（容量的 10-20%）

**4. 优先级评分**：
- **工作量**：故事点（归一化至 0-10）
- **价值**：业务影响（高=10，中=5，低=2）
- **风险**：阻塞项、依赖关系、复杂度（0-10）
- **公式**：`priority_score = (value * 2 + (10 - effort) + (10 - risk)) / 4`

**5. 冲刺健康度评分**：
- **速率**：实际完成量与承诺量之比（权重 40%）
- **燃尽**：实际燃尽与理想燃尽之比（权重 30%）
- **阻塞项**：数量和持续时间（权重 20%）
- **团队士气**：可选的情绪输入（权重 10%）
- **量表**：0-100（90+ = 优秀，70-89 = 良好，50-69 = 一般，<50 = 存在风险）

**6. 回顾分析**：
- 已完成故事与承诺故事的对比
- 阻塞项分析（数量、持续时间、原因）
- 周期时间指标（从开始到完成的平均时间）
- 从回顾记录中提取行动项

## 最佳实践

### 数据质量
1. **一致的故事点估算**：使用斐波那契数列（1,2,3,5,8,13）或 T 恤尺码（XS=1, S=2, M=3, L=5, XL=8）
2. **准确的状态更新**：每天更新故事状态（尽可能自动化）
3. **阻塞项跟踪**：始终记录事项被阻塞的原因以及谁能够解除阻塞
4. **冲刺边界**：第 3 天之后绝不更改冲刺范围（例外：严重缺陷）

### 工作流集成
1. **每日站会**：每天早晨生成轻量级摘要（自动化）
2. **冲刺规划**：使用优先级评分分配容量最高的 80%
3. **冲刺中期检查**：在第 5-7 天运行健康度评分，以便及早发现问题
4. **回顾会议**：在冲刺结束后 24 小时内生成回顾，以确保反馈仍然新鲜

### Token 效率
1. **渐进式披露**：先提供摘要，根据请求再提供详细信息
2. **条件式提醒**：仅在存在风险时显示（不要报告“无问题”）
3. **延迟计算**：仅在被要求时计算详细指标
4. **缓存**：在多种报告类型之间复用计算结果

### 团队采用
1. **从简单开始**：从每日站会开始，逐步增加复杂度
2. **自定义阈值**：根据团队价值观调整健康评分权重
3. **自动化输入**：设置 CI/CD 以自动导出工具数据
4. **迭代**：根据团队反馈优化优先级评分

## 局限性

### 数据要求
- 需要结构化的冲刺数据（不适用于临时性工作）
- 必须分配故事点（无法为未估点的用户故事确定优先级）
- 速度趋势需要历史数据（至少 3 个冲刺）

### 准确性注意事项
- **优先级评分**基于启发式方法，而非机器学习驱动（不提供预测分析）
- **燃尽预测**假设速度是线性的（未考虑节假日和阻塞项）
- **健康评分**具有主观性，并且依赖准确的权重配置

### 范围边界
- **不会**：直接与工具集成（需要导出数据）
- **不会**：发送通知或更新工具状态（只读）
- **不会**：取代 Scrum Master 的判断（用于辅助决策）

### 特定工具说明
- **Linear**：需要手动导出 JSON（此版本不支持 API 密钥）
- **Jira**：自定义字段可能需要在 `tool_adapters.py` 中进行映射
- **GitHub Projects**：测试版 GraphQL API 可能会发生变化（适配器可能需要更新）
- **Azure DevOps**：工作项层级结构可能很复杂（导出时将其扁平化）

## 不适合使用此 Skill 的情况

- **看板工作流**：此 Skill 针对 Scrum 冲刺进行了优化（不适用于持续流）
- **非软件项目**：优先级评分以软件开发场景为前提
- **单人团队**：对于独立开发者而言，额外开销并不值得
- **临时性工作**：需要结构化的冲刺规划和跟踪

## 安装

### Claude Code（推荐）
```bash
cp -r scrum-master-agent ~/.claude/skills/
```

### Claude AI 桌面版
将 `scrum-master-agent.zip` 文件拖入 Claude Desktop。

### Claude API
使用 `/v1/skills` 端点上传 Skill 包。

### 通知设置（可选）

通知**默认禁用**，并且完全可选。即使不进行任何通知设置，此 Skill 也可以正常运行。

**选项 1：配置文件（推荐）**
```bash
# Copy example config
cp config.example.yaml config.yaml

# Edit config.yaml with your webhook URLs
# Set enabled: true
# Choose channel: slack or teams
```

**选项 2：环境变量**
```bash
export NOTIFY_ENABLED=true
export NOTIFY_CHANNEL=slack  # or teams
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
export TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL
```

**获取 Webhook URL：**

*Slack*：
1. 前往 https://api.slack.com/messaging/webhooks
2. 创建应用并启用 Incoming Webhooks
3. 将 Webhook 添加到工作区并选择频道
4. 复制 Webhook URL

*Microsoft Teams*：
1. 打开 Teams 频道
2. 点击“...”→ Connectors → Incoming Webhook
3. 配置 Webhook 并设置名称
4. 复制 Webhook URL

**使用通知：**
```
@scrum-master-agent

Generate daily standup summary and send notification to Slack.
```

通知可节省令牌（最多 50-100 个令牌），内容包括：
- 冲刺名称和状态
- 速率和健康度指标
- 仅列出最重要的 3 个风险（有条件地）
- 富格式（Slack blocks、Teams Adaptive Cards）

## 版本

**版本**：1.1.0（支持通知）
**最后更新**：2025-11-05
**作者**：Claude Code Skills Factory
**许可证**：MIT

## 支持

如需报告问题、提出功能请求或参与贡献，请访问该 Skill 的 GitHub 仓库，或联系 Skills Factory 维护者。