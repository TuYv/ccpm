---
name: lay-summary-for-cross-disciplinary-teams
description: >-
  Rewrites technical research content into a structured lay summary that
  cross-disciplinary teams can quickly understand and act on. Use when the
  user wants to explain research to colleagues outside their specialty —
  clinicians, wet-lab scientists, bioinformaticians, product managers, or
  leadership. Trigger on: "lay summary", "explain my research to the team",
  "non-technical summary", "cross-disciplinary summary", "translate my
  findings", "align our team on the study", or any request to communicate
  research goals, findings, or next steps to a mixed or non-specialist
  audience. Part of the AIPOCH Academic Writing skill hub. Sits midstream:
  after research content is clarified, before downstream deliverables like
  slide decks or graphical abstracts.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 面向跨学科团队的通俗摘要

将技术性研究转化为结构化摘要，使临床、湿实验室、生物信息学、产品和管理团队能够快速阅读并采取行动。

## 在研究流程中的位置

此技能位于流程**中游**：

- **上游**（应先具备）：明确的研究问题、清晰界定的目标、结构化结果、结果叙述
- **此技能**：将已厘清的内容转化为适合非专业读者阅读的表述
- **下游**（自然衔接的后续步骤）：实验室会议幻灯片、图形摘要生成器、审稿意见回复起草器

如果用户的研究内容仍然模糊或缺乏结构，应提示他们先明确目标和关键发现。基于不清晰输入撰写的通俗摘要可能读起来流畅，但事实表述并不精确——这比没有摘要更糟糕。

---

## 第 1 步 — 收集输入

请用户提供以下任意内容：
- 摘要、引言或结果部分
- 用自己的话概述的关键发现
- 研究总结或内部报告

还应询问：**主要受众是谁？**
- `mixed`（默认）— 上述所有团队
- `clinical` — 临床医生、医务人员
- `wet-lab` — 实验室科研人员、实验研究人员
- `bioinformatics` — 计算科学家、数据分析师
- `product` — 产品经理、转化团队
- `management` — 领导层、资助方、高管

如果未指定，则使用 `mixed`，并包含所有相关受众要点。

---

## 第 2 步 — 提取核心结构

在撰写之前，先在内部将输入映射到以下五个要素：

| 要素 | 需要确定的内容 |
|---|---|
| **研究目标** | 为什么要开展这项研究？它旨在解决什么问题？ |
| **系统／人群** | 研究了什么？（患者、细胞、数据集、样本……） |
| **主要发现** | 数据表明了什么？应具体说明，避免含糊的正面表述。 |
| **证据边界** | 这些证据能够支持什么？哪些方面仍不确定或未经检验？ |
| **下一步行动** | 基于此研究，每个团队应了解什么或采取什么行动？ |

如果输入中缺少任何要素，请在输出中注明，并邀请用户补充缺失信息。

---

## 第 3 步 — 撰写通俗摘要

使用 `assets/output-template.md` 中的输出模板。

写作原则：
- 不使用未解释的缩写——首次出现时给出定义，或将其删除
- 必须明确说明证据边界：区分研究发现与解读
- 针对每类受众的要点都应具有可操作性，而不仅仅是描述性内容
- 尽可能量化研究发现（“高 3 倍”“在 6 个亚型中的 4 个亚型中”）
- 摘要必须能够独立成篇，无需查阅原始论文即可理解

有关面向特定受众的语言指导，请阅读 `references/audience-guide.md`。

---

## 第 4 步 — 质量检查

在交付输出之前，请验证：

- [ ] 不存在未经解释的专业术语或未定义的缩写
- [ ] 研究发现表述准确——既未夸大，也未弱化
- [ ] 证据边界通过审慎措辞清晰表达
- [ ] 针对每类受众的要点均具有可操作性
- [ ] 不具备相关领域知识的人也能顺畅阅读并理解摘要

如果检查未通过，请在提交前修订。

---

## 参考资料

- `assets/output-template.md` — 标准的 6 节输出模板及示例
- `references/audience-guide.md` — 针对各类受众的语言和表述方式指南