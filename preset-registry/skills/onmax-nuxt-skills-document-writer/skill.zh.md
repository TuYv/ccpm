---
name: document-writer
description: Use when writing blog posts or documentation markdown files - provides writing style guide (active voice, present tense), content structure patterns, and MDC component usage. Overrides brevity rules for proper grammar. Use nuxt-content for MDC syntax, nuxt-ui for component props.
license: MIT
---
# Nuxt 生态系统文档撰写指南

遵循 Nuxt 官方网站的模式撰写博客文章和文档。

## 何时使用

- 为 Nuxt 生态系统项目撰写博客文章
- 创建或编辑文档页面
- 确保所有内容采用一致的写作风格

## 写作标准

**覆盖规则**：撰写文档时，应保持语法正确并使用完整句子。“为简洁而牺牲语法”的规则不适用于此处。

文档必须：

- 语法正确
- 清晰且无歧义
- 标点使用恰当
- 使用完整句子（而非句子片段）

仍应追求简洁，但绝不能以牺牲清晰度或正确性为代价。

## 相关技能

有关组件和语法的详细信息，请使用以下技能：

| 技能             | 用途                                            |
| ---------------- | ----------------------------------------------- |
| **nuxt-content** | MDC 语法、正文组件、代码高亮                    |
| **nuxt-ui**      | 组件属性、主题设置、UI 模式                     |

## 可用参考资料

| 参考资料                                                             | 用途                                            |
| -------------------------------------------------------------------- | ----------------------------------------------- |
| **[references/writing-style.md](references/writing-style.md)**       | 行文风格、语气、句子结构                        |
| **[references/content-patterns.md](references/content-patterns.md)** | 博客 frontmatter、结构、组件模式                |

## 加载文件

**请根据任务考虑加载以下参考文件：**

- [ ] [references/writing-style.md](references/writing-style.md) - 适用于撰写正文、改进行文风格或语气，或组织句子结构
- [ ] [references/content-patterns.md](references/content-patterns.md) - 适用于创建博客文章、设置 frontmatter 或使用 MDC 组件

**不要一次加载所有文件。** 只加载与当前任务相关的文件。

## 快速参考

### 写作模式

| 模式       | 示例                                               |
| ---------- | -------------------------------------------------- |
| 主语优先   | “`useFetch` 组合式函数负责处理数据获取。”          |
| 祈使句     | “将以下内容添加到 `nuxt.config.ts`。”              |
| 上下文引导 | “使用身份验证时，请配置……”                         |

### 情态动词

| 动词     | 含义     |
| -------- | -------- |
| `can`    | 可选     |
| `should` | 建议     |
| `must`   | 必须     |

### 组件模式（何时使用）

| 需求             | 组件                              |
| ---------------- | --------------------------------- |
| 补充信息         | `::note`                          |
| 建议             | `::tip`                           |
| 注意事项         | `::warning`                       |
| 必要事项         | `::important`                     |
| 行动号召         | `:u-button{to="..." label="..."}` |
| 多来源代码       | `::code-group`                    |

> 关于组件 props：请参阅 **nuxt-ui** skill

## 标题

- **H1（`#`）**：不要使用反引号——它们无法正确渲染
- **H2-H4**：可以正常使用反引号

## 工作流程

1. 加载相关的参考文件（撰写正文时使用 [writing-style.md](references/writing-style.md)，组织结构时使用 [content-patterns.md](references/content-patterns.md)）
2. 使用主动语态和一般现在时起草内容
3. 使用下方的检查清单验证质量——如果有任何一项未通过，请修改并重新检查
4. 验证提示框类型是否符合意图（note/tip/warning/important）

## 示例

```md
# Getting Started with Authentication

Nuxt Better Auth provides a simple way to add authentication to your application.
Configure the module in your `nuxt.config.ts` to get started.

::note
Authentication requires a database connection. See the [database setup](/docs/database) guide for details.
::

## Installation

Add the module to your project:

~~~bash [Terminal]
pnpm add @nuxtjs/better-auth
~~~

The module auto-imports the `useUserSession` composable. Access the current user session from any component.
```

## 检查清单

- [ ] 使用主动语态（85% 以上）
- [ ] 使用一般现在时
- [ ] 每段 2-4 句话
- [ ] 先解释，再给出代码
- [ ] 代码块包含文件路径标签
- [ ] 使用适当的提示框类型
- [ ] H1 标题中不使用反引号