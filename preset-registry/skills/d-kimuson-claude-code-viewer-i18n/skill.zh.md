---
name: i18n
description: "Use when updating Lingui catalogs or fixing translations"
disable-model-invocation: false
user-invocable: true
---
## 核心规则

- English（`en`）是源目录。不要修改键；只更新翻译。
- 完整保留占位符和 ICU 语法（例如 `{name}`、`{count, plural, one {...} other {...}}`）。
- 适当保留 English 技术术语（API、TypeScript、React）。

## 翻译更新

- 只更新 `src/lib/i18n/locales/{locale}/messages.json`；不要手动编辑编译产物。
- 使用 `./scripts/put-transtation.js` 安全地更新特定条目，而无需将整个文件加载到上下文中。

## 验证

- 添加新消息时，运行 `pnpm lingui:extract`。
- 运行 `pnpm lingui:compile` 以重新生成编译后的目录。
- 运行 `scripts/lingui-check.sh` 以验证没有缺失的翻译。
- 运行 `scripts/i18n-check-key-equals-translation.sh` 以确保所有语言区域中的键与翻译不相同。