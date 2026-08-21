---
name: common-best-practices
description: Enforce SOLID principles, guard-clause style, function size limits, and intention-revealing naming across all languages. Use when refactoring for readability, applying clean-code patterns, reviewing naming conventions, or reducing function complexity.
metadata:
  triggers:
    files:
    - '**/*.ts'
    - '**/*.tsx'
    - '**/*.go'
    - '**/*.dart'
    - '**/*.java'
    - '**/*.kt'
    - '**/*.swift'
    - '**/*.py'
    keywords:
    - solid
    - kiss
    - dry
    - yagni
    - naming
    - conventions
    - refactor
    - clean code
---
# 全局最佳实践

## **优先级：P0（关键）**

## 核心原则

- **SOLID**：遵循 SRP（单一变更原因）、OCP（对扩展开放）、LSP、ISP、DIP。
- **KISS/DRY/YAGNI**：优先考虑可读性。抽象重复逻辑。不要编写“以防万一”的代码。
- **命名**：使用能体现意图的名称（`isUserAuthenticated` 优于 `checkUser`）。遵循相应语言的大小写约定。

## 代码卫生

- **大小限制**：函数 < 30 行。服务 < 600 行。工具类 < 400 行。
- **提前返回**：使用守卫子句。避免深层嵌套。
- **注释**：解释**为什么**，而不是**做什么**。重构糟糕的代码；不要用注释掩盖它。
- **输入**：验证并清理所有外部输入。

## 反模式

- **禁止硬编码常量**：使用具名配置或环境变量。
- **禁止深层嵌套**：使用守卫子句。
- **禁止全局状态**：优先使用依赖注入。
- **禁止空 Catch**：始终进行处理、记录日志或重新抛出。

## 参考资料

- [代码结构模式](references/CODE_STRUCTURE.md) — 文件/函数组织
- [有效性指南](references/EFFECTIVENESS.md) — 实际应用示例