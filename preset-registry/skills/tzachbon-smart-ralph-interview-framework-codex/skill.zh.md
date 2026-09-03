---
name: interview-framework-codex
description: Internal Ralph Specum contract for Codex phase interviews, skill manifests, approval, and delegation gates. Phase coordinators load this skill directly; users do not invoke it as a workflow phase.
metadata:
  surface: internal
---
# Codex 访谈框架

将每个正常模式的 `start`、`triage`、`research`、`requirements`、`design` 和 `tasks` 阶段都经由 `references/algorithm.md` 和 `references/domain-modeling.md` 运行。

## 完成判据

仅当以下全部条件对同一个身份元组成立时，才进行委派：

- `phase`、`interviewId`、`discoveryRevision` 和 `contextDigest` 在状态中与在委派包中相互匹配。
- 所选技能清单的状态为 `complete` 或 `partial_warned`。
- 阶段访谈在显式最终批准后状态为 `complete` 或 `skipped`。
- `phase_gate.py check-delegation` 成功。

## 硬性转换不变量

在每次受影响的阶段转换或子分派之前，立即运行当前的 `check-delegation`。任一模式下 `check-delegation` 失败都会在状态转换、子分派或目标工件写入之前停止本次调用。正常模式失败后，下一次显式调用将使用全新的清单/访谈身份。精确 `--quick` 委派失败后，下一次显式调用会重新运行发现流程，记录全新的 `phaseSkillLoad` 和访谈身份，并且不复用已终止的 `bypassed_quick` 访谈或其发现修订版本。只有身份匹配且处于进行中的 `collecting` 或 `awaiting_confirmation` 访谈才可恢复。尚未触及失败委派边界的、身份匹配的进行中访谈仍然有效，可以恢复。

精确 `--quick` 保留发现流程、清单、父委派溯源、`check-delegation`、回执记录以及 `check-agent-write`。快速模式仅跳过访谈问题。精确 `--quick` 另行跳过最终批准。它仍会在分派前立即运行 `check-delegation`，使用相同的身份元组，要求具有当前的 `complete` 或 `partial_warned` 清单，外加一份状态为 `bypassed_quick` 且 `quickAuthorization.source: "--quick"` 的访谈回执，并且不存在其他任何旁路。

## 硬性边界

- 只询问能够改变阶段范围、外部可见行为、验收、架构、顺序或重大风险的关键用户决策。
- 通过检查代码、配置、状态、先前的工件以及所选技能契约来获取事实。不要向用户询问可自行发现的事实或设置与管理方面的选择。
- 一次性询问当前全部未受阻的关键前沿。仅当 Codex 原生用户输入工具的限制要求分批时才拆分前沿。当前限制为每次调用三个问题。
- 将推荐选项放在最前面并说明其权衡。只提供可行的备选方案。
- 在询问下一个前沿之前，先持久化每个部分回答。
- 将诸如 `apply the changes`、`continue`、`proceed` 和 `go ahead` 之类的纯控制类回复视为对当前活跃访谈问题未作回答。
- 将处于活跃问题期间的单独 `skip` 视为一条指令：以声明的默认值和假设完成剩余访谈。在委派之前呈现最终批准关卡。
- 在用户显式选择 `approve and delegate` 后的同一回合内进行委派。
- 在工件评审期间，将 `apply the changes` 视为修订请求。委派该修订，并停留在工件批准关卡。
- 在盘问环节应用领域语言建模。质疑冲突或含糊的术语，使用具体的边界场景，并记录已解决的领域术语，而不创建 ADR。

## 预加载边界

将所选技能正文和所需的当前工作引用作为契约加载。在预加载期间，收集约束、词汇、检查项和冲突。在阶段访谈获得批准且委派关卡通过之前，不要开始任何由已加载领域技能规定的任务动作。

如果此核心技能、其算法参考或其领域建模参考无法读取并计算哈希，则记录 `phaseSkillLoad.status: "core_failed"`，报告该失败并停止。将领域技能的加载失败记录到 `warnings` 和 `failures` 中，使用 `partial_warned`，并继续。将已加载契约之间未解决的重大冲突转化为第一层访谈决策。
