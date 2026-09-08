---
name: suede-parity-contract
description: "Suede Labs cross-surface canon discipline: hold one canonical answer across every surface that states it (web, iOS, Android, docs, a second service) by generating a contract from the reference surface and making the others assert against it, so a divergence fails a test instead of reaching a user or an answer engine. Consistent canon is what makes a product citable: generative search quotes sources that do not contradict themselves, and a number that differs between your site and your app is a contradiction a model can see. Use when the same rule, threshold, ladder, or stated fact lives on two or more surfaces; when values are copied by hand out of a handoff; when two surfaces already disagree; or when auditing where they drifted. NOT FOR: deciding which surface is correct (a product call this skill records rather than makes); reviewing a diff (use suede-code-review); wiring merge gates (use suede-ci-gate); a generative-search audit of a page (use suede-seo-audit)."
---
# Suede Parity Contract（麂皮对等契约）

```text
Iron Law: generate the contract from the reference surface's live constants.
A contract you transcribe is a second copy, and second copies drift.
A contract you generate cannot disagree with the code it came from.
```

无声漂移正是这项技能所要防止的失效。当某个阈值被错误地复制到第二门语言中时，不会有任何东西崩溃。两个表面只是开始对同一个问题给出不同的答案，而用户会比你更早发现这一点。

## 步骤 1 — 指定唯一的参考表面

有且仅有一个表面作为参考。其他所有表面都是对它进行断言的跟随者。两个参考就是两个事实来源，只是多绕了几步。

选择领域最完整、被使用最充分的那个表面，并把这个选择写进契约的 `reference` 字段，这样就不会再有人重新翻案。

## 步骤 2 — 通过导入来构建契约，绝不重新键入

构建器从应用实际运行的模块中导入常量并序列化。向构建器中重新键入一个值，恰恰重新引入了本技能要消灭的那份副本。

当一个需要的值是私有的，导出它而不是复制它。这是一行改动，并且能让定义的数量保持为一。

序列化时使用稳定的键顺序和结尾换行，因为跟随者会逐字照搬该文件，一次重排格式都会表现为一个虚假 diff。

## 步骤 3 — 让过期在参考侧失败

用一个测试在内存中重建契约并与已提交的文件比对。没有它，这份 JSON 只是某人曾经拍下的一次快照。

给它一个写入模式，使重新生成只需一条命令，并把该命令写进契约的 README 以及文件自身的 `note` 字段：

```bash
CONTRACT_WRITE=1 <test runner> <contract test>
```

先比较解析后的对象，让失败点名是哪个键变了；再比较原始字节，这样重排格式也能被捕获。

## 步骤 4 — 向每个跟随者 vendor 一份字节级相同的副本

跟随者在相同的相对路径下保留一份副本。证明它匹配，而不是想当然：

```bash
shasum -a 256 <reference>/contracts/<name>.json <follower>/contracts/<name>.json
```

两个哈希完全一致，否则副本已过期。把重新同步的命令记录在跟随者的 README 中，这样下一个人不必自己发明一个。

## 步骤 5 — 通过公开行为断言，而非私有内部实现

一个重新实现参考公式的跟随者测试，只能证明你可以把同一个 bug 写两遍。

断言用户所体验的东西。对于阶梯，把契约的梯级值喂给公开访问器并检查它返回的档位。对于阈值，检查边界**以及比边界低一档**——只从上方断言的阈值，在被下调之后依然会通过。

让跟随者测试套件以一个断言契约已加载且非空的测试开场。一个加载失败的文件会让其后所有断言都空洞地为真。

## 步骤 6 — 钉住你已有的分歧

你会找到既存的差异。契约在第一天的任务是把它们变得可见并固定住，而不是抹掉它们。

把每一条记录在 `knownDivergences` 之下，包含各表面上取值，以及一个在你离开之后依然站得住脚的 `reason`。然后加一个守卫断言，断言分歧列表**恰好**是预期集合，这样在别处新增的条目会是一次失败而不是一片寂静。

每条被钉住的分歧在跟随者上获得两个断言：它仍按记录的幅度存在差异，且它**不**等于参考。第二个断言在有人弥合了分歧却忘记契约时触发。

### 暂停格式 — 构建中途发现分歧

修改一个已上线的常量会改变真实用户的行为，而哪个表面是对的属于产品决策。发现分歧的那一刻，停下来并报告：

```text
Divergence: <key>. <reference surface> says <a>, <follower> says <b>.
Both shipped. <one line on what a user feels>.
  1. Move <follower> to <a>
  2. Move <reference> to <b>
  3. Record it and decide later
```

然后等待。不要替用户做选择，也不要把修改任何一侧当作写契约的副作用。

## 步骤 7 — 在两侧证明非空洞，并在本次运行中证明

一个不可能失败的等价性测试比没有还糟，因为它看起来像证据。

参考侧：改一个常量，观察过期测试失败并**点名那个键**，恢复它，观察它通过。跟随者侧：在 vendor 的副本里改一个值，观察恰好对应的断言失败，然后恢复。

把失败的输出和通过的输出都贴出来。“测试通过”并不是它们能够失败的证明。

## 步骤 8 — 弥合分歧是一次跨两个仓库的操作

两半都落地，否则都不落地：

1. 在要变动的那一侧表面上修改常量。
2. 删除 `knownDivergences` 条目并重新生成契约。
3. 把 vendor 副本重新同步到每个跟随者。
4. 把该跟随者的钉住测试替换为普通的相等断言。
5. 把分歧列表守卫更新为新的预期集合。

只做一半会留下一个红色测试套件并点名缺失的另一半，而这正是设计在发挥作用。

## 版本管理

只有当**形状**变化时才提升 `version`：新增、移除或重命名一个键。值的变化永远不构成版本提升。值正是契约存在所要暴露的东西，跟随者应当以一个失败的断言与它相遇，而不是把它当作一个允许跳过的版本。

## 完成的标准

每一项都由本次运行中的一条命令证明：

- 过期测试在参考常量被修改后失败并点名该键。
- 每个跟随者 vendor 副本与参考副本的哈希一致。
- 每个跟随者套件通过，且其契约加载测试证明文件确实存在。
- 步骤 7 的两个非空洞演示都有粘贴的输出。
- 分歧列表守卫点名的集合与跟随者测试所钉住的集合一致。

## 边界

1. 不要裁定哪个表面的值是正确的。记录、报告，让用户选择。
2. 不要把修改已上线的常量当作写契约的副作用。
3. 不要手工编辑生成的契约或 vendor 的副本。修改源常量并重新生成。
4. 不要把没有任何跟随者断言的值加入契约。一个未被断言的键看起来像覆盖，实际上什么也没提供。
5. 不要在等价性契约中放入凭证、主机名或按环境区分的配置。它承载的是必须在各处保持一致的领域常量。
6. 不要让跟随者的契约测试重新实现参考侧的公式。断言可观察的结果。

## 路由

- 需要对本技能涉及的两个仓库做分支、worktree 或过期镜像处理 -> Suede Labs 私有配套技能，不在本包内：suede-git-hygiene。
- 需要把最终测试接入必需检查或合并门禁 -> 使用 `suede-ci-gate`。
- 需要对契约 diff 做仅输出发现的评审 -> 使用 `suede-code-review`。
- 需要发现加上 A-F 级的上线裁定 -> 使用 `suede-code`。
- 常量已经一致但仍需定位两个表面行为不同的根因 -> Suede Labs 私有配套技能，不在本包内：suede-debug。
- 需要规划跨表面、跨多文件的推行 -> 使用 `suede-graph-flo-xr`，然后回到这里处理契约本身。
- 来自 `suede-code-review`：“这两个表面持有同一常量两份”的发现，路由回 `suede-parity-contract`。
