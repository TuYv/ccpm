---
name: context7-guidance
description: Fetch CURRENT library/framework/API/CLI documentation via Context7 instead of relying on training data. Use whenever the user mentions a specific library, framework, SDK, API, or cloud service, asks a setup/configuration question, plans a version migration, or is debugging library-specific behavior. Triggers on common web frameworks, APIs, and cloud services — even well-known ones, since training data may be stale.
---
# Context7 指南 — 使用当前文档，而不是训练数据

该工具包附带 Context7 插件权限，因此你可以获取项目实际使用版本的**当前**文档。训练数据会逐渐过时：API 可能被弃用，默认值会发生变化，配置键可能会重命名。当问题涉及真实的库时，请获取文档——不要凭记忆作答。

## 使用时机

当用户出现以下情况时，请使用 Context7：

- 指定了某个具体的库、框架、SDK 或云服务（常见的 Web 框架、API 和云服务——即使是你“了解”的那些）
- 询问设置或配置问题（“如何接入 X 中间件？”）
- 计划进行版本迁移（“升级到 vN 后有哪些变化？”）
- 正在调试特定于库的行为（错误、弃用提示、意外的默认值）
- 希望编写调用第三方 API 的代码——在编写之前先验证签名

**不应使用的情况：** 一般编程概念、重构你自己的代码、调试你自己的业务逻辑、从头编写脚本，或审查不涉及库逻辑的代码。Context7 面向的是*外部接口*，而不是你的代码库。

## 获取方式

1. **解析库 ID。** 使用库名称调用 `resolve-library-id`，并将用户的**完整问题**作为查询参数传入——这样可以提高排序准确性。
2. **选择最佳匹配项。** 优先选择名称完全匹配且属于官方/主要软件包的结果，而不是社区分支。如果用户指定了版本，优先选择特定于该版本的 ID。
3. **查询文档。** 使用选定的库 ID 和用户的具体问题调用 `query-docs`（不要只传入一个关键词）。
4. **根据结果作答。** 使用获取到的文档，包含相关示例，并在版本重要时注明版本。

如果工具无法直接调用，请先通过 ToolSearch 加载它们（`select:mcp__context7__resolve-library-id,mcp__context7__query-docs`）——不要仅仅因为工具未预加载就跳过验证。

## 指南

- **传入完整问题**，而不是一个词——这能提高两个步骤中的相关性。
- **注意版本**——当用户提到某个版本时，在解析步骤中也要带上该版本。
- **多个匹配项之间优先选择官方来源**。
- **仅当 Context7 没有涵盖该库时，才回退到网页搜索**。