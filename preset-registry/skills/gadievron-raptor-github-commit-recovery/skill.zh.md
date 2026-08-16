---
name: github-commit-recovery
description: Recover deleted commits from GitHub using REST API, web interface, and git fetch. Use when you have commit SHAs and need to retrieve actual commit content, diffs, or patches. Includes techniques for accessing "deleted" commits that remain on GitHub servers.
user-invocable: false
version: 1.0
author: mbrg
tags:
  - github
  - git
  - forensics
  - recovery
  - osint
---
# GitHub 提交恢复

**用途**：当你拥有提交 SHA 时，可直接从 GitHub 访问提交内容、差异和元数据。包括检索仍可在 GitHub 服务器上访问的“已删除”提交的方法。

## 何时使用此 Skill

- 你拥有提交 SHA，需要获取实际代码内容
- 调查被强制推送覆盖（“删除”）的提交
- 需要提交差异、补丁或完整文件内容
- 验证提交作者身份或元数据
- 从悬空提交中检索内容

**SHA 来源**：GitHub Archive、git reflog、CI/CD 日志、PR 评论、议题引用、外部归档、安全报告。

## 核心原则

**已删除的提交从未真正被删除**：
- 当开发者通过强制推送“删除”提交时，GitHub 会无限期保留这些提交
- 只要知道哈希值，任何提交 SHA 仍然可以访问
- GitHub 会显示警告（“This commit does not belong to any branch”），但仍会提供其内容
- 甚至只需 4 个十六进制字符即可访问提交（存在冲突风险）

**速率限制很重要**：
- 已认证 API：每小时 5,000 次请求
- 未认证 API：每小时 60 次请求
- Web 界面：限制未公开，大量使用时 WAF 可能会进行拦截
- Git 操作：没有明确限制，但过度克隆可能触发限流

## 快速入门

**通过 Web 浏览器访问“已删除”的提交**：
```
https://github.com/org/repo/commit/FULL_COMMIT_SHA
```

**以补丁文件形式获取提交**：
```bash
curl -L https://github.com/org/repo/commit/FULL_COMMIT_SHA.patch
```

**通过 REST API 查询**：
```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/org/repo/commits/FULL_COMMIT_SHA
```

## 访问已删除的提交

### 方法 1：直接通过 Web 访问

GitHub 会通过可预测的 URL 提供“已删除”的提交。这些提交会显示警告横幅，但其内容仍然完全可访问。

**提交视图**：
```
https://github.com/<ORG>/<REPO>/commit/<SHA>
```

**补丁格式**（包含标头的原始差异）：
```
https://github.com/<ORG>/<REPO>/commit/<SHA>.patch
```

**差异格式**（仅统一差异）：
```
https://github.com/<ORG>/<REPO>/commit/<SHA>.diff
```

**示例**：
```bash
# View commit that was force-pushed over
curl -L https://github.com/grapefruit623/gcloud-python/commit/e9c3d31212847723aec86ef96aba0a77f9387493

# Download as patch
curl -L -o leaked_commit.patch \
  https://github.com/grapefruit623/gcloud-python/commit/e9c3d31212847723aec86ef96aba0a77f9387493.patch
```

**短 SHA 访问**：GitHub 允许仅使用 4 个或更多十六进制字符访问提交（前提是该值唯一）：
```
https://github.com/org/repo/commit/e9c3
```

### 方法 2：REST API

GitHub REST API 提供结构化的提交数据，包括文件变更、作者信息和提交消息。

**端点**：
```
GET https://api.github.com/repos/{owner}/{repo}/commits/{ref}
```

**请求示例**：
```bash
curl -H "Accept: application/vnd.github+json" \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     https://api.github.com/repos/org/repo/commits/abc123def456
```

**响应结构**：
```json
{
  "sha": "abc123def456...",
  "commit": {
    "author": {
      "name": "Developer Name",
      "email": "dev@example.com",
      "date": "2025-06-15T14:23:11Z"
    },
    "message": "Commit message here"
  },
  "files": [
    {
      "filename": "src/config.js",
      "status": "added",
      "patch": "@@ -0,0 +1,3 @@\n+// config"
    }
  ]
}
```

**速率限制标头**：
```
x-ratelimit-limit: 5000
x-ratelimit-remaining: 4999
x-ratelimit-reset: 1623456789
```

### 方法 3：Git Fetch

对于批量分析或需要完整仓库上下文的情况，可通过 Git 获取特定提交。

**最小化克隆 + 获取特定提交**：
```bash
# Clone without file contents (just history/trees/commits)
git clone --filter=blob:none --no-checkout https://github.com/org/repo.git
cd repo

# Fetch the specific "deleted" commit
git fetch origin <COMMIT_SHA>

# View the commit
git show FETCH_HEAD

# View specific file from that commit
git show FETCH_HEAD:path/to/file.txt
```

**此方法有效的原因**：
- `--filter=blob:none`：初始不包含文件内容（克隆速度快）
- `--no-checkout`：不填充工作目录
- `git fetch origin <SHA>`：即使提交已被“删除”，也会获取特定提交
- 当你访问 blob 时，系统会按需获取它们

## 调查模式

### 批量下载补丁

**场景**：你有一份需要调查的提交 SHA 列表，并且需要获取其内容。

```python
import requests
import time

def download_commit_patch(repo, sha, token=None):
    url = f"https://github.com/{repo}/commit/{sha}.patch"
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    response = requests.get(url, headers=headers, allow_redirects=True)
    if response.status_code == 200:
        return response.text
    return None

# Download patches for a list of commits
commits = [
    {"repo": "org/repo1", "sha": "abc123..."},
    {"repo": "org/repo2", "sha": "def456..."},
]

for commit in commits:
    patch = download_commit_patch(commit["repo"], commit["sha"])
    if patch:
        with open(f"{commit['sha'][:8]}.patch", "w") as f:
            f.write(patch)
    time.sleep(0.5)  # Rate limit courtesy
```

### 验证提交作者身份

**场景**：需要验证究竟是谁编写了可疑提交（提交者与作者可能不同）。

**API 查询**：
```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/org/repo/commits/SHA" | \
  jq '{
    author: .commit.author,
    committer: .commit.committer,
    verified: .commit.verification.verified
  }'
```

**响应分析**：
```json
{
  "author": {
    "name": "Real Developer",
    "email": "dev@company.com",
    "date": "2025-06-15T10:00:00Z"
  },
  "committer": {
    "name": "CI Bot",
    "email": "bot@company.com",
    "date": "2025-06-15T10:05:00Z"
  },
  "verified": false
}
```

**取证说明**：
- 作者：编写代码的人（可通过 `git commit --author` 伪造）
- 提交者：创建提交对象的人
- 已验证：提交是否具有有效的 GPG 签名
- 作者与提交者之间存在差异时，应进行调查

## 真实案例

### Istio 供应链攻击防范

**发现过程**：安全研究员 Sharon Brizinov 使用 GitHub Archive 找到零提交的 PushEvents，从而恢复了“已删除”提交的 SHA。随后使用 GitHub API 获取提交内容，发现了泄露的 GitHub PAT 令牌。

**影响**：该令牌拥有对所有 Istio 仓库的管理员访问权限（共获 3.6 万颗星，被 Google、IBM、Red Hat 使用）。攻击者本可利用它：
- 读取环境变量和密钥
- 修改 CI/CD 流水线
- 推送恶意代码版本
- 删除整个仓库

**解决情况**：已通过 Istio 的安全漏洞披露流程报告；该令牌随即被撤销。

**技术链**：
1. GitHub Archive → 发现了一个零提交的 PushEvent，其中包含 `before` SHA
2. GitHub API → `GET /repos/istio/istio/commits/{SHA}.patch`
3. TruffleHog → 在提交差异中识别出有效的 GitHub PAT
4. GitHub API → 通过 `/user` 端点验证令牌权限

### 高价值密钥类别

通过扫描恢复的强制推送提交，发现影响最大的密钥依次为：
1. **GitHub PAT** - 通常拥有组织范围或管理员权限
2. **AWS 凭证** - 拥有生产环境访问权限的 IAM 密钥
3. **MongoDB 连接字符串** - 可直接访问数据库
4. **API 密钥** - Stripe、Twilio、SendGrid 等带有计费访问权限的密钥

**最可能包含密钥的文件**：
- `.env`, `.env.local`, `.env.production`
- `config.js`, `config.py`, `config.json`
- `docker-compose.yml`, `docker-compose.yaml`
- `application.properties`, `application.yml`
- `hardhat.config.js`（加密货币/Web3 项目）

## 故障排除

**API 请求返回 403 Forbidden**：
- 检查身份验证令牌是否有效
- 验证令牌是否具有所需的作用域（访问私有仓库需要 `repo`）
- 可能已达到速率限制——检查 `x-ratelimit-remaining` 响应头

**提交返回 404 Not Found**：
- 验证 SHA 是否完整（建议至少包含 7 个字符）
- 仓库可能已被删除（尝试搜索其复刻仓库）
- 提交可能位于私有仓库中（需要经过身份验证的访问）

**超出速率限制**：
- 等待限制重置（检查 `x-ratelimit-reset` 响应头中的 Unix 时间戳）
- 使用经过身份验证的请求，限额为每小时 5000 次，而非每小时 60 次
- 在自动化流程中实现指数退避

**Web 访问被 WAF 阻止**：
- 降低请求频率
- 使用 API，而不是抓取网页
- 对于批量操作，考虑使用 Git fetch 方法

**针对提交的 Git fetch 失败**：
- 一些非常旧的悬空提交可能已被垃圾回收（这种情况很少见）
- 先尝试通过 Web 界面访问，以确认其是否仍然可用
- 检查仓库是否已转移到其他组织

## 了解更多

- **GitHub REST API**：https://docs.github.com/en/rest
- **GitHub Commit API**：https://docs.github.com/en/rest/commits/commits