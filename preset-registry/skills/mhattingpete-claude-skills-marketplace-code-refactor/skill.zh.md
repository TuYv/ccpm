---
name: code-refactor
description: Perform bulk code refactoring operations like renaming variables/functions across files, replacing patterns, and updating API calls. Use when users request renaming identifiers, replacing deprecated code patterns, updating method calls, or making consistent changes across multiple locations.
---
# 代码重构

跨文件的系统化代码重构。对于 10 个以上的文件，**自动切换到执行模式**（节省 90% 的 token）。

## 模式选择

- **1-9 个文件**：使用原生工具（Grep + Edit 配合 replace_all）
- **10 个以上的文件**：自动使用 `code-execution` skill

**执行示例（50 个文件）：**
```python
from api.code_transform import rename_identifier
result = rename_identifier('.', 'oldName', 'newName', '**/*.py')
# Returns: {'files_modified': 50, 'total_replacements': 247}
# ~500 tokens vs ~25,000 tokens traditional
```

## 使用场景

- “将 [identifier] 重命名为 [new_name]”
- “将所有 [pattern] 替换为 [replacement]”
- “重构为使用 [new_pattern]”
- “更新对 [function/API] 的所有调用”
- “将 [old_pattern] 转换为 [new_pattern]”

## 核心工作流（原生模式）

### 1. 查找所有出现位置
```
Grep(pattern="getUserData", output_mode="files_with_matches")     # Find files
Grep(pattern="getUserData", output_mode="content", -n=true, -B=2, -A=2)  # Verify with context
```

### 2. 替换所有实例
```
Edit(
  file_path="src/api.js",
  old_string="getUserData",
  new_string="fetchUserData",
  replace_all=true
)
```

### 3. 验证更改
```
Grep(pattern="getUserData", output_mode="files_with_matches")  # Should return none
```

## 工作流示例

### 重命名函数
1. 查找：`Grep(pattern="getUserData", output_mode="files_with_matches")`
2. 统计：“在 5 个文件中找到 15 处”
3. 在每个文件中使用 `replace_all=true` 进行替换
4. 验证：重新运行 Grep
5. 建议：运行测试

### 替换已弃用的模式
1. 查找：`Grep(pattern="\\bvar\\s+\\w+", output_mode="content", -n=true)`
2. 分析：检查是否会被重新赋值（let），否则为常量（const）
3. 替换：`Edit(old_string="var count = 0", new_string="let count = 0")`
4. 验证：`npm run lint`

### 更新 API 调用
1. 查找：`Grep(pattern="/api/auth/login", output_mode="content", -n=true)`
2. 替换：`Edit(old_string="'/api/auth/login'", new_string="'/api/v2/authentication/login'", replace_all=true)`
3. 测试：建议运行集成测试

## 最佳实践

**规划：**
- 首先查找所有实例
- 检查每个匹配项的上下文
- 告知用户影响范围
- 考虑边界情况（字符串、注释）

**安全流程：**
1. 搜索 → 查找全部
2. 分析 → 验证是否适用
3. 告知 → 向用户说明影响范围
4. 执行 → 进行更改
5. 验证 → 确认已应用
6. 测试 → 建议运行测试

**边界情况：**
- 字符串/注释：询问是否需要更新
- 导出的 API：提醒存在破坏性变更
- 区分大小写：明确说明

## 工具参考

**配合 replace_all 使用 Edit：**
- `replace_all=true`：替换所有出现位置
- `replace_all=false`：仅替换第一个（如果存在多个则失败）
- 必须完全匹配（空格、引号）

**Grep 模式：**
- `-n=true`：显示行号
- `-B=N, -A=N`：上下文行
- `-i=true`：不区分大小写
- `type="py"`：按文件类型筛选

## 集成

- **test-fixing**：修复重构后失败的测试
- **code-transfer**：移动重构后的代码
- **feature-planning**：规划大型重构