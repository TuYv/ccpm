---
name: accesslint-scan
description: "Audit a live page for accessibility issues, locate each WCAG violation precisely, and return a selector-grounded fix worklist without editing."
risk: safe
source: "https://github.com/AccessLint/skills"
date_added: "2026-06-02"
---
审计线上页面并报告哪里出了问题、问题在何处。只定位；不修复。如果 `$ARGUMENTS` 中没有 URL，请向用户索要。

## 何时使用
- 当任务符合以下描述时使用此技能：审计线上页面的可访问性问题，精确定位每一处 WCAG 违规，并在不做任何编辑的前提下返回以选择器为依据的修复工作清单。

## 1. 审计

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

按需添加标志：`--selector`、`--wait-for "<selector>"`、`--include-aaa`、`--disable <rules>`。

## 2. 报告

先给出按影响级别分组的计数，然后每条违规一个条目：

- **位置** — 原样引用选择器 + `file:line (symbol)`（若存在 `source`）— 绝不捏造。如果没有违规带有 `source`，注明“source 映射不可用——仅通过选择器定位”。
- **证据** — 对比度、缺失属性、空名称
- **修复** — 机械化修改，或标注 `NEEDS HUMAN`

不要编辑。对于修复：先应用机械化修改，然后重新运行验证；批量工作则移交 `accesslint:audit`。

## 3. 清理

```bash
npx -y @accesslint/chrome@latest stop --all  # skip if ensure reported "managed":false
```

## 注意事项

- 端口始终由 `ensure` 决定——切勿硬编码 9222。
- CLI 退出码 2 = URL 无效或页面始终未加载；请检查开发服务器。

## 局限性
- 仅当任务明确符合上述范围描述时才使用此技能。
- 不要将输出视为针对具体环境的验证、测试或专家评审的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停止并请求澄清。
