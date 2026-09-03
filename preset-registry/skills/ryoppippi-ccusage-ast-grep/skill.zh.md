---
name: ast-grep
description: Guides ccusage structural code searches with ast-grep. Use when finding Rust or TypeScript syntax patterns, validating migrations, or writing AST-based search commands.
---
# ast-grep

当搜索依赖于语法结构时——例如带有特定参数的宏调用、某个 match 分支的形状、附加在条目上的属性——请选用 ast-grep。`rg` 处理纯文本更快，重复代码检测则归 `reduce-similarities` 负责。

`ast-grep` 来自 Nix 开发 shell，因此在 shell 尚未激活时需在命令前加上 `direnv exec .`。这里没有 `sgconfig.yml`：关系型规则通过 `scan --inline-rules` 或一个一次性的 `--rule` 文件来执行，而不是使用项目规则集。将搜索范围限定在 `rust`、`apps`、`docs` 或 `nix` 可以让大型搜索保持快速，不过直接从根目录搜索时本来就会跳过被 gitignore 的目录树。

先用 `run --pattern` 开始，只有在其匹配不足时才扩大范围。给关系型规则加上 `stopBy: end`，否则它们会在该方向上的第一个节点处停下。当某个模式未能匹配你预期的形状时，用 `--debug-query` 输出解析结果。

https://ast-grep.github.io/guide/pattern-syntax.html

https://ast-grep.github.io/reference/rule.html
