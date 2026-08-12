---
name: agentic-engineering
description: >
  Operate as an agentic engineer using eval-first execution, decomposition,
  and cost-aware model routing. Use when AI agents perform most implementation
  work and humans enforce quality and risk controls.
metadata:
  origin: ECC
---
# 智能体工程

将此技能用于由 AI 智能体完成大部分实现工作、由人类负责质量把关和风险控制的工程工作流。

## 操作原则

1. 在执行前定义完成标准。
2. 将工作拆分为适合智能体处理的单元。
3. 根据任务复杂度选择不同层级的模型。
4. 使用评测和回归检查进行衡量。

## 评测优先循环

1. 定义能力评测和回归评测。
2. 运行基线评测并记录失败特征。
3. 执行实现。
4. 重新运行评测并比较变化。

**工作流示例：**
```
1. Write test that captures desired behavior (eval)
2. Run test → capture baseline failures
3. Implement feature
4. Re-run test → verify improvements
5. Check for regressions in other tests
```

## 任务拆分

应用 15 分钟单元规则：
- 每个单元都应可独立验证
- 每个单元都应只有一个主要风险
- 每个单元都应具有明确的完成条件

**良好的拆分：**
```
Task: Add user authentication
├─ Unit 1: Add password hashing (15 min, security risk)
├─ Unit 2: Create login endpoint (15 min, API contract risk)
├─ Unit 3: Add session management (15 min, state risk)
└─ Unit 4: Protect routes with middleware (15 min, auth logic risk)
```

**不良的拆分：**
```
Task: Add user authentication (2 hours, multiple risks)
```

## 模型选择

根据任务复杂度选择模型层级：

- **Haiku**：分类、样板代码转换、局部修改
  - 示例：重命名变量、添加类型注解、格式化代码

- **Sonnet**：实现和重构
  - 示例：实现功能、重构模块、编写测试

- **Opus**：架构设计、根因分析、跨文件不变量
  - 示例：设计系统、调试复杂问题、审查架构

**成本纪律：** 只有当较低层级的模型因明显的推理能力不足而失败时，才升级模型层级。

## 会话策略

- 对于紧密耦合的单元，**继续当前会话**
  - 示例：在同一模块中实现相关函数

- 在主要阶段转换后，**开启新会话**
  - 示例：从实现阶段转入测试阶段

- **在里程碑完成后进行压缩**，不要在主动调试期间压缩
  - 示例：功能完成后、开始下一个功能前

## AI 生成代码的审查重点

优先关注：
- 不变量和边界情况
- 错误边界
- 安全与身份验证假设
- 隐性耦合和发布风险

当自动格式化工具或 lint 已经强制执行代码风格时，不要将审查周期浪费在纯粹的风格分歧上。

**审查清单：**
- [ ] 已处理边界情况（null、空值、边界值）
- [ ] 错误处理全面
- [ ] 安全假设已验证
- [ ] 模块之间不存在隐性耦合
- [ ] 已评估发布风险（破坏性变更、迁移）

## 成本纪律

按任务跟踪：
- 使用的模型层级
- Token 估算
- 所需重试次数
- 实际耗时
- 成功/失败结果

**跟踪示例：**
```
Task: Implement user login
Model: Sonnet
Tokens: ~5k input, ~2k output
Retries: 1 (initial implementation had auth bug)
Time: 8 minutes
Outcome: Success
```

## 何时使用此技能

- 管理由 AI 驱动的开发工作流
- 规划智能体任务拆解
- 优化模型层级选择
- 实施评测优先的开发方式
- 审查 AI 生成的代码
- 跟踪开发成本

## 与其他技能的集成

- **tdd-workflow**：与评测优先循环结合，用于测试驱动开发
- **verification-loop**：用于实施过程中的持续验证
- **search-first**：在实施前应用，以查找现有解决方案
- **coding-standards**：在代码审查阶段参考