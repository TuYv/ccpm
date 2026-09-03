---
name: ccusage-docs
description: Guides ccusage VitePress documentation work. Use when editing docs, screenshots, accessibility, schema-copy behavior, markdown linting, or user-facing guides.
---
# ccusage 文档

docs 包是位于 `docs/` 目录下的 VitePress 站点。

## 命令

```sh
pnpm --filter docs dev
pnpm --filter docs build
pnpm --filter docs preview
pnpm --filter docs format
pnpm --filter docs typecheck
```

docs 构建会在运行 VitePress 之前，将 `apps/ccusage/config-schema.json` 复制到 `docs/public/config-schema.json`。

## 结构

- `README.md` 和 `apps/ccusage/README.md` - 软件包入口文件，涵盖支持的来源、常用命令、功能特性和安装示例
- `docs/guide/` - 用户指南和教程
- `docs/public/` - 截图、静态资源和生成的配置 schema
- `docs/.vitepress/` - VitePress 配置和主题自定义

## 内容规则

- 在新增或修改面向用户的 agent、命令、选项、报告模式或示例时，完成前需审查并更新根目录 `README.md`、`apps/ccusage/README.md`、相关的 `docs/guide/` 页面、相关交叉链接以及 VitePress 导航。
- 在新增或编辑的文档中优先使用统一命令形式：`ccusage codex ...`、`ccusage opencode ...`、`ccusage amp ...` 和 `ccusage pi ...`。
- 独立的包装命令（如 `ccusage-codex`、`ccusage-opencode`、`ccusage-amp` 和 `ccusage-pi`）已被移除。不要在文档中推广或重新引入它们。
- 当指南有主截图时，将截图紧接在页面 H1 之后放置。
- 对于 `docs/public/` 中的文件，使用相对图片路径，例如 `/screenshot.png`。
- 始终为截图和图片提供描述性替代文本（alt text）。
- 当指南已有固定的截图模式时，以视觉内容开篇。
- 在有帮助之处，为相关指南和 JSON 输出文档添加交叉链接。
- 对于需要 ESLint 跳过的 markdown 代码块，在该代码块之前放置 `<!-- eslint-skip -->`。

已知的以截图为主的指南包括：

- `docs/guide/index.md`
- `docs/guide/daily-reports.md`
- `docs/guide/live-monitoring.md`
