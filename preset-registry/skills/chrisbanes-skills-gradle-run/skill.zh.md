---
name: gradle-run
description: Use when planning to execute Gradle through `gradle`, `./gradlew`, or a custom `gradlew*` wrapper script, or diagnosing a Gradle build, compact workflow ledger, repeated failure fingerprint, check, test, lint, warning, or failure even when no new Gradle run is appropriate.
---
# Gradle 运行

## 核心原则

将完整的 Gradle 输出视为临时的敏感工件。每条由代理发起的 Gradle 命令都必须通过紧凑输出包装器运行；绝不流式输出、使用 `tee`、粘贴或重新打开完整构建日志。

## 操作流程

1. 对请求进行分类。如果源代码和输入未发生变化，且已有当前成功结果可以回答问题，则复用该结果。用于验证其他变更的聚焦任务属于附带工作；构建、检查、警告或失败相关工作则属于以 Gradle 为中心的工作流。
2. 解析此技能目录，并确认 `python3` 和 `scripts/gradle_run.py` 均可用。如果任一项不可用，则停止并报告该前置条件；绝不可直接运行 Gradle 作为后备方案。
3. 在首次执行命令之前创建一个工作流，并保留其不透明 ID：

   ```sh
   python3 <skill-dir>/scripts/gradle_run.py create
   ```

   将 `create`、每次 `run` 以及 `finish` 作为独立的 shell 命令运行。只能使用该包装器；除非已选择控制台行为或用户授权使用 `--scan`，否则包装器会提供 `--console=plain` 和 `--no-scan`。仅在发现警告或收到明确请求时添加 `--warning-mode all`。`workflow is busy` 结果表示所有权违规：等待所有者或纠正所有权；不要并发启动或结束工作流。
4. 对于附带验证，留在当前代理中，运行能够回答非空验证问题的最窄任务：

   ```sh
   python3 <skill-dir>/scripts/gradle_run.py run \
     --workflow <id> --scope targeted \
     --question "Does :module:test pass after this change?" -- \
     ./gradlew :module:test
   ```

   不要用编译替代所请求的 fixture 测试。只读取有界 JSON 摘要；同时报告受管理的包装器和嵌套的 Gradle 任务、问题，以及其有界答案。
5. 对于以 Gradle 为中心的工作，创建一个全新的持久 Solver 诊断所有者，并授予其只读的仓库访问权限。它负责包装器运行和诊断，不得编辑或委派 Gradle 所有权，并在整个工作流期间保持可用。父代理负责仓库编辑。若无法创建该所有者，则停止，而不是在父代理中运行循环。
6. 要求该所有者复用具有可操作性的摘要，按指纹对警告/失败进行分组，并返回源代码/行号证据以及最窄的下一条命令。只有对于目标证据无法回答的聚合问题，才运行广泛任务。当主要源代码/编译器指纹重复出现时，停止重新构建；在修改诊断之前，检查所引用的源代码行及其附近的声明、导入或接收者上下文。使用相同的包装器和最窄的适用任务验证父代理的每项变更。在最终诊断中，将聚焦检查命名为下一步操作；在此之前不要声称源代码已修复。新的问题不允许盲目重复运行。
7. 即使摘要和账本会对常见凭据进行编辑，也要将完整日志视为原始敏感材料。绝不要将其暴露在模型可见的上下文中。发生中断时，使用包装器记录的信号和有界的部分诊断；包装器负责进程组/进程树清理以及持久化账本更新。只有仍由有界的 recent-run 账本表示的日志才可保留。
8. 在最后一次请求的验证（目标验证或广泛验证）通过后结束，或报告未解决的指纹以及验证无法继续的原因。总结每个问题及其有界答案，然后运行：

```sh
   python3 <skill-dir>/scripts/gradle_run.py finish --workflow <id>
   ```

   说明 finish 仅移除了由包装器管理的日志。已完成的已知 ID 具有幂等性；未知 ID 或处于活动状态的工作流会安全失败，并将文件保留在原处。此 skill 不限制无关的审查、实现或子代理。