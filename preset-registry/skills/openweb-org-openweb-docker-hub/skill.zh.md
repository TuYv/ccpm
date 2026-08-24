# Docker Hub

## 概述
容器镜像注册表。提供用于搜索和浏览 Docker 镜像、标签及元数据的公共 REST API。

## 工作流

### 查找容器镜像
1. `searchImages(query)` → `repo_name`（格式：namespace/name）
2. `getImage(namespace, name)` → 完整描述、星标数、拉取次数

### 检查可用版本/标签
1. `searchImages(query)` → `repo_name` → 拆分为 `namespace`、`name`
2. `getTags(namespace, name)` → 包含大小、架构和最后更新时间的标签

### 查看官方镜像
1. `getImage("library", name)` → 镜像详情（官方镜像使用 "library" 命名空间）
2. `getTags("library", name)` → 可用标签

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchImages | 查找容器镜像 | query | repo_name, short_description, star_count, pull_count, is_official | 入口，支持分页 |
| getImage | 获取镜像详情 | namespace, name <- searchImages | description, full_description, star_count, pull_count, last_updated | 官方镜像使用 "library" |
| getTags | 列出镜像标签/版本 | namespace, name <- searchImages | name, full_size, images[].architecture, last_updated | 支持分页和排序 |

## 快速开始

```bash
# Search for images
openweb docker-hub exec searchImages '{"query":"nginx"}'

# Get details for an official image (namespace = "library")
openweb docker-hub exec getImage '{"namespace":"library","name":"nginx"}'

# Get details for a user image
openweb docker-hub exec getImage '{"namespace":"bitnami","name":"nginx"}'

# List tags for an image
openweb docker-hub exec getTags '{"namespace":"library","name":"python","page_size":10}'

# List tags sorted by most recently updated
openweb docker-hub exec getTags '{"namespace":"library","name":"node","ordering":"-last_updated","page_size":25}'
```

## 已知问题
- 官方镜像要求将 `library` 作为命名空间参数。
- 搜索结果使用 `repo_name`，其格式可能为 `library/nginx` 或 `user/repo`。
- 对于多架构清单，标签的 `full_size` 可能为 0；请查看 `images[].size` 以获取各架构对应的大小。
- 默认分页大小有所不同：搜索默认为 25，标签默认为 10。