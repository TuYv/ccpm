---
name: service-debugging
description: "Structured debugging runbook for backend services. Use when investigating production issues, API errors, performance problems, or when something broke and you need to find why."
allowed_tools:
  - Read
  - Glob
  - Grep
  - Bash
---
# Service Debugging

结构化的服务问题排查与修复方法。输入症状，输出根因。

## 何时使用

- API 端点返回错误（4xx、5xx）
- 性能下降或查询缓慢
- 服务无法启动或崩溃
- 服务间数据不一致
- 部署后出现故障
- 用户反馈“有东西坏了”

## 流程

### 1. 收集症状

在改动代码之前，先收集以下信息：
- **哪里坏了？**（具体端点、功能或行为）
- **何时开始的？**（部署之后？逐渐发生？突然发生？）
- **谁受影响？**（所有用户、特定用户、特定数据？）
- **错误信息？**（日志、HTTP 响应、堆栈跟踪）

### 2. 先检查显而易见的问题

先运行这些命令——它们能发现 80% 的问题：

```bash
# Recent deploys (did someone push something?)
git log --oneline -10

# Service health
curl -s http://localhost:8080/health | jq .

# Recent errors in logs
grep -i "error\|exception\|fatal" logs/app.log | tail -20

# Database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# Environment variables (missing or wrong?)
env | grep -i "DB_\|API_\|SECRET_" | sort
```

### 3. 缩小范围

| 症状 | 首先检查 |
|---------|-------------|
| 500 错误 | 日志中的堆栈跟踪 → 定位抛出异常的行 |
| 404 错误 | 路由注册 → 控制器是否已加载？ |
| 401/403 错误 | 认证配置 → @Secured 是否正确？令牌是否有效？ |
| 响应缓慢 | 数据库 → 对慢查询执行 EXPLAIN |
| 超时 | 外部服务 → 下游 API 是否有响应？ |
| 数据缺失 | 软删除 → 是否设置了 `deleted_at`？查询过滤条件是否有误？ |
| 服务无法启动 | Bean 创建 → 检查 @Factory 和 @Singleton 的装配 |

### 4. 复现

- 能否在本地触发该 bug？
- 触发失败的最小请求是什么？
- 是稳定失败还是间歇性失败？

### 5. 定位根因

如果是回归问题，使用 git bisect：
```bash
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-commit>
# Test each commit until you find the one that broke it
```

使用 grep 查找相关代码：
```bash
# Find where the error message comes from
grep -r "error message text" --include="*.kt" src/

# Find all callers of a broken function
grep -r "functionName" --include="*.kt" src/
```

### 6. 修复并验证

1. 编写一个能复现该 bug 的测试（红）
2. 修复代码（绿）
3. 运行完整测试套件
4. 如果是面向用户的问题，进行手动测试

> 常见 bug 及其修复方法的清单见 `common-issues.md`。

## 注意事项

- **不要修复症状，要修复原因。** 添加一个空值检查来掩盖数据问题，意味着这个数据问题日后还会反噬你。
- **在归咎于代码之前，先检查部署日志。** 配置变更、环境变量更新和基础设施变更导致的故障比代码 bug 更多。
- **“在我机器上能跑”通常意味着环境差异。** 将本地环境变量、数据库状态和服务版本与目标环境进行对比。
- **间歇性故障通常是竞态条件。** 如果 10 次里失败 1 次，排查并发访问、共享可变状态或连接池耗尽。
- **不要把重启服务当作排查的第一步。** 重启会丢失有助于诊断的状态。先读日志，如有需要再重启。
- **软删除记录是“数据缺失”的头号原因。** 在查询中始终检查 `deleted_at IS NULL`。

## 规则

- 改动代码之前务必先收集症状
- 修复之前先编写一个失败的测试
- 查看最近的 git 历史——大多数 bug 都是回归
- 在未理解根因之前不要部署修复
- 如果影响了用户，记录该事件
