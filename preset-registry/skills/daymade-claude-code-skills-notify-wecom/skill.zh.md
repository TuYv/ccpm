---
name: notify-wecom
description: >-
  Send a single one-off message to a WeCom (Enterprise WeChat) group bot. Use this skill whenever
  the user says "/notify-wecom", "send a quick WeCom message", "企微通知一下", "临时发一条企业微信",
  or any one-shot notification that does not need a reusable template or setup workflow. The message
  is sent immediately; no confirmation prompt is shown unless the message is empty or the webhook is
  not configured.
argument-hint: [message]
---
# /notify-wecom

向企业微信群机器人发送一条消息。

## 用法

```
/notify-wecom Claude Code 备份完成 ✅
```

该 Skill 从共享配置文件中读取 Webhook URL：

```
~/.config/setup-notifications-via-wecom/config.json
```

如果配置缺失，它会输出单行设置命令并停止运行。

## 前置条件

此 Skill 是 `setup-notifications-via-wecom` 的轻量级配套工具。可选择以下任一方式：

- 先安装 `setup-notifications-via-wecom`（推荐——它提供 Webhook 设置步骤和 `scripts/send_wecom.py` 发送程序），或
- 按照下文所示手动创建配置文件。

## 功能

1. 从 `~/.config/setup-notifications-via-wecom/config.json` 中读取 `webhook_url`。
2. 取消设置所有本地代理环境变量（必须直接访问腾讯端点）。
3. 使用 `setup-notifications-via-wecom` 中的发送程序（或等效的内联 curl 调用），通过企业微信 Webhook 发送消息。
4. 报告发送成功或企业微信返回的确切错误。

## 示例

```
/notify-wecom 服务上线成功 🚀
/notify-wecom 告警：build 失败，请检查
/notify-wecom 今日同步完成，0 缺失 0 滞后
```

## 多行消息

对于多行消息，请使用三引号包裹或使用文件：

```
/notify-wecom "第一行
第二行
第三行"
```

## 失败情况

- **配置缺失**：运行 `setup-notifications-via-wecom` 中的设置步骤，或手动创建配置文件。
- **Webhook 密钥无效**：企业微信会返回 `errcode`；该 Skill 会将其输出。
- **代理仍在干扰**：如果设置了标准名称以外的代理变量，请先取消设置这些变量。

## 限制

- 仅支持纯文本。不支持 Markdown 卡片、图片或 @提及。
- 消息长度上限为 4096 字节（UTF-8）。
- 不支持模板——如需结构化的备份、告警或状态消息，请使用 `setup-notifications-via-wecom`。