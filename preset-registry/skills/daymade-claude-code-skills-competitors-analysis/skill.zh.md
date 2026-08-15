---
name: competitors-analysis
description: >-
  Discover, clone, update, and analyze competitor repositories with evidence-based
  competitive intelligence. Use when tracking competitors, reviewing competitor
  source code, adding a competitor repository, comparing product capabilities,
  building a competitor landscape, checking whether competitor code changed, or
  when the user says "竞品分析", "竞品", "competitor scan", "latest competitor code",
  "analyze competitor", or "compare with X". Repository-backed findings must come
  from local cloned code with file:line citations; market-landscape claims must
  cite their source and volatility.
context: fork
agent: general-purpose
argument-hint: "[product-name] [competitor-url-or-search-query]"
---
# 竞品分析

构建可共享、可重复运行且可供日后审计的竞品情报。此技能分为两个层面：

1. **仓库证据**：将竞品代码克隆或更新到持久化的竞品工作区中，然后引用实际文件和提交中的事实。
2. **市场格局综合分析**：总结定位、定价、优势、劣势、空白和机会，但必须先将有来源支持的事实与判断区分开来。

此技能有意涵盖轻量级的“竞品扫描”工作流。扫描有助于制作市场格局表，但不足以支撑技术结论。

## 入口路由

如果用户的请求缺少产品/市场或目标客户群体信息，请先询问相关背景，再综合分析定位或机会。已知竞品是可选信息；如果未提供，则使用发现模式。

根据用户的措辞选择路径：

| 用户意图 | 模式 | 要执行的操作 |
|---|---|---|
| “查找竞品”、“竞品有哪些”、宽泛的市场查询 | 发现 | 搜索 GitHub 和 Web 来源，筛选候选对象，仅克隆相关仓库 |
| “添加竞品 <url>” | 导入 | 克隆仓库，记录远程地址和提交，然后生成首份画像 |
| “分析竞品”、“审查此仓库” | 画像 | 在本地更新或克隆仓库，阅读代码，编写包含引用的技术画像 |
| “比较”、“市场格局”、“机会” | 市场格局 | 确保每个竞品都有画像，然后综合分析空白和机会 |
| “最新代码”、“有没有更新” | 更新 | 拉取/获取现有竞品的更新，并在分析前报告发生变化的提交 |

## 持久化源文件布局

使用持久化工作区，而不是 `/tmp`。默认基础目录为：

```bash
COMPETITORS_BASE="${COMPETITORS_BASE:-$HOME/workspace/competitors}"
```

目录约定：

```text
$COMPETITORS_BASE/
└── {product-slug}/
    ├── {owner-repo}/
    └── ...
```

对于 GitHub 仓库，使用 `owner-repo`，以避免复刻仓库和名称相似的项目发生冲突。如果用户的计算机上已存在产品目录，请将其作为事实来源，不要在其他位置重新克隆。

## 预检

分析前，应通过命令而非记忆确认以下事实：

```bash
repo="$COMPETITORS_BASE/{product-slug}/{owner-repo}"
test -d "$repo/.git"
git -C "$repo" remote -v
git -C "$repo" fetch --all --prune
git -C "$repo" log -1 --format='%H%x09%cI%x09%s'
```

如果仓库不存在，请先克隆。对于 GitHub，应尽可能优先使用 SSH：

```bash
mkdir -p "$COMPETITORS_BASE/{product-slug}"
git clone --depth 1 <git-ssh-url> "$COMPETITORS_BASE/{product-slug}/{owner-repo}"
```

如果公共仓库的 SSH 连接失败，请报告该失败；仅当使用仓库的 HTTPS URL 重试能够推动工作继续进行时，才进行重试。

## 发现工作流

使用 `gh search repos` 发现 GitHub 仓库。应使用多个查询短语进行搜索；不要只信任一个关键词。

```bash
gh search repos "product keywords" \
  --limit 30 \
  --archived=false \
  --json fullName,url,description,stargazersCount,forksCount,openIssuesCount,language,pushedAt,updatedAt,defaultBranch
```

对于每个候选项目，记录：

| 字段 | 来源 |
|---|---|
| 仓库名称和 URL | `gh search repos` / `gh repo view` |
| 描述 | GitHub API，或克隆后引用 README 行号 |
| 活跃度 | `pushedAt`、最新提交，以及发布说明（如有） |
| Star/fork/issue 数量 | GitHub API，并注明获取日期 |
| 相关原因 | 用户的产品范围 + 仓库证据 |

仅克隆与用户产品或分析目标相关的候选项目。
对于广泛的市场，应先提供附有证据的候选项目短名单，然后分析其中
最具代表性的一组。

## 仓库事实收集

按以下顺序读取文件并记录确切来源：

1. 项目元数据：`package.json`、`pyproject.toml`、`Cargo.toml`、`go.mod` 或
   同等文件。
2. README 和文档：产品定位、截图、安装方式、定价链接。
3. 入口点：`main`、`bin`、`scripts`、`src/`、`app/`、`packages/`。
4. 核心实现：渲染器、解析器、存储、导出、同步、认证、API 或
   特定领域的模块。
5. 测试和固件：它们通常会揭示支持的数据结构和边界情况。
6. 发布记录/变更日志：当前方向和近期变更。

引用前使用 `nl -ba <file>` 或带行号的编辑器。每一项有关实现的技术
主张都需要 `file:line` 证据。

## 报告结构

对于单个竞争对手，使用 `references/profile_template.md`。

对于市场格局摘要，使用以下结构：

```markdown
# {Product} Competitor Landscape

## Source Register
| Competitor | Local path | Remote | Commit | Retrieved |
|---|---|---|---|---|

## Positioning
| Competitor | User segment | Primary promise | Source |
|---|---|---|---|

## Product And Technical Comparison
| Dimension | Competitor A | Source | Competitor B | Source | Our product | Source |
|---|---|---|---|---|---|---|

## Strengths
| Competitor | Strength | Evidence | Why it matters |
|---|---|---|---|

## Weaknesses And Gaps
| Competitor | Gap | Evidence | Opportunity |
|---|---|---|---|

## Opportunities
| Opportunity | Evidence base | Product implication | Confidence |
|---|---|---|---|

## Risks And Assumptions
| Item | What is known | What still needs verification | Next check |
|---|---|---|---|
```

## 证据规则

### 必需

| 主张类型 | 所需证据 |
|---|---|
| 依赖项/框架/版本 | 配置文件行号引用 |
| 功能支持 | README/文档行号引用；涉及技术细节时还需代码引用 |
| 解析器/导出/存储行为 | 代码行号引用 |
| 定价/云托管主张 | 官方页面引用，并注明获取日期 |
| 受欢迎程度/活跃度 | GitHub API/页面引用，并注明获取日期 |
| 机会判断 | 其所依据的证据行，以及明确的置信度 |

### 禁止

不要撰写没有证据支持的技术主张。除非出现在明确的“错误示例”块中，否则应避免以下表达方式：

| 表达方式 | 原因 |
|---|---|
| "推测", "可能", "应该", "大概", "似乎" | 混淆证据与判断 |
| "未公开", "未披露" | 假装了解披露状态 |
| "architecture, inferred from UI" | 技术架构必须来自代码 |
| 无来源的数字 | 以后无法审计 |

当证据不可用时，写明 `待验证`，并说明能够验证该内容的下一项具体检查。

## 输出质量标准

完成之前，请执行 `references/analysis_checklist.md` 中的检查：

- 本地仓库存在于 `$COMPETITORS_BASE/{product-slug}/` 下。
- 已记录远程 URL 和最新提交。
- 每项技术声明都有 file:line 引用。
- 市场事实有来源和检索日期。
- 对竞争格局的判断与事实分开表述。
- 最终答案明确指出差距、机会和风险，且不将其伪装成代码事实。

## 脚本

使用 `scripts/update-competitors.sh` 作为持久化竞品仓库管理的起点：

```bash
COMPETITORS_BASE="$HOME/workspace/competitors" \
PRODUCT_NAME="{product-slug}" \
./scripts/update-competitors.sh status

./scripts/update-competitors.sh discover "claude code viewer"
./scripts/update-competitors.sh clone-url https://github.com/org/repo
./scripts/update-competitors.sh pull
```

该脚本是一个模板。对于长期维护的产品，请将其复制到该产品自己的仓库或运维目录中，并填写持久化的竞品列表。

## 与产品分析的关系

`product-analysis` 可能会在比较模式下调用此技能。此技能应专注于竞品发现、仓库证据和竞争分析综合。不要将其变成通用的产品审计编排器。