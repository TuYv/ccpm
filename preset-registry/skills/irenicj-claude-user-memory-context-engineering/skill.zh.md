---
name: context-engineering
description: Active context curation to fight context rot. Curates what goes into limited context window from constantly evolving information universe. 39% improvement, 84% token reduction.
auto_invoke: true
tags: [context, curation, optimization, memory]
---
# 上下文工程技能

此技能提供了一套系统化的方法，用于主动策划上下文，即从持续演变的潜在信息宇宙中，优化进入有限上下文窗口的内容。

## 定义

**上下文工程**：从持续演变的潜在信息宇宙中，策划进入有限上下文窗口内容的艺术与科学。

**演变**：提示工程的自然发展
- **旧范式**：为提示词寻找合适的措辞
- **新范式**：“哪种上下文配置最有可能生成预期行为？”

## Claude 应使用此技能的时机

Claude 将在以下情况下自动调用此技能：
- 对话开始时（优化 CLAUDE.md 和 knowledge-core.md 的相关性）
- 长会话超过 50 条消息时（可能出现上下文腐化）
- 复杂操作之前（确保上下文具有高信号密度且使用最少 token）
- 使用工具之后（用获得的经验更新上下文，移除过时信息）
- 切换任务时（归档旧任务上下文，加载新任务上下文）

## 核心原则

1. **上下文腐化是真实存在的**：随着对话变长，信息会逐渐失效
   - 过时信息不断累积
   - 相关性会随时间降低
   - 注意力预算被浪费在低信号内容上

2. **注意力预算是有限的**：模型的注意力有限，应针对信号进行优化
   - 上下文中的每个 token 都会争夺注意力
   - 高信号 token 能提升性能
   - 低信号 token 会降低输出质量

3. **主动策划**：编辑上下文不是作弊，而是工程实践
   - 应动态管理上下文
   - 归档不再需要的内容
   - 加载当前相关的内容

4. **CLAUDE.md 作为结构**：文件夹/文件结构就是上下文工程
   - 命名约定编码了信息
   - 目录模式传达架构信息
   - 组织结构可以降低认知负担

## 性能结果（Anthropic 研究）

**采用上下文工程时**：
- 基于智能体的搜索性能提升 **39%**
- token 消耗减少 **84%**（100 轮网页搜索）
- 上下文窗口中的信噪比更高
- 上下文更清晰、更聚焦，从而改善决策质量

**示例**：
- 不进行上下文编辑：100 轮搜索使用 50,000 个 token
- 进行上下文编辑：100 轮搜索使用 8,000 个 token
- **改进：token 减少 84%，质量提升 39%**

## 上下文策划协议

### 策划触发条件

**自动触发条件**：
1. **对话超过 50 条消息** → 审查并精简上下文
2. **切换任务时** → 归档旧任务上下文，加载新任务上下文
3. **复杂操作之前** → 确保上下文针对即将进行的任务完成优化
4. **获得重要经验之后** → 更新 knowledge-core.md，移除已被取代的信息
5. **工具使用产生大量输出时** → 考虑立即进行归档

**手动触发条件**（用户发起）：
- `/context analyze` - 分析当前上下文配置
- `/context optimize` - 主动精简并重组上下文
- `/context reset` - 为新项目重新开始

### 策展操作

**步骤 1：识别过时信息**
- 与当前任务不再相关的信息
- 之前任务遗留的过时上下文
- 冗余或重复内容
- 不针对本项目的通用建议

**步骤 2：归档至 knowledge-core.md**
- 为未来会话保留经验
- 维护机构知识
- 在再次需要时支持检索

**步骤 3：从活动上下文中移除**
- 减少 token 数量
- 提高信噪比
- 释放注意力预算

**步骤 4：验证上下文质量**
- 所有信息都与当前任务高度相关
- 没有冗余或重复
- 组织和结构恰当

## CLAUDE.md 优化

### CLAUDE.md 中应包含的内容

✅ **包括**：
- **项目特定指南**：“JavaScript 使用 2 个空格缩进”
- **仓库规范**：“绝不要直接提交到 main；使用功能分支”
- **环境设置**：“测试前运行 `npm install && npm run db:migrate`”
- **架构模式**：“我们使用六边形架构；参见 /docs/architecture.md”
- **约定**：“API 路由放在 /src/routes/，业务逻辑放在 /src/services/”

❌ **避免**：
- 通用编程建议
- 普适的最佳实践（Claude 已经了解这些）
- 项目中过时的信息
- 代码注释中已有的重复内容
- 变化频繁的信息（应放在 knowledge-core.md 中）

### CLAUDE.md 结构最佳实践

```markdown
# Project Name

## Quick Context
[2-3 sentences about what this project does]

## Development Environment
[Specific setup steps for THIS project]

## Architecture Patterns
[High-level patterns used in THIS codebase]

## Conventions
[Project-specific conventions that differ from defaults]

## Common Tasks
[Frequently performed workflows specific to THIS project]

## Import User Preferences
@~/.claude/agentic-substrate-personal.md
```

## 上下文工程最佳实践

### 1. 少样本提示
- 策划 3-5 个多样化的规范示例
- 展示预期的行为模式
- 选择具有良好泛化能力的示例
- 将示例纳入 CLAUDE.md 或 knowledge-core.md

**示例**：
```markdown
## API Implementation Pattern

Example 1: GET /users/:id
[Show complete example]

Example 2: POST /orders
[Show complete example]

Example 3: PATCH /products/:id
[Show complete example]
```

### 2. 最小化 Token
- 找出最小的高信号 token 集合
- 删除冗余信息
- 将历史上下文归档至 knowledge-core.md
- 使用引用而非重复内容

**之前**：
```markdown
Our authentication system uses JWT tokens. JWT tokens are JSON Web Tokens
that encode user information. We use JWT tokens for API authentication.
JWT tokens expire after 1 hour. JWT tokens are signed with HS256.
```

**之后**（减少 75% 的 token）：
```markdown
Authentication: JWT (HS256, 1hr expiry)
```

### 3. 将结构作为上下文
- 有意义地使用文件夹/文件结构
- 通过命名约定编码信息
- 目录模式传达架构信息

**示例**：
```
/src/
  /api/        → API 层（REST 端点）
  /services/   → 业务逻辑
  /models/     → 数据模型
  /utils/      → 共享工具
  /config/     → 配置
```

这种结构无需冗长说明即可向 Claude 传达架构。

### 4. 动态上下文管理

**加载**：引入当前任务相关的上下文
```markdown
# Working on authentication now
@docs/authentication-architecture.md
```

**编辑**：移除过时或无关的信息
```bash
# Remove old API patterns that are no longer used
```

**归档**：将经验沉淀到 knowledge-core.md
```markdown
# knowledge-core.md

## Authentication Implementation (2025-10-15)
Implemented JWT auth with refresh tokens.
Pattern: See /src/services/auth-service.js
Learnings: [what we learned]
```

**重新加载**：在再次需要时获取已归档的上下文
```markdown
# Switching back to authentication work
@knowledge-core.md#authentication-implementation
```

## 用于上下文工程的工具

Claude 可使用以下工具进行上下文管理：

1. **读取**：从 CLAUDE.md、knowledge-core.md 加载上下文
   - 用于了解当前项目上下文
   - 检查已经记录的内容

2. **编辑**：更新上下文文件以移除过时信息
   - 删除过时章节
   - 使用新的经验进行更新

3. **写入**：将经验归档到 knowledge-core.md
   - 保留组织知识
   - 为未来会话记录模式

4. **Grep**：在整个代码库中查找相关上下文
   - 定位现有模式
   - 查找类似实现

## 反模式：囤积上下文

❌ **不要**：为了“以防万一”而把所有信息都保留在上下文中
- 会导致上下文腐化
- 浪费注意力预算
- 降低模型性能
- 增加 Token 成本

✅ **应该**：归档到 knowledge-core.md，并在需要时重新加载
- 保持上下文干净且聚焦
- 为未来保留信息
- 支持按需检索
- 优化性能

## 会话中途编辑上下文示例

### 场景
完成 API 集成任务后，切换到 UI 工作

### 操作

**步骤 1：归档 API 经验**
```markdown
# knowledge-core.md

## API Integration Pattern (2025-10-18)
Integrated Stripe API v2023-10-16.
Pattern: See /src/services/payment-service.js
Learnings:
- Use idempotency keys for all payment requests
- Webhook signature verification is mandatory
- Test mode uses sk_test_, live uses sk_live_
```

**步骤 2：从活跃记忆中移除 API 特定上下文**
- 编辑 CLAUDE.md，删除 Stripe 特定指南
- 清除对话历史中的 API 实现细节
- 将 API ResearchPack 归档到 knowledge-core.md

**步骤 3：加载 UI 模式和约定**
```markdown
# CLAUDE.md

## UI Development (Active Task)
Framework: React 18
Styling: Tailwind CSS
Component library: shadcn/ui
Pattern: Atomic design (atoms → molecules → organisms)
```

**步骤 4：验证上下文优化**
- 上下文现在聚焦于 UI 工作
- API 知识已保留在 knowledge-core.md 中
- 如后续需要，可重新加载 API 上下文

### 结果
- **减少 84% 的 token**（移除 API 上下文）
- **更清晰地聚焦**于当前 UI 任务
- 由于上下文经过优化，**性能更好**
- 为未来的 API 工作**保留知识**

## 上下文范围管理

### 范围级别

**1. 对话范围**（当前会话）
- 即时任务上下文
- 最近的工具输出
- 活跃文件内容
- 当前正在解决的问题

**2. 项目范围**（CLAUDE.md）
- 项目约定
- 架构模式
- 环境设置
- 团队指南

**3. 知识范围**（knowledge-core.md）
- 累积的经验
- 历史模式
- 已解决的问题
- 经验教训

**4. 用户范围**（~/.claude/agentic-substrate-personal.md）
- 个人偏好
- 编码风格
- 常见工作流
- 个人快捷方式

### 跨范围管理

**提升**（对话 → 项目）：
- 新模式被多次使用 → 添加到 CLAUDE.md

**归档**（对话 → 知识）：
- 已解决的问题 → 记录到 knowledge-core.md

**降级**（项目 → 知识）：
- 过时的约定 → 移动到 knowledge-core.md 的历史部分

**重新加载**（知识 → 对话）：
- 遇到类似问题 → 加载相关知识

## 与记忆层级的集成

上下文工程与 Claude Code 的记忆系统集成：

**记忆层级**（4 个级别）：
1. **企业级**（`/Library/Application Support/ClaudeCode/CLAUDE.md`）- 组织范围
2. **项目级**（`./CLAUDE.md`）- 团队共享
3. **用户级**（`~/.claude/CLAUDE.md`）- 个人偏好
4. **导入**（`@path/to/file.md`）- 模块化组织

**导入语法**：
```markdown
# 加载用户偏好
@~/.claude/agentic-substrate-personal.md

# 加载项目特定模式
@.claude/templates/agents-overview.md
@.claude/templates/skills-overview.md
```

**优点**：
- 模块化的上下文组织
- 无需更改项目文件即可进行用户自定义
- 通过项目 CLAUDE.md 共享团队约定
- 在组织级别强制执行企业策略

## 常见上下文问题与解决方案

### 问题 1：上下文腐化
**症状**：经过长时间对话后，模型性能下降
**解决方案**：每隔 50 条消息定期进行裁剪

### 问题 2：信息过载
**症状**：上下文过多，模型遗漏关键细节
**解决方案**：将历史内容归档到 knowledge-core.md

### 问题 3：信息冗余
**症状**：相同信息在多个位置重复出现
**解决方案**：使用引用/导入来代替重复

### 问题 4：上下文过时
**症状**：上下文中包含过时的模式或已弃用的方法
**解决方案**：定期审查和更新 CLAUDE.md

### 问题 5：上下文缺失
**症状**：模型缺少必要的项目特定信息
**解决方案**：在 CLAUDE.md 中记录关键模式

## 质量检查清单

在认为上下文已优化之前：

- [ ] CLAUDE.md 中的所有信息都是项目特定的（而非通用信息）
- [ ] 没有冗余或重复内容
- [ ] 过时信息已归档到 knowledge-core.md
- [ ] 当前任务已加载所有必要的上下文
- [ ] 为实现预期结果，token 数量已降至最低
- [ ] 示例具有规范性和代表性
- [ ] 结构能够清晰体现架构
- [ ] 用户偏好已导入（而非硬编码）

## 性能监控

跟踪以下指标，以衡量上下文工程的有效性：

**Token 效率**：
- 每轮对话的 Token 数量（应随时间减少）
- 上下文窗口利用率（应保持在 < 70%）
- 冗余率（重复信息 / 信息总量）

**质量指标**：
- 任务成功完成率（应提高）
- 自我纠正频率（应降低）
- 所需澄清问题数量（应减少）

**知识保留**：
- knowledge-core.md 增长率（持续积累）
- 模式复用频率（已记录的模式得到应用）
- 历史上下文检索成功率

---

**上下文工程并非可选项——它是实现可持续、高性能智能体交互的基础。**

**请记住**：上下文中的每个 token 要么有所帮助，要么造成影响。让每一个 token 都发挥作用。