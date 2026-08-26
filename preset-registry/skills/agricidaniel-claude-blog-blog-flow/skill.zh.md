---
name: blog-flow
description: >
  FLOW framework integration for bloggers. Evidence-led content workflow using
  the Find, Optimize, Win loop with stage-specific AI prompts from the FLOW
  knowledge base (30 blog-applicable prompts, CC BY 4.0). Use when user says
  "FLOW", "FLOW framework", "blog flow", "evidence-led blogging", "find optimize
  win", or wants stage-specific blog prompts.
user-invokable: true
argument-hint: "[stage] [url|topic]"
license: MIT
compatibility: Requires Claude Code and Python 3.11+ for the sync script
metadata:
  author: AgriciDaniel
  version: "2.2.0"
  category: blog
---
# 面向博客作者的 FLOW 框架（Find、Optimize、Win）

针对博客主题或 URL 运行 FLOW Find/Optimize/Win 提示词，将查询数据、
来源笔记和页面证据转化为结构化决策，而不是临时编写提示词。

> 框架和提示词 (c) Daniel Agrici，CC BY 4.0。来源：github.com/AgriciDaniel/flow

FLOW 是一种以证据为导向的检索、引用和转化工作流运行模型。Claude Blog 集成了 FLOW 提示词库，使作者能够将查询数据、来源笔记和页面证据转化为结构化决策，而不是临时编写提示词。

此技能提供三个与博客相关的阶段（Find、Optimize、Win），并通过提示词索引保留唯一的 Leverage 提示词。local-SEO 提示词（GBP、引用、本地审计）被有意排除，因为它们面向实体店业务，而非博客。

**运行时上下文。** 每次激活 `/blog flow` 时都加载 `references/flow-framework.md`。仅按需加载提示词文件，并限定为用户请求的阶段。

---

## 命令

| 命令 | 功能 |
|---------|-------------|
| `/blog flow` | 显示 FLOW 概览和阶段菜单 |
| `/blog flow find [topic\|url]` | Find 阶段：关键词发现、意图映射、差距分析（5 个提示词） |
| `/blog flow optimize [url]` | Optimize 阶段：根据上下文从 21 个提示词中选择 2 到 3 个最相关的提示词 |
| `/blog flow win [url]` | Win 阶段：BOFU、转化、双表面评分卡（3 个提示词） |
| `/blog flow prompts` | 全部 30 个适用于博客的提示词索引（Find、Leverage、Optimize、Win） |
| `/blog flow sync` | 从 github.com/AgriciDaniel/flow 拉取最新提示词文件 |

唯一的 Leverage 提示词（站外权威建设）可通过
`/blog flow prompts` 访问，并未提升为顶层命令，因为大多数博客工作流会将站外工作交由其他流程处理。

---

## 编排逻辑

### 执行 `/blog flow`（无子命令）
1. 读取 `references/flow-framework.md`。
2. 显示 FLOW 阶段概览，并用一句话描述每个阶段。
3. 询问用户哪个阶段符合他们当前的情况。

### 执行 `/blog flow find [topic|url]`
1. 读取 `references/prompts/find/` 中的所有文件。
2. 将每个提示词应用于主题或 URL，捕获需求和意图信号。
3. 交叉引用：“如需更深入的简报和大纲，请参阅 `/blog brief <topic>`、
   `/blog outline <topic>` 和 `/blog cannibalization`，以检测与现有文章的重叠。”

### 执行 `/blog flow optimize [url]`
1. 读取 `references/prompts/optimize/` 中的文件名。
2. 读取先前的上下文（目标 URL、细分领域、本次对话中此前的技能输出、`/blog analyze` 的评分变化）。
3. 选择 2 到 3 个最相关的提示词，然后仅加载这些文件。
4. 应用所选提示词；注意，其余提示词可通过
   `/blog flow prompts` 访问。
5. 交叉引用：“如需更深入的重写和验证，请参阅 `/blog rewrite
   <file>`、`/blog seo-check <file>`、`/blog geo <file>`、`/blog schema <file>`、
   和 `/blog factcheck <file>`。”

### 在 `/blog flow win [url]` 时
1. 读取 `references/prompts/win/` 中的所有文件。
2. 将每个提示应用于该 URL 的转化和 BOFU 上下文。
3. 交叉引用：“如需进行内容再利用、全站健康度检查和质量评分，
   请参阅 `/blog repurpose <file>`、`/blog audit` 和 `/blog analyze <file>`。”

### 在 `/blog flow prompts` 时
1. 读取 `references/prompts/README.md`。
2. 显示完整索引：按阶段（Find、Leverage、Optimize、Win）分组的 30 个提示，并列出名称和触发条件。
3. 说明本地 SEO 提示是经过设计后排除在外的；如果用户需要，请指引他们使用
   `claude-seo`（`/seo flow local`）。

### 在 `/blog flow sync` 时
1. 运行：`python3 scripts/sync_flow.py`。
2. 显示 JSON 摘要（新增、更新、未更改的文件）。
3. 同步完成后显示署名声明。

---

## 上下文匹配（Optimize 阶段）

Optimize 阶段有 21 个提示。倾倒全部 21 个提示会产生噪音。请按优先级进行选择：

1. **细分领域**（SaaS 或 B2B 博客侧重页面内优化和技术优化；生活方式类博客侧重新鲜度和 E-E-A-T；出版商侧重权威性和引用）。
2. **此前的技能输出**（`/blog analyze` 中的 E-E-A-T 差距会指向权威性提示；`/blog seo-check` 中的失败项会指向页面内优化提示；`/blog geo` 中的差距会指向信息提取格式提示）。
3. **URL 信号**（商业页面需要转化提示；信息型文章需要新鲜度和答案优先提示）。

始终准确展示 2 到 3 个提示。说明你选择了哪些提示以及选择原因。

---

## 参考文件

按需加载。不要在启动时全部加载。

- `references/flow-framework.md`。FLOW 运行模型。在每次激活 `/blog
  flow` 时加载。
- `references/bibliography.md`。证据来源。在引用研究或统计数据时加载。
- `references/prompts/README.md`。提示索引。用于 `/blog flow prompts` 时加载。
- `references/prompts/find/`。5 个提示。用于 `/blog flow find` 时加载。
- `references/prompts/leverage/`。1 个提示。仅在通过 `/blog flow prompts` 展示时加载。
- `references/prompts/optimize/`。21 个提示。用于 `/blog flow
  optimize` 时选择性加载。
- `references/prompts/win/`。3 个提示。用于 `/blog flow win` 时加载。

如果缺少 `references/`，请指示用户先运行 `/blog flow sync`。

---

## 同步脚本

`scripts/sync_flow.py` 从 github.com/AgriciDaniel/flow 拉取提示文件，并将其写入
`skills/blog-flow/references/`。仅使用标准库，仅通过 HTTPS，仅允许访问主机
`api.github.com`，响应上限为 5 MB，使用原子写入，并防范路径遍历。

模式：

- `python3 scripts/sync_flow.py`。将每个与博客相关的最新阶段同步到磁盘，并刷新锁定文件。
- `python3 scripts/sync_flow.py --dry-run`。报告计划中的更改，但不写入文件。
- `python3 scripts/sync_flow.py --ref <sha>`。将获取操作固定到指定的 FLOW
  提交 SHA，以实现可复现安装。

锁定文件位于
`skills/blog-flow/references/flow-prompts.lock`，并采用兼容 sha256sum 的格式。每次同步运行时都会报告磁盘内容与锁定文件之间的漂移。

该脚本仅同步适用于博客的阶段（`find`、`leverage`、`optimize`、`win`）。`local` 阶段会被有意跳过，以使 references 目录与该 skill 的适用范围保持一致。

GitHub API 调用默认使用匿名方式。如果环境中设置了 `GITHUB_TOKEN`，或者在收到 403 响应后 `gh auth token` 返回了令牌，脚本会使用该令牌重试请求。不会将任何令牌写入磁盘。

---

## 署名

每次 `/blog flow` 激活（任何子命令）都会在分析前输出：

```
Framework and prompts (c) Daniel Agrici, CC BY 4.0. Source: github.com/AgriciDaniel/flow
```

不得省略或修改署名。同步的文件还会包含由同步脚本注入的 HTML 注释许可证标头。

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 缺少 `references/flow-framework.md` | "FLOW reference files not synced. Run: `/blog flow sync`." |
| 缺少提示词文件 | "Run `/blog flow sync` to pull the latest prompts from the FLOW repo." |
| `sync_flow.py` 网络错误 | 显示脚本的 stderr。如果已安装 `gh`，使用 `gh api rate_limit` 检查速率限制。 |
| 重试后 `sync_flow.py` 仍返回 403 | 设置 `GITHUB_TOKEN` 或运行 `gh auth login`，然后重试。 |
| 路径遍历中止 | 同步目标尝试逃逸 references 目录。检查上游仓库，并固定到已知正常的 `--ref`。 |