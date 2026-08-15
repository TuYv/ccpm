---
name: go-grpc
description: >
  gRPC services in Go beyond the basics: proto design, status codes and error
  details, interceptors, deadlines, streaming, health checks, and graceful
  shutdown.
  Use when: "gRPC service", "proto design", "gRPC error handling",
  "interceptor", "gRPC streaming", "gRPC deadline", "grpc health check",
  "gRPC status codes".
  Do NOT use for: REST/HTTP handler design (use go-api-design), protobuf-agnostic
  API layering (use go-architecture-review), or TLS hardening details
  (use go-security-audit).
license: MIT
metadata:
  version: "1.0.0"
---
# Go gRPC 服务

只有将契约视为 API 来管理，gRPC 的契约优先模型才能真正发挥作用：采用版本化包、审慎设计错误码、处处设置截止时间，并通过拦截器处理所有横切关注点。

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

- 在包中指定版本（`payment.v1`）；破坏性变更 = `payment.v2`。
- 切勿复用字段标签或重新编号；对于已删除的字段，使用 `reserved 3, 7;`。
- 为每个 RPC 使用专属的 Request/Response 消息——以后添加字段无需付出兼容性代价；修改共享消息则会破坏所有使用它的 RPC。
- 在 `make generate` 中使用 buf 或固定版本的 protoc 生成代码；提交生成的代码，避免构建结果依赖工具链变化。

## 2. 错误：使用状态码，而非字符串

返回 `status.Error`，并在唯一一处映射领域错误：

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

需要重点关注的状态码语义：`InvalidArgument`（无论系统状态如何，请求本身无效）、`FailedPrecondition`（系统状态不满足要求）、`NotFound`、`AlreadyExists`、`Unauthenticated` 与 `PermissionDenied` 的区别、`Unavailable`（可重试）、`Internal`（程序缺陷）。客户端使用 `status.FromError(err)` 读取状态码——切勿解析错误消息。

## 3. 必须设置截止时间

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

服务器通过上下文继承客户端的截止时间。将 `ctx` 传入每个下游调用（数据库、其他 RPC），使取消信号能够端到端传播。

## 4. 使用拦截器处理横切关注点

处理器只负责业务逻辑；异常恢复、身份验证、日志记录和指标监控由拦截器处理：

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

顺序很重要：恢复拦截器在最前（最外层），然后是可观测性拦截器，最后是认证拦截器。流式 RPC 需要对应的 `StreamInterceptor` 版本。

## 5. 流式传输

- 对大型结果集使用**服务端流式传输**：在循环中调用 `stream.Send`，返回非 nil 错误以通过状态码中止。
- 仅当协议确实需要时才使用**客户端/双向流式传输**——每个打开的流都会占用一个 goroutine 和流量控制状态。
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

1. Proto 包已进行版本化（`*.v1`）；不重复使用标签；删除字段时使用 `reserved`
2. 每个 RPC 都有专用的 Request/Response 消息
3. 生成的代码由固定版本的工具（buf/protoc）生成并提交
4. 所有处理程序错误均为 `status.Error`，且使用语义正确的状态码
5. `codes.Internal` 响应绝不泄露内部错误文本
6. 每次客户端调用都有截止时间；ctx 贯穿所有层级进行传递
7. 恢复、日志记录和认证均实现为链式拦截器（一元 + 流式）
8. 流使用 select 监听 `stream.Context().Done()`
9. 已注册健康检查服务；优雅停止并提供强制停止作为后备方案
10. 针对运行中的服务器执行的 `grpcurl` 冒烟测试（或生成的客户端测试）通过