---
name: gradle-run
description: Use when planning to execute Gradle through `gradle`, `./gradlew`, or a custom `gradlew*` wrapper script, or diagnosing a Gradle build, compact workflow ledger, repeated failure fingerprint, check, test, lint, warning, or failure even when no new Gradle run is appropriate.
---
# Gradle 运行

## 核心原则

将完整的 Gradle 输出视为临时且敏感的工件。每条由代理发起的 Gradle 命令都必须通过紧凑输出包装器运行；绝不要流式传输、使用 `tee`、粘贴或重新打开完整的构建日志。

每次 `create`、`run` 和 `finish` 调用都必须是该工具调用所执行的完整 shell 命令。前缀、赋值、条件语句、管道、命令链和后续检查，即使 Gradle 成功，也会使生命周期证据失效。

## 流程

1. 对请求进行分类。当源代码和输入未发生变化且已有成功结果能够回答问题时，复用当前成功结果。验证另一项更改的聚焦任务属于附带工作；构建、检查、警告和失败相关工作则属于以 Gradle 为中心的工作流。
2. 解析此 skill 目录，并确认 `python3` 和 `scripts/gradle_run.py` 均可用。如果任一项不可用，则停止并报告该前置条件；绝不要直接运行 Gradle 作为后备方案。
3. 在首次命令运行前创建一个工作流，并保留其不透明 ID：

   ```sh
   python3 <skill-dir>/scripts/gradle_run.py create
   ```

   将 `create`、每次 `run` 以及 `finish` 都作为独立的 shell 命令运行。不要将其中任何一个与 `test`、变量设置、`git`、`rg`、`&&`、`;`、管道，或包含另一条命令的换行组合在一起。如果 `create` 失败，请在任何 `run` 之前重新单独执行一次全新的 `create`。只能使用该包装器；除非选择了控制台行为或用户授权使用 `--scan`，否则它会提供 `--console=plain` 和 `--no-scan`。仅在发现警告或用户明确要求时添加 `--warning-mode all`。出现 `workflow is busy` 结果表示所有权违规：等待所有者或纠正所有权；不要并发启动或完成工作流。
4. 对于附带验证，留在当前代理中，运行能够回答非空验证问题的最窄任务：

   ```sh
   python3 <skill-dir>/scripts/gradle_run.py run \
     --workflow <id> --scope targeted \
     --question "Does :module:test pass after this change?" -- \
     ./gradlew :module:test
   ```

   不要用编译替代所请求的 fixture 测试。只读取有界 JSON 摘要；同时报告受管理的包装器和嵌套的 Gradle 任务、该问题，以及其有界答案。
5. 对于以 Gradle 为中心的工作，创建一个全新的持久 Solver 诊断所有者，并授予其只读仓库访问权限。它负责包装器运行和诊断，不得编辑代码或委派 Gradle 所有权，并在整个工作流期间保持可用。父代理负责仓库编辑。如果无法创建该所有者，则停止，而不是在父代理中运行循环。
6. 让所有者复用可操作的摘要，按指纹对警告/失败进行分组，并返回源代码/行号证据以及最窄的下一条命令。仅当聚焦证据无法回答聚合问题时才进行全面运行。在重复出现主要源代码/编译器指纹时，停止重新构建；检查所引用的源代码行及其附近的声明、导入或接收者上下文，然后再修改诊断。使用相同的包装器和最窄的适用任务，验证父代理的每次更改。在最终诊断中，将聚焦检查命名为下一步操作；在此之前不要声称源代码已修复。
7. 将完整日志视为原始敏感材料，即使摘要和账本会对常见凭据进行脱敏，也绝不要将其暴露在模型可见的上下文中。发生中断时，使用包装器记录的信号和有界的部分诊断；它负责进程组/进程树清理以及持久化账本更新。只有仍由有界的最近运行账本表示的日志会被保留。
8. 在最后一次所请求的验证（聚焦或全面）通过后完成；或者报告未解决的指纹以及验证无法继续的原因。在最终响应中，引用每个非空的 `--question` 并给出其有界答案；命令历史不能替代所报告的证据。然后运行：

```sh
   python3 <skill-dir>/scripts/gradle_run.py finish --workflow <id>
   ```

   报告 finish 仅移除了由包装器拥有的日志。已完成的已知 ID 操作具有幂等性；未知 ID 或活动中的工作流会安全失败，并将文件保留在原处。此 skill 不限制无关的审查、实现或子代理。