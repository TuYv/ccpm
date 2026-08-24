# Quora

## 概述
问答平台——用户可以提问、撰写回答，以及关注话题和用户。

## 工作流程

### 搜索问题并阅读回答
1. `searchQuestions(query)` → 选择问题 → `slug`
2. `getQuestion(slug)` → 获取问题详情及热门回答预览
3. `getAnswers(slug)` → 获取该问题的完整回答文本

### 查找用户
1. `getProfile(username)` → 获取姓名、个人简介、关注者数量、回答数量、擅长话题

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchQuestions | 查找问题 | query（关键词） | qid, slug, title, answerCount | 入口 |
| getQuestion | 问题详情 | slug ← searchQuestions | title, answerCount, topics, topAnswers | 包含前 3 个热门回答的预览 |
| getAnswers | 阅读所有回答 | slug ← searchQuestions | author, content, upvotes, views, createdAt | 最多 20 个回答，由 GQL 支持 |
| getProfile | 用户资料 | username | name, bio, followers, answers | username 来自个人资料 URL 的 slug |

## 快速开始

```bash
# Search for questions about a topic
openweb quora exec searchQuestions '{"query": "machine learning"}'

# Get question details
openweb quora exec getQuestion '{"slug": "What-is-JavaScript"}'

# Get answers for a question
openweb quora exec getAnswers '{"slug": "What-is-JavaScript"}'

# Get a user profile
openweb quora exec getProfile '{"username": "Adam-DAngelo"}'
```