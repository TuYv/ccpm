---
name: update-readme
description: Updates README.md and README.zh-CN.md to reflect the project's current state. Use this skill whenever the user asks to "update the README", "sync the docs", "update documentation", "reflect latest changes in README", or wants both the English and Chinese READMEs to match the current project. Always triggers when the user mentions updating or regenerating README files, especially for bilingual (EN/ZH) projects.
user-invocable: true
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash(git:*)"]
disable-model-invocation: true
---
# 更新 README

确保 README.md（英文，主文档）和 README.zh-CN.md（简体中文，辅助文档）与项目当前的实际状态保持同步。两个文件都必须准确、完整，并且彼此一致。

## 标头格式（必需）

每个 README 都必须以下列确切结构开头——根据具体项目调整徽章、项目名称和描述：

```markdown
# <Project Name> ![](https://img.shields.io/badge/<label>-<message>-<color>)

[![<Badge1 Label>](<badge-url>)](<link>) [![<Badge2 Label>](<badge-url>)](<link>)

**English** | [简体中文](README.zh-CN.md)
```

对于 README.zh-CN.md，反转语言切换项：

```markdown
# <Project Name> ![](https://img.shields.io/badge/<label>-<message>-<color>)

[![<Badge1 Label>](<badge-url>)](<link>) [![<Badge2 Label>](<badge-url>)](<link>)

[English](README.md) | **简体中文**
```

选择能够真实反映项目情况的徽章。常见类型包括：CI 状态、许可证、语言/运行时版本、软件包注册表版本、代码覆盖率。如果没有实时端点，请使用 shields.io 静态徽章。当徽章行包含两个以上的徽章时，优先使用引用式 Markdown 链接——这样可以让源文件更易读。损坏或总是显示失败的徽章还不如没有徽章；只添加有人维护的徽章。

## 流程

### 1. 调查项目

在编写任何内容之前，先查看项目的实际状态：

- 扫描所有 skill/module 目录及其 SKILL.md 或等效的描述文件
- 记录每个组件的名称、单行用途说明、安装方法以及任何值得注意的前置条件
- 查看 git log，了解最近新增或移除的内容
- 阅读现有的 README 文件，了解其中已有的内容以及哪些内容已经过时

以实际情况为依据编写，不要依赖记忆或假设。

### 2. 起草 README.md（英文）

以 `references/template.md` 作为结构起点。根据项目所属领域调整章节名称——模板展示的是骨架，而不是固定措辞。

**章节顺序**（不适用的章节可以省略，不要为了填充内容而添加章节）：
1. 标头——标题 + 徽章 + 语言切换项
2. 单行描述（一句话）
3. Logo、横幅或演示 GIF——可选，但如果项目已有这些内容，请将其放在靠前的位置
4. 主要内容章节（可用项目、用法等）
5. 贡献 / 添加新项目
6. 许可证

对于超过约 300 行的 README，请在单行描述之后添加目录。

README 是目录，不是教程。每个组件的描述应控制在一到两句话。安装命令必须可以直接复制粘贴——使用确切的命令，不留歧义。始终使用带语言标签的围栏代码块（` ```bash `、` ```json `）。

使用自然的人类口吻。README 文案特别容易出现 AI 式套话——其中常常会在不知不觉间堆积“robust”、以粗体短语开头的列表项，以及“serves as”句式。需要特别留意以下几点：

- 选词：避免使用“leverage”“streamline”“robust”“utilize”“delve”。使用直白的表达。
- 列表项：不要让每一项都以加粗短语开头。这样读起来像是由 AI 生成的文档。
- 描述：直接说明组件的作用，不要说它“serves as”或“stands as”什么。
- 营销语气：“powerful”“seamless”“comprehensive”没有提供任何有用信息。删掉它们。
- 填充性过渡语：“It's worth noting”“Importantly”“Notably”——删掉这些表达。

一个实用的检验方法：大声读出每个句子。如果听起来像宣传文案，就将其改写为平实的事实陈述。

### 3. 起草 README.zh-CN.md（中文）

忠实翻译英文 README。规则：

- 使用自然的简体中文——不要翻译普遍使用英文的技术术语（CLI 工具名称、包管理器命令、GitHub URL、代码块）。
- 所有代码块、命令和文件路径必须与英文版本完全一致。
- 章节标题应使用符合中文习惯的表达（例如“可用技能”“添加新技能”），不要逐字翻译。
- 语言切换项必须为 `[English](README.md) | **简体中文**`。
- 遵循与英文版本相同的平实语言原则。中文技术写作也有其常见的 AI 痕迹——如果有更简单的词可用，应避免使用「赋能」「助力」「生态」。

### 4. 写入前检查

写入任一文件之前，请确认：

- 列出的每项技能/组件当前确实存在于仓库中
- 安装命令准确无误，可直接复制粘贴执行
- 没有章节描述已移除的内容
- 两个文件以相同顺序涵盖相同内容

然后检查草稿中的写作问题：

- 全文使用破折号超过 2 至 3 次？删掉大部分。
- 是否有句子以“The X serves as...”开头？将其改写为“The X is...”。
- 是否通篇使用列表项开头加粗的模式？去掉加粗。
- 多项描述中是否重复使用同一个词或比喻？换用不同表达。
- 是否使用 Unicode 箭头（→）？替换为纯文本。

### 5. 写入文件

先写入 README.md，再写入 README.zh-CN.md。使用 Edit 或 Write 工具——不要在对话中以代码块形式输出内容。

写入后，简要确认所做的更改（例如：“添加了 update-readme 技能，删除了过时的 apple-events 前置条件说明”）。

## 参考资料

- `references/template.md`——README 结构模板（起草时加载）