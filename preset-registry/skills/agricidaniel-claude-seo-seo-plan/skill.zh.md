---
name: seo-plan
description: >
  Strategic SEO planning for new or existing websites. Industry-specific
  templates, competitive analysis, content strategy, and implementation
  roadmap. Use when user says "SEO plan", "SEO strategy", "SEO planning",
  "content strategy", "keyword strategy", "content calendar",
  "site architecture", or "SEO roadmap".
user-invocable: true
argument-hint: "[business-type]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.4"
  category: seo
---
# 战略性 SEO 规划

## 流程

### 1. 调研
- 业务类型、目标受众、竞争对手、目标
- 当前网站评估（如已存在）
- 预算和时间限制
- 关键绩效指标（KPI）

### 2. 竞争分析
- 确定排名前 5 的竞争对手
- 分析其内容策略、Schema 使用情况和技术配置
- 识别关键词差距和内容机会
- 评估其 E-E-A-T 信号
- 估算其域名权威度

### 3. 架构设计
- 从 `assets/` 目录加载行业模板
- 设计 URL 层级结构和内容支柱
- 规划内部链接策略
- 应用质量门槛的网站地图结构
- 针对用户旅程设计信息架构

### 4. 内容策略
- 与竞争对手相比的内容差距
- 页面类型和预估数量
- 博客/资源主题和发布频率
- E-E-A-T 建设计划（作者简介、资质、经验信号）
- 包含优先级的内容日历

### 5. 技术基础
- 托管和性能要求
- 针对各页面类型的 Schema 标记计划
- Core Web Vitals 基准目标
- AI 搜索就绪要求
- 移动优先考量

### 6. 实施路线图（4 个阶段）

#### 第 1 阶段：基础建设（第 1-4 周）
- 技术配置和基础设施
- 核心页面（首页、关于、联系、主要服务）
- 必要的 Schema 实施
- 分析和跟踪设置

#### 第 2 阶段：扩展（第 5-12 周）
- 为主要页面创建内容
- 发布博客及首批文章
- 内部链接结构
- 本地 SEO 设置（如适用）

#### 第 3 阶段：规模化（第 13-24 周）
- 高级内容开发
- 链接建设和外联推广
- GEO 优化
- 性能优化

#### 第 4 阶段：权威建设（第 7-12 个月）
- 思想领导力内容
- 公关和媒体提及
- 高级 Schema 实施
- 持续优化

## 行业模板

从 `assets/` 目录加载：
- `saas.md`：SaaS/软件公司
- `local-service.md`：本地服务企业
- `ecommerce.md`：电子商务商店
- `publisher.md`：内容出版商/媒体
- `agency.md`：代理机构和咨询公司
- `generic.md`：通用企业模板

## 输出

### 交付物
- `SEO-STRATEGY.md`：完整的战略计划
- `COMPETITOR-ANALYSIS.md`：竞争洞察
- `CONTENT-CALENDAR.md`：内容路线图
- `IMPLEMENTATION-ROADMAP.md`：分阶段行动计划
- `SITE-STRUCTURE.md`：URL 层级结构和架构

### KPI 目标
| 指标 | 基准 | 3 个月 | 6 个月 | 12 个月 |
|--------|----------|---------|---------|----------|
| 自然流量 | ... | ... | ... | ... |
| 关键词排名 | ... | ... | ... | ... |
| 域名权威度 | ... | ... | ... | ... |
| 已编入索引的页面 | ... | ... | ... | ... |
| Core Web Vitals | ... | ... | ... | ... |

### 成功标准
- 每个阶段都有清晰、可衡量的目标
- 已明确资源需求
- 已识别依赖关系
- 风险缓解策略

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `dataforseo_labs_google_competitors_domain` 和 `dataforseo_labs_google_domain_intersection` 获取真实的竞争情报，使用 `dataforseo_labs_bulk_traffic_estimation` 进行流量估算，使用 `kw_data_google_ads_search_volume` 和 `dataforseo_labs_bulk_keyword_difficulty` 进行关键词研究，并使用 `business_data_business_listings_search` 获取本地企业数据。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 无法识别的业务类型 | 回退到 `generic.md` 模板。告知用户未找到特定行业的模板，并使用通用业务模板继续。 |
| 未提供网站 URL | 以新网站规划模式继续。跳过需要实时 URL 的当前网站评估和竞争差距分析。 |
| 未找到行业模板 | 检查 `assets/` 目录中可用的模板。如果请求的模板文件缺失，则使用 `generic.md`，并在输出中注明缺失的模板。 |