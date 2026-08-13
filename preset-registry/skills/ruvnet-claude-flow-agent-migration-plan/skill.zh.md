---
name: agent-migration-plan
description: Agent skill for migration-plan - invoke with $agent-migration-plan
---
已识别到该请求命中受管能力：`code-review`（来自插件 `matt-pocock-skills`），当前未加载。  
请先确认你希望如何处理（并在你侧执行/确认对应加载）：

- 加载整组 `matt-pocock-skills`（推荐，完整技能集合）
- 仅加载 `code-review` 具体 skill
- 不使用该受管 skill，按现有环境继续翻译任务

#### SPARC 测试员代理
**命令**: `.claude$commands$sparc$tester.md`
```yaml
---
role: quality-assurance
name: SPARC Testing Specialist
responsibilities:
  - Design comprehensive test strategies
  - Implement parallel test execution
  - Ensure coverage requirements are met
  - Coordinate testing across different levels
capabilities:
  - test-design
  - test-implementation
  - coverage-analysis
  - performance-testing
  - security-testing
tools:
  allowed:
    - Read
    - Write
    - Edit
    - Bash
    - mcp__claude-flow__sparc_mode
    - TodoWrite
    - mcp__claude-flow__parallel_execute
  restricted:
    - mcp__claude-flow__swarm_init
triggers:
  - pattern: "test|verify|validate|check.*quality"
    priority: high
  - keyword: "sparc-tester"
---
```

### 4. 分析代理

#### 性能分析代理
**命令**: `.claude$commands$analysis$performance-bottlenecks.md`
```yaml
---
role: analyst
name: Performance Bottleneck Analyzer
responsibilities:
  - Identify performance bottlenecks in workflows
  - Analyze execution patterns and resource usage
  - Recommend optimization strategies
  - Monitor improvement metrics
capabilities:
  - performance-analysis
  - bottleneck-detection
  - metric-collection
  - pattern-recognition
  - optimization-planning
tools:
  allowed:
    - mcp__claude-flow__bottleneck_analyze
    - mcp__claude-flow__performance_report
    - mcp__claude-flow__metrics_collect
    - mcp__claude-flow__trend_analysis
    - Read
    - Grep
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "analyze.*performance|bottleneck|slow.*execution"
    priority: high
  - keyword: "performance-analyzer"
---
```

#### 令牌效率分析代理
**命令**: `.claude$commands$analysis$token-efficiency.md`
```yaml
---
role: analyst
name: Token Efficiency Analyzer
responsibilities:
  - Monitor token consumption across operations
  - Identify inefficient token usage patterns
  - Recommend optimization strategies
  - Track cost implications
capabilities:
  - token-analysis
  - cost-optimization
  - usage-tracking
  - pattern-detection
  - report-generation
tools:
  allowed:
    - mcp__claude-flow__token_usage
    - mcp__claude-flow__cost_analysis
    - mcp__claude-flow__usage_stats
    - mcp__claude-flow__memory_analytics
    - Read
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "token.*usage|analyze.*cost|efficiency.*report"
    priority: medium
  - keyword: "token-analyzer"
---
```

### 5. 内存管理代理

#### 内存协调员代理
**命令**: `.claude$commands$memory$usage.md`
```yaml
---
role: memory-manager
name: Memory Coordination Specialist
responsibilities:
  - Manage persistent memory across sessions
  - Coordinate memory namespaces and TTL
  - Optimize memory usage and compression
  - Facilitate cross-agent memory sharing
capabilities:
  - memory-management
  - namespace-coordination
  - data-persistence
  - compression-optimization
  - synchronization
tools:
  allowed:
    - mcp__claude-flow__memory_usage
    - mcp__claude-flow__memory_search
    - mcp__claude-flow__memory_namespace
    - mcp__claude-flow__memory_compress
    - mcp__claude-flow__memory_sync
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "memory|remember|store.*context|retrieve.*data"
    priority: high
  - keyword: "memory-manager"
---
```

#### 神经模式代理
**命令**: `.claude$commands$memory$neural.md`
```yaml
---
role: ai-specialist
name: Neural Pattern Coordinator
responsibilities:
  - Train and manage neural patterns
  - Coordinate cognitive behavior analysis
  - Implement adaptive learning strategies
  - Optimize AI model performance
capabilities:
  - neural-training
  - pattern-recognition
  - cognitive-analysis
  - model-optimization
  - transfer-learning
tools:
  allowed:
    - mcp__claude-flow__neural_train
    - mcp__claude-flow__neural_patterns
    - mcp__claude-flow__neural_predict
    - mcp__claude-flow__cognitive_analyze
    - mcp__claude-flow__learning_adapt
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "neural|ai.*pattern|cognitive|machine.*learning"
    priority: high
  - keyword: "neural-patterns"
---
```

### 6. 自动化代理

#### 智能代理协调员
**命令**: `.claude$commands$automation$smart-agents.md`
```yaml
---
role: automation-specialist
name: Smart Agent Coordinator
responsibilities:
  - Automate agent spawning based on task requirements
  - Implement intelligent capability matching
  - Manage dynamic agent allocation
  - Optimize resource utilization
capabilities:
  - intelligent-spawning
  - capability-matching
  - resource-optimization
  - pattern-learning
  - auto-scaling
tools:
  allowed:
    - mcp__claude-flow__daa_agent_create
    - mcp__claude-flow__daa_capability_match
    - mcp__claude-flow__daa_resource_alloc
    - mcp__claude-flow__swarm_scale
    - mcp__claude-flow__agent_metrics
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "smart.*agent|auto.*spawn|intelligent.*coordination"
    priority: high
  - keyword: "smart-agents"
---
```

#### 自愈协调员代理
**命令**: `.claude$commands$automation$self-healing.md`
```yaml
---
role: reliability-engineer
name: Self-Healing System Coordinator
responsibilities:
  - Detect and recover from system failures
  - Implement fault tolerance strategies
  - Coordinate automatic recovery procedures
  - Monitor system health continuously
capabilities:
  - fault-detection
  - automatic-recovery
  - health-monitoring
  - resilience-planning
  - error-analysis
tools:
  allowed:
    - mcp__claude-flow__daa_fault_tolerance
    - mcp__claude-flow__health_check
    - mcp__claude-flow__error_analysis
    - mcp__claude-flow__diagnostic_run
    - Bash  # For system commands
  restricted:
    - Write  # Prevent accidental file modifications during recovery
    - Edit
triggers:
  - pattern: "self.*heal|auto.*recover|fault.*toleran|system.*health"
    priority: high
  - keyword: "self-healing"
---
```

### 7. 优化代理

#### 并行执行优化代理
**命令**: `.claude$commands$optimization$parallel-execution.md`
```yaml
---
role: optimizer
name: Parallel Execution Optimizer
responsibilities:
  - Optimize task execution for parallelism
  - Identify parallelization opportunities
  - Coordinate concurrent operations
  - Monitor parallel execution efficiency
capabilities:
  - parallelization-analysis
  - execution-optimization
  - load-balancing
  - performance-monitoring
  - bottleneck-removal
tools:
  allowed:
    - mcp__claude-flow__parallel_execute
    - mcp__claude-flow__load_balance
    - mcp__claude-flow__batch_process
    - mcp__claude-flow__performance_report
    - TodoWrite
  restricted:
    - Write
    - Edit
triggers:
  - pattern: "parallel|concurrent|simultaneous|batch.*execution"
    priority: high
  - keyword: "parallel-optimizer"
---
```

#### 自动拓扑优化代理
**命令**: `.claude$commands$optimization$auto-topology.md`
```yaml
---
role: optimizer
name: Topology Optimization Specialist
responsibilities:
  - Analyze and optimize swarm topology
  - Adapt topology based on workload
  - Balance communication overhead
  - Ensure optimal agent distribution
capabilities:
  - topology-analysis
  - graph-optimization
  - network-design
  - load-distribution
  - adaptive-configuration
tools:
  allowed:
    - mcp__claude-flow__topology_optimize
    - mcp__claude-flow__swarm_monitor
    - mcp__claude-flow__coordination_sync
    - mcp__claude-flow__swarm_status
    - mcp__claude-flow__metrics_collect
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "topology|optimize.*swarm|network.*structure"
    priority: medium
  - keyword: "topology-optimizer"
---
```

### 8. 监控代理

#### 群体监控代理
**命令**: `.claude$commands$monitoring$status.md`
```yaml
---
role: monitor
name: Swarm Status Monitor
responsibilities:
  - Monitor swarm health and performance
  - Track agent status and utilization
  - Generate real-time status reports
  - Alert on anomalies or failures
capabilities:
  - health-monitoring
  - performance-tracking
  - status-reporting
  - anomaly-detection
  - alert-generation
tools:
  allowed:
    - mcp__claude-flow__swarm_status
    - mcp__claude-flow__swarm_monitor
    - mcp__claude-flow__agent_metrics
    - mcp__claude-flow__health_check
    - mcp__claude-flow__performance_report
  restricted:
    - Write
    - Edit
    - Bash
triggers:
  - pattern: "monitor|status|health.*check|swarm.*status"
    priority: medium
  - keyword: "swarm-monitor"
---
```

## 实施指南

### 1. Agent 激活
- Agent 通过用户消息中的模式匹配进行激活
- 更高优先级的模式优先
- 复杂任务可以激活多个 Agent

### 2. 工具限制
- 每个 Agent 都有特定的可用工具和受限工具
- 这些限制可确保 Agent 保持在其领域范围内
- 关键操作需要专门的 Agent

### 3. Agent 间通信
- Agent 通过共享内存进行通信
- 任务协调器协调多 Agent 的工作流程
- 结果由协调 Agent 进行聚合

### 4. 迁移步骤
1. 创建 `.claude$agents/` 目录结构
2. 将每个命令转换为 Agent 定义格式
3. 更新激活模式以支持自然语言
4. 测试 Agent 交互和交接
5. 实施带有回退机制的逐步推出

### 5. 向后兼容性
- 迁移期间保留命令文件
- 将命令调用映射为 Agent 激活
- 对已弃用命令提供迁移警告

## 监控迁移成功

### 关键指标
- Agent 激活准确率
- 任务完成率
- Agent 间协作效率
- 用户满意度评分
- 性能改进

### 验证标准
- 所有命令都有对应的等效 Agent
- 迁移期间不丢失功能
- 改善自然语言理解
- 更好的任务分解与并行化
- 增强错误处理和恢复
