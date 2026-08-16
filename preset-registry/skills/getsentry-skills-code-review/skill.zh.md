---
name: code-review
description: Perform code reviews following Sentry engineering practices. Use when reviewing pull requests, examining code changes, or providing feedback on code quality. Covers security, performance, testing, and design review.
---
# Sentry 代码审查

审查 Sentry 项目的代码时，请遵循以下准则。

## 审查清单

### 识别问题

检查代码变更中是否存在以下问题：

- **运行时错误**：潜在异常、空指针问题、越界访问
- **性能**：无界的 O(n²) 操作、N+1 查询、不必要的内存分配
- **副作用**：影响其他组件的非预期行为变更
- **向后兼容性**：没有迁移路径的破坏性 API 变更
- **ORM 查询**：可能产生非预期查询性能问题的复杂 Django ORM 查询
- **安全漏洞**：注入、XSS、访问控制缺口、机密信息泄露

### 设计评估

- 组件之间的交互在逻辑上是否合理？
- 该变更是否符合现有项目架构？
- 是否与当前需求或目标存在冲突？

### 测试覆盖

每个 PR 都应具备适当的测试覆盖：

- 针对业务逻辑的功能测试
- 针对组件交互的集成测试
- 针对关键用户路径的端到端测试

确认测试覆盖了实际需求和边界情况。避免在测试代码中使用过多的分支或循环。

### 长期影响

当变更涉及以下内容时，应标记为需要高级工程师审查：

- 数据库模式修改
- API 契约变更
- 采用新的框架或库
- 性能关键型代码路径
- 安全敏感功能

## 反馈准则

### 语气

- 保持礼貌和同理心
- 提供可执行的建议，而非含糊的批评
- 不确定时以问题形式表达：“你是否考虑过……？”

### 批准

- 仅剩轻微问题时予以批准
- 不要因代码风格偏好而阻止 PR
- 请记住：目标是降低风险，而不是追求完美代码

## 需要标记的常见模式

### Python/Django

```python
# Bad: N+1 query
for user in users:
    print(user.profile.name)  # Separate query per user

# Good: Prefetch related
users = User.objects.prefetch_related('profile')
```

### TypeScript/React

```typescript
// Bad: Missing dependency in useEffect
useEffect(() => {
  fetchData(userId);
}, []);  // userId not in deps

// Good: Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 安全

```python
# Bad: SQL injection risk
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# Good: Parameterized query
cursor.execute("SELECT * FROM users WHERE id = %s", [user_id])
```

## 参考资料

- [Sentry 代码审查准则](https://develop.sentry.dev/engineering-practices/code-review/)