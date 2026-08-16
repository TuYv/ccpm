---
name: lint-new
description: Create a new ESLint rule with tests for eslintPluginScraps. Use when asked to "create a lint rule", "add an eslint rule", "scaffold a rule", "write a new scraps rule", or "new design system lint rule". Covers rule creation, test authoring, registration, and autofix implementation.
---
在 eslintPluginScraps 插件中创建一个名为 `$ARGUMENTS` 的新 ESLint 规则。

## 第 1 步：选择原型

阅读 [references/rule-archetypes.md](references/rule-archetypes.md)，并选择符合你的规则意图的原型：

| 你想要……                                    | 原型                   | 需要加载的参考资料                                                 |
| ------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| 重写导入路径                                | 导入重写               | 内联——简单模式                                                   |
| 按 CSS 属性验证 token/值的使用方式           | 属性验证               | [style-collector-guide.md](references/style-collector-guide.md)  |
| 限制特定 props 中的 JSX 元素                 | JSX 结构               | [rule-archetypes.md](references/rule-archetypes.md) §Archetype 3 |
| 检测静态 CSS 文本中的模式                    | 模板文本分析           | [rule-archetypes.md](references/rule-archetypes.md) §Archetype 4 |

在编写代码之前，请先阅读相关参考资料。原型文档说明了应使用哪些 AST visitor、适用哪些共享工具，以及每种方法不适合使用哪些模式。

## 第 2 步：检查共享工具

在编写 AST 遍历逻辑之前，请检查 `static/eslint/eslintPluginScraps/src/ast/` 中是否有可复用的代码：

| 工具                    | 位置                                     | 用途                                                                |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `getStyledCallInfo`     | `src/ast/utils/styled.ts`                | 将 styled/css 调用分类为 element、component 或 css                   |
| `createQuasiScanner`    | `src/ast/scanner/index.ts`               | 扫描模板字面量中的静态 CSS 文本（原型 4）                            |
| `createImportTracker`   | `src/ast/tracker/imports.ts`             | 解析本地名称是从何处导入的                                          |
| `createStyleCollector`  | `src/ast/extractor/index.ts`             | 收集 CSS-in-JS 的_动态值_声明（不包括静态文本）                      |
| `shouldAnalyze`         | `src/ast/extractor/index.ts`             | 快速预扫描，以跳过未使用 Emotion 的文件                              |
| `normalizePropertyName` | `src/ast/utils/normalizePropertyName.ts` | 规范化 CSS 属性名称                                                 |
| `decomposeValue`        | `src/ast/extractor/value-decomposer.ts`  | 将复杂表达式分解为所有可能的值                                      |
| 主题跟踪器              | `src/ast/tracker/theme.ts`               | 跟踪 `useTheme()` 和回调中的 theme 绑定                              |

如果已有其他规则解决了类似问题，请将共享逻辑提取到 `src/ast/utils/` 中并复用。

## 第 3 步：创建文件

1. **规则**：`static/eslint/eslintPluginScraps/src/rules/$ARGUMENTS.ts`
2. **测试**：`static/eslint/eslintPluginScraps/src/rules/$ARGUMENTS.spec.ts`

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
pnpm test-ci "static/eslint/eslintPluginScraps/src/rules/$ARGUMENTS.spec.ts"
```

## 自动修复指南

**默认立场：实现自动修复**，除非转换存在歧义或可能改变运行时行为。

### 安全的自动修复模式

- 重写导入路径（以 `no-core-import.ts` 为标准示例）
- 添加/移除具有已知值的 JSX 属性
- 使用已知组件包裹表达式
- 不存在遮蔽风险的标识符重命名

### 以下情况不要自动修复

- 存在多种有效的修复方式，且正确选择需要人工判断
- 修复需要仅凭 AST 无法获得的类型信息
- 转换会改变控制流或运行时行为
- 更改涉及多个文件

### Fixer API

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

当规则可修复时，每个无效测试用例都必须包含 `output`，用于展示修复后的预期代码。

## 第 4 步：注册规则

### 1. 规则索引

添加到 `static/eslint/eslintPluginScraps/src/rules/index.ts`：

```typescript
import {$RULE_NAME} from './$ARGUMENTS';

export const rules = {
  // existing rules...
  $ARGUMENTS: $RULE_NAME,
};
```

### 2. ESLint 配置

添加到 `eslint.config.ts` 中的 `name: 'plugin/@sentry/scraps'` 块内：

```typescript
'@sentry/scraps/$ARGUMENTS': 'error',
// or with options:
'@sentry/scraps/$ARGUMENTS': ['error', { /* options */ }],
```

### 3. 验证

```bash
pnpm test-ci "static/eslint/eslintPluginScraps/src/rules/$ARGUMENTS.spec.ts"
```

## 扩展现有规则

如果是修改现有规则，而不是创建新规则：

1. 阅读现有规则及其配置文件，以了解其架构
2. 对于**配置驱动的规则**（例如 `use-semantic-token`）：通常只需编辑配置文件（例如 `src/config/tokenRules.ts`），而无须修改规则逻辑
3. 注意反向映射的副作用——添加新类别可能会改变共享属性所_建议_使用的类别（在 `buildPropertyToRule` 中，最后写入者优先）
4. 更新现有测试以适配所有发生变化的行为，然后添加新的测试用例

## 命名约定

- **规则名称**（kebab-case）：`my-rule-name`——采用动词-名词模式（例如 `no-token-import`、`use-semantic-token`）
- **导出名称**（camelCase）：`myRuleName`
- **文件名**：与规则名称完全一致（`my-rule-name.ts`、`my-rule-name.spec.ts`）