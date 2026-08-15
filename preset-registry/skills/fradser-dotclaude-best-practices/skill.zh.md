---
name: best-practices
description: Language-specific best practices, code quality standards, and framework detection rules. Use when executing refactoring workflows, applying code quality rules, detecting frameworks, or checking language-specific patterns for TypeScript, Python, Go, Swift, or React.
user-invocable: false
version: 1.3.0
---
# 最佳实践

## 语言参考文档

每种文件扩展名对应特定的参考文档：

- `.ts`、`.js` — `references/typescript.md`
- `.tsx`、`.jsx` — `references/typescript.md` + `references/react/react.md`
- `.py` — `references/python.md` + `references/python/INDEX.md`
- `.go` — `references/go.md`
- `.swift` — `references/swift.md`

通用原则位于 `references/universal.md`。

## Next.js/React 参考文档

对于 Next.js 项目，`references/react/` 目录提供：

1. `references/react/rules/INDEX.md` — 按影响级别划分的模式索引
2. `references/react/rules/_sections.md` — 优先级和类别
3. 与观察到的模式相匹配的具体规则文件

## 规则应用

- 特定于框架的规则（例如 Next.js）仅在检测到该框架时适用
- **关键**规则具有最高优先级：瀑布流、包体积、水合
- 所有重构都必须保留原有行为和公共接口

## 代码质量标准

- **注释**：仅用于复杂的业务逻辑；复述代码的注释没有必要
- **错误处理**：仅在错误可恢复时使用 try-catch；不要在可信路径中进行防御性检查
- **类型安全**：禁止使用 `any`；必须使用适当的类型，或使用带类型守卫的 `unknown`
- **风格**：现有代码风格和 CLAUDE.md 约定具有更高优先级
- **清理**：移除未使用的导入、变量、函数和类型
- **不使用兼容性补丁**：删除未使用的 `_vars` 以及对已删除代码的重新导出
- **重命名**：应优先使用描述性名称，而不是将名称标记为未使用
- **无用代码**：删除无用代码，绝不将其注释掉
- **文件组织**：单一职责原则同样适用于文件层面；包含多个关注点的文件应考虑拆分（参见 `references/universal.md`）