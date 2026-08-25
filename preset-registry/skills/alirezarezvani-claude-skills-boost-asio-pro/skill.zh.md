---
name: "boost-asio-pro"
description: "Use when writing or reviewing asynchronous C++ networking code with Boost.Asio or standalone Asio — TCP/UDP servers and clients, SSL/TLS, timers, strands, io_context, co_spawn, awaitable, async_read/async_write, asio::spawn, yield_context, or pre-C++20 completion-handler callbacks."
---
# Boost.Asio / standalone Asio

## 概述

编写能够在*用户所使用的* Boost 上编译通过的异步 C++ 网络代码，而不是针对最新版本编写。Asio 的 API 曾经历三次形态变化（经典的 `io_service` → `io_context` → C++20 协程），而互联网上的大多数 Asio 代码都来自第一个时代，因此**应先根据工具链选择风格**，然后参阅该风格对应的参考文件。

**参考资料：** [Boost.Asio](https://www.boost.org/doc/libs/latest/doc/html/boost_asio.html) · [standalone Asio](https://think-async.com/Asio/)

只要涉及异步 C++ 网络代码的编写或审查，就应使用此 skill——尤其是在目标工具链较旧时，因为协程示例根本无法编译通过。它所引用的三个完整实现已经通过了从 Boost 1.62（2016 年）到 1.90 的 CI 验证。

## 第 1 步：选择风格（编写代码前执行此步骤）

确定实际使用的 Boost（或 Asio）版本和 C++ 标准——可以查看 `find_package(Boost)` 的输出、`dpkg -l libboost-dev`、`brew info boost`、`CMAKE_CXX_STANDARD`，或直接询问。不要假设使用的是最新版本。

| Boost | C++ 标准 | 风格 | 阅读 |
|-------|---------|------|------|
| ≥ 1.77 | C++20 | 协程（`co_await` + `awaitable<T>`）——首选 | [references/coroutines.md](references/coroutines.md) |
| ≥ 1.74 | C++11–17 | 完成处理器（回调）——可移植的基线 | [references/pre-cpp20.md](references/pre-cpp20.md) |
| ≥ 1.80 | C++11–17 | 有栈 `asio::spawn` + `yield_context`（链接 Boost.Coroutine——并非仅头文件） | [references/pre-cpp20.md](references/pre-cpp20.md) |
| 1.62–1.65 | C++11 | 经典的 `io_service` / `strand.wrap` / `expires_from_now` | [references/classic-boost.md](references/classic-boost.md) |

任何风格下的 SSL/TLS：[references/ssl.md](references/ssl.md)。任何风格下的 CMake：[references/build.md](references/build.md)。

`io_context`、`make_strand`、`bind_executor`、`steady_timer`、`signal_set`、`async_read`/`async_write`/`async_read_until`、缓冲区和 `resolver` 都是**库**特性——在协程风格和回调风格中完全相同。不同之处仅在于挂起机制。

## 第 2 步：版本下限（通过编译验证，而非依据文档）

使用以下任一特性时，在较旧的发行版上会导致构建失败：

| 特性 | 下限 |
|---------|-------|
| `experimental/awaitable_operators.hpp`（`\|\|` / `&&` 运算符） | **Boost ≥ 1.77** / Asio ≥ 1.20 |
| `as_tuple` 完成令牌 | **Boost ≥ 1.79** / Asio ≥ 1.21 |
| `co_composed`（自定义组合操作） | **Boost ≥ 1.85** / Asio ≥ 1.30 |
| 三参数 `asio::spawn(ex, fn, token)` | **Boost ≥ 1.80**（较旧的 Boost 仅有 `spawn(ex, fn)`） |
| `any_io_executor`（`strand<any_io_executor>`、`tcp::socket` 的默认执行器） | **Boost ≥ 1.74**——回调风格的下限；低于此版本时，使用传统的 `io_context::strand` |
| `io_context`、`make_strand`、`expires_after` | **Boost ≥ 1.66**——低于此版本时，使用经典的 `io_service` |

容易受发行版版本下限影响的情况：**Debian bookworm 提供 Boost 1.74**（没有 `awaitable_operators.hpp`——`#include` 会直接失败），Ubuntu 20.04 提供 1.71（没有 `any_io_executor`），Debian 9 提供 1.62。

语言，而非库：chrono 字面量 `250ms` / `30s` 属于 **C++14**。如果要进行真正的 C++11 构建，请写成 `std::chrono::milliseconds(250)`。

## 步骤 3：实际上很容易出错的规则

**strand 不会串行化写操作。** strand 串行化的是处理器的*执行*，而不是整个组合操作。即使两个 `async_write` 在同一个 strand 上同时进行，它们仍然会在**线路上传输的字节中交错**。全双工场景（读取循环与并发推送/回复同时进行）需要每个连接一个 strand，**以及一个带有进行中标志的出站队列**，从而保证同一时间最多只有一个 `async_write` 存在。这是关于 Asio 最常见的错误答案。

**缓冲区不拥有内存。** `asio::buffer()` 是一个视图。存储空间必须比操作存活得更久：在同一个协程帧中跨越 `co_await` 的协程局部变量没有问题；在回调风格中，同一数据必须成为一个**成员**，而不能是局部变量。

**连接的生命周期必须长于其处理器。** 使用 `enable_shared_from_this`，并在*每一个* `co_spawn` / 处理器中捕获 `self`——读取循环、写入循环以及每个定时器都要如此。

**使用组合读取进行分帧。** 对长度前缀使用 `async_read`（恰好填满缓冲区），然后再读取消息体；不要使用会返回短数据的 `async_read_some`。

**包装 `as_tuple`。** 始终使用 `as_tuple(use_awaitable)`。单独的 `as_tuple` 会根据操作的默认令牌进行解析，在某些上下文中可以编译，在另一些上下文中则会失败。

**`async_accept(make_strand(...))` 会改变两件事**：它会强制在调用处显式传回一个完成令牌，并且被接受的套接字是 `basic_stream_socket<tcp, strand<...>>`，而不是 `tcp::socket`。请**按值**接收它，或使用 `auto`——将其绑定到 `tcp::socket&` 将无法编译。

**重新设置定时器会以 `operation_aborted` 结束待处理的等待。** 在空闲超时循环中，这表示继续等待，而不是发生错误。

**GCC 对 C++20 风格需要 `-fcoroutines`**，而仅包含头文件的 Boost 需要在恰好一个位置定义 `BOOST_ERROR_CODE_HEADER_ONLY`（CMake）。

## 反模式

| 错误 | 修复 |
|---------|-----|
| 缓冲区悬空（异步操作期间局部变量超出作用域） | 确保缓冲区生命周期 ≥ 操作生命周期；使用协程局部变量或成员，而不是回调局部变量 |
| 忘记 `io.run()` | 没有 `run()` / `run_one()` 就不会分发任何处理器 |
| 未通过 strand 进行并发套接字访问 | 使用 `strand<>` 包装，或通过一个协程链进行串行化 |
| 误以为 strand 能防止写操作交错 | 添加写队列——参见步骤 3 |
| 在 `deferred` 已经足够时使用 `use_awaitable` | 省略令牌（默认是 `deferred`），除非使用 `\|\|` / `&&` |
| 忽略短读取/短写入 | 使用组合的 `async_read` / `async_write` / `async_read_until`，而不是 `async_read_some` |
| 未在 acceptor 上设置 `reuse_address` | 在 `bind`/`listen` 之前设置，否则重启时会遇到“地址已在使用” |
| 在没有 strand 的情况下执行 SSL 操作 | `ssl::stream` 的*所有*操作都需要 strand 同步 |
| 在处理器内部阻塞 | 绝不要在完成处理器中阻塞 |
| 使用错误的执行器类型接受套接字 | 参见步骤 3 中的 `async_accept(make_strand(...))` |
| 要求 `Boost::system` 组件 | 自 1.74 起支持仅包含头文件：使用 `Boost::headers` + `BOOST_ERROR_CODE_HEADER_ONLY`。只有经典版本（1.66 之前）需要链接 |
| GCC 缺少 `-fcoroutines` | 构建失败——添加 `$<$<CXX_COMPILER_ID:GNU>:-fcoroutines>` |
| 为早于协程支持版本的 Boost 编写协程代码 | 先执行步骤 1 |

## Boost.Asio 与独立版 Asio

同一位作者、同一套 API——命名空间和包含文件有所不同。

| 方面 | Boost.Asio | 独立版 Asio |
|--------|-----------|-----------------|
| 命名空间 / 包含文件 | `boost::asio` / `<boost/asio.hpp>` | `asio` / `<asio.hpp>` |
| 错误码 | `boost::system::error_code` | `asio::error_code`（或 `std::error_code`） |
| 安装（brew） | `brew install boost` | `brew install asio` |
| CMake | `Boost::headers` | 手动包含路径 |
| 版本（2025） | 1.87–1.90（随 Boost 提供） | 1.30–1.36（独立版本） |
| 宏前缀 | `BOOST_ASIO_` | `ASIO_` |

使用 shim 同时支持两者，然后全程使用 `net::`：
```cpp
#ifdef USE_STANDALONE_ASIO
  #include <asio.hpp>
  namespace net = asio;
  using error_code = asio::error_code;
#else
  #include <boost/asio.hpp>
  namespace net = boost::asio;
  using error_code = boost::system::error_code;
#endif
namespace ssl = net::ssl;
using tcp = net::ip::tcp;
```

## 在你认为完成之前

根据下面的列表检查你刚刚编写的代码：

- [ ] 风格与目标 Boost 版本和 C++ 标准（步骤 1）匹配，并且使用的每个 API 都满足其最低版本要求（步骤 2）。
- [ ] 传递给异步操作的每个缓冲区的生命周期都长于该操作——没有回调局部变量，也没有悬空的 `string_view`。
- [ ] 每个 socket 最多只有一个正在执行的 `async_write`；如果有任何操作会与读取并发写入，则通过队列 + 标志位强制执行这一点。
- [ ] 共享对象上的每条异步链都运行在同一个 strand 上；每个处理器和 `co_spawn` 都捕获 `self`。
- [ ] 帧处理 / 分隔读取使用组合操作 `async_read` / `async_read_until`。
- [ ] 错误都得到处理，而不是被吞掉：每个操作都要解构 `as_tuple(use_awaitable)` 的结果，或检查回调中的 `ec`。
- [ ] 每当定时器重新设置或某个操作被取消时，都要将 `operation_aborted` 与真正的错误区分开。
- [ ] Acceptor 设置 `reuse_address`；关闭流程会关闭 acceptor 并排空各个会话。
- [ ] CMake 包含标准、GCC 所需的 `-fcoroutines`（仅限 C++20）、位于一个地方的 `BOOST_ERROR_CODE_HEADER_ONLY`，并且仅在使用栈式 `spawn` 时包含 `Boost::coroutine`。
- [ ] 代码能够编译。实际构建它——上面的大多数错误都会在编译期暴露，而版本最低要求只有经过测试才算真正满足。

## 完整示例

同一个全双工帧协议服务器的三种经过 CI 验证的实现，每种对应一种风格——从与步骤 1 匹配的实现开始复制。三个示例都位于上游仓库中，并且每次推送都会由 CI 构建。

- [market-data-feed](https://github.com/alexprivalov/boost-asio-skill/tree/main/examples/market-data-feed) — C++20 协程（Boost 1.77+；已验证 1.83–1.90）
- [market-data-feed-precpp20](https://github.com/alexprivalov/boost-asio-skill/tree/main/examples/market-data-feed-precpp20) — 回调，符合 C++11（已验证 Boost 1.74+，包括 Windows/MSVC）
- [market-data-feed-classic](https://github.com/alexprivalov/boost-asio-skill/tree/main/examples/market-data-feed-classic) — 经典 `io_service`（已验证可追溯至 Boost 1.62 / Debian 9）

## 官方文档

- 概览：https://www.boost.org/doc/libs/latest/doc/html/boost_asio/overview.html
- 参考：https://www.boost.org/doc/libs/latest/doc/html/boost_asio/reference.html
- 示例：https://www.boost.org/doc/libs/latest/doc/html/boost_asio/examples.html

## 交叉引用

- `engineering/docker-development` — 该技能所依据的旧版 Boost 验证通道是容器化构建（Debian 9 / bookworm、Fedora）。
- `engineering/chaos-engineering` — 用于测试该技能要求你处理的故障路径：半开套接字、空闲超时、部分帧。
- `engineering-team/playwright-pro` — 客户端对应内容：在基于浏览器的集成测试中驱动此处构建的服务器。