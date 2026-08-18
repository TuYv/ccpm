---
name: gradle-run
description: Use when planning to execute Gradle through `gradle`, `./gradlew`, or a custom `gradlew*` wrapper script, or diagnosing a Gradle build, check, test, lint, warning, or failure.
---
# Gradle 运行

## 核心原则

将完整的 Gradle 输出视为临时产物，绝不将其作为对话上下文。每个由代理发起的 Gradle 命令都必须通过紧凑输出包装器执行；绝不要流式传输、使用 `tee`、粘贴或重新打开完整的构建日志。

## 流程

1. 对请求进行分类。只验证另一项实现变更的聚焦型 Gradle 命令属于附带验证。构建、检查、警告清理或失败调查循环属于以 Gradle 为中心的工作流。
2. 解析此已安装 skill 的目录，并确认 `python3` 和 `<skill-dir>/scripts/gradle_run.py` 可用。如果任一项不可用，则在直接运行 Gradle 之前停止，并报告失败的前置条件。
3. 在第一个命令之前创建一个包装器工作流：

   ```sh
   python3 <skill-dir>/scripts/gradle_run.py create
   ```

   保留返回的非透明工作流标识符。只能使用此包装器运行 Gradle。除非命令已经选择了控制台行为，或用户明确授权使用 `--scan`，否则它会添加 `--console=plain` 和 `--no-scan`。要发现警告，请在 Gradle 命令中加入 `--warning-mode all`；否则仅在用户要求时加入。将 `workflow is busy` 结果视为所有权违规：等待活动运行完成或纠正所有者，而不是启动另一个命令或并发完成工作流。
4. 对于附带验证，留在当前代理中，并使用带有非空验证问题的最小所属任务：

   ```sh
   python3 <skill-dir>/scripts/gradle_run.py run \
     --workflow <id> --scope targeted \
     --question "Does :module:test pass after this change?" -- \
     ./gradlew :module:test
   ```

   只读取有界 JSON 摘要，并根据其中的失败任务、指纹和摘录继续操作。除非用户明确请求该产物，否则不要检查其日志。摘要和账本会对常见凭据模式进行脱敏；保留的完整日志有意保持原始状态，可能包含机密，因此绝不要将其粘贴出来或重新打开，以此替代摘要。
5. 对于以 Gradle 为中心的工作流，创建一个全新的、可移植的 Solver 诊断所有者。仅当运行时公开提供其模型和推理时，才报告这些内容。为其提供仓库的只读访问权限，以及包装器运行和诊断的所有权；它不得编辑源代码、测试、配置或生成的项目文件，也不得委托 Gradle 所有权。父代理拥有所有仓库编辑权。如果无法创建新的持久所有者，则停止，而不是让父代理运行工作流循环。
6. 让该所有者重用之前可操作的摘要，按指纹对警告和失败进行分组，并返回准确的文件或行证据以及范围最窄的下一条命令。仅当现有的定向证据无法回答已记录的问题时，才运行初始广泛命令。该所有者在整个工作流期间保持可用，并使用相同的包装器和适用范围最窄的任务验证父代理的每次变更。
7. 仅针对聚合项目检查记录 `broad`。为每次 broad 运行提供一个更窄的任务无法回答的不同问题。包装器会标记重复命令和主要失败指纹；如果主要失败重复出现，则停止运行循环，并在再次运行相同命令之前修改诊断。如果包装器被中断，请使用其记录的信号和保留的日志；它会停止隔离的 Gradle 进程组或 Windows 进程树，从部分日志中提取有界诊断，并在返回前使账本持久化。只有仍由有界近期运行账本表示的日志会被保留。
8. 在所请求的 broad 验证通过后结束，或报告尚未解决的警告指纹以及验证无法继续的原因。总结紧凑账本，然后仅删除包装器拥有的日志：

```sh
   python3 <skill-dir>/scripts/gradle_run.py finish --workflow <id>
   ```

   Finish 会保留小型标记和锁元数据，因此重复使用同一个已完成的
   identifier 时操作具有幂等性，而未知的 identifier 则会安全失败。如果
   finish 无法验证受管理的 identifier，或工作流处于活动状态，则保留所有文件
   不变并报告失败。此 skill 不限制无关的审查、探索、实现或其他
   subagents。

## RED/GREEN 代理场景

1. 直接场景：“运行 `check` 并修复每个警告。”RED 在上下文中携带日志反复运行完整
   构建。GREEN 创建一个诊断负责人，记录宽泛问题，将紧凑的诊断信息分组，逐一对每个修复进行
   窄范围验证，并仅将所请求的宽泛检查作为最终验证运行。
2. 新颖场景：最终的宽泛检查在目标任务通过后发现下游失败。GREEN 记录新问题，定位负责该问题的任务，并仅在该任务通过后再次运行宽泛检查。
3. 重复场景：声称已修复的问题的未变化失败指纹仍然存在。GREEN 停止重新构建，并要求修订诊断；不会将新的问题字符串视为盲目重复的许可。即使后续通用 Gradle 块未发生变化，源代码中的变化失败仍是主要问题。
4. 安全失败：wrapper、Python runtime 或持久化诊断负责人不可用。GREEN 不运行直接的 Gradle fallback，并报告缺失的前置条件。看似有效但未知的 finish identifier 同样会失败；不会将其视为之前已完成的工作流。
5. 反例：“修改此 Kotlin helper 后，运行
   `:module:test`。”GREEN 使用 wrapper，但将此附带的聚焦验证保留在当前 agent 中。
6. 边界：在 Gradle 工作流运行期间，用户启动了一个无关的审查 subagent。GREEN 允许其运行；此 skill 仅负责 Gradle 输出处理和诊断委派。
7. 中断：Gradle 输出诊断并进入抗信号 worker process 后，Ctrl-C 到达两次。GREEN 容忍第二个信号，停止隔离的 process group，提取部分诊断信息，保留日志，并在返回前将 SIGINT 记录到紧凑日志中。RED 重新进入清理流程、留下仍在运行的进程，或丢失诊断信息或中断记录。
8. 独占所有权：第二次运行或 finish 请求使用了活动中的工作流。GREEN 在启动或删除任何内容之前安全失败。RED 覆盖 sequence log、丢失日志更新，或移除活动中的工作流。
9. 敏感输出：Gradle property 和警告中包含凭据。GREEN 对有界摘要、问题、命令和日志进行脱敏，同时将原始完整日志保留为本地敏感 artifact。RED 将凭据发送到模型可见的元数据中，或将其持久化在那里。
10. 保留与可移植性：旧运行留下有界日志，而 Windows wrapper 存在 descendant processes。GREEN 仅清理被淘汰运行的日志，并在中断时使用平台的 process-tree 边界。RED 泄漏无界日志，或仅终止 Windows launcher。