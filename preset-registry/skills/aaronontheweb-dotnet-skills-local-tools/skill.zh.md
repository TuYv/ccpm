---
name: dotnet-local-tools
description: Managing local .NET tools with dotnet-tools.json for consistent tooling across development environments and CI/CD pipelines.
invocable: false
---
# .NET 本地工具

## 何时使用此技能

在以下情况下使用此技能：
- 为开发团队配置一致的工具
- 确保 CI/CD 流水线使用与本地开发相同的工具版本
- 管理项目专用的 CLI 工具（docfx、incrementalist、dotnet-ef 等）
- 避免不同项目之间发生全局工具版本冲突

## 什么是本地工具？

本地工具是按存储库安装和指定版本，而不是全局安装的 .NET CLI 工具。它们定义在 `.config/dotnet-tools.json` 中，并使用 `dotnet tool restore` 进行还原。

### 本地工具与全局工具

| 方面 | 全局工具 | 本地工具 |
|--------|--------------|-------------|
| 安装 | `dotnet tool install -g` | `dotnet tool restore` |
| 作用域 | 整台计算机 | 每个存储库 |
| 版本控制 | 手动 | 在 `.config/dotnet-tools.json` 中 |
| CI/CD | 必须安装每个工具 | 单个还原命令 |
| 冲突 | 可能存在版本冲突 | 每个项目相互隔离 |

---

## 配置本地工具

### 初始化清单

```bash
# Create .config/dotnet-tools.json
dotnet new tool-manifest
```

这会创建：
```
.config/
└── dotnet-tools.json
```

### 在本地安装工具

```bash
# Install a tool locally
dotnet tool install docfx

# Install specific version
dotnet tool install docfx --version 2.78.3

# Install from a specific source
dotnet tool install MyTool --add-source https://mycompany.pkgs.visualstudio.com/_packaging/feed/nuget/v3/index.json
```

### 还原工具

```bash
# Restore all tools from manifest
dotnet tool restore
```

---

## dotnet-tools.json 格式

```json
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "docfx": {
      "version": "2.78.3",
      "commands": [
        "docfx"
      ],
      "rollForward": false
    },
    "dotnet-ef": {
      "version": "9.0.0",
      "commands": [
        "dotnet-ef"
      ],
      "rollForward": false
    },
    "incrementalist.cmd": {
      "version": "1.2.0",
      "commands": [
        "incrementalist"
      ],
      "rollForward": false
    },
    "dotnet-reportgenerator-globaltool": {
      "version": "5.4.1",
      "commands": [
        "reportgenerator"
      ],
      "rollForward": false
    }
  }
}
```

### 字段

| 字段 | 描述 |
|-------|-------------|
| `version` | 清单架构版本（始终为 1） |
| `isRoot` | 将此清单标记为根清单（防止搜索父目录） |
| `tools` | 工具配置字典 |
| `tools.<name>.version` | 要安装的确切版本 |
| `tools.<name>.commands` | 工具提供的 CLI 命令 |
| `tools.<name>.rollForward` | 是否允许使用更新版本（为确保可复现性，通常为 false） |

---

## 常用工具

### 文档

```bash
# DocFX - API documentation generator
dotnet tool install docfx
```

```json
"docfx": {
  "version": "2.78.3",
  "commands": ["docfx"],
  "rollForward": false
}
```

**用法：**
```bash
dotnet docfx docfx.json
dotnet docfx serve _site
```

### Entity Framework Core

```bash
# EF Core CLI for migrations
dotnet tool install dotnet-ef
```

```json
"dotnet-ef": {
  "version": "9.0.0",
  "commands": ["dotnet-ef"],
  "rollForward": false
}
```

**用法：**
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 代码覆盖率

```bash
# ReportGenerator for coverage reports
dotnet tool install dotnet-reportgenerator-globaltool
```

```json
"dotnet-reportgenerator-globaltool": {
  "version": "5.4.1",
  "commands": ["reportgenerator"],
  "rollForward": false
}
```

**用法：**
```bash
dotnet reportgenerator -reports:coverage.cobertura.xml -targetdir:coveragereport -reporttypes:Html
```

### 增量构建

```bash
# Incrementalist - build only changed projects
dotnet tool install incrementalist.cmd
```

```json
"incrementalist.cmd": {
  "version": "1.2.0",
  "commands": ["incrementalist"],
  "rollForward": false
}
```

**用法：**
```bash
# Get projects affected by changes since main branch
incrementalist --branch main
```

### 代码格式化

```bash
# CSharpier - opinionated C# formatter
dotnet tool install csharpier
```

```json
"csharpier": {
  "version": "0.30.3",
  "commands": ["dotnet-csharpier"],
  "rollForward": false
}
```

**用法：**
```bash
dotnet csharpier .
dotnet csharpier --check .  # CI mode - fails if changes needed
```

### 代码分析

```bash
# JB dotnet-inspect (requires license)
dotnet tool install jb
```

```json
"jb": {
  "version": "2024.3.4",
  "commands": ["jb"],
  "rollForward": false
}
```

---

## CI/CD 集成

### GitHub Actions

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json

      - name: Restore tools
        run: dotnet tool restore

      - name: Build
        run: dotnet build

      - name: Test with coverage
        run: dotnet test --collect:"XPlat Code Coverage"

      - name: Generate coverage report
        run: dotnet reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coveragereport

      - name: Build documentation
        run: dotnet docfx docs/docfx.json
```

### Azure Pipelines

```yaml
steps:
  - task: UseDotNet@2
    inputs:
      useGlobalJson: true

  - script: dotnet tool restore
    displayName: 'Restore .NET tools'

  - script: dotnet build -c Release
    displayName: 'Build'

  - script: dotnet test -c Release --collect:"XPlat Code Coverage"
    displayName: 'Test'

  - script: dotnet reportgenerator -reports:**/coverage.cobertura.xml -targetdir:$(Build.ArtifactStagingDirectory)/coverage
    displayName: 'Generate coverage report'
```

---

## 管理工具版本

### 更新工具

```bash
# Update to latest version
dotnet tool update docfx

# Update to specific version
dotnet tool update docfx --version 2.79.0
```

### 列出已安装的工具

```bash
# List local tools
dotnet tool list

# List with outdated check
dotnet tool list --outdated
```

### 移除工具

```bash
dotnet tool uninstall docfx
```

---

## 最佳实践

### 1. 始终设置 `isRoot: true`

防止 MSBuild 在父目录中搜索工具清单：

```json
{
  "version": 1,
  "isRoot": true,
  ...
}
```

### 2. 固定精确版本

使用 `"rollForward": false` 以实现可复现构建：

```json
"docfx": {
  "version": "2.78.3",
  "rollForward": false
}
```

### 3. 在 CI 中使用前先还原

使用任何本地工具之前，始终运行 `dotnet tool restore`：

```yaml
- run: dotnet tool restore
- run: dotnet docfx docs/docfx.json
```

### 4. 记录工具要求

在 README 中添加注释或章节：

```markdown
## Development Setup

1. Restore tools: `dotnet tool restore`
2. Build: `dotnet build`
3. Test: `dotnet test`
```

### 5. 使用 Dependabot 进行更新

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "nuget"
    directory: "/"
    schedule:
      interval: "weekly"
    # Includes local tools in .config/dotnet-tools.json
```

---

## 故障排除

### 还原后找不到工具

确保从仓库根目录运行：

```bash
# Wrong - running from subdirectory
cd src/MyApp
dotnet docfx  # Error: tool not found

# Correct - run from solution root
cd ../..
dotnet docfx docs/docfx.json
```

### 版本冲突

如果遇到版本冲突，请检查：
1. 是否存在版本不同的全局工具：`dotnet tool list -g`
2. 是否存在多个工具清单：在父目录中查找 `.config/dotnet-tools.json`

### 清除工具缓存

```bash
# Clear NuGet tool cache
dotnet nuget locals all --clear

# Re-restore tools
dotnet tool restore
```

---

## 示例：完整的开发设置

```json
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "docfx": {
      "version": "2.78.3",
      "commands": ["docfx"],
      "rollForward": false
    },
    "dotnet-ef": {
      "version": "9.0.0",
      "commands": ["dotnet-ef"],
      "rollForward": false
    },
    "dotnet-reportgenerator-globaltool": {
      "version": "5.4.1",
      "commands": ["reportgenerator"],
      "rollForward": false
    },
    "csharpier": {
      "version": "0.30.3",
      "commands": ["dotnet-csharpier"],
      "rollForward": false
    },
    "incrementalist.cmd": {
      "version": "1.2.0",
      "commands": ["incrementalist"],
      "rollForward": false
    }
  }
}
```

**开发工作流：**
```bash
# Initial setup
dotnet tool restore

# Format code before commit
dotnet csharpier .

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"
dotnet reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage

# Build documentation
dotnet docfx docs/docfx.json

# Check which projects changed (for large repos)
incrementalist --branch main
```