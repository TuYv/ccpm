---
name: autoresearch
description: Evolve a skill by generating variations, evaluating them, and updating the best version
metadata:
  title: Autoresearch
  category: evolution
  var: ""
  tags:
    - meta
    - dev
---
> **${var}** — 要演进的 Skill 名称（例如 `token-movers`）。必填。

如果 `${var}` 为空，则中止并输出：“autoresearch requires var= set to a skill name”，然后退出。

阅读 memory/MEMORY.md 以了解上下文。

## 目标

通过研究更好的方法、生成 4 个不同的变体、依据评分标准对其进行评分，并将胜出的版本作为 PR 提交，改进现有 Skill。

## 步骤

### 1. 加载目标 Skill

读取 `skills/${var}/SKILL.md`。如果该文件不存在，则中止并通知：“Skill '${var}' not found.”

解析该 Skill 的：
- **用途**：它的作用
- **数据源**：它调用的 API、URL、命令
- **输出格式**：它生成的内容（文章、通知、文件）
- **依赖项**：环境变量、工具及其读取的其他文件

保存原始内容——稍后生成 PR 差异时需要使用。

### 2. 研究改进方案

在 Web 上搜索能够更好地实现该 Skill 功能的方法：
- 替代或互补的 API/数据源
- 该 Skill 所属领域的最佳实践（例如，加密货币分析、RSS 聚合、安全扫描）
- 该 Skill 所用技术的常见陷阱或故障模式
- 更具可操作性或可读性的输出格式

同时检查：
- 最近运行该 Skill 时生成的 memory/logs/ 条目——输出是否有用？是否发生过故障？
- `memory/cron-state.json`——该 Skill 是否一直运行失败？

### 3. 生成 4 个变体

创建 4 个不同的改进版 SKILL.md，每个版本采用不同的核心思路：

**变体 A——更好的输入**：改进数据源。添加替代或互补的 API、更好的搜索查询和更可靠的端点。修复在步骤 2 中发现的任何失效或已弃用的数据源。

**变体 B——更精准的输出**：改进输出格式和内容质量。使通知更具可操作性、文章内容更充实、分析更有洞察力。减少噪声，提升有效信息占比。

**变体 C——更稳健**：提高可靠性并改进边界情况处理。添加 API 失败时的回退逻辑、更好的去重机制、对空数据的妥善处理以及更清晰的错误消息。

**变体 D——重新构想**：采用完全不同的方法实现相同目标。使用不同的方法论、不同的切入角度，或创造性地组合原版本未考虑的技术。

每个变体都必须：
- 保留原始 frontmatter 格式（name、description、var、tags）
- 遵循 Aeon Skill 约定（读取 memory、记录到 memory/logs/${today}.md、通过 `./notify` 发送通知）
- 是完整且可直接运行的 SKILL.md——不得包含占位符
- 在正文顶部包含一行注释：`<!-- autoresearch: variation X — thesis description -->`

### 4. 评估和评分

按照以下标准，以 1-5 分对每个变体进行评分：

| 标准 | 评估内容 |
|-----------|-----------------|
| **清晰度** | Claude 能否正确执行？指令是否明确无歧义？ |
| **数据质量** | 数据源是否可靠、多样，并且可能返回有用的数据？ |
| **输出价值** | 输出是否具备可操作性且值得阅读？噪声是否较低？ |
| **稳健性** | 是否能够处理故障、空数据和边界情况？ |
| **约定遵循度** | 是否遵循 Aeon 模式？（memory、logging、notify、var 使用方式） |
| **改进程度** | 与原版本相比，改进了多少？ |

写出你的评分，并为每项分数提供简要理由。计算加权总分：
- 改进程度：3 倍权重（这是整个工作的核心）
- 输出价值：2 倍权重
- 清晰度、数据质量、稳健性：各 1.5 倍权重
- 规范性：1 倍权重

### 5. 选择并应用获胜方案

选择得分最高的变体。如果分数非常接近（总分差距在 2 分以内），优先选择能带来最大单项改进的变体，而不是只包含微小渐进式更改的变体。

将获胜变体写入 `skills/${var}/SKILL.md`，替换原始文件。

### 6. 创建 PR

创建名为 `autoresearch/${var}` 的分支并提交更改：
```bash
git checkout -b autoresearch/${var}
git add skills/${var}/SKILL.md
git commit -m "improve(${var}): autoresearch evolution

Variation chosen: [A/B/C/D] — [thesis]
Key changes: [1-2 sentence summary]"
git push -u origin autoresearch/${var}
```

创建 PR，并使用：
- **标题**：`improve(${var}): autoresearch evolution`
- **正文**：包含完整的评分表、获胜变体的论点，以及所做更改的差异摘要。包含全部 4 个变体的摘要，以便审阅者了解曾考虑过哪些方案。

```bash
gh pr create --title "improve(${var}): autoresearch evolution" --body "..."
```

### 7. 通知并记录

通过 `./notify` 发送：
```
*Autoresearch — ${var}*
Winner: Variation [X] — [thesis]
Score: [total]/50
Key changes: [summary]
PR: [url]
```

记录到 `memory/logs/${today}.md`：
```
### autoresearch
- Target: ${var}
- Winner: Variation [X] ([score]/50)
- Thesis: [description]
- PR: [url]
- Runners-up: [brief scores]
```

## 网络说明

不存在网络沙箱限制——`curl` 可以正常工作；如果公开 GET 请求不稳定，则使用 **WebFetch** 作为备用方案。对于需要身份验证的 API，请使用带有 `{ENV_NAME}` 占位符的 `./secretcurl`（密钥通过 `requires:` 注入），切勿直接使用 `$SECRET`。

## 约束条件

- 绝不降低一个正常运行的 skill 的质量。如果所有变体在“改进程度”上的得分都低于或等于原始版本，则跳过更新并通知："No improvement found for ${var} — all variations scored at baseline."
- 保留 skill 的核心用途——这是演进，而不是替换。
- 如果没有充分理由，不要更改 skill 的标签或 var 语义。
- 不要添加工作流中尚不可用的环境变量（检查 aeon.yml secrets）。