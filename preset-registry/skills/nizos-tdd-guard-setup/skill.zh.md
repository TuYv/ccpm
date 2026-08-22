---
description: Set up or update TDD Guard for the current project. Detects the test framework, installs or updates the matching reporter, and configures or migrates its configuration to match the current specification.
disable-model-invocation: true
allowed-tools: [Read, Glob, Grep]
---
# TDD Guard 设置

为当前项目设置 TDD Guard。你的目标是：

1. 确定此项目使用的测试框架
2. 安装匹配的 TDD Guard 报告器；如果已安装，则将其更新
3. 配置报告器，或迁移现有配置以符合当前规范

## 报告器包

| 框架      | 报告器包                                                 | 注册表     |
| --------- | -------------------------------------------------------- | ---------- |
| Vitest    | tdd-guard-vitest                                         | npm        |
| Jest      | tdd-guard-jest                                           | npm        |
| Storybook | tdd-guard-storybook                                      | npm        |
| pytest    | tdd-guard-pytest                                         | PyPI       |
| PHPUnit   | tdd-guard/phpunit                                        | Packagist  |
| Go        | github.com/nizos/tdd-guard/reporters/go/cmd/tdd-guard-go | go install |
| Rust      | tdd-guard-rust                                           | crates.io  |
| RSpec     | tdd-guard-rspec                                          | RubyGems   |
| Minitest  | tdd-guard-minitest                                       | RubyGems   |

## 报告器配置

所有报告器都将测试结果写入相对于项目根目录的 `.claude/tdd-guard/data/test.json`。

**Vitest** — 将报告器条目添加到 `reporters` 数组中，并在选项对象中设置 `projectRoot`。

```typescript
reporters: [
  'default',
  ['tdd-guard-vitest', { projectRoot: '/absolute/path/to/project' }],
]
```

**Jest** — 将报告器条目添加到 `reporters` 数组中，并设置 `projectRoot` 选项。

```typescript
reporters: [
  'default',
  ['tdd-guard-jest', { projectRoot: '/absolute/path/to/project' }],
]
```

**Storybook** — 在 `.storybook/test-runner.ts` 中构造 `StorybookReporter`，并将其接入 `postVisit` 钩子。

```typescript
// .storybook/test-runner.ts
import { StorybookReporter } from 'tdd-guard-storybook'

const reporter = new StorybookReporter({
  projectRoot: '/absolute/path/to/project',
})

module.exports = {
  async postVisit(page, context) {
    await reporter.onStoryResult(context)
  },
}

process.on('exit', () => {
  reporter.onComplete()
})
```

**pytest** — 在 pytest 配置（`pyproject.toml`、`pytest.ini` 或 `setup.cfg`）中设置 `tdd_guard_project_root`。

```toml
[tool.pytest.ini_options]
tdd_guard_project_root = "/absolute/path/to/project"
```

**PHPUnit** — 将扩展（PHPUnit 10+）或监听器（PHPUnit 9.x）添加到 `phpunit.xml` 中，并设置项目根目录路径。

```xml
<!-- PHPUnit 10+ -->
<extensions>
    <bootstrap class="TddGuard\PHPUnit\TddGuardExtension">
        <parameter name="projectRoot" value="/absolute/path/to/project"/>
    </bootstrap>
</extensions>

<!-- PHPUnit 9.x -->
<listeners>
    <listener class="TddGuard\PHPUnit\TddGuardListener">
        <arguments>
            <string>/absolute/path/to/project</string>
        </arguments>
    </listener>
</listeners>
```

**Go** — 使用下面的管道命令添加测试目标。如果已有 Makefile、Taskfile 或类似的构建系统，请更新现有文件。

```bash
go test -json ./... 2>&1 | tdd-guard-go -project-root /absolute/path/to/project
```

**Rust** — 使用下面的管道命令添加测试目标。如果已有 Makefile、Taskfile 或类似的构建系统，请更新现有文件。

```bash
cargo nextest run 2>&1 | tdd-guard-rust --project-root /absolute/path/to/project --passthrough
```

**RSpec** — 将格式化器添加到 `.rspec`，并将 `TDD_GUARD_PROJECT_ROOT` 环境变量设置为项目根目录的绝对路径。

```
--format TddGuardRspec::Formatter
```

```bash
export TDD_GUARD_PROJECT_ROOT="/absolute/path/to/project"
```

**Minitest** — 在 `test/test_helper.rb` 中引入 `tdd_guard_minitest/autorun`（或通过 `Rake::TestTask` 的 ruby_opts 传递 `-rtdd_guard_minitest/autorun`），并将 `TDD_GUARD_PROJECT_ROOT` 设置为项目根目录的绝对路径。

```ruby
# test/test_helper.rb
require "tdd_guard_minitest/autorun"
```

```bash
export TDD_GUARD_PROJECT_ROOT="/absolute/path/to/project"
```

## 指南

你的工作范围仅限于安装、更新、配置和迁移 TDD Guard 报告器。不要进行超出此范围的更改。

- 配置报告器中的项目根目录时，**始终使用绝对路径**。
- **不要安装、更新或修改测试框架**、构建工具或任何其他项目依赖项。只能安装或更新 TDD Guard 报告器本身。
- 除 TDD Guard 报告器条目外，**不要修改现有测试配置**。将任何偏离当前规范的报告器配置迁移为符合当前规范的配置，同时保留用户的项目根目录值，并保持无关条目不变。如果无法在不进行猜测的情况下迁移现有配置——例如，它被包装在用户定义的代码中，或与自定义逻辑混杂在一起——请告知用户并让他们决定。
- **如果 TDD Guard 报告器已安装，且其配置符合此技能的规范**，请告知用户所有内容均为最新状态，然后停止。
- **如果检测到多个框架**，请询问用户要配置哪一个。
- **如果出现问题或有不明确之处**，请告知用户，而不是尝试修复。不要安装额外的软件包，也不要进行额外更改来解决问题。

## 设置完成后

完成后，请告知用户所执行的操作，并说明：

- TDD Guard 会依据 TDD 原则验证更改
- 他们可以输入 `tdd-guard off` / `tdd-guard on` 在会话过程中切换其启用状态
- 他们可以通过编辑 `.claude/tdd-guard/data/instructions.md` 自定义验证规则
- 可在 https://github.com/nizos/tdd-guard 获取更多帮助和配置选项