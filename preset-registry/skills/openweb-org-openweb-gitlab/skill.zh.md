# GitLab

## 概述
GitLab REST API v4 — 代码托管与 DevOps 平台（开发者工具原型）。

## 工作流

### 探索项目的 CI/CD 状态
1. `searchProjects(search)` → 选择项目 → `projectId`
2. `getProject(projectId)` → 确认项目详情
3. `listProjectPipelines(projectId)` → 流水线状态
4. `listProjectBranches(projectId)` → 活跃分支

### 查看项目议题和合并请求
1. `searchProjects(search)` → `projectId`
2. `listProjectIssues(projectId, state)` → 开放/已关闭的议题
3. `listProjectMergeRequests(projectId, state)` → 开放/已合并的 MR

### 创建议题并展开讨论
1. `searchProjects(search)` → `projectId`
2. `createIssue(projectId, title, description)` → 新议题 → `iid`
3. `createComment(projectId, issueIid, body)` → 添加讨论 → `noteId`
4. `closeIssue(projectId, issueIid)` → 解决后关闭
5. `deleteComment(projectId, issueIid, noteId)` → 删除评论

### 为项目加星标/取消星标
1. `searchProjects(search)` → `projectId`
2. `starProject(projectId)` → 已加星标
3. `unstarProject(projectId)` → 已取消星标（starProject 的反向操作）

### 浏览群组项目
1. `searchGroups(search)` → 选择群组 → `groupId`
2. `getGroup(groupId)` → 群组详情
3. `listGroupProjects(groupId)` → 群组中的项目 → `projectId`
4. `getProject(projectId)` → 完整项目详情

### 从仓库读取文件
1. `searchProjects(search)` → `projectId`
2. `listProjectBranches(projectId)` → 选择分支 → `ref`
3. `getProjectFile(projectId, filePath, ref)` → base64 内容 + 元数据

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProjects | 搜索项目 | search, order_by | id, name, path_with_namespace, star_count | 入口点 |
| getProject | 项目详情 | projectId ← searchProjects | name, description, star_count, forks_count, default_branch | |
| listProjectIssues | 列出议题 | projectId ← searchProjects, state | iid, title, state, labels | 分页 |
| listProjectMergeRequests | 列出 MR | projectId ← searchProjects, state | iid, title, state, source_branch, target_branch | 分页 |
| listProjectPipelines | 列出流水线 | projectId ← searchProjects | id, status, ref, sha | 分页 |
| listProjectBranches | 列出分支 | projectId ← searchProjects, search | name, merged, protected, default | 分页 |
| getProjectFile | 文件元数据 + 内容 | projectId ← searchProjects, filePath, ref ← listProjectBranches | file_name, size, content (base64) | |
| searchUsers | 搜索用户 | search or username | id, username, name, state | 入口点 |
| starProject | 为项目加星标 | projectId ← searchProjects | star_count | 写入，SAFE |
| unstarProject | 取消项目星标 | projectId ← searchProjects | star_count | 写入，SAFE |
| searchGroups | 搜索群组 | search | id, name, path, visibility | 入口点 |
| getGroup | 群组详情 | groupId ← searchGroups | name, description, visibility, full_path | |
| listGroupProjects | 群组的项目 | groupId ← searchGroups | id, name, path_with_namespace, star_count | 分页 |
| createIssue | 创建议题 | projectId ← searchProjects, title, description | iid, title, state, web_url | 写入，CAUTION |
| closeIssue | 关闭议题 | projectId ← searchProjects, issueIid ← listProjectIssues | iid, title, state | 写入，CAUTION |
| createComment | 评论议题 | projectId, issueIid ← listProjectIssues, body | id, body, author | 写入，CAUTION |
| deleteComment | 删除评论 | projectId, issueIid, noteId ← createComment | （无内容） | 写入，CAUTION |

## 快速开始

```bash
# Search projects
openweb gitlab exec searchProjects '{"search": "kubernetes", "per_page": 5}'

# Get project detail
openweb gitlab exec getProject '{"projectId": 278964}'

# List open issues for a project
openweb gitlab exec listProjectIssues '{"projectId": 278964, "state": "opened", "per_page": 10}'

# List merge requests
openweb gitlab exec listProjectMergeRequests '{"projectId": 278964, "state": "merged", "per_page": 5}'

# List CI/CD pipelines
openweb gitlab exec listProjectPipelines '{"projectId": 278964, "per_page": 5}'

# Search users
openweb gitlab exec searchUsers '{"search": "gitlab-bot", "per_page": 5}'

# Get group detail and list their projects
openweb gitlab exec getGroup '{"groupId": 9970}'
openweb gitlab exec listGroupProjects '{"groupId": 9970, "per_page": 5}'

# Get a file from a repository (returns base64 content)
openweb gitlab exec getProjectFile '{"projectId": 278964, "filePath": "README.md", "ref": "master"}'

# Create an issue
openweb gitlab exec createIssue '{"projectId": 81206763, "title": "Bug report", "description": "Steps to reproduce..."}'

# Close an issue
openweb gitlab exec closeIssue '{"projectId": 81206763, "issueIid": 1}'

# Comment on an issue
openweb gitlab exec createComment '{"projectId": 81206763, "issueIid": 1, "body": "Confirmed on my end"}'

# Delete a comment
openweb gitlab exec deleteComment '{"projectId": 81206763, "issueIid": 1, "noteId": 12345}'
```