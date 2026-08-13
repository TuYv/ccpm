---
name: understand-domain
description: Extract business domain knowledge from a codebase and generate an interactive domain flow graph. Works standalone (lightweight scan) or derives from an existing /understand knowledge graph.
argument-hint: "[--full]"
---
# /understand-domain

从代码库中提取业务领域知识（领域、业务流程与流程步骤），并在仪表盘中生成交互式水平流向图。

## 工作原理

- 如果知识图谱已存在（`.ua/knowledge-graph.json`，或在该目录存在时使用旧版 `.understand-anything/knowledge-graph.json`），则从其中派生领域知识（成本低，不扫描文件）
- 如果知识图谱不存在，则执行轻量级扫描：文件树 + 入口点检测 + 采样文件
- 使用 `--full` 标志可强制执行全量扫描，即使知识图谱已存在也会重新扫描

## 使用说明

### 阶段 0：解析 `PROJECT_ROOT`

将 `PROJECT_ROOT` 设置为当前工作目录。

**Worktree 重定向。** 如果 `PROJECT_ROOT` 位于 Git worktree 中（而非主检出），则将输出重定向到主仓库根目录。由 Claude Code 管理的 worktree 是临时的——其中写入的数据目录（`.ua/` 或旧版 `.understand-anything/`）会在会话结束时被销毁，从而丢失领域图（问题 #133）。通过比较 `git rev-parse --git-dir` 与 `git rev-parse --git-common-dir` 来检测 worktree；在普通检出或子模块中它们解析为同一路径，在 worktree 中则不同，`--git-common-dir` 的父目录即主仓库根目录。

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

在后续阶段中，关于“当前项目”/`<project-root>`的所有引用都使用 `$PROJECT_ROOT`（而不是裸 CWD）。

**解析数据目录 `$UA_DIR`。** 所有 Understand-Anything 产物都位于项目的数据目录。解析一次该目录（在确定 `$PROJECT_ROOT` 之后），并在后续阶段所有读写中复用 `$UA_DIR`：
```bash
UA_DIR="$PROJECT_ROOT/$([ -d "$PROJECT_ROOT/.understand-anything" ] && echo .understand-anything || echo .ua)"
```
这会在旧的 `.understand-anything/` 目录已存在时保留它（既有项目在不迁移的情况下继续工作），否则使用新的 `.ua/`。由于每个阶段可能在全新 shell 中运行，请像携带 `$PROJECT_ROOT` 一样向后传递 `$UA_DIR`；如果后续命令块需要，请用上述语句重新解析。

**重要：** 不要假设插件根目录就是 skill 路径字符串上方两级目录。在许多安装环境中，`~/.agents/skills/understand-domain` 是指向真实插件检出目录的符号链接。请优先使用运行时提供的插件根目录（供 Claude），然后再回退到通用符号链接、skill 符号链接解析以及基于克隆的常见安装路径。

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

在后续阶段中，所有对 agent 定义的引用都使用 `$PLUGIN_ROOT`。

### 阶段 1：检测现有图谱

1. 检查 `$UA_DIR/knowledge-graph.json` 是否存在
2. 如果它存在且未传入 `--full`，则在使用前检查新鲜度：
   - 从图谱元数据中读取 `project.gitCommitHash` 作为 `GRAPH_COMMIT_RAW`。在用于任何 Git diff 前先将其解析为 commit，再与 `git rev-parse HEAD` 对比，并检查项目作用域的已提交与工作树变更：
     ```bash
     GRAPH_COMMIT=$(git rev-parse --verify --end-of-options "${GRAPH_COMMIT_RAW}^{commit}" 2>/dev/null)
     git rev-parse HEAD
     git diff --name-only "$GRAPH_COMMIT" HEAD -- .
     git diff --cached --name-only -- .
     git diff --name-only -- .
     git ls-files --others --exclude-standard -- .
     ```
   - `-- .` 的 pathspec 是必需的：只修改同一单体库中同级项目的提交不应使该图谱过期。若项目差异为空，仅凭哈希不匹配不算过期。
   - 在每个命令输出中忽略所选数据目录（`.ua/` 或旧版 `.understand-anything/`），因为其中包含的是生成的图谱产物，而非项目源码漂移。
   - 如果已提交 diff 或任一工作树命令报告了项目文件，请警告领域抽取可能遗漏这些变更。建议：运行 `/understand` 来刷新知识图谱。
   - 仅在 `GRAPH_COMMIT_RAW` 成功解析时才执行提交 diff。如果图谱提交或 Git 元数据缺失、无效或不可用，请给出简短的尽力而为警告并继续，不要阻塞流程。
3. 完成该预检后，继续执行阶段 3（从图谱推导）。
4. 否则，继续执行阶段 2（轻量扫描）。当使用 `--full` 时，跳过该预检，因为命令将执行全量扫描，而不是复用现有图谱。

### 阶段 2：轻量扫描（路径 1）

预处理脚本不会生成领域图谱——它仅生成**原始素材**（文件树、入口点、导入导出），以便 domain-analyzer agent 可以专注于实际领域分析，而不是花费大量工具调用去遍历整个代码库。可以把它看作一个备忘清单：低成本 Python 预处理 → 昂贵的 LLM 获得更小更干净的输入 → 更低成本下更好的结果。

1. 运行随该 skill 附带的预处理脚本，传入阶段 0 的 `$PROJECT_ROOT`：
   ```
   python ./extract-domain-context.py "$PROJECT_ROOT"
   ```
   该脚本输出 `$UA_DIR/intermediate/domain-context.json`，包含：
   - 文件树（遵循 `.gitignore`）
   - 检测到的入口点（HTTP 路由、CLI 命令、事件处理器、定时任务、导出的处理器）
   - 文件签名（每个文件的导出、导入）
   - 每个入口点的代码片段（签名 + 前几行）
   - 项目元数据（`package.json`、`README` 等）
2. 将生成的 `domain-context.json` 作为阶段 4 的上下文读取
3. 继续进入阶段 4

### 第 3 阶段：从现有图谱推导（路径 2）

1. 读取 `$UA_DIR/knowledge-graph.json`
2. 将图数据整理为结构化上下文：
   - 所有节点及其类型、名称、摘要和标签
   - 所有边及其类型（尤其是 `calls`、`imports`、`contains`）
   - 所有层级及其说明
   - 若可用则包含导览步骤
3. 这是领域分析器使用的上下文——无需再读取文件
4. 进入第 4 阶段

### 第 4 阶段：领域分析

1. 从 `$PLUGIN_ROOT/agents/domain-analyzer.md` 读取 domain-analyzer 代理提示
2. 使用该 domain-analyzer 提示 + 第 2 阶段或第 3 阶段的上下文派发一个子代理
3. 代理将其输出写入 `$UA_DIR/intermediate/domain-analysis.json`

### 第 5 阶段：验证与保存

1. 读取领域分析输出
2. 使用标准图验证流水线进行校验（schema 现已支持 `domain/flow/step` 类型）
3. 如果校验失败，记录警告但仍保存有效内容（错误容忍）
4. 保存到 `$UA_DIR/domain-graph.json`
5. 清理 `$UA_DIR/intermediate/domain-analysis.json` 和 `$UA_DIR/intermediate/domain-context.json`

### 第 6 阶段：启动仪表板

1. 自动触发 `/understand-dashboard` 来可视化领域图
2. 仪表板会检测到 `domain-graph.json` 并默认显示领域视图
