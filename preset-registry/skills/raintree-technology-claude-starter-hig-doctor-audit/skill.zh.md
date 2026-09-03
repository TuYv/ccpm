---
name: hig-doctor-audit
description: "HIG Doctor audit workflow for scanning app projects against Apple Human Interface Guidelines. Use when the user asks for a HIG audit, Apple UI compliance scan, accessibility/design lint, HIG Doctor, severity report, CI gate, or wants to verify SwiftUI, UIKit, React, Next.js, Vue, Svelte, Angular, React Native, Flutter, Compose, Android XML, CSS, or HTML against Apple HIG rules."
---
# HIG Doctor 审计

将本技能作为 Apple HIG 工作的验证闭环。它与 `hig-*` 参考技能互为补充：先运行审计找出具体问题，再使用对应的 HIG 技能和参考主题来修复它们。

## 工具

HIG Doctor 的文档位于 <https://apple.raintree.technology>，并以 `hig-doctor` 为名发布。

```bash
npx hig-doctor ./path/to/project
npx hig-doctor ./path/to/project --export
npx hig-doctor ./path/to/project --stdout
npx hig-doctor ./path/to/project --json
npx hig-doctor ./path/to/project --fail-on critical
```

已发布的包需要 Node 20+。从本地源码仓库运行时，Bun 入口为：

```bash
cd /path/to/hig-doctor/packages/hig-doctor/src-termcast
bun run audit ./path/to/project
```

## 工作流程

1. 确认项目路径以及目标平台/框架。
2. 运行 `npx hig-doctor <path> --export` 获取人类可读的 `hig-audit.md`，或使用 `--json` 以供 CI/脚本使用。
3. 如果输出内容较多，优先关注 `critical`，其次是 `serious`，再次是高置信度的 `moderate` 问题。
4. 将每个类别的 `skill` 字段映射到对应的本地 HIG 技能，例如 `hig-foundations` 或 `hig-components-controls`。
5. 只阅读被标记问题所需的特定 HIG 参考主题。
6. 修复具体的代码问题，并使用相同的参数重新运行审计。
7. 对于 CI，先使用 `--fail-on critical`。仅在现有严重问题清理完毕后，再将阈值提升到 `serious`。

## 忽略文件

对有意编写的测试夹具、生成的输出、stories 或演示内容，使用 `.higauditignore`：

```text
**/*.stories.tsx
examples
components/audit-demo-fixtures.ts
```

保持忽略范围尽量窄。不要为了让审计通过而隐藏应用 UI 代码。

## 解读

- `critical`：破坏无障碍性或阻断交互。除非明确是误报，否则视为发布阻断项。
- `serious`：显著的 HIG 或 UX 退化。在发布可见 UI 前修复。
- `moderate`：风格或最佳实践偏移。当同一问题在设计系统中反复出现时批量处理。
- `positive`：有用的证据，而非待办工作。

HIG Doctor 基于正则表达式。在编辑之前，请对照代码和相关的 HIG 参考核实每一个发现项。
