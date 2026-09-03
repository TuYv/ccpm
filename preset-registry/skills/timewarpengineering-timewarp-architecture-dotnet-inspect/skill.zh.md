---
name: dotnet-inspect
description: Find evidence for .NET packages, platform libraries, assemblies, APIs, dependencies, SourceLink/source, and API version diffs.
---
# dotnet-inspect

使用 dotnet-inspect 获取证据，而不是靠猜测来处理 .NET 包、平台库、本地程序集、API、依赖项、SourceLink/源码，或版本之间的 API 变更。

通过 `dnx`（类似 `npx`）调用；始终传入 `-y` 和 `--` 以避免交互式提示：

```bash
dnx dotnet-inspect -y -- <command>
```

这个内置技能有意仅作为引导器。对于非简单的工作，请先运行与版本匹配的嵌入式指南。它始终与已安装的工具保持一致，因此当命令、输出模式、章节名称或工作流指引存在差异时，应优先以它为准：

```bash
dnx dotnet-inspect -y -- skill
```

## 种子命令

| 目标 | 命令 |
| ---- | ------- |
| 查找 API 所在位置 | `find Pattern` |
| 检查类型或成员 | `type Type --package Foo`，然后 `member Type --package Foo` |
| 比较版本 | `diff --package Foo@old..new --breaking` |
| 检查包或库的信号 | `package Foo -S Signals` 或 `library Foo -S Signals` |
| 定位源码或实现 | `source Type --package Foo` 或 `member Type Member:1 -S "Decompiled Source"` |
| 探索关系 | `depends Type`、`extensions Type`、`implements Interface` |

使用 `find` 后，复用它所报告的包、库或平台范围。为泛型类型名称加引号，例如 `'List<T>'`；使用 `<T>`，而不是 `<>`。
