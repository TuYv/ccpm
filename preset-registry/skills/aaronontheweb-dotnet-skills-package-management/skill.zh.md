---
name: package-management
description: Manage NuGet packages using Central Package Management (CPM) and dotnet CLI commands. Never edit XML directly - use dotnet add/remove/list commands. Use shared version variables for related packages.
invocable: false
---
# NuGet 包管理

## 何时使用此技能

在以下情况下使用此技能：
- 添加、移除或更新 NuGet 包
- 为解决方案设置中央包管理（CPM）
- 跨多个项目管理包版本
- 排查包冲突或还原问题

---

## 黄金法则：绝不直接编辑 XML

**始终使用 `dotnet` CLI 命令管理包。**切勿手动编辑 `.csproj` 或 `Directory.Packages.props` 文件。

```bash
# DO: Use CLI commands
dotnet add package Newtonsoft.Json
dotnet remove package Newtonsoft.Json
dotnet list package --outdated

# DON'T: Edit XML directly
# <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
```

**原因：**
- CLI 会验证包是否存在并解析正确的版本
- 能够正确处理传递依赖项
- 如果存在锁定文件，会对其进行更新
- 避免拼写错误和格式错误的 XML
- 能够与 CPM 正确配合使用

---

## 中央包管理（CPM）

CPM 将所有包版本集中在一个文件中，从而消除不同项目之间的版本冲突。

### 启用 CPM

在解决方案根目录中创建 `Directory.Packages.props`：

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <ItemGroup>
    <PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageVersion Include="Serilog" Version="4.0.0" />
    <PackageVersion Include="xunit" Version="2.9.2" />
  </ItemGroup>
</Project>
```

### 使用 CPM 的项目文件

项目引用包时**不指定版本**：

```xml
<!-- src/MyApp/MyApp.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" />
    <PackageReference Include="Serilog" />
  </ItemGroup>
</Project>
```

### 使用 CPM 添加包

```bash
# Adds to Directory.Packages.props AND project file
dotnet add package Serilog.Sinks.Console

# Result in Directory.Packages.props:
# <PackageVersion Include="Serilog.Sinks.Console" Version="6.0.0" />

# Result in project file:
# <PackageReference Include="Serilog.Sinks.Console" />
```

---

## 共享版本变量

使用共享版本变量对相关包进行分组：

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <!-- Shared version variables -->
  <PropertyGroup Label="SharedVersions">
    <AkkaVersion>1.5.59</AkkaVersion>
    <AkkaHostingVersion>1.5.59</AkkaHostingVersion>
    <AspireVersion>9.0.0</AspireVersion>
    <OpenTelemetryVersion>1.11.0</OpenTelemetryVersion>
    <XunitVersion>2.9.2</XunitVersion>
  </PropertyGroup>

  <!-- Akka.NET packages - all use same version -->
  <ItemGroup Label="Akka.NET">
    <PackageVersion Include="Akka" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Cluster" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Cluster.Sharding" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Cluster.Tools" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Persistence" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Streams" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Hosting" Version="$(AkkaHostingVersion)" />
    <PackageVersion Include="Akka.Cluster.Hosting" Version="$(AkkaHostingVersion)" />
  </ItemGroup>

  <!-- Aspire packages -->
  <ItemGroup Label="Aspire">
    <PackageVersion Include="Aspire.Hosting" Version="$(AspireVersion)" />
    <PackageVersion Include="Aspire.Hosting.AppHost" Version="$(AspireVersion)" />
    <PackageVersion Include="Aspire.Hosting.PostgreSQL" Version="$(AspireVersion)" />
    <PackageVersion Include="Aspire.Hosting.Testing" Version="$(AspireVersion)" />
  </ItemGroup>

  <!-- OpenTelemetry packages -->
  <ItemGroup Label="OpenTelemetry">
    <PackageVersion Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="$(OpenTelemetryVersion)" />
    <PackageVersion Include="OpenTelemetry.Extensions.Hosting" Version="$(OpenTelemetryVersion)" />
    <PackageVersion Include="OpenTelemetry.Instrumentation.AspNetCore" Version="$(OpenTelemetryVersion)" />
    <PackageVersion Include="OpenTelemetry.Instrumentation.Http" Version="$(OpenTelemetryVersion)" />
  </ItemGroup>

  <!-- Testing -->
  <ItemGroup Label="Testing">
    <PackageVersion Include="xunit" Version="$(XunitVersion)" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="$(XunitVersion)" />
    <PackageVersion Include="FluentAssertions" Version="6.12.0" />
    <PackageVersion Include="Verify.Xunit" Version="26.0.0" />
  </ItemGroup>
</Project>
```

**优势：**
- 只需更改一个变量即可更新所有 Akka 包
- 使用带标签的 ItemGroup，组织结构清晰
- 防止相关包之间出现版本不匹配

---

## 不应使用 CPM 的情况

中央包管理并不总是正确的选择：

### 遗留项目

将现有大型解决方案迁移到 CPM 可能会引发问题：
- 现有的版本冲突会一次性全部显现
- 某些包可能有意使用不同版本
- 迁移需要同时修改许多文件

**建议**：对于遗留项目，应逐步迁移；如果按项目管理版本的方式运行良好，也可以继续使用该方式。

### 版本范围

CPM 要求使用精确版本，不支持版本范围：

```xml
<!-- NOT supported with CPM -->
<PackageVersion Include="Newtonsoft.Json" Version="[13.0,14.0)" />

<!-- Must use exact version -->
<PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />
```

如果你需要使用版本范围（这种情况很少见，但某些库场景确实需要），则无法使用 CPM。

### 较旧的 .NET 版本

CPM 要求：
- **.NET SDK 6.0.300+** 或更高版本
- **NuGet 6.2+** 或更高版本
- **Visual Studio 2022 17.2+** 或更高版本

如果你的目标是较旧的 SDK 版本，或者团队成员仍在使用较旧的工具，CPM 可能会导致构建失败。

### 多仓库解决方案

如果你的解决方案跨越多个独立构建的仓库，那么 CPM 的单个 `Directory.Packages.props` 无法提供帮助——每个仓库都需要自己的该文件。

---

## CLI 命令参考

### 添加包

```bash
# Add latest stable version
dotnet add package Serilog

# Add specific version
dotnet add package Serilog --version 4.0.0

# Add prerelease
dotnet add package Serilog --prerelease

# Add to specific project
dotnet add src/MyApp/MyApp.csproj package Serilog
```

### 删除包

```bash
# Remove from current project
dotnet remove package Serilog

# Remove from specific project
dotnet remove src/MyApp/MyApp.csproj package Serilog
```

### 列出包

```bash
# List all packages in solution
dotnet list package

# Show outdated packages
dotnet list package --outdated

# Include transitive dependencies
dotnet list package --include-transitive

# Show vulnerable packages
dotnet list package --vulnerable

# Show deprecated packages
dotnet list package --deprecated
```

### 更新包

```bash
# With CPM: Edit the version in Directory.Packages.props
# Then restore to apply
dotnet restore

# Without CPM: Remove and add with new version
dotnet remove package Serilog
dotnet add package Serilog --version 4.1.0

# Or use dotnet-outdated tool (recommended)
dotnet tool install --global dotnet-outdated-tool
dotnet outdated --upgrade
```

### 还原和清理

```bash
# Restore packages
dotnet restore

# Clear local cache (troubleshooting)
dotnet nuget locals all --clear

# Force restore (ignore cache)
dotnet restore --force
```

---

## 包源

### 列出源

```bash
dotnet nuget list source
```

### 添加私有源

```bash
# Add authenticated feed
dotnet nuget add source https://pkgs.dev.azure.com/myorg/_packaging/myfeed/nuget/v3/index.json \
  --name MyFeed \
  --username az \
  --password $PAT \
  --store-password-in-clear-text
```

### NuGet.config

对于解决方案专用的源，创建 `NuGet.config`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="MyPrivateFeed" value="https://pkgs.dev.azure.com/myorg/_packaging/myfeed/nuget/v3/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <MyPrivateFeed>
      <add key="Username" value="az" />
      <add key="ClearTextPassword" value="%NUGET_PAT%" />
    </MyPrivateFeed>
  </packageSourceCredentials>
</configuration>
```

---

## 常见模式

### 仅用于开发的包

```xml
<!-- Directory.Packages.props -->
<PackageVersion Include="Microsoft.SourceLink.GitHub" Version="8.0.0" />

<!-- Project file - mark as development dependency -->
<PackageReference Include="Microsoft.SourceLink.GitHub" PrivateAssets="All" />
```

### 条件包

```xml
<!-- Only include in Debug builds -->
<ItemGroup Condition="'$(Configuration)' == 'Debug'">
  <PackageReference Include="JetBrains.Annotations" />
</ItemGroup>

<!-- Platform-specific -->
<ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
  <PackageReference Include="System.Text.Json" />
</ItemGroup>
```

### 版本覆盖（应急手段）

当你必须为某个项目覆盖 CPM 时（这种情况很少见）：

```xml
<!-- Project file - use sparingly! -->
<PackageReference Include="Newtonsoft.Json" VersionOverride="12.0.3" />
```

**警告**：Slopwatch 会将此检测为潜在的低质量做法（参见 `dotnet/slopwatch` skill）。

---

## 故障排除

### 版本冲突

```bash
# See full dependency tree
dotnet list package --include-transitive

# Find what's pulling in a specific package
dotnet list package --include-transitive | grep -i "PackageName"
```

### 还原失败

```bash
# Clear all caches
dotnet nuget locals all --clear

# Restore with detailed logging
dotnet restore --verbosity detailed

# Check for locked packages
cat packages.lock.json
```

### 锁定文件

为了实现可重现构建，请使用包锁定文件：

```xml
<!-- Directory.Build.props -->
<PropertyGroup>
  <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
</PropertyGroup>
```

然后提交 `packages.lock.json` 文件。

---

## 反模式

### 不要：直接编辑 XML

```xml
<!-- BAD: Manual XML editing -->
<PackageReference Include="Typo.Package" Version="1.0.0" />
<!-- Package might not exist! CLI would catch this. -->
```

### 不要：在使用 CPM 时内联版本

```xml
<!-- BAD: Bypasses CPM -->
<PackageReference Include="Serilog" Version="4.0.0" />

<!-- GOOD: Version comes from Directory.Packages.props -->
<PackageReference Include="Serilog" />
```

### 不要：混用版本管理方式

```xml
<!-- BAD: Some versions in CPM, some inline -->
<PackageReference Include="Serilog" />  <!-- From CPM -->
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />  <!-- Inline -->
```

### 不要：忘记共享变量

```xml
<!-- BAD: Related packages with different versions -->
<PackageVersion Include="Akka" Version="1.5.59" />
<PackageVersion Include="Akka.Cluster" Version="1.5.58" />  <!-- Mismatch! -->

<!-- GOOD: Use shared variable -->
<PackageVersion Include="Akka" Version="$(AkkaVersion)" />
<PackageVersion Include="Akka.Cluster" Version="$(AkkaVersion)" />
```

---

## 快速参考

| 任务 | 命令 |
|------|---------|
| 添加包 | `dotnet add package <name>` |
| 添加特定版本 | `dotnet add package <name> --version <ver>` |
| 移除包 | `dotnet remove package <name>` |
| 列出包 | `dotnet list package` |
| 显示过时的包 | `dotnet list package --outdated` |
| 显示存在漏洞的包 | `dotnet list package --vulnerable` |
| 还原 | `dotnet restore` |
| 清除缓存 | `dotnet nuget locals all --clear` |

---

## 资源

- **集中式包管理**: https://learn.microsoft.com/en-us/nuget/consume-packages/central-package-management
- **dotnet CLI 参考文档**: https://learn.microsoft.com/en-us/dotnet/core/tools/
- **NuGet.config 参考文档**: https://learn.microsoft.com/en-us/nuget/reference/nuget-config-file