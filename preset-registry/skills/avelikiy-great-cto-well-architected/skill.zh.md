---
name: well-architected
description: 6-pillar architecture review framework. Adapted from AWS Well-Architected for use by great_cto's architect agent on every non-nano ARCH document. Forces explicit answers across operational excellence, security, reliability, performance, cost, and sustainability — not just feature design.
when_to_use: |
  Apply when:
  - architect is writing ARCH-*.md for small/medium/large/enterprise project_size
  - regulated-reviewer or security-officer is auditing an existing system
  - project-auditor is reviewing a brownfield codebase
  Do NOT apply to:
  - nano project_size (overhead exceeds value)
  - bug-fix tasks (no architecture change)
  - pure refactor with no behaviour change
effort: high
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/decisions/**"
  - "src/**"
---
# Well-Architected — 发布前需验证的 6 大支柱

所有非 nano 工作的 ARCH 文档都必须回答以下 6 大支柱的问题。只有在明确说明理由时，才允许跳过某个支柱（例如：
“可持续性：不适用 — 仅限后端，运行在共享基础设施中。”）。

本文改编自 AWS Well-Architected（侧重：小团队 SaaS / LLM 应用程序），并精简为在少于 10 名工程师的团队规模下真正重要的问题。

## 支柱 1 — 卓越运营

### 问题

1. **可观测性：** 我们会生成哪些指标、日志和追踪数据？如何通过仪表板判断它在生产环境中是否正常工作？
2. **可部署性：** 如何发布变更？有哪些 CI 门禁？回滚路径是什么？
3. **运行手册：** 当它在凌晨 3 点发生故障时，值班人员应该阅读什么？

### 通过标准

- ✅ 每个业务成果对应一个指标（例如 webhook-deliveries-acked）
- ✅ 每个请求对应一条日志，并且可以通过 request-id 跨服务关联
- ✅ 部署路径已记录并经过测试（已执行回滚演练）
- ✅ 运行手册涵盖事前分析中排名前三的故障模式

### 常见失败情形

❌ “我们之后会添加监控。”监控是功能的一部分。

## 支柱 2 — 安全性

### 问题

1. **信任边界：** 不受信任的数据从哪里进入？如何对其进行验证/净化？
2. **身份认证 / 授权：** 谁可以调用它？谁可以读取/写入数据？
3. **机密信息：** API 密钥、数据库密码和 JWT 签名密钥存储在哪里？
4. **数据分类：** 是否包含 PII？PHI？PCI 持卡人数据？保留策略是什么？

### 通过标准

- ✅ 每个外部输入都在边界处经过明确验证
- ✅ 授权在数据层强制执行，而不仅仅是在 UI 层
- ✅ 机密信息存储在环境变量或密钥管理器中，绝不写入源代码
- ✅ 敏感数据已分类，并已定义保留策略

### 常见失败情形

❌ “JWT 验证了用户，这就是我们的授权。”JWT 是身份认证。授权是另一回事（该用户可以读取此行数据）。

## 支柱 3 — 可靠性

### 问题

1. **故障模式：** 当下游依赖响应缓慢、不可用或数据损坏时，会发生什么？
2. **幂等性：** 重试的请求能否安全地重新执行？
3. **备份与恢复：** RPO（数据丢失容忍度）是多少？RTO（停机容忍度）是多少？两者的测试计划是什么？
4. **容量：** 它能处理的最大 QPS 是多少？当流量达到该值的 1.5 倍时会发生什么？

### 通过标准

- ✅ 对外部调用设置熔断器 / 超时
- ✅ 修改状态的端点接受幂等键
- ✅ 备份已有文档记录，并且在过去 90 天内测试过恢复
- ✅ 已有负载测试；结果位于 `docs/perf/`

### 常见失败情形

❌ “Postgres 有备份。”未经恢复测试的备份不算备份。

## 支柱 4 — 性能效率

### 问题

1. **SLO：** p50/p95/p99 延迟目标是多少？错误率是多少？可用性是多少？
2. **瓶颈：** 对关键路径进行性能分析 — 最慢的步骤是什么？
3. **缓存：** 哪些内容可以缓存？缓存失效策略是什么？
4. **扩展：** 垂直扩展还是水平扩展？自动扩展规则是什么？

### 通过标准

- ✅ ARCH 文档中包含具体的 SLO 数值（而不是“足够快”）
- ✅ 对非简单请求附上性能分析结果
- ✅ 缓存策略已有文档记录；失效机制已明确说明
- ✅ 扩展决策以数据为依据，而不是“凭感觉合适”

### 常见失败

❌ “数据库可以处理。”请量化：每秒查询数、行数、索引命中率。

## 支柱 5 — 成本优化

### 问题

1. **热路径：** 每个请求中成本最高的操作是什么？为什么？
2. **合理配置：** 所选实例类型 / 模型 / 数据库层级是否为满足 SLO 的最小配置？
3. **清理：** 旧数据如何处理？旧日志呢？旧分支环境呢？

### 通过标准

- ✅ 使用技能 `cost-model` 记录明确的金额数字
- ✅ 选择满足质量 SLO 的最小 LLM 模型（先选 haiku，再选 sonnet，最后选 opus）
- ✅ 为日志、指标和旧数据制定保留策略

### 常见失败

❌ 在 Haiku 可以胜任时默认使用 Opus / GPT-4。先在 Haiku 上测试。

## 支柱 6 — 可持续性（环境 / 能源）

### 问题

1. **工作负载效率：** 代码本可以达到 O(n)，是否却为 O(n log n)？
2. **空闲资源：** 开发环境能否在夜间缩容至零？
3. **数据最小化：** 我们是否收集 / 存储了从不查询的数据？

### 通过标准

- ✅ 记录热循环的复杂度
- ✅ 非生产资源设有关闭计划
- ✅ 数据生命周期涵盖摄取、保留和删除

### 常见失败

❌ 在生产环境中使用调试级别日志，且从不审查。浪费存储空间并增加碳排放。

## 输出格式 — 添加到 ARCH

```markdown
## Well-Architected review

### 1. Operational excellence
- Metrics: <list>
- Deploy path: <link to runbook>
- Verdict: PASS | RISKS LISTED

### 2. Security
- Trust boundaries: <list>
- Data classification: <PII / PHI / PCI / none>
- Verdict: PASS | RISKS LISTED

### 3. Reliability
- Failure modes: <link to pre-mortem>
- Idempotency: <yes/no per endpoint>
- Verdict: PASS | RISKS LISTED

### 4. Performance
- SLOs: p99=<ms>, error_rate=<%>, availability=<%>
- Verdict: PASS | RISKS LISTED

### 5. Cost
- Per-request cost: $<amount>
- Verdict: PASS | RISKS LISTED

### 6. Sustainability
- Hot-path complexity: O(<n>)
- Verdict: PASS | N/A | RISKS LISTED

## Open risks (rolled up)

<bullet list of all RISKS LISTED items + mitigation in plan>
```

## 何时可以接受列有风险的 PASS

并非每个架构都无懈可击。在满足以下条件时，列有风险的 PASS 是可以接受的：
- 每项风险都得到明确说明（而非含糊带过）
- 每项风险要么在计划中有缓解措施，要么由用户明确接受
- 预演失败部分涵盖风险评分最高的 3 个项目

Gate:plan 可以批准列有风险的 PASS；gate:ship 则要求缓解措施已完成交付。