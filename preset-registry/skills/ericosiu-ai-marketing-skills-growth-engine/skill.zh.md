# 增长引擎

## 前置步骤（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：**此技能会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在用户主动选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

基于 Karpathy 的 autoresearch 模式并将其应用于营销的自主增长实验框架。它可以创建包含假设的实验、记录数据点、运行统计分析（bootstrap CI + Mann-Whitney U）、自动将胜出方案加入动态更新的作战手册，并建议后续实验。支持批量模式（最多可同时测试 10 个变体）。

## 用法

在以下情况使用此技能：
- 为任何营销渠道创建或管理 A/B 实验或多变量实验
- 在内容发布或营销活动运行后记录实验数据点
- 为实验评分，以确定统计意义上的胜出方案
- 在创建新内容之前查看作战手册，了解经过验证的最佳实践
- 生成涵盖所有渠道的每周记分卡
- 监控营销活动的进度和健康状况

请勿用于：
- 一次性内容创作（可以将作战手册的输出作为输入，但不要运行此引擎）
- 非实验性分析或报告
- 在外部平台中设置营销活动（此工具用于跟踪实验，而非配置营销活动）

## 命令

### 创建实验
```bash
python3 experiment-engine.py create \
  --agent <agent_name> \
  --hypothesis "What you expect to happen" \
  --variable "<variable_name>" \
  --variants '["variant_a", "variant_b"]' \
  --metric "<primary_metric>" \
  --cycle-hours 24
```

对于包含 3–10 个变体的测试，请添加 `--batch-mode`。要覆盖自动检测结果，请添加 `--min-samples N`。

### 记录数据点
```bash
python3 experiment-engine.py log \
  --agent <agent_name> \
  --experiment-id <EXP-ID> \
  --variant "<variant_name>" \
  --metrics '{"metric_name": value}'
```

### 为实验评分
```bash
python3 experiment-engine.py score --agent <agent_name> --experiment-id <EXP-ID>
```

状态：`running` → `trending` → `keep`（胜出）或 `discard`（落败）

胜出方案会自动加入作战手册。要求 p < 0.05 且提升幅度 ≥ 15%。

### 列出实验
```bash
python3 experiment-engine.py list --agent <agent_name> [--status running|trending|keep|discard]
```

### 查看作战手册
```bash
python3 experiment-engine.py playbook --agent <agent_name>
```

在创建新内容之前，请始终查看作战手册，以应用经过验证的最佳实践。

### 建议后续实验
```bash
python3 experiment-engine.py suggest --agent <agent_name>
```

### 生成每周记分卡
```bash
python3 autogrowth-weekly-scorecard.py [--weeks N] [--output file.md]
```

### 检查营销活动进度
```bash
python3 pacing-alert.py [--json]
```

退出代码 0 = 进度正常，1 = 存在警报。

## 工作流程

1. 创建内容之前：`playbook` → 应用经过验证的规则
2. 发布时：`log` → 记录所使用的变体及其指标
3. 定期执行：`score` → 检查实验是否已达到统计显著性
4. 每周执行：`autogrowth-weekly-scorecard.py` → 审查所有渠道
5. 完成实验后：`suggest` → 选择下一个要测试的变量

## 配置

### 必需的环境变量

| 变量 | 说明 |
|----------|-------------|
| `GROWTH_ENGINE_DATA_DIR` | 数据目录（默认值：`./data/experiments`） |
| `GROWTH_ENGINE_AGENTS` | 以逗号分隔的代理名称（默认值：`content,email,linkedin,seo,blog`） |

### 可选调优配置

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `HIGH_VOLUME_AGENTS` | `content,email` | 仅需每个变体 10 个样本的代理 |
| `LOW_VOLUME_AGENTS` | `seo,linkedin,blog` | 需要每个变体 30 个样本的代理 |
| `P_WINNER` | `0.05` | 判定胜出者的 p 值阈值 |
| `P_TREND` | `0.10` | 判定趋势的 p 值阈值 |
| `LIFT_WIN` | `15.0` | 作出保留决策所需的最小提升百分比 |
| `BOOTSTRAP_ITERATIONS` | `1000` | 用于置信区间的 Bootstrap 重采样次数 |
| `BATCH_MODE_MAX_VARIANTS` | `10` | 批处理模式下的最大变体数 |

### 节奏预警变量

| 变量 | 说明 |
|----------|-------------|
| `PIPELINE_API_URL` | Pipeline/CRM API 端点 |
| `PIPELINE_AUTH_TOKEN` | Pipeline API 的 Bearer 令牌 |
| `RECRUITING_API_URL` | 招聘 API 端点 |
| `RECRUITING_AUTH_TOKEN` | 招聘 API 的 Bearer 令牌 |
| `EMAIL_API_URL` | 邮件平台 API 基础 URL |
| `EMAIL_AUTH_TOKEN` | 邮件平台的 Bearer 令牌 |
| `OUTBOUND_CAMPAIGNS` | JSON：`{"name": "campaign-id"}` |
| `RECRUITING_CAMPAIGNS` | JSON：`{"name": "campaign-id"}` |
| `DAILY_LEAD_TARGET` | 每日潜在客户目标数（默认值：10） |
| `WEEKLY_CANDIDATE_TARGET` | 每周候选人目标数（默认值：400） |

### 依赖项

```
pip install numpy scipy
```