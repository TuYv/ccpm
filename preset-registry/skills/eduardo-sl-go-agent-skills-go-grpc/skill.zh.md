---
name: go-grpc
description: >
  gRPC services in Go beyond the basics: proto design, status codes and
  error details, interceptors, deadlines, streaming, health checks, and
  graceful shutdown. Use when: "gRPC service", "proto design", "gRPC error
  handling", "interceptor", "gRPC streaming", "gRPC deadline", "grpc health
  check", "gRPC status codes".
  Not for: REST handlers (go-api-design), protobuf-agnostic layering
  (go-architecture-review), TLS hardening (go-security-audit).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Requires protoc or buf for code generation.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(protoc:*) Bash(buf:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go gRPC 服务

只有将契约视为 API，gRPC 的契约优先模型才能真正发挥作用：使用带版本的包、经过审慎设计的错误码、无处不在的截止时间，以及处理所有横切关注点的拦截器。

## 1. Proto 设计规则

```protobuf
syntax = "proto3";

package payment.v1;                            // version IN the package
option go_package = "github.com/acme/payment-service/gen/payment/v1;paymentv1";

service PaymentService {
  rpc CreatePayment(CreatePaymentRequest) returns (CreatePaymentResponse);
}

message CreatePaymentRequest {                 // one request/response pair
  string order_id = 1;                         // per RPC, always — even if
  int64 amount_cents = 2;                      // empty today
}

message CreatePaymentResponse {
  Payment payment = 1;
}
```

- 在包名中包含版本（`payment.v1`）；破坏性变更使用 `payment.v2`。
- 永远不要重新使用或重新编号字段标签；删除的字段使用 `reserved 3, 7;`。
- 每个 RPC 使用专用的 Request/Response 消息——以后添加字段无需付出代价；修改共享消息会破坏使用该消息的每个 RPC。
- 在 `make generate` 中使用 buf 或固定版本的 protoc 生成代码；将生成的代码提交到仓库，避免构建依赖工具链漂移。

## 2. 错误：使用状态码，而不是字符串

返回 `status.Error`，并在一个地方统一映射领域错误：

```go
func (s *Server) CreatePayment(ctx context.Context, req *pb.CreatePaymentRequest) (*pb.CreatePaymentResponse, error) {
    p, err := s.svc.Create(ctx, toDomain(req))
    if err != nil {
        return nil, toStatus(err)
    }
    return &pb.CreatePaymentResponse{Payment: fromDomain(p)}, nil
}

func toStatus(err error) error {
    switch {
    case errors.Is(err, domain.ErrNotFound):
        return status.Error(codes.NotFound, "payment not found")
    case errors.Is(err, domain.ErrDuplicate):
        return status.Error(codes.AlreadyExists, "payment already exists")
    case errors.Is(err, context.DeadlineExceeded):
        return status.Error(codes.DeadlineExceeded, "timed out")
    default:
        return status.Error(codes.Internal, "internal error") // no details leak
    }
}
```

需要关注的代码语义：`InvalidArgument`（无论状态如何，请求本身无效）、`FailedPrecondition`（状态不正确）、`NotFound`、`AlreadyExists`、`Unauthenticated` 与 `PermissionDenied`、`Unavailable`（可重试）、`Internal`（程序缺陷）。客户端通过 `status.FromError(err)` 读取错误码——永远不要解析消息。

## 3. 截止时间是强制要求

```go
// Client — every call gets a deadline
ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
defer cancel()
resp, err := client.CreatePayment(ctx, req)

// Server — check before expensive work
if err := ctx.Err(); err != nil {
    return nil, status.FromContextError(err).Err()
}
```

服务器会通过上下文继承客户端的截止时间。将 `ctx` 传入每个下游调用（数据库、其他 RPC），使取消操作端到端地传播。

## 4. 使用拦截器处理横切关注点

处理程序只保留业务逻辑；恢复、身份验证、日志记录和指标等功能放在拦截器中：

```go
srv := grpc.NewServer(
    grpc.ChainUnaryInterceptor(
        recoveryInterceptor,   // outermost: panic → codes.Internal
        loggingInterceptor,
        authInterceptor,
    ),
)

func loggingInterceptor(ctx context.Context, req any,
    info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    slog.InfoContext(ctx, "rpc",
        slog.String("method", info.FullMethod),
        slog.Duration("duration", time.Since(start)),
        slog.String("code", status.Code(err).String()),
    )
    return resp, err
}
```

顺序很重要：首先是 recovery（最外层），然后是可观测性，最后是
auth。流式 RPC 需要对应的 `StreamInterceptor` 版本。

## 5. 流式传输

- 对于大型结果集使用**服务器流式传输**：在循环中调用 `stream.Send`，
  返回非 nil 错误以通过状态中止。
- 仅在协议确实需要时使用**客户端/双向流式传输** —
  每个打开的流都会占用一个 goroutine 和流量控制状态。
- 始终在 `ctx.Done()` 时终止：

```go
func (s *Server) WatchPayments(req *pb.WatchRequest, stream pb.PaymentService_WatchPaymentsServer) error {
    for {
        select {
        case <-stream.Context().Done():
            return status.FromContextError(stream.Context().Err()).Err()
        case ev := <-s.events:
            if err := stream.Send(toProto(ev)); err != nil {
                return err
            }
        }
    }
}
```

## 6. 生产环境服务器设置

```go
lis, err := net.Listen("tcp", cfg.Addr)
if err != nil {
    return fmt.Errorf("listen: %w", err)
}

srv := grpc.NewServer(grpc.ChainUnaryInterceptor(...))
pb.RegisterPaymentServiceServer(srv, server)

healthSrv := health.NewServer() // grpc.health.v1 — load balancers need it
healthpb.RegisterHealthServer(srv, healthSrv)
reflection.Register(srv)        // grpcurl/debugging; gate on non-prod if policy requires

go func() {
    <-ctx.Done()
    stopped := make(chan struct{})
    go func() { srv.GracefulStop(); close(stopped) }()
    select {
    case <-stopped:                 // in-flight RPCs finished
    case <-time.After(10 * time.Second):
        srv.Stop()                  // force after grace period
    }
}()

return srv.Serve(lis)
```

## 验证清单

1. Proto 包已进行版本控制（`*.v1`）；不得重复使用标签；移除内容使用 `reserved`
2. 每个 RPC 都有专用的 Request/Response 消息
3. 生成的代码由固定版本的工具（buf/protoc）生成并提交
4. 所有处理程序错误均为带有语义正确代码的 `status.Error`
5. `codes.Internal` 响应绝不泄露内部错误文本
6. 每次客户端调用都有截止时间；ctx 通过所有层级进行传递
7. recovery、logging、auth 已作为链式拦截器实现（单向 + 流式）
8. 流在 `stream.Context().Done()` 上执行 select
9. 已注册健康检查服务；使用优雅停止，并带有强制停止回退机制
10. 针对运行中服务器的 `grpcurl` 冒烟测试（或生成的客户端测试）通过