---
name: ci-cd-patterns
description: "CI/CD pipeline patterns for GitHub Actions, PR automation, and deployment workflows. Use when setting up CI, fixing broken pipelines, automating PR checks, or configuring deployment."
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---
# CI/CD 模式

关于 GitHub Actions、PR 自动化以及部署工作流的模式。

## 适用场景

- 设置或修复 GitHub Actions 工作流
- 自动化 PR 检查（lint、测试、构建）
- 配置部署流水线
- 监控 PR 状态并重试不稳定的 CI
- 设置多环境部署（dev、staging、prod）

## GitHub Actions --- 常见模式

### 基础 CI 工作流
```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: ./gradlew test
```

### PR 检查工作流
```yaml
name: PR Check
on: pull_request

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./gradlew ktlintCheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./gradlew test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - run: ./gradlew build
```

## PR 看护模式

在 CI 过程中监控 PR，处理常见失败：

1. **检查 CI 状态** --- `gh pr checks <number>`
2. **识别失败类型** --- 不稳定的测试、lint 错误、构建失败
3. **修复并推送** --- 对于 lint/构建错误，在本地修复后推送
4. **重试不稳定的测试** --- 重新运行工作流：`gh run rerun <run-id> --failed`
5. **解决合并冲突** --- rebase 到目标分支上
6. **启用自动合并** --- `gh pr merge <number> --auto --squash`

> 有关可直接使用的 GitHub Actions YAML 模板，参见 `workflows.md`。

## 部署检查清单

部署之前：
- [ ] 所有 CI 检查通过
- [ ] 无合并冲突
- [ ] 数据库迁移已审查（如有）
- [ ] 环境变量已在目标环境中设置
- [ ] 已明确回滚方案

## 注意事项

- **缓存可为每次运行节省数分钟。** 务必缓存依赖（`actions/cache` 或带缓存功能的 `actions/setup-java`）。冷启动的 Gradle 构建需要 3-5 分钟，缓存后只需 30 秒。
- **`needs:` 会创建顺序依赖。** 如果不使用它，所有作业将并行运行。使用 `needs: [lint, test]` 让构建等待检查完成。
- **Secret 名称区分大小写。** `secrets.DB_PASSWORD` 和 `secrets.db_password` 是不同的。要与 Settings > Secrets 中的确切名称保持一致。
- **不要使用 `actions/checkout@v3` --- 请使用 `v4`。** v3 使用的是 Node 16，已被弃用。v4 使用 Node 20。
- **不稳定的测试需要排查，而不只是重试。** 如果针对同一个测试重新运行工作流超过两次，就该修复这个测试了。常见原因：竞态条件、依赖时间的断言、共享的测试状态。
- **在 CI 审查期间强制推送会重置检查套件。** 强制推送前请等待 CI 结束，否则会浪费 runner 分钟数。

## 规则

- 每个 PR 在合并前必须通过 CI
- 不要跳过 CI 检查（`[skip ci]`），除非仅涉及文档改动
- 保持工作流总时长在 10 分钟以内
- 使用 matrix 构建进行多版本测试
- 将 secrets 存储在 GitHub Secrets 中，绝不放在代码里
