# Trip.com / 携程

## 概述
中国最大的旅游平台（携程国际）。通过 Trip.com 内部仅支持 POST 的 REST API 提供航班、火车、景点和目的地指南。旅行类原型。

## 工作流

### 搜索和比较航班
1. `searchPOI(key)` → `code`（城市/机场 IATA 代码）、`districtId`
2. `searchFlights(departCode, arriveCode, departDate)` → `flightItineraryList[]`，包含 `flightNo`、价格；`token`
3. `getFlightCalendarPrices(dCity, aCity, dDate)` → 一个月内每天的最低票价
4. `getFlightComfort(flightNo, dCity, aCity, dDate)` → 特定航班的座椅间距、WiFi、娱乐设施
5. `getFlightFilters(token)` → 可用于细化结果的筛选选项（航空公司、经停次数、舱位）

### 规划火车行程
1. `getTrainStations()` → `stationCode`、`stationName`、`cityName`
2. `searchTrains(departStation, arriveStation, departDate)` → `trainList[]`，包含 `trainNumber`、`seatList[]{seatType, price, available}`
3. `getTrainCalendar(departStation, arriveStation, month)` → `calendarList[]{date, available, lowestPrice}`

### 探索目的地
1. `getHotDestinations()` → `id`（districtId）、`word`（目的地名称）
2. `getCityList(countryId)` → `districtId`、`cityName`
3. `getDestinationInfo(districtId)` → 景点、酒店、餐厅、评论；以及 `toursAndTickets[]{productId}`
4. `searchAttractions(sceneCode)` → `productId`、`productName`、评分、价格
5. `getAttractionDetail(productId)` → 描述、门票、开放时间、评价

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPOI | 查找城市/机场代码 | key（关键词） | results[]{name, code, districtId} | 航班/火车的入口点 |
| searchFlights | 搜索航班 | departCode ← searchPOI.code, arriveCode ← searchPOI.code, departDate | flightItineraryList[]{flightNo, airline, times, price}, token | 需要 Head 对象 |
| getFlightCalendarPrices | 每日最低票价 | dCity ← searchPOI.code, aCity ← searchPOI.code, dDate | lowPriceInCalenderDtoInfoList[]{date, price} | 日历视图 |
| getFlightComfort | 飞机舒适度信息 | flightNo ← searchFlights, dCity ← searchPOI.code, aCity ← searchPOI.code, dDate | flightComfortList[]{seatPitch, wifi, entertainment} | |
| getFlightFilters | 航班筛选选项 | token ← searchFlights | filterList[]{filterType, options[]{label, value, count}} | 细化搜索结果 |
| getTrainStations | 列出火车站 | — | stationList[]{stationName, stationCode, cityName} | 火车搜索的入口点 |
| searchTrains | 搜索火车 | departStation ← getTrainStations.stationCode, arriveStation ← getTrainStations.stationCode, departDate | trainList[]{trainNumber, times, seatList 及价格} | |
| getTrainCalendar | 火车可用性日历 | departStation ← getTrainStations.stationCode, arriveStation ← getTrainStations.stationCode, month | calendarList[]{date, available, lowestPrice} | |
| getHotDestinations | 热门目的地 | — | data[]{id, word, url} | 入口点；id = districtId |
| getCityList | 某个国家的城市 | countryId | cityList[]{districtId, cityName, imageUrl} | 探索入口点 |
| getDestinationInfo | 目的地旅行指南 | districtId ← getHotDestinations.id / getCityList.districtId | hotDistrict, classicRecommendSight[]{poiName, rating}, classicRecommendHotel[]{hotelName, price}, hotComment[]{content, rating} | www.trip.com |
| searchAttractions | 游玩项目 | sceneCode（例如 city_sight_list） | list[]{productId, productName, rating, price}, sortRuleList[]{sortType, sortName} | www.trip.com |
| getAttractionDetail | 景点详情 | productId ← searchAttractions.productId | description, rating, reviewCount, tickets, hours | www.trip.com |
| getGeneralInfo | 站点信息/公告 | — | savedTips, travelTipsList[]{title, content}, promotionList[]{title, linkUrl}, noticeList[]{title, content} | 实用工具 |

## 快速开始

```bash
# Search for city codes
openweb ctrip exec searchPOI '{"key":"Tokyo","mode":"0","tripType":"OW"}'

# Search flights NYC → Shanghai
openweb ctrip exec searchFlights '{"searchCriteria":{"tripType":1,"journeyNo":1,"passengerInfoType":{"adultCount":1,"childCount":0,"infantCount":0},"journeyInfoTypes":[{"journeyNo":1,"departDate":"2026-05-01","departCode":"NYC","arriveCode":"SHA"}]},"Head":{"Locale":"en-US","Currency":"USD","Group":"Trip","Source":"ONLINE","Version":"3"}}'

# Get cheapest fares for a month
openweb ctrip exec getFlightCalendarPrices '{"dCity":"NYC","aCity":"SHA","dDate":"2026-05-01","flightWayType":"OW","cabinClass":"Economy"}'

# Browse trending destinations
openweb ctrip exec getHotDestinations '{"lang":"en","locale":"en-US","currency":"USD","dataType":"destinations","head":{"syscode":"999","locale":"en-US"}}'

# Get destination guide for Shanghai (districtId=2)
openweb ctrip exec getDestinationInfo '{"districtId":"2","moduleList":["classicRecommendSight"]}'

# Search attractions
openweb ctrip exec searchAttractions '{"baseInfo":{"channelId":24,"locale":"en-US","currency":"USD"},"sceneParams":[{"sceneCode":"city_sight_list"}]}'
```