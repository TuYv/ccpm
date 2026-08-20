---
name: changelog
description: Automatically creates user-facing changelogs from git commits by analyzing commit history, categorizing changes, and transforming technical commits into clear, customer-friendly release notes. Turns hours of manual changelog writing into minutes of automated generation.
---
# 变更日志与版本管理 Skill

此 Skill 可将技术性的 Git 提交转换为经过润色、面向用户的变更日志，让客户和用户能够理解并认可这些变更。

## 何时使用

- 为新版本准备发布说明
- 记录网站变更
- 创建或编辑文档页面
- 确保所有内容的写作风格一致

## 功能说明

1. **扫描 Git 历史记录**：分析特定时间段内或两个版本之间的提交。
2. **对变更进行分类**：将提交归入不同的逻辑类别（`features`、`improvements`、`bug fixes`、`breaking changes`）。
3. **将技术语言转换为用户友好的语言**：把开发者提交转换为客户易于理解的表述。
4. **专业化格式编排**：按照 Kubb 规范创建简洁、结构清晰的变更日志条目。
5. **过滤无关内容**：排除内部提交（`refactor`、`test` 等）。
6. **遵循最佳实践**：应用变更日志编写指南和你的品牌语言风格。

Kubb 使用 Changesets 进行版本管理，并在 `docs/changelog.md` 中维护完整的变更日志。

## Changeset 工作流

### 创建 Changeset

对于每个包含代码变更的 PR，都需要创建一个 Changeset：

```bash
pnpm changeset
```

**交互式提示：**

1. 选择受影响的软件包
2. 选择版本升级类型（主版本 / 次版本 / 补丁版本）
3. 编写简明的变更摘要

### 版本升级类型

| 类型             | 说明                                          |
| ---------------- | ---------------------------------------------------- |
| 主版本（破坏性变更） | 会破坏现有功能的变更            |
| 次版本（功能）  | 不会破坏现有功能的新功能 |
| 补丁版本（修复）      | Bug 修复和细微改进                     |

## 变更日志格式

变更日志在 `docs/changelog.md` 中遵循特定的结构。

- 版本标题使用 `##`（而不是 `#`）。
- 变更类型章节使用 `###`，并添加 emoji 前缀。
- 各个插件名称及其链接使用 `####`。

变更类型：

| 类别            | 说明                            |
| ------------------- | -------------------------------------- |
| ✨ 功能         | 新功能和增强功能     |
| 🐛 Bug 修复        | Bug 修复和更正              |
| 🚀 破坏性变更 | 可能需要更新代码的变更  |
| 📦 依赖项     | 软件包更新和依赖项变更 |

**示例：**

## 2.5.0

### ✨ 功能

#### `plugin-ts`

新增了通过 `unionType` 选项生成联合类型的支持。

::: code-group

```typescript [Before]
// Generated separate types
export type PetDog = { type: 'dog'; bark: string }
export type PetCat = { type: 'cat'; meow: string }
```

```typescript [After]
export type Pet = PetDog | PetCat
```

:::

## 变更日志风格

### 记录 Bug 修复

修复影响用户行为的 Bug 时：

1. **更新相关文档**

- 修正错误示例
- 澄清含糊不清的描述
- 如果适用，更新故障排除指南

2. **添加到变更日志**（通过 `pnpm changeset`）

- 说明原有问题
- 展示正确用法
- 链接到相关文档

3. **考虑添加迁移说明**

- 如果修复改变了预期行为
- 在迁移指南中添加修改前/修改后的示例

**示例：**

## 修复错误的枚举类型输出

**问题**：`enumType: 'asConst'` 生成了无效的 TypeScript

**修复**：现在可以正确生成：

```typescript
const petType = {
  Dog: 'dog',
  Cat: 'cat',
} as const
```

## 相关技能

| 技能                                                      | 用途             |
| ---------------------------------------------------------- | ------------------- | ------------------------------------------ |
| **[../documentation/SKILL.md](../documentation/SKILL.md)** | 文档风格 | 为变更日志条目添加文档 |

## 检查清单

- [ ] 所有代码更改都有对应的文档更新
- [ ] 前置元数据完整且正确
- [ ] 已通过 `pnpm changeset` 更新变更集（针对代码更改）
- [ ] 已在 `docs/changelog.md` 中添加或更新变更日志

## 资源

- Changesets 文档：https://github.com/changesets/changesets
- VitePress Markdown 扩展：https://vitepress.dev/guide/markdown