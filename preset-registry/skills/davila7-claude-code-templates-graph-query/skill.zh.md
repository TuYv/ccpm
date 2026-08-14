---
name: graph-query
description: Query the code graph database to understand component relationships, dependencies, and change impact. Use when the user asks to "find callers", "check dependencies", "what uses this", "show relationships", "find serializers", or when reading code and needing to understand what depends on a component before modifications.
---
# AI Maestro 代码图谱查询

查询代码库的依赖关系图谱，以便在修改前了解组件关系、调用链以及变更的影响。此技能是 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 套件的一部分。

## 前置条件

需要在本地运行 [AI Maestro](https://github.com/23blocks-OS/ai-maestro)，并已为代码库建立索引。

```bash
# Install graph tools
git clone https://github.com/23blocks-OS/ai-maestro-plugins.git
cd ai-maestro-plugins && ./install-graph-tools.sh
```

## 核心行为

读取任何代码文件后，查询图谱以了解依赖关系：

```
Read file -> Query graph -> Then proceed
```

## 命令

### 查询
| 命令 | 说明 |
|---------|-------------|
| `graph-describe.sh <name>` | 描述组件或函数 |
| `graph-find-callers.sh <fn>` | 查找函数的所有调用方 |
| `graph-find-callees.sh <fn>` | 查找此函数调用的所有函数 |
| `graph-find-related.sh <component>` | 查找相关组件 |
| `graph-find-by-type.sh <type>` | 查找某一类型的所有组件 |
| `graph-find-serializers.sh <model>` | 查找模型的序列化器 |
| `graph-find-associations.sh <model>` | 查找模型关联 |
| `graph-find-path.sh <from> <to>` | 查找函数之间的调用路径 |

### 索引
| 命令 | 说明 |
|---------|-------------|
| `graph-index-delta.sh [path]` | 为代码图谱建立索引或更新索引 |

## 组件类型

与 `graph-find-by-type.sh` 一起使用：`model`、`serializer`、`controller`、`service`、`job`、`concern`、`component`、`hook`

## 使用示例

```bash
# After reading a model file
graph-describe.sh User
graph-find-serializers.sh User
graph-find-associations.sh User

# Before modifying a function
graph-find-callers.sh process_payment
graph-find-callees.sh process_payment

# Find call chain between components
graph-find-path.sh handleRequest sendResponse

# Index your codebase
graph-index-delta.sh /path/to/project
```

## 为什么要在修改前查询

如果不检查图谱，你可能会：
- 在更改函数签名时破坏调用方
- 更改模型时遗漏需要更新的序列化器
- 忽略继承了你的修改的子类

## 完整的 AI Maestro 体验

此技能是 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 平台的一部分。该平台为 AI 智能体编排提供 **6 项技能**：消息传递、记忆、文档、图谱、规划和智能体管理。