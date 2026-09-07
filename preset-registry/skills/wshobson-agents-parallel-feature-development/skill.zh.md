---
name: parallel-feature-development
description: Coordinate parallel feature development with file ownership strategies, conflict avoidance rules, and integration patterns for multi-agent implementation. Use this skill when decomposing a large feature into independent work streams, when two or more agents need to implement different layers of the same system simultaneously, when establishing file ownership to prevent merge conflicts in a shared codebase, when designing interface contracts so parallel implementers can build against each other's APIs before they are ready, or when deciding whether to use vertical slices versus horizontal layers for a full-stack feature.
version: 1.0.2
---
# 并行功能开发

将功能拆解为并行工作流的策略，包括建立文件所有权边界、避免冲突，以及整合多个实施者（implementer）代理的成果。

## 何时使用此技能

- 将一个功能拆解以便并行实现
- 在多个代理之间建立文件所有权边界
- 为并行工作流设计接口契约
- 选择整合策略（垂直切片 vs 水平分层）
- 管理并行开发的分支与合并工作流

## 文件所有权策略

### 按目录

为每个实施者分配特定目录的所有权：

```
implementer-1: src/components/auth/
implementer-2: src/api/auth/
implementer-3: tests/auth/
```

**最适用于**：组织良好、目录边界清晰的代码库。

### 按模块

分配逻辑模块的所有权（模块可能跨越多个目录）：

```
implementer-1: Authentication module (login, register, logout)
implementer-2: Authorization module (roles, permissions, guards)
```

**最适用于**：面向功能的架构、领域驱动设计。

### 按层

分配架构层的所有权：

```
implementer-1: UI layer (components, styles, layouts)
implementer-2: Business logic layer (services, validators)
implementer-3: Data layer (models, repositories, migrations)
```

**最适用于**：传统的 MVC/分层架构。

## 冲突规避规则

### 首要规则

**一个文件只有一个所有者。** 任何文件都不应分配给多个实施者。

### 文件必须共享时

如果某个文件确实需要多个实施者进行修改：

1. **指定唯一所有者** —— 由一个实施者拥有该文件
2. **其他实施者提出变更请求** —— 向所有者发送包含具体变更请求的消息
3. **所有者按顺序应用变更** —— 防止合并冲突
4. **备选方案：提取接口** —— 创建一个单独的接口文件，非所有者可以导入而无需修改

### 接口契约

当实施者需要在边界处协调时：

```typescript
// src/types/auth-contract.ts (owned by team-lead, read-only for implementers)
export interface AuthResponse {
  token: string;
  user: UserProfile;
  expiresAt: number;
}

export interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
}
```

两个实施者都从该契约文件导入，但都不修改它。

## 整合模式

### 垂直切片

每个实施者构建一个完整的功能切片（UI + API + 测试）：

```
implementer-1: Login feature (login form + login API + login tests)
implementer-2: Register feature (register form + register API + register tests)
```

**优点**：每个切片可独立测试，所需整合工作最少。
**缺点**：可能重复实现共享工具，对紧耦合的功能较难适用。

### 水平分层

每个实施者构建覆盖所有功能的某一层：

```
implementer-1: All UI components (login form, register form, profile page)
implementer-2: All API endpoints (login, register, profile)
implementer-3: All tests (unit, integration, e2e)
```

**优点**：每层内部模式一致，分工自然。
**缺点**：整合点更多，第 3 层依赖第 1 层和第 2 层。

### 混合模式

根据耦合程度混合垂直与水平方式：

```
implementer-1: Login feature (vertical slice — UI + API + tests)
implementer-2: Shared auth infrastructure (horizontal — middleware, JWT utils, types)
```

**最适用于**：大多数带有部分共享基础设施的真实功能。

## 分支管理

### 单分支策略

所有实施者在同一个功能分支上工作：

- 设置简单，无合并开销
- 需要严格的文件所有权来避免冲突
- 最适用于：小团队（2-3 人）、边界明确的情况

### 多分支策略

每个实施者在一个子分支上工作：

```
feature/auth
  ├── feature/auth-login      (implementer-1)
  ├── feature/auth-register    (implementer-2)
  └── feature/auth-tests       (implementer-3)
```

- 隔离性更强，合并点明确
- 开销更高，共享文件中仍可能出现合并冲突
- 最适用于：较大团队（4 人以上）、复杂功能

## 故障排查

**实施者因等待共享代码而相互阻塞。**
将共享部分提取为一个由 team-lead 拥有的独立接口契约文件，让实施者从该文件导入。任何实施者都不修改契约——他们只依据契约进行实现。

**即使有明确的所有权规则，仍然出现合并冲突。**
某个文件被分配给了两个代理，或者某个自动导入一切的配置/索引文件（如 `index.ts`、`__init__.py`）被双方同时修改。为所有 barrel/index 文件指定唯一所有者，或者由负责人在最后统一合并。

**某个实施者提前完成，但整合步骤被阻塞。**
使用过渡接口：已完成的实施者为下游依赖编写一个 stub 或 mock，让另一个实施者可以继续工作。到整合阶段再替换为真实实现。

**功能拆分在中途被证明是错误的。**
停止新的工作，让负责人重新分配文件，并通过广播通知这一变更。已写了一半的代码产生的沉没成本是可以接受的——带着错误的拆分继续下去更糟。

**一个实施者编写的测试在另一个实施者编写的代码上失败。**
接口契约发生了漂移：拥有 API 的实施者在未通知测试实施者的情况下修改了某个签名。强制执行以下规则：契约文件在修改前必须先广播。

## 相关技能

- [team-composition-patterns](../team-composition-patterns/SKILL.md) — 在拆解工作之前选择合适的团队规模和代理类型
- [team-communication-protocols](../team-communication-protocols/SKILL.md) — 在实施者之间协调整合交接和计划审批
