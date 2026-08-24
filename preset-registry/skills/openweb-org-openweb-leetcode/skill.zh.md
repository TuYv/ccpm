# LeetCode

## 概述
编程挑战与竞赛编程平台。通过 LeetCode 的 GraphQL API 搜索题目、获取每日挑战、浏览竞赛、查看用户资料和竞赛排名。

## 工作流

### 探索用户的竞赛表现
1. `getUserProfile(username)` → 包含排名和个人简介的资料
2. `getUserContestRanking(username)` → 竞赛积分、全球排名，以及包含 `contest.title` 的历史记录条目
3. `getContestQuestions(contestSlug)` → 用户参加的特定竞赛中的题目

### 浏览题目并阅读题解
1. `searchProblems(keyword)` 或 `getProblemList(difficulty, topicSlug)` → 包含 `titleSlug` 的题目
2. `getSolutionArticles(questionSlug)` → 按投票数排序的社区文章

### 回顾竞赛
1. `getContestHistory()` → 包含 `titleSlug` 的往期竞赛
2. `getContestQuestions(contestSlug)` → 题目及其分值
3. `getContestRanking(contestSlug, page)` → 包含得分和用时的排行榜

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProblems | 按关键词搜索题目 | keyword | title, titleSlug, difficulty, acRate, topicTags | 入口点 |
| getProblemList | 使用筛选条件浏览题目 | difficulty, topicSlug | title, titleSlug, difficulty, acRate, topicTags | 入口点；支持分页（skip, limit） |
| getDailyChallenge | 获取今天的每日挑战 | — | date, question (title, titleSlug, difficulty) | 入口点 |
| getUserProfile | 获取用户资料和统计数据 | username | ranking, realName, aboutMe, skillTags, reputation | 入口点 |
| getUserContestRanking | 获取用户竞赛积分和历史记录 | username | rating, globalRanking, topPercentage, history[] | 历史记录包含 contest.title |
| getSubmissions | 获取某道题目的提交历史 | questionSlug ← searchProblems | id, statusDisplay, lang, runtime, memory | 需要登录 |
| getSolutionArticles | 获取社区题解 | questionSlug ← searchProblems | title, summary, author, hitCount, reactions | 支持分页（skip, first）；可排序 |
| getUpcomingContests | 获取即将开始的竞赛 | — | title, titleSlug, startTime, duration | 入口点 |
| getContestHistory | 获取往期竞赛列表 | — | title, titleSlug, startTime, totalQuestions | 入口点；支持分页 |
| getContestQuestions | 获取某场竞赛的题目 | contestSlug ← getContestHistory | credit, title, titleSlug, questionId | |
| getRecentSubmissions | 获取用户最近通过的提交 | username ← getUserProfile | title, titleSlug, timestamp | 公开；支持分页（limit） |
| getContestRanking | 获取竞赛排行榜 | contestSlug ← getContestHistory | username, rank, score, finishTime | 每页 25 条；page 从 1 开始 |

## 快速开始
```bash
# Today's daily challenge
openweb leetcode exec getDailyChallenge '{}'

# Browse easy problems
openweb leetcode exec getProblemList '{"limit": 5, "difficulty": "EASY"}'

# User profile and contest rating
openweb leetcode exec getUserProfile '{"username": "lee215"}'
openweb leetcode exec getUserContestRanking '{"username": "lee215"}'

# Community solutions for a problem
openweb leetcode exec getSolutionArticles '{"questionSlug": "two-sum", "first": 5}'

# Upcoming contests
openweb leetcode exec getUpcomingContests '{}'

# Contest leaderboard
openweb leetcode exec getContestRanking '{"contestSlug": "weekly-contest-438", "page": 1}'
```