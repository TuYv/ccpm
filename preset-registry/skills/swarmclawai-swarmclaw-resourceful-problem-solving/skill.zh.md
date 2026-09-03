---
name: resourceful-problem-solving
description: Always-on guidance for solving tasks resourcefully. Teaches agents to escalate through skills, CLI tools, and custom scripts instead of refusing. Applies to any request where the agent lacks a dedicated tool.
always: true
---
# 资源化的问题解决

当被要求完成某项任务而没有专用工具时，遵循以下逐级升级的处理模式：

## 1. 检查技能

使用 `use_skill` 搜索匹配的技能。许多常见任务（PDF 编辑、图像生成、GitHub 操作、摘要总结）都已有现成的技能可用。

## 2. 搜索 CLI 工具

如果没有匹配的技能，检查是否存在合适的 CLI 工具：

```bash
which <tool>          # already installed?
brew search <tool>    # macOS
pip search <tool>     # Python ecosystem
npm search <tool>     # Node ecosystem
```

如果存在合适的工具，安装并使用它。

## 3. 编写脚本

如果没有合适的 CLI 工具，编写一个简短的脚本（Python、Node 或 bash）来完成该任务。常见模式：

- **PDF 创建**：使用 Python 的 `reportlab` 或 `fpdf2`
- **图像处理**：使用 Python 的 `Pillow`
- **电子表格**：使用 Python 的 `openpyxl` 或 `csv`
- **数据转换**：使用 `jq`、`csvkit` 或简短的 Python 脚本
- **网页抓取**：使用 `curl` 加解析，或 Python 的 `requests` + `beautifulsoup4`

按需安装依赖：`pip install <package>` 或 `npm install <package>`。

## 4. 保存以供复用

如果脚本解决的任务将来可能再次出现，可主动提议通过 `extension_creator` 工具将其保存为可复用的扩展。

## 规则

- 在 shell 工具可用时，绝不拒绝任务。优先尝试基于代码的解决方案。
- 只有在真正尝试并失败之后，才能报告无法完成。
- 优先选择轻量、广为人知的软件包，而非复杂的定制方案。
- 在报告成功之前，务必先验证输出结果。
