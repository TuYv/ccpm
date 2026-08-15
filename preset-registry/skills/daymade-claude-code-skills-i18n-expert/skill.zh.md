---
name: i18n-expert
description: This skill should be used when setting up, auditing, or enforcing internationalization/localization in UI codebases (React/TS, i18next or similar, JSON locales), including installing/configuring the i18n framework, replacing hard-coded strings, ensuring en-US/zh-CN coverage, mapping error codes to localized messages, and validating key parity, pluralization, and formatting.
---
# I18n 专家

## 概述

完成一整套 i18n 配置与审计：配置 i18n 框架、将面向用户的字符串替换为键、确保各语言区域设置内容一致，并验证 en-US 和 zh-CN 的复数形式与格式化。

## 核心能力

- 库的选择与配置（React、Next.js、Vue）。
- 键架构和语言区域文件组织。
- 翻译生成与质量策略（AI、专业翻译、人工翻译）。
- 路由和语言检测/切换。
- SEO 和元数据本地化（适用时）。
- RTL 支持（仅当范围包含 RTL 语言区域时）。

## 范围输入（如不明确则询问）

- 框架和路由方式。
- 现有 i18n 状态（无、部分实现、旧版）。
- 目标语言区域（默认：en-US + zh-CN）。
- 翻译质量需求（AI、专业翻译或人工翻译）。
- 使用中的语言区域格式（JSON、YAML、PO、XLIFF）。
- 正式程度/文化要求（如有）。

## 工作流程（审计 -> 修复 -> 验证）

1) 确认范围和目标语言区域
- 确定 i18n 框架和语言区域文件位置。
- 确认语言区域；指定时默认为 en-US + zh-CN。

2) 配置 i18n 基线（如缺失）
- 选择适合框架的库（例如，React：react-i18next；Next.js：next-intl；Vue：vue-i18n）。
- 安装软件包并创建 i18n 入口/配置文件。
- 在应用根节点接入 provider，并加载语言区域资源。
- 根据需要添加语言切换器和持久化机制（路由/参数/localStorage）。
- 建立语言区域文件布局和键命名空间。
- 如果路由感知语言区域，应尽早定义语言区域路径段策略（子路径、子域名、查询参数）。
 - 如果元数据面向用户，请包含标题/描述的翻译。

3) 审计键使用情况和语言区域内容一致性
- 运行：
  ```bash
  python scripts/i18n_audit.py --src <src-root> --locale <path/to/en-US.json> --locale <path/to/zh-CN.json>
  ```
- 将缺失键/内容不一致问题视为阻塞项。
- 手动验证动态键（`t(var)`）。

4) 查找面向用户的原始字符串
- 搜索：
  ```bash
  rg -n --glob '<src>/**/*.{ts,tsx,js,jsx}' "<[^>]+>[^<{]*[A-Za-z][^<{]*<"
  rg -n --glob '<src>/**/*.{ts,tsx,js,jsx}' "aria-label=\"[^\"]+\"|title=\"[^\"]+\"|placeholder=\"[^\"]+\""
  ```
- 本地化无障碍标签。

5) 使用键替换字符串
- 对 UI 文本使用 `t('namespace.key')`。
- 对复数形式使用 `t('key', { count })` + `_one/_other` 键。
- 使用 Intl/应用格式化器处理时间/日期/数字。

6) 本地化错误处理（关键）
- 将错误代码映射到本地化键；UI 中仅显示本地化内容。
- 仅记录原始错误详情。
- 为未知代码提供本地化回退内容。

7) 更新语言区域文件
- 在两种语言区域中添加缺失的键。
- 保持占位符一致；除非明确要求，否则避免重命名。
- 使用约定的方法生成翻译；保留占位符和复数规则。

8) 验证
- 重新运行审计，直至缺失/内容不一致问题数量为零。
- 验证 JSON（例如，`python -m json.tool <file>`）。
- 更新断言可见文本的测试。

## 约束规则

- 切勿向 UI 暴露原始 `error.message`；仅显示本地化字符串。
- 除非明确要求，否则不要添加额外语言区域。
- 优先使用结构化命名空间（例如，`errors.*`、`buttons.*`、`workspace.*`）。
- 保持翻译简洁一致。
- 某些技术/品牌术语应保持不译（例如，产品名称、API、MCP、Bash）。

## 交付成果（预期输出）

- i18n 配置/Provider 接线。
- 每种目标语言的区域设置文件。
- 使用稳定键替换 UI 字符串。
- 语言切换器和持久化（如适用）。
- 更新针对可见文本的测试。

## 架构指导（保持简洁）

- 键结构：优先使用按区域划分的嵌套命名空间（例如 `common.buttons.save`、`pricing.tier.pro`）。
- 文件布局：每个区域设置使用一个文件，或按区域设置划分命名空间；确保各区域设置中的键保持同步。
- 占位符：原样保留 `{name}`/`{{name}}`；根据区域设置规则验证复数形式。
- 格式化：使用 Intl/应用辅助函数来格式化日期、时间、数字和列表。
- SEO/元数据：如果应用提供标题和描述，请将其本地化。
- RTL：仅 RTL 区域设置需要；使用逻辑 CSS 属性并测试布局。
- 非 Web 界面（Electron 主进程对话框、CLI 提示、原生菜单）也需要本地化。

## 性能注意事项（简短）

- 当应用支持时，延迟加载区域设置包。
- 按命名空间拆分大型区域设置文件。

## 失败模式（关注清单）

- 缺少翻译：回退到默认区域设置并记录警告。
- RTL 布局问题：检查逻辑 CSS 并测试页面。
- 缺少 SEO：在适用时确保替代链接和元数据已本地化。

## 验证清单（简短）

- 不存在缺失的键，也不存在原始 UI 字符串。
- 区域设置切换有效且能够持久保存。
- 已在两种区域设置中验证复数形式和格式化。
 - 已配置回退区域设置。

## 资源

### scripts/
- `scripts/i18n_audit.py`：提取 `t('key')` 的使用情况，并与区域设置 JSON 文件进行比较。