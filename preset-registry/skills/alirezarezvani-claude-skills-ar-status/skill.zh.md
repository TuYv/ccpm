---
name: "ar-status"
description: "Show experiment dashboard with results, active loops, and progress. Use when the user runs /ar:ar-status or asks how an autoresearch experiment is going."
command: /ar:ar-status
---
# /ar:ar-status — 实验仪表板

显示所有实验的结果、活动循环和进度。

## 用法

```
/ar:ar-status                                  # Full dashboard
/ar:ar-status engineering/api-speed            # Single experiment detail
/ar:ar-status --domain engineering             # All experiments in a domain
/ar:ar-status --format markdown                # Export as markdown
/ar:ar-status --format csv --output results.csv  # Export as CSV
```

## 功能说明

### 单个实验

```bash
python {skill_path}/scripts/log_results.py --experiment {domain}/{name}
```

同时检查活动循环：
```bash
cat .autoresearch/{domain}/{name}/loop.json 2>/dev/null
```

如果存在 loop.json，则显示：
```
Active loop: every {interval} (cron ID: {id}, started: {date})
```

### 域视图

```bash
python {skill_path}/scripts/log_results.py --domain {domain}
```

### 完整仪表板

```bash
python {skill_path}/scripts/log_results.py --dashboard
```

对于每个实验，还要检查 loop.json 并显示循环状态。

### 导出

```bash
# CSV
python {skill_path}/scripts/log_results.py --dashboard --format csv --output {file}

# Markdown
python {skill_path}/scripts/log_results.py --dashboard --format markdown --output {file}
```

## 输出示例

```
DOMAIN          EXPERIMENT          RUNS  KEPT  BEST         CHANGE    STATUS   LOOP
engineering     api-speed            47    14   185ms        -76.9%    active   every 1h
engineering     bundle-size          23     8   412KB        -58.3%    paused   —
marketing       medium-ctr           31    11   8.4/10       +68.0%    active   daily
prompts         support-tone         15     6   82/100       +46.4%    done     —
```