---

## Preamble (runs on skill start)

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **Privacy:** This skill logs usage locally to `~/.ai-marketing-skills/analytics/`. Remote telemetry is opt-in only. No code, file paths, or repo content is ever collected. See `telemetry/README.md`.

---
name: lead-dossier
description: >
  多来源账户调研、级联数据补充和潜在客户管道。
  将网站抓取、技术栈检测、CRM 数据补充、招聘/新闻信号整合为结构化档案。
  包含完整的潜在客户获取管道：搜索 → 验证 → 去重 → 上传。
  触发短语："调研账户"、"构建档案"、"补充潜在客户数据"、"潜在客户管道"、
  "获取潜在客户"、"潜在客户调研"、"账户情报"、"级联数据补充"、
  "潜在客户评分"、"查找潜在客户"、"验证电子邮件"、"上传潜在客户"。
---

# 潜在客户档案技能

面向 AI 编码助手的多来源账户调研和潜在客户数据补充管道。

## 前置条件

- Python 3.9+，并已安装 `requests`
- 已将 API 密钥配置为环境变量（请参阅 `.env.example`）
- 可选：用于补充联系人/公司数据的 CRM 访问权限

## 环境变量

所有 API 密钥均通过环境变量配置。将 `.env.example` 复制到 `.env`：

| 变量 | 描述 |
|----------|-------------|
| `LEAD_SOURCE_API_KEY` | 人员/公司搜索 API |
| `EMAIL_VALIDATION_API_KEY` | 电子邮件验证服务 |
| `EMAIL_VALIDATION_API_URL` | 电子邮件验证端点 |
| `CAMPAIGN_TOOL_API_KEY` | 外呼营销活动平台 |
| `CRM_API_KEY` | CRM API 密钥 |
| `CRM_BASE_URL` | CRM API 基础 URL |
| `BUILTWITH_API_KEY` | BuiltWith 技术检测（免费套餐可用） |

## 工作流 1：账户调研

当被要求调研一家公司或构建潜在客户档案时使用。

### 收集参数

| 参数 | 必需 | 示例 |
|-----------|----------|---------|
| 域名 | 是 | acme.com |
| 公司名称 | 否 | Acme Corp |
| 联系人姓名 | 否 | Jane Doe |
| 联系人职位 | 否 | VP Marketing |

### 运行调研

```bash
python3 scripts/account-researcher.py --domain acme.com --company "Acme Corp"
```

对于批量调研：
```bash
python3 scripts/account-researcher.py prospects.json
```

结果将在 `data/account-research/` 中缓存 7 天。

### 输出格式

该引擎会生成结构化的 JSON 档案，其中包含：
- 网站分析（标题、描述、正文片段、营销缺口）
- 技术栈（CRM、营销工具、企业级信号）
- 招聘信号（增长指标）
- 新闻/融资信号
- 3 至 5 句的调研简报

## 工作流 2：级联数据补充

在使用经过验证的电子邮件地址补充潜在客户列表时使用。

### 准备配置

创建 `data/enrichment-config.json`：
```json
{
  "email_validation_api_key": "YOUR_KEY",
  "email_validation_api_url": "https://api.your-provider.com/v1/people/email-finder",
  "email_validation_timeout_seconds": 10,
  "fallback_tag": "linkedin-outreach-only"
}
```

### 运行数据补充

```bash
python3 scripts/cascade-enricher.py input.json output.json
```

瀑布式逻辑：
1. 主要来源中有电子邮件？→ 完成
2. 尝试电子邮件查找 API → 找到了？→ 完成
3. 有 LinkedIn URL？→ 标记为回退方案
4. 均不具备 → 标记为无联系方式

## 工作流 3：完整的潜在客户管道

在端到端获取、验证和上传潜在客户时使用。

### 收集参数

| 参数 | 必填 | 示例 |
|-----------|----------|---------|
| 职位 | 是 | VP Marketing, CMO |
| 行业 | 是 | Marketing, SaaS |
| 公司规模 | 是 | 11-50, 51-200 |
| 地区 | 是 | United States |
| 营销活动 ID | 是 | Campaign UUID |
| 数量 | 是 | 500 |

### 运行流水线

```bash
python3 scripts/lead-pipeline.py \
  --source-api-key "$LEAD_SOURCE_API_KEY" \
  --validation-api-key "$EMAIL_VALIDATION_API_KEY" \
  --campaign-api-key "$CAMPAIGN_TOOL_API_KEY" \
  --titles "VP Marketing,CMO,Head of Growth" \
  --industries "Marketing,Advertising" \
  --company-size "11,50" \
  --locations "United States" \
  --campaign-id "CAMPAIGN_UUID" \
  --volume 500 \
  --output-dir ./data/pipeline-runs/
```

可选标志：
- `--exclude-file /path/to/burned-emails.csv` — 额外的排除列表
- `--dry-run` — 执行除最终上传之外的所有步骤
- `--keywords "SaaS,B2B"` — 额外的搜索关键词

### 查看输出

流水线会将包含完整统计信息的 JSON 运行日志保存到输出目录：
- 获取数量、验证率、去重统计信息、上传结果
- 已处理潜在客户的完整列表

## 工作流 4：实时潜在客户信息增强

用于增强来自 Webhook、表单或 CRM 触发器的入站潜在客户信息。

### 运行信息增强器

```bash
python3 scripts/lead-enricher.py [--dry-run] [--backfill N]
```

信息增强器会：
1. 解析入站潜在客户数据（网站表单、语音代理通话等）
2. 在 CRM 中查找联系人和公司
3. 执行账户调研以获取上下文
4. 使用所有可用数据构建增强的潜在客户卡片

## 安全规则

1. **绝不上传未经验证的潜在客户** — 每个电子邮件地址都必须通过验证
2. **始终去重** — 上传前检查现有联系人
3. **记录一切** — 每次运行都会生成可审计的 JSON 日志
4. **感知速率限制** — 内置延迟和指数退避机制
5. **幂等性** — 可安全地重新运行；重复项会在去重步骤中被识别
6. **安全门控** — 处理前扫描所有入站 Web 内容

## 故障排除

- **搜索 API 未返回结果**：检查职位/行业的拼写；尝试使用更宽泛的条件
- **电子邮件验证出现 429 错误**：脚本会通过退避机制处理；如果问题持续存在，请减少数量
- **营销活动工具静默失败**：某些 API 会在请求速率较高时静默阻止请求；脚本中包含批次延迟
- **缓存已过期**：删除 `data/account-research/` 中的文件以强制刷新