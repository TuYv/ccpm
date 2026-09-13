---
name: system-design-case-catalog
description: "Answer classic system design problems as constraint-to-solution sketches and coach interview practice: URL shortener, rate limiter, news feed, chat, notification, autocomplete, crawler, unique id. Use for interview practice or naming the closest known shape for a new problem."
metadata:
  triggers:
    keywords:
      - system design interview
      - design twitter
      - design url shortener
      - news feed
      - design chat system
      - web crawler
      - unique id generator
      - video streaming
      - ride hailing
      - payment ledger
---
# 案例目录

## **优先级：P2（中）**

每个经典问题都有一个决定性约束。先明确它；其余设计由此展开。

## 决定性约束

| 问题 | 决定性约束 | 由此产生的决策 |
| --- | --- | --- |
| URL 短链 | 读请求约为写请求的 100:1，键必须短且唯一 | 使用分布式计数器生成 Base62，采用缓存优先的读取路径，选择 301 还是 302 |
| 限流器 | 决策必须廉价、共享，并且在并发下保持正确 | 在共享计数器中使用令牌桶，确定失败时放行还是拒绝，返回 `429` 和 `Retry-After` |
| 新闻推送 | 推送成本与读取延迟之间的权衡，以及名人用户带来的倾斜 | 普通账号采用推送，名人账号采用拉取，在读取时进行混合合并 |
| 聊天 | 在持久连接规模下的投递保证和在线状态 | WebSocket 网关、按会话保证顺序、离线队列、已读回执 |
| 通知 | 多渠道投递，同时支持重试和去重 | 按渠道设置队列，使用幂等键，支持用户偏好和免打扰时段 |
| 自动补全 | 在海量词项空间中实现低于 100ms 的前缀查询 | 将 Trie 或前缀索引加载到内存中，为每个前缀预计算 top-k，异步重建 |
| 网络爬虫 | 规模化场景下的礼貌抓取和去重，而非原始抓取能力 | 按主机设置 frontier 队列，缓存 robots，使用 URL 指纹去重，制定新鲜度策略 |
| 唯一 ID | 无需中心锁即可生成有序且唯一的 ID | 使用 Snowflake 风格的时间戳加节点加序列号；处理时钟偏移 |
| 视频流媒体 | 码率阶梯和 CDN 经济性，而非上传本身 | 为每种转码规格设置转码流水线，使用自适应清单（HLS/DASH），以边缘缓存命中率作为成本杠杆 |
| 网约车 | 在供给和需求不断移动的情况下进行地理匹配 | 使用 Geohash 或 S2 单元，带 TTL 的司机位置流，匹配窗口，以及作为定价信号的动态加价 |
| 支付账本 | 在重试和部分失败下实现只生效一次的效果 | 每次尝试使用幂等键，采用复式记账账本，针对支付处理方运行对账任务 |

## 辅导模式

- 模拟轮次、计时、评分标准和复盘都位于 `system-design-interview-coaching` 中；本目录是其题库。
- 只有在候选人确定采用某种方案后，才给出标准答案；候选人停滞时，上面的决定性约束就是后续追问。

## 复用规则

- 将新问题映射到目录中最接近的形态，然后重新推导数据。形态可以迁移，容量估算不能照搬。
- 在借用设计之前，先说明类比不成立的地方。
- 目录答案是起始假设，不能替代需求了解和容量估算。

## 反模式

- **不得在没有数据的情况下进行模式匹配**：即使形态已知，也仍需估算该系统的 QPS 和数据量。
- **不得将面试答案当作构建计划**：生产环境还要考虑迁移、成本、合规和团队约束。
- **辅导模式下不得直接倾倒完整解决方案**：价值在于提出的问题，而不是给出的答案。

## 参考资料

- [常见设计](references/common-designs.md) - 按问题提供包含约束、组件和权衡的设计草图