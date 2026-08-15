---
name: setup-notifications-via-wecom
description: >-
  Set up and send technical status notifications through WeCom (Enterprise WeChat) webhooks.
  Use this skill whenever the user needs to send notifications, alerts, backup completion reports,
  or status updates via WeCom; when they mention 企业微信, 企微机器人, webhook, or alerting;
  or when a message needs to be clear, unambiguous, and technically precise rather than vague or
  condescending.
---
# 通过企业微信设置通知

## 概述

此 Skill 可帮助你通过企业微信群机器人 webhook 发送清晰、无歧义的技术通知。
它涵盖两个方面：

1. **一次性设置**：存储 webhook URL、测试连接，并创建可复用的发送脚本。
2. **发送消息**：编写能够区分状态与变化量、明确说明每个数字含义的消息，并避免使用曾导致早期备份同步通知令人困惑的误导性表述。

附带的脚本 `scripts/send_wecom.py` 负责执行实际的 HTTP 调用，包括访问中国大陆腾讯服务所需的取消代理设置规则。

## 何时使用此 Skill

当用户有以下情况时触发此 Skill：
- 提到“发送企业微信通知”“企业微信通知”“企微机器人”或“webhook 通知”。
- 希望为备份、同步、定时任务或服务状态设置告警。
- 要求你编写状态或告警消息，且你需要确保消息清晰、无歧义。
- 提到某条消息令人困惑或具有误导性，并希望修正它。

## 快速开始：配置 Webhook

1. **检查现有配置**：
   ```bash
   cat ~/.config/setup-notifications-via-wecom/config.json
   ```
   如果该文件存在且包含 `webhook_url`，请跳至[发送消息](#send-a-message)。

2. **从企业微信群机器人设置中获取 webhook URL**。其格式如下：
   ```
   https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY
   ```

3. **私密存储该 URL**（存储在 Skill 包之外，以便在更新后继续保留）：
   ```bash
   mkdir -p ~/.config/setup-notifications-via-wecom
   echo '{"webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"}' \
     > ~/.config/setup-notifications-via-wecom/config.json
   chmod 600 ~/.config/setup-notifications-via-wecom/config.json
   ```

4. **通过发送测试消息来测试连接**（在 Skill 目录中运行）：
   ```bash
   uv run --with requests scripts/send_wecom.py --message "WeCom webhook test ✅"
   ```
   如果你在企业微信群中看到了该消息，则设置已完成。

## 消息最佳实践

这些规则源自实际修正经验。请将它们应用于每条通知。

### 1. 结论置于首行
第一行必须说明发生了什么。不要把结论埋在后文中。

```
Claude Code 备份同步完成 ✅
```

### 2. 区分状态与变化量
- **状态**：当前总数（例如，源目录中有 1075 个主 session，备份中有 2328 个）。
- **变化量**：本次运行中发生的变化（例如，自 03:00 起新增了 13 个主 session 和 230 个其他文件）。

如果今天实际仅新增了 13 个，请勿表述为“同步了 1075 个 session”。

### 3. 明确说明每个数字的含义
每个计数都必须说明其统计对象。推荐使用：

```
- 源目录主 session：1075 个
- 备份主 session：2328 个
```

避免单独使用“session”这类含义不明确的术语——它可能包含工作流日志、子代理文件或工具输出。

### 4. 使用直白的位置名称，而非术语
推荐使用：
- “电脑上”/“源目录”
- “备份里”/“备份仓库”

避免使用：
- “当前”
- “含历史”
- “旧 session”（除非已明确定义）

### 5. 省略无关信息
除非用户明确要求，否则不要包含提交哈希、文件路径、内部文档引用或冗长的解释。

### 6. 技术表述要精确，不要居高临下
使用正确的技术术语，并对其进行定义。不要把所有内容都转化为“​​大白话”式的简化表达，从而牺牲准确性。

### 7. 包含验证指标
当用户问“是否有任何遗漏？”时，直接回答：

```
- 验证：0 缺失，0 滞后
```

### 8. 以下一步操作结尾
告知用户是否需要执行任何操作：

```
- 下一步：无需操作，下次自动同步 03:00
```

## 通知模板

### 备份同步完成

当备份/同步任务完成并且需要报告完整性时使用。

```
Claude Code 备份同步完成 ✅

- 自动同步：今日 03:00 正常执行
- 本次手动同步：补充 03:00 后的增量
  - 主 session：13 个
  - 子代理/工具输出/工作流：230 个
  - 合计：243 个文件
- 验证：0 缺失，0 滞后
- 当前状态：
  - 源目录主 session：1075 个
  - 备份主 session：2328 个
- 下一步：无需操作，下次自动同步 03:00
```

### 告警

当某些情况需要**立即采取行动**时使用。不要将此模板用于日常的“一切正常”更新。

```
🚨 [P?] [服务/任务名] [症状]

- 影响：[谁/什么受影响，程度如何]
- 严重程度：[P1–P5 等级]
- 开始时间：[YYYY-MM-DD HH:MM TZ]
- 已采取：[正在做的动作]
- 下一步：[建议动作或预计下次更新时间]
- 相关链接：[dashboard/runbook，可选]
```

规则：
- 针对症状发出告警，而不是原因（例如，“API 错误率 > 10%”，而不是“CPU 99%”）。
- 如果接收者无法采取任何具体行动，就不要将消息作为告警发送。
- 如实说明不确定性；不要猜测根本原因。

### 状态更新

用于日常的“一切正常”更新。

```
[任务名] 状态正常 ✅

- 检查时间：2026-06-24 03:00 CST
- 关键指标：
  - 源目录主 session：1075 个
  - 备份主 session：2328 个
- 本次变更：无
- 下一步：无需操作
```

## 发送消息

### 选项 A：直接使用随附的脚本

```bash
uv run --with requests scripts/send_wecom.py \
  --message "你的消息内容"
```

对于多行消息，请使用文件：

```bash
cat > /tmp/wecom_msg.txt <<'EOF'
Claude Code 备份同步完成 ✅

- 验证：0 缺失，0 滞后
EOF

uv run --with requests scripts/send_wecom.py \
  --file /tmp/wecom_msg.txt
```

### 选项 B：内联使用 curl

如果你不想使用该脚本：

```bash
env -u http_proxy -u https_proxy -u all_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY \
  curl -s -X POST 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "msgtype": "text",
    "text": {
      "content": "YOUR_MESSAGE"
    }
  }'
```

**重要**：腾讯服务（微信/企业微信）必须绕过本地代理。必须使用 `env -u ...` 前缀。

## 工作流：向脚本添加企业微信通知

当用户要求“让我的备份脚本发送企业微信通知”时，请执行以下操作：

1. 确认 webhook 已配置（参见快速入门）。
2. 确定通知类型（backup-complete、alert、status-update、custom）。
3. 从脚本输出中收集准确的数值及其定义。
4. 使用上述模板编写消息。
5. 使用该消息调用 `scripts/send_wecom.py`。
6. 验证消息已送达企业微信群。

## 此 Skill 不执行的操作

- 它不会创建或管理企业微信群机器人——请先从企业微信获取 webhook key。
- 它不处理富媒体消息（Markdown 卡片、图文、图片）——仅支持纯文本。
- 它不会无限重试——脚本会对瞬时错误重试 3 次，然后以失败结束。
- 它不会在缺少代理取消设置保护措施的情况下发送消息。

## 故障排查

### `Connection closed` 或超时

如果本地代理环境变量泄漏到请求中，WeCom 端点可能会请求失败。脚本和内联 curl 示例已取消设置这些变量。如果仍然失败，请运行：

```bash
env | grep -i proxy
```

运行发送脚本之前，请取消设置所有已设置的代理环境变量。

### 消息未收到，但 curl 返回了 200

检查响应正文。即使出现密钥无效或消息过长等错误，WeCom 仍会返回 200。脚本会打印完整响应，请仔细查看。

### 找不到配置文件

重新运行设置步骤。脚本要求 `~/.config/setup-notifications-via-wecom/config.json` 中包含 `webhook_url` 字段。

## 参考资料

- `references/message_best_practices.md` — 根据本次会话中的修正提炼而成的精简检查清单。
- `scripts/send_wecom.py` — 发送脚本。