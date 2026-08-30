---
name: caveman-compress
description: >
  Compress a memory file such as CLAUDE.md or a todo list into caveman format
  to save input tokens, keeping a readable backup. Trigger: /caveman-compress.
---
# Caveman Compress

## 目的

将自然语言文件（CLAUDE.md、todos、preferences）压缩为穴居人式语言，以减少输入 tokens。压缩版本会覆盖原文件。可读性良好的备份保存为 `<filename>.original.md`，但**不会**放在源文件旁边——它位于目录树之外的数据目录中（Linux/macOS：`$XDG_DATA_HOME/caveman-compress/backups/<parent-dir-name>/`；Windows：`%LOCALAPPDATA%\caveman-compress\backups\<parent-dir-name>\`），这样 skill 自动加载器不会将其作为活动文件重新载入。

## 触发条件

`/caveman-compress <filepath>`，或用户要求压缩 memory 文件时。

## 流程

1. 压缩脚本位于 `scripts/` 中（与此 SKILL.md 相邻）。如果路径无法立即找到，请在此 SKILL.md 旁搜索 `scripts/__main__.py`。

2. 从包含此 SKILL.md 的目录运行：

python3 -m scripts <absolute_filepath>

3. CLI 将：
- 检测文件类型（不消耗 tokens）
- 调用 Claude 进行压缩
- 验证输出（不消耗 tokens）
- 如果出错：使用 Claude cherry-pick 修复（仅针对性修复，不重新压缩）
- 最多重试 2 次
- 如果 2 次重试后仍失败：向用户报告错误，保持原文件不变

4. 向用户返回结果

## 压缩规则

### 移除
- 冠词：a、an、the
- 填充词：just、really、basically、actually、simply、essentially、generally
- 客套话："sure"、"certainly"、"of course"、"happy to"、"I'd recommend"
- 含糊措辞："it might be worth"、"you could consider"、"it would be good to"
- 冗余措辞："in order to" → "to"、"make sure to" → "ensure"、"the reason is because" → "because"
- 连接性赘词："however"、"furthermore"、"additionally"、"in addition"

### 完整保留（绝不修改）
- 代码块（围栏式 ``` 和缩进式）
- 行内代码（`backtick content`）
- URL 和链接（完整 URL、Markdown 链接）
- 文件路径（`/src/components/...`、`./config.yaml`）
- 命令（`npm install`、`git commit`、`docker build`）
- 技术术语（库名称、API 名称、协议、算法）
- 专有名词（项目名称、人员、公司）
- 日期、版本号、数值
- 环境变量（`$HOME`、`NODE_ENV`）

### 保留结构
- 所有 Markdown 标题（保持标题文本不变，压缩下方正文）
- 项目符号层级（保持嵌套级别）
- 编号列表（保持编号）
- 表格（压缩单元格文本，保持结构）
- Markdown 文件中的 Frontmatter/YAML 标头

### 压缩
- 使用简短同义词："big" 而不是 "extensive"、"fix" 而不是 "implement a solution for"、"use" 而不是 "utilize"
- 可以使用片段："Run tests before commit" 而不是 "You should always run tests before committing"
- 删除 "you should"、"make sure to"、"remember to"——直接陈述操作
- 合并表达相同内容的冗余项目符号
- 多个示例展示相同模式时保留一个示例

关键规则：
任何位于 ``` ... ``` 内的内容都必须原样复制。
不要：
- 删除注释
- 删除空格
- 重新排列行
- 缩短命令
- 简化任何内容

行内代码（`...`）必须原样保留。
不要修改反引号内的任何内容。

如果文件包含代码块：
- 将代码块视为只读区域
- 仅压缩代码块之外的文本
- 不要合并代码块周围的章节

## 模式

原文：
> 在将任何更改推送到主分支之前，你应该始终确保运行测试套件。这很重要，因为它有助于及早发现错误，并防止损坏的构建被部署到生产环境。

压缩后：
> 推送到主分支前运行测试。及早发现错误，防止损坏的生产部署。

原文：
> 应用程序采用微服务架构，包含以下组件。API 网关处理所有传入请求，并将其路由到相应的服务。身份验证服务负责管理用户会话和 JWT 令牌。

压缩后：
> 微服务架构。API 网关将所有请求路由到各个服务。身份验证服务管理用户会话和 JWT 令牌。

## 边界

- 仅压缩自然语言文件（.md、.txt、.typ、.typst、.tex、无扩展名文件）
- **绝不修改**：.py、.js、.ts、.json、.yaml、.yml、.toml、.env、.lock、.css、.html、.xml、.sql、.sh
- 如果文件包含混合内容（说明文字 + 代码），**仅压缩说明文字部分**
- 如果无法确定某段内容是代码还是说明文字，则保持不变
- 原始文件会在覆盖前备份为 FILE.original.md——备份位于不在源文件旁边的树外备份数据目录中（见用途）
- 绝不压缩 FILE.original.md（跳过该文件）