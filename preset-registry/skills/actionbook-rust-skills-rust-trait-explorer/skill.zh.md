---
name: rust-trait-explorer
description: "Explore Rust trait implementations using LSP. Triggers on: /trait-impl, find implementations, who implements, trait 实现, 谁实现了, 实现了哪些trait"
argument-hint: "<TraitName|StructName>"
allowed-tools: ["LSP", "Read", "Glob", "Grep"]
---
# Rust Trait 探索器

发现 Trait 实现并理解多态设计。

## 用法

```
/rust-trait-explorer <TraitName|StructName>
```

**示例：**
- `/rust-trait-explorer Handler` - 查找 Handler Trait 的所有实现者
- `/rust-trait-explorer MyStruct` - 查找 MyStruct 实现的所有 Trait

## LSP 操作

### 转到实现

查找 Trait 的所有实现。

```
LSP(
  operation: "goToImplementation",
  filePath: "src/traits.rs",
  line: 10,
  character: 11
)
```

**适用场景：**
- 已知 Trait 名称
- 希望查找所有实现者
- 理解多态代码

## 工作流程

### 查找 Trait 实现者

```
User: "Who implements the Handler trait?"
    │
    ▼
[1] Find trait definition
    LSP(goToDefinition) or workspaceSymbol
    │
    ▼
[2] Get implementations
    LSP(goToImplementation)
    │
    ▼
[3] For each impl, get details
    LSP(documentSymbol) for methods
    │
    ▼
[4] Generate implementation map
```

### 查找类型实现的 Trait

```
User: "What traits does MyStruct implement?"
    │
    ▼
[1] Find struct definition
    │
    ▼
[2] Search for "impl * for MyStruct"
    Grep pattern matching
    │
    ▼
[3] Get trait details for each
    │
    ▼
[4] Generate trait list
```

## 输出格式

### Trait 实现者

```
## Implementations of `Handler`

**Trait defined at:** src/traits.rs:15

​```rust
pub trait Handler {
    fn handle(&self, request: Request) -> Response;
    fn name(&self) -> &str;
}
​```

### Implementors (4)

| Type | Location | Notes |
|------|----------|-------|
| AuthHandler | src/handlers/auth.rs:20 | Handles authentication |
| ApiHandler | src/handlers/api.rs:15 | REST API endpoints |
| WebSocketHandler | src/handlers/ws.rs:10 | WebSocket connections |
| MockHandler | tests/mocks.rs:5 | Test mock |

### Implementation Details

#### AuthHandler
​```rust
impl Handler for AuthHandler {
    fn handle(&self, request: Request) -> Response {
        // Authentication logic
    }

    fn name(&self) -> &str {
        "auth"
    }
}
​```

#### ApiHandler
​```rust
impl Handler for ApiHandler {
    fn handle(&self, request: Request) -> Response {
        // API routing logic
    }

    fn name(&self) -> &str {
        "api"
    }
}
​```
```

### 类型实现的 Trait

```
## Traits implemented by `User`

**Struct defined at:** src/models/user.rs:10

### Standard Library Traits
| Trait | Derived/Manual | Notes |
|-------|----------------|-------|
| Debug | #[derive] | Auto-generated |
| Clone | #[derive] | Auto-generated |
| Default | manual | Custom defaults |
| Display | manual | User-friendly output |

### Serde Traits
| Trait | Location |
|-------|----------|
| Serialize | #[derive] |
| Deserialize | #[derive] |

### Project Traits
| Trait | Location | Methods |
|-------|----------|---------|
| Entity | src/db/entity.rs:30 | id(), created_at() |
| Validatable | src/validation.rs:15 | validate() |

### Implementation Hierarchy

​```
User
├── derive
│   ├── Debug
│   ├── Clone
│   ├── Serialize
│   └── Deserialize
└── impl
    ├── Default (src/models/user.rs:50)
    ├── Display (src/models/user.rs:60)
    ├── Entity (src/models/user.rs:70)
    └── Validatable (src/models/user.rs:85)
​```
```

## Trait 层级可视化

```
## Trait Hierarchy

                    ┌─────────────┐
                    │    Error    │ (std)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼───────┐ ┌──▼──┐ ┌───────▼───────┐
      │  AppError     │ │ ... │ │  DbError      │
      └───────┬───────┘ └─────┘ └───────┬───────┘
              │                         │
      ┌───────▼───────┐         ┌───────▼───────┐
      │ AuthError     │         │ QueryError    │
      └───────────────┘         └───────────────┘
```

## 分析功能

### 覆盖情况检查

```
## Trait Implementation Coverage

Trait: Handler (3 required methods)

| Implementor | handle() | name() | priority() | Complete |
|-------------|----------|--------|------------|----------|
| AuthHandler | ✅ | ✅ | ✅ | Yes |
| ApiHandler | ✅ | ✅ | ❌ default | Yes |
| MockHandler | ✅ | ✅ | ✅ | Yes |
```

### Blanket 实现

```
## Blanket Implementations

The following blanket impls may apply to your types:

| Trait | Blanket Impl | Applies To |
|-------|--------------|------------|
| From<T> | `impl<T> From<T> for T` | All types |
| Into<U> | `impl<T, U> Into<U> for T where U: From<T>` | Types with From |
| ToString | `impl<T: Display> ToString for T` | Types with Display |
```

## 常见模式

| 用户说法 | 操作 |
|-----------|--------|
| “谁实现了 X？” | 对 Trait 使用 goToImplementation |
| “Y 实现了哪些 Trait？” | 使用 Grep 搜索 `impl * for Y` |
| “显示 Trait 层级” | 递归查找父 Trait |
| “X 是否满足 Send + Sync？” | 检查标准库 Trait 实现 |

## 相关 Skill

| 场景 | 参见 |
|------|-----|
| 导航到 impl | rust-code-navigator |
| 调用关系 | rust-call-graph |
| 项目结构 | rust-symbol-analyzer |
| 安全重构 | rust-refactor-helper |