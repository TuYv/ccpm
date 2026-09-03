---
name: mutation-testing
description: "Configures mewt or muton mutation testing campaigns — scopes targets, tunes timeouts, and optimizes long-running runs. Use when the user mentions mewt, muton, mutation testing, or wants to configure or optimize a mutation testing campaign."
allowed-tools: Read Write Bash Grep
---
# 变异测试 — 活动配置（mewt/muton）

> **注意**：muton 和 mewt 共享完全相同的接口，但面向不同的语言——mewt 面向通用编程语言（Rust、Solidity、Go、TypeScript、JavaScript），muton 面向 TON 智能合约（Tact、Tolk、FunC）。所有示例均使用 `mewt` 命令，但它们在 `muton` 下的用法完全相同。文件名相应变化：`mewt.toml` → `muton.toml`，`mewt.sqlite` → `muton.sqlite`。

## 何时使用

在以下情况使用此技能：
- 用户提到 "mewt"、"muton" 或“变异测试”
- 需要配置或优化变异测试活动
- 想运行 `mewt run` 并需要先完成初始设置的帮助

## 何时不使用

在以下情况不要使用此技能：
- 用户想分析或报告已完成活动的结果
- 用户在未提及变异测试的情况下询问测试或覆盖率

---

## 快速开始

加载 [workflows/configuration.md](workflows/configuration.md) —— 一份从 `mewt init` 到经过验证、可随时运行的活动的 5 阶段指南。

**有一般性问题或遇到不熟悉的命令？**
运行 `mewt --help` 或 `mewt <subcommand> --help`，然后提供协助。

---

## 参考索引

| 文件 | 内容 |
|------|---------|
| [workflows/configuration.md](workflows/configuration.md) | 5 阶段指南：init、scope、optimize、validate、run |
| [references/optimization-strategies.md](references/optimization-strategies.md) | 逐文件目标定位、两阶段活动、变异类型过滤 |

---

## 必备命令

```bash
# Initialize and mutate
mewt init                    # Create mewt.toml and mewt.sqlite
mewt mutate [paths]          # Generate mutants without running tests
mewt run [paths]             # Run the full campaign

# Inspect configuration and scope
mewt print config            # View effective configuration
mewt print targets           # Table of all targeted files
mewt print mutations --language [lang]  # Available mutation types
mewt status                  # Mutant count and per-file breakdown

# Investigate specific mutants
mewt print mutants --target [path]   # All mutants for a file
mewt print mutants --severity high   # Filter by severity
mewt print mutant --id [id]          # View mutated code diff
mewt test --ids [ids]                # Re-test specific mutants
```

---

## 结果含义

- **Caught/TestFail**：测试检测到了该变异（良好）
- **Uncaught**：变异存活——表明存在未被测试的逻辑
- **Timeout**：测试耗时过长，结果无法确定
- **Skipped**：同一行上已有更严重的变异体失败
