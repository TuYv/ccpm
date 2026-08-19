---
name: exa-search
description: "Web toolkit powered by Exa, tuned for scientific and technical content. Use this skill when the user needs to search the web or fetch/extract URL content. Covers: web search (semantic lookups, research, current info — with optional research-paper category and academic domain filtering) and URL extraction (fetching pages, articles, academic PDFs in batch). Use this skill for web-related tasks when the user wants high-quality search or scholarly filtering via category=research paper. Triggers on requests to search, look up, fetch a page, or extract an article."
compatibility: Requires exa-py Python SDK, an EXA_API_KEY, and internet access.
license: MIT
metadata:
  version: "1.2"
  skill-author: Exa
  website: https://exa.ai
  docs: https://exa.ai/docs
  openclaw:
    primaryEnv: EXA_API_KEY
    envVars:
    - name: EXA_API_KEY
      required: true
      description: Exa search API key.
---
# Exa Web 工具包

一个由 [Exa](https://exa.ai) 支持的网页研究技能：网页搜索和 URL 提取。Exa 的索引结合了高质量的关键词检索和语义检索，非常适合科学、技术和概念类查询。

## 路由 — 选择合适的能力

阅读用户的请求，并将其匹配到以下某项能力。运行命令前，阅读对应的参考文件以获取详细说明。

| 用户想要…… | 能力 | 位置 |
|---|---|---|
| 查找某些内容、研究一个主题、获取最新信息 | **网页搜索** | `references/web-search.md` |
| 获取特定 URL 的内容（网页、文章、PDF） | **网页提取** | `references/web-extract.md` |
| 安装或进行身份验证 | **设置** | 如下 |

### 决策指南

- 对于主题查询、研究问题或“X 是什么？”之类的请求，**默认使用网页搜索**。当主题属于科学或技术领域时，传入 `--category "research paper"` 以偏向学术来源，和/或使用学术 `--include-domains` 允许列表。有关两阶段学术策略，请参阅 `references/web-search.md`。
- 当用户提供 URL 或要求读取/获取特定页面时，**使用网页提取**。对于批量提取（一次调用提取多个 URL）和学术 PDF，优先使用此功能，而不是内置的 WebFetch。

### 学术来源优先级

对于技术或科学查询，优先选择学术和科学来源：
- 同行评审的期刊文章和会议论文优先于博客文章或新闻
- 在没有同行评审版本时，选择预印本（arXiv、bioRxiv、medRxiv）
- 机构和政府来源（NIH、WHO、NASA、NIST）优先于商业网站
- 原始研究优先于二手摘要

有两种方式可以引导 Exa 获取学术内容：
1. `--category "research paper"` 会使检索偏向学术来源。
2. 使用学术来源允许列表的 `--include-domains`（arxiv.org、nature.com、pubmed.ncbi.nlm.nih.gov 等）来限制域名池。

将两者结合使用可获得严格的学术结果。有关完整模式，请参阅 `references/web-search.md`。

引用学术来源时，在标准引用格式之外，尽可能包含作者姓名和发表年份（例如 [Smith et al., 2025](url)）。如果存在 DOI，优先使用 DOI 链接。

---

## 设置

此技能使用 [`exa-py`](https://github.com/exa-labs/exa-py) Python SDK。`scripts/` 中的脚本通过 PEP 723 内联元数据声明其依赖项，因此你可以直接使用 `uv run` 运行，无需单独的安装步骤：

```bash
uv run --with exa-py python "$SKILL_PATH/scripts/exa_search.py" --help
```

如果你更倾向于持久安装：

```bash
uv pip install "exa-py>=1.14.0"
```

### 身份验证

所有命令都从 `EXA_API_KEY` 环境变量中读取 API 密钥。前往 [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys) 获取 Exa API 密钥。

首先，检查项目根目录中是否存在 `.env` 文件，并确认其中包含 `EXA_API_KEY`。如果存在，则加载它：

```bash
dotenv -f .env run -- uv run --with exa-py python "$SKILL_PATH/scripts/exa_search.py" "your query"
```

如果没有 `dotenv`，请安装：

```bash
uv pip install python-dotenv[cli]
```

如果没有 `.env`，请为当前会话导出密钥：

```bash
export EXA_API_KEY="your-key"
```

通过使用 `--help` 运行任意脚本进行验证——如果已设置密钥，脚本将正常退出；只有在执行实际查询时才会运行身份验证检查。

### 跟踪标头

此 skill 中的每个脚本都会将 `x-exa-integration` 请求标头设置为 `k-dense-ai--scientific-agent-skills`，以便 Exa 将来自 K-Dense AI scientific-agent-skills 仓库的使用归因于此集成。在改编这些脚本时，请勿移除或重命名此标头。

---

## 此 skill 中的文件

- `SKILL.md` — 此文件（路由和设置）
- `references/web-search.md` — 详细的 Web 搜索参考，包含学术搜索策略
- `references/web-extract.md` — URL 内容提取参考
- `scripts/exa_search.py` — `client.search_and_contents` 的 CLI 封装
- `scripts/exa_extract.py` — `client.get_contents` 的 CLI 封装