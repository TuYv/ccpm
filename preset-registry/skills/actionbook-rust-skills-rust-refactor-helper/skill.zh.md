---
name: rust-refactor-helper
description: "Safe Rust refactoring with LSP analysis. Triggers on: /refactor, rename symbol, move function, extract, 重构, 重命名, 提取函数, 安全重构"
argument-hint: "<action> <target> [--dry-run]"
allowed-tools: ["LSP", "Read", "Glob", "Grep", "Edit"]
---
# Rust 重构助手

通过全面的影响分析执行安全重构。

## 用法

```
/rust-refactor-helper <action> <target> [--dry-run]
```

**操作：**
- `rename <old> <new>` - 重命名符号
- `extract-fn <selection>` - 提取为函数
- `inline <fn>` - 内联函数
- `move <symbol> <dest>` - 移动到模块

**示例：**
- `/rust-refactor-helper rename parse_config load_config`
- `/rust-refactor-helper extract-fn src/main.rs:20-35`
- `/rust-refactor-helper move UserService src/services/`

## 使用的 LSP 操作

### 重构前分析

```
# Find all references before renaming
LSP(
  operation: "findReferences",
  filePath: "src/lib.rs",
  line: 25,
  character: 8
)

# Get symbol info
LSP(
  operation: "hover",
  filePath: "src/lib.rs",
  line: 25,
  character: 8
)

# Check call hierarchy for move operations
LSP(
  operation: "incomingCalls",
  filePath: "src/lib.rs",
  line: 25,
  character: 8
)
```

## 重构工作流

### 1. 重命名符号

```
User: "Rename parse_config to load_config"
    │
    ▼
[1] Find symbol definition
    LSP(goToDefinition)
    │
    ▼
[2] Find ALL references
    LSP(findReferences)
    │
    ▼
[3] Categorize by file
    │
    ▼
[4] Check for conflicts
    - Is 'load_config' already used?
    - Are there macro-generated uses?
    │
    ▼
[5] Show impact analysis (--dry-run)
    │
    ▼
[6] Apply changes with Edit tool
```

**输出：**

```
## Rename: parse_config → load_config

### Impact Analysis

**Definition:** src/config.rs:25
**References found:** 8

| File | Line | Context | Change |
|------|------|---------|--------|
| src/config.rs | 25 | `pub fn parse_config(` | Definition |
| src/config.rs | 45 | `parse_config(path)?` | Call |
| src/main.rs | 12 | `config::parse_config` | Import |
| src/main.rs | 30 | `let cfg = parse_config(` | Call |
| src/lib.rs | 8 | `pub use config::parse_config` | Re-export |
| tests/config_test.rs | 15 | `parse_config("test.toml")` | Test |
| tests/config_test.rs | 25 | `parse_config("")` | Test |
| docs/api.md | 42 | `parse_config` | Documentation |

### Potential Issues

⚠️ **Documentation reference:** docs/api.md:42 may need manual update
⚠️ **Re-export:** src/lib.rs:8 - public API change

### Proceed?
- [x] --dry-run (preview only)
- [ ] Apply changes
```

### 2. 提取函数

```
User: "Extract lines 20-35 in main.rs to a function"
    │
    ▼
[1] Read the selected code block
    │
    ▼
[2] Analyze variables
    - Which are inputs? (used but not defined in block)
    - Which are outputs? (defined and used after block)
    - Which are local? (defined and used only in block)
    │
    ▼
[3] Determine function signature
    │
    ▼
[4] Check for early returns, loops, etc.
    │
    ▼
[5] Generate extracted function
    │
    ▼
[6] Replace original code with call
```

**输出：**

```
## Extract Function: src/main.rs:20-35

### Selected Code
​```rust
let file = File::open(&path)?;
let mut contents = String::new();
file.read_to_string(&mut contents)?;
let config: Config = toml::from_str(&contents)?;
validate_config(&config)?;
​```

### Analysis

**Inputs:** path: &Path
**Outputs:** config: Config
**Side Effects:** File I/O, may return error

### Extracted Function

​```rust
fn load_and_validate_config(path: &Path) -> Result<Config> {
    let file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let config: Config = toml::from_str(&contents)?;
    validate_config(&config)?;
    Ok(config)
}
​```

### Replacement

​```rust
let config = load_and_validate_config(&path)?;
​```
```

### 3. 移动符号

```
User: "Move UserService to src/services/"
    │
    ▼
[1] Find symbol and all its dependencies
    │
    ▼
[2] Find all references (callers)
    LSP(findReferences)
    │
    ▼
[3] Analyze import changes needed
    │
    ▼
[4] Check for circular dependencies
    │
    ▼
[5] Generate move plan
```

**输出：**

```
## Move: UserService → src/services/user.rs

### Current Location
src/handlers/auth.rs:50-120

### Dependencies (will be moved together)
- struct UserService (50-80)
- impl UserService (82-120)
- const DEFAULT_TIMEOUT (48)

### Import Changes Required

| File | Current | New |
|------|---------|-----|
| src/main.rs | `use handlers::auth::UserService` | `use services::user::UserService` |
| src/handlers/api.rs | `use super::auth::UserService` | `use crate::services::user::UserService` |
| tests/auth_test.rs | `use crate::handlers::auth::UserService` | `use crate::services::user::UserService` |

### New File Structure

​```
src/
├── services/
│   ├── mod.rs (NEW - add `pub mod user;`)
│   └── user.rs (NEW - UserService moved here)
├── handlers/
│   └── auth.rs (UserService removed)
​```

### Circular Dependency Check
✅ No circular dependencies detected
```

## 安全检查

| 检查项 | 目的 |
|-------|---------|
| 引用完整性 | 确保找到所有使用位置 |
| 名称冲突 | 检测具有相同名称的现有符号 |
| 可见性变更 | 在 pub/private 作用域发生变化时发出警告 |
| 宏生成的代码 | 对宏中的代码发出警告 |
| 文档 | 标记提及该符号的文档注释 |
| 测试覆盖率 | 显示受影响的测试 |

## 试运行模式

始终先使用 `--dry-run` 预览更改：

```
/rust-refactor-helper rename old_name new_name --dry-run
```

这会显示所有更改，但不会应用它们。

## 相关技能

| 场景 | 参见 |
|------|-----|
| 导航到符号 | rust-code-navigator |
| 理解调用流程 | rust-call-graph |
| 项目结构 | rust-symbol-analyzer |
| Trait 实现 | rust-trait-explorer |