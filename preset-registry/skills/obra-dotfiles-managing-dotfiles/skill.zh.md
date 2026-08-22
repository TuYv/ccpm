---
name: managing-dotfiles
description: Use when adding, changing, deploying, onboarding, or auditing Jesse's dotfiles — the symlink-based config system in ~/git/dotfiles (public) and ~/git/dotfiles-private (private), deployed across his Mac + Linux fleet. Covers the update workflow, the manifest, OS-splitting, secrets, new-machine onboarding, and the audit process.
---
# 管理 dotfiles

两个仓库，通过符号链接部署到一组机器上（2 台 Mac + 若干 Linux 主机）：

- **`~/git/dotfiles`** — 公开仓库。包含 Shell、编辑器、工具配置、`bin/` 脚本、`.claude/`（CLAUDE.md、
  commands、独立技能）。**绝不包含任何秘密。**
- **`~/git/dotfiles-private`** — 私有仓库。包含 ssh 配置、`fnox` 配置、`bin/bw-unlock`、工作环境。仍然
  **只引用**秘密，绝不包含秘密值。

每个仓库都有一个 `manifest`（`<repo-relative path> [macos|linux]`）和一个符合 POSIX 的 `install.sh`，
它会将每个条目以符号链接的形式放入 `$HOME`，并把所有被替换的内容备份到 `~/.dotfiles-backup/<ts>/`。

## 更新（常见情况）

`$HOME` 中的文件是指向仓库的符号链接，因此**直接编辑，然后执行 `git commit`。**仅此而已——
更改已经实时生效。只有在添加**新的** manifest 条目或配置新机器后，才需要运行 `install.sh`。
提交并推送，然后在其他主机上执行 `git pull`。

## 添加新配置

1. 将文件移动到仓库中与其 `$HOME` 相对路径对应的位置（例如 `~/.config/foo/bar` →
   `.config/foo/bar`）。
2. 将路径添加到 `manifest`——如果仅适用于特定操作系统，则追加 ` macos` 或 ` linux`。
3. 运行 `./install.sh`（为其创建符号链接，并备份原文件）。
4. 提交。将文件内的所有绝对路径改为使用 `$HOME`，以确保可移植性。

## 操作系统专用配置

相比在文件内使用 `uname` 分支，优先使用由 manifest 标签选择的**独立文件**
（`.config/zsh/macos.zsh` 与 `linux.zsh`、`.ssh/config.d/macos.conf`）。公共文件仅在对应的
操作系统文件存在时才加载它，因此在其他操作系统上不会执行任何操作。使用 `command -v` 检查工具集成。

## 秘密

绝不提交秘密值。工具通过 `fnox`（`docs/SECRETS.md`）延迟获取秘密：`op`（1Password，
工作）+ `bw`（Bitwarden，个人），并通过 `bw-unlock` 使用 1Password 静默解锁 Bitwarden。
无头机器（没有 1Password 应用）使用位于 `~/.config/op/env`（权限为 600，
不跟踪）中的**服务账户令牌**——参见 SECRETS.md 中的“Headless / unattended machines”。在 shell
中处理秘密值时，只能将其通过管道传给 `wc -c` 或 `shasum`——绝不输出它，绝不使用 `2>&1`/`-v`/`--full`。

## 配置新机器

1. 将两个仓库克隆到 `~/git`。（Linux/无头机器：如有需要，在 GitHub 中注册 ssh 密钥。）
2. 安装工具链：`mise` + `fnox`（`mise use -g ubi:jdx/fnox`）、`op`、`bw`、`jq`、`zsh`。
3. 在每个仓库中运行 `./install.sh`。
4. 无头机器的秘密：为每台机器创建一个 1Password 服务账户
   （`op service-account create <host> --vault automation:read_items --raw`），将令牌放入
   `~/.config/op/env`（仅通过临时文件 / `$(cat …)` 传递，绝不输出），执行 `bw login
   --apikey`，然后验证整个链路（`fnox get <name> | wc -c`）。
5. 使用 `chsh` 切换到 zsh。首次启动交互式 zsh 时会触发一次性的 z4h 引导安装。

`magic-kingdom`（Linux）和 `paradise-park`（Mac，通过 SSH 驱动）是完整的参考示例。

## Claude 配置（.claude/）

`CLAUDE.md`、`commands/` 以及 `.claude/skills/` 下的**独立**技能，通过单独的 manifest 条目进行版本控制，
并以符号链接的形式放入 `~/.claude/`。这样可确保主机专用的**项目链接型**技能（即符号链接到项目仓库的
`~/.claude/skills/<x>`）不受影响。要对新的独立技能进行版本控制：将其放入
`.claude/skills/<name>/`，添加一行 manifest 条目，然后运行 `install.sh`。

## 审计

在推送前以及定期运行 `dotfiles-audit`（泄露扫描 + 部署漂移 + 权限检查）。完整
流程和人工目视检查项位于 `docs/AUDITING.md`。