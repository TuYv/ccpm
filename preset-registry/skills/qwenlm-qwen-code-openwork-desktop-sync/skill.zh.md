---
name: openwork-desktop-sync
description: Sync qwen-code packages/desktop with modelstudioai/openwork using commit-by-commit path migration, not subtree split or tree overwrite. Use when exporting qwen-code desktop changes to OpenWork, importing OpenWork desktop changes into qwen-code, preserving target-owned overlay files such as README.md, resolving sync conflicts, or preparing sync PR branches between the two repositories.
---
# OpenWork Desktop 同步

使用此技能在此 qwen-code 仓库与 OpenWork checkout 之间同步桌面端变更。仓库脚本负责 Git 操作：

```bash
OPENWORK_DIR=/path/to/openwork bun run desktop-openwork-sync --mode export
```

默认覆盖路径为 `README.md`。覆盖路径会从迁移的提交中排除，并始终由目标端负责维护。

```bash
OPENWORK_OVERLAY_PATHS='README.md'
```

## 约定

这是逐提交的路径迁移，而不是快照替换。脚本会遍历
`source-base..source-head` 中的源提交，在 qwen-code 的
`packages/desktop` 与 OpenWork 仓库根目录之间重写路径，然后使用
`git apply -3` 应用每个提交。

已经来自接收仓库的提交会根据其同步 trailer 跳过。导入期间会跳过
qwen-code 源的导出提交；导出期间会跳过 OpenWork 源的导入提交。

合并提交不会作为合并提交迁移。脚本会迁移合并分支中的常规提交；之后看到
合并包装提交时，会检查这些常规提交是否已经处理，并确认合并树与 Git 的自动
合并结果一致。如果合并包装提交包含手动解决产生的变更，同步会停止，以便代理
将该解决结果转换为一个普通的后续提交。

除非迁移的源提交修改了相同的代码块，否则目标端的变更会被保留。如果发生这种
情况，Git 会留下一个普通冲突供代理解决。对于常规同步，不要使用
`git subtree split` 或完整树替换。

成功的同步提交会包含类似 `Qwen-Code-Commit` 或
`OpenWork-Commit` 的 trailer。后续同步可以使用最新的 trailer 作为下一个源
基线。如果不存在之前的同步 trailer，首次同步需要显式指定源基线：

```bash
bun run desktop-openwork-sync --mode export --source-base <qwen-code-ref>
bun run desktop-openwork-sync --mode import --source-base <openwork-ref>
```

## 模式

- `--mode export`：将 qwen-code 的 `packages/desktop` 提交同步到 OpenWork。
- `--mode import`：将 OpenWork 提交同步到 qwen-code 的 `packages/desktop`。
- `--mode auto`：仅用于防护；实际同步请使用显式方向。

## 工作流

1. 确认仓库路径和干净的工作树：

   ```bash
   git rev-parse --show-toplevel
   git -C /path/to/openwork rev-parse --show-toplevel
   git status --short
   git -C /path/to/openwork status --short
   ```

2. 执行请求的同步方向：

   ```bash
   OPENWORK_DIR=/path/to/openwork \
   OPENWORK_OVERLAY_PATHS='README.md' \
   bun run desktop-openwork-sync --mode export --source-base <qwen-code-ref>
   ```

3. 如果 Git 报告冲突，仅解决存在冲突的代码块，并保留目标端负责维护的仓库元数据，
   除非源变更有意更新了相同的行为。

4. 同步后进行验证：

   ```bash
   git status --short
   git diff --check HEAD
   git diff --name-status <target-base>..HEAD
   ```

5. 如果用户要求发布，请推送分支，并在分支干净后创建 PR。

## 规则

- 除非用户将路径添加到 `OPENWORK_OVERLAY_PATHS`，否则默认覆盖层中只保留 `README.md`。
- 未被源提交修改的 OpenWork 特定文件必须保持不变。
- 优先使用 PR 分支。脚本会打印用于导出分支的推送命令。
- 不要手动导入 PR 合并提交。让脚本迁移常规提交，并将合并提交视为包装提交。