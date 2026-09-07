---
name: waterfall-enrich-contacts
description: "Enrich HubSpot contacts (email, phone, job title) through an external enrichment provider and write results back safely. Pluggable provider adapters with FullEnrich waterfall enrichment as the default; Apollo, Hunter, and Dropcontact included; bring your own via a template."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: data-enrichment
---
# 使用外部提供商对联系人进行瀑布式富化

使用外部富化提供商填补 HubSpot 联系人缺失的电子邮件、电话号码和职位头衔，然后将结果写回并附带完整的审计记录。提供商层是可插拔的：**FullEnrich**（一个瀑布式聚合器，会依次查询 20 多个上游数据源，直到其中一个命中）是默认选择，同时内置了 Apollo、Hunter 和 Dropcontact 适配器，并提供一个模板，可接入你的团队已付费使用的任何提供商。

## 为什么这很重要

内部的富化技能（`/enrich-company-name`、`/enrich-industry`、`/backfill-geo-data`）只能搬运门户中已有的数据。当联系人的电子邮件、直拨电话或职位头衔在 HubSpot 中根本不存在时，外部富化是唯一的解决办法——而每次查询都要花费真金白银，这正是本技能围绕成本上限、预览和键入式确认来构建的原因。

## 提供商概览

| 提供商 | 适配器 | 优势 | 计费模式 |
|----------|---------|----------|-------|
| **FullEnrich**（默认） | `providers/fullenrich.py` | 对 20+ 个数据源进行瀑布式查询——电子邮件和手机号命中率最高 | 按查询消耗积分，异步批量 API |
| Apollo | `providers/apollo.py` | 庞大的 B2B 数据库，职位头衔 + 企业画像 | 积分制；个人数据揭示功能受套餐等级限制 |
| Hunter | `providers/hunter.py` | 按姓名 + 域名查找电子邮件，附带置信度评分 | 按套餐计请求数；仅限电子邮件 |
| Dropcontact | `providers/dropcontact.py` | GDPR 优先，算法式（无存储数据库） | 积分制，异步 |
| 你自己的提供商 | 复制 `providers/_template.py` | 你已在使用的任何服务 | — |
| Mock（仅用于测试） | `providers/mock.py` | 用于 `/sandbox-self-test` 和试运行（dry run）的确定性假数据——不联网 | 免费；切勿用于生产环境 |
| HubSpot Breeze Intelligence | （原生，无需适配器） | 平台内富化 + 表单精简 | 积分制附加项；编程式 API 访问仅对企业版开放——这正是本技能默认采用与提供商无关的适配器的原因 |

只需一个环境变量即可切换提供商：`ENRICHMENT_PROVIDER=apollo`。

## 前置条件

- 一个具备联系人读写权限范围的 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`）
- Python 3.10+ 及 [`uv`](https://github.com/astral-sh/uv)
- 你所选提供商的账户 + API 密钥（例如来自 FullEnrich dashboard > Settings > API 的 `FULLENRICH_API_KEY`）
- **一项合规检查**：富化操作会将联系人姓名和公司数据发送给第三方，并导入个人数据（电子邮件、电话）。在*运行之前*，请确认这符合你的数据处理协议以及适用的隐私规则（GDPR/CCPA）。

## 脚本

| 阶段 | 脚本 | 运行方式 |
|-------|--------|----------|
| 前置 | [`scripts/before.py`](./scripts/before.py) | `uv run skills/waterfall-enrich-contacts/scripts/before.py` |
| 执行 | [`scripts/execute.py`](./scripts/execute.py) | `uv run skills/waterfall-enrich-contacts/scripts/execute.py` |
| 后置 | [`scripts/after.py`](./scripts/after.py) | `uv run skills/waterfall-enrich-contacts/scripts/after.py` |

提供商适配器位于 [`scripts/providers/`](./scripts/providers/) 中——每个提供商一个模块，实现 `enrich(contacts) -> results`（契约详情见 `_template.py`）。

## 配置

所有配置均在 `.env` 中设置：

```
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx
ENRICHMENT_PROVIDER=fullenrich          # fullenrich | apollo | hunter | dropcontact | mock | yours
FULLENRICH_API_KEY=...                  # the chosen provider's key
ENRICHMENT_TARGET_FIELD=phone           # phone | email | jobtitle
ENRICHMENT_MAX_CONTACTS=100             # hard cap per run — credits cost money
ENRICHMENT_OVERWRITE=false              # never overwrite existing values (default)
ENRICHMENT_CREDITS_PER_CONTACT=1        # for before.py's cost preview
```

## 执行模式

### 阶段 1：规划

1. 选择提供商和目标字段（电话回填与电子邮件回填属于两次独立的运行）。
2. 与数据隐私负责人确认上述合规检查。
3. 确认预算：`MAX_CONTACTS × credits-per-lookup` 是单次运行的上限。先从小规模运行（25-50）开始，检查质量后再扩大规模。

### 阶段 2：前置

```bash
uv run skills/waterfall-enrich-contacts/scripts/before.py
```

统计候选对象（即名字、姓氏和公司信息齐全但缺失目标字段的联系人），并打印成本上限。只读操作。

### 阶段 3：执行

```bash
uv run skills/waterfall-enrich-contacts/scripts/execute.py
```

该脚本会：
1. 通过 Search API 选取最多 `MAX_CONTACTS` 个候选对象
2. 在**消耗积分之前**要求键入式确认（`ENRICH`）
3. 调用提供商适配器（异步提供商会持续轮询直至完成）
4. 计算写入内容——除非 `ENRICHMENT_OVERWRITE=true`，否则绝不覆盖 HubSpot 中已有的非空值；被跳过的值仍会记录到审计 CSV 中
5. 在改动 HubSpot 之前要求第二次键入式确认（`WRITE`）
6. 批量更新联系人并写入审计 CSV（记录每个字段的旧值、新值、操作和来源）

### 阶段 4：后置

```bash
uv run skills/waterfall-enrich-contacts/scripts/after.py
```

将候选数量与基线进行比较，然后**人工抽查 10-20 个已富化的联系人**——提供商的质量因细分群体而异，而审计 CSV 会准确告诉你哪些内容被写入了哪里。

## 安全机制

| 机制 | 详情 |
|-----------|--------|
| **单次运行上限** | `MAX_CONTACTS`（默认 100）限定单次运行的积分消耗。该值刻意设得较低——只有在验证质量后才调高。 |
| **默认不覆盖** | 除非 `ENRICHMENT_OVERWRITE=true`，否则绝不替换已有的非空值。富化用于填补空缺，而非纠正数据。 |
| **双重确认** | 消耗积分之前键入 `ENRICH`；改动 HubSpot 之前键入 `WRITE`。在两步之间中止会消耗积分，但不会改动任何内容。 |
| **CSV 审计记录** | 每个写入的字段（以及每个被跳过的字段）都会连同旧值、新值和提供商来源一起记录。 |
| **回滚数据** | 审计 CSV 的 `old` 列就是回滚依据：将这些值批量更新回去即可撤销一次运行。 |

## 回滚

- 执行阶段的审计 CSV 记录了其写入的每个字段的先前值。要撤销，请将这些联系人/字段对批量更新回 `old` 值（空字符串会清空字段）。
- 各个值也可以从每个联系人的属性历史记录中单独恢复。

## 技术注意事项

1. **请对照提供商的最新文档核验适配器的请求负载。** 提供商 API 迭代很快；每个适配器的 docstring 都附有文档链接并标注了需要检查的要点。在改动 HubSpot 之前，适配器一旦遇到认证或积分错误就会明确报错（清晰的 `SystemExit` 消息）。
2. **瀑布式提供商是异步的。** FullEnrich 和 Dropcontact 会在几秒到几分钟内返回结果；适配器会进行轮询。不要在轮询中途终止脚本——积分在提交时即被消耗。
3. **富化得到的电子邮件属于未经核实的发信风险。** 找到的电子邮件并不等于营销许可。新电子邮件会以非营销数据点的形式录入；在进行任何发送之前，你常规的 opt-in 和送达率规则仍然适用。
4. **40-70% 的匹配率是正常的。** 提供商无法找到所有人。审计 CSV 会区分“提供商一无所获”（缺失）与“找到但被跳过”（已有值）。
5. **域名质量决定命中率。** 缺失电子邮件域名或公司网站的候选对象富化效果很差。请先运行 `/enrich-company-name`——身份输入越好，瀑布式结果就越好。
6. **内部数据优先。** 如果某个值在门户中的任何地方已经存在（关联公司、`ip_country`、表单提交），就应交由免费的内部技能来填充——把积分留给 HubSpot 确实没有的数据。
