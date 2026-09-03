---
name: nushell
description: Guides ccusage Nushell scripts. Use when adding, editing, formatting, or validating .nu files under .github/scripts, apps/ccusage/scripts, or scripts, including their Nix shebangs and GitHub Actions callers.
paths:
  - '**/*.nu'
globs: '*.nu'
---
# ccusage Nushell

Nushell 是一门函数式、面向结构化数据的语言，只是恰好同时也是一个 shell。请按这种风格来写代码：对记录和表进行变换的管道，而不是换了个语法的 bash。根目录的 `AGENTS.md` 说明了何时应选择 Nushell 而不是 Babashka、Rust 或 TypeScript。

脚本位于 `.github/scripts/`、`apps/ccusage/scripts/` 和 `scripts/`。

## 运行时形态

每个可执行脚本都是一个带 Nix shebang 和 `def main` 的 `.nu` 文件；这个 shebang 就是 CI 获得解释器的方式，而不是在工作流中安装 `nushell` profile。只列出脚本直接调用的工具；`--inputs-from` 是相对于脚本自身目录的，所以其深度因目录而异——从邻近脚本复制头部即可，例如 `.github/scripts/upsert-pr-comment.nu` 或 `apps/ccusage/scripts/stage-native-package.nu`。

仅作为模块被导入的文件不携带 shebang，也没有 `main`：`.github/scripts/pricing-lock.nu`、`apps/ccusage/scripts/native-binary.nu`。

工作流通过 shebang 运行这些脚本，但 `nix/git-hooks.nix` 中的 commit-msg 钩子是把 `scripts/validate-commit-scope.nu` 作为参数传给 `nushell` 来调用的，因此那个脚本永远只能拿到 `nu` 本身。

在恰当的边界处调用外部工具（如 `gh`、`jq`、`git`、`hyperfine`、`pnpm`、`node` 或 `bun`）完全没问题——请通过 shebang shell 固定它们的版本，而不是全局安装。

## 文档

先读再写。从以下任意一页的侧边栏即可到达书的其余部分，以及 `/commands/` 和 `/cookbook/`。

https://www.nushell.sh/book/thinking_in_nu.html

https://www.nushell.sh/book/nushell_map_functional.html

https://www.nushell.sh/book/style_guide.html

## 风格

函数式风格是默认选项。以下每一条都应视为需要修复的缺陷：

- **用 `mut` + `for` 做累加器。** 改用 `reduce`、`each`、`where`、`group-by`、`zip`、`flatten`、`insert`/`update`、`generate`。`mut` 只在确实存在任何过滤器都无法表达的真正时序状态时才合理。
- **在步骤之间传递字符串。** 传递记录和表；在边界处序列化一次（`to json --raw`），进入时解析一次（`from json`）。
- **用嵌套的 `if`/`else` 链对值的形状分支。** 改用 `match`，包括列表模式和守卫。
- **为处理数据而调用外部命令。** 优先使用原生命令，而非 `^jq`、`^sed`、`^awk`、`^date`。
- **用裸 `each` 执行副作用。** 当结果未被使用时，用 `| ignore` 明确表达这一意图。

另外：

- 为自定义命令签名标注类型——参数类型、`--flag` 以及返回类型。它们记录了意图，并会在解析时被检查。
- 对那些标志 otherwise 会被 Nushell 解析掉的命令使用 `run-external`；给短标志加引号，如 `'-L'`、`'-x'`、`'-c'`，并在到达外部边界之前一直把参数保持为列表。
- 需要在不抛出异常的情况下获取退出码、stdout 和 stderr 时使用 `complete`；用 `error make` 而不是哨兵返回值。
- 时间戳用 `datetime`，时长用 `duration`；直接对它们做比较和相减，而不是先格式化成字符串。
- 对于 stdout 是数据产物的 CI 脚本，把进度信息输出到 stderr。

## 验证

Nushell 在次版本之间就会重命名并破坏功能，所以请对照固定的解释器检查所用构造，不要依赖记忆：

```sh
direnv exec . nu --ide-check 10 path/to/script.nu
direnv exec . nu -c 'help <command>'
```

`just fmt` 会通过 treefmt 对 `*.nu` 运行 `nufmt`。对于行为变更，请通过脚本的 shebang 调用它作为冒烟检查，并运行覆盖该调用方的仓库检查。
