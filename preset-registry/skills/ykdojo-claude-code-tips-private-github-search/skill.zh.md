---
name: private-github-search
description: Full-text search across all of the user's GitHub repos (including private ones) using a local mirror and ripgrep. Use for "where did I put X", "which repo has X", or any search spanning the user's repos - gh search code / the REST API cannot reliably search private repos.
---
# 私有 GitHub 搜索

GitHub 的现代代码搜索（即支持索引私有仓库的那个）仅限网页端使用；`gh search code` 使用的是旧版引擎，对私有仓库常常返回空结果。可改为搜索用户所有仓库的本地镜像——它覆盖的内容与 GitHub 索引一致（默认分支、非 fork），完整搜索只需几毫秒。

## 搜索

找到随附的同步脚本（无论插件安装还是手动符号链接均可使用）：

```bash
find ~/.claude ~/.codex -name "private-github-search-sync.sh" 2>/dev/null | sort -V | tail -1
```

务必先刷新——如果镜像在最近一小时内已同步过，它会立即退出；否则约需 15 秒（`--force` 无论时间多久都会同步）：

```bash
bash <script-path>
rg -il 'pattern' ~/repo-mirror/repos          # which files
rg -in 'pattern' ~/repo-mirror/repos | head   # matching lines
```

## 首次设置

如果 `~/repo-mirror/owners.txt` 不存在：询问用户要镜像哪些 GitHub 账户（不要猜测——他们可能管理着多个账户），将账户每行一个写入 `~/repo-mirror/owners.txt`，然后在后台运行同步脚本（首次克隆需要几分钟；需要 `gh` 已通过认证且能访问这些账户）。

## 注意事项

- 仅镜像默认分支的最新提交——如需查看历史或其他分支，请在完整克隆中使用 `git log -S`，或使用 GitHub 网页搜索。
- 镜像中可能包含私密数据：请将其排除在同步文件夹之外，且切勿提交或发布其内容。
