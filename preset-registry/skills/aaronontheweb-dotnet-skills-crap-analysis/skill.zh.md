---
name: crap-analysis
description: Analyze code coverage and CRAP (Change Risk Anti-Patterns) scores to identify high-risk code. Use OpenCover format with ReportGenerator for Risk Hotspots showing cyclomatic complexity and untested code paths.
invocable: true
---
# CRAP 评分分析

## 何时使用此技能

在以下情况使用此技能：
- 在进行更改之前评估代码质量和测试覆盖率
- 识别需要重构或测试的高风险代码
- 为 .NET 项目设置覆盖率收集
- 根据风险确定代码测试的优先级
- 为 CI/CD 流水线设定覆盖率阈值

---

## 什么是 CRAP？

**CRAP 评分 = 复杂度 x (1 - 覆盖率)^2**

CRAP（变更风险反模式）评分结合了圈复杂度与测试覆盖率，用于识别高风险代码。

| CRAP 评分 | 风险等级 | 所需操作 |
|------------|------------|-----------------|
| **< 5** | 低 | 测试充分、易于维护的代码 |
| **5-30** | 中 | 可以接受，但需关注复杂度 |
| **> 30** | 高 | 需要测试或重构 |

### CRAP 为何重要

- **高复杂度 + 低覆盖率 = 危险**：难以理解且未经测试的代码，修改风险很高
- **仅看复杂度并不够**：覆盖率为 100% 的复杂方法，比覆盖率为 0% 的简单方法更安全
- **集中投入精力**：优先测试复杂代码，而不是简单的 getter/setter

### CRAP 评分示例

| 方法 | 复杂度 | 覆盖率 | 计算 | CRAP |
|--------|------------|----------|-------------|------|
| `GetUserId()` | 1 | 0% | 1 x (1 - 0)^2 | **1** |
| `ParseToken()` | 54 | 52% | 54 x (1 - 0.52)^2 | **12.4** |
| `ValidateForm()` | 20 | 0% | 20 x (1 - 0)^2 | **20** |
| `ProcessOrder()` | 45 | 20% | 45 x (1 - 0.20)^2 | **28.8** |
| `ImportData()` | 80 | 10% | 80 x (1 - 0.10)^2 | **64.8** |

---

## 覆盖率收集设置

### coverage.runsettings

在仓库根目录中创建一个 `coverage.runsettings` 文件。CRAP 评分计算**必须使用 OpenCover 格式**，因为该格式包含圈复杂度指标。

```xml
<?xml version="1.0" encoding="utf-8" ?>
<RunSettings>
  <DataCollectionRunSettings>
    <DataCollectors>
      <DataCollector friendlyName="XPlat code coverage">
        <Configuration>
          <!-- OpenCover format includes cyclomatic complexity for CRAP scores -->
          <Format>cobertura,opencover</Format>

          <!-- Exclude test and benchmark assemblies -->
          <Exclude>[*.Tests]*,[*.Benchmark]*,[*.Migrations]*</Exclude>

          <!-- Exclude generated code, obsolete members, and explicit exclusions -->
          <ExcludeByAttribute>Obsolete,GeneratedCodeAttribute,CompilerGeneratedAttribute,ExcludeFromCodeCoverageAttribute</ExcludeByAttribute>

          <!-- Exclude source-generated files, Blazor generated code, and migrations -->
          <ExcludeByFile>**/obj/**/*,**/*.g.cs,**/*.designer.cs,**/*.razor.g.cs,**/*.razor.css.g.cs,**/Migrations/**/*</ExcludeByFile>

          <!-- Exclude test projects -->
          <IncludeTestAssembly>false</IncludeTestAssembly>

          <!-- Optimization flags -->
          <SingleHit>false</SingleHit>
          <UseSourceLink>true</UseSourceLink>
          <SkipAutoProps>true</SkipAutoProps>
        </Configuration>
      </DataCollector>
    </DataCollectors>
  </DataCollectionRunSettings>
</RunSettings>
```

### 关键配置选项

| 选项 | 用途 |
|--------|---------|
| `Format` | 必须包含 `opencover`，以提供复杂度指标 |
| `Exclude` | 按模式排除测试/基准测试程序集 |
| `ExcludeByAttribute` | 跳过生成的、已过时的以及显式排除的代码（包括 `ExcludeFromCodeCoverageAttribute`） |
| `ExcludeByFile` | 跳过源代码生成的文件、Blazor 组件和迁移文件 |
| `SkipAutoProps` | 不将自动属性计为分支 |

---

## 安装 ReportGenerator

将 ReportGenerator 安装为本地工具，用于生成包含风险热点的 HTML 报告。

### 添加到 .config/dotnet-tools.json

```json
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "dotnet-reportgenerator-globaltool": {
      "version": "5.4.5",
      "commands": ["reportgenerator"],
      "rollForward": false
    }
  }
}
```

然后还原：

```bash
dotnet tool restore
```

### 或进行全局安装

```bash
dotnet tool install --global dotnet-reportgenerator-globaltool
```

---

## 收集覆盖率

### 运行测试并收集覆盖率

```bash
# Clean previous results
rm -rf coverage/ TestResults/

# Run unit tests with coverage
dotnet test tests/MyApp.Tests.Unit \
  --settings coverage.runsettings \
  --collect:"XPlat Code Coverage" \
  --results-directory ./TestResults

# Run integration tests (optional, adds to coverage)
dotnet test tests/MyApp.Tests.Integration \
  --settings coverage.runsettings \
  --collect:"XPlat Code Coverage" \
  --results-directory ./TestResults
```

### 生成 HTML 报告

```bash
dotnet reportgenerator \
  -reports:"TestResults/**/coverage.opencover.xml" \
  -targetdir:"coverage" \
  -reporttypes:"Html;TextSummary;MarkdownSummaryGithub"
```

### 报告类型

| 类型 | 说明 | 输出 |
|------|-------------|--------|
| `Html` | 完整的交互式报告 | `coverage/index.html` |
| `TextSummary` | 纯文本摘要 | `coverage/Summary.txt` |
| `MarkdownSummaryGithub` | 与 GitHub 兼容的 Markdown | `coverage/SummaryGithub.md` |
| `Badges` | 用于 README 的 SVG 徽章 | `coverage/badge_*.svg` |
| `Cobertura` | 合并后的 Cobertura XML | `coverage/Cobertura.xml` |

---

## 阅读报告

### 风险热点部分

HTML 报告中包含一个 **风险热点** 部分，其中的方法按复杂度排序：

- **圈复杂度**：代码中独立路径的数量（if/else、switch 分支、循环）
- **NPath 复杂度**：非循环执行路径的数量（随嵌套层级呈指数增长）
- **Crap 分数**：根据复杂度和覆盖率计算得出

### 解读结果

```
Risk Hotspots
─────────────
Method                          Complexity  Coverage  Crap Score
──────────────────────────────────────────────────────────────────
DataImporter.ParseRecord()      54          52%       12.4
AuthService.ValidateToken()     32          0%        32.0   ← HIGH RISK
OrderProcessor.Calculate()      28          85%       1.3
UserService.CreateUser()        15          100%      0.0
```

**行动项：**
- `ValidateToken()` 的 CRAP > 30，且覆盖率为 0%——**立即进行测试或重构**
- `ParseRecord()` 较为复杂，但覆盖率尚可——可接受
- `CreateUser()` 和 `Calculate()` 都经过了充分测试——可以安全修改

---

## 覆盖率阈值

### 推荐标准

| 覆盖率类型 | 目标 | 说明 |
|---------------|--------|--------|
| 行覆盖率 | > 80% | 适用于大多数项目 |
| 分支覆盖率 | > 60% | 可发现条件逻辑问题 |
| CRAP 分数 | < 30 | 新代码的上限 |

### 配置阈值

在仓库中创建 `coverage.props`：

```xml
<Project>
  <PropertyGroup>
    <!-- Coverage thresholds for CI enforcement -->
    <CoverageThresholdLine>80</CoverageThresholdLine>
    <CoverageThresholdBranch>60</CoverageThresholdBranch>
  </PropertyGroup>
</Project>
```

---

## CI/CD 集成

### GitHub Actions

```yaml
name: Coverage

on:
  pull_request:
    branches: [main, dev]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Restore tools
        run: dotnet tool restore

      - name: Run tests with coverage
        run: |
          dotnet test \
            --settings coverage.runsettings \
            --collect:"XPlat Code Coverage" \
            --results-directory ./TestResults

      - name: Generate report
        run: |
          dotnet reportgenerator \
            -reports:"TestResults/**/coverage.opencover.xml" \
            -targetdir:"coverage" \
            -reporttypes:"Html;MarkdownSummaryGithub;Cobertura"

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      - name: Add coverage to PR
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          path: coverage/SummaryGithub.md
```

### Azure Pipelines

```yaml
- task: DotNetCoreCLI@2
  displayName: 'Run tests with coverage'
  inputs:
    command: 'test'
    arguments: '--settings coverage.runsettings --collect:"XPlat Code Coverage" --results-directory $(Build.SourcesDirectory)/TestResults'

- task: DotNetCoreCLI@2
  displayName: 'Generate coverage report'
  inputs:
    command: 'custom'
    custom: 'reportgenerator'
    arguments: '-reports:"$(Build.SourcesDirectory)/TestResults/**/coverage.opencover.xml" -targetdir:"$(Build.SourcesDirectory)/coverage" -reporttypes:"HtmlInline_AzurePipelines;Cobertura"'

- task: PublishCodeCoverageResults@2
  displayName: 'Publish coverage'
  inputs:
    codeCoverageTool: 'Cobertura'
    summaryFileLocation: '$(Build.SourcesDirectory)/coverage/Cobertura.xml'
```

---

## 快速参考

### 单行命令

```bash
# Full analysis workflow
rm -rf coverage/ TestResults/ && \
dotnet test --settings coverage.runsettings \
  --collect:"XPlat Code Coverage" \
  --results-directory ./TestResults && \
dotnet reportgenerator \
  -reports:"TestResults/**/coverage.opencover.xml" \
  -targetdir:"coverage" \
  -reporttypes:"Html;TextSummary"

# View summary
cat coverage/Summary.txt

# Open HTML report (Linux)
xdg-open coverage/index.html

# Open HTML report (macOS)
open coverage/index.html

# Open HTML report (Windows)
start coverage/index.html
```

### 项目标准

| 指标 | 新代码 | 遗留代码 |
|--------|----------|-------------|
| 行覆盖率 | 80%+ | 60%+（逐步提高） |
| 分支覆盖率 | 60%+ | 40%+（逐步提高） |
| 最大 CRAP 值 | 30 | 记录例外情况 |
| 高风险方法 | 必须有测试 | 修改前添加测试 |

---

## 排除的内容

推荐的 `coverage.runsettings` 会排除：

| 模式 | 原因 |
|---------|--------|
| `[*.Tests]*` | 测试程序集不是生产代码 |
| `[*.Benchmark]*` | 基准测试项目 |
| `[*.Migrations]*` | 数据库迁移（生成的代码） |
| `GeneratedCodeAttribute` | 源代码生成器 |
| `CompilerGeneratedAttribute` | 编译器生成的代码 |
| `ExcludeFromCodeCoverageAttribute` | 开发者明确选择排除 |
| `*.g.cs`, `*.designer.cs` | 生成的文件 |
| `*.razor.g.cs` | Blazor 组件生成的代码 |
| `*.razor.css.g.cs` | Blazor CSS 隔离生成的代码 |
| `**/Migrations/**/*` | EF Core 迁移（自动生成） |
| `SkipAutoProps` | 自动属性（简单分支） |

---

## 何时更新阈值

**以下情况可暂时降低阈值：**
- 正在进行现代化改造的遗留代码库（在 README 中记录）
- 无法修改的生成代码
- 第三方包装器代码

**以下情况绝不能降低阈值：**
- “测试太难了”——应改为重构
- “我们稍后会添加测试”——现在就添加
- 新功能——应从一开始就达到标准

---

## 其他资源

- **Coverlet 文档**：https://github.com/coverlet-coverage/coverlet
- **ReportGenerator**：https://github.com/danielpalme/ReportGenerator
- **CRAP 评分原始论文**：http://www.artima.com/weblogs/viewpost.jsp?thread=215899