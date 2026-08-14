---
name: skill-model-updater
description: Updates model references across all skill files when new Claude models are released. Use when Anthropic releases new Claude models to keep skills current.
argument-hint: <"check" | "update" | "update --dry-run">
model: claude-haiku-4-5-20251001
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---
## 你的任务

**命令**：$ARGUMENTS

根据命令执行以下操作：
1. **check** - 发现当前模型、扫描所有技能并报告状态
2. **update** - 将过时模型更新为当前版本
3. **update --dry-run** - 显示将要更新的内容，但不进行任何更改

---

# 技能模型更新器

你负责维护所有技能文件中的模型时效性，确保技能使用最新的 Claude 模型。

---

## 第 1 步：发现当前模型

**在检查或更新技能之前，你必须先发现当前的模型 ID。**

### 发现方法

1. **搜索当前的 Anthropic 模型：**
   ```
   WebSearch: "Anthropic Claude model IDs 2025" OR "Claude API models list current"
   ```

2. **获取官方文档：**
   ```
   WebFetch: https://docs.anthropic.com/en/docs/about-claude/models
   ```

3. **提取各层级当前的模型 ID**：
   - **Opus**（能力最强）- 查找 `claude-opus-*` 或 `claude-*-opus-*`
   - **Sonnet**（均衡）- 查找 `claude-sonnet-*` 或 `claude-*-sonnet-*`
   - **Haiku**（快速）- 查找 `claude-haiku-*` 或 `claude-*-haiku-*`

4. 根据日期后缀**确定各层级的最新版本**（例如，`20250514` > `20250114`）

### 预期输出格式

发现后，报告：
```
CURRENT CLAUDE MODELS (discovered)
==================================
Source: docs.anthropic.com/en/docs/about-claude/models
Date checked: [today's date]

Opus:   claude-opus-4-5-20251101
Sonnet: claude-sonnet-4-5-20250929
Haiku:  claude-haiku-4-5-20251001
```

**简写别名**（始终有效，并解析为当前模型）：
- `opus` → 当前 Opus 模型
- `sonnet` → 当前 Sonnet 模型
- `haiku` → 当前 Haiku 模型

---

## 工作流程

### 检查模式

```bash
/skill-model-updater check
```

1. **发现当前模型**（参见上面的第 1 步）- 使用 WebSearch/WebFetch 查询 Anthropic 文档
2. 使用 Glob 查找所有 `skills/*/SKILL.md` 文件
3. 从 YAML frontmatter 中提取 `model:` 字段
4. 与发现的当前模型进行比较
5. **检查 CLAUDE.md** - 扫描 `${CLAUDE_PLUGIN_ROOT}/CLAUDE.md` 中的 `Co-Authored-By: Claude` 行，并验证模型名称是否为当前名称
6. 报告每个技能和 CLAUDE.md 的状态

**输出格式：**
```
SKILL MODEL AUDIT
=================

Current Models (discovered from docs.anthropic.com):
- Opus: claude-opus-4-5-20251101
- Sonnet: claude-sonnet-4-5-20250929
- Haiku: claude-haiku-4-5-20251001

Skill Status:
✓ lyric-writer: claude-opus-4-5-20251101 (current)
✓ researcher: claude-sonnet-4-5-20250929 (current)
⚠ album-art-director: claude-sonnet-4-20250114 (outdated → claude-sonnet-4-5-20250929)
✓ import-audio: claude-haiku-4-5-20251001 (current)

Summary: 19/20 skills current, 1 needs update
```

### 更新模式

```bash
/skill-model-updater update
```

1. **发现当前模型**（参见上面的第 1 步）
2. 运行检查以识别过时的技能
3. 对于每个使用过时模型的技能：
   - 读取 SKILL.md 文件
   - 将 `model:` 字段更新为发现的当前版本
   - 保留该技能的模型层级（不要将 Opus 更改为 Sonnet）
4. **更新 CLAUDE.md** - 如果 `${CLAUDE_PLUGIN_ROOT}/CLAUDE.md` 中的 `Co-Authored-By` 行引用了过时的模型名称，则将其更新为当前名称
5. 报告所做的更改

**输出格式：**
```
SKILL MODEL UPDATE
==================

Models discovered from docs.anthropic.com:
- Opus: claude-opus-4-5-20251101
- Sonnet: claude-sonnet-4-5-20250929
- Haiku: claude-haiku-4-5-20251001

Updated 1 skill:
- album-art-director: claude-sonnet-4-20250114 → claude-sonnet-4-5-20250929

All skills now current.
```

### 试运行模式

```bash
/skill-model-updater update --dry-run
```

与更新操作相同，但只报告将发生的更改，不会编辑文件。

---

## 模型检测逻辑

### 识别过时模型

如果满足以下任一条件，则模型已过时：
1. 它是当前模型系列的旧版本（例如，`claude-sonnet-4-20250114` 对比 `claude-sonnet-4-5-20250929`）
2. 它是已弃用的模型（例如，`claude-3-opus-20240229`）

### 层级检测（自动）

从技能现有的 `model:` 字段检测层级——无需硬编码层级列表：
- 如果模型包含 `opus` → 更新为当前 opus
- 如果模型包含 `sonnet` → 更新为当前 sonnet
- 如果模型包含 `haiku` → 更新为当前 haiku
- 如果模型使用简写形式（`opus`、`sonnet`、`haiku`）→ 保持不变（始终解析为当前版本）

这样无需维护单独的映射，即可保留有意设置的层级分配。

---

## 新模型发布时

此技能会自动发现模型，并从现有分配中检测层级。

当 Anthropic 发布新模型时：

1. **运行检查**——`/skill-model-updater check` 将自动发现新模型
2. **审查更改**——验证发现的模型是否正确
3. **运行更新**——使用 `/skill-model-updater update` 传播更改

**注意**：层级分配记录在 `${CLAUDE_PLUGIN_ROOT}/reference/model-strategy.md` 中。此技能会保留现有层级——它只更新版本号。

---

## 示例：完整更新周期

```markdown
User: "New Claude models released, update skills"

1. Run check (discovers models automatically):
   /skill-model-updater check

   Output:
   - Discovered from docs.anthropic.com: Opus 4.5, Sonnet 4, Haiku 3.5
   - 3 skills using outdated sonnet (20250114 → 20250514)
   - 1 skill using deprecated opus (claude-3-opus → claude-opus-4-5)

2. Run dry-run:
   /skill-model-updater update --dry-run

   Output shows proposed changes

3. Run update:
   /skill-model-updater update

   Output confirms 4 skills updated

4. Verify:
   /skill-model-updater check

   Output: All 21 skills current
```

---

## 错误处理

### 缺少模型字段
如果某个 SKILL.md 没有 `model:` 字段：
- 报告为“⚠ [skill]：未指定模型”
- 不要自动添加（需要手动决定）

### 未知模型
如果某个 SKILL.md 使用了无法识别的模型：
- 报告为“? [skill]：未知模型 '[model-id]'”
- 不要更新（需要手动审查）

### 无效的 YAML
如果某个 SKILL.md 的 frontmatter 格式错误：
- 报告为“✗ [skill]：无效的 YAML frontmatter”
- 不要尝试更新

---

## 范围

此技能会更新以下位置中的模型引用：
1. **所有 `skills/*/SKILL.md` 文件**——YAML frontmatter 中的 `model:` 字段
2. **`CLAUDE.md`**——版本控制部分中的 `Co-Authored-By: Claude [Model] <noreply@anthropic.com>` 行

两个位置都必须与最新的 Claude 模型名称保持同步。

---

## 请记住

- **更新前检查** - 始终清楚将发生哪些变化
- **自动检测层级** - Skill 会读取现有的 model 字段来确定层级（opus/sonnet/haiku）
- **简写是安全的** - `opus`、`sonnet`、`haiku` 始终会解析为当前版本
- **层级选择依据** - 有关每个 Skill 为何使用相应层级，请参阅 `${CLAUDE_PLUGIN_ROOT}/reference/model-strategy.md`
- **CLAUDE.md 共同作者行** - 必须反映用于提交的当前最高层级模型名称