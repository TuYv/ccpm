---
name: sync-debug
description: Diagnose a failing or misbehaving sync — fetch run logs, identify errors, cross-reference with code, and suggest fixes
user-invocable: true
disable-model-invocation: true
allowed-tools: ["Read", "Bash", "Glob", "Grep", "Edit", "Write"]
---
## 说明

帮助用户查明同步失败或产生错误结果的原因。按照以下步骤进行系统排查。

### 第 1 步：获取当前状态

运行以下命令以了解当前情况：

```shell
ntn workers sync status
```

记录列出的同步、它们的状态、上次运行时间和下次计划运行时间。查找卡住、失败或最近未运行的同步。

### 第 2 步：获取最近的运行记录

```shell
ntn workers runs list
```

查找退出代码非零的运行记录（在表格输出中显示为红色）。记录失败运行的运行 ID。

### 第 3 步：获取日志

对于最近一次运行（任意 capability）：

```shell
ntn workers runs list --plain | head -n1 | cut -f1 | xargs -I{} ntn workers runs logs {}
```

对于特定同步最近一次的运行：

```shell
ntn workers runs list --plain | grep <syncKey> | head -n1 | cut -f1 | xargs -I{} ntn workers runs logs {}
```

阅读完整的日志输出。查找错误消息、堆栈跟踪，以及同步代码中的任何 `console.log` 输出。

### 第 4 步：阅读同步代码

阅读 `src/index.ts`（以及所有导入的模块），以理解同步逻辑。结合代码分析日志中的错误。

### 第 5 步：诊断

常见失败模式及其修复方法：

**API 身份验证错误 (401/403)**

- 检查是否已配置 OAuth：`ntn workers oauth token <oauthKey>`
- 检查环境变量：`ntn workers env list`
- 如果远程环境中缺少环境变量：`ntn workers env push`
- 如果 OAuth 令牌已过期：运行 `ntn workers oauth start <key>` 以重新进行身份验证

**速率限制 (429)**

- 减小同步代码中的批次大小
- 如有需要，在 API 调用之间添加延迟
- 检查 API 是否有已记录的速率限制

**超时 / 执行时间过长**

- execute 函数每次调用耗时过长
- 减小批次大小（每页包含更少的记录）
- 简化逐条记录处理（推迟执行繁重的转换）

**游标 / 状态错误**

- 访问 state 时出现 TypeError：可能是首次运行问题（state 为 undefined）
- 代码更新后 state 的结构发生了变化：上一次运行所持久化的 state 仍采用旧结构
- 修复方法：运行 `ntn workers sync state reset <key>` 清除 state，并从头开始重新回填

**Schema 不匹配**

- `changes` 中的属性与 `schema.properties` 定义不匹配
- 检查每个 change 的 `properties` 对象中的所有键是否都与 schema 中的键匹配
- 检查是否对 `Schema.title()` 属性使用了 `Builder.title()`，对 `Schema.richText()` 使用了 `Builder.richText()`，依此类推

**无限循环（同步始终无法完成）**

- `hasMore` 始终为 `true`——游标没有向前推进
- 检查 `nextState` 是否在迭代之间发生变化
- 检查终止条件：它是否可以被触发？

**结果为空**

- API 未返回任何数据：直接测试 API 调用（使用 curl 或本地执行）
- 端点或查询参数错误
- 身份验证有效，但权限/作用域不足

**网络 / 瞬时错误**

- 仅发生一次：可能是瞬时错误——检查后续运行是否成功
- 反复发生：检查 API 端点 URL、DNS 和网络连接
- 强制重试：`ntn workers sync trigger <key>`

### 步骤 6：修复并验证

确定问题后：

1. 将修复应用到代码中
2. 运行 `npm run check` 验证类型
3. 如果状态结构发生了变化，请提醒用户可能需要运行 `ntn workers sync state reset <key>`（这会触发完整的重新回填）
4. 部署并通过预览进行验证：建议使用 `/sync-preview`，或运行 `ntn workers deploy && ntn workers sync trigger <key> --preview`
5. 修复验证完成后，运行 `ntn workers sync trigger <key>` 以恢复同步