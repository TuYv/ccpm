---
name: [REPLACE: SKILL_NAME]
description: Watch Vercel deploys for [REPLACE: VERCEL_PROJECT] — alert on [REPLACE: ALERT_ON] in the last [REPLACE: LOOKBACK_HOURS] hours
metadata:
  category: dev
  var: ""
  tags:
    - dev
  requires:
    - VERCEL_TOKEN
---
> **${var}** — 可选。覆盖 Vercel 项目 slug。若为空，则监控 `[REPLACE: VERCEL_PROJECT]`。

今天是 ${today}。监控 **[REPLACE: VERCEL_PROJECT]** 在过去 **[REPLACE: LOOKBACK_HOURS]** 小时内的 Vercel 部署，并针对 **[REPLACE: ALERT_ON]** 发出警报。

## 必需的密钥

- `VERCEL_TOKEN` — 来自 https://vercel.com/account/tokens 的个人访问令牌。只需读取权限。
- （可选）`VERCEL_TEAM_ID` — 如果项目位于某个团队下，请设置此项，以便 API 查询正确的作用域。

如果缺少任一密钥，请记录 `DEPLOY_WATCH_NO_TOKEN` 并正常退出——切勿中止工作流。

## 步骤

1. **解析作用域**：
   ```bash
   PROJECT="${var:-[REPLACE: VERCEL_PROJECT]}"
   SCOPE_QS=""
   if [ -n "${VERCEL_TEAM_ID:-}" ]; then
     SCOPE_QS="&teamId=$VERCEL_TEAM_ID"
   fi
   ```

2. **获取近期部署** — Vercel API v6 可列出项目的部署：
   ```bash
   SINCE_MS=$(( $(date -u +%s) * 1000 - [REPLACE: LOOKBACK_HOURS] * 3600 * 1000 ))
   URL="https://api.vercel.com/v6/deployments?projectId=$PROJECT&since=$SINCE_MS$SCOPE_QS&limit=20"
   curl -sf -H "Authorization: Bearer $VERCEL_TOKEN" "$URL" > .vercel-deploys.json || \
     echo "DEPLOY_WATCH_FETCH_FAIL: $?"
   ```

   在运行过程中，通过 `./secretcurl` 发起每一次 Vercel 调用（将密钥写为 `{VERCEL_TOKEN}`——Bash 权限层会拒绝行中直接出现的 `$VERCEL_TOKEN`）。只读状态检查和任何**不可逆操作**（例如触发部署）都在运行过程中执行——不可逆操作应作为该技能的最终操作，并采用失败时关闭的策略。绝不要推迟读取操作。

3. **解析并分类** — 对于每个部署，获取：`uid`、`state`（READY / ERROR / CANCELED / BUILDING / QUEUED）、`url`、`target`（production / preview）、`creator`、`createdAt`、`meta.githubCommitMessage`。

4. **应用警报筛选条件** — `[REPLACE: ALERT_ON]` 是以下值之一：
   - `production-failures` → 当 `target=production` 且 `state in {ERROR, CANCELED}` 时发出警报。
   - `any-failures` → 对任何 `state in {ERROR, CANCELED}` 发出警报。
   - `slow-builds` → 当构建时间超过该项目过去一周中位数的 10 倍时发出警报。
   - `all` → 对每次状态转换发出警报（信息量很大——仅在调试该技能时有用）。

5. **与上次成功基线比较** — 如果针对失败发出警报，还需获取最近一次成功的生产部署，并在通知中包含：“上次成功：[commit] · [N hours] 前”。

6. **去重** — 在 `memory/topics/[REPLACE: SKILL_NAME]-alerted.json` 中记录已发出警报的部署 UID。切勿针对同一 UID 重复发出警报。

7. **通过 `./notify` 通知每个新警报**：
   ```
   *Deploy alert — [REPLACE: VERCEL_PROJECT]*
   ${state}: ${commit_message}
   ${target} build by ${creator} · ${ago}
   Last green: ${last_green_commit} · ${last_green_ago}
   Inspect: https://vercel.com/${owner}/${PROJECT}/${uid}
   ```

8. **将汇总信息写入** `output/articles/[REPLACE: SKILL_NAME]-${today}.md`：部署总数、每个目标的成功/失败计数、平均构建时间，以及包含提交消息的失败 UID 列表。

9. **记录**到 `memory/logs/${today}.md`：
   ```
   ## [REPLACE: SKILL_NAME]
   - **Deploys (${LOOKBACK_HOURS}h)**: total=N, ready=X, error=Y, canceled=Z, building=W
   - **Alerts fired**: N (deduped from M raw matches)
   - **Status**: DEPLOY_OK | DEPLOY_QUIET (no deploys) | DEPLOY_ALERT | DEPLOY_DEGRADED
   ```

## 网络说明

Vercel API 要求使用 `Authorization: Bearer {VERCEL_TOKEN}`。Bash 权限层会拒绝命令行中直接出现的 `$SECRET`，因此在运行过程中，**每次**调用 Vercel 都要使用 `./secretcurl`（将密钥写为 `{VERCEL_TOKEN}` 占位符——这样可以避免密钥出现在命令行中）。无论是只读状态检查，还是任何**不可逆**操作（例如触发部署），都在运行过程中执行；不可逆操作放在最后，作为该技能最终的故障关闭操作。切勿延后读取操作。

## 约束

- **去重不可妥协**。针对同一部署重复发送相同警报，会让运维人员养成将频道静音的习惯——一旦发出警报，除非部署状态发生变化，否则绝不再次发送。
- 在警报方面，**生产环境优先于预览环境**。预览部署失败值得关注，但并不紧急。默认使用 `production-failures`，除非运维人员选择接收更多警报。
- **与基线进行比较**。与单独报告构建失败相比，同时说明“上次成功是在 3 小时前”更能体现失败构建的意义。