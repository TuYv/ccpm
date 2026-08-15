---
name: go-troubleshooting
description: >
  Diagnose runtime problems in Go programs: panics and stack traces, deadlocks,
  goroutine leaks, memory leaks, OOM kills, race reports, and debugging with
  delve and pprof.
  Use when: "debug this panic", "read this stack trace", "deadlock", "memory
  leak", "goroutine count growing", "OOM", "program hangs", "race detector
  output", "use delve".
  Do NOT use for: optimizing code that works (use go-performance-review),
  writing new concurrent code (use go-concurrency-review), or
  failing test design (use go-test-quality).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 故障排查

先诊断，再修复。复现、观察、定位，然后修改代码。
绝不要“修复”一个你尚未解释清楚的症状——否则 bug 只会转移。

## 1. 根据症状选择排查流程

| 症状 | 排查流程 |
|---|---|
| 崩溃并伴有堆栈跟踪 | §2 阅读 panic 信息 |
| 程序挂起 / 请求停滞 | §3 转储 goroutine，找出阻塞位置 |
| `fatal error: all goroutines are asleep` | §3 — Go 检测到完全死锁 |
| 内存持续增长直至 OOM | §4 对比堆分析结果 |
| Goroutine 数量持续增长 | §5 对比 Goroutine 分析结果 |
| 间歇性数据损坏 / 出现异常值 | §6 竞态检测器 |
| 需要以交互方式检查状态 | §7 Delve |

## 2. 阅读 Panic 信息

```text
panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x6bb0e4]

goroutine 43 [running]:
myapp/internal/service.(*UserService).Notify(0x0, {0xc000123456?, ...})
        /app/internal/service/user.go:87 +0x24
myapp/internal/handler.(*Handler).Create(0xc0001a2000, ...)
        /app/internal/handler/user.go:41 +0x1c5
```

按固定步骤阅读：

1. 第一行：panic 的类型。`nil pointer dereference` + `addr=0x0`
   表示接收者、字段或 map/指针参数为 nil。
2. 你自己的代码中最上面的栈帧：`user.go:87`——前往该位置。
3. 栈帧中的接收者值：`(*UserService).Notify(0x0, ...)`——
   第一个参数 `0x0` 就是接收者：service 本身为 nil。
   追踪它在哪里被构造（或者为何没有被构造）。
4. `goroutine 43`——如果它不是 goroutine 1，找出是谁启动了它，以及
   该处是否应当存在 recover 边界。

## 3. 挂起与死锁

从挂起的进程中获取 goroutine 转储：

```bash
kill -QUIT <pid>      # dumps all goroutine stacks to stderr, then exits
# or, if net/http/pprof is mounted (see §4):
curl 'localhost:6060/debug/pprof/goroutine?debug=2'
```

然后对堆栈进行分类：

- `sync.(*Mutex).Lock` 上的 `[semacquire]`——找出哪个 goroutine 持有
  该互斥锁：查找另一个位于临界区内的堆栈。两个 goroutine 各自持有
  两把锁中的一把 = 锁顺序反转。
- `[chan send]` / `[chan receive]`——另一端已经消失。找出本应
  接收/发送的一方，以及它为何退出（或根本没有启动）。
- `[select]` 中缺少 `ctx.Done()` 分支——阻塞调用
  忽略了取消信号。
- 数百个完全相同的堆栈——这是泄漏（§5），而不是死锁。

## 4. 内存泄漏

在长时间运行的服务中挂载 pprof（只能使用私有端口，绝不能公开）：

```go
import _ "net/http/pprof"

go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

对比不同时间点的堆分析结果——泄漏是永不回落的增长：

```bash
curl -s localhost:6060/debug/pprof/heap > heap1.pb.gz
sleep 300   # let the leak accumulate
curl -s localhost:6060/debug/pprof/heap > heap2.pb.gz
go tool pprof -base heap1.pb.gz heap2.pb.gz
(pprof) top          # biggest positive delta = the leak
(pprof) list FuncName
```

常见问题包括：没有淘汰机制的无界缓存/map、子切片
导致大型数组无法释放、`time.Ticker` 从未停止、响应体未
关闭、不断增长的全局切片、持有缓冲区但被遗忘的 goroutine。

## 5. Goroutine 泄漏

```bash
curl -s localhost:6060/debug/pprof/goroutine > g1.pb.gz
sleep 300
curl -s localhost:6060/debug/pprof/goroutine > g2.pb.gz
go tool pprof -base g1.pb.gz g2.pb.gz
(pprof) top    # the growing stack is your leak site
```

发生泄漏的调用栈会告诉你哪个 `go` 语句始终没有终止。
修复终止路径（context、channel close）——相关模式参见并发技能文档。
在测试中，`goleak` (uber-go/goleak) 会让遗留 goroutine 的测试失败。

## 6. 竞态检测器

```bash
go test -race ./...        # in CI, always
go build -race ./cmd/api   # staging binaries under real traffic
```

报告会显示两个调用栈：写操作和并发的读/写操作，
每个调用栈都包含对应 goroutine 的创建位置。修复方法绝不是“添加
sleep”——应保护状态（mutex）、转移所有权（channel），或
使其不可变。`-race` 只会报告实际执行过的竞态：
一次无异常的运行并不能证明未经测试的路径不存在问题。

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

当你需要了解实际值或 goroutine 状态，而不仅仅是位置时，请使用 delve。
对于快速定位，使用有针对性的 `t.Logf` 或 `slog.Debug`
再运行一次测试，通常会更快。

## 8. 诊断环境变量

```bash
GOTRACEBACK=all ./api        # panic dumps ALL goroutines, not just one
GODEBUG=gctrace=1 ./api      # GC cycles: pacing, heap goal, pause times
GOMEMLIMIT=512MiB ./api      # soft memory limit — mitigates OOM while
                             # you find the real leak
```

## 验证清单

1. 在进行任何代码更改之前，已复现症状（或通过 dump/profile 捕获症状）
2. 已解释根本原因：你能够说明故障为何会在该位置发生
3. panic 修复针对 nil/bounds 的源头，而不是使用封装的 `recover`
4. 死锁修复建立了统一的锁顺序，或移除了共享锁
5. 已验证泄漏修复：修复后的 goroutine/heap profile 保持平稳
6. 与并发相关的修复完成后，`go test -race ./...` 通过
7. 现在有一个回归测试会在缺少该修复时失败
8. pprof 端点仅绑定到 localhost/private interfaces