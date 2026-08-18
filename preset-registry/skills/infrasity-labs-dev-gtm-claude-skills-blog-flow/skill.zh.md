---
name: blog-flow
description: >
  FLOW framework integration for bloggers. Evidence-led content workflow using
  the Find, Optimize, Win loop with stage-specific AI prompts from the FLOW
  knowledge base (30 blog-applicable prompts). Use when user says
  "FLOW", "FLOW framework", "blog flow", "evidence-led blogging", "find optimize
  win", or wants stage-specific blog prompts.
user-invokable: true
argument-hint: "[stage] [url|topic]"
compatibility: Requires Claude Code and Python 3.11+ for the sync script
---
# 面向博客作者的 FLOW 框架（发现、优化、制胜）

FLOW 是一种为 AI 搜索时代构建、以证据为导向的运营模型。Claude Blog
集成了 FLOW 提示词库，让写作者能够使用结构化、有来源支持的 AI 提示词来驱动工作流，
而不是临时拼凑查询。

此技能开放了与博客相关的三个阶段（Find、Optimize、Win），并通过提示词索引
提供唯一的 Leverage 提示词。与本地 SEO 相关的提示词（GBP、引用、本地审核）被有意排除，
因为它们针对的是实体经营场所相关工作，而非博客。

**运行时上下文。** 每次激活 `/blog flow` 时都加载 `references/flow-framework.md`。
仅按需加载提示词文件，并将范围限定在用户请求的阶段。

---

## 命令

| 命令 | 功能 |
|---------|-------------|
| `/blog flow` | 显示 FLOW 概览和阶段菜单 |
| `/blog flow find [topic\|url]` | Find 阶段：关键词发现、意图映射、差距分析（5 个提示词） |
| `/blog flow optimize [url]` | Optimize 阶段：根据上下文从 21 个提示词中选择最相关的 2 至 3 个 |
| `/blog flow win [url]` | Win 阶段：BOFU、转化、双界面评分卡（3 个提示词） |
| `/blog flow prompts` | 全部 30 个适用于博客的提示词完整索引（Find、Leverage、Optimize、Win） |
| `/blog flow sync` | 从 github.com/AgriciDaniel/flow 拉取最新的提示词文件 |

唯一的 Leverage 提示词（站外权威性）可通过
`/blog flow prompts` 访问，但不会作为顶级命令重点提供，因为大多数
博客工作流会在其他位置处理站外工作。

---

## 编排逻辑

### 执行 `/blog flow` 时（无子命令）
1. 读取 `references/flow-framework.md`。
2. 显示 FLOW 阶段概览，并用一句话描述每个阶段。
3. 询问用户哪个阶段符合其当前情况。

### 执行 `/blog flow find [topic|url]` 时
1. 读取 `references/prompts/find/` 中的所有文件。
2. 将每个提示词应用于主题或 URL，获取需求和意图信号。
3. 交叉引用：“如需更深入的简报和大纲，请参阅 `/blog brief <topic>`、
   `/blog outline <topic>` 和 `/blog cannibalization`，以检测与
   现有文章的重叠。”

### 执行 `/blog flow optimize [url]` 时
1. 读取 `references/prompts/optimize/` 中的文件名。
2. 读取先前的上下文（目标 URL、细分领域、此对话中此前的任何技能输出、
   来自 `/blog analyze` 的评分变化）。
3. 选择最相关的 2 至 3 个提示词，然后仅加载这些文件。
4. 应用选定的提示词；注明其余提示词可通过
   `/blog flow prompts` 访问。
5. 交叉引用：“如需更深入的重写和验证，请参阅 `/blog rewrite
   <file>`、`/blog seo-check <file>`、`/blog geo <file>`、`/blog schema <file>`、
   以及 `/blog factcheck <file>`。”

### 执行 `/blog flow win [url]` 时
1. 读取 `references/prompts/win/` 中的所有文件。
2. 将每个提示词应用于该 URL 的转化和 BOFU 上下文。
3. 交叉引用：“如需内容再利用、全站健康检查和质量评分，
   请参阅 `/blog repurpose <file>`、`/blog audit` 和 `/blog analyze <file>`。”

### 执行 `/blog flow prompts` 时
1. 读取 `references/prompts/README.md`。
2. 显示完整索引：按阶段（Find、Leverage、Optimize、Win）分组的 30 个提示词，包含名称和触发条件。
3. 说明本设计有意排除了本地 SEO 提示词；如果用户需要这些提示词，引导他们使用 `claude-seo`（`/seo flow local`）。

### 执行 `/blog flow sync` 时
1. 运行：`python3 scripts/sync_flow.py`。
2. 显示 JSON 摘要（新增、更新、未更改的文件）。
3. 同步完成后显示归属声明。

---

## 上下文匹配（Optimize 阶段）

Optimize 阶段包含 21 个提示词。一次性列出全部 21 个会产生干扰。请按以下优先级进行选择：

1. **细分领域**（SaaS 或 B2B 博客侧重页面 SEO 和技术 SEO；生活方式博客侧重内容新鲜度和 E-E-A-T；出版类网站侧重权威性和引用）。
2. **先前的 Skill 输出**（`/blog analyze` 发现的 E-E-A-T 缺口应导向权威性提示词；`/blog seo-check` 检查失败应导向页面 SEO 提示词；`/blog geo` 发现的缺口应导向提取格式提示词）。
3. **URL 信号**（商业页面需要转化提示词；信息类文章需要内容新鲜度和答案优先提示词）。

始终只呈现 2 到 3 个提示词。说明你选择了哪些提示词以及选择原因。

---

## 参考文件

按需加载。不要在启动时加载全部文件。

- `references/flow-framework.md`。FLOW 运行模型。每次激活 `/blog flow` 时都加载。
- `references/bibliography.md`。证据来源。在引用研究或统计数据时加载。
- `references/prompts/README.md`。提示词索引。执行 `/blog flow prompts` 时加载。
- `references/prompts/find/`。5 个提示词。执行 `/blog flow find` 时加载。
- `references/prompts/leverage/`。1 个提示词。仅当通过 `/blog flow prompts` 呈现时加载。
- `references/prompts/optimize/`。21 个提示词。执行 `/blog flow optimize` 时选择性加载。
- `references/prompts/win/`。3 个提示词。执行 `/blog flow win` 时加载。

如果缺少 `references/`，指示用户先运行 `/blog flow sync`。

---

## 同步脚本

`scripts/sync_flow.py` 从 github.com/AgriciDaniel/flow 拉取提示词文件，并将其写入 `skills/blog-flow/references/`。仅使用标准库，仅使用 HTTPS，将主机限制在 `api.github.com` 允许列表中，响应大小上限为 5 MB，采用原子写入，并防范路径遍历。

模式：

- `python3 scripts/sync_flow.py`。将所有与博客相关的阶段的最新版本同步到磁盘，并刷新锁文件。
- `python3 scripts/sync_flow.py --dry-run`。报告计划进行的更改，但不执行写入。
- `python3 scripts/sync_flow.py --ref <sha>`。将拉取操作固定到特定的 FLOW 提交 SHA，以实现可复现安装。

锁文件位于
`skills/blog-flow/references/flow-prompts.lock`，并采用与 sha256sum 兼容的格式。每次运行同步时，都会报告磁盘内容与锁文件之间的偏差。

该脚本仅同步适用于博客的阶段（`find`、`leverage`、`optimize`、`win`）。有意跳过 `local` 阶段，以使参考文件目录与该 Skill 的功能范围保持一致。

GitHub API 调用默认以匿名方式进行。如果环境中设置了 `GITHUB_TOKEN`，或者在收到 403 响应后 `gh auth token` 返回了令牌，脚本会使用该令牌重试请求。任何令牌都不会写入磁盘。

请勿省略或修改署名信息。同步的文件还包含由同步脚本注入的 HTML 注释许可证头。

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 缺少 `references/flow-framework.md` | “FLOW 参考文件尚未同步。请运行：`/blog flow sync`。” |
| 缺少提示词文件 | “请运行 `/blog flow sync`，从 FLOW 仓库拉取最新的提示词。” |
| `sync_flow.py` 网络错误 | 显示脚本的 stderr。如果已安装 `gh`，请使用 `gh api rate_limit` 检查速率限制。 |
| `sync_flow.py` 重试后仍返回 403 | 设置 `GITHUB_TOKEN` 或运行 `gh auth login`，然后重试。 |
| 路径遍历中止 | 同步目标试图逃逸出 references 目录。请检查上游仓库，并通过 `--ref` 固定到已知正常的版本。 |