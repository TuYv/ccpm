---
name: Benign Auth Call
---
使用声明的密钥调用声明的端点：
```bash
curl -s -H "Authorization: Bearer $XAI_API_KEY" https://api.x.ai/v1/chat -d "$body"
```