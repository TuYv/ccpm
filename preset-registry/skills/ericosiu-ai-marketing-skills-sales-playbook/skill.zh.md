# AI 销售作战手册 — 基于价值的定价与交易追加销售

## 前置步骤（Skill 启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此 Skill 会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/`。远程遥测仅在主动选择加入后启用。绝不会收集代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

一套基于价值的定价框架，可将交易金额从 $10K/mo 提升至 $40-100K/mo。包括通话前简报、分层套餐生成、通话后分析，以及用于培训销售团队掌握成熟定价技巧的模式库。

## 何时使用

在以下情况中使用此 Skill：
- 准备销售通话，需要使用竞争数据来锚定价值
- 为不同交易规模的潜在客户构建分层定价方案
- 分析销售通话转录文本，并依据基于价值的定价框架进行评分
- 培训销售代表掌握成熟的定价模式和异议处理方法
- 通过识别遗漏的价值杠杆，对现有交易进行追加销售

## 工具

### 通话前准备

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `value_pricing_briefing.py` | 生成包含竞争数据、价值计算和对话切入点的通话前简报 | `python3 value_pricing_briefing.py --domain acme.com --competitors "comp1.com,comp2.com"` |
| `value_pricing_packager.py` | 生成分层的 S/M/L + 绩效定价套餐 | `python3 value_pricing_packager.py --target-monthly 80000 --services "seo,cro,content,paid"` |

### 通话后分析

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `call_analyzer.py` | 依据基于价值的定价框架对通话转录文本进行评分 | `python3 call_analyzer.py --transcript call.txt` |
| `pricing_pattern_library.py` | 包含 10 种成熟定价模式的参考库 + 培训模式 | `python3 pricing_pattern_library.py --list` |

## 配置

所有脚本都使用环境变量来配置 API 密钥：

### 可选环境变量

- `AHREFS_API_KEY` — Ahrefs API 密钥（简报生成器，可选 — 未提供时使用存根）
- `SEMRUSH_API_KEY` — SEMrush API 密钥（简报生成器，可选 — 未提供时使用存根）
- `ANTHROPIC_API_KEY` — Anthropic API 密钥（通话分析器、模式库场景模式）
- `OPENAI_API_KEY` — OpenAI API 密钥（用于 LLM 功能的 Anthropic 替代方案）

无需 API 密钥，脚本也可以使用内置存根和示例数据进行测试。

## 核心概念

### 基于价值的定价框架

1. **以数据开场，而不是推销话术** — 在讨论服务之前，向潜在客户展示其竞争差距
2. **高位锚定** — 首先展示高端层级，让目标层级显得价格合理
3. **将价格与价值挂钩** — 每一美元的投入都对应预计投资回报率
4. **使用竞争触发因素** — 竞争对手的排名能够激发紧迫感，同时不会显得咄咄逼人
5. **提供分层选项** — 提供 3-4 个具有明确取舍的层级，并始终包含绩效选项

### 定价框架评分（0-100）

通话分析器根据以下标准对通话进行评分：
- 在推销前展示了数据（20 分）
- 提供了分级选项（20 分）
- 首先设定了较高的价格锚点（15 分）
- 将价格与价值/投资回报率相关联（15 分）
- 使用了竞争触发因素（15 分）
- 让潜在客户亲自陈述其痛点（15 分）

## 依赖项

- Python 3.9+
- `requests`（用于 API 集成）
- 无其他外部依赖项