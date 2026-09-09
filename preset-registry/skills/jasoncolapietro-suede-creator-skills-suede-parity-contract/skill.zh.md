---
name: suede-parity-contract
description: "Suede Labs cross-surface canon discipline: hold one canonical answer across every surface that states it (web, iOS, Android, docs, a second service) by generating a contract from the reference surface and making the others assert against it, so a divergence fails a test instead of reaching a user or an answer engine. Consistent canon is what makes a product citable: generative search quotes sources that do not contradict themselves, and a number that differs between your site and your app is a contradiction a model can see. Use when the same rule, threshold, ladder, or stated fact lives on two or more surfaces; when values are copied by hand out of a handoff; when two surfaces already disagree; or when auditing where they drifted. NOT FOR: deciding which surface is correct (a product call this skill records rather than makes); reviewing a diff (use suede-code-review); wiring merge gates (use suede-ci-gate); a generative-search audit of a page (use suede-seo-audit)."
---
# Suede 对等性契约

```text
Iron Law: generate the contract from the reference surface's live constants.
A contract you transcribe is a second copy, and second copies drift.
A contract you generate cannot disagree with the code it came from.
```

它要防止的是无声漂移。把阈值错误地复制到另一种语言中时，不会有任何东西崩溃。两个表面只是开始对同一个问题给出不同答案，而用户会在你之前发现这一点。

## 第 1 步 — 指定一个参考表面

参考表面必须且只能有一个。其他每个表面都是针对它进行断言的跟随者。两个参考表面就意味着有两个真相来源，只是多了几步操作。

选择领域最完整、使用最充分的表面，并将这一选择写入契约的 `reference` 字段，这样就不需要有人反复争论该选择。

## 第 2 步 — 通过导入构建契约，绝不重新输入

构建器从应用实际运行所依赖的模块中导入常量，并将其序列化。把值重新输入构建器，会重新引入这项技能旨在消除的复制。

当所需值为私有值时，将其导出，而不是复制一份。这只需一行改动，并能让定义数量保持为一个。

使用稳定的键顺序和末尾换行符进行序列化，因为跟随者会原样引入该文件，而重新格式化会表现为无意义的差异。

## 第 3 步 — 让参考侧的过时状态触发失败

编写一个测试，在内存中重新构建契约，并将其与已提交的文件进行比较。没有这个测试，JSON 就只是某人曾经生成的一份快照。

为它提供写入模式，使重新生成只需一条命令，并将该命令写入契约的 README 和文件自身的 `note` 字段中：

```bash
CONTRACT_WRITE=1 <test runner> <contract test>
```

先比较解析后的对象，这样失败信息会指出发生变化的键；然后比较原始字节，以便同样捕获重新格式化。

## 第 4 步 — 向每个跟随者引入字节级完全一致的副本

跟随者在相同的相对路径保留一份副本。证明它们匹配，而不是想当然地认为它们匹配：

```bash
shasum -a 256 <reference>/contracts/<name>.json <follower>/contracts/<name>.json
```

两个哈希值必须相同，否则副本就是过时的。将重新同步命令记录在跟随者的 README 中，这样下一个人就不必自行臆造命令。

## 第 5 步 — 通过公开行为断言，而不是私有内部实现

重新实现参考公式的跟随者测试，只能证明你能够把同一个错误写两遍。

断言用户实际体验到的行为。对于阶梯，将契约中的阶梯值传给公开访问器，并检查它返回的级别。对于阈值，检查边界值以及**低于该值一个步长的值**，因为只从阈值上方进行断言，在阈值下移后仍然会通过。

以一个检查契约已加载且非空的测试开始跟随者测试套件。一个无法加载的文件会让后续每个断言都在事实上失去意义。

## 第 6 步 — 固定已有的差异

你会发现现有的差异。契约在第一天的职责是让这些差异可见并将其固定下来，而不是消除它们。

将每项记录在 `knownDivergences` 下，为每个表面记录其值，并添加一个即使你离开后仍然有效的 `reason`。然后添加一个保护性断言，断言差异列表**恰好**是预期集合，这样在其他位置新增条目会导致失败，而不是悄无声息地通过。

每个固定差异都要在跟随方添加两个断言：断言它仍然与记录的数值存在差异，并且断言它**不等于**参考值。第二个断言会在有人关闭差异却忘记更新契约时触发。

### 停止格式 —— 在构建过程中发现差异

修改已发布的常量会改变真实用户的行为，而哪个表面是正确的属于产品决策。在发现差异的那一刻，停止并报告：

```text
Divergence: <key>. <reference surface> says <a>, <follower> says <b>.
Both shipped. <one line on what a user feels>.
  1. Move <follower> to <a>
  2. Move <reference> to <b>
  3. Record it and decide later
```

然后等待。不要替用户做决定，也不要为了编写契约而顺带修改任一侧。

## 第 7 步 —— 在本次运行中证明双方都不是空转

无法失败的对等性测试比没有测试更糟糕，因为它看起来像是证据。

参考侧：修改一个常量，观察陈旧性测试失败并**指出该键名**，恢复它，观察测试通过。跟随侧：编辑 vendored copy 中的一个值，观察恰好对应的断言失败，然后恢复。粘贴失败和通过的输出。“测试通过了”不能证明测试确实能够失败。

## 第 8 步 —— 关闭一个差异需要两个仓库同时操作

两半要么一起合入，要么都不合入：

1. 修改正在迁移的表面上的常量。
2. 删除 `knownDivergences` 条目并重新生成契约。
3. 将 vendored copy 重新同步到每个跟随方。
4. 将该跟随方的固定断言测试替换为普通的相等断言。
5. 将差异列表保护更新为新的预期集合。

只完成一半会留下一个指出缺失部分的红色测试套件，这正说明设计在正常工作。

## 版本控制

仅当**结构**发生变化时才递增 `version`：新增、删除或重命名键。值发生变化绝不会导致版本递增。值正是契约存在的意义所在，用于将其暴露出来；跟随方应通过一个失败的断言来满足它，而不是将其作为可以跳过的版本。

## 完成意味着

本次运行中的每一行都已通过命令得到证明：

- 陈旧性测试在参考常量发生变化时失败，并指出该键。
- 每个跟随方的 vendored copy 都与参考方的文件哈希完全一致。
- 每个跟随方的测试套件都通过，并且其契约加载测试证明该文件确实存在。
- 第 7 步中的两项非空转演示都已粘贴输出。
- 差异列表保护所列出的集合与跟随方测试固定的集合相同。

## 边界

1. 不要决定哪一侧的值是正确的。记录、报告，并让用户选择。
2. 不要为了编写契约而顺带修改已发布的常量。
3. 不要手动编辑生成的契约或 vendored copy。编辑源常量并重新生成。
4. 不要向契约中添加任何没有跟随方断言的值。未被断言的键看似提供了覆盖，实际上并没有。
5. 不要将凭据、主机名或按环境配置放入对等性契约。契约承载的是必须在所有位置保持一致的领域常量。
6. 不要让跟随方的契约测试重新实现参考方的公式。断言可观察结果。

## 路由

- 需要处理涉及两个仓库的分支、工作树或过时镜像
  -> 使用不包含在本包中的私有 Suede Labs companion：suede-git-hygiene。
- 需要将生成的测试接入为必需检查或合并门禁 -> 使用
  `suede-ci-gate`。
- 需要仅针对契约差异进行审查 -> 使用 `suede-code-review`。
- 需要审查结果并给出 A-F 发布 verdict -> 使用 `suede-code`。
- 需要查明两个 surface 的常量已经一致但行为仍然不同的根本原因 -> 使用不包含在本包中的私有 Suede Labs companion：suede-debug。
- 需要规划跨 surface 的多文件 rollout -> 使用 `suede-graph-flo-xr`，
  然后返回此处处理契约本身。
- 对于 `suede-code-review`：将“这两个 surface 各自重复保存了同一个常量”这一发现
  路由回 `suede-parity-contract`。