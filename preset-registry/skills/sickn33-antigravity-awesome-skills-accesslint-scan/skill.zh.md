---
name: accesslint-scan
description: "Audit a live page for accessibility issues, locate each WCAG violation precisely, and return a selector-grounded fix worklist without editing."
risk: safe
source: "https://github.com/AccessLint/skills"
date_added: "2026-06-02"
---
审计线上页面并报告哪些内容有问题及其所在位置。定位；不修复。如果 `$ARGUMENTS` 中没有 URL，请询问。

## 何时使用
- 当任务符合以下描述时使用此技能：审计线上页面的无障碍问题，精确定位每处 WCAG 违规，并在不做编辑的情况下返回一份基于选择器的修复工作清单。

## 1. 审计

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

按需使用的标志：`--selector`、`--wait-for "<selector>"`、`--include-aaa`、`--disable <rules>`。

## 2. 报告

先给出按影响程度统计的计数，然后每条违规一个条目：

- **位置** — 选择器原文 + `file:line (symbol)`（如存在 `source`）——绝不捏造。如果没有违规条目带有 `source`，则注明“源码映射不可用——仅按选择器定位”。
- **证据** — 对比度、缺失的属性、空的名称
- **修复** — 机械性修改或 `NEEDS HUMAN`

不要编辑。关于修复：先应用机械性修改，然后重新运行以验证；批量工作则移交给 `accesslint:audit`。

## 3. 清理

```bash
npx -y @accesslint/chrome@latest stop --all  # skip if ensure reported "managed":false
```

## 注意事项

- 端口始终由 `ensure` 决定——绝不要硬编码 9222。
- CLI 退出码 2 = URL 无效或页面始终未能加载；请检查开发服务器。

## 局限性
- 仅当任务明确符合上述范围时才使用此技能。
- 不要将输出视为针对特定环境的验证、测试或专家审查的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停下并请求澄清。
