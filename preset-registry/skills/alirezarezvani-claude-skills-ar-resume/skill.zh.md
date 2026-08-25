---
name: "ar-resume"
description: "Resume a paused experiment. Checkout the experiment branch, read results history, continue iterating. Use when the user runs /ar:ar-resume or asks to pick up a previously started autoresearch experiment."
command: /ar:ar-resume
---
# /ar:ar-resume — 恢复实验

恢复已暂停或受上下文限制的实验。读取全部历史记录，并从上次中断的位置继续。

## 用法

``` 
/ar:ar-resume                                  # 列出实验，让用户选择
/ar:ar-resume engineering/api-speed            # 恢复指定实验
```

## 功能说明

### 第 1 步：按需列出实验

如果未指定实验：

```bash
python {skill_path}/scripts/setup_experiment.py --list
```

根据 `results.tsv` 的时间，显示每个实验的状态（active/paused/done）。让用户选择。

### 第 2 步：加载完整上下文

```bash
# Checkout the experiment branch
git checkout autoresearch/{domain}/{name}

# Read config
cat .autoresearch/{domain}/{name}/config.cfg

# Read strategy
cat .autoresearch/{domain}/{name}/program.md

# Read full results history
cat .autoresearch/{domain}/{name}/results.tsv

# Read recent git log for the branch
git log --oneline -20
```

### 第 3 步：报告当前状态

向用户总结：

```
Resuming: engineering/api-speed
  Target: src/api/search.py
  Metric: p50_ms (lower is better)
  Experiments: 23 total — 8 kept, 12 discarded, 3 crashed
  Best: 185ms (-42% from baseline of 320ms)
  Last experiment: "added response caching" → KEEP (185ms)

  Recent patterns:
  - Caching changes: 3 kept, 1 discarded (consistently helpful)
  - Algorithm changes: 2 discarded, 1 crashed (high risk, low reward so far)
  - I/O optimization: 2 kept (promising direction)
```

### 第 4 步：询问下一步操作

```
How would you like to continue?
  1. Single iteration (/ar:run)  — I'll make one change and evaluate
  2. Start a loop (/ar:loop)     — Autonomous with scheduled interval
  3. Just show me the results    — I'll review and decide
```

如果用户选择循环，则将实验预先选定后交给 `/ar:loop`。
如果选择单次迭代，则交给 `/ar:run`。