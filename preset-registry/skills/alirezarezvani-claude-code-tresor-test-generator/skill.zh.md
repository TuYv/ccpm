---
name: test-generator
description: Automatically suggest tests for new functions and components. Use when new code is written, functions added, or user mentions testing. Creates test scaffolding with Jest, Vitest, Pytest patterns. Triggers on new functions, components, test requests, testing mentions.
allowed-tools: Read, Write, Edit
---
# 测试生成器 Skill

编写新代码时自动建议测试。

## 何时激活

- ✅ 创建了新函数
- ✅ 添加了新组件
- ✅ 用户提到测试
- ✅ 实现代码缺少测试文件
- ✅ 用户询问“你能测试一下吗？”

## 我会生成什么

### 快速测试脚手架
- 基本的正常路径测试
- Null/undefined 边界情况
- 简单的错误场景
- 适合相应框架的语法（Jest/Vitest/Pytest）

### 我不会做什么
- 全面的测试套件 → 使用 **@test-engineer** 子代理
- 集成测试 → 使用 **@test-engineer** 子代理
- E2E 测试设计 → 使用 **@test-engineer** 子代理
- 测试策略规划 → 使用 **@test-engineer** 子代理

## 与 @test-engineer 子代理的关系

**我（Skill）：** 快速搭建测试脚手架
**@test-engineer（子代理）：** 全面的测试策略

### 工作流程
1. 你编写一个函数
2. 我自动生成基本测试结构
3. 你需要完整的测试套件 → 调用 **@test-engineer** 子代理
4. 子代理创建全面的测试

## 示例

### JavaScript 函数

```javascript
// You write:
function calculateDiscount(price, percentage) {
  if (price <= 0) throw new Error('Invalid price');
  return price * (percentage / 100);
}

// I auto-generate:
describe('calculateDiscount', () => {
  it('calculates discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(10);
  });

  it('throws error for invalid price', () => {
    expect(() => calculateDiscount(0, 10)).toThrow('Invalid price');
  });

  it('handles zero percentage', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });

  // TODO: Add more edge cases
  // Consider: negative percentages, decimal values, very large numbers
});
```

### React 组件

```jsx
// You write:
function UserCard({ user, onEdit }) {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
}

// I auto-generate:
import { render, screen, fireEvent } from '@testing-library/react';

describe('UserCard', () => {
  const mockUser = { id: 1, name: 'John Doe' };
  const mockOnEdit = jest.fn();

  it('renders user name', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit with user id when button clicked', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  // TODO: Add tests for edge cases
  // - Missing user data
  // - Undefined onEdit
  // - Long names (UI testing)
});
```

### Python 函数

```python
# You write:
def fetch_user_data(user_id: int) -> dict:
    if user_id <= 0:
        raise ValueError("Invalid user ID")
    return db.query("SELECT * FROM users WHERE id = ?", [user_id])

# I auto-generate:
import pytest

def test_fetch_user_data_success():
    """Test successful user data retrieval"""
    result = fetch_user_data(1)
    assert isinstance(result, dict)
    assert 'id' in result

def test_fetch_user_data_invalid_id():
    """Test with invalid user ID"""
    with pytest.raises(ValueError, match="Invalid user ID"):
        fetch_user_data(0)

def test_fetch_user_data_negative_id():
    """Test with negative ID"""
    with pytest.raises(ValueError):
        fetch_user_data(-1)

# TODO: Add integration tests with database
# TODO: Test database connection failures
```

## 框架检测

我会自动检测你使用的测试框架：

- **JavaScript/TypeScript**：Jest、Vitest、Mocha
- **Python**：pytest、unittest
- **Java**：JUnit
- **Go**：testing 包

检测依据：
- package.json 依赖项
- requirements.txt
- 现有测试文件
- 导入语句

## 测试模式

### 单元测试
```javascript
// Function testing
test('adds numbers correctly', () => {
  expect(add(2, 3)).toBe(5);
});
```

### 组件测试
```jsx
// React component testing
test('button click triggers callback', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

### 边界情况
```javascript
// Boundary testing
test('handles empty input', () => {
  expect(processData([])).toEqual([]);
});

test('handles null input', () => {
  expect(processData(null)).toBeNull();
});
```

## 何时使用子代理

在以下情况下调用 **@test-engineer**：
- 完整的测试套件（20 个以上测试）
- 集成测试策略
- E2E 测试规划
- 测试覆盖率目标
- 复杂的模拟场景

**示例：**
```
Me: "Generated 3 basic tests for calculateDiscount()"
You: "@test-engineer create comprehensive test suite with all edge cases"
Sub-agent: [Creates 25+ tests covering all scenarios]
```

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是
**可在沙箱中运行：** ✅ 是

- **文件系统**：将测试文件写入项目
- **网络**：无需使用
- **配置**：无需配置

## 自定义

编辑测试模板：

```bash
cp -r ~/.claude/skills/development/test-generator \
      ~/.claude/skills/development/my-test-generator

# Edit SKILL.md to customize:
# - Test patterns
# - Framework preferences
# - Coverage expectations
```

## 与命令集成

### /test-gen 命令
```bash
/test-gen --file utils.js --framework jest --coverage 90

# Combines:
# 1. My quick scaffolding
# 2. @test-engineer comprehensive tests
# 3. Full test file generation
```

## 提示

1. **先让我搭建脚手架** - 在调用子代理之前进行审查
2. **添加 TODO** - 我会为复杂情况添加 TODO 注释
3. **保持框架一致性** - 我会匹配项目的测试风格
4. **快速迭代** - 如果不满意，可重新生成

## 相关工具

- **@test-engineer**：创建全面的测试套件
- **code-reviewer skill**：标记需要测试的代码
- **/test-gen command**：完整的测试生成工作流