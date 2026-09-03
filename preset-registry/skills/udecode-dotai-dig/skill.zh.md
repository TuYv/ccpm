---
name: dig
description: Look up documentation and source code for libraries and packages. Use when the user asks a question about a library, needs to understand a library's API, or when you need information about a library that you don't know about. Triggers on questions like "How do I use X library?", "What's the API for Y?", "Show me how Z library handles this", or when encountering unfamiliar library usage.
---
# Dig

通过查找并探索库的源代码仓库来查阅库文档。

## 工作流程

### 1. 检查本地可用性

首先，检查该库的源代码是否已存在于本地：

```bash
# Check common locations
ls /tmp/cc-repos/{library-name} 2>/dev/null
```

如果该库已存在于本地，则跳至步骤 3。

### 2. 克隆仓库

如果本地没有，则查找并克隆该仓库：

1. 搜索该库的 GitHub 仓库（大多数库都托管在 GitHub 上）
2. 克隆到标准位置：

```bash
mkdir -p /tmp/cc-repos
git clone https://github.com/{owner}/{repo}.git /tmp/cc-repos/{repo-name}
```

**常见的仓库模式：**

- npm 包：查看 `package.json` 的 homepage 或 repository 字段，或搜索 `https://github.com/{package-name}`
- Python 包：查看 PyPI 页面上的 "Homepage" 或 "Source" 链接
- Go 包：导入路径通常就是仓库 URL
- Rust crate：在 crates.io 上查看仓库链接

### 3. 调研仓库

启动一个 Research agent（使用 Task 工具并设置 `subagent_type="Explore"`）来遍历仓库并回答问题。

发给该 agent 的示例提示词：

```
Explore the repository at /tmp/cc-repos/{repo-name} to answer: {user's question}

Focus on:
- README and documentation files
- Source code structure
- API exports and public interfaces
- Examples and tests for usage patterns
```

### 4. 综合并回答

利用调研结果，针对用户关于该库的问题给出清晰、准确的回答。
