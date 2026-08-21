---
name: book-to-skill
description: "Converts books, documentation folders, and source collections (PDF, EPUB, DOCX, HTML, Markdown, RST, AsciiDoc, RTF, MOBI/AZW) into structured agent skills — extracting named frameworks, principles, techniques, and anti-patterns into a master SKILL.md plus on-demand chapter files, a glossary, a patterns file, and a decision cheatsheet. Use when the user wants to study a document with an agent, apply an author's frameworks while working, turn internal docs or standards into a reusable knowledge base, or package a compiled book skill as a claude-skills plugin."
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: engineering
  updated: 2026-08-05
---
# 图书到技能转换器

通过提取**结构**而非摘要，将书面知识转化为智能体技能。

一本书是专业知识的结晶：其中的框架、原则和技巧往往历经多年才得以形成。读过一次，随后遗忘。各种变通方法都不起作用——PDF 搜索返回的是页码而非答案；把原始文件直接交给智能体，会导致它产生幻觉或淹没在信息中；阅读笔记则会逐渐失效。此技能会将来源编译为一个可供智能体按需加载的知识库：包含一个精简的常驻核心，每次只加载一个章节文件，从此再也不必加载整本书。

**它会生成：**

| 文件 | 内容 | 预算 |
|------|----------|--------|
| `SKILL.md` | 核心框架 + 章节索引 + 主题索引 | < 4,000 个 token（常驻） |
| `chapters/chNN-*.md` | 每章一份摘要 | 800–3,000 个 token，按需加载 |
| `glossary.md` | 按字母顺序排列的所有重要术语，并注明章节 | < 1,500 个 token |
| `patterns.md` | 技巧和设计模式，以及相应的权衡 | < 2,000 个 token |
| `cheatsheet.md` | 决策规则、阈值、权衡矩阵 | < 1,200 个 token |

**不止适用于图书：**任何被频繁引用、值得记忆的内容——内部文档、品牌体系、标准、规范、研究资料集、一整套 RFC 文件。

---

## 理念

**提取结构，而非摘要。** 技能不是读书报告。它应是一套工具箱，包含有名称的框架、可执行的原则、分步骤的技巧、反模式，以及作者独特的表达风格。

**保留作者的精确表述。** 框架名称就是接口。“The 5 Whys”不能替换成“多问几次为什么”——正是准确的表述让检索能够正常工作。

**合理设置内容层次与深度。** 内容单薄的书对应精简的技能。包含十五个框架的书则需要章节文件和真正的主题索引。

**绝不要大篇幅复现来源内容。** 这些是结构化笔记。应进行综合、压缩和命名——不要复制原文段落。参见 `references/rights_and_provenance.md`。

---

## 模式

| 模式 | 触发条件 | 执行范围 |
|------|---------|------|
| **1. 完整转换**（默认） | 一个或多个路径，没有特殊指令 | 步骤 0–10 |
| **2. 仅分析** | “analyze”“just extract”“let me review first” | 执行步骤 0–3，然后输出提取报告并停止 |
| **3. 根据分析结果生成** | 用户提供先前的分析笔记 | 步骤 4–10 |
| **4. 更新 / 合并** | 新来源 + 一个现有的已编译技能 | 执行步骤 0–2，然后进入更新工作流 |
| **5. 打包为插件** | “make it a plugin”“add it to the repo” | 步骤 11 |

模式 5 是此仓库新增的功能。上游流程止于个人技能主目录中的一个普通文件夹；步骤 11 会将该文件夹封装为插件包，以便其他技能和智能体将请求路由到它。

---

## 硬性规则

1. **绝不要转换用户无法向你展示的来源。** 不要通过网页抓取图书，也不要凭记忆重构某个书名。此工具只转换已经存储在磁盘上的文件。
2. **生成前必须预估成本**（步骤 2.5）。生成是开销最大的部分；用户需要在看到具体数字后批准。
3. **绝不要将大型来源整体载入上下文。** 超过约 50k 个 token 时，应使用 `grep`/`sed` 和有限范围读取进行探查（步骤 2.6）。针对每个章节都重新读取一次一本 200 页的书，其成本会超过此工作流中其他所有步骤的总和。
4. **在任何人加载之前进行验证**（步骤 9.5）。生成的技能是不受信任的文本，之后会被智能体作为指令读取。
5. **绝不要扩大所生成技能的权限范围。** 生成的 frontmatter 只能包含 `name` 和 `description`——不得包含 `allowed-tools`，也不得包含模型调用标志。
6. **重新分发前先确认权利。** 根据受版权保护作品编译而成的笔记属于个人学习笔记。将其打包为可共享的插件，需要说明相应依据（步骤 11）。
7. **明确说明该技能未涵盖的内容。** 每个已编译技能的范围部分都必须注明其边界，以便智能体回答“来源未涵盖此内容”，而不是自行发挥。

---

## 流程

```
extract_document.py  →  analyze  →  chapter files  →  supporting files  →  SKILL.md
      (Step 2)          (Step 3)      (Step 7)          (Step 8)          (Step 9)
                                                                              ↓
                                       skill_plugin_emitter.py  ←  book_skill_validator.py
                                              (Step 11)                  (Step 9.5)
```

这四个工具均位于 `scripts/` 中，并且只依赖标准库运行。

---

## 运行方式

```bash
SKILL_ROOT=engineering/book-to-skill/skills/book-to-skill
SKILLS_HOME=~/.claude/skills        # Step 5 picks this; see the workflow reference
WORKDIR=$(mktemp -d)                # or omit --workdir and capture the path it prints
SLUG=<author-lastname>-<concept>

# 1. extract → $WORKDIR/full_text.txt + metadata.json
#    --mode technical when tables, code or formulas carry meaning
python3 "$SKILL_ROOT/scripts/extract_document.py" <paths> --mode text --workdir "$WORKDIR"

# 2. pre-flight: is this worth converting at all? Wait for approval before generating.
python3 "$SKILL_ROOT/scripts/token_budget_estimator.py" --full-text "$WORKDIR/full_text.txt"

# 3. generate — the agent's work: chapters/, glossary, patterns, cheatsheet, SKILL.md

# 4. gate — errors block. Fix and re-run; never rewrite around a finding.
python3 "$SKILL_ROOT/scripts/book_skill_validator.py" "$SKILLS_HOME/$SLUG"
python3 "$SKILL_ROOT/scripts/token_budget_estimator.py" --skill-dir "$SKILLS_HOME/$SLUG"

# 5. optional: wrap as a claude-skills plugin so the library can route to it
python3 "$SKILL_ROOT/scripts/skill_plugin_emitter.py" --skill-dir "$SKILLS_HOME/$SLUG" \
    --dest ./engineering --source-note "<Title> by <Author>" --dry-run
```

以上每个路径都是真实变量，而非占位符：按原样运行该代码块（填写
`<paths>` 和 `$SLUG`）即可端到端完成整个流程。如果不指定 `--workdir`，提取器
会创建一个私有临时目录并将其路径输出——请改为捕获该路径。

`extract_document.py --check` 会报告已安装哪些提取器，并针对缺失的提取器输出安装
命令。每个工具都支持 `--help`、`--sample` 和 `--output json`。

**完整的分步流程——每一步要询问的内容、文件模板、每章预算矩阵以及更新/合并工作流——位于
[`references/conversion_workflow.md`](references/conversion_workflow.md) 中。请在
执行转换前阅读该文档。** 十一个步骤的摘要如下：

| 步骤 | 操作 |
|------|------|
| 0–1 | 检查范围；解析路径；检测是否要对现有 skill 进行更新/合并 |
| 1.5 | 询问内容类型 → `BOOK_TYPE`（技术类或文本类），以此选择提取器 |
| 2 | 提取 → `full_text.txt` + `metadata.json` |
| 2.5 | 转换前成本估算和是否值得转换的判断——**等待批准** |
| 2.6 | 超过约 50k tokens 时，使用 `grep`/`sed` 探查，而不是读取源文件 |
| 3 | 分析结构（标题、作者、章节、主题）。模式 2 到此为止。 |
| 4 | 询问用途 → `DEPTH`（参考或学习）。切勿再次询问预算问题。 |
| 5 | 确定 skill 名称和目标根目录；发生冲突时提供更新 / 覆盖 / 重命名选项 |
| 6–8 | 创建结构；编写章节文件；编写术语表、模式和速查表 |
| 9 | 编写主 `SKILL.md`——少于 4,000 tokens，且索引保持完整 |
| 9.5 | 验证。错误会阻止继续执行。 |
| 10 | 清理工作目录并报告 |
| 11 | 可选择将其打包为插件，但须通过权利门禁 |

## 值得了解的验证器发现

| 规则 | 含义 |
|------|-------|
| `index.dead_link` | 章节索引链接到了一个从未写入的文件 |
| `index.topic_dangling` | 某个主题指向了一个不存在的章节 |
| SKILL.md 上的 `budget.over_cap` | 压缩将截断索引——导航是最先丢失的内容 |
| `unicode.invisible` | 提取过程本应将其剔除；请调查来源 |
| `frontmatter.allowed_tools` | 生成的技能正试图授予自身工具权限 |

安全类别的警告有意设置得较为宽泛——有关提示词注入的来源触发这些警告是合理的。
请结合上下文逐一阅读；不要自动将其静默处理。

## 关键问题库

在运行转换之前，逐一过一遍这些问题，并参考推荐答案。

1. **“这个来源值得转换吗，还是我直接阅读就好？”**
   *推荐：* 当来源大小超过编译后技能的 3 倍，**并且**你之后还会再次查阅它时，再进行转换。
   一次性阅读不经转换成本更低。（步骤 2.5 的判断。）

2. **“参考还是学习？”**
   *推荐：* 默认选择参考，除非你打算内化作者的推理方式。学习深度会使生成成本大致翻倍，
   只有存在真实完整示例时才值得这样做。（步骤 4。）

3. **“技术型还是文本型？”**
   *推荐：* 只有当表格、代码或公式承载了含义时，才选择技术型。Docling 的成本约为
   每页 1.5 秒；为一本纯文字书籍选择它不会带来任何收益。（步骤 1.5。）

4. **“你实际会向这个技能提出什么问题？”**
   *推荐：* 在生成前列出三个真实问题。它们会告诉你哪些内容应纳入
   核心框架，以及主题索引必须能够解析哪些内容。无人查询的技能，
   就是无人阅读的摘要。

5. **“你有权重新分发这些内容吗？”**
   *推荐：* 默认假设没有。除非来源属于公共领域、采用开放许可证、是你所在组织自己的文档，
   或者你拥有书面许可，否则请将其保留在本地。（步骤 11 的权利门禁。）

6. **“它是否应该与现有技能放在一起？”**
   *推荐：* 首先检查同一主题是否已有编译后的技能——将新来源合并进一个技能（模式 4），
   胜过两个各自只覆盖部分主题、又无法让代理判断该选哪一个的技能。（步骤 0。）

---

## 参考资料

- `references/conversion_workflow.md` — **完整流程**：步骤 0–11、文件模板、
  每章预算矩阵，以及更新/合并工作流
- `references/knowledge_extraction_canon.md` — 为什么结构优于摘要；提取分类法；
  什么能让框架在压缩后依然保留下来
- `references/progressive_disclosure_budgets.md` — 令牌预算的来源，以及超出预算时
  会出现哪些问题
- `references/document_extraction_pipeline.md` — 针对不同格式的提取器链、回退方案，
  以及会悄无声息地产生劣质文本的故障模式
- `references/rights_and_provenance.md` — 版权立场、权利门禁，以及编译后的技能
  必须携带哪些来源信息

## 相关技能

- **`engineering/write-a-skill`** — 根据你自己的专业知识编写技能。当知识在你的脑海中时，
  使用该技能；当知识在文档中时，使用本技能。
- **`engineering/skill-security-auditor`** — 对技能包进行全面安全审计。步骤 9.5
  是转换器自身的门禁；审计器则面向整个仓库。
- **`engineering/llm-wiki`** — 一个基于多个来源逐步扩展、相互链接的知识库。
  本技能将一组边界明确的来源编译为一个技能。

---

*改编自 [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill)（MIT）。
有关所有差异的完整列表，请参阅 `../../README.md`。*