---
name: memory-processor
description: Process file changes and update CLAUDE.md memory sections. Use when the memory-updater agent needs to analyze dirty files, update AUTO-MANAGED sections, verify content removal, or detect stale commands. Invoked after file edits to keep project memory in sync.
---
# 记忆处理器

处理已变更的文件，并按照官方指南更新相关记忆文件章节（CLAUDE.md 或 AGENTS.md，以项目配置中当前激活的文件为准）。

## 指南

**强制要求**：以下所有规则必须严格遵循。违反规则将产生错误的 CLAUDE.md 内容。

@../shared/references/guidelines.md

## 算法

1. **解析上下文**：读取 memory-updater 代理提供的上下文：
   - 已变更的文件及其分类
   - 文件内容摘要
   - 检测到的依赖项
   - Git 上下文（提交、差异）
   - 目标记忆文件（按项目配置为 CLAUDE.md 或 AGENTS.md）

2. **归类变更**：使用下方『章节名称』中的表格，将文件映射到 CLAUDE.md 的各个章节，并将已变更的文件与其更新触发条件进行匹配。

3. **分析影响**：确定需要更新的内容：
   - 新增了构建命令？
   - 架构发生变化（新目录、组件重命名）？
   - 检测到新的编码模式？
   - 新增或移除了依赖项？

4. **验证并更新内容**：在修改已记录的内容之前，先验证其准确性：

   **关键区分——约定（conventions）与模式（patterns）：**
   - `conventions`：由人为制定的明确规则（命名、导入、格式化）
   - `patterns`：AI 从反复出现的代码结构中检测到的隐式模式

   **移除验证：**
   - 读取 CLAUDE.md 相关章节，获取当前已记录的条目
   - 对于每个似乎已从变更文件中消失的条目：
     - 使用 Grep 在代码库中搜索该条目
     - 在相关目录中搜索，排除 node_modules、vendor、.git
     - 如果该条目在其他地方仍存在：保留其记录
     - 如果在任何地方都找不到该条目：标记为待移除

   **过时命令检测：**
   - 将已记录的命令与实际成功执行的命令进行对比
   - 如果已记录的命令与成功执行的命令不一致，更新为实际有效的命令
   - 示例：
     - 已记录：`python pytest` | 实际有效：`python -m pytest` → 更新
     - 已记录：`npm test` | 实际有效：`npm run test` → 更新
     - 已记录：`pytest tests/` | 实际有效：`uv run pytest` → 更新
   - 来源：会话上下文或 git 提交历史中成功执行的 Bash 工具记录

   **示例：**
   - 模式：`@decorator` 被移除 → 搜索 `grep -r "@decorator" src/`
   - 约定：`async/await` 风格被移除 → 搜索 `async function` 或 `await`
   - 架构：`utils/` 目录被删除 → 验证不再存在对 `utils/` 的引用
   - 构建命令：`npm run dev` 从 package.json 中移除 → 验证该脚本已不存在

5. **更新记忆文件**：修改当前激活记忆文件中的相关章节：
   - 保留 AUTO-MANAGED 标记
   - 绝不触碰 MANUAL 章节
   - 遵循内容规则（具体、简洁、结构化）
   - 不要修改 CLAUDE.md 重定向文件（仅包含 "Read AGENTS.md..." 的文件）

6. **验证**：确保更新符合指南要求：
   - 不添加泛泛而谈的指令
   - 内容具体且可操作
   - 正确的 markdown 格式

## 标记语法

CLAUDE.md 使用 HTML 注释标记来实现选择性更新：

```markdown
<!-- AUTO-MANAGED: section-name -->
Content that will be automatically updated
<!-- END AUTO-MANAGED -->

<!-- MANUAL -->
Content that will never be touched
<!-- END MANUAL -->
```

## 章节名称

### 根目录 CLAUDE.md 章节

| 章节 | 用途 | 更新触发条件 |
|---------|---------|-----------------|
| `project-description` | 项目概览 | README 变更、重大重构 |
| `build-commands` | 构建、测试、lint 命令 | package.json、Makefile、pyproject.toml |
| `architecture` | 目录结构、组件 | 新目录、文件重命名、结构性变更 |
| `conventions` | 命名、导入、代码规范 | 源文件中的模式变更 |
| `patterns` | AI 检测到的编码模式 | 跨文件重复出现的模式 |
| `git-insights` | 从 git 历史中得出的决策 | 重要提交 |
| `best-practices` | 来自 Claude Code 官方文档 | 仅限手动更新 |

### 子目录 CLAUDE.md 章节

| 章节 | 用途 | 更新触发条件 |
|---------|---------|-----------------|
| `module-description` | 模块用途 | 模块 README、重大变更 |
| `architecture` | 模块结构 | 模块内的文件变更 |
| `conventions` | 模块特定约定 | 模块内的模式变更 |
| `dependencies` | 关键模块依赖 | 导入变更、包更新 |

## Token 效率

- 保持章节简洁——使用要点而非段落
- 对详细规范使用导入（`@path/to/file`）
- 遵循上方的内容规则（< 500 行，保持时效性）

## 输出

返回简要摘要：
- "Updated [section names] in [memory file path] based on changes to [file names]"
- "Removed [pattern] from [section] - no longer used in codebase"
- "No updates needed - changes do not affect documented sections"
