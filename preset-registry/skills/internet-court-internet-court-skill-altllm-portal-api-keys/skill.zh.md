---
name: altllm-portal-api-keys
description: Use this skill when the user asks to list, create, inspect, update, disable, re-enable, or revoke AltLLM Portal API keys for external agents or applications. Do NOT use for wallet login, billing history, or payment links.
user-invocable: true
---
# AltLLM 门户 API 密钥

用于本地 `altllm` CLI 的门户 API 密钥生命周期管理。

## 共享设置

> 在全新检出的环境中首次执行 `altllm` 命令之前，请阅读并遵循：
> - `../_shared/preflight.md`
> - `../_shared/session-and-target.md`

## 命令索引

| 命令 | 用途 |
|---|---|
| `list-api-keys` | 列出活动和已禁用的密钥 |
| `create-api-key` | 创建新密钥，可选择指定模型允许列表 |
| `get-api-key` | 查看单个密钥 |
| `update-api-key` | 重命名密钥、更改状态或替换模型允许列表 |
| `revoke-api-key` | 永久撤销密钥 |

## 规则

- `create-api-key` 仅会完整返回一次密钥。
- 如果未传入模型允许列表，门户 API 将应用其默认的 AltLLM 模型集合。
- 密钥权限会缩小可访问模型的范围，但网关余额和层级检查仍然适用。
- Flex 用户可以将普通 AltLLM 模型和仅限 Flex 的 `altllm-flex-*` 模型加入允许列表；后端访问检查仍具有最终决定权。
- `update-api-key --status disabled` 可恢复。
- `revoke-api-key` 是永久操作。
- `keys` 是 `list-api-keys` 的别名。

## 已知生产环境限制

- 单密钥门户 API 路由目前在生产环境中不可用。
- 受影响的命令：
  - `get-api-key`
  - `update-api-key`
  - `revoke-api-key`
- 仍可用的命令：
  - `list-api-keys`
  - `create-api-key`
- 除非 `revoke-api-key` 正常可用或存在已获批准的清理路径，否则不要创建临时生产环境冒烟测试密钥。

## 参考

有关命令示例和代表性响应，请参阅 [references/cli-reference.md](references/cli-reference.md)。