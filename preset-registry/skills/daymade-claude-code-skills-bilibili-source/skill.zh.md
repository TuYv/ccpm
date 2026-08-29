---
name: bilibili-source
description: Fetch comprehensive, login-free data for any Bilibili (B站) video — title, UP name and follower count, publish date, partition, tags, per-part cids, live stats (view, like, coin, favorite, share, reply, danmaku), and full danmaku (bullet-comment) text. Use this skill whenever working with a Bilibili video and needing real, citable numbers or metadata — ingesting a Bilibili source into a knowledge base, analyzing why a video performed, verifying a creator's claimed metrics, building a case study, or any time a Bilibili view/like/favorite count is about to be written into a document — fetch it, never hand-type or estimate it. Accepts BVID, av numbers, b23.tv short links, or full URLs. Subtitles and favorites-folder (收藏夹) enumeration are also covered but require the user's Bilibili login.
---
# bilibili-source

获取 Bilibili 视频的**真实、可验证**数据，以便引用而不是猜测。互动数据是任何诚实的“为什么这个内容表现良好”分析的基础，而手动输入或估算的数字是知识库腐烂的最快方式。这个 skill 让获取这些数字变得非常简单——因此没有任何理由编造它们。

## 快速开始

```bash
scripts/bili-fetch.sh BV1xxxxxxxxx
```

通过一次 `view/detail` API 调用返回包含所有信息的一个 JSON 对象：

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

`bili-fetch.sh` 接受用户可能粘贴的任何形式——**BVID、`av` 编号、`b23.tv` 短链接或完整 URL**——并对其进行标准化。对于多分 P 视频，它会在 `pages[]` 中返回每一 P 的 `cid`（获取该 P 的弹幕或字幕时需要使用对应分 P 的 cid）。

## 脚本

| 脚本 | 功能 | 登录 |
|--------|--------------|-------|
| `scripts/bili-fetch.sh <ref>` | 核心功能：完整元数据 + 实时统计数据（首先运行此脚本） | 否 |
| `scripts/bili-danmaku.sh <ref> [P]` | 某一 P 的弹幕完整文本 | 否 |
| `scripts/bili-subs.sh <ref> [browser]` | 字幕/转录轨道 | **是** |
| `scripts/bili-selftest.sh` | 针对实时 API 检查每项功能的健康状态 | 否 |

以上三个脚本都要**执行**（不要把它们当作参考资料来阅读）。`bili-danmaku.sh` 会复用 `bili-fetch.sh` 来解析该 P 的 cid，因此它们必须作为同级文件保存在 `scripts/` 中。

**弹幕**是叠加在视频上的时间同步评论——这是 Bilibili 特有的一种信号，可以反映观众在*何处以及如何*做出反应；与单纯的回复数相比，它在定性分析上更加丰富：

```bash
scripts/bili-danmaku.sh BV1xxxxxxxxx     # P1; add a part number for multi-part videos
```

## 保持数据真实的规则

- **实时指标 → 始终引用 `fetched_at`。** 同一个视频在几分钟后重新获取，数据就可能发生变化（一次会话期间，播放数可能就会增加几次）。这不是错误——而是数据实时存在的证明。一个没有时间戳的“12,000 次播放”毫无意义，并且会在不知不觉中过时。
- **禁止编造。** 如果某个数字无法获取，请写“未获取/未核实”——绝不要估算。这个 skill 的全部意义就在于，获取数字的成本很低。
- **脚本已经处理了网络方面的各种问题**，因此不要重新发明解决方案：它们会移除本地代理（Bilibili 是中国大陆服务，`127.0.0.1` 代理会导致其无法正常工作），发送浏览器 User-Agent + Referer（避免偶发的 HTTP 412），并使用退避策略重试。如果你手动调用 API，也要这样做——参见 [references/bilibili_api.md](references/bilibili_api.md)。环境变量清理未涵盖的一个陷阱是：当代理环境变量不存在时，Python `urllib` 会回退使用**macOS 系统代理**，导致批量请求中间歇性出现 503——请使用显式的 `ProxyHandler({})` 构建 opener（详情参见参考文档中的 Request basics）。
- **CJK 后处理陷阱。** 当你之后对获取的中文文本或文件名执行 grep/排序时，`sort`/`comm` 对 CJK 排序处理不当，会报告虚假的“缺失”/“损坏”结果。请使用 `find -name` 或 `grep -F` 验证，而不要使用 `comm`。

## 字幕需要登录（不可绕过）

统计数据和弹幕无需登录。**字幕则不然。** 已通过大量视频（新旧视频均有）以及匿名 cookies 验证：对于匿名请求，公开播放器 API 返回空的字幕列表，而 `yt-dlp` 报告 *“只有登录后才能使用字幕。”* **不存在无需登录的路径——不要尝试绕过它。**

因此，`bili-subs.sh` 需要通过浏览器 cookies 获取用户的 Bilibili 会话。由于它会读取用户的登录会话，**运行前请先征得用户同意**：

```bash
scripts/bili-subs.sh BV1xxxxxxxxx chrome   # 或 firefox / safari / edge
```

`ai-zh` 轨道是 Bilibili 生成的 AI 字幕——应将其视为草稿转录（可能存在同音字/分段错误），在你生成的任何内容中将其标记为 AI-ASR，不要声称这是经过人工校对的逐字稿。如果视频没有字幕轨道，就没有可获取的内容——不要凭空编造。参考文档中记录了使用 SESSDATA-env 的 API 替代方案。

## 深入了解

有关完整的端点目录（UP 主历史记录、视频标签、实时观看人数、弹幕存档、SESSDATA 字幕路径、**收藏夹文件夹枚举**——`x/v3/fav/*`，需要登录，无需 WBI），`space/wbi/*` 端点所需的 WBI 请求签名算法，以及每个问题的经过测试的命令，请参阅 **[references/bilibili_api.md](references/bilibili_api.md)**。

## 验证状态

- **统计数据 / 元数据 / 弹幕**（`view/detail`、`relation/stat`、`dm/list.so`、`online/total`）：已验证无需登录，2026-06-07。指标经过反复重新获取并独立匹配；弹幕数量与 `stat.danmaku` 一致。
- **字幕**：已确认需要登录，2026-06-07（在所有测试视频中，匿名请求均返回空结果）。cookie 路径需要使用 `yt-dlp`。SESSDATA/cookie-jar API 路径已于 2026-08-29 在约 400 个视频的批次中验证可用（包括多分 P 视频）。
- **收藏夹**（`x/v3/fav/folder/created/list-all`、`x/v3/fav/resource/list`）：已于 2026-08-29 验证登录后可用，使用不带 WBI 的普通参数；连续获取了 26 页，未触发限流。枚举需要登录（对于拥有公开可读文件夹的账号，匿名 `list-all` 仍会返回 code 0 和空列表）；只有在已知某个公开文件夹的 media_id 时，才能匿名读取其内容。

## 维护

此 skill 封装了会随时间变化的第三方 API——字段会被重命名，端点会新增 WBI 签名，反机器人措施也会加强。在一段时间未使用后重新信任它之前，或每当输出看起来不正确时，请运行健康检查：

```bash
scripts/bili-selftest.sh
```

它会针对一个稳定的公开 fixture 测试每项功能（以及登录限制不变量），并为每项功能打印一行 PASS/FAIL，因此 API 漂移会以明确的 FAIL 暴露出来，指出具体损坏之处，而不是静默地产生错误答案。某一行失败时，修复所需的端点路径、字段名和 WBI 签名都记录在 [references/bilibili_api.md](references/bilibili_api.md) 中；重新确认后，更新上方的“Verified”日期。