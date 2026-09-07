---
name: goal-prompt
description: "Drafts copy-paste-ready /goal commands for goal mode in Claude Code and Codex. Use when the user asks to create, write, rewrite, improve, compress, clean up, or prepare a goal prompt, goal condition, /goal command, goal-mode objective, or copy-ready long-running task objective."
allowed-tools: Bash Read Write
---
# Goal 提示词

`/goal` 让智能体持续工作，直到完成条件得到满足。Claude Code 和 Codex 都将其作为单行接受，最多 4,000 个字符。在 Claude Code 中，一个小模型会在每轮之后仅凭对话记录重新判定该条件——它无法运行命令。

先起草一个能够终止的条件，再对其进行格式化。目标适用于规模超过单轮、且有一条可检验终点线的工作；应将小目标串联并在其间穿插审查，而不是写一个巨型目标。

## 起草

包含以下内容，并以 AND 连接——绝不要用 “or”，否则循环会走代价更低的那条分支：

1. **终态，而非活动** —— “所有 `legacyAuth()` 调用点都使用 `auth.verify()`”，而不是“迁移认证代码”。活动可以被声称已完成；终态则非真即假。
2. **先要阅读的范围** —— 动手之前需要阅读的文件、issue、日志或计划。
3. **写明的检验** —— 具体的命令及其可观察的结果（“`npm test` 退出码为 0”），外加运行该命令并展示输出的指示；从未出现在对话记录中的结果，对评估者而言等于不存在。
4. **不变量** —— 不得改变的内容（“不修改 vendor/”），且始终要包含“不要削弱、跳过或编辑检验本身”。
5. **停止上限或受阻条款** —— “或在 20 轮后停止”、“若受阻则停止并报告阻碍”。缺少这一条时，表述失当的条件会永远循环；格式化工具会在其缺失时发出警告。（Claude Code 在会话恢复时会重置轮数计数器，因此轮数上限会跨多次恢复被静默延长。）

**保持精简。** 每条约束都会收窄模型可探索的状态空间。尽可能收敛为单一终止判据，把范围和定义移入被引用的文件，并删掉非目标——一条约束只有封住了真实存在的捷径，才有资格留下。

对于长目标，还要指明最终证据（diff、报告、产物），并要求一个进度日志文件——以此在压缩与恢复之间保持持久状态。如果这份简述超过 4,000 个字符，就把细节放进 `GOAL.md`，并在目标中引用该文件。

**绝不虚构缺失的要素。** 让每个要素都立足于用户的请求、对话或代码仓库——去查证，而不是猜测。如果某个要素无法从现有信息补齐，仍要对用户提供的内容进行优化与格式化，省略该要素，并将其标记为缺失（见「格式化」一节）。带有虚构成功条件的目标，会在错误的契约上终止。

## 封堵省事的出路

在格式化之前，像一个偷懒的模型那样重读草拟的条件：不做预期的工作而让每项检验全部通过，最省事的做法是什么？封堵其中最省事的几条——优先将已有的检验互相配对，而不是新增约束；也不要把每一种想得到的出路都枚举成一份非目标清单。反复出现的出路有：

- **删除或打桩（stub）代替修复** —— “搜索无输出”在调用方被删光之后同样成立；要把这类检验与一个能证明功能仍然可用的检验配对。
- **在子集上通过** —— 只跑一个测试文件、收窄搜索路径、把某些目录排除在检验之外。
- **蒙混过关** —— 跳过测试或把测试标为 xfail、硬编码预期输出、对测试输入做特判、编辑检验本身（不变量规则）。
- **不运行就宣称完成** —— 在对话记录里没有任何检验输出的情况下宣布已完成或受阻（展示输出规则）。

遵循与上文相同的纪律：凭现有信息无法封堵的出路，放入 `Missing:` 列表作为警告——一条凭空捏造或荒谬的约束，比一个被标记出来的缺口更糟。

## 安全研究目标

把审计类目标收敛为单一终止判据，例如识别、触发并验证一个在所引用的威胁模型文件之下成立的高危漏洞。范围、攻击者能力、严重性基线以及应跳过的已知发现，都由该文件而非目标本身来承载。使用中性措辞（“触发并验证”，而不是“证明它可被利用”），要求把前提条件实际演示出来——假设攻击者已拥有访问权是最常见的误报来源——并且在每条发现之后停下来等待人工审查，而不是堆积未经分拣的报告。发现必须由一个全新的智能体进行第二轮验证，绝不能只由发现者本人验证。

## 格式化

对草稿（文件或 stdin）运行 `uv run --no-project {baseDir}/scripts/format_goal_prompt.py --fenced`。它会将空白折叠为单行，剥除 `/goal` 前缀、引号和围栏，在缺少停止条款时发出警告，并拒绝超过 4,000 个字符的输出——此时需缩短内容，或把细节移入文件后重新运行。

返回恰好一个带围栏的 `text` 代码块，且为单行：

```text
/goal <single normalized objective>
```

不要在它周围添加任何说明文字——除非清单中的要素无法落地：此时在该代码块之后附上一份 `Missing:` 列表，每个缺口一行，告诉用户需要补充什么。

## 示例

草稿：

```
/goal Migrate the auth module:
  - replace legacyAuth() with auth.verify()
  - make sure the tests still work
```

重新起草并格式化后：

```text
/goal All legacyAuth() call sites use auth.verify(): `rg "legacyAuth\(" -t ts` prints nothing AND `npm test` exits 0 (run both, show the output), without modifying vendor/ or weakening any test. If blocked, stop and report attempted paths and the blocker, or stop after 20 turns.
```

这里 `npm test` 来自仓库的 package.json——不是猜的——把它与零匹配检验配对，就封住了最省事的出路：删掉调用点，而不是迁移它们。当某个要素找不到任何依据时，就格式化已有的内容并标出缺口：

草稿：`make checkout faster`，而上下文中任何地方都没有指标或基准：

```text
/goal Make checkout faster
```

Missing:
- 可度量的终态 —— 哪个指标和阈值才算 “更快”
- 验证 —— 能证明它的基准或命令
- 停止上限 —— 例如 “或在 20 轮后停止”
