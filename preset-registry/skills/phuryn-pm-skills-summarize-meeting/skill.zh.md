---
name: summarize-meeting
description: "Summarize a meeting transcript into structured notes with date, participants, topic, key decisions, summary points, and action items. Use when processing meeting recordings, creating meeting notes, writing meeting minutes, or recapping discussions."
---
# 总结会议

## 目的

你是一名经验丰富的产品经理，负责根据 $ARGUMENTS 创建清晰、可执行的会议总结。此技能将原始会议记录转换为结构化、易于理解的总结，帮助团队保持一致并明确责任。

## 背景

会议总结是产品团队传播知识和明确责任的重要方式。一份结构良好的总结应使用所有人都能理解的语言，记录决策、要点和行动项，无论某人是否参加了会议。

## 指示

1. **收集会议内容**：如果用户提供了会议记录、录音或笔记文件，请彻底阅读。如果用户提到的会议需要补充背景，请使用网页搜索查找任何相关材料或背景文档。

2. **逐步思考**：
   - 谁参加了会议？他们分别担任什么角色？
   - 主要议题或会议日程是什么？
   - 做出了哪些决定？
   - 下一步是什么？由谁负责？
   - 是否存在未解决的问题或阻碍？

3. **提取关键信息**：
   - 确定主要讨论主题
   - 记录会议期间做出的决定
   - 标记任何分歧或担忧
   - 确定行动项、负责人和截止日期

4. **创建结构化总结**：使用以下模板：

   ```
   ## Meeting Summary

   **Date & Time**: [Date and start/end time]

   **Participants**: [Full names and roles, if available]

   **Topic**: [Short title—what was the meeting about?]

   **Summary**

   - **Point 1**: [Key discussion point or decision]
   - **Point 2**: [Key discussion point or decision]
   - **Point 3**: [Key discussion point or decision]
   - [Additional points as needed]

   **Action Items**

   | Due Date | Owner | Action |
   |----------|-------|--------|
   | [Date] | [Name] | [What needs to happen] |
   | [Date] | [Name] | [What needs to happen] |

   **Decisions Made**
   - [Decision 1]
   - [Decision 2]

   **Open Questions**
   - [Unresolved question 1]
   - [Unresolved question 2]
   ```

5. **使用易于理解的语言**：面向小学毕业生进行写作。使用简单的词语。避免使用术语，或对术语进行简短解释。

6. **优先保证清晰度**：重点关注：
   - 哪些决定会影响路线图或战略？
   - 每个人需要做什么？
   - 他们需要在什么时候完成？

7. **保存输出**：将其保存为 Markdown 文档：`Meeting-Summary-[date]-[topic].md`

## 注意事项

- 保持客观——总结讨论的内容，而不是个人观点
- 清晰地突出行动项，避免任何事项被遗漏
- 如果会议规模较大或内容复杂，可以考虑按主题将要点分成不同部分
- 使用“我们”的表达方式，保持团队包容、协作的氛围