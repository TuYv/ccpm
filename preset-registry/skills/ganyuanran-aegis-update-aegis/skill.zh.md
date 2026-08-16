---
name: update-aegis
description: "Use when the user says `aegis:update`, asks to update or upgrade an installed Aegis method-pack, wants the latest Aegis version, or asks whether Aegis is current on this host."
---
# 更新 Aegis

为当前 AI 编程宿主更新已安装的 Aegis Method Pack。

此技能用于宿主维护。不要仅仅因为用户要求更新 Aegis 就编辑目标项目。

## 默认语义

- `aegis:update` 更新当前宿主已注册的 Aegis 安装。
- 更新所有已注册宿主需要显式提出 `--all` 请求。
- 如果注册了多个宿主，且无法识别当前宿主，请在更新前提出一个具体问题。
- 如果已安装的 method-pack 根目录与开发检出目录路径不同，请勿更新开发检出目录。
- 不要执行后台自动更新。本地注册表可能会记录 `updateMode`，但此技能仅执行由用户显式触发的更新。

## 证据优先

在已安装的 method-pack 根目录中，检查宿主范围的注册表：

```bash
python scripts/aegis-update.py status --json
```

如果注册表缺失，请在更新前注册当前宿主。请使用宿主的安装指南和实际发现路径，而不要猜测。

如果 `~/.config/aegis/config.toml` 已声明 `method_pack_root`，则在注册其他宿主时优先使用该规范根目录。宿主特定的发现路径、复制的技能目录、插件缓存或适配器负载应视为同一 Aegis 主体的生成视图／宿主管理视图，而不是独立的可编辑检出目录。

Codex 示例：

```bash
python scripts/aegis-update.py register \
  --host codex \
  --sync-mode junction \
  --discovery-root ~/.agents/skills/aegis \
  --reload-hint "restart Codex"
```

基于复制的宿主示例：

```bash
python scripts/aegis-update.py register \
  --host codebuddy \
  --sync-mode copy-skills \
  --discovery-root ~/.codebuddy/skills \
  --reload-hint "restart CodeBuddy"
```

带前缀的直接子目录宿主示例：

```bash
python scripts/aegis-update.py register \
  --host copilot \
  --sync-mode junction \
  --discovery-shape direct-child \
  --discovery-root <target-repo>/.github/skills \
  --discovery-name-prefix aegis- \
  --reload-hint "restart Copilot session or reopen the repository"
```

Kimi Code CLI 的自动安装由插件管理。不要对 Kimi 的托管插件副本使用 Aegis 更新程序。在 Kimi 中，运行原生更新或重新安装流程，验证所选的托管插件，然后重新加载：

```text
/plugins install https://github.com/GanyuanRan/Aegis
/plugins info aegis
/reload
```

如果 Kimi 在替换托管副本前要求确认或移除，请严格按照其插件管理器的提示操作。然后通过 `/plugins info aegis` 找到托管根目录，并运行：

```bash
cd <aegis-method-pack-root>
python scripts/aegis-doctor.py --json --host-profile kimi-code-auto
```

Kimi Code CLI **显式兼容安装**示例：

```bash
python scripts/aegis-update.py register \
  --host kimi-code \
  --sync-mode junction \
  --reload-hint "restart Kimi Code CLI"
```

当为 `kimi`、`kimi-code` 或 `kimi-code-cli` 省略 `--discovery-root` 时，更新程序会使用 `$KIMI_CODE_HOME/skills`；如果未设置 `KIMI_CODE_HOME`，则使用 `~/.kimi-code/skills`。仅当 Aegis Kimi 插件已被禁用或卸载，且用户已选择显式兼容模式时，才使用此更新程序路径。

可以注册由插件管理的宿主，但更新器会报告该宿主的插件管理器拥有更新路径：

```bash
python scripts/aegis-update.py register \
  --host opencode \
  --sync-mode plugin-managed \
  --reload-hint "restart OpenCode"
```

## 更新命令

当前宿主或明确选择的宿主：

```bash
python scripts/aegis-update.py update --host <host> --json
```

所有已注册的宿主，仅当用户明确要求更新所有宿主时使用：

```bash
python scripts/aegis-update.py update --all --json
```

在不改动文件的情况下预览：

```bash
python scripts/aegis-update.py update --host <host> --dry-run --json
```

如果已安装的检出目录中存在本地更改，请勿覆盖。应询问用户如何处理，或者在获得明确许可后，使用以下命令保留这些更改：

```bash
python scripts/aegis-update.py update --host <host> --stash --json
```

## 完成依据

只有当更新器报告了所选宿主，并且更新后的 doctor 验证成功时，才将更新视为完成。对于基于链接的发现根目录（`junction`、`symlink` 或 `repo-only`），更新器会通过 `aegis-doctor.py --discovery-root` 传递 `discoveryRoot`；当已注册的直接子级视图声明了 `discoveryNamePrefix` 时，更新器还会传递 `--discovery-name-prefix`。对于基于复制的宿主，更新器会在复制步骤后验证复制的 Aegis 技能目录是否存在，然后针对方法包根目录运行 doctor。

当多个已注册宿主共享同一个 `methodPackRoot` 时，更新器现在会复用一次方法包检出更新，然后分别刷新每个宿主的暴露路径或验证路径。

报告以下内容：

- 所选宿主 / 安装 id
- 可用时，更新前和更新后的最终提交
- 安装是否已更新，或已是最新状态
- 使用的同步模式
- doctor 验证结果
- 重启或重新加载提示

如果更新器跳过了 `plugin-managed` 宿主，请说明该宿主的插件管理器拥有更新路径，并提供重新加载或重新安装提示。

对于 Kimi 自动安装，完成更新还要求执行 `/plugins info aegis`、`/reload` 或 `/new`，使用 `kimi-code-auto` doctor 配置文件，并完成 `docs/README.kimi-code.md` 中的宿主原生自动入口检查。仅完成文件发现或通用 doctor 检查并不足够。