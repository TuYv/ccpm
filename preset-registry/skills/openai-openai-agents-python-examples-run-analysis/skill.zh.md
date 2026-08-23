---
name: examples-run-analysis
description: Analyze artifacts from the latest completed manual examples Make run. Read the main log, every relevant per-example log, and example source; validate every exit-0 example and classify failures, skips, and environment restrictions. Never execute or control examples.
---
# 示例运行分析

仅在用户已手动调用示例 Make 目标后，才使用此技能分析已经存在的产物。此技能是只读的，仅用于分析。

## 严格边界

- 绝不启动、重试、停止或以其他方式执行示例。
- 绝不调用示例 Make 目标或 `.github/scripts/run_examples.sh`。
- 绝不请求提升执行权限、改变环境、删除 pid 文件，或接管后台进程或向其发送信号。
- 当最新运行仍处于活动、未完成或已过期状态时，绝不将较早完成的运行视为当前运行。
- 如果缺少可用结果，或结果已过期、未完成或仍在运行，请停止分析，并要求用户手动运行相应的 Make 目标。给出确切命令，但不要执行。

支持的工作流是：先显式手动调用 Make，再分析生成的产物。

## 要检查的产物

- 后台 pid 文件：`.tmp/examples-auto-run.pid`。
- 主日志：`.tmp/examples-start-logs/main_*.log`。
- 以所选主日志中各个 `log=` 字段命名的每个示例日志。
- 由 `PASSED`、`FAILED` 和 `SKIPPED` 记录指定的示例源文件。
- 定义产物含义的运行器源文件：`examples/run_examples.py`、`.github/scripts/run_examples.sh`，以及此次运行中包含的示例源文件。

仅使用只读检查命令，例如 `git status`、`git log`、`find`、`ls`、`stat`、`ps`、`sed` 和 `rg`。不要调用任何可能更新产物或进程的命令。

## 分析工作流

1. 在不更改进程表和 `.tmp/examples-auto-run.pid` 的情况下检查它们。仅当进程的命令行以当前仓库为根目录，并调用 `.github/scripts/run_examples.sh` 或 `examples/run_examples.py` 时，才将该进程视为正在运行的示例任务，包括前台和后台运行。pid 文件仅用于关联后台进程；pid 文件不存在或已过期，并不能证明当前没有正在运行的任务。如果存在匹配的活动进程，请停止分析。告知用户等待前台 Make 运行完成；如果是后台运行，则要求用户手动运行 `make examples-status`，之后再请求分析。
2. 选择最新的 `main_*.log`。要求其中恰好存在一条终止记录 `# summary executed=<n> skipped=<n> failed=<n>`。如果摘要缺失或格式错误、日志仍在变化，或存在匹配的活动示例进程，则将运行视为未完成。
3. 如果相关运行器或所选示例源文件的内容在运行后发生了更改，则将结果视为已过期。使用 Git 历史记录和文件时间戳作为证据。如果无法确定时效性，请如实说明并要求用户重新手动运行，而不要假定产物仍然适用。
4. 解析每条 `PASSED`、`FAILED` 和 `SKIPPED` 记录。将其数量与终止摘要进行核对。确认每个被引用的示例日志都存在。
5. 对于每条 `PASSED` 记录，不进行抽样，完整读取示例源文件及其对应的示例日志。根据源文件和注释推断预期流程、工具、副作用和关键结果，然后验证日志是否证明了这些行为。仅有退出状态 0 并不足以完成行为验证。
6. 阅读与失败和环境相关跳过项对应的示例日志。将每个结果分类为示例或 SDK 缺陷、依赖项或凭据问题、提供商或网络故障、本地服务或平台限制、运行器有意跳过，或未解决。将真正的产品故障与环境限制区分开来。
7. 报告所选主日志、时效性和完整性证据、摘要计数、每个退出状态为 0 的示例的验证状态、已分类的失败和跳过项，以及支持每项结论的确切源文件/日志行引用。

## 当产物不可用时需请求用户手动执行的命令

选择适用范围最小的命令，并请用户在终端中运行：

```bash
make examples-run
make examples-run EXAMPLES_ARGS="--filter basic"
make examples-run-background EXAMPLES_ARGS="--include-server --include-audio"
make examples-status
```

请勿在此 Skill 中执行上述任何命令。