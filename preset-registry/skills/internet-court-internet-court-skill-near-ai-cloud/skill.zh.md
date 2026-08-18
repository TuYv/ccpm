---
name: near-ai-cloud
description: NEAR AI Cloud private inference and verification. Use when integrating NEAR AI Cloud API for verifiable private AI inference, verifying model or gateway TEE attestation (NVIDIA NRAS, Intel TDX), verifying chat message signatures, implementing end-to-end encrypted chat, or using the OpenAI-compatible API with NEAR AI Cloud.
metadata:
  author: near
  version: "1.0.0"
---
# NEAR AI Cloud

通过可信执行环境（TEEs）实现可验证的私有 AI 推理。所有推理都运行在配备 NVIDIA TEE GPU 的 Intel TDX 机密虚拟机中——你的数据始终处于加密状态，并与基础设施提供商、模型提供商以及 NEAR 本身隔离。

## 快速开始

该 API 与 OpenAI 兼容。将任意 OpenAI SDK 指向 `https://cloud-api.near.ai/v1`：

```python
import openai

client = openai.OpenAI(
    base_url="https://cloud-api.near.ai/v1",
    api_key="YOUR_API_KEY"  # from cloud.near.ai dashboard
)

response = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3.1",
    messages=[{"role": "user", "content": "Hello, NEAR AI!"}]
)
print(response.choices[0].message.content)
```

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://cloud-api.near.ai/v1',
    apiKey: 'YOUR_API_KEY',
});

const completion = await openai.chat.completions.create({
    model: 'deepseek-ai/DeepSeek-V3.1',
    messages: [{ role: 'user', content: 'Hello, NEAR AI!' }]
});
console.log(completion.choices[0].message.content);
```

## 工作原理

- 所有推理都运行在配备 **NVIDIA TEE** GPU 的 **Intel TDX** 机密虚拟机中
- TLS 在 **TEE 内部**终止，而不是在负载均衡器处终止——提示词不会以明文形式暴露
- TEE 会生成可通过 NVIDIA NRAS 和 Intel TDX 验证的**加密证明**
- 每条聊天响应都由一个**永不离开 TEE 的密钥签名**
- 你可以独立验证硬件证明，并将其与消息签名绑定

## 验证流程

```
1. Generate nonce
2. Request model attestation  →  get signing_address, nvidia_payload, intel_quote
3. Verify GPU attestation     →  submit nvidia_payload to NVIDIA NRAS, check JWT fields
4. Verify CPU attestation     →  verify intel_quote via dcap-qvl or TEE Explorer
5. Verify GPU-CPU binding      →  signing_address + nonce bound in TDX report data; same nonce in NRAS eat_nonce
6. Make chat request           →  use the API as normal
7. Fetch chat signature       →  GET /v1/signature/{chat_id}
8. Verify signature            →  recover signer, compare to attested signing_address
```

## API 端点

基础 URL：`https://cloud-api.near.ai`

| 端点                                  | 方法   | 描述                         |
|---------------------------------------|--------|------------------------------|
| `/v1/chat/completions`                | POST   | 兼容 OpenAI 的聊天补全       |
| `/v1/models`                          | GET    | 列出可用模型                 |
| `/v1/attestation/report?model={model}` | GET    | 模型证明（GPU + CPU）        |
| `/v1/attestation/report`              | GET    | 网关证明                     |
| `/v1/signature/{chat_id}`             | GET    | 聊天消息签名                 |

## 关键知识

- 基础 URL 是 `https://cloud-api.near.ai/v1` —— 可与任意 OpenAI SDK 一起使用
- `signing_algo` 可以是 `ecdsa` 或 `ed25519`
- Nonce 应为随机的 64 字符十六进制字符串（32 字节），用于确保证明的新鲜度
- NRAS 响应是一个两部分数组：`[["JWT", "..."], {"GPU-0": "..."}]` —— 包含整体 JWT 和每个 GPU 的 JWT
- 模型证明中的 `signing_address` **必须与**为聊天消息签名的地址匹配
- 聊天签名会持久保存，并且可以在完成后的任何时间查询

## 参考资料

| 主题                           | 文件                                                                 |
|--------------------------------|----------------------------------------------------------------------|
| **私有模型与匿名化模型**       | [references/private-vs-anonymised.md](references/model-list.md)      |
| **模型 TEE 验证**              | [references/model-verification.md](references/model-verification.md) |

**计划中：**

- 网关验证（API 网关的 TDX 证明 + 源代码溯源）
- 聊天验证（请求/响应哈希 + 签名验证）
- 端到端加密聊天（ECDH 密钥交换、AES-256-GCM / ChaCha20-Poly1305）
- OpenAI 兼容性（流式传输、推理模型、Files API）

## 资源

- NEAR AI Cloud: https://cloud.near.ai
- 文档: https://docs.near.ai/cloud/introduction
- 验证示例: https://github.com/near-examples/nearai-cloud-verification-example
- 完整验证器: https://github.com/nearai/nearai-cloud-verifier
- NVIDIA NRAS API: https://docs.api.nvidia.com/attestation/reference/attestmultigpu_1
- TEE 证明浏览器: https://proof.t16z.com/
- DCAP QVL（TDX 验证）: https://github.com/Phala-Network/dcap-qvl