---
name: yc-reader
description: >
  Look up Y Combinator companies, batches, and startup ecosystem data using the yc-oss API (read-only).
  Use this skill whenever the user wants to research YC-backed startups, find companies in a specific
  batch or industry, check which YC companies are hiring, explore top YC companies, or analyze
  startup trends by sector or tag.
  Triggers include: "YC companies in fintech", "who's in the latest YC batch", "YC startups hiring",
  "top Y Combinator companies", "find YC companies tagged AI", "W25 batch", "S24 companies",
  "YC stats", "Y Combinator portfolio", "startup research", "which YC companies do X",
  "venture research on YC", any mention of Y Combinator, YC batch, or YC-backed companies
  in the context of startup research, venture analysis, or market intelligence.
  This is a read-only data source — the API is a static JSON dataset updated daily.
---
# Y Combinator 读取器（只读）

从 [yc-oss/api](https://github.com/yc-oss/api) 获取 Y Combinator 公司数据。这是一个非官方开源 API，收录了所有公开发布的 YC 公司。数据来源于 YC 的 Algolia 搜索索引，并通过 GitHub Actions 每日更新。

**这是一个只读数据源。**它提供公司资料、批次列表、行业/标签分类、招聘状态和多元化数据。不存在写入操作——该 API 提供静态 JSON 文件。

**无需身份验证。**该 API 公开且免费。只需使用 `curl` 获取 JSON 端点。

---

## 第 1 步：验证前置条件

此技能只需要 `curl`（用于获取数据）和 `jq`（用于解析/筛选 JSON）。大多数系统已预装这两个工具。

```
!`(command -v curl > /dev/null && echo "CURL_OK" || echo "CURL_MISSING") && (command -v jq > /dev/null && echo "JQ_OK" || echo "JQ_MISSING")`
```

如果出现 `JQ_MISSING`，请安装它：

```bash
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt-get install jq
```

如果 `jq` 不可用，你仍然可以使用 `curl` 获取原始 JSON，并通过 Python 或其他工具内联解析——但使用 `jq` 进行筛选会方便得多。

---

## 第 2 步：确定用户需求

将用户的请求与适当的端点进行匹配。完整详情请参阅 `references/api_reference.md`。

| 用户请求 | 端点 | 说明 |
|---|---|---|
| YC 整体统计信息 | `meta.json` | 公司数量、批次列表、行业/标签列表 |
| 所有公司 | `companies/all.json` | 完整数据集（约 5,700 家公司）——响应较大 |
| 顶尖公司 | `companies/top.json` | 约 91 家表现优异的 YC 公司 |
| 正在招聘的公司 | `companies/hiring.json` | 约 1,400 家目前正在招聘的公司 |
| 非营利公司 | `companies/nonprofit.json` | YC 支持的非营利组织 |
| 多元化数据 | `companies/black-founded.json`, `hispanic-latino-founded.json`, `women-founded.json` | 创始人多元化情况 |
| 特定批次 | `batches/{batch-name}.json` | 例如 `winter-2026.json`、`spring-2026.json`、`fall-2025.json` |
| 单家公司资料 | `batches/{batch-name}/{slug}.json` | 例如 `batches/summer-2009/stripe.json`、`batches/winter-2009/airbnb.json` |
| 按行业 | `industries/{industry}.json` | 例如 `fintech.json`、`healthcare.json` |
| 按标签 | `tags/{tag}.json` | 例如 `ai.json`、`developer-tools.json` |

### 批次名称格式

批次使用 `{season}-{year}` 格式：`winter-2026`、`spring-2026`、`summer-2026`、`fall-2025`。更早的批次也遵循相同格式，可追溯至 `summer-2005`。每家公司端点也支持短格式（`w09`、`s21`）。

### 行业和标签名称格式

使用小写字母，多词名称使用连字符连接：`real-estate`、`developer-tools`、`machine-learning`。

---

## 第 3 步：执行请求

### 基础 URL

```
https://yc-oss.github.io/api/
```

### 通用模式

```bash
# Fetch and pretty-print
curl -s https://yc-oss.github.io/api/companies/top.json | jq .

# Count companies in a result
curl -s https://yc-oss.github.io/api/batches/winter-2025.json | jq length

# Filter by field (e.g., hiring companies in a batch)
curl -s https://yc-oss.github.io/api/batches/winter-2025.json | jq '[.[] | select(.isHiring == true)]'

# Extract specific fields
curl -s https://yc-oss.github.io/api/companies/top.json | jq '.[] | {name, one_liner, batch, team_size, website}'

# Search by name (case-insensitive)
curl -s https://yc-oss.github.io/api/companies/all.json | jq '[.[] | select(.name | test("stripe"; "i"))]'
```

### 关键规则

1. **在 curl 中使用 `-s` 标志**以隐藏进度输出
2. **通过管道传递给 `jq`**，以获得易读的输出并进行筛选
3. **除非必要，否则避免获取 `companies/all.json`**——其响应体积很大（约 5,700 家公司）。应尽可能优先使用更具体的端点（批次、行业、标签）
4. 当 API 没有针对用户需求提供特定端点时，**使用 `jq` 的 select/filter** 在客户端缩小结果范围
5. **批次名称使用小写字母和连字符**——应使用 `winter-2025`，而不是 `Winter 2025` 或 `W25`
6. **标签和行业名称使用小写字母和连字符**——应使用 `developer-tools`，而不是 `Developer Tools`

### 常用 jq 筛选器

| 筛选器 | 用途 |
|---|---|
| `jq length` | 统计结果数量 |
| `jq '.[0]'` | 第一家公司 |
| `jq '.[:10]'` | 前 10 家公司 |
| `jq '[.[] \| select(.isHiring == true)]'` | 仅显示正在招聘的公司 |
| `jq '[.[] \| select(.status == "Active")]'` | 仅显示活跃公司 |
| `jq '[.[] \| select(.team_size > 100)]'` | 员工人数超过 100 人的公司 |
| `jq '.[] \| {name, one_liner, batch, website}'` | 选择特定字段 |
| `jq '[.[] \| select(.name \| test("query"; "i"))]'` | 按名称搜索 |
| `jq 'sort_by(-.team_size) \| .[:10]'` | 按团队规模排名前 10 的公司 |

---

## 第 4 步：展示结果

获取数据后，以清晰的方式呈现，便于开展初创公司/风险投资研究：

1. **汇总关键数据**——公司名称、一句话简介、批次、团队规模、状态和网站
2. **突出招聘状态**——注明哪些公司正在积极招聘（增长信号）
3. 当用户可能想访问公司网站时，**包含网站 URL**
4. **对于批次列表**，汇总批次规模和值得关注的公司
5. **对于行业/标签查询**，突出趋势（公司数量、头部公司和正在招聘的公司）
6. **对于研究类查询**，提供汇总统计数据（数量、常见行业、团队规模分布）
7. **注明数据新鲜度**——API 每日更新，因此数据接近实时

---

## 第 5 步：诊断

如果请求失败：

| 错误 | 原因 | 解决方法 |
|-------|-------|-----|
| `404 Not Found` | 批次、行业或标签名称无效 | 检查 `meta.json` 以获取有效名称 |
| 空数组 `[]` | 没有公司符合查询条件 | 扩大搜索范围或检查拼写 |
| `curl: Could not resolve host` | 没有互联网连接 | 检查网络连接 |
| 响应过大/缓慢 | 正在获取 `companies/all.json`（5,700+ 条记录） | 使用更具体的端点或添加 `jq` 筛选器 |

要查找有效的批次、行业和标签名称：

```bash
# List all batches
curl -s https://yc-oss.github.io/api/meta.json | jq '.batches[].name'

# List all industries
curl -s https://yc-oss.github.io/api/meta.json | jq '.industries[].name'

# List all tags (there are 333+)
curl -s https://yc-oss.github.io/api/meta.json | jq '.tags[].name'
```

---

## 参考文件

- `references/api_reference.md`——完整的端点参考，包含公司架构、所有端点 URL 和研究工作流示例

当你需要确切的公司字段架构、有效的批次/行业/标签名称或详细的研究工作流模式时，请阅读参考文件。