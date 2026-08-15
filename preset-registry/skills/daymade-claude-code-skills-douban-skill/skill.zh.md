---
name: douban-skill
description: >
  Export and sync Douban (豆瓣) book/movie/music/game collections to local CSV files via Frodo API.
  Supports full export (all history) and RSS incremental sync (recent items).
  Use when the user wants to export Douban reading/watching/listening/gaming history,
  back up their Douban data, set up incremental sync, or mentions 豆瓣/douban collections.
  Triggers on: 豆瓣, douban, 读书记录, 观影记录, 书影音, 导出豆瓣.
---
# 豆瓣收藏导出

将豆瓣用户收藏（图书、影视、音乐、游戏）导出为 CSV 文件。
豆瓣没有官方数据导出功能；官方 API 已于 2018 年关闭。

## 此 Skill 可以做什么

- 通过 Frodo API 完整导出所有图书、影视、音乐和游戏收藏
- 通过 RSS 增量同步每日更新（最近约 10 个条目）
- 输出带 UTF-8 BOM 的 CSV（兼容 Excel），支持跨平台（macOS/Windows/Linux）
- 无需登录、无需 Cookie、无需浏览器
- 预先验证用户 ID（ID 错误时快速失败）

## 此 Skill 不能做什么

- 无法导出评论（长评）、笔记（读书笔记）或广播（广播）
- 无法在单次运行中按单一类别筛选（会同时导出全部 4 种类型）
- 无法访问私密账号（会静默返回 0 个条目）

## 为什么使用 Frodo API（请勿使用网页抓取）

豆瓣在网页上使用 PoW（工作量证明）挑战，会阻止所有 HTTP 抓取。
我们测试了 7 种方法——只有 Frodo API 可用。**请勿尝试**网页抓取、
`browser_cookie3`+`requests`、带 Cookie 的 `curl` 或 Jina Reader。

有关已测试的全部 7 种方法的完整失败记录及其失败原因，请参阅
[references/troubleshooting.md](references/troubleshooting.md)。

## 安全与隐私

脚本中的 API 密钥和 HMAC 密钥是豆瓣的**公开移动应用凭据**，
提取自 APK。所有豆瓣应用用户共用这些凭据，它们无法识别您的身份。
不会使用或存储任何个人凭据。数据仅从 `frodo.douban.com` 获取。

## 完整导出（主要方法）

```bash
DOUBAN_USER=<user_id> python3 scripts/douban-frodo-export.py
```

**查找用户 ID：**个人主页 URL 为 `douban.com/people/<ID>/`——ID 位于 `/people/` 之后。
如果用户提供完整 URL，脚本会自动提取 ID。

**环境变量：**
- `DOUBAN_USER`（必需）：豆瓣用户 ID（字母数字或纯数字，亦可为完整的个人主页 URL）
- `DOUBAN_OUTPUT_DIR`（可选）：覆盖输出目录

**默认输出位置**（根据平台自动检测）：
- macOS：`~/Downloads/douban-sync/<user_id>/`
- Windows：`%USERPROFILE%\Downloads\douban-sync\<user_id>\`
- Linux：`~/Downloads/douban-sync/<user_id>/`

**依赖项：**仅需 Python 3.6+ 标准库（可使用 `python3` 或 `uv run` 运行）。

**控制台输出示例：**
```
Douban Export for user: your_douban_id
Output directory: /Users/you/Downloads/douban-sync/your_douban_id

=== 读过 (book) ===
  Total: 639
  Fetched 0-50 (50/639)
  Fetched 50-100 (100/639)
  ...
  Fetched 597-639 (639/639)
  Collected: 639

=== 在读 (book) ===
  Total: 75
  ...

--- Writing CSV files ---
  书.csv: 996 rows
  影视.csv: 238 rows
  音乐.csv: 0 rows
  游戏.csv: 0 rows

Done! 1234 total items exported to /Users/you/Downloads/douban-sync/your_douban_id
```

## RSS 增量同步（补充方法）

```bash
DOUBAN_USER=<user_id> node scripts/douban-rss-sync.mjs
```

RSS 仅返回最近约 10 个条目（不支持分页）。请先使用完整导出，然后使用 RSS 进行每日更新。

## 输出格式

每位用户对应四个 CSV 文件：

```
Downloads/douban-sync/<user_id>/
├── 书.csv      (读过 + 在读 + 想读)
├── 影视.csv    (看过 + 在看 + 想看)
├── 音乐.csv    (听过 + 在听 + 想听)
└── 游戏.csv    (玩过 + 在玩 + 想玩)
```

列：`title, url, date, rating, status, comment`
- `rating`：★ 到 ★★★★★（未评分时为空）
- `date`：YYYY-MM-DD（用户标记日期）
- 可安全地多次运行（使用最新数据覆盖）
- 由于部分条目已下架，行数可能略少于豆瓣显示的数量

## 工作流程

1. 询问豆瓣用户 ID（从个人资料 URL 中获取，也可接受完整 URL）
2. 运行：`DOUBAN_USER=<id> python3 scripts/douban-frodo-export.py`
3. 验证：控制台输出中的行数应一致，使用 `wc -l <output_dir>/*.csv` 检查
4. （可选）设置 RSS 同步，以便每日进行增量更新

## 故障排除

有关以下内容，请参阅 [references/troubleshooting.md](references/troubleshooting.md)：
- Frodo API 身份验证详情（HMAC-SHA1 签名计算）
- 常见错误（代码 996 签名错误、速率限制、分页异常）
- 所有 7 种已测试方法的完整失败日志及根本原因
- 替代方法（豆伴扩展、Tampermonkey 脚本、浏览器控制台）
- API 端点参考及响应格式