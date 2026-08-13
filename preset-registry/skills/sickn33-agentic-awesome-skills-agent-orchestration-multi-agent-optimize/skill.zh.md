---
name: agent-orchestration-multi-agent-optimize
description: "Optimize multi-agent systems with coordinated profiling, workload distribution, and cost-aware orchestration. Use when improving agent performance, throughput, or reliability."
risk: critical
source: community
date_added: "2026-02-27"
---
# 多智能体优化工具包

## 使用此技能的场景

- 提升多智能体协调、吞吐量或延迟
- 对智能体工作流进行 profiling 以识别瓶颈
- 为复杂工作流设计编排策略
- 优化成本、上下文使用或工具效率

## 不要使用此技能的场景

- 仅需要调优单一智能体提示词
- 没有可衡量的指标或评估数据
- 任务与多智能体编排无关

## 指令

1. 建立基线指标并确定目标性能目标。
2. 分析智能体工作负载并识别协调瓶颈。
3. 逐步应用编排变更和成本控制。
4. 使用可复现测试和回滚机制验证改进。

## 安全性

- 避免在未进行回归测试的情况下部署编排变更。
- 逐步推出变更以防止系统级回归。

## 角色：AI 驱动的多智能体性能工程专家

### 背景

多智能体优化工具是一个先进的 AI 驱动框架，旨在通过智能化、协同化的基于智能体的优化，全面提升系统性能。该工具借助前沿的 AI 编排技术，提供跨多个领域的综合性能工程方法。

### 核心能力

- 智能多智能体协调
- 性能 profiling 与瓶颈识别
- 自适应优化策略
- 跨域性能优化
- 成本与效率追踪

## 参数处理

该工具使用灵活的输入参数处理优化参数：

- `$TARGET`：要优化的主要系统/应用
- `$PERFORMANCE_GOALS`：具体性能指标与目标
- `$OPTIMIZATION_SCOPE`：优化深度（quick-win、comprehensive）
- `$BUDGET_CONSTRAINTS`：成本与资源限制
- `$QUALITY_METRICS`：性能质量阈值

## 1. 多智能体性能 profiling

### Profiling 策略

- 在系统层面分布式性能监控
- 实时指标采集与分析
- 持续性能特征跟踪

#### Profiling 智能体

1. **数据库性能智能体**
   - 查询执行时间分析
   - 索引使用率跟踪
   - 资源消耗监控

2. **应用性能智能体**
   - CPU 与内存 profiling
   - 算法复杂度评估
   - 并发与异步操作分析

3. **前端性能智能体**
   - 渲染性能指标
   - 网络请求优化
   - Core Web Vitals 监控

### Profiling 代码示例

```python
def multi_agent_profiler(target_system):
    agents = [
        DatabasePerformanceAgent(target_system),
        ApplicationPerformanceAgent(target_system),
        FrontendPerformanceAgent(target_system)
    ]

    performance_profile = {}
    for agent in agents:
        performance_profile[agent.__class__.__name__] = agent.profile()

    return aggregate_performance_metrics(performance_profile)
```

## 2. 上下文窗口优化

### 优化技术

- 智能上下文压缩
- 语义相关性过滤
- 动态上下文窗口缩放
- Token 预算管理

### 上下文压缩算法

```python
def compress_context(context, max_tokens=4000):
    # Semantic compression using embedding-based truncation
    compressed_context = semantic_truncate(
        context,
        max_tokens=max_tokens,
        importance_threshold=0.7
    )
    return compressed_context
```

## 3. 智能体协同效率

### 协同原则

- 并行执行设计
- 最小化智能体间通信开销
- 动态工作负载分配
- 容错智能体交互

### 编排框架

```python
class MultiAgentOrchestrator:
    def __init__(self, agents):
        self.agents = agents
        self.execution_queue = PriorityQueue()
        self.performance_tracker = PerformanceTracker()

    def optimize(self, target_system):
        # Parallel agent execution with coordinated optimization
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {
                executor.submit(agent.optimize, target_system): agent
                for agent in self.agents
            }

            for future in concurrent.futures.as_completed(futures):
                agent = futures[future]
                result = future.result()
                self.performance_tracker.log(agent, result)
```

## 4. 并行执行优化

### 关键策略

- 异步智能体处理
- 工作负载拆分
- 动态资源分配
- 最小化阻塞操作

## 5. 成本优化策略

### LLM 成本管理

- Token 使用追踪
- 自适应模型选择
- 缓存与结果复用
- 高效提示词工程

### 成本追踪示例

```python
class CostOptimizer:
    def __init__(self):
        self.token_budget = 100000  # Monthly budget
        self.token_usage = 0
        self.model_costs = {
            'gpt-5': 0.03,
            'claude-4-sonnet': 0.015,
            'claude-4-haiku': 0.0025
        }

    def select_optimal_model(self, complexity):
        # Dynamic model selection based on task complexity and budget
        pass
```

## 6. 延迟降低技术

### 性能加速

- 预测性缓存
- 预热智能体上下文
- 智能结果记忆
- 减少往返通信

## 7. 质量与速度权衡

### 优化谱系

- 性能阈值
- 可接受的降级幅度
- 质量感知优化
- 智能折中选择

## 8. 监控与持续改进

### 可观测性框架

- 实时性能仪表盘
- 自动化优化反馈循环
- 机器学习驱动的改进
- 自适应优化策略

## 参考工作流

### 工作流 1：电商平台优化

1. 初始性能 profiling
2. 基于智能体的优化
3. 成本与性能跟踪
4. 持续改进循环

### 工作流 2：企业 API 性能提升

1. 全面系统分析
2. 多层次智能体优化
3. 迭代性能细化
4. 成本高效扩展策略

## 关键注意事项

- 始终在优化前后进行测量
- 在优化过程中保持系统稳定
- 平衡性能增益与资源消耗
- 实施渐进、可回滚的变更

目标优化：$ARGUMENTS

## 局限性
- 仅在任务明确匹配上述范围时使用此技能。
- 不要将输出替代特定环境的验证、测试或专家审查。
- 如果缺少必需输入、权限、安全边界或成功标准，请停止并请求澄清。
