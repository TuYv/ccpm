# AI 销售管道

## 前置步骤（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：**此技能会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

完整的 AI 驱动销售管道自动化：网站访客识别 → 意向评分 → 排除 → 营销活动路由 → 沉寂交易复活 → 触发式潜客开发 → 自学习 ICP 优化。

## 何时使用

在以下情况下使用此技能：
- 基于网站访客识别（RB2B）设置自动化出站销售
- 在冷启动外联前执行排除检查
- 将潜在客户路由至合适的冷邮件营销活动
- 重新激活 HubSpot 中已关闭且丢失的交易
- 查找表现出购买信号的公司（新员工入职、融资、发布职位）
- 分析潜在客户的批准/拒绝模式，以改进 ICP 定向

## 工具

### RB2B 管道（访客 → 出站销售）

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `rb2b_webhook_ingest.py` | Webhook 服务器 + 意向评分 | `python3 rb2b_webhook_ingest.py --serve --port 4100` |
| `rb2b_suppression_pipeline.py` | 5 层排除检查 | `python3 rb2b_suppression_pipeline.py --email user@example.com` |
| `rb2b_instantly_router.py` | 完整管道：评分 → 排除 → 路由 → 加入活动 | `python3 rb2b_instantly_router.py --serve --port 4100` |

### 交易情报

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `deal_resurrector.py` | 3 层沉寂交易复活（时间衰减 + POC 扩展 + 关键支持者追踪） | `python3 deal_resurrector.py --top 10 --dry-run` |
| `trigger_prospector.py` | 网络信号监控（新员工入职、融资、代理机构搜索） | `python3 trigger_prospector.py --days 7 --top 15` |
| `icp_learning_analyzer.py` | 从批准/拒绝决策中学习，并推荐 ICP 调整 | `python3 icp_learning_analyzer.py` |

## 配置

所有脚本均使用环境变量存储 API 密钥和配置。将 `.env.example` 复制为 `.env`，并填入你的值。

### 必需的环境变量

- `HUBSPOT_API_KEY` — HubSpot 私有应用令牌（交易复活器、排除）
- `INSTANTLY_API_KEY` — Instantly API 密钥（路由器、排除）
- `BRAVE_API_KEY` — Brave Search API 密钥（触发式潜客开发器）
- `DATABASE_URL` — PostgreSQL 连接字符串（仅限 ICP 分析器）

### 关键自定义点

- **意向评分**：编辑 webhook_ingest 中的 `PAGE_INTENT_SCORES` 字典，使其与你的 URL 模式匹配
- **代理机构检测**：编辑路由器中的 `AGENCY_KEYWORDS_*`，以适配你的市场
- **丢单原因评分**：编辑 deal_resurrector 中的 `LOSS_REASON_BONUS`，以适配你的成交失败原因
- **信号查询**：编辑 trigger_prospector 中的 `SEARCH_QUERIES`，以适配你的目标市场
- **营销活动路由**：使用你的 Instantly 营销活动 UUID 编辑 `data/campaigns.json`

## 数据流

```
RB2B Webhook → Ingest (score) → Suppress (5 layers) → Route (classify) → Instantly
HubSpot CRM  → Deal Resurrector (score + draft emails) → Review Queue
Brave Search → Trigger Prospector (score + enrich) → Outreach Queue
Prospect DB  → ICP Analyzer (learn patterns) → Filter Recommendations
```

## 依赖项

- Python 3.9+
- `requests`（用于 HubSpot API）
- `psycopg2-binary`（仅用于 ICP Analyzer）
- 无其他外部依赖项——脚本使用标准库 HTTP 服务器和 urllib