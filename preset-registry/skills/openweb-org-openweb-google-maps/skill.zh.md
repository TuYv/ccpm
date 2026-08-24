# Google Maps

## 概述

Google Maps——地点搜索、地点详情、路线规划和地理编码。基于适配器从内部 API 和 SPA DOM 中提取数据。

## 工作流

### 查找地点并获取详情

1. `searchPlaces(query)` → `placeId`、名称、地址、评分
2. `getPlaceDetails(placeId)` → 名称、地址、评分、营业时间、网站、电话、评论
3. `getPlaceReviews(placeId)` → 包含作者、评分、相对时间的评论
4. `getPlacePhotos(placeId)` → 带尺寸信息的照片 URL
5. `getPlaceHours(placeId)` → 每周营业时间表
6. `getPlaceAbout(placeId)` → 描述、类别、属性

步骤 2–6 均使用步骤 1 中的 `placeId`。

### 搜索附近地点并进行比较

1. `nearbySearch(category, location)` → `placeId`、名称、地址、评分
2. 对每个结果调用 `getPlaceDetails(placeId)` → 比较评分、营业时间、价格

### 获取地点之间的路线

- `getDirections(origin, destination)` → 包含距离和时长的驾车路线
- `getTransitDirections(origin, destination)` → 公共交通路线
- `getWalkingDirections(origin, destination)` → 步行路线
- `getBicyclingDirections(origin, destination)` → 骑行路线

以上均为入口点——请选择所需的出行方式。

### 地理编码

- `geocode(address)` → 根据地址字符串获取 `lat`、`lng`、`placeId`
- `reverseGeocode(lat, lng)` → 根据坐标获取地址、地点名称

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPlaces | 按查询搜索地点 | query | placeId, name, address, rating, lat/lng | 入口点，SPA 导航 |
| getPlaceDetails | 完整的地点详情 | placeId ← searchPlaces | name, rating, hours, website, phone, reviews | 预览 API |
| getPlaceReviews | 详细评论 | placeId ← searchPlaces | reviews[].text, authorName, rating, relativeTime | 预览 API |
| getPlacePhotos | 照片 URL | placeId ← searchPlaces | photos[].url, width, height | 预览 API |
| getPlaceHours | 营业时间表 | placeId ← searchPlaces | status, schedule[].day, hours | 预览 API |
| getPlaceAbout | 描述 + 属性 | placeId ← searchPlaces | description, category, rating, website, phone | 预览 API |
| getDirections | 驾车路线 | origin, destination | routes[].name, distanceText, durationText | 入口点，SPA 导航 |
| getTransitDirections | 公共交通路线 | origin, destination | routes[].name, durationText | 入口点，SPA 导航 |
| getWalkingDirections | 步行路线 | origin, destination | routes[].name, distanceText, durationText | 入口点，SPA 导航 |
| getBicyclingDirections | 骑行路线 | origin, destination | routes[].name, distanceText, durationText | 入口点，SPA 导航 |
| nearbySearch | 搜索指定地点附近的某类场所 | category, location | placeId, name, address, rating, lat/lng | 入口点，SPA 导航 |
| getAutocompleteSuggestions | 输入时即时显示建议 | input | suggestions[].text, placeId, description | 入口点，建议 API |
| geocode | 将地址转换为坐标 | address | lat, lng, placeId, formattedAddress | 入口点，SPA 导航 |
| reverseGeocode | 将坐标转换为地址 | lat, lng | address, name, placeId | 入口点，SPA 导航 |

## 快速开始

```bash
# Search for places
openweb google-maps exec searchPlaces '{"query": "coffee shops in San Francisco"}'

# Get place details (use placeId from search results)
openweb google-maps exec getPlaceDetails '{"placeId": "0x80858135f0db680b:0x47e714bf5f0080a3", "query": "The Coffee Berry SF"}'

# Get driving directions
openweb google-maps exec getDirections '{"origin": "San Francisco, CA", "destination": "Los Angeles, CA"}'

# Get transit directions
openweb google-maps exec getTransitDirections '{"origin": "Union Square, San Francisco", "destination": "Golden Gate Park, San Francisco"}'

# Search nearby
openweb google-maps exec nearbySearch '{"category": "restaurants", "location": "Times Square"}'

# Geocode an address
openweb google-maps exec geocode '{"address": "1600 Amphitheatre Parkway, Mountain View, CA"}'

# Reverse geocode coordinates
openweb google-maps exec reverseGeocode '{"lat": 37.7749, "lng": -122.4194}'
```