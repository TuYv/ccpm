---
name: claude-md-starter
description: "Generates a fully structured, project-specific CLAUDE.md by scanning the repo for signal files (package.json, Makefile, .github/workflows/, .env.example, etc.), inferring stack, commands, architecture, and conventions, then asking at most 3 targeted questions for what cannot be inferred. Use whenever the user says 'create a CLAUDE.md', 'my CLAUDE.md is blank', 'generate project context', 'initialize CLAUDE.md', 'set up Claude context for this repo', 'fill in my CLAUDE.md', or any variation where someone needs their project context documented for Claude. If a CLAUDE.md already exists with content, runs a diff-and-merge flow before writing."
user-invokable: true
argument-hint: ""
metadata:
  category: utility
  version: 1.0.0
---
# Claude.md 入门工具 — 项目上下文生成器

扫描仓库，推断技术栈和约定，最多提出 3 个有针对性的问题，并生成一份内容完整的 CLAUDE.md，让 Claude 从第一次会话开始就能掌握完整的项目上下文。

## 调用触发条件

**显式触发：**
- “创建 CLAUDE.md”
- “我的 CLAUDE.md 是空的”
- “生成项目上下文”
- “初始化 CLAUDE.md”
- “为此仓库设置 Claude 上下文”
- “填写我的 CLAUDE.md”
- “运行 claude-md-starter 技能”

**隐式触发：**
- 用户粘贴了一份几乎为空的 CLAUDE.md，并要求 Claude 填充内容
- 用户在每次会话开始时不断重复说明相同的项目上下文

触发后立即运行——扫描前不要预先提问。

## 工作流（6 个节点）

| 节点 | 作用 |
|---|---|
| 1 — 检测 | 检查 CLAUDE.md 是否存在并测量内容长度 |
| 2 — 扫描 | 读取项目根目录中的信号文件（参见 `references/scan-signals.md`） |
| 3 — 推断 | 起草所有可根据扫描信号推导出的章节 |
| 4 — 追问 | 对无法推断的信息最多提出 3 个问题 |
| 5 — 生成 | 使用 `references/claude-md-template.md` 中的模板编写完整的 CLAUDE.md |
| 6 — 验证 | 确认所需章节均已存在且不包含占位内容 |

## 节点 1 — 检测

检查项目根目录中是否存在 CLAUDE.md。

**如果未找到：** 直接进入节点 2。

**如果已找到且字符数 ≤ 200：** 将其视为空白文件——进入节点 2。

**如果已找到且字符数 > 200：** 写入前执行差异比较与合并流程：

1. 读取现有文件
2. 完成节点 2–4，生成新版本
3. 逐章节比较——对于 8 个必需章节中的每一个，将其归类为：
   - **新增** — 生成版本中存在，但现有版本中缺失或为空
   - **增强** — 两个版本均有内容；生成版本包含更多内容
   - **相同** — 两个版本的内容等效
   - **冲突** — 两个版本均有不同的非空内容

4. 展示差异摘要表：

```
Section              | Existing | Generated | Action
---------------------|----------|-----------|-------
Project Overview     | present  | enhanced  | +additions available
Tech Stack           | absent   | new       | will add
Commands             | present  | enhanced  | +2 commands found
Architecture         | absent   | new       | will add
Code Conventions     | present  | same      | no change
Testing              | absent   | new       | will add
What NOT To Do       | absent   | new       | will add
Environment Setup    | absent   | new       | will add
```

5. 提供三个选项：
   - **A（推荐）** — 保留现有内容，仅添加新增和增强的章节（安全的增量方式）
   - **B** — 使用生成版本完全替换
   - **C** — 写入前逐一审查每个存在冲突的章节

6. 写入所选的合并结果。

## 节点 2 — 扫描

使用 `references/scan-signals.md` 中的目录读取信号文件。对于找到的每个文件，提取其所揭示的字段。静默跳过缺失的文件。

尽可能并行读取所有文件：

1. `package.json` — 框架、脚本、包管理器、依赖项
2. `pyproject.toml` / `requirements.txt` / `setup.py` — Python 技术栈
3. `Cargo.toml` / `go.mod` / `pom.xml` / `build.gradle` — 编程语言
4. `Makefile` / `justfile` — 已命名的命令
5. `.github/workflows/*.yml` — CI/CD 步骤、部署目标
6. `Dockerfile` / `docker-compose.yml` — 运行时环境、服务
7. `.eslintrc.*` / `.prettierrc.*` / `eslint.config.*` — JS/TS 代码风格
8. `ruff.toml` / `.flake8` / `mypy.ini` — Python lint/类型配置
9. `jest.config.*` / `vitest.config.*` / `pytest.ini` / `conftest.py` — 测试框架
10. `tsconfig.json` — TypeScript 设置
11. `.env.example` / `.env.sample` — 必需的环境变量
12. `README.md`（仅前 40 行）— 项目描述
13. 顶层目录列表 — 架构模式
14. `.gitignore` — 构建产物和生成的文件

## 节点 3 — 推断

使用扫描到的数据，在提问前尽可能填写更多章节：

- **项目概述** → 来自 README.md 的第一段；如果没有，则使用 `package.json` 的 `description` 字段
- **技术栈** → 来自语言相关文件和框架依赖项
- **命令** → 来自 `package.json` 脚本、Makefile 目标、工作流运行步骤
- **架构** → 来自顶层目录结构
- **代码约定** → 来自 eslint/prettier/ruff 配置值
- **测试** → 来自测试配置文件和测试目录位置
- **禁止事项** → 来自 `.gitignore` 中的构建输出、工作流分支保护、锁文件
- **环境设置** → 来自 `.env.example` 中的变量名和 docker-compose 服务

## 节点 4 — 深入提问

只询问无法推断的信息。最多提出 3 个问题。跳过那些已能从扫描文件中明确得出答案的问题。

在一条消息中同时提出所有适用的问题——绝不要分多个对话轮次询问：

> **请快速回答以下问题，以便完成你的 CLAUDE.md**（回答适用的问题即可）：
>
> 1. 请用一句话说明这个项目的用途。*（如果找到了 README，则跳过）*
> 2. 是否有 Claude 绝不能触碰或自动修改的文件、目录或系统？
> 3. 是否有 lint 配置中未体现的团队约定？*（命名模式、PR 大小、提交格式、评审流程）*

## 节点 5 — 生成

严格使用 `references/claude-md-template.md` 中的章节结构生成 CLAUDE.md。

**关键规则：**
- 每个已填写的章节都必须包含真实内容——不得使用 `[TODO: add your X here]` 占位符
- 如果某个章节完全无法填写，则将其整体省略，而不是写入占位符
- 命令必须准确且可运行（使用 `npm run dev`，而不是“运行开发服务器”）
- 禁止事项必须至少包含 2 条
- 使用祈使、直接的风格（“使用……运行测试”“绝不要编辑……中的文件”）
- 各章节内部不得使用低于 H2 的标题层级

## 节点 6 — 验证

写入前，对照 `references/validation-checklist.md` 进行验证：

- [ ] 所有已填写的章节都包含真实内容（无占位符）
- [ ] 命令章节包含 ≥ 2 条可运行命令
- [ ] 禁止事项包含 ≥ 2 条
- [ ] 不存在任何未替换的占位文本
- [ ] 如果现有 CLAUDE.md 超过 200 个字符，则已完成差异比较与合并流程

如果“命令”或“禁止事项”部分无法通过验证：在写入前再提出最后一个有针对性的问题。

## 输出

将文件写入项目根目录下的 `CLAUDE.md`。写入后，打印一行确认信息：

```
✓ CLAUDE.md written — X sections populated from repo scan, Y from your answers.
```

如果处于差异比较与合并模式，还需打印哪些部分已添加，哪些部分保持不变。

## 应拒绝的反模式

- 未先运行扫描就生成 CLAUDE.md
- 提出超过 3 个信息收集问题
- 写入占位部分（“在此添加你的命令”）
- 未运行差异比较与合并流程就覆盖已有内容的 CLAUDE.md
- 写入并非针对所扫描项目的通用样板内容
- 包含既未在信号文件中发现、也未经用户确认的命令

## 参考资料

- `references/scan-signals.md` — 信号文件的完整目录以及每个文件所揭示的信息
- `references/claude-md-template.md` — 规范的 CLAUDE.md 章节结构和样式规则
- `references/validation-checklist.md` — 写入前的必填字段和质量关卡

---

**版本：** 1.0.0