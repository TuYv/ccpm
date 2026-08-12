---
name: rust-deps-visualizer
description: "Visualize Rust project dependencies as ASCII art. Triggers on: /deps-viz, dependency graph, show dependencies, visualize deps, 依赖图, 依赖可视化, 显示依赖"
argument-hint: "[--depth N] [--features]"
allowed-tools: ["Bash", "Read", "Glob"]
---
# Rust 依赖可视化工具

为 Rust 项目的依赖树生成 ASCII 艺术形式的可视化图。

## 用法

```
/rust-deps-visualizer [--depth N] [--features]
```

**选项：**
- `--depth N`：限制树的深度（默认值：3）
- `--features`：显示功能标志

## 输出格式

### 简单树（默认）

```
my-project v0.1.0
├── tokio v1.49.0
│   ├── pin-project-lite v0.2.x
│   └── bytes v1.x
├── serde v1.0.x
│   └── serde_derive v1.0.x
└── anyhow v1.x
```

### 感知功能的树

```
my-project v0.1.0
├── tokio v1.49.0 [rt, rt-multi-thread, macros, fs, io-util]
│   ├── pin-project-lite v0.2.x
│   └── bytes v1.x
├── serde v1.0.x [derive]
│   └── serde_derive v1.0.x (proc-macro)
└── anyhow v1.x [std]
```

## 实现

**步骤 1：** 解析 Cargo.toml 以获取直接依赖项

```bash
cargo metadata --format-version=1 --no-deps 2>/dev/null
```

**步骤 2：** 获取完整的依赖树

```bash
cargo tree --depth=${DEPTH:-3} ${FEATURES:+--features} 2>/dev/null
```

**步骤 3：** 格式化为 ASCII 艺术树

使用以下制表字符：
- `├──` 用于中间项
- `└──` 用于最后一项
- `│   ` 用于延续行

## 视觉增强

### 依赖项分类

```
my-project v0.1.0
│
├─[Runtime]─────────────────────
│ ├── tokio v1.49.0
│ └── async-trait v0.1.x
│
├─[Serialization]───────────────
│ ├── serde v1.0.x
│ └── serde_json v1.x
│
└─[Development]─────────────────
  ├── criterion v0.5.x
  └── proptest v1.x
```

### 大小可视化（可选）

```
my-project v0.1.0
├── tokio v1.49.0        ████████████ 2.1 MB
├── serde v1.0.x         ███████ 1.2 MB
├── regex v1.x           █████ 890 KB
└── anyhow v1.x          ██ 120 KB
                         ─────────────────
                         Total: 4.3 MB
```

## 工作流程

1. 检查当前目录中是否存在 Cargo.toml
2. 使用指定选项运行 `cargo tree`
3. 解析输出并生成 ASCII 可视化图
4. 根据用途进行可选分类（运行时、开发、构建）

## 相关技能

| 场景 | 参见 |
|------|-----|
| Crate 选择建议 | m11-ecosystem |
| 工作区管理 | m11-ecosystem |
| 功能标志决策 | m11-ecosystem |