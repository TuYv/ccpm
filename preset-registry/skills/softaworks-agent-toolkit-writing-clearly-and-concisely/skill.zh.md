---
name: writing-clearly-and-concisely
description: Use when writing prose humans will read—documentation, commit messages, error messages, explanations, reports, or UI text. Applies Strunk's timeless rules for clearer, stronger, more professional writing.
---
# 写作清晰简洁

## 概述

写作要有清晰度和力量感。本技能涵盖该做什么（Strunk 的规则）以及不该做什么（AI 写作模式）。

## 何时使用本技能

凡是为人写作时都应使用本技能：

- 文档、README 文件、技术说明
- 提交信息、拉取请求描述
- 错误信息、界面文案、帮助文本、注释
- 报告、摘要或任何说明性文字
- 为提升清晰度而进行的编辑

**只要你写的句子是给人读的，就使用本技能。**

## 上下文有限时的策略

当上下文紧张时：

1. 凭借自己的判断写出初稿
2. 派出一个子代理（subagent），把初稿和相关章节文件发给它
3. 让子代理进行文字编辑并返回修改稿

只加载单个章节（约 1,000-4,500 token）而非全部内容，可以节省大量上下文。

## 《英文写作指南》

William Strunk Jr. 的*《英文写作指南》（The Elements of Style）*（1918）教你清晰写作、毫不留情地删减。

### 规则

**基础用法规则（语法/标点）**：

1. 单数名词所有格通过加 's 构成
2. 并列系列中除最后一项外，每项之后都加逗号
3. 插入语用逗号括起来
4. 引导并列分句的连词前加逗号
5. 不要用逗号连接独立分句
6. 不要把一个句子拆成两句
7. 句首的分词短语必须指向语法主语

**基础写作原则**：

8. 每段一个主题
9. 段落以主题句开头
10. **使用主动语态**
11. **以肯定形式陈述**
12. **使用明确、具体、实在的语言**
13. **删去多余的词**
14. 避免连用松散的句子
15. 用相似的形式表达并列的观点
16. **把相关的词放在一起**
17. 摘要中保持同一时态
18. **把需要强调的词放在句末**

### 参考文件

以上规则提炼自 Strunk 的原文。如需带示例的完整解释：

| 章节 | 文件 | 约合 Token 数 |
|---------|------|---------|
| 语法、标点、逗号规则 | `02-elementary-rules-of-usage.md` | 2,500 |
| 段落结构、主动语态、简洁性 | `03-elementary-principles-of-composition.md` | 4,500 |
| 标题、引用、格式 | `04-a-few-matters-of-form.md` | 1,000 |
| 用词选择、常见错误 | `05-words-and-expressions-commonly-misused.md` | 4,000 |

**大多数任务只需要 `03-elementary-principles-of-composition.md`** —— 它涵盖主动语态、肯定形式、实在语言以及删去多余的词。

## 应避免的 AI 写作模式

大语言模型会向统计均值退化，产出泛泛而谈、浮夸空洞的文字。避免：

- **浮夸用语：** pivotal、crucial、vital、testament、enduring legacy
- **空洞的 "-ing" 短语：** ensuring reliability、showcasing features、highlighting capabilities
- **宣传式形容词：** groundbreaking、seamless、robust、cutting-edge
- **被 AI 用滥的词汇：** delve、leverage、multifaceted、foster、realm、tapestry
- **格式滥用：** 过多的项目符号、表情符号装饰、隔词加粗

要具体，不要浮夸。直说它实际做了什么。

关于这些模式为何出现的一份全面研究，参见 `signs-of-ai-writing.md`。这份指南由维基百科编辑为检测 AI 生成的投稿而编写——其中的模式记录详尽，并经过实践检验。

## 结论

写作是给人看的？从 `elements-of-style/` 加载相关章节并应用这些规则。对于大多数任务，`03-elementary-principles-of-composition.md` 涵盖了最重要的内容。
