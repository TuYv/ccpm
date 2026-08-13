---
name: understand-dashboard
description: Launch the interactive web dashboard to visualize a codebase's knowledge graph
argument-hint: "[project-path]"
---
# /understand-dashboard

启动 Understand Anything 仪表盘来可视化当前项目的知识图谱。

## 操作说明

1. 确定项目目录和数据目录：
   - 如果 `$ARGUMENTS` 包含一个路径，则将其用作项目目录
   - 否则，使用当前工作目录
   - 当遗留的 `.understand-anything/` 数据目录存在时优先使用，否则使用 `.ua/`

   使用 Bash 工具来解析：
   ```bash
   PROJECT_ARG="$ARGUMENTS"
   if [ -n "$PROJECT_ARG" ]; then
     PROJECT_DIR=$(cd "$PROJECT_ARG" 2>/dev/null && pwd -P)
   else
     PROJECT_DIR=$(pwd -P)
   fi

   if [ -z "$PROJECT_DIR" ] || [ ! -d "$PROJECT_DIR" ]; then
     echo "Error: Project directory not found: ${PROJECT_ARG:-$PWD}"
     exit 1
   fi

   if [ -d "$PROJECT_DIR/.understand-anything" ]; then
     UA_DIR="$PROJECT_DIR/.understand-anything"
   else
     UA_DIR="$PROJECT_DIR/.ua"
   fi
   ```

2. 检查项目目录中是否存在 `$UA_DIR/knowledge-graph.json`。如果不存在，向用户显示：
   ```
   No knowledge graph found. Run /understand first to analyze this project.
   ```

   使用 Bash 工具检查：
   ```bash
   if [ ! -f "$UA_DIR/knowledge-graph.json" ]; then
     echo "No knowledge graph found. Run /understand first to analyze this project."
     exit 1
   fi
   ```

3. 查找仪表盘代码。仪表盘位于本插件根目录下的 `packages/dashboard/`。按顺序检查以下路径并使用第一个存在的路径：
   - `${CLAUDE_PLUGIN_ROOT}/packages/dashboard/`（Claude Code 运行时根目录，最高优先级）
   - `~/.understand-anything-plugin/packages/dashboard/`（全局符号链接，所有安装）
   - `~/.agents/skills/understand-dashboard` 的真实路径向上两级（自身相对 fallback）
   - `~/.copilot/skills/understand-dashboard` 的真实路径向上两级（Copilot 个人技能 fallback）
   - 常见基于克隆的安装根路径：
     - `~/.codex/understand-anything/understand-anything-plugin/packages/dashboard/`
     - `~/.opencode/understand-anything/understand-anything-plugin/packages/dashboard/`
     - `~/.pi/understand-anything/understand-anything-plugin/packages/dashboard/`
     - `~/understand-anything/understand-anything-plugin/packages/dashboard/`

   使用 Bash 工具来解析：
   ```bash
   SKILL_REAL=$(realpath ~/.agents/skills/understand-dashboard 2>/dev/null || readlink -f ~/.agents/skills/understand-dashboard 2>/dev/null || echo "")
   SELF_RELATIVE=$([ -n "$SKILL_REAL" ] && cd "$SKILL_REAL/../.." 2>/dev/null && pwd || echo "")
   COPILOT_SKILL_REAL=$(realpath ~/.copilot/skills/understand-dashboard 2>/dev/null || readlink -f ~/.copilot/skills/understand-dashboard 2>/dev/null || echo "")
   COPILOT_SELF_RELATIVE=$([ -n "$COPILOT_SKILL_REAL" ] && cd "$COPILOT_SKILL_REAL/../.." 2>/dev/null && pwd || echo "")

   PLUGIN_ROOT=""
   for candidate in \
     "${CLAUDE_PLUGIN_ROOT}" \
     "$HOME/.understand-anything-plugin" \
     "$SELF_RELATIVE" \
     "$COPILOT_SELF_RELATIVE" \
     "$HOME/.codex/understand-anything/understand-anything-plugin" \
     "$HOME/.opencode/understand-anything/understand-anything-plugin" \
     "$HOME/.pi/understand-anything/understand-anything-plugin" \
     "$HOME/understand-anything/understand-anything-plugin"; do
     if [ -n "$candidate" ] && [ -d "$candidate/packages/dashboard" ]; then
       PLUGIN_ROOT="$candidate"; break
     fi
   done

   if [ -z "$PLUGIN_ROOT" ]; then
     echo "Error: Cannot find the understand-anything plugin root."
     echo "Checked:"
     echo "  - ${CLAUDE_PLUGIN_ROOT:-<unset CLAUDE_PLUGIN_ROOT>}"
     echo "  - $HOME/.understand-anything-plugin"
     echo "  - ${SELF_RELATIVE:-<unresolved path derived from ~/.agents/skills/understand-dashboard>}"
     echo "  - ${COPILOT_SELF_RELATIVE:-<unresolved path derived from ~/.copilot/skills/understand-dashboard>}"
     echo "  - $HOME/.codex/understand-anything/understand-anything-plugin"
     echo "  - $HOME/.opencode/understand-anything/understand-anything-plugin"
     echo "  - $HOME/.pi/understand-anything/understand-anything-plugin"
     echo "  - $HOME/understand-anything/understand-anything-plugin"
     echo "Make sure you followed the installation instructions for your platform."
     exit 1
   fi

   DASHBOARD_DIR="$PLUGIN_ROOT/packages/dashboard"
   ```

4. **快速路径——先尝试使用预构建查看器（无需安装、无需构建）。** 每个发布版本都包含一个自包含的查看器 tarball；按已安装插件版本运行它：
   ```bash
   : "${PLUGIN_ROOT:?Run step 3 first so PLUGIN_ROOT is set}"
   : "${PROJECT_DIR:?Run step 1 first so PROJECT_DIR is set}"
   PLUGIN_VERSION=$(node -p "require('$PLUGIN_ROOT/package.json').version")
   VIEWER_URL="https://github.com/Egonex-AI/Understand-Anything/releases/download/v${PLUGIN_VERSION}/understand-anything-viewer.tgz"
   npx --yes "$VIEWER_URL" "$PROJECT_DIR"
   ```
   在后台运行。它会打印与开发服务器相同的 `🔑  Dashboard URL` 行：
   - 如果该行出现，则**跳过步骤 5-6**，直接继续第 7 步。
   - 如果进程未打印该行就退出（该版本没有发布包，或无网络），则回退到步骤 5-6。

5. 回退方案：如有需要安装依赖并构建：
   ```bash
   : "${PLUGIN_ROOT:?Run step 3 first so PLUGIN_ROOT is set}"
   DASHBOARD_DIR="${DASHBOARD_DIR:-$PLUGIN_ROOT/packages/dashboard}"
   cd "$DASHBOARD_DIR" && (pnpm install --frozen-lockfile 2>/dev/null || pnpm install)
   ```
   然后确保核心包已构建（仪表盘依赖该包）：
   ```bash
   : "${PLUGIN_ROOT:?Run step 3 first so PLUGIN_ROOT is set}"
   cd "$PLUGIN_ROOT" && pnpm --filter @understand-anything/core build
   ```

6. 回退方案：启动指向项目知识图谱的 Vite 开发服务器：
   ```bash
   : "${PROJECT_DIR:?Run step 1 first so PROJECT_DIR is set}"
   : "${DASHBOARD_DIR:?Run step 5 first so DASHBOARD_DIR is set}"
   cd "$DASHBOARD_DIR" && GRAPH_DIR="$PROJECT_DIR" npx vite --host 127.0.0.1
   ```
   在后台运行，以便用户继续工作。

7. **从服务器输出中捕获访问令牌 URL。** 服务器（查看器或 Vite）会打印类似于以下内容的行：
   ```
   🔑  Dashboard URL: http://127.0.0.1:<PORT>?token=<TOKEN>
   ```
   提取包含 `?token=` 参数的完整 URL。该 token 用于访问知识图谱数据——如果缺少它，仪表盘会显示“Access Token Required”授权门禁。

8. 向用户报告，包括完整的含 token 的 URL：
   ```
   Dashboard started at http://127.0.0.1:<PORT>?token=<TOKEN>
   Viewing: $UA_DIR/knowledge-graph.json

   The dashboard is running in the background. Press Ctrl+C in the terminal to stop it.
   ```
   **重要：** 始终在你共享的 URL 中包含 `?token=` 参数。如果省略该参数，用户将被 token 门禁拦截，需要在终端输出中手动查找 token。

## 说明

- 快速路径（第 4 步）会从 GitHub 发布页下载一个版本固定的自包含查看器——不会向插件目录安装任何内容，也不会执行构建
- 仪表盘会在默认浏览器中自动打开（查看器和 Vite 的 `--open` 均会）
- 若端口 5173 已被占用，则会选择下一个可用端口（两种路径都如此）
- 在回退方案中，`GRAPH_DIR` 环境变量用于告诉开发服务器从何处读取知识图谱
