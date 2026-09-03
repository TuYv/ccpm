---
name: mem-setup
description: >
  This skill should be used when the user asks to "set up claude-mem", "pair
  claude-mem", "connect cmem", "add my cmem key", "set up cloud sync in
  Cowork", or provides cmem.ai Connect values (sync token, user id, SyncHub
  URL) for this plugin. Configures the claude-mem-cowork plugin credentials.
metadata:
  version: "0.1.0"
---
# Claude-Mem 设置（Cowork 配对）

使用用户自己的 cmem.ai 凭据配置此插件，使钩子能够捕获和注入记忆。任何人都可以配对——凭据是按用户配置的，绝不硬编码在插件逻辑中。

## 需要收集的内容

从 **cmem.ai → Connect** 处，用户会得到三个值：

1. **同步令牌**（以 `cm_` 开头）——用作 bearer API 密钥
2. **用户 ID**（UUID）
3. **SyncHub URL**（一个 workers.dev 或 cmem.ai 的 URL）

如果用户粘贴了 Connect 页面的完整文字，从中提取这三个值。如果缺失任何一项，至少要索要同步令牌——另外两项是可选的。

## 密钥处理——不可妥协

- 绝不在对话中回显令牌、不将其放入 shell argv、也不记录到日志。
- 只通过文件写入（Write/Edit 工具）和文件读取来传递它。

## 步骤

1. 定位已安装插件的根目录（本技能所属的插件）。更新其 `config.json`：将 `apiKey` 设为同步令牌，并设置 `userId` 和 `syncHubUrl`。除非用户要求，否则保留其他设置不变（`inject` 为开关项）。项目命名是自动的（`cmem_work_*`），不可配置。
2. Cowork 容器是临时性的：对已安装副本的修改仅在本次会话内有效。要使配对永久生效，需重新打包——将插件目录压缩为 `<plugin-name>.plugin` 文件并发送给用户重新安装（即 cowork-plugin 技能的打包流程）。告诉用户这样做的原因。
3. 如果这台机器上还安装了本地 claude-mem（存在 `~/.claude-mem/` 目录），可选择将相同的值以 0600 权限写入 `~/.claude-mem/settings.json`（键为 `CLAUDE_MEM_CLOUD_SYNC_TOKEN`、`CLAUDE_MEM_CLOUD_SYNC_USER_ID`、`CLAUDE_MEM_CLOUD_SYNC_HUB_URL`——与本地 claude-mem 云同步配对写入的键相同）——钩子脚本和本地 worker 都会读取该文件。
4. 在不暴露密钥的前提下进行验证：

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/cmem-hook.mjs" status
   ```

   报告掩码后的输出。出现 `MISSING` 键表示写入未生效；在 Pro 端点部署之前，`/api/hooks/context` 返回 404 属于预期情况（搜索/注入仍可通过 `/api/mcp` 正常工作）。

## 备用来源

环境变量可覆盖一切，且无需修改文件：`CMEM_API_KEY`、`CMEM_USER_ID`、`CMEM_SYNC_HUB_URL`、`CMEM_API_BASE`。
