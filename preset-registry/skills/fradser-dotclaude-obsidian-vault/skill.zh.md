---
name: obsidian-vault
description: Search, create, and manage notes in the Obsidian vault with wikilinks and index notes. Use when user wants to find, create, or organize notes in Obsidian.
---
# Obsidian 知识库

## 知识库位置

`/mnt/d/Obsidian Vault/AI Research/`

根目录层级基本为扁平结构。

## 命名约定

- **索引笔记**：汇总相关主题（例如，`Ralph Wiggum Index.md`、`Skills Index.md`、`RAG Index.md`）
- 所有笔记名称均使用**标题式大小写**
- 不使用文件夹进行组织——改用链接和索引笔记

## 链接

- 使用 Obsidian `[[wikilinks]]` 语法：`[[Note Title]]`
- 笔记底部链接到依赖笔记或相关笔记
- 索引笔记仅包含 `[[wikilinks]]` 列表

## 工作流

### 搜索笔记

```bash
# Search by filename
find "/mnt/d/Obsidian Vault/AI Research/" -name "*.md" | grep -i "keyword"

# Search by content
grep -rl "keyword" "/mnt/d/Obsidian Vault/AI Research/" --include="*.md"
```

或者直接对知识库路径使用 Grep/Glob 工具。

### 创建新笔记

1. 文件名使用**标题式大小写**
2. 将内容编写为一个学习单元（遵循知识库规则）
3. 在底部添加指向相关笔记的 `[[wikilinks]]`
4. 如果属于编号序列，则使用分层编号方案

### 查找相关笔记

在整个知识库中搜索 `[[Note Title]]` 以查找反向链接：

```bash
grep -rl "\\[\\[Note Title\\]\\]" "/mnt/d/Obsidian Vault/AI Research/"
```

### 查找索引笔记

```bash
find "/mnt/d/Obsidian Vault/AI Research/" -name "*Index*"
```