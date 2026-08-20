---
name: well-formed
description: Review pull request diffs for code smells, style issues, and safety problems before merging.
version: 1.0.0
license: MIT
creator: ASM Fixtures
compatibility: Claude Code
allowed-tools: Read Grep
effort: medium
---
# 格式规范的语料库技能

## 使用场景

- 当用户要求“审查此 PR”或“检查差异”时
- 合并任何超过 10 行的更改之前

## 前置条件

- 一个已检出目标分支的 git 仓库
- 对待审查文件的读取权限

## 操作说明

1. 运行 `git diff main...HEAD` 列出文件
2. 读取每个文件并检查常见的代码异味
3. 输出一份总结审查结果的 Markdown 报告

## 示例

```bash
$ asm eval ./well-formed
Overall score: 95/100
```

## 验收标准

- 生成一份 Markdown 报告，并为每个文件设置独立章节
- 将任何对 `eval()` 或 `exec` 的使用标记为危险
- 不修改工作树

## 边界情况

- 差异为空：输出一条简短的“无更改”说明
- 二进制文件：跳过，并在报告中提及文件名

## 安全

有关错误处理规则，请参阅 `references/safety.md`。
写入前始终先进行确认。未经试运行，绝不执行破坏性命令。