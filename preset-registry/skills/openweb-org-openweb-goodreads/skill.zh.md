# Goodreads

## 概述
全球最大的图书社区（由 Amazon 所有）。搜索图书、获取包含评分和评论的图书详情，以及探索作者资料。

## 工作流

### 查找图书并阅读评论
1. `searchBooks(q)` → 选择结果 → `bookId`
2. `getBook(bookId)` → 书名、评分、简介、类型
3. `getReviews(bookId)` → 带评分的社区评论

### 探索作者的作品
1. `searchBooks(q)` → 选择结果 → `authorId`
2. `getAuthor(authorId)` → 简介、书目（每本书包含 `bookId`）
3. `getBook(bookId)` → 获取任意图书的完整详情

## 操作

| Operation | Intent | Key Input | Key Output | Notes |
|-----------|--------|-----------|------------|-------|
| searchBooks | 按书名/作者/ISBN 查找图书 | q | bookId, title, author, authorId, averageRating | 入口点；每页 20 条结果 |
| getBook | 获取完整的图书详情 | bookId ← searchBooks | title, author, ratingValue, description, genres, pageCount, isbn | LD+JSON + DOM |
| getReviews | 获取社区评论 | bookId ← searchBooks | name, rating, text, date | 最多获取页面中的 30 条评论 |
| getAuthor | 获取作者资料和书目 | authorId ← searchBooks | name, bio, born, books[] | 图书包含 bookId |

## 快速开始

```bash
# Search for a book
openweb goodreads exec searchBooks '{"q": "dune"}'

# Get book details
openweb goodreads exec getBook '{"bookId": "44767458-dune"}'

# Get reviews for a book
openweb goodreads exec getReviews '{"bookId": "44767458-dune"}'

# Get author profile
openweb goodreads exec getAuthor '{"authorId": "58.Frank_Herbert"}'
```