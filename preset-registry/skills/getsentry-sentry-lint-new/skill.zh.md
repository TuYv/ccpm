---
name: lint-new
description: Create a new ESLint rule with tests for eslintPluginScraps. Use when asked to "create a lint rule", "add an eslint rule", "scaffold a rule", "write a new scraps rule", or "new design system lint rule". Covers rule creation, test authoring, registration, and autofix implementation.
---
创建一个名为 `$ARGUMENTS` 的新 ESLint 规则，加入 `eslintPluginScraps` 插件。

## 第 1 步：选择你的规则原型

阅读 [references/rule-archetypes.md](references/rule-archetypes.md)，选择与规则意图匹配的原型：

| 你想要实现的功能 | 原型 | 需要加载的参考文档 |
| ------------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| 重写 import 路径 | Import rewrite | 内嵌文档：简单模式 |
| 根据 CSS 属性验证 token/value 的使用 | Property validation | [style-collector-guide.md](references/style-collector-guide.md) |
| 限制特定 props 中的 JSX 元素 | JSX structural | [rule-archetypes.md](references/rule-archetypes.md) §Archetype 3 |
| 检测静态 CSS 文本中的模式 | Template text analysis | [rule-archetypes.md](references/rule-archetypes.md) §Archetype 4 |

在编写代码之前，阅读相关参考文档。这些原型会说明应使用哪些 AST 访问器、哪些共享工具适用，以及每种方法中哪些模式不适用。

## 第 2 步：检查共享工具

在编写 AST 遍历逻辑之前，检查 `static/oxlint/eslintPluginScraps/src/ast/` 中是否有可复用的代码：

| 工具 | 位置 | 用途 |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `getStyledCallInfo` | `src/ast/utils/styled.ts` | 将 styled/css 调用分类为 element、component 或 css |
| `createQuasiScanner` | `src/ast/scanner/index.ts` | 扫描模板字面量中的静态 CSS 文本（Archetype 4） |
| `createImportTracker` | `src/ast/tracker/imports.ts` | 解析本地名称的导入来源 |
| `createStyleCollector` | `src/ast/extractor/index.ts` | 收集 CSS-in-JS _动态值_ 声明（不是静态文本） |
| `shouldAnalyze` | `src/ast/extractor/index.ts` | 通过快速预扫描跳过不包含 Emotion 使用的文件 |
| `normalizePropertyName` | `src/ast/utils/normalizePropertyName.ts` | 规范化 CSS 属性名称 |
| `decomposeValue` | `src/ast/extractor/value-decomposer.ts` | 将复杂表达式拆分为所有可能的值 |
| Theme tracker | `src/ast/tracker/theme.ts` | 跟踪 `useTheme()` 和回调中的 theme 绑定 |

如果已有其他规则解决了类似问题，请将共享逻辑提取到 `src/ast/utils/`，并进行复用。

## 第 3 步：创建文件

1. **规则**：`static/oxlint/eslintPluginScraps/src/rules/$ARGUMENTS.ts`
2. **测试**：`static/oxlint/eslintPluginScraps/src/rules/$ARGUMENTS.spec.ts`

### 规则模板

```typescript
import {ESLintUtils} from '@typescript-eslint/utils';

export const $RULE_NAME = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    docs: {
      description: '[Rule description]',
    },
    fixable: 'code', // include if rule has autofix — see Autofix Guidance
    schema: [],
    messages: {
      forbidden: 'Error message shown to user',
    },
  },
  create(context) {
    return {
      // AST visitor methods — see your chosen archetype
    };
  },
});
```

如果你的规则需要可配置选项，请加载 [references/schema-patterns.md](references/schema-patterns.md)。

### 测试模板

```typescript
import {RuleTester} from '@typescript-eslint/rule-tester';

import {$RULE_NAME} from './$ARGUMENTS';

const ruleTester = new RuleTester();

ruleTester.run('$ARGUMENTS', $RULE_NAME, {
  valid: [
    {
      code: '// valid code',
      filename: '/project/src/file.tsx',
    },
  ],
  invalid: [
    {
      code: '// invalid code',
      filename: '/project/src/file.tsx',
      errors: [{messageId: 'forbidden'}],
      output: '// expected output after autofix', // REQUIRED for fixable rules
    },
  ],
});
```

运行测试：

```bash
pnpm test-ci "static/oxlint/eslintPluginScraps/src/rules/$ARGUMENTS.spec.ts"
```

## 自动修复指南

**默认应实现自动修复**，除非转换存在歧义，或可能改变运行时行为。

### 安全的自动修复模式

- 重写导入路径（参见作为规范示例的 `no-core-import.ts`）
- 添加或移除具有已知值的 JSX 属性
- 将表达式包装在已知组件中
- 在不存在变量遮蔽风险的情况下重命名标识符

### 不要实现自动修复的情况

- 存在多个有效修复方案，且正确选择需要人工判断
- 修复需要 AST 中不可用的类型信息
- 更改控制流或运行时行为
- 更改跨越多个文件

### 修复器 API

```typescript
context.report({
  node,
  messageId: 'forbidden',
  fix(fixer) {
    return fixer.replaceText(node, newText);
    // Also: fixer.replaceTextRange([start, end], text)
    //        fixer.insertTextBefore(node, text)
    //        fixer.insertTextAfter(node, text)
    //        fixer.remove(node)
    // Return single fix or array of fixes
  },
});
```

如果规则可自动修复，则每个无效测试用例都 MUST 包含 `output`，用于展示修复后的预期代码。

## 第 4 步：注册规则

### 1. 规则索引

添加到 `static/oxlint/eslintPluginScraps/src/rules/index.ts`：

```typescript
import {$RULE_NAME} from './$ARGUMENTS';

export const rules = {
  // existing rules...
  $ARGUMENTS: $RULE_NAME,
};
```

### 2. ESLint 配置

在 `name: 'plugin/@sentry/scraps'` 代码块中，将以下内容添加到 `eslint.config.ts`：

```typescript
'@sentry/scraps/$ARGUMENTS': 'error',
// or with options:
'@sentry/scraps/$ARGUMENTS': ['error', { /* options */ }],
```

### 3. 验证

```bash
pnpm test-ci "static/oxlint/eslintPluginScraps/src/rules/$ARGUMENTS.spec.ts"
```

## 扩展现有规则

如果是修改现有规则，而不是创建新规则：

1. 阅读现有规则及其配置文件，了解其架构
2. 对于**配置驱动的规则**（如 `use-semantic-token`）：更改通常只需编辑配置文件（例如 `src/config/tokenRules.ts`），无需修改规则逻辑
3. 注意反向映射带来的副作用：添加新类别可能会改变共享属性所**建议**的类别（在 `buildPropertyToRule` 中，后写入的规则优先）
4. 针对行为变化更新现有测试，然后添加新的测试用例

## 命名约定

- **规则名称**（kebab-case）：`my-rule-name` — 动词-名词模式（例如 `no-token-import`、`use-semantic-token`）
- **导出名称**（camelCase）：`myRuleName`
- **文件名**：与规则名称完全一致（`my-rule-name.ts`、`my-rule-name.spec.ts`）