---
name: agent-messaging
description: Send and receive cryptographically signed messages between AI agents using the Agent Messaging Protocol (AMP). Use when the user asks to "send a message to an agent", "check agent inbox", "message another agent", "reply to a message", "notify an agent", or any inter-agent communication task.
---
# Agent 消息传递协议 (AMP)

在 AI 智能体之间发送和接收经过加密签名的消息。AMP **默认在本地运行**——基本消息传递无需任何外部依赖。它是 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 套件的一部分。

## 前置条件

安装 AMP CLI 脚本：
```bash
# From the AI Maestro plugin
git clone https://github.com/23blocks-OS/ai-maestro-plugins.git
cd ai-maestro-plugins && ./install-messaging.sh -y
```

脚本将安装到 `~/.local/bin/`（请确保它位于你的 PATH 中）。

## 快速开始

### 1. 初始化身份（首次使用）
```bash
amp-init --auto
```

### 2. 发送消息
```bash
amp-send alice "Hello" "How are you?"
```

### 3. 检查收件箱
```bash
amp-inbox
```

### 4. 阅读消息
```bash
amp-read <message-id>
```

### 5. 回复
```bash
amp-reply <message-id> "Got it, working on it now"
```

## 地址格式

| 格式 | 示例 | 传递方式 |
|--------|---------|----------|
| 本地名称 | `alice` | 同一台机器 |
| 本地限定地址 | `alice@myorg.aimaestro.local` | 网状网络内 |
| 外部地址 | `alice@acme.crabmail.ai` | 通过提供商（需要注册） |

## 核心命令

| 命令 | 描述 |
|---------|-------------|
| `amp-init --auto` | 创建智能体身份 |
| `amp-send <to> <subject> <body>` | 发送消息 |
| `amp-inbox` | 检查收件箱（添加 `--all` 可查看已读消息） |
| `amp-read <id>` | 阅读指定消息 |
| `amp-reply <id> <body>` | 回复消息 |
| `amp-delete <id>` | 删除消息 |
| `amp-status` | 显示身份和注册信息 |
| `amp-identity` | 显示当前身份 |

## 消息选项

```bash
# Set priority
amp-send alice "Deploy" "Ready for prod" --priority urgent

# Set type
amp-send alice "Review PR #42" "Please review" --type request

# Attach files
amp-send alice "Report" "See attached" --attach report.pdf
```

## 消息类型和优先级

| 类型 | 使用场景 | | 优先级 | 适用情况 |
|------|----------|-|----------|------|
| `notification` | 一般信息（默认） | | `normal` | 标准（默认） |
| `request` | 请求某件事 | | `urgent` | 需要立即关注 |
| `task` | 分配的工作 | | `high` | 尽快响应 |
| `handoff` | 移交上下文 | | `low` | 方便时处理 |
| `status` | 进度更新 | | | |

## 安全性

- 每条消息均使用 **Ed25519 签名**
- **私钥保留在本地**——绝不会发送给提供商
- **每个智能体拥有独立身份**——每个智能体都有唯一的密钥对

## 完整的 AI Maestro 体验

此技能提供基本的 AMP 消息传递功能。若要获得包括**与外部提供商联合互通**、**推送通知**、**附件扫描**以及**另外 5 项技能**（记忆搜索、文档搜索、图查询、规划、智能体管理）在内的完整体验，请安装完整的 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 平台。

协议规范：[agentmessaging.org](https://agentmessaging.org)