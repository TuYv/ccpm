---
name: decision-records
description: Creates, supersedes and validates decision records (ADRs) against the convention a collection already follows, instead of imposing a published one. Use when the user wants to record a decision, write an ADR, supersede an existing decision, audit or lint a decisions folder, check that an ADR index is in sync, or asks "why did we decide X". Deduces the filename scheme, section set and status vocabulary from the records already there; ships a validator with an exit code, so the audit is a check and not an opinion.
argument-hint: "[new | supersede <ref> | check [<dir>]]"
allowed-tools: Bash(ls:*), Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(bash:*), Read, Write, Edit
---
# decision-records

决策记录写起来很便宜，但要让人信任它们却代价高昂。真正昂贵的是维护记录集合：编号发生冲突、索引不再与目录匹配、某条记录声称自己已被取代，却没有说明被什么取代。这个 skill 会编写记录，更重要的是，**让记录集合遵守其自身的约定**。

## 此 skill 不做什么

- **它不会将模板文件放入目标仓库。** 骨架就在本文件中。在记录旁边放置一个 `template.md`，就等于让这套约定有了第二个存放位置，而两个存放位置会在无声中逐渐分歧：模板保留着记录一年前就删掉的章节，却没有任何说明指出哪个才是约定。使用最广泛的先例（`affaan-m/ECC`、`skills/architecture-decision-records`）会创建一个模板；这里是有意为之的不同，并非疏漏。
- **它不会检查私有令牌。** 主机名、实例名称、IP 范围和个人身份信息属于 `privacy-guard` skill，该 skill 的拒绝列表特意被 gitignore。把同一列表复制到这里，会让同一份列表出现在两个位置，这就是上面所说的失败，而且后果更严重。`--portable` 检查只覆盖记录在被**复制**时会出问题的内容：绝对路径，以及指向记录集合外部的链接。
- **它不会改写已接受的记录来改变其决定。** 参见*取代*。

## 第 0 步，始终如此：在写入任何内容之前先阅读记录集合

找到记录集合。实际使用中的三个默认位置各不相同，因此要查看，不要假设：`doc/adr`（adr-tools）、`docs/adr`（ECC skill）、`docs/decisions`（MADR 4.0.0）。

```sh
bash "${CLAUDE_PLUGIN_ROOT}/skills/decision-records/scripts/check-decisions.sh" <dir>
```

它的第一部分会报告记录集合的实际情况：文件名方案、状态所在位置、正在使用的状态词汇、绝大多数记录包含的章节，以及索引。**这份报告就是约定。** 你接下来写的所有内容都必须与之匹配，包括那些原本你会采用不同写法的部分。

如果记录集合为空或不存在，请询问一次，并同时提供两种方案：

| 方案 | 收益 | 成本 |
|---|---|---|
| `NNNN-slug.md` **（推荐此方案）** | 一个可以口头说出的简短引用："参见 0007" | 两个并行 PR 都会取得下一个编号，且最终都合并（[adr/madr#28](https://github.com/adr/madr/issues/28)，自 2020 年起一直未采用任何约定）；在仓库之间复制以及重新排序时会失效 |
| `YYYY-MM-DD-slug.md` | 并行 PR 之间不会发生冲突，复制到另一个仓库后仍然有效，排序也正确 | 没有简短引用：必须通过完整文件名引用记录 |

除非仓库通过并行 PR 做决策，否则推荐使用编号方案；日期方案正是为这种情况发明的（`log4brains` 在该讨论串中采用它，原因正是如此）。选择方案不会改变记录的其他任何内容。

## 创建记录

1. **起草，不要写入。** 编写记录，并在对话中展示。
2. **等待明确批准。** "看起来不错"、"是的，写入吧"。沉默不代表批准。如果用户拒绝，则丢弃它：不要写入任何内容，不要留下任何文件。
3. **写入**记录集合，使用推断出的方案命名；如果采用编号方案，则编号为 `max + 1`（绝不重复使用编号，即使被删除的记录所使用的编号也不例外）。
4. **更新索引**，并在同一轮中完成（如果该记录集合维护索引）。写入记录但不将其加入索引，正是 `INDEX` 检查要发现的缺陷；不要先创建它，然后再报告该缺陷。
5. **重新运行验证器。** 只有它能告诉你写入的内容确实位于约定之内，而不是位于约定旁边。

适用于没有任何内容可供推断的集合的骨架。存在集合自身的章节集合时，章节会相应调整：

```markdown
# NNNN. <decision in a short noun phrase>

## Status

proposed

## Context

What forced a decision now. The constraints, the pressure, what was true at the time.
Not the solution.

## Decision

What we do, in the present tense: "We use X". One or two sentences.

## Consequences

What gets easier, what gets harder, what we now owe. Both directions, honestly: a record
with only benefits documents an advert, not a decision.
```

关于内容，有两条来自 Nygard 原文且值得保留的规则：写清楚**为什么**，因为代码中已经能看出做了什么；并记录被否决的替代方案及其原因，否则下一个人会再次提出它。

## 取代

一条已接受的记录是对某个时刻的陈述。**绝不要编辑它来改变其决定**——这会摧毁关于旧决定为何在当时合理的唯一证据，而记录的全部价值正在于这份证据。

1. 按照上面的流程编写一条新记录，其 Status 引用旧记录。
2. 将**旧**记录的 status 改为 `superseded by <new ref>`，除此之外不要修改任何内容。
3. 更新两条记录对应的索引。

使用该集合已经采用的引用形式。验证器会解析 markdown 链接（`[0009](0009-slug.md)`）、`ADR-0009` 和纯数字引用，并报告无法解析到任何内容的引用。只有当文件名方案包含数字时，纯数字才可解析；在日期或自由格式方案下，记录应通过文件名相互引用，验证器会说明这些引用未经过检查，而不会将它们全部称为悬空引用。

## 验证

```sh
check-decisions.sh [--require "A,B"] [--status "a,b"] [--portable] DIR
# 0 clean, 1 violations, 2 usage error or nothing to check
```

八项检查，每项都会打印一个稳定的代码，以便清晰阅读原因并进行 grep 搜索：

| Code | What it catches |
|---|---|
| `NAME` | 文件名不符合其他记录采用的方案，或集合根本未统一采用任何方案。可识别四种方案：`YYYY-MM-DD-slug.md`、`NNNN-slug.md`、`<prefix>-NNN-slug.md` 和自由格式 |
| `SECTION` | 某条记录缺少集合中超过半数记录都包含的章节 |
| `STATUS` | 某条记录没有 status，而集合中的其他记录都有。支持读取四种形式：frontmatter 中的 `status:`、`- Status:` 列表项、`**Status**:`，以及 `## Status` 章节。当**没有**任何记录包含 status 时，这不算八项违规，而只会在*未运行的检查*中显示一行 |
| `DRIFT` | 同一个 status 使用了两种拼写：`Accepted` 与 `accepted` 并存 |
| `SUPERSEDE` | 无法解析到任何内容的引用，或声称已被取代但没有指定替代记录的 status |
| `DUPLICATE` | 两条记录声明了同一个标识符，且所采用的方案包含标识符（`NNNN-slug.md`、`ADR-031-slug.md`）；在日期或自由格式方案下，整个文件名就是标识符，因此不会发生冲突 |
| `INDEX` | 索引与目录不一致，**无论是哪一个方向** |
| `PORTABLE` | 使用 `--portable` 时：绝对路径，以及跳出集合目录的链接 |

三个有意为之的特性：

- **无法适用的检查会明确说明。** 每次运行结束时，都会将 stderr 上*未运行的检查*列出，
  并说明每项检查及其原因。否则，读者会看到 `OK: no violations`，却无法知道八项检查中有多少项
  实际处于可以给出结论的状态，而沉默会被理解为通过。两个已经发布的缺陷正是源于这一缺口。
- **不强加任何要求。** 必需的部分是大多数记录已经包含的部分，文件名方案也是大多数记录已经采用的方案。
  对于希望遵守比当前习惯更严格要求的集合，可以使用 `--require` 和 `--status`；除此之外，没有其他方式
  能引入集合当前尚未遵循的规则。
- **空目录退出码为 2，而不是 0。** 对零条记录给出“干净”的结论时，任何检查退出码的人都会将其理解为“干净”，
  这会让防护机制在仍然安装的情况下停止发挥作用。

当用户询问“我们为什么决定 X”时，先阅读索引，然后阅读匹配的记录，并根据 Context 和 Decision 作答。
如果没有匹配项，请说明这一点，并提出将其记录下来的建议。

## 审计集合中的私有令牌

这不是本技能的职责，因此这里不重复。如果仓库中配置了 `privacy-guard`，其拒绝列表就是该列表：

```sh
grep -n -i -E -f <(grep -vE '^[[:space:]]*(#|$)' .local/privacy-denylist.txt) <dir>/*.md
```

`check_privacy.sh` 本身读取 `git diff --cached`，因此它能覆盖即将进入提交的记录，但无法覆盖已经位于工作树中的记录。
它自己的技能说明明确指出了这一限制，并说明审计时应手动将受跟踪的工作树与拒绝列表进行 grep；上面的命令就是一种实现方式，
这里列出它，而不是放在那份说明中。

## 重要规则

- **始终**在编写记录前运行验证器，并阅读其约定报告。
- **始终**在将记录写入磁盘前获得明确批准；如果用户拒绝，则不要写入任何内容。
- **始终**在与记录相同的轮次中更新索引。
- **绝不要**在目标仓库中创建 `template.md`。
- **绝不要**编辑已接受的记录来更改决策；应将其取代。
- **绝不要**重复使用标识符，包括删除记录后释放的标识符。
- **绝不要**在未查看退出码的情况下报告集合为干净：验证器在没有可检查内容时退出码为 2，而 2 不等于 0。