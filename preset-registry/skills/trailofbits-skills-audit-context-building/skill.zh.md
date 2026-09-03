---
name: audit-context-building
description: Understand a codebase before looking for bugs in it - what each function assumes, what it guarantees, and what it depends on elsewhere. Use when starting an audit, threat model, or architecture review on unfamiliar code, and before any vulnerability-hunting pass.
allowed-tools: Workflow Task Read Grep Glob
---
# 审计上下文构建

构建理解，而非结论。这一步在任何人开始排查漏洞之前运行，并为那项工作提供输入。

## 何时使用

在审计、威胁建模或架构评审开始时、代码尚不熟悉的情况下使用。同样适用于上一轮分析产出了无人能评判的发现、因为没人梳理过系统各部分如何衔接的情况。

## 何时不使用

不要为漏洞命名、提出修复方案、编写概念验证或评定严重程度。这些属于接下来运行的排查阶段，而那个阶段是在手握全貌的情况下进行的。当代码依赖某个条件而没有任何地方校验它时，如实记下并继续——它是否重要留待之后再判定。

对已经理解的代码，不值得花这些 token。

## 不要在此上下文中进行分析

分析篇幅很长，而此上下文需要留存下来才能使用它。请将其分派出去：

- **一个代码库，或不止一个函数** —— 运行 `/audit-context-building:audit-context <path>`。它会完成整体定位，在各自的子代理中分析每个函数，并写入 `audit-context/DOSSIER.md`，以及在 `audit-context/functions/` 下为每个函数写一个文件。只有紧凑的记录会返回到这里。
- **单个函数** —— 将 `audit-context-building:function-analyzer` 代理分派给它。它会把自己的分析文字写入磁盘并返回一条记录。

然后基于返回的内容开展工作：索引、未被强制执行的假设、悬而未决的问题。需要某个函数的细节时，再去读它的文件。

真正强制这一点的不是这段文字，而是工作流：被返回 schema 约束的子代理无法返回长篇文字。把本节当作路由来对待，照此路由。

## 返回什么，以及如何阅读

每条记录列出：必须始终为真的条件（附体现它的那一行）、该函数凭信任接受的前提（附使其成立的依据）、它调用了哪些函数以及需要每个函数提供什么，以及任何仍不清楚的地方。档案则补充了跨越多个函数的规则、谁能触达什么，以及复杂部分聚集在哪里。

有两点比其余更重要：

- **标记为 `nothing found` 的假设。** 代码指望某件事为真，而任何地方都没有使它为真。这是交给排查阶段的最有用的东西。
- **悬而未决的问题。** 一份关于哪些还不清楚的诚实清单，胜过一个事后被证明错误的自信答案。把它们继续带下去，而不是就此了结。

当两条记录不一致时，会同时引用双方，而不是悄悄地加以调和。这是关于代码的一个事实，而不是分析上的缺陷。

## 格式

格式由 [ANALYSIS_FORMAT.md](resources/ANALYSIS_FORMAT.md) 定义，[FUNCTION_MICRO_ANALYSIS_EXAMPLE.md](resources/FUNCTION_MICRO_ANALYSIS_EXAMPLE.md) 以 C 和 Solidity 的示例逐步讲解。在扩展此插件或判断某条记录是否可信时阅读它们。

无论目标是什么，格式都相同。变化的是填充每个槽位的内容，以及哪些调用算作“看不到内部”的调用。[DOMAIN_NOTES.md](resources/DOMAIN_NOTES.md) 针对智能合约、C 和 C++、反编译固件以及 Web 服务分别给出了对应说明——当目标并非普通源代码时阅读它。

**最重要的规则：跟随调用。** 一个函数是否正确通常取决于另一个函数所做的事情，而你仅从调用方看不到这些。某个上限看似已被强制执行，是因为这个值是从一个名字暗示它已被检查过的函数返回的。所以要阅读被调用的函数，走遍其中的每条路径而非只走成功的那一条，并说明是什么使每个假设成立。当没有任何东西使其成立时，就用那几个词：`nothing found`。每一条主张都要引用某一行代码，否则就变成一个悬而未决的问题。
