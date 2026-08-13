---
name: seo-flow
description: >
  FLOW framework integration: evidence-led SEO using the Find → Leverage →
  Optimize → Win loop. Surfaces stage-specific AI prompts from the FLOW
  knowledge base (41 prompts, CC BY 4.0). Use when user says "FLOW", "FLOW
  framework", "seo flow", "evidence-led SEO", "find leverage optimize win",
  or wants stage-specific SEO prompts.
user-invocable: true
argument-hint: "[stage] [url|topic]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.4"
  category: seo
---
# FLOW 框架：发现 · 借力 · 优化 · 制胜

FLOW 是一个面向 AI 搜索时代、以证据为导向的 SEO 运营模型。Claude SEO
集成了 FLOW 提示词库（涵盖 5 个阶段的 41 个提示词），因此每项分析都可以
由结构化、以证据为支撑的 AI 提示词驱动，而不是依赖临时拼凑的查询。

> 框架和提示词 © Daniel Agrici，CC BY 4.0：github.com/AgriciDaniel/flow

**运行时上下文：** 每次激活 `/seo flow` 时加载 `references/flow-framework.md`。
按需加载提示词文件，且仅加载用户所请求阶段的文件。

---

## 命令

| 命令 | 功能 |
|---------|-------------|
| `/seo flow` | 显示 FLOW 概览和阶段菜单 |
| `/seo flow find [url\|topic]` | 发现阶段：关键词研究、差距分析、SERP 意图映射（5 个提示词） |
| `/seo flow leverage [url]` | 借力阶段：反向链接策略、站外权威性（1 个提示词） |
| `/seo flow optimize [url]` | 优化阶段：根据上下文从 21 个提示词中选择最相关的 2-3 个 |
| `/seo flow win [url]` | 制胜阶段：BOFU、转化率、双界面评分卡（3 个提示词） |
| `/seo flow local [url]` | 本地阶段：GBP 优化、元数据、标题标签、本地审核（11 个提示词） |
| `/seo flow prompts` | 全部 41 个提示词的完整索引（阶段、名称、触发条件） |
| `/seo flow sync` | 从 github.com/AgriciDaniel/flow 拉取最新的提示词文件 |

---

## 编排逻辑

### 执行 `/seo flow`（无子命令）时
1. 读取 `references/flow-framework.md`
2. 显示 FLOW 阶段概览，并为每个阶段提供一句话描述
3. 询问：哪个阶段符合用户当前的情况？

### 执行 `/seo flow find [url|topic]` 时
1. 读取 `references/prompts/find/` 中的所有文件
2. 将每个提示词应用于该 URL 或主题
3. 交叉引用：“如需进行更深入的 SERP 聚类，请参阅 `/seo cluster <seed-keyword>`”

### 执行 `/seo flow leverage [url]` 时
1. 读取 `references/prompts/leverage/` 中的文件
2. 将其应用于该 URL 当前的反向链接上下文
3. 交叉引用：“如需获取原始反向链接数据，请参阅 `/seo backlinks <url>`”

### 执行 `/seo flow optimize [url]` 时
1. 读取 `references/prompts/optimize/` 中的所有文件名
2. 读取先前的分析上下文（URL、行业垂直领域、对话中任何先前的技能输出）
3. 选择最相关的 2-3 个提示词；仅加载这些文件
4. 应用选定的提示词；说明其他提示词可通过 `/seo flow prompts` 访问
5. 交叉引用：“如需进行完整的内容质量分析，请参阅 `/seo content <url>` 和 `/seo geo <url>`”

### 执行 `/seo flow win [url]` 时
1. 读取 `references/prompts/win/` 中的所有文件
2. 将每个提示词应用于该 URL 的转化和 BOFU 上下文
3. 交叉引用：“如需进行 SXO 用户画像评分，请参阅 `/seo sxo <url>`”

### 执行 `/seo flow local [url]` 时
1. 读取 `references/prompts/local/` 中的所有文件
2. 将其应用于该 URL 的本地 SEO 上下文
3. 交叉引用：“如需进行完整的本地 SEO 分析，请参阅 `/seo local <url>` 和 `/seo maps [command]`”

### 执行 `/seo flow prompts` 时
1. 读取 `references/prompts/README.md`
2. 显示完整索引：全部 41 个提示词及其阶段、名称和触发条件

### 关于 `/seo flow sync`
1. 运行：`claude-seo run sync_flow.py`
2. 显示 JSON 摘要（新增、更新、未更改的文件）
3. 同步完成后显示署名声明

---

## 上下文匹配（优化阶段）

优化阶段有 21 个提示词。全部输出这 21 个提示词会产生大量干扰。请按以下优先级选择：

1. **行业垂直领域**（SaaS → 页面内优化 + 技术优化；本地业务 → 引用 + GBP；出版商 → E-E-A-T + 新鲜度）
2. **前序技能输出**（seo-technical 标记了抓取问题 → 技术优化提示词；seo-content 标记了 E-E-A-T 缺口 → 内容优化提示词）
3. **URL 信号**（产品页面 → 转化；博客 → 新鲜度 + 权威性）

始终只显示 2-3 个提示词。说明你选择了哪些提示词以及选择原因。

---

## 参考文件

按需加载，启动时不要全部加载：
- `references/flow-framework.md`：FLOW 运作模型（每次激活 `/seo flow` 时加载）
- `references/bibliography.md`：证据来源；引用研究或统计数据时加载
- `references/prompts/README.md`：提示词索引；用于 `/seo flow prompts` 时加载
- `references/prompts/find/`：5 个提示词；用于 `/seo flow find` 时加载
- `references/prompts/leverage/`：1 个提示词；用于 `/seo flow leverage` 时加载
- `references/prompts/optimize/`：21 个提示词；用于 `/seo flow optimize` 时选择性加载
- `references/prompts/win/`：3 个提示词；用于 `/seo flow win` 时加载
- `references/prompts/local/`：11 个提示词；用于 `/seo flow local` 时加载

---

## 署名

每次激活 `/seo flow`（任何子命令）时，都要在分析前输出：

```
Framework and prompts © Daniel Agrici, CC BY 4.0: github.com/AgriciDaniel/flow
```

不得省略或修改该署名。

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 缺少 `references/flow-framework.md` | “FLOW 参考文件尚未同步。运行：`/seo flow sync`” |
| 缺少提示词文件 | “运行 `/seo flow sync`，从 FLOW 仓库拉取最新提示词。” |
| `sync_flow.py` 网络错误 | 显示脚本的 stderr。检查速率限制：`gh api rate_limit`。 |
| `sync_flow.py` 身份验证错误 | 运行 `gh auth login`，然后重试。 |