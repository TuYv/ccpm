---
name: codebase-documenter
description: Generates comprehensive documentation explaining how a codebase works, including architecture, key components, data flow, and development guidelines. Use when user wants to understand unfamiliar code, create onboarding docs, document architecture, or explain how the system works.
---
# 代码库文档生成器

为代码库生成全面的文档——涵盖架构、组件、数据流和开发指南。

## 适用场景

- “解释这个代码库”
- “记录架构”
- “这段代码如何工作”
- “创建开发者文档”
- “生成代码库概览”
- “创建入职文档”

## 文档内容

### 1. 项目概览
- 目的与愿景
- 目标用户
- 主要功能
- 技术栈
- 项目状态

### 2. 架构
- 高层结构
- 设计模式
- 数据流
- 控制流
- 图表（Mermaid）
- 架构决策

### 3. 目录结构
- 组织方式及其目的
- 命名约定
- 入口点
- 核心模块
- 配置位置

### 4. 关键组件
- 主要模块
- 类与函数
- 职责
- 交互
- 扩展点
- 代码示例

### 5. 外部集成
- 调用的 API
- 数据库与模式
- 身份验证
- 缓存
- 消息队列
- 文件存储

### 6. 数据模型
- 数据库模式
- 数据结构
- 验证
- 迁移
- 数据转换

### 7. 开发环境设置
- 前置条件
- 安装步骤
- 配置
- 运行应用
- 测试
- 调试
- 故障排除

### 8. 开发指南
- 编码约定
- 测试方法
- 错误处理
- 日志记录
- 安全实践
- 性能模式

### 9. 部署
- 构建流程
- 部署步骤
- 环境
- 监控
- 回滚流程

### 10. 贡献
- 开发工作流
- 代码审查指南
- 测试要求
- 文档更新

## 方法

1. 使用 Explore 代理进行**探索**（全面）
2. 使用 Glob **梳理结构**
3. **阅读关键文件**（README、入口点、核心模块）
4. 使用 Grep **识别模式**（导入、导出）
5. **追踪执行**路径
6. 从文档、注释和测试中**提取知识**
7. **整合**为连贯的文档

## 输出

创建 Markdown 文档：
```
docs/
├── README.md              # Overview and quick start
├── ARCHITECTURE.md        # System architecture
├── DEVELOPMENT.md         # Development guide
├── API.md                 # API documentation
├── DEPLOYMENT.md          # Deployment guide
└── CONTRIBUTING.md        # Contribution guidelines
```

如果需要，也可以创建一份全面的单一文档。

## 深度级别

- **快速**：高层概览（15–30 分钟）
- **标准**：全面覆盖（30–60 分钟）
- **深入**：详尽说明并包含示例（60 分钟以上）

## 可视化元素

- Mermaid 图表（架构图、流程图、时序图）
- 来自代码库的代码示例
- 具体的文件:行号引用
- 用于呈现结构化信息的表格
- 用于说明指南的列表

## 使用的工具

- **Task（Explore 代理）**：代码库探索
- **Glob**：梳理目录结构
- **Grep**：查找模式、导入和导出
- **Read**：分析关键文件
- **Write**：创建文档
- **Bash**：提取元数据（git 日志、版本）

## 成功标准

- 完整覆盖所有领域
- 提供包含示例的清晰说明
- 为复杂概念提供可视化图表
- 提供具体的文件:行号引用
- 提供可直接执行的环境设置和开发说明
- 新开发者仅使用这些文档即可完成入职
- 结构清晰、易于浏览
- 信息准确且为最新状态

## 集成

- **code-auditor**：包含质量/安全上下文
- **project-bootstrapper**：记录项目引导决策
- **visual-html-creator**：创建可视化图表