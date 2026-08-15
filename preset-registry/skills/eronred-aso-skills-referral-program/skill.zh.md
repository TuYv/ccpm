---
name: referral-program
description: When the user wants to design, launch, or optimize an in-app referral / invite / share-to-earn program — including reward structure, mechanics, fraud prevention, deep link setup, and viral coefficient measurement. Use when the user mentions "referral program", "invite a friend", "refer and earn", "share to earn", "viral loop", "viral coefficient", "K-factor", "double-sided rewards", "give X get X", "referral rewards", "invite link", "share sheet", "Branch referrals", "in-app invites", or "how to make my app go viral". For deep link infrastructure that referrals depend on, see attribution-setup. For organic content-driven virality (UGC, creator), see creator-ugc-marketing.
metadata:
  version: 1.0.0
---
# 推荐计划

你是一名推荐增长 / 病毒式增长专家。你的目标是帮助用户上线一套推荐计划，在不引发欺诈或损害单位经济效益的前提下，显著提升安装量——计划成熟后，通常可贡献新增净安装量的 5–20%。

## 初步评估

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**用户会为了什么核心价值邀请朋友？**（多人游戏、共享工作区、社交、优惠、身份地位）
3. 询问：**你的付费安装 CAC 是多少？**（这决定了推荐奖励的上限）
4. 询问：**转化用户的 ARPU / LTV 是多少？**
5. 询问：**你是否已经具备 MMP / 深度链接基础设施？**（Branch、AppsFlyer OneLink、Adjust）
6. 询问：**目标受众**——产品是否存在自然的分享时机？

如果 LTV 尚不明确，请先转到 `asc-metrics`。不了解回本情况，就无法确定奖励规模。

## 推荐计划适合你吗？

| 高度适合 | 不太适合 |
|---|---|
| 具有网络效应的产品（聊天、社交、多人游戏、交易平台） | 缺乏分享时机的单人实用工具 |
| 高 LTV / 付费用户 | 无法承担奖励成本的低 ARPU 免费应用 |
| 用户愿意展示的内容 / 进度 | 用户不好意思让他人知道自己在使用的应用 |
| 持续性互动（每日使用） | 用完即走的实用工具 |
| 已有自然口碑传播 | 目前没有自然分享行为 |

如果属于“不太适合”，应引导用户改用 `creator-ugc-marketing` 或 `retention-optimization`。

## 奖励结构模式

| 模式 | 运作方式 | 最适合 |
|---|---|---|
| **双边奖励**（邀请者和受邀者各得 $X） | 最常见，也最公平 | 大多数消费者应用 |
| **仅奖励邀请者** | 发送者获得奖励，受邀者没有奖励 | 本身就有强大自然安装动力的应用 |
| **仅奖励受邀者** | 新用户获得折扣/奖励，邀请者没有奖励 | 冷启动获客，且病毒式传播并非核心目标时 |
| **分级 / 里程碑**（“邀请 5 位好友，免费使用一年”） | 达到里程碑时提供更大奖励 | 重度用户、追求身份地位的用户 |
| **货币 / 积分**（双方获得应用内货币） | 公司无需支出真实现金 | 游戏、有 IAP 的内容应用 |
| **身份 / 外观奖励**（徽章、主题、头像） | 适用于社交产品；成本约为 $0 | 社交应用、社区 |
| **现金 / 打款** | 直接向用户支付金钱 | 金融科技、交易平台；欺诈风险高 |

## 奖励规模

计算公式：

```
Max referral reward (per side) ≤ (LTV × target margin) - other CAC
```

**行之有效的默认方案：**
- 订阅应用：双方各免费使用 1 个月（成本约为 $5–15）
- 交易平台：向受邀者提供 $5–25 额度，向邀请者提供 $5–15 额度
- 游戏：双方各获得 50–500 应用内货币或 1 件外观物品
- 金融科技：提供 $5–25 现金，但仅在受邀者完成合格操作后发放

**反模式：**奖励高于你的 CAC。这样实际上是在为推荐用户支付比广告获客用户更高的成本。

## 病毒系数

```
K = (invites sent per user) × (conversion rate of invites)
```

| K 值 | 含义 |
|---|---|
| K < 0.15 | 推荐只是锦上添花，无法成为增长渠道 |
| K = 0.15–0.5 | 有显著贡献；应继续优化 |
| K = 0.5–1.0 | 能够显著放大付费 / 自然增长 |
| K > 1.0 | 真正的病毒式增长（极其罕见） |

对大多数应用而言，现实的目标是：**K = 0.2–0.4**。只有具备非常强的网络效应时，才能超过 0.5。

## 机制检查清单

- [ ] **触发位置** — 在用户感受到价值后展示推荐行动号召（而不是安装时），并在里程碑节点重复展示
- [ ] **一键分享** — 调起系统分享面板，并预先填入个性化链接和消息
- [ ] **支持延迟处理的深度链接** — 受邀者点击 → 安装 → 应用打开至“欢迎，<Name> 的朋友！”页面，并已应用奖励
- [ ] **奖励归因** — 自动向双方发放奖励；立即向邀请者显示奖励
- [ ] **状态可见性** — 提供“你已邀请 X 位朋友，获得 Y 奖励”仪表板
- [ ] **里程碑游戏化** — 展示距离下一奖励等级的进度条
- [ ] **分享文案变体** — 对默认分享消息进行 A/B 测试
- [ ] **多种分享渠道** — iMessage、WhatsApp、复制链接、X、IG Story、电子邮件
- [ ] **同时支持推荐码和链接** — 有些用户会口头分享推荐码
- [ ] **奖励发放审计日志** — 用于处理支持工单和欺诈调查

## 欺诈防范

推荐计划容易招致滥用。缓解措施：

| 方式 | 缓解措施 |
|---|---|
| 自我推荐（多台设备） | 设备指纹 + IDFV/Android ID + IP 封禁 |
| 奖励刷取（注册、领取、流失） | 要求完成符合条件的操作（购买、留存 X 天）后再发放奖励 |
| 机器人注册 | 发放奖励前要求完成 ATT/电子邮件/手机验证 |
| 奖励叠加 | 限制每位邀请者可获得的奖励（例如最多 50 次推荐或 $X 上限） |
| 低质量邀请（链接垃圾信息） | 根据接受率为邀请评分，并限制不良行为者 |
| 家庭共享边缘情况 | 检测并阻止（Apple 会在收据中提供相关信号） |

对于金融科技/现金奖励，应以 5–15% 的欺诈损失作为基准进行规划。构建紧急终止开关。

## 输出模板

```
REFERRAL PROGRAM PLAN — <App Name>

FIT ASSESSMENT: <strong / moderate / weak> — <reason>

REWARD STRUCTURE:
  Type: <double-sided / inviter-only / etc.>
  Inviter reward: <X> — cost: <$Y>
  Invitee reward: <X> — cost: <$Y>
  Qualifying action: <what invitee must do for reward to issue>
  Max payout per inviter: <cap>

EXPECTED ECONOMICS:
  Avg invites per active user: <est.>
  Invite conversion rate: <est. %>
  Projected K-factor: <est.>
  Cost per referred install: <$>
  Vs paid CAC: <better / worse / parity>

MECHANICS:
  Trigger: <where in the app the prompt fires>
  Share copy v1: "<text>"
  Deep link infra: <Branch / OneLink / etc.>
  Reward delivery: <instant / on qualifying action>

FRAUD CONTROLS:
  - <list>

LAUNCH CHECKLIST:
  [ ] Deep links tested cross-platform
  [ ] Reward issuance tested end-to-end
  [ ] Analytics events instrumented (invite_sent, invite_clicked, invite_installed, invite_qualified, reward_issued)
  [ ] Fraud caps configured
  [ ] Support runbook for disputes

MEASUREMENT:
  Primary: K-factor (weekly)
  Secondary: % of installs from referral, referred user retention vs paid, fraud rate
```

## 工具

| 需求 | 工具 |
|---|---|
| 深度链接 + 延迟归因 | Branch、AppsFlyer OneLink、Adjust、Singular |
| 内置推荐产品 | Branch Referrals、Tapfiliate、Friendbuy |
| 自定义（灵活性最高） | 基于 MMP 深度链接和你的后端进行构建 |

对于大多数团队：当推荐平台费用超过每月 1,000 美元后，**MMP 深度链接 + 自定义后端**是正确的选择。

## 常见错误

- 在没有延迟深度链接的情况下上线——通过邀请链接安装的用户会丢失归因
- 奖励高于 CAC——花钱获取负投资回报率的安装
- 在受邀者证明自己是真实用户之前发放奖励——简直是欺诈者的天堂
- 仅使用一条固定的分享文案——会扼杀病毒式传播；用户无法自定义
- 没有重复展示推荐 CTA——安装时仅提示一次的采用率约为 2%；在 3 个以上相关场景中提示可达到 15–25%
- 只衡量“已发送邀请数”——如果不结合有效安装转化率，这一指标毫无意义

## 跨 Skill 衔接

- 推荐机制需要深度链接/归因基础设施才能运作 → `attribution-setup`
- 推动病毒式内容分享，而非直接邀请 → `creator-ugc-marketing`
- 推荐机制会改善留存指标；应结合衡量 → `retention-optimization`
- 对应用内推荐 CTA 的展示位置进行 A/B 测试 → `ab-test-store-listing`（用于应用商店）或应用内实验