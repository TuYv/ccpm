---
name: code-transfer
description: Transfer code between files with line-based precision. Use when users request copying code from one location to another, moving functions or classes between files, extracting code blocks, or inserting code at specific line numbers.
---
# 代码转移

以精确的行级控制在文件之间转移代码。**双模式运行**：原生工具（1-10 个文件）或执行模式（10 个以上文件，节省 90% 的 token）。

## 运行模式

### 基础模式（默认）
使用 Read、Edit、Bash 脚本处理 1-10 个文件的操作。可立即使用，无需设置。

### 执行模式（10 个以上文件）
```python
from api.filesystem import batch_copy
from api.code_analysis import find_functions

functions = find_functions('app.py', pattern='handle_.*')
operations = [{
    'source_file': 'app.py',
    'start_line': f['start_line'],
    'end_line': f['end_line'],
    'target_file': 'handlers.py',
    'target_line': -1
} for f in functions]
batch_copy(operations)
```

## 适用场景

- “将这段代码复制到 [file]”
- “将 [function/class] 移动到 [file]”
- “将其提取到新文件中”
- “在第 [number] 行插入”
- “重新组织到不同文件中”

## 核心操作

### 1. 提取源代码
```
Read(file_path="src/auth.py")                              # Full file
Read(file_path="src/auth.py", offset=10, limit=20)         # Line range
Grep(pattern="def authenticate", -n=true, -A=10)           # Find function
```

### 2. 在指定行插入
使用 `line_insert.py` 脚本进行基于行的插入：

```bash
python3 skills/code-transfer/scripts/line_insert.py <file> <line_number> <code> [--backup]
```

**示例：**
```bash
# Insert function at line 50
python3 skills/code-transfer/scripts/line_insert.py src/utils.py 50 "def helper():\n    pass"

# Insert with backup
python3 skills/code-transfer/scripts/line_insert.py src/utils.py 50 "code" --backup

# Insert at beginning
python3 skills/code-transfer/scripts/line_insert.py src/new.py 1 "import os"
```

**适用场景：**
- 用户指定了确切的行号
- 插入到新文件或空文件中
- 在开头或结尾插入，且无需参考上下文

### 3. 相对于内容插入
当插入点相对于现有代码时，使用 **Edit**：

```
Edit(
  file_path="src/utils.py",
  old_string="def existing():\n    pass",
  new_string="def existing():\n    pass\n\ndef new():\n    return True"
)
```

## 工作流示例

### 在文件之间复制函数
1. 查找：`Grep(pattern="def validate_user", -n=true, -A=20)`
2. 提取：`Read(file_path="auth.py", offset=45, limit=15)`
3. 检查目标文件：`Read(file_path="validators.py")`
4. 插入：根据上下文使用 `line_insert.py` 或 Edit

### 将类提取到新文件
1. 定位：`Grep(pattern="class DatabaseConnection", -n=true, -A=50)`
2. 提取：`Read(file_path="original.py", offset=100, limit=50)`
3. 创建：`Write(file_path="database.py", content="<extracted>")`
4. 更新导入：在原文件中使用 `Edit`
5. 移除旧类：使用 `Edit` 进行替换

### 在指定行插入
1. 验证：`Read(file_path="main.py", offset=20, limit=10)`
2. 插入：`python3 skills/code-transfer/scripts/line_insert.py main.py 25 "logger.info('...')" --backup`
3. 验证：`Read(file_path="main.py", offset=23, limit=5)`

### 重新组织为模块
1. 分析：`Read(file_path="utils.py")`
2. 识别分组：`Grep(pattern="^def |^class ", -n=true)`
3. 提取各个类别：使用 `Write` 创建新文件
4. 更新原文件：重新导出或重定向

## 最佳实践

**规划：**
- 了解依赖关系（导入、引用）
- 确定代码块的确切起止位置
- 检查目标文件结构
- 确保包含必要的导入

**保留：**
- 包含文档字符串和注释
- 将相关函数一起转移
- 更新两个文件中的导入
- 保持格式和缩进

**验证：**
- 验证插入位置
- 检查语法
- 测试导入
- 建议运行测试

**备份：**
- 对重大更改使用 `--backup`
- 关键文件操作
- 大规模删除

## 集成

- **code-refactor**：转移后进行重构
- **test-fixing**：重新组织后运行测试
- **feature-planning**：规划大规模重新组织