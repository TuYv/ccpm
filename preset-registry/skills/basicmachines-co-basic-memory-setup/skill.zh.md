---
name: setup
description: Set up the Basic Memory plugin for this project — a short guided interview that configures the project mapping, seeds note schemas, learns or suggests placement conventions, and enables capture reflexes. Use when the user runs /basic-memory:setup, says "set up basic memory", or asks to configure/bootstrap the plugin.
argument-hint: (no arguments — runs an interactive interview)
---
# Basic Memory 基础设置

进行一次简短的自适应访谈（约 2～3 分钟），然后写入配置。
以对话方式进行，并且**跳过那些根据上下文已经显而易见的问题**（例如，如果 `list_memory_projects` 显示只有一个本地项目且没有云端工作区，就不要询问云端或团队相关问题——只需确认即可）。为每个问题提供一个合理的默认选项，让用户可以只用一个词接受。在访谈结束并确认方案之前，不要执行任何写入操作。

## 前置条件检查

首先确认 **Basic Memory MCP 服务器已连接**——调用
`list_memory_projects`。如果该工具不可用或调用出错，说明 Basic Memory 尚未接入 Claude Code。**请先停下来，引导用户完成接入**（下文所有步骤都依赖于此）：

1. 安装：`uv tool install basic-memory`（或 `pip install basic-memory`），
   版本 `>= 0.19.0`。
2. 连接：`claude mcp add basic-memory -- uvx basic-memory mcp`，然后重启
   会话以加载 MCP 服务器。

继续之前，再次检查 `list_memory_projects`——在调用成功之前不要开始访谈。

## 访谈

只询问无法推断的信息。涵盖以下内容：

1. **重点／使用方式。**“这个项目主要用于什么——代码／开发、研究、写作、知识收集、规划，还是混合用途？”这个答案
   **至关重要**，并非闲聊：它决定你在第 4 步建议的文件夹结构，
   也会被保存下来，以便 SessionStart 简报呈现该信息，确保内容捕获方式
   与使用场景相匹配。不要让这个答案被遗漏——如果你没有提问，而是根据上下文
   推断，也仍需说明你假设的使用场景及其对应的结构，并允许用户用一个词进行纠正。

2. **项目映射。**“你是否已经有一个用于此用途的 Basic Memory 项目，
   还是需要我创建一个？”
   - 已有项目 → 显示 `list_memory_projects()` 并让用户选择。该名称将成为
     `primaryProject`。
   - 新项目 → 建议一个名称（默认：当前仓库的目录名），并使用
     `create_memory_project` 创建。
     - *本地项目*（默认）：路径默认为 `~/basic-memory/<name>/`；任何
       已连接的 Basic Memory 服务器都可以创建它。
     - *云端项目*（用户希望将捕获的内容存入云端工作区）：传入
       `workspace` 选择器（来自 `list_workspaces` 的 slug）以及类似
       `/<name>` 的云端路径，并使用**已连接云端**的 MCP 服务器创建。纯
       本地服务器（`uvx basic-memory mcp`）会将该路径视为本地目录，因而
       无法创建它（例如只读的 `/`）。如果同时连接了本地和云端服务器，
       应通过云端服务器执行项目创建*以及*架构初始化，并将 `primaryProject`
       固定为新项目的 `external_id` UUID（避免不同工作区之间的命名冲突）。

3. **云端／团队**（如果没有额外的工作区，则跳过）。运行
   `list_workspaces`。如果用户属于多个工作区，他们可能除了个人／默认工作区之外，
   还拥有一个**团队**工作区。使用 `list_memory_projects` 查看每个工作区中的项目
   （注意：不同工作区中的项目名称可能冲突，因此始终使用**带工作区限定的名称**，例如
   `my-team-2/notes`，或使用 `external_id` UUID——绝不要只使用项目名称）。
   - **从团队读取**（推荐）：询问要将哪些团队项目纳入会话简报以供回忆。
     将其限定名称存入 `secondaryProjects`。这些项目为**只读**——
     回忆功能会跨这些项目读取，但不会向其中写入任何内容。
     **上限：**SessionStart 简报在每次会话中仅按列表顺序读取前 **6** 个共享项目
     （这是为了限制延迟和输出量）。如果用户希望配置超过六个项目，
     应将最相关的项目排在前面，并告知用户其余项目虽已配置，但不会在每次会话中读取。
   - **共享目标**（可选）：如果用户希望通过 `/basic-memory:share` 将笔记
     *发布*给团队，请将其添加到 `teamProjects`，格式为
     `"<qualified-name>": { "promoteFolder": "shared" }`。共享始终需要手动触发——
     自动捕获绝不会写入团队项目。

将 `primaryProject` 保持为用户拥有的项目，用于他们的*个人*捕获；团队
   项目仅用于读取和有意共享。

4. **放置方式——学习或建议**（取决于项目的状态）。目标是生成一段简短的
   `placementConventions` 字符串（3-6 行），说明新笔记应放在哪里。
   如何获得它取决于项目是否已有笔记：
   - **已有笔记的现有项目** → *学习*。检查该项目：使用 `list_directory` 查看
     文件夹布局，每个文件夹抽样查看几篇笔记（如果某个文件夹包含反复出现的
     类型化笔记，还可以运行 `schema_infer` 来了解其结构）。
     总结*实际*约定——按主题划分的文件夹布局、命名风格，以及他们偏好的
     观察类别。根据他们的实际笔记进行推断；不要强加约定。
   - **新项目或空项目** → *建议*（目前没有可供学习的内容）。提出一个
     符合第 1 步中重点的**轻量**结构——3-5 个可选的顶层文件夹，
     不要设置深层分类体系——并明确说明这只是一个起点，而不是固定框架：
     即使没有它，笔记也完全可以正常使用，结构可以继续自然演化。不要
     创建空文件夹；文件夹会随着笔记写入其中而出现。让用户用一个词进行
     编辑或拒绝。
   无论哪种方式，都要保持简短，并将结果存储为 `placementConventions`。
   SessionStart 简报会显示它（与 `captureFolder` 一起），因此它能让你的
   捕获内容落在用户预期的位置——没有它，放置位置就只能靠猜测。

5. **模式。**“我会为会话检查点、决策和任务添加模式，以便之后能精确找到
   它们——可以吗？”（参见下方的“植入模式”。）

6. **我应该多主动？（输出风格）**“希望我主动捕获吗——在回忆之前搜索图谱，
   将重要决策写成类型化笔记，并引用永久链接？还是保持安静（仅提供会话简报、
   PreCompact 检查点，并按需使用 `/basic-memory:remember`）？”启用后会设置
   `outputStyle: "basic-memory"`。默认启用；若要设置为仅回忆、低干扰模式，
   则保持关闭。（这是控制助手主动程度的唯一开关——无论如何，钩子始终都会运行。）

7. **共享技能**（可选，默认为是）。“需要完整的 Basic Memory 工具包吗——
   即共享的 `memory-*` 技能（`memory-notes`、`memory-tasks`、`memory-research`、
   `memory-schema`、`memory-defrag` 等）？我可以将它们与此插件一起安装。”
   这些是规范的、与框架无关的技能（与 OpenClaw 捆绑的技能集相同）。
   此插件仅包含 Claude Code 专用的衔接代码，并按需拉取共享技能集——它不会
   在自身内部保存这些技能的副本。（参见下方的“安装共享技能”。）

## 应用（确认计划后）

### 1. 植入模式
插件在 `<plugin>/schemas/` 中提供了种子模式——该目录位于此技能目录的
**上两级，然后进入 `schemas/`**（此技能位于 `<plugin>/skills/setup/`）。
读取其中的 `session.md`、`decision.md` 和 `task.md`。

对于每一个模式：
- 检查所选项目是否已具有该类型的模式
  （使用带有 `metadata_filters={"type": "schema"}` 的 `search_notes`，或尝试
  `read_note("schemas/<name>")`）。**如果已存在，则跳过**——绝不要覆盖用户
  可能已经自定义的模式。
- 否则，使用 `write_note` 写入，并将其路由至 `primaryProject`（将其作为
  `project` 传入；如果它是 `external_id` UUID，则作为 `project_id` 传入）：
  - `directory="schemas"`、`note_type="schema"`，`title` = 模式的标题
    （Session / Decision / Task）。
  - `content` = **仅 Markdown 正文**——即 `---` 前置元数据块之后的所有内容
    （`# Session` 标题和正文）。
  - `metadata` = 模式的结构化前置元数据，以**嵌套字典**形式传入：`entity`、
    `version`、完整的 `schema` 映射，以及 `settings`（保留其中嵌套的
    `frontmatter`，并将枚举值作为 JSON 数组传入，例如
    `["open","resumed","closed"]`）。
  - **不要**将模式的 `---` 前置元数据放入 `content`。在云端写入路径中，
    这种嵌套 YAML 会被静默强制转换为字符串 `'[object Object]'`
    （basic-memory-cloud#1000），从而损坏 `schema`/`settings`。`metadata`
    参数在本地和云端都能正确往返转换。植入完成后，使用
    `read_note(..., output_format="json", include_frontmatter=true)` 验证一篇
    笔记——返回的 `schema`/`settings` 必须是嵌套对象，而不是字符串。

### 2. 安装共享技能（如果用户已选择启用）
**首先，防止覆盖源代码检出。** 如果 `./skills` 已存在、已被 git 跟踪，并且包含 `memory-*` 目录，则说明你当前位于这些技能自身的源代码仓库中（例如 `basic-memory` 本身）——安装操作会使用已发布的版本覆盖工作副本。在这种情况下，**跳过安装**，并告知用户这些技能已以源代码形式存在；不要运行该命令。快速检查：

```
git ls-files skills/ | grep -q memory- && echo "source repo - skip install"
```

否则，从项目根目录运行：

```
npx skills add basicmachines-co/basic-memory --path skills
```

这会将规范的 `memory-*` 技能安装到用户的技能目录中——这是与 OpenClaw 共享的唯一事实来源。该插件**不会**内置副本；它依赖这套共享技能。如果 `npx` / `skills` CLI 不可用，请引导用户参阅顶层 [`skills/README.md`](../../../../skills/README.md) 中的手动安装说明。

### 3. 写入设置
根据访谈内容构建 `basicMemory` 块：

```json
{
  "basicMemory": {
    "primaryProject": "<chosen>",
    "secondaryProjects": [],
    "captureFolder": "sessions",
    "rememberFolder": "bm-remember",
    "recallTimeframe": "3d",
    "preCompactCapture": "extractive",
    "placementConventions": "<learned or suggested summary, or null>",
    "teamProjects": {}
  },
  "outputStyle": "basic-memory"
}
```

仅当用户选择启用时才包含 `outputStyle`。询问这是**团队默认设置**（写入/合并到 `.claude/settings.json`，并建议提交该文件）还是**个人设置**（`.claude/settings.local.json`）。**合并**到任何现有文件中——读取该文件，仅添加/替换上述键，并保留其他所有内容。使用紧凑且有效的 JSON。

写入 `basicMemory` 块也会停止 SessionStart 钩子的首次运行提示——该配置的存在就是安装流程已运行的信号。

### 4. 对连接进行冒烟测试
结束之前，验证召回确实能够正确解析——这样可以在用户还在场、能够修复问题时，发现项目名称错误、缺少云端凭据或引用无法路由等问题。通过 SessionStart 钩子所使用的 CLI（`basic-memory` / `bm` / `uvx basic-memory`），运行与该钩子相同的结构化查询：

- **主项目：** 针对 `primaryProject` 运行 `… tool search-notes --type schema --page-size 5`——如果是 UUID，则使用 `--project-id <uuid>`；否则使用 `--project <ref>`。它应返回你刚刚植入的三个模式。
- **一个共享项目**（仅当 `secondaryProjects` 非空时）：针对第一个引用运行 `--type decision --status open` 查询。它只需正常返回即可——`0 results` 没有问题；出现**错误**则意味着该引用无法路由。

如果查询出错，或主项目没有返回任何内容，请明确指出问题并在结束前修复项目引用——不要让下一会话的简报空空如也。

## 结束

用几行内容确认你所执行的操作：项目映射、哪些模式是新植入的与哪些已存在、放置规则是学习得出还是建议的、冒烟测试结果，以及输出样式是否已启用。

然后根据输出样式处理激活：
- **已启用输出样式** → 它在会话开始时便已固定，因此完整的捕获机制要到下一个会话才会生效。提示用户**重新启动会话**（启动一个新的 Claude Code 会话）来激活这些机制。表述要准确，避免让人误以为“目前还什么都不能用”：回忆功能在本次会话中已经生效（SessionStart 钩子的提示已运行），PreCompact 检查点现在也能正常工作——只有主动捕获机制需要等到重新启动后才会生效。
- **已关闭输出样式** → 无需重新启动；钩子已经在运行。

最后以这句话结尾：*"完成——从下一条消息起，我会使用此功能。随时运行 `/basic-memory:status`
即可查看我正在跟踪的内容。"*