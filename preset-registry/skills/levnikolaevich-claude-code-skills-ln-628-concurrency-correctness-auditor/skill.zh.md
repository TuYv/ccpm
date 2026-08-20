---
name: ln-628-concurrency-correctness-auditor
description: "Checks races, deadlocks, async hazards, TOCTOU, blocking I/O, and shared resource contention. Use when auditing concurrency correctness."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__trace_dataflow, mcp__hex-graph__trace_paths, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 并发正确性审计器（L3 工作器）

**类型：** L3 工作器

专门负责审计并发正确性、异步风险和跨进程资源访问的工作器。

## 目的与范围

- 审计**并发**（类别 11：高优先级）
- 7 项检查：异步竞态、线程安全、TOCTOU、死锁、阻塞式 I/O、资源争用、跨进程竞态
- 两层检测：grep 查找候选项，代理结合上下文进行推理
- 输出 `FIX_RACE`、`FIX_DEADLOCK` 或 `CONTROL_ASYNC_SIDE_EFFECT`
- 计算合规评分（X/10）

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时主机的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含以下内容的 `contextStore`：`tech_stack`、`best_practices`、`codebase_root`、`output_dir`。

当数据流或调用路径分析能够显著改善并发问题的发现效果时，优先使用 `hex-graph`。如可用，读取本地代码时优先使用 `hex-line`。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明使用了后备方案。

## 工作流程

检测策略：使用两层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) **解析上下文**——从 contextStore 中提取 tech_stack、language、output_dir
2) **逐项检查（1-7）：**
   - **第 1 层：** 使用 Grep/Glob 扫描以查找候选项
   - **第 2 层：** 阅读每个候选项前后 20-50 行。应用该检查项特定的关键问题。分类为：已确认 / 误报 / 需要上下文
3) **收集**已确认的问题，包括严重程度、位置、修复工作量和建议
4) **计算评分**——依据 `references/audit_scoring.md`
5) **编写报告**——在内存中构建，并以原子方式单次写入 `{output_dir}/ln-628--global.md`
6) **返回摘要**

## 审计规则

**统一的严重程度升级规则：** 对于所有检查——如果问题影响支付/身份验证/金融代码，则无论其他因素如何，均将严重程度升级为 **CRITICAL**。

### 1. 异步/事件循环竞态（CWE-362）

**定义：** 在单线程异步代码中，共享状态在 await/yield 边界之间被破坏。

**第 1 层——Grep 模式：**

| 语言 | 模式 | Grep |
|----------|---------|------|
| JS/TS | 跨 await 的读取-修改-写入 | `\w+\s*[+\-*/]?=\s*.*await`（例如，`result += await something`） |
| JS/TS | 先检查后初始化竞态 | `if\s*\(!?\w+\)` 后跟同一代码块中的 `\w+\s*=\s*await` |
| Python | 跨 await 的读取-修改-写入 | `async def` 内的 `\w+\s*[+\-*/]?=\s*await` |
| Python | 异步代码中的模块级共享状态 | 模块级 `\w+\s*=` + 在 `async def` 内被修改 |
| 所有语言 | 无锁的共享缓存 | 异步函数中的 `\.set\(|\.put\(|\[\w+\]\s*=`，且附近没有 lock/mutex |

**第 2 层——关键问题：**
- 该变量是共享的（模块/全局作用域）还是局部的？
- 两个异步任务能否在此 await 点交错执行？
- 是否有锁/互斥锁/信号量保护该访问？

**严重性：** 严重（支付/认证）| 高（面向用户）| 中（后台）

**安全模式排除项：** 局部变量、`const` 声明、单次使用的 await（不可能发生交错执行）。

**工作量：** M

### 2. 线程/Goroutine 安全性 (CWE-366)

**问题：** 多个线程/goroutine 在没有同步机制的情况下访问共享的可变状态。

**第 1 层——Grep 模式：**

| 语言 | 模式 | Grep |
|----------|---------|------|
| Go | 无互斥锁的 Map 访问 | 结构体中存在 `map\[.*\].*=`，但没有 `sync.Mutex` 或 `sync.RWMutex` |
| Go | goroutine 捕获的变量 | `go func` + 修改了外部作用域中的变量 |
| Python | 在线程中修改全局变量 | 函数中存在 `global\s+\w+` + 同一文件中存在 `threading.Thread` |
| Java | 在线程之间共享 HashMap | 同一类中存在 `HashMap` + `Thread\|Executor\|Runnable`，但没有 `synchronized\|ConcurrentHashMap` |
| Rust | 多线程上下文中的 Rc | 同一文件中存在 `Rc<RefCell` + `thread::spawn\|tokio::spawn` |
| Node.js | Worker Threads 共享状态 | `workerData\|SharedArrayBuffer\|parentPort` + 没有使用 `Atomics` 的可变访问 |

**第 2 层——关键问题：**
- 此结构体/对象是否确实在线程之间共享？（单线程代码 -> 误报）
- 互斥锁/锁是否位于嵌入式结构体或导入的模块中？（grep 可能会漏掉）
- `go func` 是按值捕获（安全）还是按引用捕获（不安全）？

**严重性：** 严重（支付/认证）| 高（可能导致数据损坏）| 中（内部）

**安全模式排除项：** goroutine 启动前在 `init()` 或 `main()` 中使用的 Go map。Rust `Arc<Mutex<T>>`（已经安全）。Java `Collections.synchronizedMap()`。

**工作量：** M

### 3. TOCTOU——检查时与使用时之间的竞态条件 (CWE-367)

**问题：** 先检查资源状态，然后再使用资源，但其状态可能在检查与使用之间发生变化。

**第 1 层——Grep 模式：**

| 语言 | 检查 | 使用 | Grep |
|----------|-------|-----|------|
| Python | `os.path.exists()` | `open()` | 同一变量上的 `os\.path\.exists\(` 附近存在 `open\(` |
| Python | `os.access()` | `os.open()` | `os\.access\(` 附近存在 `os\.open\(\|open\(` |
| Node.js | `fs.existsSync()` | `fs.readFileSync()` | `existsSync\(` 附近存在 `readFileSync\(\|readFile\(` |
| Node.js | `fs.accessSync()` | `fs.openSync()` | `accessSync\(` 附近存在 `openSync\(` |
| Go | `os.Stat()` | `os.Open()` | `os\.Stat\(` 附近存在 `os\.Open\(\|os\.Create\(` |
| Java | `.exists()` | `new FileInputStream` | `\.exists\(\)` 附近存在 `new File\|FileInputStream\|FileOutputStream` |

**第 2 层——关键问题：**
- 该检查是用于控制流（存在漏洞），还是仅用于日志记录（安全）？
- 检查后使用的序列周围是否有锁或重试机制？
- 文件是否位于由应用程序控制的临时目录中（风险较低）？
- 攻击者能否替换该文件（符号链接攻击）？

**严重性：** 严重（安全敏感：权限、认证令牌、配置）| 高（面向用户的文件操作）| 中（内部/后台）

**安全模式排除项：** 在带重试的 try/catch 中进行检查。仅用于日志记录/指标统计的检查。在文件锁保护下进行检查并使用。

**工作量：** S-M（将先检查后使用替换为直接使用并进行错误处理）

### 4. 死锁风险（CWE-833）

**问题：** 以不一致的顺序获取锁，或在执行阻塞操作期间持有锁。

**第 1 层——Grep 模式：**

| 语言 | 模式 | Grep |
|----------|---------|------|
| Python | 嵌套锁 | `with\s+\w+_lock:`（多行：两个不同的锁相互嵌套） |
| Python | 循环中的锁 | `for.*:`，循环体内包含 `\.acquire\(\)` |
| Python | 锁 + 外部调用 | `\.acquire\(\)` 之后、释放锁之前出现 `await\|requests\.\|urllib` |
| Go | 缺少延迟解锁 | `\.Lock\(\)` 的下一行没有 `defer.*\.Unlock\(\)` |
| Go | 嵌套锁 | 同一函数中出现两次 `\.Lock\(\)` 调用，且中间没有 `\.Unlock\(\)` |
| Java | 嵌套同步块 | `synchronized\s*\(`（多行：使用不同监视器的嵌套块） |
| JS | 异步互斥锁嵌套 | `await\s+\w+\.acquire\(\)`（同一函数中使用两个不同的互斥锁） |

**第 2 层——关键问题：**
- 这些是同一个锁（可重入 = 没问题），还是不同的锁（存在死锁风险）？
- 所有调用点的加锁顺序是否一致？
- 锁内的外部调用是否设置了超时？

**严重程度：** CRITICAL（支付/身份验证）| HIGH（应用冻结风险）

**安全模式排除项：** 可重入锁（同一个锁获取两次）。设置了显式超时的锁（`asyncio.wait_for`、`tryLock`）。

**工作量：** L（重新设计锁顺序）

### 5. 异步上下文中的阻塞 I/O（CWE-400）

**问题：** 异步函数或事件循环处理程序中存在同步阻塞调用。

**第 1 层——Grep 模式：**

| 语言 | 阻塞调用 | Grep | 替代方案 |
|----------|--------------|------|-------------|
| Python | `async def` 中的 `time.sleep` | `async def` 中的 `time\.sleep` | `await asyncio.sleep` |
| Python | `async def` 中的 `requests.*` | `async def` 中的 `requests\.(get\|post\|put\|delete)` | `httpx` 或 `aiohttp` |
| Python | `async def` 中的 `open()` | `async def` 中的 `open\(` | `aiofiles.open` |
| Node.js | 异步代码中的 `fs.readFileSync` | `fs\.readFileSync\|fs\.writeFileSync\|fs\.mkdirSync` | `fs.promises.*` |
| Node.js | 异步代码中的 `execSync` | 异步处理程序中的 `execSync\|spawnSync` | 配合 promises 使用 `exec` |
| Node.js | 异步代码中的同步加密操作 | `crypto\.pbkdf2Sync\|crypto\.scryptSync` | `crypto.pbkdf2`（回调） |

**第 2 层——关键问题：**
- 这是位于热路径（API 处理程序）还是冷路径（启动脚本）中？
- 阻塞持续时间是否显著（>100ms）？
- 是否存在合理原因（例如，在启动时同步读取小型配置）？

**严重程度：** HIGH（阻塞事件循环/异步上下文）| MEDIUM（轻微阻塞 <100ms）

**安全模式排除项：** `if __name__ == "__main__"` 中的阻塞调用（启动阶段）。初始化时加载配置所使用的 `readFileSync`。针对小型输入的同步加密操作。

**工作量：** S-M（替换为异步替代方案）

### 6. 资源争用（CWE-362）

**问题：** 多个并发访问者在没有协调机制的情况下争用同一资源。

**第 1 层——Grep 模式：**

| 模式 | 风险 | Grep |
|---------|------|------|
| 共享内存无同步 | 数据损坏 | `SharedArrayBuffer\|SharedMemory\|shm_open\|mmap` 附近没有 `Atomics\|Mutex\|Lock` |
| IPC 无协调 | 消息顺序错乱 | 并发循环中的 `process\.send\|parentPort\.postMessage` |
| 并发追加文件 | 写入交错 | 并行任务中多次对同一路径执行 `appendFile\|fs\.write` |

**第 2 层——关键问题：**
- 多个写入者是否确实并发执行？（顺序执行 = 安全）
- 操作系统是否提供原子性保证？（例如，对小规模写入使用 `O_APPEND`）
- 顺序对于正确性是否重要？

**严重程度：** 高（数据损坏）| 中（顺序问题）

**安全模式排除项：** 单一写入者模式。由操作系统保证的原子操作（小规模管道写入、`O_APPEND`）。提供顺序保证的消息队列。

**工作量：** M

### 7. 跨进程与不可见副作用（CWE-362、CWE-421）

**问题：** 多个进程或进程与操作系统访问同一独占资源，包括对共享操作系统资源产生不明显副作用的操作。

**第 1 层——Grep 入口点：**

| 模式 | 风险 | Grep |
|---------|------|------|
| 剪贴板双重访问 | 同一流程中同时使用 OSC 52 和原生剪贴板 | 同一文件中同时存在 `osc52\|\\x1b\\]52` 和 `clipboard\|SetClipboardData\|pbcopy\|xclip` |
| 子进程 + 共享文件 | 父进程和子进程写入同一文件 | 对同一路径使用 `spawn\|exec\|Popen` + `writeFile\|open.*"w"` |
| 操作系统独占资源 | Win32 剪贴板、串行端口、命名管道 | `OpenClipboard\|serial\.Serial\|CreateNamedPipe\|mkfifo` |
| 终端转义序列 | stdout 触发终端操作系统访问 | `\\x1b\\]\|\\033\\]\|writeOsc\|xterm` |
| 外部剪贴板工具 | 通过派生进程访问剪贴板 | `pbcopy\|xclip\|xsel\|clip\.exe` |

**第 2 层——此项检查比其他任何检查都更加依赖推理：**

1. **建立资源清单：**

   | 资源 | 是否独占？ | 访问者 1 | 访问者 2 | 是否存在同步？ |
   |----------|-----------|------------|------------|---------------|

2. **追踪时间线：**
   ```
   t=0ms  operation_A() -> resource_X accessed
   t=?ms  side_effect   -> resource_X accessed by external process
   t=?ms  operation_B() -> resource_X accessed again -> CONFLICT?
   ```

3. **关键问题：**
   - 另一个进程（终端、操作系统、子进程）能否同时访问此资源？
   - 此操作是否会对共享操作系统资源产生不可见的副作用？
   - 如果外部进程比预期更慢或更快，会发生什么？
   - 如果用户快速连续触发此操作两次，会发生什么？

**严重程度：** 严重（两个访问者在没有同步机制的情况下访问独占操作系统资源）| 高（子进程与共享文件之间没有锁）| 高（通过推理检测到不可见副作用）

**安全模式排除项：** 单一访问者。存在重试/退避模式。通过显式延迟或 await 按顺序执行操作。

**工作量：** M-L（可能需要移除冗余访问路径）

## 评分算法

**必须阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器按照共享契约自行生成限定于本次运行的工件路径。

将报告写入 `{output_dir}/ln-628--global.md`，其中 `category: "Concurrency"`，并包含以下检查项：async_races、thread_safety、toctou、deadlock_potential、blocking_io、resource_contention、cross_process_races。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 缺失时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显相同的摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-628--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告——并发修复需要谨慎的人工审查
- **两层检测：** 在第 1 层 grep 之后，始终应用第 2 层推理。绝不能在未进行上下文分析的情况下报告原始 grep 匹配项
- **语言感知检测：** 针对每项检查使用特定于语言的模式
- **统一的 CRITICAL 升级规则：** 支付、认证或金融代码中的任何发现项均为 CRITICAL
- **切合实际的工作量：** S = <1h，M = 1-4h，L = >4h
- **排除项：** 跳过测试文件、单线程 CLI 工具和生成的代码
- **独特视角：** 仅审计并发正确性。不要审计生命周期就绪度、分层归属或局部代码风格。
- **必需操作：** 每个发现项均使用 `FIX_RACE`、`FIX_DEADLOCK` 或 `CONTROL_ASYNC_SIDE_EFFECT`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（语言、并发模型、output_dir）
- [ ] 已使用两层检测完成全部 7 项检查：
  - 异步竞态、线程安全、TOCTOU、死锁风险、阻塞 I/O、资源争用、跨进程竞态
- [ ] 已对每个候选项应用第 2 层推理（已确认 / 误报 / 需要上下文）
- [ ] 已收集包含严重级别、位置、工作量、操作和建议的发现项
- [ ] 已按照 `references/audit_scoring.md` 计算分数
- [ ] 已将报告写入 `{output_dir}/ln-628--global.md`（以原子方式通过单次 Write 调用完成）
- [ ] 已按照契约写入摘要

## 参考文件

- **两层检测方法：** `references/two_layer_detection.md`
- **审计输出模式：** `references/audit_output_schema.md`

---
**版本：** 4.0.0
**最后更新：** 2026-03-04