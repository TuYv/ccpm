---
name: caveman-compress
description: >
  Compress natural language memory files (CLAUDE.md, todos, preferences) into caveman format
  to save input tokens. Preserves all technical substance, code, URLs, and structure.
  Compressed version overwrites the original file. Human-readable backup saved as FILE.original.md.
  Trigger: /caveman:compress <filepath> or "compress memory file"
---
# Caveman 压缩

## 用途

将自然语言文件（CLAUDE.md、待办事项、偏好设置）压缩成穴居人式语言，以减少输入 token。压缩版本会覆盖原文件。便于人类阅读的备份保存为 `<filename>.original.md`。

## 触发方式

`/caveman:compress <filepath>`，或当用户要求压缩记忆文件时触发。

## 流程

1. 压缩脚本位于 `caveman-compress/scripts/`（与此 SKILL.md 相邻）。如果无法立即确定该路径，请搜索 `caveman-compress/scripts/__main__.py`。

2. 运行：

cd caveman-compress && python3 -m scripts <absolute_filepath>

3. CLI 将：
- 检测文件类型（不消耗 token）
- 调用 Claude 进行压缩
- 验证输出（不消耗 token）
- 如果出现错误：使用 Claude cherry-pick 修复（仅进行针对性修复，不重新压缩）
- 最多重试 2 次
- 如果重试 2 次后仍然失败：向用户报告错误，并保持原文件不变

4. 将结果返回给用户

## 压缩规则

### 删除
- 冠词：a、an、the
- 填充词：just、really、basically、actually、simply、essentially、generally
- 客套话："sure"、"certainly"、"of course"、"happy to"、"I'd recommend"
- 缓和措辞："it might be worth"、"you could consider"、"it would be good to"
- 冗余表述："in order to" → "to"、"make sure to" → "ensure"、"the reason is because" → "because"
- 冗余连接词："however"、"furthermore"、"additionally"、"in addition"

### 完全保留（绝不修改）
- 代码块（围栏式 ``` 和缩进式）
- 行内代码（`backtick content`）
- URL 和链接（完整 URL、Markdown 链接）
- 文件路径（`/src/components/...`、`./config.yaml`）
- 命令（`npm install`、`git commit`、`docker build`）
- 技术术语（库名称、API 名称、协议、算法）
- 专有名词（项目名称、人名、公司名）
- 日期、版本号、数值
- 环境变量（`$HOME`、`NODE_ENV`）

### 保留结构
- 所有 Markdown 标题（保持标题文本完全不变，压缩其下方的正文）
- 项目符号层级（保持嵌套层级）
- 编号列表（保持编号）
- 表格（压缩单元格文本，保持结构）
- Markdown 文件中的 Frontmatter/YAML 标头

### 压缩
- 使用简短的同义词：用 "big" 而不是 "extensive"，用 "fix" 而不是 "implement a solution for"，用 "use" 而不是 "utilize"
- 可以使用短语："Run tests before commit" 而不是 "You should always run tests before committing"
- 删除 "you should"、"make sure to"、"remember to"——直接陈述操作
- 合并以不同方式表达相同内容的冗余项目符号
- 当多个示例展示相同模式时，只保留一个示例

关键规则：
任何位于 ``` ... ``` 内的内容都必须完全照原样复制。
禁止：
- 删除注释
- 删除空格
- 调整行序
- 缩短命令
- 简化任何内容

行内代码（`...`）必须完全保留。
不要修改反引号内的任何内容。

如果文件包含代码块：
- 将代码块视为只读区域
- 仅压缩代码块之外的文本
- 不要合并代码块前后的章节

## 模式

原文：
> 始终确保在将任何更改推送到 main 分支之前运行测试套件。这一点很重要，因为它有助于尽早发现 bug，并防止损坏的构建部署到生产环境。

压缩后：
> 推送到 main 前运行测试。尽早发现错误，防止将故障版本部署到生产环境。

原文：
> 该应用采用微服务架构，包含以下组件。API 网关处理所有传入的请求，并将其路由到相应的服务。身份验证服务负责管理用户会话和 JWT 令牌。

压缩后：
> 微服务架构。API 网关将所有请求路由到服务。身份验证服务管理用户会话和 JWT 令牌。

## 边界

- 仅压缩自然语言文件（.md、.txt、无扩展名文件）
- 绝不修改：.py、.js、.ts、.json、.yaml、.yml、.toml、.env、.lock、.css、.html、.xml、.sql、.sh
- 如果文件包含混合内容（正文 + 代码），仅压缩正文部分
- 如果不确定某些内容是代码还是正文，请保持不变
- 覆盖前，将原始文件备份为 FILE.original.md
- 绝不压缩 FILE.original.md（跳过该文件）