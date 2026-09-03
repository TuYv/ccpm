---
name: paper-search
description: Search for academic papers by keyword, or look up a specific paper by DOI or OpenAlex ID. Powered by OpenAlex (250M+ works, free, no API key).
---
搜索学术论文并获取详细信息，包括标题、作者、引用次数、DOI、摘要和开放获取链接。

步骤：
1. 查找脚本目录：`find ~/.claude -name "search.sh" -path "*/paper-search/*" 2>/dev/null | sort -V | tail -1`
   - 无论通过插件安装还是手动安装，此命令都能找到该脚本
   - `paper.sh` 脚本位于同一目录中
2. 按关键词搜索论文：
   ```
   <scripts-dir>/search.sh "your search query" [limit] [sort] [page]
   ```
   - `limit`：每页结果数量（默认：10，最大：200）
   - `sort`：`relevance`（默认）、`cites` 或 `date`
   - `page`：用于分页的页码（默认：1）
3. 通过 DOI 或 OpenAlex ID 查找特定论文：
   ```
   <scripts-dir>/paper.sh <DOI_URL or OpenAlex_ID>
   ```
   - 接受完整的 DOI URL，如 `https://doi.org/10.3390/brainsci8020020`
   - 或 OpenAlex ID，如 `W2789811475`
   - 返回完整详情：作者、摘要、概念、开放获取 PDF 链接、相关作品

提示：
- 进行主题搜索时使用 `relevance` 排序（默认）。想找里程碑式论文时使用 `cites`。
- 查询要具体——"bilingual cognitive advantages executive function" 比 "bilingualism brain" 效果更好。
- 当搜索结果显示 "Abstract: N/A" 时，使用 `paper.sh` 获取完整摘要。
- 可以将 `paper.sh` 返回的 `related_works` ID 再传回 `paper.sh`，以探索引文图谱。
- 当用户需要科学依据时：先进行宽泛搜索，挑选最相关/被引最多的论文，然后使用 `paper.sh` 获取完整详情，并以 (Author, Year, Journal) 格式引用。
