---
name: cloud-sync
description: Set up or check claude-mem cloud sync with cmem.ai Pro. Use when the user says "set up cloud sync", "sync my memories", "cmem pro", "cloud backup", "sync status", or wants their memory database backed up or synced to their cmem.ai account.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
# 云同步（cmem.ai Pro）

已安装的 worker 通过 SyncHub 进行同步。这里有一个客户端、一个持久化的操作日志，并且没有独立的同步守护进程。本技能检查状态或写入 **cmem.ai → Connect** 下发的三个连接值。

**安全规则：** 永远不要打印 sync token、将其放入 `argv`，或记录日志。仅确认其长度。保留所有不相关设置，并保持 `~/.claude-mem/settings.json` 的权限为 `0600`。

## 1. 检查状态

解析 worker 端口并查询始终已注册的状态路由：

```bash
PORT="${CLAUDE_MEM_WORKER_PORT:-$(node -e "const fs=require('fs'),p=require('path'),os=require('os');const uid=(typeof process.getuid==='function'?process.getuid():77);const fallback=String(37700+(uid%100));try{const s=JSON.parse(fs.readFileSync(p.join(os.homedir(),'.claude-mem','settings.json'),'utf-8'));process.stdout.write(String(s.CLAUDE_MEM_WORKER_PORT||fallback));}catch{process.stdout.write(fallback);}" 2>/dev/null)}"
curl -s "http://127.0.0.1:${PORT}/api/sync/status"
```

- `configured: true` 且 `hub.reachable: true` → worker 已对 SyncHub 完成一次已认证的 `GET /v1/sync/status`。报告 `deviceId`、待处理计数、`lastFlushAt`、`lastError` 以及 Hub 的 head/checkpoint；除非用户要求更换连接，否则停止。
- `configured: true` 且 `hub.reachable: false` → 报告 `hub.error`，并说明 SyncHub 连接未通过校验。待处理计数为零或 `lastError: null` 并不表示成功，因为空队列不会执行推送。
- `configured: false` → 继续。
- 重启后立即出现 Connection refused、404 或 503 → 在诊断 worker 之前，每三秒重试一次，约持续30秒。

## 2. 获取连接信息

向用户确认 **cmem.ai → Connect** 中显示的三项值：

1. sync token；
2. user id；
3. SyncHub URL。

Hub URL 必须是完整的 `https://` URL。不要替换为 cmem.ai 应用 API URL；已安装的客户端仅与 SyncHub 通信。

## 3. 写入已安装客户端设置

将收集到的值替换到以下单引号 stdin 脚本中。运行前后都不要回显这些值：

```bash
node - <<'EOF'
const fs = require('fs'), os = require('os'), path = require('path');
const token = 'PASTE_TOKEN_HERE';
const userId = 'PASTE_USER_ID_HERE';
const hubUrl = 'PASTE_HUB_URL_HERE';
if (!token || !userId || !/^https:\/\/[^\s]+$/.test(hubUrl)) {
  console.error('token, user id, and an https SyncHub URL are required');
  process.exit(1);
}
const dir = path.join(os.homedir(), '.claude-mem');
const file = path.join(dir, 'settings.json');
fs.mkdirSync(dir, { recursive: true });
const settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const target = settings.env && typeof settings.env === 'object' ? settings.env : settings;
target.CLAUDE_MEM_CLOUD_SYNC_TOKEN = token;
target.CLAUDE_MEM_CLOUD_SYNC_USER_ID = userId;
target.CLAUDE_MEM_CLOUD_SYNC_HUB_URL = hubUrl.replace(/\/+$/, '');
fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n', { mode: 0o600 });
fs.chmodSync(file, 0o600);
console.log(`saved cloud connection: token length ${token.length}, user id length ${userId.length}`);
EOF
```

这三项是唯一必需的连接键。worker 在首次启动时会生成并持久化一个设备 ID，并将设备名称默认设置为主机名。

## 4. 重启并验证

```bash
curl -s -X POST "http://127.0.0.1:${PORT}/api/admin/restart"
```

在后续进程启动期间，每五秒轮询状态路由，最多30秒。成功条件是 `configured: true`、`hub.reachable: true` 且 `lastError: null`。本地路由始终会执行一次已认证的只读 SyncHub 状态探测，即使所有待处理计数为零；它从不使用旧版 cmem.ai Pro 的状态路由，也从不追加或推进同步状态。待处理计数仅描述 SyncHub 上线基线之后发生的写入；该设置不会迁移上线前的本地语料库。

如果 `hub.reachable` 为 false，请报告 `hub.error`。如果 `lastError` 非空，也一并报告。请用户核对 **cmem.ai → Connect** 中的三个值。绝不能包含 token。

## 5. 报告

报告设备 ID、待处理计数、最近一次成功 flush、Hub 可达性与 checkpoint，以及任何 Hub/flush 错误。最后附上以下隐私提示：

> Cloud sync 会将你的 observation narratives 和完整 prompt 文本上传到你的
> cmem.ai 账户。
