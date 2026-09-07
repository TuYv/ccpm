---
name: golang-stay-updated
description: "Golang ecosystem watch list — official sources (go.dev/blog, pkg.go.dev, tour.golang.org, golang-nuts), newsletters (Golang Weekly, Awesome Go Newsletter), communities (r/golang, gophers.slack.com, Go Forum, go.dev/wiki), blogs (Dave Cheney, Ardan Labs, Rob Pike), YouTube channels (Gopher Academy, GopherCon EU/UK), conferences, and Go contributors to follow on GitHub, X and Bluesky. Use when seeking Golang learning resources, discovering new libraries or tools, finding community channels or meetups, picking Go people to follow, or keeping up with Go language changes and releases. Not for querying a specific module's versions, docs, or vulnerabilities from the CLI (→ See `samber/cc-skills-golang@golang-pkg-go-dev` skill)."
user-invocable: true
license: MIT
compatibility: Designed for Claude Code, Codex or similar harness, and for projects using Golang.
metadata:
  author: samber
  version: "1.3.1"
  openclaw:
    emoji: "📰"
    homepage: https://github.com/samber/cc-skills-golang
    requires:
      bins:
        - go
    install: []
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(golangci-lint:*) Bash(git:*) Agent WebFetch WebSearch
---
<!-- markdownlint-disable table-column-style -->

# 持续跟进 Go 动态

一份精选指南，助你把握 Go 生态系统的脉搏。

## Go 官方资源

| 资源                 | URL                                          |
| ------------------- | -------------------------------------------- |
| **go.dev**          | Go 官方网站，提供教程与工具                   |
| **pkg.go.dev**      | 发现 Go 包与文档                              |
| **tour.golang.org** | 交互式 Go 教程                                |
| **play.golang.org** | 用于测试代码的 Go Playground                  |
| **go.dev/blog**     | Go 官方博客                                   |

## 邮件通讯

| 邮件通讯 | 说明 | 订阅 |
| --- | --- | --- |
| **Golang Weekly** | 每周精选的 Go 内容、新闻与文章 | <https://golangweekly.com/> |
| **Awesome Go Newsletter** | 新 Go 库与工具的更新动态 | <https://go.libhunt.com/> |

## Reddit 与社区

| 社区 | 说明 | URL |
| --- | --- | --- |
| r/golang | 主要的 Go subreddit，成员超过 30 万 | <https://www.reddit.com/r/golang> |
| golang wiki | 官方 wiki，包含资源与常见问题解答 | <https://go.dev/wiki/> |
| gophers.slack.com | Go 官方 Slack 社区 | <https://invite.slack.golangbridge.org> |
| Go Forum | Go 官方讨论论坛 | <https://forum.golangbridge.org> |
| Discuss Go | Go 团队官方讨论组 | <https://groups.google.com/g/golang-nuts> |

## 知名 Go 开发者

关注这些有影响力的 Go 开发者与贡献者：

### Go 核心团队

| 姓名 | GitHub | Twitter/X | LinkedIn | Bluesky |
| --- | --- | --- | --- | --- |
| **Rob Pike** | robpike |  |  |  |
| **Ken Thompson** | ken |  |  |  |
| **Russ Cox** | rsc | @\_rsc | <https://www.linkedin.com/in/swtch> | <https://bsky.app/profile/swtch.com> |
| **Brad Fitzpatrick** | bradfitz | @bradfitz | <https://www.linkedin.com/in/bradfitz/> | <https://bsky.app/profile/bradfitz.com> |
| **Andrew Gerrand** | adg |  |  |  |
| **Robert Griesemer** | griesemer |  |  |  |
| **Dmitry Vyukov** | dvyukov | @dvyukov |  |  |

### Go 工具与基础设施

| 姓名 | GitHub | Twitter/X | LinkedIn | Bluesky |
| --- | --- | --- | --- | --- |
| **Sam Boyer** | sdboyer | @sdboyer |  |  |
| **Daniel Theophanes** | kardianos | @kardianos |  |  |
| **Matt Butcher** | technosophos |  |  |  |
| **Jaana Dogan** | rakyll | @rakyll | <https://www.linkedin.com/in/rakyll/> |  |

### 广受欢迎的 Go 作者与教育者

| 姓名 | GitHub | Twitter/X | LinkedIn | Bluesky |
| --- | --- | --- | --- | --- |
| **Mat Ryer** | matryer | @matryer | <https://linkedin.com/in/matryer> |  |
| **Dave Cheney** | davecheney | @davecheney | <https://linkedin.com/in/davecheney> |  |
| **Katherine Cox-Buday** | kat-co |  | <https://linkedin.com/in/katherinecoxbuday> |  |
| **Johnny Boursiquot** | jboursiquot | @jboursiquot | <https://linkedin.com/in/jboursiquot> |  |
| **Michał Łowicki** | mlowicki | @mlowicki | <https://linkedin.com/in/michał-łowicki-a60402b> |  |

### 库与框架作者

| 姓名 | GitHub | Twitter/X | LinkedIn | Bluesky |
| --- | --- | --- | --- | --- |
| **Steve Francia** | spf13 | @spf13 | <https://linkedin.com/in/spf13> |  |
| **Samuel Berthe** | samber | @samuelberthe | <https://linkedin.com/in/samuelberthe> | <https://bsky.app/profile/samber.bsky.social> |
| **Mitchell Hashimoto** | mitchellh | @mitchellh | <https://linkedin.com/in/mitchellh> | <https://bsky.app/profile/mitchellh.com> |
| **Matt Holt** | mholt | @mholt6 |  |  |
| **Tomás Senart** | tsenart | @tsenart | <https://www.linkedin.com/in/tsenart/> |  |
| **Björn Rabenstein** | beorn7 |  |  |  |

### 大会演讲者与社区领袖

| 姓名 | GitHub | Twitter/X | LinkedIn | Bluesky |
| --- | --- | --- | --- | --- |
| **Carlisia Campos** | carlisia | @carlisia | <https://linkedin.com/in/carlisia> |  |
| **Erik St. Martin** | erikstmartin | @erikstmartin |  |  |
| **Brian Ketelsen** | bketelsen |  |  | @brian.dev |

## 必关注的博客

| 博客              | 作者         | URL                                  |
| --------------- | ------------ | ------------------------------------ |
| The Go Blog     | Go 团队      | <https://go.dev/blog>                |
| Rob Pike's Blog | Rob Pike     | <https://commandcenter.blogspot.com> |
| Dave Cheney     | Dave Cheney  | <https://dave.cheney.net>            |
| Ardan Labs Blog | Bill Kennedy | <https://www.ardanlabs.com/blog>     |

## YouTube 频道

| 频道 | 内容 | URL |
| --- | --- | --- |
| Go | Go 官方团队 | <https://www.youtube.com/@golang> |
| Gopher Academy | 演讲与教程 | <https://www.youtube.com/@GopherAcademy> |
| GopherCon Europe | 欧洲大会演讲 | <https://www.youtube.com/@GopherConEurope> |
| GopherCon UK | 英国大会演讲 | <https://www.youtube.com/@GopherConUK> |
| Golang Singapore | 新加坡聚会与大会演讲 | <https://www.youtube.com/@golangSG> |
| Ardan Labs | Go 培训与技巧 | <https://www.youtube.com/@ArdanLabs> |
| Applied Go | Go 教程 | <https://youtube.com/appliedgocode> |
| Learn Go Programming | 初学者教程 | <https://youtube.com/learn_goprogramming> |

## 及时掌握动态的快速技巧

1. **订阅 1-2 份邮件通讯** - 不要让自己信息过载
2. 在 X/Bluesky 上**关注 10-20 位经常发布内容的关键人物**
3. 每周**查看 Go.dev/blog**，了解官方公告
4. **加入 Go Slack** 进行实时讨论
5. **收藏 pkg.go.dev** 以发现新库 — → 参见 `samber/cc-skills-golang@golang-pkg-go-dev` 技能，可通过命令行查询模块的最新版本、文档和漏洞信息
6. 每年**参加一次 GopherCon**（线上或线下）

---

_注：本指南会定期更新。可通过 GitHub issues 提交新增建议。_
