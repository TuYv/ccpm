---
name: openspec-ff-change
description: Fast-forward through OpenSpec artifact creation. Use when the user wants to quickly create all artifacts needed for implementation without stepping through each one individually.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
快速推进工件创建——一次性生成开始实现所需的全部内容。

**输入**：用户的请求应包含一个变更名称（kebab-case）或一段描述其想要构建内容的说明。

**步骤**

1. **如果未提供明确的输入，询问用户想要构建什么**

   使用 **AskUserQuestion 工具**（开放式提问，无预设选项）询问：
   > "你想要进行什么变更？请描述你想要构建或修复的内容。"

   从其描述中推导出一个 kebab-case 名称（例如，"add user authentication" → `add-user-auth`）。

   **重要**：在理解用户想要构建什么之前，切勿继续。

2. **创建变更目录**
   ```bash
   openspec new change "<name>"
   ```
   这会在 `openspec/changes/<name>/` 下创建一个脚手架变更。

3. **获取工件构建顺序**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析该 JSON 以获取：
   - `applyRequires`：实现之前所需的工件 ID 数组（例如 `["tasks"]`）
   - `artifacts`：所有工件的列表，及其状态和依赖项

4. **按顺序创建工件，直至达到可应用状态**

   使用 **TodoWrite 工具**跟踪各工件的处理进度。

   按依赖顺序遍历各工件（优先处理没有待处理依赖的工件）：

   a. **对于每个处于 `ready` 状态的工件（依赖已满足）**：
      - 获取指令：
        ```bash
        openspec instructions <artifact-id> --change "<name>" --json
        ```
      - 指令 JSON 包括：
        - `context`：项目背景（对你的约束——切勿包含在输出中）
        - `rules`：特定于工件的规则（对你的约束——切勿包含在输出中）
        - `template`：输出文件应使用的结构
        - `instruction`：针对此工件类型的 schema 特定指导
        - `outputPath`：写入工件的位置
        - `dependencies`：需要阅读以获取上下文的已完成工件
      - 阅读所有已完成的依赖文件以获取上下文
      - 以 `template` 作为结构创建工件文件
      - 将 `context` 和 `rules` 作为约束加以应用——但切勿将其复制到文件中
      - 显示简要进度："✓ 已创建 <artifact-id>"

   b. **继续，直到所有 `applyRequires` 工件全部完成**
      - 每创建一个工件后，重新运行 `openspec status --change "<name>" --json`
      - 检查 `applyRequires` 中的每个工件 ID 在 artifacts 数组中是否为 `status: "done"`
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
- 就绪内容："所有工件已创建！已准备好开始实现。"
- 提示："运行 `/opsx:apply` 或让我开始实现，以着手处理这些任务。"

**工件创建指南**

- 对每种工件类型，遵循 `openspec instructions` 返回的 `instruction` 字段
- schema 定义了每个工件应包含的内容——请遵循它
- 在创建新工件之前，先阅读依赖工件以获取上下文
- 以 `template` 作为输出文件的结构——填写其中各个部分
- **重要**：`context` 和 `rules` 是对你的约束，而不是文件的内容
  - 切勿将 `<context>`、`<rules>`、`<project_context>` 块复制到工件中
  - 它们指导你写什么，但绝不应出现在输出中

**护栏**
- 创建实现所需的所有工件（由 schema 的 `apply.requires` 定义）
- 在创建新工件之前，务必阅读依赖工件
- 如果上下文严重不明确，询问用户——但优先做出合理决策以保持推进势头
- 如果已存在同名变更，建议改为继续处理该变更
- 在进入下一个工件之前，先验证已写入的每个工件文件确实存在
