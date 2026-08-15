---
name: skill-authoring-workflow
argument-hint: "[source content or skill to update]"
description: Turn raw PM content into a compliant, publish-ready skill. Use when creating or updating a repo skill without breaking standards.
intent: >-
  Create or update PM skills without chaos. This workflow turns rough notes, workshop content, or half-baked prompt dumps into compliant `skills/<skill-name>/SKILL.md` assets that actually pass validation and belong in this repo.
type: workflow
best_for:
  - "Creating a new repo skill from notes or source material"
  - "Updating an existing skill while keeping standards intact"
  - "Running the full authoring and validation workflow before commit"
scenarios:
  - "Help me turn these workshop notes into a new PM skill"
  - "I need to update an existing skill without breaking the repo standards"
  - "What workflow should I use to author a new skill in this repo?"
---
## 目的

有序地创建或更新 PM 技能。此工作流可将粗略笔记、研讨会内容或尚未完善的提示词集合，转化为符合规范的 `skills/<skill-name>/SKILL.md` 资产，使其能够真正通过验证并适合纳入此仓库。

当你希望发布一项新技能，又不想靠“我觉得没问题”的碰运气方式时，请使用此工作流。

## 输入

请提供原始材料和目标意图——内容粗略也没关系；此工作流会帮助你完成其余工作：
- **最适合提供：**源内容（笔记、文字记录、框架、提示词序列）或你想要更新的现有技能
- **同样有用：**预期的技能类型（组件式/交互式/工作流式）、目标受众以及任何命名偏好

如果你在请求中直接提供这些信息（例如，“将 `research/pricing-workshop-notes.md` 转换成交互式顾问”），工作流将带着这些上下文从阶段 1 开始——不会重复询问你已经提供的信息。如果你没有提供任何信息，工作流会先询问你想将哪些内容转化为技能，并提供引导协议中定义的几种进入模式。

示例：`Use skill-authoring-workflow: convert research/pricing-workshop-notes.md into an interactive pricing advisor.`

## 核心概念

### 优先内部实践

在设计自定义流程之前，优先使用仓库原生的工具和标准：
- `scripts/find-a-skill.sh`
- `scripts/add-a-skill.sh`
- `scripts/build-a-skill.sh`
- `scripts/test-a-skill.sh`
- `scripts/check-skill-metadata.py`

### 选择正确的创建路径

- **引导式向导（`build-a-skill.sh`）**：最适合已有想法但尚未形成最终文案的情况。
- **内容优先生成器（`add-a-skill.sh`）**：最适合已经拥有源内容的情况。
- **手动编辑并验证**：最适合完善现有技能。

### 完成定义（无例外）

只有满足以下所有条件，技能才算完成：
1. Frontmatter 有效（`name`、`description`、`intent`、`type`）
2. 章节顺序符合规范（目的、输入、核心概念、应用、示例、常见陷阱、参考资料）
3. 遵守元数据限制（`name` <= 64 个字符，`description` <= 200 个字符）
4. 描述同时说明该技能的作用以及何时使用
5. 输入部分说明用户可以提供哪些内容、给出调用示例、指示智能体使用内联输入而不是重复询问，并明确说明即使用户仅提供部分输入或完全没有提供输入也没关系——应使用自然语言，绝不能使用像 `$ARGUMENTS` 这样的运行时模板语法（理由：CONTRIBUTING.md 中的“为什么我们不使用 `$ARGUMENTS`”）
6. 意图字段承载面向仓库的更完整摘要，但不能取代以触发条件为导向的描述
7. 交叉引用能够正确解析
8. README 目录中的数量和表格已更新（如果添加或删除了技能）

### 引导流程的唯一事实来源

当以引导式对话运行此工作流时，请使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文转储、最佳猜测）
- 每轮只问一个问题，并使用自然语言提示
- 进度标签（例如，上下文 Qx/8 和评分 Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括`其他（请说明）`）

此文件定义了工作流顺序和特定领域的输出。如有冲突，请遵循此文件中的工作流逻辑。

## 应用

### 阶段 1：预检（避免重复工作）

1. 搜索功能重叠的技能：

```bash
./scripts/find-a-skill.sh --keyword "<topic>"
```

2. 确定类型：
- **组件**：一个产物/模板
- **交互式**：3-5 个自适应问题 + 编号选项
- **工作流**：多阶段编排

### 阶段 2：生成草稿

如果你有源材料：

```bash
./scripts/add-a-skill.sh research/your-framework.md
```

如果你希望使用引导式提示：

```bash
./scripts/build-a-skill.sh
```

### 阶段 3：完善技能

手动检查以下内容：
- 清晰说明“何时使用”
- 一个具体示例——最好提供两个来自不同业务领域的示例（一个 SaaS，一个工业/非 SaaS），以清楚展示该框架的通用性；复用仓库中的虚构世界设定（SaaS 使用 Fieldlight/Wrenchline，工业领域使用 Helix/Northfield/Corvid），并按领域为第二个文件添加后缀（`sample-industrial.md`）
- 当技能会生成产物时，提供一个 `template.md`——以可复制粘贴并填写的形式呈现输出模式，同时包含质量检查项
- 一个明确的反面模式
- 不含填充内容或含糊的咨询顾问式表达

### 阶段 4：严格验证

在考虑提交之前运行严格检查：

```bash
./scripts/test-a-skill.sh --skill <skill-name> --smoke
python3 scripts/check-skill-metadata.py skills/<skill-name>/SKILL.md
python3 scripts/check-skill-triggers.py skills/<skill-name>/SKILL.md --show-cases
```

### 阶段 5：与仓库文档集成

如果这是一个新技能：
1. 将其添加到正确的 README 分类表中
2. 更新技能总数和各分类数量
3. 验证链接路径可正常解析

### 阶段 6：可选打包

如果目标是上传为 Claude 自定义技能：

```bash
./scripts/zip-a-skill.sh --skill <skill-name>
# or zip one category:
./scripts/zip-a-skill.sh --type component --output dist/skill-zips
# or use a curated starter preset:
./scripts/zip-a-skill.sh --preset core-pm --output dist/skill-zips
```

## 示例

### 示例：将研讨会笔记转化为技能

输入：`research/pricing-workshop-notes.md`  
目标：新的交互式顾问

```bash
./scripts/add-a-skill.sh research/pricing-workshop-notes.md
./scripts/test-a-skill.sh --skill <new-skill-name> --smoke
python3 scripts/check-skill-metadata.py skills/<new-skill-name>/SKILL.md
```

预期结果：
- 新技能文件夹已存在
- 技能通过结构和元数据检查
- README 目录条目已添加/更新

### 反面模式示例

“我们编写了一个很酷的技能，跳过了验证，忘记更新 README 中的数量，然后直接发布了。”

结果：
- 引用损坏
- 目录中的数字不一致
- 给贡献者和用户造成困惑

## 常见陷阱

- 交付的是感觉，而不是标准。
- 当任务实际上只是一个组件模板时，却选择了 `workflow`。
- 描述过于冗长，超出上传限制。
- 描述只说明技能是什么，却不说明 Claude 应在何时触发它。
- 描述不知不觉达到 200 字符限制，并在语意未尽时被截断。
- 让 `intent` 取代薄弱的触发描述。
- 添加技能后忘记更新 README 中的数量。
- 未经审查就将生成的输出视为最终结果。

## 参考资料

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/Building PM Skills.md`
- `docs/Add-a-Skill Utility Guide.md`
- Anthropic 的 [Claude Skill 构建完整指南](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
- `scripts/add-a-skill.sh`
- `scripts/build-a-skill.sh`
- `scripts/find-a-skill.sh`
- `scripts/test-a-skill.sh`
- `scripts/check-skill-metadata.py`
- `scripts/check-skill-triggers.py`
- `scripts/zip-a-skill.sh`