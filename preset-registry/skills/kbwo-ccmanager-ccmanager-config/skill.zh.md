---
name: ccmanager-config
description: Set up, review, or repair a CCManager config — `.ccmanager.json` at a git repository root, or the global `~/.config/ccmanager/config.json`. Use when someone wants ccmanager to launch a different agent CLI (codex, gemini, cursor-agent, copilot…), add command presets, run a command on session state changes or worktree creation, auto-generate worktree directory paths, change merge/rebase arguments, rebind the return-to-menu key, turn on auto-approval — or when a ccmanager setting "does not seem to do anything".
---
# 配置 CCManager

CCManager（`ccmanager`）是一个终端 UI，每个 git
工作树运行一个 AI 编码代理。它的行为来自两个**形状完全相同**的 JSON 文件：

| 文件 | 作用域 | 备注 |
| --- | --- | --- |
| `<git repository root>/.ccmanager.json` | 一个仓库 | 提交该文件以便与团队共享 |
| `~/.config/ccmanager/config.json`（Windows 上为 `%APPDATA%\ccmanager\config.json`） | 用户，适用于所有仓库 | 也可通过 ccmanager 自带的 **Global Configuration** 菜单写入 |

对于每个键，项目文件优先于全局文件。两个文件都是可选的。

此 skill 存在的原因是：**CCManager 在配置错误时不会报告任何信息。** 无效 JSON 文件会被整体丢弃，未知键会被静默忽略，因此拼写错误与某项功能不起作用无法区分。通过此 skill 进行的每项更改，都会在第 4 步运行验证器。

## 操作步骤

### 1. 决定要编辑哪个文件

问自己，并在确实存在歧义时询问用户：

- 此设置描述的是**仓库**（要运行哪个代理 CLI、创建工作树后要执行什么操作、工作树存放在哪里）？→ `.ccmanager.json`，提交该文件。
- 此设置描述的是**此人的机器或偏好**（通知命令、按键绑定、个人 API/model 标志）？→ 全局 `config.json`。

写入任何内容前，请注意以下两个陷阱：

- 将 `.ccmanager.json` 放在**主仓库根目录**，而不是链接工作树中。CCManager 会将任意工作树解析回主检出目录，因此工作树中的配置文件永远不会被读取。
- 如果 ccmanager 以多项目模式启动（设置了
  `CCMANAGER_MULTI_PROJECT_ROOT` 环境变量，或传入了 `--multi-project`），则会完全跳过项目文件，仅应用全局配置。请明确告知用户这一点，而不要写入一个会被忽略的文件。

### 2. 读取已有内容

如果目标文件存在，使用 `cat` 读取；当用户的请求依赖于合并后的结果时，也读取配置文件对中的另一个文件。已有配置时，绝不要从头重写配置，否则会悄悄丢失用户未要求修改的设置。

### 3. 写入配置

写入任何键之前，都要在此 skill 目录中的
**`references/config-reference.md`** 里查找该键：其中列出了每个键的类型、默认值以及实际作用。不要自行发明键——凡是该文件未列出的内容，都会被 CCManager 静默丢弃。

对于常见目标——运行 codex/gemini/其他 CLI、配置多个预设、
桌面通知、每个工作树的设置命令、工作树路径模式、合并参数、自动批准——请从
**`references/recipes.md`** 中的完整示例开始，再根据需要调整。

以下三条规则最容易导致问题：

1. **合并只在一层键级别进行。** 对于项目文件中存在的每个顶层键，该键的*字段*会覆盖全局文件中的对应字段；字段以下的任何嵌套内容都会被整体替换，而不是合并。尤其是，项目文件中的 `commandPresets.presets` 数组会完全替换全局预设列表——因此请列出该仓库所需的所有预设，并确保 `defaultPresetId` 设置为其中一个预设的 id。
2. **`args` 是 argv，每个数组元素对应一个 token。** 应写成 `["--model", "opus"]`，不要写成 `["--model opus"]`。
3. **未设置 `"enabled": true` 的 hook 永远不会运行。** `command` 和 `enabled` 都是必需的。

### 4. 验证 — 始终执行

```bash
node <skill-dir>/scripts/validate-ccmanager-config.mjs path/to/.ccmanager.json
```

它会按照 CCManager 的方式解析文件，根据
`schema/ccmanager.schema.json` 检查结构，标记未知键（并提供“你是否想输入”的建议），还会捕获仅凭 JSON 无法表达的错误：`defaultPresetId` 未匹配任何 preset、重复的 preset id、包含空格的 `args` 条目、与命令不匹配的检测策略、永远无法触发的快捷键、已禁用的 hook、不包含 `{branch}` 的 worktree 模式，以及位于已链接 worktree 中的配置文件。出现错误时它会以非零状态退出；警告仅供参考。

报告它打印的内容。如果无法运行（没有 Node），请明确说明，而不要声称配置没有问题。

### 5. 告知用户如何使配置生效

CCManager 会在启动时以及重新加载时读取配置。手动编辑文件后，用户应返回 ccmanager 菜单或重启它；已经运行的会话会继续使用它们启动时采用的命令和检测策略。

## Review 现有配置（“这个设置没有任何作用”）

按以下列表逐项检查——这些是最常见的静默失败，且按其造成影响的先后顺序排列：

1. 运行验证器（第 4 步）。无效 JSON 和未知/拼写错误的键是最常见的两个原因，而且二者在 TUI 中都不可见。
2. 检查文件位置：应位于主仓库根目录，而不是 worktree 中；并且应禁用多项目模式。
3. 检查另一个文件。项目文件只会覆盖其中实际包含的键；其他所有内容仍然来自全局配置。
4. 对于 preset：如果 `defaultPresetId` 指向另一个文件中的 preset，则会静默回退到列表中的第一个 preset。
5. 对于报告错误状态的会话：`detectionStrategy` 必须与正在运行的 CLI 匹配——参见
   `references/config-reference.md` 中的表格。

## 此 skill 中的文件

- `references/config-reference.md` — 每个键的类型、默认值、行为以及 hook 环境变量。
- `references/recipes.md` — 针对常见目标的可复制和调整的配置。
- `schema/ccmanager.schema.json` — 两个配置文件使用的 JSON Schema；可在编辑器中用作 `$schema` 以提供补全。
- `scripts/validate-ccmanager-config.mjs` — 第 4 步中的验证器。