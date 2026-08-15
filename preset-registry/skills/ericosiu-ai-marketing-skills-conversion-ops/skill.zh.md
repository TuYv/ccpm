# AI 转化运营

## 前置操作（Skill 启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此 Skill 会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在主动选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

AI 驱动的转化率优化：落地页审计、CRO 评分、调查细分和潜在客户磁铁生成。

## 何时使用

- 用户要求进行落地页审计或 CRO 分析
- 用户希望从多个转化维度对页面进行评分
- 用户需要识别某个 URL 上的转化瓶颈
- 用户拥有调查数据，并希望按照痛点对受访者进行细分
- 用户希望根据调查回复生成潜在客户磁铁创意
- 用户需要对多个 URL 进行批量 CRO 分析

## 工具

### CRO 审计（`cro_audit.py`）

获取落地页，并从 8 个转化维度进行评分。无需无头浏览器。

```bash
# Single URL audit
python cro_audit.py --url https://example.com/landing-page

# Batch mode — multiple URLs
python cro_audit.py --urls https://example.com/page1 https://example.com/page2

# URLs from a file (one per line)
python cro_audit.py --file urls.txt

# Specify industry for benchmark comparison
python cro_audit.py --url https://example.com --industry saas

# JSON output
python cro_audit.py --url https://example.com --json

# Save report to file
python cro_audit.py --url https://example.com --output report.json
```

**评分维度（每项 0–100 分）：**
1. **标题清晰度** — 是否能在 <5 秒内明确理解价值主张？
2. **CTA 可见性** — CTA 是否醒目、具有对比度并位于首屏？
3. **社会证明** — 是否有客户评价、徽标、案例研究和数据？
4. **紧迫感** — 是否有限量、截止日期和限时优惠？
5. **信任信号** — 是否有安全徽章、保证、隐私声明和认证？
6. **表单阻力** — 有多少个字段？表单是否让人望而却步？
7. **移动端响应能力** — 是否有 viewport meta、响应式模式和触控目标？
8. **页面速度指标** — 图片优化、脚本数量和资源大小如何？

**总体 CRO 评分** = 所有 8 个维度的加权平均值。

**输出包括：**
- 每个维度的评分及具体发现
- 按影响程度排序的优先修复项
- 每个问题的修改前后建议
- 行业基准对比
- 总体字母评级（A+ 至 F）

**支持的行业：** `saas`、`ecommerce`、`agency`、`finance`、`healthcare`、`education`、`b2b`、`general`

### 调查数据转潜在客户磁铁引擎（`survey_lead_magnet.py`）

导入调查 CSV 数据，按照痛点对受访者进行聚类，并为每个细分群体生成潜在客户磁铁简报。

```bash
# Basic usage — analyze survey CSV
python survey_lead_magnet.py --csv survey_responses.csv

# Specify which columns contain pain points / challenges
python survey_lead_magnet.py --csv survey.csv --pain-columns "biggest_challenge" "top_frustration"

# Limit number of segments
python survey_lead_magnet.py --csv survey.csv --top-segments 5

# JSON output
python survey_lead_magnet.py --csv survey.csv --json

# Save output
python survey_lead_magnet.py --csv survey.csv --output lead_magnets.json
```

**生成内容：**
- 包含受访者数量的痛点聚类
- 按规模和商业潜力排序的细分群体
- 针对每个主要细分群体的引流资料简报：
  - 标题、格式（指南/清单/模板/计算器）、吸引点
  - 内容大纲（5–7 个部分）
  - 目标 CTA 和分发渠道
  - 病毒式传播潜力评分 + 转化潜力评分
- 按优先级排序的实施路线图

**CSV 格式：** 以问题作为列标题，每位受访者占一行。适用于任何调查工具导出的数据（Typeform、Google Forms、SurveyMonkey 等）。

## 配置

无需 API 密钥。这两个工具都只在本地进行分析。

可选环境变量：

| 变量 | 是否必需 | 说明 |
|----------|----------|-------------|
| `USER_AGENT` | 否 | 用于页面抓取的自定义用户代理（已提供默认值） |
| `REQUEST_TIMEOUT` | 否 | HTTP 超时时间，单位为秒（默认值：15） |

## 推荐工作流程

1. **每周：** 在主要落地页上运行 `cro_audit.py`，持续跟踪 CRO 评分
2. **调查后：** 运行 `survey_lead_magnet.py`，将调查数据转化为内容策略
3. **发布前：** 在引入付费流量之前审核新的落地页
4. **每月：** 批量审核竞争对手的落地页，以进行基准比较

## 依赖项

```bash
pip install -r requirements.txt
```