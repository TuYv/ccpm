---
name: hackernews-frontpage
description: Scrape the Hacker News front page (titles, points, comment counts).
host: news.ycombinator.com
trusted: true
source: human
version: 1.0.0
args: []
triggers:
  - scrape hacker news frontpage
  - scrape hn frontpage
  - get hn top stories
  - latest hacker news stories
---
# Hacker News 前页抓取器

抓取 Hacker News (`news.ycombinator.com`) 的前页并将前 30 条故事以 JSON 形式返回。每条故事都包含排名、标题、链接 URL、积分数和评论数。

## 用法

```
$ $B skill run hackernews-frontpage
{
  "stories": [
    { "rank": 1, "title": "...", "url": "...", "points": 412, "comments": 87 },
    ...
  ],
  "count": 30
}
```

## 工作原理

1. 通过 daemon 访问 `https://news.ycombinator.com`。
2. 读取页面 HTML。
3. 将每个故事行（HN 稳定的 `tr.athing` 结构）解析为一个类型化的 `Story` 记录。
4. 在 stdout 上输出单个 JSON 文档。

## 为什么这是参考技能

`hackernews-frontpage` 是最小但有价值的 browser-skill 示例：无鉴权、HTML 稳定、输出确定、对 file-fixture 友好。每个 Phase 1 组件（SDK、scoped tokens、three-tier lookup、spawn 生命周期）都通过 `$B skill run hackernews-frontpage` 和打包的 `script.test.ts` 进行了验证。

当 HN HTML 变更且我们的 selectors 失效时，测试会在捕获的 fixture 上先于用户发现前失败。这就是关键。
