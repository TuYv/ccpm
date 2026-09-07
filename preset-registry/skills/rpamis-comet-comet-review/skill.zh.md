---
name: comet-review
description: "Manually review the implementation diff for the current Comet change without advancing the workflow."
disable-model-invocation: true
---
# Comet 手动代码审查

为当前选定的 Comet 变更执行按需的只读代码审查。此入口与阶段无关，不替代 Build 或 Verify 的校验与审查。

此入口独立于 `review_mode`：`review_mode` 控制工作流内的自动审查策略，而 `/comet-review` 代表由用户手动触发的一次审查。调用此入口时，不得读取、修改或覆盖当前变更的 `review_mode`。

## 不变量

整个 Skill 调用必须保持只读：

- 不得修改、创建或删除文件。
- 不得暂存、提交、切换分支、创建分支或创建工作树。
- 不得运行 `comet state select`、`comet native select`、`comet state set`、`comet state transition`、阶段守卫、`comet native next` 或归档命令。
- 不得修复发现的问题、推进阶段，或更新任务、状态、验证报告或审查记录。
- 不得将本次审查描述为通过的 Verify 结果，也不得将“无发现”当作测试通过的证明。

只允许读取文件、查询状态和检查 Git diff 所需的命令。可能执行项目代码、安装依赖或生成文件的检查不在本入口的范围内。

## 1. 解析项目与当前变更

1. 使用只读的 Git 查询定位项目根目录。如果项目不是 Git 仓库，则使用当前的 Comet 项目根目录。
2. 在项目根目录下运行：

   ```bash
   comet status . --json
   ```

3. 读取 `.comet/current-change.json`，并按以下顺序解析审查目标：
   - 当其中包含有效的 `comet.selection.v2` 时，使用其中的 `workflow` 和 `change`。
   - 当选择缺失且状态报告中恰好只有一个未归档的 Comet 变更时，仅将该项变更用于本次审查，不写入选择。
   - 当选择缺失且存在多个变更时，列出它们的名称、工作流和阶段，请用户选择其一，然后停止。
   - 当选择指向缺失、已归档或无效的变更时，报告该过期或无效的选择并停止，不做修复。

忽略未受管的普通 OpenSpec 变更。当二者不一致时，不要用默认工作流替换选择。

## 2. 收集审查上下文

只读取当前变更所需的上下文，并为每项事实保留其来源路径或命令。

### Classic

1. 首先阅读并遵循 `comet-classic/reference/classic-layout.md`，以解析项目的逻辑 Classic 根目录。
2. 读取当前变更的 `proposal.md`、`design.md`、`tasks.md` 和 `specs/*/spec.md`。如果存在关联的 Design Doc，也一并读取。
3. 使用以下只读状态查询获取阶段、基线和现有证据引用：

   ```bash
   comet state get <change-name> phase
   comet state get <change-name> base_ref
   comet state get <change-name> plan
   comet state get <change-name> verification_report
   ```

4. 当存在时，读取计划与验证报告，以及 `comet status . --json` 返回的 build 和 verify 命令检查。将缺失的证据标记为“未提供”；不要推断失败或成功。

### Native

运行以下只读命令：

```bash
comet native show <change-name> --json
comet native status <change-name> --details --json
```

读取返回的简介、完整的拟议 Specs、验收项、Builder 交接、检查、验证、风险、阻塞项和验证报告引用。仅使用当前候选与迭代的证据。历史迭代或许可以解释残留风险，但不得覆盖当前状态。

## 3. 确定实现 diff

1. 首先运行 `git status --short --untracked-files=all`，以完整枚举已暂存、未暂存和未跟踪的工作树状态。
2. 利用当前变更的需求、工作区绑定、Git 历史和工作树状态，确定与当前变更相关的最可信审查范围。对于 Classic，优先采用有效的计划 `base-ref`；当其缺失或无效时，回退到状态 `base_ref`。这两个值无需一致。只有当两个值都无效时，Classic 基线才视为缺失。对于 Native，将状态中的工作区关系以及当前候选的实现范围证据作为此判断的输入。
3. 检查从可信基线到当前工作树的完整 diff，包括已提交、已暂存和未暂存的更改。直接读取当前变更拥有的所有未跟踪文件，包括源码、测试、文档、配置和元数据（例如 `SKILL.md` 和 `agents/openai.yaml`），并将其标记为未跟踪。
4. 排除明确属于其他变更或无关用户工作的 diff。仅当歧义会实质影响审查结论时才询问用户；否则基于可用证据继续，并报告范围判断和假设。

如果上述证据仍无法得出可信、可验证的基线，则继续审查可见的工作树 diff，并醒目地将审查范围标记为不完整。

## 4. 执行审查

审查需求、任务和当前 diff，仅关注以下方面：

- 实现正确性和具体的逻辑缺陷；
- 安全、权限和路径边界风险；
- 错误处理、兼容性和重要的边界情况；
- 遗漏的任务或与明确的当前变更需求相矛盾的实现；
- 测试是否覆盖行为变更，以及现有证据是否支持所述结论。

不要将风格偏好、无关重构或没有具体影响的猜测作为发现报告。每项发现都必须指明文件和行号，并解释触发该问题的行为或风险。当证据不足时，降低严重性级别，或将该项归入待解决问题。

仅使用以下严重性级别：

- `CRITICAL`：安全受损、数据丢失或核心工作流不可用；
- `IMPORTANT`：具体的正确性缺陷、核心验收行为缺失或高概率回归；
- `WARNING`：真实存在但不阻塞的边界风险或测试缺口；
- `SUGGESTION`：具有具体收益但不影响当前正确性的改进。

## 5. 报告

首先按严重性排序给出各项发现。对每项发现使用以下格式：

```text
[IMPORTANT] Short title — path/to/file.ts:123
Impact: Which input or scenario produces which failure.
Evidence: The concrete relationship to the diff, task, specification, or recorded evidence.
```

然后报告：

- `Review scope`：工作流、变更、阶段、基线、纳入的 diff 以及任何范围限制；
- `Evidence status`：已读取的测试、构建和验证证据及其时效性，且不重新运行测试；
- `Open questions`：仅限真正阻碍得出结论的问题；
- `Conclusion`：发现数量，或明确说明“无具体发现”。

即使没有发现，也要说明残留风险以及未运行的检查。以如下固定提醒结尾：

> 这是一次只读的手动审查。它不会推进 Comet 阶段，也不能替代 `/comet-verify` 或 Native Verify。

如果用户随后要求修复某项发现，请将其视为一项新的写任务，退出本 Skill，并通过仓库当前的工作流规则重新进入开发。
