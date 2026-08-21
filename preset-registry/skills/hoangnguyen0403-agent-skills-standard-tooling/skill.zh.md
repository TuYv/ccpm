---
name: JavaScript Tooling
description: Development tools, linting, and testing for JavaScript projects.
metadata:
  labels: [tooling, javascript, eslint, prettier, testing]
  triggers:
    files: ['.eslintrc.*', 'jest.config.*', 'package.json']
    keywords: [eslint, prettier, jest, test, lint, build]
---
# JavaScript 工具链

## **优先级：P1（操作性）**

JavaScript 开发的必备工具链。

## 实施指南

- **代码检查**：ESLint（推荐配置 + Prettier）。保存时自动修复。
- **格式化**：Prettier。保存/提交时运行。
- **测试**：Jest/Vitest。测试与代码放在一起。覆盖率 >80%。
- **构建**：Vite（应用）、Rollup（库）。
- **包管理器**：同步版本（`npm`/`yarn`/`pnpm`）。

## 反模式

- **不要争论格式**：遵循 Prettier 规则。
- **不要提交未经测试的代码**：采用 TDD/编码后测试。
- **不要提交脏代码**：推送前进行代码检查。

## 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  rules: { 'no-console': 'warn', 'prefer-const': 'error' },
};
```

```json
// .prettierrc
{ "semi": true, "singleQuote": true, "printWidth": 80 }
```

```javascript
// jest.config.js
export default {
  coverageThreshold: { global: { lines: 80 } },
};
```

## 参考资料与示例

有关测试模式和 CI/CD：
请参阅 [references/REFERENCE.md](references/REFERENCE.md)。

## 相关主题

最佳实践 | 语言