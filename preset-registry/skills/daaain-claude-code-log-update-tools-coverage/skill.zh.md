---
name: update-tools-coverage
description: Refresh dev-docs/tools-coverage.md against the upstream Claude Code tools reference and the Codex app-server item schema. Use when checkpointing tool-renderer/provider coverage, after adding/removing a renderer or Codex adapter, or when either upstream taxonomy may have changed.
---
# 更新工具覆盖情况

确保 [`dev-docs/tools-coverage.md`](../../../dev-docs/tools-coverage.md) 与上游约定及我们的实现保持同步：

1. **上游** — <https://code.claude.com/docs/en/tools-reference> 中记录的工具列表。
2. **我们** — [`claude_code_log/factories/tool_factory.py`](../../../claude_code_log/factories/tool_factory.py) 中的 `TOOL_INPUT_MODELS` / `TOOL_OUTPUT_PARSERS`。
3. **Codex** — 已安装版本所生成的 app-server `ThreadItem` schema，以及 `providers/codex.py`、`providers/codex_tools.py` 和 `providers/codex_javascript.py` 中的 rollout 适配器。

该文档将每个有文档记录的工具评为 **完整**（类型化输入 + 类型化输出）、**仅输入**（类型化输入、通用输出）或 **通用**（无注册表条目 → 参数表 + 原始 `<pre>` 回退），并单独列出我们支持但上游不再记录的工具（例如 `Task`→`Agent` 这类重命名、`MultiEdit` 这类已被取代的工具、旧版别名以及未记录的功能）。

## Claude Code 流程

1. **获取上游工具名称。** 使用 WebFetch 获取参考页面，并且只请求工具表中的名称（该页面约为 80 KB；有针对性的提示词可使结果保持在可管理的范围内）：

   > WebFetch `https://code.claude.com/docs/en/tools-reference` —
   > “逐行列出主工具表中的准确工具名称。
   > 只要名称，不要描述。”

   记下页面中标为已弃用/已重命名的所有工具——它们可能需要放入第二个表格。

2. **通过机械方式计算事实结果。** 将这些名称传给随附的辅助工具（从仓库根目录运行；必须使用 `uv run`，这样才能解析 `pydantic`——直接使用 `python3` 会因 `ModuleNotFoundError: pydantic` 而失败）：

   ```bash
   printf 'Agent Artifact AskUserQuestion ... Write' \
     | uv run python .claude/skills/update-tools-coverage/check_coverage.py
   ```

   它会输出每个工具的支持级别、总数、“我们已注册但上游未记录”的集合，以及——如果文档存在——一份**漂移报告**（缺失 / 不匹配 / 过时的行）。如果它显示 `in sync [OK]`，且上游名称集合未发生变化，则无需进行任何操作。

3. **协调文档。** 根据辅助工具的输出更新 `dev-docs/tools-coverage.md`：
   - 当工具进入/离开上游列表时，在两个表格之间移动对应行——对于我们仍然注册的工具，**绝不要删除**其所在行。离开参考列表的工具应移至“不再记录”表格（它属于转录查看器仍须渲染的历史内容）；其支持不会因此被移除。
   - 修正漂移报告标出的所有支持级别。
   - 更新简介中的**总数行**和**快照日期**（`snapshot YYYY-MM-DD`）。
   - **备注列由人工维护**——保留已有备注；只有支持级别是由机器生成的。

4. **重新运行辅助工具**，确认显示 `in sync [OK]`。

## Codex 流程

Codex 函数/MCP/插件名称是开放式的，因此不要尝试创建封闭的上游函数名称列表。应分别检查两个表格：

1. 为已安装的 Codex 版本生成公共语义条目 schema：

```bash
   codex --version
   codex app-server generate-json-schema --out /tmp/codex-app-server-schema
   ```

2. 读取
   `/tmp/codex-app-server-schema/codex_app_server_protocol.v2.schemas.json`
   中的 `definitions.ThreadItem.oneOf`。
   将新增/移除的变体与“Codex 提供程序覆盖范围 / 公共条目系列”核对，并更新其版本、日期和总数。
   编辑后运行本地漂移检查器：

   ```bash
   uv run python .claude/skills/update-tools-coverage/check_codex_coverage.py \
     /tmp/codex-app-server-schema/codex_app_server_protocol.v2.schemas.json
   ```

3. 将具体调用映射与 `providers/codex_tools.py` 中的 `_canonicalize()`、
   `providers/codex.py` 中的结果/批次重建，以及 `test/test_codex_*`
   契约进行核对。
4. 将静态 JavaScript 列表与 `providers/codex_javascript.py` 中列入白名单的传输
   函数进行核对。绝不要将旧版正则表达式支持描述为生产环境回退机制：
   保留它仅是为了用作显式的测试对比基线。

生成的模式特定于版本，且 rollout 格式并非公共线路契约。
请在文档快照中明确说明这两个事实。

## 防护准则

- **通用是一项特性，而非缺陷。** 未知工具 / `mcp__*` / 插件工具
  *应当*回退到通用渲染。只有当某个工具很常用或包含值得呈现的结构时，才应为其指定类型——请参阅
  [`implementing-a-tool-renderer.md`](../../../dev-docs/implementing-a-tool-renderer.md)
  （或 `tool-renderer` skill）以实际添加渲染器。
- **未记录 ≠ 已废弃。** 参考表并不是对 JSONL 文件中所有内容的完整普查
  （例如，`TeamCreate`/`TeamDelete` 在两端都有类型定义，但从未在上游出现）。
  请将这些内容保留在“不再记录/从未记录”之下并附上说明，而不要将其移除。
- **无效模型。** `GlobOutput` / `GrepOutput` 存在于 `models.py` 中，但没有
  解析器会构造它们，因此 `Glob`/`Grep` **仅支持输入**。如果未来的更改接入了
  解析器，它们将自动升级为完整支持——辅助程序会显示这一变化。