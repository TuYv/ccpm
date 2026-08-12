---
name: dotnet-project-structure
description: Modern .NET project structure including .slnx solution format, Directory.Build.props, central package management, SourceLink, version management with RELEASE_NOTES.md, and SDK pinning with global.json.
invocable: false
---
# .NET 项目结构和构建配置

## 何时使用此技能

在以下情况下使用此技能：
- 按照现代最佳实践设置新的 .NET 解决方案
- 在多个项目中配置集中的构建属性
- 实施集中式包版本管理
- 为调试和 NuGet 包设置 SourceLink
- 结合发行说明自动执行版本管理
- 固定 SDK 版本以确保构建一致性

## 相关技能

- **`dotnet-local-tools`** - 使用 dotnet-tools.json 管理本地 .NET 工具
- **`microsoft-extensions-configuration`** - 配置验证模式

---

## 解决方案文件格式（.slnx）

`.slnx` 格式是 .NET 9 中引入的现代 XML 解决方案文件格式。它取代了传统的 `.sln` 格式。

### 相较于传统 .sln 的优势

| 方面 | .sln（旧版） | .slnx（现代） |
|--------|---------------|----------------|
| 格式 | 自定义文本格式 | 标准 XML |
| 可读性 | 包含 GUID 和晦涩的语法 | 简洁且易于阅读 |
| 版本控制 | 难以比较/合并 | 易于比较/合并 |
| 编辑 | 需要 IDE | 可使用任意文本编辑器 |

### 版本要求

| 工具 | 最低版本 |
|------|-----------------|
| .NET SDK | 9.0.200 |
| Visual Studio | 17.13 |
| MSBuild | Visual Studio Build Tools 17.13 |

**注意：** 从 .NET 10 开始，`dotnet new sln` 默认创建 `.slnx` 文件。在 .NET 9 中，必须显式迁移或指定格式。

### .slnx 文件示例

```xml
<Solution>
  <Folder Name="/build/">
    <File Path="Directory.Build.props" />
    <File Path="Directory.Packages.props" />
    <File Path="global.json" />
    <File Path="NuGet.Config" />
    <File Path="README.md" />
  </Folder>
  <Folder Name="/src/">
    <Project Path="src/MyApp/MyApp.csproj" />
    <Project Path="src/MyApp.Core/MyApp.Core.csproj" />
  </Folder>
  <Folder Name="/tests/">
    <Project Path="tests/MyApp.Tests/MyApp.Tests.csproj" />
  </Folder>
</Solution>
```

### 从 .sln 迁移到 .slnx

使用 `dotnet sln migrate` 命令转换现有解决方案：

```bash
# Migrate a specific solution file
dotnet sln MySolution.sln migrate

# Or if only one .sln exists in the directory, just run:
dotnet sln migrate
```

**重要提示：** 不要在同一个仓库中同时保留 `.sln` 和 `.slnx` 文件。这会导致自动检测解决方案时出现问题，并可能引发同步问题。迁移后，请删除旧的 `.sln` 文件。

也可以在 Visual Studio 中进行迁移：
1. 打开解决方案
2. 在解决方案资源管理器中选择解决方案
3. 转到 **文件 > 解决方案另存为...**
4. 将“保存类型”更改为 **XML 解决方案文件 (*.slnx)**

### 创建新的 .slnx 解决方案

```bash
# .NET 10+: Creates .slnx by default
dotnet new sln --name MySolution

# .NET 9: Specify the format explicitly
dotnet new sln --name MySolution --format slnx

# Add projects (works the same for both formats)
dotnet sln add src/MyApp/MyApp.csproj
```

### 建议

**如果使用的是 .NET 9.0.200 或更高版本，请将解决方案迁移到 .slnx。** 这样做的优势非常显著：
- 大幅减少合并冲突（不会再有随机 GUID 发生变化）
- 易于阅读，并可在任意文本编辑器中编辑
- 与现代 `.csproj` 格式保持一致
- 在拉取请求中获得更好的差异比较和审查体验

---

## Directory.Build.props

`Directory.Build.props` 提供集中式生成配置，适用于目录树中的所有项目。请将其放置在解决方案根目录中。

### 完整示例

```xml
<Project>
  <!-- Metadata -->
  <PropertyGroup>
    <Authors>Your Team</Authors>
    <Company>Your Company</Company>
    <!-- Dynamic copyright year - updates automatically -->
    <Copyright>Copyright © 2020-$([System.DateTime]::Now.Year) Your Company</Copyright>
    <Product>Your Product</Product>
    <PackageProjectUrl>https://github.com/yourorg/yourrepo</PackageProjectUrl>
    <RepositoryUrl>https://github.com/yourorg/yourrepo</RepositoryUrl>
    <PackageLicenseExpression>Apache-2.0</PackageLicenseExpression>
    <PackageTags>your;tags;here</PackageTags>
  </PropertyGroup>

  <!-- C# Language Settings -->
  <PropertyGroup>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <NoWarn>$(NoWarn);CS1591</NoWarn> <!-- Missing XML comments -->
  </PropertyGroup>

  <!-- Version Management -->
  <PropertyGroup>
    <VersionPrefix>1.0.0</VersionPrefix>
    <PackageReleaseNotes>See RELEASE_NOTES.md</PackageReleaseNotes>
  </PropertyGroup>

  <!-- Target Framework Definitions (reusable properties) -->
  <PropertyGroup>
    <NetStandardLibVersion>netstandard2.0</NetStandardLibVersion>
    <NetLibVersion>net8.0</NetLibVersion>
    <NetTestVersion>net9.0</NetTestVersion>
  </PropertyGroup>

  <!-- SourceLink Configuration -->
  <PropertyGroup>
    <PublishRepositoryUrl>true</PublishRepositoryUrl>
    <EmbedUntrackedSources>true</EmbedUntrackedSources>
    <IncludeSymbols>true</IncludeSymbols>
    <SymbolPackageFormat>snupkg</SymbolPackageFormat>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.SourceLink.GitHub" PrivateAssets="All" />
  </ItemGroup>

  <!-- NuGet Package Assets -->
  <ItemGroup>
    <None Include="$(MSBuildThisFileDirectory)logo.png" Pack="true" PackagePath="\" />
    <None Include="$(MSBuildThisFileDirectory)README.md" Pack="true" PackagePath="\" />
  </ItemGroup>

  <PropertyGroup>
    <PackageIcon>logo.png</PackageIcon>
    <PackageReadmeFile>README.md</PackageReadmeFile>
  </PropertyGroup>

  <!-- Global Using Statements -->
  <ItemGroup>
    <Using Include="System.Collections.Immutable" />
  </ItemGroup>
</Project>
```

### 关键模式

#### 动态版权年份

```xml
<Copyright>Copyright © 2020-$([System.DateTime]::Now.Year) Your Company</Copyright>
```

使用 MSBuild 属性函数在生成时插入当前年份。无需手动更新。

#### 可复用的目标框架属性

只需定义一次目标框架，即可在各处引用：

```xml
<!-- In Directory.Build.props -->
<PropertyGroup>
  <NetLibVersion>net8.0</NetLibVersion>
  <NetTestVersion>net9.0</NetTestVersion>
</PropertyGroup>

<!-- In MyApp.csproj -->
<PropertyGroup>
  <TargetFramework>$(NetLibVersion)</TargetFramework>
</PropertyGroup>

<!-- In MyApp.Tests.csproj -->
<PropertyGroup>
  <TargetFramework>$(NetTestVersion)</TargetFramework>
</PropertyGroup>
```

#### NuGet 包的 SourceLink

SourceLink 支持对 NuGet 包进行单步调试：

```xml
<PropertyGroup>
  <PublishRepositoryUrl>true</PublishRepositoryUrl>
  <EmbedUntrackedSources>true</EmbedUntrackedSources>
  <IncludeSymbols>true</IncludeSymbols>
  <SymbolPackageFormat>snupkg</SymbolPackageFormat>
</PropertyGroup>

<ItemGroup>
  <!-- Choose the right provider for your source control -->
  <PackageReference Include="Microsoft.SourceLink.GitHub" PrivateAssets="All" />
  <!-- Or: Microsoft.SourceLink.AzureRepos.Git -->
  <!-- Or: Microsoft.SourceLink.GitLab -->
  <!-- Or: Microsoft.SourceLink.Bitbucket.Git -->
</ItemGroup>
```

---

## Directory.Packages.props - 集中式包管理

集中式包管理（CPM）为所有 NuGet 包版本提供单一事实来源。

### 设置

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <!-- Define version variables for related packages -->
  <PropertyGroup>
    <AkkaVersion>1.5.35</AkkaVersion>
    <AspireVersion>9.1.0</AspireVersion>
  </PropertyGroup>

  <!-- Application Dependencies -->
  <ItemGroup Label="App Dependencies">
    <PackageVersion Include="Akka" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Cluster" Version="$(AkkaVersion)" />
    <PackageVersion Include="Akka.Persistence" Version="$(AkkaVersion)" />
    <PackageVersion Include="Microsoft.Extensions.Hosting" Version="9.0.0" />
  </ItemGroup>

  <!-- Build/Tooling Dependencies -->
  <ItemGroup Label="Build Dependencies">
    <PackageVersion Include="Microsoft.SourceLink.GitHub" Version="8.0.0" />
  </ItemGroup>

  <!-- Test Dependencies -->
  <ItemGroup Label="Test Dependencies">
    <PackageVersion Include="xunit" Version="2.9.3" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="3.0.1" />
    <PackageVersion Include="FluentAssertions" Version="7.0.0" />
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageVersion Include="coverlet.collector" Version="6.0.3" />
  </ItemGroup>
</Project>
```

### 使用包（无需指定版本）

```xml
<!-- In MyApp.csproj -->
<ItemGroup>
  <PackageReference Include="Akka" />
  <PackageReference Include="Akka.Cluster" />
  <PackageReference Include="Microsoft.Extensions.Hosting" />
</ItemGroup>

<!-- In MyApp.Tests.csproj -->
<ItemGroup>
  <PackageReference Include="xunit" />
  <PackageReference Include="FluentAssertions" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" />
</ItemGroup>
```

### 优点

1. **单一事实来源** - 所有版本都集中在一个文件中
2. **避免版本偏移** - 所有项目均使用相同版本
3. **易于更新** - 只需修改一次，即可应用于所有位置
4. **包分组** - 为相关包使用版本变量（例如，所有 Akka 包）

---

## global.json - SDK 版本固定

固定 .NET SDK 版本，以确保在所有环境中进行一致的构建。

```json
{
  "sdk": {
    "version": "9.0.200",
    "rollForward": "latestFeature"
  }
}
```

### 前滚策略

| 策略 | 行为 |
|--------|----------|
| `disable` | 要求精确版本 |
| `patch` | 保持相同的 major.minor，使用最新的 patch |
| `feature` | 保持相同的 major，使用最新的 minor.patch |
| `latestFeature` | 保持相同的 major，使用最新的 feature band |
| `minor` | 保持相同的 major，使用最新的 minor |
| `latestMinor` | 保持相同的 major，使用最新的 minor |
| `major` | 使用最新的 SDK（不推荐） |

**推荐：** `latestFeature` - 允许在同一 feature band 内进行 patch 更新。

---

## 使用 RELEASE_NOTES.md 进行版本管理

### 发行说明格式

```markdown
#### 1.2.0 January 15th 2025 ####

- Added new feature X
- Fixed bug in Y
- Improved performance of Z

#### 1.1.0 December 10th 2024 ####

- Initial release with features A, B, C
```

### 解析脚本 (getReleaseNotes.ps1)

```powershell
function Get-ReleaseNotes {
    param (
        [Parameter(Mandatory=$true)]
        [string]$MarkdownFile
    )

    $content = Get-Content -Path $MarkdownFile -Raw
    $sections = $content -split "####"

    $result = [PSCustomObject]@{
        Version      = $null
        Date         = $null
        ReleaseNotes = $null
    }

    if ($sections.Count -ge 3) {
        $header = $sections[1].Trim()
        $releaseNotes = $sections[2].Trim()

        $headerParts = $header -split " ", 2
        if ($headerParts.Count -eq 2) {
            $result.Version = $headerParts[0]
            $result.Date = $headerParts[1]
        }

        $result.ReleaseNotes = $releaseNotes
    }

    return $result
}
```

### 版本递增脚本 (bumpVersion.ps1)

```powershell
function UpdateVersionAndReleaseNotes {
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$ReleaseNotesResult,
        [Parameter(Mandatory=$true)]
        [string]$XmlFilePath
    )

    $xmlContent = New-Object XML
    $xmlContent.Load($XmlFilePath)

    # Update VersionPrefix
    $versionElement = $xmlContent.SelectSingleNode("//VersionPrefix")
    $versionElement.InnerText = $ReleaseNotesResult.Version

    # Update PackageReleaseNotes
    $notesElement = $xmlContent.SelectSingleNode("//PackageReleaseNotes")
    $notesElement.InnerText = $ReleaseNotesResult.ReleaseNotes

    $xmlContent.Save($XmlFilePath)
}
```

### 构建脚本 (build.ps1)

```powershell
# Load helper scripts
. "$PSScriptRoot\scripts\getReleaseNotes.ps1"
. "$PSScriptRoot\scripts\bumpVersion.ps1"

# Parse release notes and update Directory.Build.props
$releaseNotes = Get-ReleaseNotes -MarkdownFile (Join-Path -Path $PSScriptRoot -ChildPath "RELEASE_NOTES.md")
UpdateVersionAndReleaseNotes -ReleaseNotesResult $releaseNotes -XmlFilePath (Join-Path -Path $PSScriptRoot -ChildPath "Directory.Build.props")

Write-Output "Updated to version $($releaseNotes.Version)"
```

### CI/CD 集成

```yaml
# GitHub Actions example
- name: Update version from release notes
  shell: pwsh
  run: ./build.ps1

- name: Build
  run: dotnet build -c Release

- name: Pack with tag version
  run: dotnet pack -c Release /p:PackageVersion=${{ github.ref_name }}

- name: Push to NuGet
  run: dotnet nuget push **/*.nupkg --api-key ${{ secrets.NUGET_API_KEY }} --source https://api.nuget.org/v3/index.json
```

---

## NuGet.Config

配置 NuGet 源和行为：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <solution>
    <add key="disableSourceControlIntegration" value="true" />
  </solution>

  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <!-- Add private feeds if needed -->
    <!-- <add key="MyCompany" value="https://pkgs.dev.azure.com/myorg/_packaging/myfeed/nuget/v3/index.json" /> -->
  </packageSources>
</configuration>
```

**关键设置：**
- `<clear />` - 移除继承的源和默认源，以实现可复现构建
- `disableSourceControlIntegration` - 防止出现 TFS/Git 集成问题

---

## 完整项目结构

```
MySolution/
├── .config/
│   └── dotnet-tools.json           # Local .NET tools
├── .github/
│   └── workflows/
│       ├── pr-validation.yml       # PR checks
│       └── release.yml             # NuGet publishing
├── scripts/
│   ├── getReleaseNotes.ps1         # Parse RELEASE_NOTES.md
│   └── bumpVersion.ps1             # Update Directory.Build.props
├── src/
│   ├── MyApp/
│   │   └── MyApp.csproj
│   └── MyApp.Core/
│       └── MyApp.Core.csproj
├── tests/
│   └── MyApp.Tests/
│       └── MyApp.Tests.csproj
├── Directory.Build.props           # Centralized build config
├── Directory.Packages.props        # Central package versions
├── MySolution.slnx                 # Modern solution file
├── global.json                     # SDK version pinning
├── NuGet.Config                    # Package source config
├── build.ps1                       # Build orchestration
├── RELEASE_NOTES.md                # Version history
├── README.md                       # Project documentation
└── logo.png                        # Package icon
```

---

## 快速参考

| 文件 | 用途 |
|------|---------|
| `MySolution.slnx` | 现代 XML 解决方案文件 |
| `Directory.Build.props` | 集中式构建属性 |
| `Directory.Packages.props` | 集中式包版本管理 |
| `global.json` | SDK 版本锁定 |
| `NuGet.Config` | 包源配置 |
| `RELEASE_NOTES.md` | 版本历史记录（由构建过程解析） |
| `build.ps1` | 构建编排脚本 |
| `.config/dotnet-tools.json` | 本地 .NET 工具 |