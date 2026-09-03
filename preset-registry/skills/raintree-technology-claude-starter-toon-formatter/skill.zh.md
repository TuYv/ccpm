---
name: toon-formatter
description: Guidance on when and how to use TOON (Token-Oriented Object Notation) — a compact JSON alternative that typically cuts input tokens 30-50% on tabular data. Use when the user is about to paste or serialize a large JSON array into a prompt, has a payload with ≥5 uniform objects, or is optimizing an LLM pipeline for cost/context. Knows the format shapes (tabular `[N]{a,b}:` rows, inline `[N]: ...`, expanded), when TOON helps vs hurts, and how to invoke installed TOON commands or wrappers when available. Example queries — "convert this API response to TOON", "will this JSON benefit from TOON", "how does TOON handle nested objects".
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---
# TOON v2.0 格式化器

当 TOON 能够实质性缩减提示词体积、且不会使载荷更难检查或验证时，就使用它。它对大型的、高度同构的数组效果最好，对小型、嵌套或不规则的数据效果最差。

## 何时使用

**是 - 自动使用：**
- 包含 ≥5 个相似条目的数组
- 表格、日志、事件、事务、分析数据
- 字段统一度 ≥60% 的 API 响应
- 数据库结果、指标、基准测试数据

**否 - 保持为 JSON：**
- 小型数组（<5 个条目）
- 深度嵌套或非同构的数据
- 叙述性文本、指令

## 快速参考

**表格形式**（同构对象）：
```
[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Carol,user
```

**内联形式**（原始值 ≤10 个）：
```
tags[4]: js,react,node,api
```

**分隔符：** 逗号（默认）、制表符 `[N\t]`、竖线 `[N|]`

**键折叠**（嵌套对象）：
```
server.host: localhost
server.port: 8080
```

## 运行时选项

```bash
# Claude installs include slash commands that call this wrapper:
node .claude/utils/toon/cli.mjs encode data.json

# With options:
node .claude/utils/toon/cli.mjs encode data.json --delimiter tab --no-key-folding

# Compare token savings:
node .claude/utils/toon/cli.mjs analyze data.json

# Decode TOON to JSON:
node .claude/utils/toon/cli.mjs decode data.toon
```

如果目标项目中未安装该包装器或斜杠命令，请使用可用的 `@toon-format/toon` CLI/库，或按照规范手动转换并对结果进行验证。

## 命令

- `/toon-encode <file>` - JSON 转 TOON
- `/toon-decode <file>` - TOON 转 JSON
- `/toon-validate <file>` - 验证 TOON
- `/analyze-tokens <file>` - 比较节省量
- `/convert-to-toon <file>` - 完整转换工作流

## 文档

- **指南：** `references/toon-guide.md`
- **规范：** https://github.com/toon-format/spec
