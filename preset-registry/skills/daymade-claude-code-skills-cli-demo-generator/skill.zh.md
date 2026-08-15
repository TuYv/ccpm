---
name: cli-demo-generator
description: Generates professional animated CLI demos as GIFs using VHS terminal recordings. Handles tape file creation, self-bootstrapping demos with hidden setup, output noise filtering, post-processing speed-up, and frame-level verification. Use when users want to create terminal demos, record CLI workflows as GIFs, generate animated documentation, build demo tapes for README files, or need to showcase any command-line tool visually. Also triggers on "record terminal", "VHS tape", "demo GIF", "animate my CLI", or any request to visually demonstrate shell commands.
---
# CLI 演示生成器

创建专业的 CLI 动画演示。提供四种方式，从完全自动化到像素级精确的手动控制。

## 快速开始

**最简单的方式**——提供命令，即可获得 GIF：

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/auto_generate_demo.py \
  -c "npm install my-package" \
  -c "npm run build" \
  -o demo.gif
```

**自举式演示**——适用于可重复录制，并能自行清理状态：

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/auto_generate_demo.py \
  -c "npm install my-package" \
  -c "npm run build" \
  -o demo.gif \
  --bootstrap "npm uninstall my-package 2>/dev/null" \
  --speed 2
```

## 重要：VHS 解析器的限制

VHS `Type` 字符串不能包含 `$`、`\"` 或反引号。它们会导致解析错误：

```tape
# FAILS — VHS parser rejects special chars
Type "echo \"hello $USER\""
Type "claude() { command claude \"$@\"; }"
```

**解决方法：对命令进行 base64 编码**，并在运行时解码：

```bash
# 1. Encode your complex command
echo 'claude() { command claude "$@" 2>&1 | grep -v "noise"; }' | base64
# Output: Y2xhdWRlKCkgey4uLn0K

# 2. Use in tape
Type "echo Y2xhdWRlKCkgey4uLn0K | base64 -d > /tmp/wrapper.sh && source /tmp/wrapper.sh"
```

这种模式对于输出过滤、函数定义以及任何包含 shell 特殊字符的命令都至关重要。

## 方式

### 1. 自动生成（推荐）

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/auto_generate_demo.py \
  -c "command1" -c "command2" \
  -o output.gif \
  --title "My Demo" \
  --theme "Catppuccin Latte" \
  --font-size 24 \
  --width 1400 --height 600
```

| 标志 | 默认值 | 说明 |
|------|---------|-------------|
| `-c` | 必填 | 要包含的命令（可重复指定） |
| `-o` | 必填 | 输出 GIF 路径 |
| `--title` | 无 | 开始时显示的标题 |
| `--theme` | Dracula | VHS 主题名称 |
| `--font-size` | 16 | 字体大小，单位为 pt |
| `--width` | 1400 | 终端宽度，单位为 px |
| `--height` | 700 | 终端高度，单位为 px |
| `--bootstrap` | 无 | 隐藏的设置命令（可重复指定） |
| `--filter` | 无 | 从输出中过滤掉的正则表达式模式 |
| `--speed` | 1 | 播放速度倍数（使用 gifsicle） |
| `--no-execute` | false | 仅生成 .tape 文件 |

智能计时：`install`/`build`/`test`/`deploy` → 3 秒，`ls`/`pwd`/`echo` → 1 秒，其他命令 → 2 秒。

### 2. 批量生成

通过一个配置创建多个演示：

```yaml
# demos.yaml
demos:
  - name: "Install"
    output: "install.gif"
    commands: ["npm install my-package"]
  - name: "Usage"
    output: "usage.gif"
    commands: ["my-package --help", "my-package run"]
```

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/batch_generate.py demos.yaml --output-dir ./gifs
```

### 3. 交互式录制

录制实时终端会话：

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/record_interactive.sh output.gif --theme "Catppuccin Latte"
# Type commands naturally, Ctrl+D when done
```

需要 asciinema（`brew install asciinema`）。

### 4. 手动编写 Tape 文件

如需最大程度的控制，可直接编写 tape。模板位于 `assets/templates/`：

- `basic.tape` — 简单的命令序列
- `interactive.tape` — 输入模拟
- `self-bootstrap.tape` — **带隐藏设置的自清理演示**（推荐用于可重复演示）

## 高级模式

这些模式源自生产环境中的实践。完整详情请参阅 `references/advanced_patterns.md`。

### 自举式演示

清理先前状态、设置环境，并向观看者隐藏所有这些操作的演示：

```tape
Hide
Type "cleanup-previous-state 2>/dev/null"
Enter
Sleep 2s
Type "clear"
Enter
Sleep 500ms
Show

Type "the-command-users-see"
Enter
Sleep 3s
```

`Hide` → 命令 → `clear` → `Show` 这一序列至关重要。`clear` 会清除终端缓冲区，避免隐藏的命令泄露到 GIF 中。

### 输出噪声过滤

过滤那些会产生冗长输出的命令中的嘈杂进度行：

```tape
# Hidden: create a wrapper function that filters noise
Hide
Type "echo <base64-encoded-wrapper> | base64 -d > /tmp/w.sh && source /tmp/w.sh"
Enter
Sleep 500ms
Type "clear"
Enter
Sleep 500ms
Show

# Visible: clean command, filtered output
Type "my-noisy-command"
Enter
Sleep 3s
```

### 帧验证

录制完成后，通过提取关键帧来验证 GIF 内容：

```bash
# Extract frames at specific positions
ffmpeg -i demo.gif -vf "select=eq(n\,100)" -frames:v 1 /tmp/frame.png -y 2>/dev/null

# View the frame (Claude can read images)
# Use Read tool on /tmp/frame.png to verify content
```

### 后期处理加速

使用 gifsicle 加速录制结果，无需重新录制：

```bash
# 2x speed (halve frame delay)
gifsicle -d2 original.gif "#0-" > fast.gif

# 1.5x speed
gifsicle -d4 original.gif "#0-" > faster.gif
```

### 模板占位符模式

使用占位符保持 tape 文件的通用性，并在构建时进行替换：

```tape
# In tape file
Type "claude plugin marketplace add MARKETPLACE_REPO"

# In build script
sed "s|MARKETPLACE_REPO|$DETECTED_REPO|g" template.tape > rendered.tape
vhs rendered.tape
```

## 时间与尺寸参考

| 场景 | 宽度 | 高度 | 字体 | 时长 |
|---------|-------|--------|------|----------|
| README/文档 | 1400 | 600 | 16-20 | 10-20s |
| 演示文稿 | 1800 | 900 | 24 | 15-30s |
| 紧凑型嵌入 | 1200 | 600 | 14-16 | 10-15s |
| 宽幅输出 | 1600 | 800 | 16 | 15-30s |

详细指南请参阅 `references/best_practices.md`。

## 故障排除

| 问题 | 解决方案 |
|---------|----------|
| 未安装 VHS | `brew install charmbracelet/tap/vhs` |
| 未安装 gifsicle | `brew install gifsicle` |
| GIF 过大 | 减小尺寸、缩短休眠时间，或使用 `--speed 2` |
| 文本换行/断行 | 增大 `--width` 或减小 `--font-size` |
| VHS 在 `$` 或 `\"` 处出现解析错误 | 使用 base64 编码（参见上面的“关键事项”部分） |
| 隐藏命令泄露到 GIF 中 | 在 `Show` 前添加 `clear` + `Sleep 500ms` |
| 命令在上一条命令完成前执行 | 增加 `Sleep` 时长 |

## 依赖项

**必需：** VHS（`brew install charmbracelet/tap/vhs`）

**可选：** gifsicle（加速）、asciinema（交互式录制）、ffmpeg（帧验证）、PyYAML（批量 YAML 配置）