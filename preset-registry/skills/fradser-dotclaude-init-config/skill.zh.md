---
name: init-config
description: Generates a CLAUDE.md file with AI-driven environment detection and advanced configuration options. This skill should be used when the user asks to "initialize config", "setup claude config", "create CLAUDE.md", or needs help configuring project instructions.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
  - Bash(git:*)
  - Bash(node:*)
  - Bash(python3:*)
  - Bash(rustc:*)
  - Bash(go:*)
  - Bash(java:*)
  - Bash(docker:*)
  - Bash(which:*)
  - Bash(command:*)
  - Bash(npm:*)
  - Bash(pnpm:*)
  - Bash(yarn:*)
  - Bash(bun:*)
  - Bash(uv:*)
  - Bash(pip:*)
  - Bash(poetry:*)
  - Bash(${CLAUDE_PLUGIN_ROOT}/scripts/*)
---
## 初始化
按顺序运行各个阶段，因为后续阶段依赖于此前阶段保存的选择。

## 阶段 1：环境发现
**目标**：检测已安装的语言、工具和包管理器。

**操作**：
1. 检测已安装的语言（Node.js、Python、Rust、Go、Java、Docker 及其他语言）。
2. 检测所选生态系统可用的包管理器选项。
3. 存储检测结果，以用于阶段 4 的选项生成。

## 阶段 2：开发者资料
**目标**：检测或收集开发者身份信息，以进行个性化设置。

**操作**：
1. 运行 `git config user.name` 和 `git config user.email` 以检测开发者信息。
2. 如果两者均已检测到，则将其存储为 `developer_name` 和 `developer_email`，以用作渲染器参数，然后进入阶段 3。
3. 如果缺少其中任意一项，则通过对话直接询问用户：
   - 如果缺少姓名：“无法从 git 配置中检测到你的姓名。你希望使用什么姓名？（或回复 'skip' 以省略）”
   - 如果缺少电子邮箱：“无法从 git 配置中检测到你的电子邮箱。你希望使用什么电子邮箱？（或回复 'skip' 以省略）”
4. 将用户的回复（如果跳过则为空值）存储为 `developer_name` 和 `developer_email`，以用作渲染器参数。

## 阶段 3：测试方法论
**目标**：选择测试方法。

**操作**：
使用标题 `Testing Methodology` 进行询问：
- `BDD first, then TDD (Recommended)` -> 使用红-绿-重构循环、由 BDD 驱动的 TDD
- `BDD only` -> 使用 Gherkin 场景，不采用 TDD 循环
- `TDD only` -> 不使用 BDD 场景的测试驱动开发
- `None` -> 不采用特定的测试方法论
将选择存储为 `testing_mode`（bdd-tdd | bdd | tdd | none），以用于阶段 7 的渲染器参数。

## 阶段 3.5：内存管理（可选）
**目标**：决定是否添加 CLAUDE.md 内存指令。

**操作**：
使用标题 `Memory` 进行询问：
- `Skip (Recommended)`
- `Include memory rules`
存储布尔值 `include_memory`，以用作渲染器参数。不要手动追加内存文本。

## 阶段 4：技术栈和包管理器选择
**目标**：选择语言和包管理器。

**操作**：
1. 使用 **AskUserQuestion**（`multiSelect: true`）选择技术栈。
2. 根据检测到的技术生成选项，并将已检测到的技术标记为推荐。
3. 对于拥有多个管理器的已选语言，询问偏好：
- Node.js：npm、pnpm（推荐）、yarn、bun。
- Python：pip、uv（推荐）、poetry。
- 仅显示在计算机上检测到的管理器。
4. 将有序的技术栈选择存储为 `language:::package_manager`，以用作渲染器参数。

## 阶段 5：渲染器输入准备
**目标**：根据用户选择准备确定性的渲染器输入。

**操作**：
1. 将每个选定的技术栈规范化为有序的渲染器输入格式 `language:::package_manager`。
- 保持选择顺序不变。
2. 对于未明确选择包管理器的语言，使用 `language:::`（管理器为空）。
3. 在可用时保持语言键完全一致（`Node.js`、`Python`、`Rust`、`Swift`、`Go`、`Java`）；不要自行创建别名。
4. 在此阶段绝不要调用在线搜索。

## 阶段 6：风格偏好
**目标**：选择生成的 CLAUDE.md 中的 emoji 使用策略。

**操作**：
使用标题 `Style` 进行询问：
- `No Emojis (Recommended)`
- `Use Emojis`
存储布尔值 `use_emojis`，用于控制输出中 emoji 策略文本的渲染器参数。



## 阶段 7：组装与生成
**目标**：通过一个渲染器脚本生成最终内容。

**操作**：
1. 使用以下参数运行 `${CLAUDE_PLUGIN_ROOT}/scripts/render-claude-config.sh`：
- `--target-file $HOME/.claude/CLAUDE.md`
- `--testing-mode <bdd-tdd|bdd|tdd|none>`（来自阶段 3）
- `--include-memory <true|false>`
- `--use-emojis <true|false>`
- 可选的 `--developer-name` 和 `--developer-email`
- 使用阶段 5 中的条目，重复传入 `--stack "language:::package_manager"`
2. 让渲染器处理所有组装事项：片段组装、测试内容注入、开发者资料、技术栈章节、可选的记忆章节以及最终写入。
3. 不要手动后期编辑渲染器输出；如果输出结构不正确，请修正输入或渲染器行为。



## 阶段 8：写入 CLAUDE.md
**目标**：报告渲染器的写入和备份结果。

**操作**：
1. 使用渲染器输出来确认：
- 已写入的目标路径。
- 当现有目标文件存在时所创建的备份路径。
2. 报告：
- 文件和备份位置。
- 开发者信息和测试模式。
- 所选技术栈和包管理器。
- 渲染器规则应用摘要：哪些技术栈获得了本地规则行，哪些没有。

## 最佳实践
- 保持工作流渐进且确定。
- 对于技术栈指导，优先使用本地参考资料，而不是生成的文字。
- 保持生成的约束简洁且可执行。
- 覆盖前始终备份现有文件。