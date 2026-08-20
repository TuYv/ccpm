---
name: documentation
description: Use when writing blog posts or documentation markdown files - provides writing style guide (active voice, present tense), content structure patterns, and SEO optimization. Overrides brevity rules for proper grammar.
---
# 文档编写技能

此技能为处理文档的 AI 编码助手提供全面的指南。

## 何时使用

- 添加新的插件、功能或选项
- 更改插件行为或 API 签名
- 修复影响代码生成的错误
- 编写或更新功能、组件或可组合函数文档
- 针对搜索引擎优化文档

## 功能

- 创建清晰、简洁、实用，并针对开发者体验优化的文档
- 针对搜索引擎和开发者意图优化内容
- 组织内容结构，最大限度地提高可浏览性和吸引力

## 写作标准

**覆盖规则**：编写文档时，应使用正确的语法和完整的句子。此处不适用“为简洁而牺牲语法”的规则。

文档必须：

- 语法正确
- 清晰且无歧义
- 标点使用恰当
- 使用完整的句子（而非句子片段）

仍应重视简洁性，但绝不能以牺牲清晰度或正确性为代价。

## 可用参考资料

| 参考资料                                                                                              | 用途                                         |
|--------------------------------------------------------------------------------------------------------| ----------------------------------------------- |
| **[../documentation/references/writing-style.md](./../documentation/references/writing-style.md)**     | 语言风格、语气、句子结构                 |
| **[../documentation/references/content-patterns.md](../documentation/references/content-patterns.md)** | 使用模式、props 结构、组件模式 |
| **[../documentation/references/seo-optimization.md](../documentation/references/seo-optimization.md)** | SEO 最佳实践、标题、描述、关键词、常见问题 |
| **[../documentation/references/humanizer.md](../documentation/references/humanizer.md)**               | 消除 AI 写作模式，增强语言风格和具体性 |

**根据上下文加载：**

- 撰写正文 → [../documentation/references/writing-style.md](../documentation/references/writing-style.md)
- Props、选项、使用模式 → [../documentation/references/content-patterns.md](../documentation/references/content-patterns.md)
- 针对搜索进行优化 → [../documentation/references/seo-optimization.md](../documentation/references/seo-optimization.md)
- 审阅或编辑已完成的正文 → [../documentation/references/humanizer.md](../documentation/references/humanizer.md)

## 语言和语气

- 使用美式拼写。例如，使用 license，而非 licence。

## 命名约定

- **使用 kebab-case**：`how-to-do-thing.md`
- **名称应具有描述性**：使用 `multipart-form-data.md`，而非 `form.md`
- **与 URL 结构保持一致**：文件名会成为 URL 路径

### 写作模式

| 模式       | 示例                                                 |
| ------------- |---------------------------------------------------------|
| 主语优先 | “`useApp` 可组合函数负责处理与 Fabric 相关的逻辑。” |
| 祈使句    | “将以下内容添加到 `config.ts`。”                |
| 上下文相关    | “使用 TypeScript 时，请配置……”              |

### 情态动词

| 动词     | 含义     |
| -------- | ----------- |
| `can`    | 可选    |
| `should` | 推荐 |
| `must`   | 必须    |

### 组件模式（何时使用）

| 需求              | 组件                           |
| ----------------- |-------------------------------------|
| 补充信息        | `> [!NOTE]`                         |
| 建议        | `> [!TIP]`                          |
| 警告           | `> [!WARNING]`                      |
| 必须遵守          | `> [!IMPORTANT]`                    |
| 多源代码 | `::: code-group`，并以 `:::` 结尾 |

## 标题

- **H1 (`#`)**：不使用反引号
- **H2-H4**：可以使用反引号

## 链接和交叉引用

- **内部链接**：使用相对路径：`/plugins/plugin-ts/`
- **锚点链接**：链接到特定章节：`/plugins/plugin-ts/#output-path`
- **外部链接**：使用完整 URL 和描述性文本
- **位置**：在文档最末尾添加链接章节

## 图片和资源

- **位置**：`docs/public/`
- **引用**：使用相对于 Markdown 文件的路径
- **格式**：使用优化后的格式（`webp`/`png`/`jpg`）
- **大小**：将文件大小控制在合理范围内
- **命名**：使用描述性名称：`plugin-react-query-example.png`

## 检查清单

- [ ] 使用主动语态（85% 以上）
- [ ] 使用现在时
- [ ] 每段 2-3 句话
- [ ] 先解释，再给出代码
- [ ] 验证 frontmatter 语法
- [ ] 执行人性化润色：去除 AI 写作模式，增添个性化表达和具体细节