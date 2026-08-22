---
name: commit
description: Create well-formatted commits with conventional commit messages and emoji
argument-hint: Optional flags like --no-verify to skip pre-commit checks
model: haiku
allowed-tools: Bash(git status:*), Bash(git add:*), Bash(git diff:*), Bash(git commit:*), Bash(git config:*), Bash(git branch:*), Bash(git checkout:*), Bash(pnpm lint:*), Bash(npm run lint:*), Bash(yarn lint:*), Bash(bun lint:*)
---
# Claude 命令：提交

你的任务是使用约定式提交消息和 emoji 创建格式规范的提交。

## 说明

重要：严格按照以下步骤操作：

1. **分支检查**：检查当前分支是否为 `master` 或 `main`。如果是，则询问用户是否要在提交前创建单独的分支。如果用户确认需要新分支，则使用 `<type>/<username>/<description>` 模式创建分支（例如 `feature/leovs09/add-new-command`）
2. 除非指定 `--no-verify`，否则根据项目所使用的语言自动运行 `pnpm lint` 等预提交检查。
3. 使用 `git status` 检查哪些文件已暂存
4. 如果暂存的文件为 0 个，则使用 `git add` 自动添加所有已修改文件和新文件
5. 执行 `git diff` 以了解将要提交的更改
6. 分析差异，以确定是否存在多个不同的逻辑更改
7. 如果检测到多个不同的更改，建议将其拆分为多个更小的提交
8. 对每个提交（如果不拆分，则为单个提交），使用带 emoji 的约定式提交格式创建提交消息

## 提交最佳实践

- **提交前验证**：确保代码已通过 lint 检查、能够正确构建，并且文档已更新
- **原子提交**：每个提交都应包含服务于单一目的的相关更改
- **拆分大型更改**：如果更改涉及多个关注点，请将其拆分为多个单独的提交
- **约定式提交格式**：使用 `<type>: <description>` 格式，其中 type 为以下值之一：
  - `feat`：新功能
  - `fix`：错误修复
  - `docs`：文档更改
  - `style`：代码样式更改（格式化等）
  - `refactor`：既不修复错误也不添加功能的代码更改
  - `perf`：性能改进
  - `test`：添加或修复测试
  - `chore`：构建流程、工具等方面的更改
- **使用现在时和祈使语气**：将提交消息写成命令（例如使用“add feature”，而不是“added feature”）
- **首行简洁**：首行保持在 72 个字符以内
- **Emoji**：每种提交类型都配有适当的 emoji：
  - ✨ `feat`：新功能
  - 🐛 `fix`：错误修复
  - 📝 `docs`：文档
  - 💄 `style`：格式化/样式
  - ♻️ `refactor`：代码重构
  - ⚡️ `perf`：性能改进
  - ✅ `test`：测试
  - 🔧 `chore`：工具、配置
  - 🚀 `ci`：CI/CD 改进
  - 🗑️ `revert`：还原更改
  - 🧪 `test`：添加一个失败的测试
  - 🚨 `fix`：修复编译器/linter 警告
  - 🔒️ `fix`：修复安全问题
  - 👥 `chore`：添加或更新贡献者
  - 🚚 `refactor`：移动或重命名资源
  - 🏗️ `refactor`：进行架构更改
  - 🔀 `chore`：合并分支
  - 📦️ `chore`：添加或更新已编译文件或软件包
  - ➕ `chore`：添加依赖项
  - ➖ `chore`：移除依赖项
  - 🌱 `chore`：添加或更新种子文件
  - 🧑‍💻 `chore`：改善开发者体验
  - 🧵 `feat`：添加或更新与多线程或并发相关的代码
  - 🔍️ `feat`：改进 SEO
  - 🏷️ `feat`：添加或更新类型
  - 💬 `feat`：添加或更新文本和字面量
  - 🌐 `feat`：国际化和本地化
  - 👔 `feat`：添加或更新业务逻辑
  - 📱 `feat`：处理响应式设计
  - 🚸 `feat`：改善用户体验/易用性
  - 🩹 `fix`：对非关键问题进行简单修复
  - 🥅 `fix`：捕获错误
  - 👽️ `fix`：因外部 API 更改而更新代码
  - 🔥 `fix`：移除代码或文件
  - 🎨 `style`：改进代码的结构/格式
  - 🚑️ `fix`：关键热修复
  - 🎉 `chore`：启动项目
  - 🔖 `chore`：发布/版本标签
  - 🚧 `wip`：进行中的工作
  - 💚 `fix`：修复 CI 构建
  - 📌 `chore`：将依赖项固定到特定版本
  - 👷 `ci`：添加或更新 CI 构建系统
  - 📈 `feat`：添加或更新分析或跟踪代码
  - ✏️ `fix`：修复拼写错误
  - ⏪️ `revert`：还原更改
  - 📄 `chore`：添加或更新许可证
  - 💥 `feat`：引入破坏性更改
  - 🍱 `assets`：添加或更新资源
  - ♿️ `feat`：改进无障碍访问
  - 💡 `docs`：添加或更新源代码中的注释
  - 🗃️ `db`：执行数据库相关更改
  - 🔊 `feat`：添加或更新日志
  - 🔇 `fix`：移除日志
  - 🤡 `test`：模拟对象
  - 🥚 `feat`：添加或更新彩蛋
  - 🙈 `chore`：添加或更新 .gitignore 文件
  - 📸 `test`：添加或更新快照
  - ⚗️ `experiment`：进行实验
  - 🚩 `feat`：添加、更新或移除功能标志
  - 💫 `ui`：添加或更新动画和过渡效果
  - ⚰️ `refactor`：移除无用代码
  - 🦺 `feat`：添加或更新与验证相关的代码
  - ✈️ `feat`：改进离线支持

## 拆分提交的准则

分析差异时，请考虑根据以下标准拆分提交：

1. **不同关注点**：对代码库中不相关部分的更改
2. **不同更改类型**：混合了功能、修复、重构等不同类型的更改
3. **文件模式**：对不同类型文件的更改（例如源代码与文档）
4. **逻辑分组**：分别提交后更易于理解或审查的更改
5. **规模**：拆分后会更清晰的超大规模更改

## 示例

良好的提交消息：
- ✨ feat: 添加用户身份验证系统
- 🐛 fix: 解决渲染过程中的内存泄漏
- 📝 docs: 使用新端点更新 API 文档
- ♻️ refactor: 简化解析器中的错误处理逻辑
- 🚨 fix: 解决组件文件中的代码检查警告
- 🧑‍💻 chore: 改进开发者工具设置流程
- 👔 feat: 实现交易验证的业务逻辑
- 🩹 fix: 解决页眉中的轻微样式不一致问题
- 🚑️ fix: 修补身份验证流程中的严重安全漏洞
- 🎨 style: 重新组织组件结构以提高可读性
- 🔥 fix: 移除已弃用的遗留代码
- 🦺 feat: 为用户注册表单添加输入验证
- 💚 fix: 解决 CI 流水线测试失败问题
- 📈 feat: 实现用户参与度分析跟踪
- 🔒️ fix: 加强身份验证密码要求
- ♿️ feat: 改进表单对屏幕阅读器的无障碍支持

拆分提交的示例：
- 第一次提交：✨ feat: 添加新的 solc 版本类型定义
- 第二次提交：📝 docs: 更新新 solc 版本的文档
- 第三次提交：🔧 chore: 更新 package.json 依赖项
- 第四次提交：🏷️ feat: 为新的 API 端点添加类型定义
- 第五次提交：🧵 feat: 改进工作线程中的并发处理
- 第六次提交：🚨 fix: 解决新代码中的代码检查问题
- 第七次提交：✅ test: 为新的 solc 版本功能添加单元测试
- 第八次提交：🔒️ fix: 更新存在安全漏洞的依赖项

## 命令选项

- `--no-verify`：跳过运行提交前检查（lint、build、generate:docs）

## 分支命名约定

在 `master` 或 `main` 上提交时，该命令会询问你是否要创建新分支。如果选择是，它会按照以下模式创建分支：

```
<type>/<git-username>/<description>
```

**组成部分：**
- `<type>`：提交类型（feature、fix、docs、refactor、perf、test、chore 等）
- `<git-username>`：你的 Git 用户名（从 `git config user.name` 或系统用户名获取）
- `<description>`：使用 kebab-case 格式描述更改（例如 `add-user-auth`、`fix-login-bug`）

**示例：**
- `feature/leovs09/add-new-command`
- `fix/johndoe/resolve-memory-leak`
- `docs/alice/update-api-docs`
- `refactor/bob/simplify-error-handling`
- `chore/charlie/update-dependencies`

**工作流程：**
1. 命令检测到你位于 `master` 或 `main` 分支
2. 询问：“你当前位于主分支。是否要创建一个单独的分支？”
3. 如果选择“否”：继续在当前分支上提交
4. 如果选择“是”：分析你的更改以确定类型，要求提供简短描述，创建分支，然后继续提交

## 重要说明

- 默认情况下，将运行提交前检查（`pnpm lint`、`pnpm build`、`pnpm generate:docs`）以确保代码质量
- 如果这些检查失败，系统会询问你是仍要继续提交，还是先修复问题
- 如果已有特定文件被暂存，该命令将仅提交这些文件
- 如果没有文件被暂存，该命令将自动暂存所有已修改文件和新文件
- 提交消息将根据检测到的更改生成
- 提交前，该命令将检查差异，以确定是否更适合拆分为多个提交
- 如果建议拆分为多个提交，该命令将帮助你分别暂存并提交更改
- 始终检查提交差异，确保提交消息与更改相符