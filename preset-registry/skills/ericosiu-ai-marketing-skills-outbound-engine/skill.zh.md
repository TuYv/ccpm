---
name: cold-outbound-optimizer
description: Design, analyze, and optimize cold outbound email campaigns for Instantly. Handles end-to-end ICP definition, expert panel scoring (recursive to 90+), sequence copywriting, infrastructure audit, capacity planning, and implementation docs. Use when asked to build cold outbound sequences, optimize cold email, analyze outbound campaigns, build sales sequences, build Instantly sequences, create cold outbound strategies, or design email campaigns. Supports both "start from scratch" and "optimize existing" modes.
---
## 前置步骤（在 Skill 启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：**此 Skill 会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在用户选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

# 冷启动外联优化器

---

## 启动：确定模式

询问用户：
1. 你是否拥有一个**已有的 Instantly 账户**及待审计的营销活动，还是要**从零开始**？
2. 你是否拥有 **Instantly API 密钥**？（审计模式必需。）

如果提供了 API 密钥 → 在继续之前运行 `scripts/instantly-audit.py`，以获取营销活动、账户清单和预热评分。

---

## 阶段 1：信息收集与审计

### 1A — 基础设施检查（如果有 API 密钥）
运行 `python3 scripts/instantly-audit.py --api-key <KEY>` 并报告：
- 活跃的营销活动（名称、状态、回复率、打开率）
- 发件账户（数量、预热评分、每日限额）
- 域名清单
- 预热缺口：任何评分低于 80 或预热时间少于 14 天的账户 → 标记为未就绪

### 1B — 效果数据
- 从 Instantly 获取营销活动分析数据
- 询问：“你是否有包含历史外联数据的电子表格？”如果有，请用户提供链接。

### 1C — ICP 定义
如果尚未定义 ICP，则收集：
- **职位：**你的目标人群是谁？（例如，营销副总裁、增长负责人）
- **行业：**哪些垂直领域？
- **公司规模：**员工人数或营收范围？
- **营收下限：**符合条件所需的最低 ARR/营收是多少？
- **反向 ICP：**需要明确排除哪些人群？

使用 `references/icp-template.md` 作为信息收集模板。

### 1D — 业务背景
收集：
- 你销售什么？（一句话，不使用行业术语）
- 主要优惠是什么？（免费试用、审计、演示、咨询）
- 可引用的真实 URL（定价页面、案例研究、相关内容）
- 是否有任何证明材料？（客户成果、统计数据、社会认同）

### 1E — 专家评审组配置
默认：10 位专家（参见 `references/expert-panel.md`）。
询问：“是否要添加任何特定行业的专家，或替换评审组成员？”评分前确认名单。

---

## 阶段 2：专家评审组递归评分

**目标：90/100。不可妥协。持续迭代，直至达到目标。**

### 每轮结构
每轮会产出：
1. **评分表** — 全部 10 位评审组成员、各自的评分（0-100）以及一行理由
2. **综合评分** — 10 位成员评分的平均值
3. **主要弱点** — 阻碍文案表现的问题排名列表
4. **所做修改** — 针对每项弱点进行的具体编辑
5. **更新后的文案** — 修改后的完整邮件序列

### 评分标准（基于每位评审组成员的视角 — 参见 `references/expert-panel.md`）
- 主题行的好奇心激发效果/打开率潜力
- 首句的模式中断效果
- 正文的清晰度和简洁性
- CTA 的柔和度和具体性
- 邮件序列的衔接和跟进逻辑
- 送达率风险信号（垃圾邮件关键词、链接密度）
- 个性化内容的可信度

### 规则
- 评分必须极其诚实。没有达到相应水平，就不要为了凑数打到 90 分。
- 如果本轮评分 < 90：找出最严重的 3 个弱点，修改文案，然后进入下一轮。
- 如果本轮评分 ≥ 90：确定最终文案，并继续准备交付物。
- 在最终文档中展示每一轮结果——迭代过程本身就是价值的一部分。

---

## 阶段 3：交付物

### 策略文档
创建一份文档（Google Doc、Notion 或 markdown），包含：

1. **预分析 / 残酷真相**——现有营销活动做错了什么（如果从零开始，则提供基准情况）
2. **ICP 摘要**——已确认的定向参数
3. **基础设施状态**——账户清单、预热就绪情况、容量计算
4. **各轮评分**——每一轮的完整专家组投票表
5. **最终邮件文案**——所有营销活动的全部步骤，采用可直接用于 Instantly 的格式
6. **实施计划**——分步骤的设置说明
7. **容量计算**——账户数 × 每日发送量 = 销售管道预测
8. **每周指标目标**——打开率、回复率、积极回复率、已预约会议数
9. **停止事项清单**——应立即终止的事项
10. **启动事项清单**——应优先启动的事项

### 最终文案格式规则
遵循 `references/instantly-rules.md` 和 `references/copy-rules.md` 中的所有规则。

### 人工审核关卡
**不要自动将任何内容推送到 Instantly。**该文档用于人工审核。在进行任何 API 写入之前，必须获得明确批准。

### 迭代
审核后收集反馈，并根据需要对修改后的文案重新评分。

---

## 容量计算公式

```
Accounts ready (score ≥80, ≥14 days warmup) × 30 emails/day = conservative daily volume
Accounts ready × 50 emails/day = aggressive daily volume
Daily volume × 22 working days = monthly send capacity
Monthly sends × expected reply rate = expected replies
Expected replies × qualification rate = pipeline opportunities
```

---

## 每周指标目标（基准）

| 指标 | 良好 | 优秀 |
|--------|------|-------|
| 打开率 | 40%+ | 60%+ |
| 回复率 | 3%+ | 7%+ |
| 积极回复率 | 1%+ | 3%+ |
| 会议预约率 | 0.5%+ | 1.5%+ |

根据细分市场和产品方案调整目标。面向冷流量的免费审计与付费试用的转化表现不同。

---

## 附加建议（提及但不构建）

- **LinkedIn 自动化：**使用 HeyReach 或类似工具构建多渠道触达序列。采用单独的工作流。
- **潜在客户数据丰富：**上传前使用 Clay 或 Apollo 获取个性化数据。
- **潜在客户管道：**使用 `scripts/lead-pipeline.py` 实现 Apollo → LeadMagic → Instantly 自动化。

---

## 参考文件

| 文件 | 用途 |
|------|---------|
| `references/instantly-rules.md` | 变量语法、触达序列结构、送达率规则 |
| `references/expert-panel.md` | 默认的 10 人专家名单及其评分视角 |
| `references/copy-rules.md` | 邮件文案规则（首句、CTA、数据表述方式） |
| `references/icp-template.md` | ICP 数据收集模板 |
| `scripts/instantly-audit.py` | 通过 Instantly v2 API 拉取营销活动、账户和预热评分 |
| `scripts/lead-pipeline.py` | 端到端潜在客户获取管道 |
| `scripts/competitive-monitor.py` | 竞争对手跟踪与情报分析 |
| `scripts/cross-signal-detector.py` | 多来源信号检测 |
| `scripts/cold-outbound-sender.py` | 发送已批准的外联邮件 |