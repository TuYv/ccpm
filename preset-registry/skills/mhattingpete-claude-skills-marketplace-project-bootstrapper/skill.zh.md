---
name: project-bootstrapper
description: Sets up new projects or improves existing projects with development best practices, tooling, documentation, and workflow automation. Use when user wants to start a new project, improve project structure, add development tooling, or establish professional workflows.
---
# 项目引导器

使用开发最佳实践、工具、文档和工作流自动化来搭建新项目或改进现有项目。

## 何时使用

- “搭建一个新项目”
- “引导初始化这个项目”
- “添加最佳实践”
- “改进项目结构”
- “配置开发工具”
- “正确初始化项目”

## 设置内容

### 1. 项目结构
- 标准目录（src/、tests/、docs/、scripts/、.github/）
- 合理的文件组织
- 结构改进

### 2. Git 配置
- 完善的 `.gitignore`
- 用于行尾格式和差异比较的 `.gitattributes`
- Git 钩子（pre-commit、commit-msg）
- 分支保护模式
- 必要时使用 Git LFS

### 3. 文档
- 完善的 `README.md`
- `CONTRIBUTING.md`
- 代码文档（JSDoc、文档字符串）
- `CHANGELOG.md` 结构
- 如果项目较复杂，则提供架构文档

### 4. 测试配置
- 确定或建议测试框架
- 测试结构和约定
- 示例测试或测试模板
- 配置测试运行器
- 覆盖率报告
- 测试脚本和命令

### 5. 代码质量工具
- 代码检查工具（ESLint、Pylint 等）
- 格式化工具（Prettier、Black 等）
- 类型检查（TypeScript、mypy 等）
- 用于质量检查的 pre-commit 钩子
- 编辑器配置（.editorconfig）
- 代码质量徽章

### 6. 依赖项管理
- 包管理器配置
- 组织依赖项
- 检查安全漏洞
- 配置依赖项更新（Dependabot、Renovate）
- 创建锁定文件
- 记录依赖项选择

### 7. 开发工作流
- 实用的 npm 脚本 / Makefile 目标
- 环境变量模板（.env.example）
- 适用时提供 Docker 配置
- 开发环境启动脚本
- 热重载 / 监视模式
- 记录开发工作流

### 8. CI/CD 配置
- GitHub Actions / GitLab CI 配置
- 自动化测试
- 自动化部署（如适用）
- 状态徽章
- 发布自动化
- 分支保护

## 方法

### 探索阶段

提出澄清问题：
1. **项目类型**：新项目还是现有项目？
2. **主要用途**：Web 应用、库还是 CLI 工具？
3. **语言/框架**：JS/TS、Python、Go 等？
4. **协作方式**：个人项目还是团队项目？
5. **部署目标**：服务器、云端、移动端还是桌面端？
6. **偏好**：是否指定工具或框架？
7. **范围**：完整配置还是仅配置特定部分？

### 实施阶段

1. **分析现有**结构（如果是现有项目）
2. 根据回答**制定计划**
3. **展示计划**并获取批准
4. **系统化实施**（一次处理一个领域）
5. **验证完整性**
6. 提供**交接**文档

## 定制

根据以下因素进行调整：
- **语言生态系统**：Node.js、Python、Go 或 Rust
- **项目规模**：小型脚本或大型应用
- **团队规模**：个人或协作团队
- **成熟度**：初创公司的速度或企业级标准

## 使用的工具

- **AskUserQuestion**：收集需求
- **Write**：创建配置文件和文档
- **Edit**：更新现有文件
- **Bash**：初始化工具（git init、npm init）
- **Read**：分析现有结构
- **Glob**：查找需要更新的文件

## 成功标准

- 所有标准文件均已就位并完成配置
- 文档清晰且完整
- 开发工作流已有文档说明
- 自动化质量工具（pre-commit hooks）
- 易于执行测试
- 遵循语言/框架惯例
- 开发者可快速上手
- 不存在明显缺失的最佳实践

## 模板

- Node.js/TypeScript Web 应用
- Python CLI 工具
- Python Web API（FastAPI/Flask）
- React/Next.js 应用
- Go 服务
- Rust CLI/库

## 集成

- **feature-planning**：用于规划自定义功能
- **code-auditor**：用于验证项目设置质量
- **codebase-documenter**：用于生成详细文档

## 范围控制

- **完整初始化**：从零开始完成所有设置
- **部分设置**：仅设置特定部分（例如，“仅添加测试”）
- **改进优化**：增强现有项目
- **审计并修复**：检查缺失项并进行补充