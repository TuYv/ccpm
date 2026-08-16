---
name: writing-fragments
description: Explore-phase writing — mines raw fragments without committing to structure. Use when the user wants to brainstorm material or gather fragments for a later article.
disable-model-invocation: true
---
<what-to-do>

这是纯粹的**探索**：拓宽可能写下的内容空间，而不对结构做出承诺——做出承诺属于_利用_，是另一项技能的工作。进行一场持续追问的访谈，围绕用户想写的任何内容穷追不舍，产出各种片段。强加阶段、提纲或文章结构不在此处的职责范围内。

随着对话任一方产出片段，将它们追加到同一个 markdown 文件中。

如果用户没有传入路径，只询问一次文档保存位置，然后在会话剩余时间里记住它。

从用户说的第一句话开始捕捉片段，包括初始提示。

首次写入时，在顶部放置一个带有暂定标题的单独 H1（之后可以修改），除此之外不要放任何内容——不要元数据，不要 TOC，不要日期。

</what-to-do>

<supporting-info>

## 什么是片段

片段是任何可能保留到最终文章中的文本。它必须_能让作者读懂_——作者能明白它的意思——但不需要定义其中的术语，也不需要让毫无背景的读者理解。判断标准是“这是不是一段好文字？”，而不是“这是一个自成一体的论点吗？”

片段本来就可以各不相同。可能成为片段的内容示例：

- 一句你想在某处用上、但还不知道该放在哪里的犀利话语。
- 一个附有一句话理由的主张。
- 一个小故事：发生过的一件事、一段代码、一个场景、一个类比。
- 一个尚未成形的想法：“关于 X 如何让人感觉像 Y 的某些东西，以后再把它想清楚。”
- 一段引语、一小段对话、一句偶然听到的话。
- 一组凭感觉彼此关联的观察。
- 一句抱怨、一次坦白、一个包袱。
- 一个**引领词**——一种精炼的隐喻或新造词，整篇文章都可以围绕它展开（用一个术语命名某种观念，就像 _tracer bullets_ 或 _fog of war_ 命名了一整套模式）。

其中，引领词是最值得捕捉的片段。它起着承重作用：在探索阶段找到恰当的词，之后它就会塑造文章的结构、过渡和标题——在整个利用阶段持续带来回报。当对话反复围绕某个观念打转时，推动用户为它创造一个词。

以小说家的日记为范本：多年间积累的非结构化见闻，之后从中开采原始素材。片段就是这些见闻。

## 文件格式

```markdown
# Working title

A first fragment lives here.

It can be multiple paragraphs. It can include lists, code, quotes — whatever
shape the fragment naturally takes.

---

A second fragment.

---

> A quoted line that the user wants to keep around.

A reaction to it.

---

- A cluster of related observations
- That hang together by feel
- And want to be near each other
```

片段之间用水平分隔线（`\n---\n`）隔开。正文中不要使用标题。不要使用标签。除添加顺序外，不做任何排序。

## 写作节奏

静默追加。不要为每个片段都询问许可。顺带提一下你添加了什么（“正在添加”），但不要用保存对话框打断对话。

每次写入前：都要从磁盘重新读取文件。用户可能在不同轮次之间编辑、重新排序或删除了片段——请保留他们的更改。绝不要覆盖文件；只能追加（或者，如果用户提出要求，则在原位置编辑指定片段）。

用户随时可能会说“删掉最后一个”“把那个重写得更犀利些”“合并那两个”。请将这些视为最高优先级的指令。

</supporting-info>