---
name: foundation-meeting-synthesize
description: Cross-meeting archaeology skill. Consumes multiple meeting recaps (or raw notes) over a period and surfaces patterns invisible in any single meeting. Shows how decisions evolved, who has been saying what, where threads are stalling, and where contradictions have emerged. Produces a plain-text timeline, themes with confidence markers, stakeholder position tracking, consolidated decision list, contradiction flags, open items, narrative summary, and prioritized follow-ups.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.2.0"
  updated: 2026-07-05
  category: meeting
  frameworks: [meeting-skills-family]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 会议综合

会议综合是面向多会议项目的考古技能。它会在一段时间内处理一组会议回顾（以及可选的原始笔记），并揭示任何单次会议都无法呈现的模式：决策如何演变、利益相关者的立场如何变化、哪些议题陷入停滞、以及矛盾在哪里出现。

这不同于 `/discover-interview-synthesis`：该技能处理用户研究对话，采用研究专用框架（待完成的任务、购买洞察）。本技能处理内部组织会议，采用组织专属模式（利益相关者对齐、决策演变、项目历史）。

本技能属于会议技能家族。它遵循[会议技能家族契约](../../docs/reference/skill-families/meeting-skills-contract.md)。

## 适用场景

- 跨一系列会议准备董事会材料或高管简报
- 帮助新团队成员了解一项项目的历史
- 为项目回顾提供输入（我们如何走到今天）
- 调查一项跨多次会议的项目为何陷入停滞
- 对一个已经历多次会议的主题进行季度复盘
- 揭示单次会议审阅者未能发现的矛盾

## 不适用场景

- 单次会议总结。请改用 `foundation-meeting-recap`。
- 对外传达结果。请改用 `foundation-stakeholder-update`。
- 用户研究对话综合。请改用 `discover-interview-synthesis`。

## 零摩擦执行

根据家族契约，本技能绝不会因询问而阻塞。默认流程：

1. 加载所有提供的源文件（优先使用回顾，接受原始笔记，但输入质量标记较低）
2. 应用任何筛选条件（时间范围、主题、利益相关者）
3. 对主题、利益相关者演变和矛盾进行推断
4. 提供简要的推断摘要（筛选后的会议数量、检测到的时间范围、每个来源的输入质量、应用的范围筛选条件）
5. 接受 `go` 或修正意见
6. 生成综合结果

如果使用 `--go` 调用，则跳过推断摘要。格式提示（`board-prep`、`onboarding`、`retro-input`、`exec-brief`）控制输出呈现方式，但不会改变底层流程。

## 说明

当要求创建会议综合时，请遵循以下步骤：

1. **加载来源**
   读取所有提供的回顾文件名或笔记文件。解析 frontmatter 以提取会议元数据。记录每个来源的输入质量（如果回顾的 frontmatter 中有 `input_quality`，则使用该值；否则根据内容进行评估）。

   **元数据来源跟踪**（v1.1.0）：对于每份回顾，还要记录 `meeting_type_source` 字段（`explicit | inferred | null`）。跨混合来源进行综合时，综合结果必须在范围部分明确记录这一混合情况："meeting_type values: N explicit, M inferred, K null." 这样可以避免在不同置信度的来源混合时，按 meeting_type 筛选产生不可复现的结果。如果按 `meeting_type` 筛选，请说明筛选是否包含推断值，以及如何处理 null 值。

2. **应用筛选条件**
   如果提供了时间范围、主题或利益相关者筛选条件，则在继续之前缩小源集合。将应用的筛选条件记录在 frontmatter `scope_filter` 中。

3. **呈现 go-mode 推断摘要**
   筛选后的会议数量、从源元数据中检测到的时间范围、每个来源的输入质量级别、筛选条件说明。

4. **构建纯文本时间线**
   按 `meeting_date` 以时间顺序排列。每个条目显示日期、会议名称、关键决策或变化，以及适用时的置信度或矛盾标记。以 markdown 格式渲染（不得使用二进制图像，必须能够在所有环境中渲染）。

5. **提取主题**
   对各来源中的重复主题进行聚类。对于每个主题，记录描述、出现该主题的来源，以及与出现频率相关联的置信度标记（“出现在 5/5 个会议中” → 高；“出现在 2/5 个会议中” → 中；“仅在 1 个会议中提及” → 低）。

6. **跟踪利益相关者立场**
   对各来源中提及的每位利益相关者，记录初始立场 → 当前立场、对齐状态（aligned / divergent / shifting），以及带日期的关键陈述。根据立场是否为直接引述或释义，为每个立场标记置信度。

7. **整合决策**
   跨会议按时间顺序排列。表格格式：Date | Decision | Context | Meeting | Confidence。

8. **将决策演变与未解决的矛盾分开**（v1.1.0）
   输出两个彼此独立的部分，而不是合并成一个“矛盾”部分：
   - **决策演变**（已解决）：同一主题中较早的决策 → 较晚的决策，且较晚的决策取代了较早的决策。这是历史背景，而不是警示信号。不要使用 `⚠` 强调。
   - **未解决的矛盾**：当前彼此冲突、需要协调的决策或立场。使用 `⚠` 进行视觉强调。对于每项内容：
     - 较早的引用（会议 + 日期 + 决策）
     - 较晚的引用（会议 + 日期 + 与之冲突的决策）
     - 状态：未解决 / 需要协调
   
   这种区分很重要，因为 v1.0.0 将两者混为一谈，导致在高管场景中出现误报：所谓的“矛盾”实际上是有意的范围演变。

9. **识别待处理事项和停滞线程**
   识别出现 2 次或更多但尚未解决的主题，并记录它们最后一次出现的时间。

10. **起草叙事摘要**
    用 2-3 个段落说明：发生了什么、发生了哪些变化、当前处于什么状态、利害关系是什么。这是对这一组会议的“故事”进行概括。

11. **确定后续建议的优先级**
    - 高：当前需要解除阻塞；建议负责人或讨论场合
    - 中：重要但不会造成阻塞
    - 低：持续关注
    每项建议都应包含理由。

12. **应用格式提示**（如果提供）
    一个流程生成完整的综合数据。该提示控制特定使用场景下的章节顺序和截断方式：
    - `board-prep`：以叙事摘要 + 矛盾 + 按优先级排列的后续行动建议开头；使用较短的时间线
    - `onboarding`：以叙事摘要 + 利益相关者跟踪开头；使用完整时间线
    - `retro-input`：以主题 + 停滞线程 + 会议质量汇总开头
    - `exec-brief`：TL;DR + 仅列出排名前 3 的事项

13. **渲染 TEMPLATE.md 并验证**
    - `source_meetings` 列表非空
    - `time_range.start` ≤ `time_range.end`
    - 每个主题都有置信度标记
    - 每个矛盾都有变更前后的来源引用
    - 至少 1 个已排序的后续行动

## 项目记忆契约

仅当 `.claude/pm-skills.local.md` 存在时生效。若文件不存在，则完全忽略本节，
并严格按照上述说明执行。

- **读取：**读取同一主题上的 `active_initiative` 和之前的 `interpretation` 工件，使综合结果体现出进展，而不是重复已经记录的内容。
- **写入：**将综合结果作为 `interpretation` 工件写入。
- **处理方式：**提出条目并等待确认后再写入，除非设置了 `memory_auto_append: true`，此时追加内容并回显已写入的内容。
- **写入纪律：**在写入前立即重新读取文件，绝不能使用生成提案时所依据的副本。如果期间文件发生变化，则将你的条目合并到当前状态中，并重新提出，而不是覆盖文件；只添加你自己的条目，其他字段和章节必须逐字节保持不变。运行时不会强制执行这一点，而且该文件被 gitignore 忽略，因此粗心地写入整个文件会丢失其他会话的工作，且无法恢复。

这补充了该系列基于文件名的串联机制，而不是取代它：文件名仍用于定位同一会议的同级工件，而项目记忆则在不同会议之间承载持久化的产品上下文。
## 质量检查清单

- [ ] 列出来源会议，包括文件名、日期以及每个来源的输入质量
- [ ] 填写合理的时间范围
- [ ] 描述范围筛选条件（或写明“未应用”）
- [ ] 时间线为纯文本 Markdown（不使用二进制图像）
- [ ] 主题包含与频率相关联的置信度标记
- [ ] 利益相关者立场跟踪应展示其演变（初始 → 当前），而不只是快照
- [ ] 汇总后的决策列表按时间顺序排列，并带有来源引用
- [ ] 矛盾应在单独的一级章节中标记（不得埋藏在其他内容中）
- [ ] 叙事摘要应为 2-3 个段落，而不是项目符号列表
- [ ] 后续行动应按优先级排序（高 / 中 / 低），并说明理由
- [ ] Frontmatter 省略单次会议字段（meeting_title、meeting_date 等）
- [ ] Sources 和 References 应根据各来源的输入质量加权

## 另请参阅

- [会议技能系列契约](../../docs/reference/skill-families/meeting-skills-contract.md)
- [`foundation-meeting-recap`](../foundation-meeting-recap/SKILL.md)。上游：主要输入来源
- [`/discover-interview-synthesis`](../discover-interview-synthesis/SKILL.md)。用户研究对话的同级模式（不同领域）