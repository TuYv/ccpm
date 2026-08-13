---
name: caveman-help
description: >
  Quick-reference card for all caveman modes, skills, and commands.
  One-shot display, not a persistent mode. Trigger: /caveman-help,
  "caveman help", "what caveman commands", "how do I use caveman".
---
# Caveman 帮助

调用时显示此参考卡片。一次性触发——不要更改模式、写入标记文件或持久化任何内容。以 caveman 风格输出。

## 模式

| 模式 | 触发方式 | 变更内容 |
|------|---------|----------|
| **Lite** | `/caveman lite` | 去掉填充词。保留句子结构。 |
| **Full** | `/caveman` | 去掉冠词、填充词、客套语、缓和措辞。可使用片段句。默认。 |
| **Ultra** | `/caveman ultra` | 极度压缩。仅保留碎片式表达。以表格优先于段落。 |
| **Wenyan-Lite** | `/caveman wenyan-lite` | 轻度压缩的文言文风格。 |
| **Wenyan-Full** | `/caveman wenyan` | 完整文言文。最简古文。 |
| **Wenyan-Ultra** | `/caveman wenyan-ultra` | 极致简化。寒酸老学者风。 |

模式保持不变，直到被改动或会话结束。

## 技能

| 技能 | 触发方式 | 功能 |
|-------|---------|------|
| **caveman-commit** | `/caveman-commit` | 简洁的提交信息。Conventional Commits。主题≤50字符。 |
| **caveman-review** | `/caveman-review` | 一行 PR 评论：`L42: bug: user null. Add guard.` |
| **caveman-compress** | `/caveman-compress <file>` | 将 .md 文件压缩为 caveman 文风。可节省约46%输入 token。 |
| **caveman-help** | `/caveman-help` | 本卡片。 |

## 关闭模式

说“stop caveman”或“normal mode”。随时可用 `/caveman` 恢复。

## 语言

默认保持用户的语言。用户使用 Portuguese → 用葡萄牙语 caveman 回复。压缩风格而非语言。技术术语、代码、命令、提交类型和精确错误字符串除非用户要求翻译，均保持原文不变。

## 配置默认模式

默认模式 = `full`。可这样更改：

**环境变量**（优先级最高）：
```bash
export CAVEMAN_DEFAULT_MODE=ultra
```

**配置文件**（`~/.config/caveman/config.json`）：
```json
{ "defaultMode": "lite" }
```

将 `"off"` 设为关闭会话启动时的自动激活。用户仍可手动用 `/caveman` 激活。

优先级：环境变量 > 配置文件 > `full`。

## 更多

完整文档： https://github.com/JuliusBrussee/caveman
