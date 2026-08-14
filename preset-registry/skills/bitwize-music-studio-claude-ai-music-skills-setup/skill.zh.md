---
name: setup
description: Detects your Python environment and guides you through installing plugin dependencies. Use on first-time setup or when MCP server fails to start.
argument-hint: <blank for full check | "mcp" | "mastering" | "document-hunter">
model: haiku
allowed-tools:
  - Bash
---
此技能的基础目录：${CLAUDE_PLUGIN_BASE_DIR}

## 你的任务

根据用户的 Python 环境及其请求的组件，指导用户安装 bitwize-music 插件依赖项。

---

# 设置助手

你帮助用户安装并验证插件依赖项。

---

## 第 1 步：检测环境

**并行运行以下检查：**

```bash
# Python version
python3 --version

# Check if externally managed
python3 -c "import sysconfig; print(sysconfig.get_path('purelib'))" 2>&1 | grep -q "/usr" && echo "EXTERNALLY_MANAGED" || echo "USER_MANAGED"

# Check for pipx
command -v pipx >/dev/null 2>&1 && echo "pipx: installed" || echo "pipx: not installed"

# Check for venv support
python3 -m venv --help >/dev/null 2>&1 && echo "venv: supported" || echo "venv: not supported"

# Platform
uname -s
```

---

## 第 2 步：检查组件状态

**重要：** 按**顺序**运行这些检查，不要并行运行。如果某项检查失败，请继续执行其余检查，以显示完整状态。

**关键要求：** 始终检查 venv，而不是系统 Python！

```bash
# Set venv path (macOS/Linux/WSL uses bin/python3; native Windows uses Scripts/python.exe)
VENV_PYTHON=~/.bitwize-music/venv/bin/python3
[ -f "$VENV_PYTHON" ] || VENV_PYTHON=~/.bitwize-music/venv/Scripts/python.exe

# Check if venv exists
if [ -f "$VENV_PYTHON" ]; then
    echo "✅ Venv exists at ~/.bitwize-music/venv"

    # Check each component in the venv
    $VENV_PYTHON -c "import mcp; print('✅ mcp installed')" 2>&1 || echo "❌ mcp not installed"
    $VENV_PYTHON -c "import matchering; print('✅ matchering installed')" 2>&1 || echo "❌ matchering not installed"
    $VENV_PYTHON -c "import boto3; print('✅ boto3 installed')" 2>&1 || echo "❌ boto3 not installed"
    $VENV_PYTHON -c "from playwright.sync_api import sync_playwright; print('✅ playwright installed')" 2>&1 || echo "❌ playwright not installed"

    # Check for version drift against requirements.txt
    $VENV_PYTHON -c "
import importlib.metadata, pathlib
reqs = pathlib.Path('${CLAUDE_PLUGIN_ROOT}/requirements.txt').read_text()
stale = []
for line in reqs.splitlines():
    line = line.split('#')[0].strip()
    if not line or '==' not in line:
        continue
    name, _, ver = line.partition('==')
    name = name.split('[')[0].strip()
    try:
        installed = importlib.metadata.version(name)
        if installed != ver:
            stale.append(f'  {name}: {installed} → {ver}')
    except importlib.metadata.PackageNotFoundError:
        stale.append(f'  {name}: missing (needs {ver})')
if stale:
    print('⚠️  Version drift detected:')
    print('\n'.join(stale))
else:
    print('✅ All package versions match requirements.txt')
" 2>&1
else
    echo "❌ Venv not found at ~/.bitwize-music/venv"
    echo "   Run: python3 -m venv ~/.bitwize-music/venv   # macOS/Linux/WSL"
    echo "   Or:  py -3 -m venv ~/.bitwize-music/venv      # Windows"
fi
```

所有组件均通过 requirements.txt 一并安装到 venv 中。

---

## 第 3 步：显示安装命令

**始终使用统一的 venv 方案**——它适用于所有平台，并且插件会自动检测。

```bash
# Create unified venv (if it doesn't exist)
python3 -m venv ~/.bitwize-music/venv                                                    # macOS/Linux/WSL
py -3 -m venv ~/.bitwize-music/venv                                                       # Windows (native)

# Install ALL plugin dependencies
~/.bitwize-music/venv/bin/pip install -r ${CLAUDE_PLUGIN_ROOT}/requirements.txt                     # macOS/Linux/WSL
~/.bitwize-music/venv/Scripts/python.exe -m pip install -r ${CLAUDE_PLUGIN_ROOT}/requirements.txt   # Windows (native)

# Set up document hunter browser
~/.bitwize-music/venv/bin/playwright install chromium                                     # macOS/Linux/WSL
~/.bitwize-music/venv/Scripts/playwright.exe install chromium                             # Windows (native)
```

**就是这样！** 插件会自动检测并使用对应平台的 venv（macOS/Linux/WSL 上为 `~/.bitwize-music/venv`，原生 Windows 上为 `%USERPROFILE%\.bitwize-music\venv`）。无需配置。

**适用于：**
- ✅ Linux（外部管理的 Python）
- ✅ macOS
- ✅ Windows（原生——核心层级，尽力支持；音频工具需要 WSL2）
- ✅ Windows（WSL）
- ✅ 所有其他系统

---

## 第 4 步：安装指南

提供清晰、简单的安装指南：

1. **检测到的环境**：[Python 版本、平台]
2. **缺失的组件**：[列出需要安装的内容]
3. **安装命令**：
   ```bash
   python3 -m venv ~/.bitwize-music/venv                                                  # macOS/Linux/WSL
   ~/.bitwize-music/venv/bin/pip install -r ${CLAUDE_PLUGIN_ROOT}/requirements.txt         # macOS/Linux/WSL
   ~/.bitwize-music/venv/bin/playwright install chromium                                   # macOS/Linux/WSL

   py -3 -m venv ~/.bitwize-music/venv                                                               # Windows (native)
   ~/.bitwize-music/venv/Scripts/python.exe -m pip install -r ${CLAUDE_PLUGIN_ROOT}/requirements.txt # Windows (native)
   ~/.bitwize-music/venv/Scripts/playwright.exe install chromium                                     # Windows (native)
   ```
4. **安装后**：
   - 重启 Claude Code 以重新加载插件
   - MCP 服务器应在 `/plugin` 状态中显示为正在运行
   - 再次运行 `/bitwize-music:setup` 进行验证

---

## 第 5 步：验证安装（如有请求）

用户报告已完成安装后，重新执行第 2 步中的检查并确认：

✅ **MCP 服务器**：就绪
✅ **音频母带处理**：就绪
✅ **云端上传**：就绪
✅ **文档搜寻器**：就绪

**后续步骤**：运行 `/bitwize-music:configure` 设置工作区路径。

---

## 输出格式

使用带复选框的清晰分节来表示状态：

```markdown
## bitwize-music Setup

### Environment
- Python: 3.12.3
- System: Linux

### Component Status
- [❌] MCP server
- [❌] Audio mastering
- [❌] Cloud uploads
- [❌] Document hunter

### Installation

Run these commands to install all plugin dependencies (macOS/Linux/WSL shown; see Step 3 for the Windows native `py -3` / `Scripts\` equivalents):

```bash
# Create unified venv
python3 -m venv ~/.bitwize-music/venv

# Install ALL dependencies
~/.bitwize-music/venv/bin/pip install -r ${CLAUDE_PLUGIN_ROOT}/requirements.txt

# Set up browser
~/.bitwize-music/venv/bin/playwright install chromium
```

**安装后：**
1. 重启 Claude Code
2. 所有组件将自动运行
3. 运行 `/bitwize-music:setup` 进行验证

该插件会自动检测 `~/.bitwize-music/venv`——一切都能直接运行！
```

---

## 请记住

- **要具体**——展示适用于其环境的确切命令
- 对于外部管理的 Python，**优先采用用户级安装**
- **解释每个组件的作用**，以便用户决定要安装哪些组件
- 在建议命令之前，**测试命令是否有效**
- 安装后提供**清晰的后续步骤**