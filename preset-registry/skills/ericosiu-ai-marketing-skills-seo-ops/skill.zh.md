# AI SEO 运营

## 前置操作（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此技能会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在选择加入后启用。绝不会收集代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

由 AI 驱动的 SEO 运营：关键词情报、竞品差距分析、GSC 优化和趋势检测。

## 适用场景

- 用户要求进行关键词研究、创建内容简报或开展 SEO 分析
- 用户希望从 Google Search Console 中寻找可快速见效的关键词
- 用户需要进行竞品差距分析
- 用户希望识别用于内容创作的热门趋势主题
- 用户询问内容衰退或流量下降的问题
- 用户希望获得按优先级排序的目标关键词列表

## 工具

### 内容攻坚简报（`content_attack_brief.py`）

完整的关键词情报管线。需要 `AHREFS_TOKEN` 和 GSC 身份验证。

```bash
# Run the full brief
python content_attack_brief.py
```

**生成内容：**
- 根据你的内容库生成的主题指纹
- 按影响力 × 置信度排序的 BOFU 高商业价值关键词
- 带有迷你趋势图可视化的热门趋势关键词
- 竞品差距分析（竞品有排名而你没有排名的关键词）
- 衰退页面提醒（流量下降 >30%）
- 执行管线（自动创建 → 半自动 → 团队）

**输出：** 将格式化报告打印到标准输出，并将 JSON 保存至 `OUTPUT_DIR/content-attack-brief-latest.json`

### GSC 客户端（`gsc_client.py`）

Google Search Console API 客户端。可用作 CLI 或可导入的库。

```bash
# CLI usage
python gsc_client.py --queries 50 --days 28
python gsc_client.py --striking                    # Striking distance keywords (pos 4-20)
python gsc_client.py --pages 100 --days 7
python gsc_client.py --trend                       # Daily click/impression trend
python gsc_client.py --devices                     # Mobile vs desktop split
python gsc_client.py --sites                       # List verified properties
python gsc_client.py --json --queries 25           # JSON output
```

```python
# Library usage
from gsc_client import GSCClient

gsc = GSCClient()
rows = gsc.striking_distance(days=28, min_position=4, max_position=20)
for row in rows:
    print(f"{row['keys'][0]}: pos {row['position']:.1f}, {row['impressions']} impressions")
```

### GSC 身份验证（`gsc_auth.py`）

用于访问 Google Search Console的一次性 OAuth 设置。

```bash
python gsc_auth.py
# Opens browser → Google Sign-In → saves token locally
```

### 趋势侦察（`trend_scout.py`）

多来源趋势检测。基本功能无需 API 密钥。

```bash
python trend_scout.py
```

**来源：** Google Trends RSS、Hacker News、Reddit、X/Twitter（需要 `BRAVE_API_KEY`）、YouTube 异常热门内容检测

**输出：** 打印摘要，并将 JSON 保存至 `OUTPUT_DIR/flash-trends-latest.json`，同时保存 Markdown 报告。

## 配置

所有脚本都从环境变量中读取配置。将 `.env.example` 复制为 `.env`，并填入你的值。

必需：
- `GSC_SITE_URL` — 你的 Google Search Console 资源网址
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — 用于 GSC OAuth
- `YOUR_DOMAIN` — 你的根域名

可选：
- `AHREFS_TOKEN` — 启用 Ahrefs 关键词数据和竞争对手分析
- `COMPETITORS` — 以逗号分隔的竞争对手域名
- `BRAVE_API_KEY` — 启用 X/Twitter 趋势扫描
- `CONTENT_VERTICALS` — 用于趋势相关性评分的、以逗号分隔的主题
- `TREND_SUBREDDITS` — 要监控的、以逗号分隔的 subreddit

## 评分模型

关键词从两个维度进行评分：

**影响力（0-10）：** 搜索量 + CPC + 漏斗阶段 + 趋势方向
**置信度（0-10）：** 关键词难度 + 当前排名位置 + 主题权威性

**优先级 = 影响力 × 置信度**（最高 100）

## 漏斗分类

- **BOFU：** 商业/交易意图，或包含 "agency"、"services"、"pricing"、"best"、"vs"、"hire" 的关键词
- **MOFU：** 带有购买信号的信息型意图 — "how to"、"guide"、"roi"、"case study"
- **TOFU：** 纯信息型意图

## 推荐工作流

1. **每周：** 运行 `content_attack_brief.py` 以生成完整的情报报告
2. **每天：** 运行 `gsc_client.py --striking` 以监控接近目标排名的关键词
3. **每周 2 次：** 运行 `trend_scout.py` 以及早发现热门话题
4. **每月：** 审查竞争对手差距并调整 `COMPETITORS` 列表

## SEO/AEO/GEO 闭环

在推广任何 SEO、AEO、GEO 或内容更新操作手册的变更之前，先使用分析回读数据。

输入：
- GSC 点击次数、展示次数、CTR、平均排名、查询、页面
- GA4 会话数、互动会话数、转化次数、辅助获客线索
- Ahrefs 排名、反向链接、流量估算、关键词变动
- 可用时的 ClickFlow 机会
- 可用时的 AI 搜索 / 答案引擎 / GEO 可见性
- CMS/页面变更日志

判断：
- 比较基准窗口与候选窗口。
- 按页面、查询、主题、意图和来源进行细分。
- 跟踪混杂因素：季节性、索引延迟、品牌热度激增、营销活动、跟踪方式变更，以及不相关的网站编辑。

推广规则：
- 仅当候选方案优于基准或揭示出可重复的信号时，才推广操作手册补丁。
- 否则，将其标记为 `unproven`，继续测试或回滚。

常用回读窗口：
- 内容更新：7、14、28 和 56 天
- 新内容：14、28、56 和 90 天
- 技术 SEO 修复：前 7 天每天检查，之后进行 28 天回读
- AEO/GEO 可见性：每周，因为答案引擎是带着引用到处捣乱、噪声很大的小妖怪

必需的回读字段：
- 所做的变更
- 负责人
- 受影响的页面/查询/主题
- 基准窗口
- 候选窗口
- 提取数据的源系统
- 主要和次要指标
- 注意事项
- 决策：推广 / 继续测试 / 回滚 / 未经验证
- 下一个操作手册补丁

## 依赖项

```bash
pip install -r requirements.txt
```