---
name: seo-drift
description: >
  SEO drift monitoring: capture baselines of SEO-critical elements, detect changes,
  and track regressions over time. Git for SEO: baseline, diff, and track changes
  to your on-page SEO. Use when user says "SEO drift", "baseline", "track changes",
  "did anything break", "SEO regression", "compare SEO", "before and after",
  "monitor SEO changes", or "deployment check".
user-invocable: true
argument-hint: "baseline|compare|history <url>"
license: MIT
metadata:
  author: AgriciDaniel
  original_author: "Dan Colta (Pro Hub Challenge)"
  version: "2.2.5"
  category: seo
---
# SEO 漂移监控（2026 年 4 月）

为 SEO 使用 Git。捕获基线、检测回归、跟踪随时间发生的变化。

---

## 命令

| 命令 | 用途 |
|---------|---------|
| `/seo drift baseline <url>` | 将当前 SEO 状态捕获为“已知良好”快照 |
| `/seo drift compare <url>` | 将当前页面状态与已存储的基线进行比较 |
| `/seo drift history <url>` | 显示变更历史和过去的比较结果 |

---

## 捕获内容

每个基线都会记录以下 SEO 关键元素：

| 元素 | 字段 | 来源 |
|---------|-------|--------|
| Title 标签 | `title` | `parse_html.py` |
| Meta description | `meta_description` | `parse_html.py` |
| Canonical URL | `canonical` | `parse_html.py` |
| Robots 指令 | `meta_robots` | `parse_html.py` |
| H1 标题 | `h1` (数组) | `parse_html.py` |
| H2 标题 | `h2` (数组) | `parse_html.py` |
| H3 标题 | `h3` (数组) | `parse_html.py` |
| JSON-LD schema | `schema` (数组) | `parse_html.py` |
| Open Graph 标签 | `open_graph` (字典) | `parse_html.py` |
| Core Web Vitals | `cwv` (字典) | `pagespeed_check.py` |
| HTTP 状态码 | `status_code` | `fetch_page.py` |
| HTML 内容哈希 | `html_hash` (SHA-256) | 计算得出 |
| Schema 内容哈希 | `schema_hash` (SHA-256) | 计算得出 |

---

## 比较方式

比较引擎会在 **3 个严重性级别中应用 17 条规则**。加载
`references/comparison-rules.md`，查看包含阈值、
建议操作和跨 skill 参考的完整规则集。

### 严重性级别

| 级别 | 含义 | 响应时间 |
|-------|---------|---------------|
| **CRITICAL** | 破坏 SEO 的变更，可能导致流量损失 | 立即 |
| **WARNING** | 可能产生影响，需要调查 | 1 周内 |
| **INFO** | 仅用于了解，可能是有意为之 | 方便时查看 |

---

## 存储

所有数据均以 SQLite 形式存储在本地：

```
~/.cache/claude-seo/drift/baselines.db
```

### 表

- **baselines**：包含所有 SEO 元素的已捕获快照
- **comparisons**：包含触发规则和严重性的差异结果

URL 规范化可确保匹配的一致性：将 scheme/host 转为小写，移除
默认端口（80/443），对查询参数排序，移除 UTM 参数，移除
末尾斜杠。

---

## 命令：`baseline`

捕获页面的当前状态并将其存储。

**步骤：**
1. 验证 URL（通过 `google_auth.validate_url()` 进行 SSRF 防护）
2. 通过 `claude-seo run fetch_page.py <URL>` 获取页面
3. 通过 `claude-seo run parse_html.py <URL>` 解析 HTML
4. 可选：通过 `claude-seo run pagespeed_check.py <URL>` 获取 CWV（使用 `--skip-cwv` 可跳过）
5. 对 HTML 正文和 schema 内容进行哈希处理（SHA-256）
6. 将快照存储到 SQLite

**执行：**
```bash
claude-seo run drift_baseline.py <url>
claude-seo run drift_baseline.py <url> --skip-cwv
```

**输出：**包含基线 ID、时间戳、URL 以及所捕获元素摘要的 JSON。

---

## 命令：`compare`

获取页面的当前状态，并将其与最近的基线进行差异比较。

**步骤：**
1. 验证 URL
2. 从 SQLite 加载最近的基线（或指定的 `--baseline-id`）
3. 获取并解析页面当前状态
4. 运行全部 17 条比较规则
5. 按严重性对发现结果进行分类
6. 存储比较结果
7. 输出 JSON 差异报告

**执行：**
```bash
claude-seo run drift_compare.py <url>
claude-seo run drift_compare.py <url> --baseline-id 5
claude-seo run drift_compare.py <url> --skip-cwv
```

**输出：**包含所有已触发规则、旧值/新值、严重级别和操作的 JSON。

比较完成后，提供生成 HTML 报告的选项：
```bash
claude-seo run drift_report.py <comparison_json_file> --output drift-report.html
```

---

## 命令：`history`

显示某个 URL 的所有基线和比较结果。

**执行：**
```bash
claude-seo run drift_history.py <url>
claude-seo run drift_history.py <url> --limit 10
```

**输出：**按时间戳倒序排列的基线 JSON 数组，其中包含比较摘要。

---

## 跨技能集成

检测到漂移时，推荐相应的专用技能：

| 发现项 | 建议 |
|---------|----------------|
| Schema 被移除或修改 | 运行 `/seo schema <url>` 进行完整验证 |
| CWV 发生回归 | 运行 `/seo technical <url>` 进行性能审计 |
| 标题或 meta description 发生变化 | 运行 `/seo page <url>` 进行内容分析 |
| Canonical 发生变化或被移除 | 运行 `/seo technical <url>` 检查可索引性 |
| 添加了 Noindex | 运行 `/seo technical <url>` 进行可抓取性审计 |
| H1/标题结构发生变化 | 运行 `/seo content <url>` 进行 E-E-A-T 审查 |
| OG 标签被移除 | 运行 `/seo page <url>` 进行社交分享分析 |
| 状态码变为错误 | 运行 `/seo technical <url>` 进行完整诊断 |

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告来自 `fetch_page.py` 的错误。不要猜测状态。建议用户验证 URL。 |
| URL 不存在基线 | 告知用户，并建议先运行 `baseline`。 |
| SSRF 被阻止（私有 IP） | 报告 `validate_url()` 的拒绝结果。绝不绕过。 |
| SQLite 数据库缺失 | 首次使用时自动创建。不报错。 |
| CWV 获取失败（没有 API 密钥） | 将 CWV 字段存储为 `null`。比较时跳过 CWV 规则。 |
| 页面返回 4xx/5xx | 仍然将其捕获为基线（状态码 IS 一个受跟踪的字段）。 |
| 存在多个基线 | 使用最新的基线，除非指定了 `--baseline-id`。 |

---

## 安全性

- **所有 URL 获取操作**都通过 `claude-seo run fetch_page.py`，该命令会强制执行 SSRF 防护
  （阻止私有 IP、回环地址、保留地址段和 GCP 元数据端点）
- **不使用 curl，不使用 subprocess HTTP 调用**——只能使用项目经过验证的获取流程
- **所有 SQLite 查询**都使用参数化占位符（`?`），绝不进行字符串插值
- **始终验证 TLS**——整个流程中任何地方都不使用 `verify=False`

---

## 典型工作流

### 部署前/后检查
```
/seo drift baseline https://example.com     # 部署前
# ... 执行部署 ...
/seo drift compare https://example.com      # 部署后
```

### 持续监控
```
/seo drift baseline https://example.com     # 初始捕获
# ... 数周后 ...
/seo drift compare https://example.com      # 检查漂移
/seo drift history https://example.com      # 查看所有变更
```

### 调查流量下降
```
/seo drift compare https://example.com      # What changed?
/seo drift history https://example.com      # When did it change?
```