---
name: slides-creator
description: Narrative-first slide deck creation. Guides users through structured narrative design (ABCDEFG model), then delegates visual generation to baoyu-slide-deck. Triggers on "create slides", "make a presentation", "generate deck", "slide deck", "PPT", or when user needs to turn content into visual slides.
context: fork
agent: general-purpose
---
# 幻灯片创建器

**叙事优先的幻灯片制作。**

此技能专注于机器无法完成的工作——与人类共同设计叙事——并将其余一切委托给最适合该任务的工具（`baoyu-slide-deck`）。

## 第一法则：用户的声音至上

**这是优先级最高的规则。任何规则都不能凌驾于它之上。**

> AI 无法替用户创作高质量内容。它只能帮助用户更好地表达自己的内容。
>
> **第 1 步始终是：收集用户的原话。**包括他们的演讲实录、文章、笔记和声音。没有用户源材料的 AI 生成内容就是垃圾——精致、看似可信，却毫无用处的垃圾。
>
> **权重层级**：用户自己的话 > 用户认可的外部材料 > AI 综合 > AI 创作。
>
> 输出必须听起来像是处于最佳状态下的用户本人。是他们能够以自己的声音自信地说出来的内容。

**推论**：如果用户没有现成内容，你的工作就是通过结构化对话帮助他们阐明自己的想法——而不是替他们编造内容。

**推论**：外部材料（文章、参考资料）必须呈现给用户，由用户选择和验证。AI 不决定哪些内容相关。用户决定。

**参见**：`references/content-creation-first-law.md`，了解完整原则、该原则在所有内容类型中的应用以及失败模式。

## 架构

```
slides-creator (this skill)
├── Phase 0: Source Collection    ← Gather user's original words
├── Phase 1: Narrative Design     ← Human expertise + ABCDEFG discussion
├── Phase 2: Content Structuring  ← Convert narrative to machine-readable input
├── Phase 3: Delegate to baoyu-slide-deck
│   ├── --prompts-only  → outline + prompts
│   └── --images-only   → images + PPTX + PDF
└── Phase 6: Post-processing      ← Directory reorg + speaker notes extraction
```

**规则**：如果 `baoyu-slide-deck` 能完成某件事，我们就调用它。我们只做 baoyu-slide-deck 无法完成的工作：叙事讨论、ABCDEFG 方法论，以及采用用户偏好的目录结构。

---

## 阶段 0：源材料收集

**关键要求**：在收集到用户源材料之前，不要进入阶段 1。

**目标**：收集用户自己的话以及他们认可的外部参考资料。

### 步骤 0.1：请求用户提供原创内容

向用户索取：
- 他们以往演讲、会议或讨论的**文字记录**
- 他们撰写或认可的**文章**
- 他们准备的**笔记**或草稿
- 他们以往演示过的**幻灯片**
- **语音备忘录**或任何已录制的想法

如果这些材料都不存在，则进入阶段 1，但需要明确：必须通过结构化对话，从用户头脑中提取完整叙事。

### 步骤 0.2：收集外部参考资料（可选）

- 搜索相关的外部材料（文章、报告、参考资料）
- **将搜索结果呈现给用户选择**——不要擅自假定其相关性
- 仅纳入用户明确认可的材料

### 步骤 0.3：整理源材料

将所有源材料保存至 `00-上游/`（根目录或 `source-materials/` 子目录均可）：
```
00-上游/
├── prompt-最初提示词.txt       # 用户原始 prompt（如有）
├── narrative-brief.md          # Phase 1 输出
├── content.md                  # Phase 2 输出（baoyu 输入）
├── style-instructions.md       # 视觉设计 SSOT
├── outline.md                  # 来自 baoyu-slide-deck
├── source-materials/           # （可选子目录）
│   ├── user-transcript-1.md
│   ├── user-article-2.md
│   ├── user-notes-3.md
│   └── external-ref-4.md (user-approved)
```

**注意**：对于已有项目，源文件可直接放在 `00-上游/` 根目录；新建议项目时可用 `source-materials/` 子目录保持整洁。

**自检**：我们是否掌握了用户自己的原话？如果没有，我们是否已准备好通过对话提取所有内容？绝对不要编造内容。

---

## 阶段 1：叙事结构讨论

**关键要求**：此阶段绝对不要生成任何文件。只进行讨论。

**目标**：在开始任何视觉设计工作之前，就叙事脉络、情感历程和幻灯片层面的逻辑达成一致。

**原则**："你不要直接去写，你应该跟我讨论"

**输入**：阶段 0 的源材料。本次讨论中的每一项洞察都必须以用户自己的原话或其明确批准的参考资料为依据。

### 讨论框架（ABCDEFG 模型）

| 步骤 | 问题 | 目的 |
|------|----------|---------|
| A | **注意力** | 如何在前 30 秒吸引观众？ |
| B | **收益** | 承诺让观众获得什么？ |
| C | **可信度** | 观众为什么应该信任我们？ |
| D | **差异** | 有哪些反常识或新颖的视角？ |
| E | **证据** | 有哪些证据、演示或故事可以支持这一点？ |
| F | **框架** | 我们希望观众最终记住什么思维模型？ |
| G | **行动** | 他们在周一早上应该采取什么行动？ |

### 必需输入

如缺失，请询问用户：
- **主题**：这场演讲讲什么？（1 句话）
- **受众**：听众是谁？（技术水平、角色、情境）
- **时长**：演讲多长时间？
- **关键信息**：他们必须记住什么？（最多 3 条）
- **基调**：教育型？说服型？挑衅型？鼓舞型？
- **现有内容**：文章、转录稿、笔记、以前的演示文稿？
- **限制条件**：必须使用的内容？需要避开的话题？品牌指南？

### 讨论检查清单

1. **开场策略**：震撼？故事？提问？演示？
2. **叙事脉络**：张力在哪里？何时释放？
3. **过渡逻辑**：每张幻灯片如何引出下一张？
4. **“唯一要点”**：如果他们忘记了其他所有内容，唯一必须记住的是什么？
5. **行动号召**：演讲结束后，他们应该做什么？

### 需要指出的反面模式

- ❌ 相对于演讲时长，幻灯片过多（拥挤、仓促）
- ❌ 未交代背景便直接进入细节
- ❌ 缺乏情感脉络（平淡、难以记住）
- ❌ 结尾没有明确要点
- ❌ 试图一次教授过多内容

### 验证

用 3-5 个要点总结已达成一致的叙事脉络。在进入阶段 2 之前，获得用户的明确确认。

**自检**：我们进行讨论了吗？还是直接开始生成了？如果是后者，请退回上一步。

---

## 阶段 2：内容结构化

**目标**：生成两个可供 baoyu-slide-deck 使用的 SSOT 文件。

### 2.1 创建 `narrative-brief.md`

存储在 `00-上游/` 中：

```markdown
# Narrative Brief

**Topic**: [Topic name]
**Audience**: [description]
**Duration**: [N min]
**Language**: [zh/en/etc]
**Tone**: [educational/persuasive/provocative/inspirational]
**Key Messages**: (3 max)
1. ...
2. ...
3. ...

## ABCDEFG Arc

| Step | Answer |
|------|--------|
| A - Attention | ... |
| B - Benefit | ... |
| C - Credibility | ... |
| D - Difference | ... |
| E - Evidence | ... |
| F - Framework | ... |
| G - Go | ... |

## Slide Count Recommendation

| Duration | Recommended | Max |
|----------|-------------|-----|
| 10-15 min | 8-12 | 12 |
| 20-30 min | 12-18 | 20 |
| 30-45 min | 15-25 | 28 |
| 45-60 min | 20-30 | 35 |

**Recommended**: [N] slides for [duration] talk

## Content Sources

- [ ] Original user prompt saved
- [ ] Existing articles/notes/transcripts
- [ ] Previous decks

## Style Direction

[User's style preference or "to be decided in Phase 3"]
```

### 2.2 创建 `content.md`（用于 baoyu-slide-deck）

将叙事简报转换为 baoyu-slide-deck 输入格式：

```markdown
# [Title]

## Overview

[2-3 paragraph summary of the talk content]

## Key Points

1. [Point 1]
2. [Point 2]
3. [Point 3]

## Structure

### Opening ([duration])
[Hook content]

### Section 1: [Name] ([duration])
[Content]

### Section 2: [Name] ([duration])
[Content]

### Closing ([duration])
[CTA content]

## Audience
[Same as narrative-brief]

## Notes
[Any constraints or special requirements]
```

### 2.3 创建 `style-instructions.md`（可选）

如果用户有强烈的风格偏好，请在 `00-上游/` 中创建此 SSOT 文件：

```markdown
<STYLE_INSTRUCTIONS>
Design Aesthetic: [Description]

Background:
  Texture: [clean/grid/organic/etc]
  Base Color: [#HEX]

Typography:
  Headlines: [Style, size, color, weight]
  Body: [Style, size, color, weight]

Color Palette:
  Primary Text: [#HEX] - usage
  Body Text: [#HEX] - usage
  Background: [#HEX]
  Accent 1: [#HEX] - usage
  Accent 2: [#HEX] - usage
  Accent 3: [#HEX] - usage

Visual Elements:
  - [Element 1]
  - [Element 2]

Density Guidelines:
  - Max [N] text elements per slide
  - [Other rules]

Style Rules:
  Do: [List]
  Don't: [List]
</STYLE_INSTRUCTIONS>
```

**自检**：向用户复述 narrative-brief.md。在继续之前，确认其与阶段 1 的讨论一致。

**内容完整性检查**：`content.md` 中的每项主张、引语和示例都必须能够追溯至：
1. 用户自己的话（来自阶段 0 的源材料）
2. 用户批准的外部参考资料
3. 用户在阶段 1 讨论期间的明确陈述

AI 不得编造事实、引语或示例。如果是用户说过的，就使用它。如果用户没有说过，就询问他们。如果他们无法提供，则将其标记为 `[TODO: user to provide]`。

---

## 阶段 3：委派给 baoyu-slide-deck（提示词）

**目标**：使用 baoyu-slide-deck 生成大纲和提示词。

### 步骤 3.1：准备输入

确保 `content.md` 已准备就绪。如果存在 `style-instructions.md`，请记下该风格偏好，以便传递给 baoyu-slide-deck。

### 步骤 3.2：调用 baoyu-slide-deck

在 Claude Code 中调用 baoyu-slide-deck skill（两种等效方式）：

```
/baoyu-slide-deck 00-上游/content.md --prompts-only [--style <preset>]
```

或直接使用 Skill 工具（当 `/` 命令不可用时）：
```
Skill({"skill": "baoyu-slide-deck", "args": "00-上游/content.md --prompts-only [--style <preset>]"})
```

**调用前设置**：
1. **注入 narrative-brief**：将 `narrative-brief.md`（或其中的 ABCDEFG 叙事弧部分）追加到 `content.md` 顶部，使 baoyu 接收到的是叙事结构，而不仅仅是原始内容。
2. **注入已确认的选择**：在 `content.md` 开头添加一个包含已确认选择的元数据块。这可为 baoyu 的自动检测提供强信号，并降低确认期间发生风格漂移的概率：
   ```markdown
   <!-- CONFIRMED CHOICES — do not override without discussion -->
   - Style: [preset name or custom]
   - Audience: [audience from Phase 1]
   - Slide count: [N slides for X-min talk]
   - Language: [zh/en/etc]
   - Review preference: [skip outline / skip prompts / none]
   ```
3. **风格选择**：如果用户指定了 baoyu 预设 → 使用该预设；如果存在自定义 `style-instructions.md` → 使用 `--style custom`；否则自动检测。

**⚠️ 确认内容重叠警告**：baoyu-slide-deck 的 Step 2 会要求用户确认风格、受众、幻灯片数量、大纲审阅和提示词审阅。由于这些内容已在 Phase 1 中讨论过，**请指示用户沿用我们刚刚做出的选择**，而不是重新考虑。这可以避免用户因反复确认而感到疲惫，并防止风格偏移。

| 用户的描述 | baoyu 预设 |
|-------------------|--------------|
| 扁平卡通、技术解说 | `vector-illustration` 或 `bold-editorial` |
| 手绘教育风、信息图、流程 | `hand-drawn-edu` |
| 黑板、工作坊 | `chalkboard` 或 `sketch-notes` |
| 企业、B2B、投资者演示文稿 | `corporate` 或 `minimal` |
| 编辑风、杂志风、产品发布 | `bold-editorial` |
| 新闻报道、知识解说、科学传播 | `editorial-infographic` |
| 暗色、游戏、氛围感 | `dark-atmospheric` |
| 复古、像素、开发者演讲 | `pixel-art` |
| 水彩、生活方式、旅行 | `watercolor` |
| 蓝图、技术、建筑 | `blueprint` |
| 学术、研究、双语 | `intuition-machine` |
| Notion、SaaS、产品演示 | `notion` |
| 故事、奇幻、动画 | `fantasy-animation` |
| 生物学、化学、医学 | `scientific` |
| 历史、文化遗产、复古 | `vintage` |

### Step 3.3：后处理提示词

baoyu-slide-deck 在 `prompts/` 中生成提示词后：

1. **复制到用户的目录结构中**：将提示词移动/复制到 `03-prompts/`
2. **注入自定义风格**：如果 `style-instructions.md` 存在，确保其完整内容嵌入每个提示词文件
3. **添加叙事目标**：根据 `narrative-brief.md`，在每个提示词后追加 `// NARRATIVE GOAL` 部分

提示词模板新增内容：
```markdown
---

## NARRATIVE CONTEXT

// NARRATIVE GOAL
[What this slide achieves in the talk arc]

// SPEAKER NOTES
[What the speaker says while this slide is shown]
```

**自检**：所有提示词是否都包含 `style-instructions.md` 的完整内容？是否已添加叙事目标？文件是否位于 `03-prompts/` 中？

---

## Phase 4：提示词审阅（有条件）

**目标**：在生成图像之前由人工审阅。

**如果用户希望审阅**（推荐）：
1. 显示提示词摘要表
2. 询问用户：“准备好生成图像了吗？”
3. 如果需要编辑 → 用户编辑 `03-prompts/*.md` → 通过 baoyu-slide-deck 重新生成特定提示词

**如果用户跳过审阅**：继续进入 Phase 5。

---

## Phase 5：委托 baoyu-slide-deck（图像）

**目标**：生成幻灯片图像。

### Step 5.1：调用 baoyu-slide-deck

```
/baoyu-slide-deck . --images-only
```

或者使用 Skill 工具：
```
Skill({"skill": "baoyu-slide-deck", "args": ". --images-only"})
```

**重要提示**：baoyu-slide-deck 要求提示词位于扁平的 `prompts/` 目录中（其原生输出结构）。如果你已将其重新整理到 `03-prompts/`（Phase 6），请在调用前创建一个临时副本：
```bash
# From the project root (where 03-prompts/ exists)
cp -r 03-prompts prompts
/baoyu-slide-deck . --images-only
rm -rf prompts  # clean up after
```

**关于交付物的说明**：baoyu-slide-deck 会通过其自身的 `merge-to-pptx.ts` 和 `merge-to-pdf.ts` 脚本（其工作流的 Step 8）在内部生成 `.pptx` 和 `.pdf`。这些是**主要**交付物——它们位于 baoyu 的扁平输出目录（`slide-deck/{topic-slug}/`）中。

slides-creator 中的 `scripts/merge_to_pptx.py` 和 `scripts/merge_to_pdf.py` **并非**重复脚本。它们的用途不同：
- **baoyu merge**：用于 baoyu 的扁平目录结构（PNG 和提示词位于同一层级）
- **slides-creator merge**：用于重组后的目录结构（`02-slides/` + `03-prompts/`）

仅在阶段 6 重组完成后，或 baoyu 的合并步骤失败时，才使用 slides-creator 的合并脚本。

### 步骤 5.2：视觉验证

生成后：
1. **测试幻灯片**：读取 `01-slide-cover.png`（或生成的第一张幻灯片）
2. **风格检查**：与 `style-instructions.md` 进行比较
3. **文本检查**：验证中文/英文文本的可读性
4. **如果存在问题**：更新受影响的 `03-prompts/*.md` → 复制 `cp -r 03-prompts prompts` → 通过 `/baoyu-slide-deck . --regenerate N`（或 `Skill({"skill": "baoyu-slide-deck", "args": ". --regenerate N"})`）重新生成 → 清理 `rm -rf prompts`

**自检**：所有幻灯片是否均已生成？风格是否一致？文本是否清晰可读？

---

## 阶段 6：后期处理与交付

**目标**：将 baoyu-slide-deck 的输出重组为用户偏好的结构。

### 6.1 目录重组

baoyu-slide-deck 输出到 `slide-deck/{topic-slug}/`：
```
slide-deck/{topic-slug}/
├── source-{slug}.md
├── outline.md
├── prompts/
├── *.png
├── {topic-slug}.pptx
└── {topic-slug}.pdf
```

重组为用户的结构：
```
{project-name}/
├── 00-上游/                    # Source materials
│   ├── prompt-最初提示词.txt   # Original user prompt (if saved)
│   ├── narrative-brief.md      # Phase 1 output
│   ├── content.md              # Phase 2 output (baoyu input)
│   ├── style-instructions.md   # Visual design SSOT
│   └── outline.md              # From baoyu-slide-deck
├── 01-成品/                    # Final deliverables
│   ├── {project-name}.pdf
│   └── {project-name}.pptx
├── 02-slides/                  # Generated PNGs (当前版本)
│   ├── 01-slide-cover.png
│   └── ...
├── 03-prompts/                 # Per-slide prompts (SSOT)
│   ├── v6/                     # 支持版本子目录（如 v6, v7...）
│   │   ├── 01-slide-cover.md
│   │   └── ...
│   └── 01-slide-cover.md       # 或平铺结构
├── speaker-notes.md            # Auto-extracted from 03-prompts/ via extract_notes.py
├── v6/                         # baoyu-slide-deck 临时输出（需搬迁到 02-slides/）
│   └── ...
└── _archive/                   # Historical versions
    └── v1/
```

**关于版本管理的说明**：
- `03-prompts/` 支持平铺或版本子目录（`v6/`, `v7/`）。当同一项目多次迭代时，用子目录保留历史版本。
- baoyu-slide-deck 可能直接输出到项目根目录的临时文件夹（如 `v6/`）。后期处理时需将这些 PNG 移动到 `02-slides/`。

**归档当前版本**（重大迭代之前）：
```bash
uv run scripts/archive_version.py --project /path/to/project
```
将 `02-slides/` + `03-prompts/` 归档到 `_archive/v{N}/`（自动递增）。

### 6.2 提取演讲者备注

使用 `scripts/extract_notes.py` 从 `03-prompts/*.md` 中提取结构化备注：

```bash
uv run scripts/extract_notes.py --prompts 03-prompts --output speaker-notes.md
```

提取内容：
- `// NARRATIVE GOAL` 部分
- `// SPEAKER NOTES` 部分
- 如果两者均未找到，则回退到 `// KEY CONTENT`

输出格式（`speaker-notes.md`）：
```markdown
# Speaker Notes

## 01-slide-cover
**Narrative Goal**: ...
**Speaker Notes**: ...

## 02-slide-intro
...
```

**注意**：如果 `03-prompts/` 存在，`main.ts` 会自动运行此步骤。

### 6.3 归档原始提示词

如果用户提供了原始提示词（例如为「龙虾 vs Claude Code」提供的 35KB 提示词）：
- 保存为 `00-上游/prompt-最初提示词.txt`

### 6.4 最终验证清单

- [ ] PDF 可以打开，且所有幻灯片均正确渲染
- [ ] PPTX 可以正常打开且没有错误
- [ ] PNG 序列编号正确（01、02、……）
- [ ] 演讲者备注覆盖所有幻灯片
- [ ] 所有幻灯片的风格一致
- [ ] 没有乱码或文本缺失
- [ ] `00-上游/` 包含所有源 SSOT 文件
- [ ] `03-prompts/` 包含所有提示词文件

---

## 迭代工作流

### 路径 A：内容变更
```
User feedback → Update narrative-brief.md → Update content.md
→ Regenerate prompts (/baoyu-slide-deck content.md --prompts-only)
→ Regenerate images (/baoyu-slide-deck . --images-only)
→ Reorganize + extract notes
```

### 路径 B：风格变更
```
User feedback → Update style-instructions.md
→ Update all prompts (inject new style into 03-prompts/*.md)
→ Regenerate all images (via /baoyu-slide-deck . --images-only)
→ Reorganize + extract notes
```

### 路径 C：修复单张幻灯片
```
User feedback → Update 03-prompts/NN-slide-xxx.md
→ Copy prompts: cp -r 03-prompts prompts
→ /baoyu-slide-deck . --regenerate N
→ Clean up: rm -rf prompts
→ Replace in 02-slides/
→ Regenerate PPTX/PDF
```

**关于 `--regenerate` 的注意事项**：baoyu-slide-deck 从扁平的 `prompts/` 目录中读取内容。重组到 `03-prompts/` 后，请在重新生成前创建一个临时副本（`cp -r 03-prompts prompts`）。如果尚未进行重组（仍使用 baoyu 的扁平结构），则无需复制，直接调用即可。

---

## 脚本参考

| 脚本 | 用途 |
|--------|---------|
| `scripts/main.ts` | 后处理：验证 + 提取备注 + 生成 PDF/PPTX |
| `scripts/merge_to_pptx.py` | 将 PNG 合并为 PPTX，并从 `03-prompts/*.md` 中提取结构化演讲者备注 |
| `scripts/merge_to_pdf.py` | 将 PNG 合并为 PDF（使用重组后的 `02-slides/` 结构） |
| `scripts/validate_slides.py` | 检查宽高比、命名和缺失的幻灯片 |
| `scripts/extract_notes.py` | 从 `03-prompts/*.md` 中提取结构化演讲者备注并保存到 `speaker-notes.md` |
| `scripts/archive_version.py` | 将 `02-slides/` + `03-prompts/` 归档到 `_archive/v{N}/` |

---

## 失败记录（切勿重犯）

| 失败 | 根本原因 | 预防措施 |
|---------|-----------|------------|
| **AI 替用户编写内容——精致的垃圾** | 违反了第一定律：跳过阶段 0，捏造引用/示例。参见 `references/content-creation-first-law.md` | **第一定律是绝对的**：首先收集用户的原话。没有源材料 = 停止并询问。AI 只协助表达，绝不取而代之 |
| 为 20 分钟的演讲生成了 30 张幻灯片 | 没有强制执行幻灯片数量指南 | 检查演讲时长 ÷ 2 = 最大幻灯片数量 |
| 不同版本之间出现风格漂移 | 提示词中没有包含风格说明 | 将完整的 style-instructions.md 粘贴到每个提示词中 |
| 图片中的文本无法阅读 | 模型对中文的支持不佳 | 先使用中文文本进行测试 |
| 叙事弧线平淡 | 未经阶段 1 就直接开始编写提示词 | 务必先讨论叙事 |
| 用户对初稿不满意 | 批量生成前没有确认 | 先生成一张测试幻灯片并获得批准 |
| 目录混乱 | 没有使用一致的结构 | 始终使用 00-上游/01-成品/02-slides/03-prompts |
| 重复工作 | 试图取代 baoyu-slide-deck | 将视觉生成工作委托出去，专注于叙事 |
| 合并脚本被质疑为重复实现 | Baoyu 的合并脚本虽然存在，但：（1）路径不稳定（`~/.claude/plugins/...`）；（2）要求使用扁平的 `prompts/` 目录；（3）会将完整的基础提示词注入备注，产生噪声 | 为重组后的结构保留自己的合并脚本。删除前先进行验证——如果可以访问，先调用 baoyu 的合并脚本 |

---

## 参考资料

- `references/content-creation-first-law.md` — 通用原则：用户的声音优先，适用于所有内容类型（幻灯片、文章、广告、课程）
- `references/narrative-design-guide.md` — ABCDEFG 模型详细指南
- `references/prompt-templates/` — 常见幻灯片类型的提示词模板
- `references/style-gallery.md` — 带有示例的视觉风格库