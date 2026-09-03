---
name: openspec-new-change
description: Start a new OpenSpec change using the experimental artifact workflow. Use when the user wants to create a new feature, fix, or modification with a structured step-by-step approach.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
使用实验性的制品驱动方法启动一个新变更。

**输入**：用户的请求应包含一个变更名称（kebab-case）或对他们想要构建内容的描述。

**步骤**

1. **如果未提供明确输入，询问他们想要构建什么**

   使用 **AskUserQuestion 工具**（开放式提问，无预设选项）来询问：
   > "你想进行哪项变更？请描述你想要构建或修复的内容。"

   从他们的描述中推导出一个 kebab-case 名称（例如，"add user authentication" → `add-user-auth`）。

   **重要**：在未理解用户想要构建什么之前，切勿继续。

2. **确定工作流 schema**

   使用默认 schema（省略 `--schema`），除非用户明确请求不同的工作流。

   **仅当用户提到以下情况时才使用不同的 schema：**
   - 特定的 schema 名称 → 使用 `--schema <name>`
   - "show workflows" 或 "what workflows" → 运行 `openspec schemas --json` 并让他们选择

   **否则**：省略 `--schema` 以使用默认值。

3. **创建变更目录**
   ```bash
   openspec new change "<name>"
   ```
   仅当用户请求特定工作流时才添加 `--schema <name>`。
   这会在 `openspec/changes/<name>/` 下使用所选的 schema 创建一个已搭建脚手架的变更。

4. **显示制品状态**
   ```bash
   openspec status --change "<name>"
   ```
   这会显示哪些制品需要创建，哪些已就绪（依赖已满足）。

5. **获取第一个制品的说明**
   第一个制品取决于 schema（例如，spec-driven 的 `proposal`）。
   检查状态输出，找到状态为 "ready" 的第一个制品。
   ```bash
   openspec instructions <first-artifact-id> --change "<name>"
   ```
   这会输出创建第一个制品所需的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成这些步骤后，总结：
- 变更名称和位置
- 正在使用的 schema/工作流及其制品顺序
- 当前状态（0/N 个制品已完成）
- 第一个制品的模板
- 提示："准备好创建第一个制品了吗？只需描述这个变更的内容，我就会起草它，或者让我继续。"

**护栏**
- 尚不要创建任何制品——只显示说明
- 不要推进到显示第一个制品模板之外
- 如果名称无效（非 kebab-case），请要求提供有效名称
- 如果已存在同名变更，建议改为继续处理该变更
- 如果使用非默认工作流，则传递 --schema
