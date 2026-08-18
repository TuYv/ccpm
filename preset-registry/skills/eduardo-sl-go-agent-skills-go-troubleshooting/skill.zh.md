---
name: go-troubleshooting
description: >
  Diagnose runtime problems in Go programs: panics and stack traces,
  deadlocks, goroutine leaks, memory leaks, OOM kills, race reports, and
  debugging with delve and pprof. Use when: "debug this panic", "read this
  stack trace", "deadlock", "memory leak", "goroutine count growing", "OOM",
  "program hangs", "race detector output", "use delve".
  Not for: optimizing code that works (go-performance-review), writing new
  concurrent code (go-concurrency-review), failing test design
  (go-test-quality).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. delve is optional, for interactive debugging.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(dlv:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 故障排查

先诊断，再修复。复现、观察、定位，然后修改代码。
绝不要“修复”一个你尚未解释的症状，否则 bug 会转移。

## 1. 按症状选择流程

| 症状 | 流程 |
|---|---|
| 携带堆栈跟踪的崩溃 | §2 阅读 panic |
| 程序挂起 / 请求停滞 | §3 导出 goroutine，找到阻塞点 |
| `fatal error: all goroutines are asleep` | §3 — Go 检测到了完全死锁 |
| 内存持续增长直至 OOM | §4 堆配置文件差异对比 |
| Goroutine 数量增长 | §5 Goroutine 配置文件差异对比 |
| 间歇性的数据损坏 / 异常值 | §6 竞态检测器 |
| 需要交互式检查状态 | §7 Delve |

## 2. 阅读 Panic

```text
panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x6bb0e4]

goroutine 43 [running]:
myapp/internal/service.(*UserService).Notify(0x0, {0xc000123456?, ...})
        /app/internal/service/user.go:87 +0x24
myapp/internal/handler.(*Handler).Create(0xc0001a2000, ...)
        /app/internal/handler/user.go:41 +0x1c5
```

机械地阅读它：

1. 第一行：panic 的类型。`nil pointer dereference` 加上 `addr=0x0`
   表示 nil 接收者、nil 字段，或 nil map/指针参数。
2. 你的代码中的顶部帧：`user.go:87` — 前往这里。
3. 帧中的接收者值：`(*UserService).Notify(0x0, ...)` — 第一个
   `0x0` 参数就是接收者：服务本身是 nil。
   追踪它在哪里被构造（或者没有被构造）。
4. `goroutine 43` — 如果它不是 goroutine 1，找到是谁启动了它，并确认
   该处是否应该存在 recover 边界。

## 3. 挂起与死锁

从挂起的进程获取 goroutine 导出：

```bash
kill -QUIT <pid>      # 将所有 goroutine 堆栈导出至 stderr，然后退出
# 或者，如果已挂载 net/http/pprof（参见 §4）：
curl 'localhost:6060/debug/pprof/goroutine?debug=2'
```

然后对堆栈分类：

- `sync.(*Mutex).Lock` 上的 `[semacquire]` — 找到哪个 goroutine 持有
  该 mutex：寻找另一个处于临界区内的堆栈。两个 goroutine 分别持有两把锁中的一把
  = 锁顺序反转。
- `[chan send]` / `[chan receive]` — 另一端已经不存在。找到本应
  接收/发送的是谁，以及它为何退出（或从未启动）。
- 缺少 `ctx.Done()` case 的 `[select]` — 忽略取消的阻塞调用。
- 数百个相同的堆栈 — 那是泄漏（§5），不是死锁。

## 4. 内存泄漏

在长期运行的服务中挂载 pprof（仅限私有端口，绝不能公开）：

```go
import _ "net/http/pprof"

go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

随时间对比堆配置文件 — 泄漏是永不回落的增长：

```bash
curl -s localhost:6060/debug/pprof/heap > heap1.pb.gz
sleep 300   # 让泄漏累积
curl -s localhost:6060/debug/pprof/heap > heap2.pb.gz
go tool pprof -base heap1.pb.gz heap2.pb.gz
(pprof) top          # 最大的正增量 = 泄漏
(pprof) list FuncName
```

常见嫌疑项：没有淘汰机制的无界缓存/map、固定大型数组的子切片、从未停止的 `time.Ticker`、未关闭的响应体、不断增长的全局切片、持有缓冲区的遗忘 goroutine。

## 5. Goroutine 泄漏

```bash
curl -s localhost:6060/debug/pprof/goroutine > g1.pb.gz
sleep 300
curl -s localhost:6060/debug/pprof/goroutine > g2.pb.gz
go tool pprof -base g1.pb.gz g2.pb.gz
(pprof) top    # the growing stack is your leak site
```

泄漏的堆栈会告诉你哪个 `go` 语句从未终止。
修复终止路径（context、channel close）——相关模式请参阅并发 skill。在测试中，`goleak`（uber-go/goleak）会让遗留 goroutine 的测试失败。

## 6. 竞态检测器

```bash
go test -race ./...        # in CI, always
go build -race ./cmd/api   # staging binaries under real traffic
```

报告会显示两个堆栈：写操作与并发读/写操作，每个堆栈都包含该 goroutine 的创建位置。修复方式绝不是“加一个 sleep”——应保护状态（mutex）、转移所有权（channel），或使其不可变。`-race` 只会报告实际执行过的竞态：一次干净的运行并不能证明未测试路径没有问题。

## 7. Delve

```bash
dlv test ./internal/service -- -test.run TestTransfer   # debug a test
dlv attach <pid>                                        # running process
dlv core ./api core.1234                                # post-mortem

(dlv) break user.go:87
(dlv) continue
(dlv) print svc.repo          # inspect exact values
(dlv) goroutines -t           # all goroutines with stacks
(dlv) goroutine 43 bt         # switch and backtrace
```

当你需要实际值或 goroutine 状态，而不只是位置时，使用 delve。对于快速定位，聚焦的 `t.Logf` 或 `slog.Debug` 加上一次测试运行通常更快。

## 8. 诊断环境变量

```bash
GOTRACEBACK=all ./api        # panic dumps ALL goroutines, not just one
GODEBUG=gctrace=1 ./api      # GC cycles: pacing, heap goal, pause times
GOMEMLIMIT=512MiB ./api      # soft memory limit — mitigates OOM while
                             # you find the real leak
```

## 验证清单

1. 在任何代码改动之前复现症状（或通过 dump/profile 捕获）
2. 已解释根本原因：你能够说明该位置发生故障的原因
3. panic 修复针对 nil/边界来源，而不是包装层的 `recover`
4. deadlock 修复建立单一锁顺序，或移除共享锁
5. 已验证泄漏修复：修复后 goroutine/heap profile 保持平稳
6. 与并发相关的修复后，`go test -race ./...` 通过
7. 现在已有一个回归测试会在缺少修复时失败
8. pprof 端点仅绑定到 localhost/私有接口