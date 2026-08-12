---
name: rust-code-navigator
description: "Navigate Rust code using LSP. Triggers on: /navigate, go to definition, find references, where is defined, 跳转定义, 查找引用, 定义在哪, 谁用了这个"
argument-hint: "<symbol> [in file.rs:line]"
allowed-tools: ["LSP", "Read", "Glob"]
---
# Rust 代码导航器

使用语言服务器协议高效导航大型 Rust 代码库。

## 用法

```
/rust-code-navigator <symbol> [in file.rs:line]
```

**示例：**
- `/rust-code-navigator parse_config` - 查找 parse_config 的定义
- `/rust-code-navigator MyStruct in src/lib.rs:42` - 从特定位置开始导航

## LSP 操作

### 1. 跳转到定义

查找符号的定义位置。

```
LSP(
  operation: "goToDefinition",
  filePath: "src/main.rs",
  line: 25,
  character: 10
)
```

**适用场景：**
- 用户询问“X 在哪里定义？”
- 用户想要了解某个类型/函数
- 等同于按住 Ctrl 并单击

### 2. 查找引用

查找符号的所有使用位置。

```
LSP(
  operation: "findReferences",
  filePath: "src/lib.rs",
  line: 15,
  character: 8
)
```

**适用场景：**
- 用户询问“谁使用了 X？”
- 在重构/重命名前
- 了解变更的影响

### 3. 悬停信息

获取符号的类型和文档。

```
LSP(
  operation: "hover",
  filePath: "src/main.rs",
  line: 30,
  character: 15
)
```

**适用场景：**
- 用户询问“X 是什么类型？”
- 用户想要查看文档
- 快速检查类型

## 工作流程

```
User: "Where is the Config struct defined?"
    │
    ▼
[1] Search for "Config" in workspace
    LSP(operation: "workspaceSymbol", ...)
    │
    ▼
[2] If multiple results, ask user to clarify
    │
    ▼
[3] Go to definition
    LSP(operation: "goToDefinition", ...)
    │
    ▼
[4] Show file path and context
    Read surrounding code for context
```

## 输出格式

### 已找到定义

```
## Config (struct)

**Defined in:** `src/config.rs:15`

​```rust
#[derive(Debug, Clone)]
pub struct Config {
    pub name: String,
    pub port: u16,
    pub debug: bool,
}
​```

**Documentation:** Configuration for the application server.
```

### 已找到引用

```
## References to `Config` (5 found)

| Location | Context |
|----------|---------|
| src/main.rs:10 | `let config = Config::load()?;` |
| src/server.rs:25 | `fn new(config: Config) -> Self` |
| src/server.rs:42 | `self.config.port` |
| src/tests.rs:15 | `Config::default()` |
| src/cli.rs:8 | `config: Option<Config>` |
```

## 常见模式

| 用户表述 | LSP 操作 |
|-----------|---------------|
| “X 在哪里定义？” | goToDefinition |
| “谁使用了 X？” | findReferences |
| “X 是什么类型？” | hover |
| “查找所有结构体” | workspaceSymbol |
| “这个文件里有什么？” | documentSymbol |

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| “没有 LSP 服务器” | rust-analyzer 未运行 | 建议：`rustup component add rust-analyzer` |
| “未找到符号” | 拼写错误或不在作用域内 | 首先使用 workspaceSymbol 搜索 |
| “存在多个定义” | 泛型或宏 | 显示全部定义并让用户选择 |

## 相关技能

| 场景 | 参见 |
|------|-----|
| 调用关系 | rust-call-graph |
| 项目结构 | rust-symbol-analyzer |
| Trait 实现 | rust-trait-explorer |
| 安全重构 | rust-refactor-helper |