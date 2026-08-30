---
name: reddit-api
description: Reddit API with PRAW (Python) and Snoowrap (Node.js)
when-to-use: When building Reddit integrations or bots
user-invocable: false
effort: medium
---
# Reddit API 技能


用于将 Reddit 数据集成到应用程序中——获取帖子、评论、子版块和用户数据。

**来源：** [Reddit API 文档](https://www.reddit.com/dev/api/) | [OAuth2 Wiki](https://github.com/reddit-archive/reddit/wiki/oauth2) | [PRAW 文档](https://praw.readthedocs.io/)

---

## 设置

### 1. 创建 Reddit 应用

1. 前往 https://www.reddit.com/prefs/apps
2. 点击 "Create App" 或 "Create Another App"
3. 填写：
   - **名称**：你的应用名称
   - **应用类型**：
     - `script` - 用于个人使用 / 由你控制的机器人
     - `web app` - 用于带有用户身份验证的服务端应用
     - `installed app` - 用于移动端/桌面端应用
   - **重定向 URI**：`http://localhost:8000/callback`（用于开发）
4. 记下你的 `client_id`（位于应用名称下方）和 `client_secret`

### 2. 环境变量

```bash
# .env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=YourApp/1.0 by YourUsername
REDDIT_USERNAME=your_username        # For script apps only
REDDIT_PASSWORD=your_password        # For script apps only
```

**User-Agent 格式**：`<platform>:<app_id>:<version> (by /u/<username>)`

---

## 速率限制

| 层级 | 限制 | 备注 |
|------|-------|-------|
| OAuth 已认证 | 100 QPM | 按 OAuth client ID 计算 |
| 未认证 | 已阻止 | 必须使用 OAuth |

- 限制按 10 分钟时间窗口取平均值
- 包含 `User-Agent` header 以避免被阻止
- 遵守 `X-Ratelimit-*` 响应 header

---

## Python：PRAW（推荐）

### 安装

```bash
pip install praw
# or
uv add praw
```

### 脚本应用（个人使用 / 机器人）

```python
import praw
from pydantic_settings import BaseSettings

class RedditSettings(BaseSettings):
    reddit_client_id: str
    reddit_client_secret: str
    reddit_user_agent: str
    reddit_username: str
    reddit_password: str

    class Config:
        env_file = ".env"

settings = RedditSettings()

reddit = praw.Reddit(
    client_id=settings.reddit_client_id,
    client_secret=settings.reddit_client_secret,
    user_agent=settings.reddit_user_agent,
    username=settings.reddit_username,
    password=settings.reddit_password,
)

# Verify authentication
print(f"Logged in as: {reddit.user.me()}")
```

### 只读模式（无需用户身份验证）

```python
import praw

reddit = praw.Reddit(
    client_id="your_client_id",
    client_secret="your_client_secret",
    user_agent="YourApp/1.0 by YourUsername",
)

# Read-only mode - can browse, can't post/vote
reddit.read_only = True
```

### 常见操作

```python
# Get subreddit posts
subreddit = reddit.subreddit("python")

# Hot posts
for post in subreddit.hot(limit=10):
    print(f"{post.title} - {post.score} upvotes")

# New posts
for post in subreddit.new(limit=10):
    print(post.title)

# Search posts
for post in subreddit.search("pydantic", limit=5):
    print(post.title)

# Get specific post
submission = reddit.submission(id="abc123")
print(submission.title)
print(submission.selftext)

# Get comments
submission.comments.replace_more(limit=0)  # Flatten comment tree
for comment in submission.comments.list():
    print(f"{comment.author}: {comment.body[:100]}")
```

### 发布与投票（需要身份验证）

```python
# Submit text post
subreddit = reddit.subreddit("test")
submission = subreddit.submit(
    title="Test Post",
    selftext="This is the body of my post."
)

# Submit link post
submission = subreddit.submit(
    title="Check this out",
    url="https://example.com"
)

# Vote
submission.upvote()
submission.downvote()
submission.clear_vote()

# Comment
submission.reply("Great post!")

# Reply to comment
comment = reddit.comment(id="xyz789")
comment.reply("I agree!")
```

### 流式处理（实时）

```python
# Stream new posts
for post in reddit.subreddit("python").stream.submissions():
    print(f"New post: {post.title}")
    # Process post...

# Stream new comments
for comment in reddit.subreddit("python").stream.comments():
    print(f"New comment by {comment.author}: {comment.body[:50]}")
```

### 用户数据

```python
# Get user info
user = reddit.redditor("spez")
print(f"Karma: {user.link_karma + user.comment_karma}")

# User's posts
for post in user.submissions.new(limit=5):
    print(post.title)

# User's comments
for comment in user.comments.new(limit=5):
    print(comment.body[:100])
```

---

## TypeScript / Node.js：Snoowrap

### 安装

```bash
npm install snoowrap
# or
pnpm add snoowrap
```

### 设置

```typescript
import Snoowrap from "snoowrap";

const reddit = new Snoowrap({
  userAgent: "YourApp/1.0 by YourUsername",
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
});

// Configure rate limiting
reddit.config({
  requestDelay: 1000,  // 1 second between requests
  continueAfterRatelimitError: true,
});
```

### 常见操作

```typescript
// Get hot posts from subreddit
const posts = await reddit.getSubreddit("typescript").getHot({ limit: 10 });
posts.forEach((post) => {
  console.log(`${post.title} - ${post.score} upvotes`);
});

// Search posts
const results = await reddit.getSubreddit("programming").search({
  query: "typescript",
  sort: "relevance",
  time: "month",
  limit: 10,
});

// Get specific post
const submission = await reddit.getSubmission("abc123").fetch();
console.log(submission.title);

// Get comments
const comments = await submission.comments.fetchAll();
comments.forEach((comment) => {
  console.log(`${comment.author.name}: ${comment.body.slice(0, 100)}`);
});
```

### 发布

```typescript
// Submit text post
const post = await reddit.getSubreddit("test").submitSelfpost({
  title: "Test Post",
  text: "This is the body.",
});

// Submit link
const linkPost = await reddit.getSubreddit("test").submitLink({
  title: "Check this out",
  url: "https://example.com",
});

// Vote and comment
await post.upvote();
await post.reply("Great post!");
```

---

## 直接调用 API（无库）

### 使用 httpx 的 Python

```python
import httpx
import base64
from pydantic import BaseModel

class RedditClient:
    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_agent = user_agent
        self.access_token: str | None = None
        self.client = httpx.AsyncClient()

    async def authenticate(self) -> None:
        """Get application-only OAuth token."""
        auth = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        response = await self.client.post(
            "https://www.reddit.com/api/v1/access_token",
            headers={
                "Authorization": f"Basic {auth}",
                "User-Agent": self.user_agent,
            },
            data={
                "grant_type": "client_credentials",
            },
        )
        response.raise_for_status()
        self.access_token = response.json()["access_token"]

    async def get_posts(self, subreddit: str, sort: str = "hot", limit: int = 10) -> list[dict]:
        """Get posts from a subreddit."""
        if not self.access_token:
            await self.authenticate()

        response = await self.client.get(
            f"https://oauth.reddit.com/r/{subreddit}/{sort}",
            headers={
                "Authorization": f"Bearer {self.access_token}",
                "User-Agent": self.user_agent,
            },
            params={"limit": limit},
        )
        response.raise_for_status()
        return [post["data"] for post in response.json()["data"]["children"]]

    async def close(self) -> None:
        await self.client.aclose()


# Usage
async def main():
    client = RedditClient(
        client_id="your_id",
        client_secret="your_secret",
        user_agent="YourApp/1.0",
    )
    try:
        posts = await client.get_posts("python", limit=5)
        for post in posts:
            print(f"{post['title']} - {post['score']} upvotes")
    finally:
        await client.close()
```

### 使用 fetch 的 TypeScript

```typescript
interface RedditPost {
  title: string;
  score: number;
  url: string;
  selftext: string;
  author: string;
  created_utc: number;
}

class RedditClient {
  private accessToken: string | null = null;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private userAgent: string
  ) {}

  async authenticate(): Promise<void> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "User-Agent": this.userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  async getPosts(subreddit: string, sort = "hot", limit = 10): Promise<RedditPost[]> {
    if (!this.accessToken) await this.authenticate();

    const response = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/${sort}?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "User-Agent": this.userAgent,
        },
      }
    );

    const data = await response.json();
    return data.data.children.map((child: any) => child.data);
  }
}
```

---

## OAuth2 Web 流程（用户授权）

对于用户使用其 Reddit 账户登录的应用：

```python
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
import httpx
import secrets

app = FastAPI()
state_store: dict[str, bool] = {}

REDDIT_CLIENT_ID = "your_client_id"
REDDIT_CLIENT_SECRET = "your_client_secret"
REDIRECT_URI = "http://localhost:8000/callback"

@app.get("/login")
async def login():
    state = secrets.token_urlsafe(16)
    state_store[state] = True

    auth_url = (
        f"https://www.reddit.com/api/v1/authorize"
        f"?client_id={REDDIT_CLIENT_ID}"
        f"&response_type=code"
        f"&state={state}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&duration=permanent"
        f"&scope=identity read submit vote"
    )
    return RedirectResponse(auth_url)

@app.get("/callback")
async def callback(code: str, state: str):
    if state not in state_store:
        return {"error": "Invalid state"}
    del state_store[state]

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.reddit.com/api/v1/access_token",
            auth=(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET),
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI,
            },
            headers={"User-Agent": "YourApp/1.0"},
        )

    tokens = response.json()
    # Store tokens securely, associate with user session
    return {"access_token": tokens["access_token"][:10] + "..."}
```

---

## 可用权限范围

| Scope | 描述 |
|-------|-------------|
| `identity` | 访问用户名和注册日期 |
| `read` | 访问帖子和评论 |
| `submit` | 提交链接和评论 |
| `vote` | 对内容进行赞成票/反对票投票 |
| `edit` | 编辑帖子和评论 |
| `history` | 访问投票历史 |
| `subscribe` | 管理 subreddit 订阅 |
| `mysubreddits` | 访问已订阅的 subreddit |
| `privatemessages` | 访问私信 |
| `save` | 保存/取消保存内容 |

完整列表：https://www.reddit.com/api/v1/scopes

---

## 项目结构

```
project/
├── src/
│   ├── reddit/
│   │   ├── __init__.py
│   │   ├── client.py         # Reddit client wrapper
│   │   ├── models.py         # Pydantic models for posts/comments
│   │   └── scraper.py        # Data collection logic
│   └── main.py
├── .env
└── pyproject.toml
```

---

## Pydantic 模型

```python
from pydantic import BaseModel
from datetime import datetime

class RedditPost(BaseModel):
    id: str
    title: str
    author: str
    subreddit: str
    score: int
    upvote_ratio: float
    url: str
    selftext: str
    created_utc: datetime
    num_comments: int
    is_self: bool

    @classmethod
    def from_praw(cls, submission) -> "RedditPost":
        return cls(
            id=submission.id,
            title=submission.title,
            author=str(submission.author),
            subreddit=submission.subreddit.display_name,
            score=submission.score,
            upvote_ratio=submission.upvote_ratio,
            url=submission.url,
            selftext=submission.selftext,
            created_utc=datetime.fromtimestamp(submission.created_utc),
            num_comments=submission.num_comments,
            is_self=submission.is_self,
        )

class RedditComment(BaseModel):
    id: str
    author: str
    body: str
    score: int
    created_utc: datetime
    parent_id: str
    is_submitter: bool
```

---

## 反模式

- **没有 User-Agent** - Reddit 会阻止不带适当 User-Agent 的请求
- **忽略速率限制** - 遵守每分钟 100 个请求的限制，检查 `X-Ratelimit-*` 标头
- **将凭据存储在代码中** - 使用环境变量
- **未处理 `MoreComments`** - 在 PRAW 中使用 `replace_more()`
- **使用轮询而不是流式传输** - 使用 `.stream` 获取实时数据
- **没有错误处理** - 处理 429（速率限制）、403（禁止访问）、404（未找到）

---

## 快速参考

```bash
# PRAW installation
pip install praw

# Snoowrap installation
npm install snoowrap

# Test authentication
python -c "import praw; r = praw.Reddit(...); print(r.user.me())"
```

### 端点

| 操作 | 端点 |
|-----------|----------|
| 身份验证令牌 | `POST https://www.reddit.com/api/v1/access_token` |
| API 请求 | `https://oauth.reddit.com/...` |
| Subreddit 帖子 | `GET /r/{subreddit}/{sort}` |
| 提交内容 | `GET /comments/{id}` |
| 用户信息 | `GET /user/{username}/about` |
| 提交帖子 | `POST /api/submit` |
| 投票 | `POST /api/vote` |
|