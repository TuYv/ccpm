---
name: remove-option-or-flag
description: Remove a Sentry option or FlagPole feature flag whose rollout is finished, in the correct PR order across sentry, getsentry, and sentry-options-automator. Use when deleting an option from defaults.py, removing a flag from temporary.py, cleaning up a flag that reached 100%, unsetting a value in the options automator, or diagnosing an automator run that reports an unregistered option. Trigger on "remove this feature flag", "delete this option", "clean up the flag", "the flag is fully rolled out", "deprecate an option", "unregistered option", "options drift on main".
---
# 移除 Sentry 选项或功能标志

移除需要按固定顺序执行 **三个 PR**，并且每个 PR 都必须先完成部署——不能仅仅合并——之后才能合并下一个 PR。sentry 和 getsentry 通过 GoCD 按区域逐步发布；automator 则运行自己的流水线。顺序错误要么会改变生产环境行为，要么会让 `main` 上的 automator 对所有人变红。

FlagPole 标志出于同样的原因遵循相同顺序：注册一个标志会自动注册一个带有 `FLAG_AUTOMATOR_MODIFIABLE` 的选项 `feature.<flag-name>`（[manager.py](https://github.com/getsentry/sentry/blob/master/src/sentry/features/manager.py)），因此标志会经过与选项完全相同的 `configoptions` 路径。

## 顺序

| #   | 仓库                     | 变更                                                              | 仅在以下条件满足后合并                     |
| --- | ------------------------ | ------------------------------------------------------------------- | ------------------------------------ |
| 1   | sentry / getsentry       | 将每次读取都折叠为最终胜出的结果；删除无效分支 | —                                    |
| 2   | sentry-options-automator | 从 YAML 中移除值 / 标志块                             | 第 1 步已部署到**所有**区域   |
| 3   | sentry                   | 移除注册（`defaults.py` / `temporary.py`）            | 第 2 步已部署，automator 运行成功 |

当一个标志同时在 `static/` 和 `src/` 中被读取时，第 1 步通常需要 **两个 PR**——前端和后端并不是原子化部署的。这是 AGENTS.md 中针对整个仓库的规则，而非选项特有的规则；因此，“第 1 步已部署”意味着两个 PR 都已发布。

## 第 0 步 — 前置条件

| 检查                         | 命令 / 位置                                                        | 含义                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 是否由 automator 管理？      | 选项在 `defaults.py` 中具有 `FLAG_AUTOMATOR_MODIFIABLE`；标志始终具有该标志 | 带有 `FLAG_PRIORITIZE_DISK` 或不带 `FLAG_AUTOMATOR_MODIFIABLE` 的选项来自运维配置，不属于此工作流 |
| 是否应该删除它？  | 控制计划 / 层级权益的标志是永久性的                        | 将 `manager.add(...)` 从 `temporary.py` 移到 `permanent.py`；保留 automator 条目                            |
| 在哪里读取？             | 在 sentry **和** getsentry 中执行 `rg -n '<name>' src/ static/ tests/`          | 每个命中位置都属于第 1 步的工作，包括测试中的 `with self.feature(...)`                                              |
| 在哪里设置，以及设置为什么值？ | **在 HEAD 上的** Automator：`rg -n '<name>' options/`                          | 每个命中位置都属于第 2 步的工作；这些位置共同决定第 1 步将其折叠为何种结果                                        |

## 步骤 1 — 收敛调用点

从 HEAD 上的 automator `main` 读取值——不要从 rollout PR、工单或已注册的默认值中读取；它可能已经发生变化。

如果满足以下任一情况，**停止并询问用户**。报告你找到的值，让他们决定——不要自行选择一个值继续操作：

- **各区域不一致。** `options/default/` 和区域文件中的值不同，因此不存在一个可以收敛为的、统一的已发布结果。由哪个值胜出，或者是否应保留该选项，是产品决策。
- **该选项已发生漂移**（automator 运行中显示 `[DRIFT]`）。线上值与文件中的值不同，因此文件并非事实来源。有人通过其他渠道修改了它，在删除任何内容之前，需要先了解修改原因。

否则，将每个调用点都收敛为最终胜出的结果。不要将该值保留为 `if True` 或单独的常量——那正是该标记本应清理掉的死代码。以下是两种安全变体：

- **收敛分支**（默认方式）。删除 `options.get(...)` / `features.has(...)` / `organization.features.includes(...)` 条件，保留胜出的分支，删除落败的分支。
- **先将值移入已注册的默认值。** 将 `defaults.py` 中的 `default=` 修改为已发布的值，并在第 2 步之前部署，然后再收敛调用点。当该选项需要在较长的过渡期内保持可读时使用此方式。

两者都不做是常见错误：第 2 步会因此改变生产环境行为。

### 清理收敛操作遗留的内容

被删除的分支通常不是唯一会失效的内容。删除：

- 仅由落败分支调用的函数、组件、序列化器和 hooks
- 旧路径的测试，以及现在不再断言任何内容的 `with self.feature(...)` 代码块和模拟响应
- 仅由旧路径使用的 fixtures、分析事件、样式和类型
- 受功能标记控制的路由条目和导航项

第 2 步的前提只有一个：**不再存在对该选项的读取**。如果清理范围较大，可以先提交收敛操作，紧接着再提交删除操作——后续 PR 如果不触及任何读取，就不会影响顺序。

## 步骤 2 — 从 automator 中移除该值

移除后实际回退到的值：

| 类型          | 回退到                                                                                                                              | 使用仍存在时的风险                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Option        | `src/sentry/options/defaults.py` 中已注册的默认值                                                                                     | prod 回退到发布前的默认值              |
| FlagPole flag | 自动注册的 `{}` → FlagPole 放弃处理 → `settings.SENTRY_FEATURES[name]`，即 `manager.add` 上的 `default=` kwarg（通常为 `False`） | **flag 对所有人关闭**，而不是“保持在 100%” |

检查所有设置了它的文件：

- 选项：`options/default/<file>.yaml` **以及所有** `options/regions/*/<file>.yaml`。区域值会覆盖默认值，因此遗留的区域条目会使该选项继续在相应区域启用，并导致第 3 步失败。
- 标志：仅有 `options/default/flagpole.yaml`。不存在按区域划分的 flagpole 文件。
- 注意标志注册时是否设置了 `default=True` —— 即使 YAML 已被移除，这仍会使它保持启用状态。

合并后，在进行第 3 步之前，确认 `#feed-options-automator` 中的部署状态为绿色。

## 第 3 步——移除注册

从 `defaults.py` 中删除 `options.register(...)` 行，或从 `temporary.py` 中删除 `manager.add(...)` 行。对于 `api_expose=True` 的标志，这还会将其从组织序列化器的 `features` 数组中移除，因此任何残留的前端检查都会静默地判定为 false，而不是报错——这也是为什么第 1 步中的前端 PR 必须已经部署完成。

## 失败情况

| 症状                                                                                 | 原因                                                                                                                                    | 修复                                                                                                                                               |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自动化 CI 中出现 `[ERROR] ... unregistered`；自动化 `main` 上的 `options-drift` 任务变红 | 注册已移除，但自动化工具中仍然存在对应值                                                                                 | 合入第 2 步的移除变更；与此同时，`Trigger: Override Options Validation` 可以解除另一个无关 PR 的阻塞，但这会绕过该门禁——必须先征得用户同意 |
| 值卡在 `sentry_option` 中，且无法取消设置                                     | 同样的顺序颠倒问题——`configoptions sync` 只遍历已注册的 `FLAG_AUTOMATOR_MODIFIABLE` 选项，因此永远无法删除该行 | 重新注册该选项，让自动化工具取消设置，然后再移除注册                                                                  |
| 自动化 PR 合入后行为立即发生变化                                           | 第 2 步在第 1 步尚未完成全量部署之前就已合入                                                                                | 回滚自动化 PR——使用 `Trigger: Revert` 标签                                                                                                 |
| 自动化 PR 的 CI 为绿色，但合入后 `main` 变红                                        | PR 检查只会报告相对于其基线新增的错误；推送到 `main` 的漂移任务则会报告所有错误                                    | 修复预先存在的错误，或合入缺失的步骤                                                                                              |