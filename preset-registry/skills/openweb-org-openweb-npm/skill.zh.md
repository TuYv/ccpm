# npm

## 概述
位于 registry.npmjs.org 的 JavaScript 软件包注册表。提供用于软件包搜索、元数据、版本和下载统计信息的公共 REST API。

## 工作流

### 查找软件包
1. `searchPackages(text)` → 浏览 `objects[].package` → 选择 `name`
2. `getPackage(package=name)` → 描述、最新版本、依赖项、许可证

### 检查软件包健康状况
1. `getPackage(package)` → 最新版本、维护者、代码仓库、时间戳
2. `getDownloads(package)` → 下载量、开始日期、结束日期
3. `getVersions(package)` → 包含日期的完整发布历史

### 比较版本
1. `getVersions(package)` → 按从新到旧排序的所有版本及其发布日期
2. `getPackage(package)` → 最新版本的依赖项和 dist-tags

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPackages | 按关键字查找软件包 | text | name, version, description, score, downloads | 入口点，通过 from/size 分页 |
| getPackage | 软件包摘要 | package <- searchPackages.name | name, description, latest deps, license, maintainers | 由适配器解包的摘要 |
| getVersions | 包含日期的版本历史 | package <- searchPackages.name | versions [{version, date}], versionCount | 按从新到旧排序 |
| getDownloads | 每周下载统计信息 | package <- searchPackages.name | downloads, start, end | 使用 api.npmjs.org 主机 |

## 快速开始

```bash
# Search for packages
openweb npm exec searchPackages '{"text": "express"}'

# Get package summary
openweb npm exec getPackage '{"package": "react"}'

# Get version history
openweb npm exec getVersions '{"package": "express"}'

# Get download stats
openweb npm exec getDownloads '{"package": "lodash"}'
```