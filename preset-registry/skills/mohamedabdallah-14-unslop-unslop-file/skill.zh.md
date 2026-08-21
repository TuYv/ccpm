---
name: unslop-file
description: >
  Humanize natural-language memory files (CLAUDE.md, todos, preferences, docs) by removing AI-isms
  and adding burstiness while preserving every code block, URL, path, command, and heading exactly.
  Two modes: --deterministic (fast, regex-based, no API) and LLM (default, calls Claude for rewrite).
  Humanized version overwrites the original file. Plain backup saved as FILE.original.md.
  Trigger: /unslop-file <filepath> or "humanize memory file"
---
# 去除 AI 腔并使文本自然化

## 目的

重写自然语言记忆文件（CLAUDE.md、AGENTS.md、待办事项、偏好设置、文档），使其读起来像人类撰写：不谄媚、不使用套话、不采用五段式文章结构、不为凑三段式而堆砌内容。所有技术内容均须保持原样：代码块、行内代码、URL、文件路径、命令、标题、表格。

两种模式：

- **`--deterministic`** — 快速正则处理，去除典型的 AI 腔并精简三段式表达。不调用 API，也不需要 `ANTHROPIC_API_KEY`。最适合批量处理和 CI。
- **LLM 模式（默认）** — 调用 Claude（通过 Anthropic SDK，或回退到 `claude --print` CLI）进行全面重写，调整句式节奏，重构刻意表演式的段落，并匹配原文语气。速度较慢，但质量更好。

自然化后的版本会覆盖原文件。覆盖前会先写入一份 FILE.original.md 备份。编辑 `.original.md` 后重新运行即可再次生成。

### 强度级别（`--mode`）

| 模式       | 执行内容                                                                                   | 适用场景                                                    |
| ---------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `subtle`   | 仅处理套话词汇。                                                                           | 结构没有问题，只想去掉 AI 常用词汇。         |
| `balanced` | （默认。）处理谄媚、含糊措辞、过渡语、套话词汇、权威话术、路标式表达、刻意保持平衡的表述，并限制破折号使用。 | 日常文档 / README / CLAUDE.md。                         |
| `full`     | 在均衡模式基础上，额外处理填充短语、否定式平行三段句，并使用更强的 LLM 提示词。           | 营销文案、发布说明、AI 腔严重的 LLM 输出。        |

### 两遍审计

先使用确定性处理生成报告，再修复任何遗漏：

```bash
humanize --deterministic --report audit.json doc.md     # writes audit + humanized
humanize doc.md                                         # optional LLM polish on top
```

`audit.json` 会列出每条触发的规则、每一组 `before → after` 对比，以及 `counts_by_rule`。在信任差异并合并之前，非常适合用来检查正则具体修改了哪些内容。

## 触发方式

`/unslop-file <filepath>`、`/unslop:humanize <filepath>`，或“自然化记忆文件”“去除这份文档的 AI 腔”“去掉这个文件中的 AI 语气”。

## 流程

脚本位于与此 SKILL.md 相邻的 `scripts/` 目录中。

常见布局：
- 完整仓库：`unslop/SKILL.md` + `unslop/scripts/`
- 同步镜像：`skills/unslop-file/SKILL.md` + `skills/unslop-file/scripts/`
- Codex 软件包：`plugins/unslop/skills/unslop-file/SKILL.md` + 同级 `scripts/`

始终优先使用当前加载的 SKILL 文件同级的 `scripts/`。

步骤：

1. 找到包含此 SKILL.md 的目录及其同级 `scripts/`。
2. 在该目录中运行：`python3 -m scripts <absolute_filepath>`（LLM 模式）；如需正则处理，则添加 `--deterministic`。
3. CLI 流程：检测文件类型 → 写入 `.original.md` 备份 → 自然化 → 验证（内容保留检查 + AI 腔残留检查）→ 验证出错时：调用定向修复（LLM 模式）→ 最多重试 2 次。
4. 最终失败时：报告错误、恢复原文件并以状态码 2 退出。
5. 成功时：报告自然化文件及 `.original.md` 备份的路径，并以状态码 0 退出。
6. 将结果返回给用户。

## 人性化规则

### 删除（典型 AI 腔）

- **奉承式开场白**：“问得好！”、“当然！”、“完全正确！”、“没问题！”、“我很乐意帮忙”、“多么令人着迷的……”
- **惯用词汇**：`delve`、`tapestry`、`testament`（用于赞美）、`navigate`/`embark`/`journey`（比喻用法）、`realm`、`landscape`（比喻用法）、`pivotal`、`paramount`、`seamless`、`holistic`、`leverage`（填充性动词）、`robust`（填充词）、`comprehensive`（可用“complete”时）、`cutting-edge`、`state-of-the-art`（填充词）、`interplay`、`intricate`、`vibrant`、`underscore(s)/d/ing`（比喻用法）、`crucial`、`vital`（修饰角色/重要性/部分）、`ever-evolving`、`ever-changing`、`in today's (digital) world/age`、`dynamic landscape`。
- **模糊式开场白**：“需要注意的是”、“值得一提的是”、“一般来说”、“本质上”、“从根本上说”、“应当注意的是”、“还值得指出的是”。
- **权威式套话**（句首）：“从根本上说，”、“事实上，”、“从根本上讲，”、“真正重要的是”、“问题的核心是”、“X 的核心是/在于”。
- **提示性声明**：“让我们深入探讨（……）”、“让我们来分解一下”、“以下是你需要了解的内容”、“闲话少说”、“在本文中，我将……” 、“系好安全带”。
- **过渡语癖**（句首）：“此外，”、“而且，”、“另外，”、“总之，”、“总结一下，”。
- **刻意制造平衡**：在每个论断后都附加“然而”/“另一方面”。
- **破折号堆积**（每段超过两个长破折号）。
- **填充性短语**（仅限 `--mode full`）：“为了”→“以”，“由于……这一事实”→“因为”，“在……之前”→“之前”，“关于……方面”→“关于”，“各种各样的”→“许多”，“在当前这个时间点”→“现在”，“……这一事实”→“……”，等等。
- **否定式排比三连句**（仅限 `--mode full`）：“无需猜测，没有冗余，不出意外。”——这种连续三个“不”的修辞式短句。

### 精简

- 三项排比：“X、Y 和 Z”这类本可只保留两项的堆叠——保留两项，删除最弱的一项
- 项目符号堆砌：三个项目符号表达相同内容 → 合并成一句话
- 五段式作文结构：改变段落长度；不要写四个长度相同的段落

### 原样保留（绝不修改）

- 围栏代码块（```...```）——每个字节都保持不变
- 缩进代码块（4 个空格）
- 行内代码（`...`）
- URL 和 Markdown 链接
- 文件路径（`./src/`、`/etc/`、`C:\Users\...`）
- 命令（`npm install`、`git rebase`、`docker run`）
- 技术术语、专有名词、API 名称
- 日期、版本号、数值
- 环境变量（`$HOME`、`${NODE_ENV}`）

### 保留结构

- 所有 Markdown 标题（文本保持不变）
- 项目符号的层级与嵌套关系
- 编号列表
- 表格（精简单元格内容；保留结构）
- YAML 前置元数据

### 关键规则

` ``` ... ``` ` 内的所有内容均为只读。不得修改注释、空白字符或行顺序。行内反引号中的内容同样如此。代码是基础；人性化处理只作用于代码区域之间的正文。

## 模式（修改前 → 修改后）

| #   | 修改前                                                                                                                                                                                                                | 修改后（确定性，`--mode balanced`）                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | 需要注意的是，在推送更改之前运行测试是一项全面的最佳实践。此外，值得一提的是，这可以防止构建失败。                                         | 在推送更改之前运行测试是一项广泛采用的最佳实践。这可以防止构建失败。 |
| 2   | 该应用程序利用由多个独立组件组成的微服务架构。                                                                                                                   | 该应用程序使用由多个独立组件组成的微服务架构。 |
| 3   | 从本质上讲，缓存以牺牲内存为代价来降低延迟。                                                                                                                                                                       | 缓存以牺牲内存为代价来降低延迟。                                                     |
| 4   | 让我们深入探讨。以下是第一步。                                                                                                                                                                                | 以下是第一步。                                                                |
| 5   | 缓存与延迟之间错综复杂的相互作用至关重要。                                                                                                                                                       | 缓存与延迟之间的详细联系很重要。                            |
| 6   | 在当今的数字世界中，我们快速交付。                                                                                                                                                                               | 如今，我们快速交付。                                                                   |

### 在 `--mode full` 模式下，还包括：

| #   | 修改前                                                   | 修改后                                 |
| --- | -------------------------------------------------------- | ------------------------------------- |
| 7   | 我们运行测试是为了验证修复。             | 我们运行测试以验证修复。   |
| 8   | 构建失败是由于磁盘已满这一事实。 | 构建失败是因为磁盘已满。 |
| 9   | 不靠猜测，不臃肿，不出意外。                    | _（已删除）_                          |

### 参考资料

- `blader/unslop` — Claude-Code 技能，列出了 30 多种 AI 写作痕迹；我们采用了其中最显著的特征。
- Wikipedia：*AI 写作的迹象* — 用于交叉核对词汇的公开分类体系。
- 完整对比与差距分析：`docs/research/IMPLEMENTATION_TRACE.md`。

## 边界

- 仅处理 `.md`、`.txt`、`.markdown`、`.rst` 或无扩展名的自然语言文件。
- 切勿修改 `.py`、`.js`、`.ts`、`.json`、`.yaml`、`.yml`、`.toml`、`.env`、`.lock`、`.css`、`.html`、`.xml`、`.sql`、`.sh`。
- 对于混合了散文和代码的文件：仅对散文部分进行人性化处理；围栏代码块保持不变。
- 如果不确定文件内容是散文还是代码：保持不变。
- 覆盖前会写入备份 `FILE.original.md`。切勿对名称已经是 `*.original.md` 的文件进行人性化处理。
- 对敏感路径（任何匹配 `.env*`、`*.pem`、`*.key`、`~/.ssh/`、`~/.aws/` 等的路径），在进行任何读取或 API 调用之前拒绝处理。
- 拒绝处理大于 500 KB 的文件。