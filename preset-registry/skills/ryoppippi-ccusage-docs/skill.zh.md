---
name: docs
description: Routes ccusage documentation impact work. Use when code or behavior changes affect README files, docs guides, VitePress navigation, screenshots, schema docs, or user-facing commands/options, and when auditing whether a change needs docs at all.
---
# ccusage 文档

文档影响范围取决于用户能观察到什么，而非哪些目录发生了变化。内部重构、仅涉及测试的改动以及技能维护无需更新文档；任何会改变用户可运行、可查看或可配置内容的改动，都需要把每一个文档面都过一遍检查，而不只是你最初着手的那份指南页面：

- 根目录 `README.md`
- `apps/ccusage/README.md`
- 相关的 `docs/guide/` 页面及其交叉链接
- `docs/.vitepress/` 中的 VitePress 导航

然后在动笔之前，先阅读本地约定：

- `docs/README.md` - 站点结构、schema 复制行为、`just docs::*` 配方。
- `docs/AGENTS.md` - 截图的放置与替代文本、交叉链接、lint 豁免写法。
- `apps/ccusage/AGENTS.md` - 在修改会发布到 npm 的 README 内容之前。
