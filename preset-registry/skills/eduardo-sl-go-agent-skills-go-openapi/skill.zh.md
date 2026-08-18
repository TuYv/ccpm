---
name: go-openapi
description: >
  Spec-first REST development in Go with OpenAPI: generating server
  interfaces and clients with oapi-codegen, request validation middleware,
  RFC 9457 error bodies, contract testing, and detecting breaking API
  changes. Use when the API has or should have an OpenAPI document, when
  wiring code generation into the build, or when a hand-written handler has
  drifted from its published contract. Trigger examples: "OpenAPI", "swagger
  spec", "oapi-codegen", "generate a client from the spec", "validate
  requests against the schema", "breaking API change".
  Not for: handler structure and shutdown (go-api-design), gRPC and protobuf
  (go-grpc), GraphQL schemas and resolvers (go-graphql).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. oapi-codegen, oasdiff and a spec linter (vacuum or spectral) are installed on demand.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(oapi-codegen:*) Bash(oasdiff:*) Bash(vacuum:*)
metadata:
  author: eduardo-sl
  version: "1.0.1"
---
# Go OpenAPI

规范是唯一真实来源。类型、路由和客户端都从规范生成——绝不要在规范旁边手写它们，因为同一份契约由两方分别维护时，一个迭代周期内就会出现分歧。

## 工作模式

- **Adopt** — 项目已有手写处理程序但没有规范，或者有规范却无人根据它生成代码。在不进行重写的情况下引入生成流程。
- **Extend** — 流程已经存在。修改规范，重新生成，实现变更。
- **Review** — 检查处理程序、规范和已发布客户端是否一致，并确认变更不会悄然造成破坏性影响。

## 1. 一次性选择生成器

| 工具 | 适用场景 |
|---|---|
| `oapi-codegen` | 默认选择。生成类型、服务器接口和客户端，适用于 `net/http`、chi、echo、gin |
| `ogen` | 需要完全生成且严格校验的服务器，并且可以接受其设计取舍 |
| `swaggo/swag` | 仅适用于不准备迁移的遗留 code-first 项目——注解会生成规范，因此在代码存在之前无法审查规范 |

不要混用。一个同时存在注解和已提交规范的项目，又会出现两个真实来源。

## 2. 将生成流程接入构建

将生成器固定为 module tool（Go 1.24+），这样每位开发者和每次 CI 运行都使用相同的版本：

```bash
go get -tool github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen
```

```yaml
# oapi-codegen.yaml
package: api
output: internal/api/openapi.gen.go
generate:
  models: true
  std-http-server: true   # Go 1.22+ ServeMux; use chi-server / echo-server if that is the router
  strict-server: true     # typed request/response structs instead of raw http.ResponseWriter
  embedded-spec: true     # lets the service serve its own spec
output-options:
  skip-prune: false
```

```go
//go:generate go tool oapi-codegen -config oapi-codegen.yaml ../../api/openapi.yaml
```

提交生成的文件。审查者需要看到契约变更的差异，并且构建不能依赖已安装的生成器。

当生成文件过时时，CI 必须失败：

```bash
go generate ./... && git diff --exit-code
```

## 3. 实现生成的接口

严格模式会提供类型化的请求和响应，因此编译器会强制执行契约。

```go
// Generated: type StrictServerInterface interface { GetUser(ctx, GetUserRequestObject) (GetUserResponseObject, error) }

type Server struct{ users UserStore }

var _ api.StrictServerInterface = (*Server)(nil) // compile-time compliance

func (s *Server) GetUser(ctx context.Context, req api.GetUserRequestObject) (api.GetUserResponseObject, error) {
    u, err := s.users.Find(ctx, req.Id)
    if errors.Is(err, ErrNotFound) {
        return api.GetUser404JSONResponse{Title: "user not found", Status: 404}, nil
    }
    if err != nil {
        return nil, fmt.Errorf("find user %s: %w", req.Id, err) // 500 via the error handler
    }
    return api.GetUser200JSONResponse{Id: u.ID, Email: u.Email}, nil
}
```

规则：

- 断言 `var _ api.StrictServerInterface = (*Server)(nil)`。向规范添加端点后会变成编译错误，而不是在预发布环境中返回 404。
- 为每个已记录的状态返回类型化响应。仅针对未记录的失败路径返回 Go `error`。
- 绝不要编辑 `*.gen.go`。每项变更都从 YAML 开始。

## 4. 根据规范验证请求

生成的类型会检查形状，但不会检查约束。只有添加验证中间件后，查询参数上的 `minLength`、`pattern`、`enum` 和 `required` 才会生效。

```go
spec, err := api.GetSwagger()
if err != nil {
    return fmt.Errorf("load spec: %w", err)
}
spec.Servers = nil // otherwise the server URL must match exactly

mux := http.NewServeMux()
handler := nethttpmiddleware.OapiRequestValidator(spec)(mux)
```

这会在边界处拒绝格式错误的输入，在任何处理程序运行前返回 400。将领域验证保留在领域层中——中间件负责强制执行契约，而不是业务规则。

## 5. 错误：RFC 9457 Problem Details

定义一个错误模式，并在每个失败响应中引用它。

```yaml
components:
  schemas:
    Problem:
      type: object
      required: [type, title, status]
      properties:
        type:   { type: string, format: uri, default: "about:blank" }
        title:  { type: string }
        status: { type: integer }
        detail: { type: string }
        instance: { type: string }
```

以 `application/problem+json` 的形式提供。永远不要返回裸字符串，也不要将内部错误消息放入 `detail`——记录包装后的错误，返回稳定且安全的标题。

## 6. 版本控制与破坏性变更

以机械方式检测破坏性变更；审查者会漏掉这些变更。

```bash
go install github.com/oasdiff/oasdiff@latest
oasdiff breaking api/openapi.yaml.base api/openapi.yaml --fail-on ERR
```

在 CI 中针对主分支上的规范运行它。实践中，破坏性变更包括：移除端点或字段、收窄类型、添加必需的请求字段或客户端必须理解的必需响应字段、更改状态码、从响应中移除枚举值。

增加性变更是安全的。只有在无法避免破坏时，才对路径进行版本化（`/v2/...`），并在客户端完成迁移前继续提供旧版本服务。

## 7. 契约测试

只有当实现与规范不一致时会触发失败，规范才是真正的契约。

```go
func TestGetUser_MatchesSpec(t *testing.T) {
    spec, err := api.GetSwagger()
    require.NoError(t, err)
    spec.Servers = nil

    srv := httptest.NewServer(newTestHandler(t, spec))
    t.Cleanup(srv.Close)

    // Generated client — if the spec changed, this stops compiling
    c, err := api.NewClientWithResponses(srv.URL)
    require.NoError(t, err)

    resp, err := c.GetUserWithResponse(t.Context(), "u-1")
    require.NoError(t, err)
    require.Equal(t, http.StatusOK, resp.StatusCode())
    require.Equal(t, "u-1", resp.JSON200.Id)
}
```

在测试中使用生成的客户端，而不是手写的 `http.NewRequest`。这样，契约漂移会变成编译失败。

## 8. 保持规范易于审查

```bash
vacuum lint -d api/openapi.yaml     # or: spectral lint, redocly lint
```

- 每个 API 使用一个文件，放在 `api/` 下，纳入版本控制，并像代码一样进行审查。
- 每个操作都有一个 `operationId`——它会成为 Go 方法名。
- 每个模式都有一个 `description`；它会成为生成类型上的 godoc。
- 使用 `$ref` 将大型规范拆分到 `components/` 中，而不是通过生成方式拆分出片段。

## 验证清单

1. 唯一的事实来源：一份已提交到版本库的规范文件，其旁边没有注释生成器
2. 生成器通过 `go.mod` 中的工具指令固定版本
3. 生成的文件已提交，并且 CI 会在执行 `go generate` + `git diff --exit-code` 时失败
4. 存在 `var _ api.StrictServerInterface = (*Server)(nil)`
5. 不得手动编辑 `*.gen.go`
6. 已安装请求验证中间件，并通过 400 测试覆盖
7. 错误统一使用单一的 `Problem` schema，并以 `application/problem+json` 提供
8. CI 中针对基础规范运行 `oasdiff breaking`
9. 至少有一个测试使用真实处理程序驱动生成的客户端
10. 规范通过 lint 检查，并且每个操作都有一个 `operationId`