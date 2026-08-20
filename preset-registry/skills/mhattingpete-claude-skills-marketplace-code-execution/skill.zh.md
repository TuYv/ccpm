---
name: code-execution
description: Execute Python code locally with marketplace API access for 90%+ token savings on bulk operations. Activates when user requests bulk operations (10+ files), complex multi-step workflows, iterative processing, or mentions efficiency/performance.
---
# 代码执行

通过 API 访问在本地执行 Python。批量操作可**节省 90-99% 的 token**。

## 何时使用

- 批量操作（10 个以上文件）
- 复杂的多步骤工作流
- 跨多个文件的迭代处理
- 用户提到效率/性能

## 使用方法

在 Claude Code 中直接导入 Python：

```python
from execution_runtime import fs, code, transform, git

# Code analysis (metadata only!)
functions = code.find_functions('app.py', pattern='handle_.*')

# File operations
code_block = fs.copy_lines('source.py', 10, 20)
fs.paste_code('target.py', 50, code_block)

# Bulk transformations
result = transform.rename_identifier('.', 'oldName', 'newName', '**/*.py')

# Git operations
git.git_add(['.'])
git.git_commit('feat: refactor code')
```

**如果尚未安装：**运行 `~/.claude/plugins/marketplaces/mhattingpete-claude-skills/execution-runtime/setup.sh`

## 可用 API

- **文件系统**（`fs`）：copy_lines、paste_code、search_replace、batch_copy
- **代码分析**（`code`）：find_functions、find_classes、analyze_dependencies——仅返回元数据！
- **转换**（`transform`）：rename_identifier、remove_debug_statements、batch_refactor
- **Git**（`git`）：git_status、git_add、git_commit、git_push

## 模式

1. **在本地分析**（仅元数据，不包含源代码）
2. **在本地处理**（所有操作均在执行环境中进行）
3. **返回摘要**（而不是数据！）

## 示例

**批量重构（50 个文件）：**
```python
from execution_runtime import transform
result = transform.rename_identifier('.', 'oldName', 'newName', '**/*.py')
# Returns: {'files_modified': 50, 'total_replacements': 247}
```

**提取函数：**
```python
from execution_runtime import code, fs

functions = code.find_functions('app.py', pattern='.*_util$')  # Metadata only!
for func in functions:
    code_block = fs.copy_lines('app.py', func['start_line'], func['end_line'])
    fs.paste_code('utils.py', -1, code_block)

result = {'functions_moved': len(functions)}
```

**代码审计（100 个文件）：**
```python
from execution_runtime import code
from pathlib import Path

files = list(Path('.').glob('**/*.py'))
issues = []

for file in files:
    deps = code.analyze_dependencies(str(file))  # Metadata only!
    if deps.get('complexity', 0) > 15:
        issues.append({'file': str(file), 'complexity': deps['complexity']})

result = {'files_audited': len(files), 'high_complexity': len(issues)}
```

## 最佳实践

✅ 返回摘要，而不是数据  
✅ 使用 code_analysis（返回元数据，而不是源代码）  
✅ 使用批量操作  
✅ 处理错误并返回错误计数

❌ 不要将所有代码返回到上下文中  
❌ 当只需要元数据时，不要读取完整源代码  
❌ 不要逐个处理文件

## Token 节省量

| 文件数 | 传统方式 | 代码执行 | 节省比例 |
|-------|-------------|-----------|---------|
| 10 | 5K tokens | 500 | 90% |
| 50 | 25K tokens | 600 | 97.6% |
| 100 | 150K tokens | 1K | 99.3% |