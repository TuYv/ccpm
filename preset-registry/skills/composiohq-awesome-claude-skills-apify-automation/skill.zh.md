---
name: Apify Automation
description: "Automate web scraping and data extraction with Apify -- run Actors, manage datasets, create reusable tasks, and retrieve crawl results through the Composio Apify integration."
requires:
  mcp:
    - rube
---
# Apify 自动化

在 Claude Code 中直接运行 **Apify** 网页抓取 Actor 并直接管理数据集。可同步或异步执行爬虫，检索结构化数据，创建可复用任务，并在不离开终端的情况下查看运行日志。

**工具包文档：** [composio.dev/toolkits/apify](https://composio.dev/toolkits/apify)

---

## 设置

1. 将 Composio MCP 服务器添加到你的配置：
   ```
   https://rube.app/mcp
   ```
2. 按提示连接你的 Apify 账户。代理将提供一个认证链接。
3. 在 [apify.com/store](https://apify.com/store) 浏览可用 Actor。每个 Actor 都有自己独特的输入模式——运行前务必查看该 Actor 的文档。

---

## 核心工作流

### 1. 同步运行 Actor 并获取结果

在一次调用中执行一个 Actor 并立即检索其数据集条目。适用于快速抓取任务。

**工具：** `APIFY_RUN_ACTOR_SYNC_GET_DATASET_ITEMS`

关键参数：
- `actorId`（必填）-- 采用 `username/actor-name` 格式的 Actor ID（例如 `compass/crawler-google-places`）
- `input` -- 与 Actor 模式匹配的 JSON 输入对象。每个 Actor 的字段名不同——请在 [apify.com/store](https://apify.com/store) 查看准确模式。
- `limit` -- 返回的最大条目数
- `offset` -- 用于分页跳过条目
- `format` -- `json`（默认）、`csv`、`jsonl`、`html`、`xlsx`、`xml`
- `timeout` -- 运行超时（秒）
- `waitForFinish` -- 最大等待时长（0–300 秒）
- `fields` -- 要包含的字段，以逗号分隔列表形式
- `omit` -- 要排除的字段，以逗号分隔列表形式

示例提示：*“为 ‘New York 的餐厅’ 运行 Google Places 抓取器，并返回前 50 条结果”*

---

### 2. 异步运行 Actor

触发 Actor 运行而不等待完成。用于长时间运行的抓取任务。

**工具：** `APIFY_RUN_ACTOR`

关键参数：
- `actorId`（必填）-- Actor 的 slug 或 ID
- `body` -- Actor 的 JSON 输入对象
- `memory` -- 以 MB 为单位的内存限制（必须为 2 的幂，最小 128）
- `timeout` -- 运行超时（秒）
- `maxItems` -- 返回条目的上限
- `build` -- 指定构建标签（例如 `latest`、`beta`）

随后使用 `APIFY_GET_DATASET_ITEMS` 并结合运行的 `datasetId` 来检索结果。

示例提示：*“使用 1024MB 内存异步启动 example.com 的网页抓取 Actor”*

---

### 3. 获取数据集条目

从指定数据集中获取数据，支持分页、字段选择和过滤。

**工具：** `APIFY_GET_DATASET_ITEMS`

关键参数：
- `datasetId`（必填）-- 数据集标识符
- `limit`（默认/最大 1000）-- 每页条目数
- `offset`（默认 0）-- 分页偏移量
- `format` -- `json`（推荐）、`csv`、`xlsx`
- `fields` -- 仅包含特定字段
- `omit` -- 排除特定字段
- `clean` -- 移除 Apify 特有元数据
- `desc` -- 逆序（最新优先）

示例提示：*“以 JSON 格式从数据集 myDatasetId 获取前 500 条条目”*

---

### 4. 查看 Actor 详情

在运行前查看 Actor 元数据、输入模式和配置。

**工具：** `APIFY_GET_ACTOR`

关键参数：
- `actorId`（必填）-- `username/actor-name` 格式的 Actor ID 或十六进制 ID

示例提示：*“展示 apify/web-scraper Actor 的详情和输入模式”*

---

### 5. 创建可复用任务

使用预设输入配置可复用的 Actor 任务，用于周期性抓取工作流。

**工具：** `APIFY_CREATE_TASK`

先配置一次任务，再以一致的输入参数重复触发。适用于定时任务或周期性数据采集工作流。

示例提示：*“为 Google Search 抓取器创建一个 Apify 任务，默认查询为 ‘AI startups’，地区为美国”*

---

### 6. 管理运行与数据集

列出 Actor 运行、浏览数据集，并查看运行详情，用于监控和调试。

**工具：** `APIFY_GET_LIST_OF_RUNS`、`APIFY_DATASETS_GET`、`APIFY_DATASET_GET`、`APIFY_GET_LOG`

用于列出运行记录：
- 按 Actor 筛选，并可选按状态筛选
- 从运行详情获取 `datasetId` 以便检索数据

用于数据集管理：
- `APIFY_DATASETS_GET` -- 使用分页列出你的全部数据集
- `APIFY_DATASET_GET` -- 获取指定数据集的元数据

用于调试：
- `APIFY_GET_LOG` -- 获取某次运行或构建的执行日志

示例提示：*“列出 web scraper Actor 最近 10 次运行，并显示最近一次运行的日志”*

---

## 已知陷阱

- **Actor 输入模式差异很大：**每个 Actor 都有自己独特的输入字段。像 `queries` 或 `search_terms` 这类通用字段名会被拒绝。务必在 [apify.com/store](https://apify.com/store) 查看该 Actor 页面以获取准确的字段名（例如 Google Maps 的 `searchStringsArray`、网页抓取器的 `startUrls`）。
- **URL 格式要求：**URL 中必须始终包含完整协议（`https://` 或 `http://`）。许多 Actor 需要以带有 `url` 属性的对象形式传递 URL：`{"startUrls": [{"url": "https://example.com"}]}`。
- **数据集分页上限：**`APIFY_GET_DATASET_ITEMS` 每次调用的 `limit` 上限为 1000。对于大型数据集，请使用 `offset` 循环获取全部条目。
- **枚举值需小写：**大多数 Actor 期望小写枚举值（如 `relevance` 而不是 `RELEVANCE`，`all` 而不是 `ALL`）。
- **同步超时为 5 分钟：**`APIFY_RUN_ACTOR_SYNC_GET_DATASET_ITEMS` 的 `waitForFinish` 最大值为 300 秒。运行时间更长的任务请使用 `APIFY_RUN_ACTOR`（异步）并使用 `APIFY_GET_DATASET_ITEMS` 轮询。
- **数据量带来的成本：**大型数据集抓取成本较高。应优先使用适中的 `limit` 并采用增量处理，以避免超时或内存压力。
- **推荐 JSON 格式：**虽然支持 CSV/XLSX，但 JSON 是最适合自动化处理的格式。避免在下游自动化中使用 CSV/XLSX。

---

## 快速参考

| Tool Slug | Description |
|---|---|
| `APIFY_RUN_ACTOR_SYNC_GET_DATASET_ITEMS` | 同步运行 Actor 并立即获取结果 |
| `APIFY_RUN_ACTOR` | 异步运行 Actor（触发即返回） |
| `APIFY_RUN_ACTOR_SYNC` | 同步运行 Actor，返回输出记录 |
| `APIFY_GET_ACTOR` | 获取 Actor 元数据和输入模式 |
| `APIFY_GET_DATASET_ITEMS` | 从数据集检索条目（分页） |
| `APIFY_DATASET_GET` | 获取数据集元数据（条目数量等） |
| `APIFY_DATASETS_GET` | 列出所有用户数据集 |
| `APIFY_CREATE_TASK` | 创建可复用的 Actor 任务 |
| `APIFY_GET_TASK_INPUT` | 查看任务的已存输入 |
| `APIFY_GET_LIST_OF_RUNS` | 列出 Actor 的运行记录 |
| `APIFY_GET_LOG` | 获取某次运行的执行日志 |

---

*由 [Composio](https://composio.dev) 提供支持*
