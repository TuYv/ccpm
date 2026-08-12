---
name: playwright-ci-caching
description: Cache Playwright browser binaries in CI/CD pipelines (GitHub Actions, Azure DevOps) to avoid 1-2 minute download overhead on every build.
invocable: false
---
# 在 CI/CD 中缓存 Playwright 浏览器

## 何时使用此 Skill

以下情况适合使用此 Skill：
- 为包含 Playwright E2E 测试的项目设置 CI/CD
- 浏览器下载（约 400MB，耗时 1-2 分钟）导致构建时间较长
- 希望在 Playwright 版本变更时自动使缓存失效
- 使用 GitHub Actions 或 Azure DevOps 流水线

## 问题

默认情况下，每次运行 CI 时都必须下载 Playwright 浏览器（约 400MB）。这会：
- 为每次构建增加 1-2 分钟
- 浪费带宽
- 可能因临时网络问题而失败
- 减慢 PR 反馈循环

## 核心模式

1. **提取 Playwright 版本**：从 `Directory.Packages.props`（CPM）中提取版本，用作缓存键
2. **缓存浏览器二进制文件**：使用适合相应平台的路径
3. **条件安装**：仅在缓存未命中时下载
4. **自动使缓存失效**：缓存键包含版本，因此升级软件包时会使缓存失效

## 各操作系统的缓存路径

| 操作系统 | 路径 |
|----|------|
| Linux | `~/.cache/ms-playwright` |
| macOS | `~/Library/Caches/ms-playwright` |
| Windows | `%USERPROFILE%\AppData\Local\ms-playwright` |

## GitHub Actions

```yaml
- name: Get Playwright Version
  shell: pwsh
  run: |
    $propsPath = "Directory.Packages.props"
    [xml]$props = Get-Content $propsPath
    $version = $props.Project.ItemGroup.PackageVersion |
      Where-Object { $_.Include -eq "Microsoft.Playwright" } |
      Select-Object -ExpandProperty Version
    echo "PlaywrightVersion=$version" >> $env:GITHUB_ENV

- name: Cache Playwright Browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ env.PlaywrightVersion }}

- name: Install Playwright Browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  shell: pwsh
  run: ./build/playwright.ps1 install --with-deps
```

### 多操作系统 GitHub Actions

对于在多个操作系统上运行的工作流：

```yaml
- name: Cache Playwright Browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/ms-playwright
      ~/Library/Caches/ms-playwright
      ~/AppData/Local/ms-playwright
    key: ${{ runner.os }}-playwright-${{ env.PlaywrightVersion }}
```

## Azure DevOps

```yaml
- task: PowerShell@2
  displayName: 'Get Playwright Version'
  inputs:
    targetType: 'inline'
    script: |
      [xml]$props = Get-Content "Directory.Packages.props"
      $version = $props.Project.ItemGroup.PackageVersion |
        Where-Object { $_.Include -eq "Microsoft.Playwright" } |
        Select-Object -ExpandProperty Version
      Write-Host "##vso[task.setvariable variable=PlaywrightVersion]$version"

- task: Cache@2
  displayName: 'Cache Playwright Browsers'
  inputs:
    key: 'playwright | "$(Agent.OS)" | $(PlaywrightVersion)'
    path: '$(HOME)/.cache/ms-playwright'
    cacheHitVar: 'PlaywrightCacheHit'

- task: PowerShell@2
  displayName: 'Install Playwright Browsers'
  condition: ne(variables['PlaywrightCacheHit'], 'true')
  inputs:
    filePath: 'build/playwright.ps1'
    arguments: 'install --with-deps'
```

## 辅助脚本：playwright.ps1

创建一个 `build/playwright.ps1` 脚本，用于发现并运行 Playwright CLI。该脚本对 Playwright CLI 的位置进行抽象，因为其位置会因项目结构而异。

```powershell
# build/playwright.ps1
# Discovers Microsoft.Playwright.dll and runs the bundled Playwright CLI

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

# Find the Playwright DLL (after dotnet build/restore)
$playwrightDll = Get-ChildItem -Path . -Recurse -Filter "Microsoft.Playwright.dll" -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $playwrightDll) {
    Write-Error "Microsoft.Playwright.dll not found. Run 'dotnet build' first."
    exit 1
}

$playwrightDir = $playwrightDll.DirectoryName

# Find the playwright CLI (path varies by OS and node version)
$playwrightCmd = Get-ChildItem -Path "$playwrightDir/.playwright/node" -Recurse -Filter "playwright.cmd" -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $playwrightCmd) {
    # Try Unix executable
    $playwrightCmd = Get-ChildItem -Path "$playwrightDir/.playwright/node" -Recurse -Filter "playwright" -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -eq "playwright" } |
        Select-Object -First 1
}

if (-not $playwrightCmd) {
    Write-Error "Playwright CLI not found in $playwrightDir/.playwright/node"
    exit 1
}

Write-Host "Using Playwright CLI: $($playwrightCmd.FullName)"
& $playwrightCmd.FullName @Arguments
```

用法：
```bash
# Install browsers
./build/playwright.ps1 install --with-deps

# Install specific browser
./build/playwright.ps1 install chromium

# Show installed browsers
./build/playwright.ps1 install --dry-run
```

## 前置条件

此模式假定：

1. 使用 **Central Package Management (CPM)**，并包含 `Directory.Packages.props`：
   ```xml
   <Project>
     <ItemGroup>
       <PackageVersion Include="Microsoft.Playwright" Version="1.40.0" />
     </ItemGroup>
   </Project>
   ```

2. 在运行 `playwright.ps1` 之前，**项目已完成构建**（因此 DLL 文件已存在）

3. CI 代理上**可以使用 PowerShell**（GitHub Actions 和 Azure DevOps 已预安装）

## 为什么基于版本的缓存键很重要

在缓存键中使用 Playwright 版本可确保：

- 升级 Playwright 时**自动使缓存失效**
- **不会存在与 SDK 版本不匹配的陈旧浏览器二进制文件**
- 版本升级后**无需手动清除缓存**

如果硬编码缓存键（例如 `playwright-browsers-v1`），则每次升级 Playwright 时都需要手动更新它，否则将会遇到含义不明的版本不匹配错误。

## 故障排除

### 未使用缓存

1. 验证版本提取步骤是否输出了正确的版本
2. 检查缓存路径是否与你的操作系统匹配
3. 确保 `Directory.Packages.props` 存在并包含 Playwright 包

### 缓存命中后出现“找不到浏览器”

缓存的浏览器与 Playwright SDK 版本不匹配。这种情况会在以下情形发生：
- 缓存键不包含版本
- 版本提取静默失败

修复：确保缓存键中包含 Playwright 版本。

### playwright.ps1 找不到 DLL

在运行脚本之前，先运行 `dotnet build` 或 `dotnet restore`。Playwright DLL 仅在 NuGet 还原后才会存在。

## 参考资料

此模式已在生产项目中经过充分验证：
- [petabridge/geekedin](https://github.com/petabridge/geekedin)
- [petabridge/DrawTogether.NET](https://github.com/petabridge/DrawTogether.NET)

## 相关技能

- `dotnet-skills:playwright-blazor` - 为 Blazor 应用程序编写 Playwright 测试
- `dotnet-skills:project-structure` - Central Package Management 设置