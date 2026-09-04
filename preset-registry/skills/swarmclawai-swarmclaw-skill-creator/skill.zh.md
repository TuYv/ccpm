---
name: skill-creator
description: Create, edit, improve, or audit skills for SwarmClaw agents. Use when creating a new skill from scratch or when asked to improve, review, audit, tidy up, or clean up an existing skill or SKILL.md file. Also use when editing or restructuring a skill directory. Triggers on phrases like "create a skill", "author a skill", "tidy up a skill", "improve this skill", "review the skill", "clean up the skill", "audit the skill".
---
# Skill Creator（技能创建器）

关于如何创建有效技能以扩展 SwarmClaw 代理能力的指南。

## 关于技能

技能是模块化、自包含的包，提供专业知识、工作流和工具。它们能将通用代理转变为具备专业化能力的代理，使其拥有任何模型都无法完全具备的过程性知识。

### 技能提供什么

1. 专业化工作流 — 针对特定领域的多步骤流程
2. 工具集成 — 处理特定文件格式或 API 的操作说明
3. 领域专长 — 公司专属的知识、schema、业务逻辑
4. 捆绑资源 — 用于复杂和重复任务的脚本、参考文档和素材

## 核心原则

### 简洁至上

上下文窗口是一种共享资源。只添加代理本身尚不具备的上下文。对每一条信息都要质疑：“代理真的需要这条解释吗？”优先使用简洁的示例，而非冗长的说明。

### 设定适当的自由度

- **高自由度**（文本指令）：存在多种有效方法，需要根据具体情境做决策
- **中自由度**（伪代码/参数化脚本）：有首选模式，允许一定变化
- **低自由度**（特定脚本）：脆弱操作、一致性至关重要、要求精确执行顺序的场景

### 技能的结构

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name + description, required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/      — Executable code (Python/Bash/etc.)
    ├── references/   — Documentation loaded into context as needed
    └── assets/       — Files used in output (templates, icons, fonts)
```

#### Frontmatter（元数据头）

- `name`: 技能名称（连字符小写格式，全小写）
- `description`: 主要触发机制。应包含技能做什么**以及**何时使用。所有“何时使用”的信息都应放在这里——而不是正文中。

#### 脚本（`scripts/`）

用于需要确定性可靠性或需要反复编写任务的可执行代码。节省 token，且可以在不加载到上下文的情况下执行。

#### 参考资料（`references/`）

按需加载、用于指导代理工作流程的文档。SKILL.md 中只保留必要指令，将详细参考资料移到这里。

#### 素材（`assets/`）

不加载到上下文但在输出中使用的文件（模板、图片、字体）。用于将输出资源与文档区分开。

### 不应包含的内容

- README.md、CHANGELOG.md、INSTALLATION_GUIDE.md 或其他辅助文档
- 安装/测试流程或面向用户的文档
- 代理通过通用训练已经掌握的信息

## 技能创建流程

1. 通过具体示例理解技能
2. 规划可复用内容（脚本、参考资料、素材）
3. 初始化技能
4. 编辑技能（实现资源、编写 SKILL.md）
5. 验证技能
6. 基于实际使用进行迭代

### 技能命名

- 只使用小写字母、数字和连字符（连字符小写格式）
- 少于 64 个字符
- 优先使用简短的、以动词开头、描述动作的短语
- 技能文件夹名称与技能名称完全一致

### 第 1 步：通过具体示例理解技能

向用户提出澄清性问题：

- 该技能应支持哪些功能？
- 能否举例说明它会如何被使用？
- 用户说出什么内容时应该触发这个技能？

### 第 2 步：规划可复用内容

分析每个示例，确定哪些脚本、参考资料和素材会有帮助：

- **重复的代码** → `scripts/`（例如 `scripts/rotate_pdf.py`）
- **样板内容** → `assets/`（例如 `assets/hello-world/` 模板）
- **领域知识** → `references/`（例如 `references/schema.md`）

### 第 3 步：初始化技能

使用捆绑的 init 脚本创建目录结构：

```bash
python3 {baseDir}/scripts/init_skill.py <skill-name> --path <output-directory> [--resources scripts,references,assets] [--examples]
```

示例：

```bash
python3 {baseDir}/scripts/init_skill.py my-skill --path skills
python3 {baseDir}/scripts/init_skill.py my-skill --path skills --resources scripts,references
```

### 第 4 步：编辑技能

编写能帮助另一个代理实例有效执行任务的指令。纳入有益且非显而易见的信息。

**编写准则：**使用祈使语气。SKILL.md 正文保持在 500 行以内。

**Frontmatter 描述：**应同时包含技能做什么，以及何时使用它的具体触发条件。这是技能选择的主要机制。

### 第 5 步：验证技能

运行验证器检查结构和 frontmatter：

```bash
python3 {baseDir}/scripts/quick_validate.py <path/to/skill-folder>
```

### 第 6 步：迭代

1. 在真实任务中使用该技能
2. 发现困难或低效之处
3. 更新 SKILL.md 或捆绑资源
4. 再次测试

## 渐进式披露

技能采用三级加载体系：

1. **元数据**（name + description）— 始终存在于上下文中（约 100 词）
2. **SKILL.md 正文** — 在技能被触发时加载（少于 5 千词）
3. **捆绑资源** — 按需加载（不限量，因为脚本无需阅读即可执行）

保持 SKILL.md 精简。将详细信息移入参考文件，并清楚地说明何时应阅读它们。
