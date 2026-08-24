# GoodRx

## 概述
药品价格比较平台。比较各药房的处方药价格，并查找附近的药房。

## 工作流

### 查找药品价格
1. `searchDrugs(query)` → `name`, `url`（url 路径 = slug）
2. `getDrugPrices(slug)` → 药房价格，包括 `drugName`、`pharmacy`、`price`

### 查找附近的药房
1. `getPharmacies(zipCode?)` → 带有 URL 的连锁药房列表

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchDrugs | 搜索药品 | query | name, url | 入口点；自动补全结果 |
| getDrugPrices | 比较各药房的价格 | slug ← searchDrugs | drugName, pharmacy, price | CVS、Walgreens 等药房的优惠券价格 |
| getPharmacies | 查找附近的药房 | zipCode（可选） | name, slug, url | 入口点；默认使用浏览器地理位置 |

## 快速开始

```bash
# Search for a drug
openweb goodrx exec searchDrugs '{"query":"metformin"}'

# Get drug prices at pharmacies
openweb goodrx exec getDrugPrices '{"slug":"metformin"}'

# Find nearby pharmacies
openweb goodrx exec getPharmacies '{}'

# Find pharmacies by ZIP code
openweb goodrx exec getPharmacies '{"zipCode":"90210"}'
```