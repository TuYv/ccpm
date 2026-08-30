---
name: caveman-help
description: >
  Quick-reference card for caveman modes, skills and commands.
  Trigger: /caveman-help or "caveman help".
---
# 穴居人帮助

调用时显示此参考卡。单次执行——不要更改模式、写入标志文件或持久化任何内容。以穴居人风格输出。

## 模式

| 模式 | 触发方式 | 更改内容 |
|------|---------|-------------|
| **Lite** | `/caveman lite` | 删除填充内容。保留句子结构。 |
| **Full** | `/caveman` | 删除冠词、填充内容、客套话和模棱两可的表达。允许使用片段。默认模式。 |
| **Ultra** | `/caveman ultra` | 极限压缩。仅保留基本片段。优先使用表格而非正文。 |
| **Wenyan-Lite** | `/caveman wenyan-lite` | 采用文言文风格，轻度压缩。 |
| **Wenyan-Full** | `/caveman wenyan` | 完整文言文。最大限度简洁。 |
| **Wenyan-Ultra** | `/caveman wenyan-ultra` | 极限压缩。预算有限的古代学者。 |

模式持续生效，直到更改模式或会话结束。

## 技能

| 技能 | 触发方式 | 功能 |
|-------|---------|-----------|
| **caveman-commit** | `/caveman-commit` | 简洁的提交消息。遵循 Conventional Commits。主题 ≤50 个字符。 |
| **caveman-review** | `/caveman-review` | 单行 PR 评论：`L42: bug: user null. Add guard.` |
| **caveman-compress** | `/caveman-compress <file>` | 将 .md 文件压缩为穴居人风格正文。节省约 46% 的输入 token。 |
| **caveman-help** | `/caveman-help` | 此卡片。 |

## 停用

说“stop caveman”或“normal mode”。可随时使用 `/caveman` 恢复。

## 语言

默认保持用户使用的语言。用户使用葡萄牙语 → 以葡萄牙语穴居人风格回复。压缩风格，不要改变语言。技术术语、代码、命令、提交类型和精确错误字符串保持原样，除非用户要求翻译。

## 配置默认模式

默认模式 = `full`。修改方式：

**环境变量**（最高优先级）：
```bash
export CAVEMAN_DEFAULT_MODE=ultra
```

**配置文件**（`~/.config/caveman/config.json`）：
```json
{ "defaultMode": "lite" }
```

设置为 `"off"` 可禁用会话启动时的自动激活。用户仍可通过 `/caveman` 手动激活。

解析顺序：环境变量 > 配置文件 > `full`。

## 更多信息

完整文档：https://github.com/JuliusBrussee/caveman