---
name: ubiquitous-language
description: Extract a DDD-style ubiquitous language glossary from the current conversation, flagging ambiguities and proposing canonical terms. Saves to UBIQUITOUS_LANGUAGE.md. Use when user wants to define domain terms, build a glossary, harden terminology, create a ubiquitous language, or mentions "domain model" or "DDD".
disable-model-invocation: true
---
# 通用语言

从当前对话中提取并规范化领域术语，形成一致的术语表，并将其保存到本地文件。

## 处理流程

1. **扫描对话**，提取领域相关的名词、动词和概念
2. **识别问题**：
   - 同一词语用于不同概念（歧义）
   - 不同词语用于同一概念（同义词）
   - 模糊或含义过载的术语
3. **提出一个统一的术语表**，并给出明确的术语选择
4. 使用以下格式将其写入工作目录下的 `UBIQUITOUS_LANGUAGE.md`
5. 在对话中**内联输出摘要**

## 输出格式

Write a `UBIQUITOUS_LANGUAGE.md` file with this structure:

```md
# Ubiquitous Language

## Order lifecycle

| Term        | Definition                                              | Aliases to avoid      |
| ----------- | ------------------------------------------------------- | --------------------- |
| **Order**   | A customer's request to purchase one or more items      | Purchase, transaction |
| **Invoice** | A request for payment sent to a customer after delivery | Bill, payment request |

## People

| Term         | Definition                                  | Aliases to avoid       |
| ------------ | ------------------------------------------- | ---------------------- |
| **Customer** | A person or organization that places orders | Client, buyer, account |
| **User**     | An authentication identity in the system    | Login, account         |

## Relationships

- An **Invoice** belongs to exactly one **Customer**
- An **Order** produces one or more **Invoices**

## Example dialogue

> **Dev:** "When a **Customer** places an **Order**, do we create the **Invoice** immediately?"
> **Domain expert:** "No — an **Invoice** is only generated once a **Fulfillment** is confirmed. A single **Order** can produce multiple **Invoices** if items ship in separate **Shipments**."
> **Dev:** "So if a **Shipment** is cancelled before dispatch, no **Invoice** exists for it?"
> **Domain expert:** "Exactly. The **Invoice** lifecycle is tied to the **Fulfillment**, not the **Order**."

## Flagged ambiguities

- "account" was used to mean both **Customer** and **User** — these are distinct concepts: a **Customer** places orders, while a **User** is an authentication identity that may or may not represent a **Customer**.
```

## 规则

- **要有主见。** 当同一概念有多个词汇时，选择最合适的词，并将其他词列为应避免的别名。
- **明确标记冲突。** 如果某术语在对话中被歧义使用，请在“标记歧义”部分明确指出并给出清晰建议。
- **仅包含领域专家相关术语。** 跳过模块名或类名，除非其在领域语言中具有含义。
- **保持定义简洁。** 最多一句话。定义要说明它是什么，而不是它做什么。
- **展示关系。** 使用粗体术语名，并在关系明确时表达基数。
- **仅包含领域术语。** 跳过通用编程概念（array、function、endpoint），除非它们具有领域特定含义。
- **按自然分组。** 当自然聚类出现时（如按子域、生命周期或角色）可拆分为多个表，每个分组使用独立标题和表格；如果所有术语属于同一整体领域，则使用单表即可，不必强行拆分。
- **编写示例对话。** 提供一个 3 到 5 轮的简短对话（开发者与领域专家），展示术语如何自然交互，澄清相关概念边界并精确使用术语。

<example>

## 示例对话

> **开发者：** “如果不使用 Docker，我该如何测试 **sync service**？”
> **领域专家：** “提供 **filesystem layer** 而不是 **Docker layer** 即可。它实现了相同的 **Sandbox service** 接口，但将 **sandbox** 实现为本地目录。”
> **开发者：** “那 **sync-in** 仍然会创建并解包 **bundle** 吗？”
> **领域专家：** “没错。**sync service** 不会关心在与它通信的是哪个层，它会调用 `exec` 和 `copyIn`，而 **filesystem layer** 只是将这两个操作当成本地 shell 命令执行。”

</example>

## 重新运行

在同一对话中再次调用时：

1. 读取现有的 `UBIQUITOUS_LANGUAGE.md`
2. 纳入后续讨论中的新术语
3. 若理解发生变化则更新定义
4. 重新标记新增歧义
5. 重写示例对话，以纳入新术语
