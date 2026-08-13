---
description: Interactive wizard to design and validate a chaos engineering experiment
---
# /chaos-experiment

使用 `chaos-engineering` 技能逐步设计混沌工程实验。生成计划、计算爆炸半径、验证中止条件，并输出可供同行评审的 Markdown 计划。

## 用法

```
/chaos-experiment
/chaos-experiment --target checkout-svc --attack latency
```

## 实现

```bash
SKILL=engineering/chaos-engineering/skills/chaos-engineering

# Step 1: gather inputs interactively (target, hypothesis, attack, magnitude, ...)
# Step 2: run experiment_designer.py to produce the plan
python "$SKILL/scripts/experiment_designer.py" \
  --target "$TARGET" --hypothesis "$HYPOTHESIS" \
  --attack "$ATTACK" --magnitude "$MAGNITUDE" \
  --duration-min "$DURATION" \
  --abort-if "$ABORT" --owner "$OWNER" \
  --format json > .chaos-plan.json

# Step 3: calculate blast radius against the team's error budget
python "$SKILL/scripts/blast_radius_calculator.py" \
  --traffic-share "$TRAFFIC_SHARE" \
  --user-pop "$USER_POP" \
  --duration-min "$DURATION" \
  --baseline-availability "$BASELINE_AVAIL" \
  --expected-impact-availability "$IMPACT_AVAIL"

# Step 4: render the markdown plan for peer review
python "$SKILL/scripts/experiment_designer.py" \
  --target "$TARGET" --hypothesis "$HYPOTHESIS" \
  --attack "$ATTACK" --abort-if "$ABORT" --owner "$OWNER"
```

## 输出

一份 Markdown 计划，包含：

- 假设、稳态指标、攻击、强度、持续时间
- 爆炸半径（计算得出）及风险评分（GREEN/YELLOW/RED）
- 从 `--abort-if` 解析出的中止条件
- 回滚流程
- 监控仪表板链接
- 学习问题

## 前置条件

- 已安装 `chaos-engineering` 技能
- 已确定目标
- 稳态指标和仪表板可用
- 值班团队可用
- 已知错误预算（或使用默认值）

## 后置条件

- 写入 `.chaos-plan.json`，供之后与 `experiment_postmortem.py` 配合使用
- 流式输出 Markdown 计划以供评审
- 输出建议：PROCEED / REDUCE / ABORT