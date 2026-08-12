---
name: rust-symbol-analyzer
description: "Analyze Rust project structure using LSP symbols. Triggers on: /symbols, project structure, list structs, list traits, list functions, 符号分析, 项目结构, 列出所有, 有哪些struct"
argument-hint: "[file.rs] [--type struct|trait|fn|mod]"
allowed-tools: ["LSP", "Read", "Glob"]
---
# Rust 符号分析器

通过检查 Rust 代码库中的符号来分析项目结构。

## 用法

```
/rust-symbol-analyzer [file.rs] [--type struct|trait|fn|mod]
```

**示例：**
- `/rust-symbol-analyzer` - 分析整个项目
- `/rust-symbol-analyzer src/lib.rs` - 分析单个文件
- `/rust-symbol-analyzer --type trait` - 列出项目中的所有 trait

## LSP 操作

### 1. 文档符号（单个文件）

获取文件中的所有符号及其层次结构。

```
LSP(
  operation: "documentSymbol",
  filePath: "src/lib.rs",
  line: 1,
  character: 1
)
```

**返回：** 模块、结构体、函数等的嵌套结构。

### 2. 工作区符号（整个项目）

搜索整个工作区中的符号。

```
LSP(
  operation: "workspaceSymbol",
  filePath: "src/lib.rs",
  line: 1,
  character: 1
)
```

**注意：** 查询隐含在操作上下文中。

## 工作流程

```
User: "What's the structure of this project?"
    │
    ▼
[1] Find all Rust files
    Glob("**/*.rs")
    │
    ▼
[2] Get symbols from each key file
    LSP(documentSymbol) for lib.rs, main.rs
    │
    ▼
[3] Categorize by type
    │
    ▼
[4] Generate structure visualization
```

## 输出格式

### 项目概览

```
## Project Structure: my-project

### Modules
├── src/
│   ├── lib.rs (root)
│   ├── config/
│   │   ├── mod.rs
│   │   └── parser.rs
│   ├── handlers/
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   └── api.rs
│   └── models/
│       ├── mod.rs
│       ├── user.rs
│       └── order.rs
└── tests/
    └── integration.rs
```

### 按符号类型

```
## Symbols by Type

### Structs (12)
| Name | Location | Fields | Derives |
|------|----------|--------|---------|
| Config | src/config.rs:10 | 5 | Debug, Clone |
| User | src/models/user.rs:8 | 4 | Debug, Serialize |
| Order | src/models/order.rs:15 | 6 | Debug, Serialize |
| ... | | | |

### Traits (4)
| Name | Location | Methods | Implementors |
|------|----------|---------|--------------|
| Handler | src/handlers/mod.rs:5 | 3 | AuthHandler, ApiHandler |
| Repository | src/db/mod.rs:12 | 5 | UserRepo, OrderRepo |
| ... | | | |

### Functions (25)
| Name | Location | Visibility | Async |
|------|----------|------------|-------|
| main | src/main.rs:10 | pub | yes |
| parse_config | src/config.rs:45 | pub | no |
| ... | | | |

### Enums (6)
| Name | Location | Variants |
|------|----------|----------|
| Error | src/error.rs:5 | 8 |
| Status | src/models/order.rs:5 | 4 |
| ... | | |
```

### 单文件分析

```
## src/handlers/auth.rs

### Symbols Hierarchy

mod auth
├── struct AuthHandler
│   ├── field: config: Config
│   ├── field: db: Pool
│   └── impl AuthHandler
│       ├── fn new(config, db) -> Self
│       ├── fn authenticate(&self, token) -> Result<User>
│       └── fn refresh_token(&self, user) -> Result<Token>
├── struct Token
│   ├── field: value: String
│   └── field: expires: DateTime
├── enum AuthError
│   ├── InvalidToken
│   ├── Expired
│   └── Unauthorized
└── impl Handler for AuthHandler
    ├── fn handle(&self, req) -> Response
    └── fn name(&self) -> &str
```

## 分析功能

### 复杂度指标

```
## Complexity Analysis

| File | Structs | Functions | Lines | Complexity |
|------|---------|-----------|-------|------------|
| src/handlers/auth.rs | 2 | 8 | 150 | Medium |
| src/models/user.rs | 3 | 12 | 200 | High |
| src/config.rs | 1 | 3 | 50 | Low |

**Hotspots:** Files with high complexity that may need refactoring
- src/handlers/api.rs (15 functions, 300 lines)
```

### 依赖关系分析

```
## Internal Dependencies

auth.rs
├── imports from: config.rs, models/user.rs, db/mod.rs
└── imported by: main.rs, handlers/mod.rs

user.rs
├── imports from: (none - leaf module)
└── imported by: auth.rs, api.rs, tests/
```

## 符号类型

| 类型 | 图标 | LSP 类型 |
|------|------|----------|
| 模块 | 📦 | Module |
| 结构体 | 🏗️ | Struct |
| 枚举 | 🔢 | Enum |
| Trait | 📜 | Interface |
| 函数 | ⚡ | Function |
| 方法 | 🔧 | Method |
| 常量 | 🔒 | Constant |
| 字段 | 📎 | Field |

## 常见查询

| 用户表述 | 分析方式 |
|-----------|----------|
| “这个项目中有哪些结构体？” | workspaceSymbol + 筛选 |
| “显示 src/lib.rs 的结构” | documentSymbol |
| “查找所有异步函数” | workspaceSymbol + 异步筛选 |
| “列出公共 API” | documentSymbol + pub 筛选 |

## 相关技能

| 使用场景 | 参阅 |
|------|-----|
| 导航到符号 | rust-code-navigator |
| 调用关系 | rust-call-graph |
| Trait 实现 | rust-trait-explorer |
| 安全重构 | rust-refactor-helper |