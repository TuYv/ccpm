---
name: mcp-smoke-test
description: Run a local smoke test for the Stata-MCP server.
---
# Stata-MCP 的 MCP 冒烟测试

本技能对本地 Stata-MCP 服务器执行端到端冒烟测试。
它会检查安装情况，运行具有代表性的数据与 Stata 命令，并报告每个工具的
通过/失败状态。

## 何时使用

- 用户询问 Stata-MCP 是否正常工作。
- 用户想要验证新的 MCP 服务器配置。
- 用户表示某个工具损坏或不可用。
- 用户要求进行冒烟测试、健全性检查或端到端测试。

## 开始之前

1. 确保当前工作目录是项目根目录。
2. 确认项目虚拟环境是否存在于 `./.venv/bin/stata-mcp`。
   如果不存在，请改用全局安装的 `stata-mcp` 命令。
3. 确保 `~/.statamcp/debug.toml` 存在且已启用 beta 安全。
   使用 `.claude/skills/mcp-smoke-test/config/debug.example.toml` 作为模板。

## 步骤 1：确保 MCP 服务器已注册

通过列出 Claude 的 MCP 服务器，检查 MCP 服务器 `stata-mcp-local-smoke-test` 是否可用：

```bash
claude mcp list
```

如果缺少 `stata-mcp-local-smoke-test`，请使用调试配置将其添加：

```bash
claude mcp add stata-mcp-local-smoke-test -s local -- $(pwd)/.venv/bin/stata-mcp -c ~/.statamcp/debug.toml
```

如果 `./.venv` 不存在，则使用：

```bash
claude mcp add stata-mcp-local-smoke-test -s local -- stata-mcp -c ~/.statamcp/debug.toml
```

添加之后，如果服务器仍不可用，请告知用户：

> MCP 服务器已添加但尚未可见。请重启 Claude 进程，然后再次运行冒烟测试。

## 步骤 2：运行冒烟测试

运行准备脚本。该脚本会清除缓存的摘要，查找或生成合适的 `auto.dta`，并将边界测试文件复制到 `/tmp`：

```bash
bash .claude/skills/mcp-smoke-test/scripts/prepare_smoke_test.sh
```

然后使用 `mcp__stata-mcp-local-smoke-test` 的工具（或上面注册的服务器名称）
执行下方的每项测试，并记录每一项的结果。

有关具体的工具调用参数、预期输出和故障排查，
请参阅 `.claude/skills/mcp-smoke-test/examples.md`。

### 测试 A — 对本地 Stata 示例文件执行 `get_data_info`

尝试此列表中第一个实际存在的文件：

- `/Applications/Stata/auto.dta`
- `/Applications/StataNow/auto.dta`

预期结果：包含 74 个观测值和 12 个变量的 JSON 摘要。

### 测试 B — 对允许访问的 URL 执行 `get_data_info`

使用此 URL（已在允许列表中）：

```
https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv
```

预期结果：包含 150 个观测值和 5 个变量的 JSON 摘要。

### 测试 C — 使用合法 dofile 执行 `stata_do`

使用 `stata_do` 运行随附的 dofile `.claude/skills/mcp-smoke-test/scripts/legal.do`。

预期结果：执行成功并返回日志文件路径。

### 测试 D — `stata_do` 安全边界（反向测试）

使用 `stata_do` 运行已复制的 dofile `/tmp/mcp_smoke_test_boundary.do`。

预期结果：被安全防护拦截，因为该 dofile 位于允许的工作目录之外。

### 测试 E — 对生成的日志执行 `read_log`

读取测试 C 返回的文本日志。预期结果：日志内容包含回归输出。

### 测试 F — 针对 Stata 命令的 `help`

以 `regress` 作为参数运行 `help`。预期结果：`regress` 的 Stata 帮助文本。

### 测试 G — `adopackage_install`（可选，需用户批准）

如果用户确认，则尝试安装一个小型 SSC 包，例如 `estout`。
预期结果：先出现用户批准提示，随后为安装日志。

如果用户拒绝，或该工具未注册（非 unsafe profile），则将此测试标记为跳过。

## 步骤 3：清理

运行清理脚本以删除临时文件和缓存的摘要：

```bash
bash .claude/skills/mcp-smoke-test/scripts/cleanup.sh
```

不要删除日志文件或数据摘要；它们对诊断很有帮助。

## 步骤 4：报告结果

使用以下模板返回一份简明的中文报告：

```markdown
# Stata-MCP 冒烟测试报告

## 服务器状态
- 注册状态：<已注册 / 新注册 / 需重启>
- 配置文件：`~/.statamcp/debug.toml`

## 测试结果
- [ ] Test A 本地 auto.dta 读取：<通过 / 失败 / 跳过> — 原因
- [ ] Test B URL 鸢尾花数据集读取：<通过 / 失败 / 跳过> — 原因
- [ ] Test C 合法 dofile 执行：<通过 / 失败 / 跳过> — 原因
- [ ] Test D 安全边界拦截：<通过 / 失败 / 跳过> — 原因
- [ ] Test E 日志读取：<通过 / 失败 / 跳过> — 原因
- [ ] Test F help 命令：<通过 / 失败 / 跳过> — 原因
- [ ] Test G ado 包安装：<通过 / 失败 / 跳过> — 原因

## 总结
<一句话结论：全部通过 / 部分失败 / 需要用户操作>
```

仅当观察到预期结果时，才将测试标记为通过。对于失败的情况，
请附上确切的错误消息或工具响应。

## 资源

| 资源 | 路径 | 用途 |
|----------|------|---------|
| 示例配置 | `.claude/skills/mcp-smoke-test/config/debug.example.toml` | 启用了 beta 安全的 `~/.statamcp/debug.toml` 模板 |
| 用法示例 | `.claude/skills/mcp-smoke-test/examples.md` | 具体的工具调用、预期输出和故障排查 |
| 合法 dofile | `.claude/skills/mcp-smoke-test/scripts/legal.do` | 用于测试 C 的有效 dofile |
| 边界 dofile | `.claude/skills/mcp-smoke-test/scripts/boundary.do` | 用于测试 D、引用 `/tmp/auto.dta` 的 dofile |
| 模拟数据生成器 | `.claude/skills/mcp-smoke-test/scripts/gen_mock_data.py` | 在系统示例文件不可用时生成 `auto.dta` |
| 准备脚本 | `.claude/skills/mcp-smoke-test/scripts/prepare_smoke_test.sh` | 准备所有测试产物 |
| 清理脚本 | `.claude/skills/mcp-smoke-test/scripts/cleanup.sh` | 删除临时测试产物 |
