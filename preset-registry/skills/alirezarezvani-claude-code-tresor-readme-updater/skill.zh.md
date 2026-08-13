---
name: readme-updater
description: Keep README files current with project changes. Use when project structure changes, features added, or setup instructions modified. Suggests README updates based on code changes. Triggers on significant project changes, new features, dependency changes.
allowed-tools: Read, Write, Edit, Grep
---
# README 更新技能

使你的 README 与项目变更保持同步。

## 激活时机

- ✅ 添加了新功能
- ✅ 项目结构发生变化
- ✅ 添加/移除了依赖项
- ✅ 设置说明发生变化
- ✅ 用户提及 README 或文档
- ✅ 配置文件被修改

## 我会更新的内容

### README 章节

**安装：**
- 新依赖项
- 设置步骤
- 前置条件
- 环境变量

**功能：**
- 新能力
- 功能变更
- 功能弃用

**用法：**
- API 变更
- 新示例
- 更新后的截图

**配置：**
- 新选项
- 环境变量
- 配置文件变更

## 示例

### 添加新功能

```bash
# You add authentication:
git diff
# + auth.service.ts
# + login.component.tsx
# + JWT middleware

# I suggest README update:
## Features
- ✨ User authentication with JWT  # NEW
- 🔐 Role-based access control    # NEW
- User management
- Dashboard
```

### 添加新依赖项

```bash
# You add: npm install stripe

# I suggest:
## Installation

```bash
npm install
npm install stripe  # Added for payment processing
```

## Environment Variables
```bash
STRIPE_SECRET_KEY=your_stripe_key  # Required for payments
```
```

### 设置说明

```bash
# You modify docker-compose.yml

# I update README:
## Development Setup

```bash
# 1. Clone repository
git clone [url]

# 2. Install dependencies
npm install

# 3. Start services (UPDATED)
docker-compose up -d  # Now includes Redis cache

# 4. Run migrations
npm run migrate
```
```

## 检测逻辑

### 变更分析

我会自动检测以下变更：
- **package.json** → 更新依赖项章节
- **新路由** → 更新 API 文档
- **.env.example** → 更新环境变量
- **docker-compose.yml** → 更新设置说明
- **新功能** → 更新功能列表

### 章节映射

```yaml
Code Change → README Section:
  - New API endpoint → Usage / API Reference
  - New dependency → Installation
  - New env var → Configuration
  - New feature → Features list
  - Architecture change → Architecture section
```

## 智能更新

### 保持结构

我会维持你的 README 结构：
- 保留表情符号风格
- 保持格式一致
- 维持语气和行文风格
- 遵循现有组织结构

### 添加缺失的章节

```markdown
# Suggested additions:

## Prerequisites
- Node.js 18+
- Docker (for development)
- PostgreSQL 14+

## Environment Variables
```bash
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your_api_key
```

## Testing
```bash
npm test
```
```

### 更新示例

```markdown
# Before:
```javascript
const result = api.getUsers();
```

# After (API changed):
```javascript
const result = await api.getUsers({ page: 1, limit: 10 });
```
```

## 版本兼容性

我会跟踪特定版本的文档：

```markdown
## Requirements

- Node.js 18+ (updated from 16+)
- TypeScript 5.0+ (new requirement)
- React 18+ (unchanged)
```

## 变更日志集成

我可以与 CHANGELOG.md 同步：

```markdown
## Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Latest (v2.1.0)
- ✨ Added user authentication
- 🔧 Fixed memory leak in data processing
- 📝 Updated API documentation
```

## 截图管理

```markdown
# I suggest when UI changes:
## Screenshots

![Dashboard](screenshots/dashboard.png)
*Updated: 2025-10-24 - New authentication panel*

![User Profile](screenshots/profile.png)
*New feature - user profile management*
```

## 与 @docs-writer 的关系

**我（Skill）：** 随代码变更及时更新 README
**@docs-writer（子代理）：** 全面的文档策略

### 工作流程
1. 我检测变更
2. 我建议更新 README
3. 对于完整文档 → 调用 **@docs-writer** 子代理
4. 子代理创建完整文档

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是
**可在沙箱中运行：** ✅ 是

- **文件系统**：写入 README.md
- **网络**：无需网络
- **配置**：无需配置

## 最佳实践

1. **保持最新** - 每次添加功能时都更新 README
2. **明确具体** - 包含版本号和先决条件
3. **添加示例** - 展示实际用法，而不只是 API
4. **包含故障排除** - 常见问题及解决方案
5. **徽章状态** - 确保构建/覆盖率徽章保持最新

## README 模板

### 基本结构

```markdown
# Project Name

Brief description

## Features
- Feature 1
- Feature 2

## Installation
```bash
npm install
```

## Usage
```javascript
// Example
```

## Configuration
Environment variables needed

## Contributing
How to contribute

## License
MIT
```

### 完整结构

```markdown
# Project Name
> Tagline

[Badges]

## Table of Contents
- Features
- Installation
- Usage
- API Reference
- Configuration
- Development
- Testing
- Deployment
- Contributing
- License

[Sections with detailed content]
```

## 集成

### 与 /docs-gen 命令集成

```bash
/docs-gen --format markdown

# Generates:
# 1. README.md (via me)
# 2. Full documentation site (via @docs-writer)
# 3. API reference (via api-documenter)
```

### 与 CI/CD 集成

```yaml
# .github/workflows/docs.yml
- name: Update README
  run: |
    # Skill suggests updates based on changes
    # Review and commit
```

## 自定义

添加公司特定的 README 标准：

```bash
cp -r ~/.claude/skills/documentation/readme-updater \
      ~/.claude/skills/documentation/company-readme-updater

# Edit to add:
# - Company README template
# - Required sections
# - Badge standards
```

## 相关工具

- **api-documenter skill**：API 文档
- **@docs-writer 子代理**：综合文档
- **git-commit-helper skill**：用于更新的提交消息
- **/docs-gen 命令**：生成完整文档