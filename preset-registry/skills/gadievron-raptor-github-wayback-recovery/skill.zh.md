---
name: github-wayback-recovery
description: Recover deleted GitHub content using the Wayback Machine and Archive.org APIs. Use when repositories, files, issues, PRs, or wiki pages have been deleted from GitHub but may persist in web archives. Covers CDX API queries, URL patterns, and systematic recovery workflows.
user-invocable: false
version: 1.0
author: mbrg
tags:
  - github
  - wayback
  - archive
  - osint
  - forensics
  - recovery
---
# GitHub Wayback 恢复

**用途**：当内容已无法在 GitHub 上获取时，从互联网档案馆的 Wayback Machine 中恢复已删除的 GitHub 内容（README 文件、议题、PR、Wiki 页面、仓库元数据）。

## 何时使用此 Skill

- 仓库已被删除，而你需要获取 README、Wiki 或元数据
- 议题或 PR 已被作者、维护者或内容审核人员删除
- 需要恢复可能已被归档的文件内容
- 调查仓库的历史状态
- 通过已归档的网络页面查找已删除仓库的复刻
- 从已删除的项目中恢复发行说明或文档

**互补 Skill**：
- **github-archive**：用于获取结构化事件数据（谁在何时做了什么）——始终优先检查
- **github-commit-recovery**：用于在已有 SHA 时访问提交
- **github-wayback-recovery**（本 Skill）：用于在内容已被彻底删除时获取网页快照

## 核心原则

**Wayback Machine 归档的是网页，而不是 Git 仓库**：
- 无法从归档内容执行 `git clone`
- 无法重建完整的提交历史
- 恢复能否成功取决于特定 URL 是否曾被抓取

**可以恢复的内容**：
- README 文件和仓库描述
- 议题标题、正文和评论（Archive Team 会优先归档这些内容）
- PR 对话和描述（Files Changed 选项卡通常无法正常恢复）
- Wiki 页面（尤其是 Wiki 首页）
- 发行说明和描述
- 仓库元数据（主页上可见的星标数、语言、许可证）
- 已归档提交列表页面中的提交 SHA（使用 **github-commit-recovery** Skill 访问实际内容）

**无法恢复的内容**：
- 私有仓库内容（从未被抓取）
- 完整的 Git 历史或仓库克隆
- 需要身份验证才能访问的内容

## 快速开始

**检查仓库页面是否已被归档**：
```bash
curl -s "https://archive.org/wayback/available?url=github.com/owner/repo" | jq
```

**搜索仓库下的所有已归档 URL**：
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/*&output=json&collapse=urlkey" | head -50
```

**访问已归档的快照**：
```
https://web.archive.org/web/{TIMESTAMP}/https://github.com/owner/repo
```

## 用于归档搜索的 GitHub URL 模式

理解 GitHub 的 URL 结构对于构造归档查询至关重要。

### 仓库级 URL

| 内容类型 | URL 模式 |
|--------------|-------------|
| 主页 | `github.com/{owner}/{repo}` |
| 提交列表 | `github.com/{owner}/{repo}/commits/{branch}` |
| 单个提交 | `github.com/{owner}/{repo}/commit/{full-sha}` |
| 复刻网络 | `github.com/{owner}/{repo}/network/members` |

### 文件和目录 URL

| 内容类型 | URL 模式 |
|--------------|-------------|
| 文件视图 | `github.com/{owner}/{repo}/blob/{branch}/{path/to/file}` |
| 目录视图 | `github.com/{owner}/{repo}/tree/{branch}/{directory}` |
| 文件历史 | `github.com/{owner}/{repo}/commits/{branch}/{path/to/file}` |
| 原始文件 | `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}` |

**注意**：`blob` = 文件，`tree` = 目录。与渲染后的视图相比，原始 URL 很少被归档。

### 协作产物

| 内容类型 | URL 模式 |
|--------------|-------------|
| 拉取请求 | `github.com/{owner}/{repo}/pull/{number}` |
| PR 文件 | `github.com/{owner}/{repo}/pull/{number}/files` |
| PR 提交 | `github.com/{owner}/{repo}/pull/{number}/commits` |
| Issue | `github.com/{owner}/{repo}/issues/{number}` |
| Wiki 页面 | `github.com/{owner}/{repo}/wiki/{page-name}` |
| Release | `github.com/{owner}/{repo}/releases/tag/{tag-name}` |
| 所有 PR | `github.com/{owner}/{repo}/pulls?state=all` |
| 所有 Issue | `github.com/{owner}/{repo}/issues?state=all` |

## CDX API 参考

捕获索引（CDX）API 可用于在所有已归档 URL 中进行结构化搜索。

### 基本查询结构

```
https://web.archive.org/cdx/search/cdx?url={URL}&output=json
```

### 关键参数

| 参数 | 作用 | 示例 |
|-----------|--------|---------|
| `matchType=exact` | 仅精确匹配 URL（默认） | 单个页面 |
| `matchType=prefix` | 所有以该路径开头的 URL | 仓库的所有内容 |
| `url=.../*` | 通配符（与前缀匹配相同） | `github.com/owner/repo/*` |
| `from=YYYY` | 开始日期筛选条件 | `from=2023` |
| `to=YYYY` | 结束日期筛选条件 | `to=2024` |
| `filter=statuscode:200` | 仅成功的捕获记录 | 跳过重定向/错误 |
| `collapse=timestamp:8` | 每天一条捕获记录 | 减少重复项 |
| `collapse=urlkey` | 仅保留唯一 URL | 列出所有已归档页面 |
| `limit=N` | 限制结果数量 | `limit=100` |
| `output=json` | JSON 格式 | 机器可读 |

### 查询示例

**查找仓库下所有已归档的页面**：
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/facebook/react/*&matchType=prefix&output=json&collapse=urlkey"
```

**查找特定仓库已归档的 Issue**：
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/issues/*&output=json&collapse=urlkey&filter=statuscode:200"
```

**查找特定文件已归档的快照**：
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/blob/*/path/to/file&output=json"
```

**检查特定日期附近是否存在已归档的快照**：
```bash
curl -s "https://archive.org/wayback/available?url=github.com/owner/repo&timestamp=20230615"
```

### CDX 响应格式

```json
[
  ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
  ["com,github)/owner/repo", "20230615142311", "https://github.com/owner/repo", "text/html", "200", "ABC123...", "12345"]
]
```

## 调查模式

### 恢复已删除的文件内容

**场景**：仓库或文件已被删除，需要恢复文件内容。

**第 1 步：搜索 blob URL**
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/blob/*/README.md&output=json"
```

**第 2 步：根据时间戳构造归档 URL**
```
https://web.archive.org/web/20230615142311/https://github.com/owner/repo/blob/main/README.md
```

**第 3 步：手动提取内容或使用 waybackpack**
```bash
pip install waybackpack
waybackpack "https://github.com/owner/repo/blob/main/README.md" -d output_dir
```

**取证价值**：恢复在特定时间点存在的文档、配置文件或证据。

### 恢复已删除的 Issue/PR 内容

**场景**：Issue 或 PR 已被删除，而你需要获取其原始内容。

**第 1 步：查询 Issue 页面快照**
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/issues/123*&output=json"
```

**第 2 步：访问已归档页面**
```
https://web.archive.org/web/{TIMESTAMP}/https://github.com/owner/repo/issues/123
```

**第 3 步：如果 Issue 编号未知，则搜索 PR/Issue 列表**
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/issues?state=all&output=json"
```

**注意**：自 2020 年以来，Archive Team 一直在积极抓取 GitHub Issue 和 PR。Issue 内容的恢复成功率高于文件内容。

### 查找已删除仓库的 Fork

**场景**：仓库已被删除，但 Fork 中可能包含完整的 Git 历史记录。

**第 1 步：搜索已归档的 Fork 网络页面**
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/network/members&output=json"
```

**第 2 步：访问已归档的网络页面**
```
https://web.archive.org/web/{TIMESTAMP}/https://github.com/owner/repo/network/members
```

**第 3 步：从已归档页面中提取 Fork 用户名，并检查这些 Fork 是否仍然存在**
```bash
# Check if fork exists
curl -s -o /dev/null -w "%{http_code}" https://github.com/forker/repo
```

**取证价值**：仍然活跃的 Fork 包含完整的 Git 历史记录，包括所有提交。这通常比尝试恢复单个文件效果更好。

### 恢复 Wiki 内容

**场景**：仓库 Wiki 已被删除或设为私有。

**第 1 步：搜索 Wiki 页面**
```bash
curl -s "https://web.archive.org/cdx/search/cdx?url=github.com/owner/repo/wiki*&output=json&collapse=urlkey"
```

**第 2 步：访问 Wiki 主页或特定页面**
```
https://web.archive.org/web/{TIMESTAMP}/https://github.com/owner/repo/wiki
https://web.archive.org/web/{TIMESTAMP}/https://github.com/owner/repo/wiki/Page-Name
```

## Python 实现

```python
import requests
import json
from typing import Optional, List, Dict
from time import sleep

class WaybackGitHubRecovery:
    CDX_API = "https://web.archive.org/cdx/search/cdx"
    AVAILABILITY_API = "https://archive.org/wayback/available"
    ARCHIVE_URL = "https://web.archive.org/web"

    def check_availability(self, url: str, timestamp: Optional[str] = None) -> Optional[Dict]:
        """Check if URL has any archived snapshots."""
        params = {"url": url}
        if timestamp:
            params["timestamp"] = timestamp

        resp = requests.get(self.AVAILABILITY_API, params=params)
        data = resp.json()

        if data.get("archived_snapshots", {}).get("closest"):
            return data["archived_snapshots"]["closest"]
        return None

    def search_cdx(self, url: str, match_type: str = "prefix",
                   collapse: str = "urlkey", limit: int = 1000) -> List[Dict]:
        """Search CDX API for archived URLs."""
        params = {
            "url": url,
            "output": "json",
            "matchType": match_type,
            "collapse": collapse,
            "filter": "statuscode:200",
            "limit": limit
        }

        resp = requests.get(self.CDX_API, params=params)
        data = resp.json()

        if len(data) <= 1:  # Only header row
            return []

        headers = data[0]
        results = []
        for row in data[1:]:
            results.append(dict(zip(headers, row)))

        return results

    def find_repository_content(self, owner: str, repo: str) -> Dict[str, List]:
        """Find all archived content for a repository."""
        base_url = f"github.com/{owner}/{repo}"

        results = {
            "homepage": self.search_cdx(base_url, match_type="exact"),
            "issues": self.search_cdx(f"{base_url}/issues/*"),
            "pulls": self.search_cdx(f"{base_url}/pull/*"),
            "wiki": self.search_cdx(f"{base_url}/wiki*"),
            "files": self.search_cdx(f"{base_url}/blob/*"),
            "network": self.search_cdx(f"{base_url}/network/members", match_type="exact"),
        }

        return results

    def get_archived_page(self, url: str, timestamp: str) -> Optional[str]:
        """Retrieve archived page content."""
        archive_url = f"{self.ARCHIVE_URL}/{timestamp}/{url}"
        resp = requests.get(archive_url)

        if resp.status_code == 200:
            return resp.text
        return None

    def find_forks(self, owner: str, repo: str) -> List[str]:
        """Find potential forks from archived network page."""
        network_results = self.search_cdx(
            f"github.com/{owner}/{repo}/network/members",
            match_type="exact"
        )

        forks = []
        if network_results:
            # Get most recent snapshot
            latest = network_results[-1]
            content = self.get_archived_page(
                f"https://github.com/{owner}/{repo}/network/members",
                latest["timestamp"]
            )
            if content:
                # Extract fork usernames (simplified - would need HTML parsing)
                # Look for patterns like href="/username/repo"
                import re
                pattern = rf'href="/([^/]+)/{repo}"'
                matches = re.findall(pattern, content)
                forks = list(set(matches) - {owner})

        return forks


# Usage Example
recovery = WaybackGitHubRecovery()

# Check if repository homepage was archived
snapshot = recovery.check_availability("https://github.com/deleted-user/deleted-repo")
if snapshot:
    print(f"Archived at: {snapshot['url']}")
    print(f"Timestamp: {snapshot['timestamp']}")

# Find all archived content
content = recovery.find_repository_content("deleted-user", "deleted-repo")
print(f"Found {len(content['issues'])} archived issue pages")
print(f"Found {len(content['files'])} archived file pages")

# Find potential forks
forks = recovery.find_forks("deleted-user", "deleted-repo")
for fork in forks:
    print(f"Potential fork: github.com/{fork}/deleted-repo")
```

## 局限性与注意事项

### 技术局限性

- **JavaScript 渲染的内容**：GitHub 的现代界面使用 AJAX；归档页面中的文件树、追溯视图和导航可能无法正常工作
- **原始文件下载**：`raw.githubusercontent.com` URL 很少被归档
- **二进制资源**：发布版本的二进制文件和附件通常无法归档

### 速率限制

Archive.org 存在未公开说明的速率限制：
- 可持续速率：约 100 个请求/分钟
- 如果收到 429 响应，请实现指数退避
- 使用 `collapse` 参数减少结果数量
- 对重复分析的结果进行本地缓存

## 故障排除

**未找到归档快照**：
- 仓库可能太新或过于冷门，尚未被抓取
- 尝试使用通配符进行搜索：`github.com/owner/repo/*`
- 检查仓库是否曾经公开（私有仓库不会被抓取）

**归档页面布局损坏**：
- 对于大量使用 JavaScript 的页面而言，这是正常现象
- 尝试使用“查看源代码”提取文本内容
- 使用更早的时间戳（2020 年以前的 GitHub 渲染方式更简单）

**CDX API 返回空结果**：
- 验证 URL 格式（无尾部斜杠、大小写正确）
- 尝试使用 `matchType=prefix`，而非精确匹配
- 移除 `filter=statuscode:200` 以查看所有抓取结果

**受到 Archive.org 的速率限制**：
- 在请求之间设置延迟（1-2 秒）
- 使用 `collapse=timestamp:8` 减少重复项
- 在非高峰时段下载

## 了解更多

- **Wayback Machine CDX API**：https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server
- **Archive Team GitHub 项目**：https://wiki.archiveteam.org/index.php/GitHub
- **Internet Archive Python 库**：https://archive.org/services/docs/api/internetarchive/
- **waybackpy 文档**：https://pypi.org/project/waybackpy/