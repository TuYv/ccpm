---
name: meeting-transcript
description: Process meeting recordings and notes into structured decisions, action items, and team dynamics with intelligent noise filtering
roles: [product-manager, engineering-lead, founder, designer]
integrations: []
---
# COG 会议转录 Skill

## 何时调用
- 用户分享了会议转录或录音笔记
- 用户说“处理会议”“会议笔记”“会议转录”
- 用户有一段希望进行结构化处理的会议文本
- 用户提到希望从会议中提取行动项

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果是 `agent_mode: team` — 使用下方完整的并行 Agent 执行策略（3 个 Agent）
- 如果是 `agent_mode: solo` — 按顺序处理：先提取内容，再分析动态，最后结合上下文进行丰富。

## 目的
从会议录音和笔记中提取战略洞见，通过智能内容过滤聚焦于实质性、可执行的内容，同时去除噪声和无关信息。

## 命令：`/meeting-transcript`

## 并行 Agent 团队执行策略

**使用并行 Agent 同时处理会议转录的不同方面。**

### 阶段 1：设置（编排器）
1. 接收用户提供的会议转录内容
2. 检测内容类型（会议或思维倾倒）并对领域进行分类
3. 将会议转录拆分为逻辑区段，以便并行处理

### 阶段 2：并行处理（同时启动 2–3 个 Agent）
**在一条消息中使用带有 `run_in_background: true` 的 Task 工具启动所有 Agent：**

#### Agent 1："content-extractor"（subagent_type: general-purpose）
```
Extract structured content from the meeting transcript.

1. Filter out side chats, technical difficulties, and irrelevant banter
2. Identify and extract: decisions made (with rationale), action items (with owners/deadlines), strategic themes
3. Capture key quotes and insights from participants
4. Note unresolved issues and follow-up needs

Return: Decisions list, action items list, strategic themes, key quotes, unresolved issues.
```

#### Agent 2："dynamics-analyst"（subagent_type: general-purpose）
```
Analyze team dynamics and meeting effectiveness.

1. Assess communication patterns and participation levels
2. Identify leadership moments and collaboration quality
3. Evaluate decision-making process effectiveness
4. Assess meeting efficiency (time well spent vs wasted)
5. Note any tensions, disagreements, or alignment issues

Return: Team dynamics assessment, participation analysis, meeting effectiveness score.
```

#### Agent 3："context-enricher"（subagent_type: general-purpose）
```
Enrich meeting content with project/product context.

1. If project-related: read recent braindumps and notes for context
2. Check if discussed topics relate to known issues/PRs on GitHub
3. Connect decisions to existing strategic priorities
4. Identify competitive intelligence if competitors mentioned

Return: Contextual connections, related documents, strategic alignment notes.
```

### 阶段 3：汇总（编排器）
1. 收集所有处理 Agent 的结果
2. 按照内容结构模板汇总结构化会议摘要
3. 添加适当的元数据（参与者、时长、类型、行动项数量）
4. 保存到相应领域的会议文件夹
5. 标记需要立即关注的紧急行动项

## 内容筛选指南

### 排除（过滤掉）
- **题外对话**：“嘿，你昨晚看比赛了吗？”
- **技术问题**：“现在能听到我说话吗？”“你的麦克风静音了”
- **未完整表达的想法**：“所以我在想我们应该……算了”
- **随意闲聊**：天气、与工作无关的个人轶事
- **打断**：“抱歉，我得接一下这个电话”
- **表述不清**：含糊不清或无法听清的内容

### 包含（保留并分析）
- **战略讨论**：市场分析、竞争定位
- **决策点**：“我们已决定推进 Option A”
- **行动项**：“Alex 将在周五之前完成分析”
- **问题解决**：讨论挑战和建议的解决方案
- **规划**：时间线讨论、资源分配
- **洞察**：“关键洞察是客户想要……”
- **顾虑**：“我担心这种方法可能……”

## 元数据模板
```yaml
---
type: meeting-transcript
domain: [personal|professional|project-specific]
project: [project-name] # Only for project-specific meetings
date: YYYY-MM-DD
created: YYYY-MM-DD HH:MM
meeting_type: [1-on-1|team-meeting|strategic-planning|project-review|other]
participants: [participant1, participant2, participant3]
duration: [minutes]
content_filtered: true
accuracy_verified: [true|false|pending]
action_items_count: [number]
decisions_count: [number]
tags:
  - meeting
  - transcript
  - domain-tag
  - project-tag
status: [processed|needs-follow-up|action-required]
---
```

## 内容结构

### 1. 会议概述
- **日期/时间**：会议举行的时间
- **参与者**：出席人员及其角色
- **目的**：会议的主要目标
- **时长**：会议的实际时长
- **类型**：会议类别

### 2. 关键决策（仅限已核实内容）
- **决策**：做出了什么决定
- **理由**：为何做出此决定
- **负责人**：谁负责实施
- **时间线**：决定何时生效
- **影响**：预期结果及其影响

### 3. 行动项（仅限实质性内容）
- **任务**：需要采取的具体行动
- **负责人**：负责人员
- **截止日期**：任务到期时间
- **依赖项**：需要先完成哪些事项
- **成功标准**：如何衡量任务是否完成

### 4. 战略主题（源自实质性讨论）
- **主题**：讨论的主要话题或模式
- **背景**：该主题为何重要
- **影响**：这对团队/项目意味着什么
- **后续步骤**：如何应对或利用该主题

### 5. 未解决的问题
- **问题**：仍未解决的问题或疑问
- **背景**：相关背景及其重要性
- **阻碍因素**：哪些因素阻碍了问题的解决
- **建议的后续步骤**：如何继续推进

### 6. 团队协作动态评估
- **沟通质量**：团队沟通的有效程度
- **决策过程**：决策是如何达成的
- **参与情况**：谁做出了贡献以及如何贡献
- **会议效率**：时间管理和专注程度
- **改进空间**：对改善会议的建议

## 特定领域处理

### 个人领域会议
- 专注于职业发展和个人成长
- 对个人讨论严格保密
- 提取学习与发展机会
- 保存至 `[CUSTOMIZE: path/to/personal/]meetings/`

### 专业领域会议
- 分析领导力和团队管理方面的内容
- 提取战略性业务洞见
- 识别职业发展机会
- 保存至 `[CUSTOMIZE: path/to/professional/]meetings/`

### 特定项目会议
- 与项目指标和里程碑相关联
- 根据项目目标分析进展
- 提取竞争和市场情报
- 保存至 `[CUSTOMIZE: path/to/projects/][project-name]/meetings/`

## 内容筛选协议

### 第 1 步：初步扫描
- 识别会议阶段（开场、主要讨论、总结）
- 标记明显的题外对话和技术问题
- 标记不完整或不清晰的陈述

### 第 2 步：相关性评估
- 评估每个片段的战略价值
- 确定内容是否与会议目标相关
- 评估信息的完整性和准确性

### 第 3 步：准确性验证
- 交叉核对相互矛盾的陈述
- 标记看似不正确的信息
- 注明需要澄清的部分

### 第 4 步：保留上下文
- 确保决策具有充分的上下文
- 保留行动事项的背景信息
- 保持战略讨论的连贯性

## 质量保证

### 验证标准
- 所有决策都必须具有清晰的上下文和依据
- 行动事项必须有明确的负责人和截止日期
- 战略主题必须有充分的讨论作为支撑
- 团队动态评估必须基于可观察到的模式

### 不确定性处理
- 标记可能不正确的信息，以供用户确认
- 说明对相关解读的置信度
- 对含糊的内容请求澄清
- 明确注明信息不完整的情况

## 与每日简报集成

此命令处理的会议记录会直接纳入每日简报：
- **第 2 阶段，代理 3**（`meeting-reviewer`）扫描最近的会议文件
- **第 3 阶段**对照 GitHub PR 和 Linear 议题交叉核查行动事项
- **第 13 节**（`Meeting Follow-Up Tracker`）跟踪承诺的完成情况

这建立了问责机制：会议中的决策和行动事项会自动与代码及项目管理工具中的实际执行情况进行对照跟踪。

## 学习集成
- 持续跟踪会议成效模式
- 识别成功的决策流程
- 了解团队的沟通偏好
- 根据用户对相关性的反馈调整筛选方式