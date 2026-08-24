# PyPI

## 概述
Python Package Index——Python 软件包的官方仓库。提供公开的 JSON API，无需身份验证。

## 工作流

### 查询软件包
1. `getPackage(package)` → 名称、摘要、版本、作者、许可证、依赖项

### 检查特定版本
1. `getPackage(package)` → `version`（最新版本）
2. `getPackageVersion(package, version)` → 该版本的元数据

### 列出软件包的所有版本
1. `getReleases(package)` → `versions[]`

### 比较版本
1. `getReleases(package)` → `versions[]`
2. `getPackageVersion(package, version)` → 版本 A 的元数据
3. `getPackageVersion(package, version)` → 版本 B 的元数据

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getPackage | 获取软件包元数据 | 软件包名称 | name, summary, version, author, license, requires_dist | 入口点 |
| getPackageVersion | 获取特定版本的元数据 | package, version <- getReleases / getPackage | name, version, requires_python, requires_dist, upload_time | |
| getReleases | 列出所有版本 | 软件包名称 | versions[] | 入口点 |

## 快速开始

```bash
# Get package metadata
openweb pypi exec getPackage '{"package": "requests"}'

# Get specific version info
openweb pypi exec getPackageVersion '{"package": "requests", "version": "2.31.0"}'

# List all released versions
openweb pypi exec getReleases '{"package": "flask"}'
```