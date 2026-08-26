---
name: setup-arxiv-mcp
description: Guide for setup arXiv paper search MCP server using Docker MCP
---
用户输入：

```text
$ARGUMENTS
```

# 通过 Docker MCP 设置 arXiv MCP server 指南

## 1. 确定设置上下文

询问用户希望将配置存储在哪里：

**选项：**

1. **项目级别（通过 git 共享）** - 配置纳入版本控制，与团队共享
   - CLAUDE.md 更新到：`./CLAUDE.md`

2. **项目级别（个人偏好）** - 配置保留在本地，不纳入 git 跟踪
   - CLAUDE.md 更新到：`./CLAUDE.local.md`
   - 验证这些文件是否已列在 `.gitignore` 中，如果没有则添加

3. **用户级别（全局）** - 配置适用于该用户的所有项目
   - CLAUDE.md 更新到：`~/.claude/CLAUDE.md`

保存用户的选择，并在后续步骤中使用相应的路径。

## 2. 检查 Docker MCP 是否可用

首先，尝试使用 `mcp-find` 工具搜索服务器，以验证 Docker MCP（MCP_DOCKER）是否可访问。

如果 Docker MCP 不可用：

1. 要求用户按照 <https://docs.docker.com/desktop/> 中的说明安装 Docker Desktop
2. 安装 Docker Desktop 后，指导用户通过 <https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/#claude-code> 连接 MCP
3. 配置完成后，要求用户重启 Claude Code 并运行 "continue" 以继续设置

## 3. 搜索并添加 paper-search MCP server

告知用户，常规的 `arxiv-mcp-server` 已知存在问题，具体表现为初始化失败（初始化期间出现 EOF error）。因此我们将改用 `paper-search` MCP server。

使用 Docker MCP 查找并添加提供全面学术论文搜索功能的 `paper-search` MCP server：

```
mcp-find query: "paper-search"
mcp-add name: "paper-search" activate: true
```

此服务器提供对多个学术来源的访问：

- **arXiv** - 物理学、数学、计算机科学等领域的预印本
- **PubMed** - 生物医学文献
- **bioRxiv/medRxiv** - 生物学和医学预印本
- **Semantic Scholar** - AI 驱动的研究工具
- **Google Scholar** - 广泛的学术搜索
- **IACR** - 密码学研究
- **CrossRef** - 基于 DOI 的引文数据库

## 4. 测试设置

通过搜索论文验证服务器是否正常工作：

```
mcp-exec name: "search_arxiv" arguments: {"query": "test query", "max_results": 2}
```

## 5. 更新 CLAUDE.md 文件

使用第 1 步确定的路径：

paper-search MCP server 成功设置后，使用以下内容更新 CLAUDE.md 文件：

```markdown
### Use Paper Search MCP for Academic Research

Paper Search MCP is available via Docker MCP for searching and downloading academic papers.

**Available tools**:

- `search_arxiv` - Search arXiv preprints (physics, math, CS, etc.)
- `search_pubmed` - Search PubMed biomedical literature
- `search_biorxiv` / `search_medrxiv` - Search biology/medicine preprints
- `search_semantic` - Search Semantic Scholar with year filters
- `search_google_scholar` - Broad academic search
- `search_iacr` - Search cryptography papers
- `search_crossref` - Search by DOI/citation

**Download and read tools**:

- `download_arxiv` / `read_arxiv_paper` - Download/read arXiv PDFs
- `download_biorxiv` / `read_biorxiv_paper` - Download/read bioRxiv PDFs
- `download_semantic` / `read_semantic_paper` - Download/read via Semantic Scholar

**Usage notes**:

- Use `mcp-exec` to call tools, e.g., `mcp-exec name: "search_arxiv" arguments: {"query": "topic", "max_results": 10}`
- Downloaded papers are saved to `./downloads` by default
- For Semantic Scholar, supports multiple ID formats: DOI, ARXIV, PMID, etc.
```

## 6. 替代方案：arxiv-mcp-server

如果你确实需要具有额外功能（深度分析提示、本地存储管理）的专用 arXiv MCP 服务器，可以尝试：

```
mcp-find query: "arxiv"
mcp-config-set server: "arxiv-mcp-server" key: "storage_path" value: "/path/to/papers"
mcp-add name: "arxiv-mcp-server" activate: true
```

注意：此服务器需要配置用于存储下载论文的路径。