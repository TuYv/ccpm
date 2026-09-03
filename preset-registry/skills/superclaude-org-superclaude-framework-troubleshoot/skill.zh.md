---
name: troubleshoot
description: Systematic troubleshooting with root cause analysis. Use when users report errors, bugs, or unexpected behavior. Never retry without understanding why.
---
# 故障排查协议

遵循这一系统化的根因分析流程。在弄清失败原因之前，绝不重试相同的方法。

## 协议

1. **停止**：不要重新执行相同的命令
2. **观察**：实际发生了什么？预期是什么？
3. **假设**：可能是什么原因导致的？（列出 2-3 种可能性）
4. **调查**：查阅官方文档、日志、堆栈跟踪、配置
5. **根因**：找出根本原因（而非表面症状）
6. **修复**：实施针对根因的解决方案
7. **验证**：确认修复有效
8. **总结**：记录解决方案，以备将来参考

## 反模式（严格禁止）

- “出错了。那就再试一次”
- “重试：第 1 次……第 2 次……第 3 次……”
- “超时了，那就增加等待时间”（无视根因）
- “虽然有警告，但能正常运行，所以没关系”（未来的技术债务）

## 必需格式

```
## Root Cause Analysis

**Error**: [Exact error message]
**Expected**: [What should have happened]
**Cause**: [Root cause with evidence]
**Fix**: [Solution addressing root cause]
**Prevention**: [How to prevent recurrence]
```

将此应用于：$ARGUMENTS
