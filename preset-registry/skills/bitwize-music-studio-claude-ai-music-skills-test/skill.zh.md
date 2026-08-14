---
name: test
description: Runs automated tests to validate plugin integrity across 14 categories. Use before creating PRs, after making changes to skills or templates, or to verify plugin health.
argument-hint: "[all | config | skills | templates | workflow | suno | research | mastering | sheet-music | release | consistency | terminology | behavior | quality | quick]"
model: haiku
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---
## 你的任务

**输入**：$ARGUMENTS

运行自动化测试以验证插件完整性。按步骤执行每项测试，并清晰报告结果。

**默认行为**：如果未提供参数，则运行所有测试。

---

# 插件测试套件

你是该插件的自动化测试运行器。执行每项测试，跟踪通过/失败状态，并报告可采取行动的结果。

## 快速自动化测试（`/test quick`）

如需快速进行自动化验证，请运行 pytest 套件。首先调用 `get_python_command()` 获取 `$PYTHON`（虚拟环境解释器路径——在包括原生 Windows 在内的所有操作系统上均正确）：

```bash
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/ -v
```

涵盖以下内容：
- **插件测试**（`tests/plugin/`）- Frontmatter、模板、参考资料、链接、术语、一致性、配置、状态、流派、集成
- **单元测试**（`tests/unit/`）- 状态解析器/索引器、共享工具、母带处理函数

运行特定类别：
```bash
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/plugin/test_skills.py -v       # Skills only
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/plugin/ -v                      # All plugin tests
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/unit/ -v                        # All unit tests
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/ -m "not slow" -v               # Skip slow tests
```

Pytest 能够快速发现常见问题。如需进行深入的行为测试，请使用下方的完整测试套件。

## 输出格式

```
════════════════════════════════════════
CATEGORY: Test Category Name
════════════════════════════════════════

[PASS] Test name
[FAIL] Test name
       → Problem: what's wrong
       → File: path/to/file:line
       → Fix: specific fix instruction

────────────────────────────────────────
Category: X passed, Y failed
────────────────────────────────────────
```

最后：
```
════════════════════════════════════════
FINAL RESULTS
════════════════════════════════════════
config:       X passed, Y failed
skills:       X passed, Y failed
templates:    X passed, Y failed
...
────────────────────────────────────────
TOTAL:        X passed, Y failed, Z skipped
════════════════════════════════════════
```

---


# 测试类别

所有测试定义均位于 [test-definitions.md](test-definitions.md)。

共 14 个类别：config、skills、templates、workflow、suno、research、mastering、sheet-music、release、consistency、terminology、behavior、quality、e2e。

运行测试前请阅读该文件，以了解每项测试所检查的内容。

---

# 运行测试

## 命令

| 命令 | 说明 |
|---------|-------------|
| `/test` 或 `/test all` | 运行所有测试 |
| `/test quick` | 运行 Python 测试运行器（快速自动化检查） |
| `/test config` | 配置系统测试 |
| `/test skills` | Skill 定义和文档 |
| `/test templates` | 模板文件测试 |
| `/test workflow` | 专辑工作流文档 |
| `/test suno` | Suno 集成测试 |
| `/test research` | 研究工作流测试 |
| `/test mastering` | 母带处理工作流测试 |
| `/test sheet-music` | 乐谱生成测试 |
| `/test release` | 发布工作流测试 |
| `/test consistency` | 交叉引用检查 |
| `/test terminology` | 语言一致性测试 |
| `/test behavior` | 基于场景的测试 |
| `/test quality` | 代码质量检查 |
| `/test e2e` | 端到端集成测试 |

## 通过 Pytest 进行快速测试

为了在开发期间快速验证，请直接使用 pytest。首先调用 `get_python_command()` 获取 `$PYTHON`（虚拟环境解释器路径——在所有操作系统上均正确）：

```bash
# Run all tests
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/ -v

# Run specific test modules
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/plugin/test_skills.py ${CLAUDE_PLUGIN_ROOT}/tests/plugin/test_templates.py -v

# Verbose with short tracebacks
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/ -v --tb=short

# Quiet mode (for CI/logs)
$PYTHON -m pytest ${CLAUDE_PLUGIN_ROOT}/tests/ -q --tb=line
```

`tests/plugin/` 中的测试模块：
- `test_skills.py` - 前置元数据、必填字段、模型验证
- `test_templates.py` - 模板是否存在及其结构
- `test_references.py` - 参考文档是否存在
- `test_links.py` - 内部 Markdown 链接
- `test_terminology.py` - 已弃用术语检查
- `test_consistency.py` - 版本同步、Skill 数量
- `test_config.py` - 配置文件验证
- `test_state.py` - 状态缓存工具验证
- `test_genres.py` - 类型目录交叉引用
- `test_integration.py` - 跨 Skill 前置条件链

## 添加新测试

发现 Bug 时：
1. 确定该测试所属的类别
2. 添加一个本可以捕获该 Bug 的测试
3. 运行 `/test [category]`，验证测试失败
4. 修复 Bug
5. 运行 `/test [category]`，验证测试通过
6. 同时提交修复和新测试

**规则：** 每个 Bug 修复都应添加回归测试。

---

# 执行技巧

- 使用 Grep，并设置 `output_mode: content` 和 `-n` 以显示行号
- 使用 Glob 按模式查找文件
- 使用 Read 检查文件内容
- 谨慎使用 Bash（用于 YAML/JSON 验证）
- 报告失败时提供准确的文件和行号
- 提供具体且可操作的修复说明
- 将相关测试分组以提高可读性
- 如果缺少前置条件，则妥善跳过测试