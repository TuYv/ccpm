---
name: zapier-status
description: Check the health of your Zapier MCP setup. Three modes — health check (dashboard view), audit (find waste and duplicates), diagnose (systematic troubleshooting). Use when asking "is my MCP working?", "check my tools", "audit my setup", "what's broken?", or "zapier status".
---
# Zapier 状态

用于监控和维护 Zapier MCP 设置的三种模式。根据上下文确定模式，如果不清楚就询问。

有关 Zapier MCP 服务器本身的工作原理，请参见 [docs.zapier.com/mcp](https://docs.zapier.com/mcp/home)。

## 模式 1：健康检查

**触发条件：**“检查我的工具”、"zapier status"、“一切正常吗？”或任何一般性的状态询问。

以仪表盘形式快速查看当前状态。

### 步骤

1. 检查可用的 Zapier MCP 工具。具体呈现形式取决于服务器的配置——有些服务器会暴露用于报告操作清单的元工具，有些则会将每个已配置的操作作为一个单独的命名工具暴露。使用任何可用的信号即可。

2. 如果没有可用的 Zapier 工具：报告连接状态，并建议运行 **zapier-onboard**。

3. 如果有可用工具，按应用分组构建一份摘要：

**对于每个应用**，显示：

- 应用名称
- 操作数量
- 操作类型（根据名称推断读/写：find/search/get/list = 读，send/create/update/add = 写）
- 快速状态：正常 / 需要认证 / 出错

**格式化为仪表盘：**

```
Zapier MCP status
=================
Server: connected
Total actions: 14 across 5 apps

Slack         3 actions (2 read, 1 write)     ✓ working
Gmail         3 actions (1 read, 2 write)     ✓ working
Google Cal    2 actions (1 read, 1 write)     ✓ working
Jira          3 actions (2 read, 1 write)     ✓ working
Google Docs   2 actions (1 read, 1 write)     ✓ working
```

4. 如果有任何操作看起来出了问题（基于近期的错误或认证问题），将其标记出来。

5. 以“一切看起来正常。”或“发现 [N] 个问题。需要我诊断一下吗？”结束。

## 模式 2：审计

**触发条件：**“审计我的设置”、“清理我的工具”、“查找重复项”、“我应该移除什么？”

查找低效之处：重复的操作、未使用的工具、与原生 MCP 服务器的冲突。

### 步骤

1. 通过检查可用的 Zapier MCP 工具获取完整清单。

2. **检查 Zapier MCP 内部的重复项：**
   - 同一应用的多个操作功能相似（例如，同时存在 "find message" 和 "search messages" 两个 Slack 操作）
   - 建议移除用处较小的那一个

3. **检查与原生 MCP 服务器的冲突：**
   - 查看客户端的 MCP 配置文件中配置的其他 MCP 服务器（例如 `.cursor/mcp.json`、`claude_desktop_config.json`、`.mcp.json`——具体取决于客户端）
   - 如果用户同时拥有原生 Slack MCP 和 Zapier 的 Slack 操作，将其标记出来
   - 建议：“你同时通过 Zapier 和原生 Slack 服务器使用 Slack。对于单一应用的使用场景，原生服务器通常更好。可以考虑移除 Zapier 的 Slack 操作。”

4. **检查未使用或低价值的操作：**
   - 很少会作为默认项用到的操作（例如，仅偶尔需要的非常具体的写操作）
   - 建议移除可以按需重新添加的操作

5. **展示审计报告：**

```
Audit results
=============
Duplicates:       1 found
  - Slack: "find_message" and "search_messages" overlap. Recommend removing "search_messages".

Native conflicts:  1 found
  - Slack: native Slack MCP also configured. Consider removing Zapier Slack actions.

Cleanup candidates: 2 found
  - Google Sheets "delete_row": rarely needed, can re-add on demand
  - Jira "add_attachment": niche action, add when needed

Recommended removals: 4 actions
Want me to show you how to clean these up?
```

6. 如果用户同意，引导他们前往 [mcp.zapier.com](https://mcp.zapier.com) 移除建议移除的操作（或者，如果服务器提供聊天内禁用工具，也可以使用该工具）。准确列出需要移除哪些操作。

## 模式 3：诊断

**触发条件：**“哪里出问题了？”、“我的工具不工作了”、“调试我的 MCP”，或特定工具调用失败时。

结合错误模式匹配的系统性故障排查。

### 步骤

1. **收集上下文：**询问出了什么问题，或使用当前对话中的错误信息。

2. **按顺序运行诊断：**

   a. **连接检查：**尝试调用任意可用的 Zapier 工具。如果全都失败，则问题出在服务器层面（认证、配置、网络）。

   b. **操作检查：**该特定操作在此服务器上是否可用？如果不可用，用户需要在 mcp.zapier.com 上添加它（或者，如果服务器提供聊天内发现工具，也可以通过它添加）。

   c. **认证检查：**尝试为受影响的应用调用一个读操作。如果返回认证错误，则需要重新认证该应用的连接。

   d. **参数检查：**审查失败调用的参数。常见问题：
   - 缺少必填字段
   - 字段格式错误（ID 与名称混淆）
   - 对 params resolver 来说过于模糊的指令

3. **与已知错误模式进行匹配：**

| 症状 | 可能原因 | 解决方法 |
| --- | --- | --- |
| 所有工具都失败 | 服务器认证已过期 | 在 mcp.zapier.com 重新认证 |
| 某个应用失败，其他正常 | 应用级认证已过期 | 重新连接该特定应用 |
| 工具未找到 / 不可用 | 操作未配置 | 引导用户前往 mcp.zapier.com 添加 |
| "invalid params" | 字段或格式错误 | 检查该工具的参数 schema |
| 结果为空但预期存在数据 | 搜索范围过窄或字段不对 | 放宽搜索范围或检查字段名称 |
| 执行时超时 | 服务器过载或操作缓慢 | 重试一次，若仍持续则上报 |
| "rate limit exceeded" | 调用过于频繁 | 拉开请求间隔，等待 30 秒 |
| 在一个项目中可用，在另一个项目中失败 | 项目级与全局配置不一致 | 同时检查该客户端的项目级和全局 MCP 配置 |

4. **报告诊断结果：**

"以下是我的发现：

- **连接**：正常（服务器有响应）
- **操作**：5 个应用共 14 个可用工具
- **认证问题**：Gmail 连接已过期。你需要在 mcp.zapier.com 上重新认证 Gmail。
- **建议**：[直接链接或具体说明]"

5. 如果修复需要用户操作（重新认证、修改配置），请提供具体的链接或说明。如果是 AI 能自行解决的问题（调整参数、尝试其他工具），主动提出可以代为处理。

## 一般说明

- 在任何模式下，始终把检查可用的 Zapier MCP 工具作为第一步诊断步骤。
- 不要直接抛出原始错误信息。要把它们转换成通俗易懂的语言。
- 如果问题超出了本技能能够诊断的范围（服务器端 bug、API 故障），请如实说明，并建议查看 [status.zapier.com](https://status.zapier.com) 或联系支持团队。
