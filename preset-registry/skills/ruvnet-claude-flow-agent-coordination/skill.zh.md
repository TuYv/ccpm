---
name: agent-coordination
description: >
  Agent spawning, lifecycle management, and coordination patterns. Manages 60+ agent types with specialized capabilities.
  Use when: spawning agents, coordinating multi-agent tasks, managing agent pools.
  Skip when: single-agent work, no coordination needed.
---
# 智能体协调技能

## 目的
为复杂的多智能体任务生成并协调智能体。

## 智能体类型

### 核心开发
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### V3 专项
`security-architect`, `security-auditor`, `memory-specialist`, `performance-engineer`

### 群体协调
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`

### 共识
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`

### GitHub
`pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`

### SPARC
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

## 命令

### 启动智能体
```bash
npx claude-flow agent spawn --type coder --name my-coder
```

### 列出智能体
```bash
npx claude-flow agent list --filter active
```

### 智能体状态
```bash
npx claude-flow agent status --id agent-123
```

### 智能体指标
```bash
npx claude-flow agent metrics --id agent-123
```

### 停止智能体
```bash
npx claude-flow agent stop --id agent-123
```

### 池管理
```bash
npx claude-flow agent pool --size 5 --type coder
```

## 路由代码

| 代码 | 任务 | 智能体 |
|------|------|--------|
| 1 | 缺陷修复 | coordinator, researcher, coder, tester |
| 3 | 功能开发 | coordinator, architect, coder, tester, reviewer |
| 5 | 重构 | coordinator, architect, coder, reviewer |
| 7 | 性能 | coordinator, perf-engineer, coder |
| 9 | 安全 | coordinator, security-architect, auditor |

## 最佳实践
1. 使用分层拓扑进行协调
2. 为了紧密协作，将智能体数量保持在 8 以下
3. 针对具体任务使用专用智能体
4. 通过记忆进行协调，而非直接沟通
