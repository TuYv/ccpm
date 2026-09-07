---
name: mermaid-diagrams
description: Comprehensive guide for creating software diagrams using Mermaid syntax. Use when users need to create, visualize, or document software through diagrams including class diagrams (domain modeling, object-oriented design), sequence diagrams (application flows, API interactions, code execution), flowcharts (processes, algorithms, user journeys), entity relationship diagrams (database schemas), C4 architecture diagrams (system context, containers, components), state diagrams, git graphs, pie charts, gantt charts, or any other diagram type. Triggers include requests to "diagram", "visualize", "model", "map out", "show the flow", or when explaining system architecture, database design, code structure, or user/application flows.
---
# Mermaid 图表绘制

使用 Mermaid 基于文本的语法创建专业的软件图表。Mermaid 根据简单的文本定义渲染图表，使图表可纳入版本控制、易于更新，并可与代码一同维护。

## 核心语法结构

所有 Mermaid 图表都遵循以下模式：

```mermaid
diagramType
  definition content
```

**关键原则：**
- 首行声明图表类型（例如 `classDiagram`、`sequenceDiagram`、`flowchart`）
- 使用 `%%` 编写注释
- 换行和缩进可提升可读性，但并非必需
- 未知单词会导致图表出错；参数错误会静默失败

## 图表类型选择指南

**选择合适的图表类型：**

1. **类图** - 领域建模、OOP 设计、实体关系
   - 领域驱动设计文档
   - 面向对象的类结构
   - 实体关系与依赖

2. **时序图** - 时序交互、消息流
   - API 请求/响应流程
   - 用户认证流程
   - 系统组件交互
   - 方法调用序列

3. **流程图** - 流程、算法、决策树
   - 用户旅程与工作流
   - 业务流程
   - 算法逻辑
   - 部署流水线

4. **实体关系图（ERD）** - 数据库模式
   - 表关系
   - 数据建模
   - 模式设计

5. **C4 图** - 多层次的软件架构
   - 系统上下文（系统与用户）
   - 容器（应用、数据库、服务）
   - 组件（内部结构）
   - 代码（类/接口级别）

6. **状态图** - 状态机、生命周期状态
7. **Git 图** - 版本控制分支策略
8. **甘特图** - 项目时间线、进度安排
9. **饼图/柱状图** - 数据可视化

## 快速入门示例

### 类图（领域模型）
```mermaid
classDiagram
    Title -- Genre
    Title *-- Season
    Title *-- Review
    User --> Review : creates

    class Title {
        +string name
        +int releaseYear
        +play()
    }

    class Genre {
        +string name
        +getTopTitles()
    }
```

### 时序图（API 流程）
```mermaid
sequenceDiagram
    participant User
    participant API
    participant Database

    User->>API: POST /login
    API->>Database: Query credentials
    Database-->>API: Return user data
    alt Valid credentials
        API-->>User: 200 OK + JWT token
    else Invalid credentials
        API-->>User: 401 Unauthorized
    end
```

### 流程图（用户旅程）
```mermaid
flowchart TD
    Start([User visits site]) --> Auth{Authenticated?}
    Auth -->|No| Login[Show login page]
    Auth -->|Yes| Dashboard[Show dashboard]
    Login --> Creds[Enter credentials]
    Creds --> Validate{Valid?}
    Validate -->|Yes| Dashboard
    Validate -->|No| Error[Show error]
    Error --> Login
```

### ERD（数据库模式）
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : includes

    USER {
        int id PK
        string email UK
        string name
        datetime created_at
    }

    ORDER {
        int id PK
        int user_id FK
        decimal total
        datetime created_at
    }
```

## 详细参考

如需特定图表类型的深入指南，请参阅：

- **[references/class-diagrams.md](references/class-diagrams.md)** - 领域建模、关系（关联、组合、聚合、继承）、多重性、方法/属性
- **[references/sequence-diagrams.md](references/sequence-diagrams.md)** - 角色、参与者、消息（同步/异步）、激活、循环、alt/opt/par 块、注释
- **[references/flowcharts.md](references/flowcharts.md)** - 节点形状、连接、决策逻辑、子图、样式设置
- **[references/erd-diagrams.md](references/erd-diagrams.md)** - 实体、关系、基数、键、属性
- **[references/c4-diagrams.md](references/c4-diagrams.md)** - 系统上下文图、容器图、组件图、边界
- **[references/architecture-diagrams.md](references/architecture-diagrams.md)** - 云服务、基础设施、CI/CD 部署
- **[references/advanced-features.md](references/advanced-features.md)** - 主题、样式设置、配置、布局选项

## 最佳实践

1. **从简单入手** - 先从核心实体/组件开始，逐步添加细节
2. **使用有意义的名称** - 清晰的标签使图表自文档化
3. **充分注释** - 使用 `%%` 注释解释复杂关系
4. **保持聚焦** - 一个概念一张图；将大型图表拆分为多个聚焦视图
5. **版本控制** - 将 `.mmd` 文件与代码一同存储，便于更新
6. **添加上下文** - 加入标题和注释来说明图表用途
7. **迭代** - 随着理解的深入不断完善图表

## 配置与主题

使用 frontmatter 配置图表：

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: "#ff6b6b"
---
flowchart LR
    A --> B
```

**可用主题：** default、forest、dark、neutral、base

**布局选项：**
- `layout: dagre`（默认）- 经典平衡布局
- `layout: elk` - 适用于复杂图表的高级布局（需要集成）

**外观选项：**
- `look: classic` - 传统 Mermaid 样式
- `look: handDrawn` - 类似手绘草图的外观

## 导出与渲染

**原生支持的环境：**
- GitHub/GitLab - 在 Markdown 中自动渲染
- VS Code - 需配合 Markdown Mermaid 扩展
- Notion、Obsidian、Confluence - 内置支持

**导出选项：**
- [Mermaid Live Editor](https://mermaid.live) - 支持导出 PNG/SVG 的在线编辑器
- Mermaid CLI - `npm install -g @mermaid-js/mermaid-cli`，然后 `mmdc -i input.mmd -o output.png`
- Docker - `docker run --rm -v $(pwd):/data minlag/mermaid-cli -i /data/input.mmd -o /data/output.png`

## 常见陷阱

- **致错字符** - 避免在注释中使用 `{}`，对特殊字符使用正确的转义序列
- **语法错误** - 拼写错误会导致图表出错；可在 Mermaid Live 中验证语法
- **过度复杂** - 将复杂图表拆分为多个聚焦视图
- **缺失关系** - 记录实体之间所有重要的连接

## 何时创建图表

**以下情况务必创建图表：**
- 开始新项目或新功能时
- 记录复杂系统时
- 解释架构决策时
- 设计数据库模式时
- 规划重构工作时
- 帮助新团队成员上手时

**用图表来：**
- 就技术决策与利益相关者达成一致
- 协作记录领域模型
- 可视化数据流与系统交互
- 在编码之前进行规划
- 创建随代码演进的活文档
