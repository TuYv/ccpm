---
name: accesslint-diff
description: "Diff a live page's accessibility violations against a baseline — by default compares uncommitted changes (stash-based), or pass --branch [<name>] to diff against a branch. Reports only new violations introduced, violations fixed, and pre-existing count. Use `scan` for a full audit with no diffing."
risk: safe
source: "https://github.com/AccessLint/skills"
date_added: "2026-06-02"
---
默认分支：!`git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null | sed 's|.*/||' || echo main`

只报告发生了变化的内容。只定位问题，不做修复。如果 `$ARGUMENTS` 中没有 URL，请向用户索要。

解析 `$ARGUMENTS`：若出现 `--branch <name>` 则将其剥离 → 进入分支模式。若 `--branch` 没有值，则使用上方的默认分支。其余部分即 URL。

## 何时使用
- 当任务符合以下描述时使用本技能：将线上页面的无障碍违规情况与基线进行对比 —— 默认比较未提交的变更（基于 stash），或传入 --branch [<name>] 与某个分支对比。仅报告新引入的违规、已修复的违规以及既有违规数量。如需不做对比的完整审计，请使用 `scan`。

## 1. 审计

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
```

**暂存模式**（默认 —— 未提交的变更）。先告知用户：_“正在以 diff 模式运行 —— 我将暂存你的变更以捕获基线，随后恢复。你的工作树将被完整还原。”_ 如果 `git stash push` 失败，发出警告并退出。

```bash
git stash push -u -m "accesslint-diff-baseline"
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot accesslint-diff --snapshot-dir /tmp --update-snapshot
git stash pop && sleep 2
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot accesslint-diff --snapshot-dir /tmp --format json
```

**分支模式**（`--branch <name>`）。先告知用户：_“正在与 `<name>` 进行对比 —— 我将检出该分支以捕获基线，随后恢复。你的工作树将被完整还原。”_

切换分支会触发重新构建，但不会触发浏览器重新加载 —— CLI 每次都会打开一个新标签页，因此始终读取的是当前构建。使用 `--wait-for "<selector>"` 来在重新构建就绪之前阻隔审计；若不使用，需提醒用户构建过慢可能导致基线过期。

请将分支值保存在下方带引号的 `branch` 变量中；切勿将分支名称直接粘贴为 shell 语法或对其求值。

```bash
git diff --quiet && git diff --cached --quiet || git stash push -u -m "accesslint-diff-branch"
branch="<branch>"
git check-ref-format --branch "$branch" >/dev/null
case "$branch" in -*) echo "Refusing option-like branch name: $branch" >&2; exit 1 ;; esac
git rev-parse --verify --quiet "$branch^{commit}" >/dev/null
git switch "$branch"
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot accesslint-diff --snapshot-dir /tmp --update-snapshot [--wait-for "<selector>"]
git switch - && git stash pop 2>/dev/null
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot accesslint-diff --snapshot-dir /tmp --format json [--wait-for "<selector>"]
```

在**两次**运行中都传入 `--selector`、`--include-aaa`。

## 2. 报告

```
Accessibility diff — http://localhost:3000/ vs main (94 rules, live DOM)
2 new · 1 fixed · 4 pre-existing hidden

New — Critical
- color-contrast — 2.1:1 (needs 4.5:1), #bbb on #fff
    where: main > p.subtitle   fix: darken to #767676
Fixed
- img-alt — <img src="old.jpg"> (no longer present)
```

每条新违规均包含：**位置 where**（逐字原样的选择器 + 若存在 `source` 则附 `file:line (symbol)` —— 绝不捏造）、**证据 evidence**、**修复 fix**（机械性修改或 `NEEDS HUMAN`）。

不要直接编辑。对于修复：先应用机械性修复，然后重新运行 `accesslint:diff` 进行验证；批量工作请移交给 `accesslint:audit`。

## 3. 清理

```bash
npx -y @accesslint/chrome@latest stop --all  # skip if ensure reported "managed":false
```

## 注意事项

- `ensure` 始终负责确定端口 —— 切勿硬编码 9222。
- CLI 退出码 2 = URL 无效或页面始终未加载；请检查开发服务器。
- 暂存模式：`sleep 2` 能覆盖大多数 HMR 场景；如果基线与当前状态看起来完全相同，请添加 `--wait-for "<selector>"`。
- 分支模式：没有 HMR —— CLI 每次运行都会打开新标签页。`--wait-for` 是重新构建的门槛。
- 两次运行之间的大量 DOM 变更会导致选择器漂移 —— 请用 `accesslint:scan` 重新运行以获取完整全貌。

## 局限
- 仅当任务明确符合上述范围时才使用本技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停下来寻求澄清。
