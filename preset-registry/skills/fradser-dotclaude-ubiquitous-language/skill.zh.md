---
name: ubiquitous-language
description: Extract a DDD-style ubiquitous language glossary from the current conversation, flagging ambiguities and proposing canonical terms. Saves to UBIQUITOUS_LANGUAGE.md. Use when user wants to define domain terms, build a glossary, harden terminology, create a ubiquitous language, or mentions "domain model" or "DDD".
disable-model-invocation: true
---
# 通用语言

从当前对话中提取领域术语并将其形式化为一致的术语表，保存到本地文件。

## 流程

1. **扫描对话**，查找与领域相关的名词、动词和概念
2. **识别问题**：
   - 同一个词被用于不同概念（歧义）
   - 不同的词被用于同一个概念（同义词）
   - 含义模糊或承载过多含义的术语
3. **提出一份规范术语表**，明确选定推荐术语
4. **写入工作目录中的 `UBIQUITOUS_LANGUAGE.md`**，使用下方格式
5. **在对话中直接输出摘要**

## 输出格式

写入一个具有以下结构的 `UBIQUITOUS_LANGUAGE.md` 文件：

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

- **要有明确立场。** 当多个词表示同一个概念时，选择最合适的一个，并将其他词列为应避免使用的别名。
- **明确标记冲突。** 如果对话中某个术语存在歧义，请在「已标记的歧义」部分指出，并给出明确建议。
- **只包含与领域专家相关的术语。** 跳过模块或类的名称，除非它们在领域语言中具有实际含义。
- **定义应简洁。** 最多一句话。定义它是什么，而不是它做什么。
- **展示关系。** 使用加粗的术语名称，并在基数关系明确时予以表达。
- **只包含领域术语。** 跳过通用编程概念（数组、函数、端点），除非它们具有特定于领域的含义。
- **自然形成聚类时，将术语分到多个表格中**（例如按子领域、生命周期或参与者分组）。每个分组都应有自己的标题。如果所有术语都属于一个统一的领域，使用一个表格即可——不要强行分组。
- **编写一段示例对话。** 编写一段开发者与领域专家之间的简短对话（3–5 轮），展示这些术语如何自然地相互关联。对话应阐明相关概念之间的边界，并展示术语的准确用法。

<example>

## 示例对话

> **开发者：**“不使用 Docker 时，如何测试**同步服务**？”

> **领域专家：**“提供**文件系统层**而不是 **Docker 层**。它实现了相同的**沙箱服务**接口，但使用本地目录作为**沙箱**。”

> **开发者：**“所以 **sync-in** 仍然会创建一个**包**并将其解包吗？”

> **领域专家：**“没错。**同步服务**并不知道自己在与哪个层交互。它会调用 `exec` 和 `copyIn`——**文件系统层**只会将它们作为本地 shell 命令运行。”

</example>

## 再次运行

在同一对话中再次调用时：

1. 读取现有的 `UBIQUITOUS_LANGUAGE.md`
2. 纳入后续讨论中的所有新术语
3. 如果理解有所演变，则更新定义
4. 重新标记所有新的歧义
5. 重写示例对话以纳入新术语