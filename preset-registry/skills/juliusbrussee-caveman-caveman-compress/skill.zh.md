---
name: caveman-compress
description: >
  Compress natural language memory files (CLAUDE.md, todos, preferences) into caveman format
  to save input tokens. Preserves all technical substance, code, URLs, and structure.
  Compressed version overwrites the original file. Human-readable backup saved as FILE.original.md.
  Trigger: /caveman-compress FILEPATH or "compress memory file"
---
# Caveman Compress

## 目的

将自然语言文件（`CLAUDE.md`、`todos`、`preferences`）压缩为 caveman-speak，以减少输入 token。压缩后的版本会覆盖原文件。人类可读备份会另存为 `<filename>.original.md`，但不会放在源文件旁边——它保存在树外数据目录（`$XDG_DATA_HOME/caveman-compress/backups/<parent-dir-name>/`，或 Windows 上的 `%LOCALAPPDATA%\caveman-compress\backups\<parent-dir-name>\`），以免技能自动加载器将其重新作为活动文件重新摄入。

## 触发

`/caveman-compress <filepath>`，或用户要求压缩记忆文件时。

## 流程

1. 压缩脚本位于 `scripts/`（与本 `SKILL.md` 相邻）。若该路径暂不可用，请在本 `SKILL.md` 附近查找 `scripts/__main__.py`。

2. 在包含该 `SKILL.md` 的目录中运行：

python3 -m scripts <absolute_filepath>

3. CLI 将执行以下操作：
- 检测文件类型（不计 token）
- 调用 Claude 进行压缩
- 校验输出（不计 token）
- 若报错：使用 Claude 进行 cherry-pick 修复（仅定向修复，不重做压缩）
- 最多重试 2 次
- 若仍在 2 次重试后失败：向用户报告错误，保持原始文件不变

4. 向用户返回结果

## 压缩规则

### 移除
- 冠词：a, an, the
- 填充词：just, really, basically, actually, simply, essentially, generally
- 客套语："sure"、"certainly"、"of course"、"happy to"、"I'd recommend"
- 模糊说法："it might be worth"、"you could consider"、"it would be good to"
- 冗余措辞："in order to" → "to"、"make sure to" → "ensure"、"the reason is because" → "because"
- 连接性啰嗦：however, furthermore, additionally, in addition

### 完全保留（绝不修改）
- 代码块（``` 和缩进块）
- 内联代码（`backtick content`）
- URL 与链接（完整 URL、markdown 链接）
- 文件路径（`/src/components/...`、`./config.yaml`）
- 命令（`npm install`、`git commit`、`docker build`）
- 技术术语（库名、API 名称、协议、算法）
- 专有名词（项目名称、人物、公司）
- 日期、版本号、数值
- 环境变量（`$HOME`、`NODE_ENV`）

### 保留结构
- 所有 markdown 标题（保持标题文本不变，仅压缩其下正文）
- 列表层级（保持缩进层级）
- 有序列表（保持编号）
- 表格（压缩单元格文本，保留结构）
- Markdown 文件中的 frontmatter/YAML 头部

### 压缩
- 使用短同义词：用 "big" 代替 "extensive"，用 "fix" 代替 "implement a solution for"，用 "use" 代替 "utilize"
- 分句形式可接受："Run tests before commit" 而不是 "You should always run tests before committing"
- 去掉 "you should"、"make sure to"、"remember to"——直接陈述动作
- 合并表达相同意思的重复要点
- 当多个示例呈现相同模式时，保留一个示例

关键规则：
凡是 ``` ... ``` 内的内容都必须逐字逐句原样复制。
禁止：
- 删除注释
- 删除空格
- 重新排列行序
- 缩短命令
- 简化内容

内联代码（`...`）必须原样保留。
禁止修改反引号内任何内容。

如果文件包含代码块：
- 将代码块视为只读区域
- 仅压缩其外部文本
- 不要合并围绕代码块的段落

## 示例

Original:
> You should always make sure to run the test suite before pushing any changes to the main branch. This is important because it helps catch bugs early and prevents broken builds from being deployed to production.

Compressed:
> Run tests before push to main. Catch bugs early, prevent broken prod deploys.

Original:
> The application uses a microservices architecture with the following components. The API gateway handles all incoming requests and routes them to the appropriate service. The authentication service is responsible for managing user sessions and JWT tokens.

Compressed:
> Microservices architecture. API gateway route all requests to services. Auth service manage user sessions + JWT tokens.

## 边界

- 仅压缩自然语言文件（.md、.txt、.typ、.typst、.tex、无扩展名）
- 绝不修改：.py、.js、.ts、.json、.yaml、.yml、.toml、.env、.lock、.css、.html、.xml、.sql、.sh
- 如果文件是混合内容（正文 + 代码），仅压缩正文部分
- 若不确定某内容是代码还是正文，请保持不变
- 原始文件在覆盖前会备份为 FILE.original.md，位置在树外备份数据目录中（见「目的」），而非源文件旁边
- 切勿压缩 FILE.original.md（跳过）
