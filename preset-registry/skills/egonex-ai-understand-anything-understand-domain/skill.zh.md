---
name: understand-domain
description: Extract business domain knowledge from a codebase and generate an interactive domain flow graph. Works standalone (lightweight scan) or derives from an existing /understand knowledge graph.
argument-hint: "[--full]"
---
# /understand-domain

从代码库中提取业务领域知识——领域、业务流程和流程步骤——并在仪表盘中生成一个可交互的水平流图。

## 工作原理

- 如果已存在知识图谱（`.ua/knowledge-graph.json`，或在该目录存在时使用旧版 `.understand-anything/knowledge-graph.json`），则从中提取领域知识（开销小，不扫描文件）
- 如果不存在知识图谱，则执行轻量扫描：文件树 + 入口点检测 + 抽样文件
- 使用 `--full` 标志可在知识图谱存在时强制执行全量扫描

## 说明

### 阶段 0：解析 `PROJECT_ROOT`

将 `PROJECT_ROOT` 设置为当前工作目录。

**工作树重定向。** 如果 `PROJECT_ROOT` 位于 git worktree 中（而非主检出仓库），则将输出重定向到主仓库根目录。Claude Code 管理的 worktree 是临时性的——写入其中的数据目录（`.ua/` 或旧版 `.understand-anything/`）会在会话结束时被销毁，领域图也会随之丢失（问题 #133）。通过比较 `git rev-parse --git-dir` 与 `git rev-parse --git-common-dir` 来检测 worktree；在普通检出或子模块中两者解析为同一路径，在 worktree 中则不同，且 `--git-common-dir` 的父目录即为主仓库根目录。

```bash
COMMON_DIR=$(git -C "$PROJECT_ROOT" rev-parse --git-common-dir 2>/dev/null)
GIT_DIR=$(git -C "$PROJECT_ROOT" rev-parse --git-dir 2>/dev/null)
if [ -n "$COMMON_DIR" ] && [ -n "$GIT_DIR" ]; then
  COMMON_ABS=$(cd "$PROJECT_ROOT" && cd "$COMMON_DIR" 2>/dev/null && pwd -P)
  GIT_ABS=$(cd "$PROJECT_ROOT" && cd "$GIT_DIR" 2>/dev/null && pwd -P)
  if [ -n "$COMMON_ABS" ] && [ "$COMMON_ABS" != "$GIT_ABS" ]; then
    MAIN_ROOT=$(dirname "$COMMON_ABS")
    if [ -d "$MAIN_ROOT" ] && [ "${UNDERSTAND_NO_WORKTREE_REDIRECT:-0}" != "1" ]; then
      echo "[understand-domain] Detected git worktree at $PROJECT_ROOT"
      echo "[understand-domain] Redirecting output to main repo root: $MAIN_ROOT"
      echo "[understand-domain] (Set UNDERSTAND_NO_WORKTREE_REDIRECT=1 to keep PROJECT_ROOT as the worktree.)"
      PROJECT_ROOT="$MAIN_ROOT"
    fi
  fi
fi
```

在后续阶段中，所有对“当前项目” / `<project-root>` 的引用都使用 `$PROJECT_ROOT`（而不是裸的当前工作目录）。

**解析数据目录 `$UA_DIR`。** 所有 Understand-Anything 的产物都存放在项目的数据目录中。现在已知 `$PROJECT_ROOT` 后先解析一次，并在后续阶段复用 `$UA_DIR` 处理所有读写：

```bash
UA_DIR="$PROJECT_ROOT/$([ -d "$PROJECT_ROOT/.understand-anything" ] && echo .understand-anything || echo .ua)"
```

这会在旧版 `.understand-anything/` 目录已存在时保留它（既有项目可直接继续运行，无需迁移），否则使用新的 `.ua/`。由于每个阶段可能在全新 shell 中运行，请像传递 `$PROJECT_ROOT` 一样传递 `$UA_DIR`；若后续命令块需要，按上面的命令再次解析。

**重要：** 不要假设插件根目录就是 skill 路径字符串的上两级目录。很多环境中 `~/.agents/skills/understand-domain` 是到真实插件检出目录的符号链接。应优先使用运行时提供的插件根目录（针对 Claude），其次再回退到通用符号链接、skill 符号链接解析以及常见基于克隆的安装路径。

按如下方式解析插件根目录：

```bash
SKILL_REAL=$(realpath ~/.agents/skills/understand-domain 2>/dev/null || readlink -f ~/.agents/skills/understand-domain 2>/dev/null || echo "")
SELF_RELATIVE=$([ -n "$SKILL_REAL" ] && cd "$SKILL_REAL/../.." 2>/dev/null && pwd || echo "")
COPILOT_SKILL_REAL=$(realpath ~/.copilot/skills/understand-domain 2>/dev/null || readlink -f ~/.copilot/skills/understand-domain 2>/dev/null || echo "")
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
  if [ -n "$candidate" ] && [ -f "$candidate/package.json" ] && [ -f "$candidate/pnpm-workspace.yaml" ]; then
    PLUGIN_ROOT="$candidate"
    break
  fi
done

if [ -z "$PLUGIN_ROOT" ]; then
  echo "Error: Cannot find the understand-anything plugin root."
  echo "Checked:"
  echo "  - ${CLAUDE_PLUGIN_ROOT:-<unset CLAUDE_PLUGIN_ROOT>}"
  echo "  - $HOME/.understand-anything-plugin"
  echo "  - ${SELF_RELATIVE:-<unresolved path derived from ~/.agents/skills/understand-domain>}"
  echo "  - ${COPILOT_SELF_RELATIVE:-<unresolved path derived from ~/.copilot/skills/understand-domain>}"
  echo "  - $HOME/.codex/understand-anything/understand-anything-plugin"
  echo "  - $HOME/.opencode/understand-anything/understand-anything-plugin"
  echo "  - $HOME/.pi/understand-anything/understand-anything-plugin"
  echo "  - $HOME/understand-anything/understand-anything-plugin"
  echo "Make sure the plugin is installed correctly."
  exit 1
fi
```

后续阶段中所有对 agent 定义的引用都使用 `$PLUGIN_ROOT`。

### 阶段 1：检测现有图谱

1. 检查 `$UA_DIR/knowledge-graph.json` 是否存在
2. 如果存在且未传入 `--full`，在从中提取前先检查是否为最新：
   - 从图谱元数据读取 `project.gitCommitHash` 并命名为 `GRAPH_COMMIT_RAW`。在用于任何 Git diff 前先将其解析为提交对象，然后与 `git rev-parse HEAD` 比较，并检查项目范围内已提交与工作区变更：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - 必须使用 `-- .` 路径规范：仅修改同级 monorepo 项目的提交不应使此图谱判定为过时。当项目差异为空时，仅有 hash 不一致并不算过时。
   - 在每个命令的输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为其中包含生成的图谱产物，不是项目源代码漂移。
   - 若已提交差异或任一工作区命令报告了项目文件，需警告领域提取可能遗漏这些变更。建议：运行 `/understand` 刷新知识图谱。
   - 仅在 `GRAPH_COMMIT_RAW` 成功解析时才执行提交差异。如果图谱提交或 Git 元数据缺失、无效或不可用，则给出简短的尽力提示并继续执行，不要阻塞。
3. 完成该预检后，进入阶段 3（从图谱推导）。
4. 否则，进入阶段 2（轻量扫描）。当使用 `--full` 时，跳过该预检，因为该命令会执行全量扫描而不是复用现有图谱。

### 阶段 2：轻量扫描（路径 1）

预处理脚本不会生成领域图谱——它生成的是**原始素材**（文件树、入口点、导入/导出），以便 domain-analyzer agent 将精力集中在真实的领域分析上，而不是花费大量工具调用去探索代码库。你可以把它看作一份速查表：低成本 Python 预处理 → 昂贵的 LLM 获得清晰且精简的输入 → 更低成本下获得更好结果。

1. 运行该 skill 附带的预处理脚本，并传入阶段 0 的 `$PROJECT_ROOT`：
   ```
   python ./extract-domain-context.py "$PROJECT_ROOT"
   ```
   该脚本输出 `$UA_DIR/intermediate/domain-context.json`，内容包括：
   - 文件树（遵循 `.gitignore`）
   - 检测到的入口点（HTTP 路由、CLI 命令、事件处理器、定时任务、已导出处理器）
   - 文件签名（每个文件的导入/导出）
   - 每个入口点的代码片段（签名 + 前几行）
   - 项目元数据（package.json、README 等）
2. 将生成的 `domain-context.json` 作为阶段 4 的上下文读取
3. 进入阶段 4

### 第3阶段：从现有图派生（路径2）

1. 读取 `$UA_DIR/knowledge-graph.json`
2. 将图数据格式化为结构化上下文：
   - 所有节点及其类型、名称、摘要和标签
   - 所有边及其类型（尤其是 `calls`、`imports`、`contains`）
   - 所有层及其说明
   - 如有 Tour 步骤
3. 这是 domain analyzer 的上下文——无需读取文件
4. 继续进入第4阶段

### 第4阶段：领域分析

1. 从 `$PLUGIN_ROOT/agents/domain-analyzer.md` 读取 domain-analyzer agent 提示词
2. 使用 domain-analyzer 提示词加上第2或第3阶段的上下文分发一个子代理
3. 代理将输出写入 `$UA_DIR/intermediate/domain-analysis.json`

### 第5阶段：验证和保存

1. 读取领域分析输出
2. 使用标准图验证流程进行校验（该 schema 现已支持 domain/flow/step 类型）
3. 如果校验失败，记录警告但仍保存有效内容（容错）
4. 保存到 `$UA_DIR/domain-graph.json`
5. 清理 `$UA_DIR/intermediate/domain-analysis.json` 和 `$UA_DIR/intermediate/domain-context.json`

### 第6阶段：启动仪表板

1. 自动触发 `/understand-dashboard` 以可视化领域图
2. 仪表板会检测 `domain-graph.json` 并默认显示领域视图
