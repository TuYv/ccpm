---
name: decision-records
description: Creates, supersedes and validates decision records (ADRs) against the convention a collection already follows, instead of imposing a published one. Use when the user wants to record a decision, write an ADR, supersede an existing decision, audit or lint a decisions folder, check that an ADR index is in sync, or asks "why did we decide X". Deduces the filename scheme, section set and status vocabulary from the records already there; ships a validator with an exit code, so the audit is a check and not an opinion.
argument-hint: "[new | supersede <ref> | check [<dir>]]"
allowed-tools: Bash(ls:*), Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(bash:*), Read, Write, Edit
---
# 决策记录

决策记录写起来很便宜，建立对它们的信任却很昂贵。昂贵之处在于维护集合：编号发生冲突，索引不再与目录匹配，记录声称自己已被取代，却没有说明被什么取代。此技能用于编写记录，更主要的是，**让一个集合遵守它自己的约定**。

## 此技能不做什么

- **它不会将模板文件放入目标仓库。** 骨架就在此文件中。在记录旁边放置一个 `template.md`，就等于为约定设置了第二个存放位置，而两个存放位置会在无声中逐渐分歧：模板保留着记录一年前就删掉的章节，却没有任何说明指出哪一个才是约定。使用最广泛的先例（`affaan-m/ECC`、`skills/architecture-decision-records`）会创建模板文件；这里是有意为之的不同，并非疏忽。
- **它不会检查私有令牌。** 主机名、实例名、IP 范围和个人身份信息属于 `privacy-guard` skill，其拒绝列表特意被 gitignore。把该列表复制到这里，会让同一个列表出现在两个位置，这就是上面所说的失败，而且后果更严重。`--portable` 检查只覆盖记录被**复制**时会造成问题的内容：绝对路径，以及跳出集合范围的链接。
- **它不会重写已接受的记录来改变其观点。** 请参见*取代*。

## 第 0 步，始终如此：写入任何内容前先读取集合

找到记录集合。实际使用中的三个默认目录各不相同，因此要查看，不要假设：`doc/adr`（adr-tools）、`docs/adr`（ECC skill）、`docs/decisions`（MADR 4.0.0）。

```sh
bash "${CLAUDE_PLUGIN_ROOT}/skills/decision-records/scripts/check-decisions.sh" <dir>
```

它的第一部分会报告该集合的做法：文件名方案、状态所在位置、正在使用的状态词汇、绝大多数记录包含的章节，以及索引。**这份报告就是约定。** 你接下来写下的所有内容都必须匹配它，包括那些你原本会采用不同写法的部分。

如果集合为空或不存在，请询问一次，并同时提供两种方案：

| 方案 | 收益 | 成本 |
|---|---|---|
| `NNNN-slug.md` **（推荐此方案）** | 一个可以口头说出的简短引用："请参见 0007" | 两个并行 PR 都会取得下一个编号，最终都合并（[adr/madr#28](https://github.com/adr/madr/issues/28)，自 2020 年起一直开放，尚未采用任何约定）；在仓库之间复制以及重新排序时会出问题 |
| `YYYY-MM-DD-slug.md` | 并行 PR 之间不会发生冲突，复制到另一个仓库后仍然有效，排序正确 | 没有简短引用：引用记录时必须使用完整文件名 |

除非仓库通过并行 PR 做出决策，否则推荐使用编号方案；日期方案正是为这种情况发明的（`log4brains` 在该讨论串中采用它，原因就是如此）。选择方案不会改变记录的其他任何内容。

## 创建记录

1. **起草，不要写入。** 撰写记录，并在对话中展示。
2. **等待明确批准。** "看起来不错"、"是的，写入吧"。沉默不算批准。如果用户拒绝，则丢弃它：不写入任何内容，不留下任何文件。
3. **写入**集合，按照推断出的方案命名；当方案采用编号时，编号为 `max + 1`（绝不重复使用编号，即使被删除的记录所占用的编号也不例外）。
4. **在同一轮中更新索引**，前提是该集合维护索引。写入记录却不将其编入索引，正是 `INDEX` 检查要捕获的缺陷；不要先创建缺陷，再报告它。
5. **重新运行验证器。** 只有它能告诉你写入的内容确实落在约定之内，而不是写在约定旁边。

用于无法推导出任何内容的集合的骨架。对于本身已有集合的情况，各节会根据该集合进行调整：

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

关于内容，有两条来自 Nygard 原著、且值得保留的规则：写清楚**为什么**，因为代码中已经显现了做什么；并记录被拒绝的替代方案及其原因，否则后来的人会再次提出它。

## 替代旧记录

一份已接受的记录是对某个时刻的陈述。**绝不要编辑它来改变其决定**，这会摧毁唯一能说明旧决定为何合理的证据，而记录的全部价值就在于这份证据。

1. 按照上述流程编写一份新记录，其 Status 引用旧记录。
2. 将**旧**记录的 status 改为 `superseded by <new ref>`，除此之外不要修改任何内容。
3. 更新索引中的两条记录。

使用该集合已有的引用形式。验证器会解析 Markdown 链接（`[0009](0009-slug.md)`）、`ADR-0009` 和裸数字，并报告无法解析到任何内容的引用。只有在文件名方案携带数字时，裸数字才可解析；在日期或自由格式方案下，记录应通过文件名相互引用，验证器会说明这些引用未经检查，而不会将它们全部称为悬空引用。

## 验证

```sh
check-decisions.sh [--require "A,B"] [--status "a,b"] [--portable] DIR
# 0 clean, 1 violations, 2 usage error or nothing to check
```

八项检查，每项都会打印一个稳定代码，以便清晰阅读原因并进行 grep：

| Code | 检查内容 |
|---|---|
| `NAME` | 文件名不符合其他记录所使用的方案，或集合完全没有统一的方案。支持识别四种方案：`YYYY-MM-DD-slug.md`、`NNNN-slug.md`、`<prefix>-NNN-slug.md` 和自由格式 |
| `SECTION` | 某条记录缺少集合中超过半数记录所包含的节 |
| `STATUS` | 在其他记录具有 status 的集合中，某条记录没有 status。支持读取四种形式：frontmatter 中的 `status:`、`- Status:` 列表项、`**Status**:`、`## Status` 节。当没有任何记录具有 status 时，这不会产生八条违规，而只会在*未运行的检查*中显示一行 |
| `DRIFT` | 同一个 status 使用了两种拼写：`Accepted` 与 `accepted` 并存 |
| `SUPERSEDE` | 引用无法解析到任何内容，或声称替代旧记录的 status 没有指定替代记录 |
| `DUPLICATE` | 两条记录声明了同一个标识符，且所用方案携带标识符（`NNNN-slug.md`、`ADR-031-slug.md`）；在日期或自由格式方案下，完整文件名就是标识符，因此不会发生冲突 |
| `INDEX` | 索引与目录内容不一致，**包括任一方向上的不一致** |
| `PORTABLE` | 使用 `--portable` 时：存在绝对路径，或存在爬出集合范围的链接 |

三个经过深思熟虑的特性：

- **无法适用的检查会明确说明。** 每次运行都会在 stderr 上以*未运行的检查*结束，列出每项检查及其原因。否则，读者看到 `OK: no violations` 时，无法知道八项检查中有多少项实际能够判断，沉默看起来就像通过。已有两个已发布的缺陷正是源于这一缺口。
- **不强加任何要求。** 必填章节是大多数记录已经具备的章节，文件名方案也是大多数记录已经使用的方案。`--require` 和 `--status` 是为希望遵守比当前习惯更严格标准的集合提供的，它们是唯一能够引入该集合当前并未遵循的规则的方式。
- **空目录应以 2 退出，而非 0。** 对零条记录给出干净结论，在任何检查退出码的人看来都意味着“干净”，这正是一个守卫在仍被安装的情况下停止守卫的方式。

## 已声明的限制：状态被假定为一个令牌

`STATUS` 和 `DRIFT` 检查假定状态字段包含一个**词**，并依据其第一个词推导词汇表。有些集合会在其中放入一段文字：一个状态词，后跟两句叙述和一份交叉引用列表。对于这些集合，推导出的词汇表会是散文的第一个词，毫无意义，而 `--status` 会将每条此类记录报告为不在词汇表中。

这是一个限制，而非应当被规范化消除的缺陷：决定自由文本中的令牌在何处结束是一种猜测，而猜测正是验证器开始把集合自身的约定反过来报告给它的原因。不要在状态字段包含散文的集合上使用 `--status`。其中其他所有功能仍然有效，因为另外七项检查不会读取该字段。

当用户问“我们为什么决定 X”时，先阅读索引，再阅读匹配的记录，并根据 Context 和 Decision 作答。如果没有匹配项，明确说明，并提议记录一条。

## 审计集合中的私有令牌

这不是本技能的职责，也不在此重复。如果仓库中配置了 `privacy-guard`，其拒绝列表就是清单：

```sh
grep -n -i -E -f <(grep -vE '^[[:space:]]*(#|$)' .local/privacy-denylist.txt) <dir>/*.md
```

`check_privacy.sh` 本身读取 `git diff --cached`，因此它覆盖的是正要进入提交的记录，而不是已经位于工作树中的记录。其自身技能说明了这一限制，并指出审计时应手动针对拒绝列表 grep 已跟踪的树。这里写出了 `grep -f` 形式而非在该处，因为它直接读取同一个被 gitignore 的文件。

## 重要规则

- **始终**在编写记录前运行验证器并阅读其约定报告。
- **始终**在将记录写入磁盘前获得明确批准；用户拒绝时不得写入任何内容。
- **始终**在与记录相同的轮次中更新索引。
- **绝不**在目标仓库中创建 `template.md`。
- **绝不**编辑已接受的记录来更改决策；应将其标记为被取代。
- **绝不**重用标识符，包括因删除记录而释放的标识符。
- **绝不**在未查看退出码的情况下将集合报告为干净：验证器在没有任何可检查内容时以 2 退出，而 2 不是 0。