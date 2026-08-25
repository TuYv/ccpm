---
name: iterate-retrospective
description: Facilitates and documents a team retrospective capturing what went well, what to improve, and action items. Use at the end of a sprint, project, or milestone to reflect and improve team practices. To bank individual learnings into organizational memory afterward, use iterate-lessons-log.
license: Apache-2.0
metadata:
  phase: iterate
  version: "2.2.0"
  updated: 2026-06-10
  category: reflection
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 回顾

回顾是一种结构化反思，帮助团队从经验中学习并持续改进。通过定期审视哪些事情进展顺利、哪些没有进展顺利，以及需要做出哪些改变，团队可以建立学习与适应的文化。其价值不仅在于讨论本身，还在于记录下来的行动以及后续落实。

## 适用场景

- 每个迭代结束时（对于敏捷团队）
- 完成重要项目或里程碑之后
- 发生重大事故或服务中断之后
- 当团队氛围不对、需要进行处理时
- 定期开展（每月、每季度），即使没有特定触发因素
- 新团队成员入职时，用于建立持续改进文化

## 不适用场景

- 你希望为组织沉淀一条持久的经验 -> 使用 `iterate-lessons-log`；回顾是仪式，日志条目则会长期留存
- 你正在对一个 OKR 周期进行收尾评分 -> 使用 `measure-okr-grader`
- 反思必须以“调整方向还是坚持下去”的决策结束 -> 使用 `iterate-pivot-decision`
- 你需要总结一场普通的（非回顾）会议 -> 使用 `foundation-meeting-recap`

## Instructions

当被要求主持或记录一次回顾时，请遵循以下步骤：

1. **明确背景**
   定义本次回顾涵盖的时间段或项目、参与者，以及期间发生的任何重大事件。这可以为讨论提供背景，也帮助未来的读者了解上下文。

2. **选择形式**
   选择适合团队需求的回顾形式。常见选项包括：
   - **开始/停止/继续：** 简单直接
   - **4Ls：** 喜欢、学到、缺少、期望
   - **愤怒/悲伤/开心：** 关注情绪
   - **帆船：** 视觉化隐喻（风=帮助，锚=阻碍）

3. **收集意见**
   收集团队所有成员的观察。确保每个人都参与.quiet voices 往往包含重要的洞察。将相似条目归组，以识别主题。

4. **讨论并确定优先级**
   不要试图处理所有事情。将讨论集中在影响最大的条目上。通过投票或讨论，确定需要处理的前 2-3 个问题。

5. **定义行动项**
   将洞察转化为具体且可分配的行动。每个行动都需要负责人和截止日期。避免使用“加强沟通”之类含糊的改进表述。

6. **检查之前的行动**
   检查上次回顾中的行动项状态。庆祝已完成的事项，并讨论未完成事项的阻碍因素。这有助于建立责任感。

7. **记录以供未来参考**
   记录关键要点，确保未来的团队成员可以查阅，也便于随着时间推移追踪规律。

## Project Memory Contract

仅当 `.claude/pm-skills.local.md` 存在时启用。没有该文件时，完全忽略本节，
并严格按照上述说明执行。

- **读取：** 最近的 `artifacts[]` 条目，以便回顾能够查看该周期实际产出的内容，而不是依赖回忆。
- **写入：** 将经验作为 `interpretation` artifact 写入。
- **处理方式：** 提议该条目，并在写入前等待确认，除非设置了
  `memory_auto_append: true`，在这种情况下追加并回显所写入的内容。
- **写入规范：** 在写入前立即重新读取文件，绝不要使用生成提议时所依据的副本。如果期间文件发生变化，则将你的条目合并到当前状态中，并重新提出，而不是覆盖文件；只添加你自己的条目，并让其他每个字段和章节逐字节保持不变。运行时不会强制执行这一点，而且该文件被 gitignore 忽略，因此一次粗心的整文件写入会丢失另一个会话的工作，并且无法恢复。

一次回顾会同时呈现原始观察、模式和承诺。将其中持久有效的部分，即经验教训，归入单一标签；后续读者需要知道应当以多大程度重视该条目，而混合标签无法传达任何信息。
## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的回顾应填写模板中的每个部分：概述；上次回顾复盘；做得好的地方；需要改进的地方；讨论记录；行动项；停车场；指标与趋势；主持人备注；以及下次回顾。

## 质量检查清单

完成前，请确认：

- [ ] 所有与会者都有机会参与
- [ ] 既记录了积极方面，也记录了需要改进的方面
- [ ] 行动项都有负责人和截止日期
- [ ] 已复盘上次回顾中的行动项
- [ ] 即使错过回顾会的读者仅凭本文档，也能了解已做出的决定以及每项行动的负责人

## 示例

请参阅 `references/EXAMPLE.md` 中的完整示例。