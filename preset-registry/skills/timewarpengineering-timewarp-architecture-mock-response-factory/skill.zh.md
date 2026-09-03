---
name: mock-response-factory
description: >
  Add GetMockResponseFactory to API contracts and register factories in the SPA mock API service.
when-to-use: >
  GetMockResponseFactory, MockResponseFactory, MockCopicApiService, MockWebApiService,
  MockFactories, mock mode, IMockResponseFactory, SPA development without backend
---
# Mock Response Factory

无需真实后端即可进行 Blazor SPA 开发。每个 API 契约都会暴露一个工厂；SPA mock 服务将请求分派给它。

## 检测 — 在当前仓库中查找模式

```bash
rg -l 'GetMockResponseFactory' --glob '**/*.cs' | head -5
rg -l 'Mock.*ApiService' --glob '**/*.cs'
rg 'delegate.*MockResponseFactory' --glob '**/*.cs'
```

在添加新契约之前，先阅读一个现有契约及其注册方式。

## 第 1 步 — 在契约上实现

在操作的 `public static partial class` 中添加：

```csharp
public static MockResponseFactory<Response> GetMockResponseFactory()
{
  return _ => new Response(/* realistic sample data */);
}
```

规则：

- 委托类型：`MockResponseFactory<TResponse>` — 在仓库的共享契约项目中查找
- 返回**可信的**数据，而不是空壳或 `default`
- `ListResponse<T>`：多个有变化的条目，并正确设置 `totalCount`
- `Response` 为空的命令：返回 `new Response()` 或仓库既有的模式
- 流/文件端点：较小的内存流，或参照同类端点的做法

### ListResponse 示例

```csharp
public static MockResponseFactory<Response> GetMockResponseFactory()
{
  AnnouncementDto[] items =
  [
    new() { Text = "Maintenance tonight", Link = "/announcements/1" },
    new() { Text = "New feature available", Link = "/announcements/2" },
  ];
  return _ => new Response(totalCount: items.Length, items);
}
```

### 命令示例

```csharp
public static MockResponseFactory<Response> GetMockResponseFactory()
{
  return _ => new Response { SecurityRoleId = 1, B2CGroupId = Guid.NewGuid() };
}
```

## 第 2 步 — 在 SPA mock 服务中注册

参照仓库中已有的注册模式。常见变体：

**在 mock 服务上使用字典：**

```csharp
{ typeof(GetProfile.Query), GetProfile.GetMockResponseFactory() },
{ typeof(CreateSecurityRole.Command), CreateSecurityRole.GetMockResponseFactory() },
```

**每个端点一个包装类**（位于 `MockFactories/` 文件夹）：

```csharp
internal sealed class GetProfileMockFactory : IMockResponseFactory
{
  public object Create(IApiRequest request) =>
    GetProfile.GetMockResponseFactory()((GetProfile.Query)request);
}
```

然后在 mock 服务的工厂字典中注册该包装类。

## 第 3 步 — 验证

- SPA 以 mock 模式运行（无需后端）
- 调用该端点的功能能用示例数据渲染
- 命令 mock 返回客户端处理器所期望的响应

## 检查清单

- [ ] 在契约的 partial class 上添加了 `GetMockResponseFactory()`
- [ ] 示例数据足够真实，可用于 UI 开发
- [ ] 已在 mock API 服务中注册（字典或包装类 — 与同类端点保持一致）
- [ ] SPA 功能已在 mock 模式下验证

## 相关技能

- `web-api-contracts` — 完整的契约工作流；mock 工厂是新端点的第 10 步
