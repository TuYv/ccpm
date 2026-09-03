---
name: bazel-build-optimization
description: Optimize Bazel builds for large-scale monorepos. Use when configuring Bazel, implementing remote execution, or optimizing build performance for enterprise codebases.
---
# Bazel 构建优化

适用于大规模 monorepo 的 Bazel 生产实践模式。

## 何时使用此技能

- 为 monorepo 搭建 Bazel
- 配置远程缓存/执行
- 优化构建时间
- 编写自定义 Bazel 规则
- 调试构建问题
- 迁移到 Bazel

## 核心概念

### 1. Bazel 架构

```
workspace/
├── WORKSPACE.bazel       # External dependencies
├── .bazelrc              # Build configurations
├── .bazelversion         # Bazel version
├── BUILD.bazel           # Root build file
├── apps/
│   └── web/
│       └── BUILD.bazel
├── libs/
│   └── utils/
│       └── BUILD.bazel
└── tools/
    └── bazel/
        └── rules/
```

### 2. 关键概念

| 概念        | 描述                                   |
| ----------- | -------------------------------------- |
| **Target**  | 可构建的单元（库、二进制文件、测试）     |
| **Package** | 包含 BUILD 文件的目录                   |
| **Label**   | 目标标识符 `//path/to:target`          |
| **Rule**    | 定义如何构建一个目标                    |
| **Aspect**  | 横切性的构建行为                        |

## 模板与详细实操示例

完整的模板库和详细的实操示例位于 `references/details.md`。当你需要具体模板时，请阅读该文件。

## 最佳实践

### 推荐做法

- **使用细粒度目标** - 缓存效果更好
- **锁定依赖版本** - 构建可复现
- **启用远程缓存** - 共享构建产物
- **合理使用可见性** - 强制执行架构约束
- **在每个目录中编写 BUILD 文件** - 标准约定

### 避免做法

- **不要对依赖使用 glob** - 显式声明更好
- **不要提交 bazel-\* 目录** - 添加到 .gitignore
- **不要跳过 WORKSPACE 设置** - 构建的基础
- **不要忽略构建警告** - 这是技术债务
