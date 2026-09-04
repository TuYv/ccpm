---
name: openspec-propose
description: Propose a new change with all artifacts generated in one step. Use when the user wants to quickly describe what they want to build and get a complete proposal with design, specs, and tasks ready for implementation.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
提议一个新变更 - 一步完成变更的创建并生成所有工件。

我将创建一个变更及其工件：
- proposal.md（是什么与为什么）
- design.md（怎么做）
- tasks.md（实现步骤）

准备好实现时，运行 /opsx:apply

---

**输入**：用户的请求应包含一个变更名称（kebab-case）或一段关于他们想要构建的内容的描述。

**步骤**

1. **如果没有提供明确的输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式、无预设选项）来询问：
   > “你想处理什么变更？请描述你想要构建或修复的内容。”

   从他们的描述中推导出一个 kebab-case 名称（例如 "add user authentication" → `add-user-auth`）。

   **重要**：在未理解用户想要构建什么之前，不要继续。

2. **创建变更目录**
   ```bash
   openspec new change "<name>"
   ```
   这会在 `openspec/changes/<name>/` 创建一个脚手架变更，并带有 `.openspec.yaml`。

3. **获取工件构建顺序**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析该 JSON 以获取：
   - `applyRequires`：实现前所需的工件 ID 数组（例如 `["tasks"]`）
   - `artifacts`：所有工件及其状态和依赖项的列表

4. **按顺序创建工件，直到可执行 apply**

   使用 **TodoWrite 工具**来跟踪工件的进度。

   按依赖顺序循环处理工件（没有待处理依赖的工件优先）：

   a. **对于每个处于 `ready` 状态的工件（依赖已满足）**：
      - 获取指令：
        ```bash
        openspec instructions <artifact-id> --change "<name>" --json
        ```
      - 指令 JSON 包含：
        - `context`：项目背景（对你的约束 - 不要包含在输出中）
        - `rules`：工件特定规则（对你的约束 - 不要包含在输出中）
        - `template`：输出文件要使用的结构
        - `instruction`：针对该工件类型的模式特定指导
        - `outputPath`：工件的写入位置
        - `dependencies`：需要阅读以获取上下文的已完成工件
      - 阅读任何已完成的依赖文件以获取上下文
      - 以 `template` 作为结构创建工件文件
      - 将 `context` 和 `rules` 作为约束加以应用 - 但不要将它们复制到文件中
      - 显示简要进度：“已创建 <artifact-id>”

   b. **继续，直到所有 `applyRequires` 工件完成**
      - 每创建一个工件后，重新运行 `openspec status --change "<name>" --json`
      - 检查 `applyRequires` 中的每个工件 ID 在 artifacts 数组中是否具有 `status: "done"`
      - 当所有 `applyRequires` 工件完成时停止

   c. **如果某个工件需要用户输入**（上下文不明确）：
      - 使用 **AskUserQuestion 工具**进行澄清
      - 然后继续创建

5. **显示最终状态**
   ```bash
   openspec status --change "<name>"
   ```

**输出**

完成所有工件后，总结：
- 变更名称和位置
- 已创建工件的列表及简要描述
- 就绪状态：“所有工件已创建！可以开始实现。”
- 提示：“运行 `/opsx:apply` 或让我来实现，开始处理这些任务。”

**工件创建指南**

- 遵循来自 `openspec instructions` 的每种工件类型的 `instruction` 字段
- 模式定义了每个工件应包含的内容 - 请遵循它
- 在创建新工件之前，先阅读依赖工件以获取上下文
- 以 `template` 作为输出文件的结构 - 填充其各个部分
- **重要**：`context` 和 `rules` 是对你的约束，而不是文件的内容
  - 不要将 `<context>`、`<rules>`、`<project_context>` 块复制到工件中
  - 这些内容指导你写什么，但绝不应出现在输出中

**护栏**
- 创建实现所需的所有工件（由模式的 `apply.requires` 定义）
- 在创建新工件之前，始终先阅读依赖工件
- 如果上下文存在严重不明确之处，询问用户 - 但优先做出合理决定以保持推进势头
- 如果同名变更已存在，询问用户是想继续该变更还是创建一个新的
- 写入每个工件后，先验证该工件文件存在，再继续下一个
