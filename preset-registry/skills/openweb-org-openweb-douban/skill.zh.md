# 豆瓣

## 概述
中国的媒体评论与评分平台（电影、图书、音乐）。社交/媒体类原型——通过移动端 JSON API 提供涵盖电影、图书、音乐和内容发现的 14 项操作。

## 工作流

### 查找并探索电影
1. `searchMovies(q)` → 选择结果 → `target.id`
2. `getMovie(id=target.id)` → 完整详情 → `rating.value`、`intro`、`genres`、`directors`、`actors`
3. `getMovieCelebrities(id=target.id)` → `directors[]`、`actors[]`，包含 `name`、`character`、`latin_name`
4. `getMovieReviews(id=target.id)` → 用户评论 → `comment`、`rating`、`user.name`、`vote_count`
5. `getMoviePhotos(id=target.id)` → 剧照、海报 → `image.large.url`、尺寸

### 查找并探索图书
1. `searchBooks(q)` → 选择结果 → `target.id`
2. `getBook(id=target.id)` → 完整详情 → `rating.value`、`intro`、`author_intro`、`pubdate`
3. `getBookReviews(id=target.id)` → 用户评论 → `comment`、`rating`、`user.name`、`vote_count`

### 发现热门内容
1. `getRecentHotMovies()` → 热门电影 → `id`、`title`、`rating.value`
2. `getRecentHotTv()` → 热门电视剧 → `id`、`title`、`rating.value`、`episodes_info`
3. `getNowShowingMovies()` → 院线电影 → `id`、`title`、`release_date`
4. `getTop250(start)` → 历史最佳电影 → `rank_value`、`title`、`rating.value`

### 查找音乐
1. `searchMusic(q)` → 选择结果 → `target.id`
2. `getMusicDetail(id=target.id)` → 专辑详情 → `title`、`singer[]`、`songs[]`、`genres[]`

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchMovies | 搜索电影 | q | target.id, title, rating.value, year | 入口点 |
| getMovie | 电影详情 | id <- searchMovies/getRecentHotMovies | title, rating.value, genres, intro, directors, actors | |
| getMovieReviews | 电影用户评论 | id <- searchMovies | comment, rating, user.name, vote_count | 分页（count, start） |
| getMovieCelebrities | 电影演职人员 | id <- searchMovies | directors[], actors[] with name, character, latin_name | |
| getMoviePhotos | 电影图片库 | id <- searchMovies | photos[].image.large.url, dimensions | 分页（count, start） |
| getTop250 | 电影 Top 250 | start（可选） | rank_value, title, rating.value, id | 每页 25 条 |
| searchBooks | 搜索图书 | q | target.id, title, rating.value, card_subtitle | 入口点 |
| getBook | 图书详情 | id <- searchBooks | title, rating.value, intro, author_intro, pubdate | |
| getBookReviews | 图书用户评论 | id <- searchBooks | comment, rating, user.name, vote_count | 分页（count, start） |
| searchMusic | 搜索音乐 | q | target.id, title, rating.value, card_subtitle | 入口点 |
| getMusicDetail | 专辑详情 | id <- searchMusic | title, singer[], songs[], genres[], pubdate | |
| getRecentHotMovies | 热门电影 | limit（可选） | id, title, rating.value, year | 入口点 |
| getRecentHotTv | 热门电视剧 | limit（可选） | id, title, rating.value, episodes_info | 入口点 |
| getNowShowingMovies | 院线电影 | count（可选） | id, title, rating.value, release_date | 入口点 |

## 快速开始

```bash
# Search for a movie and get its ID
openweb douban exec searchMovies '{"q": "肖申克的救赎"}'

# Get movie detail by ID (from search results target.id)
openweb douban exec getMovie '{"id": 1292052}'

# Get movie cast and crew
openweb douban exec getMovieCelebrities '{"id": 1292052}'

# Get movie reviews
openweb douban exec getMovieReviews '{"id": 1292052, "count": 10}'

# Get movie photos
openweb douban exec getMoviePhotos '{"id": 1292052, "count": 10}'

# Search books
openweb douban exec searchBooks '{"q": "三体"}'

# Get book detail
openweb douban exec getBook '{"id": 2567698}'

# Trending movies right now
openweb douban exec getRecentHotMovies '{"limit": 20}'

# Movies in theaters
openweb douban exec getNowShowingMovies '{"count": 10}'

# Top 250
openweb douban exec getTop250 '{"start": 0, "count": 25}'

# Search music
openweb douban exec searchMusic '{"q": "周杰伦"}'

# Get album detail
openweb douban exec getMusicDetail '{"id": 1401853}'
```