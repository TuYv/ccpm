---
name: "changelog-generator"
description: "Produce consistent, auditable release notes from Conventional Commits. Separates commit parsing, semantic-bump logic, and changelog rendering for automated releases with editorial control. Use when cutting a release, generating CHANGELOG.md from git history, computing the next semantic version from commits, automating release notes in CI, or planning a hotfix/rollback. Examples: 'generate the changelog for v1.4.0', 'what version bump do these commits require', 'we need an emergency hotfix process'."
---
# 变更日志生成器

**级别：** 强大  
**类别：** 工程  
**领域：** 发布管理 / 文档

## 概述

使用此技能可根据 Conventional Commits 生成一致且可审计的发布说明。它将提交解析、语义化版本递增逻辑和变更日志渲染相互分离，使团队能够在不失去编辑控制权的情况下实现发布自动化。

## 核心能力

- 使用 Conventional Commit 规则解析提交消息
- 从提交序列中检测语义化版本递增类型（`major`、`minor`、`patch`）
- 渲染 Keep a Changelog 章节（`Added`、`Changed`、`Fixed` 等）
- 根据 git 范围或提供的提交输入生成发布条目
- 使用专用的检查脚本强制执行提交格式
- 通过机器可读的 JSON 输出支持 CI 集成

## 何时使用

- 发布版本标签之前
- 在 CI 期间自动生成发布说明
- 在 PR 检查期间阻止格式无效的提交消息
- 在需要按作用域筛选软件包变更日志的 monorepo 中
- 将原始 git 历史记录转换为面向用户的说明时

## 关键工作流

### 1. 从 Git 生成变更日志条目

```bash
python3 scripts/generate_changelog.py \
  --from-tag v1.3.0 \
  --to-tag v1.4.0 \
  --next-version v1.4.0 \
  --format markdown
```

### 2. 从 stdin/文件输入生成条目

```bash
git log v1.3.0..v1.4.0 --pretty=format:'%s' | \
  python3 scripts/generate_changelog.py --next-version v1.4.0 --format markdown

python3 scripts/generate_changelog.py --input commits.txt --next-version v1.4.0 --format json
```

### 3. 更新 `CHANGELOG.md`

```bash
python3 scripts/generate_changelog.py \
  --from-tag v1.3.0 \
  --to-tag HEAD \
  --next-version v1.4.0 \
  --write CHANGELOG.md
```

### 4. 根据提交计算下一个版本

当用户尚未决定下一个版本时，应推导版本，而不是猜测：

```bash
git log v1.3.0..HEAD --oneline | \
  python3 scripts/version_bumper.py --current-version 1.3.0 --output-format json
```

输出的 JSON 包含 `recommended_version`、`bump_type`（`major`/`minor`/`patch`/`none`），使用 `--include-commands` 时还会包含确切的 `git tag` 命令。将 `recommended_version` 传入 `generate_changelog.py --next-version`。预发布版本：添加 `--prerelease alpha|beta|rc`。输入必须是真实的 `git log --oneline` 输出（十六进制哈希）；示例位于 `assets/sample_git_log.txt`。

### 5. 合并前检查提交

```bash
python3 scripts/commit_linter.py --from-ref origin/main --to-ref HEAD --strict --format text
```

也可以使用文件/stdin：

```bash
python3 scripts/commit_linter.py --input commits.txt --strict
cat commits.txt | python3 scripts/commit_linter.py --format json
```

## Conventional Commit 规则

支持的类型：

- `feat`、`fix`、`perf`、`refactor`、`docs`、`test`、`build`、`ci`、`chore`
- `security`、`deprecated`、`remove`

破坏性变更：

- `type(scope)!: summary`
- 页脚/正文中包含 `BREAKING CHANGE:`

SemVer 映射：

- 破坏性变更 -> `major`
- 非破坏性的 `feat` -> `minor`
- 其他所有类型 -> `patch`

## 脚本接口

- `python3 scripts/generate_changelog.py --help`
  - 从 git 或 stdin/`--input` 读取提交
  - 输出 markdown 或 JSON
  - 可选择在原文件开头插入变更日志
- `python3 scripts/commit_linter.py --help`
  - 验证提交格式
  - 在 `--strict` 模式下发现违规时返回非零值

## 常见陷阱

1. 将合并提交消息与发布提交解析混为一谈
2. 使用无法转化为发布说明的模糊提交摘要
3. 未针对破坏性变更提供迁移指导
4. 将文档或杂务变更视为面向用户的功能
5. 覆盖历史变更日志章节，而不是在其前面添加新内容

## 最佳实践

1. 保持提交小而精，并以意图为导向。
2. 在多包仓库中为提交消息指定作用域（`feat(api): ...`）。
3. 在 PR 流水线中强制执行代码检查工具的检查。
4. 发布前检查生成的 markdown。
5. 仅在变更日志生成成功后为发布版本打标签。
6. 必要时保留一个 `[Unreleased]` 章节以供手动整理。

## 热修复严重性与 SLA

当发布出现问题时，应先进行分类再采取行动（完整流程请参阅 [references/hotfix-procedures.md](references/hotfix-procedures.md)）：

| 严重性 | 定义 | SLA | 审批 |
|---|---|---|---|
| P0 — 严重 | 服务中断、数据丢失、漏洞遭利用 | ≤ 2 小时内部署修复；紧急部署可绕过常规关卡 | 工程负责人 + 值班经理 |
| P1 — 高 | 主要功能故障，对用户造成重大影响 | ≤ 24 小时内部署修复；加急评审 | 工程负责人 + 产品经理 |
| P2 — 中 | 轻微问题，影响有限 | 下一个发布周期 | 标准 PR 评审 |

热修复分支基于最后一个稳定标签创建，仅包含最小限度的修复，并通过上述工作流获得独立的补丁版本递增变更日志条目。

## 回滚触发条件

在打标签前预先确定以下阈值；任何一项触发时都应回滚：

| 触发条件 | 阈值 |
|---|---|
| 错误率飙升 | 30 分钟内超过基线的 2 倍 |
| 性能下降 | 延迟增加超过 50% |
| 功能故障 | 核心功能损坏 |
| 安全事件 | 漏洞正在遭到利用 |
| 数据损坏 | 数据库完整性受损 |

优先通过功能标志禁用功能，而不是回滚代码；仅对非破坏性迁移执行数据库回滚（首选仅向前迁移）。请参阅 [references/hotfix-procedures.md](references/hotfix-procedures.md)。

## 参考资料

- [references/ci-integration.md](references/ci-integration.md)
- [references/changelog-formatting-guide.md](references/changelog-formatting-guide.md)
- [references/monorepo-strategy.md](references/monorepo-strategy.md)
- [references/hotfix-procedures.md](references/hotfix-procedures.md)
- [README.md](README.md)

## 发布治理

使用以下发布流程来提高可预测性：

1. 检查目标发布范围内的提交历史。
2. 根据提交生成变更日志草稿。
3. 手动调整措辞，使客户更容易理解。
4. 验证 semver 版本递增建议。
5. 仅在变更日志获得批准后为发布版本打标签。

## 输出质量检查

- 每个列表项都对用户有意义，而不是实现层面的干扰信息。
- 破坏性变更包含迁移操作。
- 安全修复单独归入 `Security` 章节。
- 省略没有条目的章节。
- 删除不同章节之间重复的列表项。

## CI 策略

- 对所有 PR 运行 `commit_linter.py --strict`。
- 常规提交格式无效时阻止合并。
- 推送标签时自动生成发布说明草稿。
- 在主分支写入 `CHANGELOG.md` 前必须经过人工批准。

## Monorepo 指南

- 提交作用域应优先与包名保持一致。
- 针对特定包发布时，按作用域筛选提交记录。
- 涉及整个基础设施的变更应记录在根目录的变更日志中。
- 将包的变更日志存放在包根目录附近，以明确归属关系。

## 故障处理

- 如果未找到有效的常规提交：尽早失败，不要生成具有误导性的空发布说明。
- 如果 git 范围无效：在错误输出中明确显示该范围。
- 如果写入目标不存在：创建安全的变更日志标题框架。