---
name: designing-architecture
description: Designs software architecture and selects appropriate patterns for projects. Use when designing systems, choosing architecture patterns, structuring projects, making technical decisions, or when asked about microservices, monoliths, or architectural approaches.
---
# 设计架构

### 何时加载

- **触发条件**：系统设计、模块结构、新项目脚手架、选择架构模式
- **跳过条件**：不影响架构的简单错误修复或小幅代码改动

## 架构决策工作流

复制此检查清单并跟踪进度：

```
Architecture Design Progress:
- [ ] Step 1: Understand requirements and constraints
- [ ] Step 2: Assess project size and team capabilities
- [ ] Step 3: Select architecture pattern
- [ ] Step 4: Define directory structure
- [ ] Step 5: Document trade-offs and decision
- [ ] Step 6: Validate against decision framework
```

## 模式选择指南

### 按项目规模

| 规模              | 推荐模式                          |
| ----------------- | --------------------------------- |
| 小型（<10K LOC）  | 简单 MVC/分层架构                 |
| 中型（10K-100K）  | 整洁架构                          |
| 大型（>100K）     | 模块化单体或微服务                |

### 按团队规模

| 团队规模      | 建议                         |
| ------------- | ---------------------------- |
| 1-3 名开发者  | 具有清晰模块划分的单体架构   |
| 4-10 名开发者 | 模块化单体架构               |
| 10 名以上开发者 | 微服务（如果有充分理由）   |

## 常见模式

### 1. 分层架构

```
┌─────────────────────────────┐
│       Presentation          │  ← UI, API Controllers
├─────────────────────────────┤
│       Application           │  ← Use Cases, Services
├─────────────────────────────┤
│         Domain              │  ← Business Logic, Entities
├─────────────────────────────┤
│      Infrastructure         │  ← Database, External APIs
└─────────────────────────────┘
```

**适用场景**：简单的 CRUD 应用、小型团队、快速原型

### 2. 整洁架构

```
┌─────────────────────────────────────┐
│            Frameworks & Drivers      │
│  ┌─────────────────────────────┐    │
│  │     Interface Adapters       │    │
│  │  ┌─────────────────────┐    │    │
│  │  │   Application       │    │    │
│  │  │  ┌─────────────┐    │    │    │
│  │  │  │   Domain    │    │    │    │
│  │  │  └─────────────┘    │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**适用场景**：复杂业务逻辑、长期维护的项目、可测试性至关重要

### 3. 六边形架构（端口与适配器）

```
        ┌──────────┐
        │ HTTP API │
        └────┬─────┘
             │ Port
    ┌────────▼────────┐
    │                 │
    │   Application   │
    │     Core        │
    │                 │
    └────────┬────────┘
             │ Port
        ┌────▼─────┐
        │ Database │
        └──────────┘
```

**适用场景**：需要替换外部依赖、存在多个入口点

### 4. 事件驱动架构

```
Producer → Event Bus → Consumer
              │
              ├─→ Consumer
              │
              └─→ Consumer
```

**适用场景**：需要松耦合、异步处理、可扩展性

### 5. CQRS（命令查询职责分离）

```
┌─────────────┐      ┌─────────────┐
│  Commands   │      │   Queries   │
│  (Write)    │      │   (Read)    │
└──────┬──────┘      └──────┬──────┘
       │                    │
       ▼                    ▼
  Write Model          Read Model
       │                    │
       └────────┬───────────┘
                ▼
           Event Store
```

**适用场景**：读写扩展需求不同、复杂领域、事件溯源

## 目录结构模式

### 基于功能（推荐用于中型及以上项目）

```
src/
├── features/
│   ├── users/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── orders/
│       ├── api/
│       ├── components/
│       └── ...
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/
    └── ...
```

### 基于分层（简单应用）

```
src/
├── controllers/
├── services/
├── models/
├── repositories/
└── utils/
```

## 决策框架

在做出架构决策时，请依据以下标准进行评估：

1. **简单性** - 从简单方案开始，按需演进
2. **团队技能** - 使架构与团队能力相匹配
3. **需求** - 让业务需求驱动决策
4. **可扩展性** - 考虑增长轨迹
5. **可维护性** - 针对变更进行优化

## 权衡分析模板

使用此模板记录架构决策：

```markdown
## Decision: [What we're deciding]

### Context

[Why this decision is needed now]

### Options Considered

1. Option A: [Description]
2. Option B: [Description]

### Trade-offs

| Criteria         | Option A | Option B |
| ---------------- | -------- | -------- |
| Complexity       | Low      | High     |
| Scalability      | Medium   | High     |
| Team familiarity | High     | Low      |

### Decision

We chose [Option] because [reasoning].

### Consequences

- [What this enables]
- [What this constrains]
```

## 验证清单

选择架构后，请依据以下清单进行验证：

```
Architecture Validation:
- [ ] Matches project size and complexity
- [ ] Aligns with team skills and experience
- [ ] Supports current requirements
- [ ] Allows for anticipated growth
- [ ] Dependencies flow inward (core has no external deps)
- [ ] Clear boundaries between modules/layers
- [ ] Testing strategy is feasible
- [ ] Trade-offs are documented
```

如果验证失败，请重新考虑模式选择或调整实现方式。