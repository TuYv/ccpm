---
name: file-operations
description: Analyze files and get detailed metadata including size, line counts, modification times, and content statistics. Use when users request file information, statistics, or analysis without modifying files.
---
# 文件操作

使用 Claude 的原生工具分析文件并获取元数据，而不修改文件。

## 使用场景

- “分析 [file]”
- “获取 [file] 的文件信息”
- “[file] 有多少行”
- “比较 [file1] 和 [file2]”
- “文件统计信息”

## 核心操作

### 文件大小与元数据
```bash
stat -f "%z bytes, modified %Sm" [file_path]  # Single file
ls -lh [directory]                             # Multiple files
du -h [file_path]                              # Human-readable size
```

### 行数统计
```bash
wc -l [file_path]                              # Single file
wc -l [file1] [file2]                          # Multiple files
find [dir] -name "*.py" | xargs wc -l          # Directory total
```

### 内容分析
使用 **Read** 分析结构，然后统计函数、类和导入。

### 模式搜索
```
Grep(pattern="^def ", output_mode="count", path="src/")        # Count functions
Grep(pattern="TODO|FIXME", output_mode="content", -n=true)    # Find TODOs
Grep(pattern="^import ", output_mode="count")                 # Count imports
```

### 查找文件
```
Glob(pattern="**/*.py")
```

## 工作流示例

### 全面的文件分析
1. 获取大小和修改时间：`stat -f "%z bytes, modified %Sm" file.py`
2. 统计行数：`wc -l file.py`
3. 读取文件：`Read(file_path="file.py")`
4. 统计函数：`Grep(pattern="^def ", output_mode="count")`
5. 统计类：`Grep(pattern="^class ", output_mode="count")`

### 比较文件大小
1. 查找文件：`Glob(pattern="src/**/*.py")`
2. 获取大小：`ls -lh src/**/*.py`
3. 计算总大小：`du -sh src/*.py`

### 代码质量指标
1. 总行数：`find . -name "*.py" | xargs wc -l`
2. 测试文件：`find . -name "test_*.py" | wc -l`
3. 待办项：`Grep(pattern="TODO|FIXME|HACK", output_mode="count")`

### 查找最大的文件
```bash
find . -type f -not -path "./node_modules/*" -exec du -h {} + | sort -rh | head -20
```

## 最佳实践

- **非破坏性**：使用 Read/stat/wc，绝不修改文件
- **高效**：完整读取小文件，对大文件使用 Grep
- **关注上下文**：与项目平均水平比较，并提出优化建议

## 集成

可与以下技能配合使用：
- **code-auditor**：全面分析
- **code-transfer**：在识别出大型文件后使用
- **codebase-documenter**：了解文件用途