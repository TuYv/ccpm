---
name: utility-pm-skill-iterate
description: Applies targeted improvements to an existing pm-skills skill based on feedback, validation reports, or convention changes. Reads current files, previews proposed changes, writes on confirmation, and suggests a version bump. Use when improving a skill after validation or feedback.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-04-03
  category: coordination
  frameworks: [triple-diamond]
  author: product-on-purpose
---
# PM Skill Iterate

此技能通过根据你提供的输入应用有针对性的更改，改进现有的 pm-skills skill。它会读取当前的 skill 文件，像之前一样按文件分组提出修改前/修改后预览，并在你确认后写入这些修改。应用修改后，它会建议版本升级类别，并询问是否更新 HISTORY.md。

迭代器接受以下任意形式的输入：
- 来自 `/pm-skill-validate` 的验证报告
- 直接反馈（“模板缺少 X 部分”）
- 约定变更（“所有 skills 现在都需要一个 Limitations 部分”）
- 一般性改进请求（“让示例更贴近实际”）

## 何时使用

- 运行 `/pm-skill-validate` 并获得包含问题的报告后
- 当你对某个 skill 有具体反馈并希望应用这些反馈时
- 当仓库约定发生变化且某个 skill 需要遵循新约定时
- 当某个 skill 的示例、模板或指令需要改进时
- 在发布前迭代某个 skill 时

## 何时不要使用

- 从头创建新的 skill -> 使用 `/pm-skill-builder`
- 在修改前审查 skill -> 先使用 `/pm-skill-validate`
- 对多个 skills 批量应用约定变更 -> 先运行 `/pm-skill-validate --all` 进行分类，然后一次迭代一个 skill

## Instructions

当被要求迭代某个 skill 时，遵循以下步骤：

### Step 1: Identify the Target Skill

接受以下任意形式的 skill 名称：
- 目录名称：`deliver-prd`
- 完整路径：`skills/deliver-prd/SKILL.md`
- Slash command：`/prd`

解析为规范目录路径：`skills/{name}/`。

如果 skill 目录不存在，停止并报告：“Skill directory
`skills/{name}/` does not exist. Use `/pm-skill-builder` to create it.”

### Step 2: Read Current Skill Files

读取 skill 目录中的所有文件：

| File | Required | Purpose |
|------|----------|---------|
| `SKILL.md` | yes | Frontmatter + instructions（主要编辑目标） |
| `references/TEMPLATE.md` | yes | Output template |
| `references/EXAMPLE.md` | yes | Worked example |
| `HISTORY.md` | no | Version history（Step 7 所需） |

记录此时每个文件的确切内容。在 Step 5 写入前，将其与这些内容进行比较（stale-preview guard）。

如果无法读取文件（MCP/embedded environment），在继续之前请用户粘贴相关文件内容（参见 Degraded Mode）。

### Step 3: Normalize Input into Intended Changes

无论输入类型如何，在生成任何编辑内容之前，都要提取出结构化的预期更改列表。这个标准化步骤使统一流程能够一致地处理所有输入类型。

**如果输入是验证报告**（来自 `/pm-skill-validate`）：
- 检查标题中是否包含 `Report schema: v1`。如果缺失或 schema 版本不同，发出警告：“This report uses an unrecognized schema. I'll
  do my best but may miss structured fields.”
- 解析 `## Recommendations` 部分。
- 在每行建议中按 `|` 分割，以提取：
  - 位置 1：严重性（FAIL、WARN、INFO）
  - 位置 2：检查 ID
  - `Target:` 之后：文件路径
  - `Action:` 之后（下一行）：要进行的更改
- 根据这些字段构建预期更改列表。

**如果输入是自由文本**（反馈、约定变更、改进请求）：
- 阅读输入并确定需要更改的内容。
- 将每项更改映射到具体的目标文件和章节。
- 如果输入含糊不清，请在继续之前提出一个澄清问题。

列出规范化后的清单，供用户确认：

```
Intended changes:
1. Target: skills/{name}/SKILL.md -> {section}
   Change: {what will change}
   Source: {validation report check ID | user feedback | convention change}
2. Target: skills/{name}/references/EXAMPLE.md -> {section}
   Change: {what will change}
   Source: {source}
```

如果用户希望修改清单（添加、删除或更改项目），
请调整后重新列出清单，供用户确认，然后再继续。

### 第 4 步：预览拟议更改

对于每项预期更改，生成拟议的编辑内容，并按文件分组，以更改前/更改后的区块形式展示：

```
### skills/{name}/SKILL.md

**{Section name} -- before:**
> {exact current content of the section being changed}

**{Section name} -- after:**
> {proposed new content for this section}

### skills/{name}/references/EXAMPLE.md

**{Section name} -- before:**
> {exact current content}

**{Section name} -- after:**
> {proposed new content}
```

**预览规则：**
- 按文件分组所有更改。每个文件只展示一次，并包含该文件的所有更改。
- 展示足够的上下文，以便用户理解更改内容。
- 对于小型编辑（几行内容），展示更改前后的完整章节。
- 对于大型编辑（重写章节的大部分内容），展示更改前的章节标题及开头和结尾的几行，然后展示完整的更改后内容。
- 不要展示未发生更改的文件。

询问：“应用这些更改吗？[yes / no]”

如果用户回答 no，请询问需要调整什么，然后返回第 3 步或第 4 步。

### 第 5 步：应用更改（带有预览过期保护）

**在写入任何文件之前**，重新读取每个目标文件，并将其内容与第 2 步中记录的内容进行比较。

**如果任何目标文件自第 2 步以来发生了更改：**
- 不要写入任何文件。
- 报告：“文件 `{path}` 自生成预览以来已发生更改。
  正在使用当前内容重新生成预览。”
- 使用相同的预期更改清单返回第 2 步。

**如果所有目标文件均匹配：**
- 将更改写入每个目标文件。
- 将 SKILL.md frontmatter 中的 `updated` 字段更新为今天的日期。
  （无论是否接受版本号升级，`updated` 字段都记录文件最后修改的时间。）
- **字节 0 保留：**验证每个重写后的文件在文件的字节 0 处仍然是 `---`（前面不能有任何内容）。如果之前的内容违反了字节 0 的位置要求（例如第 1 行存在 HTML attribution comment），请在应用其他更改之前主动指出这一问题，并提供在同一次写入中修复该位置的选项。参考：
  `library/skill-output-samples/SAMPLE_CREATION.md` 第 5 节。
- 报告已写入的内容：列出每个文件，并用一行总结发生的更改。

### 第 6 步：建议版本升级

应用更改后，对整体更改进行分类，并建议版本升级类别。不要自动写入版本号。

**分类规则**（来自 `docs/internal/skill-versioning.md`）：

| 变更类型 | 升级类别 | 示例 |
|------------|------------|---------|
| 表述澄清、示例改进、修复拼写错误 | **patch** | 重新措辞的检查清单项目、更好的示例场景、扩展描述 |
| 新增可选能力或章节 | **minor** | 新的可选输出章节、支持更多场景、新的质量检查 |
| 必需契约变更、交互模式被破坏 | **major** | 命令重命名、移除必需章节、缩小“完成”的定义 |

**判定优先级：** 如果用户必须执行新的操作才能继续符合
skill 的必需契约，则归类为 major。如果新行为是新增的或可选的，则归类为 minor。如果必需行为没有改变，只是进行了澄清，则归类为 patch。

给出建议：

```
建议升级：{class}（{reason}）。
当前版本：{current}。
升级到 {suggested}？[yes / override / skip]
```

- **yes**：将新版本写入 SKILL.md 的 frontmatter。
- **override**：询问所需版本，验证其是否为有效的 SemVer
  且高于当前版本，然后写入该版本。
- **skip**：保持版本不变。用户之后可以在发布准备阶段再升级版本。

### 步骤 7：提供 HISTORY.md 更新

版本决策完成后，生成变更摘要，并根据当前状态处理
HISTORY.md：

**如果 HISTORY.md 存在且版本已升级：**
1. 读取 HISTORY.md 并验证其格式：
   - 包含以 `| Version | Date | Release | ...` 为表头的摘要表格
   - 表格中的版本按从新到旧排列
   - 表格中的每个版本在下方都有对应的 `## X.Y.Z` 章节
2. **如果格式有效**：询问是否追加。
   “你是否希望我将此版本添加到 HISTORY.md？[yes / no]”
   如果选择 yes：在摘要表格中添加一行新记录（按从新到旧排列），并添加一个包含变更摘要的
   `## X.Y.Z` 章节。
3. **如果格式无效**：发出警告并展示拟添加的内容，但不要写入。“HISTORY.md 不符合预期格式。以下是我将添加的内容——你可以手动粘贴：”
   然后展示拟添加的表格行和版本章节。

**如果 HISTORY.md 不存在且这是该 skill 的第二个版本：**
询问是否创建该文件。“这是该 skill 的第二个版本。你是否希望我创建 HISTORY.md，并包含两个版本的记录？[yes / no]”
如果选择 yes：按照 `docs/internal/skill-versioning.md` 中的格式创建 HISTORY.md，包括原始版本（来自发布历史或
effort brief）和新版本的记录。

**如果 HISTORY.md 不存在且版本未升级：**
不提供创建选项。在该 skill 发布第二个版本之前，创建 HISTORY.md 还为时过早。

**如果 HISTORY.md 存在但版本未升级（skip）：**
不提供创建选项。变更摘要已在对话中提供，用户可自行决定是否使用。

### 步骤 8：报告摘要

给出最终摘要：

```
## 迭代完成：{skill-name}

**已修改的文件：**
- skills/{name}/SKILL.md -- {summary}
- skills/{name}/references/EXAMPLE.md -- {summary}

**版本：** {current} -> {new} ({class}) | 或：未变更（已跳过）
**HISTORY.md：** 已更新 | 已创建 | 已跳过 | 不适用

**后续步骤：**
- 运行 `/pm-skill-validate {name}`，验证变更是否通过
- 运行本地 CI：`bash scripts/lint-skills-frontmatter.sh`
- 如果确认无误，提交这些变更
```

## 降级模式

如果无法直接读取 skill 文件（例如通过 MCP 运行，或处于无法访问文件系统的嵌入式环境中）：

1. 在此模式下，优先采用**由验证报告驱动的迭代**。
   报告包含相关上下文（检查 ID、目标路径、操作）。
2. 对于自由文本迭代，请用户在提出修改建议前，粘贴每个相关文件的内容。
3. 无法运行过期预览防护（步骤 5）——请在摘要中注明：
   "Applied without stale-preview check (file system not available)."
4. HISTORY.md 的操作要求用户粘贴当前文件内容，或确认该文件不存在。

## 输出约定

迭代器必须：
- 在编辑前，将输入规范化为结构化的预期变更列表
- 按文件分组，展示所有拟议变更的修改前/修改后预览
- 在写入任何文件前，要求用户明确确认
- 在写入前重新读取目标文件，以防预览内容过期
- 每次应用变更时，更新 `updated` frontmatter 字段
- 建议版本升级类别，但不得自动写入版本号
- 按照步骤 7 的规则处理 HISTORY.md

迭代器不得：
- 未先展示预览就写入文件
- 未经用户确认就写入文件
- 未经明确确认就自动递增版本号
- 为仍处于首个版本的 skill 创建 HISTORY.md
- 未先验证格式就向 HISTORY.md 追加内容

## 质量检查清单

完成迭代前，验证：

- [ ] 在编辑前，已将输入规范化为预期变更列表
- [ ] 已展示所有拟议变更的修改前/修改后预览
- [ ] 在写入任何文件前，用户已确认
- [ ] 写入前已运行过期预览防护（或已注明该防护不可用）
- [ ] `updated` 日期已在 SKILL.md frontmatter 中设置为今天
- [ ] 已根据正确的理由建议版本升级类别
- [ ] 仅在获得明确用户确认后写入版本号
- [ ] 已根据步骤 7 的规则正确处理 HISTORY.md
- [ ] 已提供最终摘要及后续步骤

## 示例

参见 `references/EXAMPLE.md`，其中演示了一个由验证报告驱动的、针对已发布 skill 的改进迭代。