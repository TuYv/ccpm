---
name: code-reviewer
description: Automatic code quality and best practices analysis. Use proactively when files are modified, saved, or committed. Analyzes code style, patterns, potential bugs, and security basics. Triggers on file changes, git diff, code edits, quality mentions.
allowed-tools: Read, Grep, Glob
---
# 代码审查技能


在编码过程中进行轻量级自动代码质量检查。

## 何时激活

- ✅ 文件被修改或保存
- ✅ 运行 Git diff
- ✅ 对话中提及代码
- ✅ 用户询问代码质量
- ✅ 提交前

## 检查内容

### 快速改进项
- 代码风格和格式问题
- 常见反模式
- 明显的错误（空值检查、未定义引用）
- 基础安全模式（硬编码密钥）
- 导入/导出问题
- 未使用的变量和函数

### 不执行的工作
- 深度架构审查 → 使用 **@code-reviewer** 子代理
- 全面安全审计 → 使用 **security-auditor** 技能
- 性能分析 → 使用 **@architect** 子代理
- 完整重构计划 → 使用 **@code-reviewer** 子代理

## 与 @code-reviewer 子代理的关系

**我（技能）：** 快速、轻量、实时反馈
**@code-reviewer（子代理）：** 提供包含示例和策略的深度分析

### 工作流程

1. 你编写代码
2. 我自动分析（即时反馈）
3. 我会标记：“⚠️ 第 42 行可能存在问题”
4. 你想了解详情 → 调用 **@code-reviewer** 子代理
5. 子代理提供全面分析

## 分析示例

### JavaScript/TypeScript

```javascript
// You write this code:
function getUser(id) {
  return db.query(`SELECT * FROM users WHERE id = ${id}`);
}

// I immediately flag:
// 🚨 Line 2: SQL injection vulnerability
// 💡 Use parameterized queries
```

### React

```javascript
// You write:
function UserList({ users }) {
  return users.map(user => <User data={user} />);
}

// I flag:
// ⚠️ Missing key prop in list rendering (line 2)
// 💡 Add key={user.id} to User component
```

### Python

```python
# You write:
def process_data(data):
    return data['user']['profile']['name']

# I flag:
# ⚠️ Potential KeyError - no safety checks (line 2)
# 💡 Use .get() or add try/except
```

## 检查类别

### 代码风格
- 命名约定不一致
- 缺少分号（JavaScript）
- 缩进不规范
- 函数过长（>50 行）
- 魔法数字

### 潜在错误
- 未经检查便访问 null/undefined
- 未进行边界检查便访问数组
- 类型不匹配（TypeScript）
- 不可达代码
- 无限循环

### 基础安全
- 硬编码的 API 密钥或其他密钥
- SQL 注入模式
- 使用 eval() 或 exec()
- 不安全的随机数生成
- 缺少输入验证

### 最佳实践
- 缺少错误处理
- 在生产代码中使用 Console.log
- 被注释掉的代码块
- 没有上下文的 TODO 注释
- 过于复杂的条件

## 输出格式

```
🤖 code-reviewer skill:
  [Severity] Issue description (file:line)
  💡 Quick fix suggestion
  📖 Reference: [link to learn more]
```

### 严重程度级别
- 🚨 **严重**：必须修复（安全、数据丢失）
- ⚠️ **高**：应该修复（错误、性能）
- 📋 **中**：考虑修复（可维护性）
- 💡 **低**：最好改进（风格、可读性）

## 何时调用子代理

在我标记问题后，调用 **@code-reviewer** 子代理以获取：
- 问题的详细说明
- 多种修复方案及其优缺点
- 架构建议
- 重构策略
- 最佳实践指南

**示例：**
```
Me: "⚠️ Potential N+1 query detected"
You: "@code-reviewer explain the N+1 issue and show optimal solution"
Sub-agent: [Provides comprehensive analysis with examples]
```

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是（默认，推荐用于学习）
**可在沙箱中运行：** ✅ 是（无需特殊配置）

- **文件系统**：对项目文件的只读访问权限
- **网络**：无需网络
- **配置**：无需配置

## 自定义

想使用不同的检查或模式？

1. 复制此 Skill：
   ```bash
   cp -r ~/.claude/skills/development/code-reviewer ~/.claude/skills/development/my-code-reviewer
   ```

2. 编辑 `SKILL.md`：
   - 修改 `description` 以调整触发条件
   - 自定义检查类别
   - 添加特定于语言的模式

3. 重启 Claude Code：
   ```bash
   claude --restart
   ```

有关自定义指南，请参阅 [../../TEMPLATES.md](../../TEMPLATES.md)。

## 实际示例

### TypeScript 函数

```typescript
// Before:
async function fetchUsers(ids) {
  const users = [];
  for (let id of ids) {
    const user = await User.findById(id);  // N+1 query!
    users.push(user);
  }
  return users;
}

// I flag:
// ⚠️ N+1 query pattern detected (line 4)
// 💡 Use User.findByIds(ids) for batch loading

// After fix:
async function fetchUsers(ids) {
  return await User.findByIds(ids);
}
```

### React 组件

```jsx
// Before:
function UserCard({ user }) {
  const [data, setData] = useState();

  useEffect(() => {
    fetch(`/api/users/${user.id}`)
      .then(res => res.json())
      .then(setData);
  }, []);  // Missing dependency!

  return <div>{data?.name}</div>;
}

// I flag:
// ⚠️ useEffect dependency array incomplete (line 6)
// 💡 Add user.id to dependencies: [user.id]

// After fix:
useEffect(() => {
  fetch(`/api/users/${user.id}`)
    .then(res => res.json())
    .then(setData);
}, [user.id]);
```

## 与 /review 命令集成

`/review` 命令会汇总我的发现和子代理的深入分析：

```bash
/review --scope staged --checks all

# Command workflow:
# 1. Collects my automatic findings
# 2. Invokes @code-reviewer sub-agent for deep analysis
# 3. Invokes @security-auditor sub-agent
# 4. Generates comprehensive report with priorities
```

## 性能影响

- **激活时间**：< 100ms
- **分析时间**：每个文件 < 1 秒
- **内存使用量**：极低（只读）
- **后台运行**：非阻塞

此 Skill 以异步方式运行，不会拖慢你的编码工作流程。

## 语言支持

### 完全支持
- JavaScript/TypeScript（ES6+、React、Node.js）
- Python（3.8+、Django、FastAPI）
- Java（Spring Boot 模式）
- Go（标准模式）

### 部分支持
- Ruby、PHP、C#、Rust
- 与框架无关的模式同样适用

想添加特定于语言的模式？请参阅上面的自定义指南。

## 获得最佳效果的技巧

1. **先编写代码，再进行审查** - 让我在你编码时发现问题
2. **不要忽略警告** - 每个标记的问题都值得审查
3. **使用子代理进行学习** - 调用 @code-reviewer 来理解“为什么”
4. **针对你的技术栈进行自定义** - 添加项目特定的模式
5. **与 /review 结合使用** - 使用该命令进行全面的提交前检查

## 相关工具

- **security-auditor skill**：更深入地扫描安全漏洞
- **test-generator skill**：自动为你的代码建议测试
- **@code-reviewer sub-agent**：提供包含示例的全面代码审查
- **/review command**：使用多个代理执行完整工作流

## 了解更多

- 架构：[../../../ARCHITECTURE.md](../../../ARCHITECTURE.md)
- 模板：[../../TEMPLATES.md](../../TEMPLATES.md)
- 子代理：[../../../agents/README.md](../../../agents/README.md)