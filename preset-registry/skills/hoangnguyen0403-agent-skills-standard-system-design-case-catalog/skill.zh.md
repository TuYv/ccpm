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
      - mock interview
      - unique id generator
---
# 案例目录

## **优先级：P2（中）**

每个经典问题都有一个决定性约束。先指出它；其余设计由此展开。

## 决定性约束

| 问题 | 决定性约束 | 随之而来的决策 |
| --- | --- | --- |
| URL 缩短器 | 读请求量约为写请求量的 100:1，键必须短且唯一 | 对分布式计数器使用 Base62 编码、以缓存优先的读取路径、选择 301 还是 302 |
| 速率限制器 | 决策必须低成本、可共享，并且在并发下保持正确 | 在共享计数器中使用令牌桶、制定失败开放或失败关闭规则、返回 `429` 以及 `Retry-After` |
| 新闻信息流 | 在存在名人用户倾斜的情况下，权衡扇出成本与读取延迟 | 普通账户采用推送，名人账户采用拉取，在读取时进行混合合并 |
| 聊天 | 在持久连接规模下，明确消息投递保证与在线状态 | WebSocket 网关、按会话保证顺序、离线队列、已读回执 |
| 通知 | 支持多渠道投递，并具备重试与去重能力 | 每个渠道一个队列、幂等键、用户偏好与免打扰时段 |
| 自动补全 | 在巨大的词条空间中，将前缀查询控制在 100 毫秒以内 | 在内存中使用 Trie 或前缀索引、为每个前缀预先计算 top-k、异步重建 |
| 网络爬虫 | 大规模场景下的礼貌性抓取与去重，而不是单纯追求抓取量 | 按主机划分的 frontier 队列、robots 缓存、URL 指纹去重、新鲜度策略 |
| 唯一 ID | 无需中央锁即可有序、唯一地生成 ID | 采用类似 Snowflake 的时间戳加节点编号加序列号；处理时钟偏移 |

## 辅导模式

- 重述问题，然后询问范围：哪些用例包含在内，哪些不包含。
- 执行 `system-design-methodology` 中的各个阶段；不要直接给出完整架构。
- 从以下方面评估候选人：先明确需求、先给出数字再讨论组件、每个组件说明一项理由、意识到决定性约束，以及坦诚面对权衡。
- 针对最薄弱的方面提出一个具体的后续问题，而不是列出所有不足。
- 只有在候选人确定一种方案之后，才给出参考答案。

## 复用规则

- 将新问题映射到目录中最接近的形态，然后重新推导数字。可以复用形态，但绝不能复用容量估算。
- 在借用某种设计之前，先说明类比在哪些地方不成立。
- 目录中的答案只是起始假设，不能替代需求收集与容量估算。

## 反模式

- **没有数字就不要做模式匹配**：即使是已知形态，也仍然需要根据本系统的 QPS 和数据量进行分析。
- **不要把面试答案当作构建计划**：生产环境还会增加迁移、成本、合规和团队约束。
- **辅导模式下不要倾倒完整解决方案**：价值在于提出了什么问题，而不是给出了什么答案。

## 参考资料

- [常见设计](references/common-designs.md) - 按问题划分的设计概要，包含约束、组件和权衡