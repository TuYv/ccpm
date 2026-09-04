---
name: reddit-fetch
description: Fetch content from Reddit via its JSON API using a browser session (DuckDuckGo-hop unlock). Use when accessing Reddit URLs, researching topics on Reddit, or when Reddit returns 403/blocked errors.
---
# Reddit Fetch

Reddit 的公开 JSON API 的用法是在任意 Reddit URL 后面追加 `.json` —— 但 Reddit 现在已对自动化访问进行硬性封锁。**curl 几乎每次都会返回 403（宿主机和容器皆如此，无论 User-Agent 是什么），即使是全新启动的 Playwright 直接导航到 `reddit.com` 也会遇到 `"You've been blocked by network security"` 验证页。** 可靠的方法是*通过 DuckDuckGo 搜索结果重定向*进入 Reddit：这会设置一个 Reddit 会话 cookie，从而在浏览器会话的剩余时间里解锁对 `.json` 的直接访问。

## 主要方法：DuckDuckGo 跳转解锁

**第 1 步 - DDG 跳转。** 每个会话中，在进行任何 `.json` 抓取之前先执行一次此操作。

1. 使用 `mcp__playwright__browser_navigate` 导航到 `https://html.duckduckgo.com/html/?q=site:reddit.com/r/SUBREDDIT+YOUR+QUERY`
2. 获取第一条结果的**完整 href** —— 这是一个包含 `rut` 令牌的 DDG 重定向链接（`https://duckduckgo.com/l/?uddg=...&rut=...`）。该令牌是必需的；不带令牌直接导航到裸的 `/l/?uddg=` 会返回 400。
   ```js
   () => document.querySelector('.result__a')?.href
   ```
3. 使用 `browser_navigate` 导航到该完整的重定向 href。它会落地到一个真实的 `www.reddit.com` 页面（标题 = 帖子/子版块标题，而**不是** "Blocked"），并设置会话 cookie。该结果不必恰好是你想要的那个帖子 —— 落地到*任何*真实 Reddit 页面都会设置该 cookie。

如果 Playwright 报出 `Browser is already in use` 错误，说明有残留实例占用着 profile —— 执行 `pkill -f ms-playwright-mcp`（或使用错误信息中指明的 profile 目录）然后重试。

**第 2 步 —— 此时可以直接访问 `.json` 了。** 在会话的剩余时间内，可直接用 Playwright 导航到任意 `.json` URL 并执行 `JSON.parse(document.body.innerText)`。浏览器导航请使用 `www.reddit.com`（而非 `old.reddit.com`）。完整的按时间排序（`sort=new&t=week`）也可用。

1. 使用 `browser_navigate` 导航到例如 `https://www.reddit.com/r/SUBREDDIT/search.json?q=QUERY&restrict_sr=on&sort=new&t=week&limit=25`
2. 执行 `browser_evaluate`，**务必用 try/catch 包裹**（失败时返回 `document.body.innerText.slice(0,200)`，这样如果会话已失效你就能看到验证页 —— 重新做一次跳转即可）：
   ```js
   () => {
     try {
       const data = JSON.parse(document.body.innerText);
       return data.data.children.map(c => ({
         t: c.data.title, s: c.data.score, n: c.data.num_comments, id: c.data.id
       }));
     } catch (e) { return document.body.innerText.slice(0, 200); }
   }
   ```
3. 若要获取帖子详情，可导航到 `.../comments/POST_ID.json?limit=30&sort=top` 并解析 `data[0]`（帖子）和 `data[1].data.children`（评论）。

## JSON 结构（浏览器和 curl 均相同）

```text
# Listing - swap hot for new/top/rising; for top add &t=day|week|month|year|all
/r/SUBREDDIT/hot.json?limit=15
# Post + comments - JSON array where [0]=post, [1]=comment tree
/r/SUBREDDIT/comments/POST_ID.json?limit=20
# Search within a subreddit
/r/SUBREDDIT/search.json?q=QUERY&restrict_sr=on&sort=new&limit=15
```

- 列表页：`.data.children[].data` 包含 `title`、`score`、`num_comments`、`author`、`id`。
- 帖子详情页：`[0].data.children[0].data` 是帖子；`[1].data.children[]`（过滤 `kind == "t1"`）是评论，包含 `author`、`score`、`body` 以及结构相同的嵌套 `replies`。
- 截断过长的评论正文（例如在 JS 中用 `body.slice(0, 300)`，在 jq 1.7+ 中用 `.body[:300]`）以保持输出可读。

## 备选方案

- **获取单个帖子的更多评论：** 加载渲染后的帖子页面（在完成跳转之后）并抓取 `shreddit` DOM —— 它能返回比 `.json?limit=` 更多的评论：
  ```js
  () => ({
    title: document.querySelector('shreddit-post')?.getAttribute('post-title'),
    comments: [...document.querySelectorAll('shreddit-comment')].map(c => ({
      author: c.getAttribute('author'),
      score:  c.getAttribute('score'),
      text:   c.querySelector('.md')?.innerText
    }))
  })
  ```
- **完全没有 Playwright：** 使用 Claude for Chrome 打开帖子页/`.json` URL 并从页面上读取内容。
- **curl（最后手段，预期会 403）：** 带浏览器 User-Agent 的直接 curl 过去是可行的，而且在可行时速度更快，但现在几乎总会被 403 —— 更换 UA 也无济于事。只有当你本来就在执行 shell 命令且没有可用浏览器时，才值得快速尝试一次；一旦 403，直接转用 DDG 跳转。
  ```bash
  UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  curl -s -L -o /tmp/reddit_result.txt -w "%{http_code}" -H "User-Agent: $UA" \
    'https://old.reddit.com/r/SUBREDDIT/hot.json?limit=15'
  jq -r '.data.children[] | .data | "\(.title)\n   \(.score) pts | \(.num_comments) comments | u/\(.author) | id: \(.id)\n"' /tmp/reddit_result.txt
  ```
  先抓取到临时文件（`-o`）再解析；`-w "%{http_code}"` 打印状态码；`-L` 跟随重定向；URL 要加单引号，以免 shell 吞掉 `&`。

## 速率限制

即使你已经解除封锁，Reddit 的限流也十分激进：

- **不要并发发起请求** —— 使用 `sleep 2`/`sleep 3` 串行执行（或在每次导航之间稍作停顿）。先抓取一个列表页，解析它，然后再逐个抓取帖子。
- 空响应（0 字节）：等待 3-5 秒后重试。HTTP 429：退避 10-15 秒。会话中途出现验证页说明 cookie 已失效 —— 重新执行一次 DDG 跳转。
