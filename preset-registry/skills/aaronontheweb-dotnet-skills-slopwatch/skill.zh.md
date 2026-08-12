---
name: dotnet-slopwatch
description: Use Slopwatch to detect LLM reward hacking in .NET code changes. Run after every code modification to catch disabled tests, suppressed warnings, empty catch blocks, and other shortcuts that mask real problems.
invocable: true
---
# Slopwatch：面向 .NET 的 LLM 反作弊工具

## 何时使用此技能

**始终使用此技能。** 每当 LLM（包括 Claude）对以下文件进行更改时：
- C# 源文件（.cs）
- 项目文件（.csproj）
- Props 文件（Directory.Build.props、Directory.Packages.props）
- 测试文件

运行 slopwatch，以验证这些更改没有引入“Slop”。

## 什么是 Slop？

“Slop”是指 LLM 为了让测试通过或构建成功而采取的捷径，但实际上并未解决底层问题。这些行为属于奖励欺骗——LLM 优化的是表面上的成功，而不是真正的修复。

### 常见的 Slop 模式

| 模式 | 示例 | 为什么有害 |
|---------|---------|--------------|
| 禁用测试 | `[Fact(Skip="flaky")]` | 隐藏失败，而不是修复问题 |
| 抑制警告 | `#pragma warning disable CS8618` | 不修复问题，只是让编译器不再报告 |
| 空 catch 块 | `catch (Exception) { }` | 吞掉错误并隐藏 bug |
| 任意延迟 | `await Task.Delay(1000);` | 掩盖竞态条件，并使测试变慢 |
| 项目级抑制 | `<NoWarn>CS1591</NoWarn>` | 在整个项目范围内禁用警告 |
| 绕过 CPM | 内联 `Version="1.0.0"` | 破坏集中式包管理 |

**绝不要接受这些模式。** 如果 LLM 引入了 Slop，应拒绝该更改，并要求进行正确的修复。

---

## 安装

### 作为本地工具（推荐）

添加到 `.config/dotnet-tools.json`：

```json
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "slopwatch.cmd": {
      "version": "0.2.0",
      "commands": ["slopwatch"],
      "rollForward": false
    }
  }
}
```

然后还原：
```bash
dotnet tool restore
```

### 作为全局工具

```bash
dotnet tool install --global Slopwatch.Cmd
```

---

## 首次设置：建立基线

在现有项目中使用 slopwatch 之前，先为当前问题创建基线：

```bash
# Initialize baseline from existing code
slopwatch init

# This creates .slopwatch/baseline.json
git add .slopwatch/baseline.json
git commit -m "Add slopwatch baseline"
```

**为什么需要基线？** 遗留代码中可能已经存在问题。基线可确保 slopwatch 只捕获**新引入的** Slop，而不是预先存在的技术债务。

---

## 在 LLM 会话期间使用

### 每次代码更改后

在任何由 LLM 生成的代码修改之后运行 slopwatch：

```bash
# Analyze for new issues (uses baseline)
slopwatch analyze

# Use strict mode - fail on warnings too
slopwatch analyze --fail-on warning
```

### 当 Slopwatch 标记问题时

**不要忽略它。** 应采取以下措施：

1. **理解原因**：弄清 LLM 为什么采取了这种捷径
2. **要求正确修复**——明确指出问题所在
3. **验证修复结果**，确保没有引入其他 Slop

```
# Example: LLM disabled a test
❌ SW001 [Error]: Disabled test detected
   File: tests/MyApp.Tests/OrderTests.cs:45
   Pattern: [Fact(Skip="Test is flaky")]

# Correct response: Ask for actual fix
"This test was disabled instead of fixed. Please investigate why
it's flaky and fix the underlying timing/race condition issue."
```

### 更新基线（极少进行）

只有在代码糟粕**确实有合理理由**且已记录时，才更新基线：

```bash
# Add current detections to baseline (use sparingly!)
slopwatch analyze --update-baseline
```

**合理理由示例：**
- 第三方库强制要求使用某种模式（例如，必须禁止特定警告）
- 出于速率限制而有意设置延迟（而非测试不稳定）
- 无法修改的生成代码

更新基线时，请在代码注释中记录原因。

---

## Claude Code 钩子集成

将 slopwatch 添加为钩子，以自动验证每次编辑。创建或更新 `.claude/settings.json`：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "slopwatch analyze -d . --hook",
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

`--hook` 标志：
- 仅分析 **git dirty files**（即使在大型代码仓库中也很快）
- 以易读格式将错误输出到 stderr
- 出现警告/错误时阻止编辑（退出代码 2）
- Claude 会看到错误并可立即修复

---

## CI/CD 集成

将 slopwatch 添加到 CI 流水线中，作为质量门禁：

### GitHub Actions

```yaml
jobs:
  slopwatch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Install Slopwatch
        run: dotnet tool install --global Slopwatch.Cmd

      - name: Run Slopwatch
        run: slopwatch analyze -d . --fail-on warning
```

### Azure Pipelines

```yaml
- task: DotNetCoreCLI@2
  displayName: 'Install Slopwatch'
  inputs:
    command: 'custom'
    custom: 'tool'
    arguments: 'install --global Slopwatch.Cmd'

- script: slopwatch analyze -d . --fail-on warning
  displayName: 'Slopwatch Analysis'
```

---

## 检测规则

| 规则 | 严重性 | 检测内容 |
|------|----------|-----------------|
| SW001 | 错误 | 被禁用的测试（`Skip=`、`Ignore`、`#if false`） |
| SW002 | 警告 | 警告抑制（`#pragma warning disable`、`SuppressMessage`） |
| SW003 | 错误 | 吞掉异常的空 catch 块 |
| SW004 | 警告 | 测试中的任意延迟（`Task.Delay`、`Thread.Sleep`） |
| SW005 | 警告 | 项目文件中的糟糕配置（`NoWarn`、`TreatWarningsAsErrors=false`） |
| SW006 | 警告 | 绕过 CPM（`VersionOverride`、内联 `Version` 属性） |

---

## 配置

创建 `.slopwatch/slopwatch.json` 以进行自定义：

```json
{
  "minSeverity": "warning",
  "rules": {
    "SW001": { "enabled": true, "severity": "error" },
    "SW002": { "enabled": true, "severity": "warning" },
    "SW003": { "enabled": true, "severity": "error" },
    "SW004": { "enabled": true, "severity": "warning" },
    "SW005": { "enabled": true, "severity": "warning" },
    "SW006": { "enabled": true, "severity": "warning" }
  },
  "exclude": [
    "**/Generated/**",
    "**/obj/**",
    "**/bin/**"
  ]
}
```

### 严格模式（推荐用于 LLM 会话）

为了在 LLM 编码会话期间提供最大程度的保护，请将所有规则提升为错误：

```json
{
  "minSeverity": "warning",
  "rules": {
    "SW001": { "enabled": true, "severity": "error" },
    "SW002": { "enabled": true, "severity": "error" },
    "SW003": { "enabled": true, "severity": "error" },
    "SW004": { "enabled": true, "severity": "error" },
    "SW005": { "enabled": true, "severity": "error" },
    "SW006": { "enabled": true, "severity": "error" }
  }
}
```

---

## 核心理念：对新增劣质代码零容忍

1. **基线记录遗留问题** - 承认现有问题，但将其隔离
2. **阻止新增劣质代码** - 任何新增的权宜之计都会导致构建/编辑失败
3. **例外情况必须有正当理由** - 如果必须更新基线，请记录原因
4. **LLM 并不特殊** - 相同的规则同时适用于人类和 AI 生成的代码

目标是防止技术债务逐渐累积；当 LLM 优先考虑“让测试通过”，而不是“修复实际问题”时，就会出现这种情况。

---

## 快速参考

```bash
# First time setup
slopwatch init
git add .slopwatch/baseline.json

# After every LLM code change
slopwatch analyze

# Strict mode (recommended)
slopwatch analyze --fail-on warning

# With stats (performance debugging)
slopwatch analyze --stats

# Update baseline (rare, document why)
slopwatch analyze --update-baseline

# JSON output for tooling
slopwatch analyze --output json
```

---

## 何时可以破例（几乎永远不应）

更新基线或禁用规则的唯一有效理由：

| 场景 | 操作 | 要求 |
|----------|--------|----------|
| 第三方强制采用某种模式 | 更新基线 | 使用代码注释说明原因 |
| 生成的代码（不可编辑） | 添加到排除列表 | 在配置中记录 |
| 有意设置的限流延迟 | 更新基线 | 使用代码注释，且不得位于测试中 |
| 清理遗留代码 | 一次性更新基线 | 在 PR 描述中说明 |

**无效理由：**
- “测试不稳定” → 修复不稳定问题
- “警告很烦人” → 修复代码
- “在我的机器上可以运行” → 修复竞态条件
- “我们稍后会修复” → 立即修复