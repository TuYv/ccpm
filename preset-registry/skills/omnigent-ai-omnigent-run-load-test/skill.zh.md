---
name: run-load-test
description: Run the Omnigent load test and produce a results file explaining the latencies. Load when the user wants to load-test / stress-test / benchmark Omnigent under concurrency ("load test omnigent", "stress test the server", "how many hosts/sessions/turns can it handle", "load test real agent turns / conversations", "run a load test"). The test makes each simulated user a real omnigent host that creates host-bound sessions and drives real multi-turn conversations with a mocked LLM; it boots its own local stack (dev/loadtest/run.py). Gather inputs, run it, then read the generated summary.md and explain the latency distribution (avg/median/p95/p99, throughput, failures). NOT for single-request latency micro-benchmarks (that is dev/benchmarks/).
---
# 运行 Omnigent 负载测试

端到端驱动 `dev/loadtest/`：收集输入 → 运行 → 读取 `summary.md` →
解释延迟。**每个 Locust 用户都是一个真实的 `omnigent host`**，它通过主机隧道
完成注册、创建绑定到主机的会话，并驱动**真实的多轮对话**——每一轮都是真正通过
主机运行器执行的 post→idle 循环，其中 **LLM 使用模拟实现**（零延迟），因此测得的
数字就是 Omnigent 自身的开销。`-u N` 用于扩展主机数量。

它会**启动自己的本地技术栈**（服务器 + 模拟 LLM），因此无需指定服务器，并且只能
**从仓库检出目录中**运行。对于单请求延迟微基准测试（而非并发测试），应使用另一个
工具：`dev/benchmarks/`。

## 1. 确保依赖已安装（仓库检出目录）

```bash
uv sync --extra loadtest --extra agents-sdk
```

在仓库根目录中，使用同一个解释器（例如 `.venv/bin/python`）运行。

## 2. 收集输入

询问用户（当有多个未知项时使用 AskUserQuestion）；所有输入都有默认值。

| 输入 | 标志 | 默认值 | 说明 |
|---|---|---|---|
| 主机数 | `--users` | 4 | 并发主机数（N）——主要的扩展参数。 |
| 生成速率 | `--spawn-rate` | 1 | 每秒启动的主机数。 |
| 运行时间 | `--run-time` | 120s | `40s` / `5m` / `1h`。 |
| 每台主机的会话数 | `--sessions-per-user` | 2 | 每台主机驱动的主机绑定会话数。 |
| 每个会话的轮数 | `--turns-per-session` | 4 | 每个会话的轮数——历史记录会随轮次增长。 |
| 回复长度 | `--reply-words` | 60 | 每轮模拟（流式）回复的单词数。 |

**容量注意事项——如果用户要求较大的 N，请告知：**每轮都在真实的主机 + 运行器
子进程上执行，因此 N 台主机 × M 个会话 = 在*当前*机器上运行 N×M 个运行器进程。
这是有意设计的容量限制（执行真实轮次，而非伪造）。先使用
`--users 2 --sessions-per-user 1 --turns-per-session 2 --run-time 40s` 确认
技术栈能够启动（约需 10-30 秒），然后逐步增加，但最多只应增加到几十台主机。在 N
较大时，负载机将先于服务器达到饱和状态（Locust 会发出 CPU 警告）。

## 3. 运行

```bash
python dev/loadtest/run.py \
    --users <N> --spawn-rate <R> --run-time <T> \
    --sessions-per-user <S> --turns-per-session <TU>
```

它会启动技术栈，打印服务器 URL + 已注册的代理，运行 Locust，并写入
`dev/loadtest/results/omnigent_load_test-<timestamp>/`。

## 4. 读取并解释

使用 `Read` 读取 `summary.md` 并转述其内容。重点关注：

- 首先关注**结果 / 失败情况**。退出码为 0 + 失败数为 0 = PASS。非零失败数是
  最重要的信息——检查 `console.log`；如果某台主机注册失败，还要检查该主机对应的
  `results/.../host-workspaces/<name>/host.log`。在 N 较大时，失败通常意味着
  *负载机*已达到饱和，而不是服务器。
- **turn**——最关键的延迟指标：主机运行器上的一次完整 post→idle 代理轮次
  （使用模拟 LLM），因此它表示 Omnigent 的每轮开销。随着历史记录积累，该指标会
  **在对话过程中逐渐增长**，因此当 `--turns-per-session` 增大时，p95/p99 上升是
  符合预期的，也是值得关注的信号。
- **host online**——主机隧道注册成本；**session create**——创建主机绑定会话的
  成本；**Ops/s**——当前并发量下的聚合吞吐量。

如果出现失败，或尾延迟看起来偏高，请建议一个具体的后续步骤（如果负载机器已饱和，则降低
N；提高 `--turns-per-session` 以研究历史记录
增长；延长 `--run-time` 以达到稳态；或者检查服务器日志/指标）。

## 注意事项

- 场景文件：`dev/loadtest/omnigent_load_test.py`；驱动程序和报告：
  `dev/loadtest/run.py`。完整参考文档：`dev/loadtest/README.md`。