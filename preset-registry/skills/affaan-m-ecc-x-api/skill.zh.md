---
name: x-api
description: X/Twitter API integration for posting tweets, threads, reading timelines, search, and analytics. Covers OAuth auth patterns, rate limits, and platform-native content posting. Use when the user wants to interact with X programmatically.
---
# X API

通过编程方式与 X（Twitter）交互，用于发布、读取、搜索和分析。

## 何时启用

- 用户希望以编程方式发布推文或推文串
- 从 X 读取时间线、提及或用户数据
- 在 X 上搜索内容、趋势或对话
- 构建 X 集成或机器人
- 分析和互动情况跟踪
- 用户提到“发布到 X”“发推文”“X API”或“Twitter API”

## 身份验证

### OAuth 2.0 Bearer Token（仅应用）

最适合：读取密集型操作、搜索和公开数据。

```bash
# Environment setup
export X_BEARER_TOKEN="your-bearer-token"
```

```python
import os
import requests

bearer = os.environ["X_BEARER_TOKEN"]
headers = {"Authorization": f"Bearer {bearer}"}

# Search recent tweets
resp = requests.get(
    "https://api.x.com/2/tweets/search/recent",
    headers=headers,
    params={"query": "claude code", "max_results": 10}
)
tweets = resp.json()
```

### OAuth 1.0a（用户上下文）

以下操作需要使用：发布推文、管理账户、私信以及任何写入流程。

```bash
# Environment setup — source before use
export X_CONSUMER_KEY="your-consumer-key"
export X_CONSUMER_SECRET="your-consumer-secret"
export X_ACCESS_TOKEN="your-access-token"
export X_ACCESS_TOKEN_SECRET="your-access-token-secret"
```

在较旧的配置中，可能存在 `X_API_KEY`、`X_API_SECRET` 和 `X_ACCESS_SECRET` 等旧版别名。在记录或接入新流程时，优先使用 `X_CONSUMER_*` 和 `X_ACCESS_TOKEN_SECRET` 名称。

```python
import os
from requests_oauthlib import OAuth1Session

oauth = OAuth1Session(
    os.environ["X_CONSUMER_KEY"],
    client_secret=os.environ["X_CONSUMER_SECRET"],
    resource_owner_key=os.environ["X_ACCESS_TOKEN"],
    resource_owner_secret=os.environ["X_ACCESS_TOKEN_SECRET"],
)
```

## 核心操作

### 发布推文

```python
resp = oauth.post(
    "https://api.x.com/2/tweets",
    json={"text": "Hello from Claude Code"}
)
resp.raise_for_status()
tweet_id = resp.json()["data"]["id"]
```

### 发布推文串

```python
def post_thread(oauth, tweets: list[str]) -> list[str]:
    ids = []
    reply_to = None
    for text in tweets:
        payload = {"text": text}
        if reply_to:
            payload["reply"] = {"in_reply_to_tweet_id": reply_to}
        resp = oauth.post("https://api.x.com/2/tweets", json=payload)
        tweet_id = resp.json()["data"]["id"]
        ids.append(tweet_id)
        reply_to = tweet_id
    return ids
```

### 读取用户时间线

```python
resp = requests.get(
    f"https://api.x.com/2/users/{user_id}/tweets",
    headers=headers,
    params={
        "max_results": 10,
        "tweet.fields": "created_at,public_metrics",
    }
)
```

### 搜索推文

```python
resp = requests.get(
    "https://api.x.com/2/tweets/search/recent",
    headers=headers,
    params={
        "query": "from:affaanmustafa -is:retweet",
        "max_results": 10,
        "tweet.fields": "public_metrics,created_at",
    }
)
```

### 获取近期原创帖子以进行表达风格建模

```python
resp = requests.get(
    "https://api.x.com/2/tweets/search/recent",
    headers=headers,
    params={
        "query": "from:affaanmustafa -is:retweet -is:reply",
        "max_results": 25,
        "tweet.fields": "created_at,public_metrics",
    }
)
voice_samples = resp.json()
```

### 按用户名获取用户

```python
resp = requests.get(
    "https://api.x.com/2/users/by/username/affaanmustafa",
    headers=headers,
    params={"user.fields": "public_metrics,description,created_at"}
)
```

### 上传媒体并发布帖子

```python
# Media upload uses v1.1 endpoint

# Step 1: Upload media
media_resp = oauth.post(
    "https://upload.twitter.com/1.1/media/upload.json",
    files={"media": open("image.png", "rb")}
)
media_id = media_resp.json()["media_id_string"]

# Step 2: Post with media
resp = oauth.post(
    "https://api.x.com/2/tweets",
    json={"text": "Check this out", "media": {"media_ids": [media_id]}}
)
```

## 速率限制

X API 的速率限制因端点、身份验证方法和账户层级而异，并且会随时间变化。请始终：
- 在硬编码相关假设之前查看最新的 X 开发者文档
- 在运行时读取 `x-rate-limit-remaining` 和 `x-rate-limit-reset` 标头
- 自动退避，而不是依赖代码中的静态表格

```python
import time

remaining = int(resp.headers.get("x-rate-limit-remaining", 0))
if remaining < 5:
    reset = int(resp.headers.get("x-rate-limit-reset", 0))
    wait = max(0, reset - int(time.time()))
    print(f"Rate limit approaching. Resets in {wait}s")
```

## 错误处理

```python
resp = oauth.post("https://api.x.com/2/tweets", json={"text": content})
if resp.status_code == 201:
    return resp.json()["data"]["id"]
elif resp.status_code == 429:
    reset = int(resp.headers["x-rate-limit-reset"])
    raise Exception(f"Rate limited. Resets at {reset}")
elif resp.status_code == 403:
    raise Exception(f"Forbidden: {resp.json().get('detail', 'check permissions')}")
else:
    raise Exception(f"X API error {resp.status_code}: {resp.text}")
```

## 安全

- **绝不要硬编码令牌。** 使用环境变量或 `.env` 文件。
- **绝不要提交 `.env` 文件。** 将其添加到 `.gitignore`。
- 如果令牌已泄露，**请轮换令牌**。在 developer.x.com 重新生成。
- 不需要写入权限时，**使用只读令牌**。
- **安全存储 OAuth 密钥**——不要将其存放在源代码或日志中。

## 与内容引擎集成

使用 `brand-voice` 和 `content-engine` 生成符合平台特性的内容，然后通过 X API 发布：
1. 当语气匹配很重要时，拉取近期原创帖子
2. 构建或复用一个 `VOICE PROFILE`
3. 使用 `content-engine` 以 X 原生格式生成内容
4. 验证长度和帖子串结构
5. 返回草稿以供审批，除非用户明确要求立即发布
6. 仅在获得批准后通过 X API 发布
7. 通过 public_metrics 跟踪互动情况

## 相关技能

- `brand-voice` — 基于真实的 X 内容以及网站/来源材料构建可复用的语气配置文件
- `content-engine` — 为 X 生成符合平台特性的内容
- `crosspost` — 在 X、LinkedIn 和其他平台上分发内容
- `connections-optimizer` — 在起草由网络关系驱动的外联内容之前重组 X 关系图