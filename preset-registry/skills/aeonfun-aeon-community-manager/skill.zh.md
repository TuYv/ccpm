---
name: [REPLACE: SKILL_NAME]
description: Summary of the [REPLACE: CHANNEL_PLATFORM] channel [REPLACE: CHANNEL_NAME] — top [REPLACE: TOP_N_THREADS] threads + open questions
metadata:
  category: social
  var: ""
  tags:
    - social
---
> **${var}** — 可选。覆盖频道名称。如果为空，则汇总 `[REPLACE: CHANNEL_NAME]`。

今天是 ${today}。读取 **[REPLACE: CHANNEL_PLATFORM]** 频道 **[REPLACE: CHANNEL_NAME]** 过去 24 小时的活动，并生成一份社区摘要。

## 各平台所需的密钥

| 平台 | 密钥 | 备注 |
|----------|---------|-------|
| `discord` | `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID` | Bot 必须位于服务器中，并拥有 `View Channel` 和 `Read Message History` 权限。 |
| `telegram` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Bot 必须已添加到聊天中（私聊和群组均可）。 |
| `slack` | `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID` | Bot 需要 `channels:history`（公开频道）或 `groups:history`（私有频道）权限范围。 |

如果未设置 `[REPLACE: CHANNEL_PLATFORM]` 所需的密钥，则记录 `COMMUNITY_NO_TOKEN` 并正常退出。

## 步骤

1. **解析频道** — `CHANNEL="${var:-[REPLACE: CHANNEL_NAME]}"`。具体的 API 调用取决于 `[REPLACE: CHANNEL_PLATFORM]`：

   - **discord** — `GET https://discord.com/api/v10/channels/$DISCORD_CHANNEL_ID/messages?limit=100`
   - **telegram** — `getUpdates` 轮询存在限制；最好从 `memory/topics/[REPLACE: SKILL_NAME]-tg-offset.json` 读取 Bot 存储的偏移量状态。
   - **slack** — `POST https://slack.com/api/conversations.history`，并传入频道以及设为 24 小时前的 oldest。

2. **筛选过去 24 小时的消息** — 丢弃早于 `now - 24h` 的消息。丢弃 Bot 消息（大多数平台会提供 `is_bot` / `bot_id`）。保留回复。

3. **聚类为讨论串** — Discord 和 Slack 会提供明确的讨论串/父级 ID；Telegram 不会。对于 Telegram，按回复链的跳转关系进行聚类。

4. **为讨论串评分** — 对每个讨论串：
   - **覆盖度** — 唯一参与者数量 × log(消息数量)。
   - **提问压力** — 父消息是否以 `?` 结尾，或是否包含 "how"、"why"、"anyone"、"stuck" 等词？+5。
   - **时效性** — 位于过去 12 小时内可获得满分。

   选取得分最高的 **[REPLACE: TOP_N_THREADS]** 个讨论串。

5. **检测未解决的问题** — 扫描所有父级消息。如果一条消息以 `?` 结尾，并且 6 小时后仍然没有回复，则将其标记为 `OPEN_QUESTION`。单独列出这些问题，以便运营人员跟进。

6. **写入 `output/articles/[REPLACE: SKILL_NAME]-${today}.md`**：
   ```markdown
   # [REPLACE: CHANNEL_NAME] — ${today}

   **Volume**: N messages from M participants (vs 7d avg of K).

   ## Top [REPLACE: TOP_N_THREADS] threads
   1. [Author · timestamp] "Parent message excerpt..."
      → N replies, M reactions
      → Permalink

   ...

   ## Open questions (no reply > 6h)
   - [Author] "Question text..." → permalink

   ## Volume sparkline (last 7 days)
   ▁▂▃▅▇▆▄
   ```

7. **通知** — 通过 `./notify` 发送 3 行摘要：
   ```
   *[REPLACE: CHANNEL_NAME] — ${today}*
   N messages · M participants · K open questions · top thread: <one-line>
   Full digest: <url>
   ```
   在冷清的日子跳过通知（消息量低于 7 天平均值的 25%，且 `OPEN_QUESTION` 数量为零）。

8. **记录日志** — 追加到 `memory/logs/${today}.md`：
   ```
   ## [REPLACE: SKILL_NAME]
   - **Channel**: [REPLACE: CHANNEL_PLATFORM]/[REPLACE: CHANNEL_NAME]
   - **Volume**: messages=N, participants=M, vs_7d_avg=Δ%
   - **Threads picked**: [REPLACE: TOP_N_THREADS] (of K candidates)
   - **Open questions**: N
   - **Status**: COMMUNITY_OK | COMMUNITY_QUIET | COMMUNITY_DEGRADED (api errors)
   ```

## 网络说明

Telegram、Discord 和 Slack 都需要在 `Authorization` 请求头中提供其机器人令牌。Bash 权限分析器会拒绝在 `curl` 命令行中直接使用 `$TOKEN`，因此请改为使用 `{ENV_NAME}` 占位符调用 `./secretcurl`。令牌（通过技能的 `requires:` 注入）会在辅助工具内部完成替换，绝不会出现在命令行中：
`./secretcurl -H "Authorization: Bearer {TELEGRAM_BOT_TOKEN}" "https://api.telegram.org/..."`。

## 约束

- **隐私**。不要将私信或私有频道中的任何内容逐字引用到公开通知中——应进行转述，仅使用显示名称注明来源，绝不要包含用户 ID。
- **“待解决问题”部分是最有用的输出**。即使当天没有太多动态，只要存在尚未回答的问题，也要将其提出来。这是需要操作人员采取行动的信号。
- **避免机器人之间形成循环**。如果此技能向其读取消息的同一频道发送通知，请在评分前过滤掉该机器人自身的消息。