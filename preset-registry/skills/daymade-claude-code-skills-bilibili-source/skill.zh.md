---
name: bilibili-source
description: Fetch comprehensive, login-free data for any Bilibili (B站) video — title, UP name and follower count, publish date, partition, tags, per-part cids, live stats (view, like, coin, favorite, share, reply, danmaku), and full danmaku (bullet-comment) text. Use this skill whenever working with a Bilibili video and needing real, citable numbers or metadata — ingesting a Bilibili source into a knowledge base, analyzing why a video performed, verifying a creator's claimed metrics, building a case study, or any time a Bilibili view/like/favorite count is about to be written into a document — fetch it, never hand-type or estimate it. Accepts BVID, av numbers, b23.tv short links, or full URLs. Subtitles are also covered but require the user's Bilibili login.
---
# bilibili-source

获取 Bilibili 视频的**真实、可验证**数据，以便引用，而不是猜测。互动数据是任何诚实分析“为什么这个视频表现良好”的基础，而手动输入或估算的数据则是导致知识库迅速失效的最直接方式。此 Skill 可让获取这些数据变得轻而易举——因此没有任何理由去编造它们。

## 快速开始

```bash
scripts/bili-fetch.sh BV1xxxxxxxxx
```

返回一个 JSON 对象，其中包含单次 `view/detail` API 调用所获取的全部内容：

```json
{
  "bvid": "BV1xxxxxxxxx",
  "aid": 1234567890,
  "fetched_at": "2026-06-07T13:54:17Z",
  "url": "https://www.bilibili.com/video/BV1xxxxxxxxx",
  "title": "<video title>",
  "up": { "name": "<UP name>", "mid": 12345678, "fans": 45600 },
  "pubdate": "2026-01-10T00:50:47Z",
  "tname": "<partition, may be empty>",
  "tags": ["<tag>", "<tag>"],
  "videos": 1,
  "duration_s": 372,
  "stat": { "view": 48000, "like": 1200, "coin": 180, "favorite": 950,
            "share": 64, "reply": 210, "danmaku": 130 },
  "pages": [ { "cid": 12345678, "page": 1, "part": "<part title>", "duration": 372 } ]
}
```

`bili-fetch.sh` 接受用户可能粘贴的任何形式——**BVID、`av` 号、`b23.tv` 短链接或完整 URL**——并将其规范化。对于多 P 视频，它会在 `pages[]` 中返回每一 P 的 `cid`（获取该 P 的弹幕或字幕时需要对应 P 的 cid）。

## 脚本

| 脚本 | 功能 | 登录 |
|--------|--------------|-------|
| `scripts/bili-fetch.sh <ref>` | 核心功能：完整元数据 + 实时统计数据（请先运行此脚本） | 否 |
| `scripts/bili-danmaku.sh <ref> [P]` | 某一 P 的完整弹幕文本 | 否 |
| `scripts/bili-subs.sh <ref> [browser]` | 字幕/文字稿轨道 | **是** |
| `scripts/bili-selftest.sh` | 针对实时 API 对每项功能进行健康检查 | 否 |

这三个脚本都应当**执行**（不要将它们当作参考资料阅读）。`bili-danmaku.sh` 会复用 `bili-fetch.sh` 来解析对应 P 的 cid，因此它们必须作为同级文件保留在 `scripts/` 中。

**弹幕**是叠加在视频画面上、与时间同步的评论——这是 Bilibili 特有的信号，能够反映观众在*何处以及如何*作出反应，其定性信息比单一的评论数更加丰富：

```bash
scripts/bili-danmaku.sh BV1xxxxxxxxx     # P1; add a part number for multi-part videos
```

## 保证数据真实的规则

- **实时指标 → 始终引用 `fetched_at`。** 同一个视频在几分钟后重新获取时，数据会发生变化（播放量在一次会话期间也可能增加几个）。这不是错误——而是数据实时性的证明。只写“12,000 次播放”却没有时间戳毫无意义，而且会在不知不觉中过时。
- **禁止编造。** 如果某个数字无法获取，请写“未获取/未核实”——绝不要估算。此 Skill 的核心意义就是让获取这些数字变得轻而易举。
- **这些脚本已经处理了网络方面的特殊问题**，因此你无须重复实现：它们会移除本地代理（Bilibili 是中国大陆境内服务，而 `127.0.0.1` 代理会导致其无法正常访问）、发送浏览器 User-Agent + Referer（避免偶发的 HTTP 412），并采用退避机制重试。如果你手动调用 API，也应执行相同操作——参见 [references/bilibili_api.md](references/bilibili_api.md)。
- **CJK 后处理陷阱。** 之后使用 grep/sort 处理获取到的中文文本或文件名时，`sort`/`comm` 会错误处理 CJK 排序规则，并报告虚假的“缺失”/“损坏”结果。请使用 `find -name` 或 `grep -F` 进行验证，而不要使用 `comm`。

## 字幕需要登录（无法绕过）

统计数据和弹幕无需登录。**字幕则不行。** 经在许多视频（新旧视频均有）以及匿名 Cookie 环境下验证：对于匿名请求，公开播放器 API 会返回空的字幕列表，而 `yt-dlp` 会报告 *“字幕仅在登录后可用。”* **不存在无需登录的获取途径**——不要尝试绕过此限制。

因此，`bili-subs.sh` 需要通过浏览器 Cookie 获取用户的哔哩哔哩会话。由于它会读取用户已登录的会话，**运行前必须征得用户同意**：

```bash
scripts/bili-subs.sh BV1xxxxxxxxx chrome   # or firefox / safari / edge
```

`ai-zh` 轨道是哔哩哔哩的 AI 生成字幕——应将其视为转录初稿（可能存在同音字和分段错误），在你生成的任何内容中将其标记为 AI-ASR，不要声称它是经过人工核对的逐字稿。如果视频没有字幕轨道，就没有任何内容可供获取——不要凭空编造。参考文档中还记录了一种使用 SESSDATA-env API 的替代方案。

## 深入了解

有关完整的端点目录（UP 主粉丝数历史、视频标签、实时观看人数、弹幕存档、SESSDATA 字幕路径）、`space/wbi/*` 端点所需的 WBI 请求签名算法，以及每个注意事项对应的已测试命令，请参阅 **[references/bilibili_api.md](references/bilibili_api.md)**。

## 验证状态

- **统计数据 / 元数据 / 弹幕**（`view/detail`、`relation/stat`、`dm/list.so`、`online/total`）：已验证无需登录，2026-06-07。指标经过多次重新获取，并通过独立方式核对一致；弹幕数量与 `stat.danmaku` 一致。
- **字幕**：已确认需要登录，2026-06-07（在所有受测视频中，匿名请求均返回空结果）。通过 Cookie 获取时需要使用 `yt-dlp`。

## 维护

此 Skill 封装了一个会随时间发生变化的第三方 API——字段可能重命名，端点可能增加 WBI 签名要求，反爬虫措施也可能收紧。在间隔一段时间后再次使用并信任它之前，或任何时候输出看起来不正确时，请运行健康检查：

```bash
scripts/bili-selftest.sh
```

它会针对一个稳定的公开测试样本检查每项功能（以及登录限制这一不变量），并为每项功能输出一行 PASS/FAIL，因此 API 变化会表现为明确指出故障位置的 FAIL，而不是悄无声息地给出错误答案。当某一行检查失败时，修复所需的端点路径、字段名和 WBI 签名信息都可以在 [references/bilibili_api.md](references/bilibili_api.md) 中找到；重新确认后，请更新上方的“验证”日期。