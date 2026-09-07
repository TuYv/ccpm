---
name: coverage-check
description: Count how many independent origins are behind news coverage of a claim, instead of counting URLs. Queries GDELT for matching articles, collapses reprints and wire copy into single origins, and flags publication bursts that indicate syndication. Use when a claim appears to be confirmed by many outlets and you need to know whether that's many sources or one source many times.
---
# coverage-check

十个 URL 不等于十个来源。它把“很多媒体都报道了”变成一个你能辩护的数字。

## 何时使用

在声明核查过程中，当某条声明看起来*靠数量获得佐证*——一堆搜索结果全都在说同一件事。这种模式有两种截然不同的成因：

- 多家编辑室独立确立了该事实 → 真正有力的证据
- 一篇新闻稿、通讯社稿件或研究被转载了 40 次 → **一个**来源

两种情况下搜索结果看起来一模一样。而它能把二者区分开来。

## 用法

```bash
uv run scripts/coverage.py "<query>" [--timespan 3m] [--max 250] [--sort dateasc] [--timeout 120] [--json]
```

**它很慢。这是正常的。** GDELT 处理一个简单的一天期查询约需 15 秒，而在 3 个月时间窗、250 条记录下要长得多。脚本会把进度和调用耗时打印到 stderr，因此你可以区分“正在工作”与“已挂起”——如果看到了表示正在查询的那一行，就继续等。收窄 `--timespan` 是调节速度的杠杆；在断定它坏了之前，先把 `--timeout` 调大。

查询支持 GDELT 运算符：`"exact phrase"`、`(a OR b)`、`-exclude`、`domain:example.com`、`sourcelang:english`。把声明中具有辨识度的措辞放进引号——逐字匹配的短语才能抓到转载。

```bash
# Is this "40 outlets confirmed it" or one wire story?
uv run scripts/coverage.py '"quantum breakthrough" AND university'

# Narrow to the week the claim surfaced
uv run scripts/coverage.py '"record quarterly revenue" domain:reuters.com' --timespan 7d
```

## 如何读取输出

第一行是检测器所需的判定。其余部分是对它的支撑。

- **Distinct story clusters** —— 按标题相似度分组的文章。这就是来源数量的估计值。媒体数 ≫ 聚类数意味着存在辛迪加转载。
- 某个聚类上标有 **⚠️ syndicated** —— 多家媒体在 24 小时内发布了同一篇报道。应把整个聚类视为一个来源。
- 某个聚类上标有 **wire-attributed headline** —— 标题中点名了某家通讯社或新闻稿分发商（路透社、美联社、PR Newswire……）。这是在标题层面可用的最强机械性单一来源信号；正文能抓到更多，但 GDELT 不返回正文。
- **Duplicate URLs collapsed** —— 同一页面因跟踪参数、`www.` 或末尾斜杠而被计了两次。它们在任何其他计数之前就被折叠，因此其后的每个数字都已经是去重后的。
- **Span (hours)** —— 紧凑的爆发指向新闻稿或禁运解除；历时数周展开的报道更可能是独立的。

把结果作为来源数填入报告的证据栏：*“6 条结果，1 个来源（全部为该公司新闻稿的转载）”*比六个链接更有价值。

## 局限——在相信一个数字之前先读这些

- **仅有滚动的 3 个月时间窗。** GDELT DOC 2.0 无法追溯到更早。对于更早的声明它不会返回任何结果，而**没有结果并不意味着未被报道**。脚本会在输出中说明这一点；不要让智能体悄悄把空结果当成反证。
- **聚类基于标题相似度**，采用两种度量：针对改写标题的序列相似比，以及针对同样事实换了顺序的词元重叠度。分组具有传递性——同处一篇通讯社稿件的三家媒体会留在同一组，即使两端的两篇单独看都低于阈值。逐字转载、改写的通讯社稿件和重新排序的标题都能被正确折叠。

  它仍然抓不到的情况：两家编辑室独立得出了同一结论，并用真正不同的措辞加以描述。它们会显示为不同的聚类，而这属于出错时安全的那一面——它对辛迪加转载只会*少*报，而不会凭空捏造。

  阈值是针对真实的 GDELT 输出调优的，不是拍脑袋定的。如果看到错误合并，调高脚本中的 `TITLE_MATCH`/`TOKEN_MATCH`；如果通讯社稿件被漏判为不同来源，则调低。
- **存在不等于可信。** 一条被 200 家媒体报道、分为 30 个不同聚类的声明是*被广泛报道*，而不是*为真*。判定仍然需要检测器 [RUBRIC.md](../../analysis/bullshit-detector/RUBRIC.md) 中的来源层级。
- **每次查询结果上限 250 条。** 触及上限时输出会说明——每个计数都变成了下界，而诚实的解决办法是收窄 `--timespan`，而不是调大那个数字。
- **免费端点并不可靠，而这一条最为重要。** 每当其公共 API 繁忙时，GDELT 会在请求频率远低于该限制的情况下就返回 *"Please limit requests to one every 5 seconds"* ——与 IP、User-Agent 和查询规模均无关。实测行为：完全相同的调用在相隔几分钟内一次成功、一次失败。脚本会以逐渐加长的退避间隔重试，然后**以退出码 3 退出**。

  **退出码 3 意味着“未测得”，而不是“无报道”。** 绝不要让一次失败的核查削弱或加强某个判定，也绝不要把它记录成搜索结果为空。如果工具无法测量，报告中就写来源数未知，并退回到 [RUBRIC.md](../../analysis/bullshit-detector/RUBRIC.md) 中那些靠目测判断的线索。几分钟后重试，或者跳过它。

  | 退出码 | 含义 |
  |---|---|
  | 0 | 测量成功（包括合理的结果为零的时间窗） |
  | 1 | 输入有误或主机不可达 |
  | 3 | GDELT 限流——未获得测量，声明处于未测得状态 |
- **无需 API 密钥、无需认证、完全免费。** 没有需要配置的东西，也没有需要轮换的东西。

## 它不做的事

它统计并归类报道面。它不抓取文章正文——那是 [fetch-content](../fetch-content/SKILL.md) 的事——它也不做任何判断。分析技能读取它的输出；它们从不自行调用它来决定判定。
