---
name: go-graphql
description: >
  Build GraphQL servers in Go with gqlgen: schema-first generation, resolver
  structure, the N+1 problem and dataloaders, complexity and depth limits,
  error presentation, field-level authorization, and testing resolvers. Use
  when implementing or reviewing a GraphQL API, when a query fans out into
  hundreds of database calls, or when deciding what a resolver may expose.
  Trigger examples: "GraphQL", "gqlgen", "resolver", "N+1 queries",
  "dataloader", "query complexity limit", "GraphQL schema".
  Not for: REST and OpenAPI (go-openapi), gRPC (go-grpc), general HTTP
  middleware and shutdown (go-api-design).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. gqlgen is installed as a module tool.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(gqlgen:*)
metadata:
  author: eduardo-sl
  version: "1.0.1"
---
# Go GraphQL

GraphQL 将查询规划移交给客户端。这既是它的特性，也是它的危险之处：一个看似无害的查询可能变成一万次数据库往返，而一个权限过于宽松的字段可能泄露另一租户的数据。这两类问题都应在服务端解决，而不是在 schema 审查中解决。

## 1. 使用 gqlgen 进行 Schema-First 开发

`.graphql` schema 是事实来源。gqlgen 根据它生成模型、resolver 存根和执行层。

```bash
go get -tool github.com/99designs/gqlgen
go tool gqlgen init      # once
go tool gqlgen generate  # after every schema change
```

```yaml
# gqlgen.yml — bind generated types to your own models
models:
  User:
    model: github.com/myorg/app/internal/domain.User
  ID:
    model:
      - github.com/99designs/gqlgen/graphql.ID
      - github.com/99designs/gqlgen/graphql.Int64
```

显式绑定领域类型。如果不进行绑定，gqlgen 会自行生成一套平行的贫血结构体，最终每个 resolver 都会变成映射函数。

提交生成的代码，并在代码过时时让 CI 失败：

```bash
go tool gqlgen generate && git diff --exit-code
```

绝不要编辑 `generated.go` 或 `models_gen.go`。`resolver.go` 和 `*.resolvers.go` 文件属于你。

## 2. 保持 Resolvers 精简

resolver 将 GraphQL 请求转换为服务调用。其中不包含业务逻辑，也不包含 SQL。

```go
func (r *queryResolver) User(ctx context.Context, id string) (*domain.User, error) {
    u, err := r.users.Find(ctx, id)
    if errors.Is(err, domain.ErrNotFound) {
        return nil, nil // nullable field: absent, not an error
    }
    if err != nil {
        return nil, fmt.Errorf("find user %s: %w", id, err)
    }
    return u, nil
}
```

通过 `Resolver` 结构体注入依赖，绝不要通过包级全局变量注入：

```go
type Resolver struct {
    users  UserService
    orders OrderService
    loader *Loaders
}
```

始终传递 `ctx`。它携带请求截止时间、经过身份验证的主体，以及每个请求对应的 dataloader。

## 3. N+1 问题——真正重要的问题

列表类型上的字段 resolver 会对每个元素执行一次。

```go
// ❌ 1 query for the orders, then N queries for the users
func (r *orderResolver) Customer(ctx context.Context, obj *domain.Order) (*domain.User, error) {
    return r.users.Find(ctx, obj.CustomerID)
}
```

使用 dataloader 进行批处理。它会收集短时间窗口内请求的键，并发起一次查询。

```go
import "github.com/vikstrous/dataloadgen"

type Loaders struct {
    UserByID *dataloadgen.Loader[string, *domain.User]
}

func NewLoaders(s UserService) *Loaders {
    return &Loaders{
        UserByID: dataloadgen.NewLoader(func(ctx context.Context, ids []string) ([]*domain.User, []error) {
            return s.FindMany(ctx, ids) // ONE query for all ids
        }, dataloadgen.WithWait(time.Millisecond)),
    }
}

// ✅ 1 query for the orders, 1 for all customers
func (r *orderResolver) Customer(ctx context.Context, obj *domain.Order) (*domain.User, error) {
    return loadersFrom(ctx).UserByID.Load(ctx, obj.CustomerID)
}
```

加载器是**每个请求独立的**，由中间件安装。进程范围的加载器会跨用户缓存，并在用户之间泄漏数据。

```go
func withLoaders(svc UserService, next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ctx := context.WithValue(r.Context(), loadersKey{}, NewLoaders(svc))
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

批处理函数必须按照传入键的顺序返回结果，对于每个缺失的键都要返回一个 nil 条目和一个错误。返回更短的切片会悄无声息地导致所有结果错位。

## 4. 限制每个查询

没有限制的公共 GraphQL 端点就是一个拒绝服务端点。

```go
srv := handler.New(generated.NewExecutableSchema(cfg))
srv.AddTransport(transport.POST{})
srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
srv.Use(extension.FixedComplexityLimit(300))
srv.Use(extension.AutomaticPersistedQuery{Cache: lru.New[string](100)})
```

- **复杂度限制** — 为每个字段分配成本，对于 `first` 值较大的列表字段分配更高的成本。从一个能够容纳最慢合法查询的数值开始，然后进行度量。
- **深度** — 递归类型（`user { orders { customer { orders ... } } }`）必须受到限制。gqlgen 没有内置的深度限制；请在操作中间件中强制执行。
- **分页对每个列表字段都是强制性的**。返回无界列表的字段属于架构错误。
- **内省** 只有在安装 `extension.Introspection` 后才会启用。不要在生产环境中安装它，或者将其限制在经过身份验证的角色之后。
- **持久化查询** 允许公共客户端发送哈希值而不是文档，因此服务器只会执行由你发布的查询。

设置 `srv.AroundOperations` 以强制执行每个操作的超时，并始终在设置了 `ReadTimeout` 和 `WriteTimeout` 的 `http.Server` 后运行。

## 5. 错误

GraphQL 会返回带有 `errors` 数组的 200 响应。绝不要将内部信息泄漏到其中。

```go
srv.SetErrorPresenter(func(ctx context.Context, e error) *gqlerror.Error {
    err := graphql.DefaultErrorPresenter(ctx, e)

    var domainErr *domain.ValidationError
    if errors.As(e, &domainErr) {
        err.Message = domainErr.Message
        err.Extensions = map[string]any{"code": "VALIDATION_FAILED"}
        return err
    }

    slog.ErrorContext(ctx, "graphql resolver failed", "error", e)
    err.Message = "internal server error" // stable, safe
    err.Extensions = map[string]any{"code": "INTERNAL"}
    return err
})
```

使用 `srv.SetRecoverFunc` 将 resolver panic 转换为错误，而不是终止连接，并使用堆栈信息记录日志。

记住可空性规则：非空字段上的错误会使其最近的可空祖先字段变为 null。只有当字段在合法情况下绝不可能缺失时，才将其定义为非空。

## 6. 授权应归属于字段

仅进行对象级检查是不够的——客户端可以通过多条路径访问同一个对象。

```graphql
directive @hasRole(role: Role!) on FIELD_DEFINITION

type User {
  id: ID!
  email: String! @hasRole(role: ADMIN)
}
```

```go
cfg.Directives.HasRole = func(ctx context.Context, obj any, next graphql.Resolver, role model.Role) (any, error) {
    if !auth.FromContext(ctx).HasRole(role) {
        return nil, gqlerror.Errorf("access denied")
    }
    return next(ctx)
}
```

在 GraphQL 处理程序之前，通过 HTTP 中间件进行身份认证。在指令或解析器中，使用上下文中的主体进行授权——绝不要使用查询参数中的主体。

## 7. 测试

```go
func TestUserQuery(t *testing.T) {
    c := client.New(handler.NewDefaultServer(generated.NewExecutableSchema(cfg)))

    var resp struct {
        User struct{ ID, Email string }
    }
    c.MustPost(`{ user(id: "u-1") { id email } }`, &resp)

    require.Equal(t, "u-1", resp.User.ID)
}
```

对于使用 dataloader 的任何解析器，都要断言查询次数——只有这样，N+1 回归才会导致构建失败，而不是仅在仪表板中显示：

```go
require.Equal(t, 2, db.QueryCount(), "expected batched loads, got N+1")
```

## 验证清单

1. Schema 是事实来源；生成的文件已提交并由 CI 检查
2. 生成的类型通过 `gqlgen.yml` 绑定到领域模型
3. 解析器不包含业务逻辑，并始终传递 `ctx`
4. 每个通过 ID 获取数据的列表字段解析器都经过 dataloader
5. Dataloader 按请求构造，绝不跨请求共享
6. 批处理函数为每个键返回一个结果，并且结果顺序与键顺序一致
7. 已配置并测试复杂度限制和深度上限
8. 每个列表字段都支持分页
9. 生产环境中已禁用内省，或已按角色限制内省
10. 错误呈现器会剥离内部错误；已安装 recover 函数
11. 授权按字段执行，并基于上下文中的主体
12. 至少有一个测试断言批处理字段的查询次数