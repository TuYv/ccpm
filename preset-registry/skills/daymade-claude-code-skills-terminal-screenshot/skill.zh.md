---
name: terminal-screenshot
description: >
  Render a terminal CLI program's colored output to a PNG so Claude can actually
  SEE the real visual result — color contrast, alignment, background blocks,
  highlighting — instead of only reading plain text and raw ANSI escape codes.
  Use this whenever verifying or debugging how a CLI tool looks in the terminal:
  delta git diff colors, bat syntax highlighting, starship prompt, eza/ls colors,
  git diff, ripgrep matches, or any ANSI-colored output. ALWAYS use it right after
  changing any CLI color config (delta / bat / themes / lazygit pager) to visually
  confirm the result rather than guessing from hex values — reading a hex code is
  not the same as seeing the rendered contrast on the real terminal background.
  Trigger phrases: 看终端效果, 终端截图, 验证配色, 配色对比, 终端真实效果,
  terminal screenshot, render terminal output, ANSI to image, "does this color
  look right", "is the contrast enough", delta/bat color verification.
---
# 终端截图

将终端命令的彩色输出渲染为 PNG 图像，然后读取该图像，以便从视觉上判断结果。

## 为什么需要这样做

当命令输出以工具结果的形式返回时，Claude 看到的是纯文本和类似 `\x1b[48;2;92;30;34m` 的原始转义码，而不是渲染后的颜色。因此，它无法如实回答“差异中的新增/删除对比度是否足够强？”或“这个主题是不是太暗了？”之类的问题。读取十六进制值只能靠猜。此技能会将输出转换为图像，使判断基于人类在屏幕上实际看到的效果。

## 方法：先捕获，再渲染

这是两个独立的步骤。务必将它们分开——这种分离正是整个技巧的关键。

### 第 1 步——将完整保真的 ANSI 输出捕获到文件

大多数 CLI 在检测到输出目标并非真实终端（而是管道或子进程）时，都会**丢弃颜色或降低颜色规格**。请强制启用完整颜色，并将输出保存到 `.ansi` 文件。具体使用哪个标志取决于工具——相关用法见下文。

最重要的一条规则是：**绝不要让渲染器替你运行命令。** `freeze --execute "git diff | delta"` 看起来很方便，但会生成一个*降级*的结果——delta（以及 lazygit 和任何会探测终端能力的程序）在 freeze 的子 pty 中运行时，会检测到受限的环境，并悄无声息地丢弃背景色块、行号列和标题框。应先在普通 shell 中捕获，再进行渲染。

### 第 2 步——将 ANSI 文件渲染为 PNG，然后读取它

使用随附的封装脚本。它会优先使用 `freeze`，并在不可用时回退到标准库渲染器和无头 Chrome：

```bash
scripts/render_ansi.sh <input.ansi> <output.png> [background_hex]
```

然后使用 Read 工具读取 PNG，并判断颜色效果。

**背景颜色必须与真实终端匹配**，否则在白色页面上验证深色主题时，显示效果会不正确。在使用 Ghostty 的 macOS 上：

```bash
ghostty +show-config --default | grep '^background'   # e.g. 282c34 (the default)
```

将其作为 `#282c34` 传入。如果背景色未知，深色终端通常接近 `#1d1f21`–`#282c34`。

## 各工具的捕获方法

选择与真实终端接近的 `--width`（约 100–120），以确保换行方式一致。

| 工具 | 捕获命令（写入全彩 ANSI） |
|------|------------------------------------------|
| **delta**（git diff） | `git --no-pager diff \| delta --dark --line-numbers --width=110 > /tmp/x.ansi` |
| **git diff**（原生） | `git -c color.ui=always --no-pager diff > /tmp/x.ansi` |
| **bat** | `bat --color=always --style=numbers <file> > /tmp/x.ansi` |
| **eza** | `eza -la --color=always --icons > /tmp/x.ansi` |
| **ls**（GNU） | `ls -la --color=always > /tmp/x.ansi` |
| **ls**（macOS/BSD） | `CLICOLOR_FORCE=1 ls -laG > /tmp/x.ansi` |
| **ripgrep** | `rg --color=always 'pattern' <path> > /tmp/x.ansi` |
| **其他任何工具** | `CLICOLOR_FORCE=1 <cmd> > /tmp/x.ansi` 或 `<cmd> --color=always`，或者封装在真实 pty 中：`script -q /dev/null <cmd>` |

请注意，即使输出到文件，`delta` 也始终会使用其配置的颜色，因此对 delta 而言，唯一的陷阱就是第 1 步中的规则（不要通过 `freeze --execute` 渲染它）。

### 完整示例：验证 delta 的颜色变更

```bash
# after editing [delta] colors in gitconfig, in any repo with a diff:
git --no-pager diff | delta --dark --line-numbers --width=110 > /tmp/diff.ansi
scripts/render_ansi.sh /tmp/diff.ansi /tmp/diff.png "#282c34"
# then: Read /tmp/diff.png and judge whether add/remove contrast is clear
```

## TUI 程序（lazygit、htop、top）— 不在适用范围内

全屏 TUI 使用光标定位进行绘制，而不是生成线性的 ANSI 流，因此无法通过这种方式捕获。要检查 TUI 的*颜色*，请单独验证其底层组件——例如，对于 lazygit 的 diff，可按上文方式渲染 `git diff | delta`（lazygit 调用相同的 delta 配置）。要获取真正的 TUI 截图，请在真实终端中运行它并捕获屏幕（属于屏幕截图/计算机操作任务），而不要使用此 skill。

## 安装 freeze（首选渲染器）

`freeze` 是 [charmbracelet/freeze](https://github.com/charmbracelet/freeze)——它可以将 ANSI 渲染为 PNG/SVG/WebP，并忠实还原背景色块，且带有美观的外框。

**不要运行 `brew install freeze`**——这会安装一个同名但无关的 GUI 应用（cask）。该 CLI 位于 charmbracelet 的 tap 中，也可以通过 `go install` 安装：

```bash
# Option A — Homebrew tap (needs GitHub reachable)
brew install charmbracelet/tap/freeze

# Option B — go install (works behind a firewall via a Go module mirror)
GOPROXY=https://goproxy.cn,direct GOSUMDB=off \
  go install github.com/charmbracelet/freeze@latest
# binary lands in "$(go env GOPATH)/bin/freeze"
```

当校验和数据库（`sum.golang.org`）无法访问，并且 `go install` 卡在 "verifying module ... 504" 时，需要设置 `GOSUMDB=off`。

如果无法安装 freeze，包装脚本会自动回退到随附的 `scripts/ansi2html.py`（仅使用标准库）+ 无头 Chrome——除了安装 Chrome 外，无需额外依赖。回退方案使用固定的窗口尺寸；如果输出被截断，请在 `render_ansi.sh` 中增大 `--window-size`。

## 随附脚本

- `scripts/render_ansi.sh`——将捕获的 `.ansi` 文件渲染为 PNG（优先使用 freeze，否则使用 Chrome 回退方案）。这是入口点；请在第 1 步之后调用它。
- `scripts/ansi2html.py`——回退路径使用的、仅依赖标准库的 ANSI→HTML 转换器。支持 24 位真彩色、256 色、粗体和重置，并保留背景色块（简单渲染器会丢失的部分）。

## 常见问题

- **让渲染器运行命令**（`freeze --execute "delta …"`）→ 输出质量下降。请先在普通 shell 中捕获输出，再渲染文件。
- **非 TTY 会去除颜色** → 强制启用颜色（`--color=always` / `CLICOLOR_FORCE=1` / `script -q /dev/null`）。
- **背景颜色错误** → 在白色页面上渲染深色 CLI 主题会导致对比度判断失真。请使用真实的终端背景色。
- **亮色/暗色不匹配** → 如果终端为暗色，CLI 的颜色也必须使用其暗色变体。在暗色终端中验证 `light=true` 配置会显示反转且难以阅读的颜色（这本身就是错误，而不是渲染器的问题）。
- **`brew install freeze`** 会安装错误的工具（GUI cask）——请使用 tap 或 `go install`。