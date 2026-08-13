---
name: obsidian-vault
description: Search, create, and manage notes in the Obsidian vault with wikilinks and index notes. Use when user wants to find, create, or organize notes in Obsidian.
---
# Obsidian Vault

## Vault 位置

`/mnt/d/Obsidian Vault/AI Research/`

大部分位于根目录下保持扁平结构。

## 命名约定

- **索引笔记**：聚合相关主题（例如 `Ralph Wiggum Index.md`、`Skills Index.md`、`RAG Index.md`）
- 所有笔记名使用 **Title case**
- 不使用文件夹进行组织——改用链接和索引笔记

## 链接

- 使用 Obsidian 的 `[[wikilinks]]` 语法：`[[Note Title]]`
- 笔记在底部链接到依赖项/相关笔记
- 索引笔记只是 `[[wikilinks]]` 的列表

## 工作流

### Search for notes

```bash
# Search by filename
find "/mnt/d/Obsidian Vault/AI Research/" -name "*.md" | grep -i "keyword"

# Search by content
grep -rl "keyword" "/mnt/d/Obsidian Vault/AI Research/" --include="*.md"
```

或直接在仓库路径上使用 Grep/Glob 工具。

### Create a new note

1. 文件名使用 **Title Case**
2. 按学习单元编写内容（遵循仓库规则）
3. 在底部为相关笔记添加 `[[wikilinks]]`
4. 如果是编号序列的一部分，使用分级编号方案

### Find related notes

在仓库中搜索 `[[Note Title]]` 以查找反向链接：

```bash
grep -rl "\\[\\[Note Title\\]\\]" "/mnt/d/Obsidian Vault/AI Research/"
```

### Find index notes

```bash
find "/mnt/d/Obsidian Vault/AI Research/" -name "*Index*"
```
