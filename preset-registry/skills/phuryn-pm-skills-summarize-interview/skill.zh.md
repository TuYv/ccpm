---
name: summarize-interview
description: "Summarize a customer interview transcript into a structured template with JTBD, satisfaction signals, and action items. Use when processing interview recordings or transcripts, synthesizing discovery interviews, or creating interview summaries."
---
## 总结客户访谈

将访谈文字稿转换为结构化摘要，重点关注待完成的任务、满意度和行动项。

### 上下文

你正在为 **$ARGUMENTS** 的产品探索总结一次客户访谈。

用户将提供一份访谈文字稿——可以是附件（文本、PDF、音频转录稿），也可以直接粘贴。请先阅读所有附件。

### 指示

1. 在总结前仔细阅读完整的文字稿。

2. 填写下面的摘要模板。如果信息不可用，请使用 “-”。如有需要，可将数值替换为定性描述（例如“并不满意”）。

3. 使用清晰、简单的语言——小学毕业生也应该能够看懂摘要。

### 输出模板

```
**Date**: [Date and time of the interview]
**Participants**: [Full names and roles]
**Background**: [Background information about the customer]

**Current Solution**: [What solution they currently use]

**What They Like About Current Solution**:
- [Job to be done, desired outcome, importance, and satisfaction level]

**Problems With Current Solution**:
- [Job to be done, desired outcome, importance, and satisfaction level]

**Key Insights**:
- [Unexpected findings or notable quotes]

**Action Items**:
- [Date, Owner, Action — e.g., "2025-01-15, Paweł Huryn, Follow up with customer about pricing"]
```

将摘要保存为 Markdown 文档，存放在用户的工作区中。

---

### 延伸阅读

- [用户访谈：研究访谈终极指南](https://www.productcompass.pm/p/interviewing-customers-the-ultimate)
- [持续产品探索大师班（CPDM）](https://www.productcompass.pm/p/cpdm)（视频课程）