# AI 团队运营

## 前置操作（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：**此技能会在本地将使用情况记录到 `~/.ai-marketing-skills/analytics/`。远程遥测仅在主动选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

AI 驱动的团队绩效分析和会议智能：使用“埃隆算法”进行严格的绩效审计，并从会议文字记录中自动提取行动项、决策和后续事项。

## 何时使用

在以下情况下使用此技能：
- 使用结构化框架，根据 OKR/KPI 评估团队绩效
- 对团队成员进行强制排名，以识别 A/B/C 级员工
- 发现组织中的冗余岗位、瓶颈和自动化机会
- 从会议文字记录中提取行动项和决策
- 批量处理会议记录，生成结构化的后续事项列表
- 将会议行动项作为任务推送到 CRM（HubSpot）

## 工具

### 团队绩效

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `team_performance_audit.py` | 埃隆算法：五步团队审计 + 强制排名 + 评分卡 | `python3 team_performance_audit.py --input team_data.json --output report.md` |

### 会议智能

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `meeting_action_extractor.py` | 从文字记录中提取决策、行动项和后续事项 | `python3 meeting_action_extractor.py --transcript meeting.txt --format markdown` |

## 配置

所有脚本都使用环境变量访问 LLM API。将 `.env.example` 复制为 `.env`，并填写相应的值。

### 必需的环境变量

- `ANTHROPIC_API_KEY` — Anthropic API 密钥（使用 Claude 进行分析）
- `OPENAI_API_KEY` — OpenAI API 密钥（备选 LLM 提供商）

### 可选的环境变量

- `HUBSPOT_API_KEY` — HubSpot 私有应用令牌（用于将会议行动项作为任务推送）
- `LLM_PROVIDER` — `anthropic`（默认）或 `openai`
- `LLM_MODEL` — 覆盖模型名称（默认：`claude-sonnet-4-20250514` 或 `gpt-4o`）

## 数据流

```
Role Descriptions + OKRs + Output Data (CSV/JSON)
        │
        ▼
┌──────────────────────────────────┐
│   team_performance_audit.py      │
│   5-Step Elon Algorithm:         │
│   1. Question requirements       │
│   2. Delete redundancies         │
│   3. Simplify workflows          │
│   4. Accelerate bottlenecks      │
│   5. Automate what's possible    │
│                                  │
│   + Score: velocity, quality,    │
│     independence, initiative     │
│   + Stack rank: A/B/C players    │
│   + Actions: promote/coach/exit  │
└──────────────────────────────────┘
        │
        ▼
Executive Summary + Individual Scorecards + Org Recommendations


Meeting Transcripts (text files or stdin)
        │
        ▼
┌──────────────────────────────────┐
│   meeting_action_extractor.py    │
│   Extract:                       │
│   • Decisions (who + context)    │
│   • Action items (owner +        │
│     deadline + priority)         │
│   • Open questions               │
│   • Key insights / quotes        │
│   • Follow-up meetings needed    │
│   • Implicit commitments         │
│   + Confidence scores            │
└──────────────────────────────────┘
        │
        ▼
Structured JSON / Markdown + Optional CRM Push
```

## 依赖项

- Python 3.9+
- `anthropic` 或 `openai`（用于由 LLM 驱动的分析）
- `requests`（用于可选的 HubSpot 集成）