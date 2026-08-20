---
name: test-fixing
description: Run tests and systematically fix all failing tests using smart error grouping. Use when user asks to fix failing tests, mentions test failures, runs test suite and failures occur, or requests to make tests pass.
---
# 测试修复

使用智能分组策略，系统地识别并修复所有失败的测试。

## 何时使用

- 明确要求修复测试（“修复这些测试”“让测试通过”）
- 报告测试失败（“测试失败了”“测试套件出问题了”）
- 完成实现后希望测试全部通过
- 提到由测试导致的 CI/CD 失败

## 系统化方法

### 1. 首次运行测试

运行 `make test` 以识别所有失败的测试。

分析输出中的以下内容：
- 失败总数
- 错误类型和模式
- 受影响的模块/文件

### 2. 智能错误分组

按以下维度对相似的失败进行分组：
- **错误类型**：ImportError、AttributeError、AssertionError 等
- **模块/文件**：由同一文件导致的多个测试失败
- **根本原因**：缺少依赖项、API 变更、重构影响

确定分组优先级时考虑：
- 受影响的测试数量（影响最大的优先）
- 依赖顺序（先修复基础设施问题，再修复功能问题）

### 3. 系统化修复流程

对于每个分组（从影响最大的开始）：

1. **识别根本原因**
   - 阅读相关代码
   - 使用 `git diff` 检查最近的变更
   - 理解错误模式

2. **实施修复**
   - 使用 Edit 工具修改代码
   - 遵循项目约定（参见 CLAUDE.md）
   - 进行最小且有针对性的修改

3. **验证修复**
   - 运行该分组对应的测试子集
   - 使用 pytest 标记或文件模式：
     ```bash
     uv run pytest tests/path/to/test_file.py -v
     uv run pytest -k "pattern" -v
     ```
   - 确保该分组的测试通过后再继续

4. **转到下一个分组**

### 4. 修复顺序策略

**首先修复基础设施问题：**
- 导入错误
- 缺少依赖项
- 配置问题

**然后处理 API 变更：**
- 函数签名变更
- 模块重组
- 变量/函数重命名

**最后处理逻辑问题：**
- 断言失败
- 业务逻辑错误
- 边界情况处理

### 5. 最终验证

修复所有分组后：
- 运行完整测试套件：`make test`
- 验证没有引入回归问题
- 检查测试覆盖率是否保持不变

## 最佳实践

- 每次修复一个分组
- 每次修复后运行有针对性的测试
- 使用 `git diff` 了解最近的变更
- 查找失败中的共同模式
- 当前分组通过之前，不要转到下一个分组
- 保持修改最小且有针对性

## 工作流示例

用户：“重构后测试失败了”

1. 运行 `make test` → 发现 15 个失败
2. 对错误进行分组：
   - 8 个 ImportError（模块已重命名）
   - 5 个 AttributeError（函数签名已更改）
   - 2 个 AssertionError（逻辑错误）
3. 先修复 ImportError → 运行测试子集 → 验证
4. 修复 AttributeError → 运行测试子集 → 验证
5. 修复 AssertionError → 运行测试子集 → 验证
6. 运行完整测试套件 → 全部通过 ✓