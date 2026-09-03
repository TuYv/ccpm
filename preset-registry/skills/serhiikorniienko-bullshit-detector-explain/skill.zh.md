---
name: explain
description: Explain content or any concept inside it at the depth the user needs — ELI5, practitioner level, or expert deep-dive — with a jargon glossary and context the original assumes. Use when the user says "explain this", "what does X mean here", "break this down", "I don't understand this part", or shares content and asks how something in it works.
---
# explain

让内容变得易于理解，但不以不诚实的方式过度简化。

## 工作流程

1. **获取文本**（如果是 URL，则通过 `fetch-content` 技能脚本获取，否则通过网络抓取或粘贴）。
2. **选择深度**——依据用户的请求；如果确实不清楚，则提出一个简短的问题：
   - **ELI5**——使用类比，零术语，只讲核心机制
   - **Practitioner**——假设读者具备一般技术素养，聚焦于它如何运作以及能拿它做什么
   - **Deep dive**——机制、边界情况、历史、相互竞争的观点
3. **进行解释**，按如下结构组织：
   - 先给出一句话版本
   - 机制：它实际上是如何一步步运作的
   - **术语表**：内容中使用却未加定义的每个术语，各占一行
   - **内容默认你已知的东西**——即那些造成困惑的缺失的前置知识
   - 如果内容自身的解释有错误或过度简化——指出来，而不是重复它

## 规则

- 解释 ≠ 认同。如果内容的论断存在争议，既要给出解释，*也*要注明争议所在（“视频声称 X；而标准观点是 Y”）。
- 类比必须经得起推敲——要指出类比在何处失效。
- 如果用户指向某个特定片段（“12:30 处的那部分”、“第 3 节”），要在整体的语境中解释该片段，而不是孤立地解释。
- 不要注水：三句话能讲清的概念就只写三句话。
