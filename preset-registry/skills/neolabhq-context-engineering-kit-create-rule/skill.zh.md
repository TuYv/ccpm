---
name: create-rule
description: Use when found gap or repetative issue, that produced by you or implemenataion agent. Esentially use it each time when you say "You absolutly right, I should have done it differently." -> need create rule for this issue so it not appears again.
---
# 创建规则

创建有效 `.claude/rules` 文件的指南，通过对比示例提高智能体的准确性。

## 概述

**核心原则：**有效的规则使用对比示例（错误与正确）来消除歧义。

**必备背景知识：**规则是行为护栏，会加载到每个会话中，并影响智能体在所有任务中的行为方式。技能则按需加载。如果指导内容仅适用于特定任务，应改为创建技能。

## 关于规则

规则是放置在 `.claude/rules/` 中的模块化、始终加载的指令，用于确保行为一致。它们相当于“长期指令”——每个智能体会话都会自动继承这些规则。

### 规则提供的内容

1. **行为约束**——应该做什么以及绝对不应该做什么
2. **代码标准**——格式、模式和架构决策
3. **质量门槛**——继续执行之前必须满足的条件
4. **领域约定**——项目特定的术语和实践

### 规则、技能与 CLAUDE.md 的对比

| 方面 | 规则（`.claude/rules/`） | 技能（`skills/`） | CLAUDE.md |
|--------|--------------------------|---------------------|-----------|
| **加载方式** | 每个会话（或限定路径） | 触发时按需加载 | 每个会话 |
| **用途** | 行为约束 | 程序性知识 | 项目概述 |
| **范围** | 狭窄、聚焦的主题 | 完整工作流 | 广泛的项目上下文 |
| **大小** | 小型（每个 50-200 字） | 中型（200-2000 字） | 中型（项目摘要） |
| **格式** | 对比示例 | 分步指南 | 键值对／项目符号列表 |

## 何时创建规则

**以下情况应创建规则：**

- 某项行为必须适用于所有智能体会话，而不仅仅是特定任务
- 尽管经过纠正，智能体仍反复犯同样的错误
- 某项约定具有明确的正确／错误模式（可以提供对比示例）
- 某些文件类型需要限定路径的指导

**以下情况不要创建规则：**

- 特定于任务的工作流（应改用技能）
- 一次性指令（放在提示词中）
- 广泛的项目上下文（放在 CLAUDE.md 中）
- 需要多步骤流程的指导（应改用技能）

## 规则类型

### 全局规则（无 `paths` 前置元数据）

每个会话都会加载。用于通用约束。

```markdown
# Error Handling

All error handlers must log the error before rethrowing.
Never silently swallow exceptions.
```

### 限定路径的规则（`paths` 前置元数据）

仅当智能体处理匹配的文件时加载。用于特定文件类型的指导。

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

All API endpoints must include input validation.
Use the standard error response format.
```

### 优先级规则（评估器／裁判指导）

用于设定评估优先级的明确高层规则。

```markdown
# Evaluation Priorities

Prioritize correctness over style.
Do not reward hallucinated detail.
Penalize confident wrong answers more than uncertain correct ones.
```

## 规则结构：对比模式

每条规则都必须遵循“描述-错误-正确”模板。此结构通过同时展示不应该做什么和应该做什么来消除歧义。

### 必需章节

```markdown
---
title: Short Rule Name
paths:                          # Optional but preferable: when it is possible to define, use it!
  - "src/**/*.ts"
---

# Rule Name

[1-2 sentence description of what the rule enforces and WHY it matters.]

## Incorrect

[Description of what is wrong with this pattern.]

\`\`\`language
// Anti-pattern code or behavior example
\`\`\`

## Correct

[Description of why this pattern is better.]

\`\`\`language
// Recommended code or behavior example
\`\`\`

## Reference

[Optional: links to documentation, papers, or related rules.]
```

### 为什么对比示例有效

研究表明，同时包含正面和负面示例的规则比仅提供正面指导的规则具有显著更强的判别力。错误/正确示例的配对：

1. **消除歧义** — 智能体可以看到可接受与不可接受之间的确切界限
2. **防止自我辩解** — 当错误模式被明确展示时，就更难辩称“这已经足够接近了”
3. **支持自我纠正** — 智能体可以将自己的输出与两种模式进行比较

## 编写有效的规则

### 规则描述原则

明确的高层指导：

| 原则 | 示例 |
|-----------|---------|
| **正确性优先于风格** | “功能正确但代码难看的解决方案，胜过优雅但无法工作的解决方案” |
| **不要奖励臆造的细节** | “对于没有代码库依据的额外信息，应予以惩罚，而不是奖励” |
| **惩罚自信的错误** | “自信地陈述错误答案，比不确定地给出正确答案更糟糕” |
| **要具体，不要含糊** | “函数不得超过 50 行”，而不是“保持函数简短” |
| **说明原因** | “使用提前返回来减少嵌套 — 过深的代码嵌套会增加认知负担” |

### 错误示例：应展示什么

错误部分必须展示智能体**有可能实际生成**的模式。抽象或刻意编造的反面示例毫无价值。

**有效的错误示例：**

- 展示智能体在此场景中最常犯的错误
- 包含智能体可能使用的自我辩解（“这样更简单”）
- 仿照代码库中实际存在的代码模式

**无效的错误示例：**

- 明显有问题、任何智能体都不会生成的代码
- 语法错误（智能体已经会避免这些错误）
- 与规则所关注问题无关的模式

### 正确示例：应展示什么

正确部分必须展示修复错误模式所需的最小改动。大规模重写会掩盖真正要传达的要点。

**有效的正确示例：**

- 展示与错误示例相同但已修复的场景
- 突出真正重要的具体改动
- 包含简短注释，说明为什么这样更好

**无效的正确示例：**

- 与错误示例完全不同的代码
- 增加不必要复杂度的过度设计方案
- 需要依赖未展示的额外上下文才能理解的模式

### Token 效率

规则会在每个会话中加载。每个 token 都很重要。

- **目标：** 每个规则文件 50-200 个英文单词（不包括代码示例）
- **每个文件只包含一条规则** — 不要将不相关的约束捆绑在一起
- **使用路径作用域**，避免加载不相关的规则
- **代码示例：** 每个示例保持在 20 行以内（错误示例和正确示例）

## 目录结构

```
.claude/
├── CLAUDE.md                    # Project overview (broad)
└── rules/
    ├── code-style.md            # Global: code formatting rules
    ├── error-handling.md        # Global: error handling patterns
    ├── testing.md               # Global: testing conventions
    ├── security.md              # Global: security requirements
    ├── evaluation-priorities.md # Global: judge/evaluator priorities
    ├── frontend/
    │   ├── components.md        # Path-scoped: React component rules
    │   └── state-management.md  # Path-scoped: state management rules
    └── backend/
        ├── api-design.md        # Path-scoped: API patterns
        └── database.md          # Path-scoped: database conventions
```

**命名约定：**

- 使用小写字母和连字符：`error-handling.md`，而不是 `ErrorHandling.md`
- 根据关注点而非解决方案命名：`error-handling.md`，而不是 `try-catch-patterns.md`
- 每个文件只包含一个主题，以实现模块化
- 使用子目录按领域对相关规则进行分组

## 规则创建流程

按顺序执行以下步骤，仅当某一步骤明确不适用时才跳过。

### 步骤 1：识别行为差距

在编写任何规则之前，先识别需要纠正的具体智能体行为。这种认识可以来自：

- **观察到的失败** — 智能体反复犯某个特定错误
- **代码库分析** — 项目具有仅凭代码无法明显看出的约定
- **评估发现** — 评判器或元评判器识别出了质量差距
- **用户反馈** — 对智能体行为的明确纠正

将差距记录为一条具体陈述：“智能体会执行 X，但应该执行 Y。”

当存在一个清晰、具体且需要纠正的行为时，即可结束此步骤。

### 步骤 2：确定规则作用域

确定此规则应属于以下哪一类：

1. **全局规则**（无 `paths` frontmatter）— 适用于项目中的所有工作
2. **路径作用域规则**（包含 glob 模式的 `paths` frontmatter）— 仅在处理匹配的文件时适用
3. **用户级规则**（`~/.claude/rules/`）— 适用于所有项目中的个人偏好

**决策指南：**

```
Is this project-specific?
  No  → User-level rule (~/.claude/rules/)
  Yes → Is it relevant to ALL files?
    Yes → Global rule (.claude/rules/rule-name.md)
    No  → Path-scoped rule (.claude/rules/rule-name.md with paths: frontmatter)
```

### 步骤 3：编写对比示例

这是最关键的一步。请先编写错误示例和正确示例，然后再编写描述。

1. **从错误模式开始** — 写出智能体生成的、需要纠正的确切代码或行为
2. **编写正确模式** — 展示解决该问题所需的最小修改
3. **验证对比是否清晰** — 错误示例与正确示例之间的差异必须明显，并且只聚焦于一个概念

**对比示例的质量检查：**

| 检查项 | 通过标准 |
|-------|---------------|
| 合理性 | 智能体是否真的可能产生 Incorrect 模式？ |
| 最小性 | Correct 模式是否只修改了必要内容？ |
| 清晰度 | 读者能否在 5 秒内识别出差异？ |
| 单一性 | 每个示例是否只展示一个概念？ |
| 真实性 | 示例是否取自真实的代码库模式？ |

### 步骤 4：编写规则描述

现在编写 1-2 句话的描述，将对比示例联系起来。描述必须：

- 说明规则强制要求什么
- 说明为什么这很重要（影响或后果）
- 使用祈使句形式（使用“使用提前返回”，而不是“你应该使用提前返回”）

### 步骤 5：组装规则文件

按照结构模板创建规则文件：

1. 添加包含 `title`、`impact`、`tags` 以及可选 `paths` 的 YAML frontmatter
2. 编写标题和描述
3. 添加包含说明和代码的 Incorrect 部分
4. 添加包含说明和代码的 Correct 部分
5. 可选择添加包含链接的 Reference 部分

使用描述性文件名将文件放在 `.claude/rules/` 中。

### 步骤 6：验证规则

完成前，请验证：

1. **文件位置** — 规则位于 `.claude/rules/<rule-name>.md`
2. **Frontmatter** — 至少包含 `title` 和 `impact`
3. **对比示例** — 同时包含带代码块的 Incorrect 和 Correct 部分
4. **Token 预算** — 描述为 50-200 个单词（不包括代码）
5. **路径范围** — 如果设置了 `paths`，glob 模式应与预期文件匹配
6. **无重叠** — 规则不与 CLAUDE.md 或其他规则中的指导内容重复

### 步骤 7：根据反馈或观察结果进行迭代

编写规则后，在最终确定前应用“分解 → 过滤 → 重新赋权”的优化循环：

#### 7.1 分解检查

考虑将复杂规则拆分为多个聚焦的规则。

对于你编写的规则，问问自己：“这条规则是否试图涵盖多个概念？”
- 如果是，将其拆分为多个聚焦的规则，每条规则只处理一个概念
- 如果 Incorrect 示例展示了多个不同的反模式，请为每个反模式分别创建规则

#### 7.2 偏差过滤
对于你编写的规则，问问自己：“这条规则是否可能惩罚可接受的变体，或奖励提示词并未要求的行为？”
- 如果是，缩小范围或重写对比示例
- 验证：智能体是否真的可能产生 Incorrect 模式？（如果不会，则该规则是人为臆造的）

#### 7.3 冗余过滤
检查所有现有 `.claude/rules/` 文件是否存在重叠：
- 如果已存在涵盖相同概念的规则，**改为更新现有规则**，并删除刚刚创建的重复规则
- 如果两条规则存在大量重叠（强制执行相同的行为边界），请将其合并
- 使用：`ls -R .claude/rules/` 和 `grep -r "relevant-keyword"` 查找可能的重叠

#### 7.4 影响级别重新赋权
根据以下标准设置或重新设置 frontmatter 中的 `impact` 字段：
- **CRITICAL**：反模式会导致数据丢失、安全漏洞或系统故障
- **HIGH**：反模式会导致功能损坏、行为错误或难以调试的问题
- **MEDIUM**：反模式会降低质量、可读性或可维护性
- **LOW**：反模式属于轻微的样式或约定问题

#### 7.5 根据反馈进行迭代

完成优化周期后，向用户征求对规则的反馈。 
- 如果用户认为规则很好，则可以停止优化周期。 
- 如果用户认为规则不好，则应更新规则以弥补缺漏。 
 
你应继续迭代，直到规则足够好为止。

## 完整规则示例

```markdown
---
title: Use Early Returns to Reduce Nesting
paths:
  - "**/*.ts"
---

# Use Early Returns to Reduce Nesting

Handle error conditions and edge cases at the top of functions using early returns. Deeply nested code increases cognitive load and makes logic harder to follow.

## Incorrect

Guard clauses are buried inside nested conditionals, making the happy path hard to find.

\`\`\`typescript
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        // actual logic buried 3 levels deep
        const total = calculateTotal(order.items)
        return submitOrder(order, total)
      } else {
        throw new Error('Order not pending')
      }
    } else {
      throw new Error('No items')
    }
  } else {
    throw new Error('No order')
  }
}
\`\`\`

## Correct

Error conditions are handled first with early returns, keeping the happy path at the top level.

\`\`\`typescript
function processOrder(order: Order) {
  if (!order) 
    throw new Error('No order')
  if (order.items.length === 0) 
    throw new Error('No items')
  if (order.status !== 'pending') 
    throw new Error('Order not pending')

  const total = calculateTotal(order.items)
  return submitOrder(order, total)
}
\`\`\`

## Reference

- [Flattening Arrow Code](https://blog.codinghorror.com/flattening-arrow-code/)
```

## 完整的路径限定规则示例

```markdown
---
title: API Endpoints Must Validate Input
paths:
  - "src/api/**/*.ts"
  - "src/routes/**/*.ts"
---

# API Endpoints Must Validate Input

Every API endpoint must validate request input before processing. Unvalidated input leads to runtime errors, security vulnerabilities, and data corruption.

## Incorrect

The handler trusts the request body without validation, allowing malformed data through.

\`\`\`typescript
export async function POST(req: Request) {
  const body = await req.json()
  const user = await db.users.create({
    email: body.email,
    name: body.name,
  })
  return Response.json(user)
}
\`\`\`

## Correct

Input is validated with a schema before use. Invalid requests receive a 400 response.

\`\`\`typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  const parsed = CreateUserSchema.safeParse(await req.json())
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const user = await db.users.create(parsed.data)
  return Response.json(user)
}
\`\`\`
```

## 反模式

### 缺少示例的模糊规则

```markdown
# 不佳：没有对比示例，过于模糊
Keep functions short and readable.
Use meaningful variable names.
```

**不佳的原因：** 没有明确的边界。不同智能体对“简短”的理解各不相同。没有通过错误/正确示例来校准行为。

### 本应作为技能的规则

```markdown
# Bad: Multi-step procedure in a rule
When deploying to production:
1. Run all tests
2. Check coverage thresholds
3. Build the project
4. Run integration tests
5. Deploy to staging first
...
```

**不佳的原因：** 规则应当是约束，而不是工作流。这些内容应当放在技能中。

### 重复的规则

```markdown
# Bad: Same guidance in two places
# .claude/rules/formatting.md says "use 2-space indent"
# CLAUDE.md also says "use 2-space indent"
```

**不佳的原因：** 当指导发生冲突时，智能体无法确定应当优先遵循哪一项。每项指导都应只保存在一个位置。

### 范围过宽的路径限定

```markdown
---
paths:
  - "**/*"
---
```

**不佳的原因：** 这等同于全局规则，却额外增加了路径匹配的开销。对于全局规则，应完全移除 `paths` 字段。

## 规则创建检查清单

- [ ] 已通过具体的“当前执行 X，但应执行 Y”陈述确定行为缺口
- [ ] 已确定规则类型：全局、路径限定或用户级
- [ ] 已编写对比示例：错误示例展示智能体可能犯下的合理错误
- [ ] 已编写对比示例：正确示例展示最小限度的修复
- [ ] 描述说明规则强制执行什么，以及为什么
- [ ] Frontmatter 包含 `title` 和 `impact`
- [ ] Token 预算：50-200 个单词（不包括代码示例）
- [ ] 每个规则文件只包含一个主题
- [ ] 不与 CLAUDE.md 或其他规则文件重叠
- [ ] 路径限定使用正确的 glob 模式（如适用）
- [ ] 文件放置在 `.claude/rules/` 中，并使用描述性的连字符文件名

## 核心结论

**有效的规则重在展示，而非仅仅告知。** 错误/正确对比模式消除了纯文本描述所留下的歧义。当智能体既能看到应避免什么，也能看到应产出什么时，遵循规则的程度会显著提高。

每条规则都应回答三个问题：
1. 这条规则强制执行**什么**行为？
2. 它**为什么**重要？
3. 正确与错误**有何**区别？（通过对比示例展示）


## Claude Code 官方规则指南

对于较大的项目，你可以使用 `.claude/rules/` 目录将指令组织到多个文件中。这可以使指令保持模块化，也更便于团队维护。规则还可以[限定到特定文件路径](#path-specific-rules)，这样它们只会在 Claude 处理匹配的文件时加载到上下文中，从而减少干扰并节省上下文空间。

<Note>
  规则会在每个会话中或打开匹配文件时加载到上下文中。对于无需始终保留在上下文中的任务特定指令，请改用[技能](/en/skills)；技能仅会在你调用它们，或 Claude 判断它们与你的提示相关时加载。
</Note>

### 设置规则

将 markdown 文件放在项目的 `.claude/rules/` 目录中。每个文件应涵盖一个主题，并使用具有描述性的文件名，例如 `testing.md` 或 `api-design.md`。系统会递归发现所有 `.md` 文件，因此你可以将规则组织到 `frontend/` 或 `backend/` 等子目录中：

```text  theme={null}
your-project/
├── .claude/
│   ├── CLAUDE.md           # Main project instructions
│   └── rules/
│       ├── code-style.md   # Code style guidelines
│       ├── testing.md      # Testing conventions
│       └── security.md     # Security requirements
```

没有 [`paths` frontmatter](#path-specific-rules) 的规则会在启动时加载，其优先级与 `.claude/CLAUDE.md` 相同。

### 特定路径规则

可以使用包含 `paths` 字段的 YAML frontmatter，将规则限定到特定文件。这些条件规则仅在 Claude 处理与指定模式匹配的文件时适用。

```markdown  theme={null}
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

没有 `paths` 字段的规则会无条件加载，并适用于所有文件。当 Claude 读取与模式匹配的文件时，特定路径规则会被触发，而不是在每次使用工具时触发。

在 `paths` 字段中使用 glob 模式，可按扩展名、目录或它们的任意组合来匹配文件：

| 模式                   | 匹配项                                  |
| ---------------------- | --------------------------------------- |
| `**/*.ts`              | 任意目录中的所有 TypeScript 文件        |
| `src/**/*`             | `src/` 目录下的所有文件                 |
| `*.md`                 | 项目根目录中的 Markdown 文件            |
| `src/components/*.tsx` | 特定目录中的 React 组件                 |

你可以指定多个模式，并使用大括号扩展在一个模式中匹配多个扩展名：

```markdown  theme={null}
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

### 使用符号链接在项目之间共享规则

`.claude/rules/` 目录支持符号链接，因此你可以维护一套共享规则，并将其链接到多个项目中。符号链接会被正常解析和加载，循环符号链接也会被检测到并妥善处理。

以下示例同时链接了一个共享目录和一个单独的文件：

```bash  theme={null}
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

### 用户级规则

`~/.claude/rules/` 中的个人规则适用于你机器上的每个项目。可将其用于非项目特定的偏好：

```text  theme={null}
~/.claude/rules/
├── preferences.md    # Your personal coding preferences
└── workflows.md      # Your preferred workflows
```

用户级规则会在项目规则之前加载，因此项目规则具有更高的优先级。