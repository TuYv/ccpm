---
name: fetch-tweet
description: This skill should be used when the user asks to "트윗 가져와", "트윗 번역", "X 게시글 읽어줘", "tweet fetch", "트윗 내용", "트윗 원문", or provides an X/Twitter URL (x.com, twitter.com) and wants to read, translate, or analyze the tweet content. Also useful when other skills need to fetch tweet text programmatically.
---
# Fetch Tweet

从 X/Twitter URL 获取推文原文、作者信息和互动数据的技能。
利用 FxEmbed 开源项目的 API（`api.fxtwitter.com`），无需 JavaScript 即可提取推文数据。

## 工作原理

将 X/Twitter URL 的域名替换为 `api.fxtwitter.com`，即可以 JSON 形式返回推文的完整数据。

```
https://x.com/user/status/123456
  → https://api.fxtwitter.com/user/status/123456
```

## 脚本

`scripts/fetch_tweet.py` - 仅使用标准库，无外部依赖。

```bash
# 기본 사용 (포맷팅된 출력)
python scripts/fetch_tweet.py https://x.com/garrytan/status/2020072098635665909

# JSON 출력 (프로그래밍 활용)
python scripts/fetch_tweet.py https://x.com/garrytan/status/2020072098635665909 --json
```

支持的 URL 格式：`x.com`、`twitter.com`、`fxtwitter.com`、`fixupx.com`

## API 响应字段

| 字段 | 说明 |
|------|------|
| `tweet.text` | 推文正文（URL 已展开） |
| `tweet.author` | 作者（name、screen_name、bio、followers） |
| `tweet.likes/retweets/replies/bookmarks/views` | 互动数据 |
| `tweet.created_at` | 发布时间 |
| `tweet.media` | 附件媒体（photos、videos） |
| `tweet.quote` | 引用推文（结构相同） |
| `tweet.lang` | 语言代码 |

## 工作流程

### 获取单条推文

1. 从 URL 中提取 screen_name 和 status_id
2. 运行 `scripts/fetch_tweet.py <url>`
3. 将结果展示给用户或进行翻译

### 收到翻译请求时

1. 使用脚本抓取原文
2. 将抓取到的文本翻译成韩语后提供
3. 同时显示互动数据

### 与其他技能联动

批量处理从 Contents Hub 等处收集到的 X URL 列表时：

```bash
# JSON 출력으로 파이프라인 연동
python scripts/fetch_tweet.py <url> --json | python3 -c "import sys,json; print(json.load(sys.stdin)['tweet']['text'])"
```

## WebFetch 回退方案

在难以运行脚本时，可使用 WebFetch 工具直接调用 API：

```
URL: https://api.fxtwitter.com/{screen_name}/status/{status_id}
Prompt: "Extract the full tweet text and author name"
```

## 限制

- 无法查看私密账户的推文
- 无法查看已删除的推文
- API 速率限制取决于 FxEmbed 服务器策略（正常使用水平下没有问题）
