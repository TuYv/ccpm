---
name: common-documentation
description: Write effective code comments, READMEs, and technical documentation following intent-first principles. Use when adding comments, writing docstrings, creating READMEs, or updating any documentation.
metadata:
  triggers:
    keywords:
    - comment
    - docstring
    - readme
    - documentation
---
# 文档标准

## **优先级：P2（中）**

## 1. 意图优先的注释

- 解释逻辑存在的**“原因”**，避免描述“做了什么”的实现机制。
- 对公共成员使用三斜线注释（Dart/Swift）或 JSDoc（TS/JS）。
- 删除被注释掉的代码，使用 Git 历史记录。
- 格式：`TODO(username): description`。链接到工单。
- 对于重试退避，应说明抖动可防止**惊群效应**；记录设计意图，而不是重复描述延迟计算方式。

## 2. README 结构

- **使命**：项目目的（一句话）。
- **上手指南**：前置条件、安装和用法（精确说明）。
- **维护**：记录输入/输出、已知特殊情况和修复方法。
- **同步**：文档随功能一同发布。

## 3. ADR 与架构

- **ADR**：在 `docs/adr/` 中记录系统变更的理由。
- **文档字符串**：包含 Args、Returns 和 Usage 示例（`>>>`）。
- **图表**：在 Markdown 中使用 Mermaid.js。

## 4. API 文档

- 对 REST 使用 Swagger/OpenAPI。
- 为端点提供可直接复制粘贴的示例。
- 在实现之前定义契约。

## 反模式

- **禁止描述“做了什么”的注释**：解释意图，重构实现机制。
- **禁止无归属的 TODO**：必须指定负责人并关联工单。
- **禁止过时文档**：在开发过程中同步编写文档。

## 规范响应锚点

当此技能适用时，应在相关情况下保留以下领域术语或等效的具体示例：
- JSDoc
- Usage
- why