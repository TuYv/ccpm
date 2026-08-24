# ESPN

## 概述
体育新闻、比分和数据。公共 REST API——无需身份验证。

## 工作流

### 查看某项运动的实时比分
1. `getScoreboard(sport, league)` → `events[].name`、`competitors[].team`、`score`、`status`

### 查找特定球队
1. `getTeams(sport, league)` → `team.id`、`team.displayName`
2. `getTeam(sport, league, teamId=team.id)` → `displayName`、`record`、`logos`、`standingSummary`

### 查看联赛排名
1. `getStandings(sport, league)` → `children[].standings.entries[].team`、`stats`

### 获取最新体育新闻
1. `getNews(sport, league)` → `articles[].headline`、`description`、`published`、`links`

### 搜索球员或球队
1. `searchPlayers(query, type)` → `displayName`、`shortName`、`type`、`sport`、`league`

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getScoreboard | 实时/近期比分 | sport, league, dates? | events[].name, competitors[].score, status | **入口点** |
| getTeam | 球队详情 | sport, league, teamId (<- getTeams `team.id`) | team.displayName, record, logos | |
| getTeams | 列出所有球队 | sport, league | team.id, team.displayName | **入口点**；用于查找 teamId |
| getStandings | 联赛排名 | sport, league | children[].standings.entries[].team, stats | **入口点**；休赛期可能为空 |
| getNews | 体育文章 | sport, league | articles[].headline, description, published | **入口点** |
| searchPlayers | 搜索球员/球队 | query, type?, limit? | items[].displayName, shortName, type | **入口点**；使用 site.web.api.espn.com |

## 快速开始

```bash
# NFL scoreboard
openweb espn exec getScoreboard '{"sport":"football","league":"nfl"}'

# Get NBA teams
openweb espn exec getTeams '{"sport":"basketball","league":"nba"}'

# Get a specific NFL team
openweb espn exec getTeam '{"sport":"football","league":"nfl","teamId":"17"}'

# NFL standings
openweb espn exec getStandings '{"sport":"football","league":"nfl"}'

# NFL news
openweb espn exec getNews '{"sport":"football","league":"nfl"}'

# Search for a player
openweb espn exec searchPlayers '{"query":"Patrick Mahomes","type":"player","limit":5}'
```